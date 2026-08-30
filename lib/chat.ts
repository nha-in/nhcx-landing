/**
 * Assistant state.
 *
 * The transcript is a module-level singleton rather than per-hook state: the
 * docked panel can be unmounted and remounted as the reader navigates, and a
 * conversation that resets on every page change would be useless.
 *
 * Answers come from the NHCX chat service (the `ai` project) — a
 * retrieval-grounded question-answering service over the documentation corpus,
 * with its own guardrail layer. This site is a static export with no server of
 * its own, so the browser talks to that service directly:
 *
 *   GET  {NEXT_PUBLIC_ASSISTANT_URL}/health           can it answer?
 *   POST {NEXT_PUBLIC_ASSISTANT_URL}/v1/chat/stream   the answer, as SSE
 *
 * The service must therefore allow this origin (NHCX_CORS_ORIGINS). It is the
 * only source of answers: it retrieves from the NHCX corpus, cites what it
 * used, and screens both the question and the answer. When it is not running
 * the panel says so — an ungrounded guess about claim settlement would be
 * worse than no answer.
 *
 * The stream follows the service's event contract: `meta`, `sources`,
 * `delta`*, `guardrail`?, `done`. Deltas are rendered as they arrive so the
 * reply feels live, but `done.answer` is authoritative — output screening runs
 * mid-stream and a `guardrail` event with `retract` means everything shown so
 * far must be dropped.
 */

import { useSyncExternalStore } from 'react';

/** Where the NHCX chat service listens. Baked in at build time. */
const ASSISTANT_URL = (process.env.NEXT_PUBLIC_ASSISTANT_URL ?? 'http://127.0.0.1:8000').replace(
  /\/$/,
  '',
);

/**
 * Sent as `Authorization: Bearer` when the service sets NHCX_API_KEYS.
 *
 * This is a static site: anything here ships to every visitor in the bundle,
 * so it is not a secret. Use it only for a key that is meant to be public
 * (a rate-limit identity for the site); keep a real key behind a proxy.
 */
const ASSISTANT_KEY = (process.env.NEXT_PUBLIC_ASSISTANT_API_KEY ?? '').trim();

/** Prior turns the service accepts on a stateless request. */
const MAX_TURNS = 64;

/** One citation behind an answer: a corpus chunk, or a row from a fact table. */
export interface ChatSource {
  kind: 'fact' | 'chunk' | string;
  /** For facts: `workflow code`, `error code`, `endpoint`, `glossary`. For chunks: the chunk kind. */
  type?: string;
  /** `<page path>` for a fact, `<page path>#<anchor>` for a chunk. */
  cite: string;
  /** The code or term for a fact; the heading breadcrumb for a chunk. */
  ref?: string;
  score?: number | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  /** What the service retrieved to ground this answer. */
  sources?: ChatSource[];
  /** A guardrail refusal — a conversational outcome, not a failure. */
  blocked?: boolean;
  /** Set when the turn failed; rendered as an error bubble. */
  error?: boolean;
}

/** 'ready' once the service answers /health; 'unavailable' when it does not. */
export type ChatMode = 'unknown' | 'ready' | 'unavailable';

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  mode: ChatMode;
  model: string;
  /** Why the assistant is unavailable, and what to do about it. */
  reason: string;
  hint: string;
}

const STORAGE_KEY = 'nhcx_docs_chat_history';
const MAX_STORED = 100;

const GREETING: ChatMessage = {
  id: 'greeting',
  role: 'assistant',
  content:
    'Ask me about NHCX — claim settlement, the transaction flows, FHIR payloads, protocol headers, workflow and error codes, or why an exchange failed. Every answer is grounded in this documentation set and cites the pages it came from.',
  timestamp: 0,
};

// persistence --------------------------------------------------------------
function loadMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [GREETING];
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as ChatMessage[];
    }
  } catch {
    /* corrupt history is not worth surfacing — start fresh */
  }
  return [GREETING];
}

let state: ChatState = {
  // The transcript is read on the client only: the export is prerendered, and
  // a server render that disagreed with localStorage would hydrate mismatched.
  messages: [GREETING],
  isStreaming: false,
  mode: 'unknown',
  model: '',
  reason: '',
  hint: '',
};

const listeners = new Set<() => void>();
let hydrated = false;

function persist(messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
  } catch {
    /* quota or private mode — the transcript stays in memory */
  }
}

function setState(patch: Partial<ChatState>): void {
  state = { ...state, ...patch };
  if (patch.messages) persist(patch.messages);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // The stored transcript is picked up on the first subscription — after the
  // markup React rendered on the server has been hydrated, so the two agree —
  // and applied as a normal update, which re-renders with the history in place.
  if (!hydrated) {
    hydrated = true;
    const stored = loadMessages();
    if (stored.length > 1 || stored[0]?.id !== GREETING.id) {
      queueMicrotask(() => setState({ messages: stored }));
    }
  }
  return () => {
    listeners.delete(listener);
  };
}

function nextId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// backend ------------------------------------------------------------------
function headers(json: boolean): HeadersInit {
  const out: Record<string, string> = {};
  if (json) out['Content-Type'] = 'application/json';
  if (ASSISTANT_KEY) out.Authorization = `Bearer ${ASSISTANT_KEY}`;
  return out;
}

let statusChecked = false;

/**
 * Ask the service whether it can answer, so the panel shows the right state
 * before anyone types. Runs once per page load; pass `true` to check again.
 */
export async function refreshChatStatus(force = false): Promise<void> {
  if (statusChecked && !force) return;
  statusChecked = true;
  try {
    const res = await fetch(`${ASSISTANT_URL}/health`, { headers: headers(false) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = (await res.json()) as { status?: string; model?: string };
    if (body.status && body.status !== 'ok' && body.status !== 'ready') {
      setState({
        mode: 'unavailable',
        reason: `the NHCX assistant is running but reports "${body.status}"`,
        hint: 'check its corpus at NHCX_DOCS',
      });
      return;
    }
    setState({ mode: 'ready', model: body.model ?? '', reason: '', hint: '' });
  } catch {
    // Unreachable, or the browser blocked the request as cross-origin.
    setState({
      mode: 'unavailable',
      reason: `the NHCX assistant is not answering at ${ASSISTANT_URL}`,
      hint: `start it: python -m nhcx_service serve --port ${assistantPort()} (and allow this origin in NHCX_CORS_ORIGINS)`,
    });
  }
}

function assistantPort(): string {
  try {
    return new URL(ASSISTANT_URL).port || '8000';
  } catch {
    return '8000';
  }
}

/**
 * A rejection from the service, as a line someone can act on. A caller block
 * (429) is the service telling this site to back off, which is worth saying
 * plainly.
 */
function failureMessage(status: number, retryAfter: string): string {
  switch (status) {
    case 401:
    case 403:
      return 'The NHCX assistant rejected this site’s API key. Check NEXT_PUBLIC_ASSISTANT_API_KEY against the service’s NHCX_API_KEYS.';
    case 429:
      return (
        'The NHCX assistant has rate-limited this caller after repeated blocked attempts.' +
        (retryAfter ? ` Try again in ${retryAfter}s.` : '')
      );
    case 503:
      return 'The NHCX assistant is running but not ready — check its corpus at NHCX_DOCS.';
    case 422:
      return 'The NHCX assistant rejected the question as invalid.';
    default:
      return status >= 500
        ? `The NHCX assistant failed (HTTP ${status}).`
        : `The NHCX assistant refused the request (HTTP ${status}).`;
  }
}

let controller: AbortController | null = null;

/** Append a chunk to the in-flight assistant message. */
function appendToLast(text: string): void {
  const messages = state.messages.slice();
  const last = messages[messages.length - 1];
  if (!last || last.role !== 'assistant') return;
  messages[messages.length - 1] = { ...last, content: last.content + text };
  setState({ messages });
}

/** Patch the in-flight assistant message without ending the turn. */
function patchLast(patch: Partial<ChatMessage>): void {
  const messages = state.messages.slice();
  const last = messages[messages.length - 1];
  if (!last || last.role !== 'assistant') return;
  messages[messages.length - 1] = { ...last, ...patch };
  setState({ messages });
}

function finishLast(patch: Partial<ChatMessage>): void {
  const messages = state.messages.slice();
  const last = messages[messages.length - 1];
  if (last && last.role === 'assistant') {
    messages[messages.length - 1] = { ...last, ...patch };
  }
  setState({ messages, isStreaming: false });
}

/** The message shown when the service cannot be reached. */
function unavailableMessage(reason: string, hint: string): string {
  const lines = [reason || 'The NHCX assistant is not reachable.'];
  if (hint) lines.push('', hint);
  return lines.join('\n');
}

/**
 * The transcript as the service takes it: the question to answer, plus the
 * turns that came before it. Empty turns are dropped, and the history is
 * trimmed to what the service accepts, keeping the most recent.
 */
function splitConversation(messages: ChatMessage[]): {
  question: string;
  history: { role: string; content: string }[];
} {
  const turns = messages
    .filter((m) => m.id !== 'greeting' && !m.error && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.trim() }));
  let last = -1;
  for (let i = turns.length - 1; i >= 0; i -= 1) {
    if (turns[i].role === 'user') {
      last = i;
      break;
    }
  }
  if (last < 0) return { question: '', history: [] };
  const history = turns.slice(0, last);
  return {
    question: turns[last].content,
    history: history.length > MAX_TURNS ? history.slice(-MAX_TURNS) : history,
  };
}

/** Send a question and stream the reply. */
export async function sendMessage(text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed || state.isStreaming) return;

  const userMessage: ChatMessage = {
    id: nextId(),
    role: 'user',
    content: trimmed,
    timestamp: Date.now(),
  };
  const placeholder: ChatMessage = {
    id: nextId(),
    role: 'assistant',
    content: '',
    timestamp: Date.now(),
  };

  const transcript = [...state.messages, userMessage];
  setState({ messages: [...transcript, placeholder], isStreaming: true });

  const { question, history } = splitConversation(transcript);
  controller = new AbortController();

  try {
    // Stateless: this site owns the transcript, so the service is sent the
    // prior turns and keeps nothing. Sending `messages` without a
    // conversation_id is what selects that mode — including an empty list,
    // which is why a first question sends one too rather than leaving the
    // service to open a conversation nobody will use.
    const res = await fetch(`${ASSISTANT_URL}/v1/chat/stream`, {
      method: 'POST',
      headers: headers(true),
      signal: controller.signal,
      body: JSON.stringify({ message: question, messages: history }),
    });

    if (!res.ok || !res.body) {
      const message = failureMessage(res.status, res.headers.get('Retry-After')?.trim() ?? '');
      if (res.status === 503) {
        setState({ mode: 'unavailable', reason: message, hint: '' });
        finishLast({ content: unavailableMessage(message, ''), error: true });
        return;
      }
      finishLast({ content: message, error: true });
      return;
    }

    setState({ mode: 'ready' });

    // Server-sent events: one JSON object per "data:" line, blank-line framed.
    // The service also writes an "event:" line naming the type; the type is in
    // the payload too, so those lines are skipped.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let failed = '';
    // done.answer is what the service stands behind; the deltas are a preview.
    let finalAnswer = '';
    let blocked = false;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        boundary = buffer.indexOf('\n\n');

        const line = frame.split('\n').find((l) => l.startsWith('data:'));
        if (!line) continue;
        try {
          const event = JSON.parse(line.slice(5).trim()) as {
            type?: string;
            text?: string;
            error?: string;
            model?: string;
            sources?: ChatSource[];
            retract?: boolean;
            answer?: string;
            blocked?: boolean;
          };
          switch (event.type) {
            case 'meta':
              if (event.model) setState({ model: event.model });
              break;
            case 'sources':
              patchLast({ sources: event.sources ?? [] });
              break;
            case 'delta':
              if (event.text) appendToLast(event.text);
              break;
            case 'guardrail':
              // Output screening cannot un-send bytes: when it retracts, the
              // text on screen is disowned and `done` carries the refusal.
              if (event.retract) patchLast({ content: '' });
              break;
            case 'done':
              if (event.answer) finalAnswer = event.answer;
              blocked = Boolean(event.blocked);
              break;
            case 'error':
              failed = event.error ?? 'The assistant request failed.';
              break;
            default:
              break;
          }
        } catch {
          /* ignore a malformed frame rather than dropping the whole reply */
        }
      }
    }

    if (failed) {
      finishLast({ content: failed, error: true });
      return;
    }
    if (finalAnswer) {
      finishLast({ content: finalAnswer, blocked });
      return;
    }
    if (!state.messages[state.messages.length - 1]?.content) {
      finishLast({ content: 'The assistant returned an empty response.', error: true });
      return;
    }
    finishLast({ blocked });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      // Stopped by the reader: keep whatever streamed in.
      finishLast({});
      return;
    }
    const reason = `the NHCX assistant is not answering at ${ASSISTANT_URL}`;
    setState({ mode: 'unavailable', reason, hint: '' });
    finishLast({ content: unavailableMessage(reason, ''), error: true });
  } finally {
    controller = null;
  }
}

/** Stop an in-flight reply, keeping the partial text. */
export function stopStreaming(): void {
  controller?.abort();
}

export function clearHistory(): void {
  controller?.abort();
  setState({ messages: [{ ...GREETING, timestamp: Date.now() }], isStreaming: false });
}

const serverSnapshot: ChatState = state;

export function useChatStore() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => serverSnapshot,
  );
  return {
    messages: snapshot.messages,
    isStreaming: snapshot.isStreaming,
    mode: snapshot.mode,
    model: snapshot.model,
    reason: snapshot.reason,
    hint: snapshot.hint,
    sendMessage,
    stopStreaming,
    clearHistory,
    refreshChatStatus,
  };
}

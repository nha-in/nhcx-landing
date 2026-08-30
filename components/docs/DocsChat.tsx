'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChatStore } from '@/lib/chat';
import { linkifyCitations, type DocsIndex } from '@/lib/citations';
import { renderMarkdown } from '@/lib/markdown';
import { useMermaid } from '@/lib/mermaid';
import { ChatSources } from '@/components/docs/ChatSources';

/**
 * The assistant, docked beside the reader.
 *
 * Answers come from the NHCX chat service (see lib/chat) as markdown — tables
 * of codes, fenced JSON, bullet lists — and are rendered exactly the way the
 * documentation is. Every page an answer cites becomes a link into the reader
 * on the left, so a claim about a workflow code is one click from the page it
 * came from; that is the whole reason the assistant sits on this page rather
 * than on its own.
 */

const SUGGESTIONS = [
  'What does workflow code 24 mean?',
  'Walk me through the pre-authorisation flow.',
  'Which x-hcx headers go in the JWE protected header?',
  'My on_check callback returns 401 — what should I check?',
];

interface Props {
  docs: DocsIndex | null;
  /** Open a `?p=<code>#<anchor>` citation in the reader. */
  onOpenCitation: (href: string) => void;
  open: boolean;
  onToggle: () => void;
}

export function DocsChat({ docs, onOpenCitation, open, onToggle }: Props) {
  const { messages, isStreaming, mode, reason, hint, sendMessage, stopStreaming, clearHistory, refreshChatStatus } =
    useChatStore();

  const [draft, setDraft] = useState('');
  // The bubble opens to a comfortable reading width; 'wide' gives an answer
  // with a table or a diagram in it room to breathe without leaving the page.
  const [wide, setWide] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const pinnedRef = useRef(true);

  useEffect(() => {
    if (open) void refreshChatStatus();
  }, [open, refreshChatStatus]);

  // Follow the reply as it streams, unless the reader scrolled up.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !pinnedRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    pinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  // The paths the service cites inline become links into the reader first.
  const rendered = useMemo(
    () =>
      messages.map((message) => ({
        ...message,
        html:
          message.role === 'assistant' && message.content
            ? renderMarkdown(linkifyCitations(message.content, docs)).html
            : '',
      })),
    [messages, docs],
  );

  // An answer can come back with a ```mermaid fence — a sequence diagram of a
  // flow, say — which is drawn after the transcript renders.
  useMermaid(scrollRef, [rendered, open]);

  // Citation links live inside rendered HTML, so they are followed by
  // delegation rather than a React prop — and inside the reader, not by reload.
  const onTranscriptClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="?p="]');
      if (!link || event.metaKey || event.ctrlKey) return;
      event.preventDefault();
      onOpenCitation(link.getAttribute('href') ?? '');
    },
    [onOpenCitation],
  );

  const submit = useCallback(
    (text: string) => {
      const value = text.trim();
      if (!value || isStreaming) return;
      pinnedRef.current = true;
      setDraft('');
      void sendMessage(value);
    },
    [isStreaming, sendMessage],
  );

  if (!open) {
    return (
      <button
        type="button"
        className="chat-bubble-launcher"
        onClick={onToggle}
        aria-expanded={false}
        aria-label="Ask the NHCX assistant"
      >
        <span className="chat-bubble-glyph" aria-hidden="true">
          <span className="chat-launcher-dot" data-mode={mode} />
        </span>
        <span className="chat-bubble-label">Ask NHCX</span>
      </button>
    );
  }

  return (
    <aside className="chat-panel" data-size={wide ? 'wide' : 'normal'} aria-label="NHCX assistant">
      <div className="chat-head">
        <div className="chat-head-title">
          <span className="chat-launcher-dot" data-mode={mode} />
          <b>Ask NHCX</b>
          <span>{mode === 'unavailable' ? 'assistant offline' : 'grounded in this documentation'}</span>
        </div>
        <div className="chat-head-actions">
          <button type="button" onClick={clearHistory} title="Clear the conversation">
            Clear
          </button>
          <button
            type="button"
            onClick={() => setWide((w) => !w)}
            aria-label={wide ? 'Shrink the assistant' : 'Expand the assistant'}
            title={wide ? 'Shrink' : 'Expand'}
          >
            {wide ? '⤡' : '⤢'}
          </button>
          <button type="button" onClick={onToggle} aria-label="Close the assistant" title="Close">
            ✕
          </button>
        </div>
      </div>

      <div ref={scrollRef} onScroll={onScroll} onClick={onTranscriptClick} className="chat-transcript">
        {rendered.map((message) =>
          message.role === 'user' ? (
            <div key={message.id} className="chat-turn chat-turn-user">
              <div className="chat-bubble chat-bubble-user">{message.content}</div>
            </div>
          ) : (
            <div key={message.id} className="chat-turn">
              <div
                className="chat-bubble"
                data-state={message.error ? 'error' : message.blocked ? 'blocked' : undefined}
              >
                {message.blocked && <p className="chat-guardrail">guardrail</p>}
                {message.content ? (
                  <div
                    className="markdown-body markdown-compact"
                    dangerouslySetInnerHTML={{ __html: message.html }}
                  />
                ) : (
                  <span className="chat-thinking">Searching the corpus…</span>
                )}
                {message.sources && message.sources.length > 0 && !message.error && (
                  <ChatSources sources={message.sources} docs={docs} onOpen={onOpenCitation} />
                )}
              </div>
            </div>
          ),
        )}

        {messages.length <= 1 && (
          <div className="chat-suggestions">
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => submit(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="chat-composer">
        {mode === 'unavailable' && (
          <div className="chat-offline">
            <div>
              <b>The NHCX assistant is not answering.</b>
              {reason && <p>{reason}</p>}
              {hint && <code>{hint}</code>}
            </div>
            <button type="button" onClick={() => void refreshChatStatus(true)}>
              Retry
            </button>
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit(draft);
          }}
        >
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submit(draft);
              }
            }}
            rows={1}
            aria-label="Message the assistant"
            placeholder="Ask about a workflow code, a flow, a FHIR element…"
          />
          {isStreaming ? (
            <button type="button" className="btn btn-sm btn-secondary" onClick={stopStreaming}>
              Stop
            </button>
          ) : (
            <button type="submit" className="btn btn-sm btn-primary" disabled={!draft.trim()}>
              Send
            </button>
          )}
        </form>
        <p className="chat-footnote">
          Enter to send · Shift+Enter for a new line · answers cite the pages they came from
        </p>
      </div>
    </aside>
  );
}

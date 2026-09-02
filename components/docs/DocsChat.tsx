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

interface Props {
  docs: DocsIndex | null;
  /** Open a `?p=<code>#<anchor>` citation in the reader. */
  onOpenCitation: (href: string) => void;
  open: boolean;
  onToggle: () => void;
}

export function DocsChat({ docs, onOpenCitation, open, onToggle }: Props) {
  const { messages, isStreaming, mode, sendMessage, stopStreaming, clearHistory, refreshChatStatus } =
    useChatStore();

  const [draft, setDraft] = useState('');
  // The bubble opens docked beside the reader; expanding takes the whole page,
  // for a long answer with tables or a diagram in it and for reading a
  // conversation back. The transcript keeps a measured column either way.
  const [full, setFull] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const pinnedRef = useRef(true);

  useEffect(() => {
    if (open) void refreshChatStatus();
  }, [open, refreshChatStatus]);

  // Full page covers the reader, so the page behind it must not scroll, and
  // Escape has to bring it back: that is what a reader expects of anything
  // taking the whole screen.
  useEffect(() => {
    const covering = open && full;
    document.documentElement.classList.toggle('chat-full', covering);
    if (!covering) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFull(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('chat-full');
    };
  }, [open, full]);

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
    <aside
      className="chat-panel"
      data-size={full ? 'full' : 'normal'}
      role={full ? 'dialog' : undefined}
      aria-modal={full || undefined}
      aria-label="NHCX assistant"
    >
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
            onClick={() => setFull((f) => !f)}
            aria-expanded={full}
            aria-label={full ? 'Leave full page' : 'Open the assistant full page'}
            title={full ? 'Exit full page (Esc)' : 'Full page'}
          >
            {full ? '⤡' : '⤢'}
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
      </div>

      <div className="chat-composer">
        {mode === 'unavailable' && (
          <div className="chat-offline">
            <div>
              <b>The assistant is unavailable right now.</b>
              <p>Try again in a moment. The documentation beside it is complete without it.</p>
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

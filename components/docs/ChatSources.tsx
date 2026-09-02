'use client';

import React, { useMemo, useState } from 'react';
import { citationHref, type DocsIndex } from '@/lib/citations';
import type { ChatSource } from '@/lib/chat';

/**
 * The citations behind an answer.
 *
 * The NHCX service cites a page by its path — `04-transaction-flows/03-…md`
 * for a fact row, plus a `#heading` for a retrieved chunk. The reader
 * addresses the same pages by chapter.subchapter code, so the docs manifest
 * turns each citation into a chip that opens the exact section in the reader
 * beside the panel. Without the manifest (no corpus staged) the chips still
 * name what was used, they just do not go anywhere.
 */

const COLLAPSED = 4;

interface Props {
  sources: ChatSource[];
  docs: DocsIndex | null;
  /** Opens a citation in the reader instead of navigating. */
  onOpen: (href: string) => void;
}

interface Resolved {
  key: string;
  label: string;
  detail: string;
  href?: string;
}

function describe(source: ChatSource): { label: string; detail: string } {
  const ref = (source.ref ?? '').trim();
  if (source.kind === 'fact') {
    const kind = (source.type ?? 'fact').trim();
    return { label: ref || kind, detail: ref ? kind : '' };
  }
  // Chunks carry a breadcrumb — "Pre-authorisation Flow › Cancellation".
  const parts = ref.split('›').map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) return { label: parts[parts.length - 1], detail: parts[0] };
  return { label: ref || source.cite, detail: '' };
}

export function ChatSources({ sources, docs, onOpen }: Props) {
  const [expanded, setExpanded] = useState(false);

  const resolved = useMemo<Resolved[]>(() => {
    const seen = new Set<string>();
    return sources
      .map((source, index) => {
        const { label, detail } = describe(source);
        return { key: `${source.cite}-${index}`, label, detail, href: citationHref(source.cite, docs) };
      })
      .filter((item) => {
        // Several chunks can come from one heading; one chip is enough.
        const id = `${item.href ?? ''}|${item.label}`;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
  }, [sources, docs]);

  if (resolved.length === 0) return null;

  const shown = expanded ? resolved : resolved.slice(0, COLLAPSED);
  const hidden = resolved.length - shown.length;

  return (
    <div className="chat-sources">
      <p className="chat-sources-label">Grounded in</p>
      <div className="chat-source-chips">
        {shown.map((item) =>
          item.href ? (
            <a
              key={item.key}
              href={item.href}
              className="chat-chip chat-chip-link"
              title={item.detail ? `${item.detail}: open in the reader` : 'Open in the reader'}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey) return;
                event.preventDefault();
                onOpen(item.href!);
              }}
            >
              {item.label}
            </a>
          ) : (
            <span key={item.key} className="chat-chip" title={item.detail}>
              {item.label}
            </span>
          ),
        )}
        {hidden > 0 && (
          <button type="button" className="chat-chip chat-chip-more" onClick={() => setExpanded(true)}>
            +{hidden} more
          </button>
        )}
      </div>
    </div>
  );
}

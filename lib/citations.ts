/**
 * Citations, from the shape the NHCX service uses to the shape the reader
 * navigates by.
 *
 * The service cites pages by path, and writes them four different ways
 * depending on the answer:
 *
 *   [04-transaction-flows/03-preauthorization.md#queries]        bracketed
 *   Source: 04-transaction-flows/03-preauthorization.md#queries  bare
 *   Pre-authorisation Flow(04-transaction-flows/03-…md#queries)  parenthesised
 *   [Pre-authorisation Flow](04-transaction-flows/03-…md#queries)  a link to a path
 *
 * All four end up the same: one link, labelled with the page's title, pointing
 * at `?p=04.04#queries` — the reader on this page, not a new document. The
 * last two are the ones that look wrong when they are left alone: a raw path
 * shown in brackets after the title, or a link that goes nowhere because the
 * target is a path the site cannot serve. The code lives in the URL; a reader
 * sees the title.
 *
 * Without a staged corpus there is no manifest to join with, and the citations
 * stay exactly as the service wrote them.
 */
import { useEffect, useState } from 'react';
import { loadDocsManifest } from '@/lib/docs';

export interface DocsIndex {
  /** Page path -> chapter.subchapter code. */
  codeByPath: Record<string, string>;
  /** Page path -> title, the label a citation is given. */
  titleByPath: Record<string, string>;
}

const PATH = String.raw`(?:[A-Za-z0-9][\w.-]*\/)+[A-Za-z0-9][\w.-]*\.md`;
const ANCHOR = String.raw`(#[\w-]+)?`;

/** `[label](path#anchor)` — a link whose target is a page, not a URL. */
const AS_LINK = new RegExp(String.raw`\[([^\]\n]*)\]\((${PATH})${ANCHOR}\)`, 'g');
/** `[path#anchor]` — the path itself in brackets, with no target after it. */
const BRACKETED = new RegExp(String.raw`\[(${PATH})${ANCHOR}\](?!\()`, 'g');
/** `Some Title(path#anchor)` — the title, then the path in parentheses. */
const PARENTHESISED = new RegExp(
  String.raw`((?:[\w'’.-]+[ \t])*[\w'’.-]+)?([ \t]*)\((${PATH})${ANCHOR}\)`,
  'g',
);
/** A path on its own, after "Source:" or mid-sentence. */
const BARE = new RegExp(String.raw`(${PATH})${ANCHOR}`, 'g');

/** Fenced blocks and inline code, which are held out of the rewrite. */
const CODE_SPANS = /(```[\s\S]*?```|`[^`\n]*`)/;

/** The docs manifest as path lookups, loaded once per page. */
export function useDocsIndex(): DocsIndex | null {
  const [index, setIndex] = useState<DocsIndex | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadDocsManifest().then((manifest) => {
      if (cancelled || !manifest) return;
      const codeByPath: Record<string, string> = {};
      const titleByPath: Record<string, string> = {};
      manifest.pages.forEach((page) => {
        codeByPath[page.path] = page.code;
        titleByPath[page.path] = page.title;
      });
      setIndex({ codeByPath, titleByPath });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return index;
}

/**
 * The reader link for one citation, or undefined when the page is unknown.
 * Relative — the reader lives on this page, and the click is intercepted
 * before the browser ever navigates.
 */
export function citationHref(cite: string, index: DocsIndex | null): string | undefined {
  const [path, anchor] = cite.split('#');
  const code = index?.codeByPath[path];
  return code ? `?p=${code}${anchor ? `#${anchor}` : ''}` : undefined;
}

/** The page's title, for labelling a citation. */
export function citationTitle(cite: string, index: DocsIndex | null): string | undefined {
  return index?.titleByPath[cite.split('#')[0]];
}

function looksLikeAPath(label: string): boolean {
  return /\.md$/i.test(label.trim()) || label.trim() === '';
}

function linkifySegment(text: string, index: DocsIndex): string {
  const link = (path: string, anchor: string | undefined, label?: string) => {
    const code = index.codeByPath[path];
    if (!code) return null;
    const title = index.titleByPath[path] || code;
    const shown = label && !looksLikeAPath(label) ? label : title;
    return `[${shown}](?p=${code}${anchor ?? ''})`;
  };

  // A link whose target is a page keeps the author's label and gains a target
  // the reader can actually open.
  let out = text.replace(AS_LINK, (whole, label: string, path: string, anchor?: string) =>
    link(path, anchor, label) ?? whole,
  );

  out = out.replace(BRACKETED, (whole, path: string, anchor?: string) => link(path, anchor) ?? whole);

  // "Pre-authorisation Flow(<path>)" — the parenthetical is the same page the
  // words before it already name, so it collapses into one link rather than
  // repeating the title.
  out = out.replace(
    PARENTHESISED,
    (whole, label: string | undefined, gap: string, path: string, anchor?: string) => {
      const replacement = link(path, anchor);
      if (!replacement) return whole;
      const title = index.titleByPath[path] ?? '';
      if (label && label.trim().toLowerCase() === title.toLowerCase()) return replacement;
      return `${label ?? ''}${gap}${replacement}`;
    },
  );

  return out.replace(BARE, (whole, path: string, anchor?: string) => link(path, anchor) ?? whole);
}

/**
 * Turn every page an answer cites into a link that opens it in the reader. A
 * path the corpus does not have, or one inside a code span, is left as written.
 */
export function linkifyCitations(markdown: string, index: DocsIndex | null): string {
  if (!index) return markdown;
  return markdown
    .split(CODE_SPANS)
    .map((segment, i) => (i % 2 === 1 ? segment : linkifySegment(segment, index)))
    .join('');
}

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { renderMarkdown, type DocHeading } from '@/lib/markdown';
import { fetchDocsManifest, fetchDocsPage, type DocsManifest, type DocsManifestPage } from '@/lib/docs';
import { useDocsIndex } from '@/lib/citations';
import { useMermaid } from '@/lib/mermaid';
import { DocsChat } from '@/components/docs/DocsChat';

// The site keeps no documentation of its own. The corpus is the docs project,
// staged into public/docs at build time by scripts/sync-docs.mjs and emitted
// by the static export, so this reader fetches it as plain files rather than
// bundling it — the same corpus the HCX Kit console serves from disk.
//
// Every page carries a chapter.subchapter code — 04.03, 12.01 — assigned by
// the docs build, and that code is the address: /documentation/?p=12.01. The
// slug and the file path resolve too, so an older link still lands.

interface Page extends DocsManifestPage {
  /** The chapter's display title, resolved from the manifest's sections. */
  chapter: string;
}

interface Chapter {
  id: string;
  title: string;
  pages: Page[];
}

type LoadState = 'loading' | 'ready' | 'empty' | 'error';

function buildChapters(manifest: DocsManifest): Chapter[] {
  const byCode = new Map(manifest.pages.map((page) => [page.code, page]));
  return manifest.sections
    .map((section) => ({
      id: section.id,
      title: section.title,
      pages: section.pages
        .map((code) => byCode.get(code))
        .filter((page): page is DocsManifestPage => Boolean(page))
        .map((page) => ({ ...page, chapter: section.title })),
    }))
    .filter((chapter) => chapter.pages.length > 0);
}

/**
 * Find a heading by anchor, tolerantly.
 *
 * Chat citations carry the anchor the docs build assigned — it turns every
 * run of punctuation into a dash, so `Appendix C.1` becomes `appendix-c-1`,
 * where the reader's heading id is `appendix-c1`. An exact match is tried
 * first; failing that, the ids are compared with their dashes removed, which
 * reconciles the two rules without either side guessing at the other.
 */
function findHeading(root: Element | null, id: string): Element | null {
  if (!root || !id) return null;
  const exact = root.querySelector(`#${CSS.escape(id)}`);
  if (exact) return exact;
  const loose = id.replace(/-/g, '').toLowerCase();
  return (
    Array.from(root.querySelectorAll('[id]')).find(
      (el) => el.id.replace(/-/g, '').toLowerCase() === loose,
    ) ?? null
  );
}

async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* falls through to the legacy path below */
  }
  try {
    const area = document.createElement('textarea');
    area.value = value;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/**
 * `?p=<code>` as state.
 *
 * This is a static export, so there is no router to ask: the page reads the
 * query itself and writes it back with history.pushState (shallow routing,
 * which Next supports), which keeps back and forward working without a
 * document load between pages.
 */
function useDocParam(): [string, (code: string, replace?: boolean) => void] {
  const [param, setParam] = useState('');

  useEffect(() => {
    const read = () => setParam((new URLSearchParams(window.location.search).get('p') ?? '').trim());
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);

  const set = useCallback((code: string, replace = false) => {
    const url = `${window.location.pathname}?p=${encodeURIComponent(code)}`;
    if (replace) window.history.replaceState(null, '', url);
    else window.history.pushState(null, '', url);
    setParam(code);
  }, []);

  return [param, set];
}

export function DocsReader() {
  const [manifest, setManifest] = useState<DocsManifest | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  // Page markdown, fetched as pages are opened and — once someone searches —
  // for the whole set, since a body search needs the bodies.
  const [bodies, setBodies] = useState<Record<string, string>>({});
  const [bodiesComplete, setBodiesComplete] = useState(false);
  const loadingAll = useRef(false);
  const inFlight = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetchDocsManifest()
      .then((loaded) => {
        if (cancelled) return;
        setManifest(loaded);
        setState(loaded ? 'ready' : 'empty');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const chapters = useMemo(() => (manifest ? buildChapters(manifest) : []), [manifest]);
  const allPages = useMemo(() => chapters.flatMap((ch) => ch.pages), [chapters]);

  // Every address a page answers to: its code, its slug, and its path with or
  // without the extension.
  const byReference = useMemo(() => {
    const refs = new Map<string, Page>();
    allPages.forEach((page) => {
      refs.set(page.code.toLowerCase(), page);
      refs.set(page.slug.toLowerCase(), page);
      refs.set(page.path.toLowerCase(), page);
      refs.set(page.path.replace(/\.md$/i, '').toLowerCase(), page);
    });
    return refs;
  }, [allPages]);

  const [requested, setRequested] = useDocParam();
  const [query, setQuery] = useState('');
  // The assistant starts as a bubble: the documentation is what the page is
  // for, and the reader asks when they want to.
  const [chatOpen, setChatOpen] = useState(false);
  // Keyed by page so switching pages drops the old highlight without an
  // effect that resets state on every navigation.
  const [spy, setSpy] = useState<{ page: string; id: string }>({ page: '', id: '' });
  const [copiedPage, setCopiedPage] = useState(false);
  // A heading asked for by a cross-link, scrolled to once its page renders.
  const pendingHash = useRef('');
  // The first page to finish loading is the one the visitor arrived on, not a
  // page they navigated to — see the scroll effect below.
  const firstSettled = useRef(true);

  const docs = useDocsIndex();
  const contentRef = useRef<HTMLElement | null>(null);
  const scrollRef = useRef<HTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const activePage = useMemo(
    () => byReference.get(requested.toLowerCase()) ?? allPages[0],
    [byReference, requested, allPages],
  );

  const openPage = useCallback((page: Page) => setRequested(page.code), [setRequested]);

  /** Follow a `?p=<code>#<anchor>` link from a citation or a cross-reference. */
  const openReference = useCallback(
    (href: string) => {
      const [ref, hash] = decodeURIComponent(href.replace(/^\?p=/, '')).split('#');
      const page = byReference.get(ref.trim().toLowerCase());
      if (!page) return false;
      pendingHash.current = hash ?? '';
      if (page.code === activePage?.code) {
        // Same page: nothing reloads, so scroll to the heading here.
        const heading = findHeading(contentRef.current, pendingHash.current);
        pendingHash.current = '';
        if (heading) {
          heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setSpy({ page: page.code, id: heading.id });
        }
        return true;
      }
      setRequested(page.code);
      return true;
    },
    [byReference, activePage, setRequested],
  );

  // The open page's markdown, fetched on demand and kept. No cleanup: a fetch
  // in flight when the background load lands must still finish, so a second
  // request for the same page is held off by inFlight rather than by cancelling.
  useEffect(() => {
    const path = activePage?.path;
    if (!path || bodies[path] !== undefined || inFlight.current.has(path)) return;
    inFlight.current.add(path);
    fetchDocsPage(path)
      .then((text) => setBodies((prev) => ({ ...prev, [path]: text })))
      .catch(() => setBodies((prev) => ({ ...prev, [path]: '' })))
      .finally(() => inFlight.current.delete(path));
  }, [activePage, bodies]);

  // Searching means searching bodies, so the first keystroke pulls the rest of
  // the set in the background. Results sharpen as pages arrive.
  useEffect(() => {
    if (!query.trim() || bodiesComplete || loadingAll.current || allPages.length === 0) return;
    loadingAll.current = true;
    Promise.all(
      allPages.map(async (page) => {
        try {
          return [page.path, await fetchDocsPage(page.path)] as const;
        } catch {
          return [page.path, ''] as const;
        }
      }),
    ).then((loaded) => {
      setBodies((prev) => {
        const next = { ...prev };
        loaded.forEach(([path, text]) => {
          if (next[path] === undefined || next[path] === '') next[path] = text;
        });
        return next;
      });
      setBodiesComplete(true);
    });
  }, [query, bodiesComplete, allPages]);

  const activeBody = activePage ? bodies[activePage.path] : undefined;
  const doc = useMemo(() => (activeBody ? renderMarkdown(activeBody) : null), [activeBody]);

  // ```mermaid fences arrive as their source; they are drawn once the page's
  // HTML is in the DOM.
  useMermaid(contentRef, [doc]);

  const haystacks = useMemo(() => {
    const map = new Map<string, string>();
    Object.entries(bodies).forEach(([path, text]) => map.set(path, text.toLowerCase()));
    return map;
  }, [bodies]);

  // Search over codes, titles, summaries, keywords and — once loaded — bodies,
  // keeping the chapter grouping intact.
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return chapters;
    const matches = (page: Page) =>
      page.code.includes(needle) ||
      page.title.toLowerCase().includes(needle) ||
      page.summary.toLowerCase().includes(needle) ||
      page.keywords.some((word) => word.toLowerCase().includes(needle)) ||
      (haystacks.get(page.path)?.includes(needle) ?? false);
    return chapters
      .map((ch) => ({ ...ch, pages: ch.pages.filter(matches) }))
      .filter((ch) => ch.pages.length > 0);
  }, [chapters, query, haystacks]);

  const activeHeading = activePage && spy.page === activePage.code ? spy.id : '';

  const tocEntries: DocHeading[] = useMemo(
    () => (doc?.headings ?? []).filter((h) => h.depth >= 2 && h.depth <= 4),
    [doc],
  );

  const pageIndex = activePage ? allPages.indexOf(activePage) : -1;
  const prevPage = pageIndex > 0 ? allPages[pageIndex - 1] : undefined;
  const nextPage = pageIndex >= 0 && pageIndex < allPages.length - 1 ? allPages[pageIndex + 1] : undefined;

  // A new page starts at the top, unless a link or the URL points at a heading.
  useEffect(() => {
    if (!activePage || !doc) return;
    const hash = pendingHash.current || decodeURIComponent(window.location.hash.replace(/^#/, ''));
    pendingHash.current = '';
    const target = findHeading(contentRef.current, hash);
    const first = firstSettled.current;
    firstSettled.current = false;

    if (target) {
      target.scrollIntoView({ block: 'start' });
      setSpy({ page: activePage.code, id: target.id });
    } else if (!first) {
      // The document scrolls, not the column: bring the top of the reader
      // back under the sticky nav rather than jumping to the masthead.
      //
      // Only on a real page change. The corpus arrives after the first paint,
      // so scrolling here on arrival would yank the reader past the site's
      // ribbon and masthead the moment the page finished loading.
      scrollRef.current?.scrollIntoView({ block: 'start' });
    }
  }, [activePage, doc]);

  // Scroll spy: the heading nearest the top of the viewport owns the TOC.
  useEffect(() => {
    const article = contentRef.current;
    const code = activePage?.code ?? '';
    if (!article || tocEntries.length === 0) return;

    const targets = tocEntries
      .map((h) => article.querySelector(`#${CSS.escape(h.id)}`))
      .filter((el): el is Element => Boolean(el));
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = visible[0]?.target.id;
        if (id) setSpy({ page: code, id });
      },
      // The page itself scrolls, so the viewport is the root.
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [tocEntries, activePage]);

  // "/" focuses search the way it does on GitHub.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const el = event.target as HTMLElement | null;
      const typing = el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
      if (event.key === '/' && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'Escape' && el === searchRef.current) {
        setQuery('');
        searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const pageCode = activePage?.code ?? '';

  // Code copy buttons, heading permalinks and cross-references live inside
  // rendered HTML, so they are handled by delegation rather than React props.
  const onContentClick = useCallback(
    async (event: React.MouseEvent<HTMLElement>) => {
      const target = event.target as HTMLElement;

      const copyButton = target.closest<HTMLButtonElement>('button[data-action="copy-code"]');
      if (copyButton) {
        event.preventDefault();
        const code = copyButton.closest('figure')?.querySelector('code')?.textContent ?? '';
        const ok = await copyText(code);
        copyButton.dataset.copied = String(ok);
        copyButton.textContent = ok ? 'Copied' : 'Failed';
        window.setTimeout(() => {
          copyButton.textContent = 'Copy';
          delete copyButton.dataset.copied;
        }, 1600);
        return;
      }

      // Cross-references between pages are written as ?p=<code>, optionally
      // with a heading — ?p=04.03#adjudication. Switch pages in place rather
      // than letting the browser load the document again.
      const docLink = target.closest<HTMLAnchorElement>('a[href^="?p="]');
      if (docLink && !event.metaKey && !event.ctrlKey) {
        if (openReference(docLink.getAttribute('href') ?? '')) {
          event.preventDefault();
          return;
        }
      }

      const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');
      if (anchor) {
        const id = decodeURIComponent(anchor.getAttribute('href')?.slice(1) ?? '');
        const heading = findHeading(contentRef.current, id);
        if (heading) {
          event.preventDefault();
          heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.replaceState(null, '', `#${heading.id}`);
          setSpy({ page: pageCode, id: heading.id });
        }
      }
    },
    [openReference, pageCode],
  );

  const goToHeading = useCallback(
    (id: string) => {
      const heading = contentRef.current?.querySelector(`#${CSS.escape(id)}`);
      if (!heading) return;
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
      setSpy({ page: pageCode, id });
    },
    [pageCode],
  );

  const copyPageLink = useCallback(async () => {
    const ok = await copyText(window.location.href);
    setCopiedPage(ok);
    window.setTimeout(() => setCopiedPage(false), 1600);
  }, []);

  const corpus = manifest?.source?.corpus;

  return (
    <div className="docs-shell">
      {/* Chapter navigation */}
      <aside className="docs-nav">
        <div className="docs-search">
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search documentation"
            placeholder="Search the documentation  /"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>

        <nav className="docs-chapters">
          {results.map((ch) => (
            <div key={ch.id} className="docs-chapter">
              <h4>{ch.title}</h4>
              <ul>
                {ch.pages.map((pg) => {
                  const isActive = activePage?.code === pg.code;
                  return (
                    <li key={pg.code}>
                      <a
                        href={`?p=${pg.code}`}
                        title={pg.summary || pg.title}
                        aria-current={isActive ? 'page' : undefined}
                        data-active={isActive}
                        onClick={(event) => {
                          if (event.metaKey || event.ctrlKey) return;
                          event.preventDefault();
                          openPage(pg);
                        }}
                      >
                        {pg.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {results.length === 0 && (
            <p className="docs-nav-empty">
              {state === 'loading' && 'Loading documentation…'}
              {state === 'ready' && (query ? `No pages match “${query}”.` : 'No documentation pages found.')}
              {state === 'empty' && 'No documentation staged.'}
              {state === 'error' && 'Documentation unavailable.'}
            </p>
          )}
        </nav>

        {corpus && (
          <p className="docs-nav-foot">
            {allPages.length} pages · {corpus}
          </p>
        )}
      </aside>

      {/* Reader */}
      <main ref={scrollRef} className="docs-reader">
        <div className="docs-reader-inner">
          <div className="docs-article">
            {activePage ? (
              <>
                <div className="docs-crumb">
                  <span>
                    {activePage.chapter} · <b>{activePage.code}</b>
                  </span>
                  <button type="button" onClick={copyPageLink}>
                    {copiedPage ? 'Link copied' : 'Copy link'}
                  </button>
                </div>

                {doc ? (
                  <article
                    ref={contentRef}
                    onClick={onContentClick}
                    className="markdown-body"
                    dangerouslySetInnerHTML={{ __html: doc.html }}
                  />
                ) : (
                  <p className="docs-note">
                    {activeBody === '' ? 'This page could not be read.' : 'Loading…'}
                  </p>
                )}

                <nav className="docs-pager">
                  {prevPage ? (
                    <button type="button" onClick={() => openPage(prevPage)}>
                      <span>← Previous</span>
                      <b>{prevPage.title}</b>
                    </button>
                  ) : (
                    <span />
                  )}
                  {nextPage && (
                    <button type="button" className="docs-pager-next" onClick={() => openPage(nextPage)}>
                      <span>Next →</span>
                      <b>{nextPage.title}</b>
                    </button>
                  )}
                </nav>
              </>
            ) : (
              <div className="docs-note">
                {state === 'loading' && <p>Loading documentation…</p>}
                {state === 'empty' && (
                  <>
                    <p>
                      <b>No documentation staged.</b>
                    </p>
                    <p>
                      The site reads its documentation from the docs project. Stage it with{' '}
                      <code>npm run sync:docs</code> — it copies the current build into{' '}
                      <code>public/docs</code>.
                    </p>
                  </>
                )}
                {state === 'error' && (
                  <>
                    <p>
                      <b>Documentation unavailable.</b>
                    </p>
                    <p>The corpus could not be fetched — reload, or rebuild the site.</p>
                  </>
                )}
                {state === 'ready' && <p>No document content available.</p>}
              </div>
            )}
          </div>

          {/* On this page */}
          {tocEntries.length > 1 && (
            <aside className="docs-toc">
              <div>
                <p>On this page</p>
                <ul>
                  {tocEntries.map((heading) => (
                    <li key={heading.id}>
                      <a
                        href={`#${heading.id}`}
                        data-depth={heading.depth}
                        data-active={activeHeading === heading.id}
                        onClick={(e) => {
                          e.preventDefault();
                          goToHeading(heading.id);
                        }}
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </main>

      <DocsChat
        docs={docs}
        onOpenCitation={openReference}
        open={chatOpen}
        onToggle={() => setChatOpen((open) => !open)}
      />
    </div>
  );
}

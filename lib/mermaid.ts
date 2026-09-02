/**
 * Mermaid diagrams in rendered markdown.
 *
 * A ```mermaid fence is emitted by the markdown renderer as
 * `<figure class="md-mermaid"><pre class="md-mermaid-source">…</pre></figure>`
 * — the source, marked up, nothing drawn. This module draws it once that HTML
 * is in the document, because mermaid measures rendered text and so needs a
 * DOM to work against.
 *
 * The library is loaded on first use and never before: it is far larger than
 * the rest of the site put together, and most visitors never open a page that
 * has a diagram in it. Next splits it into its own chunk, served from the same
 * origin — nothing is fetched from a CDN.
 *
 * A diagram that will not parse keeps its source on screen with the error
 * beneath it. That is the honest outcome: the reader can still see what the
 * page meant to show, and whoever wrote it can see why it did not draw.
 *
 * The site is light-themed only, so — unlike the kit's console — there is one
 * palette and a figure is drawn at most once.
 */

import { useEffect } from 'react';

type Mermaid = typeof import('mermaid')['default'];

let mermaidPromise: Promise<Mermaid> | null = null;
let initialised = false;
let counter = 0;

async function loadMermaid(): Promise<Mermaid> {
  mermaidPromise ??= import('mermaid').then((module) => module.default);
  const mermaid = await mermaidPromise;
  if (!initialised) {
    mermaid.initialize({
      startOnLoad: false,
      // Labels come from documentation the site renders, and answers a model
      // wrote: strict keeps script and click bindings out of the SVG.
      securityLevel: 'strict',
      // Without this, a diagram that will not parse paints mermaid's own
      // "Syntax error in text" graphic into the page. The figure below says
      // it better: the source stays visible with the parser's message under it.
      suppressErrorRendering: true,
      theme: 'default',
      fontFamily: 'inherit',
    });
    initialised = true;
  }
  return mermaid;
}

/**
 * Repairs to the source that are always safe, and that fix most of what
 * arrives broken: a non-breaking space where a space belongs, a curly quote
 * where a delimiter belongs, a zero-width space, or a fence that repeats its
 * own language on the first line.
 */
function normalise(source: string): string {
  return source
    .replace(/\u00a0/g, ' ')
    .replace(/[\u200b-\u200d\ufeff]/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/^\s*mermaid\s*\n/i, '')
    .trim();
}

function fail(figure: HTMLElement, message: string): void {
  figure.dataset.state = 'error';
  const existing = figure.querySelector('.md-mermaid-error');
  if (existing) {
    existing.textContent = message;
    return;
  }
  const caption = document.createElement('figcaption');
  caption.className = 'md-mermaid-error';
  caption.textContent = message;
  figure.appendChild(caption);
}

/**
 * Draw every diagram inside `root` that has not been drawn yet. Safe to call
 * on every render: a figure is only processed once.
 */
export async function drawDiagrams(root: HTMLElement | null): Promise<void> {
  if (!root) return;
  const figures = Array.from(root.querySelectorAll<HTMLElement>('figure.md-mermaid')).filter(
    (figure) => figure.dataset.drawn !== 'true',
  );
  if (figures.length === 0) return;

  let mermaid: Mermaid;
  try {
    mermaid = await loadMermaid();
  } catch {
    figures.forEach((figure) => fail(figure, 'The diagram renderer could not be loaded.'));
    return;
  }

  for (const figure of figures) {
    // The source stays in the figure so a redraw has something to draw from.
    const source = figure.querySelector<HTMLElement>('.md-mermaid-source')?.textContent ?? '';
    // An empty fence has nothing to draw, but it must still leave the pending
    // state or the figure sits under "Drawing diagram…" for good.
    if (!source.trim()) {
      figure.dataset.drawn = 'true';
      figure.dataset.state = 'drawn';
      continue;
    }

    figure.dataset.drawn = 'true';
    const diagram = normalise(source);
    const id = `md-mermaid-${(counter += 1)}`;
    try {
      // Parse first: a diagram that cannot be parsed never reaches render, so
      // nothing of mermaid's is added to the page for us to clean up after.
      if ((await mermaid.parse(diagram, { suppressErrors: true })) === false) {
        throw new Error('This diagram is not valid mermaid syntax.');
      }
      const { svg } = await mermaid.render(id, diagram);
      const drawn = figure.querySelector('.md-mermaid-svg') ?? document.createElement('div');
      drawn.className = 'md-mermaid-svg';
      drawn.innerHTML = svg;
      if (!drawn.parentElement) figure.prepend(drawn);
      // mermaid sizes the SVG to whatever it measured — often wider than the
      // column. Dropping its inline sizing hands the decision to the
      // stylesheet, which scales the diagram down to fit.
      const svgElement = drawn.querySelector('svg');
      if (svgElement) {
        svgElement.removeAttribute('height');
        svgElement.style.removeProperty('max-width');
      }
      figure.dataset.state = 'drawn';
      figure.querySelector('.md-mermaid-error')?.remove();
    } catch (error) {
      // mermaid can leave its scratch element behind when rendering throws.
      document.getElementById(`d${id}`)?.remove();
      figure.querySelector('.md-mermaid-svg')?.remove();
      delete figure.dataset.drawn;
      fail(figure, error instanceof Error ? error.message : 'This diagram could not be drawn.');
    }
  }
}

/** Draw the diagrams in `ref` after every render that could have added one. */
export function useMermaid(
  ref: React.RefObject<HTMLElement | null>,
  deps: React.DependencyList,
): void {
  useEffect(() => {
    void drawDiagrams(ref.current);
    // The caller decides what counts as "the content changed".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

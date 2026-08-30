/**
 * GitHub-flavoured markdown rendering for the docs module.
 *
 * marked handles the CommonMark + GFM core (tables, task lists, strikethrough,
 * autolinks). Everything GitHub adds on top of that is implemented here:
 * heading anchors, `> [!NOTE]` alerts, footnotes, highlighted code blocks with
 * a copy affordance, and scroll-safe tables. The result is sanitised before it
 * reaches the DOM — see ./sanitize.
 */

import { Lexer, Marked, type RendererObject, type TokenizerAndRendererExtension, type Tokens } from 'marked';
import { escapeHtml, highlight, isHighlightable } from './highlight';
import { isSafeUrl, sanitizeHtml } from './sanitize';

export interface DocHeading {
  id: string;
  text: string;
  depth: number;
}

export interface RenderedDoc {
  /** Sanitised HTML ready for dangerouslySetInnerHTML. */
  html: string;
  /** Every heading in document order, for a table of contents. */
  headings: DocHeading[];
  /** Text of the first level-one heading, when the page opens with one. */
  title?: string;
  /** Plain text of the whole document, for search. */
  plainText: string;
}

const ALERT_LABELS: Record<string, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
};

/** GitHub's heading slug rules: lowercase, drop punctuation, spaces to dashes. */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

function attr(value: string): string {
  return escapeHtml(value).replace(/\n/g, ' ');
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

interface FootnoteEntry {
  index: number;
  html: string;
  refs: number;
}

export function renderMarkdown(source: string): RenderedDoc {
  const markdown = typeof source === 'string' ? source : '';
  if (!markdown.trim()) {
    return { html: '', headings: [], plainText: '' };
  }

  const headings: DocHeading[] = [];
  const usedSlugs = new Map<string, number>();
  const footnotes = new Map<string, FootnoteEntry>();
  const footnoteOrder: string[] = [];

  // Refs are links only when a definition exists somewhere in the document —
  // definitions usually sit below the reference, so scan before parsing.
  const definedFootnotes = new Set(
    Array.from(markdown.matchAll(/^\[\^([^\]\s]+)\]:/gm), (m) => m[1]),
  );

  const uniqueSlug = (text: string): string => {
    const base = slugify(text) || 'section';
    const seen = usedSlugs.get(base) ?? 0;
    usedSlugs.set(base, seen + 1);
    return seen === 0 ? base : `${base}-${seen}`;
  };

  const footnoteIndex = (label: string): number => {
    const existing = footnotes.get(label);
    if (existing) {
      existing.refs += 1;
      return existing.index;
    }
    footnoteOrder.push(label);
    footnotes.set(label, { index: footnoteOrder.length, html: '', refs: 1 });
    return footnoteOrder.length;
  };

  // footnotes ------------------------------------------------------------
  const footnoteDefinition: TokenizerAndRendererExtension = {
    name: 'footnoteDefinition',
    level: 'block',
    start(src) {
      const m = /^\[\^[^\]\s]+\]:/m.exec(src);
      return m ? m.index : undefined;
    },
    tokenizer(src) {
      const m = /^\[\^([^\]\s]+)\]:[ \t]*([^\n]*(?:\n(?![ \t]*(?:\n|\[\^))[^\n]*)*)\n?/.exec(src);
      if (!m) return undefined;
      const body = m[2].replace(/^[ \t]{1,4}/gm, '');
      return {
        type: 'footnoteDefinition',
        raw: m[0],
        label: m[1],
        tokens: this.lexer.blockTokens(body.trim()),
      } as Tokens.Generic;
    },
    renderer(token) {
      const label = String((token as Tokens.Generic).label);
      const html = this.parser.parse((token as Tokens.Generic).tokens ?? []);
      const entry = footnotes.get(label);
      if (entry) {
        entry.html = html;
      } else {
        // Defined but never referenced — keep it, numbered after the rest.
        footnoteOrder.push(label);
        footnotes.set(label, { index: footnoteOrder.length, html, refs: 0 });
      }
      return '';
    },
  };

  const footnoteReference: TokenizerAndRendererExtension = {
    name: 'footnoteReference',
    level: 'inline',
    start(src) {
      const i = src.indexOf('[^');
      return i === -1 ? undefined : i;
    },
    tokenizer(src) {
      const m = /^\[\^([^\]\s]+)\]/.exec(src);
      if (!m || !definedFootnotes.has(m[1])) return undefined;
      return { type: 'footnoteReference', raw: m[0], label: m[1] } as Tokens.Generic;
    },
    renderer(token) {
      const label = String((token as Tokens.Generic).label);
      const index = footnoteIndex(label);
      const refs = footnotes.get(label)?.refs ?? 1;
      const refId = refs > 1 ? `fnref-${slugify(label)}-${refs}` : `fnref-${slugify(label)}`;
      return (
        `<sup class="md-footnote-ref" data-footnote-ref="true">` +
        `<a href="#fn-${attr(slugify(label))}" id="${attr(refId)}">${index}</a></sup>`
      );
    },
  };

  // renderer -------------------------------------------------------------
  const renderer: RendererObject = {
    heading(token: Tokens.Heading) {
      const inner = this.parser.parseInline(token.tokens);
      const text = stripTags(inner);
      const id = uniqueSlug(text);
      headings.push({ id, text, depth: token.depth });
      return (
        `<h${token.depth} id="${attr(id)}" class="md-heading">` +
        `<a class="md-anchor" href="#${attr(id)}" aria-label="Permalink to ${attr(text)}"></a>` +
        `${inner}</h${token.depth}>\n`
      );
    },

    code(token: Tokens.Code) {
      const info = (token.lang ?? '').trim();
      const lang = info.split(/\s+/)[0] ?? '';

      // A mermaid fence is a diagram, not a listing: it is emitted as its
      // source inside a marked-up figure, and drawn after the HTML is in the
      // DOM (see lib/mermaid). Rendering it here is not possible — mermaid
      // measures text, so it needs a document — and shipping the source keeps
      // the diagram readable if it never draws.
      if (lang.toLowerCase() === 'mermaid') {
        return (
          `<figure class="md-mermaid" data-state="pending">` +
          `<div class="md-mermaid-loading"><span class="md-mermaid-spinner"></span>` +
          `Drawing diagram…</div>` +
          `<pre class="md-mermaid-source">${escapeHtml(token.text)}</pre>` +
          `</figure>\n`
        );
      }

      const titleMatch = /title="([^"]+)"/.exec(info);
      const body = isHighlightable(lang) ? highlight(token.text, lang) : escapeHtml(token.text);
      const label = titleMatch ? titleMatch[1] : lang;
      const langClass = lang ? ` class="language-${attr(lang)}"` : '';

      return (
        `<figure class="md-code"${lang ? ` data-lang="${attr(lang)}"` : ''}>` +
        `<figcaption class="md-code-bar">` +
        `<span class="md-code-lang">${attr(label || 'text')}</span>` +
        `<button type="button" class="md-copy" data-action="copy-code" aria-label="Copy code">Copy</button>` +
        `</figcaption>` +
        `<pre><code${langClass}>${body}</code></pre></figure>\n`
      );
    },

    blockquote(token: Tokens.Blockquote) {
      // GitHub alerts: a blockquote whose first line is [!NOTE] and friends.
      const marker = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*\n?/i.exec(token.text);
      if (marker) {
        const kind = marker[1].toLowerCase();
        const body = token.text.slice(marker[0].length);
        const inner = this.parser.parse(Lexer.lex(body, this.options));
        return (
          `<div class="md-alert md-alert-${kind}">` +
          `<p class="md-alert-title">${ALERT_LABELS[kind]}</p>${inner}</div>\n`
        );
      }
      return `<blockquote>${this.parser.parse(token.tokens)}</blockquote>\n`;
    },

    table(token: Tokens.Table) {
      const align = (value: string | null) => (value ? ` align="${attr(value)}"` : '');
      const head = token.header
        .map((cell, i) => `<th${align(token.align[i])}>${this.parser.parseInline(cell.tokens)}</th>`)
        .join('');
      const body = token.rows
        .map(
          (row) =>
            `<tr>${row
              .map((cell, i) => `<td${align(token.align[i])}>${this.parser.parseInline(cell.tokens)}</td>`)
              .join('')}</tr>`,
        )
        .join('\n');
      // Wide tables scroll inside the column instead of stretching the page.
      return (
        `<div class="md-table-scroll"><table>` +
        `<thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>\n`
      );
    },

    list(token: Tokens.List) {
      const tag = token.ordered ? 'ol' : 'ul';
      const start = token.ordered && Number(token.start) !== 1 ? ` start="${Number(token.start)}"` : '';
      const isTaskList = token.items.some((item) => item.task);
      const cls = isTaskList ? ' class="md-task-list"' : '';
      const items = token.items.map((item) => this.listitem?.call(this, item) ?? '').join('');
      return `<${tag}${start}${cls}>\n${items}</${tag}>\n`;
    },

    // marked emits a checkbox token inside a task item, so the input is
    // rendered here and listitem only carries the styling hook.
    checkbox(token: Tokens.Checkbox) {
      return `<input type="checkbox" disabled${token.checked ? ' checked' : ''}> `;
    },

    listitem(item: Tokens.ListItem) {
      const inner = this.parser.parse(item.tokens);
      return `<li${item.task ? ' class="md-task"' : ''}>${inner}</li>\n`;
    },

    link(token: Tokens.Link) {
      const safe = isSafeUrl(token.href);
      const href = safe ? token.href : '#';
      const title = token.title ? ` title="${attr(token.title)}"` : '';
      const external = /^https?:/i.test(href);
      const rel = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      const cls = external ? ' class="md-link md-link-external"' : ' class="md-link"';
      return `<a href="${attr(href)}"${title}${rel}${cls}>${this.parser.parseInline(token.tokens)}</a>`;
    },

    image(token: Tokens.Image) {
      const src = isSafeUrl(token.href) || token.href.startsWith('data:image/') ? token.href : '';
      if (!src) return escapeHtml(token.text);
      const img =
        `<img src="${attr(src)}" alt="${attr(token.text ?? '')}" loading="lazy" decoding="async">`;
      if (!token.title) return img;
      return `<figure class="md-figure">${img}<figcaption>${attr(token.title)}</figcaption></figure>`;
    },
  };

  const marked = new Marked({ gfm: true, breaks: false });
  marked.use({
    extensions: [footnoteDefinition, footnoteReference],
    renderer,
  });

  let html: string;
  try {
    html = marked.parse(markdown, { async: false }) as string;
  } catch {
    // A malformed document degrades to preformatted source rather than a
    // blank page — the reader can still see what the file says.
    return {
      html: `<pre class="md-raw">${escapeHtml(markdown)}</pre>`,
      headings: [],
      plainText: markdown,
    };
  }

  if (footnoteOrder.length > 0) {
    const items = footnoteOrder
      .map((label) => {
        const entry = footnotes.get(label);
        if (!entry) return '';
        const id = slugify(label);
        const backref = ` <a href="#fnref-${attr(id)}" class="md-footnote-back" aria-label="Back to content">↩</a>`;
        const body = entry.html.replace(/<\/p>\s*$/, `${backref}</p>`);
        const withBack = body === entry.html ? `${entry.html}<p>${backref}</p>` : body;
        return `<li id="fn-${attr(id)}">${withBack}</li>`;
      })
      .join('\n');
    html += `<section class="md-footnotes" data-footnotes="true"><h2>Footnotes</h2><ol>${items}</ol></section>`;
  }

  const safeHtml = sanitizeHtml(html);
  const title = headings.find((h) => h.depth === 1)?.text;

  return {
    html: safeHtml,
    headings,
    title,
    plainText: stripTags(safeHtml.replace(/<\/(p|li|h[1-6]|tr|pre)>/g, ' ')),
  };
}

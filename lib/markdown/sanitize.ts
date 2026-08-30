/**
 * Allowlist sanitiser for rendered markdown.
 *
 * Docs ship with the app, so this is not the only thing standing between a
 * stranger and the DOM — but markdown allows raw HTML, the renderer hands its
 * output to dangerouslySetInnerHTML, and a page pasted in from an email or a
 * payer's PDF should never be able to run script. Anything outside the
 * allowlist is unwrapped (children kept, tag dropped) rather than deleted, so
 * unsupported markup degrades to its text instead of vanishing.
 */

const ALLOWED_TAGS = new Set([
  'a', 'abbr', 'b', 'blockquote', 'br', 'caption', 'code', 'col', 'colgroup', 'dd', 'del',
  'details', 'div', 'dl', 'dt', 'em', 'figcaption', 'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'hr', 'i', 'img', 'input', 'ins', 'kbd', 'li', 'mark', 'ol', 'p', 'pre', 'q', 's', 'samp',
  'section', 'small', 'span', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot',
  'th', 'thead', 'tr', 'ul', 'var', 'button',
]);

/** Tags dropped whole — their content is markup we never want rendered. */
const DROP_WITH_CONTENT = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'form', 'link', 'meta', 'base', 'noscript',
  'template', 'svg', 'math', 'audio', 'video', 'source', 'track', 'canvas', 'select', 'textarea',
  'option', 'frame', 'frameset', 'applet',
]);

const GLOBAL_ATTRS = new Set(['class', 'id', 'title', 'dir', 'lang', 'role']);

const TAG_ATTRS: Record<string, string[]> = {
  a: ['href', 'target', 'rel', 'name'],
  img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
  input: ['type', 'checked', 'disabled'],
  ol: ['start', 'reversed', 'type'],
  td: ['colspan', 'rowspan', 'align'],
  th: ['colspan', 'rowspan', 'align', 'scope'],
  col: ['span', 'align'],
  colgroup: ['span'],
  details: ['open'],
  figure: ['data-lang', 'data-state'],
  button: ['type', 'data-action', 'aria-label'],
  section: ['data-footnotes'],
  sup: ['data-footnote-ref'],
  li: ['data-footnote-id'],
};

const SAFE_URL = /^(?:https?:|mailto:|tel:|#|\/|\.{1,2}\/)/i;
const SAFE_IMAGE_DATA_URL = /^data:image\/(?:png|jpe?g|gif|webp|avif);base64,[a-z0-9+/=\s]+$/i;

/** True when a link target cannot navigate to script. */
export function isSafeUrl(url: string): boolean {
  // Control characters and stray whitespace are stripped first: browsers
  // ignore them in URLs, so a "java\tscript:" trick cannot read as a safe scheme.
  const value = Array.from(url.trim())
    .filter((ch) => (ch.codePointAt(0) ?? 0) > 0x20)
    .join('');
  if (value === '') return false;
  if (SAFE_URL.test(value)) return true;
  // A bare relative path ("guide.md", "images/x.png") has no scheme at all.
  return !/^[a-z][a-z0-9+.-]*:/i.test(value);
}

function isSafeImageSrc(url: string): boolean {
  const value = url.trim();
  return isSafeUrl(value) || SAFE_IMAGE_DATA_URL.test(value);
}

function scrub(root: Element): void {
  // Snapshot first: the walk rewrites the tree as it goes.
  const elements = Array.from(root.querySelectorAll('*'));

  for (const el of elements) {
    // An earlier unwrap may have detached this node already.
    if (!el.isConnected && !root.contains(el)) continue;

    const tag = el.tagName.toLowerCase();

    if (DROP_WITH_CONTENT.has(tag)) {
      el.remove();
      continue;
    }

    if (!ALLOWED_TAGS.has(tag)) {
      // Unwrap: keep the text the author wrote, drop the tag itself.
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
      }
      continue;
    }

    const allowed = TAG_ATTRS[tag] ?? [];
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const isData = name.startsWith('data-') && (allowed.includes(name) || name === 'data-lang');
      const isAria = name.startsWith('aria-');

      if (!GLOBAL_ATTRS.has(name) && !allowed.includes(name) && !isData && !isAria) {
        el.removeAttribute(attr.name);
        continue;
      }
      if ((name === 'href' && !isSafeUrl(attr.value)) || (name === 'src' && !isSafeImageSrc(attr.value))) {
        el.removeAttribute(attr.name);
      }
    }

    // Only the read-only task-list checkbox survives as an input.
    if (tag === 'input' && el.getAttribute('type') !== 'checkbox') {
      el.remove();
      continue;
    }
    if (tag === 'input') el.setAttribute('disabled', '');

    // Anything leaving the app opens in a new tab and cannot reach opener.
    if (tag === 'a' && /^https?:/i.test(el.getAttribute('href') ?? '')) {
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    }
  }
}

/** Fallback for environments with no DOM parser (SSR, workers). */
function scrubWithoutDom(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed|form|svg)[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base)\b[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]*)/gi, '$1="#"');
}

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  if (typeof DOMParser === 'undefined') return scrubWithoutDom(html);

  try {
    const doc = new DOMParser().parseFromString(`<div id="md-root">${html}</div>`, 'text/html');
    const root = doc.getElementById('md-root');
    if (!root) return scrubWithoutDom(html);
    scrub(root);
    return root.innerHTML;
  } catch {
    return scrubWithoutDom(html);
  }
}

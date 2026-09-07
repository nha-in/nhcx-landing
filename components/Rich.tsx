import { Fragment } from 'react';
import { withBase } from '@/lib/paths';
import type { Rich as RichParts } from '@/lib/site-copy';

/**
 * A sentence with links and inline code in it, authored in content/site.json.
 *
 * Most copy on this site is one plain string and renders as one. The handful
 * of paragraphs that carry a link or a `<code>` in the middle are written as a
 * list of pieces instead — a plain string is text, `{ label, href }` is a
 * link, `{ code }` is a code span — so the whole sentence stays editable in
 * the CMS rather than being split into a "before" and an "after" around
 * markup the editor cannot see.
 *
 * Link hrefs go through withBase() like every other internal href; external
 * URLs and mailto: addresses pass through it untouched.
 */
export default function Rich({ parts }: { parts: RichParts }) {
  return (
    <>
      {parts.map((part, i) => {
        if (typeof part === 'string') return <Fragment key={i}>{part}</Fragment>;
        if ('code' in part) return <code key={i}>{part.code}</code>;
        return (
          <a key={i} href={withBase(part.href)}>
            {part.label}
          </a>
        );
      })}
    </>
  );
}

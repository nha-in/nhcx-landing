import section from '@/content/site.yaml?faq';
import type { Meta } from '@/lib/site-copy';

/*
 * The FAQ page's words and the questions and answers, from content/site.yaml
 * (`faq`), in the order they are shown. The first four
 * are the general ones the home page shows; the rest were collected from
 * the previous landing page's content (web/landing-old, content/site.yaml)
 * and are grouped by topic on the FAQ page. `more` is an optional link
 * shown under an answer.
 */

export type FaqItem = { topic: string; q: string; a: string; more?: string };

type FaqContent = { meta: Meta; page: { title: string; lede: string; topicsLabel: string }; learnMore: string; items: FaqItem[] };
const c = section as FaqContent;

export const FAQ_ITEMS = c.items;
export const FAQ_PAGE = { meta: c.meta, ...c.page, learnMore: c.learnMore };

/** The items grouped by topic, in first-seen order. */
export function faqTopics(items: FaqItem[] = FAQ_ITEMS): Array<{ topic: string; items: FaqItem[] }> {
  const groups: Array<{ topic: string; items: FaqItem[] }> = [];
  for (const item of items) {
    const group = groups.find((g) => g.topic === item.topic);
    if (group) group.items.push(item);
    else groups.push({ topic: item.topic, items: [item] });
  }
  return groups;
}

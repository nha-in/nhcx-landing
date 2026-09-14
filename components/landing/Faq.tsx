import { ArrowUpRight } from 'lucide-react';
import { withBase } from '@/lib/paths';
import { FAQ_ITEMS, FAQ_PAGE } from '@/lib/faq';
import { FAQ } from '@/lib/home-copy';
import FaqAccordion from '@/components/landing/FaqAccordion';

/* The home page's FAQ: the questions of one topic, and a link to the full page. */
export default function Faq() {
  const items = FAQ_ITEMS.filter((item) => item.topic === FAQ.topic);
  return (
    <section className="faq" aria-labelledby="faq-title">
      <div className="wrap">
        <h2 className="faq-title" id="faq-title">
          {FAQ.title}
        </h2>
        <FaqAccordion items={items} moreLabel={FAQ_PAGE.learnMore} />
        <a className="faq-see-more" href={withBase(FAQ.seeMore.href)}>
          {FAQ.seeMore.label} <ArrowUpRight size={24} strokeWidth={1.5} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

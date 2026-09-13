import { ArrowUpRight } from 'lucide-react';
import { withBase } from '@/lib/paths';
import { FAQ_ITEMS } from '@/lib/faq';
import FaqAccordion from '@/components/landing/FaqAccordion';

/* The home page's FAQ: the general questions, and a link to the full page. */
export default function Faq() {
  const items = FAQ_ITEMS.filter((item) => item.topic === 'General');
  return (
    <section className="faq" aria-labelledby="faq-title">
      <div className="wrap">
        <h2 className="faq-title" id="faq-title">FAQ</h2>
        <FaqAccordion items={items} />
        <a className="faq-see-more" href={withBase('/faq/')}>
          See More <ArrowUpRight size={24} strokeWidth={1.5} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

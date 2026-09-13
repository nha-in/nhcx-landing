'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { withBase } from '@/lib/paths';
import type { FaqItem } from '@/lib/faq';

/*
 * The question-and-answer accordion in the design's style: one answer open
 * at a time, the first open to begin with. Shared by the home page's FAQ
 * section and the FAQ page, which renders one per topic.
 */
export default function FaqAccordion({ items, idPrefix = 'faq', openFirst = true }: { items: FaqItem[]; idPrefix?: string; openFirst?: boolean }) {
  const [open, setOpen] = useState<number | null>(openFirst ? 0 : null);

  return (
    <ul className="faq-list">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${idPrefix}-panel-${i}`;
        return (
          <li className={isOpen ? 'faq-item is-open' : 'faq-item'} key={item.q}>
            <button type="button" className="faq-q" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpen(isOpen ? null : i)}>
              <span>{item.q}</span>
              {isOpen ? <Minus size={24} strokeWidth={1.5} aria-hidden="true" /> : <Plus size={24} strokeWidth={1.5} aria-hidden="true" />}
            </button>
            <div className="faq-a" id={panelId} hidden={!isOpen}>
              <p>{item.a}</p>
              {item.more && (
                <a className="faq-more" href={withBase(item.more)}>Learn More  →</a>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

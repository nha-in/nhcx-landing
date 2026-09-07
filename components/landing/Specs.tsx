import type { HomeCopy } from '@/lib/site-copy';
import { withBase } from '@/lib/paths';

/**
 * "Specifications and policies" — the documents that govern the exchange.
 *
 * Every one of them is reproduced in the documentation corpus on this site, so
 * each row leads there first: `doc` is the chapter that covers the document,
 * and the published original stays one click away as the source. A reader who
 * wants the text gets a searchable page with the assistant beside it; a reader
 * who needs to cite the authority still has the link to nhcx.abdm.gov.in.
 */
export default function Specs({ copy }: { copy: HomeCopy['specs'] }) {
  return (
    <section id="specs" className="lp-specs" aria-labelledby="specs-title">
      <div className="lp-wrap">
        <p className="lp-eyebrow" data-reveal="">
          {copy.eyebrow}
        </p>
        <h2 id="specs-title" data-reveal="" data-delay="60">
          {copy.title}
        </h2>
        <p className="lp-specs-lede" data-reveal="" data-delay="80">
          {copy.lede}
        </p>
        <div className="lp-specs-grid">
          {copy.groups.map((g, i) => (
            <div key={g.title} className="lp-specs-col" data-reveal="" data-delay={String(100 + i * 60)}>
              <h3>{g.title}</h3>
              <ul>
                {g.items.map((item) => (
                  <li key={item.label}>
                    <a href={withBase(item.href)}>{item.label}</a>
                    {item.note && <span>{item.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from 'next';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import FaqAccordion from '@/components/landing/FaqAccordion';
import { FAQ_PAGE, faqTopics } from '@/lib/faq';

export const metadata: Metadata = {
  title: FAQ_PAGE.meta.title,
  description: FAQ_PAGE.meta.description,
};

/* The full FAQ: every question, grouped by topic, one accordion per group. */
export default function FaqPage() {
  const groups = faqTopics();
  return (
    <>
      <Header current="/faq/" />
      <main>
        <section className="faq faq-page" aria-labelledby="faq-title">
          <div className="wrap">
            <div className="faq-page-head">
              <h1 className="faq-title" id="faq-title">
                {FAQ_PAGE.title}
              </h1>
              <p className="faq-page-lede">{FAQ_PAGE.lede}</p>
              <nav className="faq-topics" aria-label={FAQ_PAGE.topicsLabel}>
                {groups.map((g) => (
                  <a key={g.topic} href={`#${slug(g.topic)}`}>{g.topic}</a>
                ))}
              </nav>
            </div>
            {groups.map((g, i) => (
              <section className="faq-group" id={slug(g.topic)} key={g.topic} aria-labelledby={`${slug(g.topic)}-title`}>
                <h2 className="faq-topic" id={`${slug(g.topic)}-title`}>{g.topic}</h2>
                <FaqAccordion items={g.items} moreLabel={FAQ_PAGE.learnMore} idPrefix={`faq-${i}`} openFirst={i === 0} />
              </section>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

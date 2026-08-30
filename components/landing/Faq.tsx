import type { ElementsQa } from '@/lib/content';
import { docsHref } from '@/lib/links';

/** Items grouped by topic, in first-seen order; untagged items go under "General". */
function groupByTopic(items: ElementsQa[]): Array<{ topic: string; items: ElementsQa[] }> {
  const groups: Array<{ topic: string; items: ElementsQa[] }> = [];
  for (const item of items) {
    const topic = item.topic?.trim() || 'General';
    const group = groups.find((g) => g.topic === topic);
    if (group) group.items.push(item);
    else groups.push({ topic, items: [item] });
  }
  return groups;
}

/** The FAQ: the CMS questions (grouped by topic) in the accordion style of the design. */
export default function Faq({ title, items }: { title: string; items: ElementsQa[] }) {
  const groups = groupByTopic(items);
  let n = 0;
  return (
    <section id="faq" className="lp-faq" aria-labelledby="faq-title">
      <div className="lp-wrap">
        <h2 id="faq-title" data-reveal="">
          {title}
        </h2>
        <div className="lp-faq-groups">
          {groups.map((group) => (
            <div key={group.topic} data-reveal="" data-delay="60">
              {groups.length > 1 && <div className="lp-faq-topic">{group.topic}</div>}
              <div className="lp-acc">
                {group.items.map((item) => {
                  const docs = docsHref(item.docs);
                  const first = n++ === 0;
                  return (
                    <details key={item.question} open={first}>
                      <summary>{item.question}</summary>
                      <div className="lp-acc-body">
                        <div>
                          <p>{item.answer}</p>
                          {docs ? (
                            <a href={docs} className="faq-docs">
                              Read chapter {item.docs} in the documentation →
                            </a>
                          ) : (
                            <span style={{ display: 'block', height: 18 }} />
                          )}
                        </div>
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

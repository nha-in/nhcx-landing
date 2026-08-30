'use client';

import { useMemo, useState } from 'react';
import { withBase } from '@/lib/paths';

type NewsItem = {
  date: string;
  tag: string;
  tone?: string;
  title: string;
  body?: string;
  meta?: string;
  url?: string;
};

const ALL = 'All';

export default function NewsFeed({ items }: { items: unknown[] }) {
  const list = items as NewsItem[];
  const [tag, setTag] = useState(ALL);

  const tags = useMemo(() => [ALL, ...Array.from(new Set(list.map((n) => n.tag)))], [list]);
  const visible = tag === ALL ? list : list.filter((n) => n.tag === tag);

  return (
    <div className="news-list">
      <div className="news-filters">
        {tags.map((t) => (
          <button key={t} type="button" className={`chip-btn${t === tag ? ' on' : ''}`} onClick={() => setTag(t)}>
            {t}
          </button>
        ))}
      </div>
      {visible.map((item) => (
        <a key={item.title} href={withBase(item.url ?? '#feed')} className="news-row">
          <span className="news-row-side">
            <span className="news-date">{item.date}</span>
            <span className={`news-tag ${item.tone === 'brand' ? 'brand' : 'muted'}`}>{item.tag}</span>
          </span>
          <span className="news-row-main">
            <span className="news-row-title">{item.title}</span>
            <span className="news-row-body">{item.body}</span>
            <span className="news-row-meta">{item.meta}</span>
          </span>
        </a>
      ))}
    </div>
  );
}

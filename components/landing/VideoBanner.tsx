import { withBase } from '@/lib/paths';
import { VIDEO } from '@/lib/home-copy';

export default function VideoBanner() {
  return (
    <section className="video" aria-label={VIDEO.ariaLabel}>
      <a className="video-card" href={withBase(VIDEO.href)}>
        <img src={withBase('/assets/video-banner.jpg')} alt={VIDEO.imageAlt} />
      </a>
      <p className="video-caption">{VIDEO.caption}</p>
    </section>
  );
}

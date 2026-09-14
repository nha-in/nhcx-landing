import { withBase } from '@/lib/paths';
import { HEADER } from '@/lib/site-copy';

/** `current` is the path of the page being shown, for the nav underline. */
export default function Header({ current = '/' }: { current?: string }) {
  return (
    <header className="hdr">
      <div className="hdr-brand">
        <a className="hdr-logo" href={withBase('/')} aria-label={HEADER.logoLabel}>
          <img src={withBase('/assets/brand/nha-logo.png')} alt={HEADER.nhaAlt} />
          <img src={withBase('/assets/brand/abdm-logo.svg')} alt={HEADER.abdmAlt} />
        </a>
      </div>
      <nav className="hdr-nav" aria-label={HEADER.navLabel}>
        {HEADER.nav.map((item) => (
          <a
            key={item.label}
            className={`hdr-link${item.href === current ? ' is-current' : ''}${item.glow ? ' is-glow' : ''}`}
            href={withBase(item.href)}
            aria-current={item.href === current ? 'page' : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

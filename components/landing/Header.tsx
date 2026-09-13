import { withBase } from '@/lib/paths';

const NAV: Array<{ label: string; href: string; glow?: boolean }> = [
  { label: 'Home', href: '/' },
  { label: 'PMJAY', href: '/pmjay/' },
  { label: 'DevTools', href: '/devtools/' },
  { label: 'AI Skill', href: '/skill/', glow: true },
  { label: 'Links', href: '/links/' },
];

/** `current` is the path of the page being shown, for the nav underline. */
export default function Header({ current = '/' }: { current?: string }) {
  return (
    <header className="hdr">
      <div className="hdr-brand">
        <a className="hdr-mark" href={withBase('/')} aria-label="NHCX home">
          <img src={withBase('/assets/hcx-logo.png')} alt="HCX" />
        </a>
        <a className="hdr-logo" href={withBase('/')} aria-label="National Health Authority — ABDM NHCX">
          <img src={withBase('/assets/logo-header.png')} alt="National Health Authority, Ayushman Bharat Digital Mission" />
        </a>
      </div>
      <nav className="hdr-nav" aria-label="Primary">
        {NAV.map((item) => (
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

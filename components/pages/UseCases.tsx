/**
 * Use-case cards, one grid per tool on the DevTools page.
 *
 * The sections above each grid say what a tool *is*; this says what someone
 * picks it up to do, which is the question a reader arrives with. Icons are
 * inline strokes on `currentColor` rather than a font or a sprite: there are
 * eight of them, they inherit the card's accent, and nothing has to load.
 *
 * The accent itself is the grid's business, not this component's: CSS gives
 * the first, second and third card of any row their own colour, so a caller
 * never picks one and the two grids on a page stay in step.
 */

export type IconName = 'book' | 'braces' | 'play' | 'search' | 'plug' | 'rocket' | 'layers' | 'ledger';

export type UseCase = { icon: IconName; title: string; text: string };

/**
 * Geometry from Feather and Lucide (MIT), drawn on the same 24×24 grid at the
 * same stroke weight, so the eight marks look like one set.
 */
const PATHS: Record<IconName, React.ReactNode> = {
  book: (
    <>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </>
  ),
  braces: (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ),
  plug: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  rocket: (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91 0z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </>
  ),
  layers: (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>
  ),
  ledger: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </>
  ),
};

function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="uc-icon"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

export default function UseCases({ title, items }: { title: string; items: UseCase[] }) {
  return (
    <div className="blk">
      <h3 className="blk-title">{title}</h3>
      <ul className="uc-grid">
        {items.map((item) => (
          <li key={item.title} className="uc-card">
            <span className="uc-head">
              <span className="uc-mark">
                <Icon name={item.icon} />
              </span>
              <b>{item.title}</b>
            </span>
            <span className="uc-text">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

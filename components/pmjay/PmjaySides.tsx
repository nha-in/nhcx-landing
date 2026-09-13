import { SIDES } from '@/lib/pmjay-copy';
import { IconCheck, SidesArt } from '@/components/pmjay/art';

/*
 * What each side gets: the points for hospitals beside the routing diagram
 * (one HMIS reaching PM-JAY, a state scheme and a private payer through
 * NHCX), which sits in a card like the DevTools page's panels.
 */
export default function PmjaySides() {
  return (
    <section className="tl-section pj-sides" aria-labelledby="pj-sides-title">
      <div className="wrap">
        <div className="tl-head">
          <h2 className="tl-h2" id="pj-sides-title">{SIDES.title}</h2>
        </div>
        <div className="pj-side">
          <div>
            <h3>{SIDES.hospitalsTitle}</h3>
            <ul className="pj-points">
              {SIDES.hospitals.map((t) => (
                <li key={t}>
                  <IconCheck />
                  <p>{t}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="pj-side-art">
            <SidesArt {...SIDES.art} />
          </div>
        </div>
      </div>
    </section>
  );
}

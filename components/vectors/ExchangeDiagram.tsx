import type { Chip } from '@/lib/content';
import { iconFor } from './nodeIcons';

export type ExchangeDiagramProps = {
  providers: Chip[];
  payers: Chip[];
  providersLabel: string;
  payersLabel: string;
  hubTitle: string;
  hubTag: string;
};

/**
 * The exchange as a still, structured diagram: providers on the left, the
 * NHCX hub in the middle, payers on the right, with a two-way link on each
 * side. Plain markup with inline icons — it reflows to a single column on a
 * narrow screen and carries no motion.
 */
function Column({ label, chips, fallback, side }: { label: string; chips: Chip[]; fallback: string; side: 'left' | 'right' }) {
  return (
    <div className={`xd-col xd-${side}`}>
      <p className="xd-label">{label}</p>
      <ul className="xd-nodes">
        {chips.map((chip) => (
          <li key={chip.label} className="xd-node">
            <svg className="xd-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              {iconFor(chip, fallback)}
            </svg>
            <span>{chip.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Link({ up, down }: { up: string; down: string }) {
  return (
    <div className="xd-link" aria-hidden="true">
      <span className="xd-link-label">{up}</span>
      <svg className="xd-arrows" viewBox="0 0 64 28" focusable="false">
        <path d="M4 8h52M50 3l6 5-6 5" />
        <path d="M60 20H8M14 15l-6 5 6 5" />
      </svg>
      <span className="xd-link-label">{down}</span>
    </div>
  );
}

export default function ExchangeDiagram({ providers, payers, providersLabel, payersLabel, hubTitle, hubTag }: ExchangeDiagramProps) {
  return (
    <div className="xd" role="img" aria-label={`${providersLabel.toLowerCase()} exchange claims with ${payersLabel.toLowerCase()} through ${hubTitle}`}>
      <Column label={providersLabel} chips={providers} fallback="hospital" side="left" />
      <Link up="requests" down="responses" />
      <div className="xd-hub">
        <span className="xd-hub-title">{hubTitle}</span>
        {hubTag && <span className="xd-hub-tag">{hubTag}</span>}
      </div>
      <Link up="forwarded" down="decisions" />
      <Column label={payersLabel} chips={payers} fallback="shield" side="right" />
    </div>
  );
}

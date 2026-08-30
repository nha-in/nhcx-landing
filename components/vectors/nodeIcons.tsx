import type { ReactElement } from 'react';

/**
 * 24×24 stroke icons for the exchange participants.
 *
 * They carry no colour of their own — the stroke is inherited from the `--hue`
 * custom property set on the surrounding node group, so one set serves every
 * palette entry.
 */
export const NODE_ICONS: Record<string, ReactElement> = {
  /* a hospital: block building with a cross */
  hospital: (
    <>
      <path d="M3.5 21h17" />
      <path d="M6 21V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v15" />
      <path d="M12 8.5v6M9 11.5h6" />
    </>
  ),
  /* a chain of sites: two buildings of different heights */
  buildings: (
    <>
      <path d="M2.5 21h19" />
      <path d="M5.5 21V7l6-3.5V21" />
      <path d="M11.5 21V11h7v10" />
      <path d="M8.2 9h.01M8.2 13h.01M8.2 17h.01M14.8 15h.01M14.8 18h.01" />
    </>
  ),
  /* residential care: a bed */
  bed: (
    <>
      <path d="M3 20.5V9" />
      <path d="M3 13.5h11.5a5 5 0 0 1 5 5v2" />
      <path d="M3 20.5h17" />
      <circle cx="7.6" cy="9.8" r="2.2" />
    </>
  ),
  /* diagnostics: a lab flask */
  lab: (
    <>
      <path d="M10 3v6.6l-5 8.2A2 2 0 0 0 6.7 21h10.6a2 2 0 0 0 1.7-3.2L14 9.6V3" />
      <path d="M8.6 3h6.8" />
      <path d="M7.4 14.5h9.2" />
    </>
  ),
  /* an insurer: shield with a check */
  shield: (
    <>
      <path d="M12 3l7.5 3v5.9c0 4.4-3.1 8.1-7.5 9.4-4.4-1.3-7.5-5-7.5-9.4V6z" />
      <path d="M9.2 12.1l2.2 2.2 4-4.4" />
    </>
  ),
  /* a TPA sitting between two parties: opposing arrows */
  exchange: (
    <>
      <path d="M3.5 8.8h14" />
      <path d="M14 5.3l3.5 3.5L14 12.3" />
      <path d="M20.5 15.2h-14" />
      <path d="M10 11.7L6.5 15.2 10 18.7" />
    </>
  ),
  /* a state body: a pedimented civic building */
  institution: (
    <>
      <path d="M3 21h18" />
      <path d="M12 3l9 5.2H3z" />
      <path d="M6.2 11.4v6.2M10.1 11.4v6.2M13.9 11.4v6.2M17.8 11.4v6.2" />
      <path d="M4.4 17.6h15.2" />
    </>
  ),
  /* a national scheme: an awarded seal */
  seal: (
    <>
      <circle cx="12" cy="9.3" r="6" />
      <path d="M9.6 8.7l1.8 1.8 3.3-3.6" />
      <path d="M8.5 14.4L7.2 21l4.8-2.2L16.8 21l-1.3-6.6" />
    </>
  ),
};

type Labelled = { label: string; icon?: string };

const KEYWORD_ICONS: [RegExp, string][] = [
  [/hospital/, 'hospital'],
  [/chain|network|group|multi/, 'buildings'],
  [/nursing|clinic|home|care/, 'bed'],
  [/diagnostic|lab|patholog|imaging|radiolog|centre|center/, 'lab'],
  [/insur/, 'shield'],
  [/tpa|third.?party|administrat|broker/, 'exchange'],
  [/state|agency|authority|regulator|nha/, 'institution'],
  [/scheme|government|pmjay|ayushman|ministry/, 'seal'],
];

/**
 * Prefers the icon named in the CMS, falls back to matching the label, and
 * finally to the side's default — so content authored before the field existed
 * still gets something sensible.
 */
export function iconFor(chip: Labelled, fallback: string): ReactElement {
  if (chip.icon && NODE_ICONS[chip.icon]) return NODE_ICONS[chip.icon];
  const label = chip.label.toLowerCase();
  for (const [pattern, name] of KEYWORD_ICONS) {
    if (pattern.test(label)) return NODE_ICONS[name];
  }
  return NODE_ICONS[fallback];
}

import type { PmjayIcon } from '@/lib/pmjay-copy';
import { IconBiometric, IconCashless, IconCover, IconHmis, IconStates } from '@/components/pmjay/art';

/* The page's line icons, by the names the copy file uses. */
const ICONS: Record<PmjayIcon, () => React.JSX.Element> = {
  cover: IconCover,
  cashless: IconCashless,
  states: IconStates,
  hmis: IconHmis,
  biometric: IconBiometric,
  // A settled claim shares the cashless mark: a cleared bill.
  settle: IconCashless,
};

export default function PmjayGlyph({ name }: { name: PmjayIcon }) {
  const Icon = ICONS[name];
  return <Icon />;
}

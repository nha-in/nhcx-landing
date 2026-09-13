import type { PmjayIcon } from '@/lib/pmjay-copy';
import { IconBiometric, IconCashless, IconCover, IconHmis, IconSettle, IconStates } from '@/components/pmjay/art';

/* The page's line icons, by the names the copy file uses. */
const ICONS: Record<PmjayIcon, () => React.JSX.Element> = {
  cover: IconCover,
  cashless: IconCashless,
  states: IconStates,
  hmis: IconHmis,
  biometric: IconBiometric,
  settle: IconSettle,
};

export default function PmjayGlyph({ name }: { name: PmjayIcon }) {
  const Icon = ICONS[name];
  return <Icon />;
}

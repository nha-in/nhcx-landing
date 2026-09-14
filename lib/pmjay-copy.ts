import section from '@/content/site.yaml?pmjay';
import type { Link, Meta } from '@/lib/site-copy';

/*
 * Every word and link on the PM-JAY page. They live in content/site.yaml
 * (`pmjay`); this file gives them their types.
 */

export type PmjayIcon = 'cover' | 'cashless' | 'states' | 'hmis' | 'biometric' | 'settle';

export type TravelIcon = 'diagnosis' | 'procedure' | 'drugs' | 'bill' | 'sign' | 'lock' | 'route' | 'delivered' | 'sent' | 'decision' | 'amount' | 'settle';
export type TravelItem = { title: string; detail: string; icon?: TravelIcon; resource?: string };
/* What the window beside the moves plays for one move. `kind` picks the
   scene: the record gathered into a bundle, the bundle's trip across the
   exchange, the payer's checks and approval, the payment arriving. Each
   scene runs its four items one after another, then shows `ready`. */
export type TravelWindow = {
  kind: 'collect' | 'travel' | 'approve' | 'payment';
  heading?: string;
  subheading?: string;
  amount?: number;
  nodes?: string[];
  stampLabel?: string;
  stamp?: string;
  items: TravelItem[];
  ready: { title: string; summary: string };
};
type TravelStep = { title: string; text: string; window: TravelWindow };

type PmjayContent = {
  meta: Meta;
  hero: { kicker: string; titleLead: string; titleAccent: string; lede: string; knowMore: Link; about: Link; emblemAlt: string };
  facts: { title: string; items: Array<{ icon: PmjayIcon; lead: string; text: string; link: string; href: string }> };
  benefits: {
    title: string;
    items: Array<{ icon: PmjayIcon; title: string; text: string }>;
    /* The Ayushman card: its front as issued, and its back (cover used). */
    card: {
      cover: number;
      claimed: number;
      hintFront: string;
      hintBack: string;
      backLabel: string;
      note: string;
      ariaLabel: string;
      band: string;
      rows: string[];
      coverLine: string;
      coverNote: string;
      state: string;
      ids: string[];
      foot: string[];
      remainingOf: string;
      claimedLabel: string;
      staysLabel: string;
      stays: number;
      paidLabel: string;
      paid: string;
    };
  };
  changed: { title: string; sub: string; items: Array<{ icon: PmjayIcon; title: string; text: string }> };
  travels: { titleLead: string; titleAccent: string; sub: string; footLabel: string; steps: TravelStep[] };
  sides: { title: string; hospitalsTitle: string; art: { hospital: string; hub: string; hubNote: string; payers: string[] }; hospitals: string[] };
  cta: { title: string; sub: string; label: string; href: string };
};

export const { meta: META, hero: HERO, facts: FACTS, benefits: BENEFITS, changed: CHANGED, travels: TRAVELS, sides: SIDES, cta: CTA } = section as PmjayContent;

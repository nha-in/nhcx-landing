import section from '@/content/site.yaml?site';

/*
 * The words every page shares: the browser tab's title and description, the
 * header, the footer and the Copy button. They live in content/site.yaml
 * (`site`); this file gives them their types, and the types the other copy
 * modules share.
 */

export type Meta = { title: string; description: string };
export type Link = { label: string; href: string };

type SiteContent = {
  meta: Meta;
  header: { logoLabel: string; nhaAlt: string; abdmAlt: string; navLabel: string; nav: Array<Link & { glow?: boolean }> };
  footer: {
    managedBy: { label: string; value: string };
    email: { label: string; address: string };
    address: { label: string; value: string };
    tollFree: { label: string; value: string };
    updatedLabel: string;
    linksTitle: string;
    links: Link[];
    policiesTitle: string;
    policies: Link[];
    copyright: string;
    backToTop: string;
  };
  copyButton: { copy: string; copied: string; failed: string };
};

export const { meta: META, header: HEADER, footer: FOOTER, copyButton: COPY_BUTTON } = section as SiteContent;

import section from '@/content/site.yaml?links';
import type { Meta } from '@/lib/site-copy';

/*
 * The Links page: its heading, and the list of specifications, policies and
 * guidelines, and sandbox and developer resources, each opening where NHA or
 * ABDM publishes it. They live in content/site.yaml (`links`); this file
 * gives them their types.
 */

type LinkItem = { title: string; description?: string; url: string; type: string };
type LinkGroup = { key: string; title: string; description?: string; items: LinkItem[] };

type LinksContent = { meta: Meta; hero: { kicker: string; titleLead: string; titleAccent: string; lede: string }; groups: LinkGroup[] };

const c = section as LinksContent;

export const LINK_GROUPS = c.groups;
export const LINKS_PAGE = { meta: c.meta, hero: c.hero };

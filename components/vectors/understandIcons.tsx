import type { ReactElement } from 'react';
import { NODE_ICONS } from './nodeIcons';

/**
 * 24×24 stroke icons for the "Understand NHCX" cards.
 *
 * Like NODE_ICONS they carry no colour of their own — the stroke is inherited,
 * so one set serves the card face and anywhere else they are reused. The three
 * that describe the same things the network diagram describes are that set's,
 * imported rather than redrawn: a provider is the same hospital on both.
 */
export const UNDERSTAND_ICONS: Record<string, ReactElement> = {
  provider: NODE_ICONS.hospital,
  payer: NODE_ICONS.shield,
  regulator: NODE_ICONS.institution,

  /* a beneficiary: one person */
  person: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20.5a7.2 7.2 0 0 1 14.4 0" />
    </>
  ),
  /* eligibility: a card checked */
  eligible: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 10h18" />
      <path d="M8.4 14.6l2 2 4-4.2" />
    </>
  ),
  /* pre-authorisation: approval stamped before the fact */
  stamp: (
    <>
      <path d="M6.5 20.5h11" />
      <path d="M8 17.2v-2.4a4 4 0 0 1 1.4-3l.6-.5a2.6 2.6 0 0 0 .9-2V6.6a2.1 2.1 0 1 1 4.2 0v2.7a2.6 2.6 0 0 0 .9 2l.6.5a4 4 0 0 1 1.4 3v2.4z" />
      <path d="M8 17.2H5.5" />
    </>
  ),
  /* the claim: a document of lines */
  document: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M8.6 12.5h6.8M8.6 16h4.6" />
    </>
  ),
  /* payment notice: a receipt with a rupee on it */
  receipt: (
    <>
      <path d="M5.5 3.5h13v17l-2.2-1.6-2.2 1.6-2.1-1.6-2.2 1.6-2.1-1.6-2.2 1.6z" />
      <path d="M9.4 7.5h5.2M9.4 10.2h5.2" />
      <path d="M9.4 7.5c2.6 0 2.6 4 0 4h1.2l3 4" />
    </>
  ),
  /* communication: a question and an answer */
  messages: (
    <>
      <path d="M3.5 6.5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H8l-3.4 2.6v-2.6a2 2 0 0 1-1.1-1.8z" />
      <path d="M18 9.5h.5a2 2 0 0 1 2 2v4a2 2 0 0 1-1.1 1.8v2.6L16 17.5h-4" />
    </>
  ),
  /* structured, not scanned: data in braces rather than on paper */
  braces: (
    <>
      <path d="M9 3.5H7.8a2.3 2.3 0 0 0-2.3 2.3v3.3a2.4 2.4 0 0 1-2 2.4 2.4 2.4 0 0 1 2 2.4v3.3a2.3 2.3 0 0 0 2.3 2.3H9" />
      <path d="M15 3.5h1.2a2.3 2.3 0 0 1 2.3 2.3v3.3a2.4 2.4 0 0 0 2 2.4 2.4 2.4 0 0 0-2 2.4v3.3a2.3 2.3 0 0 1-2.3 2.3H15" />
    </>
  ),
  /* lower cost and time: the line comes down */
  trend: (
    <>
      <path d="M3.5 5v15.5H20" />
      <path d="M7 9.5l3.6 3.6 3-3 4.4 4.4" />
      <path d="M18 10.5v4h-4" />
    </>
  ),
  /* records stay put: the store is yours and it is locked */
  vault: (
    <>
      <path d="M3.5 6.6c0-1.7 3.8-3.1 8.5-3.1s8.5 1.4 8.5 3.1-3.8 3.1-8.5 3.1-8.5-1.4-8.5-3.1z" />
      <path d="M3.5 6.6v10.8c0 1.7 3.8 3.1 8.5 3.1 1.6 0 3.1-.2 4.4-.5" />
      <path d="M18.4 13.4v-1.2a1.8 1.8 0 1 1 3.6 0v1.2" />
      <rect x="17.6" y="13.4" width="5.2" height="4.4" rx="1" />
    </>
  ),
  /* open and non-repudiable: signed, and the signature checks out */
  signed: (
    <>
      <path d="M12 3l7.5 3v5.9c0 4.4-3.1 8.1-7.5 9.4-4.4-1.3-7.5-5-7.5-9.4V6z" />
      <path d="M8.2 12.4c1.4 0 2-1 2.6-2.2.6 1.9 1 3.6 1.6 3.6.5 0 .8-.9 1.1-1.7.4 1 .8 1.6 1.4 1.6h1" />
    </>
  ),
};

import type { Metadata } from 'next';
import { withBase } from '@/lib/paths';
import '@/styles/globals.css';
import '@/styles/landing.css';
import '@/styles/pmjay.css';
import '@/styles/tools.css';

export const metadata: Metadata = {
  title: 'National Health Claims Exchange',
  description:
    'NHCX brings India’s healthcare ecosystem together with standardized, interoperable claim data — enabling seamless, transparent, and efficient exchange across systems.',
  // The HCX mark in every tab; the PM-JAY page sets its own emblem.
  icons: { icon: withBase('/assets/hcx-icon.png') },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body id="top">{children}</body>
    </html>
  );
}

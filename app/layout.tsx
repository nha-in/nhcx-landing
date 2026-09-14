import type { Metadata } from 'next';
import { withBase } from '@/lib/paths';
import { META } from '@/lib/site-copy';
import '@/styles/globals.css';
import '@/styles/landing.css';
import '@/styles/pmjay.css';
import '@/styles/tools.css';

export const metadata: Metadata = {
  title: META.title,
  description: META.description,
  // The PM-JAY emblem in every tab; the PNG is for browsers without SVG favicons.
  icons: {
    icon: [
      { url: withBase('/assets/animation/pmjay.svg'), type: 'image/svg+xml' },
      { url: withBase('/assets/brand/pmjay-icon-192.png'), type: 'image/png', sizes: '192x192' },
    ],
    apple: withBase('/assets/brand/pmjay-apple-touch.png'),
  },
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

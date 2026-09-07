import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import '@/styles/globals.css';
import { withBase } from '@/lib/paths';
import ThemeEditor from '@/components/ThemeEditor';

export function generateMetadata(): Metadata {
  const { landing } = getContent();
  return {
    title: landing.seo?.metaTitle ?? 'National Health Claim Exchange',
    description: landing.seo?.metaDescription ?? '',
    icons: { icon: withBase('/assets/hcx-favicon.png') },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <ThemeEditor />
      </body>
    </html>
  );
}

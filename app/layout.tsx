import type { Metadata, Viewport } from 'next';
import { course, description, title } from '../lib/course';
import { indexable, siteUrl } from '../lib/site';
import '@fontsource-variable/inter/wght.css';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl ?? 'http://127.0.0.1:3102'),
  ...(siteUrl ? { alternates: { canonical: '/' } } : {}),
  title,
  description,
  robots: { index: indexable, follow: indexable },
  openGraph: { type: 'website', title, description, siteName: course.contact.name, locale: 'en_IN', ...(siteUrl ? { url: siteUrl } : {}) },
  twitter: { card: 'summary_large_image', title, description },
  referrer: 'strict-origin-when-cross-origin',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN"><body>{children}</body></html>;
}

import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
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
  return (
    <html lang="en-IN" data-scroll-behavior="smooth">
      <body>
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s) {
            if (f.fbq) return;
            n = f.fbq = function() {
              n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = true;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e);
            t.async = true;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
          }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1320569916265124');
          fbq('track', 'PageView');
        `}</Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element -- Meta requires a direct tracking request. */}
          <img
            alt=""
            height={1}
            width={1}
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1320569916265124&ev=PageView&noscript=1"
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}

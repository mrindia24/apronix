import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastProvider } from '@/src/components/ui/toast';
import { BootOverlay } from '@/src/components/site/boot-overlay';
import { SITE_URL, organizationSchema, websiteSchema } from '@/src/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Apronix Tech — Social Media, Shopify & WordPress Development',
    template: '%s',
  },
  description:
    'Apronix Tech helps ambitious businesses grow through strategic social media management and high-performing Shopify and WordPress websites.',
  applicationName: 'Apronix Tech',
  authors: [{ name: 'Apronix Tech' }],
  creator: 'Apronix Tech',
  icons: {
    icon: [{ url: '/brand/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/brand/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.webmanifest',
  formatDetection: { telephone: false, address: false, email: false },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#08090B',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Root layout: document shell only. The public site chrome lives in
 * app/(site)/layout.tsx and the admin chrome in app/(admin)/admin/layout.tsx, so
 * the marketing header never appears inside the dashboard or the login screen.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/manrope-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          // Static, developer-authored structured data — no user input is interpolated.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema(), websiteSchema()]),
          }}
        />
      </head>
      <body className="min-h-dvh bg-ink">
        <ToastProvider>
          <BootOverlay />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

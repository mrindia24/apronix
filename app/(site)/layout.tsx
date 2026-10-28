import { Header } from '@/src/components/site/header';
import { Footer } from '@/src/components/site/footer';
import { BackToTop, ConsentAnalytics } from '@/src/components/site/client-bits';
import { ChatWidget } from '@/src/components/site/chat-widget';
import { publicEnv } from '@/src/lib/env';

/** Public marketing shell: header, footer, back-to-top and consent-gated analytics. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" className="pt-[var(--header-h)]">
        {children}
      </main>
      <Footer />
      <BackToTop />
      <ChatWidget />
      <ConsentAnalytics
        measurementId={publicEnv.analyticsId}
        plausibleDomain={publicEnv.plausibleDomain}
      />
    </>
  );
}

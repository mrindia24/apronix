import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import { SERVICE_NAV } from '@/src/lib/constants';
import { Header } from '@/src/components/site/header';
import { Footer } from '@/src/components/site/footer';

export const metadata = {
  title: 'Page not found — Apronix Tech',
  description: 'The page you were looking for does not exist or has moved.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
    <Header />
    <main id="main" className="pt-[var(--header-h)]">
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" aria-hidden="true" />
      <div className="shell relative flex min-h-[62vh] flex-col items-start justify-center py-20">
        <p className="eyebrow">
          <span className="dot" aria-hidden="true" />
          Error 404
        </p>
        <h1 className="mt-5 max-w-2xl text-display-lg text-white">
          This page took a wrong turn.
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-mute-onDark">
          The link may be out of date, or the page has moved. Here are a few places that are definitely
          where they should be.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 text-[14px] font-semibold text-white transition hover:bg-brand-dark"
          >
            Back to home
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-[14px] font-semibold text-white transition hover:bg-white/[0.07]"
          >
            Contact us
          </Link>
        </div>

        <div className="mt-12 w-full max-w-2xl border-t border-white/10 pt-6">
          <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-white/60">
            <Compass size={13} aria-hidden="true" />
            Popular destinations
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {[{ label: 'Our work', href: '/work' }, { label: 'Blog', href: '/blog' }, ...SERVICE_NAV.map(s => ({ label: s.label, href: s.href }))].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-ink-soft px-4 py-3 text-[13.5px] text-white/80 transition hover:border-white/20 hover:text-white"
                >
                  {item.label}
                  <span aria-hidden="true" className="text-white/30">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    </main>
    <Footer />
    </>
  );
}

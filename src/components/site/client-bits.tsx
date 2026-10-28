'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 900);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed bottom-[92px] right-5 z-[60] grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-ink-soft/90 text-white shadow-lg backdrop-blur transition-all duration-300 hover:border-brand hover:bg-brand sm:bottom-[104px] sm:right-6',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      <ArrowUp size={17} />
    </button>
  );
}

/**
 * Consent-aware analytics loader.
 * Nothing is loaded until the visitor accepts — and the banner is only shown when
 * an analytics integration is actually configured.
 */
export function ConsentAnalytics({
  measurementId,
  plausibleDomain,
}: {
  measurementId: string;
  plausibleDomain: string;
}) {
  const [consent, setConsent] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const configured = Boolean(measurementId || plausibleDomain);

  useEffect(() => {
    const stored = window.localStorage.getItem('apronix-consent');
    if (stored === 'granted' || stored === 'denied') setConsent(stored);
  }, []);

  useEffect(() => {
    if (consent !== 'granted') return;
    if (measurementId && !document.getElementById('ga4-script')) {
      const script = document.createElement('script');
      script.id = 'ga4-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);
      const inline = document.createElement('script');
      inline.id = 'ga4-init';
      inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${measurementId}',{anonymize_ip:true});`;
      document.head.appendChild(inline);
    }
    if (plausibleDomain && !document.getElementById('plausible-script')) {
      const script = document.createElement('script');
      script.id = 'plausible-script';
      script.defer = true;
      script.dataset.domain = plausibleDomain;
      script.src = 'https://plausible.io/js/script.js';
      document.head.appendChild(script);
    }
  }, [consent, measurementId, plausibleDomain]);

  if (!configured || consent !== 'unknown') return null;

  const decide = (value: 'granted' | 'denied') => {
    window.localStorage.setItem('apronix-consent', value);
    setConsent(value);
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-[85] mx-auto max-w-3xl rounded-2xl border border-white/12 bg-ink-soft/95 p-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:inset-x-6 sm:bottom-5 sm:flex sm:items-center sm:gap-5 sm:p-5"
    >
      <p className="text-[13px] leading-relaxed text-mute-onDark">
        We use privacy-friendly analytics to understand which pages help visitors. Nothing loads until you
        choose. Read our{' '}
        <Link href="/privacy-policy" className="text-white underline decoration-white/30 underline-offset-2">
          privacy policy
        </Link>
        .
      </p>
      <div className="mt-3 flex flex-none gap-2 sm:mt-0">
        <button
          type="button"
          onClick={() => decide('denied')}
          className="h-9 rounded-full border border-white/20 px-4 text-[12.5px] font-semibold text-white/80 transition hover:bg-white/10"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => decide('granted')}
          className="h-9 rounded-full bg-brand px-4 text-[12.5px] font-semibold text-white transition hover:bg-brand-dark"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

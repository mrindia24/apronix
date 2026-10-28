'use client';

import { useEffect, useState } from 'react';
import { LoadingScreen } from '@/src/components/site/loading-screen';

/**
 * First-paint overlay.
 *
 * Server-rendered inside the root layout so it is visible from the very first
 * byte, which removes the white flash before the app hydrates. It then fades
 * out as soon as the page is interactive — no artificial delay beyond a short
 * minimum so the mark does not just flicker.
 *
 * Safety valves:
 *   - a CSS timer hides it after 2.8s even if this component never hydrates
 *     (JS disabled or a chunk failed to load)
 *   - `prefers-reduced-motion` removes it entirely
 */
const MIN_VISIBLE_MS = 260;

export function BootOverlay() {
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const el = document.getElementById('apronix-boot');
    if (!el) {
      setRemoved(true);
      return;
    }

    const started = performance.now();
    let hideTimer: ReturnType<typeof setTimeout>;

    const fade = () => {
      const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - started));
      hideTimer = setTimeout(() => {
        el.style.transition = 'opacity 320ms ease-out';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        setTimeout(() => setRemoved(true), 340);
      }, wait);
    };

    if (document.readyState === 'complete') {
      fade();
    } else {
      window.addEventListener('load', fade, { once: true });
    }

    // Hard ceiling: never let a stalled resource strand the visitor.
    const ceiling = setTimeout(() => setRemoved(true), 3000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(ceiling);
      window.removeEventListener('load', fade);
    };
  }, []);

  if (removed) return null;
  return <LoadingScreen variant="boot" />;
}

import { cn } from '@/src/lib/utils';

/**
 * Branded loading screen.
 *
 * Rendered in two places:
 *   1. `app/loading.tsx` — the Suspense fallback Next.js shows while a route
 *      segment is being fetched.
 *   2. `app/layout.tsx` — a fixed "boot" overlay painted with the first HTML
 *      bytes, so the user never sees a white flash before hydration.
 *
 * Design notes:
 *   - Pure CSS animation, so it renders correctly before any JS runs.
 *   - `prefers-reduced-motion` swaps the motion for a static mark + hairline
 *     (handled in globals.css).
 *   - The live region is a single visually hidden sentence: the animated parts
 *     are decorative and marked `aria-hidden`, so screen readers hear
 *     "Loading" once rather than a stream of noise.
 */
export function LoadingScreen({ variant = 'route' }: { variant?: 'route' | 'boot' }) {
  const isBoot = variant === 'boot';

  return (
    <div
      id={isBoot ? 'apronix-boot' : undefined}
      role="status"
      aria-live="polite"
      className={cn(
        'relative grid place-items-center overflow-hidden bg-ink',
        isBoot ? 'fixed inset-0 z-[200]' : 'min-h-[72vh] w-full',
      )}
    >
      <span className="sr-only">Loading Apronix Tech</span>

      {/* Ambient backdrop — matches the grid + red wash used on the marketing pages */}
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.35]" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(46% 46% at 50% 46%, rgba(255,48,56,0.16) 0%, rgba(8,9,11,0) 72%)',
        }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center">
        {/* Mark + rotating progress arc */}
        <div className="relative grid h-[104px] w-[104px] place-items-center" aria-hidden="true">
          <span className="loading-glow absolute inset-0 rounded-full" />
          <span className="loading-ring absolute inset-0 rounded-full" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/apronix-mark.png"
            alt=""
            width={56}
            height={56}
            className="loading-mark relative h-14 w-14 object-contain"
            decoding="async"
            fetchPriority="high"
          />
        </div>

        <p
          className="mt-7 text-[15px] font-extrabold uppercase leading-none tracking-[0.22em] text-white"
          aria-hidden="true"
        >
          Apronix
          <span className="ml-2 align-baseline text-[0.72em] font-semibold tracking-[0.3em] text-brand-soft">
            Tech
          </span>
        </p>

        {/* Hairline indeterminate progress line */}
        <div
          className="mt-6 h-px w-[132px] overflow-hidden rounded-full bg-white/12"
          aria-hidden="true"
        >
          <span className="loading-bar block h-px w-1/3 rounded-full bg-brand-bright" />
        </div>
      </div>
    </div>
  );
}

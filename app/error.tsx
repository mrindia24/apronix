'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app-error]', error);
  }, [error]);

  return (
    <div className="shell flex min-h-[60vh] flex-col items-start justify-center py-20">
      <p className="eyebrow">
        <span className="dot" aria-hidden="true" />
        Something went wrong
      </p>
      <h1 className="mt-5 max-w-xl text-display-md text-white">We hit an unexpected error.</h1>
      <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-mute-onDark">
        The page could not be loaded. You can try again — if it keeps happening, please let us know and
        we will fix it.
      </p>
      {error.digest && (
        <p className="mt-3 rounded-lg border border-white/10 bg-ink-soft px-3 py-1.5 font-mono text-[11.5px] text-white/65">
          Reference: {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 text-[14px] font-semibold text-white transition hover:bg-brand-dark"
        >
          <RotateCcw size={15} aria-hidden="true" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-[14px] font-semibold text-white transition hover:bg-white/[0.07]"
        >
          <Home size={15} aria-hidden="true" />
          Back to home
        </Link>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, LogIn } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const data = new FormData(event.currentTarget);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: String(data.get('email') ?? ''),
          password: String(data.get('password') ?? ''),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };

      if (!res.ok || !json.ok) {
        setError(json.message ?? 'Sign in failed. Please try again.');
        setSubmitting(false);
        return;
      }
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Could not reach the server. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-brand/40 bg-brand/[0.08] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-white/90"
        >
          <AlertCircle size={14} className="mt-0.5 flex-none text-brand-soft" aria-hidden="true" />
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-[12.5px] font-medium text-white/80">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="h-11 w-full rounded-xl border border-white/12 bg-ink px-3.5 text-[14px] text-white placeholder:text-white/60 focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-brand/60"
          placeholder="you@apronixtech.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-[12.5px] font-medium text-white/80">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="h-11 w-full rounded-xl border border-white/12 bg-ink px-3.5 text-[14px] text-white placeholder:text-white/60 focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-brand/60"
          placeholder="••••••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-[14px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            Signing in…
          </>
        ) : (
          <>
            <LogIn size={15} aria-hidden="true" />
            Sign in
          </>
        )}
      </button>
    </form>
  );
}

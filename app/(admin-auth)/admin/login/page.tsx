import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/src/lib/auth';
import { LoginForm } from '@/src/components/admin/login-form';
import { Logo } from '@/src/components/site/logo';
import { features } from '@/src/lib/env';

export const metadata: Metadata = {
  title: 'Admin sign in — Apronix Tech',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const user = await getSessionUser();
  if (user) redirect('/admin');

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-16">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,48,56,0.16),transparent_65%)] blur-2xl"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-[400px]">
        <div className="flex justify-center">
          <Logo size="lg" href="/" />
        </div>
        <div className="mt-8 rounded-3xl border border-white/[0.08] bg-ink-soft p-7 shadow-card">
          <h1 className="text-[22px] font-semibold text-white">Sign in</h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-mute-onDark">
            Administrator access only. Sessions expire after 8 hours of inactivity.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
          {!features.email && (
            <p className="mt-6 rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-[11.5px] leading-relaxed text-white/60">
              Email delivery is not configured — enquiry notifications are stored in the dashboard only.
            </p>
          )}
        </div>
        <p className="mt-6 text-center text-[11.5px] text-white/30">
          There is no public sign-up. Administrators are created with{' '}
          <code className="rounded bg-white/[0.07] px-1.5 py-0.5 text-white/60">npm run admin:create</code>.
        </p>
      </div>
    </div>
  );
}

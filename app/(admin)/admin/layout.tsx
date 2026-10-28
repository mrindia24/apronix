import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/src/lib/auth';
import { AdminShell } from '@/src/components/admin/shell';
import { ToastProvider } from '@/src/components/ui/toast';

export const metadata: Metadata = {
  title: 'Admin — Apronix Tech',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * Server-side gate for the whole dashboard. Every /admin page is rendered behind
 * this check regardless of what the UI shows.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  return (
    <ToastProvider>
      <AdminShell user={{ name: user.name, email: user.email, role: user.role }}>{children}</AdminShell>
    </ToastProvider>
  );
}

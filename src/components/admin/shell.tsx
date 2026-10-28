'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Briefcase,
  ChevronRight,
  ExternalLink,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Settings,
  Users,
  X,
  Tag,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Logo } from '@/src/components/site/logo';

const NAV = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Leads', href: '/admin/leads', icon: Users },
  { label: 'Portfolio', href: '/admin/portfolio', icon: Briefcase },
  { label: 'Blog', href: '/admin/blog', icon: FileText },
  { label: 'Services', href: '/admin/services', icon: BarChart3 },
  { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote },
  { label: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
  { label: 'Pricing', href: '/admin/pricing', icon: Tag },
  { label: 'Media', href: '/admin/media', icon: ImageIcon },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const signOut = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  };

  const nav = (
    <nav aria-label="Admin sections" className="flex flex-1 flex-col gap-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={isActive(item.href) ? 'page' : undefined}
            className={cn(
              'group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition',
              isActive(item.href)
                ? 'bg-brand/12 text-white'
                : 'text-white/60 hover:bg-white/[0.05] hover:text-white',
            )}
          >
            <Icon
              size={15}
              className={cn(isActive(item.href) ? 'text-brand' : 'text-white/60 group-hover:text-white/60')}
              aria-hidden="true"
            />
            {item.label}
            {isActive(item.href) && <ChevronRight size={13} className="ml-auto text-brand/60" aria-hidden="true" />}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-ink">
      {/* mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.08] bg-ink/95 px-4 py-3 backdrop-blur lg:hidden">
        <Logo size="sm" href="/admin" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
          aria-expanded={open}
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-white"
        >
          <Menu size={17} />
        </button>
      </div>

      <div className="flex">
        {/* sidebar */}
        <aside className="sticky top-0 hidden h-dvh w-[236px] flex-none flex-col border-r border-white/[0.08] bg-ink px-4 py-5 lg:flex">
          <Logo size="sm" href="/admin" />
          <div className="mt-7 flex-1">{nav}</div>
          <div className="mt-4 border-t border-white/[0.08] pt-4">
            <Link
              href="/"
              target="_blank"
              className="mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] text-white/65 transition hover:bg-white/[0.05] hover:text-white"
            >
              <ExternalLink size={13} aria-hidden="true" />
              View website
            </Link>
            <div className="rounded-xl bg-white/[0.04] p-3">
              <p className="truncate text-[12.5px] font-semibold text-white">{user.name}</p>
              <p className="truncate text-[11px] text-white/60">{user.email}</p>
              <p className="mt-1 inline-block rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-soft">
                {user.role.replace('_', ' ')}
              </p>
              <button
                type="button"
                onClick={signOut}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/12 py-1.5 text-[11.5px] font-semibold text-white/70 transition hover:border-white/25 hover:text-white"
              >
                <LogOut size={12} aria-hidden="true" />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-black/70"
              onClick={() => setOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 flex w-[270px] flex-col border-r border-white/10 bg-ink px-4 py-5">
              <div className="flex items-center justify-between">
                <Logo size="sm" href="/admin" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/15 text-white"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="mt-6 flex-1">{nav}</div>
              <button
                type="button"
                onClick={signOut}
                className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-white/12 py-2 text-[12px] font-semibold text-white/70"
              >
                <LogOut size={12} aria-hidden="true" />
                Sign out
              </button>
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-7 sm:py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-white">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-mute-onDark">{description}</p>}
      </div>
      {action && <div className="flex flex-none gap-2">{action}</div>}
    </div>
  );
}

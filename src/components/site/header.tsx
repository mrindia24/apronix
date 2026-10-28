'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, ArrowUpRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { SERVICE_NAV } from '@/src/lib/constants';
import { Logo } from '@/src/components/site/logo';

const LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services', children: true },
  { label: 'Work', href: '/work' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
];

export function Header({ ctaHref = '/contact', ctaLabel = 'Book a call' }: { ctaHref?: string; ctaLabel?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }, [pathname]);

  // lock body scroll when the mobile sheet is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // escape closes everything; click outside closes the dropdown
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setServicesOpen(false);
        setMobileOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  const isActive = (href: string) =>
    href === '/work' ? pathname.startsWith('/work') : pathname === href || pathname.startsWith(`${href}/`);

  const openDropdown = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setServicesOpen(false), 160);
  };

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[70] transition-all duration-300',
          scrolled
            ? 'border-b border-white/[0.08] bg-ink/85 backdrop-blur-xl supports-[backdrop-filter]:bg-ink/70'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="shell flex h-[var(--header-h)] items-center justify-between gap-6">
          <Logo size="lg" />

          <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
            {LINKS.map((link) =>
              link.children ? (
                <div key={link.href} className="relative" ref={dropdownRef}>
                  <button
                    ref={triggerRef}
                    type="button"
                    aria-expanded={servicesOpen}
                    aria-haspopup="true"
                    aria-controls="services-menu"
                    onClick={() => setServicesOpen((v) => !v)}
                    onMouseEnter={openDropdown}
                    onMouseLeave={scheduleClose}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors',
                      isActive(link.href) ? 'text-white' : 'text-mute-onDark hover:text-white',
                    )}
                  >
                    {link.label}
                    <ChevronDown
                      size={14}
                      className={cn('transition-transform duration-200', servicesOpen && 'rotate-180')}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    id="services-menu"
                    onMouseEnter={openDropdown}
                    onMouseLeave={scheduleClose}
                    hidden={!servicesOpen}
                    className="absolute left-1/2 top-full z-50 w-[360px] -translate-x-1/2 pt-3"
                  >
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-soft/95 p-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                      {SERVICE_NAV.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="group flex flex-col gap-1 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.06]"
                          onClick={() => setServicesOpen(false)}
                        >
                          <span className="flex items-center justify-between text-[13.5px] font-semibold text-white">
                            {item.label}
                            <ArrowUpRight
                              size={14}
                              className="text-white/30 transition-all group-hover:translate-x-0.5 group-hover:text-brand-soft"
                              aria-hidden="true"
                            />
                          </span>
                          <span className="text-[12.5px] leading-snug text-mute-onDark">{item.description}</span>
                        </Link>
                      ))}
                      <Link
                        href="/services"
                        className="mt-1 flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5 text-[12.5px] font-semibold text-white/80 transition hover:bg-white/[0.08] hover:text-white"
                        onClick={() => setServicesOpen(false)}
                      >
                        Compare all services
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={cn(
                    'rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors',
                    isActive(link.href)
                      ? 'text-white'
                      : 'text-mute-onDark hover:text-white',
                  )}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href={ctaHref}
              className="hidden h-10 items-center gap-2 rounded-full bg-brand px-5 text-[13.5px] font-semibold text-white shadow-[0_10px_30px_-14px_rgba(255,48,56,0.9)] transition hover:bg-brand-dark sm:inline-flex"
            >
              {ctaLabel}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label="Open menu"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white transition hover:bg-white/10 lg:hidden"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sheet */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!mobileOpen}
        className="fixed inset-0 z-[80] lg:hidden"
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 h-full w-full bg-black/60 backdrop-blur-sm"
          tabIndex={-1}
        />
        <div className="absolute inset-x-0 top-0 max-h-[92vh] overflow-y-auto rounded-b-3xl border-b border-white/10 bg-ink px-5 pb-8 pt-4">
          <div className="flex items-center justify-between">
            <Logo size="sm" />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white"
            >
              <X size={18} />
            </button>
          </div>

          <nav aria-label="Mobile navigation" className="mt-7 flex flex-col">
            <Link href="/" className="border-b border-white/10 py-4 text-lg font-semibold text-white">
              Home
            </Link>
            {LINKS.map((link) =>
              link.children ? (
                <div key={link.href} className="border-b border-white/10">
                  <button
                    type="button"
                    aria-expanded={mobileServicesOpen}
                    onClick={() => setMobileServicesOpen((v) => !v)}
                    className="flex w-full items-center justify-between py-4 text-left text-lg font-semibold text-white"
                  >
                    Services
                    <ChevronDown
                      size={18}
                      className={cn('text-white/65 transition-transform', mobileServicesOpen && 'rotate-180')}
                      aria-hidden="true"
                    />
                  </button>
                  {mobileServicesOpen && (
                    <div className="pb-3">
                      <Link
                        href="/services"
                        className="block rounded-xl px-3 py-2.5 text-[15px] font-medium text-white/90 hover:bg-white/5"
                      >
                        All services
                      </Link>
                      {SERVICE_NAV.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block rounded-xl px-3 py-2.5 text-[15px] text-mute-onDark hover:bg-white/5 hover:text-white"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="border-b border-white/10 py-4 text-lg font-semibold text-white"
                >
                  {link.label}
                </Link>
              ),
            )}
            <Link href="/contact" className="border-b border-white/10 py-4 text-lg font-semibold text-white">
              Contact
            </Link>
          </nav>

          <Link
            href={ctaHref}
            className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-semibold text-white"
          >
            {ctaLabel}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </>
  );
}

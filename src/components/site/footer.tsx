import Link from 'next/link';
import { ArrowUpRight, Mail, MessageCircle, Phone } from 'lucide-react';
import { Logo } from '@/src/components/site/logo';
import { SERVICE_NAV } from '@/src/lib/constants';
import { getSiteSettings } from '@/src/lib/settings';

export async function Footer() {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/[0.08] bg-ink">
      <div className="shell py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo size="md" />
            <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-mute-onDark">
              {settings.description}
            </p>
            <div className="mt-6 flex flex-col gap-2.5 text-[13.5px]">
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="inline-flex items-center gap-2 py-3 -my-3 text-white/85 transition hover:text-brand-soft"
                >
                  <Mail size={14} aria-hidden="true" />
                  {settings.email}
                </a>
              )}
              {settings.phone && (
                <a
                  href={`tel:${settings.phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-2 py-3 -my-3 text-white/85 transition hover:text-brand-soft"
                >
                  <Phone size={14} aria-hidden="true" />
                  {settings.phone}
                </a>
              )}
              {settings.whatsapp && (
                <a
                  href={settings.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-3 -my-3 text-white/85 transition hover:text-brand-soft"
                >
                  <MessageCircle size={14} aria-hidden="true" />
                  Chat on WhatsApp
                </a>
              )}
            </div>
          </div>

          <nav aria-label="Services">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">Services</h2>
            <ul className="mt-4 space-y-2.5 text-[13.5px]">
              {SERVICE_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-block py-3 -my-3 text-mute-onDark transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="inline-block py-3 -my-3 text-mute-onDark transition hover:text-white">
                  All services
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Company">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">Company</h2>
            <ul className="mt-4 space-y-2.5 text-[13.5px]">
              {[
                { label: 'About us', href: '/about' },
                { label: 'Our work', href: '/work' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Blog', href: '/blog' },
                { label: 'Contact', href: '/contact' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-block py-3 -my-3 text-mute-onDark transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">Start a project</h2>
            <p className="mt-4 text-[13.5px] leading-relaxed text-mute-onDark">
              Tell us what you are working on. We reply within one business day.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-white transition hover:text-brand-soft"
            >
              Book a free consultation
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
            {settings.businessHours && (
              <p className="mt-5 text-[12.5px] text-white/65">{settings.businessHours}</p>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12.5px] text-white/60">
            © {year} {settings.siteName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px]">
            <Link href="/privacy-policy" className="inline-block py-3 -my-3 text-white/65 transition hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="inline-block py-3 -my-3 text-white/65 transition hover:text-white">
              Terms &amp; Conditions
            </Link>
            <Link href="/sitemap.xml" className="inline-block py-3 -my-3 text-white/65 transition hover:text-white">
              Sitemap
            </Link>
            <Link href="/admin/login" className="inline-block py-3 -my-3 text-white/70 transition hover:text-white">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

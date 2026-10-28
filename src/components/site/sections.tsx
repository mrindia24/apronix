import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Layers,
  MessageSquare,
  Smartphone,
  TrendingUp,
  ClipboardCheck,
  Megaphone,
  ShoppingBag,
  LayoutTemplate,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Reveal } from '@/src/components/ui/accordion';
import { WHY_APRONIX, PROCESS_STEPS } from '@/src/lib/constants';
import type { ServiceRecord } from '@/src/lib/content';

const ICONS: Record<string, typeof Compass> = {
  compass: Compass,
  layers: Layers,
  'message-square': MessageSquare,
  smartphone: Smartphone,
  'trending-up': TrendingUp,
  'clipboard-check': ClipboardCheck,
  megaphone: Megaphone,
  'shopping-bag': ShoppingBag,
  'layout-template': LayoutTemplate,
  sparkles: Sparkles,
};

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'dark',
  className,
  action,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light';
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6',
        align === 'center' ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <p className={tone === 'dark' ? 'eyebrow' : 'eyebrow-light'}>
            <span className="dot" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            'mt-4 text-display-md',
            tone === 'dark' ? 'text-white' : 'text-ink',
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              'mt-4 text-[15px] leading-relaxed text-pretty',
              tone === 'dark' ? 'text-mute-onDark' : 'text-mute-onLight',
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-none">{action}</div>}
    </div>
  );
}

/** Three-card service grid used on home + services index. */
export function ServiceCards({ services }: { services: ServiceRecord[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {services.map((service, index) => {
        const highlights = service.sections.deliverables?.slice(0, 3) ?? [];
        return (
          <Reveal key={service.id} delay={index * 90} as="article" className="h-full">
            <Link
              href={`/services/${service.slug}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-soft p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#14171D] sm:p-7"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-0"
              />
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-brand-soft">
                  <ServiceIcon name={service.icon} className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                  0{index + 1}
                </span>
              </div>

              <h3 className="mt-6 text-[19px] font-semibold leading-snug text-white">{service.shortName}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-mute-onDark">{service.tagline}</p>

              <ul className="mt-5 space-y-1.5 border-t border-white/[0.07] pt-5">
                {highlights.map((group) => (
                  <li key={group.title} className="flex items-start gap-2 text-[13px] text-white/70">
                    <span className="mt-[7px] h-1 w-1 flex-none rounded-full bg-brand" aria-hidden="true" />
                    {group.title}
                  </li>
                ))}
              </ul>

              <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white">
                Explore service
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}

export function WhyApronix() {
  return (
    <div className="grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
      {WHY_APRONIX.map((item, index) => (
        <Reveal
          key={item.title}
          delay={(index % 3) * 70}
          className="group bg-ink p-6 transition-colors duration-300 hover:bg-ink-soft sm:p-7"
        >
          <ServiceIcon name={item.icon} className="h-5 w-5 text-brand-soft" />
          <h3 className="mt-5 text-[15.5px] font-semibold text-white">{item.title}</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-mute-onDark">{item.body}</p>
        </Reveal>
      ))}
    </div>
  );
}

export function ProcessTimeline() {
  return (
    <ol className="relative grid list-none gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.06] md:grid-cols-3 lg:grid-cols-6">
      {PROCESS_STEPS.map((step, index) => (
        <li key={step.step} className="group relative bg-ink p-5 transition-colors hover:bg-ink-soft sm:p-6">
          <span className="text-[11px] font-bold tracking-[0.18em] text-brand-soft">{step.step}</span>
          <h3 className="mt-3 text-[15px] font-semibold text-white">{step.title}</h3>
          <p className="mt-2 text-[12.5px] leading-relaxed text-mute-onDark">{step.body}</p>
          {index < PROCESS_STEPS.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute right-2 top-6 hidden text-white/15 lg:block"
            >
              <ArrowRight size={14} />
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

/** Final conversion band reused across pages. */
export function CtaBand({
  headline = 'Ready to grow your business?',
  text = "Let's build a stronger digital presence for your brand.",
  primaryLabel = "Let's talk",
  primaryHref = '/contact',
  secondaryLabel,
  secondaryHref,
}: {
  headline?: string;
  text?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.07] bg-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 radial-brand opacity-80"
      />
      <div className="shell relative py-16 text-center sm:py-20">
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-display-md text-white">{headline}</h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-mute-onDark">{text}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-7 text-[14px] font-semibold text-white shadow-[0_14px_40px_-16px_rgba(255,48,56,0.9)] transition hover:bg-brand-dark"
            >
              {primaryLabel}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            {secondaryLabel && secondaryHref && (
              <Link
                href={secondaryHref}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-7 text-[14px] font-semibold text-white transition hover:bg-white/[0.07]"
              >
                {secondaryLabel}
              </Link>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { Breadcrumbs } from '@/src/components/site/breadcrumbs';
import { CtaBand, SectionHeading, ServiceIcon } from '@/src/components/site/sections';
import { Reveal } from '@/src/components/ui/accordion';
import { getServices } from '@/src/lib/content';
import { buildMetadata, breadcrumbSchema, serviceSchema } from '@/src/lib/seo';
import { PAGE_KEYWORDS } from '@/src/lib/keywords';

export const metadata: Metadata = buildMetadata({
  title: 'Digital Agency Services — Social Media, Shopify & WordPress | Apronix Tech',
  description:
    'Social media management, Shopify development and WordPress development services for growing businesses. Compare scope, deliverables and how each engagement works.',
  path: '/services',
  keywords: [...PAGE_KEYWORDS.services],
});

const SERVICE_IMAGES: Record<string, string> = {
  SOCIAL_MEDIA_MANAGEMENT: '/media/service-social.jpg',
  SHOPIFY_DEVELOPMENT: '/media/service-shopify.jpg',
  WORDPRESS_DEVELOPMENT: '/media/service-wordpress.jpg',
};

const SERVICE_ALT: Record<string, string> = {
  SOCIAL_MEDIA_MANAGEMENT: 'A content planner and phone showing a social feed',
  SHOPIFY_DEVELOPMENT: 'A studio desk with two displays showing storefront work',
  WORDPRESS_DEVELOPMENT: 'A studio desk with a monitor showing a website layout',
};

export const revalidate = 600;

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema([
              { name: 'Home', href: '/' },
              { name: 'Services', href: '/services' },
            ]),
            ...services.map((s) =>
              serviceSchema({
                name: s.name,
                description: s.summary,
                path: `/services/${s.slug}`,
                serviceType: s.shortName,
              }),
            ),
          ]),
        }}
      />

      <section className="relative overflow-hidden border-b border-white/[0.07]">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" aria-hidden="true" />
        <div className="shell relative py-14 sm:py-20">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Services', href: '/services' }]} />
          <div className="mt-8 max-w-3xl">
            <p className="eyebrow">
              <span className="dot" aria-hidden="true" />
              Services
            </p>
            <h1 className="mt-5 text-display-lg text-white">
              Strategy, content and code —
              <br />
              <span className="text-white/65">under one roof.</span>
            </h1>
            <p className="mt-6 text-[15.5px] leading-relaxed text-mute-onDark text-pretty">
              Three focused services, each with a defined scope and a clear deliverable list. Choose the
              one you need now — most clients start with one and add others once the foundations are in
              place.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell space-y-6">
          {services.map((service, index) => (
            <Reveal key={service.id} delay={index * 60}>
              <article className="overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-soft">
                <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-brand-soft">
                        <ServiceIcon name={service.icon} className="h-5 w-5" />
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                        0{index + 1} · {service.shortName}
                      </span>
                    </div>
                    <h2 className="mt-5 text-display-sm text-white">{service.name}</h2>
                    <p className="mt-3 text-[14.5px] leading-relaxed text-mute-onDark">{service.summary}</p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {service.sections.deliverables?.slice(0, 2).map((group) => (
                        <div key={group.title}>
                          <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/60">
                            {group.title}
                          </h3>
                          <ul className="mt-2.5 space-y-1.5">
                            {group.items.slice(0, 4).map((item) => (
                              <li key={item} className="flex items-start gap-2 text-[13px] text-white/70">
                                <Check size={12} className="mt-1 flex-none text-brand-soft" aria-hidden="true" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/services/${service.slug}`}
                        className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-[13.5px] font-semibold text-white transition hover:bg-brand-dark"
                      >
                        Explore {service.shortName}
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                      <Link
                        href={`/contact?service=${service.key}`}
                        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-[13.5px] font-semibold text-white transition hover:bg-white/[0.07]"
                      >
                        Get a quote
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/[0.07]">
                      <Image
                        src={SERVICE_IMAGES[service.key] ?? '/media/editorial-workspace.jpg'}
                        alt={SERVICE_ALT[service.key] ?? 'An Apronix workspace'}
                        fill
                        sizes="(max-width: 1024px) 100vw, 42vw"
                        className="object-cover"
                      />
                    </div>
                  <div className="rounded-2xl border border-white/[0.07] bg-ink p-5 sm:p-6">
                    <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/60">
                      What this solves
                    </h3>
                    <ul className="mt-3 space-y-3">
                      {(service.sections.problems ?? []).slice(0, 4).map((problem) => (
                        <li key={problem.title}>
                          <p className="text-[13.5px] font-semibold text-white/90">{problem.title}</p>
                          <p className="mt-0.5 text-[12.5px] leading-relaxed text-mute-onDark">
                            {problem.body}
                          </p>
                        </li>
                      ))}
                    </ul>
                    {service.sections.startingNote && (
                      <p className="mt-5 border-t border-white/[0.07] pt-4 text-[12px] leading-relaxed text-white/60">
                        {service.sections.startingNote}
                      </p>
                    )}
                  </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section border-t border-white/[0.07] bg-ink-soft/40">
        <div className="shell">
          <SectionHeading
            eyebrow="Not sure where to start?"
            title="We will point you at the right first step"
            description="Most businesses do not need everything at once. A short call is usually enough to work out whether the priority is visibility, conversion, or the foundation underneath both."
            action={
              <Link
                href="/contact"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-[13.5px] font-semibold text-white transition hover:bg-brand-dark"
              >
                Book a consultation
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            }
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: 'Nobody knows we exist',
                body: 'Start with social media management: consistent publishing and a recognisable identity build familiarity faster than a redesign.',
                href: '/services/social-media-management',
              },
              {
                title: 'People visit but do not buy',
                body: 'Start with the storefront: product pages, clarity of pricing and mobile checkout are usually where the leak is.',
                href: '/services/shopify-development',
              },
              {
                title: 'Our site is out of date',
                body: 'Start with a WordPress build or rebuild: a structure your team can update keeps the site accurate long-term.',
                href: '/services/wordpress-development',
              },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-2xl border border-white/[0.08] bg-ink p-5 transition hover:border-white/20"
              >
                <h3 className="text-[14.5px] font-semibold text-white">{card.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-mute-onDark">{card.body}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-soft">
                  See the service
                  <ArrowRight size={13} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

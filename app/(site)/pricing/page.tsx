import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Info, Minus } from 'lucide-react';
import { Breadcrumbs } from '@/src/components/site/breadcrumbs';
import { CtaBand, SectionHeading } from '@/src/components/site/sections';
import { Reveal } from '@/src/components/ui/accordion';
import { getPricingPlans, getFaqs } from '@/src/lib/content';
import { buildMetadata, breadcrumbSchema, faqSchema } from '@/src/lib/seo';
import { PAGE_KEYWORDS } from '@/src/lib/keywords';
import { getSiteSettings } from '@/src/lib/settings';
import { cn } from '@/src/lib/utils';

export const metadata: Metadata = buildMetadata({
  title: 'Pricing — Social Media, Shopify & WordPress | Apronix Tech',
  description:
    'Indicative pricing for social media management retainers, Shopify stores, WordPress websites and ongoing care plans. Every engagement is scoped and quoted in writing after a short call.',
  path: '/pricing',
  keywords: [...PAGE_KEYWORDS.pricing],
});

export const revalidate = 600;

export default async function PricingPage() {
  const [plans, faqs, settings] = await Promise.all([
    getPricingPlans(),
    getFaqs(null),
    getSiteSettings(),
  ]);

  const hasSamplePrices = plans.some((plan) => plan.isSampleContent);
  const pricingFaqs = faqs.slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema([
              { name: 'Home', href: '/' },
              { name: 'Pricing', href: '/pricing' },
            ]),
            ...(pricingFaqs.length ? [faqSchema(pricingFaqs.map((f) => ({ question: f.question, answer: f.answer })))] : []),
          ]),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.07]">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" aria-hidden="true" />
        <div className="shell relative py-14 sm:py-20">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Pricing', href: '/pricing' }]} />
          <div className="mt-8 max-w-3xl">
            <p className="eyebrow">
              <span className="dot" aria-hidden="true" />
              Pricing
            </p>
            <h1 className="mt-5 text-display-lg text-white">
              Clear numbers,
              <br />
              <span className="text-white/65">before the first call.</span>
            </h1>
            <p className="mt-6 text-[15.5px] leading-relaxed text-mute-onDark text-pretty">
              These are indicative starting points, not a menu. Every engagement is scoped and
              quoted in writing after a short conversation — because catalogue size, template count
              and integrations move the number more than anything else.
            </p>
          </div>

          {hasSamplePrices && (
            <div
              role="note"
              className="mt-8 flex max-w-3xl items-start gap-2.5 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3 text-[12.5px] leading-relaxed text-amber-100/90"
            >
              <Info size={15} className="mt-0.5 flex-none text-amber-300" aria-hidden="true" />
              <span>
                <strong className="font-semibold">Placeholder pricing.</strong> The figures below are
                sample data included with this build so the page structure is visible. Replace them in
                the dashboard before launch — they are not a quote or an offer.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Plans */}
      <section className="section">
        <div className="shell">
          {plans.length === 0 ? (
            <div className="card-dark p-8 text-center">
              <p className="text-[15px] text-white">Pricing is being finalised.</p>
              <p className="mt-2 text-[13.5px] text-mute-onDark">
                Send us a note and we will come back with a scoped figure.
              </p>
              <Link
                href="/contact"
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-[13.5px] font-semibold text-white transition hover:bg-brand-dark"
              >
                Start an enquiry
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {plans.map((plan, index) => (
                <Reveal key={plan.id} delay={index * 60}>
                  <article
                    className={cn(
                      'flex h-full flex-col rounded-3xl border p-6 sm:p-7',
                      plan.highlighted
                        ? 'border-brand/45 bg-gradient-to-b from-brand/[0.10] to-ink-soft shadow-[0_30px_80px_-40px_rgba(224,31,39,0.8)]'
                        : 'border-white/[0.08] bg-ink-soft',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-[19px] font-semibold text-white">{plan.name}</h2>
                      {plan.highlighted && (
                        <span className="mt-0.5 flex-none rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                          Popular
                        </span>
                      )}
                    </div>

                    {plan.tagline && (
                      <p className="mt-2.5 text-[13px] leading-relaxed text-mute-onDark">
                        {plan.tagline}
                      </p>
                    )}

                    <div className="mt-5 border-t border-white/[0.07] pt-5">
                      <p className="flex flex-wrap items-baseline gap-1.5">
                        <span className="text-[30px] font-bold leading-none tracking-tight text-white">
                          {plan.price || 'On request'}
                        </span>
                        {plan.priceNote && (
                          <span className="text-[13px] font-medium text-white/60">{plan.priceNote}</span>
                        )}
                      </p>
                      {plan.billingNote && (
                        <p className="mt-2 text-[11.5px] leading-relaxed text-white/55">
                          {plan.billingNote}
                        </p>
                      )}
                    </div>

                    {plan.features.length > 0 && (
                      <ul className="mt-5 space-y-2.5">
                        {plan.features.map((feature) => (
                          <li key={feature.id} className="flex items-start gap-2.5 text-[13px] leading-relaxed">
                            {feature.included ? (
                              <Check size={14} className="mt-0.5 flex-none text-brand-soft" aria-hidden="true" />
                            ) : (
                              <Minus size={14} className="mt-0.5 flex-none text-white/35" aria-hidden="true" />
                            )}
                            <span className={feature.included ? 'text-white/85' : 'text-white/45 line-through'}>
                              {feature.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {plan.notIncluded.length > 0 && (
                      <div className="mt-5 border-t border-white/[0.07] pt-4">
                        <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/45">
                          Not included
                        </p>
                        <p className="mt-1.5 text-[12px] leading-relaxed text-white/55">
                          {plan.notIncluded.join(' · ')}
                        </p>
                      </div>
                    )}

                    <div className="mt-auto pt-6">
                      <Link
                        href={plan.ctaHref}
                        className={cn(
                          'inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[13.5px] font-semibold transition',
                          plan.highlighted
                            ? 'bg-brand text-white hover:bg-brand-dark'
                            : 'border border-white/15 text-white hover:bg-white/[0.07]',
                        )}
                      >
                        {plan.ctaLabel}
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}

          <p className="mt-8 text-center text-[12.5px] leading-relaxed text-white/55">
            Prices shown exclude applicable taxes. Scope, timeline and fee are confirmed in writing
            before any work begins.
          </p>
        </div>
      </section>

      {/* What shapes the quote */}
      <section className="section border-t border-white/[0.07] bg-ink-soft/40">
        <div className="shell">
          <SectionHeading
            eyebrow="How quotes work"
            title="What actually moves the number"
            description="No two projects price the same. These are the variables we look at on the scoping call."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Scope size',
                body: 'Page and template count for a website; channel count and posting cadence for a retainer.',
              },
              {
                title: 'Integrations',
                body: 'Payments, ERP, CRM, review platforms and analytics each add setup and testing time.',
              },
              {
                title: 'Content readiness',
                body: 'Ready copy and photography shorten a build. Producing them from scratch extends it.',
              },
              {
                title: 'Timeline',
                body: 'A compressed deadline is possible, but it is priced honestly rather than absorbed.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/[0.07] bg-ink p-5">
                <h3 className="text-[13.5px] font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-mute-onDark">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing FAQs */}
      {pricingFaqs.length > 0 && (
        <section className="section border-t border-white/[0.07]">
          <div className="shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="eyebrow">
                <span className="dot" aria-hidden="true" />
                Before you ask
              </p>
              <h2 className="mt-4 text-display-sm text-white">The awkward questions, answered.</h2>
              <p className="mt-4 text-[14px] leading-relaxed text-mute-onDark">
                Still unclear? A short call is faster than a long email thread —{' '}
                {settings.businessHours.toLowerCase()}.
              </p>
              <Link
                href="/contact"
                className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 text-[13.5px] font-semibold text-white transition hover:text-brand-soft sm:min-h-0"
              >
                Book a call
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <ul className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
              {pricingFaqs.map((faq) => (
                <li key={faq.id} className="py-5">
                  <h3 className="text-[14.5px] font-semibold text-white">{faq.question}</h3>
                  <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-mute-onDark">
                    {faq.answer}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CtaBand
        headline="Want a real number for your project?"
        text="Send a short brief and you will get a scoped, fixed-fee quote — not a range designed to start a negotiation."
        primaryLabel="Start an enquiry"
        primaryHref="/contact"
        secondaryLabel="See our services"
        secondaryHref="/services"
      />
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { Breadcrumbs } from '@/src/components/site/breadcrumbs';
import { CtaBand } from '@/src/components/site/sections';
import { getServiceByKey } from '@/src/lib/content';
import { INTENT_PAGES, type IntentPage } from '@/src/lib/keywords';
import { buildMetadata, breadcrumbSchema, serviceSchema } from '@/src/lib/seo';

export const revalidate = 600;

/** One route, many intents: /solutions/[slug]. Each page is written for one search. */
export function generateStaticParams() {
  return INTENT_PAGES.filter((page) => page.published).map((page) => ({ slug: page.slug }));
}

function getPage(slug: string): IntentPage | undefined {
  return INTENT_PAGES.find((page) => page.slug === slug && page.published);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) return buildMetadata({ title: 'Not found', description: '', path: '/solutions', noindex: true });

  return buildMetadata({
    title: page.title,
    description: page.description,
    path: `/solutions/${page.slug}`,
    keywords: page.keywords,
  });
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) notFound();

  const service = await getServiceByKey(page.serviceKey);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema([
              { name: 'Home', href: '/' },
              { name: page.primaryKeyword, href: `/solutions/${page.slug}` },
            ]),
            ...(service
              ? [
                  serviceSchema({
                    name: page.h1,
                    description: page.description,
                    path: `/solutions/${page.slug}`,
                    serviceType: page.primaryKeyword,
                  }),
                ]
              : []),
          ]),
        }}
      />

      <section className="relative overflow-hidden border-b border-white/[0.07]">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" aria-hidden="true" />
        <div className="shell relative py-14 sm:py-20">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: page.primaryKeyword, href: `/solutions/${page.slug}` },
            ]}
          />
          <div className="mt-8 max-w-3xl">
            <p className="eyebrow">
              <span className="dot" aria-hidden="true" />
              {page.primaryKeyword}
            </p>
            <h1 className="mt-5 text-display-lg text-white text-balance">{page.h1}</h1>
            <p className="mt-6 text-[15.5px] leading-relaxed text-mute-onDark text-pretty">{page.intro}</p>

            <p className="mt-5 text-[13.5px] leading-relaxed text-white/60">
              <span className="font-semibold text-white/80">Who this is for:</span> {page.audience}.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-6 text-[14px] font-semibold text-white transition hover:bg-brand-dark"
              >
                Start an enquiry
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
              {service && (
                <Link
                  href={`/services/${service.slug}`}
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-[14px] font-semibold text-white transition hover:bg-white/[0.07]"
                >
                  Read the full service
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          <div>
            <h2 className="text-display-sm text-white">What is included</h2>
            <ul className="mt-6 space-y-3.5">
              {page.bullets.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[14.5px] leading-relaxed text-white/85">
                  <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-brand/15">
                    <Check size={12} className="text-brand-soft" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="card-dark p-5 sm:p-6">
              <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/60">
                Next step
              </h2>
              <p className="mt-3 text-[13.5px] leading-relaxed text-mute-onDark">
                Send a short brief and you will get a reply within one business day — usually with a
                question or two and a suggested scope. No sales sequence.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-[13.5px] font-semibold text-white transition hover:bg-brand-dark"
              >
                Book a free consultation
              </Link>
            </div>

            {service && (
              <div className="card-dark p-5 sm:p-6">
                <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/60">
                  Related service
                </h2>
                <Link
                  href={`/services/${service.slug}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white transition hover:text-brand-soft"
                >
                  {service.name}
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
                <p className="mt-2 text-[12.5px] leading-relaxed text-mute-onDark">{service.summary}</p>
              </div>
            )}

            <div className="card-dark p-5 sm:p-6">
              <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/60">
                Also useful
              </h2>
              <ul className="mt-3 space-y-2 text-[13px]">
                <li>
                  <Link href="/pricing" className="inline-flex min-h-[32px] items-center text-white/75 transition hover:text-white">
                    See indicative pricing
                  </Link>
                </li>
                <li>
                  <Link href="/work" className="inline-flex min-h-[32px] items-center text-white/75 transition hover:text-white">
                    Look at recent work
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="inline-flex min-h-[32px] items-center text-white/75 transition hover:text-white">
                    Compare all services
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Sibling intents: real internal links with descriptive anchors, not a keyword list */}
      <section className="section border-t border-white/[0.07] bg-ink-soft/40 pt-0 sm:pt-0 lg:pt-0">
        <div className="shell py-14 sm:py-16">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/60">
            Other ways we help
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {INTENT_PAGES.filter((p) => p.published && p.slug !== page.slug).map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/solutions/${p.slug}`}
                  className="group flex min-h-[64px] items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-ink px-4 py-3.5 text-[13.5px] font-medium text-white/85 transition hover:border-white/20 hover:text-white"
                >
                  {p.primaryKeyword}
                  <ArrowRight
                    size={14}
                    className="flex-none text-white/30 transition group-hover:translate-x-0.5 group-hover:text-brand-soft"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        headline="Tell us what you need to happen"
        text="A short call is usually enough to work out whether this is the right starting point — and what it would cost."
        primaryLabel="Start an enquiry"
        primaryHref="/contact"
        secondaryLabel="See pricing"
        secondaryHref="/pricing"
      />
    </>
  );
}

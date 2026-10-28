import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Check, Quote } from 'lucide-react';
import { Breadcrumbs } from '@/src/components/site/breadcrumbs';
import { CtaBand, ProcessTimeline, SectionHeading, ServiceIcon, WhyApronix } from '@/src/components/site/sections';
import { Reveal } from '@/src/components/ui/accordion';
import { getServices } from '@/src/lib/content';
import { buildMetadata, breadcrumbSchema } from '@/src/lib/seo';
import { PAGE_KEYWORDS } from '@/src/lib/keywords';

export const metadata: Metadata = buildMetadata({
  title: 'About Apronix Tech — A Digital Agency Built Around Clarity',
  description:
    'Meet Apronix Tech: a small digital agency combining social media management with Shopify and WordPress development. Strategy-led, transparent and easy to work with.',
  path: '/about',
  keywords: [...PAGE_KEYWORDS.about],
});

export const revalidate = 600;

const PRINCIPLES = [
  {
    title: 'We say no when it is the right answer',
    body: 'If a rebuild will not earn back what it costs, or a retainer is not the right model for your stage, we will say so. Short engagements built on honesty tend to become long relationships.',
  },
  {
    title: 'One team, one point of contact',
    body: 'You do not get passed between account managers. The person who scopes your project is accountable for delivering it and answering your questions.',
  },
  {
    title: 'No invented numbers',
    body: 'We will not put a manufactured statistic on a slide to look impressive. Where we have evidence, we show it. Where we do not, we describe the approach instead.',
  },
  {
    title: 'Documentation is part of the deliverable',
    body: 'Every project ends with handover material: how to edit the site, where things live, who owns access. Your team should never be stranded after launch.',
  },
];

export default async function AboutPage() {
  const services = await getServices();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: 'Home', href: '/' },
              { name: 'About', href: '/about' },
            ]),
          ),
        }}
      />

      <section className="relative overflow-hidden border-b border-white/[0.07]">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-32 -top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,48,56,0.16),transparent_65%)] blur-2xl" aria-hidden="true" />
        <div className="shell relative py-14 sm:py-20">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'About', href: '/about' }]} />
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="eyebrow">
                <span className="dot" aria-hidden="true" />
                About Apronix Tech
              </p>
              <h1 className="mt-5 text-display-lg text-white">
                A digital partner that
                <br />
                <span className="text-white/65">explains its thinking.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-mute-onDark text-pretty">
                Apronix Tech is a digital agency working across social media management and website
                development. We exist because a lot of good businesses are held back by digital work that
                was built without a plan — a website nobody can edit, a feed that goes quiet, a brand that
                looks different in every channel.
              </p>
            </div>
            <div className="card-dark p-6 sm:p-7">
              <Quote size={20} className="text-brand-soft" aria-hidden="true" />
              <p className="mt-4 text-[15px] leading-relaxed text-white/85">
                Our job is to remove the gap between how good a business actually is and how good it looks
                online.
              </p>
              <p className="mt-4 text-[12.5px] text-white/65">The Apronix Tech team</p>
            </div>
          </div>
        </div>
      </section>

      {/* team at work — real photography, captioned honestly */}
      <section className="section pb-0">
        <div className="shell">
          <figure className="overflow-hidden rounded-3xl border border-white/[0.08]">
            <Image
              src="/media/editorial-team.jpg"
              alt="A team reviewing work together around a table with laptops and notes"
              width={1600}
              height={900}
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="h-auto w-full"
            />
            <figcaption className="border-t border-white/[0.07] bg-ink-soft px-5 py-3 text-[12px] text-white/60">
              Working sessions are where most of the value gets created — a shared screen, a clear
              decision, and a written next step.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section">
        <div className="shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow">
              <span className="dot" aria-hidden="true" />
              What we do
            </p>
            <h2 className="mt-4 text-display-md text-white">Three connected disciplines</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-mute-onDark">
              Most agencies specialise in either brand or build. We do both, because the two decisions
              affect each other: the content calendar depends on what the site can publish, and the site
              structure depends on what the campaigns need to convert.
            </p>
            <div className="mt-8 space-y-3">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group flex items-start gap-4 rounded-2xl border border-white/[0.08] bg-ink-soft p-5 transition hover:border-white/20"
                >
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-brand-soft">
                    <ServiceIcon name={service.icon} className="h-4.5 w-4.5" />
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center justify-between text-[14.5px] font-semibold text-white">
                      {service.shortName}
                      <ArrowUpRight
                        size={15}
                        className="text-white/60 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-soft"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-mute-onDark">
                      {service.tagline}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-display-sm text-white">How we work</h2>
            <div className="mt-6 space-y-5">
              {PRINCIPLES.map((item, index) => (
                <Reveal key={item.title} delay={index * 60} className="flex gap-4">
                  <span className="mt-1 grid h-6 w-6 flex-none place-items-center rounded-full bg-brand/12 text-brand-soft">
                    <Check size={13} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-white">{item.title}</h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-mute-onDark">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section border-y border-white/[0.07] bg-ink-soft/40">
        <div className="shell">
          <SectionHeading
            eyebrow="Capabilities"
            title="What we are good at"
            description="If a project needs something outside this list, we will tell you rather than learn on your budget."
          />
          <div className="mt-10">
            <WhyApronix />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHeading
            eyebrow="Our process"
            title="A predictable way to work together"
            description="Six stages with defined outputs. You will always know what is being worked on and what we need from you."
          />
          <div className="mt-10">
            <ProcessTimeline />
          </div>
        </div>
      </section>

      <CtaBand
        headline="Want to talk it through?"
        text="Book a free consultation. We will look at where you are and tell you honestly what we would prioritise first."
        primaryLabel="Book a free consultation"
        secondaryLabel="See our work"
        secondaryHref="/work"
      />
    </>
  );
}

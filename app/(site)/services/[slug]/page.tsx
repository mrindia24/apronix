import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ArrowUpRight, Check, CircleAlert } from 'lucide-react';
import { Breadcrumbs } from '@/src/components/site/breadcrumbs';
import { Accordion, Reveal } from '@/src/components/ui/accordion';
import { CtaBand, SectionHeading, ServiceIcon } from '@/src/components/site/sections';
import { ProjectCard } from '@/src/components/site/project-card';
import { Suspense } from 'react';
import { EnquiryForm } from '@/src/components/site/enquiry-form';
import { FormSkeleton } from '@/src/components/site/form-skeleton';
import { getServiceBySlug, getServices, getFaqs, getProjects } from '@/src/lib/content';
import { getSiteSettings } from '@/src/lib/settings';
import { buildMetadata, breadcrumbSchema, faqSchema, serviceSchema } from '@/src/lib/seo';
import { PAGE_KEYWORDS } from '@/src/lib/keywords';

const SERVICE_IMAGES: Record<string, { src: string; alt: string }> = {
  SOCIAL_MEDIA_MANAGEMENT: {
    src: '/media/service-social.jpg',
    alt: 'A social media content planner beside a smartphone showing a feed',
  },
  SHOPIFY_DEVELOPMENT: {
    src: '/media/service-shopify.jpg',
    alt: 'A desktop display showing the Apronix Shopify service page in a bright studio',
  },
  WORDPRESS_DEVELOPMENT: {
    src: '/media/service-wordpress.jpg',
    alt: 'Two displays in a studio, one showing the Apronix WordPress service page',
  },
};

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) {
    return { title: 'Service not found — Apronix Tech', robots: { index: false, follow: false } };
  }
  return buildMetadata({
    title: service.seoTitle || `${service.name} | Apronix Tech`,
    description: service.seoDescription || service.summary,
    path: `/services/${service.slug}`,
    keywords: [
      ...(service.key === 'SOCIAL_MEDIA_MANAGEMENT'
        ? PAGE_KEYWORDS.social
        : service.key === 'SHOPIFY_DEVELOPMENT'
          ? PAGE_KEYWORDS.shopify
          : PAGE_KEYWORDS.wordpress),
    ],
  });
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const [allServices, scopedFaqs, projects, settings] = await Promise.all([
    getServices(),
    getFaqs(service.key),
    getProjects(),
    getSiteSettings(),
  ]);

  const relatedProjects = projects
    .filter((p) => p.serviceCategory === service.key)
    .slice(0, 3);

  const faqs = scopedFaqs.length > 0 ? scopedFaqs : (service.sections.faqs ?? []);
  const faqItems = faqs.map((f, i) => ({
    id: 'id' in f ? (f.id as string) : `svc-faq-${i}`,
    question: f.question,
    answer: f.answer,
  }));

  const relatedSlugs = service.sections.relatedKeys ?? [];
  const related = allServices.filter(
    (s) => s.key !== service.key && (relatedSlugs.length === 0 || relatedSlugs.includes(s.key)),
  );

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: service.shortName, href: `/services/${service.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            [
              breadcrumbSchema(crumbs),
              serviceSchema({
                name: service.name,
                description: service.summary,
                path: `/services/${service.slug}`,
                serviceType: service.shortName,
              }),
              faqSchema(faqItems.map((f) => ({ question: f.question, answer: f.answer }))),
            ].filter(Boolean),
          ),
        }}
      />

      {/* hero */}
      <section className="relative overflow-hidden border-b border-white/[0.07]">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-24 -top-32 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(255,48,56,0.18),transparent_65%)] blur-2xl"
          aria-hidden="true"
        />
        <div className="shell relative py-12 sm:py-16 lg:py-20">
          <Breadcrumbs items={crumbs} />
          <div className="mt-8 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-brand-soft">
                  <ServiceIcon name={service.icon} className="h-5 w-5" />
                </span>
                <span className="eyebrow">{service.shortName}</span>
              </div>
              <h1 className="mt-6 text-display-lg text-white">{service.heroHeadline}</h1>
              <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-mute-onDark text-pretty">
                {service.heroDescription}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/contact?service=${service.key}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 text-[14px] font-semibold text-white shadow-[0_14px_40px_-18px_rgba(255,48,56,0.95)] transition hover:bg-brand-dark"
                >
                  Discuss your project
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
                <Link
                  href="#enquiry"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-[14px] font-semibold text-white transition hover:bg-white/[0.07]"
                >
                  Jump to the form
                </Link>
              </div>

              {service.sections.startingNote && (
                <p className="mt-6 flex items-start gap-2 text-[12.5px] leading-relaxed text-white/65">
                  <CircleAlert size={14} className="mt-0.5 flex-none text-white/60" aria-hidden="true" />
                  {service.sections.startingNote}
                </p>
              )}
            </div>

            {/* service photograph + deliverables summary */}
            <div className="self-start space-y-5">
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-soft">
                <Image
                  src={(SERVICE_IMAGES[service.key] ?? { src: '/media/editorial-workspace.jpg' }).src}
                  alt={(SERVICE_IMAGES[service.key] ?? { alt: 'An Apronix workspace' }).alt}
                  width={1600}
                  height={1000}
                  priority
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  className="h-auto w-full"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/[0.06]"
                />
              </div>

              <div className="card-dark p-6 sm:p-7">
              <h2 className="text-[12px] font-bold uppercase tracking-[0.16em] text-white/60">
                At a glance
              </h2>
              <div className="mt-4 space-y-4">
                {(service.sections.deliverables ?? []).map((group) => (
                  <div key={group.title}>
                    <p className="text-[13.5px] font-semibold text-white">{group.title}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-mute-onDark">
                      {group.items.slice(0, 3).join(' · ')}
                    </p>
                  </div>
                ))}
              </div>
              {service.sections.tech && service.sections.tech.length > 0 && (
                <div className="mt-5 border-t border-white/[0.07] pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">
                    Tools &amp; platforms
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {service.sections.tech.map((tech) => (
                      <li
                        key={tech}
                        className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/60"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* problems */}
      {service.sections.problems?.length > 0 && (
        <section className="section">
          <div className="shell">
            <SectionHeading
              eyebrow="The problem"
              title="What this service fixes"
              description="These are the patterns we see most often. If two or three sound familiar, the service is probably a fit."
            />
            <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
              {service.sections.problems.map((problem, i) => (
                <Reveal key={problem.title} delay={(i % 3) * 60} className="bg-ink p-6">
                  <span className="text-[11px] font-bold tracking-[0.16em] text-brand-soft">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-3 text-[15px] font-semibold text-white">{problem.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-mute-onDark">{problem.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* deliverables detail */}
      {service.sections.deliverables?.length > 0 && (
        <section className="section border-y border-white/[0.07] bg-ink-soft/40">
          <div className="shell">
            <SectionHeading
              eyebrow="Deliverables"
              title="Exactly what you receive"
              description="No vague promises. This is the scope we work to, and anything outside it is agreed in writing first."
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {service.sections.deliverables.map((group, i) => (
                <Reveal key={group.title} delay={i * 60} className="card-dark p-6">
                  <h3 className="text-[15.5px] font-semibold text-white">{group.title}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-mute-onDark">
                        <Check size={14} className="mt-1 flex-none text-brand-soft" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* benefits + use cases */}
      <section className="section">
        <div className="shell grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeading eyebrow="Why it matters" title="What changes for your business" />
            <div className="mt-8 space-y-6">
              {(service.sections.benefits ?? []).map((benefit, i) => (
                <Reveal key={benefit.title} delay={i * 50} className="border-l-2 border-brand/40 pl-5">
                  <h3 className="text-[15px] font-semibold text-white">{benefit.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-mute-onDark">{benefit.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <div className="card-dark self-start p-6 sm:p-7">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.16em] text-white/60">
              Good fit if you are…
            </h2>
            <ul className="mt-4 space-y-3">
              {(service.sections.useCases ?? []).map((useCase) => (
                <li key={useCase} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-white/75">
                  <ArrowRight size={14} className="mt-1 flex-none text-brand-soft" aria-hidden="true" />
                  {useCase}
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-white/[0.07] pt-4 text-[12.5px] leading-relaxed text-white/65">
              Not sure if you fit? Describe your situation in the form and we will tell you honestly.
            </p>
          </div>
        </div>
      </section>

      {/* workflow */}
      {service.sections.workflow?.length > 0 && (
        <section className="section border-y border-white/[0.07] bg-ink-soft/40">
          <div className="shell">
            <SectionHeading
              eyebrow="Workflow"
              title={`How a ${service.shortName} engagement runs`}
              description="Each stage has an output you can review, so there are no long silent stretches."
            />
            <ol className="mt-10 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {service.sections.workflow.map((step, i) => (
                <Reveal as="li" key={step.step} delay={(i % 3) * 60} className="card-dark p-6">
                  <span className="text-[11px] font-bold tracking-[0.16em] text-brand-soft">{step.step}</span>
                  <h3 className="mt-3 text-[15px] font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-mute-onDark">{step.body}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* related projects */}
      {relatedProjects.length > 0 && (
        <section className="section">
          <div className="shell">
            <SectionHeading
              eyebrow="Related work"
              title={`${service.shortName} projects`}
              action={
                <Link
                  href="/work"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-[13.5px] font-semibold text-white transition hover:bg-white/[0.07]"
                >
                  All work
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              }
            />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {relatedProjects.map((project, i) => (
                <Reveal key={project.id} delay={i * 70}>
                  <ProjectCard project={project} index={i} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* faqs + enquiry */}
      <section className="section border-t border-white/[0.07] bg-ink-soft/40" id="enquiry">
        <div className="shell grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <p className="eyebrow">
              <span className="dot" aria-hidden="true" />
              Questions
            </p>
            <h2 className="mt-4 text-display-md text-white">
              {service.shortName} FAQs
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-mute-onDark">
              The questions clients ask most before starting. Anything else, ask directly below.
            </p>
            <div className="mt-8">
              <Accordion
                items={faqItems}
                defaultOpenId={faqItems[0]?.id}
              />
            </div>
          </div>

          <div className="card-dark p-6 sm:p-8">
            <h2 className="text-display-sm text-white">Tell us about your project</h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-mute-onDark">
              Send a few details and we will reply within one business day with next steps — or an honest
              answer if we are not the right fit.
            </p>
            <div className="mt-6">
              <Suspense fallback={<FormSkeleton />}>
                <EnquiryForm
                  defaultService={service.key}
                  source="SERVICE_PAGE"
                  compact
                  whatsapp={settings.whatsapp}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* related services */}
      {related.length > 0 && (
        <section className="section">
          <div className="shell">
            <SectionHeading eyebrow="Also consider" title="Related services" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {related.map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${s.slug}`}
                  className="group flex items-start justify-between gap-6 rounded-2xl border border-white/[0.08] bg-ink-soft p-6 transition hover:border-white/20"
                >
                  <span>
                    <span className="flex items-center gap-2 text-[15px] font-semibold text-white">
                      <ServiceIcon name={s.icon} className="h-4 w-4 text-brand-soft" />
                      {s.name}
                    </span>
                    <span className="mt-2 block text-[13px] leading-relaxed text-mute-onDark">
                      {s.tagline}
                    </span>
                  </span>
                  <ArrowUpRight
                    size={17}
                    className="mt-1 flex-none text-white/60 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-soft"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand
        headline="Prefer to talk it through?"
        text="A 30-minute call is usually enough to scope the next step. No pitch deck, no pressure."
        primaryLabel="Book a free consultation"
        secondaryLabel="See our work"
        secondaryHref="/work"
      />
    </>
  );
}

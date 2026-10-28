import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, Star } from 'lucide-react';
import { HeroVisual } from '@/src/components/site/hero-visual';
import {
  CtaBand,
  ProcessTimeline,
  SectionHeading,
  ServiceCards,
  WhyApronix,
} from '@/src/components/site/sections';
import { ProjectCard } from '@/src/components/site/project-card';
import { PostCard } from '@/src/components/site/post-card';
import { Accordion, Reveal } from '@/src/components/ui/accordion';
import { Breadcrumbs } from '@/src/components/site/breadcrumbs';
import {
  getApprovedTestimonials,
  getFaqs,
  getFeaturedProjects,
  getServices,
  getBlogPosts,
} from '@/src/lib/content';
import { getSiteSettings } from '@/src/lib/settings';
import { buildMetadata, faqSchema } from '@/src/lib/seo';
import { PAGE_KEYWORDS } from '@/src/lib/keywords';
import { CAPABILITIES } from '@/src/lib/constants';

export const metadata: Metadata = buildMetadata({
  title: 'Apronix Tech — Social Media, Shopify & WordPress Development',
  description:
    'Make your brand impossible to ignore. Apronix Tech provides social media management and high-performing Shopify and WordPress website design and development.',
  path: '/',
  keywords: [...PAGE_KEYWORDS.home],
});

export const revalidate = 300;

export default async function HomePage() {
  const [services, featuredProjects, posts, faqs, testimonials, settings] = await Promise.all([
    getServices(),
    getFeaturedProjects(3),
    getBlogPosts({ perPage: 3 }),
    getFaqs(null),
    getApprovedTestimonials(),
    getSiteSettings(),
  ]);

  const faqLd = faqSchema(faqs.map((f) => ({ question: f.question, answer: f.answer })));
  const showTestimonials = settings.showTestimonials && testimonials.length > 0;

  return (
    <>
      {faqLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      )}

      {/* ---------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.55]" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(255,48,56,0.20),transparent_65%)] blur-2xl"
          aria-hidden="true"
        />
        <div className="shell relative pb-20 pt-12 sm:pb-24 sm:pt-16 lg:pb-28 lg:pt-20">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div>
              <Reveal>
                <p className="eyebrow">
                  <span className="dot" aria-hidden="true" />
                  Social · Shopify · WordPress
                </p>
              </Reveal>

              <Reveal delay={60}>
                <h1 className="mt-5 text-display-xl text-white">
                  Make your brand
                  <br />
                  <span className="text-white/70">impossible to</span>{' '}
                  <span className="relative inline-block">
                    ignore.
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-brand via-brand to-transparent"
                    />
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={120}>
                <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-mute-onDark text-pretty">
                  We help ambitious businesses grow through strategic social media management and
                  high-performing Shopify and WordPress websites.
                </p>
              </Reveal>

              <Reveal delay={180}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/contact"
                    className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-brand px-7 text-[14.5px] font-semibold text-white shadow-[0_16px_44px_-18px_rgba(255,48,56,0.95)] transition hover:bg-brand-dark active:scale-[0.99]"
                  >
                    Book a free consultation
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                  <Link
                    href="/work"
                    className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full border border-white/15 px-7 text-[14.5px] font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.06]"
                  >
                    Explore our work
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={240}>
                <ul className="mt-9 flex flex-wrap gap-x-5 gap-y-2.5">
                  {['No obligation consultation', 'Clear fixed-fee scopes', 'Reply within one business day'].map(
                    (item) => (
                      <li key={item} className="inline-flex items-center gap-1.5 text-[12.5px] text-white/60">
                        <Check size={13} className="text-brand-soft" aria-hidden="true" />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </Reveal>
            </div>

            <Reveal delay={140} className="relative pb-8 lg:pb-0">
              <HeroVisual />
            </Reveal>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- trust */}
      <section aria-labelledby="capabilities-heading" className="border-y border-white/[0.07] bg-ink-soft/60">
        <div className="shell py-8">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="capabilities-heading"
              className="flex-none text-[11px] font-bold uppercase tracking-[0.18em] text-white/60"
            >
              What we do
            </h2>
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
              {CAPABILITIES.slice(0, 6).map((item) => (
                <li key={item} className="text-[13px] font-medium text-white/65">
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/services"
              className="inline-flex min-h-[44px] flex-none items-center gap-1 text-[12.5px] font-semibold text-white transition hover:text-brand-soft sm:min-h-0"
            >
              All services
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ services */}
      <section className="section" aria-labelledby="services-heading">
        <div className="shell">
          <SectionHeading
            eyebrow="Services"
            title={
              <span id="services-heading">
                Three disciplines.
                <br />
                <span className="text-white/65">One coherent presence.</span>
              </span>
            }
            description="Whether people find you in a feed or in search, the experience has to hold together. We handle the strategy, the content and the build."
            action={
              <Link
                href="/services"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-[13.5px] font-semibold text-white transition hover:bg-white/[0.07]"
              >
                Compare services
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            }
          />
          <div className="mt-10">
            <ServiceCards services={services} />
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- why */}
      <section className="section border-t border-white/[0.07] bg-ink-soft/40" aria-labelledby="why-heading">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow">
                <span className="dot" aria-hidden="true" />
                Why Apronix
              </p>
              <h2 id="why-heading" className="mt-4 text-display-md text-white">
                Strategy first.
                <br />
                <span className="text-white/65">Then the pixels.</span>
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-mute-onDark">
                We are a small team by design — the people who plan your project are the people who
                deliver it. That keeps decisions fast and quality consistent.
              </p>
              <p className="mt-6 flex items-baseline gap-2 text-[13px] text-white/65">
                <span className="text-[26px] font-semibold text-white">{services.length}</span>
                core service lines, each led by a named owner
              </p>
            </div>
            <WhyApronix />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- projects */}
      {featuredProjects.length > 0 && (
        <section className="section" aria-labelledby="work-heading">
          <div className="shell">
            <SectionHeading
              eyebrow="Selected work"
              title={<span id="work-heading">Recent projects</span>}
              description="A look at how we structure engagements. Every project page documents the brief, the constraints and what we actually shipped."
              action={
                <Link
                  href="/work"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-[13.5px] font-semibold text-white transition hover:bg-white/[0.07]"
                >
                  View all work
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              }
            />
            {featuredProjects.some((p) => p.isSampleContent) && (
              <p className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-2.5 text-[12.5px] text-amber-100">
                Some entries below are sample placeholders included with this build. Replace them with
                real, authorised projects from the admin dashboard before launch.
              </p>
            )}
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project, index) => (
                <Reveal key={project.id} delay={index * 80} as="div">
                  <ProjectCard project={project} index={index} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------ process */}
      <section className="section border-t border-white/[0.07] bg-ink-soft/40" aria-labelledby="process-heading">
        <div className="shell">
          <SectionHeading
            eyebrow="How we work"
            title={<span id="process-heading">A process you can plan around</span>}
            description="Six stages, each with a defined output. You always know what is happening now and what comes next."
          />
          <div className="mt-10">
            <ProcessTimeline />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- testimonials */}
      {showTestimonials && (
        <section className="section" aria-labelledby="testimonials-heading">
          <div className="shell">
            <SectionHeading
              eyebrow="Client feedback"
              title={<span id="testimonials-heading">What clients say</span>}
              description="Published with permission. Every quote below has been approved by the client."
            />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {testimonials.slice(0, 3).map((t, i) => (
                <Reveal key={t.id} delay={i * 80} className="card-dark flex h-full flex-col p-6">
                  {t.rating ? (
                    <div className="flex gap-0.5" aria-label={`${t.rating} out of 5`}>
                      {Array.from({ length: t.rating }).map((_, idx) => (
                        <Star key={idx} size={13} className="fill-brand text-brand-soft" aria-hidden="true" />
                      ))}
                    </div>
                  ) : null}
                  <blockquote className="mt-4 flex-1 text-[14.5px] leading-relaxed text-white/85">
                    “{t.quote}”
                  </blockquote>
                  <footer className="mt-5 border-t border-white/[0.07] pt-4 text-[12.5px]">
                    <span className="font-semibold text-white">{t.authorName}</span>
                    {(t.authorRole || t.company) && (
                      <span className="text-white/65">
                        {t.authorRole ? ` · ${t.authorRole}` : ''}
                        {t.company ? ` · ${t.company}` : ''}
                      </span>
                    )}
                  </footer>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------------- faq */}
      {faqs.length > 0 && (
        <section className="section border-t border-white/[0.07] bg-ink-soft/40" aria-labelledby="faq-heading">
          <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="eyebrow">
                <span className="dot" aria-hidden="true" />
                Questions
              </p>
              <h2 id="faq-heading" className="mt-4 text-display-md text-white">
                Good to know
              </h2>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-mute-onDark">
                Still unsure about something? Ask us directly — we answer plainly, even when the answer
                is “that is not the right fit for us”.
              </p>
              <Link
                href="/contact"
                className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 text-[13.5px] font-semibold text-white transition hover:text-brand-soft sm:min-h-0"
              >
                Ask a question
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <Accordion
              items={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
              defaultOpenId={faqs[0]?.id}
            />
          </div>
        </section>
      )}

      {/* -------------------------------------------------------------- blog */}
      {posts.items.length > 0 && (
        <section className="section" aria-labelledby="journal-heading">
          <div className="shell">
            <SectionHeading
              eyebrow="Journal"
              title={<span id="journal-heading">Practical notes on digital growth</span>}
              description="Plain-English writing about social media, storefronts and websites — no recycled listicles."
              action={
                <Link
                  href="/blog"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-[13.5px] font-semibold text-white transition hover:bg-white/[0.07]"
                >
                  Read the blog
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              }
            />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {posts.items.map((post, index) => (
                <Reveal key={post.slug} delay={index * 80}>
                  <PostCard post={post} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand />

      <div className="shell pb-10">
        <Breadcrumbs items={[{ name: 'Home', href: '/' }]} className="pt-6" />
      </div>
    </>
  );
}

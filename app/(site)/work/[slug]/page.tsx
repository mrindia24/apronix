import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ArrowUpRight, CalendarDays, ExternalLink, User } from 'lucide-react';
import { Breadcrumbs } from '@/src/components/site/breadcrumbs';
import { CtaBand, SectionHeading } from '@/src/components/site/sections';
import { ProjectCard } from '@/src/components/site/project-card';
import { Reveal } from '@/src/components/ui/accordion';
import { getProjectBySlug, getProjects, getRelatedProjects } from '@/src/lib/content';
import { buildMetadata, breadcrumbSchema } from '@/src/lib/seo';
import { formatDate } from '@/src/lib/utils';

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) {
    return { title: 'Project not found — Apronix Tech', robots: { index: false, follow: false } };
  }
  return buildMetadata({
    title: project.seoTitle || `${project.title} | Apronix Tech`,
    description: project.seoDescription || project.shortDescription,
    path: `/work/${project.slug}`,
    image: project.featuredImage,
  });
}

const SECTIONS = [
  { key: 'brief', title: 'The brief' },
  { key: 'challenges', title: 'Challenges' },
  { key: 'strategy', title: 'Strategy' },
  { key: 'solution', title: 'What we built' },
] as const;

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const related = await getRelatedProjects(project.slug, project.serviceCategory, 3);
  const servicePathMap: Record<string, string> = {
    SHOPIFY_DEVELOPMENT: '/services/shopify-development',
    WORDPRESS_DEVELOPMENT: '/services/wordpress-development',
    SOCIAL_MEDIA_MANAGEMENT: '/services/social-media-management',
  };

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Work', href: '/work' },
    { name: project.title, href: `/work/${project.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }}
      />

      <article>
        <section className="relative border-b border-white/[0.07]">
          <div className="shell py-10 sm:py-14">
            <Breadcrumbs items={crumbs} />
            <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand/12 px-3 py-1 text-[11.5px] font-semibold text-brand-soft">
                    {project.categoryLabel}
                  </span>
                  {project.industry && (
                    <span className="rounded-full border border-white/12 px-3 py-1 text-[11.5px] text-white/60">
                      {project.industry}
                    </span>
                  )}
                  {project.isSampleContent && (
                    <span className="rounded-full bg-amber-300 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-black">
                      Sample content
                    </span>
                  )}
                </div>
                <h1 className="mt-5 text-display-lg text-white">{project.title}</h1>
                <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-mute-onDark text-pretty">
                  {project.shortDescription}
                </p>
              </div>

              <dl className="grid gap-4 rounded-2xl border border-white/[0.08] bg-ink-soft p-6 sm:grid-cols-2">
                {project.clientName && (
                  <div>
                    <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                      <User size={11} aria-hidden="true" /> Client
                    </dt>
                    <dd className="mt-1 text-[13.5px] text-white/85">{project.clientName}</dd>
                  </div>
                )}
                {project.launchDate && (
                  <div>
                    <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                      <CalendarDays size={11} aria-hidden="true" /> Launched
                    </dt>
                    <dd className="mt-1 text-[13.5px] text-white/85">{formatDate(project.launchDate)}</dd>
                  </div>
                )}
                {project.serviceCategory && (
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                      Service
                    </dt>
                    <dd className="mt-1">
                      <Link
                        href={servicePathMap[project.serviceCategory] ?? '/services'}
                        className="text-[13.5px] text-brand-soft underline decoration-brand/30 underline-offset-2 hover:text-white"
                      >
                        {project.categoryLabel}
                      </Link>
                    </dd>
                  </div>
                )}
                {project.projectUrl && (
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                      Live site
                    </dt>
                    <dd className="mt-1">
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1 text-[13.5px] text-white/85 hover:text-white"
                      >
                        Visit
                        <ExternalLink size={12} aria-hidden="true" />
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </section>

        {/* cover */}
        <div className="shell pt-10">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-soft sm:aspect-[16/9]">
            {project.featuredImage ? (
              <Image
                src={project.featuredImage}
                alt={project.featuredImageAlt || `${project.title} cover image`}
                fill
                priority
                sizes="(max-width: 1240px) 100vw, 1240px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[linear-gradient(150deg,#12151B,#3B0C10_60%,#8E161C)]">
                <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/60">
                  {project.categoryLabel}
                </span>
              </div>
            )}
          </div>
        </div>

        <section className="section">
          <div className="shell grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div className="space-y-10">
              <div>
                <h2 className="text-display-sm text-white">Overview</h2>
                <div className="mt-4 space-y-4">
                  {project.overview.split('\n\n').map((para, i) => (
                    <p key={i} className="text-[15px] leading-[1.75] text-mute-onDark">
                      {para}
                    </p>
                  ))}
                </div>
              </div>

              {SECTIONS.map((section) => {
                const value = project[section.key];
                if (!value) return null;
                return (
                  <div key={section.key} className="border-t border-white/[0.07] pt-8">
                    <h2 className="text-[18px] font-semibold text-white">{section.title}</h2>
                    <p className="mt-3 whitespace-pre-line text-[14.5px] leading-[1.75] text-mute-onDark">
                      {value}
                    </p>
                  </div>
                );
              })}

              {project.images.length > 0 && (
                <div className="border-t border-white/[0.07] pt-8">
                  <h2 className="text-[18px] font-semibold text-white">Gallery</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {project.images.map((image) => (
                      <figure key={image.id}>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.08]">
                          <Image
                            src={image.url}
                            alt={image.alt}
                            fill
                            sizes="(max-width: 768px) 100vw, 40vw"
                            className="object-cover"
                          />
                        </div>
                        {image.caption && (
                          <figcaption className="mt-2 text-[12px] text-white/65">{image.caption}</figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
              {project.technologies.length > 0 && (
                <div className="card-dark p-6">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
                    Technologies
                  </h2>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <li
                        key={tech}
                        className="rounded-full border border-white/10 px-2.5 py-1 text-[11.5px] text-white/65"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.deliverables.length > 0 && (
                <div className="card-dark p-6">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
                    Deliverables
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {project.deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[13px] text-white/75">
                        <span className="mt-[7px] h-1 w-1 flex-none rounded-full bg-brand" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-2xl border border-brand/25 bg-brand/[0.07] p-6">
                <h2 className="text-[15px] font-semibold text-white">Need something similar?</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-white/70">
                  We will scope it honestly — including telling you if a smaller first step makes more
                  sense.
                </p>
                <Link
                  href="/contact"
                  className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-semibold text-white transition hover:bg-brand-dark"
                >
                  Start a conversation
                  <ArrowUpRight size={13} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {project.isSampleContent && (
          <div className="shell pb-4">
            <p className="rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3 text-[12.5px] leading-relaxed text-amber-100">
              This page is sample content included with the site build. It exists to demonstrate the
              project template and does not describe real client work.
            </p>
          </div>
        )}
      </article>

      {related.length > 0 && (
        <section className="section border-t border-white/[0.07] bg-ink-soft/40">
          <div className="shell">
            <SectionHeading
              eyebrow="More work"
              title="Related projects"
              action={
                <Link
                  href="/work"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-[13.5px] font-semibold text-white transition hover:bg-white/[0.07]"
                >
                  All projects
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              }
            />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {related.map((item, i) => (
                <Reveal key={item.id} delay={i * 70}>
                  <ProjectCard project={item} index={i} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand />
    </>
  );
}

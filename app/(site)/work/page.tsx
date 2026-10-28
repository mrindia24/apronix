import type { Metadata } from 'next';
import { Breadcrumbs } from '@/src/components/site/breadcrumbs';
import { CtaBand } from '@/src/components/site/sections';
import { WorkFilters } from '@/src/components/site/work-filters';
import { getProjects } from '@/src/lib/content';
import { buildMetadata, breadcrumbSchema } from '@/src/lib/seo';
import { PAGE_KEYWORDS } from '@/src/lib/keywords';

export const metadata: Metadata = buildMetadata({
  title: 'Our Work — Shopify, WordPress & Social Media Projects | Apronix Tech',
  description:
    'Selected projects from Apronix Tech across Shopify storefronts, WordPress websites and social media management. Each project page documents the brief, constraints and delivery.',
  path: '/work',
  keywords: [...PAGE_KEYWORDS.work],
});

export const revalidate = 600;

export default async function WorkPage() {
  const projects = await getProjects();
  const hasSamples = projects.some((p) => p.isSampleContent);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: 'Home', href: '/' },
              { name: 'Work', href: '/work' },
            ]),
          ),
        }}
      />

      <section className="relative overflow-hidden border-b border-white/[0.07]">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" aria-hidden="true" />
        <div className="shell relative py-12 sm:py-16">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Work', href: '/work' }]} />
          <div className="mt-8 max-w-3xl">
            <p className="eyebrow">
              <span className="dot" aria-hidden="true" />
              Selected work
            </p>
            <h1 className="mt-5 text-display-lg text-white">
              Projects, documented
              <br />
              <span className="text-white/65">properly.</span>
            </h1>
            <p className="mt-6 text-[15.5px] leading-relaxed text-mute-onDark text-pretty">
              Each project page shows the brief, the constraints we worked within and what was delivered.
              We publish work only where the client has approved the details — no invented case studies,
              no numbers we cannot substantiate.
            </p>
          </div>
          {hasSamples && (
            <p className="mt-6 max-w-3xl rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3 text-[12.5px] leading-relaxed text-amber-100">
              <strong className="font-semibold">Note:</strong> some entries below are clearly-labelled
              sample placeholders included with this build so you can see how project pages are
              structured. Delete them from the admin dashboard and replace with real, authorised work
              before launch.
            </p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <WorkFilters projects={projects} />
        </div>
      </section>

      <CtaBand
        headline="Want a project like this?"
        text="Tell us about your business and we will suggest the smallest sensible first step."
        primaryLabel="Start a project"
        secondaryLabel="Explore services"
        secondaryHref="/services"
      />
    </>
  );
}

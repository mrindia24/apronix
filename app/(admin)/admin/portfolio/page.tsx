import Link from 'next/link';
import Image from 'next/image';
import { Plus, Star, Pencil, ExternalLink } from 'lucide-react';
import { prisma } from '@/src/lib/prisma';
import { AdminPageHeader, Badge, EmptyState } from '@/src/components/admin/ui';
import { formatDate } from '@/src/lib/utils';
import { deletePortfolioAction, togglePortfolioFeaturedAction } from '@/src/lib/actions/content';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ saved?: string }>;

export default async function AdminPortfolioPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const projects = await prisma.portfolioProject.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Portfolio"
        description="Project pages shown at /work. Only PUBLISHED projects appear on the website. Sample content is labelled in the UI — replace it with authorised client work before launch."
        action={
          <Link
            href="/admin/portfolio/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[12.5px] font-semibold text-white transition hover:bg-brand-dark"
          >
            <Plus size={13} aria-hidden="true" />
            New project
          </Link>
        }
      />

      {sp.saved && (
        <div className="rounded-lg border border-[#1F6F43]/40 bg-[#0C1F16] px-3 py-2 text-[12.5px] text-[#8AF0B4]">
          Project saved.
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project page. Drafts stay hidden from the public site until you publish them."
          action={
            <Link
              href="/admin/portfolio/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-4 text-[12.5px] font-semibold text-white"
            >
              <Plus size={13} aria-hidden="true" /> New project
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {projects.map((project) => (
            <li
              key={project.id}
              className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-ink-soft p-3.5 sm:flex-row sm:items-center"
            >
              <div className="relative h-14 w-20 flex-none overflow-hidden rounded-lg bg-ink">
                {project.featuredImage ? (
                  <Image
                    src={project.featuredImage}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[9px] uppercase tracking-widest text-white/60">
                    No image
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Link
                    href={`/admin/portfolio/${project.id}`}
                    className="text-[13.5px] font-semibold text-white transition hover:text-brand-soft"
                  >
                    {project.title}
                  </Link>
                  {project.featured && <Badge tone="brand">Featured</Badge>}
                  {project.isSampleContent && <Badge tone="warning">Sample</Badge>}
                  <Badge
                    tone={
                      project.status === 'PUBLISHED' ? 'success' : project.status === 'DRAFT' ? 'neutral' : 'danger'
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
                <p className="mt-1 truncate text-[11.5px] text-white/60">
                  /work/{project.slug} · {project.categoryLabel}
                  {project.launchDate ? ` · ${formatDate(project.launchDate)}` : ''}
                </p>
              </div>

              <div className="flex flex-none items-center gap-1.5">
                <form action={togglePortfolioFeaturedAction}>
                  <input type="hidden" name="id" value={project.id} />
                  <button
                    type="submit"
                    title={project.featured ? 'Remove from featured' : 'Feature on homepage'}
                    aria-label={project.featured ? 'Remove from featured' : 'Feature on homepage'}
                    className={`grid h-8 w-8 place-items-center rounded-lg border transition ${
                      project.featured
                        ? 'border-brand/40 bg-brand/10 text-brand-soft'
                        : 'border-white/12 text-white/60 hover:text-white'
                    }`}
                  >
                    <Star size={12} fill={project.featured ? 'currentColor' : 'none'} aria-hidden="true" />
                  </button>
                </form>
                {project.status === 'PUBLISHED' && (
                  <Link
                    href={`/work/${project.slug}`}
                    target="_blank"
                    title="View on site"
                    aria-label="View on site"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/12 text-white/65 transition hover:text-white"
                  >
                    <ExternalLink size={12} aria-hidden="true" />
                  </Link>
                )}
                <Link
                  href={`/admin/portfolio/${project.id}`}
                  aria-label={`Edit ${project.title}`}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/12 text-white/70 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <Pencil size={12} aria-hidden="true" />
                </Link>
                <form action={deletePortfolioAction}>
                  <input type="hidden" name="id" value={project.id} />
                  <button
                    type="submit"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/12 text-white/60 transition hover:border-brand/40 hover:text-brand-soft"
                    aria-label={`Delete ${project.title}`}
                    title="Delete"
                  >
                    ×
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

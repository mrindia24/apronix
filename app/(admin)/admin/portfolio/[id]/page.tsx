import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { prisma } from '@/src/lib/prisma';
import { AdminPageHeader } from '@/src/components/admin/ui';
import { PortfolioForm } from '@/src/components/admin/portfolio-form';

export const dynamic = 'force-dynamic';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, media] = await Promise.all([
    prisma.portfolioProject.findUnique({ where: { id } }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
  ]);

  if (!project) notFound();

  return (
    <div className="space-y-5">
      <Link
        href="/admin/portfolio"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white/65 transition hover:text-white"
      >
        <ArrowLeft size={13} aria-hidden="true" />
        Portfolio
      </Link>
      <AdminPageHeader
        title="Edit project"
        description={`/work/${project.slug}`}
        action={
          project.status === 'PUBLISHED' ? (
            <Link
              href={`/work/${project.slug}`}
              target="_blank"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 px-3 text-[12.5px] font-semibold text-white transition hover:bg-white/[0.06]"
            >
              <ExternalLink size={12} aria-hidden="true" />
              View live
            </Link>
          ) : undefined
        }
      />
      <PortfolioForm
        project={project}
        mediaOptions={media.map((m) => ({ url: m.url, alt: m.alt ?? '', label: m.originalName }))}
      />
    </div>
  );
}

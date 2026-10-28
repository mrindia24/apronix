import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/src/lib/prisma';
import { AdminPageHeader } from '@/src/components/admin/ui';
import { PortfolioForm } from '@/src/components/admin/portfolio-form';

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
  const media = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });

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
        title="New project"
        description="Create a project page. It stays hidden from the website until you set the status to Published."
      />
      <PortfolioForm
        mediaOptions={media.map((m) => ({ url: m.url, alt: m.alt ?? '', label: m.originalName }))}
      />
    </div>
  );
}

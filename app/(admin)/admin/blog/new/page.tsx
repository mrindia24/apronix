import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/src/lib/prisma';
import { AdminPageHeader } from '@/src/components/admin/ui';
import { BlogForm } from '@/src/components/admin/blog-form';

export const dynamic = 'force-dynamic';

export default async function NewPostPage() {
  const [categories, tags, media] = await Promise.all([
    prisma.blogCategory.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.blogTag.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
  ]);

  return (
    <div className="space-y-5">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white/65 transition hover:text-white"
      >
        <ArrowLeft size={13} aria-hidden="true" />
        Blog
      </Link>
      <AdminPageHeader
        title="New article"
        description="Drafts are private. Set status to Published when you are ready — the sitemap and blog listing update automatically."
      />
      <BlogForm
        categories={categories}
        tags={tags}
        mediaOptions={media.map((m) => ({ url: m.url, label: m.originalName }))}
      />
    </div>
  );
}

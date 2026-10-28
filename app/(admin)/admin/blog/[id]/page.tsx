import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/src/lib/prisma';
import { AdminPageHeader } from '@/src/components/admin/ui';
import { BlogForm } from '@/src/components/admin/blog-form';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categories, tags, media] = await Promise.all([
    prisma.blogPost.findUnique({ where: { id }, include: { tags: { select: { tagId: true } } } }),
    prisma.blogCategory.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.blogTag.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
  ]);

  if (!post) notFound();

  return (
    <div className="space-y-5">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white/65 transition hover:text-white"
      >
        <ArrowLeft size={13} aria-hidden="true" />
        Blog
      </Link>
      <AdminPageHeader title="Edit article" description={`/blog/${post.slug}`} />
      <BlogForm
        post={{ ...post, tagIds: post.tags.map((t) => t.tagId) }}
        categories={categories}
        tags={tags}
        mediaOptions={media.map((m) => ({ url: m.url, label: m.originalName }))}
      />
    </div>
  );
}

import Link from 'next/link';
import { ExternalLink, Pencil, Plus, Tags } from 'lucide-react';
import { prisma } from '@/src/lib/prisma';
import { AdminPageHeader, Badge, EmptyState } from '@/src/components/admin/ui';
import { formatDate, titleCase } from '@/src/lib/utils';
import { deleteBlogPostAction, setBlogPostStatusAction } from '@/src/lib/actions/content';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ saved?: string; status?: string }>;

export default async function AdminBlogPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const posts = await prisma.blogPost.findMany({
    orderBy: [{ createdAt: 'desc' }],
    include: { category: { select: { name: true } }, _count: { select: { tags: true } } },
    ...(sp.status ? { where: { status: sp.status as 'DRAFT' } } : {}),
  });

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Blog"
        description="Write, preview and publish articles. Only published articles with a past publication date appear on the public blog and sitemap."
        action={
          <>
            <Link
              href="/admin/blog/categories"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 px-3 text-[12.5px] font-semibold text-white transition hover:bg-white/[0.06]"
            >
              <Tags size={13} aria-hidden="true" />
              Categories
            </Link>
            <Link
              href="/admin/blog/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[12.5px] font-semibold text-white transition hover:bg-brand-dark"
            >
              <Plus size={13} aria-hidden="true" />
              New article
            </Link>
          </>
        }
      />

      {sp.saved && (
        <div className="rounded-lg border border-[#1F6F43]/40 bg-[#0C1F16] px-3 py-2 text-[12.5px] text-[#8AF0B4]">
          Article saved.
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {[
          { label: 'All', value: '' },
          { label: 'Published', value: 'PUBLISHED' },
          { label: 'Drafts', value: 'DRAFT' },
          { label: 'Archived', value: 'ARCHIVED' },
        ].map((filter) => (
          <Link
            key={filter.label}
            href={filter.value ? `/admin/blog?status=${filter.value}` : '/admin/blog'}
            className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
              (sp.status ?? '') === filter.value
                ? 'border-brand bg-brand text-white'
                : 'border-white/12 text-white/60 hover:text-white'
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <EmptyState
          title="No articles here"
          description="Write your first article. Drafts are private until published."
          action={
            <Link
              href="/admin/blog/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-4 text-[12.5px] font-semibold text-white"
            >
              <Plus size={13} aria-hidden="true" /> New article
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex flex-col gap-2 rounded-xl border border-white/[0.08] bg-ink-soft p-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="text-[13.5px] font-semibold text-white transition hover:text-brand-soft"
                  >
                    {post.title}
                  </Link>
                  <Badge
                    tone={post.status === 'PUBLISHED' ? 'success' : post.status === 'DRAFT' ? 'neutral' : 'danger'}
                  >
                    {titleCase(post.status)}
                  </Badge>
                  {post.featured && <Badge tone="brand">Featured</Badge>}
                  {post.isSampleContent && <Badge tone="warning">Sample</Badge>}
                </div>
                <p className="mt-1 text-[11.5px] text-white/60">
                  /blog/{post.slug} · {post.category?.name ?? 'No category'} · {post.readingMinutes} min
                  {post.publishedAt ? ` · published ${formatDate(post.publishedAt)}` : ''}
                  {post._count.tags > 0 ? ` · ${post._count.tags} tags` : ''}
                </p>
              </div>

              <div className="flex flex-none items-center gap-1.5">
                <form action={setBlogPostStatusAction}>
                  <input type="hidden" name="id" value={post.id} />
                  <input
                    type="hidden"
                    name="status"
                    value={
                      post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
                    }
                  />
                  <button
                    type="submit"
                    className={`h-8 rounded-lg border px-2.5 text-[11.5px] font-semibold transition ${
                      post.status === 'PUBLISHED'
                        ? 'border-white/12 text-white/60 hover:text-white'
                        : 'border-brand/40 bg-brand/10 text-brand-soft hover:bg-brand/20'
                    }`}
                  >
                    {post.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                  </button>
                </form>
                {post.status === 'PUBLISHED' && (
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    aria-label="View article"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/12 text-white/65 transition hover:text-white"
                  >
                    <ExternalLink size={12} aria-hidden="true" />
                  </Link>
                )}
                <Link
                  href={`/admin/blog/${post.id}`}
                  aria-label="Edit article"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/12 text-white/70 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <Pencil size={12} aria-hidden="true" />
                </Link>
                <form action={deleteBlogPostAction}>
                  <input type="hidden" name="id" value={post.id} />
                  <button
                    type="submit"
                    aria-label="Delete article"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/12 text-white/60 transition hover:border-brand/40 hover:text-brand-soft"
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

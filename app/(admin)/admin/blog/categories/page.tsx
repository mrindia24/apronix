import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { prisma } from '@/src/lib/prisma';
import { AdminPageHeader, Card, SubmitButton, inputClass } from '@/src/components/admin/ui';
import { createCategoryAction, createTagAction, deleteCategoryAction, deleteTagAction } from '@/src/lib/actions/content';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const [categories, tags] = await Promise.all([
    prisma.blogCategory.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { posts: true } } },
    }),
    prisma.blogTag.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { posts: true } } } }),
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
        title="Categories & tags"
        description="Categories group articles into the main topics. Tags support finer filtering and related content."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Categories">
          <form action={createCategoryAction} className="flex gap-2">
            <label htmlFor="category-name" className="sr-only">
              New category name
            </label>
            <input id="category-name" name="name" placeholder="New category name" className={inputClass} required minLength={2} />
            <SubmitButton>
              <Plus size={12} aria-hidden="true" /> Add
            </SubmitButton>
          </form>

          <ul className="mt-4 divide-y divide-white/[0.06]">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <p className="text-[13px] font-medium text-white">{category.name}</p>
                  <p className="text-[11px] text-white/60">
                    /blog?category={category.slug} · {category._count.posts} article
                    {category._count.posts === 1 ? '' : 's'}
                  </p>
                </div>
                <form action={deleteCategoryAction}>
                  <input type="hidden" name="id" value={category.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-white/12 px-2 py-1 text-[11px] text-white/65 transition hover:border-brand/40 hover:text-brand-soft"
                  >
                    Delete
                  </button>
                </form>
              </li>
            ))}
            {categories.length === 0 && <li className="py-3 text-[12.5px] text-white/60">No categories yet.</li>}
          </ul>
        </Card>

        <Card title="Tags">
          <form action={createTagAction} className="flex gap-2">
            <label htmlFor="tag-name" className="sr-only">
              New tag name
            </label>
            <input id="tag-name" name="name" placeholder="New tag name" className={inputClass} required minLength={2} />
            <SubmitButton>
              <Plus size={12} aria-hidden="true" /> Add
            </SubmitButton>
          </form>

          <ul className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag.id} className="flex items-center gap-1 rounded-full border border-white/12 px-2.5 py-1 text-[11.5px] text-white/70">
                {tag.name}
                <span className="text-white/30">({tag._count.posts})</span>
                <form action={deleteTagAction}>
                  <input type="hidden" name="id" value={tag.id} />
                  <button type="submit" aria-label={`Delete tag ${tag.name}`} className="text-white/30 hover:text-brand-soft">
                    ×
                  </button>
                </form>
              </li>
            ))}
            {tags.length === 0 && <li className="text-[12.5px] text-white/60">No tags yet.</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
}

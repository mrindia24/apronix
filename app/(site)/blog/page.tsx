import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/src/components/site/breadcrumbs';
import { BlogFilters } from '@/src/components/site/blog-filters';
import { PostCard } from '@/src/components/site/post-card';
import { CtaBand } from '@/src/components/site/sections';
import { getBlogCategories, getBlogPosts, getFeaturedPosts } from '@/src/lib/content';
import { buildMetadata, breadcrumbSchema } from '@/src/lib/seo';
import { cn } from '@/src/lib/utils';

type SearchParams = Promise<{ q?: string; category?: string; page?: string; tag?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  const hasFilters = Boolean(sp.q || sp.category || sp.tag);
  const page = Number(sp.page ?? '1');
  const base = buildMetadata({
    title: 'Blog — Practical Notes on Social Media, Shopify & WordPress | Apronix Tech',
    description:
      'Practical articles on social media strategy, Shopify storefronts, WordPress websites, conversion and growing a small business online.',
    path: '/blog',
  });

  // Filtered and paginated views are not canonical targets.
  if (hasFilters || page > 1) {
    return {
      ...base,
      alternates: { canonical: `${buildMetadata({ title: '', description: '', path: '/blog' }).alternates?.canonical}` },
      robots: { index: false, follow: true },
    };
  }
  return base;
}

export const revalidate = 300;

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? '1') || 1);

  const [{ items, total, totalPages }, categories, featured] = await Promise.all([
    getBlogPosts({ page, perPage: 9, search: sp.q, category: sp.category, tag: sp.tag }),
    getBlogCategories(),
    getFeaturedPosts(1),
  ]);

  const showFeatured = !sp.q && !sp.category && !sp.tag && page === 1 && featured.length > 0;
  const list = showFeatured ? items.filter((i) => i.slug !== featured[0]!.slug) : items;

  const buildPageHref = (target: number) => {
    const search = new URLSearchParams();
    if (sp.q) search.set('q', sp.q);
    if (sp.category) search.set('category', sp.category);
    if (sp.tag) search.set('tag', sp.tag);
    if (target > 1) search.set('page', String(target));
    const qs = search.toString();
    return qs ? `/blog?${qs}` : '/blog';
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: 'Home', href: '/' },
              { name: 'Blog', href: '/blog' },
            ]),
          ),
        }}
      />

      <section className="relative overflow-hidden border-b border-white/[0.07]">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" aria-hidden="true" />
        <div className="shell relative py-12 sm:py-16">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Blog', href: '/blog' }]} />
          <div className="mt-8 max-w-3xl">
            <p className="eyebrow">
              <span className="dot" aria-hidden="true" />
              Journal
            </p>
            <h1 className="mt-5 text-display-lg text-white">
              Notes from the work
              <br />
              <span className="text-white/65">we actually do.</span>
            </h1>
            <p className="mt-6 text-[15.5px] leading-relaxed text-mute-onDark text-pretty">
              Practical writing about social media, storefronts and websites — the decisions, trade-offs
              and checklists we use with clients. No recycled listicles.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <BlogFilters
            categories={categories.map((c) => ({
              slug: c.slug,
              name: c.name,
              count: c._count.posts,
            }))}
          />

          {showFeatured && featured[0] && (
            <div className="mt-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">Featured</p>
              <div className="mt-3">
                <PostCard post={featured[0]} featured />
              </div>
            </div>
          )}

          <p className="mt-8 text-[12.5px] text-white/65" aria-live="polite">
            {total} article{total === 1 ? '' : 's'}
            {sp.q ? ` matching “${sp.q}”` : ''}
            {sp.category ? ` in ${categories.find((c) => c.slug === sp.category)?.name ?? sp.category}` : ''}
          </p>

          {list.length > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {list.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-white/12 p-10 text-center">
              <p className="text-[15px] font-semibold text-white">No articles found</p>
              <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-mute-onDark">
                Try a different search term, or browse all articles.
              </p>
              <Link
                href="/blog"
                className="mt-5 inline-flex h-10 items-center rounded-full border border-white/15 px-5 text-[13px] font-semibold text-white transition hover:bg-white/[0.07]"
              >
                Clear filters
              </Link>
            </div>
          )}

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-10 flex items-center justify-between border-t border-white/[0.08] pt-6">
              {page > 1 ? (
                <Link
                  href={buildPageHref(page - 1)}
                  rel="prev"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/70 transition hover:text-white"
                >
                  <ArrowLeft size={14} aria-hidden="true" />
                  Previous
                </Link>
              ) : (
                <span aria-hidden="true" />
              )}

              <ul className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const target = i + 1;
                  const isCurrent = target === page;
                  return (
                    <li key={target}>
                      <Link
                        href={buildPageHref(target)}
                        aria-current={isCurrent ? 'page' : undefined}
                        className={cn(
                          'grid h-11 w-11 place-items-center rounded-full text-[13px] font-semibold transition sm:h-9 sm:w-9',
                          isCurrent
                            ? 'bg-brand text-white'
                            : 'text-white/60 hover:bg-white/[0.07] hover:text-white',
                        )}
                      >
                        {target}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {page < totalPages ? (
                <Link
                  href={buildPageHref(page + 1)}
                  rel="next"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/70 transition hover:text-white"
                >
                  Next
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              ) : (
                <span aria-hidden="true" />
              )}
            </nav>
          )}
        </div>
      </section>

      <CtaBand
        headline="Want this thinking applied to your business?"
        text="We are happy to talk through where your digital presence is losing you customers."
        primaryLabel="Book a consultation"
      />
    </>
  );
}

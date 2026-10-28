import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import { Breadcrumbs } from '@/src/components/site/breadcrumbs';
import { CtaBand } from '@/src/components/site/sections';
import { PostCard } from '@/src/components/site/post-card';
import { ShareButtons } from '@/src/components/site/share-buttons';
import { getPostBySlug, getRelatedPosts, getPostSlugs } from '@/src/lib/content';
import { renderMarkdown } from '@/src/lib/markdown';
import { buildMetadata, articleSchema, breadcrumbSchema, SITE_URL } from '@/src/lib/seo';
import { formatDate, initials } from '@/src/lib/utils';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: 'Article not found — Apronix Tech', robots: { index: false, follow: false } };
  }
  const published = post.publishedAt ?? post.createdAt;
  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImage,
    type: 'article',
    publishedTime: published.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
    authors: [post.authorName ?? post.author?.name ?? 'Apronix Tech'],
    canonicalOverride: post.canonicalUrl || null,
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const { html, toc } = renderMarkdown(post.content);
  const related = await getRelatedPosts(post.id, post.categoryId, 3);
  const published = post.publishedAt ?? post.createdAt;
  const author = post.authorName ?? post.author?.name ?? 'Apronix Tech';
  const shareUrl = `${SITE_URL}/blog/${post.slug}`;

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: post.title, href: `/blog/${post.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema(crumbs),
            articleSchema({
              title: post.title,
              description: post.excerpt,
              path: `/blog/${post.slug}`,
              image: post.coverImage,
              published: published.toISOString(),
              modified: post.updatedAt.toISOString(),
              author,
            }),
          ]),
        }}
      />

      <article>
        <header className="relative overflow-hidden border-b border-white/[0.07]">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" aria-hidden="true" />
          <div className="shell relative py-10 sm:py-14">
            <Breadcrumbs items={crumbs} />
            <div className="mt-8 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-[11.5px]">
                {post.category && (
                  <Link
                    href={`/blog?category=${post.category.slug}`}
                    className="rounded-full bg-brand/12 px-2.5 py-1 font-semibold text-brand-soft hover:bg-brand/20"
                  >
                    {post.category.name}
                  </Link>
                )}
                {post.isSampleContent && (
                  <span className="rounded-full bg-amber-300 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-black">
                    Sample content
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-white/65">
                  <Clock size={11} aria-hidden="true" />
                  {post.readingMinutes} min read
                </span>
                <span className="text-white/60" aria-hidden="true">
                  ·
                </span>
                <time dateTime={published.toISOString()} className="text-white/65">
                  {formatDate(published, { day: 'numeric', month: 'long', year: 'numeric' })}
                </time>
              </div>

              <h1 className="mt-5 text-display-md text-white sm:text-display-lg">{post.title}</h1>
              <p className="mt-5 text-[16px] leading-relaxed text-mute-onDark text-pretty">{post.excerpt}</p>

              <div className="mt-7 flex items-center justify-between gap-4 border-t border-white/[0.08] pt-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-[12px] font-bold text-white">
                    {initials(author)}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-white">{author}</p>
                    <p className="text-[11.5px] text-white/65">Apronix Tech</p>
                  </div>
                </div>
                <ShareButtons url={shareUrl} title={post.title} />
              </div>
            </div>
          </div>
        </header>

        {post.coverImage && (
          <div className="shell pt-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-white/[0.08]">
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt || post.title}
                fill
                priority
                sizes="(max-width: 1240px) 100vw, 1240px"
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="shell grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
          {/* article body on a light "paper" surface for comfortable reading */}
          <div className="min-w-0">
            <div className="rounded-3xl bg-white p-6 text-ink sm:p-9">
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>

            {post.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">
                  Tags
                </span>
                {post.tags.map(({ tag }) => (
                  <Link
                    key={tag.slug}
                    href={`/blog?tag=${tag.slug}`}
                    className="inline-flex min-h-[36px] items-center rounded-full border border-white/12 px-3 py-1 text-[11.5px] text-white/60 transition hover:border-white/25 hover:text-white"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-ink-soft p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[14px] font-semibold text-white">Found this useful?</p>
                <p className="mt-1 text-[13px] text-mute-onDark">
                  Share it, or get in touch if you want this thinking applied to your business.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex h-10 flex-none items-center justify-center rounded-full bg-brand px-5 text-[13px] font-semibold text-white transition hover:bg-brand-dark"
              >
                Book a consultation
              </Link>
            </div>

            <Link
              href="/blog"
              className="mt-8 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/60 transition hover:text-white"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              All articles
            </Link>
          </div>

          {/* sidebar: sticky table of contents */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            {toc.length > 1 && (
              <nav aria-labelledby="toc-heading" className="rounded-2xl border border-white/[0.08] bg-ink-soft p-5">
                <h2 id="toc-heading" className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
                  On this page
                </h2>
                <ul className="mt-3 space-y-2">
                  {toc.map((item) => (
                    <li key={item.id} className={item.level === 3 ? 'pl-3' : ''}>
                      <a
                        href={`#${item.id}`}
                        className="block text-[12.5px] leading-snug text-white/60 transition hover:text-brand-soft"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section border-t border-white/[0.07] bg-ink-soft/40">
          <div className="shell">
            <h2 className="text-display-sm text-white">Related reading</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <PostCard key={item.slug} post={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand />
    </>
  );
}

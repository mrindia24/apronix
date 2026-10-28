import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import { cn, formatDate } from '@/src/lib/utils';
import type { BlogListItem } from '@/src/lib/content';

export function PostCard({
  post,
  className,
  featured = false,
}: {
  post: Omit<BlogListItem, 'id' | 'featured' | 'isSampleContent' | 'tags' | 'authorName'> & {
    id?: string;
    isSampleContent?: boolean;
  };
  className?: string;
  featured?: boolean;
}) {
  return (
    <article className={cn('group h-full', className)}>
      <Link
        href={`/blog/${post.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-soft transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
      >
        <div className={cn('relative overflow-hidden', featured ? 'aspect-[16/10] sm:aspect-[16/9]' : 'aspect-[16/10]')}>
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt || post.title}
              fill
              sizes={featured ? '(max-width: 1024px) 100vw, 60vw' : '(max-width: 768px) 100vw, 33vw'}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(150deg,#12151B,#3B0C10_60%,#8E161C)]">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/65">
                Apronix Journal
              </span>
            </div>
          )}
          {post.isSampleContent && (
            <span className="absolute left-3 top-3 rounded-full bg-amber-300 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-black">
              Sample
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-white/65">
            {post.category && (
              <span className="rounded-full bg-brand/12 px-2.5 py-0.5 font-semibold text-brand-soft">
                {post.category.name}
              </span>
            )}
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={11} aria-hidden="true" />
              {post.readingMinutes} min read
            </span>
            {post.publishedAt && (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={new Date(post.publishedAt).toISOString()}>
                  {formatDate(post.publishedAt)}
                </time>
              </>
            )}
          </div>

          <h2
            className={cn(
              'mt-3 font-semibold leading-snug text-white',
              featured ? 'text-[20px] sm:text-[23px]' : 'text-[16.5px]',
            )}
          >
            {post.title}
          </h2>
          <p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-mute-onDark">{post.excerpt}</p>

          <span className="mt-auto inline-flex items-center gap-1 pt-5 text-[12.5px] font-semibold text-white">
            Read article
            <ArrowUpRight
              size={13}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </Link>
    </article>
  );
}

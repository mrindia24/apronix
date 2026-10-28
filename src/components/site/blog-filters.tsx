'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type Category = { slug: string; name: string; count: number };

/**
 * Blog search + category filter. Uses shallow URL updates via router.replace so
 * the server re-renders the list (correct pagination + canonical URLs) without a
 * full page reload.
 */
export function BlogFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [term, setTerm] = useState(params.get('q') ?? '');
  const debounce = useRef<number | null>(null);

  const activeCategory = params.get('category') ?? '';
  const hasFilters = Boolean(params.get('q') || activeCategory);

  const buildHref = (next: { q?: string; category?: string }) => {
    const search = new URLSearchParams();
    const q = next.q ?? params.get('q') ?? '';
    const category = next.category ?? activeCategory;
    if (q) search.set('q', q);
    if (category) search.set('category', category);
    const qs = search.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const push = (href: string) => {
    startTransition(() => router.replace(href, { scroll: false }));
  };

  // debounce typing
  useEffect(() => {
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => {
      const current = params.get('q') ?? '';
      if (term.trim() === current.trim()) return;
      push(buildHref({ q: term.trim() }));
    }, 350);
    return () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  return (
    <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter articles by category">
        <Link
          href={buildHref({ category: '' })}
          aria-current={!activeCategory ? 'page' : undefined}
          className={cn(
            'rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition',
            !activeCategory
              ? 'border-brand bg-brand text-white'
              : 'border-white/15 text-white/65 hover:border-white/30 hover:text-white',
          )}
        >
          All articles
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={buildHref({ category: category.slug })}
            aria-current={activeCategory === category.slug ? 'page' : undefined}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition',
              activeCategory === category.slug
                ? 'border-brand bg-brand text-white'
                : 'border-white/15 text-white/65 hover:border-white/30 hover:text-white',
            )}
          >
            {category.name}
            {category.count > 0 && (
              <span className={cn('text-[10.5px]', activeCategory === category.slug ? 'text-white/70' : 'text-white/60')}>
                {category.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <label htmlFor="blog-search" className="sr-only">
            Search articles
          </label>
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60"
            aria-hidden="true"
          />
          <input
            id="blog-search"
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search articles"
            className="h-10 w-full rounded-full border border-white/12 bg-ink pl-9 pr-9 text-[13px] text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-brand/50 sm:w-64"
          />
          {term && (
            <button
              type="button"
              onClick={() => setTerm('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-white/60 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>
        {pending && <Loader2 size={15} className="animate-spin text-white/60" aria-hidden="true" />}
        {hasFilters && !pending && (
          <Link
            href={pathname}
            className="text-[12.5px] font-medium text-white/65 transition hover:text-white"
          >
            Reset
          </Link>
        )}
      </div>
    </div>
  );
}

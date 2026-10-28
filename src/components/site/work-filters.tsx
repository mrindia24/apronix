'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/src/lib/utils';
import { ProjectCard } from '@/src/components/site/project-card';
import type { ProjectListItem } from '@/src/lib/content';

const FILTERS = [
  { key: 'ALL', label: 'All projects' },
  { key: 'SHOPIFY_DEVELOPMENT', label: 'Shopify' },
  { key: 'WORDPRESS_DEVELOPMENT', label: 'WordPress' },
  { key: 'SOCIAL_MEDIA_MANAGEMENT', label: 'Social Media' },
] as const;

/**
 * Client-side portfolio filtering. Server-rendered list, filtered in place —
 * no full page reload, and every project remains in the DOM for crawlers on
 * first paint (we never hide the initial "All" set from the server HTML).
 */
export function WorkFilters({ projects }: { projects: ProjectListItem[] }) {
  const [active, setActive] = useState<(typeof FILTERS)[number]['key']>('ALL');

  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: projects.length };
    for (const project of projects) {
      const key = project.serviceCategory ?? 'OTHER';
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [projects]);

  const visible = useMemo(
    () => (active === 'ALL' ? projects : projects.filter((p) => p.serviceCategory === active)),
    [active, projects],
  );

  if (!projects.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 bg-ink-soft/50 p-10 text-center">
        <p className="text-[15px] font-semibold text-white">No projects published yet</p>
        <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-mute-onDark">
          We publish project pages only when the client has approved the details. In the meantime, the{' '}
          <Link href="/services" className="text-brand-soft underline underline-offset-2">
            services pages
          </Link>{' '}
          describe exactly how each engagement works.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter projects by service"
        className="flex flex-wrap gap-2"
      >
        {FILTERS.map((filter) => {
          const count = counts[filter.key] ?? 0;
          const isActive = active === filter.key;
          return (
            <button
              key={filter.key}
              role="tab"
              aria-selected={isActive}
              aria-controls="project-grid"
              id={`filter-${filter.key}`}
              onClick={() => setActive(filter.key)}
              disabled={count === 0}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40',
                isActive
                  ? 'border-brand bg-brand text-white'
                  : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white',
              )}
            >
              {filter.label}
              <span className={cn('text-[11px]', isActive ? 'text-white/70' : 'text-white/60')}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="sr-only">
        {visible.length} project{visible.length === 1 ? '' : 's'} shown
      </p>

      <div
        id="project-grid"
        role="tabpanel"
        aria-labelledby={`filter-${active}`}
        className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {visible.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-8 rounded-2xl border border-dashed border-white/12 p-8 text-center text-[13.5px] text-mute-onDark">
          No published projects in this category yet.
        </p>
      )}
    </div>
  );
}

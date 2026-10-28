import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { ProjectListItem } from '@/src/lib/content';

const FALLBACK_GRADIENTS = [
  'from-[#2A0A0C] via-[#7A1218] to-[#FF3038]',
  'from-[#0F1116] via-[#3B0C10] to-[#B42027]',
  'from-[#12151B] via-[#5E0F14] to-[#FF5A60]',
];

export function ProjectCard({
  project,
  index = 0,
  className,
}: {
  project: ProjectListItem;
  index?: number;
  className?: string;
}) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-soft transition-all duration-300 hover:-translate-y-1 hover:border-white/20',
        className,
      )}
    >
      {/* 4:3 on phones gives covers presence; 16:11 on tablet+ matches the 1600×1000 source */}
      <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/11]">
        {project.featuredImage ? (
          <Image
            src={project.featuredImage}
            alt={project.featuredImageAlt || `${project.title} cover`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className={cn(
              'flex h-full w-full items-center justify-center bg-gradient-to-br',
              FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length],
            )}
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
              {project.categoryLabel}
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="rounded-full bg-black/55 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
            {project.categoryLabel}
          </span>
          {project.isSampleContent && (
            <span className="rounded-full bg-amber-300 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-black">
              Sample
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h2 className="text-[16.5px] font-semibold leading-snug text-white">{project.title}</h2>
        <p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-mute-onDark">
          {project.shortDescription}
        </p>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 2).map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/10 px-2 py-0.5 text-[10.5px] text-white/70"
              >
                {tech}
              </span>
            ))}
          </span>
          <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-white">
            View
            <ArrowUpRight
              size={13}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

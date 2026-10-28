import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export type Crumb = { name: string; href: string };

export function Breadcrumbs({
  items,
  className,
  tone = 'dark',
}: {
  items: Crumb[];
  className?: string;
  tone?: 'dark' | 'light';
}) {
  if (!items.length) return null;
  return (
    <nav aria-label="Breadcrumb" className={cn('w-full', className)}>
      <ol
        className={cn(
          'flex flex-wrap items-center gap-1.5 text-[12.5px]',
          tone === 'dark' ? 'text-white/65' : 'text-mute-onLight',
        )}
      >
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.href}-${item.name}`} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className={tone === 'dark' ? 'text-white/80' : 'text-ink'}>
                  {item.name}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className={cn(
                      // 44px touch height on small screens, compact on desktop
                      'inline-flex min-h-[44px] items-center transition sm:min-h-0',
                      tone === 'dark' ? 'hover:text-white' : 'hover:text-ink',
                    )}
                  >
                    {item.name}
                  </Link>
                  <ChevronRight size={12} aria-hidden="true" className="opacity-60" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

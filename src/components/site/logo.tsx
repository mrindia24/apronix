import Link from 'next/link';
import { cn } from '@/src/lib/utils';

/**
 * Brand lockup.
 *
 * The supplied logo is a dark plate: a red "A" monogram plus the APRONIX
 * wordmark. We use the real monogram asset and typeset the wordmark beside it so
 * the lockup stays crisp at every size and reads correctly on both dark and light
 * backgrounds.
 */
export function Logo({
  className,
  href = '/',
  showWordmark = true,
  size = 'md',
  tone = 'dark',
}: {
  className?: string;
  href?: string | null;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'dark' | 'light';
}) {
  const markSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 34;
  const textSize = size === 'sm' ? 'text-[14px]' : size === 'lg' ? 'text-[19px] sm:text-[21px]' : 'text-[16.5px]';

  const content = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/apronix-mark.png"
        width={markSize}
        height={markSize}
        alt=""
        aria-hidden="true"
        className={cn(
          'flex-none object-contain',
          // Large lockups scale down a step on small screens
          size === 'lg' && 'h-[38px] w-[38px] sm:h-11 sm:w-11',
        )}
        style={size === 'lg' ? undefined : { width: markSize, height: markSize }}
      />
      {showWordmark && (
        <span
          className={cn(
            'font-extrabold uppercase leading-none tracking-[0.13em]',
            textSize,
            tone === 'dark' ? 'text-white' : 'text-ink',
          )}
        >
          Apronix
          <span
            className={cn(
              'ml-1.5 align-baseline text-[0.62em] font-semibold tracking-[0.24em]',
              tone === 'dark' ? 'text-brand-soft' : 'text-brand-dark',
            )}
          >
            Tech
          </span>
        </span>
      )}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} aria-label="Apronix Tech — home" className="inline-flex min-h-[44px] items-center rounded-lg">
      {content}
    </Link>
  );
}

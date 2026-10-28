'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export type AccordionItem = { id: string; question: string; answer: string };

/**
 * Accessible disclosure accordion.
 * - Buttons are real <button>s with aria-expanded / aria-controls
 * - Only the open panel is in the DOM flow with a grid-rows transition
 * - Fully keyboard operable (native buttons)
 */
export function Accordion({
  items,
  className,
  defaultOpenId,
  tone = 'dark',
}: {
  items: AccordionItem[];
  className?: string;
  defaultOpenId?: string;
  tone?: 'dark' | 'light';
}) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  if (!items.length) return null;

  const dark = tone === 'dark';

  return (
    <div className={cn('divide-y', dark ? 'divide-white/10' : 'divide-black/10', className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="py-1">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`panel-${item.id}`}
                id={`trigger-${item.id}`}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className={cn(
                  'flex w-full items-start justify-between gap-6 py-5 text-left transition-colors',
                  dark ? 'text-white hover:text-brand-soft' : 'text-ink hover:text-brand-dark',
                )}
              >
                <span className="text-[15px] font-semibold leading-snug sm:text-[16.5px]">
                  {item.question}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-full border transition-all duration-300',
                    dark
                      ? isOpen
                        ? 'border-brand bg-brand text-white'
                        : 'border-white/20 text-white/70'
                      : isOpen
                        ? 'border-brand bg-brand text-white'
                        : 'border-black/15 text-ink/60',
                  )}
                >
                  {isOpen ? <Minus size={14} strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2.5} />}
                </span>
              </button>
            </h3>
            <div
              id={`panel-${item.id}`}
              role="region"
              aria-labelledby={`trigger-${item.id}`}
              hidden={!isOpen}
              ref={(el) => {
                refs.current[item.id] = el;
              }}
              className={cn(
                'overflow-hidden pb-5 pr-10 text-[14.5px] leading-relaxed',
                dark ? 'text-mute-onDark' : 'text-mute-onLight',
              )}
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Scroll-triggered reveal. Adds .is-visible once the element enters the viewport.
 * Content is never hidden from users without JS or with reduced motion.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article' | 'span';
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-visible');
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    observer.observe(el);

    // Safety net: content must never stay invisible (print, in-page search, odd
    // viewports, screenshot tools). Reveal after a short delay regardless.
    const fallback = window.setTimeout(() => el.classList.add('is-visible'), 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <Tag
      // @ts-expect-error polymorphic ref
      ref={ref}
      data-reveal=""
      style={{ ['--reveal-delay' as string]: `${delay}ms` }}
      className={className}
    >
      {children}
    </Tag>
  );
}

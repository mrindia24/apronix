import { cn } from '@/src/lib/utils';
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'light' | 'outline-light' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-3 select-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-white hover:bg-brand-dark active:scale-[0.985] shadow-[0_10px_30px_-12px_rgba(255,48,56,0.75)]',
  secondary:
    'bg-white/[0.06] text-white ring-1 ring-inset ring-white/15 hover:bg-white/[0.11] hover:ring-white/25 active:scale-[0.985]',
  ghost: 'text-mute-onDark hover:text-white hover:bg-white/[0.06]',
  light: 'bg-white text-ink hover:bg-[#F1F2F4] active:scale-[0.985]',
  'outline-light': 'text-ink ring-1 ring-inset ring-black/15 hover:bg-black/[0.04] hover:ring-black/25',
  danger: 'bg-[#B42318] text-white hover:bg-[#941C13]',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-5 text-[14px]',
  lg: 'h-[52px] px-7 text-[15px]',
};

type ButtonProps<T extends ElementType> = {
  as?: T;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

export function Button<T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps<T>) {
  const Component = (as || 'button') as ElementType;
  return (
    <Component className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </Component>
  );
}

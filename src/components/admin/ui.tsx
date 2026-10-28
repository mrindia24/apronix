'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

/** Shared admin form primitives. All fields are labelled for accessibility. */

export { AdminPageHeader } from '@/src/components/admin/shell';

export function Field({
  label,
  name,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-[12px] font-medium text-white/75">
        {label}
        {required && <span className="ml-0.5 text-brand">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="mt-1 text-[11.5px] text-brand-soft">
          {error}
        </p>
      ) : hint ? (
        <p id={`${name}-hint`} className="mt-1 text-[11.5px] text-white/60">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  'h-10 w-full rounded-lg border border-white/12 bg-ink px-3 text-[13.5px] text-white placeholder:text-white/60 focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-brand/50';

export const textareaClass =
  'w-full rounded-lg border border-white/12 bg-ink px-3 py-2.5 text-[13.5px] leading-relaxed text-white placeholder:text-white/60 focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-brand/50';

export const selectClass = `${inputClass} pr-8`;

export function SubmitButton({
  children,
  variant = 'primary',
  className,
  pendingLabel,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-[13px] font-semibold transition disabled:opacity-60',
        variant === 'primary' && 'bg-brand text-white hover:bg-brand-dark',
        variant === 'secondary' && 'border border-white/15 text-white hover:bg-white/[0.06]',
        variant === 'danger' && 'bg-[#B42318] text-white hover:bg-[#941C13]',
        className,
      )}
    >
      {pending && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
      {pending ? (pendingLabel ?? 'Saving…') : children}
    </button>
  );
}

export function Card({
  title,
  description,
  children,
  className,
  action,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={cn('rounded-2xl border border-white/[0.08] bg-ink-soft p-5 sm:p-6', className)}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-[14.5px] font-semibold text-white">{title}</h2>}
            {description && <p className="mt-1 text-[12px] leading-relaxed text-white/65">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">{label}</p>
      <p className="mt-2 text-[26px] font-semibold leading-none text-white">{value}</p>
      {sub && <p className="mt-1.5 text-[11.5px] text-white/60">{sub}</p>}
    </>
  );
  const className =
    'block rounded-2xl border border-white/[0.08] bg-ink-soft p-4 transition hover:border-white/20 sm:p-5';
  return href ? (
    <a href={href} className={className}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand';
}) {
  const tones = {
    neutral: 'border-white/12 bg-white/[0.05] text-white/60',
    success: 'border-[#1F6F43]/40 bg-[#0C1F16] text-[#6EE7A0]',
    warning: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    danger: 'border-brand/40 bg-brand/10 text-brand-soft',
    brand: 'border-brand/30 bg-brand/10 text-brand-soft',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em]',
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/12 p-8 text-center">
      <p className="text-[14px] font-semibold text-white">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-white/65">{description}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

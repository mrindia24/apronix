'use client';

import { useActionState } from 'react';
import { cn } from '@/src/lib/utils';
import { initialActionState, type ActionState } from '@/src/lib/actions/types';

type ActionFn = (state: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Thin wrapper around useActionState that renders a consistent status message
 * above its children. Passes `state` into children via a render function so forms
 * can surface per-field errors.
 */
export function FormShell({
  action,
  children,
  className,
  successMessage,
}: {
  action: ActionFn;
  children: (state: ActionState) => React.ReactNode;
  className?: string;
  successMessage?: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className={cn('space-y-4', className)}>
      {state.message && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'rounded-lg border px-3 py-2 text-[12.5px] leading-relaxed',
            state.ok
              ? 'border-[#1F6F43]/40 bg-[#0C1F16] text-[#8AF0B4]'
              : 'border-brand/40 bg-brand/[0.08] text-white/85',
          )}
        >
          {state.ok && successMessage ? successMessage : state.message}
        </div>
      )}
      {children(state)}
    </form>
  );
}

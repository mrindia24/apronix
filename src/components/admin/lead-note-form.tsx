'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { initialActionState, type ActionState } from '@/src/lib/actions/types';

function Button() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[12.5px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
    >
      {pending && <Loader2 size={12} className="animate-spin" aria-hidden="true" />}
      {pending ? 'Adding…' : 'Add note'}
    </button>
  );
}

export function LeadNoteForm({
  leadId,
  action,
}: {
  leadId: string;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="leadId" value={leadId} />
      <label htmlFor="body" className="sr-only">
        Add an internal note
      </label>
      <textarea
        id="body"
        name="body"
        rows={3}
        placeholder="Add context for the team — call outcome, next step, budget notes…"
        className="w-full rounded-lg border border-white/12 bg-ink px-3 py-2 text-[12.5px] leading-relaxed text-white placeholder:text-white/60 focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-brand/50"
      />
      <div className="flex items-center gap-3">
        <Button />
        {state.message && (
          <p
            role="status"
            className={`text-[11.5px] ${state.ok ? 'text-[#8AF0B4]' : 'text-brand-soft'}`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

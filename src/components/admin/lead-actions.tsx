'use client';

import { useTransition } from 'react';
import { updateLeadStatusAction } from '@/src/lib/actions/leads';
import { LEAD_STATUSES } from '@/src/lib/validation';
import { titleCase } from '@/src/lib/utils';

/** Inline status dropdown for the leads table. Submits a server action. */
export function LeadRowActions({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => updateLeadStatusAction(formData))}
      className="inline-flex"
    >
      <input type="hidden" name="id" value={id} />
      <label htmlFor={`status-${id}`} className="sr-only">
        Update lead status
      </label>
      <select
        id={`status-${id}`}
        name="status"
        defaultValue={status}
        disabled={pending}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="h-8 rounded-lg border border-white/12 bg-ink px-2 pr-6 text-[11.5px] text-white/80 transition focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-brand/50 disabled:opacity-50"
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {titleCase(s)}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="ml-1 rounded border border-white/15 px-2 text-[11px] text-white">
          Save
        </button>
      </noscript>
    </form>
  );
}

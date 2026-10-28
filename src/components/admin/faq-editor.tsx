'use client';

import { useState } from 'react';
import { FormShell } from '@/src/components/admin/form-shell';
import { Field, SubmitButton, inputClass, selectClass, textareaClass, Card } from '@/src/components/admin/ui';
import { saveFaqAction } from '@/src/lib/actions/content';
import type { ActionState } from '@/src/lib/actions/types';

type Faq = {
  id: string;
  question: string;
  answer: string;
  scope: string | null;
  order: number;
  status: string;
};

const SCOPE_OPTIONS = [
  { value: '', label: 'Homepage & contact page' },
  { value: 'SOCIAL_MEDIA_MANAGEMENT', label: 'Social Media Management page' },
  { value: 'SHOPIFY_DEVELOPMENT', label: 'Shopify page' },
  { value: 'WORDPRESS_DEVELOPMENT', label: 'WordPress page' },
];

/** Inline edit toggle + create form. With no `faq`, renders the "new FAQ" card. */
export function FaqEditor({ faq }: { faq?: Faq }) {
  const [editing, setEditing] = useState(!faq);

  if (faq && !editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-lg border border-white/12 px-2 py-1 text-[11px] text-white/60 transition hover:text-white"
      >
        Edit
      </button>
    );
  }

  const form = (
    <div className={faq ? 'w-[320px]' : ''}>
        <FormShell action={saveFaqAction as (s: ActionState, f: FormData) => Promise<ActionState>}>
          {(state) => (
            <div className="space-y-3">
              {faq?.id && <input type="hidden" name="id" value={faq.id} />}
              <Field label="Question" name={`question-${faq?.id ?? 'new'}`} required error={state.errors?.question}>
                <input
                  id={`question-${faq?.id ?? 'new'}`}
                  name="question"
                  defaultValue={faq?.question ?? ''}
                  required
                  className={inputClass}
                  placeholder="How long does a project take?"
                />
              </Field>
              <Field label="Answer" name={`answer-${faq?.id ?? 'new'}`} required error={state.errors?.answer}>
                <textarea
                  id={`answer-${faq?.id ?? 'new'}`}
                  name="answer"
                  rows={4}
                  defaultValue={faq?.answer ?? ''}
                  required
                  className={textareaClass}
                  placeholder="A clear, plain-English answer."
                />
              </Field>
              <Field label="Scope" name={`scope-${faq?.id ?? 'new'}`} hint="Where this FAQ appears.">
                <select
                  id={`scope-${faq?.id ?? 'new'}`}
                  name="scope"
                  defaultValue={faq?.scope ?? ''}
                  className={selectClass}
                >
                  {SCOPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Order" name={`order-${faq?.id ?? 'new'}`}>
                  <input
                    id={`order-${faq?.id ?? 'new'}`}
                    name="order"
                    type="number"
                    min={0}
                    max={99}
                    defaultValue={faq?.order ?? 0}
                    className={inputClass}
                  />
                </Field>
                <Field label="Status" name={`status-${faq?.id ?? 'new'}`}>
                  <select
                    id={`status-${faq?.id ?? 'new'}`}
                    name="status"
                    defaultValue={faq?.status ?? 'PUBLISHED'}
                    className={selectClass}
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </Field>
              </div>
              <div className="flex items-center gap-2">
                <SubmitButton>{faq ? 'Save changes' : 'Add FAQ'}</SubmitButton>
                {faq && (
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="text-[12px] text-white/65 hover:text-white"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </FormShell>
    </div>
  );

  if (faq) return form;

  return (
    <Card title="Add a FAQ" description="New questions are published immediately unless you set Draft.">
      {form}
    </Card>
  );
}

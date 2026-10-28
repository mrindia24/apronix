'use client';

import { useState } from 'react';
import { FormShell } from '@/src/components/admin/form-shell';
import { Field, SubmitButton, inputClass, selectClass, textareaClass, Card } from '@/src/components/admin/ui';
import { saveTestimonialAction } from '@/src/lib/actions/content';

type Testimonial = {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string | null;
  company: string | null;
  rating: number | null;
  order: number;
  approved: boolean;
};

export function TestimonialForm({ testimonial }: { testimonial?: Testimonial }) {
  const [editing, setEditing] = useState(!testimonial);

  if (testimonial && !editing) {
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
    <div className={testimonial ? 'w-[320px]' : ''}>
      <FormShell action={saveTestimonialAction}>
        {(state) => (
          <div className="space-y-3">
            {testimonial?.id && <input type="hidden" name="id" value={testimonial.id} />}
            <Field label="Quote" name={`quote-${testimonial?.id ?? 'new'}`} required error={state.errors?.quote} hint="Use the client's exact wording.">
              <textarea
                id={`quote-${testimonial?.id ?? 'new'}`}
                name="quote"
                rows={4}
                defaultValue={testimonial?.quote ?? ''}
                required
                className={textareaClass}
              />
            </Field>
            <Field label="Author name" name={`authorName-${testimonial?.id ?? 'new'}`} required error={state.errors?.authorName}>
              <input
                id={`authorName-${testimonial?.id ?? 'new'}`}
                name="authorName"
                defaultValue={testimonial?.authorName ?? ''}
                required
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Role" name={`authorRole-${testimonial?.id ?? 'new'}`}>
                <input
                  id={`authorRole-${testimonial?.id ?? 'new'}`}
                  name="authorRole"
                  defaultValue={testimonial?.authorRole ?? ''}
                  className={inputClass}
                  placeholder="Founder"
                />
              </Field>
              <Field label="Company" name={`company-${testimonial?.id ?? 'new'}`}>
                <input
                  id={`company-${testimonial?.id ?? 'new'}`}
                  name="company"
                  defaultValue={testimonial?.company ?? ''}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rating" name={`rating-${testimonial?.id ?? 'new'}`} hint="Optional. Only use if the client gave one.">
                <select
                  id={`rating-${testimonial?.id ?? 'new'}`}
                  name="rating"
                  defaultValue={testimonial?.rating ? String(testimonial.rating) : ''}
                  className={selectClass}
                >
                  <option value="">No rating</option>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n === 1 ? '' : 's'}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Order" name={`order-${testimonial?.id ?? 'new'}`}>
                <input
                  id={`order-${testimonial?.id ?? 'new'}`}
                  name="order"
                  type="number"
                  min={0}
                  max={99}
                  defaultValue={testimonial?.order ?? 0}
                  className={inputClass}
                />
              </Field>
            </div>
            <label className="flex items-start gap-2 text-[12px] leading-relaxed text-white/70">
              <input
                type="checkbox"
                name="approved"
                defaultChecked={testimonial?.approved ?? false}
                className="mt-0.5 h-4 w-4 accent-brand"
              />
              Client has given written permission to publish this quote
            </label>
            <div className="flex items-center gap-2">
              <SubmitButton>{testimonial ? 'Save changes' : 'Add testimonial'}</SubmitButton>
              {testimonial && (
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

  if (testimonial) return form;

  return (
    <Card title="Add a testimonial" description="Approval is required before it appears on the website.">
      {form}
    </Card>
  );
}

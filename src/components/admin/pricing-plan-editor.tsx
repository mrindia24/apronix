'use client';

import { useState } from 'react';
import { FormShell } from '@/src/components/admin/form-shell';
import { Field, SubmitButton, inputClass, selectClass, textareaClass, Card } from '@/src/components/admin/ui';
import { savePricingPlanAction } from '@/src/lib/actions/content';
import type { ActionState } from '@/src/lib/actions/types';

export type PricingPlanRow = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  billingNote: string;
  serviceKey: string | null;
  highlighted: boolean;
  ctaLabel: string;
  ctaHref: string;
  notIncluded: string[];
  order: number;
  status: string;
  isSampleContent: boolean;
  features: { label: string; included: boolean }[];
};

const SERVICE_OPTIONS = [
  { value: '', label: 'Not tied to a service' },
  { value: 'SOCIAL_MEDIA_MANAGEMENT', label: 'Social Media Management' },
  { value: 'SHOPIFY_DEVELOPMENT', label: 'Shopify Development' },
  { value: 'WORDPRESS_DEVELOPMENT', label: 'WordPress Development' },
];

/** Inline edit toggle + create form. With no `plan`, renders the "new plan" card. */
export function PricingPlanEditor({ plan }: { plan?: PricingPlanRow }) {
  const [editing, setEditing] = useState(!plan);
  const uid = plan?.id ?? 'new';

  if (plan && !editing) {
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
    <div className={plan ? 'w-full max-w-[520px]' : ''}>
      <FormShell action={savePricingPlanAction as (s: ActionState, f: FormData) => Promise<ActionState>}>
        {(state) => (
          <div className="space-y-3">
            {plan?.id && <input type="hidden" name="id" value={plan.id} />}

            <Field label="Plan name" name={`name-${uid}`} required error={state.errors?.name}>
              <input
                id={`name-${uid}`}
                name="name"
                defaultValue={plan?.name ?? ''}
                required
                className={inputClass}
                placeholder="Social Growth"
              />
            </Field>

            <Field label="Tagline" name={`tagline-${uid}`} hint="One sentence. Shown under the plan name.">
              <input
                id={`tagline-${uid}`}
                name="tagline"
                defaultValue={plan?.tagline ?? ''}
                className={inputClass}
                placeholder="Content plus reporting that answers questions."
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Price" name={`price-${uid}`} hint="Free text, e.g. ₹45,000">
                <input
                  id={`price-${uid}`}
                  name="price"
                  defaultValue={plan?.price ?? ''}
                  className={inputClass}
                  placeholder="₹45,000"
                />
              </Field>
              <Field label="Price note" name={`priceNote-${uid}`} hint="e.g. per month">
                <input
                  id={`priceNote-${uid}`}
                  name="priceNote"
                  defaultValue={plan?.priceNote ?? ''}
                  className={inputClass}
                  placeholder="per month"
                />
              </Field>
            </div>

            <Field label="Billing note" name={`billingNote-${uid}`} hint="Shown small under the price.">
              <input
                id={`billingNote-${uid}`}
                name="billingNote"
                defaultValue={plan?.billingNote ?? ''}
                className={inputClass}
                placeholder="Rolling monthly · cancel with 30 days notice"
              />
            </Field>

            <Field
              label="Features"
              name={`features-${uid}`}
              hint="One per line. Start a line with “-” to show it as not included."
              error={state.errors?.features}
            >
              <textarea
                id={`features-${uid}`}
                name="features"
                rows={7}
                defaultValue={plan?.features
                  .map((f) => (f.included ? f.label : `- ${f.label}`))
                  .join('\n') ?? ''}
                className={textareaClass}
                placeholder={'Two channels managed\n12 posts per month\n- Paid ad management'}
              />
            </Field>

            <Field
              label="Not included"
              name={`notIncluded-${uid}`}
              hint="One per line. Summarised as a single line on the card."
            >
              <textarea
                id={`notIncluded-${uid}`}
                name="notIncluded"
                rows={2}
                defaultValue={plan?.notIncluded.join('\n') ?? ''}
                className={textareaClass}
                placeholder={'Copywriting\nProduct photography'}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Linked service" name={`serviceKey-${uid}`}>
                <select
                  id={`serviceKey-${uid}`}
                  name="serviceKey"
                  defaultValue={plan?.serviceKey ?? ''}
                  className={selectClass}
                >
                  {SERVICE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Order" name={`order-${uid}`}>
                <input
                  id={`order-${uid}`}
                  name="order"
                  type="number"
                  min={0}
                  max={99}
                  defaultValue={plan?.order ?? 0}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Button label" name={`ctaLabel-${uid}`}>
                <input
                  id={`ctaLabel-${uid}`}
                  name="ctaLabel"
                  defaultValue={plan?.ctaLabel ?? 'Start an enquiry'}
                  className={inputClass}
                />
              </Field>
              <Field label="Button link" name={`ctaHref-${uid}`}>
                <input
                  id={`ctaHref-${uid}`}
                  name="ctaHref"
                  defaultValue={plan?.ctaHref ?? '/contact'}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Status" name={`status-${uid}`}>
                <select
                  id={`status-${uid}`}
                  name="status"
                  defaultValue={plan?.status ?? 'PUBLISHED'}
                  className={selectClass}
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </Field>
              <div className="flex items-end pb-2.5">
                <label className="flex items-center gap-2 text-[12.5px] text-white/80">
                  <input
                    type="checkbox"
                    name="highlighted"
                    defaultChecked={plan?.highlighted ?? false}
                    className="h-4 w-4 accent-[#E01F27]"
                  />
                  Highlight as “Popular”
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <SubmitButton>{plan ? 'Save changes' : 'Add plan'}</SubmitButton>
              {plan && (
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

  if (plan) return form;

  return (
    <Card
      title="Add a pricing plan"
      description="Plans appear on /pricing in the order you set. Prices are free text so you can write “From ₹1,20,000” or “On request”."
    >
      {form}
    </Card>
  );
}

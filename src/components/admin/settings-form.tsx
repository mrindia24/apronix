'use client';

import { FormShell } from '@/src/components/admin/form-shell';
import { Field, SubmitButton, inputClass, textareaClass, Card } from '@/src/components/admin/ui';
import { saveSettingsAction } from '@/src/lib/actions/settings';

type Settings = {
  siteName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  addressLine: string;
  serviceArea: string;
  whatsapp: string;
  footerNote: string;
  businessHours: string;
  showTestimonials: boolean;
  showClients: boolean;
  analyticsConsent: boolean;
  socials: { label: string; url: string }[];
  facts: { label: string; value: string }[];
};

export function SettingsForm({ settings, canEdit }: { settings: Settings; canEdit: boolean }) {
  return (
    <FormShell action={saveSettingsAction} className="space-y-4">
      {(state) => (
        <fieldset disabled={!canEdit} className="space-y-4">
          <Card title="Brand">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Site name" name="siteName" required error={state.errors?.siteName}>
                <input id="siteName" name="siteName" defaultValue={settings.siteName} className={inputClass} required />
              </Field>
              <Field label="Tagline" name="tagline">
                <input id="tagline" name="tagline" defaultValue={settings.tagline} className={inputClass} />
              </Field>
              <Field
                label="Site description"
                name="description"
                required
                error={state.errors?.description}
                hint="Used in the footer and as the default meta description."
                className="sm:col-span-2"
              >
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={settings.description}
                  className={textareaClass}
                  required
                />
              </Field>
            </div>
          </Card>

          <Card title="Contact details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact email" name="email" required error={state.errors?.email}>
                <input id="email" name="email" type="email" defaultValue={settings.email} className={inputClass} required />
              </Field>
              <Field label="Phone" name="phone" hint="Include country code. Leave blank to hide.">
                <input id="phone" name="phone" defaultValue={settings.phone} className={inputClass} placeholder="+91 …" />
              </Field>
              <Field label="WhatsApp link" name="whatsapp" hint="Full wa.me link, e.g. https://wa.me/919876543210">
                <input id="whatsapp" name="whatsapp" defaultValue={settings.whatsapp} className={inputClass} />
              </Field>
              <Field label="Business hours" name="businessHours">
                <input id="businessHours" name="businessHours" defaultValue={settings.businessHours} className={inputClass} />
              </Field>
              <Field
                label="Address line"
                name="addressLine"
                hint="Leave blank until the office address is confirmed — no location is shown on the site until this is set."
                className="sm:col-span-2"
              >
                <input id="addressLine" name="addressLine" defaultValue={settings.addressLine} className={inputClass} />
              </Field>
              <Field label="Service area" name="serviceArea" className="sm:col-span-2">
                <input id="serviceArea" name="serviceArea" defaultValue={settings.serviceArea} className={inputClass} />
              </Field>
              <Field label="Footer note" name="footerNote" className="sm:col-span-2">
                <input id="footerNote" name="footerNote" defaultValue={settings.footerNote} className={inputClass} />
              </Field>
            </div>
          </Card>

          <Card title="Agency facts" description="Short capability statements shown on the homepage trust strip.">
            <div className="space-y-2">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[180px_1fr]">
                  <input
                    name="factLabel"
                    defaultValue={settings.facts[index]?.label ?? ''}
                    placeholder="Label"
                    aria-label={`Fact ${index + 1} label`}
                    className={inputClass}
                  />
                  <input
                    name="factValue"
                    defaultValue={settings.facts[index]?.value ?? ''}
                    placeholder="Value"
                    aria-label={`Fact ${index + 1} value`}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card title="Social profiles" description="Leave blank to hide. Only link profiles that are actually yours.">
            <div className="space-y-2">
              {[0, 1, 2].map((index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[180px_1fr]">
                  <input
                    name="socialLabel"
                    defaultValue={settings.socials[index]?.label ?? ''}
                    placeholder="LinkedIn"
                    aria-label={`Social ${index + 1} label`}
                    className={inputClass}
                  />
                  <input
                    name="socialUrl"
                    defaultValue={settings.socials[index]?.url ?? ''}
                    placeholder="https://"
                    aria-label={`Social ${index + 1} URL`}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card title="Homepage sections">
            <div className="space-y-2.5">
              <label className="flex items-start gap-2 text-[12.5px] leading-relaxed text-white/75">
                <input
                  type="checkbox"
                  name="showTestimonials"
                  defaultChecked={settings.showTestimonials}
                  className="mt-0.5 h-4 w-4 accent-brand"
                />
                Show the testimonials section when approved quotes exist
              </label>
              <label className="flex items-start gap-2 text-[12.5px] leading-relaxed text-white/75">
                <input
                  type="checkbox"
                  name="showClients"
                  defaultChecked={settings.showClients}
                  className="mt-0.5 h-4 w-4 accent-brand"
                />
                Show client logos (only enable when you have permission to display them)
              </label>
              <label className="flex items-start gap-2 text-[12.5px] leading-relaxed text-white/75">
                <input
                  type="checkbox"
                  name="analyticsConsent"
                  defaultChecked={settings.analyticsConsent}
                  className="mt-0.5 h-4 w-4 accent-brand"
                />
                Require consent before loading analytics
              </label>
            </div>
          </Card>

          {canEdit ? (
            <SubmitButton>Save settings</SubmitButton>
          ) : (
            <p className="rounded-lg border border-white/10 bg-ink px-3 py-2 text-[11.5px] text-white/65">
              Only administrators can change site settings. Ask an admin for access.
            </p>
          )}
        </fieldset>
      )}
    </FormShell>
  );
}

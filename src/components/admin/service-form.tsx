'use client';

import { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { FormShell } from '@/src/components/admin/form-shell';
import { Field, SubmitButton, inputClass, selectClass, textareaClass } from '@/src/components/admin/ui';
import { saveServiceAction } from '@/src/lib/actions/content';

type ServiceInput = {
  key: string;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  summary: string;
  heroHeadline: string;
  heroDescription: string;
  seoTitle: string | null;
  seoDescription: string | null;
  status: string;
  sections: string;
};

export function ServiceContentForm({ service }: { service: ServiceInput }) {
  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState(service.sections);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const validate = (value: string) => {
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON');
    }
  };

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-ink-soft">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
      >
        <span>
          <span className="block text-[14.5px] font-semibold text-white">{service.name}</span>
          <span className="mt-0.5 block text-[11.5px] text-white/60">
            /services/{service.slug} · {service.status}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`flex-none text-white/60 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="border-t border-white/[0.07] p-5">
          <FormShell action={saveServiceAction} className="space-y-4">
            {(state) => (
              <>
                <input type="hidden" name="key" value={service.key} />
                <input type="hidden" name="sections" value={sections} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Service name" name={`name-${service.key}`} required>
                    <input
                      id={`name-${service.key}`}
                      name="name"
                      defaultValue={service.name}
                      className={inputClass}
                      required
                    />
                  </Field>
                  <Field label="Short name" name={`shortName-${service.key}`} hint="Used in navigation and headings.">
                    <input
                      id={`shortName-${service.key}`}
                      name="shortName"
                      defaultValue={service.shortName}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Tagline" name={`tagline-${service.key}`} className="sm:col-span-2">
                    <input
                      id={`tagline-${service.key}`}
                      name="tagline"
                      defaultValue={service.tagline}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Summary" name={`summary-${service.key}`} hint="Used on the services index and metadata fallback." className="sm:col-span-2">
                    <textarea
                      id={`summary-${service.key}`}
                      name="summary"
                      rows={2}
                      defaultValue={service.summary}
                      className={textareaClass}
                    />
                  </Field>
                  <Field label="Hero headline" name={`heroHeadline-${service.key}`} className="sm:col-span-2">
                    <input
                      id={`heroHeadline-${service.key}`}
                      name="heroHeadline"
                      defaultValue={service.heroHeadline}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Hero description" name={`heroDescription-${service.key}`} className="sm:col-span-2">
                    <textarea
                      id={`heroDescription-${service.key}`}
                      name="heroDescription"
                      rows={3}
                      defaultValue={service.heroDescription}
                      className={textareaClass}
                    />
                  </Field>
                  <Field label="SEO title" name={`seoTitle-${service.key}`} error={state.errors?.seoTitle}>
                    <input
                      id={`seoTitle-${service.key}`}
                      name="seoTitle"
                      defaultValue={service.seoTitle ?? ''}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Status" name={`status-${service.key}`}>
                    <select
                      id={`status-${service.key}`}
                      name="status"
                      defaultValue={service.status}
                      className={selectClass}
                    >
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </Field>
                  <Field label="SEO description" name={`seoDescription-${service.key}`} className="sm:col-span-2">
                    <textarea
                      id={`seoDescription-${service.key}`}
                      name="seoDescription"
                      rows={2}
                      defaultValue={service.seoDescription ?? ''}
                      className={textareaClass}
                    />
                  </Field>
                </div>

                <div>
                  <label htmlFor={`sections-${service.key}`} className="mb-1.5 block text-[12px] font-medium text-white/75">
                    Structured sections (JSON)
                  </label>
                  <p className="mb-2 text-[11.5px] leading-relaxed text-white/60">
                    Arrays of <code className="rounded bg-white/10 px-1">problems</code>,{' '}
                    <code className="rounded bg-white/10 px-1">deliverables</code>,{' '}
                    <code className="rounded bg-white/10 px-1">benefits</code>,{' '}
                    <code className="rounded bg-white/10 px-1">workflow</code>,{' '}
                    <code className="rounded bg-white/10 px-1">useCases</code>,{' '}
                    <code className="rounded bg-white/10 px-1">faqs</code>, plus optional{' '}
                    <code className="rounded bg-white/10 px-1">tech</code> and{' '}
                    <code className="rounded bg-white/10 px-1">startingNote</code>. Invalid JSON will be
                    rejected on save.
                  </p>
                  <textarea
                    id={`sections-${service.key}`}
                    value={sections}
                    onChange={(event) => {
                      setSections(event.target.value);
                      validate(event.target.value);
                    }}
                    rows={16}
                    spellCheck={false}
                    className={`${textareaClass} font-mono text-[11.5px] ${jsonError ? 'border-brand' : ''}`}
                  />
                  {jsonError && <p className="mt-1 text-[11.5px] text-brand-soft">JSON error: {jsonError}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <SubmitButton>Save service content</SubmitButton>
                  <a
                    href={`/services/${service.slug}`}
                    target="_blank"
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-white/15 px-3 text-[12.5px] font-semibold text-white/75 transition hover:text-white"
                  >
                    <ExternalLink size={12} aria-hidden="true" />
                    View page
                  </a>
                </div>
              </>
            )}
          </FormShell>
        </div>
      )}
    </section>
  );
}

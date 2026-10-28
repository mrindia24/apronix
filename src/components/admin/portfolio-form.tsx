'use client';

import { FormShell } from '@/src/components/admin/form-shell';
import { Field, SubmitButton, inputClass, selectClass, textareaClass, Card } from '@/src/components/admin/ui';
import { savePortfolioAction } from '@/src/lib/actions/content';
import type { PortfolioProject } from '@prisma/client';

export function PortfolioForm({
  project,
  mediaOptions,
}: {
  project?: PortfolioProject | null;
  mediaOptions: { url: string; alt: string; label: string }[];
}) {
  return (
    <FormShell action={savePortfolioAction} className="space-y-4">
      {(state) => (
        <>
          {project?.id && <input type="hidden" name="id" value={project.id} />}

          <Card title="Basics" description="Title, URL and the summary shown on cards.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project title" name="title" required error={state.errors?.title} className="sm:col-span-2">
                <input
                  id="title"
                  name="title"
                  defaultValue={project?.title ?? ''}
                  required
                  className={inputClass}
                  placeholder="Storefront rebuild for a growing retailer"
                />
              </Field>

              <Field
                label="URL slug"
                name="slug"
                required
                error={state.errors?.slug}
                hint="Lowercase letters, numbers and hyphens. Changing this on a published project creates a redirect."
              >
                <input
                  id="slug"
                  name="slug"
                  defaultValue={project?.slug ?? ''}
                  required
                  className={inputClass}
                  placeholder="storefront-rebuild"
                />
              </Field>

              <Field label="Category label" name="categoryLabel" required error={state.errors?.categoryLabel} hint="Shown on the project card, e.g. Shopify.">
                <input
                  id="categoryLabel"
                  name="categoryLabel"
                  defaultValue={project?.categoryLabel ?? ''}
                  required
                  className={inputClass}
                  placeholder="Shopify"
                />
              </Field>

              <Field label="Service category" name="serviceCategory" hint="Used for filtering and related projects.">
                <select
                  id="serviceCategory"
                  name="serviceCategory"
                  defaultValue={project?.serviceCategory ?? ''}
                  className={selectClass}
                >
                  <option value="">Not linked to a service</option>
                  <option value="SOCIAL_MEDIA_MANAGEMENT">Social Media Management</option>
                  <option value="SHOPIFY_DEVELOPMENT">Shopify Development</option>
                  <option value="WORDPRESS_DEVELOPMENT">WordPress Development</option>
                </select>
              </Field>

              <Field label="Client name" name="clientName" hint="Leave blank if the client prefers not to be named.">
                <input
                  id="clientName"
                  name="clientName"
                  defaultValue={project?.clientName ?? ''}
                  className={inputClass}
                />
              </Field>

              <Field label="Industry" name="industry">
                <input id="industry" name="industry" defaultValue={project?.industry ?? ''} className={inputClass} />
              </Field>

              <Field label="Launch date" name="launchDate">
                <input
                  id="launchDate"
                  name="launchDate"
                  type="date"
                  defaultValue={project?.launchDate ? new Date(project.launchDate).toISOString().slice(0, 10) : ''}
                  className={inputClass}
                />
              </Field>

              <Field label="Live project URL" name="projectUrl" error={state.errors?.projectUrl} hint="Only if the client has approved a public link.">
                <input
                  id="projectUrl"
                  name="projectUrl"
                  type="url"
                  defaultValue={project?.projectUrl ?? ''}
                  className={inputClass}
                  placeholder="https://"
                />
              </Field>

              <Field
                label="Short description"
                name="shortDescription"
                required
                error={state.errors?.shortDescription}
                hint="One or two sentences for the project card. Max 400 characters."
                className="sm:col-span-2"
              >
                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  rows={2}
                  defaultValue={project?.shortDescription ?? ''}
                  required
                  className={textareaClass}
                />
              </Field>
            </div>
          </Card>

          <Card title="Project story" description="These sections appear on the project detail page.">
            <div className="space-y-4">
              <Field label="Overview" name="overview" required error={state.errors?.overview} hint="Separate paragraphs with a blank line.">
                <textarea
                  id="overview"
                  name="overview"
                  rows={4}
                  defaultValue={project?.overview ?? ''}
                  required
                  className={textareaClass}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Client brief" name="brief">
                  <textarea id="brief" name="brief" rows={3} defaultValue={project?.brief ?? ''} className={textareaClass} />
                </Field>
                <Field label="Challenges" name="challenges">
                  <textarea
                    id="challenges"
                    name="challenges"
                    rows={3}
                    defaultValue={project?.challenges ?? ''}
                    className={textareaClass}
                  />
                </Field>
                <Field label="Strategy" name="strategy">
                  <textarea id="strategy" name="strategy" rows={3} defaultValue={project?.strategy ?? ''} className={textareaClass} />
                </Field>
                <Field label="What we built" name="solution">
                  <textarea id="solution" name="solution" rows={3} defaultValue={project?.solution ?? ''} className={textareaClass} />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Technologies" name="technologies" hint="One per line.">
                  <textarea
                    id="technologies"
                    name="technologies"
                    rows={4}
                    defaultValue={(project?.technologies ?? []).join('\n')}
                    className={textareaClass}
                    placeholder={'Shopify Liquid\nTailwind CSS'}
                  />
                </Field>
                <Field label="Deliverables" name="deliverables" hint="One per line.">
                  <textarea
                    id="deliverables"
                    name="deliverables"
                    rows={4}
                    defaultValue={(project?.deliverables ?? []).join('\n')}
                    className={textareaClass}
                    placeholder={'Theme architecture\nLaunch QA'}
                  />
                </Field>
              </div>
            </div>
          </Card>

          <Card title="Media" description="Pick an existing upload from the media library or paste a URL.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Featured image" name="featuredImage" hint="Path such as /uploads/my-image.webp">
                <input
                  id="featuredImage"
                  name="featuredImage"
                  list="media-urls"
                  defaultValue={project?.featuredImage ?? ''}
                  className={inputClass}
                />
                <datalist id="media-urls">
                  {mediaOptions.map((option) => (
                    <option key={option.url} value={option.url}>
                      {option.label}
                    </option>
                  ))}
                </datalist>
              </Field>
              <Field label="Featured image alt text" name="featuredImageAlt" hint="Describe the image for screen readers and SEO.">
                <input
                  id="featuredImageAlt"
                  name="featuredImageAlt"
                  defaultValue={project?.featuredImageAlt ?? ''}
                  className={inputClass}
                />
              </Field>
            </div>
          </Card>

          <Card title="Publishing & SEO">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status" name="status">
                <select id="status" name="status" defaultValue={project?.status ?? 'DRAFT'} className={selectClass}>
                  <option value="DRAFT">Draft (hidden)</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </Field>
              <Field label="Display order" name="order" hint="Lower numbers appear first.">
                <input
                  id="order"
                  name="order"
                  type="number"
                  min={0}
                  max={999}
                  defaultValue={project?.order ?? 0}
                  className={inputClass}
                />
              </Field>
              <Field label="SEO title" name="seoTitle" error={state.errors?.seoTitle} hint="Max 70 characters. Defaults to the project title." className="sm:col-span-2">
                <input id="seoTitle" name="seoTitle" defaultValue={project?.seoTitle ?? ''} className={inputClass} />
              </Field>
              <Field label="SEO description" name="seoDescription" error={state.errors?.seoDescription} hint="Max 200 characters. Defaults to the short description." className="sm:col-span-2">
                <textarea
                  id="seoDescription"
                  name="seoDescription"
                  rows={2}
                  defaultValue={project?.seoDescription ?? ''}
                  className={textareaClass}
                />
              </Field>
              <label className="flex items-center gap-2 text-[12.5px] text-white/70">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={project?.featured ?? false}
                  className="h-4 w-4 accent-brand"
                />
                Feature on the homepage
              </label>
            </div>
          </Card>

          <div className="flex items-center gap-2">
            <SubmitButton>{project ? 'Save project' : 'Create project'}</SubmitButton>
          </div>
        </>
      )}
    </FormShell>
  );
}

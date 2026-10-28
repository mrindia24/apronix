'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { FormShell } from '@/src/components/admin/form-shell';
import { Field, SubmitButton, inputClass, selectClass, textareaClass, Card } from '@/src/components/admin/ui';
import { saveBlogPostAction } from '@/src/lib/actions/content';
import { renderMarkdown } from '@/src/lib/markdown';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  coverImageAlt: string | null;
  categoryId: string | null;
  status: string;
  featured: boolean;
  publishedAt: Date | null;
  scheduledFor: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  tagIds: string[];
};

export function BlogForm({
  post,
  categories,
  tags,
  mediaOptions,
}: {
  post?: Post | null;
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  mediaOptions: { url: string; label: string }[];
}) {
  const [preview, setPreview] = useState(false);
  const [content, setContent] = useState(post?.content ?? '');

  return (
    <FormShell action={saveBlogPostAction} className="space-y-4">
      {(state) => (
        <>
          {post?.id && <input type="hidden" name="id" value={post.id} />}

          <Card title="Article">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" name="title" required error={state.errors?.title} className="sm:col-span-2">
                <input id="title" name="title" defaultValue={post?.title ?? ''} required className={inputClass} />
              </Field>

              <Field
                label="URL slug"
                name="slug"
                required
                error={state.errors?.slug}
                hint="Changing this on a published article creates a redirect automatically."
              >
                <input id="slug" name="slug" defaultValue={post?.slug ?? ''} required className={inputClass} />
              </Field>

              <Field label="Category" name="categoryId">
                <select id="categoryId" name="categoryId" defaultValue={post?.categoryId ?? ''} className={selectClass}>
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Excerpt" name="excerpt" required error={state.errors?.excerpt} hint="Shown on cards and in search results." className="sm:col-span-2">
                <textarea id="excerpt" name="excerpt" rows={2} defaultValue={post?.excerpt ?? ''} required className={textareaClass} />
              </Field>
            </div>
          </Card>

          <Card
            title="Content"
            description="Markdown supported: ## headings, **bold**, *italic*, lists, > quotes, tables, `code`, [links](https://…)."
            action={
              <button
                type="button"
                onClick={() => setPreview((v) => !v)}
                aria-pressed={preview}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/15 px-2.5 text-[11.5px] font-semibold text-white/70 transition hover:text-white"
              >
                <Eye size={12} aria-hidden="true" />
                {preview ? 'Edit' : 'Preview'}
              </button>
            }
          >
            {preview ? (
              <div className="rounded-xl bg-white p-5">
                {content.trim() ? (
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content).html }} />
                ) : (
                  <p className="text-[13px] text-mute-onLight">Nothing to preview yet.</p>
                )}
              </div>
            ) : (
              <Field label="Article body" name="content" required error={state.errors?.content}>
                <textarea
                  id="content"
                  name="content"
                  rows={22}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className={`${textareaClass} font-mono text-[12.5px]`}
                  placeholder={'Intro paragraph…\n\n## First section\n\nBody text…'}
                />
              </Field>
            )}
            {/* keep the value in the form while previewing */}
            {preview && <input type="hidden" name="content" value={content} />}
          </Card>

          <Card title="Tags">
            {tags.length === 0 ? (
              <p className="text-[12.5px] text-white/60">
                No tags yet — create them from{' '}
                <Link href="/admin/blog/categories" className="text-brand-soft underline underline-offset-2">
                  Categories &amp; tags
                </Link>
                .
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/12 px-2.5 py-1 text-[11.5px] text-white/70 transition has-[:checked]:border-brand/50 has-[:checked]:bg-brand/10 has-[:checked]:text-white"
                  >
                    <input
                      type="checkbox"
                      name="tagIds"
                      value={tag.id}
                      defaultChecked={post?.tagIds.includes(tag.id) ?? false}
                      className="h-3 w-3 accent-brand"
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            )}
          </Card>

          <Card title="Media">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cover image URL" name="coverImage" hint="Pick from the media library or paste a path.">
                <input
                  id="coverImage"
                  name="coverImage"
                  list="post-media"
                  defaultValue={post?.coverImage ?? ''}
                  className={inputClass}
                />
                <datalist id="post-media">
                  {mediaOptions.map((option) => (
                    <option key={option.url} value={option.url}>
                      {option.label}
                    </option>
                  ))}
                </datalist>
              </Field>
              <Field label="Cover image alt text" name="coverImageAlt" hint="Required for accessibility.">
                <input id="coverImageAlt" name="coverImageAlt" defaultValue={post?.coverImageAlt ?? ''} className={inputClass} />
              </Field>
            </div>
          </Card>

          <Card title="Publishing & SEO">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status" name="status">
                <select id="status" name="status" defaultValue={post?.status ?? 'DRAFT'} className={selectClass}>
                  <option value="DRAFT">Draft (hidden)</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </Field>
              <Field label="Publish date" name="publishedAt" hint="Leave blank to use now when publishing. Future dates hide the article until then.">
                <input
                  id="publishedAt"
                  name="publishedAt"
                  type="datetime-local"
                  defaultValue={
                    post?.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : ''
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Schedule for" name="scheduledFor" hint="Optional reminder of your intended publication time (not required).">
                <input
                  id="scheduledFor"
                  name="scheduledFor"
                  type="datetime-local"
                  defaultValue={post?.scheduledFor ? new Date(post.scheduledFor).toISOString().slice(0, 16) : ''}
                  className={inputClass}
                />
              </Field>
              <Field label="Canonical URL" name="canonicalUrl" error={state.errors?.canonicalUrl} hint="Only set this if the article was first published elsewhere.">
                <input id="canonicalUrl" name="canonicalUrl" type="url" defaultValue={post?.canonicalUrl ?? ''} className={inputClass} />
              </Field>
              <Field label="SEO title" name="seoTitle" error={state.errors?.seoTitle} hint="Max 70 characters." className="sm:col-span-2">
                <input id="seoTitle" name="seoTitle" defaultValue={post?.seoTitle ?? ''} className={inputClass} />
              </Field>
              <Field label="SEO description" name="seoDescription" error={state.errors?.seoDescription} hint="Max 200 characters." className="sm:col-span-2">
                <textarea id="seoDescription" name="seoDescription" rows={2} defaultValue={post?.seoDescription ?? ''} className={textareaClass} />
              </Field>
              <label className="flex items-center gap-2 text-[12.5px] text-white/70 sm:col-span-2">
                <input type="checkbox" name="featured" defaultChecked={post?.featured ?? false} className="h-4 w-4 accent-brand" />
                Feature at the top of the blog
              </label>
            </div>
          </Card>

          <div className="flex items-center gap-2">
            <SubmitButton>{post ? 'Save article' : 'Create article'}</SubmitButton>
            {post?.status === 'PUBLISHED' && (
              <a
                href={`/blog/${post.slug}`}
                target="_blank"
                className="inline-flex h-10 items-center rounded-lg border border-white/15 px-3.5 text-[12.5px] font-semibold text-white/80 transition hover:text-white"
              >
                View live
              </a>
            )}
          </div>
        </>
      )}
    </FormShell>
  );
}

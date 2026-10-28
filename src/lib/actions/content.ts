'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import { requireUser } from '@/src/lib/auth';
import {
  blogPostSchema,
  faqSchema,
  portfolioSchema,
  pricingPlanSchema,
  testimonialSchema,
} from '@/src/lib/validation';
import { CACHE_TAGS } from '@/src/lib/content';
import { estimateReadingMinutes, slugify } from '@/src/lib/utils';
import type { ActionState } from '@/src/lib/actions/types';

/**
 * Content management actions. Every action calls requireUser() first — access
 * control lives on the server, never in the UI.
 */

function toErrors(issues: { path: (string | number)[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join('.') || 'form';
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

function nullable(value: FormDataEntryValue | null): string | null {
  const str = typeof value === 'string' ? value.trim() : '';
  return str.length ? str : null;
}

function listFromTextarea(value: FormDataEntryValue | null): string[] {
  const str = typeof value === 'string' ? value : '';
  return str
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------- portfolio

export async function savePortfolioAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireUser('EDITOR');
  } catch {
    return { ok: false, message: 'You must be signed in.' };
  }

  const id = nullable(formData.get('id'));
  const title = String(formData.get('title') ?? '');
  const rawSlug = String(formData.get('slug') ?? '').trim() || slugify(title);
  const launchDateRaw = nullable(formData.get('launchDate'));

  const parsed = portfolioSchema.safeParse({
    title,
    slug: rawSlug,
    clientName: String(formData.get('clientName') ?? ''),
    industry: String(formData.get('industry') ?? ''),
    serviceCategory: nullable(formData.get('serviceCategory')) ?? null,
    categoryLabel: String(formData.get('categoryLabel') ?? ''),
    shortDescription: String(formData.get('shortDescription') ?? ''),
    overview: String(formData.get('overview') ?? ''),
    brief: String(formData.get('brief') ?? ''),
    challenges: String(formData.get('challenges') ?? ''),
    strategy: String(formData.get('strategy') ?? ''),
    solution: String(formData.get('solution') ?? ''),
    technologies: listFromTextarea(formData.get('technologies')),
    deliverables: listFromTextarea(formData.get('deliverables')),
    projectUrl: String(formData.get('projectUrl') ?? ''),
    launchDate: launchDateRaw ?? '',
    featuredImage: String(formData.get('featuredImage') ?? ''),
    featuredImageAlt: String(formData.get('featuredImageAlt') ?? ''),
    featured: formData.get('featured') === 'on',
    status: String(formData.get('status') ?? 'DRAFT'),
    order: Number(formData.get('order') ?? 0) || 0,
    seoTitle: String(formData.get('seoTitle') ?? ''),
    seoDescription: String(formData.get('seoDescription') ?? ''),
  });

  if (!parsed.success) {
    return { ok: false, message: 'Please check the highlighted fields.', errors: toErrors(parsed.error.issues) };
  }

  const data = parsed.data;

  // Slug collision check (excluding the record being edited)
  const clash = await prisma.portfolioProject.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return {
      ok: false,
      message: 'That URL slug is already in use.',
      errors: { slug: 'Choose a different slug.' },
    };
  }

  const serviceKey = data.serviceCategory ?? null;
  const service = serviceKey ? await prisma.service.findUnique({ where: { key: serviceKey } }) : null;

  const payload = {
    title: data.title,
    slug: data.slug,
    clientName: data.clientName || null,
    industry: data.industry || null,
    serviceCategory: serviceKey,
    serviceRef: service?.id ?? null,
    categoryLabel: data.categoryLabel,
    shortDescription: data.shortDescription,
    overview: data.overview,
    brief: data.brief || null,
    challenges: data.challenges || null,
    strategy: data.strategy || null,
    solution: data.solution || null,
    technologies: data.technologies,
    deliverables: data.deliverables,
    projectUrl: data.projectUrl || null,
    launchDate: launchDateRaw ? new Date(launchDateRaw) : null,
    featuredImage: data.featuredImage || null,
    featuredImageAlt: data.featuredImageAlt || null,
    featured: data.featured,
    status: data.status,
    order: data.order,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
  };

  try {
    if (id) {
      const existing = await prisma.portfolioProject.findUnique({ where: { id }, select: { slug: true } });
      await prisma.portfolioProject.update({ where: { id }, data: payload });
      // Record a redirect when a published URL changes.
      if (existing && existing.slug !== data.slug) {
        await prisma.redirect.upsert({
          where: { fromPath: `/work/${existing.slug}` },
          update: { toPath: `/work/${data.slug}` },
          create: { fromPath: `/work/${existing.slug}`, toPath: `/work/${data.slug}` },
        });
      }
    } else {
      await prisma.portfolioProject.create({ data: payload });
    }
  } catch (error) {
    console.error('[portfolio:save]', error);
    return { ok: false, message: 'Could not save the project. Please try again.' };
  }

  revalidateTag(CACHE_TAGS.projects);
  revalidatePath('/work');
  revalidatePath(`/work/${data.slug}`);
  revalidatePath('/admin/portfolio');

  redirect('/admin/portfolio?saved=1');
}

export async function deletePortfolioAction(formData: FormData) {
  await requireUser('ADMIN');
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const project = await prisma.portfolioProject
    .delete({ where: { id } })
    .catch(() => null);
  if (project) {
    await prisma.redirect
      .upsert({
        where: { fromPath: `/work/${project.slug}` },
        update: { toPath: '/work' },
        create: { fromPath: `/work/${project.slug}`, toPath: '/work' },
      })
      .catch(() => null);
  }
  revalidateTag(CACHE_TAGS.projects);
  revalidatePath('/work');
  revalidatePath('/admin/portfolio');
}

export async function togglePortfolioFeaturedAction(formData: FormData) {
  await requireUser('EDITOR');
  const id = String(formData.get('id') ?? '');
  const project = await prisma.portfolioProject.findUnique({ where: { id } });
  if (!project) return;
  await prisma.portfolioProject.update({
    where: { id },
    data: { featured: !project.featured },
  });
  revalidateTag(CACHE_TAGS.projects);
  revalidatePath('/');
  revalidatePath('/work');
  revalidatePath('/admin/portfolio');
}

// --------------------------------------------------------------------- blog

export async function saveBlogPostAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let user;
  try {
    user = await requireUser('EDITOR');
  } catch {
    return { ok: false, message: 'You must be signed in.' };
  }

  const id = nullable(formData.get('id'));
  const title = String(formData.get('title') ?? '');
  const rawSlug = String(formData.get('slug') ?? '').trim() || slugify(title);
  const status = String(formData.get('status') ?? 'DRAFT');
  const publishedAtRaw = nullable(formData.get('publishedAt'));
  const scheduledForRaw = nullable(formData.get('scheduledFor'));
  const tagIds = formData.getAll('tagIds').map(String).filter(Boolean);

  const parsed = blogPostSchema.safeParse({
    title,
    slug: rawSlug,
    excerpt: String(formData.get('excerpt') ?? ''),
    content: String(formData.get('content') ?? ''),
    coverImage: String(formData.get('coverImage') ?? ''),
    coverImageAlt: String(formData.get('coverImageAlt') ?? ''),
    categoryId: String(formData.get('categoryId') ?? ''),
    tagIds,
    status,
    featured: formData.get('featured') === 'on',
    publishedAt: publishedAtRaw ?? '',
    scheduledFor: scheduledForRaw ?? '',
    seoTitle: String(formData.get('seoTitle') ?? ''),
    seoDescription: String(formData.get('seoDescription') ?? ''),
    canonicalUrl: String(formData.get('canonicalUrl') ?? ''),
  });

  if (!parsed.success) {
    return { ok: false, message: 'Please check the highlighted fields.', errors: toErrors(parsed.error.issues) };
  }

  const data = parsed.data;

  const clash = await prisma.blogPost.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { ok: false, message: 'That URL slug is already in use.', errors: { slug: 'Choose a different slug.' } };
  }

  const publishedAt =
    publishedAtRaw !== null
      ? new Date(publishedAtRaw)
      : data.status === 'PUBLISHED'
        ? new Date()
        : null;

  const payload = {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    coverImage: data.coverImage || null,
    coverImageAlt: data.coverImageAlt || null,
    categoryId: data.categoryId || null,
    authorId: user.id,
    authorName: user.name,
    status: data.status,
    featured: data.featured,
    readingMinutes: estimateReadingMinutes(data.content),
    publishedAt,
    scheduledFor: scheduledForRaw ? new Date(scheduledForRaw) : null,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    canonicalUrl: data.canonicalUrl || null,
  };

  try {
    if (id) {
      const existing = await prisma.blogPost.findUnique({ where: { id }, select: { slug: true } });
      await prisma.blogPost.update({
        where: { id },
        data: { ...payload, tags: { deleteMany: {}, create: tagIds.map((tagId) => ({ tagId })) } },
      });
      if (existing && existing.slug !== data.slug) {
        await prisma.redirect.upsert({
          where: { fromPath: `/blog/${existing.slug}` },
          update: { toPath: `/blog/${data.slug}` },
          create: { fromPath: `/blog/${existing.slug}`, toPath: `/blog/${data.slug}` },
        });
      }
    } else {
      await prisma.blogPost.create({
        data: { ...payload, tags: { create: tagIds.map((tagId) => ({ tagId })) } },
      });
    }
  } catch (error) {
    console.error('[blog:save]', error);
    return { ok: false, message: 'Could not save the article. Please try again.' };
  }

  revalidateTag(CACHE_TAGS.posts);
  revalidatePath('/blog');
  revalidatePath(`/blog/${data.slug}`);
  revalidatePath('/admin/blog');

  redirect('/admin/blog?saved=1');
}

export async function deleteBlogPostAction(formData: FormData) {
  await requireUser('ADMIN');
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const post = await prisma.blogPost.delete({ where: { id } }).catch(() => null);
  if (post) {
    await prisma.redirect
      .upsert({
        where: { fromPath: `/blog/${post.slug}` },
        update: { toPath: '/blog' },
        create: { fromPath: `/blog/${post.slug}`, toPath: '/blog' },
      })
      .catch(() => null);
  }
  revalidateTag(CACHE_TAGS.posts);
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
}

export async function setBlogPostStatusAction(formData: FormData) {
  await requireUser('EDITOR');
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? 'DRAFT');
  if (!['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) return;

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return;

  await prisma.blogPost.update({
    where: { id },
    data: {
      status: status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
      publishedAt: status === 'PUBLISHED' ? (post.publishedAt ?? new Date()) : post.publishedAt,
    },
  });

  revalidateTag(CACHE_TAGS.posts);
  revalidatePath('/blog');
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath('/admin/blog');
}

export async function createCategoryAction(formData: FormData) {
  await requireUser('ADMIN');
  const name = String(formData.get('name') ?? '').trim();
  if (name.length < 2) return;
  const slug = slugify(name);
  await prisma.blogCategory
    .upsert({
      where: { slug },
      update: { name },
      create: { name, slug, description: nullable(formData.get('description')) },
    })
    .catch(() => null);
  revalidateTag(CACHE_TAGS.posts);
  revalidatePath('/admin/blog');
  revalidatePath('/admin/blog/categories');
}

export async function deleteCategoryAction(formData: FormData) {
  await requireUser('ADMIN');
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await prisma.blogCategory.delete({ where: { id } }).catch(() => null);
  revalidateTag(CACHE_TAGS.posts);
  revalidatePath('/admin/blog/categories');
}

export async function createTagAction(formData: FormData) {
  await requireUser('ADMIN');
  const name = String(formData.get('name') ?? '').trim();
  if (name.length < 2) return;
  const slug = slugify(name);
  await prisma.blogTag
    .upsert({ where: { slug }, update: { name }, create: { name, slug } })
    .catch(() => null);
  revalidateTag(CACHE_TAGS.posts);
  revalidatePath('/admin/blog');
}

export async function deleteTagAction(formData: FormData) {
  await requireUser('ADMIN');
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await prisma.blogTag.delete({ where: { id } }).catch(() => null);
  revalidateTag(CACHE_TAGS.posts);
  revalidatePath('/admin/blog/categories');
}

// ------------------------------------------------------------------- faqs

export async function saveFaqAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireUser('EDITOR');
  } catch {
    return { ok: false, message: 'You must be signed in.' };
  }

  const id = nullable(formData.get('id'));
  const parsed = faqSchema.safeParse({
    question: String(formData.get('question') ?? ''),
    answer: String(formData.get('answer') ?? ''),
    scope: nullable(formData.get('scope')) ?? null,
    order: Number(formData.get('order') ?? 0) || 0,
    status: String(formData.get('status') ?? 'PUBLISHED'),
  });

  if (!parsed.success) {
    return { ok: false, message: 'Please check the form.', errors: toErrors(parsed.error.issues) };
  }

  const payload = {
    question: parsed.data.question,
    answer: parsed.data.answer,
    scope: parsed.data.scope ?? null,
    order: parsed.data.order,
    status: parsed.data.status,
  };

  try {
    if (id) {
      await prisma.fAQ.update({ where: { id }, data: payload });
    } else {
      await prisma.fAQ.create({ data: payload });
    }
  } catch (error) {
    console.error('[faq:save]', error);
    return { ok: false, message: 'Could not save the FAQ.' };
  }

  revalidateTag(CACHE_TAGS.faqs);
  revalidatePath('/');
  revalidatePath('/contact');
  revalidatePath('/services/social-media-management');
  revalidatePath('/services/shopify-development');
  revalidatePath('/services/wordpress-development');
  revalidatePath('/admin/faqs');

  return { ok: true, message: id ? 'FAQ updated.' : 'FAQ created.' };
}

export async function deleteFaqAction(formData: FormData) {
  await requireUser('EDITOR');
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await prisma.fAQ.delete({ where: { id } }).catch(() => null);
  revalidateTag(CACHE_TAGS.faqs);
  revalidatePath('/');
  revalidatePath('/admin/faqs');
}

// -------------------------------------------------------------------- pricing

/** Parse the textarea: one feature per line, "- " prefix marks it excluded. */
function parseFeatures(raw: string) {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const excluded = line.startsWith('-');
      return {
        label: (excluded ? line.slice(1) : line).trim(),
        included: !excluded,
        order: index,
      };
    })
    .filter((f) => f.label.length > 0);
}

export async function savePricingPlanAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireUser('EDITOR');
  } catch {
    return { ok: false, message: 'You must be signed in.' };
  }

  const id = nullable(formData.get('id'));
  const parsed = pricingPlanSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    tagline: String(formData.get('tagline') ?? ''),
    price: String(formData.get('price') ?? ''),
    priceNote: String(formData.get('priceNote') ?? ''),
    billingNote: String(formData.get('billingNote') ?? ''),
    serviceKey: nullable(formData.get('serviceKey')) ?? null,
    highlighted: formData.get('highlighted') === 'on' || formData.get('highlighted') === 'true',
    ctaLabel: String(formData.get('ctaLabel') ?? 'Start an enquiry'),
    ctaHref: String(formData.get('ctaHref') ?? '/contact'),
    notIncluded: String(formData.get('notIncluded') ?? ''),
    order: Number(formData.get('order') ?? 0) || 0,
    status: String(formData.get('status') ?? 'PUBLISHED'),
    features: String(formData.get('features') ?? ''),
  });

  if (!parsed.success) {
    return { ok: false, message: 'Please check the form.', errors: toErrors(parsed.error.issues) };
  }

  const data = parsed.data;
  const features = parseFeatures(data.features ?? '');
  const notIncluded = (data.notIncluded ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const base = {
    name: data.name,
    tagline: data.tagline ?? '',
    price: data.price ?? '',
    priceNote: data.priceNote ?? '',
    billingNote: data.billingNote ?? '',
    serviceKey: data.serviceKey ?? null,
    highlighted: data.highlighted,
    ctaLabel: data.ctaLabel,
    ctaHref: data.ctaHref,
    notIncluded,
    order: data.order,
    status: data.status,
    // Once the agency edits a plan the figures are theirs, not sample data.
    isSampleContent: false,
  };

  try {
    if (id) {
      await prisma.pricingPlan.update({ where: { id }, data: base });
      await prisma.pricingFeature.deleteMany({ where: { planId: id } });
      if (features.length) {
        await prisma.pricingFeature.createMany({
          data: features.map((f) => ({ ...f, planId: id })),
        });
      }
    } else {
      await prisma.pricingPlan.create({
        data: { ...base, features: { create: features } },
      });
    }
  } catch (error) {
    console.error('[pricing:save]', error);
    return { ok: false, message: 'Could not save the plan.' };
  }

  revalidateTag(CACHE_TAGS.pricing);
  revalidatePath('/pricing');
  revalidatePath('/admin/pricing');

  return { ok: true, message: id ? 'Plan updated.' : 'Plan created.' };
}

export async function deletePricingPlanAction(formData: FormData) {
  await requireUser('EDITOR');
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await prisma.pricingPlan.delete({ where: { id } }).catch(() => null);
  revalidateTag(CACHE_TAGS.pricing);
  revalidatePath('/pricing');
  revalidatePath('/admin/pricing');
}

// ----------------------------------------------------------- testimonials

export async function saveTestimonialAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireUser('EDITOR');
  } catch {
    return { ok: false, message: 'You must be signed in.' };
  }

  const id = nullable(formData.get('id'));
  const ratingRaw = nullable(formData.get('rating'));

  const parsed = testimonialSchema.safeParse({
    quote: String(formData.get('quote') ?? ''),
    authorName: String(formData.get('authorName') ?? ''),
    authorRole: String(formData.get('authorRole') ?? ''),
    company: String(formData.get('company') ?? ''),
    avatarUrl: String(formData.get('avatarUrl') ?? ''),
    rating: ratingRaw ? Number(ratingRaw) : null,
    approved: formData.get('approved') === 'on',
    order: Number(formData.get('order') ?? 0) || 0,
  });

  if (!parsed.success) {
    return { ok: false, message: 'Please check the form.', errors: toErrors(parsed.error.issues) };
  }

  const payload = {
    quote: parsed.data.quote,
    authorName: parsed.data.authorName,
    authorRole: parsed.data.authorRole || null,
    company: parsed.data.company || null,
    avatarUrl: parsed.data.avatarUrl || null,
    rating: parsed.data.rating ?? null,
    approved: parsed.data.approved,
    order: parsed.data.order,
  };

  try {
    if (id) {
      await prisma.testimonial.update({ where: { id }, data: payload });
    } else {
      await prisma.testimonial.create({ data: payload });
    }
  } catch (error) {
    console.error('[testimonial:save]', error);
    return { ok: false, message: 'Could not save the testimonial.' };
  }

  revalidateTag(CACHE_TAGS.testimonials);
  revalidatePath('/');
  revalidatePath('/admin/testimonials');

  return {
    ok: true,
    message: payload.approved
      ? 'Testimonial saved and approved — it is now visible on the site.'
      : 'Testimonial saved as unapproved (hidden from the site).',
  };
}

export async function toggleTestimonialApprovalAction(formData: FormData) {
  await requireUser('EDITOR');
  const id = String(formData.get('id') ?? '');
  const record = await prisma.testimonial.findUnique({ where: { id } });
  if (!record) return;
  await prisma.testimonial.update({ where: { id }, data: { approved: !record.approved } });
  revalidateTag(CACHE_TAGS.testimonials);
  revalidatePath('/');
  revalidatePath('/admin/testimonials');
}

export async function deleteTestimonialAction(formData: FormData) {
  await requireUser('EDITOR');
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await prisma.testimonial.delete({ where: { id } }).catch(() => null);
  revalidateTag(CACHE_TAGS.testimonials);
  revalidatePath('/');
  revalidatePath('/admin/testimonials');
}

// ---------------------------------------------------------------- services

export async function saveServiceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireUser('ADMIN');
  } catch {
    return { ok: false, message: 'You need administrator access to edit services.' };
  }

  const key = String(formData.get('key') ?? '');
  const services = ['SOCIAL_MEDIA_MANAGEMENT', 'SHOPIFY_DEVELOPMENT', 'WORDPRESS_DEVELOPMENT'];
  if (!services.includes(key)) return { ok: false, message: 'Unknown service.' };

  const sectionsRaw = String(formData.get('sections') ?? '');
  let sections: unknown;
  try {
    sections = JSON.parse(sectionsRaw || '{}');
  } catch {
    return { ok: false, message: 'Service sections must be valid JSON.' };
  }

  try {
    await prisma.service.update({
      where: { key: key as 'SOCIAL_MEDIA_MANAGEMENT' },
      data: {
        name: String(formData.get('name') ?? '').slice(0, 160),
        shortName: String(formData.get('shortName') ?? '').slice(0, 60),
        tagline: String(formData.get('tagline') ?? '').slice(0, 300),
        summary: String(formData.get('summary') ?? ''),
        heroHeadline: String(formData.get('heroHeadline') ?? '').slice(0, 200),
        heroDescription: String(formData.get('heroDescription') ?? ''),
        seoTitle: nullable(formData.get('seoTitle')),
        seoDescription: nullable(formData.get('seoDescription')),
        status: String(formData.get('status') ?? 'PUBLISHED') as 'PUBLISHED',
        sections: sections as object,
      },
    });
  } catch (error) {
    console.error('[service:save]', error);
    return { ok: false, message: 'Could not save the service content.' };
  }

  revalidateTag(CACHE_TAGS.services);
  revalidatePath('/services');
  revalidatePath('/');
  revalidatePath('/admin/services');
  return { ok: true, message: 'Service content saved and published.' };
}

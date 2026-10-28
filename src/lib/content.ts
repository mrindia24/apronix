import 'server-only';
import { unstable_cache } from 'next/cache';
import type { Prisma, ServiceKey } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import type { ServiceSections } from '@/src/content/services';
import { PUBLIC_STATUS } from '@/src/lib/constants';

/**
 * Read-side data access for public pages. Every function is cached and tagged so
 * publishing content in the dashboard can revalidate it via revalidateTag().
 */

export const CACHE_TAGS = {
  services: 'services',
  projects: 'projects',
  posts: 'posts',
  faqs: 'faqs',
  pricing: 'pricing',
  testimonials: 'testimonials',
  settings: 'site-settings',
} as const;

export type ServiceRecord = {
  id: string;
  key: ServiceKey;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  summary: string;
  heroHeadline: string;
  heroDescription: string;
  sections: ServiceSections;
  icon: string;
  accent: string;
  order: number;
  seoTitle: string | null;
  seoDescription: string | null;
};

export const getServices = unstable_cache(
  async (): Promise<ServiceRecord[]> => {
    const rows = await prisma.service.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
    return rows.map((row) => ({
      ...row,
      sections: (row.sections ?? {}) as ServiceSections,
    }));
  },
  ['services-list'],
  { revalidate: 600, tags: [CACHE_TAGS.services] },
);

export async function getServiceBySlug(slug: string): Promise<ServiceRecord | null> {
  const services = await getServices();
  return services.find((s) => s.slug === slug) ?? null;
}

export async function getServiceByKey(key: ServiceKey): Promise<ServiceRecord | null> {
  const services = await getServices();
  return services.find((s) => s.key === key) ?? null;
}

export type ProjectListItem = {
  id: string;
  slug: string;
  title: string;
  clientName: string | null;
  industry: string | null;
  serviceCategory: ServiceKey | null;
  categoryLabel: string;
  shortDescription: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  featured: boolean;
  isSampleContent: boolean;
  technologies: string[];
  launchDate: Date | null;
};

const projectListSelect = {
  id: true,
  slug: true,
  title: true,
  clientName: true,
  industry: true,
  serviceCategory: true,
  categoryLabel: true,
  shortDescription: true,
  featuredImage: true,
  featuredImageAlt: true,
  featured: true,
  isSampleContent: true,
  technologies: true,
  launchDate: true,
} satisfies Prisma.PortfolioProjectSelect;

export const getProjects = unstable_cache(
  async (): Promise<ProjectListItem[]> => {
    return prisma.portfolioProject.findMany({
      where: { status: PUBLIC_STATUS.PUBLISHED },
      select: projectListSelect,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  },
  ['projects-list'],
  { revalidate: 600, tags: [CACHE_TAGS.projects] },
);

export const getFeaturedProjects = unstable_cache(
  async (limit = 3): Promise<ProjectListItem[]> => {
    return prisma.portfolioProject.findMany({
      where: { status: PUBLIC_STATUS.PUBLISHED, featured: true },
      select: projectListSelect,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: limit,
    });
  },
  ['projects-featured'],
  { revalidate: 600, tags: [CACHE_TAGS.projects] },
);

export async function getProjectBySlug(slug: string) {
  return prisma.portfolioProject.findFirst({
    where: { slug, status: PUBLIC_STATUS.PUBLISHED },
    include: { images: { orderBy: { order: 'asc' } } },
  });
}

export async function getRelatedProjects(slug: string, category: ServiceKey | null, limit = 3) {
  return prisma.portfolioProject.findMany({
    where: {
      status: PUBLIC_STATUS.PUBLISHED,
      slug: { not: slug },
      ...(category ? { serviceCategory: category } : {}),
    },
    select: projectListSelect,
    orderBy: [{ featured: 'desc' }, { order: 'asc' }],
    take: limit,
  });
}

export type BlogListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  coverImageAlt: string | null;
  readingMinutes: number;
  publishedAt: Date | null;
  featured: boolean;
  isSampleContent: boolean;
  authorName: string | null;
  category: { name: string; slug: string } | null;
  tags: { name: string; slug: string }[];
};

const publishedPostWhere = {
  status: PUBLIC_STATUS.PUBLISHED,
  OR: [{ publishedAt: { lte: new Date() } }, { publishedAt: null, createdAt: { lte: new Date() } }],
} satisfies Prisma.BlogPostWhereInput;

export const getBlogCategories = unstable_cache(
  async () => {
    return prisma.blogCategory.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { posts: { where: publishedPostWhere } } } },
    });
  },
  ['blog-categories'],
  { revalidate: 300, tags: [CACHE_TAGS.posts] },
);

export type BlogQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  category?: string;
  tag?: string;
};

export async function getBlogPosts({ page = 1, perPage = 9, search, category, tag }: BlogQuery) {
  const where: Prisma.BlogPostWhereInput = {
    ...publishedPostWhere,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { excerpt: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
          AND: [
            {
              OR: [
                { publishedAt: { lte: new Date() } },
                { publishedAt: null, createdAt: { lte: new Date() } },
              ],
            },
          ],
        }
      : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        coverImageAlt: true,
        readingMinutes: true,
        publishedAt: true,
        featured: true,
        isSampleContent: true,
        authorName: true,
        category: { select: { name: true, slug: true } },
        tags: { select: { tag: { select: { name: true, slug: true } } } },
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    items: items.map(({ tags, ...rest }) => ({
      ...rest,
      tags: tags.map((t) => t.tag),
    })) as BlogListItem[],
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, status: PUBLIC_STATUS.PUBLISHED },
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { name: true, email: true } },
      tags: { select: { tag: { select: { name: true, slug: true } } } },
    },
  });
}

export async function getRelatedPosts(postId: string, categoryId: string | null, limit = 3) {
  return prisma.blogPost.findMany({
    where: {
      ...publishedPostWhere,
      id: { not: postId },
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: [{ publishedAt: 'desc' }],
    take: limit,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      coverImageAlt: true,
      readingMinutes: true,
      publishedAt: true,
      category: { select: { name: true, slug: true } },
    },
  });
}

export async function getFeaturedPosts(limit = 2) {
  return prisma.blogPost.findMany({
    where: { ...publishedPostWhere, featured: true },
    orderBy: [{ publishedAt: 'desc' }],
    take: limit,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      coverImageAlt: true,
      readingMinutes: true,
      publishedAt: true,
      category: { select: { name: true, slug: true } },
    },
  });
}

export async function getPostSlugs() {
  return prisma.blogPost.findMany({
    where: publishedPostWhere,
    select: { slug: true, updatedAt: true },
  });
}

export async function getBlogTags() {
  return prisma.blogTag.findMany({
    orderBy: { name: 'asc' },
    include: { posts: { select: { postId: true } } },
  });
}

export const getFaqs = unstable_cache(
  async (scope?: ServiceKey | null) => {
    return prisma.fAQ.findMany({
      where: { status: PUBLIC_STATUS.PUBLISHED, scope: scope ?? null },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  },
  ['faqs-list'],
  { revalidate: 600, tags: [CACHE_TAGS.faqs] },
);

export const getApprovedTestimonials = unstable_cache(
  async () => {
    return prisma.testimonial.findMany({
      where: { approved: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  },
  ['testimonials-approved'],
  { revalidate: 600, tags: [CACHE_TAGS.testimonials] },
);

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export type PricingPlanRecord = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  billingNote: string;
  serviceKey: ServiceKey | null;
  highlighted: boolean;
  ctaLabel: string;
  ctaHref: string;
  notIncluded: string[];
  order: number;
  isSampleContent: boolean;
  features: { id: string; label: string; included: boolean }[];
};

export const getPricingPlans = unstable_cache(
  async (): Promise<PricingPlanRecord[]> => {
    const rows = await prisma.pricingPlan.findMany({
      where: { status: PUBLIC_STATUS.PUBLISHED },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include: { features: { orderBy: [{ order: 'asc' }, { label: 'asc' }] } },
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      tagline: row.tagline,
      price: row.price,
      priceNote: row.priceNote,
      billingNote: row.billingNote,
      serviceKey: row.serviceKey,
      highlighted: row.highlighted,
      ctaLabel: row.ctaLabel,
      ctaHref: row.ctaHref,
      notIncluded: Array.isArray(row.notIncluded) ? (row.notIncluded as string[]) : [],
      order: row.order,
      isSampleContent: row.isSampleContent,
      features: row.features.map((f) => ({ id: f.id, label: f.label, included: f.included })),
    }));
  },
  ['pricing-plans'],
  { revalidate: 600, tags: [CACHE_TAGS.pricing] },
);

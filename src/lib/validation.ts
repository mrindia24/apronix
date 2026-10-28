import { z } from 'zod';

/**
 * Shared validation schemas. These are imported by both the client (inline form
 * validation via server-returned field errors) and the server (authoritative
 * validation in route handlers / server actions).
 */

/** E.164-ish international phone, 7–15 digits, optional +, spaces, dashes, parens. */
export const phoneRegex = /^\+?[\d][\d\s().-]{6,18}$/;

export const SERVICE_OPTIONS = [
  { value: 'SOCIAL_MEDIA_MANAGEMENT', label: 'Social Media Management' },
  { value: 'SHOPIFY_DEVELOPMENT', label: 'Shopify Development' },
  { value: 'WORDPRESS_DEVELOPMENT', label: 'WordPress Development' },
  { value: 'MULTIPLE', label: 'Multiple Services' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const BUDGET_OPTIONS = [
  'Under ₹25,000',
  '₹25,000 – ₹75,000',
  '₹75,000 – ₹2,00,000',
  '₹2,00,000+',
  'Not sure yet',
] as const;

export const TIMELINE_OPTIONS = [
  'ASAP (within 2 weeks)',
  'Within 1 month',
  '1–3 months',
  'Just exploring',
] as const;

export const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST', 'SPAM'] as const;

export const leadSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Please enter your full name.')
    .max(120, 'That name is too long.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid business email address.')
    .max(200),
  phone: z
    .string()
    .trim()
    .min(7, 'Please include your country code, e.g. +91 98765 43210.')
    .max(24)
    .regex(phoneRegex, 'Please enter a valid phone number with country code.'),
  company: z.string().trim().max(160).optional().or(z.literal('')),
  service: z.enum([
    'SOCIAL_MEDIA_MANAGEMENT',
    'SHOPIFY_DEVELOPMENT',
    'WORDPRESS_DEVELOPMENT',
    'MULTIPLE',
    'OTHER',
  ]),
  budget: z.string().trim().max(80).optional().or(z.literal('')),
  timeline: z.string().trim().max(80).optional().or(z.literal('')),
  message: z
    .string()
    .trim()
    .min(20, 'Please tell us a little more (at least 20 characters).')
    .max(4000, 'Please keep your message under 4000 characters.'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Please accept the privacy notice so we can reply.' }),
  }),
  // honeypot: bots fill hidden fields, humans never see them
  website: z.string().max(0, 'Rejected.').optional().or(z.literal('')),
  source: z
    .enum(['CONTACT_PAGE', 'SERVICE_PAGE', 'HOME_CTA', 'FOOTER', 'OTHER'])
    .default('CONTACT_PAGE'),
  landingPage: z.string().max(500).optional().or(z.literal('')),
  referrer: z.string().max(500).optional().or(z.literal('')),
  utmSource: z.string().max(120).optional().or(z.literal('')),
  utmMedium: z.string().max(120).optional().or(z.literal('')),
  utmCampaign: z.string().max(120).optional().or(z.literal('')),
  startedAt: z.number().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export type FieldErrors = Record<string, string>;

export function flattenZodErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const serviceKeySchema = z.enum([
  'SOCIAL_MEDIA_MANAGEMENT',
  'SHOPIFY_DEVELOPMENT',
  'WORDPRESS_DEVELOPMENT',
]);

export const publishStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const portfolioSchema = z.object({
  title: z.string().trim().min(3, 'Title is required.').max(160),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only.')
    .max(90),
  clientName: z.string().trim().max(160).optional().or(z.literal('')),
  industry: z.string().trim().max(120).optional().or(z.literal('')),
  serviceCategory: serviceKeySchema.optional().nullable(),
  categoryLabel: z.string().trim().min(2, 'Category label is required.').max(60),
  shortDescription: z.string().trim().min(20, 'Short description must be at least 20 characters.').max(400),
  overview: z.string().trim().min(20, 'Overview is required.').max(8000),
  brief: z.string().trim().max(4000).optional().or(z.literal('')),
  challenges: z.string().trim().max(4000).optional().or(z.literal('')),
  strategy: z.string().trim().max(4000).optional().or(z.literal('')),
  solution: z.string().trim().max(4000).optional().or(z.literal('')),
  technologies: z.array(z.string().trim().max(60)).max(30).default([]),
  deliverables: z.array(z.string().trim().max(120)).max(30).default([]),
  projectUrl: z.string().trim().url('Enter a full URL (https://…).').max(300).optional().or(z.literal('')),
  launchDate: z.string().trim().optional().or(z.literal('')),
  featuredImage: z.string().trim().max(500).optional().or(z.literal('')),
  featuredImageAlt: z.string().trim().max(200).optional().or(z.literal('')),
  featured: z.boolean().default(false),
  status: publishStatusSchema.default('DRAFT'),
  order: z.number().int().min(0).max(999).default(0),
  seoTitle: z.string().trim().max(70).optional().or(z.literal('')),
  seoDescription: z.string().trim().max(200).optional().or(z.literal('')),
});

export const blogPostSchema = z.object({
  title: z.string().trim().min(5, 'Title is required.').max(180),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only.')
    .max(90),
  excerpt: z.string().trim().min(20, 'Write a short summary (20+ characters).').max(400),
  content: z.string().trim().min(50, 'The article body needs at least 50 characters.'),
  coverImage: z.string().trim().max(500).optional().or(z.literal('')),
  coverImageAlt: z.string().trim().max(200).optional().or(z.literal('')),
  categoryId: z.string().trim().optional().or(z.literal('')),
  tagIds: z.array(z.string()).max(20).default([]),
  status: publishStatusSchema.default('DRAFT'),
  featured: z.boolean().default(false),
  publishedAt: z.string().trim().optional().or(z.literal('')),
  scheduledFor: z.string().trim().optional().or(z.literal('')),
  seoTitle: z.string().trim().max(70).optional().or(z.literal('')),
  seoDescription: z.string().trim().max(200).optional().or(z.literal('')),
  canonicalUrl: z.string().trim().url('Enter a full URL.').max(300).optional().or(z.literal('')),
});

export const testimonialSchema = z.object({
  quote: z.string().trim().min(20, 'Quote must be at least 20 characters.').max(1200),
  authorName: z.string().trim().min(2).max(120),
  authorRole: z.string().trim().max(120).optional().or(z.literal('')),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  avatarUrl: z.string().trim().max(500).optional().or(z.literal('')),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  approved: z.boolean().default(false),
  order: z.number().int().min(0).max(99).default(0),
});

export const faqSchema = z.object({
  question: z.string().trim().min(8, 'Question is required.').max(240),
  answer: z.string().trim().min(20, 'Answer is required.').max(2000),
  scope: serviceKeySchema.optional().nullable(),
  order: z.number().int().min(0).max(99).default(0),
  status: publishStatusSchema.default('PUBLISHED'),
});

export const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  note: z.string().trim().max(2000).optional().or(z.literal('')),
});

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export const pricingPlanSchema = z.object({
  name: z.string().trim().min(2, 'Plan name is required.').max(80),
  tagline: z.string().trim().max(200).optional().or(z.literal('')),
  price: z.string().trim().max(40).optional().or(z.literal('')),
  priceNote: z.string().trim().max(40).optional().or(z.literal('')),
  billingNote: z.string().trim().max(160).optional().or(z.literal('')),
  serviceKey: serviceKeySchema.optional().nullable(),
  highlighted: z.boolean().default(false),
  ctaLabel: z.string().trim().max(40).default('Start an enquiry'),
  ctaHref: z.string().trim().max(200).default('/contact'),
  notIncluded: z.string().trim().max(500).optional().or(z.literal('')),
  order: z.number().int().min(0).max(99).default(0),
  status: publishStatusSchema.default('PUBLISHED'),
  /** One feature per line in the textarea. Prefix "- " to mark it excluded. */
  features: z.string().max(4000).optional().or(z.literal('')),
});

export type PricingPlanInput = z.infer<typeof pricingPlanSchema>;

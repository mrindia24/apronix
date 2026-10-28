import { describe, expect, it } from 'vitest';
import { blogPostSchema, leadSchema, loginSchema, portfolioSchema } from '@/src/lib/validation';

const validLead = {
  fullName: 'Priya Raman',
  email: 'Priya@Brightleaf.IN',
  phone: '+91 98765 43210',
  company: 'Brightleaf',
  service: 'SHOPIFY_DEVELOPMENT',
  budget: '₹25,000 – ₹75,000',
  timeline: 'Within 1 month',
  message: 'We need a storefront rebuild before the festive season campaign.',
  consent: true,
  source: 'CONTACT_PAGE',
};

describe('leadSchema', () => {
  it('accepts a valid enquiry and normalises the email', () => {
    const result = leadSchema.safeParse(validLead);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('priya@brightleaf.in');
  });

  it('rejects a malformed email', () => {
    const result = leadSchema.safeParse({ ...validLead, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('requires a phone number with enough digits', () => {
    expect(leadSchema.safeParse({ ...validLead, phone: '123' }).success).toBe(false);
    expect(leadSchema.safeParse({ ...validLead, phone: 'abc-def-ghij' }).success).toBe(false);
  });

  it('requires explicit consent', () => {
    expect(leadSchema.safeParse({ ...validLead, consent: false }).success).toBe(false);
  });

  it('rejects a too-short message', () => {
    expect(leadSchema.safeParse({ ...validLead, message: 'hi' }).success).toBe(false);
  });

  it('rejects unknown service values', () => {
    expect(leadSchema.safeParse({ ...validLead, service: 'HACK' }).success).toBe(false);
  });

  it('rejects an oversized honeypot payload', () => {
    expect(leadSchema.safeParse({ ...validLead, website: 'https://spam.example' }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('requires a minimum password length', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'short' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'longenough1' }).success).toBe(true);
  });
});

describe('portfolioSchema', () => {
  const base = {
    title: 'Storefront rebuild',
    slug: 'storefront-rebuild',
    categoryLabel: 'Shopify',
    shortDescription: 'A complete rebuild of a catalogue-heavy Shopify storefront.',
    overview: 'We rebuilt the theme around a section library and a mobile-first product page.',
    technologies: ['Shopify Liquid'],
    deliverables: ['Theme'],
    featured: false,
    status: 'DRAFT',
    order: 0,
  };

  it('accepts a valid project', () => {
    expect(portfolioSchema.safeParse(base).success).toBe(true);
  });

  it('rejects uppercase or spaced slugs', () => {
    expect(portfolioSchema.safeParse({ ...base, slug: 'Storefront Rebuild' }).success).toBe(false);
    expect(portfolioSchema.safeParse({ ...base, slug: 'UPPER' }).success).toBe(false);
  });

  it('rejects an invalid project URL', () => {
    expect(portfolioSchema.safeParse({ ...base, projectUrl: 'example.com' }).success).toBe(false);
    expect(portfolioSchema.safeParse({ ...base, projectUrl: 'https://example.com' }).success).toBe(true);
  });
});

describe('blogPostSchema', () => {
  it('requires a description and body of useful length', () => {
    const result = blogPostSchema.safeParse({
      title: 'A useful article title',
      slug: 'a-useful-article-title',
      excerpt: 'short',
      content: 'too short',
    });
    expect(result.success).toBe(false);
  });
});

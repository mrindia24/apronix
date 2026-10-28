import { describe, it, expect } from 'vitest';
import { answer } from '@/src/lib/chatbot-intents';
import type { ChatKnowledge } from '@/src/lib/chatbot';

/**
 * The assistant is keyword-matched, so its behaviour is fully testable. These
 * tests lock in two things: common questions route to the right intent, and the
 * bot never improvises a price or a client result.
 */
const kb: ChatKnowledge = {
  services: [
    {
      slug: 'social-media-management',
      name: 'Social Media Management & Marketing',
      shortName: 'Social Media',
      tagline: 'A consistent, recognisable brand presence.',
      summary: 'We plan, design, write and publish your social content.',
      highlights: ['Strategy & positioning', 'Content production'],
    },
    {
      slug: 'shopify-development',
      name: 'Shopify Development',
      shortName: 'Shopify',
      tagline: 'Storefronts built around how people actually buy.',
      summary: 'Fast, conversion-focused Shopify stores.',
      highlights: ['Store foundations', 'Design & build'],
    },
    {
      slug: 'wordpress-development',
      name: 'WordPress Development',
      shortName: 'WordPress',
      tagline: 'Business websites your team can run.',
      summary: 'Business websites and CMS builds.',
      highlights: ['Care & performance'],
    },
  ],
  projects: [
    {
      slug: 'sample-shopify-storefront',
      title: 'Sample: Shopify storefront for a growing catalogue',
      categoryLabel: 'Shopify',
      shortDescription: 'Example structure for a Shopify theme project.',
    },
  ],
  plans: [
    { name: 'Social Growth', price: '₹45,000', priceNote: 'per month', highlighted: true, isSampleContent: true },
    { name: 'Shopify Launch', price: '₹1,20,000', priceNote: 'one-off', highlighted: false, isSampleContent: true },
  ],
  faqs: [
    { question: 'How long does a typical project take?', answer: 'Usually four to eight weeks.' },
    { question: 'What do you need from us to get started?', answer: 'Brand assets and a decision maker.' },
  ],
  contact: {
    email: 'hello@apronixtech.com',
    phone: '+91 141 400 2200',
    whatsapp: null,
    businessHours: 'Mon–Fri, 10:00–19:00 IST',
    serviceArea: 'Working with clients remotely across India and worldwide.',
  },
};

const ask = (m: string) => answer(m, kb);

describe('chatbot intents', () => {
  it('lists all three services for a general services question', () => {
    const r = ask('What services do you offer?');
    expect(r.intent).toBe('services');
    expect(r.text).toContain('Social Media');
    expect(r.text).toContain('Shopify');
    expect(r.text).toContain('WordPress');
    expect(r.links?.[0].href).toBe('/services');
  });

  it('gives detail when a specific service is named', () => {
    const r = ask('Tell me about Shopify');
    expect(r.intent).toBe('service-detail');
    expect(r.text).toContain('Shopify Development');
    expect(r.links?.some((l) => l.href === '/services/shopify-development')).toBe(true);
  });

  it('routes the word "site" to the WordPress line', () => {
    const r = ask('I need a new website for my business');
    expect(r.intent).toBe('service-detail');
    expect(r.text.toLowerCase()).toContain('wordpress');
  });

  it('quotes the published plans, not a made-up figure', () => {
    const r = ask('How much does this cost?');
    expect(r.intent).toBe('pricing');
    expect(r.text).toContain('Social Growth');
    expect(r.text).toContain('₹45,000');
    expect(r.text.toLowerCase()).toContain('scoping');
  });

  it('flags placeholder pricing as not being a quote', () => {
    const r = ask('what are your rates');
    expect(r.text.toLowerCase()).toContain('placeholder');
    expect(r.links?.some((l) => l.href === '/pricing')).toBe(true);
  });

  it('falls back to a scoping conversation when no plans are published', () => {
    const r = answer('how much?', { ...kb, plans: [] });
    expect(r.intent).toBe('pricing');
    expect(r.text.toLowerCase()).toContain('scoping');
    expect(r.links?.some((l) => l.href === '/contact')).toBe(true);
  });

  it('describes work and flags sample content honestly', () => {
    const r = ask('Show me your work');
    expect(r.intent).toBe('work');
    expect(r.text.toLowerCase()).toContain('sample');
  });

  it('returns real contact details', () => {
    const r = ask('How do I contact you?');
    expect(r.intent).toBe('contact');
    expect(r.text).toContain('hello@apronixtech.com');
    expect(r.text).toContain('10:00–19:00');
  });

  it('answers timeline questions from the FAQ', () => {
    const r = ask('How long will a project take?');
    expect(r.text).toContain('four to eight weeks');
  });

  it('handles a greeting', () => {
    expect(ask('hello').intent).toBe('greeting');
  });

  it('refuses out-of-scope services instead of reciting the list', () => {
    const r = ask('Do you do SEO and Google Ads?');
    expect(r.intent).toBe('fallback');
    expect(r.text.toLowerCase()).toContain('outside');
    expect(r.links?.some((l) => l.href === '/contact')).toBe(true);
  });

  it('admits it cannot answer industry-specific questions', () => {
    const r = ask('How would you market a dental clinic?');
    expect(r.intent).toBe('fallback');
    expect(r.text.toLowerCase()).toContain('dental');
    expect(r.text.toLowerCase()).toContain('person');
  });

  it('falls back honestly on pure nonsense', () => {
    const r = ask('xyzzy plugh quux');
    expect(r.intent).toBe('fallback');
    expect(r.text.toLowerCase()).toContain("don't have an answer");
  });

  it('always returns suggestions so the conversation can continue', () => {
    for (const q of ['hi', 'pricing?', 'work', 'contact', 'random nonsense xyzzy']) {
      const r = ask(q);
      expect(r.text.length).toBeGreaterThan(10);
      expect(r.chips?.length ?? 0).toBeGreaterThan(0);
    }
  });
});

describe('chatbot robustness', () => {
  it('never leaks undefined into an answer', () => {
    for (const q of [
      'Do you do SEO for dentists in Norway?',
      'How would you market a dental clinic?',
      'Can you build me a mobile app?',
      'do you offer photography',
    ]) {
      expect(ask(q).text).not.toContain('undefined');
    }
  });

  it('handles plurals in industry questions', () => {
    const r = ask('What about restaurants?');
    expect(r.intent).toBe('fallback');
    expect(r.text.toLowerCase()).toContain('restaurants');
  });
});

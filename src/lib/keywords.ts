import 'server-only';

/**
 * Keyword targeting.
 *
 * IMPORTANT: a page is only given keywords for the topic it actually covers.
 * Stuffing the whole list onto every page (or into a meta keywords tag) does not
 * rank a site — modern search engines either ignore it or treat it as spam, and
 * it makes the pages worse for the humans who have to read them.
 *
 * What actually ranks:
 *   - one page per search intent, each with a distinct title/H1/canonical
 *   - the phrase that page targets appearing naturally in title, H1, body,
 *     headings and internal links
 *   - location terms only where a location is genuinely served
 *
 * `keywords` is emitted as a meta tag for completeness, but the real work happens
 * in the page copy and the JSON-LD below.
 */

/** Shared brand-level terms. Short and genuinely descriptive. */
export const BRAND_KEYWORDS = [
  'Apronix Tech',
  'digital agency India',
  'social media management agency',
  'Shopify development agency',
  'WordPress development agency',
];

/** Per-page keyword sets, mapped from the requested list to the page that owns them. */
export const PAGE_KEYWORDS = {
  home: [
    'digital marketing and web development agency',
    'social media management agency',
    'Shopify website development',
    'WordPress website development',
    'website design agency',
    'creative digital agency',
  ],
  social: [
    'social media management agency',
    'social media management services',
    'social media marketing agency',
    'social media agency for small businesses',
    'social media management company',
    'professional social media manager',
    'social media marketing services',
    'Instagram management services',
    'Instagram marketing agency',
    'Facebook marketing services',
    'LinkedIn social media management',
    'social media content creation services',
    'social media strategy agency',
    'social media account management',
    'social media branding services',
    'social media post design services',
    'Instagram Reels editing services',
    'social media advertising agency',
    'monthly social media management packages',
    'affordable social media management',
    'social media management in Jaipur',
    'social media marketing agency in Rajasthan',
    'social media agency in India',
    'social media management packages in India',
  ],
  shopify: [
    'Shopify website development',
    'Shopify development agency',
    'Shopify website design services',
    'Shopify store development company',
    'Shopify experts for small businesses',
    'custom Shopify theme development',
    'Shopify store setup services',
    'Shopify eCommerce development',
    'Shopify website redesign',
    'Shopify developer for hire',
    'Shopify store optimisation',
    'Shopify product page design',
    'Shopify landing page development',
    'Shopify migration services',
    'Shopify speed optimisation',
    'Shopify maintenance services',
    'Shopify customisation agency',
    'Shopify store design company',
    'affordable Shopify website development',
    'professional Shopify developers',
    'Shopify developers in India',
    'Shopify development agency in Jaipur',
    'Shopify website design in India',
  ],
  wordpress: [
    'WordPress website development',
    'WordPress development agency',
    'WordPress website design services',
    'WordPress developer for hire',
    'WordPress development company',
    'custom WordPress website design',
    'WordPress business website development',
    'WordPress Elementor development',
    'Elementor website design services',
    'WordPress landing page development',
    'WordPress website redesign',
    'WordPress eCommerce website development',
    'WordPress speed optimisation services',
    'WordPress website maintenance',
    'WordPress SEO services',
    'WordPress theme customisation',
    'WordPress responsive web design',
    'WordPress website for small business',
    'affordable WordPress development',
    'professional WordPress developers',
    'WordPress developers in India',
    'WordPress development company in Jaipur',
    'WordPress website design in India',
  ],
  work: [
    'Shopify store design company',
    'eCommerce website development agency',
    'website redesign services',
    'conversion focused website design',
  ],
  pricing: [
    'monthly social media management packages',
    'affordable social media management',
    'affordable website development in India',
    'website maintenance services',
  ],
  about: [
    'digital agency for small businesses',
    'creative digital agency',
    'digital marketing agency in India',
    'website development company in India',
  ],
  contact: [
    'hire a social media management agency',
    'website design consultation',
    'website development company in Jaipur',
  ],
  services: [
    'social media management services',
    'Shopify development agency',
    'WordPress development agency',
    'website design and social media management',
    'website maintenance services',
  ],
} as const;

export type PageKeywordKey = keyof typeof PAGE_KEYWORDS;

/**
 * Search-intent landing pages.
 *
 * Every entry needs a real page with its own H1 and body copy — otherwise it is
 * a thin doorway page, which Google demotes. Only add one when there is a
 * business reason to serve that visitor differently.
 *
 * `serviceKey` links the page to an existing service so it inherits the right
 * schema and internal links instead of duplicating content.
 */
export type IntentPage = {
  slug: string;
  /** Page H1 — must read like English, not like a keyword. */
  h1: string;
  title: string;
  description: string;
  serviceKey: 'SOCIAL_MEDIA_MANAGEMENT' | 'SHOPIFY_DEVELOPMENT' | 'WORDPRESS_DEVELOPMENT';
  /** The single phrase this page exists to answer. */
  primaryKeyword: string;
  audience: string;
  /** Short, distinct body — not a copy of the service page. */
  intro: string;
  bullets: string[];
  keywords: string[];
  published: boolean;
};

export const INTENT_PAGES: IntentPage[] = [
  {
    slug: 'social-media-agency-for-small-businesses',
    h1: 'A social media agency built for small businesses',
    title: 'Social Media Agency for Small Businesses | Apronix Tech',
    description:
      'Social media management for small businesses: a fixed monthly retainer, a content calendar you approve, and reporting that tells you what worked. No enterprise process.',
    serviceKey: 'SOCIAL_MEDIA_MANAGEMENT',
    primaryKeyword: 'social media agency for small businesses',
    audience: 'Owner-run businesses with one to three people handling marketing alongside everything else',
    intro:
      'Most small businesses do not need a twelve-person agency. They need a calendar that gets filled, posts that look like the brand, and someone replying to comments before the weekend. That is what this retainer is: a defined scope, a fixed monthly fee, and a named person who knows your business.',
    bullets: [
      'A monthly content calendar you approve before anything is published',
      'Post design, captions and hashtags for Instagram, Facebook and LinkedIn',
      'Reels edited from footage you already shoot',
      'Comment and DM management on weekdays',
      'A monthly summary that says what to keep doing and what to stop',
    ],
    keywords: [
      'social media agency for small businesses',
      'affordable social media management',
      'social media management company',
      'social media agency for small business',
      'monthly social media management packages',
    ],
    published: true,
  },
  {
    slug: 'instagram-management-services',
    h1: 'Instagram management, handled end to end',
    title: 'Instagram Management Services & Reels Editing | Apronix Tech',
    description:
      'Instagram management services: content calendars, post and carousel design, Reels editing, caption writing, hashtag research and community management on a monthly retainer.',
    serviceKey: 'SOCIAL_MEDIA_MANAGEMENT',
    primaryKeyword: 'Instagram management services',
    audience: 'Brands whose Instagram is the first place a customer looks',
    intro:
      'Instagram rewards consistency and looks. This service covers both: a planned grid, Reels cut from your existing footage, captions written in your voice, and someone answering comments and DMs while the audience is still paying attention.',
    bullets: [
      'Grid planning so the profile reads as one brand, not twelve weeks of improvisation',
      'Reels editing — cuts, captions, pacing and cover frames from footage you supply',
      'Carousels and static posts designed on-brand',
      'Caption and hashtag research per post, not one block reused forever',
      'Weekday community management and DM triage',
    ],
    keywords: [
      'Instagram management services',
      'Instagram marketing agency',
      'Instagram Reels editing services',
      'social media post design services',
      'social media content creation services',
    ],
    published: true,
  },
  {
    slug: 'shopify-development-for-small-businesses',
    h1: 'Shopify development for small businesses',
    title: 'Shopify Development for Small Businesses | Apronix Tech',
    description:
      'Affordable Shopify store development for small businesses: store setup, custom theme sections, product and collection templates, payments, shipping and speed optimisation.',
    serviceKey: 'SHOPIFY_DEVELOPMENT',
    primaryKeyword: 'Shopify experts for small businesses',
    audience: 'Small catalogues moving off marketplaces or an unmaintainable theme',
    intro:
      'A small store still deserves a proper build. This package keeps the scope tight — a custom theme with sections you can edit yourself, product and collection templates that fit your catalogue, and checkout configured correctly — without the retainer an enterprise replatform would need.',
    bullets: [
      'Store setup from scratch, or migration from another platform',
      'Custom theme with editable sections, so marketing does not wait on a developer',
      'Product and collection templates matched to how you actually sell',
      'Payments, shipping rates, tax and email notifications configured and tested',
      'Speed and Core Web Vitals pass before launch',
    ],
    keywords: [
      'Shopify experts for small businesses',
      'affordable Shopify website development',
      'Shopify store setup services',
      'Shopify store development company',
      'custom Shopify theme development',
    ],
    published: true,
  },
  {
    slug: 'wordpress-website-for-small-business',
    h1: 'WordPress websites for small businesses',
    title: 'WordPress Website for Small Business | Apronix Tech',
    description:
      'WordPress website development for small businesses: a custom design your team can edit, built with Elementor blocks, accessible, fast and ready for search.',
    serviceKey: 'WORDPRESS_DEVELOPMENT',
    primaryKeyword: 'WordPress website for small business',
    audience: 'Businesses whose current site needs a developer for every text change',
    intro:
      'The point of a WordPress build is that you stop needing us for routine work. Every page is assembled from blocks your team can edit, with the structures — headings, alt text, meta titles — already correct so the site is findable as well as editable.',
    bullets: [
      'Custom design built on Elementor blocks you can edit without a developer',
      'Editor roles and permissions so nobody breaks the layout',
      'SEO-friendly structure: headings, metadata, sitemap and internal linking',
      'Responsive from 320px up, tested on real devices',
      'Speed optimisation and an accessibility pass before handover',
    ],
    keywords: [
      'WordPress website for small business',
      'affordable WordPress development',
      'WordPress Elementor development',
      'Elementor website design services',
      'custom WordPress website design',
    ],
    published: true,
  },
  {
    slug: 'ecommerce-website-development',
    h1: 'Ecommerce development that converts',
    title: 'Ecommerce Website Development Agency | Apronix Tech',
    description:
      'Ecommerce website development on Shopify and WordPress: catalogue architecture, product page design, checkout configuration and conversion-focused optimisation.',
    serviceKey: 'SHOPIFY_DEVELOPMENT',
    primaryKeyword: 'eCommerce website development agency',
    audience: 'Retailers whose traffic is fine but whose conversion rate is not',
    intro:
      'Most ecommerce projects do not fail at launch — they fail at the product page. This engagement starts with how people actually buy your catalogue, then builds the store around that: variants, bundles, shipping thresholds and a checkout with as few decisions as possible.',
    bullets: [
      'Catalogue architecture that matches how customers search',
      'Product page design built around the buying decision',
      'Checkout, shipping and tax configured and tested end to end',
      'Landing pages for campaigns, without duplicating the whole site',
      'Analytics and conversion events wired up so you can see where people leave',
    ],
    keywords: [
      'eCommerce website development agency',
      'Shopify eCommerce development',
      'WordPress eCommerce website development',
      'eCommerce website developers in India',
      'conversion focused website design',
    ],
    published: true,
  },
  {
    slug: 'website-design-for-startups',
    h1: 'Website design for startups',
    title: 'Website Development for Startups | Apronix Tech',
    description:
      'Website design and development for startups: a credible launch site built fast, structured for search, and easy for a small team to update as the product changes.',
    serviceKey: 'WORDPRESS_DEVELOPMENT',
    primaryKeyword: 'website development for startups',
    audience: 'Early-stage teams that need credibility before a larger rebuild is affordable',
    intro:
      'A startup site has one job in the first year: make a stranger believe you are real. That means clear positioning, real detail instead of stock phrases, and a structure the founding team can update themselves the week the product changes.',
    bullets: [
      'Positioning and page structure before any design work',
      'A fast, accessible launch site built on a CMS you can edit',
      'Lead capture wired to email or CRM, with spam protection',
      'Analytics and consent configured from day one',
      'A structure that scales into more pages without a rebuild',
    ],
    keywords: [
      'website development for startups',
      'website developers for startups in India',
      'lead generation website design',
      'small business website development',
      'website design consultation',
    ],
    published: true,
  },
];

export const PUBLISHED_INTENT_PAGES = INTENT_PAGES.filter((p) => p.published);

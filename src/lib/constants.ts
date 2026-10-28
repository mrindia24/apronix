/**
 * Shared constants used by both the server and the client bundles.
 * Keep this file free of secrets and server-only imports.
 */

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services', hasChildren: true },
  { label: 'Work', href: '/work' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
] as const;

export const SERVICE_NAV = [
  {
    label: 'Social Media Management',
    href: '/services/social-media-management',
    description: 'Strategy, content and community management that keeps your brand consistent.',
  },
  {
    label: 'Shopify Development',
    href: '/services/shopify-development',
    description: 'Fast, conversion-focused Shopify stores built to scale with your catalogue.',
  },
  {
    label: 'WordPress Development',
    href: '/services/wordpress-development',
    description: 'Business websites and CMS builds your team can actually manage.',
  },
] as const;

export const PUBLIC_STATUS = {
  PUBLISHED: 'PUBLISHED',
  DRAFT: 'DRAFT',
  ARCHIVED: 'ARCHIVED',
} as const;

export const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Discover',
    body: 'We start with a structured conversation about your business, customers and goals — then audit what you already have.',
  },
  {
    step: '02',
    title: 'Plan',
    body: 'You get a written scope: pages, content, integrations, timeline and what success looks like. No surprises later.',
  },
  {
    step: '03',
    title: 'Design',
    body: 'Layouts and content structures are designed around how your customers decide, not around a template.',
  },
  {
    step: '04',
    title: 'Develop',
    body: 'We build in a staging environment with regular checkpoints so you can see progress and give feedback early.',
  },
  {
    step: '05',
    title: 'Launch',
    body: 'Quality assurance, accessibility checks, analytics, redirects and a handover walkthrough of your new site.',
  },
  {
    step: '06',
    title: 'Optimise',
    body: 'After launch we review real behaviour and refine content, performance and conversion paths.',
  },
] as const;

export const WHY_APRONIX = [
  {
    title: 'Strategy before execution',
    body: 'Every deliverable starts from a documented goal. We ask why before we ask what colour.',
    icon: 'compass',
  },
  {
    title: 'Creative and technical expertise',
    body: 'Design, content and development live in the same team, so ideas survive contact with the build.',
    icon: 'layers',
  },
  {
    title: 'Transparent communication',
    body: 'One point of contact, written updates and clear timelines. You always know what is happening next.',
    icon: 'message-square',
  },
  {
    title: 'Responsive by default',
    body: 'Every layout is designed and tested on mobile first, where most of your traffic actually arrives.',
    icon: 'smartphone',
  },
  {
    title: 'Scalable solutions',
    body: 'We build structures that tolerate growth — more products, more pages, more markets.',
    icon: 'trending-up',
  },
  {
    title: 'Clear deliverables',
    body: 'You receive documentation, assets and access. Nothing is held hostage when a project ends.',
    icon: 'clipboard-check',
  },
] as const;

export const CAPABILITIES = [
  'Social media strategy',
  'Shopify storefronts',
  'WordPress builds',
  'Content design',
  'Conversion-focused UX',
  'Performance optimisation',
  'Technical SEO',
  'Ongoing support',
] as const;

export const SITE_FACTS_FALLBACK = [
  { label: 'Disciplines', value: 'Social · Shopify · WordPress' },
  { label: 'Engagement', value: 'Project-based & retained' },
  { label: 'Collaboration', value: 'Remote-first, async-friendly' },
  { label: 'Reporting', value: 'Clear, plain-English updates' },
];

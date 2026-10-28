import type { ServiceKey } from '@prisma/client';

/**
 * Service page content model. Everything here is stored in the database
 * (Service.sections) and editable from /admin/services, so this file defines the
 * shape plus the launch copy used by the seed script.
 */

export type ServiceSections = {
  problems: { title: string; body: string }[];
  deliverables: { title: string; items: string[] }[];
  benefits: { title: string; body: string }[];
  workflow: { step: string; title: string; body: string }[];
  useCases: string[];
  faqs: { question: string; answer: string }[];
  relatedKeys?: ServiceKey[];
  tech?: string[];
  startingNote?: string;
};

export type ServiceSeed = {
  key: ServiceKey;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  summary: string;
  heroHeadline: string;
  heroDescription: string;
  icon: string;
  accent: string;
  order: number;
  seoTitle: string;
  seoDescription: string;
  sections: ServiceSections;
};

export const SERVICE_SEED: ServiceSeed[] = [
  {
    key: 'SOCIAL_MEDIA_MANAGEMENT',
    slug: 'social-media-management',
    name: 'Social Media Management & Marketing',
    shortName: 'Social Media',
    tagline: 'A consistent, recognisable brand presence — planned, produced and published.',
    summary:
      'We plan, design, write and publish your social content, manage your community, and report on what is actually working.',
    heroHeadline: 'Show up consistently, with content worth stopping for.',
    heroDescription:
      'Most brands do not have a content problem — they have a consistency problem. We take the planning, design, editing, scheduling and community replies off your plate, and build a rhythm your audience can rely on.',
    icon: 'megaphone',
    accent: '#FF3038',
    order: 1,
    seoTitle: 'Social Media Management Services | Apronix Tech',
    seoDescription:
      'Social media management services: strategy, content calendars, reels editing, carousels, captions, community management and reporting for growing businesses.',
    sections: {
      problems: [
        {
          title: 'Posting is inconsistent',
          body: 'Bursts of activity around launches, then weeks of silence. Audiences and algorithms both reward rhythm, and silence resets the clock.',
        },
        {
          title: 'The brand looks different every week',
          body: 'Templates, fonts and tonality drift between whoever had time to post. Buyers read that inconsistency as risk.',
        },
        {
          title: 'Content takes too long to make',
          body: 'One reel can eat an entire afternoon. Without a repeatable production system, social quietly becomes the first thing dropped.',
        },
        {
          title: 'No one knows what is working',
          body: 'Likes are visible, but not what they led to. Without a simple reporting layer, decisions come down to guesswork.',
        },
        {
          title: 'Comments and DMs go unanswered',
          body: 'Enquiries sit in message requests for days. Every unanswered question is a customer who found a competitor instead.',
        },
      ],
      deliverables: [
        {
          title: 'Strategy & positioning',
          items: [
            'Channel audit and competitor review',
            'Audience and content-pillar definition',
            'Tone-of-voice and visual guidelines',
            'Channel-specific posting cadence',
          ],
        },
        {
          title: 'Content production',
          items: [
            'Monthly content calendar, approved before production',
            'Static posts, carousels and quote graphics',
            'Reels and short-form video editing from your raw footage',
            'Copywriting, caption structure and hashtag research',
          ],
        },
        {
          title: 'Publishing & community',
          items: [
            'Scheduling across Instagram, Facebook and LinkedIn',
            'Comment and DM response within agreed service hours',
            'Escalation of genuine sales enquiries to your team',
            'Story and highlight planning',
          ],
        },
        {
          title: 'Measurement',
          items: [
            'Monthly performance report in plain English',
            'Reach, saves, profile actions and link clicks',
            'Content pillar performance breakdown',
            'Recommendations for the next cycle',
          ],
        },
      ],
      benefits: [
        {
          title: 'A presence that compounds',
          body: 'Consistent publishing builds recognisability. When your brand appears in a feed three times a week with the same visual language, people start to remember it.',
        },
        {
          title: 'Fewer decisions for you',
          body: 'Calendars are approved once a month rather than negotiated daily. Your team gets its time back for the actual business.',
        },
        {
          title: 'Content that supports sales',
          body: 'Pillars are mapped to buyer questions, so the feed positions you as the obvious option before anyone fills in an enquiry form.',
        },
        {
          title: 'Proof, not vibes',
          body: 'A monthly report shows which formats earned attention and which earned nothing. Next month gets planned from evidence.',
        },
      ],
      useCases: [
        'A D2C brand launching a new product line and needing six weeks of coordinated content.',
        'A B2B consultancy whose founder is the face of the brand but has no time to plan.',
        'A local service business that needs to look as credible on social as it is in person.',
        'A retailer that already has footage and photos but no editing or publishing system.',
      ],
      workflow: [
        { step: '01', title: 'Audit & strategy', body: 'We review your current channels, competitors and customer questions, then agree content pillars and cadence.' },
        { step: '02', title: 'Calendar approval', body: 'You receive a monthly calendar with concepts and captions. Nothing is produced until that is signed off.' },
        { step: '03', title: 'Production', body: 'Design and editing happen in batches, with your brand system applied consistently.' },
        { step: '04', title: 'Scheduling', body: 'Approved content is scheduled to each platform at times that suit your audience.' },
        { step: '05', title: 'Community management', body: 'We monitor comments and DMs during agreed hours, escalating sales conversations to you.' },
        { step: '06', title: 'Report & refine', body: 'A monthly report closes the loop and informs the next calendar.' },
      ],
      faqs: [
        {
          question: 'How many posts are included each month?',
          answer:
            'Volume is agreed in your scope — typically a mix of static posts, carousels and short-form video across the platforms you prioritise. We price on the number of assets produced and managed, not on a vague "package".',
        },
        {
          question: 'Do we need to send you raw footage?',
          answer:
            'If you can, yes — footage of your team, products or process makes the strongest short-form content. If you cannot, we can build a graphic-led calendar instead. We will tell you honestly which approach suits your category.',
        },
        {
          question: 'Who responds to comments and DMs?',
          answer:
            'Our team does, within service hours defined in the scope. Anything requiring pricing commitments, technical advice or complaints is escalated to your nominated contact rather than answered by us.',
        },
        {
          question: 'Do you guarantee follower growth?',
          answer:
            'No, and you should be sceptical of anyone who does. Follower counts are an outcome of content, reach and category interest. We commit to consistent publishing, quality production and transparent reporting.',
        },
        {
          question: 'Can you work with our in-house designer?',
          answer:
            'Yes. We can hand over approved calendars for your team to produce, or take design in-house only while you hire. Roles are written into the scope so nothing falls between the gaps.',
        },
      ],
      relatedKeys: ['SHOPIFY_DEVELOPMENT', 'WORDPRESS_DEVELOPMENT'],
      startingNote:
        'Retainers are scoped after an audit so the number of assets, platforms and service hours match your real capacity.',
    },
  },
  {
    key: 'SHOPIFY_DEVELOPMENT',
    slug: 'shopify-development',
    name: 'Shopify Website Design & Development',
    shortName: 'Shopify',
    tagline: 'Storefronts built around how people actually buy.',
    summary:
      'We design and build Shopify stores — from first setup to custom themes, redesigns and ongoing maintenance.',
    heroHeadline: 'A Shopify store that sells as well as it looks.',
    heroDescription:
      'Shopify gives you a reliable commerce foundation. What it does not give you is a storefront shaped around your catalogue, your margins and your customers. That is the part we build — theme, templates, product pages and checkout paths included.',
    icon: 'shopping-bag',
    accent: '#FF3038',
    order: 2,
    seoTitle: 'Shopify Website Development & Store Design | Apronix Tech',
    seoDescription:
      'Shopify design and development: new store setup, custom theme development, store redesigns, product and collection setup, app integrations and mobile optimisation.',
    sections: {
      problems: [
        {
          title: 'The theme fights your catalogue',
          body: 'Off-the-shelf themes handle three products and one variant well. Add bundles, sizes, subscriptions or pre-orders and the product page starts to strain.',
        },
        {
          title: 'Traffic arrives but does not convert',
          body: 'Usually it is not the traffic — it is unclear pricing, slow pages, hidden shipping costs or a product page that never answers the obvious question.',
        },
        {
          title: 'Mobile checkout feels rough',
          body: 'Most stores are built on a laptop and used on a phone. Tap targets, sticky add-to-cart and image weight are afterthoughts by default.',
        },
        {
          title: 'Every change needs a developer',
          body: 'Marketing wants a new landing page, ops wants a new collection type, and both are blocked on code. A well-structured theme with flexible sections avoids that queue.',
        },
        {
          title: 'Apps slow the store down',
          body: 'App stacks accumulate. Each one adds scripts, and the store quietly becomes the slowest part of the funnel.',
        },
      ],
      deliverables: [
        {
          title: 'Store foundations',
          items: [
            'Shopify store setup or migration support',
            'Theme installation, configuration and version control',
            'Product, variant, collection and metafield structure',
            'Domain, tax, shipping and payment configuration support',
          ],
        },
        {
          title: 'Design & build',
          items: [
            'Custom theme development to your brand system',
            'Reusable, editable sections for marketing pages',
            'Product page and collection page design',
            'Cart and checkout-flow improvements within Shopify limits',
          ],
        },
        {
          title: 'Integrations',
          items: [
            'Payment and shipping provider setup',
            'App evaluation and installation',
            'Email or CRM and review platform connections',
            'Analytics and conversion tracking configuration',
          ],
        },
        {
          title: 'Launch & care',
          items: [
            'Cross-device and cross-browser QA',
            'Performance and Core Web Vitals tuning',
            'Technical SEO: metadata, canonical URLs, sitemaps, structured data',
            'Handover documentation and optional maintenance plan',
          ],
        },
      ],
      benefits: [
        {
          title: 'Product pages that answer questions',
          body: 'Sizing, shipping, materials and delivery expectations are placed where customers look for them, which reduces hesitation and support load.',
        },
        {
          title: 'Faster stores, better mobile',
          body: 'Compressed imagery, lazy loading and a lean script budget keep the storefront usable on a mid-range phone on mobile data.',
        },
        {
          title: 'Marketing independence',
          body: 'Editable sections mean your team builds landing pages without waiting on a developer or breaking the design system.',
        },
        {
          title: 'Room to grow',
          body: 'Metafields and a sensible collection architecture mean new categories and markets can be added without rebuilding the theme.',
        },
      ],
      useCases: [
        'A brand moving from a marketplace-only model to its own storefront.',
        'A high-volume store whose theme cannot handle variants, bundles or subscriptions.',
        'A retailer with strong products but a dated storefront that leaks mobile conversions.',
        'A launch team that needs a store, brand pages and tracking set up before a campaign date.',
      ],
      workflow: [
        { step: '01', title: 'Discovery', body: 'Catalogue review, customer questions, competitor benchmark and a technical look at your current store if you have one.' },
        { step: '02', title: 'Architecture', body: 'We map products, collections, metafields and templates before design, so the structure supports the merchandise.' },
        { step: '03', title: 'Design', body: 'Key templates are designed in Figma for desktop and mobile, then signed off.' },
        { step: '04', title: 'Development', body: 'Theme build in a development store, with a preview link you can visit throughout.' },
        { step: '05', title: 'QA & launch', body: 'Order tests, payments, emails, redirects, analytics and a full device pass — then launch.' },
        { step: '06', title: 'Support', body: 'Thirty days of post-launch support, then optional maintenance and iteration.' },
      ],
      faqs: [
        {
          question: 'Can you customise an existing theme instead of building one?',
          answer:
            'Often, yes — and it is frequently the pragmatic option if the theme is well coded. We audit the theme first. If it uses an outdated structure or conflicts with your catalogue, we will say so and quote a rebuild instead.',
        },
        {
          question: 'Do you use a page builder?',
          answer:
            'We prefer native Shopify sections, which stay fast and do not lock content behind an app. Where a page builder is already in use, we work with it rather than forcing a rebuild.',
        },
        {
          question: 'Who owns the store and the theme code?',
          answer:
            'You do. Shopify accounts, theme repositories and assets are handed over at launch. We do not hold access or files hostage.',
        },
        {
          question: 'Can you migrate products from another platform?',
          answer:
            'Yes — product, customer and order data can usually be migrated with Shopify-compatible export formats. Migrations are scoped separately because the cleanup work depends entirely on the source data quality.',
        },
        {
          question: 'Do you offer ongoing maintenance?',
          answer:
            'Yes, monthly maintenance covering theme updates, app reviews, performance checks and a small block of change requests. It is optional and month-to-month.',
        },
      ],
      relatedKeys: ['SOCIAL_MEDIA_MANAGEMENT', 'WORDPRESS_DEVELOPMENT'],
      tech: ['Shopify Liquid', 'Hydrogen (optional)', 'Tailwind CSS', 'JavaScript', 'Shopify CLI'],
      startingNote:
        'Project pricing depends on template count, catalogue complexity and integrations, so every quote follows a scoping call.',
    },
  },
  {
    key: 'WORDPRESS_DEVELOPMENT',
    slug: 'wordpress-development',
    name: 'WordPress Website Design & Development',
    shortName: 'WordPress',
    tagline: 'Business websites your team can run without calling a developer.',
    summary:
      'Business websites, Elementor builds, landing pages, CMS setup, speed work and ongoing care — built to be edited by non-developers.',
    heroHeadline: 'A website that stays yours to edit.',
    heroDescription:
      'WordPress powers a large share of the web for one reason: you can own and edit it. The difference between a useful WordPress site and a frustrating one is how it is structured. We build sites your team can update confidently — pages, posts, products and copy — without breaking the layout.',
    icon: 'layout-template',
    accent: '#FF3038',
    order: 3,
    seoTitle: 'WordPress Website Development & Design | Apronix Tech',
    seoDescription:
      'WordPress website development for businesses: custom builds, Elementor development, landing pages, blog and CMS setup, speed optimisation, security and maintenance.',
    sections: {
      problems: [
        {
          title: 'Editing the site feels dangerous',
          body: 'Every content change risks a broken layout, so nothing gets updated and the site starts to age visibly.',
        },
        {
          title: 'Plugins are doing structural work',
          body: 'Sites built by stacking plugins become fragile: updates conflict, pages slow down, and nobody can remove a plugin without breaking a page.',
        },
        {
          title: 'Slow pages chase visitors away',
          body: 'Oversized images, no caching and heavy builder scripts add seconds to load time — especially on mobile networks.',
        },
        {
          title: 'Structure was never planned',
          body: 'Pages get added in a flat list, URLs drift, and search engines see a fuzzy hierarchy instead of clear topics.',
        },
        {
          title: 'Nobody maintains it',
          body: 'Core, theme and plugin updates stop happening. The site keeps working until the day it does not, usually at the worst moment.',
        },
      ],
      deliverables: [
        {
          title: 'Strategy & structure',
          items: [
            'Page inventory, sitemap and URL architecture',
            'Content outline and internal linking plan',
            'Template and component planning',
          ],
        },
        {
          title: 'Design & development',
          items: [
            'Custom or Elementor-based builds with a clean design system',
            'Reusable blocks for hero, services, testimonials, CTA and contact sections',
            'Blog and CMS configuration with sensible taxonomies',
            'Standalone landing pages for campaigns',
          ],
        },
        {
          title: 'Care & performance',
          items: [
            'Image optimisation and lazy loading',
            'Caching, minification and Core Web Vitals tuning',
            'Security hardening, backups and update policy',
            'Analytics, consent and form configuration',
          ],
        },
        {
          title: 'Handover',
          items: [
            'Editor training and written documentation',
            'Roles and permissions for your team',
            'Access transfer and credential handover',
            'Optional monthly care plan',
          ],
        },
      ],
      benefits: [
        {
          title: 'Confident self-service editing',
          body: 'Your team updates copy, images, posts and pages through a structure they understand, without layout breakage.',
        },
        {
          title: 'Foundations built for search',
          body: 'Clean semantic HTML, descriptive URLs, metadata controls, sitemaps and schema give search engines something coherent to read.',
        },
        {
          title: 'Fewer plugins, fewer surprises',
          body: 'We keep the plugin footprint small and purposeful, which makes maintenance predictable instead of fragile.',
        },
        {
          title: 'Faster pages',
          body: 'Optimised media, caching and a restrained script budget make the site feel immediate on a phone.',
        },
      ],
      useCases: [
        'A professional services firm that needs a credible website and a blog it will actually maintain.',
        'A company that wants marketing pages added regularly without a developer queue.',
        'An existing WordPress site that is slow, fragile and uneasy to edit.',
        'A brand launching a campaign microsite or landing page with its own conversion goal.',
      ],
      workflow: [
        { step: '01', title: 'Discovery', body: 'We clarify audiences, services and the content you realistically have — capacity shapes the plan.' },
        { step: '02', title: 'Sitemap & wireframes', body: 'Structure is agreed before visuals, so page count and hierarchy are settled early.' },
        { step: '03', title: 'Design', body: 'A design system with reusable sections, applied to key templates.' },
        { step: '04', title: 'Build', body: 'Development on a staging server with your content in place, not lorem ipsum.' },
        { step: '05', title: 'QA & launch', body: 'Device, accessibility, performance and form testing, then DNS and HTTPS cutover.' },
        { step: '06', title: 'Care plan', body: 'Updates, backups and monitoring — optional but recommended for long-term health.' },
      ],
      faqs: [
        {
          question: 'Elementor or a custom block theme?',
          answer:
            'Both are reasonable. Elementor suits teams who want maximum visual control and quick campaign pages; a block-based or custom theme is leaner and faster for sites where content structure is stable. We recommend based on how often your team will edit, not on preference.',
        },
        {
          question: 'Can you fix or improve our current WordPress site?',
          answer:
            'Usually. We start with an audit covering speed, security, updates, structure and editing experience — then give you a prioritised list. Sometimes the honest answer is that a rebuild is cheaper than repair, and we will tell you that.',
        },
        {
          question: 'Will we be able to add pages ourselves?',
          answer:
            'Yes. Pages are built from a library of approved sections, so adding a page means combining ready-made blocks. That is what makes editing safe.',
        },
        {
          question: 'Do you handle hosting?',
          answer:
            'We can recommend and configure suitable managed WordPress hosting, or work with your existing host if it supports modern PHP, HTTPS and staging. We are not a hosting reseller.',
        },
        {
          question: 'Do you write the content?',
          answer:
            'We can — copywriting is scoped as an additional deliverable. At minimum we provide page outlines and the structure each section needs so your team knows exactly what to write.',
        },
      ],
      relatedKeys: ['SOCIAL_MEDIA_MANAGEMENT', 'SHOPIFY_DEVELOPMENT'],
      tech: ['WordPress', 'Elementor', 'PHP', 'Tailwind CSS', 'MySQL'],
      startingNote:
        'Site cost depends on template count, content volume and integrations. A scoping call comes before any number.',
    },
  },
];

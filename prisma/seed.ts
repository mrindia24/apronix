/**
 * Development seed.
 *
 * Everything marked `isSampleContent: true` is placeholder structure that helps
 * you see how the site behaves. Sample projects and articles carry a visible
 * "Sample content" label and are never presented as real client work. Delete or
 * replace them from /admin before going live.
 *
 * Run: npm run db:seed
 */
import { PrismaClient, type ServiceKey } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SERVICE_SEED } from '../src/content/services';

const prisma = new PrismaClient();

const SERVICE_KEYS: Record<string, ServiceKey> = {
  SOCIAL_MEDIA_MANAGEMENT: 'SOCIAL_MEDIA_MANAGEMENT',
  SHOPIFY_DEVELOPMENT: 'SHOPIFY_DEVELOPMENT',
  WORDPRESS_DEVELOPMENT: 'WORDPRESS_DEVELOPMENT',
};

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@apronixtech.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Apronix!Admin#2026';
  const name = process.env.ADMIN_NAME || 'Apronix Admin';

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters.');
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`• Admin ${email} already exists — skipping.`);
    return existing;
  }

  const admin = await prisma.adminUser.create({
    data: {
      email,
      name,
      role: 'SUPER_ADMIN',
      passwordHash: await bcrypt.hash(password, 12),
    },
  });
  console.log(`• Created super admin ${email}`);
  return admin;
}

async function seedServices() {
  for (const service of SERVICE_SEED) {
    await prisma.service.upsert({
      where: { key: service.key },
      update: {
        name: service.name,
        shortName: service.shortName,
        tagline: service.tagline,
        summary: service.summary,
        heroHeadline: service.heroHeadline,
        heroDescription: service.heroDescription,
        sections: service.sections as object,
        order: service.order,
        seoTitle: service.seoTitle,
        seoDescription: service.seoDescription,
      },
      create: {
        key: service.key,
        slug: service.slug,
        name: service.name,
        shortName: service.shortName,
        tagline: service.tagline,
        summary: service.summary,
        heroHeadline: service.heroHeadline,
        heroDescription: service.heroDescription,
        sections: service.sections as object,
        icon: service.icon,
        accent: service.accent,
        order: service.order,
        status: 'PUBLISHED',
        seoTitle: service.seoTitle,
        seoDescription: service.seoDescription,
      },
    });
  }
  console.log(`• Seeded ${SERVICE_SEED.length} services`);
}

const HOME_FAQS = [
  {
    question: 'What kind of businesses does Apronix Tech work with?',
    answer:
      'We work with small and mid-sized businesses that are serious about their digital presence — typically founders, marketing leads and operations teams at consumer brands, professional services firms and retailers. If you have a clear business goal and are ready to invest in doing it properly, we are a good fit.',
    order: 1,
  },
  {
    question: 'How long does a typical project take?',
    answer:
      'A focused WordPress or Shopify build usually runs four to eight weeks depending on page and template count, content readiness and integrations. Social media retainers start within one to two weeks of onboarding. Every proposal includes a timeline with content deadlines so the schedule is realistic rather than optimistic.',
    order: 2,
  },
  {
    question: 'Do you work with businesses outside your city?',
    answer:
      'Yes. We collaborate remotely with clients across India and internationally. Discovery calls, reviews and handovers all happen over video, with written documentation so nothing depends on a phone call you cannot revisit.',
    order: 3,
  },
  {
    question: 'Can you work with our existing website or brand assets?',
    answer:
      'Frequently. We start with an audit of what you already have — brand guidelines, existing site, analytics, content. Sometimes that means an improvement plan rather than a rebuild, and we will tell you which one makes more sense financially.',
    order: 4,
  },
  {
    question: 'How do you price projects?',
    answer:
      'Fixed-fee proposals based on a written scope covering pages, templates, content and integrations. Social media is a monthly retainer priced on asset volume and platforms. You will never receive an open-ended hourly estimate without a defined deliverable list.',
    order: 5,
  },
  {
    question: 'What do you need from us to get started?',
    answer:
      'A short discovery call, access to your current site and analytics if you have them, and a nominated decision-maker for approvals. Content can be produced by us or supplied by you — the scope makes clear which.',
    order: 6,
  },
];

async function seedFaqs() {
  const existing = await prisma.fAQ.count();
  if (existing > 0) {
    console.log('• FAQs already present — skipping.');
    return;
  }
  await prisma.fAQ.createMany({
    data: HOME_FAQS.map((f) => ({ ...f, scope: null, status: 'PUBLISHED' as const })),
  });
  console.log(`• Seeded ${HOME_FAQS.length} homepage FAQs`);
}

const SAMPLE_PROJECTS = [
  {
    slug: 'sample-social-content-system',
    title: 'Sample: Monthly content system for a D2C brand',
    clientName: 'Sample Client (replace me)',
    industry: 'Consumer goods',
    serviceCategory: 'SOCIAL_MEDIA_MANAGEMENT' as ServiceKey,
    categoryLabel: 'Social Media',
    shortDescription:
      'Example structure for a social media retainer project: audit, content pillars, monthly calendar and reporting cadence.',
    overview:
      'This is sample content included with the initial build so you can see how a published project page is structured. Replace it with a real, authorised case study from the admin dashboard.\n\nThe engagement model shown here covers a channel audit, four content pillars, a monthly approval cycle and a reporting pack.',
    brief:
      'The brand published in bursts around product launches and had no repeatable production system. Content quality varied by whoever had capacity that week.',
    challenges:
      'No documented visual guidelines, no content calendar, and enquiry DMs going unanswered for several days.',
    strategy:
      'Define four content pillars mapped to customer questions, establish a visual system, and move to a single monthly approval cycle with batched production.',
    solution:
      'A 30-day calendar with static posts, carousels and short-form video, a shared asset library, comment and DM service hours, and a monthly performance review.',
    technologies: ['Content calendar', 'Brand system', 'Short-form editing'],
    deliverables: ['Channel audit', 'Content pillars', 'Monthly calendar', 'Performance report'],
    featuredImage: '/media/project-social.jpg',
    featuredImageAlt: 'A monthly social media content planner and a smartphone',
    featured: true,
    order: 1,
  },
  {
    slug: 'sample-shopify-storefront',
    title: 'Sample: Shopify storefront for a growing catalogue',
    clientName: 'Sample Client (replace me)',
    industry: 'Retail',
    serviceCategory: 'SHOPIFY_DEVELOPMENT' as ServiceKey,
    categoryLabel: 'Shopify',
    shortDescription:
      'Example structure for a Shopify theme project: catalogue architecture, custom sections, product page design and performance work.',
    overview:
      'This is sample content included with the initial build so you can see how a published project page is structured. Replace it with a real, authorised case study from the admin dashboard.\n\nThe example covers a theme rebuild around a catalogue with variants and bundles, editable marketing sections and a mobile-first product page.',
    brief:
      'An existing theme could not present variants and bundles clearly, and the product page buried shipping and sizing information below the fold on mobile.',
    challenges:
      'Heavy app stack, large uncompressed imagery, and marketing changes blocked behind a developer queue.',
    strategy:
      'Rebuild the theme around a section library, restructure products with metafields, and set a performance budget before design started.',
    solution:
      'Custom Shopify theme with configurable sections, redesigned product page with sticky add-to-cart, compressed responsive imagery and tracked conversion events.',
    technologies: ['Shopify Liquid', 'Tailwind CSS', 'Shopify CLI'],
    deliverables: ['Theme architecture', 'Product page design', 'Section library', 'Launch QA'],
    featuredImage: '/media/project-shopify.jpg',
    featuredImageAlt: 'A laptop showing an online store beside packing boxes',
    featured: true,
    order: 2,
  },
  {
    slug: 'sample-wordpress-business-site',
    title: 'Sample: WordPress website for a professional services firm',
    clientName: 'Sample Client (replace me)',
    industry: 'Professional services',
    serviceCategory: 'WORDPRESS_DEVELOPMENT' as ServiceKey,
    categoryLabel: 'WordPress',
    shortDescription:
      'Example structure for a WordPress build: sitemap, reusable sections, editing roles and performance baseline.',
    overview:
      'This is sample content included with the initial build so you can see how a published project page is structured. Replace it with a real, authorised case study from the admin dashboard.\n\nThe example shows a rebuild where the primary goal was confident self-service editing plus a cleaner content hierarchy.',
    brief:
      'The team avoided updating the site because edits frequently broke layouts, so service pages drifted out of date.',
    challenges:
      'Nineteen active plugins doing structural work, inconsistent typography, and no documented editorial ownership.',
    strategy:
      'Reduce plugin dependency, build a reusable section library, and hand over an editor guide with clear roles.',
    solution:
      'A WordPress build with approved content blocks, structured service and insight sections, image optimisation, caching and editor training.',
    technologies: ['WordPress', 'Elementor', 'Tailwind CSS'],
    deliverables: ['Sitemap', 'Section library', 'CMS setup', 'Editor training'],
    featuredImage: '/media/project-wordpress.jpg',
    featuredImageAlt: 'A desktop monitor displaying a website in a bright workspace',
    featured: true,
    order: 3,
  },
];

async function seedProjects() {
  const existing = await prisma.portfolioProject.count();
  if (existing > 0) {
    console.log('• Portfolio already present — skipping.');
    return;
  }
  for (const project of SAMPLE_PROJECTS) {
    const service = await prisma.service.findUnique({
      where: { key: project.serviceCategory },
      select: { id: true },
    });

    // Sample gallery: screenshots of this very site, framed as interface panels.
    // Replace with authorised client screenshots before launch.
    const gallery =
      project.slug === 'sample-social-content-system'
        ? [
            {
              url: '/media/gallery-blog-index.jpg',
              alt: 'An editorial index with search, categories and pagination',
              caption: 'Content library the client can publish into without a developer.',
            },
          ]
        : project.slug === 'sample-shopify-storefront'
          ? [
              {
                url: '/media/gallery-work-index.jpg',
                alt: 'A filterable work index with category chips',
                caption: 'Filterable project index — the component the studio runs on.',
              },
              {
                url: '/media/gallery-contact.jpg',
                alt: 'An enquiry form with validation and spam protection',
                caption: 'Enquiry form with server-side validation and spam protection.',
              },
            ]
          : [
              {
                url: '/media/gallery-blog-index.jpg',
                alt: 'An editorial index with search, categories and pagination',
                caption: 'Editorial index with search, categories and pagination.',
              },
              {
                url: '/media/gallery-contact.jpg',
                alt: 'A contact page combining a form, direct channels and FAQs',
                caption: 'Contact page — form, direct channels and FAQs in one place.',
              },
            ];
    await prisma.portfolioProject.create({
      data: {
        ...project,
        serviceRef: service?.id,
        status: 'PUBLISHED',
        isSampleContent: true,
        seoTitle: project.title,
        seoDescription: project.shortDescription,
        images: { create: gallery.map((image, index) => ({ ...image, order: index })) },
      },
    });
  }
  console.log(`• Seeded ${SAMPLE_PROJECTS.length} sample projects (clearly labelled)`);
}

const CATEGORIES = [
  { slug: 'social-media', name: 'Social Media', description: 'Planning, production and community management.', order: 1 },
  { slug: 'shopify', name: 'Shopify', description: 'Storefront design, development and optimisation.', order: 2 },
  { slug: 'wordpress', name: 'WordPress', description: 'Business websites, CMS builds and maintenance.', order: 3 },
  { slug: 'growth', name: 'Small Business Growth', description: 'Practical digital decisions for growing teams.', order: 4 },
];

const SAMPLE_POSTS = [
  {
    slug: 'social-media-content-calendar-that-survives-a-busy-month',
    title: 'How to build a social media content calendar that survives a busy month',
    excerpt:
      'Most content calendars collapse the week a launch lands. Here is a planning approach built around batching, approval and a realistic number of assets.',
    categorySlug: 'social-media',
    tags: ['content-strategy', 'social-media'],
    featured: true,
    coverImage: '/media/post-social.jpg',
    coverImageAlt: 'A monthly social media content planner and a smartphone on a desk',
    content: `A content calendar is not a spreadsheet of post ideas. It is the plan that decides what gets made, when it gets approved, and who does the work when the week goes sideways.

## Start from the work you can actually sustain

The most common mistake is planning an ambitious month and then abandoning it in week two. Before choosing formats, count the hours your team can genuinely spend on content each week, and design a cadence that fits inside that number.

A sustainable starting point for most small teams looks like this:

- Three static posts or carousels per week
- One short-form video per week, batched in a single filming session
- One story sequence per week tied to the product or the team
- A monthly review, not a weekly panic

## Batch production, not just scheduling

Scheduling tools solve publishing. They do not solve production. Batch the work itself:

1. **Concepts** — one session per month, decide the angle for every slot.
2. **Copy** — write all captions for the month in one pass so tone stays consistent.
3. **Design** — produce visuals in a single sitting with the template system applied.
4. **Filming** — record several videos in one session rather than one at a time.

## Build one approval gate

If every post needs a separate approval, the calendar will slip. Approve the month in one review, with clear deadlines, and keep a single nominated approver. Anything that arrives late moves to the next cycle rather than derailing it.

## Plan for the unplannable

Leave two or three slots empty each month for reactive content: a product question that keeps coming up, a news moment in your category, a behind-the-scenes moment. Empty slots are not laziness — they are capacity.

## Measure the calendar, not the likes

At the end of each month, review which content pillars earned saves, shares and profile visits. Then adjust the ratio for next month. Over time, this turns a calendar into a series of small, evidence-led experiments.

> A calendar that publishes eight useful posts a month beats a plan that publishes twenty in week one and nothing for three weeks.

## A simple template

| Week | Static | Video | Story | Purpose |
| --- | --- | --- | --- | --- |
| 1 | 2 | 1 | 1 | Educate |
| 2 | 2 | 1 | 1 | Build trust |
| 3 | 2 | 1 | 1 | Product proof |
| 4 | 2 | — | 1 | Community + review |

Adapt the ratio to your category, but keep the structure: a fixed number of slots, produced in batches, approved once, reviewed monthly.`,
  },
  {
    slug: 'shopify-product-page-checklist',
    title: 'The Shopify product page checklist we run before every launch',
    excerpt:
      'A practical, no-jargon checklist covering imagery, variant clarity, shipping expectations, mobile behaviour and conversion tracking on Shopify product pages.',
    categorySlug: 'shopify',
    tags: ['shopify', 'conversion'],
    featured: true,
    coverImage: '/media/post-shopify.jpg',
    coverImageAlt: 'A laptop used for online shopping with a card and notebook',
    content: `Product pages carry the majority of purchase decisions. Most of the improvements worth making are unglamorous — clarity, speed and expectation setting.

## 1. Answer the five questions customers actually ask

Every product page should answer these without a hunt:

1. What exactly is it, including size and contents?
2. What does it cost in total, including tax and delivery?
3. When will it arrive?
4. What happens if it is not right?
5. Why is this one different from the cheaper option?

If any of those answers require a scroll to the footer or a message to support, the page is losing sales quietly.

## 2. Make variants impossible to misunderstand

Variant selectors fail when:

- Options render as small text pills with no preview
- Out-of-stock combinations are hidden rather than marked
- Swatch colours do not match the photographed product
- The price does not update visibly when a variant changes

Use metafields to attach an image to each colour variant, show sold-out states clearly, and keep the selected variant in the URL so shared links open the right product.

## 3. Set media rules

- First image: product in context, not a flat pack shot
- Second image: scale reference or contents laid out
- Include at least one image showing the detail people ask about
- Consistent aspect ratio across the catalogue so grids stay tidy
- Compressed to AVIF or WebP, served responsively

## 4. Design the mobile add-to-cart

On mobile, the add-to-cart button should remain reachable without scrolling back up. A sticky bar that shows price, selected variant and availability prevents a surprising amount of friction.

## 5. Test the unglamorous paths

Before launch, place real test orders for:

- A single item with the most complex variant
- A multi-item order with a discount code
- An order to a different shipping zone
- A partial refund, to confirm emails and states read correctly

Then check that your analytics events fire on add-to-cart, checkout start and purchase.

## 6. Write the shipping paragraph early

Put delivery expectations near the price, phrased plainly: dispatch time, delivery estimate, and what happens on weekends. Ambiguity here produces support tickets that cost more than the sales.

## A launch checklist you can reuse

- [ ] Product title, description and variant data complete
- [ ] Metafields for size, materials, care and shipping compiled
- [ ] Images compressed and alt text written
- [ ] Price, tax and delivery clearly stated
- [ ] Sticky mobile add-to-cart
- [ ] Structured data validates
- [ ] Test order placed and emails verified
- [ ] Analytics events confirmed

None of these are creative wins, but together they remove the small doubts that stop people buying.`,
  },
  {
    slug: 'wordpress-site-your-team-can-actually-edit',
    title: 'Building a WordPress site your team can actually edit',
    excerpt:
      'Why editing confidence matters more than feature lists, and how a section library plus clear roles keeps a business website current.',
    categorySlug: 'wordpress',
    tags: ['wordpress', 'cms'],
    featured: false,
    coverImage: '/media/post-wordpress.jpg',
    coverImageAlt: 'A desktop monitor displaying a website in a bright workspace',
    content: `A business website is only as good as its most recent update. If updating it is frightening, the site will drift out of date within a quarter — no matter how good the launch looked.

## The real requirement: safe editing

When a client says "we want to be able to edit it ourselves", they usually mean something specific: *I want to change this text and this image without breaking the page*. That is an architecture decision, not a plugin decision.

The safest pattern is a **section library**. Marketing pages are composed only of pre-built sections — hero, feature grid, testimonial, pricing, FAQ, CTA. Each section accepts a defined set of fields. Adding a page means choosing and ordering sections, not dragging arbitrary blocks around.

## Keep the plugin footprint small

Every plugin is a maintenance liability and a potential performance cost. Before adding one, ask what happens if it is abandoned by its author next year. If the theme or a small custom plugin can do the job, prefer that.

## Write the editor guide

Handover is a deliverable, not a courtesy. At minimum, the guide should cover:

- How to add and edit a page using the section library
- How to publish a blog post, add a category, and set a featured image
- How to update menus, footer details and contact information
- Who to contact when something looks wrong, and what not to touch

Record a short screen-share video as well. It gets watched far more than a PDF.

## Use roles deliberately

Give editors the Editor role rather than Administrator. Administrators can install plugins and change themes — the two most common causes of a site breaking. Keep one administrator account with shared, securely stored credentials for the person responsible for maintenance.

## Plan maintenance before you need it

A simple monthly routine prevents most emergencies:

1. Apply core, theme and plugin updates on staging first
2. Take a backup before updating production
3. Check the contact form actually sends
4. Review uptime and security logs
5. Remove plugins and themes nobody uses

## Signs the site is working for your team

- A team member updates a service page without asking for help
- New landing pages appear between builds
- The blog has posts newer than the launch date
- Nobody has said "we should ask the developer" this month

That is the outcome worth designing for: not a site that impresses on launch day, but one that is still accurate a year later.`,
  },
];

async function seedBlog() {
  const existing = await prisma.blogPost.count();
  if (existing > 0) {
    console.log('• Blog already present — skipping.');
    return;
  }
  const admin = await prisma.adminUser.findFirst({ where: { role: 'SUPER_ADMIN' } });

  for (const cat of CATEGORIES) {
    await prisma.blogCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const tagNames = ['content-strategy', 'social-media', 'shopify', 'conversion', 'wordpress', 'cms'];
  for (const slug of tagNames) {
    await prisma.blogTag.upsert({
      where: { slug },
      update: {},
      create: { slug, name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) },
    });
  }

  let index = 0;
  for (const post of SAMPLE_POSTS) {
    const category = await prisma.blogCategory.findUnique({ where: { slug: post.categorySlug } });
    const tagRows = await prisma.blogTag.findMany({ where: { slug: { in: post.tags } } });
    const words = post.content.split(/\s+/).length;
    await prisma.blogPost.create({
      data: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        coverImageAlt: post.coverImageAlt,
        categoryId: category?.id,
        authorId: admin?.id,
        authorName: admin?.name ?? 'Apronix Tech',
        status: 'PUBLISHED',
        featured: post.featured,
        readingMinutes: Math.max(1, Math.round(words / 220)),
        publishedAt: new Date(Date.now() - (index + 1) * 6 * 24 * 60 * 60 * 1000),
        seoTitle: post.title,
        seoDescription: post.excerpt.slice(0, 155),
        isSampleContent: true,
        tags: { create: tagRows.map((t) => ({ tagId: t.id })) },
      },
    });
    index += 1;
  }
  console.log(`• Seeded ${SAMPLE_POSTS.length} sample articles + ${CATEGORIES.length} categories`);
}

// ---------------------------------------------------------------------------
// Pricing (placeholder figures — replace in the dashboard before launch)
// ---------------------------------------------------------------------------

type PlanSeed = {
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  billingNote: string;
  serviceKey: 'SOCIAL_MEDIA_MANAGEMENT' | 'SHOPIFY_DEVELOPMENT' | 'WORDPRESS_DEVELOPMENT' | null;
  highlighted: boolean;
  features: string[];
  notIncluded: string[];
};

const PRICING_SEED: PlanSeed[] = [
  {
    name: 'Social Starter',
    tagline: 'For brands that need a consistent presence, not a viral moment.',
    price: '₹25,000',
    priceNote: 'per month',
    billingNote: 'Rolling monthly · cancel with 30 days notice',
    serviceKey: 'SOCIAL_MEDIA_MANAGEMENT',
    highlighted: false,
    features: [
      'Two channels managed',
      '12 posts per month',
      'Monthly content calendar',
      'Caption and hashtag research',
      'Community management (weekdays)',
      'Monthly performance summary',
    ],
    notIncluded: ['Paid ad management', 'Video production on location'],
  },
  {
    name: 'Social Growth',
    tagline: 'Our most requested retainer — content plus reporting that answers questions.',
    price: '₹45,000',
    priceNote: 'per month',
    billingNote: 'Rolling monthly · cancel with 30 days notice',
    serviceKey: 'SOCIAL_MEDIA_MANAGEMENT',
    highlighted: true,
    features: [
      'Three channels managed',
      '20 posts plus 4 reels per month',
      'Quarterly strategy session',
      'Reels edited from your footage',
      'Community management (weekdays)',
      'Monthly reporting call',
      'Priority response within 4 hours',
    ],
    notIncluded: ['Paid ad management'],
  },
  {
    name: 'Shopify Launch',
    tagline: 'A store foundation built to be extended, not rebuilt in a year.',
    price: '₹1,20,000',
    priceNote: 'one-off',
    billingNote: '50% to start · 50% at launch',
    serviceKey: 'SHOPIFY_DEVELOPMENT',
    highlighted: false,
    features: [
      'Up to 40 products configured',
      'Custom theme with editable sections',
      'Product and collection templates',
      'Payments, shipping and tax setup',
      'Core Web Vitals pass',
      'Two rounds of revisions',
      'Handover session and documentation',
    ],
    notIncluded: ['Copywriting', 'Product photography'],
  },
  {
    name: 'WordPress Business',
    tagline: 'A site your team can actually update without calling a developer.',
    price: '₹85,000',
    priceNote: 'one-off',
    billingNote: '50% to start · 50% at launch',
    serviceKey: 'WORDPRESS_DEVELOPMENT',
    highlighted: false,
    features: [
      'Up to 8 pages',
      'Custom block library',
      'Editor roles and permissions',
      'On-page SEO groundwork',
      'Contact forms and spam protection',
      'Accessibility pass (WCAG 2.1 AA)',
      'Handover session and documentation',
    ],
    notIncluded: ['Ongoing hosting', 'Content writing'],
  },
  {
    name: 'Care Plan',
    tagline: 'Keep the site current, monitored and fast between projects.',
    price: '₹12,000',
    priceNote: 'per month',
    billingNote: 'Rolling monthly · no lock-in',
    serviceKey: null,
    highlighted: false,
    features: [
      'Monthly core and plugin updates',
      'Uptime and security monitoring',
      'Daily backups with restore testing',
      'Two hours of content changes',
      'Monthly health report',
    ],
    notIncluded: ['New feature development'],
  },
];

async function seedPricing() {
  const existing = await prisma.pricingPlan.count();
  if (existing > 0) {
    console.log('• Pricing plans already present — left untouched');
    return;
  }

  for (const [index, plan] of PRICING_SEED.entries()) {
    await prisma.pricingPlan.create({
      data: {
        name: plan.name,
        tagline: plan.tagline,
        price: plan.price,
        priceNote: plan.priceNote,
        billingNote: plan.billingNote,
        serviceKey: plan.serviceKey,
        highlighted: plan.highlighted,
        notIncluded: plan.notIncluded,
        order: index,
        status: 'PUBLISHED',
        // Every figure below is placeholder data supplied with the build.
        isSampleContent: true,
        features: {
          create: plan.features.map((label, i) => ({ label, included: true, order: i })),
        },
      },
    });
  }
  console.log(`• Seeded ${PRICING_SEED.length} placeholder pricing plans (clearly labelled)`);
}

async function seedSettings() {
  const existing = await prisma.siteSetting.count();
  if (existing > 0) {
    console.log('• Site settings already present — skipping.');
    return;
  }
  console.log('• Site settings left at code defaults (edit them in /admin/settings)');
}

async function main() {
  console.log('\nSeeding Apronix Tech database…\n');
  await seedAdmin();
  await seedServices();
  await seedFaqs();
  await seedProjects();
  await seedPricing();
  await seedBlog();
  await seedSettings();
  console.log('\nDone. Sample content is labelled `isSampleContent` and marked in the UI.\n');
  console.log('Sign in at /admin/login with the ADMIN_EMAIL / ADMIN_PASSWORD from your .env\n');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { SERVICE_KEYS };

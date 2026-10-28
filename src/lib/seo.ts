import type { Metadata } from 'next';
import { publicEnv, serverEnv } from '@/src/lib/env';
import { truncate } from '@/src/lib/utils';

/**
 * Central SEO helpers. Every public page builds its metadata through `buildMetadata`
 * so titles, descriptions, canonicals and Open Graph tags stay consistent and
 * never duplicate.
 */

export const SITE_URL = publicEnv.siteUrl;

type MetaInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  noindex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  keywords?: string[];
  canonicalOverride?: string | null;
};

export function buildMetadata({
  title,
  description,
  path,
  image,
  noindex = false,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  keywords,
  canonicalOverride,
}: MetaInput): Metadata {
  const canonical = canonicalOverride || `${SITE_URL}${path === '/' ? '' : path}`;
  const ogImage = image
    ? image.startsWith('http')
      ? image
      : `${SITE_URL}${image}`
    : `${SITE_URL}/brand/og-default.png`;
  const cleanDescription = truncate(description, 158);

  return {
    title,
    description: cleanDescription,
    keywords,
    alternates: { canonical },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title,
      description: cleanDescription,
      url: canonical,
      siteName: publicEnv.siteName,
      type,
      locale: 'en_IN',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(type === 'article'
        ? {
            publishedTime,
            modifiedTime,
            authors,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: cleanDescription,
      images: [ogImage],
    },
  };
}

export function organizationSchema() {
  const sameAs: string[] = [];
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: publicEnv.siteName,
    url: SITE_URL,
    description:
      'Apronix Tech is a digital agency providing social media management, Shopify development and WordPress development services.',
    email: serverEnv.supportEmail,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/brand/icon-512.png`,
      width: 512,
      height: 512,
    },
    knowsAbout: [
      'Social media management',
      'Instagram management',
      'Instagram Reels editing',
      'Social media advertising',
      'Shopify development',
      'Shopify theme development',
      'Shopify store optimisation',
      'WordPress development',
      'Elementor development',
      'Website design',
      'Website maintenance',
      'Digital marketing',
      'Search engine optimisation',
    ],
    // Service area is only claimed once the agency has confirmed it. These are
    // the areas the site already describes in copy, kept factual.
    areaServed: [
      { '@type': 'Country', name: 'India' },
      { '@type': 'City', name: 'Jaipur' },
      { '@type': 'State', name: 'Rajasthan' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Digital services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Social media management' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Shopify development' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'WordPress development' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Website design' } },
      ],
    },
  };
  if (sameAs.length) data.sameAs = sameAs;
  return data;
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: publicEnv.siteName,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en-IN',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.href === '/' ? '' : item.href}`,
    })),
  };
}

export function serviceSchema(input: {
  name: string;
  description: string;
  path: string;
  serviceType: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    serviceType: input.serviceType,
    description: input.description,
    url: `${SITE_URL}${input.path}`,
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: { '@type': 'Place', name: 'Worldwide' },
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  published?: string | null;
  modified?: string | null;
  author?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: truncate(input.title, 110),
    description: input.description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${input.path}` },
    image: input.image ? [`${SITE_URL}${input.image}`] : [`${SITE_URL}/brand/og-default.png`],
    datePublished: input.published ?? undefined,
    dateModified: input.modified ?? input.published ?? undefined,
    author: { '@type': 'Person', name: input.author || publicEnv.siteName },
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en-IN',
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

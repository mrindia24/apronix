import 'server-only';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/src/lib/prisma';
import { publicEnv, serverEnv, features, whatsappLink } from '@/src/lib/env';

/**
 * Editable site settings. Values live in the SiteSetting table so the agency can
 * change copy, contact details and social links from /admin/settings without a
 * code change. Code defaults are used when a key has never been saved.
 */

export type SiteSettings = {
  siteName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  addressLine: string;
  serviceArea: string;
  whatsapp: string | null;
  socials: { label: string; url: string }[];
  footerNote: string;
  businessHours: string;
  showTestimonials: boolean;
  showClients: boolean;
  clientNames: string[];
  facts: { label: string; value: string }[];
  analyticsConsent: boolean;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: publicEnv.siteName,
  tagline: 'Digital Experiences. Measurable Growth.',
  description:
    'Apronix Tech helps ambitious businesses build a stronger digital presence through strategic social media management and high-performing Shopify and WordPress websites.',
  email: serverEnv.supportEmail,
  phone: '',
  addressLine: '',
  serviceArea: 'Working with clients remotely across India and worldwide.',
  whatsapp: whatsappLink('Hi Apronix Tech, I would like to discuss a project.'),
  socials: [],
  footerNote: 'Built with care by Apronix Tech.',
  businessHours: 'Mon–Fri, 10:00–19:00 IST',
  showTestimonials: true,
  showClients: false,
  clientNames: [],
  facts: [
    { label: 'Disciplines', value: 'Social · Shopify · WordPress' },
    { label: 'Engagement', value: 'Project-based & retained' },
    { label: 'Collaboration', value: 'Remote-first, async-friendly' },
    { label: 'Reporting', value: 'Clear, plain-English updates' },
  ],
  analyticsConsent: true,
};

async function loadSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const stored = Object.fromEntries(rows.map((row) => [row.key, row.value as unknown]));
    return { ...DEFAULT_SETTINGS, ...(stored as Partial<SiteSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Cached site settings, revalidated when settings change. */
export const getSiteSettings = unstable_cache(loadSettings, ['site-settings'], {
  revalidate: 300,
  tags: ['site-settings'],
});

const SETTING_KEYS: (keyof SiteSettings)[] = [
  'siteName',
  'tagline',
  'description',
  'email',
  'phone',
  'addressLine',
  'serviceArea',
  'whatsapp',
  'socials',
  'footerNote',
  'businessHours',
  'showTestimonials',
  'showClients',
  'clientNames',
  'facts',
  'analyticsConsent',
];

export async function saveSiteSettings(input: Partial<SiteSettings>) {
  const entries = Object.entries(input).filter(([key]) =>
    SETTING_KEYS.includes(key as keyof SiteSettings),
  );
  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: value as object },
        create: { key, value: value as object },
      }),
    ),
  );
}

export { features };

'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { requireUser } from '@/src/lib/auth';
import { saveSiteSettings, type SiteSettings } from '@/src/lib/settings';
import { CACHE_TAGS } from '@/src/lib/content';
import { prisma } from '@/src/lib/prisma';
import type { ActionState } from '@/src/lib/actions/types';
import { z } from 'zod';

const settingsSchema = z.object({
  siteName: z.string().trim().min(2).max(80),
  tagline: z.string().trim().max(160),
  description: z.string().trim().min(20).max(400),
  email: z.string().trim().email('Enter a valid email address.'),
  phone: z.string().trim().max(40),
  addressLine: z.string().trim().max(200),
  serviceArea: z.string().trim().max(300),
  whatsapp: z.string().trim().max(300),
  footerNote: z.string().trim().max(200),
  businessHours: z.string().trim().max(120),
  showTestimonials: z.boolean(),
  showClients: z.boolean(),
  analyticsConsent: z.boolean(),
});

export async function saveSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireUser('ADMIN');
  } catch {
    return { ok: false, message: 'You need administrator access to change site settings.' };
  }

  const parsed = settingsSchema.safeParse({
    siteName: String(formData.get('siteName') ?? ''),
    tagline: String(formData.get('tagline') ?? ''),
    description: String(formData.get('description') ?? ''),
    email: String(formData.get('email') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    addressLine: String(formData.get('addressLine') ?? ''),
    serviceArea: String(formData.get('serviceArea') ?? ''),
    whatsapp: String(formData.get('whatsapp') ?? ''),
    footerNote: String(formData.get('footerNote') ?? ''),
    businessHours: String(formData.get('businessHours') ?? ''),
    showTestimonials: formData.get('showTestimonials') === 'on',
    showClients: formData.get('showClients') === 'on',
    analyticsConsent: formData.get('analyticsConsent') === 'on',
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || 'form';
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, message: 'Please check the highlighted fields.', errors };
  }

  const socials = formData
    .getAll('socialLabel')
    .map((label, index) => ({
      label: String(label).trim(),
      url: String(formData.getAll('socialUrl')[index] ?? '').trim(),
    }))
    .filter((s) => s.label && /^https?:\/\//.test(s.url));

  const facts = formData
    .getAll('factLabel')
    .map((label, index) => ({
      label: String(label).trim(),
      value: String(formData.getAll('factValue')[index] ?? '').trim(),
    }))
    .filter((f) => f.label && f.value);

  const payload: Partial<SiteSettings> = {
    ...parsed.data,
    socials,
    facts,
  };

  try {
    await saveSiteSettings(payload);
  } catch (error) {
    console.error('[settings:save]', error);
    return { ok: false, message: 'Could not save settings.' };
  }

  revalidateTag(CACHE_TAGS.settings);
  revalidatePath('/', 'layout');
  revalidatePath('/admin/settings');

  return { ok: true, message: 'Site settings saved.' };
}

export async function createRedirectAction(formData: FormData) {
  await requireUser('ADMIN');
  const fromPath = String(formData.get('fromPath') ?? '').trim();
  const toPath = String(formData.get('toPath') ?? '').trim();
  if (!fromPath.startsWith('/') || !toPath.startsWith('/')) return;

  await prisma.redirect
    .upsert({
      where: { fromPath },
      update: { toPath },
      create: { fromPath, toPath },
    })
    .catch(() => null);

  revalidatePath('/admin/settings');
}

export async function deleteRedirectAction(formData: FormData) {
  await requireUser('ADMIN');
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await prisma.redirect.delete({ where: { id } }).catch(() => null);
  revalidatePath('/admin/settings');
}

export async function deleteMediaAction(formData: FormData) {
  await requireUser('ADMIN');
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const asset = await prisma.mediaAsset.delete({ where: { id } }).catch(() => null);
  if (asset && asset.storage === 'local') {
    const { unlink } = await import('node:fs/promises');
    const path = await import('node:path');
    const filePath = path.join(process.cwd(), 'public', asset.url.replace(/^\//, ''));
    await unlink(filePath).catch(() => null);
  }
  revalidatePath('/admin/media');
}

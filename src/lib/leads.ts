import 'server-only';
import { randomBytes } from 'node:crypto';
import type { ServiceKey, LeadSource } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { leadSchema, type FieldErrors } from '@/src/lib/validation';
import { checkLeadRateLimit, hashIp } from '@/src/lib/rate-limit';
import { honeypotTrap, looksLikeLinkSpam, verifyTurnstile } from '@/src/lib/anti-spam';
import { sendEnquiryAcknowledgement, sendEnquiryNotification } from '@/src/lib/email';
import { features, serverEnv } from '@/src/lib/env';

/**
 * Lead capture pipeline shared by the API route and (optionally) server actions.
 *
 * Order of operations matters:
 *  1. validate (cheap, no side effects)
 *  2. anti-spam checks
 *  3. rate limit
 *  4. persist the lead  ← the submission is only "successful" once this commits
 *  5. send notifications (best-effort; failure is recorded, never fatal)
 */

export type LeadResult =
  | { ok: true; reference: string; emailSent: boolean }
  | {
      ok: false;
      status: number;
      message: string;
      errors?: FieldErrors;
    };

const SERVICE_TO_KEY: Record<string, ServiceKey | null> = {
  SOCIAL_MEDIA_MANAGEMENT: 'SOCIAL_MEDIA_MANAGEMENT',
  SHOPIFY_DEVELOPMENT: 'SHOPIFY_DEVELOPMENT',
  WORDPRESS_DEVELOPMENT: 'WORDPRESS_DEVELOPMENT',
  MULTIPLE: null,
  OTHER: null,
};

export function generateReference(): string {
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const random = randomBytes(3).toString('hex').toUpperCase();
  return `APX-${stamp}-${random}`;
}

export async function submitEnquiry(input: unknown, meta: { ip: string }): Promise<LeadResult> {
  const parsed = leadSchema.safeParse(input);

  if (!parsed.success) {
    const errors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || 'form';
      if (!errors[key]) errors[key] = issue.message;
    }
    return {
      ok: false,
      status: 422,
      message: 'Some details need attention. Please check the highlighted fields.',
      errors,
    };
  }

  const data = parsed.data;

  // --- anti-spam -----------------------------------------------------------
  const trap = honeypotTrap(data.website, data.startedAt);
  if (trap.spam) {
    // Behave like a success for bots (no signal), but never persist the record.
    return { ok: true, reference: 'ignored', emailSent: false };
  }
  if (looksLikeLinkSpam(data.message)) {
    return {
      ok: false,
      status: 400,
      message: 'Your message looks like automated spam. Please email us directly instead.',
      errors: { message: 'Please write a short description of your project without promotional links.' },
    };
  }

  const captcha = await verifyTurnstile(
    typeof (input as { turnstileToken?: string }).turnstileToken === 'string'
      ? (input as { turnstileToken?: string }).turnstileToken
      : undefined,
  );
  if (captcha.spam) {
    return {
      ok: false,
      status: 400,
      message: 'Verification failed. Please refresh the page and try again.',
    };
  }

  // --- rate limiting -------------------------------------------------------
  const ipHash = hashIp(meta.ip);
  const rate = await checkLeadRateLimit(ipHash);
  if (!rate.allowed) {
    return {
      ok: false,
      status: 429,
      message: `You have sent ${rate.used} enquiries in the last hour. Please email ${
        serverEnv.supportEmail || 'us'
      } directly and we will pick it up from there.`,
    };
  }

  // --- persist -------------------------------------------------------------
  const serviceKey = SERVICE_TO_KEY[data.service] ?? null;
  const service = serviceKey ? await prisma.service.findUnique({ where: { key: serviceKey } }) : null;
  const reference = generateReference();

  let lead;
  try {
    lead = await prisma.lead.create({
      data: {
        reference,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        company: data.company || null,
        service: data.service,
        serviceKey,
        serviceRef: service?.id ?? null,
        budget: data.budget || null,
        timeline: data.timeline || null,
        message: data.message,
        consent: data.consent,
        source: (data.source as LeadSource) ?? 'CONTACT_PAGE',
        landingPage: data.landingPage || null,
        referrer: data.referrer || null,
        utmSource: data.utmSource || null,
        utmMedium: data.utmMedium || null,
        utmCampaign: data.utmCampaign || null,
        ipHash,
        emailState: features.email ? 'PENDING' : 'DISABLED',
      },
    });
  } catch (error) {
    console.error('[lead:persist-failed]', error);
    return {
      ok: false,
      status: 500,
      message: `We could not save your enquiry. Please try again, or email ${serverEnv.supportEmail}.`,
    };
  }

  // --- notify (never blocks the response on failure) -----------------------
  let emailSent = false;
  if (features.email) {
    const payload = {
      reference: lead.reference,
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone ?? '',
      company: lead.company,
      service: SERVICE_LABELS[data.service] ?? data.service,
      budget: lead.budget,
      timeline: lead.timeline,
      message: lead.message,
      source: lead.source,
      landingPage: lead.landingPage,
    };

    const notify = await sendEnquiryNotification(payload);
    const ack = await sendEnquiryAcknowledgement(payload);
    emailSent = notify.ok && !('skipped' in notify ? notify.skipped : false);

    await prisma.lead
      .update({
        where: { id: lead.id },
        data: notify.ok
          ? { emailState: 'SENT' }
          : { emailState: 'FAILED', emailError: notify.error.slice(0, 500) },
      })
      .catch(() => null);

    if (!notify.ok) {
      console.error('[lead:notification-failed]', notify.error, 'reference', reference);
    }
    void ack;
  }

  return { ok: true, reference, emailSent };
}

export const SERVICE_LABELS: Record<string, string> = {
  SOCIAL_MEDIA_MANAGEMENT: 'Social Media Management',
  SHOPIFY_DEVELOPMENT: 'Shopify Development',
  WORDPRESS_DEVELOPMENT: 'WordPress Development',
  MULTIPLE: 'Multiple Services',
  OTHER: 'Other',
};

/** Re-attempt delivery for a lead whose notification previously failed. */
export async function retryLeadNotification(leadId: string): Promise<{ ok: boolean; message: string }> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return { ok: false, message: 'Lead not found.' };
  if (!features.email) return { ok: false, message: 'Email delivery is not configured on this server.' };

  const result = await sendEnquiryNotification({
    reference: lead.reference,
    fullName: lead.fullName,
    email: lead.email,
    phone: lead.phone ?? '',
    company: lead.company,
    service: SERVICE_LABELS[lead.service] ?? lead.service,
    budget: lead.budget,
    timeline: lead.timeline,
    message: lead.message,
    source: lead.source,
    landingPage: lead.landingPage,
  });

  await prisma.lead.update({
    where: { id: lead.id },
    data: result.ok
      ? { emailState: 'SENT', emailError: null }
      : { emailState: 'FAILED', emailError: result.error.slice(0, 500) },
  });

  return result.ok
    ? { ok: true, message: 'Notification sent.' }
    : { ok: false, message: `Still failing: ${result.error}` };
}

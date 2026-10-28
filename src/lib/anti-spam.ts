import 'server-only';
import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { serverEnv } from '@/src/lib/env';

/**
 * Anti-spam helpers for the enquiry form:
 *  - a hidden honeypot field ("website") that must stay empty
 *  - a minimum completion time (bots submit instantly)
 *  - optional Cloudflare Turnstile verification when configured
 *  - content heuristics for obvious link spam
 */

import type { SpamVerdict } from '@/src/lib/spam-checks';
export type { SpamVerdict } from '@/src/lib/spam-checks';
export { honeypotTrap, looksLikeLinkSpam } from '@/src/lib/spam-checks';

export async function verifyTurnstile(token: string | undefined): Promise<SpamVerdict> {
  if (!serverEnv.turnstileSecret) return { spam: false }; // not configured → do not block
  if (!token) return { spam: true, reason: 'captcha-missing' };
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: serverEnv.turnstileSecret, response: token }),
      cache: 'no-store',
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success ? { spam: false } : { spam: true, reason: 'captcha-failed' };
  } catch {
    // Never block a genuine lead because the captcha service is unreachable.
    return { spam: false };
  }
}

/** Deterministic-ish IP hash used only for rate limiting and audit. */
export async function requestIpHash(): Promise<string> {
  const h = await headers();
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    h.get('cf-connecting-ip') ||
    '0.0.0.0';
  return createHash('sha256')
    .update(`${ip}:${serverEnv.authSecret.slice(0, 16) || 'apronix-salt'}`)
    .digest('hex')
    .slice(0, 32);
}

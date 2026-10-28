import 'server-only';
import { createHash } from 'node:crypto';
import { prisma } from '@/src/lib/prisma';
import { serverEnv } from '@/src/lib/env';

/**
 * Rate limiting.
 *
 * Lead submissions use a database-backed counter (works across multiple Node
 * instances and survives restarts). Authentication attempts use an in-memory
 * fixed window, which is sufficient because a successful login clears it and
 * the DB session layer is the real gate.
 */

type Bucket = { count: number; resetAt: number };
const memoryBuckets = new Map<string, Bucket>();

export function memoryRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const existing = memoryBuckets.get(key);

  if (!existing || existing.resetAt < now) {
    const bucket = { count: 1, resetAt: now + windowMs };
    memoryBuckets.set(key, bucket);
    return { allowed: true, remaining: limit - 1, resetAt: bucket.resetAt };
  }

  existing.count += 1;
  const allowed = existing.count <= limit;
  return { allowed, remaining: Math.max(0, limit - existing.count), resetAt: existing.resetAt };
}

export function clearMemoryBucket(key: string) {
  memoryBuckets.delete(key);
}

// Periodic cleanup so the map cannot grow unbounded.
if (typeof globalThis !== 'undefined') {
  const g = globalThis as unknown as { __apronixBucketTimer?: NodeJS.Timeout };
  if (!g.__apronixBucketTimer) {
    g.__apronixBucketTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, bucket] of memoryBuckets) {
        if (bucket.resetAt < now) memoryBuckets.delete(key);
      }
    }, 60_000);
    // Do not keep the process alive just for cleanup.
    g.__apronixBucketTimer.unref?.();
  }
}

export function hashIp(ip: string): string {
  return createHash('sha256')
    .update(`${ip}:${serverEnv.authSecret.slice(0, 16) || 'apronix-salt'}`)
    .digest('hex')
    .slice(0, 32);
}

export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return headers.get('x-real-ip') ?? headers.get('cf-connecting-ip') ?? '0.0.0.0';
}

/**
 * Database-backed hourly limit on enquiries from one IP hash.
 * Returns { allowed, used, limit }.
 */
export async function checkLeadRateLimit(ipHash: string) {
  const limit = Number.isFinite(serverEnv.rateLimitPerHour) ? serverEnv.rateLimitPerHour : 5;
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const used = await prisma.lead.count({ where: { ipHash, createdAt: { gte: since } } });
  return { allowed: used < limit, used, limit };
}

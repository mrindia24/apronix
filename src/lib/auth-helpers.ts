import 'server-only';
import { prisma } from '@/src/lib/prisma';

/**
 * Removes expired session rows. Called opportunistically after sign-in and by the
 * admin dashboard — failures are swallowed because this is housekeeping.
 */
export async function pruneExpiredSessionsSafely(): Promise<void> {
  try {
    await prisma.adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  } catch {
    // ignore
  }
}

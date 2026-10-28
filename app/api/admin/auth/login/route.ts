import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { createSession, setSessionCookie, verifyPassword } from '@/src/lib/auth';
import { loginSchema } from '@/src/lib/validation';
import { clientIp, clearMemoryBucket, memoryRateLimit } from '@/src/lib/rate-limit';
import { pruneExpiredSessionsSafely } from '@/src/lib/auth-helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/auth/login
 * Rate limited per IP. Returns a generic error for both unknown email and bad
 * password so accounts cannot be enumerated.
 */
export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  const limit = memoryRateLimit(`login:${ip}`, 8, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: 'Too many attempts. Please wait 10 minutes and try again.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request.' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: 'Enter a valid email address and password.' },
      { status: 422 },
    );
  }

  const { email, password } = parsed.data;

  const user = await prisma.adminUser.findUnique({ where: { email } });
  // Constant-ish time: always run a bcrypt comparison to avoid timing leaks.
  const hash = user?.passwordHash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva';
  const valid = await verifyPassword(password, hash);

  if (!user || !valid || !user.isActive) {
    return NextResponse.json(
      { ok: false, message: 'Email or password is incorrect.' },
      { status: 401 },
    );
  }

  const { token, expiresAt } = await createSession(user.id, {
    ipAddress: ip,
    userAgent: request.headers.get('user-agent') ?? undefined,
  });

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await setSessionCookie(token, expiresAt);
  clearMemoryBucket(`login:${ip}`);
  void pruneExpiredSessionsSafely();

  return NextResponse.json({ ok: true, redirect: '/admin' });
}

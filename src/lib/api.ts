import 'server-only';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AuthError, requireUser } from '@/src/lib/auth';
import type { Role } from '@prisma/client';
import type { FieldErrors } from '@/src/lib/validation';

/**
 * Shared helpers for admin API routes so authorisation, validation and error
 * shapes are consistent across every endpoint.
 */

export type ApiHandler = (context: {
  request: Request;
  params: Record<string, string>;
  user: Awaited<ReturnType<typeof requireUser>>;
}) => Promise<NextResponse> | NextResponse;

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 400, errors?: FieldErrors) {
  return NextResponse.json({ ok: false, message, errors }, { status });
}

export function zodToFieldErrors(error: ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/**
 * Wraps a route handler with authentication, role checks and uniform error
 * handling. `requireUser` is the single source of truth for access control —
 * nothing is protected merely by hiding UI.
 */
export function withAdmin(minimumRole: Role, handler: ApiHandler) {
  return async (request: Request, ctx: { params?: Promise<Record<string, string>> } = {}) => {
    try {
      const user = await requireUser(minimumRole);
      const params = ctx.params ? await ctx.params : {};
      return await handler({ request, params, user });
    } catch (error) {
      if (error instanceof AuthError) {
        return apiError(error.message, error.status);
      }
      if (error instanceof ZodError) {
        return apiError('Please check the highlighted fields.', 422, zodToFieldErrors(error));
      }
      console.error('[api:error]', error);
      return apiError('Something went wrong on the server. Please try again.', 500);
    }
  };
}

/** Parses a JSON body defensively (invalid JSON → 400 rather than a crash). */
export async function readJson<T = unknown>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiBodyError('Invalid JSON body.');
  }
}

export class ApiBodyError extends Error {
  status = 400;
}

/** Same-origin check for state-changing requests (defence in depth with SameSite cookies). */
export function verifyOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // same-origin fetches may omit Origin in some browsers
  const host = request.headers.get('host');
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

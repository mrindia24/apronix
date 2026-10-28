import { NextResponse } from 'next/server';
import { submitEnquiry } from '@/src/lib/leads';
import { clientIp } from '@/src/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/enquiries
 * Public endpoint for the enquiry form. The database is the source of truth: we
 * only return ok:true after the lead has been committed.
 */
export async function POST(request: Request) {
  // Reject non-JSON bodies early (blocks naive form-scraping bots).
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return NextResponse.json(
      { ok: false, message: 'Unsupported content type.' },
      { status: 415 },
    );
  }

  // Same-origin check (CSRF defence for a cookie-less endpoint).
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ ok: false, message: 'Invalid origin.' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ ok: false, message: 'Invalid origin.' }, { status: 403 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request body.' }, { status: 400 });
  }

  const ip = clientIp(request.headers);
  const userAgent = request.headers.get('user-agent')?.slice(0, 300);

  const result = await submitEnquiry({ ...(body as object), userAgent }, { ip });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  return NextResponse.json(
    { ok: true, reference: result.reference, message: 'Enquiry received.' },
    { status: 201 },
  );
}

export async function GET() {
  return NextResponse.json({ ok: false, message: 'Method not allowed.' }, { status: 405 });
}

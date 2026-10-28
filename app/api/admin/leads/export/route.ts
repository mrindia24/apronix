import { prisma } from '@/src/lib/prisma';
import { requireUser } from '@/src/lib/auth';
import { titleCase } from '@/src/lib/utils';
import type { Prisma } from '@prisma/client';
import { LEAD_STATUSES } from '@/src/lib/validation';
import { toCsv } from '@/src/lib/csv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/leads/export
 * Authorised CSV export of lead records (ADMIN or above). Supports the same
 * filters as the list page.
 */
export async function GET(request: Request) {
  try {
    await requireUser('ADMIN');
  } catch {
    return new Response(JSON.stringify({ ok: false, message: 'Not authorised.' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? undefined;
  const status = url.searchParams.get('status') ?? undefined;
  const service = url.searchParams.get('service') ?? undefined;
  const from = url.searchParams.get('from') ?? undefined;
  const to = url.searchParams.get('to') ?? undefined;

  const where: Prisma.LeadWhereInput = {
    ...(status && LEAD_STATUSES.includes(status as (typeof LEAD_STATUSES)[number])
      ? { status: status as (typeof LEAD_STATUSES)[number] }
      : {}),
    ...(service ? { service } : {}),
    ...(q
      ? {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { company: { contains: q, mode: 'insensitive' } },
            { reference: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
          },
        }
      : {}),
  };

  const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' }, take: 5000 });

  const headers = [
    'Reference',
    'Created',
    'Status',
    'Full name',
    'Email',
    'Phone',
    'Company',
    'Service',
    'Budget',
    'Timeline',
    'Message',
    'Consent',
    'Source',
    'Landing page',
    'UTM source',
    'UTM campaign',
    'Email state',
    'Updated',
  ];

  const rows = leads.map((lead) => [
      lead.reference,
      lead.createdAt,
      titleCase(lead.status),
      lead.fullName,
      lead.email,
      lead.phone,
      lead.company,
      titleCase(lead.service),
      lead.budget,
      lead.timeline,
      lead.message,
      lead.consent ? 'Yes' : 'No',
      titleCase(lead.source),
      lead.landingPage,
      lead.utmSource,
      lead.utmCampaign,
    lead.emailState,
    lead.updatedAt,
  ]);

  const csv = toCsv(headers, rows);
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="apronix-leads-${stamp}.csv"`,
      'cache-control': 'no-store',
    },
  });
}

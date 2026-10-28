import Link from 'next/link';
import { Download, Filter, Search } from 'lucide-react';
import { prisma } from '@/src/lib/prisma';
import { AdminPageHeader, Badge, EmptyState } from '@/src/components/admin/ui';
import { formatDateTime, relativeTime, titleCase } from '@/src/lib/utils';
import { LEAD_STATUSES } from '@/src/lib/validation';
import type { Prisma } from '@prisma/client';
import { LeadRowActions } from '@/src/components/admin/lead-actions';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{
  q?: string;
  status?: string;
  service?: string;
  from?: string;
  to?: string;
  page?: string;
}>;

const PER_PAGE = 20;

export default async function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? '1') || 1);

  const where: Prisma.LeadWhereInput = {
    ...(sp.status && LEAD_STATUSES.includes(sp.status as (typeof LEAD_STATUSES)[number])
      ? { status: sp.status as (typeof LEAD_STATUSES)[number] }
      : {}),
    ...(sp.service ? { service: sp.service } : {}),
    ...(sp.q
      ? {
          OR: [
            { fullName: { contains: sp.q, mode: 'insensitive' } },
            { email: { contains: sp.q, mode: 'insensitive' } },
            { company: { contains: sp.q, mode: 'insensitive' } },
            { reference: { contains: sp.q, mode: 'insensitive' } },
            { message: { contains: sp.q, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(sp.from || sp.to
      ? {
          createdAt: {
            ...(sp.from ? { gte: new Date(sp.from) } : {}),
            ...(sp.to ? { lte: new Date(`${sp.to}T23:59:59`) } : {}),
          },
        }
      : {}),
  };

  const [leads, total, counts] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        reference: true,
        fullName: true,
        email: true,
        company: true,
        service: true,
        budget: true,
        status: true,
        emailState: true,
        createdAt: true,
        _count: { select: { notes: true } },
      },
    }),
    prisma.lead.count({ where }),
    prisma.lead.groupBy({ by: ['status'], _count: true }),
  ]);

  const statusCount = Object.fromEntries(counts.map((c) => [c.status, c._count])) as Record<string, number>;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const queryString = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { ...sp, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, String(value));
    }
    const qs = params.toString();
    return qs ? `/admin/leads?${qs}` : '/admin/leads';
  };

  const statusTone = (status: string) =>
    status === 'NEW'
      ? 'brand'
      : status === 'WON' || status === 'QUALIFIED'
        ? 'success'
        : status === 'LOST' || status === 'SPAM'
          ? 'danger'
          : 'neutral';

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Enquiries"
        description="Every enquiry submitted through the website. Update status, add internal notes and export records."
        action={
          <a
            href={`/api/admin/leads/export?${new URLSearchParams(
              Object.entries(sp).filter(([, v]) => v) as [string, string][],
            ).toString()}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 px-3 text-[12.5px] font-semibold text-white transition hover:bg-white/[0.06]"
          >
            <Download size={13} aria-hidden="true" />
            Export CSV
          </a>
        }
      />

      {/* filters */}
      <form method="get" className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-ink-soft p-4 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label htmlFor="q" className="mb-1 block text-[11px] font-medium text-white/60">
            Search
          </label>
          <div className="relative">
            <Search
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30"
              aria-hidden="true"
            />
            <input
              id="q"
              name="q"
              defaultValue={sp.q ?? ''}
              placeholder="Name, email, company or reference"
              className="h-9 w-full rounded-lg border border-white/12 bg-ink pl-8 pr-3 text-[12.5px] text-white placeholder:text-white/60 focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-[11px] font-medium text-white/60">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={sp.status ?? ''}
            className="h-9 rounded-lg border border-white/12 bg-ink px-2.5 pr-7 text-[12.5px] text-white focus:outline-none focus:ring-2 focus:ring-brand/50"
          >
            <option value="">All statuses</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)} {statusCount[s] ? `(${statusCount[s]})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="service" className="mb-1 block text-[11px] font-medium text-white/60">
            Service
          </label>
          <select
            id="service"
            name="service"
            defaultValue={sp.service ?? ''}
            className="h-9 rounded-lg border border-white/12 bg-ink px-2.5 pr-7 text-[12.5px] text-white focus:outline-none focus:ring-2 focus:ring-brand/50"
          >
            <option value="">All services</option>
            {['SOCIAL_MEDIA_MANAGEMENT', 'SHOPIFY_DEVELOPMENT', 'WORDPRESS_DEVELOPMENT', 'MULTIPLE', 'OTHER'].map(
              (s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ),
            )}
          </select>
        </div>
        <div>
          <label htmlFor="from" className="mb-1 block text-[11px] font-medium text-white/60">
            From
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={sp.from ?? ''}
            className="h-9 rounded-lg border border-white/12 bg-ink px-2.5 text-[12.5px] text-white focus:outline-none focus:ring-2 focus:ring-brand/50"
          />
        </div>
        <div>
          <label htmlFor="to" className="mb-1 block text-[11px] font-medium text-white/60">
            To
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={sp.to ?? ''}
            className="h-9 rounded-lg border border-white/12 bg-ink px-2.5 text-[12.5px] text-white focus:outline-none focus:ring-2 focus:ring-brand/50"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-4 text-[12.5px] font-semibold text-white transition hover:bg-brand-dark"
        >
          <Filter size={13} aria-hidden="true" />
          Apply
        </button>
        <Link
          href="/admin/leads"
          className="inline-flex h-9 items-center rounded-lg border border-white/12 px-3 text-[12.5px] text-white/60 transition hover:text-white"
        >
          Reset
        </Link>
      </form>

      <p className="text-[12px] text-white/60" aria-live="polite">
        {total} enquir{total === 1 ? 'y' : 'ies'} found
      </p>

      {leads.length === 0 ? (
        <EmptyState
          title="No enquiries match these filters"
          description="Try clearing the filters, or wait for the next submission — leads appear here as soon as the form is submitted."
        />
      ) : (
        <>
          {/* desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-white/[0.08] lg:block">
            <table className="w-full text-left">
              <thead className="bg-white/[0.03]">
                <tr className="text-[10.5px] uppercase tracking-[0.1em] text-white/60">
                  <th scope="col" className="px-4 py-2.5 font-semibold">Contact</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Service</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Budget</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Received</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {leads.map((lead) => (
                  <tr key={lead.id} className="align-middle transition hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <Link href={`/admin/leads/${lead.id}`} className="group block">
                        <span className="block text-[13px] font-semibold text-white group-hover:text-brand-soft">
                          {lead.fullName}
                        </span>
                        <span className="block text-[11.5px] text-white/60">
                          {lead.email}
                          {lead.company ? ` · ${lead.company}` : ''}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-white/60">{titleCase(lead.service)}</td>
                    <td className="px-4 py-3 text-[12px] text-white/60">{lead.budget ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="block text-[12px] text-white/70">{relativeTime(lead.createdAt)}</span>
                      <span className="block text-[10.5px] text-white/30">{formatDateTime(lead.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(lead.status)}>{lead.status}</Badge>
                      {lead.emailState === 'FAILED' && (
                        <span className="mt-1 block text-[10px] text-brand-soft">email failed</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <LeadRowActions id={lead.id} status={lead.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* mobile cards */}
          <ul className="space-y-2 lg:hidden">
            {leads.map((lead) => (
              <li key={lead.id} className="rounded-xl border border-white/[0.08] bg-ink-soft p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/admin/leads/${lead.id}`}>
                    <p className="text-[13px] font-semibold text-white">{lead.fullName}</p>
                    <p className="text-[11.5px] text-white/60">{lead.email}</p>
                  </Link>
                  <Badge tone={statusTone(lead.status)}>{lead.status}</Badge>
                </div>
                <p className="mt-2 text-[11.5px] text-white/65">
                  {titleCase(lead.service)} · {relativeTime(lead.createdAt)}
                  {lead.budget ? ` · ${lead.budget}` : ''}
                </p>
                <div className="mt-3">
                  <LeadRowActions id={lead.id} status={lead.status} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {totalPages > 1 && (
        <nav aria-label="Lead pagination" className="flex items-center justify-between border-t border-white/[0.08] pt-4">
          <Link
            href={queryString({ page: String(Math.max(1, page - 1)) })}
            aria-disabled={page === 1}
            className={`text-[12.5px] font-semibold ${page === 1 ? 'pointer-events-none text-white/20' : 'text-white/70 hover:text-white'}`}
          >
            ← Previous
          </Link>
          <span className="text-[12px] text-white/60">
            Page {page} of {totalPages}
          </span>
          <Link
            href={queryString({ page: String(Math.min(totalPages, page + 1)) })}
            aria-disabled={page === totalPages}
            className={`text-[12.5px] font-semibold ${page === totalPages ? 'pointer-events-none text-white/20' : 'text-white/70 hover:text-white'}`}
          >
            Next →
          </Link>
        </nav>
      )}
    </div>
  );
}

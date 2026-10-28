import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Building2, Globe, Clock, RefreshCw, Trash2 } from 'lucide-react';
import { prisma } from '@/src/lib/prisma';
import { getSessionUser, hasRole } from '@/src/lib/auth';
import { AdminPageHeader, Badge, Card } from '@/src/components/admin/ui';
import { formatDateTime, relativeTime, titleCase } from '@/src/lib/utils';
import { addLeadNoteAction, deleteLeadAction, retryLeadEmailAction, updateLeadStatusAction } from '@/src/lib/actions/leads';
import { LEAD_STATUSES } from '@/src/lib/validation';
import { LeadNoteForm } from '@/src/components/admin/lead-note-form';

export const dynamic = 'force-dynamic';

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      notes: {
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true, email: true } } },
      },
    },
  });

  if (!lead) notFound();

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
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white/65 transition hover:text-white"
      >
        <ArrowLeft size={13} aria-hidden="true" />
        All enquiries
      </Link>

      <AdminPageHeader
        title={lead.fullName}
        description={`Reference ${lead.reference} · received ${formatDateTime(lead.createdAt)} (${relativeTime(lead.createdAt)})`}
        action={
          <div className="flex items-center gap-2">
            <Badge tone={statusTone(lead.status)}>{lead.status}</Badge>
            {hasRole(user, 'ADMIN') && (
              <form action={retryLeadEmailAction}>
                <input type="hidden" name="id" value={lead.id} />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 px-3 text-[12px] font-semibold text-white transition hover:bg-white/[0.06]"
                >
                  <RefreshCw size={12} aria-hidden="true" />
                  Retry notification
                </button>
              </form>
            )}
          </div>
        }
      />

      {lead.emailState === 'FAILED' && (
        <div className="rounded-xl border border-brand/30 bg-brand/[0.08] px-4 py-3 text-[12.5px] leading-relaxed text-white/85">
          <strong className="font-semibold">Notification email failed to send.</strong> The lead is safely
          stored. {lead.emailError ? `Provider said: ${lead.emailError}` : ''}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Card title="Enquiry details">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/60">
                  <Mail size={11} aria-hidden="true" /> Email
                </dt>
                <dd className="mt-1">
                  <a href={`mailto:${lead.email}`} className="text-[13px] text-brand-soft hover:text-white">
                    {lead.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/60">
                  <Phone size={11} aria-hidden="true" /> Phone
                </dt>
                <dd className="mt-1">
                  <a href={`tel:${lead.phone}`} className="text-[13px] text-white/85 hover:text-brand-soft">
                    {lead.phone ?? '—'}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/60">
                  <Building2 size={11} aria-hidden="true" /> Company
                </dt>
                <dd className="mt-1 text-[13px] text-white/85">{lead.company ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/60">
                  Service
                </dt>
                <dd className="mt-1 text-[13px] text-white/85">{titleCase(lead.service)}</dd>
              </div>
              <div>
                <dt className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/60">
                  Budget
                </dt>
                <dd className="mt-1 text-[13px] text-white/85">{lead.budget ?? 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/60">
                  Timeline
                </dt>
                <dd className="mt-1 text-[13px] text-white/85">{lead.timeline ?? 'Not specified'}</dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-white/[0.07] pt-4">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/60">
                Message
              </p>
              <p className="mt-2 whitespace-pre-wrap rounded-xl bg-ink p-4 text-[13.5px] leading-relaxed text-white/85">
                {lead.message}
              </p>
            </div>
          </Card>

          <Card title="Internal notes" description="Visible only to signed-in staff. Never shown to the enquirer.">
            <LeadNoteForm leadId={lead.id} action={addLeadNoteAction} />

            {lead.notes.length === 0 ? (
              <p className="mt-4 text-[12.5px] text-white/60">No notes yet.</p>
            ) : (
              <ul className="mt-4 space-y-3 border-t border-white/[0.07] pt-4">
                {lead.notes.map((note) => (
                  <li key={note.id} className="rounded-xl bg-ink p-3.5">
                    <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-white/80">{note.body}</p>
                    <p className="mt-2 text-[10.5px] text-white/30">
                      {note.author?.name ?? 'System'} · {formatDateTime(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Lead status">
            <form action={updateLeadStatusAction} className="space-y-3">
              <input type="hidden" name="id" value={lead.id} />
              <label htmlFor="status" className="block text-[11.5px] text-white/60">
                Update status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={lead.status}
                className="h-10 w-full rounded-lg border border-white/12 bg-ink px-3 text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-brand/50"
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {titleCase(s)}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="h-10 w-full rounded-lg bg-brand text-[13px] font-semibold text-white transition hover:bg-brand-dark"
              >
                Save status
              </button>
            </form>
            <p className="mt-3 text-[11px] leading-relaxed text-white/30">
              Statuses: New → Contacted → Qualified → Won / Lost. Mark spam to exclude it from reporting.
            </p>
          </Card>

          <Card title="Attribution">
            <dl className="space-y-2.5 text-[12px]">
              {[
                { label: 'Source', value: titleCase(lead.source) },
                { label: 'Landing page', value: lead.landingPage ?? '—' },
                { label: 'Referrer', value: lead.referrer ?? '—' },
                { label: 'UTM source', value: lead.utmSource ?? '—' },
                { label: 'UTM medium', value: lead.utmMedium ?? '—' },
                { label: 'UTM campaign', value: lead.utmCampaign ?? '—' },
                { label: 'Consent', value: lead.consent ? 'Given' : 'Not given' },
                { label: 'Email state', value: lead.emailState },
                { label: 'IP fingerprint', value: lead.ipHash ?? '—' },
                { label: 'Created', value: formatDateTime(lead.createdAt) },
                { label: 'Updated', value: formatDateTime(lead.updatedAt) },
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-3">
                  <dt className="flex-none text-white/60">{row.label}</dt>
                  <dd className="truncate text-right text-white/75">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 flex items-start gap-1.5 border-t border-white/[0.07] pt-3 text-[10.5px] leading-relaxed text-white/60">
              <Globe size={10} className="mt-0.5 flex-none" aria-hidden="true" />
              IP addresses are stored only as a salted hash, used for spam limiting.
            </p>
          </Card>

          {hasRole(user, 'SUPER_ADMIN') && (
            <Card title="Danger zone">
              <form action={deleteLeadAction}>
                <input type="hidden" name="id" value={lead.id} />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-brand/40 px-3 text-[12px] font-semibold text-brand-soft transition hover:bg-brand/10"
                >
                  <Trash2 size={12} aria-hidden="true" />
                  Delete this lead permanently
                </button>
              </form>
              <p className="mt-2 text-[10.5px] leading-relaxed text-white/60">
                Super admin only. This cannot be undone — consider exporting first.
              </p>
            </Card>
          )}

          <p className="flex items-center gap-1.5 px-1 text-[10.5px] text-white/20">
            <Clock size={10} aria-hidden="true" />
            Times shown in your server timezone.
          </p>
        </div>
      </div>
    </div>
  );
}

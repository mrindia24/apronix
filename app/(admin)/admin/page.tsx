import Link from 'next/link';
import {
  ArrowUpRight,
  Briefcase,
  FileText,
  Mail,
  MessageSquareQuote,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';
import { prisma } from '@/src/lib/prisma';
import { getSessionUser } from '@/src/lib/auth';
import { AdminPageHeader, Badge, Stat, Card, EmptyState } from '@/src/components/admin/ui';
import { formatDateTime, relativeTime, titleCase } from '@/src/lib/utils';
import { features } from '@/src/lib/env';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const user = await getSessionUser();

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalLeads,
    newLeads,
    leadsThisMonth,
    portfolioCount,
    publishedProjects,
    postCount,
    publishedPosts,
    testimonialCount,
    approvedTestimonials,
    faqCount,
    recentLeads,
    emailFailures,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.lead.count({ where: { createdAt: { gte: since } } }),
    prisma.portfolioProject.count(),
    prisma.portfolioProject.count({ where: { status: 'PUBLISHED' } }),
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
    prisma.testimonial.count(),
    prisma.testimonial.count({ where: { approved: true } }),
    prisma.fAQ.count(),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        reference: true,
        fullName: true,
        email: true,
        service: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.lead.count({ where: { emailState: 'FAILED' } }),
  ]);

  const statusTone = (status: string) =>
    status === 'NEW'
      ? 'brand'
      : status === 'WON'
        ? 'success'
        : status === 'LOST' || status === 'SPAM'
          ? 'danger'
          : status === 'QUALIFIED'
            ? 'success'
            : 'neutral';

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Welcome back${user ? `, ${user.name.split(' ')[0]}` : ''}`}
        description="Everything published on the website is managed from here — enquiries, portfolio, articles, FAQs and site copy."
        action={
          <>
            <Link
              href="/admin/portfolio/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 px-3 text-[12.5px] font-semibold text-white transition hover:bg-white/[0.06]"
            >
              <Plus size={13} aria-hidden="true" />
              New project
            </Link>
            <Link
              href="/admin/blog/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3 text-[12.5px] font-semibold text-white transition hover:bg-brand-dark"
            >
              <Plus size={13} aria-hidden="true" />
              New article
            </Link>
          </>
        }
      />

      {!features.email && (
        <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3 text-[12.5px] leading-relaxed text-amber-100">
          <strong className="font-semibold">Email is not configured.</strong> Enquiries are still saved to
          the database, but no notification or acknowledgement emails are being sent. Add SMTP settings to
          your environment to enable them — see the README.
        </div>
      )}

      {emailFailures > 0 && (
        <div className="rounded-xl border border-brand/30 bg-brand/[0.08] px-4 py-3 text-[12.5px] leading-relaxed text-white/85">
          <strong className="font-semibold">{emailFailures} lead notification(s) failed to send.</strong>{' '}
          The leads were saved — open a lead and use “Retry notification”.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="New leads" value={newLeads} sub={`${leadsThisMonth} in the last 30 days`} href="/admin/leads?status=NEW" />
        <Stat label="All leads" value={totalLeads} sub="Lifetime enquiries" href="/admin/leads" />
        <Stat
          label="Published projects"
          value={publishedProjects}
          sub={`${portfolioCount} total in portfolio`}
          href="/admin/portfolio"
        />
        <Stat
          label="Published articles"
          value={publishedPosts}
          sub={`${postCount} total in blog`}
          href="/admin/blog"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card
          title="Recent enquiries"
          description="Latest submissions from the website contact and service forms."
          action={
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-soft hover:text-white"
            >
              View all
              <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          }
        >
          {recentLeads.length === 0 ? (
            <EmptyState
              title="No enquiries yet"
              description="When someone submits the contact form, their details will appear here immediately."
            />
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/admin/leads/${lead.id}`}
                  className="flex items-center justify-between gap-3 py-3 transition hover:opacity-80"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-white">{lead.fullName}</p>
                    <p className="truncate text-[11.5px] text-white/60">
                      {lead.email} · {titleCase(lead.service)}
                    </p>
                  </div>
                  <div className="flex flex-none items-center gap-2">
                    <Badge tone={statusTone(lead.status)}>{lead.status}</Badge>
                    <span className="hidden text-[11px] text-white/60 sm:inline">
                      {relativeTime(lead.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card title="Content status">
            <ul className="space-y-2.5">
              {[
                {
                  label: 'Portfolio projects',
                  href: '/admin/portfolio',
                  icon: Briefcase,
                  value: `${publishedProjects} published`,
                  hint: `${portfolioCount - publishedProjects} draft/inactive`,
                },
                {
                  label: 'Blog articles',
                  href: '/admin/blog',
                  icon: FileText,
                  value: `${publishedPosts} published`,
                  hint: `${postCount - publishedPosts} draft/inactive`,
                },
                {
                  label: 'Testimonials',
                  href: '/admin/testimonials',
                  icon: MessageSquareQuote,
                  value: `${approvedTestimonials} approved`,
                  hint: `${testimonialCount - approvedTestimonials} awaiting approval`,
                },
                {
                  label: 'FAQs',
                  href: '/admin/faqs',
                  icon: MessageSquareQuote,
                  value: `${faqCount} entries`,
                  hint: 'Homepage + service pages',
                },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <li key={row.label}>
                    <Link
                      href={row.href}
                      className="flex items-center justify-between gap-2 rounded-lg px-1 py-1.5 transition hover:bg-white/[0.04]"
                    >
                      <span className="flex items-center gap-2 text-[12.5px] text-white/75">
                        <Icon size={13} className="text-white/30" aria-hidden="true" />
                        {row.label}
                      </span>
                      <span className="text-right">
                        <span className="block text-[12px] font-semibold text-white">{row.value}</span>
                        <span className="block text-[10.5px] text-white/60">{row.hint}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card title="Quick actions">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Leads', href: '/admin/leads', icon: Users },
                { label: 'New article', href: '/admin/blog/new', icon: FileText },
                { label: 'Site settings', href: '/admin/settings', icon: TrendingUp },
                { label: 'Media library', href: '/admin/media', icon: Mail },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-start gap-2 rounded-xl border border-white/[0.08] p-3 text-[12px] font-medium text-white/70 transition hover:border-white/20 hover:text-white"
                  >
                    <Icon size={14} className="text-brand" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <p className="text-[11px] text-white/60">
        Data shown as of {formatDateTime(new Date())}. This dashboard is not indexed by search engines.
      </p>
    </div>
  );
}

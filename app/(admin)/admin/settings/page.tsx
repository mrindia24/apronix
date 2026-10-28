import { prisma } from '@/src/lib/prisma';
import { getSiteSettings } from '@/src/lib/settings';
import { getSessionUser, hasRole } from '@/src/lib/auth';
import { AdminPageHeader, Card, Badge } from '@/src/components/admin/ui';
import { SettingsForm } from '@/src/components/admin/settings-form';
import { PasswordForm } from '@/src/components/admin/password-form';
import { deleteRedirectAction } from '@/src/lib/actions/settings';
import { features, publicEnv } from '@/src/lib/env';
import { ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const [settings, user, redirects] = await Promise.all([
    getSiteSettings(),
    getSessionUser(),
    prisma.redirect.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
  ]);

  const integrationStatus = [
    { label: 'Email delivery (SMTP)', ready: features.email, hint: 'Enquiry notifications and acknowledgements' },
    { label: 'Object storage (S3/R2)', ready: features.objectStorage, hint: 'Falls back to local disk uploads' },
    { label: 'Analytics', ready: features.analytics, hint: 'Loads only after visitor consent' },
    { label: 'WhatsApp link', ready: features.whatsapp, hint: 'Appears on contact and service pages' },
    { label: 'Cloudflare Turnstile', ready: features.turnstile, hint: 'Optional extra spam protection' },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Website settings"
        description="Contact details, agency facts and social links shown across the site. Changes take effect immediately."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <SettingsForm
            settings={{
              siteName: settings.siteName,
              tagline: settings.tagline,
              description: settings.description,
              email: settings.email,
              phone: settings.phone,
              addressLine: settings.addressLine,
              serviceArea: settings.serviceArea,
              whatsapp: settings.whatsapp ?? '',
              footerNote: settings.footerNote,
              businessHours: settings.businessHours,
              showTestimonials: settings.showTestimonials,
              showClients: settings.showClients,
              analyticsConsent: settings.analyticsConsent,
              socials: settings.socials,
              facts: settings.facts,
            }}
            canEdit={hasRole(user, 'ADMIN')}
          />

          <Card
            title="Redirects"
            description="Created automatically when a published slug changes. Add manual redirects for any URL you have moved."
          >
            {redirects.length === 0 ? (
              <p className="text-[12.5px] text-white/60">No redirects recorded.</p>
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {redirects.map((redirect) => (
                  <li key={redirect.id} className="flex items-center justify-between gap-3 py-2">
                    <code className="truncate text-[11.5px] text-white/70">
                      {redirect.fromPath} → {redirect.toPath}
                    </code>
                    <form action={deleteRedirectAction}>
                      <input type="hidden" name="id" value={redirect.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-white/12 px-2 py-1 text-[11px] text-white/65 transition hover:border-brand/40 hover:text-brand-soft"
                      >
                        Remove
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <PasswordForm />
        </div>

        <div className="space-y-4">
          <Card title="Integration status" description="Configured through environment variables.">
            <ul className="space-y-2.5">
              {integrationStatus.map((item) => (
                <li key={item.label} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[12.5px] text-white/80">{item.label}</p>
                    <p className="text-[10.5px] text-white/60">{item.hint}</p>
                  </div>
                  <Badge tone={item.ready ? 'success' : 'neutral'}>{item.ready ? 'Active' : 'Off'}</Badge>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-white/[0.07] pt-3 text-[11px] leading-relaxed text-white/30">
              Secrets are never displayed in the dashboard. Update them in your hosting provider&apos;s
              environment settings.
            </p>
          </Card>

          <Card title="Environment" description="Read-only server information.">
            <dl className="space-y-2 text-[11.5px]">
              {[
                { label: 'Site URL', value: publicEnv.siteUrl },
                { label: 'Node environment', value: process.env.NODE_ENV ?? 'unknown' },
                {
                  label: 'Signed in as',
                  value: `${user?.name} (${user?.role.replace('_', ' ')})`,
                },
              ].map((row) => (
                <div key={row.label}>
                  <dt className="text-white/60">{row.label}</dt>
                  <dd className="truncate text-white/75">{row.value}</dd>
                </div>
              ))}
            </dl>
            <a
              href="/sitemap.xml"
              target="_blank"
              className="mt-4 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-brand-soft hover:text-white"
            >
              <ExternalLink size={11} aria-hidden="true" />
              View sitemap.xml
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}

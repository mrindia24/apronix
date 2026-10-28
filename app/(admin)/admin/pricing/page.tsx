import Link from 'next/link';
import { ExternalLink, Info } from 'lucide-react';
import { prisma } from '@/src/lib/prisma';
import { AdminPageHeader, Card, Badge, EmptyState } from '@/src/components/admin/ui';
import { PricingPlanEditor } from '@/src/components/admin/pricing-plan-editor';
import { deletePricingPlanAction } from '@/src/lib/actions/content';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Pricing — Admin' };

export default async function AdminPricingPage() {
  const plans = await prisma.pricingPlan.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    include: { features: { orderBy: [{ order: 'asc' }, { label: 'asc' }] } },
  });

  const sampleCount = plans.filter((p) => p.isSampleContent).length;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Pricing"
        description="Plans shown on /pricing. Prices are free text so you can use any currency or write “On request”."
        action={
          <Link
            href="/pricing"
            target="_blank"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/12 px-3 text-[12px] text-white/75 transition hover:text-white"
          >
            View page
            <ExternalLink size={12} aria-hidden="true" />
          </Link>
        }
      />

      {sampleCount > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3 text-[12.5px] leading-relaxed text-amber-100/90">
          <Info size={15} className="mt-0.5 flex-none text-amber-300" aria-hidden="true" />
          <span>
            <strong className="font-semibold">{sampleCount} plan(s) still contain placeholder figures.</strong>{' '}
            The public page shows a “placeholder pricing” notice until every plan has been saved once.
            Editing and saving a plan clears its sample flag.
          </span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <Card title="Published plans" description="Ordered as they appear on the public page.">
            {plans.length === 0 ? (
              <EmptyState
                title="No pricing plans yet"
                description="Add your first plan on the right. Until then /pricing shows a “pricing is being finalised” message."
              />
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {plans.map((plan) => (
                  <li key={plan.id} className="py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[13.5px] font-semibold text-white">{plan.name}</p>
                          {plan.highlighted && <Badge tone="brand">Popular</Badge>}
                          <Badge tone={plan.status === 'PUBLISHED' ? 'success' : 'neutral'}>
                            {plan.status}
                          </Badge>
                          {plan.isSampleContent && <Badge tone="warning">Sample data</Badge>}
                        </div>
                        <p className="mt-1 text-[12.5px] text-white/70">
                          {plan.price || 'On request'}
                          {plan.priceNote ? ` · ${plan.priceNote}` : ''}
                        </p>
                        {plan.tagline && (
                          <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-white/55">
                            {plan.tagline}
                          </p>
                        )}
                        <p className="mt-1 text-[10.5px] text-white/45">
                          {plan.features.length} features · order {plan.order} ·{' '}
                          {plan.serviceKey ? plan.serviceKey.replaceAll('_', ' ').toLowerCase() : 'no service link'}
                        </p>
                      </div>
                      <div className="flex flex-none flex-col items-end gap-1.5">
                        <PricingPlanEditor
                          plan={{
                            id: plan.id,
                            name: plan.name,
                            tagline: plan.tagline,
                            price: plan.price,
                            priceNote: plan.priceNote,
                            billingNote: plan.billingNote,
                            serviceKey: plan.serviceKey,
                            highlighted: plan.highlighted,
                            ctaLabel: plan.ctaLabel,
                            ctaHref: plan.ctaHref,
                            notIncluded: Array.isArray(plan.notIncluded)
                              ? (plan.notIncluded as string[])
                              : [],
                            order: plan.order,
                            status: plan.status,
                            isSampleContent: plan.isSampleContent,
                            features: plan.features.map((f) => ({
                              label: f.label,
                              included: f.included,
                            })),
                          }}
                        />
                        <form action={deletePricingPlanAction}>
                          <input type="hidden" name="id" value={plan.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-white/12 px-2 py-1 text-[11px] text-white/55 transition hover:border-brand/50 hover:text-brand-soft"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <PricingPlanEditor />

          <Card title="Wording that works">
            <ul className="space-y-2 text-[12px] leading-relaxed text-white/65">
              <li>
                <strong className="text-white/85">Be specific about units.</strong> “per month” and
                “one-off” in the price note stop people comparing unlike things.
              </li>
              <li>
                <strong className="text-white/85">Say what is not included.</strong> It saves a
                round of email on every enquiry.
              </li>
              <li>
                <strong className="text-white/85">Keep deposit terms visible.</strong> The billing
                note is where “50% to start” belongs.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { prisma } from '@/src/lib/prisma';
import { AdminPageHeader, Card, Badge, EmptyState } from '@/src/components/admin/ui';
import { FaqEditor } from '@/src/components/admin/faq-editor';
import { deleteFaqAction } from '@/src/lib/actions/content';
import { titleCase } from '@/src/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminFaqsPage() {
  const faqs = await prisma.fAQ.findMany({
    orderBy: [{ scope: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
  });

  const grouped = {
    home: faqs.filter((f) => f.scope === null),
    SOCIAL_MEDIA_MANAGEMENT: faqs.filter((f) => f.scope === 'SOCIAL_MEDIA_MANAGEMENT'),
    SHOPIFY_DEVELOPMENT: faqs.filter((f) => f.scope === 'SHOPIFY_DEVELOPMENT'),
    WORDPRESS_DEVELOPMENT: faqs.filter((f) => f.scope === 'WORDPRESS_DEVELOPMENT'),
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="FAQs"
        description="Questions shown on the homepage and on each service page. Answers are rendered as plain text (line breaks preserved)."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {Object.entries(grouped).map(([scope, items]) => (
            <Card
              key={scope}
              title={scope === 'home' ? 'Homepage & contact page' : `${titleCase(scope)} page`}
              description={
                scope === 'home'
                  ? 'Shown in the homepage FAQ accordion and on the contact page.'
                  : 'Shown in the FAQ accordion on this service page.'
              }
            >
              {items.length === 0 ? (
                <p className="text-[12.5px] text-white/60">No FAQs in this scope yet.</p>
              ) : (
                <ul className="divide-y divide-white/[0.06]">
                  {items.map((faq) => (
                    <li key={faq.id} className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-white">{faq.question}</p>
                          <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-white/60">
                            {faq.answer}
                          </p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <Badge tone={faq.status === 'PUBLISHED' ? 'success' : 'neutral'}>
                              {faq.status}
                            </Badge>
                            <span className="text-[10.5px] text-white/60">order {faq.order}</span>
                          </div>
                        </div>
                        <div className="flex flex-none flex-col items-end gap-1">
                          <FaqEditor
                            faq={{
                              id: faq.id,
                              question: faq.question,
                              answer: faq.answer,
                              scope: faq.scope,
                              order: faq.order,
                              status: faq.status,
                            }}
                          />
                          <form action={deleteFaqAction}>
                            <input type="hidden" name="id" value={faq.id} />
                            <button
                              type="submit"
                              className="rounded-lg border border-white/12 px-2 py-1 text-[11px] text-white/65 transition hover:border-brand/40 hover:text-brand-soft"
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
          ))}

          {faqs.length === 0 && (
            <EmptyState title="No FAQs yet" description="Add your first question using the form on the right." />
          )}
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <FaqEditor />
        </div>
      </div>
    </div>
  );
}

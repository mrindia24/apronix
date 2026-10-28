import { prisma } from '@/src/lib/prisma';
import { AdminPageHeader, Badge } from '@/src/components/admin/ui';
import { TestimonialForm } from '@/src/components/admin/testimonial-form';
import { deleteTestimonialAction, toggleTestimonialApprovalAction } from '@/src/lib/actions/content';
import { Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Testimonials"
        description="Only approved testimonials appear on the website. Never publish a quote you do not have written permission to use, and never invent one."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {testimonials.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/12 p-8 text-center">
              <p className="text-[14px] font-semibold text-white">No testimonials yet</p>
              <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-white/65">
                The testimonials section is hidden on the website while this list is empty. Add a quote
                once you have a client&apos;s written approval.
              </p>
            </div>
          ) : (
            testimonials.map((testimonial) => (
              <div key={testimonial.id} className="rounded-xl border border-white/[0.08] bg-ink-soft p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={testimonial.approved ? 'success' : 'warning'}>
                        {testimonial.approved ? 'Approved' : 'Awaiting approval'}
                      </Badge>
                      {testimonial.isSampleContent && <Badge tone="warning">Sample</Badge>}
                      {testimonial.rating && (
                        <span className="inline-flex items-center gap-0.5 text-[11px] text-brand-soft">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} size={10} fill="currentColor" aria-hidden="true" />
                          ))}
                        </span>
                      )}
                    </div>
                    <blockquote className="mt-2 text-[13px] leading-relaxed text-white/85">
                      “{testimonial.quote}”
                    </blockquote>
                    <p className="mt-2 text-[11.5px] text-white/65">
                      {testimonial.authorName}
                      {testimonial.authorRole ? ` · ${testimonial.authorRole}` : ''}
                      {testimonial.company ? ` · ${testimonial.company}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-none flex-col items-end gap-1">
                    <form action={toggleTestimonialApprovalAction}>
                      <input type="hidden" name="id" value={testimonial.id} />
                      <button
                        type="submit"
                        className={`rounded-lg border px-2 py-1 text-[11px] font-semibold transition ${
                          testimonial.approved
                            ? 'border-white/12 text-white/60 hover:text-white'
                            : 'border-[#1F6F43]/50 bg-[#0C1F16] text-[#8AF0B4]'
                        }`}
                      >
                        {testimonial.approved ? 'Unapprove' : 'Approve'}
                      </button>
                    </form>
                    <TestimonialForm
                      testimonial={{
                        id: testimonial.id,
                        quote: testimonial.quote,
                        authorName: testimonial.authorName,
                        authorRole: testimonial.authorRole,
                        company: testimonial.company,
                        rating: testimonial.rating,
                        order: testimonial.order,
                        approved: testimonial.approved,
                      }}
                    />
                    <form action={deleteTestimonialAction}>
                      <input type="hidden" name="id" value={testimonial.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-white/12 px-2 py-1 text-[11px] text-white/65 transition hover:border-brand/40 hover:text-brand-soft"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <TestimonialForm />
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Image from 'next/image';
import { Clock, Mail, MessageCircle, MapPin, Phone } from 'lucide-react';
import { Breadcrumbs } from '@/src/components/site/breadcrumbs';
import { Accordion } from '@/src/components/ui/accordion';
import { Suspense } from 'react';
import { EnquiryForm } from '@/src/components/site/enquiry-form';
import { FormSkeleton } from '@/src/components/site/form-skeleton';
import { getFaqs } from '@/src/lib/content';
import { getSiteSettings } from '@/src/lib/settings';
import { buildMetadata, breadcrumbSchema, faqSchema } from '@/src/lib/seo';
import { PAGE_KEYWORDS } from '@/src/lib/keywords';

export const metadata: Metadata = buildMetadata({
  title: 'Contact Apronix Tech — Book a Free Consultation',
  description:
    'Talk to Apronix Tech about social media management, Shopify development or WordPress development. Send an enquiry and we reply within one business day.',
  path: '/contact',
  keywords: [...PAGE_KEYWORDS.contact],
});

export const revalidate = 600;

export default async function ContactPage() {
  const [settings, faqs] = await Promise.all([getSiteSettings(), getFaqs(null)]);

  const details = [
    settings.email && {
      icon: Mail,
      label: 'Email',
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
    settings.phone && {
      icon: Phone,
      label: 'Phone',
      value: settings.phone,
      href: `tel:${settings.phone.replace(/\s/g, '')}`,
    },
    settings.whatsapp && {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: 'Message us on WhatsApp',
      href: settings.whatsapp,
      external: true,
    },
    settings.businessHours && {
      icon: Clock,
      label: 'Hours',
      value: settings.businessHours,
    },
    settings.addressLine && {
      icon: MapPin,
      label: 'Location',
      value: settings.addressLine,
    },
  ].filter(Boolean) as {
    icon: typeof Mail;
    label: string;
    value: string;
    href?: string;
    external?: boolean;
  }[];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            [
              breadcrumbSchema([
                { name: 'Home', href: '/' },
                { name: 'Contact', href: '/contact' },
              ]),
              faqSchema(faqs.map((f) => ({ question: f.question, answer: f.answer }))),
            ].filter(Boolean),
          ),
        }}
      />

      <section className="relative overflow-hidden border-b border-white/[0.07]">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,48,56,0.16),transparent_65%)] blur-2xl"
          aria-hidden="true"
        />
        <div className="shell relative py-12 sm:py-16">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Contact', href: '/contact' }]} />
          <div className="mt-8 max-w-2xl">
            <p className="eyebrow">
              <span className="dot" aria-hidden="true" />
              Contact
            </p>
            <h1 className="mt-5 text-display-lg text-white">
              Let&apos;s talk about what
              <br />
              <span className="text-white/65">you are building.</span>
            </h1>
            <p className="mt-6 text-[15.5px] leading-relaxed text-mute-onDark text-pretty">
              Tell us where you are now and what you want to change. You will get a reply from a real
              person within one business day — usually with a question or two, and a suggested next step.
            </p>
          </div>
        </div>
      </section>

      {/* editorial band: what working with us feels like */}
      <section className="section pt-0">
        <div className="shell">
          <figure className="overflow-hidden rounded-3xl border border-white/[0.08]">
            <Image
              src="/media/editorial-planning.jpg"
              alt="A phone and a notebook on a desk used for planning content"
              width={1600}
              height={900}
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="h-auto w-full"
            />
            <figcaption className="border-t border-white/[0.07] bg-ink-soft px-5 py-3 text-[12px] text-white/60">
              Enquiries are read by the people who would do the work — not routed through a sales team.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section pt-0">
        <div className="shell grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <div className="card-dark p-6 sm:p-8">
              <h2 className="text-display-sm text-white">Send an enquiry</h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-mute-onDark">
                Fields marked <span className="text-brand-soft">*</span> are required. Nothing is shared with
                third parties.
              </p>
              <div className="mt-6">
                <Suspense fallback={<FormSkeleton />}>
                  <EnquiryForm source="CONTACT_PAGE" whatsapp={settings.whatsapp} />
                </Suspense>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-dark p-6 sm:p-7">
              <h2 className="text-[12px] font-bold uppercase tracking-[0.16em] text-white/60">
                Other ways to reach us
              </h2>
              <ul className="mt-5 space-y-4">
                {details.map((detail) => {
                  const Icon = detail.icon;
                  const content = (
                    <>
                      <span className="grid h-9 w-9 flex-none place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-brand-soft">
                        <Icon size={15} aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                          {detail.label}
                        </span>
                        <span className="mt-0.5 block text-[13.5px] text-white/85">{detail.value}</span>
                      </span>
                    </>
                  );
                  return (
                    <li key={detail.label}>
                      {detail.href ? (
                        <a
                          href={detail.href}
                          {...(detail.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          className="flex items-start gap-3 transition hover:opacity-80"
                        >
                          {content}
                        </a>
                      ) : (
                        <div className="flex items-start gap-3">{content}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
              {settings.serviceArea && (
                <p className="mt-5 border-t border-white/[0.07] pt-4 text-[12.5px] leading-relaxed text-white/65">
                  {settings.serviceArea}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-ink-soft p-6">
              <h2 className="text-[14.5px] font-semibold text-white">What happens next</h2>
              <ol className="mt-4 space-y-3">
                {[
                  'We read your enquiry and check whether we are a good fit.',
                  'You get a reply within one business day with questions or a call invite.',
                  'A 30-minute call to understand scope, timeline and budget.',
                  'A written proposal with fixed-fee scope and timeline.',
                ].map((step, i) => (
                  <li key={step} className="flex gap-3 text-[13px] leading-relaxed text-mute-onDark">
                    <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-brand/12 text-[10.5px] font-bold text-brand-soft">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="section border-t border-white/[0.07] bg-ink-soft/40">
          <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="eyebrow">
                <span className="dot" aria-hidden="true" />
                Before you ask
              </p>
              <h2 className="mt-4 text-display-md text-white">Common questions</h2>
              <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-mute-onDark">
                Timelines, pricing models and how we work — answered plainly.
              </p>
            </div>
            <Accordion items={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))} />
          </div>
        </section>
      )}
    </>
  );
}

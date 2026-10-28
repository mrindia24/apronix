'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { BUDGET_OPTIONS, SERVICE_OPTIONS, TIMELINE_OPTIONS } from '@/src/lib/validation';
import { useToast } from '@/src/components/ui/toast';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const SERVICE_LABELS: Record<string, string> = Object.fromEntries(
  SERVICE_OPTIONS.map((o) => [o.value, o.label]),
);

export function EnquiryForm({
  defaultService,
  source = 'CONTACT_PAGE',
  compact = false,
  whatsapp,
}: {
  defaultService?: string;
  source?: 'CONTACT_PAGE' | 'SERVICE_PAGE' | 'HOME_CTA' | 'FOOTER' | 'OTHER';
  compact?: boolean;
  whatsapp?: string | null;
}) {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const startedAt = useRef<number>(Date.now());
  const successRef = useRef<HTMLDivElement>(null);

  const queryService = searchParams.get('service');
  const initialService =
    defaultService ??
    (queryService && SERVICE_LABELS[queryService] ? queryService : '') ??
    '';

  // Put keyboard focus on the success panel so the outcome is announced.
  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setErrors({});
    setFormError(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      fullName: String(data.get('fullName') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      phone: String(data.get('phone') ?? '').trim(),
      company: String(data.get('company') ?? '').trim(),
      service: String(data.get('service') ?? ''),
      budget: String(data.get('budget') ?? ''),
      timeline: String(data.get('timeline') ?? ''),
      message: String(data.get('message') ?? '').trim(),
      consent: data.get('consent') === 'on' || data.get('consent') === 'true',
      website: String(data.get('website') ?? ''),
      source,
      landingPage: window.location.pathname + window.location.search,
      referrer: document.referrer || '',
      utmSource: searchParams.get('utm_source') ?? '',
      utmMedium: searchParams.get('utm_medium') ?? '',
      utmCampaign: searchParams.get('utm_campaign') ?? '',
      startedAt: startedAt.current,
      turnstileToken: String(data.get('cf-turnstile-response') ?? ''),
    };

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        reference?: string;
        errors?: Record<string, string>;
        message?: string;
      };

      if (!res.ok || !json.ok) {
        if (json.errors) {
          setErrors(json.errors);
          // Move focus to the first invalid control for keyboard/screen reader users
          const firstKey = Object.keys(json.errors)[0];
          if (firstKey) {
            const el = form.querySelector<HTMLElement>(`[name="${firstKey}"]`);
            el?.focus();
          }
        }
        setFormError(json.message ?? 'We could not send your enquiry. Please check the form and try again.');
        setStatus('error');
        toast({ kind: 'error', title: 'Enquiry not sent', description: json.message });
        return;
      }

      setReference(json.reference ?? null);
      setStatus('success');
      form.reset();
      startedAt.current = Date.now();
      toast({ kind: 'success', title: 'Enquiry sent', description: 'We will reply within one business day.' });
    } catch {
      setStatus('error');
      setFormError(
        'We could not reach the server. Please check your connection and try again — or email us directly.',
      );
      toast({ kind: 'error', title: 'Network error', description: 'Please try again in a moment.' });
    }
  }

  if (status === 'success') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-[#1F6F43]/40 bg-[#0C1F16] p-6 outline-none"
      >
        <CheckCircle2 size={22} className="text-[#4ADE80]" aria-hidden="true" />
        <h3 className="mt-3 text-[17px] font-semibold text-white">Thanks — your enquiry is with us.</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-white/70">
          We have saved your details and will reply within one business day.
          {reference && (
            <>
              {' '}
              Your reference is <span className="font-mono text-white">{reference}</span>.
            </>
          )}
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus('idle');
            setReference(null);
          }}
          className="mt-5 text-[13px] font-semibold text-brand-soft underline decoration-brand/40 underline-offset-4 hover:text-white"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  const submitting = status === 'submitting';
  const fieldClass = (name: string) =>
    cn(
      'h-11 w-full rounded-xl border bg-ink px-3.5 text-[14px] text-white placeholder:text-white/30 transition focus:outline-none focus:ring-2 focus:ring-brand/60',
      errors[name] ? 'border-brand' : 'border-white/12 hover:border-white/20',
    );

  return (
    <form onSubmit={onSubmit} noValidate className={cn('space-y-4', compact && 'space-y-3.5')}>
      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-brand/40 bg-brand/[0.08] px-4 py-3 text-[13px] leading-relaxed text-white/90"
        >
          <AlertCircle size={15} className="mt-0.5 flex-none text-brand-soft" aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-[12.5px] font-medium text-white/80">
            Full name <span className="text-brand-soft">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            placeholder="Your name"
            className={fieldClass('fullName')}
          />
          {errors.fullName && (
            <p id="fullName-error" className="mt-1.5 text-[12px] text-brand-soft">
              {errors.fullName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-[12.5px] font-medium text-white/80">
            Business email <span className="text-brand-soft">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            placeholder="you@company.com"
            className={fieldClass('email')}
          />
          {errors.email && (
            <p id="email-error" className="mt-1.5 text-[12px] text-brand-soft">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-[12.5px] font-medium text-white/80">
            Phone with country code <span className="text-brand-soft">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            placeholder="+91 98765 43210"
            className={fieldClass('phone')}
          />
          {errors.phone && (
            <p id="phone-error" className="mt-1.5 text-[12px] text-brand-soft">
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="company" className="mb-1.5 block text-[12.5px] font-medium text-white/80">
            Company / brand
          </label>
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            placeholder="Optional"
            className={fieldClass('company')}
          />
        </div>

        <div>
          <label htmlFor="service" className="mb-1.5 block text-[12.5px] font-medium text-white/80">
            Service required <span className="text-brand-soft">*</span>
          </label>
          <select
            id="service"
            name="service"
            required
            defaultValue={initialService}
            aria-invalid={Boolean(errors.service)}
            aria-describedby={errors.service ? 'service-error' : undefined}
            className={cn(fieldClass('service'), 'pr-8')}
          >
            <option value="">Select a service</option>
            {SERVICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.service && (
            <p id="service-error" className="mt-1.5 text-[12px] text-brand-soft">
              {errors.service}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="budget" className="mb-1.5 block text-[12.5px] font-medium text-white/80">
            Approximate budget
          </label>
          <select id="budget" name="budget" defaultValue="" className={cn(fieldClass('budget'), 'pr-9')}>
            <option value="">Select a range</option>
            {BUDGET_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="timeline" className="mb-1.5 block text-[12.5px] font-medium text-white/80">
            Project timeline
          </label>
          <select id="timeline" name="timeline" defaultValue="" className={cn(fieldClass('timeline'), 'pr-9')}>
            <option value="">Select a timeline</option>
            {TIMELINE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-[12.5px] font-medium text-white/80">
          What are you working on? <span className="text-brand-soft">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={compact ? 3 : 4}
          required
          minLength={20}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'message-error' : 'message-hint'}
          placeholder="A few sentences about your business, your goals and what is not working right now."
          className={cn(
            'w-full rounded-xl border bg-ink px-3.5 py-3 text-[14px] leading-relaxed text-white placeholder:text-white/30 transition focus:outline-none focus:ring-2 focus:ring-brand/60',
            errors.message ? 'border-brand' : 'border-white/12 hover:border-white/20',
          )}
        />
        {errors.message ? (
          <p id="message-error" className="mt-1.5 text-[12px] text-brand-soft">
            {errors.message}
          </p>
        ) : (
          <p id="message-hint" className="mt-1.5 text-[11.5px] text-white/60">
            Please avoid sharing passwords or sensitive account details.
          </p>
        )}
      </div>

      {/* honeypot: hidden from real users, tempting to bots */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="consent" className="flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-relaxed text-white/70">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? 'consent-error' : undefined}
            className="mt-0.5 h-4 w-4 flex-none cursor-pointer rounded border-white/30 bg-ink accent-brand"
          />
          <span>
            I agree to Apronix Tech storing these details to respond to my enquiry, as described in the{' '}
            <a href="/privacy-policy" className="text-white underline decoration-white/30 underline-offset-2 hover:decoration-brand">
              privacy policy
            </a>
            . <span className="text-brand-soft">*</span>
          </span>
        </label>
        {errors.consent && (
          <p id="consent-error" className="mt-1.5 text-[12px] text-brand-soft">
            {errors.consent}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 text-[14px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              <Send size={15} aria-hidden="true" />
              Send enquiry
            </>
          )}
        </button>
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-[13.5px] font-semibold text-white transition hover:bg-white/[0.07]"
          >
            Or message on WhatsApp
          </a>
        )}
      </div>
      <p className="text-[11.5px] text-white/60">
        We reply within one business day. Your details are never sold or shared.
      </p>
    </form>
  );
}

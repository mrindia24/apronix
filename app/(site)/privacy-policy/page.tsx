import type { Metadata } from 'next';
import { Breadcrumbs } from '@/src/components/site/breadcrumbs';
import { getSiteSettings } from '@/src/lib/settings';
import { buildMetadata } from '@/src/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy — Apronix Tech',
  description:
    'How Apronix Tech collects, uses and protects personal information submitted through this website, including enquiry details, cookies and analytics.',
  path: '/privacy-policy',
});

const SECTIONS = [
  {
    title: 'Who we are',
    body: [
      'This website is operated by Apronix Tech, a digital agency providing social media management, Shopify development and WordPress development services. References to “we”, “us” and “our” refer to Apronix Tech.',
      'For privacy questions, or to exercise any right described in this policy, contact us using the details at the bottom of this page.',
    ],
  },
  {
    title: 'What we collect',
    body: [
      'Information you give us: your name, business email address, phone number, company name, the service you are interested in, an approximate budget range, your project timeline and the message you write in the enquiry form.',
      'Information collected automatically: the page you were on when you submitted an enquiry, the referring page, campaign parameters in the URL (UTM values), and a hashed version of your IP address used only for spam prevention and rate limiting. We do not store your raw IP address in the lead record.',
      'Website settings and admin accounts: if you are a member of staff using the admin dashboard, we store your name, email address, a securely hashed password and session records.',
    ],
  },
  {
    title: 'Why we use it',
    body: [
      'To respond to your enquiry and discuss a potential project.',
      'To keep the website secure, prevent spam and abuse, and rate-limit form submissions.',
      'To understand which pages and articles are useful, so we can improve them — only where you have consented to analytics.',
      'To maintain the content-management functions of the site (for example, publishing articles and portfolio projects).',
    ],
  },
  {
    title: 'Legal bases',
    body: [
      'Where data protection law requires a legal basis, we rely on: legitimate interests (responding to business enquiries and securing the website), consent (analytics cookies where used), and contract (delivering services you have engaged us for).',
    ],
  },
  {
    title: 'Cookies and analytics',
    body: [
      'This site uses a small number of essential cookies: a session cookie for administrators signing into the dashboard, and a local storage entry recording your analytics preference.',
      'Analytics is only loaded after you explicitly accept it, and only if an analytics integration has been configured. If you decline, or if no analytics provider is configured, no analytics scripts are loaded at all.',
      'You can clear your preference at any time by clearing site data in your browser.',
    ],
  },
  {
    title: 'Who we share it with',
    body: [
      'We do not sell personal information. We share it only with service providers who help us operate: our email provider (to deliver enquiry notifications and acknowledgements), our hosting provider, and — where configured — our media storage provider.',
      'These providers process data on our instructions. Where analytics is enabled with your consent, the analytics provider receives privacy-limited usage data.',
    ],
  },
  {
    title: 'How long we keep it',
    body: [
      'Enquiry records are retained while the enquiry is active and, afterwards, for as long as needed to maintain a record of our business communications — typically up to 24 months. You can ask us to delete your enquiry at any time.',
      'Administrator session records are deleted when they expire or when an administrator signs out.',
    ],
  },
  {
    title: 'Your rights',
    body: [
      'Depending on where you live, you may have the right to access, correct, delete or restrict the use of your personal information, to object to processing, or to request a portable copy of the data you provided.',
      'To make a request, email us using the address below. We may need to verify your identity before responding. We aim to respond within 30 days.',
    ],
  },
  {
    title: 'Security',
    body: [
      'We use hashed passwords, HTTP-only session cookies, encrypted connections (HTTPS), server-side validation, rate limiting and access controls to protect information. No system is completely secure, but we take these measures seriously and review them as the site evolves.',
    ],
  },
  {
    title: 'Children',
    body: [
      'This website is intended for businesses and is not directed at children. We do not knowingly collect personal information from children.',
    ],
  },
  {
    title: 'Changes to this policy',
    body: [
      'We may update this policy as our services or legal obligations change. The date at the top of this page shows when it was last revised.',
    ],
  },
];

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();
  const updated = '28 October 2026';

  return (
    <div className="paper">
      <div className="shell max-w-3xl py-14 sm:py-20">
        <Breadcrumbs
          tone="light"
          items={[
            { name: 'Home', href: '/' },
            { name: 'Privacy Policy', href: '/privacy-policy' },
          ]}
        />
        <h1 className="mt-8 text-display-md text-ink">Privacy Policy</h1>
        <p className="mt-3 text-[13.5px] text-mute-onLight">Last updated: {updated}</p>
        <p className="mt-6 text-[16px] leading-relaxed text-mute-onLight">
          This policy explains what information Apronix Tech collects through this website, why we
          collect it and what rights you have over it. It is written to be read, not to be scrolled past.
        </p>

        <div className="mt-10 space-y-9">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-ink">{section.title}</h2>
              {section.body.map((paragraph, i) => (
                <p key={i} className="mt-3 text-[15px] leading-[1.75] text-mute-onLight">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <section>
            <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-ink">Contact us</h2>
            <p className="mt-3 text-[15px] leading-[1.75] text-mute-onLight">
              For any privacy question or request, email{' '}
              <a
                href={`mailto:${settings.email}`}
                className="font-medium text-ink underline decoration-brand/50 underline-offset-2"
              >
                {settings.email}
              </a>
              {settings.phone ? ` or call ${settings.phone}` : ''}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

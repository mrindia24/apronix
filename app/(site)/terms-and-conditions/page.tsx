import type { Metadata } from 'next';
import { Breadcrumbs } from '@/src/components/site/breadcrumbs';
import { getSiteSettings } from '@/src/lib/settings';
import { buildMetadata } from '@/src/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Terms & Conditions — Apronix Tech',
  description:
    'The terms that apply to using the Apronix Tech website, including enquiries, project proposals, intellectual property and limitations of liability.',
  path: '/terms-and-conditions',
});

const SECTIONS = [
  {
    title: 'Using this website',
    body: [
      'By using this website you agree to these terms. If you do not agree with them, please do not use the site.',
      'We may update the site, its content and these terms at any time. The date at the top of this page shows the latest revision.',
    ],
  },
  {
    title: 'What this website is',
    body: [
      'This site provides information about Apronix Tech and its services — social media management, Shopify development and WordPress development. It also publishes articles and project information.',
      'Nothing on this site constitutes a binding offer. Submitting an enquiry starts a conversation; it does not create a contract for services.',
    ],
  },
  {
    title: 'Enquiries and proposals',
    body: [
      'When you submit an enquiry, you confirm that the information you provide is accurate and that you are authorised to share it.',
      'Any proposal we send is valid for 30 days unless stated otherwise. Engagements begin once a written proposal has been accepted and any agreed deposit has been received.',
    ],
  },
  {
    title: 'Intellectual property',
    body: [
      'The design, text, graphics and code of this website belong to Apronix Tech unless stated otherwise. You may read, share links to and quote short excerpts of our articles with attribution.',
      'You may not copy substantial parts of this site, resell its content, or represent our work as your own.',
      'Project work delivered to clients is governed by the intellectual property terms in the relevant proposal or contract. Where a project page shows third-party brands or screenshots, those remain the property of their respective owners and are used with permission.',
    ],
  },
  {
    title: 'Acceptable use',
    body: [
      'You agree not to misuse this website: no attempts to gain unauthorised access, no automated scraping that degrades service, no uploading of malicious code, and no submitting of false or misleading enquiries.',
      'We may restrict access to the site or the enquiry form where we reasonably believe these terms have been breached.',
    ],
  },
  {
    title: 'No guarantees of results',
    body: [
      'Digital marketing and website performance depend on many factors outside our control, including market conditions, competition, search-engine algorithms and platform policies.',
      'We do not guarantee specific search rankings, traffic volumes, follower counts, conversion rates or revenue outcomes. Anything we describe as an approach is a description of method, not a promise of a particular result.',
    ],
  },
  {
    title: 'Third-party links and services',
    body: [
      'This site may link to third-party websites, tools or platforms. We are not responsible for their content, availability or privacy practices. Using a third-party service is subject to that provider’s own terms.',
    ],
  },
  {
    title: 'Availability',
    body: [
      'We aim to keep this website available and accurate, but we do not warrant uninterrupted access. The site may be unavailable during maintenance or because of events outside our control.',
    ],
  },
  {
    title: 'Limitation of liability',
    body: [
      'To the extent permitted by law, Apronix Tech is not liable for indirect or consequential loss arising from your use of this website, or from reliance on its general information.',
      'Nothing in these terms limits liability for fraud, death or personal injury caused by negligence, or any other liability that cannot lawfully be excluded.',
    ],
  },
  {
    title: 'Governing law',
    body: [
      'These terms are governed by the laws of India. Any dispute will be subject to the exclusive jurisdiction of the courts at the location of Apronix Tech’s registered office, as stated in the engagement contract.',
    ],
  },
];

export default async function TermsPage() {
  const settings = await getSiteSettings();
  const updated = '28 October 2026';

  return (
    <div className="paper">
      <div className="shell max-w-3xl py-14 sm:py-20">
        <Breadcrumbs
          tone="light"
          items={[
            { name: 'Home', href: '/' },
            { name: 'Terms & Conditions', href: '/terms-and-conditions' },
          ]}
        />
        <h1 className="mt-8 text-display-md text-ink">Terms &amp; Conditions</h1>
        <p className="mt-3 text-[13.5px] text-mute-onLight">Last updated: {updated}</p>
        <p className="mt-6 text-[16px] leading-relaxed text-mute-onLight">
          These terms apply to your use of the Apronix Tech website. Terms for a specific project are set
          out in the written proposal or contract for that engagement, which takes precedence.
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
            <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-ink">Questions</h2>
            <p className="mt-3 text-[15px] leading-[1.75] text-mute-onLight">
              If anything here is unclear, email{' '}
              <a
                href={`mailto:${settings.email}`}
                className="font-medium text-ink underline decoration-brand/50 underline-offset-2"
              >
                {settings.email}
              </a>{' '}
              before relying on any part of it.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

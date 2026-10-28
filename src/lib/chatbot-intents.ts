import type { ChatKnowledge } from '@/src/lib/chatbot';

/**
 * Intent matching for the site assistant.
 *
 * Deliberately keyword/score based rather than a generative model: no API key,
 * no per-message cost, no latency, and — most importantly — no way for the bot
 * to make something up. Answers are assembled verbatim from the knowledge base,
 * and anything unmatched returns an explicit "ask a human" response.
 */

export type ChatIntent =
  | 'greeting'
  | 'services'
  | 'service-detail'
  | 'work'
  | 'pricing'
  | 'contact'
  | 'hours'
  | 'process'
  | 'timeline'
  | 'about'
  | 'thanks'
  | 'fallback';

export type ChatAnswer = {
  intent: ChatIntent;
  text: string;
  /** Suggested follow-up chips. */
  chips?: string[];
  /** Optional deep links rendered as buttons. */
  links?: { label: string; href: string }[];
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

/** Multi-word phrase containment check against the normalised message. */
const GROUPS: Record<string, string[]> = {
  service: ['service', 'services', 'offer', 'do you do', 'what do you do', 'capabilities'],
  work: ['work', 'portfolio', 'project', 'projects', 'case study', 'case studies', 'examples', 'clients'],
  // note: timeline is tested before work, so "how long does a project take"
  // resolves to the FAQ answer rather than the portfolio pitch
  pricing: ['price', 'pricing', 'cost', 'costs', 'budget', 'quote', 'how much', 'rates', 'charge'],
  contact: ['contact', 'email', 'phone', 'call', 'reach', 'talk', 'enquiry', 'enquire', 'get in touch', 'consultation', 'book'],
  hours: ['hours', 'open', 'available', 'timing', 'time zone', 'when are you'],
  process: ['process', 'how do you work', 'steps', 'what happens', 'onboard', 'start'],
  timeline: ['how long', 'timeline', 'duration', 'turnaround', 'weeks', 'deadline'],
  about: ['about', 'who are you', 'team', 'company', 'agency', 'where are you'],
  outside: ['seo', 'ppc', 'ads', 'adwords', 'google ads', 'meta ads', 'logo design', 'branding', 'app development',
    'mobile app', 'copywriting only', 'photography', 'video production', 'email marketing', 'influencer'],
  industry: ['dental', 'dentist', 'clinic', 'restaurant', 'salon', 'law firm', 'school', 'college', 'real estate',
    'healthcare', 'fintech', 'crypto', 'gambling'],
  thanks: ['thanks', 'thank you', 'cheers', 'great', 'perfect', 'ok', 'okay'],
  greeting: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'namaste'],
};

function has(text: string, keys: string[]): boolean {
  return keys.some((k) => text.includes(k));
}

function findService(text: string, services: ChatKnowledge['services']) {
  const t = norm(text);
  return services.find((s) => {
    const name = norm(s.name);
    const short = norm(s.shortName);
    if (t.includes(short)) return true;
    if (t.includes(name)) return true;
    // handle common synonyms
    if (short.includes('shopify') && /\bshopify\b|\becommerce\b|\bstore\b|\bwoocommerce\b/.test(t)) return true;
    if (short.includes('wordpress') && /\bwordpress\b|\bwp\b|\bcms\b|\bwebsite\b|\bweb site\b|\bsite\b/.test(t)) return true;
    if (short.includes('social') && /\bsocial\b|\binstagram\b|\bcontent\b|\breels\b|\blinkedin\b/.test(t)) return true;
    return false;
  });
}

const chip = (label: string): string => label;

export function answer(message: string, kb: ChatKnowledge): ChatAnswer {
  const t = norm(message);
  const words = t.split(' ');
  void words;

  // --- specific service asked about -----------------------------------------
  const service = findService(message, kb.services);
  if (service && t.split(' ').length > 1) {
    const highlights = service.highlights.length
      ? `\n\nIt covers: ${service.highlights.join(' · ')}.`
      : '';
    return {
      intent: 'service-detail',
      text: `${service.name} — ${service.summary}${highlights}`,
      links: [
        { label: `Read the ${service.shortName} page`, href: `/services/${service.slug}` },
        { label: 'Get a quote', href: `/contact?service=${service.shortName}` },
      ],
      chips: [chip('What does it cost?'), chip('Show me your work')],
    };
  }

  // --- out-of-scope guard ---------------------------------------------------
  // If the message names something we genuinely do not offer, or a specific
  // industry we have no answer for, say so rather than reciting the service list.
  const mentionsOutside = has(t, GROUPS.outside);
  // Match plurals/inflections too: "dentists" → "dentist", "clinics" → "clinic".
  const industryWord = t
    .split(' ')
    .find((w) => GROUPS.industry.some((i) => w === i || w === `${i}s` || w === `${i}es` || w.startsWith(i)));
  const mentionsIndustry = Boolean(industryWord);
  if (mentionsOutside || mentionsIndustry) {
    const line = industryWord
      ? `I can't tell you how we'd approach ${industryWord} work specifically — I only describe what we publish.`
      : "That's outside what we publish, so I won't guess.";
    return {
      intent: 'fallback',
      text: `${line}\n\nWe focus on three things: social media management, Shopify development and WordPress development. For anything beyond that, a person can answer properly.`,
      links: [
        { label: 'Ask a person', href: '/contact' },
        { label: 'Browse services', href: '/services' },
      ],
      chips: [chip('What services do you offer?'), chip('How do I contact you?')],
    };
  }

  // --- services overview ----------------------------------------------------
  if (has(t, GROUPS.service) || t.includes('what do you do')) {
    const list = kb.services
      .map((s) => `• ${s.shortName} — ${s.tagline || s.summary}`)
      .join('\n');
    return {
      intent: 'services',
      text: `We run three service lines:\n\n${list}\n\nAsk me about any one of them and I'll give you the detail.`,
      links: [{ label: 'Compare all services', href: '/services' }],
      chips: kb.services.slice(0, 3).map((s) => chip(s.shortName)),
    };
  }

  // --- pricing --------------------------------------------------------------
  if (has(t, GROUPS.pricing) || t.includes('how much')) {
    if (kb.plans.length) {
      const list = kb.plans
        .map((p) => `• ${p.name} — ${p.price}${p.priceNote ? ` ${p.priceNote}` : ''}`)
        .join('\n');
      const sample = kb.plans.some((p) => p.isSampleContent)
        ? '\n\nNote: these figures are currently placeholder data, not a quote.'
        : '';
      return {
        intent: 'pricing',
        text: `Published pricing:\n\n${list}${sample}\n\nEvery engagement is confirmed in writing after a short scoping call.`,
        links: [{ label: 'See the pricing page', href: '/pricing' }],
        chips: [chip('How long does a project take?'), chip('What do you need from us?')],
      };
    }
    return {
      intent: 'pricing',
      text:
        'Every quote follows a short scoping call — pricing depends on template count, catalogue size and integrations, so a number pulled out of thin air would not be useful to you.\n\nSend an enquiry describing what you need and you will get a clear fixed-fee scope.',
      links: [{ label: 'Start an enquiry', href: '/contact' }],
      chips: [chip('How long does a project take?'), chip('What do you need from us?')],
    };
  }

  // --- timeline -------------------------------------------------------------
  if (has(t, GROUPS.timeline) || t.includes('how long')) {
    const faq = kb.faqs.find((f) => /long|timeline|take/i.test(f.question));
    return {
      intent: 'timeline',
      text: faq
        ? faq.answer
        : 'Timelines depend on scope. A scoping call is the honest way to get a real answer — after it you get a written schedule with the fixed fee.',
      links: [{ label: 'Book a call', href: '/contact' }],
      chips: [chip('What does it cost?')],
    };
  }

  // --- portfolio ------------------------------------------------------------
  if (has(t, GROUPS.work)) {
    const featured = kb.projects.slice(0, 3);
    const list = featured.length
      ? `\n\n${featured.map((p) => `• ${p.title} (${p.categoryLabel})`).join('\n')}`
      : '';
    return {
      intent: 'work',
      text: `Selected work lives in the Work section — each entry shows the brief, the constraints and what was delivered.${list}\n\nNote that current portfolio entries are clearly labelled sample placeholders, not real client results.`,
      links: [{ label: 'See the work', href: '/work' }],
      chips: [chip('What services do you offer?'), chip('Can I see a specific project?')],
    };
  }

  // --- contact --------------------------------------------------------------
  if (has(t, GROUPS.contact)) {
    const c = kb.contact;
    const bits: string[] = [];
    if (c.email) bits.push(`Email: ${c.email}`);
    if (c.phone) bits.push(`Phone: ${c.phone}`);
    if (c.whatsapp) bits.push('WhatsApp: available from the contact page');
    bits.push(`Hours: ${c.businessHours}`);
    return {
      intent: 'contact',
      text: `The quickest route is the enquiry form — you will get a reply from a real person within one business day.\n\n${bits.join('\n')}`,
      links: [{ label: 'Open the contact form', href: '/contact' }],
      chips: [chip('What do you need from us?'), chip('What services do you offer?')],
    };
  }

  // --- hours ----------------------------------------------------------------
  if (has(t, GROUPS.hours)) {
    return {
      intent: 'hours',
      text: `We work ${kb.contact.businessHours}. ${kb.contact.serviceArea}`,
      links: [{ label: 'Contact us', href: '/contact' }],
      chips: [chip('How do I get in touch?')],
    };
  }

  // --- process --------------------------------------------------------------
  if (has(t, GROUPS.process)) {
    const faq = kb.faqs.find((f) => /start|process|begin/i.test(f.question));
    return {
      intent: 'process',
      text: faq
        ? faq.answer
        : 'It usually follows four steps: a short call to understand the goal, a written scope with fixed fees, the build or production itself, then launch and handover with documentation.',
      links: [{ label: 'Start an enquiry', href: '/contact' }],
      chips: [chip('How long does a project take?'), chip('What does it cost?')],
    };
  }

  // --- about ----------------------------------------------------------------
  if (has(t, GROUPS.about)) {
    return {
      intent: 'about',
      text: `Apronix Tech is a small digital agency working across social media management, Shopify development and WordPress development. ${kb.contact.serviceArea}`,
      links: [{ label: 'About Apronix Tech', href: '/about' }],
      chips: [chip('What services do you offer?'), chip('Show me your work')],
    };
  }

  // --- social niceties ------------------------------------------------------
  if (has(t, GROUPS.thanks)) {
    return {
      intent: 'thanks',
      text: 'Any time. If you want a human to look at your specific situation, the enquiry form reaches us directly.',
      links: [{ label: 'Contact', href: '/contact' }],
      chips: [chip('What services do you offer?'), chip('Show me your work')],
    };
  }
  if (t.split(' ').length <= 3 && has(t, GROUPS.greeting)) {
    return {
      intent: 'greeting',
      text: 'Hello — I can explain our services, point you at recent work, or help you get in touch. What would be useful?',
      chips: [chip('What services do you offer?'), chip('Show me your work'), chip('How do I contact you?')],
    };
  }


  // --- FAQ close match ------------------------------------------------------
  const faqHit = bestFaq(t, kb.faqs);
  if (faqHit) {
    return {
      intent: 'process',
      text: faqHit.answer,
      links: [{ label: 'Ask us directly', href: '/contact' }],
      chips: [chip('What services do you offer?'), chip('Show me your work')],
    };
  }

  // --- honest fallback ------------------------------------------------------
  return {
    intent: 'fallback',
    text: "I don't have an answer for that one — I only cover our services, work and how to reach us. A person can help with the rest.",
    links: [
      { label: 'Send an enquiry', href: '/contact' },
      { label: 'Browse services', href: '/services' },
    ],
    chips: [chip('What services do you offer?'), chip('Show me your work'), chip('How do I contact you?')],
  };
}

function bestFaq(t: string, faqs: ChatKnowledge['faqs']) {
  let best: ChatKnowledge['faqs'][number] | null = null;
  let bestScore = 0;
  for (const faq of faqs) {
    const q = norm(faq.question);
    const qWords = q.split(' ').filter((w) => w.length > 3);
    if (!qWords.length) continue;
    const hits = qWords.filter((w) => t.includes(w)).length;
    const score = hits / qWords.length;
    if (score > bestScore && score >= 0.5) {
      bestScore = score;
      best = faq;
    }
  }
  return best;
}

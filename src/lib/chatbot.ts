import 'server-only';
import { getServices, getProjects, getFaqs, getPricingPlans } from '@/src/lib/content';
import { getSiteSettings } from '@/src/lib/settings';
import type { ServiceRecord } from '@/src/lib/content';

/**
 * Chatbot knowledge base.
 *
 * Everything the assistant can say comes from this snapshot, which is assembled
 * from the same database rows the public pages render. That is the whole point:
 * the bot cannot invent a service, a client, a price or a result, because it has
 * nothing to invent from. Unmatched questions fall back to an explicit "I don't
 * know — here is a human" answer rather than a plausible guess.
 */
export type ChatService = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  summary: string;
  /** First-level deliverable group titles only — keeps answers short. */
  highlights: string[];
};

export type ChatProject = {
  slug: string;
  title: string;
  categoryLabel: string;
  shortDescription: string;
};

export type ChatFaq = { question: string; answer: string };

export type ChatPlan = {
  name: string;
  price: string;
  priceNote: string;
  highlighted: boolean;
  isSampleContent: boolean;
};

export type ChatKnowledge = {
  services: ChatService[];
  projects: ChatProject[];
  faqs: ChatFaq[];
  plans: ChatPlan[];
  contact: {
    email: string;
    phone: string;
    whatsapp: string | null;
    businessHours: string;
    serviceArea: string;
  };
};

function summarise(service: ServiceRecord): ChatService {
  const sections = service.sections ?? {};
  const highlights = (sections.deliverables ?? [])
    .map((group) => group.title)
    .filter(Boolean)
    .slice(0, 4);

  return {
    slug: service.slug,
    name: service.name,
    shortName: service.shortName,
    tagline: service.tagline,
    summary: service.summary,
    highlights,
  };
}

export async function getChatKnowledge(): Promise<ChatKnowledge> {
  const [services, projects, faqs, settings, plans] = await Promise.all([
    getServices(),
    getProjects(),
    getFaqs(null),
    getSiteSettings(),
    getPricingPlans(),
  ]);

  return {
    services: services.map(summarise),
    projects: projects.slice(0, 6).map((project) => ({
      slug: project.slug,
      title: project.title,
      categoryLabel: project.categoryLabel,
      shortDescription: project.shortDescription,
    })),
    faqs: faqs.map((faq) => ({ question: faq.question, answer: faq.answer })),
    plans: plans.map((plan) => ({
      name: plan.name,
      price: plan.price,
      priceNote: plan.priceNote,
      highlighted: plan.highlighted,
      isSampleContent: plan.isSampleContent,
    })),
    contact: {
      email: settings.email,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      businessHours: settings.businessHours,
      serviceArea: settings.serviceArea,
    },
  };
}

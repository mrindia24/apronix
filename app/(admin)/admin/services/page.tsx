import { prisma } from '@/src/lib/prisma';
import { AdminPageHeader, Card } from '@/src/components/admin/ui';
import { ServiceContentForm } from '@/src/components/admin/service-form';

export const dynamic = 'force-dynamic';

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { order: 'asc' } });

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Service content"
        description="Edit the copy shown on each service page. Hero text, problems, deliverables, benefits, FAQs and workflow are all editable — no code changes required."
      />

      <div className="space-y-4">
        {services.map((service) => (
          <ServiceContentForm
            key={service.id}
            service={{
              key: service.key,
              name: service.name,
              shortName: service.shortName,
              tagline: service.tagline,
              summary: service.summary,
              heroHeadline: service.heroHeadline,
              heroDescription: service.heroDescription,
              seoTitle: service.seoTitle,
              seoDescription: service.seoDescription,
              status: service.status,
              sections: JSON.stringify(service.sections, null, 2),
              slug: service.slug,
            }}
          />
        ))}
        {services.length === 0 && (
          <Card>
            <p className="text-[13px] text-white/65">
              No services found. Run <code className="rounded bg-white/10 px-1.5 py-0.5">npm run db:seed</code> to
              create the three core service records.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

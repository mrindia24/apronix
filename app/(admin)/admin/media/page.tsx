import { prisma } from '@/src/lib/prisma';
import { AdminPageHeader, Badge } from '@/src/components/admin/ui';
import { MediaManager } from '@/src/components/admin/media-manager';
import { features } from '@/src/lib/env';

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { uploadedBy: { select: { name: true } } },
  });

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Media library"
        description="Upload images for portfolio covers and article artwork. Raster images are automatically converted to WebP and capped at 2000px wide."
        action={
          <Badge tone={features.objectStorage ? 'success' : 'neutral'}>
            {features.objectStorage ? 'Object storage' : 'Local disk'}
          </Badge>
        }
      />
      <MediaManager
        assets={assets.map((asset) => ({
          id: asset.id,
          url: asset.url,
          alt: asset.alt ?? '',
          originalName: asset.originalName,
          sizeBytes: asset.sizeBytes,
          mimeType: asset.mimeType,
          width: asset.width,
          height: asset.height,
          storage: asset.storage,
          uploadedBy: asset.uploadedBy?.name ?? null,
          createdAt: asset.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}

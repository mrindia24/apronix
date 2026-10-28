import { NextResponse } from 'next/server';
import { requireUser } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import { MAX_UPLOAD_BYTES, storeImage } from '@/src/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/media — upload an image (ADMIN or above).
 * Type is verified from the file's magic bytes, not the client-supplied MIME.
 */
export async function POST(request: Request) {
  let user;
  try {
    user = await requireUser('ADMIN');
  } catch {
    return NextResponse.json({ ok: false, message: 'Not authorised.' }, { status: 401 });
  }

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ ok: false, message: 'Invalid origin.' }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, message: 'Expected a multipart upload.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: 'No file provided.' }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ ok: false, message: 'Maximum file size is 8 MB.' }, { status: 413 });
  }

  const alt = String(formData.get('alt') ?? '').slice(0, 200);
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const stored = await storeImage(buffer, file.name);

    const asset = await prisma.mediaAsset.create({
      data: {
        filename: stored.filename,
        originalName: file.name.slice(0, 200),
        url: stored.url,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        width: stored.width ?? null,
        height: stored.height ?? null,
        alt: alt || null,
        storage: stored.storage,
        uploadedById: user.id,
      },
    });

    return NextResponse.json({ ok: true, asset }, { status: 201 });
  } catch (error) {
    console.error('[media:upload]', error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Upload failed.' },
      { status: 400 },
    );
  }
}

/** GET — list media assets (used by the client picker). */
export async function GET() {
  try {
    await requireUser('EDITOR');
  } catch {
    return NextResponse.json({ ok: false, message: 'Not authorised.' }, { status: 401 });
  }
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  return NextResponse.json({ ok: true, assets });
}

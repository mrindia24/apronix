import 'server-only';
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { features, serverEnv } from '@/src/lib/env';
import { slugify } from '@/src/lib/utils';

/**
 * Media storage adapter.
 *
 * Local disk is the development default (`public/uploads`, served by Next).
 * When S3-compatible credentials are configured the same interface writes to
 * object storage instead — no application code changes required.
 */

export const ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml',
] as const;

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

export type StoredFile = {
  url: string;
  filename: string;
  storage: 'local' | 's3';
  sizeBytes: number;
  width?: number;
  height?: number;
  mimeType: string;
};

/** Magic-number sniffing so a renamed .exe cannot masquerade as a JPEG. */
export function sniffImageType(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return 'image/png';
  if (buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP')
    return 'image/webp';
  if (buffer.subarray(4, 12).toString() === 'ftypavif') return 'image/avif';
  const head = buffer.subarray(0, 200).toString('utf8');
  if (head.includes('<svg') || head.includes('<?xml')) return 'image/svg+xml';
  return null;
}

export async function storeImage(
  buffer: Buffer,
  originalName: string,
): Promise<StoredFile> {
  const sniffed = sniffImageType(buffer);
  if (!sniffed || !ALLOWED_MIME.includes(sniffed as (typeof ALLOWED_MIME)[number])) {
    throw new Error('Unsupported file type. Upload a JPEG, PNG, WebP, AVIF or SVG image.');
  }
  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error('File is larger than 8 MB. Please compress it first.');
  }

  const base = slugify(originalName.replace(/\.[^.]+$/, '')) || 'upload';
  const ext = sniffed === 'image/jpeg' ? 'jpg' : sniffed.split('/')[1]!.replace('svg+xml', 'svg');
  const filename = `${base}-${randomBytes(4).toString('hex')}.${ext}`;

  // Optimise raster images (never SVG — it is vector and untrusted script surface).
  let output = buffer;
  let width: number | undefined;
  let height: number | undefined;

  if (sniffed !== 'image/svg+xml') {
    try {
      const sharpModule = await import('sharp');
      const sharp = sharpModule.default;
      const image = sharp(buffer, { failOn: 'error' });
      const meta = await image.metadata();
      const maxWidth = 2000;
      const resized =
        meta.width && meta.width > maxWidth ? image.resize({ width: maxWidth, withoutEnlargement: true }) : image;
      output = await resized
        .rotate()
        .webp({ quality: 82, effort: 4 })
        .toBuffer();
      const outMeta = await sharp(output).metadata();
      width = outMeta.width;
      height = outMeta.height;
      // Recompute filename extension after conversion
      const webpName = filename.replace(/\.[^.]+$/, '.webp');
      return await persist(output, webpName, 'image/webp', width, height);
    } catch (error) {
      console.warn('[storage:optimise-skipped]', error instanceof Error ? error.message : error);
    }
  }

  return persist(output, filename, sniffed, width, height);
}

async function persist(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  width?: number,
  height?: number,
): Promise<StoredFile> {
  if (features.objectStorage) {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const client = new S3Client({
      region: serverEnv.s3Region,
      endpoint: serverEnv.s3Endpoint || undefined,
      credentials: {
        accessKeyId: serverEnv.s3AccessKeyId,
        secretAccessKey: serverEnv.s3SecretAccessKey,
      },
    });
    const key = `media/${filename}`;
    await client.send(
      new PutObjectCommand({
        Bucket: serverEnv.s3Bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
        ACL: 'public-read',
      }),
    );
    const base = serverEnv.s3PublicBaseUrl || `${serverEnv.s3Endpoint}/${serverEnv.s3Bucket}`;
    return {
      url: `${base.replace(/\/$/, '')}/${key}`,
      filename,
      storage: 's3',
      sizeBytes: buffer.byteLength,
      width,
      height,
      mimeType,
    };
  }

  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return {
    url: `/uploads/${filename}`,
    filename,
    storage: 'local',
    sizeBytes: buffer.byteLength,
    width,
    height,
    mimeType,
  };
}

export async function deleteLocalFile(url: string): Promise<void> {
  if (!url.startsWith('/uploads/')) return;
  const filePath = path.join(process.cwd(), 'public', url.replace(/^\//, ''));
  await unlink(filePath).catch(() => null);
}

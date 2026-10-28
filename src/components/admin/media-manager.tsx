'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Check, Copy, Loader2, Trash2, Upload } from 'lucide-react';
import { formatBytes, formatDate } from '@/src/lib/utils';
import { deleteMediaAction } from '@/src/lib/actions/settings';

type Asset = {
  id: string;
  url: string;
  alt: string;
  originalName: string;
  sizeBytes: number;
  mimeType: string;
  width: number | null;
  height: number | null;
  storage: string;
  uploadedBy: string | null;
  createdAt: string;
};

export function MediaManager({ assets }: { assets: Asset[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alt, setAlt] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt', alt);
      try {
        const res = await fetch('/api/admin/media', { method: 'POST', body: formData });
        const json = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
        if (!res.ok || !json.ok) {
          setError(json.message ?? `Could not upload ${file.name}.`);
        }
      } catch {
        setError('Upload failed — check your connection and try again.');
      }
    }

    setUploading(false);
    setAlt('');
    if (inputRef.current) inputRef.current.value = '';
    router.refresh();
  }

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setError('Could not copy — your browser blocked clipboard access.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-dashed border-white/15 bg-ink-soft p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="alt" className="mb-1.5 block text-[12px] font-medium text-white/70">
              Alt text (optional, can be set per usage)
            </label>
            <input
              id="alt"
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              placeholder="Describe the image for screen readers"
              className="h-10 w-full rounded-lg border border-white/12 bg-ink px-3 text-[13px] text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>
          <div>
            <label htmlFor="file" className="sr-only">
              Choose images to upload
            </label>
            <input
              ref={inputRef}
              id="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
              multiple
              onChange={(event) => upload(event.target.files)}
              disabled={uploading}
              className="block w-full text-[12px] text-white/60 file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3.5 file:py-2 file:text-[12.5px] file:font-semibold file:text-white hover:file:bg-brand-dark"
            />
          </div>
          <div className="flex items-center gap-2 text-[11.5px] text-white/60">
            {uploading ? (
              <>
                <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                Uploading…
              </>
            ) : (
              <>
                <Upload size={13} aria-hidden="true" />
                JPEG, PNG, WebP, AVIF or SVG · max 8 MB
              </>
            )}
          </div>
        </div>
        {error && <p className="mt-3 text-[12px] text-brand-soft">{error}</p>}
      </div>

      {assets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/12 p-10 text-center">
          <p className="text-[14px] font-semibold text-white">No media yet</p>
          <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-white/65">
            Upload images above, then reference them from portfolio projects and blog articles.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <li key={asset.id} className="overflow-hidden rounded-xl border border-white/[0.08] bg-ink-soft">
              <div className="relative aspect-[16/10] bg-ink">
                {asset.mimeType === 'image/svg+xml' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.url} alt={asset.alt} className="h-full w-full object-contain p-4" />
                ) : (
                  <Image
                    src={asset.url}
                    alt={asset.alt || asset.originalName}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-[12.5px] font-medium text-white">{asset.originalName}</p>
                <p className="mt-0.5 text-[10.5px] text-white/60">
                  {formatBytes(asset.sizeBytes)}
                  {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ''} · {asset.storage} ·{' '}
                  {formatDate(asset.createdAt)}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => copy(asset.url)}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/12 px-2 py-1 text-[11px] text-white/70 transition hover:text-white"
                  >
                    {copied === asset.url ? (
                      <>
                        <Check size={10} aria-hidden="true" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={10} aria-hidden="true" /> Copy URL
                      </>
                    )}
                  </button>
                  <form action={deleteMediaAction}>
                    <input type="hidden" name="id" value={asset.id} />
                    <button
                      type="submit"
                      aria-label={`Delete ${asset.originalName}`}
                      className="grid h-6 w-6 place-items-center rounded-lg border border-white/12 text-white/60 transition hover:border-brand/40 hover:text-brand-soft"
                    >
                      <Trash2 size={10} />
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

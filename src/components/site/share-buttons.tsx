'use client';

import { useState } from 'react';
import { Check, Link2, Linkedin, Twitter } from 'lucide-react';

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5" aria-label="Share this article">
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className="grid h-11 w-11 place-items-center rounded-full border border-white/12 sm:h-9 sm:w-9 text-white/60 transition hover:border-white/30 hover:text-white"
      >
        <Twitter size={13} aria-hidden="true" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="grid h-11 w-11 place-items-center rounded-full border border-white/12 sm:h-9 sm:w-9 text-white/60 transition hover:border-white/30 hover:text-white"
      >
        <Linkedin size={13} aria-hidden="true" />
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Link copied' : 'Copy link'}
        className="grid h-11 w-11 place-items-center rounded-full border border-white/12 sm:h-9 sm:w-9 text-white/60 transition hover:border-white/30 hover:text-white"
      >
        {copied ? <Check size={13} className="text-brand-soft" aria-hidden="true" /> : <Link2 size={13} aria-hidden="true" />}
      </button>
    </div>
  );
}

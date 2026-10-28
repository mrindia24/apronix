'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, X, Info } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type ToastKind = 'success' | 'error' | 'info';
type Toast = { id: number; kind: ToastKind; title: string; description?: string };

const ToastContext = createContext<{
  toast: (input: { kind?: ToastKind; title: string; description?: string }) => void;
}>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const toast = useCallback(
    ({ kind = 'success', title, description }: { kind?: ToastKind; title: string; description?: string }) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((prev) => [...prev, { id, kind, title, description }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 6000);
    },
    [],
  );

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:px-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur',
              t.kind === 'success' && 'border-[#1F6F43]/40 bg-[#0C1F16]/95 text-white',
              t.kind === 'error' && 'border-brand/40 bg-[#1F0C0E]/95 text-white',
              t.kind === 'info' && 'border-white/15 bg-ink-soft/95 text-white',
            )}
          >
            <span className="mt-0.5 flex-none">
              {t.kind === 'success' && <CheckCircle2 size={18} className="text-[#4ADE80]" />}
              {t.kind === 'error' && <AlertTriangle size={18} className="text-brand-soft" />}
              {t.kind === 'info' && <Info size={18} className="text-white/70" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug">{t.title}</p>
              {t.description && <p className="mt-0.5 text-[13px] leading-snug text-white/70">{t.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="rounded p-1 text-white/65 transition hover:bg-white/10 hover:text-white"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Small helper: copies text to the clipboard and shows a toast. */
export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast({ title: 'Copied to clipboard' });
        } catch {
          toast({ kind: 'error', title: 'Could not copy', description: 'Your browser blocked clipboard access.' });
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1 text-[12px] font-medium text-white/80 transition hover:border-white/30 hover:text-white"
    >
      {copied ? 'Copied' : label}
    </button>
  );
}

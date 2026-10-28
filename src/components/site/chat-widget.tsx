'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Send, X } from 'lucide-react';
import { MascotAvatar } from '@/src/components/site/chat-mascot';
import { cn } from '@/src/lib/utils';

type Link = { label: string; href: string };
type Msg = {
  id: string;
  role: 'bot' | 'user';
  text: string;
  chips?: string[];
  links?: Link[];
};

const OPENER: Msg = {
  id: 'opener',
  role: 'bot',
  text: 'hii! I am Apri. I can explain our services, point you at recent work, or help you get in touch. What would you like to know?',
  chips: ['What services do you offer?', 'Show me your work', 'How do I contact you?'],
};

let seq = 0;
const nextId = () => `m${++seq}`;

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([OPENER]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Mascot choreography: arrives -> says hi -> hops. Then goes quiet for the
  // session so it never becomes a distraction on subsequent pages.
  const [arrived, setArrived] = useState(false);
  const [greeting, setGreeting] = useState(false);
  const [hopping, setHopping] = useState(false);
  const greetedOnce = useRef(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  // Remember what had focus before opening so we can restore it on close.
  const restoreFocus = useRef<HTMLElement | null>(null);

  const send = useCallback(
    async (raw: string) => {
      const message = raw.trim();
      if (!message || busy) return;

      setError(null);
      setBusy(true);
      setDraft('');
      setMessages((prev) => [...prev, { id: nextId(), role: 'user', text: message }]);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ message }),
        });
        const json = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          message?: string;
          reply?: { text: string; chips?: string[]; links?: Link[] };
        };

        if (!res.ok || !json.ok || !json.reply) {
          setError(json.message ?? 'Something went wrong. Please try again.');
          return;
        }
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'bot', text: json.reply!.text, chips: json.reply!.chips, links: json.reply!.links },
        ]);
      } catch {
        setError('Could not reach the server.');
      } finally {
        setBusy(false);
      }
    },
    [busy],
  );

  // Entrance: slide in, pause, say "hii" for a few seconds, hop, rest.
  useEffect(() => {
    if (!greetedOnce.current) {
      try {
        greetedOnce.current = sessionStorage.getItem('apri-greeted') === '1';
      } catch {
        greetedOnce.current = false;
      }
    }
    if (greetedOnce.current) {
      setArrived(true);
      return undefined;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setArrived(true);
      try {
        sessionStorage.setItem('apri-greeted', '1');
      } catch {
        /* storage blocked — greeting may repeat, which is harmless */
      }
      return undefined;
    }

    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setArrived(true), 700)); // enter the screen
    t.push(setTimeout(() => setGreeting(true), 1350)); // "hii"
    t.push(
      setTimeout(() => {
        setHopping(true);
        setTimeout(() => setHopping(false), 1000); // one full jump cycle
      }, 1900),
    );
    // Mark as greeted only once the bubble has actually been on screen.
    t.push(
      setTimeout(() => {
        greetedOnce.current = true;
        try {
          sessionStorage.setItem('apri-greeted', '1');
        } catch {
          /* ignore */
        }
      }, 1400),
    );
    t.push(setTimeout(() => setGreeting(false), 6000)); // bubble retires

    return () => t.forEach(clearTimeout);
  }, []);

  // Focus management: move focus into the panel on open, restore on close.
  useEffect(() => {
    if (open) {
      restoreFocus.current = document.activeElement as HTMLElement | null;
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
    restoreFocus.current?.focus?.();
    return undefined;
  }, [open]);

  // Escape closes the panel.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Keep the newest message in view.
  useEffect(() => {
    if (!open) return;
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, busy]);

  // Close when the route changes, so it never floats over a new page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const lastChips = [...messages].reverse().find((m) => m.role === 'bot' && m.chips?.length)?.chips;

  return (
    <>
      {/* Launcher */}
      {/* ---- mascot launcher ------------------------------------------------ */}
      {/* Speech bubble + mascot stack in normal flow, so they can never overlap. */}
      <div className="fixed bottom-4 right-3 z-[95] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        <div
          className={cn(
            'relative origin-bottom-right rounded-2xl rounded-br-sm border border-white/20 bg-brand px-4 py-2',
            'text-[14px] font-bold text-white shadow-[0_18px_40px_-14px_rgba(224,31,39,0.9)]',
            'transition-all duration-300',
            greeting && !open
              ? 'pointer-events-none translate-y-0 scale-100 opacity-100'
              : 'pointer-events-none hidden translate-y-1.5 scale-90 opacity-0',
          )}
          aria-hidden="true"
        >
          hii
          <span className="mascot-bubble-tail absolute -bottom-[5px] right-5 h-2.5 w-2.5 rotate-45 border-b border-r border-white/20 bg-brand" />
        </div>

        <button
          ref={fabRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="apronix-chat-panel"
          aria-label={open ? 'Close chat' : 'Open chat with Apri, our assistant'}
          className={cn(
            'group relative grid h-[74px] w-[74px] place-items-center rounded-full',
            'bg-[#0F1116] outline-none',
            'shadow-[0_18px_44px_-14px_rgba(224,31,39,0.7)]',
            'transition-transform duration-300 hover:scale-105',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-bright',
            // entrance: slides up from below the fold
            arrived ? 'mascot-arrive' : 'translate-y-24 opacity-0',
            hopping && !open && 'mascot-hop',
            open && 'scale-95',
          )}
        >
          {/* soft brand halo */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(255,48,56,0.35),transparent_70%)] opacity-70"
          />
          {open ? (
            <X size={22} className="relative text-white" aria-hidden="true" />
          ) : (
            <MascotAvatar height={60} className="relative" />
          )}
        </button>
      </div>

      {/* Panel */}
      <div
        ref={panelRef}
        id="apronix-chat-panel"
        role="dialog"
        aria-modal="false"
        aria-label="Apronix assistant"
        aria-hidden={!open}
        className={cn(
          'chat-glass fixed z-[96] flex-col overflow-hidden rounded-3xl border border-white/[0.16]',
          // `hidden` must be a class here: the `hidden` attribute is overridden
          // by any display utility, which would leave the closed panel focusable.
          open ? 'flex' : 'hidden',
          // Full-width sheet on phones, anchored card on larger screens
          'inset-x-3 bottom-[104px] max-h-[min(64vh,470px)] min-h-[240px]',
          'sm:inset-x-auto sm:right-6 sm:bottom-[112px] sm:max-h-[min(70vh,520px)] sm:w-[382px]',
        )}
      >
        {/* Header */}
        <div className="chat-glass-header flex items-center gap-3 border-b border-white/[0.10] px-4 py-3.5">
          <MascotAvatar height={34} className="flex-none" />
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold leading-tight text-white">Apronix Assistant</p>
            <p className="mt-0.5 text-[11.5px] leading-tight text-white/60">
              Answers about services, work and contact
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="grid h-9 w-9 flex-none place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>

        {/* Transcript */}
        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
          className="chat-glass-log flex-1 space-y-3 overflow-y-auto px-4 py-4"
        >
          {messages.map((m) => (
            <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[86%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                  m.role === 'user'
                    ? 'rounded-br-md bg-brand/95 text-white shadow-[0_6px_20px_-8px_rgba(224,31,39,0.8)]'
                    : 'chat-glass-bubble rounded-bl-md border border-white/[0.12] text-white/90',
                )}
              >
                {m.text}
                {m.links?.length ? (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {m.links.map((l) => (
                      <Link
                        key={l.href + l.label}
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="inline-flex min-h-[40px] items-center gap-1 rounded-full bg-brand px-3.5 text-[12px] font-semibold text-white transition hover:bg-brand-dark"
                      >
                        {l.label}
                        <ArrowUpRight size={12} aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex justify-start" aria-hidden="true">
              <div className="chat-glass-bubble rounded-2xl rounded-bl-md border border-white/[0.12] px-3.5 py-3">
                <span className="flex gap-1">
                  <span className="chat-dot h-1.5 w-1.5 rounded-full bg-white/50" />
                  <span className="chat-dot h-1.5 w-1.5 rounded-full bg-white/50" style={{ animationDelay: '0.15s' }} />
                  <span className="chat-dot h-1.5 w-1.5 rounded-full bg-white/50" style={{ animationDelay: '0.3s' }} />
                </span>
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="text-[12px] text-brand-soft">
              {error}
            </p>
          )}
        </div>

        {/* Suggested replies */}
        {lastChips?.length ? (
          <div className="flex flex-wrap gap-2 border-t border-white/[0.10] px-4 pb-1 pt-3">
            {lastChips.slice(0, 3).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => send(c)}
                disabled={busy}
                className="chat-glass-chip inline-flex min-h-[40px] items-center rounded-full border border-white/18 px-3.5 text-[12px] font-medium text-white/90 transition hover:border-white/35 hover:text-white disabled:opacity-50"
              >
                {c}
              </button>
            ))}
          </div>
        ) : null}

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
          className="chat-glass-composer flex items-end gap-2 border-t border-white/[0.10] p-3"
        >
          <label htmlFor="chat-input" className="sr-only">
            Type your question
          </label>
          <input
            id="chat-input"
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={500}
            autoComplete="off"
            placeholder="Ask about services, work…"
            className="h-11 min-w-0 flex-1 rounded-xl border border-white/18 bg-white/[0.07] px-3.5 text-[13px] text-white placeholder:text-white/55 backdrop-blur-sm focus:border-white/35 focus:bg-white/[0.10] focus:outline-none focus:ring-2 focus:ring-brand/70"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            aria-label="Send message"
            className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-brand text-white transition hover:bg-brand-dark disabled:opacity-45"
          >
            <Send size={16} aria-hidden="true" />
          </button>
        </form>

        <p className="border-t border-white/[0.08] px-4 py-2.5 text-center text-[11px] text-white/70">
          Automated answers from our published content · <Link href="/contact" className="inline-flex min-h-[24px] items-center underline hover:text-white">Talk to a person</Link>
        </p>
      </div>
    </>
  );
}

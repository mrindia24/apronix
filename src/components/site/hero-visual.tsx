import Image from 'next/image';

/**
 * Hero visual: a real device photograph with the live Apronix site composited
 * onto the laptop screen, and a phone showing the same site at mobile width.
 * The photography is licensed stock (see CREDITS.md) and the interface shown is
 * our own — nothing here depicts a client result.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[620px] select-none">
      {/* ambient red glow behind the devices */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-[40px] bg-[radial-gradient(65%_60%_at_55%_35%,rgba(255,48,56,0.26),transparent_72%)] blur-2xl"
      />

      {/* laptop photograph with the site on screen */}
      {/* 6:5 is close to the 1200×1100 source, so phones get no side-cropping */}
      <div className="relative aspect-[6/5] overflow-hidden rounded-[26px] border border-white/[0.10] bg-[#0B0D11] shadow-[0_60px_140px_-50px_rgba(0,0,0,0.95)] sm:aspect-auto">
        <Image
          src="/media/hero-mockup.jpg"
          alt="The Apronix Tech website displayed on a laptop in a dimly lit workspace"
          width={1200}
          height={1100}
          priority
          sizes="(max-width: 1024px) 92vw, 620px"
          className="h-full w-full object-cover object-center sm:h-auto sm:object-contain"
        />
        {/* keep the right edge inside the dark palette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[26px] ring-1 ring-inset ring-white/[0.06]"
        />
      </div>

      {/* floating credibility strip — factual, no metrics */}
      <div className="absolute -bottom-6 left-4 flex items-center gap-2 rounded-full border border-white/12 bg-[#0E1015]/95 px-3.5 py-2 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.95)] backdrop-blur sm:left-6">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-bright" aria-hidden="true" />
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/75">
          Social · Shopify · WordPress
        </span>
      </div>
    </div>
  );
}

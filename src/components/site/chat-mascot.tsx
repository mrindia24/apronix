/**
 * "Apri" — the Apronix chat mascot.
 *
 * A full-body chibi character: oversized head (the cute part), small torso,
 * mitten hands and stubby legs with feet. Inline SVG so it stays crisp at any
 * size, uses the brand palette, and animates with CSS only.
 *
 * The viewBox is 80×100 (4:5). Callers pass a `height`; width is derived so the
 * proportions never distort.
 *
 * Animation hooks (see globals.css):
 *   .mascot-body      — the whole figure, moves as one
 *   .mascot-shadow    — ground contact, squashes during the hop
 *   .mascot-antenna   — sways
 *   .mascot-arm-right — waves on arrival
 *   .mascot-eye       — blinks
 */
export function MascotAvatar({ height = 64, className }: { height?: number; className?: string }) {
  const width = Math.round((height * 80) / 100);

  return (
    <svg
      viewBox="0 0 80 100"
      width={width}
      height={height}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="apri-head" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#FF5A60" />
          <stop offset="52%" stopColor="#E01F27" />
          <stop offset="100%" stopColor="#B4141B" />
        </linearGradient>
        <linearGradient id="apri-torso" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#D01A22" />
          <stop offset="100%" stopColor="#A8121A" />
        </linearGradient>
        <radialGradient id="apri-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF3038" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FF3038" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ---- ground shadow (outside .mascot-body so it stays on the floor) ---- */}
      <ellipse className="mascot-shadow" cx="40" cy="94" rx="17" ry="3.4" fill="#000" opacity="0.45" />

      <g className="mascot-body">
        {/* ---- antenna (drawn first so the head covers its base) ---- */}
        <g className="mascot-antenna">
          <path d="M40 24 L40 11" stroke="#8E1116" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="40" cy="8" r="7" fill="url(#apri-glow)" />
          <circle cx="40" cy="8" r="3.6" fill="#FF3038" />
        </g>

        {/* ---- legs + feet ---- */}
        <g className="mascot-legs">
          <path d="M34 70 L34 85" stroke="#B4141B" strokeWidth="7" strokeLinecap="round" />
          <path d="M46 70 L46 85" stroke="#B4141B" strokeWidth="7" strokeLinecap="round" />
          <ellipse cx="33" cy="87.5" rx="6.4" ry="4" fill="#98101A" />
          <ellipse cx="47" cy="87.5" rx="6.4" ry="4" fill="#98101A" />
        </g>

        {/* ---- torso ---- */}
        <rect x="28" y="54" width="24" height="19" rx="9.5" fill="url(#apri-torso)" />
        <circle cx="40" cy="63.5" r="3" fill="#FF8A8D" opacity="0.5" />

        {/* ---- left arm + hand ---- */}
        <g className="mascot-arm-left">
          <path d="M30 59 q-7 5 -8.5 13" stroke="#B4141B" strokeWidth="6.4" strokeLinecap="round" fill="none" />
          <circle cx="20.5" cy="74" r="4.6" fill="#E01F27" />
        </g>

        {/* ---- right arm + hand (waving) ---- */}
        <g className="mascot-arm-right">
          <path d="M50 59 q7 5 8.5 13" stroke="#B4141B" strokeWidth="6.4" strokeLinecap="round" fill="none" />
          <circle cx="59.5" cy="74" r="4.6" fill="#E01F27" />
        </g>

        {/* ---- head ---- */}
        <rect x="14" y="18" width="52" height="43" rx="18" fill="url(#apri-head)" />
        <path
          d="M23 29 q9 -8 20 -7"
          stroke="#fff"
          strokeOpacity="0.38"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* ---- face ---- */}
        <g className="mascot-eye">
          <circle cx="28.5" cy="38.5" r="5.3" fill="#fff" />
          <circle cx="28.5" cy="39.2" r="2.6" fill="#17181C" />
        </g>
        <g className="mascot-eye">
          <circle cx="51.5" cy="38.5" r="5.3" fill="#fff" />
          <circle cx="51.5" cy="39.2" r="2.6" fill="#17181C" />
        </g>
        <circle cx="20.5" cy="47" r="2.9" fill="#FF8A8D" opacity="0.55" />
        <circle cx="59.5" cy="47" r="2.9" fill="#FF8A8D" opacity="0.55" />
        <path
          d="M33.5 48 q6.5 5.4 13 0"
          stroke="#5C0509"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

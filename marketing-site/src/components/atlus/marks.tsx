import type { ReactNode } from "react";

/* Hand-drawn globe "o" — meridian + latitudes, sized to sit inside a word */
export function GlobeO({ size = 72, stroke = "var(--color-platinum)" }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ display: "inline-block", verticalAlign: "baseline" }}>
      <circle cx="50" cy="50" r="44" fill="none" stroke={stroke} strokeWidth="6" />
      <ellipse cx="50" cy="50" rx="18" ry="44" fill="none" stroke={stroke} strokeWidth="4" />
      <path d="M8 38 Q 50 30 92 38" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M6 50 H 94" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M8 62 Q 50 70 92 62" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* Double, slightly-imperfect underline in amber.
   Every call site wraps this in a full-width absolutely-positioned span, so the
   underline tracks the word it sits under. A fixed pixel width would instead
   push past the viewport on small screens (a 520px underline on a 390px phone
   forced the whole page to scroll sideways), so size to the parent and cap at
   `w` for the wide case. */
export function DoubleUnderline({ w = 260, color = "var(--color-amber)" }: { w?: number; color?: string }) {
  return (
    <svg
      width="100%"
      height="22"
      viewBox="0 0 260 22"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: "block", maxWidth: w }}
    >
      <path
        d="M7 7 C64 11 143 2 253 8"
        fill="none"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M34 16 C99 20 180 11 236 15"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.72"
      />
    </svg>
  );
}

/* Curved arrow annotation — from the underlined word down to the caption */
export function CurvedArrow({ color = "var(--color-amber)" }: { color?: string }) {
  return (
    <svg width="70" height="86" viewBox="0 0 70 86" aria-hidden="true">
      <path
        d="M50 4 Q 20 20 22 68"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M22 68 L 10 56 M22 68 L 34 58" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* Sketchy double ellipse used to circle the caption */
export function SketchyEllipse({ children, color = "var(--color-amber)" }: { children: ReactNode; color?: string }) {
  return (
    <span className="relative inline-block px-6 py-3">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 400 140"
        preserveAspectRatio="none"
      >
        <ellipse cx="200" cy="70" rx="188" ry="58" fill="none" stroke={color} strokeWidth="3" transform="rotate(-3 200 70)" />
        <ellipse cx="200" cy="70" rx="180" ry="52" fill="none" stroke={color} strokeWidth="2.5" transform="rotate(-1 200 70)" opacity="0.75" />
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}

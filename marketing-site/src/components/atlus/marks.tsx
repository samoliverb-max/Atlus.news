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

/* Double, slightly-imperfect underline in amber */
export function DoubleUnderline({ w = 260, color = "var(--color-amber)" }: { w?: number; color?: string }) {
  return (
    <svg width={w} height="22" viewBox="0 0 260 22" aria-hidden="true">
      <path d="M4 8 Q 90 2 256 10" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path d="M6 16 Q 110 12 254 18" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" opacity="0.9" />
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

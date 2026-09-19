/**
 * ATLUS MOTION CONTROLS — start here when tuning the animations.
 * Times are seconds, distances are pixels. Keep normal scrolling native.
 * All effects automatically opt out for prefers-reduced-motion.
 * See docs/ANIMATION-GUIDE.md for examples and where each control is used.
 */
export const SCROLL_MOTION = {
  enabled: true, // false shows every section immediately.
  start: "top 88%", // Start when the element reaches 88% down the viewport.
  distance: 24, // How far headings / cards travel upward. Try 12 for subtler motion.
  mobileDistance: 14,
  duration: 0.75,
  ease: "power3.out", // Smooth deceleration; no bounce.
  columnStagger: 0.09, // Small delay between columns on desktop; zero on mobile.
  once: true, // false replays when scrolling back through a section.
  markers: false, // true displays GSAP's trigger guides for local tuning.
} as const;

export const HANDWRITING_MOTION = {
  enabled: true,
  start: "top 84%",
  delay: 0.22, // Lets a section heading arrive before its annotation writes in.
  letterDuration: 0.2, // Each real Reenie Beanie glyph is revealed left to right.
  letterStagger: 0.035, // Increase to slow the writing; decrease to speed it up.
  maxDuration: 1.7, // Caps long phrases so readers aren't kept waiting.
  ease: "power1.inOut",
  markDuration: 0.75, // Time to draw one underline / arrow stroke.
  markStagger: 0.12,
} as const;

export const HERO_MOTION = {
  playbackRate: 0.7, // A calmer pace: the full editorial sequence now takes about 5.3 seconds.
  title: { liftPercent: 18, duration: 0.8, stagger: 0.09, ease: "power3.out" },
  writing: { uAt: 0.5, signatureAt: 0.75, taglineAt: 0.8, signatureDuration: 0.65 },
  visibleThreshold: 0.25, // Fraction of the illustration visible before it starts.
  // Edit these poses to change the initial loose arrangement of the three cards.
  cardPoses: [
    { x: -44, y: 28, rotation: -9 },
    { x: 28, y: -18, rotation: 7 },
    { x: -20, y: -52, rotation: -5 },
  ],
  // Named beats in the editorial sequence. Overlap is deliberate.
  beats: {
    arrive: 0,
    select: 1.1,
    arrange: 1.3,
    frame: 1.4,
    masthead: 1.75,
    explain: 2.4,
    finish: 3.05,
    check: 3.3,
  },
} as const;

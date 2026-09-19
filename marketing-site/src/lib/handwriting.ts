import { gsap } from "gsap";
import { HANDWRITING_MOTION } from "./motion";

/**
 * The writing effect lives here. We reveal the ACTUAL font, not a replacement
 * SVG drawing, so changing the words never requires redrawing paths.
 * Negative vertical insets leave room for the font's tall and low strokes.
 * No DOM is inserted by GSAP: React owns the letters, including cleanup.
 */
export function writeHandwriting(
  timeline: gsap.core.Timeline,
  element: Element | null,
  at: number | string,
) {
  if (!element || !HANDWRITING_MOTION.enabled) return;
  const letters = element.querySelectorAll<HTMLElement>(".handwriting-letter");
  if (!letters.length) return;
  const stagger = Math.min(
    HANDWRITING_MOTION.letterStagger,
    Math.max(0, HANDWRITING_MOTION.maxDuration - HANDWRITING_MOTION.letterDuration) /
      Math.max(1, letters.length - 1),
  );
  timeline.fromTo(
    letters,
    { clipPath: "inset(-20% 100% -25% -8%)", opacity: 0 },
    {
      clipPath: "inset(-20% -12% -25% -8%)",
      opacity: 1,
      duration: HANDWRITING_MOTION.letterDuration,
      stagger,
      ease: HANDWRITING_MOTION.ease,
    },
    at,
  );
}

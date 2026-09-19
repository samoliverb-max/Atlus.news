import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { writeHandwriting } from "@/lib/handwriting";

/**
 * ANIMATED REENIE BEANIE — change `text` freely; letters update automatically.
 * Example: <Handwriting text="chosen for you." />
 * `mode="hero"` lets AnimatedHero own the timing; the default writes on scroll.
 * `delay={0.4}` overrides the scroll delay for just this phrase.
 * Layout is reserved from the first render. Screen readers get one intact phrase.
 */
export function Handwriting({
  text,
  className = "",
  style,
  mode = "scroll",
  delay,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
  mode?: "scroll" | "hero";
  delay?: number;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (mode === "hero" || !rootRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const element = rootRef.current;
    const timeline = gsap.timeline({ paused: true });
    writeHandwriting(timeline, element, delay ?? 0);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timeline.play();
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      timeline.revert();
    };
  }, [delay, mode, text]);

  return (
    <span
      ref={rootRef}
      className={`hand handwriting ${className}`}
      style={style}
      data-handwriting={mode}
      data-writing-delay={delay}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(/(\s+)/).map((word, wordIndex) =>
          /\s/.test(word) ? (
            <span key={wordIndex}>{word}</span>
          ) : (
            <span className="handwriting-word" key={wordIndex}>
              {Array.from(word).map((letter, letterIndex) => (
                <span className="handwriting-letter" key={letterIndex}>
                  {letter}
                </span>
              ))}
            </span>
          ),
        )}
      </span>
    </span>
  );
}

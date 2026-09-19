import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { Handwriting } from "./Handwriting";
import { writeHandwriting } from "@/lib/handwriting";
import { HERO_MOTION } from "@/lib/motion";

const stories = [
  {
    category: "Core",
    title: "The hidden life of cities",
    reason: "Follow what fascinates you.",
    topic: "Culture & society",
    number: "01",
  },
  {
    category: "Stretch",
    title: "What makes an economy grow?",
    reason: "Get closer to what you want to understand.",
    topic: "Economics",
    number: "02",
  },
  {
    category: "Discovery",
    title: "The ocean’s quiet architects",
    reason: "Find something you didn’t know you’d love.",
    topic: "The natural world",
    number: "03",
  },
];
const fragments = [
  "A changing world",
  "Ideas worth exploring",
  "Another point of view",
  "Science & discovery",
  "Beyond the headlines",
  "Culture & curiosity",
];

/** A finite editorial sequence: a world of stories becomes a small daily edit. */
export function AnimatedHero({ ctas }: { ctas: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current!;
    const stage = stageRef.current!;
    const media = gsap.matchMedia();

    // All readable content is rendered by React in its finished state. GSAP
    // enhances it only when motion is allowed, and restores it on unmount.
    media.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        if (context.conditions?.reduced) {
          root.dataset.motion = "reduced";
          return;
        }
        const select = gsap.utils.selector(root);
        // HERO WORDMARK: edit the overall speed and these entrance values in
        // src/lib/motion.ts. The timeline offsets below are seconds from load.
        const intro = gsap.timeline().timeScale(HERO_MOTION.playbackRate);
        intro.from(
          select(".hero-word"),
          {
            yPercent: HERO_MOTION.title.liftPercent,
            opacity: 0,
            duration: HERO_MOTION.title.duration,
            stagger: HERO_MOTION.title.stagger,
            ease: HERO_MOTION.title.ease,
          },
          0,
        );
        writeHandwriting(intro, root.querySelector(".hero-u"), HERO_MOTION.writing.uAt);
        writeHandwriting(
          intro,
          root.querySelector(".hero-tagline .handwriting"),
          HERO_MOTION.writing.taglineAt,
        );
        intro.fromTo(
          select(".hero-signature path"),
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            duration: HERO_MOTION.writing.signatureDuration,
            stagger: 0.12,
            ease: "power2.out",
          },
          HERO_MOTION.writing.signatureAt,
        );

        const cards = select(".edit-story");
        const noise = select(".story-fragment");
        const placements = HERO_MOTION.cardPoses;
        root.dataset.motion = "ready";
        const timeline = gsap.timeline({
          paused: true,
          onStart: () => {
            root.dataset.motion = "playing";
          },
          onComplete: () => {
            root.dataset.motion = "complete";
          },
        });
        timeline.timeScale(HERO_MOTION.playbackRate);
        timelineRef.current = timeline;
        // NAMED BEATS: move these in motion.ts to change when each phase starts.
        Object.entries(HERO_MOTION.beats).forEach(([name, time]) => timeline.addLabel(name, time));

        // 1. ARRIVE: fragments and three loose cards enter the scene.

        timeline.fromTo(
          noise,
          { opacity: 0, y: 22 },
          { opacity: 0.65, y: 0, duration: 0.65, stagger: 0.055, ease: "power2.out" },
          0,
        );
        cards.forEach((card, index) => {
          timeline.fromTo(
            card,
            { ...placements[index], opacity: 0, scale: 0.94 },
            { ...placements[index], opacity: 1, scale: 1, duration: 0.85, ease: "power3.out" },
            0.2 + index * 0.14,
          );
        });
        timeline.fromTo(
          select(".edit-thread"),
          { strokeDashoffset: 1, opacity: 0.65 },
          { strokeDashoffset: 0, opacity: 0.65, duration: 1.1, ease: "power2.inOut" },
          0.6,
        );
        // 2. SELECT: surrounding fragments leave; the chosen stories align.
        timeline.to(
          noise,
          { opacity: 0, y: -18, duration: 0.65, stagger: 0.035, ease: "power2.in" },
          "select",
        );
        timeline.fromTo(
          select(".edit-paper"),
          { opacity: 0, scale: 0.965 },
          { opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
          "frame",
        );
        timeline.to(
          cards,
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 1.25,
            stagger: 0.17,
            ease: "power3.inOut",
          },
          "arrange",
        );
        // 3. EXPLAIN: reveal the edition label, handwritten note and reasons.
        timeline.fromTo(
          select(".edit-masthead"),
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
          "masthead",
        );
        writeHandwriting(timeline, root.querySelector(".edit-for-you"), "masthead+=0.2");
        timeline.to(select(".edit-thread"), { opacity: 0, duration: 0.5 }, 2.2);
        timeline.fromTo(
          select(".story-reason"),
          { opacity: 0, y: 5 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.17, ease: "power2.out" },
          "explain",
        );
        // 4. FINISH: the check mark closes the sequence; nothing loops.
        timeline.fromTo(
          select(".edit-finish"),
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" },
          "finish",
        );
        timeline.fromTo(
          select(".edit-check"),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.4, ease: "power2.out" },
          "check",
        );

        // On small screens the illustration can sit below the fold. Begin its
        // story when it is visible, instead of finishing before the reader arrives.
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              timeline.play();
              observer.disconnect();
            }
          },
          { threshold: HERO_MOTION.visibleThreshold },
        );
        observer.observe(stage);
        return () => {
          observer.disconnect();
          timelineRef.current = null;
          delete root.dataset.motion;
        };
      },
      root,
    );
    return () => media.revert();
  }, []);

  return (
    <div ref={rootRef} className="atlus-hero-layout">
      <div className="hero-introduction">
        <p className="hero-eyebrow">A little perspective. Every day.</p>
        <h1 className="hero-title" aria-label="Join Atlus">
          <span className="hero-word hero-join" aria-hidden="true">
            Join
          </span>{" "}
          <span className="hero-word hero-atlus" aria-hidden="true">
            Atl
            <Handwriting text="u" mode="hero" className="hero-u" />s
            <svg className="hero-signature" viewBox="0 0 320 24" fill="none" aria-hidden="true">
              <path
                pathLength="1"
                strokeDasharray="1"
                d="M8 8 C78 13 174 2 312 8"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <path
                pathLength="1"
                strokeDasharray="1"
                d="M42 17 C116 21 218 11 294 15"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.72"
              />
            </svg>
          </span>
        </h1>
        <p className="hero-tagline">
          Daily news, <Handwriting text="personalised for you." mode="hero" />
        </p>
        <p className="hero-description">
          From a world of stories, a few worth your time.
          <br className="hero-desktop-break" /> Chosen to follow your interests — and widen them.
        </p>
        <div className="hero-actions">{ctas}</div>
        <p className="hero-footnote">Your curiosity. Your perspective. Your daily edit.</p>
      </div>

      <figure
        className="hero-edition"
        aria-label="An illustrative daily edit with a Core, Stretch and Discovery story"
      >
        <div ref={stageRef} className="edition-stage">
          <div className="edition-orbit" aria-hidden="true" />
          <div className="edition-orbit edition-orbit-inner" aria-hidden="true" />
          <div className="story-fragments" aria-hidden="true">
            {fragments.map((fragment, index) => (
              <div key={fragment} className={`story-fragment story-fragment-${index}`}>
                <span>{fragment}</span>
                <i />
                <i />
              </div>
            ))}
          </div>
          <svg className="edition-thread" viewBox="0 0 540 550" fill="none" aria-hidden="true">
            <path
              className="edit-thread"
              pathLength="1"
              strokeDasharray="1"
              d="M18 335 C-35 80 454 -28 499 189 C538 352 116 464 68 277 C32 126 367 148 498 375"
              stroke="var(--color-amber)"
              strokeWidth="1.5"
            />
          </svg>
          <div className="edit-paper" aria-hidden="true" />
          <div className="edit-masthead">
            <span className="edit-kicker">THE DAILY EDIT</span>
            <Handwriting text="made for you" mode="hero" className="edit-for-you" />
          </div>
          <div className="edition-stories">
            {stories.map((story) => (
              <article
                key={story.category}
                className={`edit-story edit-story-${story.category.toLowerCase()}`}
              >
                <div className="story-topline">
                  <span className="story-category">{story.category}</span>
                  <span className="story-topic">{story.topic}</span>
                </div>
                <h2>{story.title}</h2>
                <div className="story-baseline">
                  <p className="story-reason">{story.reason}</p>
                  <span className="story-number" aria-hidden="true">
                    {story.number}
                  </span>
                </div>
              </article>
            ))}
          </div>
          <div className="edit-finish">
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
              <path
                className="edit-check"
                pathLength="1"
                strokeDasharray="1"
                d="M3 10 L8 15 L17 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>A wider view. Then get on with your day.</span>
          </div>
        </div>
        <figcaption className="edition-caption">
          <span>An illustrative edition</span>
          <button
            className="hero-replay"
            type="button"
            onClick={() => timelineRef.current?.restart()}
            aria-label="Replay the daily edit animation"
          >
            <svg viewBox="0 0 20 20" width="15" height="15" fill="none" aria-hidden="true">
              <path
                d="M4 7a6 6 0 1 1-.2 5M4 3v4h4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Replay
          </button>
        </figcaption>
      </figure>
      <a className="hero-scroll-note" href="#how">
        <span>Good stories. A wider world.</span>
        <span aria-hidden="true">↓</span>
      </a>
    </div>
  );
}

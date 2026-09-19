import { AnimatedHero } from "./AnimatedHero";

/** The brand's editorial introduction and the daily-edit motion sequence. */
export function Hero15a() {
  return (
    <section className="atlus-hero" aria-label="Welcome to Atlus">
      <AnimatedHero
        ctas={
          <>
            <a href="#waitlist" className="hero-primary-cta">
              Join the waitlist <span aria-hidden="true">↗</span>
            </a>
            <a href="#how" className="hero-secondary-cta">
              How it works <span aria-hidden="true">↓</span>
            </a>
          </>
        }
      />
    </section>
  );
}

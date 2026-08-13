import { DoubleUnderline, CurvedArrow, SketchyEllipse } from "./marks";

/**
 * The winning 15a lockup, scaled responsively.
 * "Jo in Atlus" — Playfair 800 white, orange handwritten "u",
 * amber double underline, curved arrow to the handwritten slogan.
 */
export function Hero15a() {
  return (
    <section
      className="relative flex min-h-[88vh] w-full flex-col items-center justify-center overflow-hidden px-6 py-24"
      style={{ background: "var(--color-royal)", color: "var(--color-platinum)" }}
    >
      {/* faint grid of atlas-like meridians */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]">
        <defs>
          <pattern id="atlusGrid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M80 0 L0 0 0 80" fill="none" stroke="var(--color-platinum)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#atlusGrid)" />
      </svg>

      <div className="relative flex flex-col items-center text-center">
        <div className="relative inline-block">
          <h1
            className="text-[clamp(4.5rem,14vw,11rem)] leading-[0.95] tracking-tight"
            style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
          >
            <span>Jo</span>
            <span className="mx-[0.05em]">in</span>{" "}
            <span className="relative inline-block">
              <span>Atl</span>
              <span
                className="relative inline-block align-baseline"
                style={{
                  fontFamily: "var(--font-hand)",
                  color: "var(--color-amber)",
                  fontSize: "0.95em",
                  lineHeight: 1,
                  transform: "translateY(0.08em)",
                  padding: "0 0.02em",
                }}
              >
                u
              </span>
              <span>s</span>
              {/* amber double underline sits just under "Atlus" */}
              <span className="pointer-events-none absolute left-[6%] right-0 top-[92%] w-[92%]">
                <DoubleUnderline w={520} />
              </span>
            </span>
          </h1>
        </div>

        {/* Curved arrow + handwritten slogan, circled */}
        <div className="relative mt-16 flex flex-col items-center">
          <div className="mb-1 -ml-40">
            <CurvedArrow />
          </div>
          <SketchyEllipse>
            <span
              className="block px-2 text-[clamp(1.5rem,3vw,2.4rem)] leading-[1.1]"
              style={{
                fontFamily: "var(--font-hand)",
                color: "var(--color-amber)",
              }}
            >
              daily news,
              <br className="sm:hidden" /> personalised for you
            </span>
          </SketchyEllipse>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#waitlist"
            className="rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-transform hover:-translate-y-0.5"
            style={{
              background: "var(--color-amber)",
              color: "var(--color-royal)",
              fontFamily: "var(--font-serif)",
            }}
          >
            Join the waitlist
          </a>
          <a
            href="#how"
            className="rounded-full border px-6 py-3 text-sm tracking-wide transition-colors hover:bg-white/5"
            style={{
              borderColor: "rgba(248,249,250,0.35)",
              color: "var(--color-platinum)",
              fontFamily: "var(--font-serif)",
            }}
          >
            How it works
          </a>
        </div>
      </div>
    </section>
  );
}

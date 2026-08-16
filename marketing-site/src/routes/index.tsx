import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import type { ReactNode } from "react";
import { Hero15a } from "@/components/atlus/Hero15a";
import { SiteHeader, SiteFooter } from "@/components/atlus/SiteChrome";
import { DoubleUnderline, CurvedArrow } from "@/components/atlus/marks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atlus — daily news, personalised for you" },
      {
        name: "description",
        content:
          "Atlus is a small, deliberate daily paper. Personalisation that widens your view instead of narrowing it — never sold, never the feed.",
      },
      { property: "og:title", content: "Atlus — daily news, personalised for you" },
      {
        property: "og:description",
        content:
          "A handful of stories chosen for you each morning. Core, stretch and discovery — recommendations that widen your view.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="relative" style={{ background: "var(--color-platinum)", color: "var(--color-royal)" }}>
      <SiteHeader variant="dark" />
      <Hero15a />

      <Problem />
      <Solution />
      <Personalisation />
      <Discovery />
      <ReadingModes />
      <Trust />
      <WhyNow />
      <Waitlist />

      <SiteFooter />
    </div>
  );
}

/* ---------- shared bits ---------- */

function Section({
  id,
  eyebrow,
  title,
  children,
  bg,
  color,
}: {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  children: ReactNode;
  bg?: string;
  color?: string;
}) {
  // Bright amber only clears WCAG contrast on the royal ground. On the light
  // grounds rebind --color-amber to the darker ink here, so the eyebrow and every
  // <Handwritten> inside inherit a readable accent without each one knowing which
  // section it landed in.
  const onRoyal = (bg ?? "").includes("royal");
  return (
    <section
      id={id}
      className="px-6 py-24 sm:px-10 sm:py-32"
      style={{
        background: bg ?? "var(--color-platinum)",
        color: color ?? "var(--color-royal)",
        ...(onRoyal ? {} : { ["--color-amber" as string]: "var(--color-amber-ink)" }),
      }}
    >
      <div className="mx-auto max-w-5xl">
        {eyebrow && (
          <p
            className="mb-4 text-sm tracking-[0.25em]"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-amber)" }}
          >
            {eyebrow.toUpperCase()}
          </p>
        )}
        <h2
          className="mb-10 max-w-3xl text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.05] tracking-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          {title}
        </h2>
        <div className="text-lg leading-relaxed" style={{ fontFamily: "var(--font-serif)" }}>
          {children}
        </div>
      </div>
    </section>
  );
}

function Handwritten({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`hand ${className}`}
      style={{ color: "var(--color-amber)", fontSize: "1.35em", lineHeight: 1 }}
    >
      {children}
    </span>
  );
}

/* ---------- sections ---------- */

function Problem() {
  return (
    <Section
      eyebrow="The problem"
      title={
        <>
          The feed rewards the feed. <Handwritten>not you.</Handwritten>
        </>
      }
    >
      <div className="grid gap-10 sm:grid-cols-2">
        <p>
          44% of 18–24 year-olds now name social media as their main source of news. Depth has suffered in the move.
          Recommendation systems optimise for engagement, so understanding loses to outrage and the reader's field of view narrows.
        </p>
        <p>
          Infinite scrolling rewards compulsion. Serious journalism competes poorly with emotionally charged content.
          Many readers want to stay informed without surrendering hours to the feed — and today's tools do not let them.
        </p>
      </div>
    </Section>
  );
}

function Solution() {
  return (
    <Section
      id="how"
      eyebrow="The solution"
      title={
        <>
          A small, deliberate paper —{" "}
          <span className="relative inline-block">
            chosen for you.
            <span className="pointer-events-none absolute left-0 top-[92%] w-full">
              <DoubleUnderline w={520} />
            </span>
          </span>
        </>
      }
    >
      <p className="max-w-3xl">
        Atlus applies the same class of technology to a different end. Instead of engagement, the system optimises for
        curiosity, learning and perspective. A handful of stories, delivered each morning, each chosen to earn its place.
      </p>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {[
          {
            k: "Core",
            body: "Articles close to what you already care about — steady, familiar ground.",
            tone: "var(--color-royal)",
          },
          {
            k: "Stretch",
            body: "Pieces aimed at what you want to understand better — the goals you set at onboarding.",
            tone: "var(--color-amber)",
          },
          {
            k: "Discovery",
            body: "Perspectives and subjects from outside your usual media diet. Productive serendipity.",
            tone: "var(--color-royal)",
          },
        ].map((c) => (
          <div
            key={c.k}
            className="rounded-2xl border p-6"
            style={{ borderColor: "rgba(13,27,42,0.12)", background: "white" }}
          >
            <p
              className="mb-2 text-2xl"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: c.tone }}
            >
              {c.k}
            </p>
            <p className="text-base opacity-80" style={{ fontFamily: "var(--font-serif)" }}>
              {c.body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Personalisation() {
  return (
    <Section
      eyebrow="Personalisation"
      title={
        <>
          Three inputs. <Handwritten>one paper.</Handwritten>
        </>
      }
      bg="var(--color-royal)"
      color="var(--color-platinum)"
    >
      <div className="grid gap-10 sm:grid-cols-3">
        {[
          { k: "Preference", body: "What you naturally enjoy reading." },
          { k: "Goals", body: "What you want to understand better — balanced politics, AI without the hype, economics, climate policy." },
          { k: "Knowledge", body: "What you have already read. We avoid repetition and raise sophistication over time." },
        ].map((c, i) => (
          <div key={c.k}>
            <p
              className="mb-3 text-sm tracking-[0.25em] opacity-70"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              0{i + 1}
            </p>
            <p
              className="mb-3 text-3xl"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
            >
              {c.k}
            </p>
            <p className="opacity-80">{c.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-16 max-w-3xl text-lg opacity-80">
        Every assumption Atlus makes about you is visible in your web app. Adjust it by chatting with the model, or start
        the onboarding again. It is your picture — kept for you.
      </p>
    </Section>
  );
}

function Discovery() {
  return (
    <Section
      eyebrow="Intelligent discovery"
      title={
        <>
          Every story tells you <Handwritten>why it's here.</Handwritten>
        </>
      }
    >
      <div className="grid gap-12 sm:grid-cols-[1.1fr_1fr]">
        <p>
          Each recommendation carries a short explanation of why it was chosen — the interest it maps to, the goal it
          answers, or the corner of the world it introduces. No opaque ranking. No infinite scroll. Just a handful of
          reasons you can read and, if you disagree, correct.
        </p>

        <div
          className="relative rounded-2xl border p-6"
          style={{ borderColor: "rgba(13,27,42,0.12)", background: "white" }}
        >
          <p className="mb-2 text-xs uppercase tracking-widest" style={{ color: "var(--color-amber)" }}>
            Stretch · Economics
          </p>
          <p className="mb-3 text-xl" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
            The quiet re-writing of central-bank independence
          </p>
          <p className="text-sm opacity-70" style={{ fontFamily: "var(--font-serif)" }}>
            Why this? You said you wanted a firmer grasp of macroeconomics. This piece introduces the framework without
            assuming prior background — a longer read, but useful for the conversation later this week.
          </p>
        </div>
      </div>
    </Section>
  );
}

function ReadingModes() {
  const modes = [
    { name: "Light", count: "1", body: "One article. The one that matters most today." },
    { name: "Standard", count: "3", body: "A short paper. Core, stretch, and one to widen the view." },
    { name: "Deep", count: "5", body: "The longer walk. Five stories, deliberately paced." },
  ];
  return (
    <Section
      eyebrow="Reading modes"
      title={
        <>
          Choose how much you read. <Handwritten>then stop.</Handwritten>
        </>
      }
    >
      <div className="grid gap-6 sm:grid-cols-3">
        {modes.map((m) => (
          <div
            key={m.name}
            className="flex flex-col justify-between rounded-2xl p-8"
            style={{
              background: "var(--color-royal)",
              color: "var(--color-platinum)",
              minHeight: 260,
              // A royal card inside a light section: restore the bright accent the
              // surrounding section swapped out for its dark-on-light ink.
              ["--color-amber" as string]: "var(--amber)",
            }}
          >
            <div>
              <p
                className="text-6xl"
                style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-amber)" }}
              >
                {m.count}
              </p>
              <p className="mt-2 text-2xl" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
                {m.name}
              </p>
            </div>
            <p className="mt-6 text-sm opacity-80" style={{ fontFamily: "var(--font-serif)" }}>
              {m.body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Trust() {
  return (
    <Section
      eyebrow="Trust"
      title={
        <>
          Guarded twice —{" "}
          <Handwritten>what reaches you, and what you reveal.</Handwritten>
        </>
      }
      bg="#F1E9DE"
    >
      <div className="grid gap-10 sm:grid-cols-2">
        <div>
          <p className="mb-3 text-2xl" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
            What reaches you
          </p>
          <p>
            Editorial judgement runs through the recommendation system. Only a few stories clear the gate each morning.
            You are not the audience for everything published today — only for the pieces worth your attention.
          </p>
        </div>
        <div>
          <p className="mb-3 text-2xl" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
            What you reveal
          </p>
          <p>
            Your data is held for one purpose: better recommendations for you. It is never sold and never the product.
            You can see what we assume about you at any time — and change it.
          </p>
        </div>
      </div>
    </Section>
  );
}

function WhyNow() {
  return (
    <Section
      eyebrow="Why now"
      title={
        <>
          Readers are quietly leaving the feed.
        </>
      }
      bg="var(--color-royal)"
      color="var(--color-platinum)"
    >
      <div className="grid gap-10 sm:grid-cols-2">
        <p className="opacity-80">
          Social platforms have become a dominant news source for younger readers, and public concern over algorithmic
          feeds is rising. Regulators are tightening. Digital wellbeing tools are seeing rapid adoption.
        </p>
        <p className="opacity-80">
          Trusted, curated information is being prized again. Atlus meets that shift with the technology that caused it —
          turned around and pointed the other way.
        </p>
      </div>
    </Section>
  );
}

// The onboarding app is a separate deploy (Express + the vanilla onboarding UI).
// Joining the waitlist creates the reader's account there and hands straight off
// into setup, carrying the resume token so a refresh picks up where they left off.
const ONBOARDING_BASE =
  import.meta.env.VITE_ONBOARDING_URL ??
  (typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
    ? "http://localhost:4000"
    : "https://app.joinatlus.com");

function Waitlist() {
  const [status, setStatus] = React.useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = React.useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    if (typeof email !== "string" || !email) return;

    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch(`${ONBOARDING_BASE}/onboarding/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus("error");
        setMessage(
          res.status === 400
            ? (body.error ?? "That doesn't look like a valid email address.")
            : "Something went wrong. Please try again in a moment.",
        );
        return;
      }
      const { resume_token } = (await res.json()) as { resume_token: string };
      window.location.href = `${ONBOARDING_BASE}/?r=${encodeURIComponent(resume_token)}`;
    } catch {
      setStatus("error");
      setMessage("Couldn't reach Atlus. Check your connection and try again.");
    }
  }

  return (
    <section
      id="waitlist"
      className="relative px-6 py-32 sm:px-10"
      style={{
        background: "var(--color-platinum)",
        color: "var(--color-royal)",
        ["--color-amber" as string]: "var(--color-amber-ink)",
      }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 flex justify-center">
          <CurvedArrow />
        </div>
        <h2
          className="mb-6 text-[clamp(2.4rem,6vw,4.4rem)] leading-[1]"
          style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
        >
          Join{" "}
          <span className="relative inline-block">
            Atl
            <span className="hand" style={{ color: "var(--color-amber)" }}>u</span>
            s
            <span className="pointer-events-none absolute left-0 top-[92%] w-full">
              <DoubleUnderline w={260} />
            </span>
          </span>
        </h2>
        <p
          className="hand mb-10 text-2xl"
          style={{ color: "var(--color-amber)" }}
        >
          daily news, personalised for you
        </p>

        <form
          className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@morning.paper"
            className="flex-1 rounded-full border px-5 py-3 text-base outline-none focus:border-[color:var(--color-amber)]"
            style={{
              borderColor: "rgba(13,27,42,0.2)",
              background: "white",
              fontFamily: "var(--font-serif)",
              color: "var(--color-royal)",
            }}
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-full px-6 py-3 text-sm font-semibold tracking-wide disabled:opacity-60"
            style={{
              background: "var(--color-royal)",
              color: "var(--color-platinum)",
              fontFamily: "var(--font-serif)",
            }}
          >
            {status === "sending" ? "Starting…" : "Request early access"}
          </button>
        </form>
        {status === "error" && (
          <p
            role="alert"
            className="mt-4 text-sm"
            style={{ color: "#B4402F", fontFamily: "var(--font-serif)" }}
          >
            {message}
          </p>
        )}
        <p className="mt-4 text-sm opacity-60" style={{ fontFamily: "var(--font-serif)" }}>
          No feed. No selling your data. One paper, when the day begins.
        </p>
      </div>
    </section>
  );
}

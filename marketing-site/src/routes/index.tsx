import { Link, createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import type { ReactNode } from "react";
import { Hero15a } from "@/components/atlus/Hero15a";
import { AnimatedHero } from "@/components/atlus/AnimatedHero";
import { Handwriting } from "@/components/atlus/Handwriting";
import { SiteHeader, SiteFooter } from "@/components/atlus/SiteChrome";
import { DoubleUnderline, CurvedArrow, PhotoCircle } from "@/components/atlus/marks";
import { pageHead, webPageStructuredData } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "Atlus — daily news, personalised for you",
      description:
        "Atlus is a small, deliberate daily paper. Personalisation that widens your view instead of narrowing it — never sold, never the feed.",
      path: "/",
      structuredData: webPageStructuredData(
        "Atlus — daily news, personalised for you",
        "Atlus is a small, deliberate daily paper. Personalisation widens your view instead of narrowing it.",
        "/",
      ),
    }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div
      className="relative"
      style={{ background: "var(--color-platinum)", color: "var(--color-royal)" }}
    >
      <SiteHeader variant="dark" />
      <Hero15a />

      <Problem />
      <WhyNow />
      <Experts />
      <Solution />
      <Personalisation />
      <Discovery />
      <WhyUs />
      <Explore />
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
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  children: ReactNode;
  bg?: string;
  color?: string;
  className?: string;
}) {
  // Bright amber only clears WCAG contrast on the royal ground. On the light
  // grounds rebind --color-amber to the darker ink here, so the eyebrow and every
  // <Handwritten> inside inherit a readable accent without each one knowing which
  // section it landed in.
  const onRoyal = (bg ?? "").includes("royal");
  return (
    <section
      id={id}
      className={`px-6 py-24 sm:px-10 sm:py-32 ${className}`}
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

function Handwritten({ children, className = "" }: { children: string; className?: string }) {
  return (
    <Handwriting
      text={children}
      className={`hand ${className}`}
      style={{ color: "var(--color-amber)", fontSize: "1.35em", lineHeight: 1 }}
    />
  );
}

/* ---------- sections ---------- */

function Problem() {
  const { ref, revealed } = useViewportReveal();

  return (
    <Section title="The problem" className="pb-10 sm:pb-14">
      <div ref={ref} className={`problem-pop${revealed ? " is-revealed" : ""}`}>
        <p
          className="problem-pop__item max-w-3xl text-[clamp(1.6rem,3vw,2.25rem)] leading-snug"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          Mainstream news sucks.
        </p>
        <div className="mt-4 max-w-3xl space-y-1">
          <p className="problem-pop__item">It's designed to make you click, not educate you.</p>
          <p className="problem-pop__item">It isn't designed to encourage curiosity or learning.</p>
        </div>
      </div>
    </Section>
  );
}

/** Reveals the problem copy on arrival while leaving reduced-motion users static. */
function useViewportReveal() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}

function Experts() {
  return (
    <section
      className="px-6 py-16 sm:px-10 sm:py-20"
      style={{
        background: "var(--color-platinum)",
        color: "var(--color-royal)",
        ["--color-amber" as string]: "var(--color-amber-ink)",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <Handwriting
          text="Don't just trust us. Trust the experts."
          className="hand block"
          style={{
            color: "var(--color-amber)",
            fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
            lineHeight: 0.85,
          }}
        />
        <div
          className="mt-5 grid gap-4 rounded-2xl p-4 sm:grid-cols-2 sm:p-5"
          style={{ background: "var(--color-royal)" }}
        >
          <ExpertCard
            href="https://academic.oup.com/pnasnexus/article/4/3/pgaf062/8052060"
            title="Milli et al., 2025"
          >
            <p>
              Twitter's engagement ranking{" "}
              <strong>amplified emotionally charged, hostile content</strong> that users said made
              them feel worse about the other side of politics.{" "}
              <strong>Users didn't prefer the political posts the algorithm chose.</strong> Ranking
              by what users <em>said</em> they wanted{" "}
              <strong>reduced angry, partisan and hostile content.</strong>
            </p>
          </ExpertCard>
          <ExpertCard
            href="https://arxiv.org/abs/2604.11517"
            title="Kim, Buntain & Ciampaglia, 2026"
          >
            <p>
              <em>
                Understanding the Gap Between Stated and Revealed Preferences in News Curation.
              </em>{" "}
              Young adults <strong>often engage with low-quality content they don't endorse</strong>
              , even though they <strong>want high-quality information.</strong>
            </p>
          </ExpertCard>
        </div>
      </div>
    </section>
  );
}

/** Shared card treatment keeps both cited studies equally clear and accessible. */
function ExpertCard({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="rounded-xl p-5 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{ background: "white" }}
    >
      <p className="text-lg" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
        {title}
      </p>
      <div className="mt-2 text-sm leading-relaxed opacity-80">{children}</div>
    </a>
  );
}

function Solution() {
  return (
    <Section id="how" title="The solution" className="pt-10 sm:pt-14">
      <p className="max-w-3xl">
        Three articles a day, personalised for you, from high-quality sources. Designed to spark
        curiosity and make the news not <Handwritten>suck</Handwritten>.
      </p>
      <p className="mt-8 max-w-3xl">
        Built on the same recommendation technology that makes Instagram and Snapchat so addictive,
        pointed at a different goal. Your Daily Atlus gives you three articles:
      </p>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {[
          {
            k: "Core",
            body: "Articles close to what you already care about. Familiar ground.",
            tone: "var(--color-royal)",
          },
          {
            k: "Stretch",
            body: "Pieces aimed at what you want to understand better.",
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
      <div
        className="mt-14 rounded-2xl px-5 py-7 sm:px-8"
        style={{ background: "var(--color-royal)", ["--color-amber" as string]: "var(--amber)" }}
      >
        <p
          className="mb-6 text-sm tracking-[0.25em]"
          style={{ color: "var(--color-platinum)", fontFamily: "var(--font-serif)" }}
        >
          THE DAILY ATLUS
        </p>
        <AnimatedHero showIntroduction={false} />
      </div>
    </Section>
  );
}

function Personalisation() {
  return (
    <Section title="Personalisation" bg="var(--color-royal)" color="var(--color-platinum)">
      <p className="max-w-3xl">
        The Atlus onboarding process lets <Handwritten>you</Handwritten> tell{" "}
        <Handwritten>us</Handwritten> what you want, in an intuitive way.
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          { k: "Preferences", body: "what you actually enjoy reading." },
          {
            k: "Goals",
            body: "what you want to understand better.",
          },
          {
            k: "Knowledge",
            body: "what you already know, so we don't repeat it.",
          },
        ].map((c, i) => (
          <div
            key={c.k}
            className="rounded-2xl border p-6"
            style={{
              borderColor: "rgba(248,249,250,0.22)",
              background: "white",
              color: "var(--color-royal)",
            }}
          >
            <p
              className="mb-3 text-sm tracking-[0.25em] opacity-70"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              0{i + 1}
            </p>
            <h3
              className="mb-3 text-3xl"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
            >
              {c.k}
            </h3>
            <p className="opacity-80">{c.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-16 max-w-3xl text-lg opacity-80">
        Every assumption Atlus makes about you is visible in your web app. Adjust it by chatting
        with the model, or start onboarding again.
      </p>
      <p className="mt-4 max-w-3xl text-lg opacity-80">
        Unlike social media, you know how we choose your content, and <Handwritten>you</Handwritten>{" "}
        control it.
      </p>
    </Section>
  );
}

function Discovery() {
  return (
    <Section eyebrow="Intelligent discovery" title="Each story tells you why it's there">
      <div className="grid gap-12 sm:grid-cols-[1.1fr_1fr]">
        <p>
          Each recommendation carries a short explanation of why it was chosen: the interest it maps
          to, the goal it answers, or the corner of the world it introduces. A handful of reasons we
          think you should read it. If you disagree, don't read it. Tell us.
        </p>

        <div
          className="relative rounded-2xl border p-6"
          style={{ borderColor: "rgba(13,27,42,0.12)", background: "white" }}
        >
          <p
            className="mb-2 text-xs uppercase tracking-widest"
            style={{ color: "var(--color-amber)" }}
          >
            A reason to read
          </p>
          <p
            className="mb-3 text-xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
          >
            Personal, visible, adjustable
          </p>
          <p className="text-sm opacity-70" style={{ fontFamily: "var(--font-serif)" }}>
            Every recommendation gives you a reason. If it misses the mark, tell Atlus.
          </p>
        </div>
      </div>
    </Section>
  );
}

function WhyUs() {
  const { ref, revealed } = useViewportReveal();

  return (
    <Section
      title={
        <span className="block">
          <Handwriting
            text="Meet the founders."
            className="mb-3 block"
            style={{
              color: "var(--color-amber)",
              fontSize: "clamp(2.1rem, 4.5vw, 3.2rem)",
              lineHeight: 0.8,
            }}
          />
          Why us
        </span>
      }
      bg="#F1E9DE"
      className="pt-16 sm:pt-20"
    >
      <div ref={ref} className={`why-us-pop${revealed ? " is-revealed" : ""}`}>
        <UniversityMarks />
        <figure className="relative mx-auto mt-6 max-w-4xl overflow-hidden rounded-2xl">
          <img
            src="/images/founders.jpg"
            alt="Sam Oliver and Henry Hudson with friends at a Durham formal."
            className="aspect-[4/3] w-full object-cover"
            loading="lazy"
          />
          <Handwriting
            text="Refreshingly inexperienced."
            className="founder-photo-note hand absolute right-[6%] top-[13%] z-10 block text-right"
            style={{
              width: "40%",
              color: "var(--amber)",
              fontSize: "clamp(2.5rem, 6.1vw, 5.8rem)",
              lineHeight: 0.72,
            }}
          />
          <img
            src="/images/josephine-butler-college-crest-transparent.png"
            alt="Josephine Butler College crest"
            className="butler-crest"
            loading="lazy"
          />
          <PhotoCircle
            x="65%"
            y="56%"
            w="15%"
            h="24%"
            label="Sam"
            labelPosition="above"
            color="var(--amber)"
          />
          <PhotoCircle
            x="52%"
            y="53%"
            w="15%"
            h="24%"
            label="Henry"
            labelPosition="above"
            color="var(--amber)"
          />
        </figure>
        <p className="mt-5 max-w-3xl">
          Despite our dapper appearance in these photos, we are not "another suit". We're two Durham
          grads who became friends in first year.
        </p>
        <div className="mt-2 max-w-3xl">
          <p>
            We understand the problem because we're two young people who have lived it. We have been
            fooled by a polemical TikTok and a misleading headline, and we have seen our peers do
            the same. Crucially, we are well placed to fix it.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <div
            className="rounded-2xl p-8"
            style={{ background: "var(--color-royal)", color: "var(--color-platinum)" }}
          >
            <h3 className="text-2xl" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
              Sam Oliver, CEO &amp; Co-founder
            </h3>
            <p className="mt-3 text-base leading-relaxed opacity-80">
              First-Class Honours in History from Durham University, with a focus on economic
              history and natural language processing. Participant in the Durham Venture School
              accelerator, 2026–27.
            </p>
          </div>
          <div
            className="rounded-2xl p-8"
            style={{ background: "var(--color-royal)", color: "var(--color-platinum)" }}
          >
            <h3 className="text-2xl" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
              Henry B. Hudson, CTO &amp; Co-founder
            </h3>
            <p className="mt-3 text-base leading-relaxed opacity-80">
              First-Class Honours in Computer Science from Durham University. Incoming MPhil in
              Machine Learning and Machine Intelligence at the University of Cambridge. Founder and
              leader of the British Algorithmic Olympiad. Previously worked on recommendation
              systems at News UK for <em>The Sun</em> and <em>The Times</em>.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

function UniversityMarks() {
  return (
    <div className="university-marks" aria-label="University affiliations">
      <img
        src="/images/durham-university-wordmark.png"
        alt="Durham University"
        className="university-mark university-mark--durham"
        loading="lazy"
      />
      <img
        src="/images/cambridge-university-wordmark.jpeg"
        alt="University of Cambridge"
        className="university-mark university-mark--cambridge"
        loading="lazy"
      />
    </div>
  );
}

function WhyNow() {
  const { ref, revealed } = useViewportReveal();

  return (
    <section
      className="px-6 py-24 sm:px-10 sm:py-32"
      style={{ background: "var(--color-royal)", color: "var(--color-royal)" }}
    >
      <div
        ref={ref}
        className={`why-now-pop mx-auto max-w-5xl rounded-2xl p-7 sm:p-12${revealed ? " is-revealed" : ""}`}
        style={{ background: "white" }}
      >
        <p
          className="mb-5 text-sm tracking-[0.25em]"
          style={{ color: "var(--color-amber-ink)", fontFamily: "var(--font-serif)" }}
        >
          THE MOMENT FOR ATLUS
        </p>
        <h2
          className="text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.05] tracking-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          Why now
        </h2>
        <p
          className="mt-5 max-w-3xl text-[clamp(1.3rem,2.6vw,1.8rem)] leading-snug"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The problem isn't the news. It's the feed.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div
            className="why-now-stat rounded-xl p-6"
            style={{ background: "var(--color-royal)", color: "white" }}
          >
            <p
              className="text-[clamp(3.5rem,8vw,5.5rem)] leading-none"
              style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
            >
              42%
            </p>
            <p className="mt-3 text-lg leading-snug opacity-85">
              of people sometimes or often avoid the news.
            </p>
          </div>
          <div
            className="why-now-stat rounded-xl p-6"
            style={{ background: "var(--color-royal)", color: "white" }}
          >
            <p
              className="text-[clamp(3.5rem,8vw,5.5rem)] leading-none"
              style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
            >
              37%
            </p>
            <p className="mt-3 text-lg leading-snug opacity-85">
              global trust in news, the lowest recorded since 2015.
            </p>
          </div>
        </div>
        <div
          className="mt-8 grid gap-6 text-base leading-relaxed sm:grid-cols-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          <div>
            <h3 className="text-xl" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
              Audiences are leaving the feed.
            </h3>
            <p className="mt-2 opacity-75">
              Social and video networks have overtaken news sites and apps as a route to news.
            </p>
          </div>
          <div>
            <h3 className="text-xl" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
              People are paying to scroll less.
            </h3>
            <p className="mt-2 opacity-75">
              Blocker tools show that attention is something people want back.
            </p>
          </div>
          <div>
            <h3 className="text-xl" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
              Policy is moving against engagement design.
            </h3>
            <p className="mt-2 opacity-75">
              Regulators are targeting infinite scroll, autoplay and opaque recommenders.
            </p>
          </div>
        </div>
        <Link
          to="/why-now"
          className="mt-10 inline-flex rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{ background: "var(--color-amber)", color: "var(--color-royal)" }}
        >
          Read the full case for Atlus →
        </Link>
        <p className="mt-6 text-sm opacity-65" style={{ fontFamily: "var(--font-serif)" }}>
          <a
            href="https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2026/dnr-executive-summary"
            target="_blank"
            rel="noopener"
            className="underline decoration-1 underline-offset-4"
          >
            Reuters Institute Digital News Report 2026
          </a>
        </p>
      </div>
    </section>
  );
}

function Explore() {
  const pages = [
    {
      to: "/how-it-works",
      eyebrow: "Product",
      title: "How the daily paper works",
      body: "How preferences, goals and knowledge become a finite Core, Stretch and Discovery edition.",
    },
    {
      to: "/science/stated-preference-feed",
      eyebrow: "Research",
      title: "The stated-preference feed",
      body: "Why a news feed built around what you say you want can lead somewhere better than one built around clicks.",
    },
    {
      to: "/privacy",
      eyebrow: "Privacy",
      title: "Personalisation, kept personal",
      body: "What reader information is for, and why it is never a product to be sold.",
    },
    {
      to: "/why-now",
      eyebrow: "Why now",
      title: "The case for a finite feed",
      body: "Why audiences, attention habits and regulation are all moving away from engagement by default.",
    },
    {
      to: "/faq",
      eyebrow: "Questions",
      title: "A few useful answers",
      body: "The essentials about Atlus, its daily edition and how recommendations work.",
    },
    {
      to: "/manifesto",
      eyebrow: "Our view",
      title: "The Atlus manifesto",
      body: "Why the feed needs a new purpose, and the principles behind a healthier daily paper.",
    },
  ] as const;

  return (
    <Section
      id="explore"
      eyebrow="Learn more"
      title="Read the thinking behind the paper."
      bg="#F1E9DE"
    >
      <p className="max-w-3xl">
        Atlus is built around a simple question: what would news feel like if it followed the
        interests you name, rather than the impulses a feed can measure? Explore the research,
        product principles and practical details.
      </p>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {pages.map((page) => (
          <Link
            key={page.to}
            to={page.to}
            className="group flex min-h-56 flex-col justify-between rounded-2xl border p-6 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            style={{ borderColor: "rgba(13,27,42,0.16)", background: "white" }}
          >
            <div>
              <p
                className="text-xs tracking-[0.2em]"
                style={{ color: "var(--color-amber)", fontFamily: "var(--font-serif)" }}
              >
                {page.eyebrow.toUpperCase()}
              </p>
              <h3
                className="mt-4 text-3xl leading-tight"
                style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
              >
                {page.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed opacity-80">{page.body}</p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline decoration-1 underline-offset-4">
              Read more{" "}
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              >
                →
              </span>
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}

// The onboarding app is a separate deploy (Express + the vanilla onboarding UI).
// Joining the waitlist creates the reader's account there and hands straight off
// into setup, carrying the resume token so a refresh picks up where they left off.
const ONBOARDING_BASE = (
  import.meta.env.VITE_ONBOARDING_URL ??
  (typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
    ? "http://localhost:4000"
    : "https://app.joinatlus.com")
).replace(/\/$/, "");

function Waitlist() {
  const [status, setStatus] = React.useState<"idle" | "sending" | "leaving" | "error">("idle");
  const [message, setMessage] = React.useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    if (typeof email !== "string" || !email.trim()) return;

    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch(`${ONBOARDING_BASE}/onboarding/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
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
      if (!resume_token) throw new Error("Missing resume token");
      const destination = new URL("/", ONBOARDING_BASE);
      destination.searchParams.set("r", resume_token);
      setStatus("leaving");
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        await new Promise((resolve) => window.setTimeout(resolve, 420));
      }
      window.location.assign(destination.href);
    } catch {
      setStatus("error");
      setMessage("Couldn't reach Atlus. Check your connection and try again.");
    }
  }

  return (
    <>
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
              <Handwriting text="u" className="brand-u" style={{ color: "var(--color-amber)" }} />s
              <span className="pointer-events-none absolute left-0 top-[92%] w-full">
                <DoubleUnderline w={260} />
              </span>
            </span>
          </h2>
          <Handwriting
            text="daily news, personalised for you"
            className="mb-10 block text-2xl"
            style={{ color: "var(--color-amber)" }}
          />

          <form
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={handleSubmit}
          >
            <label className="sr-only" htmlFor="email">
              Email
            </label>
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
              disabled={status === "sending" || status === "leaving"}
              className="rounded-full px-6 py-3 text-sm font-semibold tracking-wide disabled:opacity-60"
              style={{
                background: "var(--color-royal)",
                color: "var(--color-platinum)",
                fontFamily: "var(--font-serif)",
              }}
            >
              {status === "sending"
                ? "Starting…"
                : status === "leaving"
                  ? "Opening…"
                  : "Start onboarding"}
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
      {status === "leaving" && (
        <div className="onboarding-handoff" role="status" aria-live="polite">
          <div className="onboarding-handoff__content">
            <span className="onboarding-handoff__wordmark">
              Atl
              <Handwriting text="u" mode="hero" className="brand-u" />s
            </span>
            <span className="onboarding-handoff__line" aria-hidden="true" />
            <span>Making this yours…</span>
          </div>
        </div>
      )}
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/atlus/SiteChrome";
import { pageHead, webPageStructuredData } from "@/lib/seo";

const title = "How Atlus works — a personalised daily news briefing";
const description =
  "Atlus builds a small daily paper around the interests you share: core stories you care about, stretch stories to help you learn, and discovery stories to widen your view.";

export const Route = createFileRoute("/how-it-works")({
  head: () =>
    pageHead({
      title,
      description,
      path: "/how-it-works",
      structuredData: webPageStructuredData(title, description, "/how-it-works"),
    }),
  component: HowItWorksPage,
});

function HowItWorksPage() {
  return (
    <Page headerVariant="light">
      <article
        className="mx-auto max-w-3xl px-6 pb-24 pt-40 sm:px-10"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        <p className="mb-5 text-sm tracking-[0.25em]" style={{ color: "var(--color-amber)" }}>
          HOW IT WORKS
        </p>
        <h1
          className="mb-8 text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02] tracking-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
        >
          A daily paper built around what matters to you.
        </h1>
        <p className="text-xl leading-relaxed">
          Atlus is a personalised daily news briefing. You tell us what interests you and what you
          want to understand; we use that context to assemble a small, deliberate paper each
          morning.
        </p>

        <section className="mt-14">
          <h2 className="text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
            Three ways into the news
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <StoryType
              name="Core"
              text="Stories connected to the subjects you already care about."
            />
            <StoryType
              name="Stretch"
              text="Stories that move you closer to something you want to understand."
            />
            <StoryType
              name="Discovery"
              text="Stories from beyond your usual orbit, chosen to widen the view."
            />
          </div>
        </section>

        <section className="mt-14 space-y-5 text-lg leading-relaxed">
          <h2 className="text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
            Personalisation with a reason
          </h2>
          <p>
            Atlus is designed to make its recommendations legible. A story should have a reason for
            appearing in your paper: something you follow, something you are trying to learn, or a
            useful connection you might otherwise miss.
          </p>
          <p>
            The aim is not an endless feed. It is a finite daily edition that helps you stay
            informed and occasionally surprised.
          </p>
        </section>
      </article>
    </Page>
  );
}

function StoryType({ name, text }: { name: string; text: string }) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ borderColor: "rgba(13,27,42,0.14)", background: "white" }}
    >
      <h3 className="text-2xl" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
        {name}
      </h3>
      <p className="mt-2 leading-relaxed opacity-80">{text}</p>
    </div>
  );
}

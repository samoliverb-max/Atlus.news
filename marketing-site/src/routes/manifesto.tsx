import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/atlus/SiteChrome";
import { DoubleUnderline } from "@/components/atlus/marks";

export const Route = createFileRoute("/manifesto")({
  head: () => ({
    meta: [
      { title: "Manifesto — Atlus" },
      {
        name: "description",
        content:
          "Recommendation systems should help people become who they aspire to be. The Atlus manifesto for a healthier relationship with the news.",
      },
      { property: "og:title", content: "Manifesto — Atlus" },
      {
        property: "og:description",
        content:
          "Technology, turned around. A quiet argument for perspective over engagement, curiosity over compulsion.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ManifestoPage,
});

function ManifestoPage() {
  return (
    <Page headerVariant="light">
      <article
        className="mx-auto max-w-3xl px-6 pb-24 pt-40 sm:px-10"
        style={{ fontFamily: "var(--font-serif)", color: "var(--color-royal)" }}
      >
        <p
          className="mb-6 text-sm tracking-[0.25em]"
          style={{ color: "var(--color-amber)" }}
        >
          MANIFESTO
        </p>
        <h1
          className="mb-10 text-[clamp(2.4rem,6vw,4.2rem)] leading-[1.02] tracking-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
        >
          A quieter paper, on{" "}
          <span className="relative inline-block">
            purpose.
            <span className="pointer-events-none absolute left-0 top-[92%] w-full">
              <DoubleUnderline w={260} />
            </span>
          </span>
        </h1>

        <div className="prose-lg space-y-6 text-lg leading-relaxed">
          <p>
            The feed was a good idea that outgrew its purpose. What began as a way to keep up with friends now sets the
            terms on which most of the world learns what is happening. Engagement became the objective; understanding
            became the collateral.
          </p>
          <p>
            Atlus is built on a small, stubborn belief: the technology that narrowed the view can be used to widen it.
            The same recommendation systems that reward outrage can be redirected — toward curiosity, learning, and the
            quiet, useful surprise of a subject you would never have chosen for yourself.
          </p>
          <p
            className="border-l-4 pl-6 text-2xl italic"
            style={{ borderColor: "var(--color-amber)", fontFamily: "var(--font-display)" }}
          >
            Recommendation systems should help people become who they aspire to be.
          </p>
          <p>
            We make no promise of neutrality. We promise care. A handful of stories, each morning, chosen with you in
            mind — with a short note explaining why. Core, stretch, and discovery. Never the feed.
          </p>
          <p>
            The data we hold about you is yours to see and yours to change. It is kept for one purpose alone: the
            improvement of your recommendations. It is never sold. You are not the product; the paper is.
          </p>
          <p>
            We believe staying informed can be effortless and meaningful at the same time. That is the paper we are
            building.
          </p>

          <p className="hand pt-6" style={{ color: "var(--color-amber)", fontSize: "1.8rem", lineHeight: 1.1 }}>
            — the team at Atlus
          </p>
        </div>
      </article>
    </Page>
  );
}

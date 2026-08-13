import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/atlus/SiteChrome";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team — Atlus" },
      {
        name: "description",
        content: "The founders behind Atlus — Samuel Oliver and Henry Hudson, building a healthier daily paper.",
      },
      { property: "og:title", content: "Team — Atlus" },
      {
        property: "og:description",
        content: "Meet Samuel Oliver and Henry Hudson — the founding team of Atlus.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeamPage,
});

const people = [
  {
    name: "Samuel Oliver",
    role: "Co-founder · Editorial & Product",
    body:
      "First-Class Honours in History from Durham University, with a focus on economic history and natural language processing. Incoming participant in the Durham Venture School accelerator for 2026 to 2027.",
    initials: "SO",
  },
  {
    name: "Henry Hudson",
    role: "Co-founder · Machine Learning",
    body:
      "First-Class Honours in Computer Science from Durham University. Incoming MPhil in Machine Learning and Machine Intelligence at the University of Cambridge. Founder and leader of the British Algorithmic Olympiad; previously worked in recommendation at News UK for The Sun and The Times.",
    initials: "HH",
  },
];

function TeamPage() {
  return (
    <Page headerVariant="light">
      <div className="mx-auto max-w-5xl px-6 pb-24 pt-40 sm:px-10">
        <p
          className="mb-4 text-sm tracking-[0.25em]"
          style={{ color: "var(--color-amber)", fontFamily: "var(--font-serif)" }}
        >
          FOUNDING TEAM
        </p>
        <h1
          className="mb-16 text-[clamp(2.4rem,6vw,4.2rem)] leading-[1.02] tracking-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
        >
          Two people, one paper.
        </h1>

        <div className="grid gap-10 sm:grid-cols-2">
          {people.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl border p-8"
              style={{ borderColor: "rgba(13,27,42,0.12)", background: "white" }}
            >
              <div
                className="mb-6 flex h-24 w-24 items-center justify-center rounded-full"
                style={{
                  background: "var(--color-royal)",
                  color: "var(--color-platinum)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "1.75rem",
                  letterSpacing: "0.05em",
                }}
              >
                {p.initials}
              </div>
              <p
                className="text-3xl"
                style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-royal)" }}
              >
                {p.name}
              </p>
              <p
                className="mt-1 text-sm tracking-wide"
                style={{ color: "var(--color-amber)", fontFamily: "var(--font-serif)" }}
              >
                {p.role}
              </p>
              <p
                className="mt-4 text-base leading-relaxed opacity-80"
                style={{ fontFamily: "var(--font-serif)", color: "var(--color-royal)" }}
              >
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

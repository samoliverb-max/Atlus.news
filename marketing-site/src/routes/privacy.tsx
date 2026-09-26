import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/atlus/SiteChrome";
import { pageHead, webPageStructuredData } from "@/lib/seo";

const title = "Privacy at Atlus — personalisation without selling your data";
const description =
  "Atlus is designed around information readers choose to share. It is used to improve their recommendations and is never sold.";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead({
      title,
      description,
      path: "/privacy",
      structuredData: webPageStructuredData(title, description, "/privacy"),
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <Page headerVariant="light">
      <article
        className="mx-auto max-w-3xl px-6 pb-24 pt-40 sm:px-10"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        <p className="mb-5 text-sm tracking-[0.25em]" style={{ color: "var(--color-amber)" }}>
          PRIVACY
        </p>
        <h1
          className="mb-8 text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02] tracking-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
        >
          Personalisation should remain personal.
        </h1>
        <div className="space-y-6 text-lg leading-relaxed">
          <p>
            Atlus is designed around information readers choose to share. That information helps us
            create more useful recommendations; it is not a product to be sold.
          </p>
          <section>
            <h2
              className="mb-3 text-3xl"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
            >
              What it is for
            </h2>
            <p>
              Your interests and preferences are used to make your daily paper more relevant,
              explain why stories have been selected, and help you discover worthwhile subjects
              beyond your usual reading.
            </p>
          </section>
          <section>
            <h2
              className="mb-3 text-3xl"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
            >
              Your control
            </h2>
            <p>
              The information Atlus holds about you should be understandable and editable. You can
              contact us at{" "}
              <a className="underline" href="mailto:sam@joinatlus.com">
                sam@joinatlus.com
              </a>{" "}
              with privacy questions.
            </p>
          </section>
          <p
            className="border-l-4 pl-5 text-base opacity-75"
            style={{ borderColor: "var(--color-amber)" }}
          >
            This plain-English page describes the product principle. It should be reviewed alongside
            the final legal privacy notice before public launch.
          </p>
        </div>
      </article>
    </Page>
  );
}

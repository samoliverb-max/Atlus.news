import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/atlus/SiteChrome";
import { pageHead } from "@/lib/seo";

const title = "Atlus FAQ — personalised daily news, explained";
const description =
  "Answers to common questions about Atlus: a small, personalised daily news briefing built around core, stretch, and discovery stories.";

const questions = [
  {
    question: "What is Atlus?",
    answer:
      "Atlus is a personalised daily news briefing. It brings together a small number of stories chosen around the interests you share and the subjects you want to understand.",
  },
  {
    question: "What are Core, Stretch, and Discovery stories?",
    answer:
      "Core stories connect to subjects you already care about. Stretch stories help you move towards a subject you want to understand. Discovery stories introduce a useful perspective from beyond your usual reading.",
  },
  {
    question: "Is Atlus an endless news feed?",
    answer:
      "No. Atlus is designed as a finite daily paper: a short edition intended to be read, considered, and put down.",
  },
  {
    question: "Does Atlus sell personal data?",
    answer:
      "No. Atlus states that reader information is held to improve recommendations and is never sold.",
  },
  {
    question: "How can I contact Atlus?",
    answer: "Email sam@joinatlus.com.",
  },
];

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: questions.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export const Route = createFileRoute("/faq")({
  head: () => pageHead({ title, description, path: "/faq", structuredData: faqStructuredData }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <Page headerVariant="light">
      <article
        className="mx-auto max-w-3xl px-6 pb-24 pt-40 sm:px-10"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        <p className="mb-5 text-sm tracking-[0.25em]" style={{ color: "var(--color-amber)" }}>
          FAQ
        </p>
        <h1
          className="mb-10 text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02] tracking-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
        >
          A few useful answers.
        </h1>
        <div className="divide-y" style={{ borderColor: "rgba(13,27,42,0.14)" }}>
          {questions.map(({ question, answer }) => (
            <section className="py-7" key={question}>
              <h2
                className="text-2xl"
                style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
              >
                {question}
              </h2>
              <p className="mt-3 text-lg leading-relaxed opacity-85">{answer}</p>
            </section>
          ))}
        </div>
      </article>
    </Page>
  );
}

import { notFound } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { ProblemMarkdown } from "@/components/ProblemMarkdown";
import {
  getAllSystemDesignQuestions,
  getSystemDesignQuestionBySlug,
} from "@/content/system-design";

interface SystemDesignPageProps {
  params: Promise<{ slug: string }>;
}

const difficultyClass: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

export default async function SystemDesignQuestionPage({
  params,
}: SystemDesignPageProps) {
  const { slug } = await params;
  const question = getSystemDesignQuestionBySlug(slug);

  if (!question) {
    notFound();
  }

  const sections = [
    { title: "Requirements", markdown: question.requirementsMarkdown },
    { title: "High-Level Design", markdown: question.highLevelDesignMarkdown },
    { title: "Deep Dives", markdown: question.deepDivesMarkdown },
    { title: "Trade-offs", markdown: question.tradeoffsMarkdown },
    { title: "Real-World Examples", markdown: question.realWorldExamplesMarkdown },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-wide text-violet-600 dark:text-violet-400">
            System Design &middot;{" "}
            {question.category === "frontend" ? "Frontend" : "Backend"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {question.title}
            </h1>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${difficultyClass[question.difficulty]}`}
            >
              {question.difficulty}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {question.maangTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
            {question.summary}
          </p>

          <div className="mt-8 space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="mb-3 text-xl font-semibold tracking-tight">
                  {section.title}
                </h2>
                <ProblemMarkdown description={section.markdown} />
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export async function generateStaticParams() {
  return getAllSystemDesignQuestions().map((question) => ({
    slug: question.slug,
  }));
}

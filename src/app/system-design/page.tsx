import Link from "next/link";

import { Navbar } from "@/components/Navbar";
import {
  backendSystemDesignQuestions,
  frontendSystemDesignQuestions,
} from "@/content/system-design";
import type { SystemDesignQuestion } from "@/content/types";

const difficultyClass: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

function QuestionCard({ question }: { question: SystemDesignQuestion }) {
  return (
    <Link
      href={`/system-design/${question.slug}`}
      className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-violet-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-700"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold group-hover:text-violet-700 dark:group-hover:text-violet-300">
          {question.title}
        </h3>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${difficultyClass[question.difficulty]}`}
        >
          {question.difficulty}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {question.summary}
      </p>
    </Link>
  );
}

export default function SystemDesignIndexPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <section className="mb-10 rounded-3xl border border-violet-200/70 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-8 dark:border-violet-900/40 dark:from-violet-950/40 dark:via-zinc-950 dark:to-fuchsia-950/20">
            <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
              MAANG Senior Interview Prep
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              System Design
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
              Requirements, high-level design, deep dives, and trade-offs for
              the frontend and backend system design questions asked at
              MAANG-caliber companies.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-xl font-semibold">
              Frontend System Design
            </h2>
            {frontendSystemDesignQuestions.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Coming soon.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {frontendSystemDesignQuestions.map((question) => (
                  <QuestionCard key={question.slug} question={question} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">
              Backend System Design
            </h2>
            {backendSystemDesignQuestions.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Coming soon.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {backendSystemDesignQuestions.map((question) => (
                  <QuestionCard key={question.slug} question={question} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

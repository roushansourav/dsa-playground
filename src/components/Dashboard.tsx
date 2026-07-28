import Link from "next/link";

import {
  foundationTopics,
  getAllProblems,
  patternTopics,
} from "@/content";
import type { ProgressStatus } from "@/content/types";
import { statusBadgeClass } from "@/lib/utils";

interface DashboardProps {
  progressByProblem: Map<string, { status: ProgressStatus }>;
}

function countSolved(
  problemSlugs: string[],
  progressByProblem: Map<string, { status: ProgressStatus }>,
) {
  return problemSlugs.filter(
    (slug) => progressByProblem.get(slug)?.status === "solved",
  ).length;
}

function TopicCard({
  topic,
  progressByProblem,
}: {
  topic: (typeof foundationTopics)[number];
  progressByProblem: Map<string, { status: ProgressStatus }>;
}) {
  const solved = countSolved(topic.problemSlugs, progressByProblem);
  const total = topic.problemSlugs.length;

  return (
    <Link
      href={`/topics/${topic.slug}`}
      className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-violet-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-700"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-violet-600 dark:text-violet-400">
            {topic.track === "foundation" ? "Foundation" : "Pattern"}
          </p>
          <h3 className="mt-1 text-lg font-semibold group-hover:text-violet-700 dark:group-hover:text-violet-300">
            {topic.title}
          </h3>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(solved === total ? "solved" : undefined)}`}>
          {solved}/{total}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {topic.description}
      </p>
    </Link>
  );
}

export function Dashboard({ progressByProblem }: DashboardProps) {
  const allProblems = getAllProblems();
  const totalSolved = allProblems.filter(
    (problem) => progressByProblem.get(problem.slug)?.status === "solved",
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <section className="mb-10 rounded-3xl border border-violet-200/70 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-8 dark:border-violet-900/40 dark:from-violet-950/40 dark:via-zinc-950 dark:to-fuchsia-950/20">
        <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
          MAANG Senior Interview Prep
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Learn DSA patterns. Code in the browser. Track progress.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
          A structured path from array fundamentals to interview patterns like
          two pointers and sliding window — with Monaco editor, sandboxed test
          runs, and cloud progress sync when signed in.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-white/80 px-3 py-1 ring-1 ring-zinc-200 dark:bg-zinc-900/80 dark:ring-zinc-700">
            {allProblems.length} problems in v1
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1 ring-1 ring-zinc-200 dark:bg-zinc-900/80 dark:ring-zinc-700">
            {totalSolved} solved
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1 ring-1 ring-zinc-200 dark:bg-zinc-900/80 dark:ring-zinc-700">
            JavaScript / TypeScript syntax
          </span>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Foundation Track</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {foundationTopics.map((topic) => (
            <TopicCard
              key={topic.slug}
              topic={topic}
              progressByProblem={progressByProblem}
            />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Pattern Track</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {patternTopics.map((topic) => (
            <TopicCard
              key={topic.slug}
              topic={topic}
              progressByProblem={progressByProblem}
            />
          ))}
        </div>
      </section>

      <Link
        href="/system-design"
        className="group flex items-center justify-between rounded-2xl border border-violet-200 bg-violet-50 p-5 transition hover:border-violet-300 hover:shadow-md dark:border-violet-900/40 dark:bg-violet-950/20"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-violet-600 dark:text-violet-400">
            New Track
          </p>
          <h3 className="mt-1 text-lg font-semibold group-hover:text-violet-700 dark:group-hover:text-violet-300">
            System Design (Frontend &amp; Backend)
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Requirements, high-level design, deep dives, and trade-offs for
            MAANG-style system design interviews.
          </p>
        </div>
        <span className="text-violet-600 transition group-hover:translate-x-1 dark:text-violet-400">
          &rarr;
        </span>
      </Link>
    </div>
  );
}

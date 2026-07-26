import Link from "next/link";

import type { Problem, ProgressStatus, Topic } from "@/content/types";
import {
  difficultyBadgeClass,
  statusBadgeClass,
} from "@/lib/utils";

interface TopicProblemListProps {
  topic: Topic;
  problems: Problem[];
  progressByProblem: Map<string, { status: ProgressStatus }>;
}

export function TopicProblemList({
  topic,
  problems,
  progressByProblem,
}: TopicProblemListProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="text-sm text-violet-600 hover:underline dark:text-violet-400"
      >
        ← Dashboard
      </Link>

      <div className="mt-4 rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
          {topic.track === "foundation" ? "Foundation Track" : "Pattern Track"}
        </p>
        <h1 className="mt-2 text-3xl font-bold">{topic.title}</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">{topic.description}</p>
        <div className="mt-5 rounded-2xl bg-violet-50 p-4 text-sm leading-relaxed text-violet-950 dark:bg-violet-950/30 dark:text-violet-100">
          <p className="font-semibold">Why this matters for MAANG interviews</p>
          <p className="mt-1">{topic.whyItMatters}</p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-900/70">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Problem
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Difficulty
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {problems.map((problem, index) => {
              const status = progressByProblem.get(problem.slug)?.status;

              return (
                <tr key={problem.slug} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-4">
                    <Link
                      href={`/problems/${problem.slug}`}
                      className="font-medium text-violet-700 hover:underline dark:text-violet-300"
                    >
                      {index + 1}. {problem.title}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${difficultyBadgeClass(problem.difficulty)}`}
                    >
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(status)}`}
                    >
                      {status ?? "unsolved"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

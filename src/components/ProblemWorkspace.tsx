"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

import type { Problem, ProgressStatus, RunResult } from "@/content/types";
import { runCodeInWorker } from "@/lib/run-code";
import {
  difficultyBadgeClass,
  formatJson,
  maangBadgeClass,
  statusBadgeClass,
} from "@/lib/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-zinc-500">
      Loading editor...
    </div>
  ),
});

interface ProblemWorkspaceProps {
  problem: Problem;
  topicTitle: string;
  topicSlug: string;
  initialCode?: string;
  initialStatus?: ProgressStatus;
  prevSlug?: string;
  nextSlug?: string;
}

export function ProblemWorkspace({
  problem,
  topicTitle,
  topicSlug,
  initialCode,
  initialStatus,
  prevSlug,
  nextSlug,
}: ProblemWorkspaceProps) {
  const { data: session } = useSession();
  const [code, setCode] = useState(initialCode ?? problem.starterCode);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ProgressStatus>(
    initialStatus ?? "unsolved",
  );
  const [result, setResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setCode(initialCode ?? problem.starterCode);
    setStatus(initialStatus ?? "unsolved");
    setResult(null);
    setSaveMessage(null);
  }, [problem.slug, initialCode, initialStatus, problem.starterCode]);

  const persistProgress = useCallback(
    async (nextStatus: ProgressStatus) => {
      if (!session?.user?.githubId) {
        setSaveMessage("Sign in with GitHub to save progress.");
        return;
      }

      try {
        const response = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemSlug: problem.slug,
            status: nextStatus,
            lastCode: code,
            notes: notes || undefined,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          setSaveMessage(payload.error ?? "Failed to save progress.");
          return;
        }

        setStatus(nextStatus);
        setSaveMessage("Progress saved.");
      } catch {
        setSaveMessage("Failed to save progress.");
      }
    },
    [session?.user?.githubId, problem.slug, code, notes],
  );

  const handleRun = async () => {
    setIsRunning(true);
    setSaveMessage(null);

    const runResult = await runCodeInWorker(
      code,
      problem.functionName,
      problem.testCases,
    );

    setResult(runResult);
    setIsRunning(false);

    const allPassed =
      !runResult.error && runResult.passed === runResult.total && runResult.total > 0;

    if (allPassed) {
      await persistProgress("solved");
    } else if (session?.user?.githubId) {
      await persistProgress("attempted");
    }
  };

  const handleReset = () => {
    setCode(problem.starterCode);
    setResult(null);
    setSaveMessage(null);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-[1600px] flex-col lg:flex-row">
      <aside className="flex w-full flex-col border-b border-zinc-200 lg:w-[42%] lg:border-b-0 lg:border-r dark:border-zinc-800">
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <Link
            href={`/topics/${topicSlug}`}
            className="text-sm text-violet-600 hover:underline dark:text-violet-400"
          >
            ← {topicTitle}
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${difficultyBadgeClass(problem.difficulty)}`}
            >
              {problem.difficulty}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(status)}`}
            >
              {status}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {problem.maangTags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${maangBadgeClass(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ProblemMarkdown description={problem.description} />
        </div>

        <div className="border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <label className="mb-2 block text-sm font-medium">Notes</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Pattern reminders, time complexity, follow-ups..."
            className="h-24 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-violet-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {prevSlug && (
              <Link
                href={`/problems/${prevSlug}`}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm dark:border-zinc-700"
              >
                ← Previous
              </Link>
            )}
            {nextSlug && (
              <Link
                href={`/problems/${nextSlug}`}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm dark:border-zinc-700"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      </aside>

      <section className="flex min-h-[480px] flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div>
            <p className="text-sm font-medium">Solution</p>
            <p className="text-xs text-zinc-500">
              Function: <code className="font-mono">{problem.functionName}</code>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm dark:border-zinc-700"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning}
              className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-60"
            >
              {isRunning ? "Running..." : "Run Tests"}
            </button>
          </div>
        </div>

        <div className="min-h-[280px] flex-1">
          <MonacoEditor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </div>

        <div className="max-h-[40%] overflow-y-auto border-t border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          {saveMessage && (
            <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">
              {saveMessage}
            </p>
          )}

          {!result && (
            <p className="text-sm text-zinc-500">
              Click Run Tests to execute your solution against hidden-style test
              cases in a sandboxed Web Worker (3s timeout).
            </p>
          )}

          {result?.error && (
            <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
              {result.error}
            </div>
          )}

          {result && !result.error && (
            <div className="mb-3 text-sm font-medium">
              {result.passed === result.total ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  All {result.total} tests passed
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">
                  {result.passed}/{result.total} tests passed
                </span>
              )}
            </div>
          )}

          {result?.consoleOutput.length ? (
            <div className="mb-4 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Console
              </p>
              <pre className="overflow-x-auto text-xs text-zinc-700 dark:text-zinc-300">
                {result.consoleOutput.join("\n")}
              </pre>
            </div>
          ) : null}

          <div className="space-y-3">
            {result?.results.map((testResult) => (
              <div
                key={testResult.label}
                className={`rounded-xl border p-3 text-sm ${
                  testResult.passed
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                    : "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{testResult.label}</p>
                  <span>{testResult.passed ? "PASS" : "FAIL"}</span>
                </div>
                {!testResult.passed && (
                  <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                    <div>
                      <p className="font-semibold text-zinc-500">Expected</p>
                      <pre className="mt-1 overflow-x-auto">
                        {formatJson(testResult.expected)}
                      </pre>
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-500">Actual</p>
                      <pre className="mt-1 overflow-x-auto">
                        {formatJson(testResult.actual)}
                      </pre>
                    </div>
                  </div>
                )}
                {testResult.error && (
                  <p className="mt-2 text-xs text-rose-700 dark:text-rose-300">
                    {testResult.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

import { ProblemMarkdown } from "@/components/ProblemMarkdown";

import type { Difficulty, MaangTag, ProgressStatus } from "@/content/types";

export function difficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case "easy":
      return "text-emerald-600 dark:text-emerald-400";
    case "medium":
      return "text-amber-600 dark:text-amber-400";
    case "hard":
      return "text-rose-600 dark:text-rose-400";
  }
}

export function difficultyBadgeClass(difficulty: Difficulty): string {
  switch (difficulty) {
    case "easy":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20";
    case "medium":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/20";
    case "hard":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/20";
  }
}

export function statusLabel(status: ProgressStatus | undefined): string {
  switch (status) {
    case "solved":
      return "Solved";
    case "attempted":
      return "Attempted";
    default:
      return "Unsolved";
  }
}

export function statusBadgeClass(status: ProgressStatus | undefined): string {
  switch (status) {
    case "solved":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "attempted":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-300";
    default:
      return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400";
  }
}

export function maangBadgeClass(tag: MaangTag): string {
  const colors: Record<MaangTag, string> = {
    Google: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    Amazon: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
    Apple: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
    Netflix: "bg-red-500/10 text-red-700 dark:text-red-300",
    Meta: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  };

  return colors[tag];
}

export function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "[unable to display value]";
  }
}

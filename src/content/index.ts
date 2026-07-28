import { arrayProblems } from "./problems/arrays";
import { backtrackingProblems } from "./problems/backtracking";
import { binarySearchProblems } from "./problems/binary-search";
import { oneDDpProblems } from "./problems/dp-1d";
import { twoDDpProblems } from "./problems/dp-2d";
import { greedyProblems } from "./problems/greedy";
import { graphProblems } from "./problems/graphs";
import { heapProblems } from "./problems/heaps";
import { intervalProblems } from "./problems/intervals";
import { linkedListProblems } from "./problems/linked-lists";
import { slidingWindowProblems } from "./problems/sliding-window";
import { stackProblems } from "./problems/stack";
import { treeProblems } from "./problems/trees";
import { trieProblems } from "./problems/tries";
import { twoPointerProblems } from "./problems/two-pointers";
import { topics } from "./topics";
import type { Problem, Topic } from "./types";

export * from "./types";
export { topics, foundationTopics, patternTopics } from "./topics";

const allProblems: Problem[] = [
  ...arrayProblems,
  ...twoPointerProblems,
  ...slidingWindowProblems,
  ...linkedListProblems,
  ...stackProblems,
  ...binarySearchProblems,
  ...treeProblems,
  ...heapProblems,
  ...graphProblems,
  ...backtrackingProblems,
  ...trieProblems,
  ...oneDDpProblems,
  ...twoDDpProblems,
  ...greedyProblems,
  ...intervalProblems,
];

const problemMap = new Map(allProblems.map((problem) => [problem.slug, problem]));
const topicMap = new Map(topics.map((topic) => [topic.slug, topic]));

export function getAllProblems(): Problem[] {
  return allProblems;
}

export function getProblemBySlug(slug: string): Problem | undefined {
  return problemMap.get(slug);
}

export function getTopicBySlug(slug: string): Topic | undefined {
  return topicMap.get(slug);
}

export function getProblemsForTopic(topicSlug: string): Problem[] {
  const topic = topicMap.get(topicSlug);
  if (!topic) return [];

  return topic.problemSlugs
    .map((slug) => problemMap.get(slug))
    .filter((problem): problem is Problem => Boolean(problem));
}

export function getAdjacentProblems(slug: string): {
  prev?: Problem;
  next?: Problem;
} {
  const index = allProblems.findIndex((problem) => problem.slug === slug);
  if (index === -1) return {};

  return {
    prev: index > 0 ? allProblems[index - 1] : undefined,
    next: index < allProblems.length - 1 ? allProblems[index + 1] : undefined,
  };
}

export function getTopicForProblem(problemSlug: string): Topic | undefined {
  const problem = problemMap.get(problemSlug);
  if (!problem) return undefined;
  return topicMap.get(problem.topicSlug);
}

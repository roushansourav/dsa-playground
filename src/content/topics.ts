import type { Topic } from "./types";

export const topics: Topic[] = [
  {
    slug: "arrays",
    title: "Arrays & Hashing",
    track: "foundation",
    order: 1,
    description:
      "Build the foundation: iteration, hash maps, prefix products, and interval logic. Every MAANG interview assumes fluency here.",
    whyItMatters:
      "Arrays are the default input type. Hash maps turn O(n²) brute force into O(n). Kadane's and prefix/suffix patterns recur in DP and sliding window later.",
    problemSlugs: [
      "two-sum",
      "contains-duplicate",
      "product-of-array-except-self",
      "maximum-subarray",
      "merge-intervals",
    ],
  },
  {
    slug: "two-pointers",
    title: "Two Pointers",
    track: "pattern",
    order: 2,
    description:
      "Converging or parallel pointers on sorted arrays and strings. The first pattern track — unlocks O(n) solutions that look like O(n²).",
    whyItMatters:
      "When input is sorted (or can be sorted), two pointers often beat hash maps on space. 3Sum and container problems are Meta/Google favorites.",
    problemSlugs: [
      "valid-palindrome",
      "two-sum-ii",
      "three-sum",
      "container-with-most-water",
      "trapping-rain-water",
    ],
  },
  {
    slug: "sliding-window",
    title: "Sliding Window",
    track: "pattern",
    order: 3,
    description:
      "Fixed or variable-size windows over arrays/strings. The workhorse for substring, subarray, and streaming problems.",
    whyItMatters:
      "Amazon and Google love sliding window + hash map combos. Minimum Window Substring and Sliding Window Maximum are common hard filters.",
    problemSlugs: [
      "best-time-to-buy-sell-stock",
      "longest-substring-without-repeating",
      "longest-repeating-character-replacement",
      "minimum-window-substring",
      "sliding-window-maximum",
    ],
  },
  {
    slug: "linked-lists",
    title: "Linked Lists",
    track: "foundation",
    order: 4,
    description:
      "Pointer manipulation on singly-linked structures: traversal, in-place reversal, fast/slow pointers, and dummy-node tricks.",
    whyItMatters:
      "Linked lists are the first data structure where getting pointers wrong crashes your program instead of just giving a wrong answer. MAANG interviewers use them to check discipline under a structure with no random access.",
    problemSlugs: [
      "reverse-linked-list",
      "merge-two-sorted-lists",
      "linked-list-cycle",
      "remove-nth-node-from-end-of-list",
      "merge-k-sorted-lists",
    ],
  },
];

export const foundationTopics = topics
  .filter((topic) => topic.track === "foundation")
  .sort((a, b) => a.order - b.order);

export const patternTopics = topics
  .filter((topic) => topic.track === "pattern")
  .sort((a, b) => a.order - b.order);

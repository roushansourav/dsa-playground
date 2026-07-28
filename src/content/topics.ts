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
  {
    slug: "stack",
    title: "Stack",
    track: "pattern",
    order: 5,
    description:
      "LIFO ordering for matching, undo, and monotonic-sequence problems. The pattern behind parsing, expression evaluation, and next-greater-element queries.",
    whyItMatters:
      "Stacks turn recursive/nested structure (brackets, expressions) into an iterative O(n) pass. The monotonic stack technique (Daily Temperatures) is a MAANG staple for 'next greater/smaller' questions.",
    problemSlugs: [
      "valid-parentheses",
      "min-stack",
      "evaluate-reverse-polish-notation",
      "generate-parentheses",
      "daily-temperatures",
    ],
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    track: "pattern",
    order: 6,
    description:
      "Search sorted arrays, rotated arrays, and answer spaces in O(log n). The pattern behind every 'minimize/maximize with a monotonic check' problem.",
    whyItMatters:
      "Binary search interviews split into two camps: search on a literal sorted array, and 'binary search on the answer' where the array is a search space of candidate solutions. Amazon and Google interviews test both, and rotated-array variants are a recurring Meta/Microsoft filter question.",
    problemSlugs: [
      "binary-search",
      "search-2d-matrix",
      "koko-eating-bananas",
      "search-rotated-array",
      "find-min-rotated",
      "time-based-kv-store",
    ],
  },
  {
    slug: "trees",
    title: "Trees",
    track: "pattern",
    order: 7,
    description:
      "Recursive traversal and structural reasoning on binary trees: depth, balance, BST invariants, and path problems. The pivot point into recursion-heavy patterns.",
    whyItMatters:
      "Trees are where interviews stop rewarding memorized templates and start rewarding a candidate's ability to state a recursive invariant precisely (a bounds range, a height contract, a return-vs-track-globally split) and hold it under a hard problem like Binary Tree Maximum Path Sum. Google, Amazon, and Meta all treat tree recursion fluency as a baseline signal, not a bonus.",
    problemSlugs: [
      "invert-binary-tree",
      "max-depth-binary-tree",
      "diameter-binary-tree",
      "balanced-binary-tree",
      "same-tree",
      "subtree-of-another-tree",
      "level-order-traversal",
      "validate-bst",
      "kth-smallest-bst",
      "lowest-common-ancestor-bst",
      "max-path-sum",
      "serialize-deserialize-tree",
    ],
  },
  {
    slug: "heaps",
    title: "Heaps",
    track: "pattern",
    order: 8,
    description:
      "Priority-driven problems: always grab the current min or max in O(log n). Streaming top-K, scheduling, and median tracking all reduce to heap operations.",
    whyItMatters:
      "Heaps are the answer whenever 'give me the current best/worst so far' must stay fast as data streams in. Google and Amazon lean on heap fluency for design-style questions (Design Twitter, Median Finder) as much as raw algorithm questions.",
    problemSlugs: [
      "kth-largest-in-stream",
      "last-stone-weight",
      "k-closest-points-to-origin",
      "kth-largest-element-in-array",
      "task-scheduler",
      "design-twitter",
      "find-median-from-data-stream",
    ],
  },
  {
    slug: "graphs",
    title: "Graphs",
    track: "pattern",
    order: 9,
    description:
      "Traversal and connectivity on explicit and implicit graphs: BFS/DFS, grid flood-fill, cycle detection, and Union-Find. The pivot from tree recursion into general graph reasoning.",
    whyItMatters:
      "Once a candidate can traverse a tree, interviews test whether that generalizes: to grids treated as implicit graphs, to directed graphs with cycles, to connectivity queries at scale via Union-Find, and to shortest-path search over graphs with no explicit edge list at all (Word Ladder). Google, Amazon, and Meta all use this topic to separate 'knows the BFS template' from 'can model a new problem as a graph.'",
    problemSlugs: [
      "find-if-path-exists-in-graph",
      "number-of-islands",
      "rotting-oranges",
      "course-schedule",
      "number-of-connected-components",
      "pacific-atlantic-water-flow",
      "word-ladder",
    ],
  },
  {
    slug: "backtracking",
    title: "Backtracking",
    track: "pattern",
    order: 10,
    description:
      "Exhaustive search over decision trees, with pruning: subsets, combinations, permutations, and constraint-satisfaction placement. Explore, recurse, and undo — the discipline behind every 'generate all valid X' problem.",
    whyItMatters:
      "Backtracking is where interviews test whether a candidate can define a decision tree precisely — what's a node, what's a branch, when to prune — and then implement the mark/recurse/unmark discipline without leaking state between branches. Amazon, Google, and Apple all use it to separate 'can write a recursive function' from 'can reason about an exponential search space and prune it intelligently.'",
    problemSlugs: [
      "subsets",
      "combination-sum",
      "permutations",
      "subsets-ii",
      "word-search",
      "palindrome-partitioning",
      "n-queens-ii",
    ],
  },
  {
    slug: "tries",
    title: "Tries",
    track: "pattern",
    order: 11,
    description:
      "Prefix trees for fast string/prefix lookups, wildcard search, and dictionary-backed grid search. A specialized tree shape purpose-built for 'share common prefixes, query fast.'",
    whyItMatters:
      "Tries are the structure behind every autocomplete box and spell-checker, and interviews use them to test whether a candidate recognizes 'many strings, prefix-heavy queries' as a distinct signal from 'use a hash set.' Word Search II combines this topic with Backtracking's grid DFS, making it a favorite hard-tier filter at Google and Amazon.",
    problemSlugs: [
      "implement-trie-prefix-tree",
      "design-add-and-search-words-data-structure",
      "word-search-ii",
    ],
  },
];

export const foundationTopics = topics
  .filter((topic) => topic.track === "foundation")
  .sort((a, b) => a.order - b.order);

export const patternTopics = topics
  .filter((topic) => topic.track === "pattern")
  .sort((a, b) => a.order - b.order);

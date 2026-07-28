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
  {
    slug: "1d-dp",
    title: "1-D Dynamic Programming",
    track: "pattern",
    order: 12,
    description:
      "Break a problem into overlapping subproblems indexed by a single dimension (position, amount, length) and build the answer bottom-up. The pivot from 'recurse and prune' backtracking into 'recurse and remember.'",
    whyItMatters:
      "1-D DP is one of the most heavily weighted topics across MAANG onsites — it's the first place interviews test whether a candidate can spot overlapping subproblems, write a correct recurrence, and then push it from exponential recursion to memoized or bottom-up polynomial time, often collapsing an O(n) table into O(1) rolling state. Amazon, Google, and Meta all use it as a load-bearing signal for 'can this candidate reason about state and transitions,' not just 'can they code a loop.'",
    problemSlugs: [
      "climbing-stairs",
      "house-robber",
      "house-robber-ii",
      "longest-palindromic-substring",
      "coin-change",
      "word-break",
      "longest-increasing-subsequence",
    ],
  },
  {
    slug: "2d-dp",
    title: "2-D Dynamic Programming",
    track: "pattern",
    order: 13,
    description:
      "Extend the DP recurrence to two indices at once: grid paths, two-string alignment, and finite-state profit tracking. The pivot from 'remember one dimension' into 'remember a relationship between two.'",
    whyItMatters:
      "Two-string and grid DP problems (Edit Distance, LCS, Interleaving String) are the most common 'hard' DP filter in senior loops at Google, Amazon, and Meta, because the recurrence itself is only half the problem — mapping each table transition back to a concrete operation (replace vs. insert vs. delete, or match vs. skip) under interview pressure is what separates memorized templates from real understanding.",
    problemSlugs: [
      "unique-paths",
      "longest-common-subsequence",
      "best-time-to-buy-and-sell-stock-with-cooldown",
      "coin-change-ii",
      "target-sum",
      "interleaving-string",
      "edit-distance",
    ],
  },
  {
    slug: "greedy",
    title: "Greedy",
    track: "pattern",
    order: 14,
    description:
      "Make the locally optimal choice at each step and prove it never costs you the global optimum: running sums, reachability frontiers, and interval-style boundary tracking.",
    whyItMatters:
      "Greedy problems are a distinct interview signal from DP: the code is often short, but the interviewer is really testing whether you can articulate *why* the greedy choice is safe — why a negative prefix sum can be discarded, why the smallest remaining card must start a group, why a failed starting station rules out every station up to the failure. Amazon and Google frequently use these as fast, high-signal filters precisely because a memorized-but-not-understood greedy falls apart under a single 'why does that work?' follow-up.",
    problemSlugs: [
      "maximum-subarray",
      "jump-game",
      "jump-game-ii",
      "gas-station",
      "hand-of-straights",
      "partition-labels",
      "valid-parenthesis-string",
    ],
  },
  {
    slug: "intervals",
    title: "Intervals",
    track: "pattern",
    order: 15,
    description:
      "Reason about ranges instead of points: sort by start or end, sweep, and merge or count conflicts. The pattern behind scheduling, resource allocation, and range-overlap queries.",
    whyItMatters:
      "Interval problems test a specific judgment call — sort by start or by end? — and whether a candidate can justify it, not just produce it. Meeting Rooms II and Minimum Interval to Include Each Query push this into timestamp-sweep and offline-query territory that Google and Amazon use as senior-level filters, since the naive per-pair or per-query brute force is easy to write but the sweep requires actually understanding why sorting makes it monotonic.",
    problemSlugs: [
      "insert-interval",
      "merge-intervals",
      "non-overlapping-intervals",
      "meeting-rooms",
      "meeting-rooms-ii",
      "minimum-interval-to-include-each-query",
      "car-pooling",
    ],
  },
  {
    slug: "bit-manipulation",
    title: "Bit Manipulation",
    track: "foundation",
    order: 16,
    description:
      "Reason directly about the binary representation of numbers: XOR-folds, popcount tricks, and carry propagation. A foundational skill independent of any one algorithmic pattern — it shows up as a building block inside DP, graph, and math problems alike.",
    whyItMatters:
      "Bit manipulation problems are short but unforgiving: there's nowhere to hide a shaky mental model of two's complement, XOR identities, or signed-vs-unsigned shifts. Apple, Google, and Amazon use these as fast calibration questions early in a loop — a candidate who can derive (not just recite) why `a ^ b` gives a carryless sum, or why `n & (n-1)` clears the lowest set bit, demonstrates the same bit-level fluency that later shows up in hashing, compression, and low-level systems questions.",
    problemSlugs: [
      "single-number",
      "number-of-1-bits",
      "counting-bits",
      "reverse-bits",
      "missing-number",
      "sum-of-two-integers",
      "reverse-integer",
    ],
  },
  {
    slug: "math-geometry",
    title: "Math & Geometry",
    track: "foundation",
    order: 17,
    description:
      "Reason directly about numbers and coordinate grids: in-place matrix transforms, digit-level arithmetic, and cycle detection over numeric sequences. A foundational skill independent of any one algorithmic pattern — precision, overflow, and geometric transforms recur across every other topic.",
    whyItMatters:
      "Math and geometry problems test whether a candidate respects the actual constraints of a number (overflow, precision, sign) instead of leaning on language built-ins that silently paper over them. Apple, Google, and Amazon use these as calibration questions that expose whether someone can derive a digit-by-digit multiplication, an in-place matrix rotation, or a cycle-detection argument from first principles rather than recalling a memorized template.",
    problemSlugs: [
      "rotate-image",
      "spiral-matrix",
      "set-matrix-zeroes",
      "happy-number",
      "plus-one",
      "pow-x-n",
      "multiply-strings",
    ],
  },
  {
    slug: "advanced-graphs",
    title: "Advanced Graphs",
    track: "pattern",
    order: 18,
    description:
      "Beyond plain BFS/DFS: minimum spanning trees, single-source shortest paths, minimax paths, and topological ordering under real-world weight and constraint conditions.",
    whyItMatters:
      "Advanced graph algorithms — Dijkstra, Prim's, Bellman-Ford, Hierholzer's, Kahn's — are the last mile between 'knows graph traversal' and 'can pick the right algorithm for the actual constraint.' Google, Amazon, and Meta use these to see whether a candidate matches the algorithm to the problem's real shape (edge weights, stop limits, minimax objectives) instead of forcing plain BFS/DFS to fit.",
    problemSlugs: [
      "reconstruct-itinerary",
      "min-cost-to-connect-points",
      "network-delay-time",
      "swim-in-rising-water",
      "alien-dictionary",
      "cheapest-flights-within-k-stops",
      "path-with-minimum-effort",
    ],
  },
];

export const foundationTopics = topics
  .filter((topic) => topic.track === "foundation")
  .sort((a, b) => a.order - b.order);

export const patternTopics = topics
  .filter((topic) => topic.track === "pattern")
  .sort((a, b) => a.order - b.order);

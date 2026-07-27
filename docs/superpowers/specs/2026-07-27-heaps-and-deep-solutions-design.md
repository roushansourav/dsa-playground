# Heaps Topic + Deep Solutions Retrofit Design Spec

**Date:** 2026-07-27
**Status:** Approved
**Author:** Roushan + Claude Code

## Goal

Two things land together in this phase:

1. Ship the fifth post-v1 curriculum expansion — the **Heaps** pattern topic
   (7 problems) — including one new harness capability (`unordered` result
   comparison).
2. Ship a **Deep Solutions feature**: every problem gains one or more fully
   worked solutions (line-by-line explained, with dry-run traces on real
   example inputs), a related-problems list, and a real-world-usage
   writeup — surfaced via a new tabbed panel. This is retrofitted onto
   **all 43 already-shipped problems** across the 7 existing topics, not
   just the 7 new Heaps problems, so every problem in the app (50 total)
   ends up with the same depth of content.

These ship in the same plan because the Heaps topic's 7 problems need this
content anyway (there is no "old" Heaps content to write twice), and the
schema/UI only need to be built once.

## Part 1: Heaps topic content

New topic `heaps`, track `pattern`, `order: 8`. 7 problems, in build/display
order:

| # | Slug | Title | Difficulty | Entry point |
|---|------|-------|-----------|--------------|
| 1 | `kth-largest-in-stream` | Kth Largest Element in a Stream | easy | `KthLargest` (class) |
| 2 | `last-stone-weight` | Last Stone Weight | easy | `lastStoneWeight` |
| 3 | `k-closest-points-to-origin` | K Closest Points to Origin | medium | `kClosest` |
| 4 | `kth-largest-element-in-array` | Kth Largest Element in an Array | medium | `findKthLargest` |
| 5 | `task-scheduler` | Task Scheduler | medium | `leastInterval` |
| 6 | `design-twitter` | Design Twitter | medium | `Twitter` (class) |
| 7 | `find-median-from-data-stream` | Find Median From Data Stream | hard | `MedianFinder` (class) |

Difficulty spread 2 easy / 4 medium / 1 hard, matching each problem's real
LeetCode difficulty. 3 of 7 are class-based (streaming/design problems),
reusing the operations/`args`/constructor mechanism already built for
`MinStack`/`TimeMap`/`Codec` — no harness change needed for those three.

### Problem details

**1. `kth-largest-in-stream`** — `KthLargest` class (LC 703). Min-heap of
size `k`; `add` pushes then pops down to size `k`, returns the heap min.
```
operations: ["KthLargest","add","add","add","add","add"]
args: [[3,[4,5,8,2]],[3],[5],[10],[9],[4]]
expected: [null,4,5,5,8,8]
```
```
operations: ["KthLargest","add","add","add","add","add"]
args: [[1,[]],[-3],[-2],[-4],[0],[4]]
expected: [null,-3,-2,-2,0,4]
```

**2. `last-stone-weight`** — `lastStoneWeight(stones: number[]): number`
(LC 1046). Max-heap; repeatedly smash the two heaviest, push the nonzero
diff back.
- `{ input: [[2,7,4,1,8,1]], expected: 1 }`
- `{ input: [[1]], expected: 1 }`
- `{ input: [[2,2]], expected: 0 }`

**3. `k-closest-points-to-origin`** — `kClosest(points: number[][], k: number): number[][]`
(LC 973). Max-heap of size `k` on squared distance. All test cases use
points with distinct distances so exactly one valid *set* exists;
`unordered: true` on every case (see Harness extension below).
- `{ input: [[[1,3],[-2,2]], 1], expected: [[-2,2]], unordered: true }`
- `{ input: [[[3,3],[5,-1],[-2,4]], 2], expected: [[3,3],[-2,4]], unordered: true }`
- `{ input: [[[1,1],[3,3],[2,2]], 2], expected: [[1,1],[2,2]], unordered: true }`

**4. `kth-largest-element-in-array`** — `findKthLargest(nums: number[], k: number): number`
(LC 215). Fixed-size min-heap of size `k` (or quickselect — either valid).
- `{ input: [[3,2,1,5,6,4], 2], expected: 5 }`
- `{ input: [[3,2,3,1,2,4,5,5,6], 4], expected: 4 }`
- `{ input: [[1], 1], expected: 1 }`

**5. `task-scheduler`** — `leastInterval(tasks: string[], n: number): number`
(LC 621). Max-heap on task frequency; interview payoff is the closed-form
(`(maxFreq-1)*(n+1) + numTasksWithMaxFreq`), heap simulation as the
concrete mechanism.
- `{ input: [["A","A","A","B","B","B"], 2], expected: 8 }`
- `{ input: [["A","A","A","B","B","B"], 0], expected: 6 }`
- `{ input: [["A","A","A","A","A","A","B","C","D","E","F","G"], 2], expected: 16 }`

**6. `design-twitter`** — `Twitter` class (LC 355). `postTweet`/
`getNewsFeed`/`follow`/`unfollow`. `getNewsFeed` merges the caller's own
tweets with followees' via a global increasing timestamp counter and a
max-heap, returning the 10 most recent tweet ids.
```
operations: ["Twitter","postTweet","getNewsFeed","follow","postTweet","getNewsFeed","unfollow","getNewsFeed"]
args: [[],[1,5],[1],[1,2],[2,6],[1],[1,2],[1]]
expected: [null,null,[5],null,null,[6,5],null,[5]]
```
```
operations: ["Twitter","postTweet","postTweet","getNewsFeed","getNewsFeed"]
args: [[],[1,10],[1,11],[1],[2]]
expected: [null,null,null,[11,10],[]]
```

**7. `find-median-from-data-stream`** — `MedianFinder` class (LC 295). Two
heaps (max-heap for the lower half, min-heap for the upper half),
rebalanced to differ in size by at most 1 after every `addNum`.
```
operations: ["MedianFinder","addNum","addNum","findMedian","addNum","findMedian"]
args: [[],[1],[2],[],[3],[]]
expected: [null,null,null,1.5,null,2]
```
```
operations: ["MedianFinder","addNum","addNum","addNum","findMedian","addNum","findMedian"]
args: [[],[5],[2],[8],[],[1],[]]
expected: [null,null,null,null,5,null,3.5]
```

### Harness extension: `unordered` comparison flag

Only `k-closest-points-to-origin` needs this — real LeetCode accepts the k
closest points in any order, but the harness currently does exact
`JSON.stringify` equality. Add one optional `TestCase` field:

```typescript
unordered?: boolean;
```

At the comparison site (`code-runner.worker.ts:355`), when
`testCase.unordered` is true, compare as multisets instead of exact
sequences:

```typescript
function unorderedEqual(a: unknown, b: unknown): boolean {
  if (!Array.isArray(a) || !Array.isArray(b)) return deepEqual(a, b);
  if (a.length !== b.length) return false;
  const sortedA = [...a].map((x) => JSON.stringify(x)).sort();
  const sortedB = [...b].map((x) => JSON.stringify(x)).sort();
  return deepEqual(sortedA, sortedB);
}
```

Fully additive: existing test cases (no `unordered` field) behave
identically.

## Part 2: Deep Solutions feature

### Schema

New `Solution` interface and three new optional `Problem` fields in
`src/content/types.ts`:

```typescript
export interface Solution {
  approach: string;              // e.g. "Brute Force", "Optimal (Heap)"
  timeComplexity: string;        // e.g. "O(n log n)"
  spaceComplexity: string;       // e.g. "O(n)"
  overviewMarkdown: string;      // prose: the idea, why it works
  code: string;                  // commented solution code
  lineByLineMarkdown: string;    // markdown table: Line | Code | Explanation
  dryRunMarkdown: string;        // walkthrough(s) on 2+ example inputs
}

export interface Problem {
  // ...all existing fields unchanged...
  solutions?: Solution[];            // ordered brute-force → optimal
  relatedSlugs?: string[];           // slugs of other problems in this app
  realWorldUsageMarkdown?: string;   // prose: production/real-life applications
}
```

All three fields are optional — additive to every existing `Problem`
object. `solutions` is an array (not a single field) specifically so a
problem can carry multiple approaches (brute force, then optimal), each
fully self-contained with its own complexity, code, line-by-line
breakdown, and dry run.

### Content depth per solution

Every `Solution` in every problem's `solutions` array contains:

1. **`overviewMarkdown`** — 2-4 sentences: what the approach does and why
   it's correct, no code yet.
2. **`code`** — the solution, commented at the logical-step level (not
   necessarily every single physical line, but every distinct operation).
3. **`lineByLineMarkdown`** — a markdown table, one row per logical line/
   statement in `code`, columns `Line | Code | Explanation`. This is the
   literal "each line explanation" requirement — every table row names
   what that line does AND why (not just a restatement of the syntax).
4. **`dryRunMarkdown`** — a full step-by-step trace of the algorithm on
   **at least 2** of the problem's actual example/test inputs (reusing
   values already in `testCases`, so the trace is checkable against real
   test data). Each trace shows the data structure's state (heap contents,
   pointers, running variables) after every step, ending in the returned
   value.

A problem with 2 approaches (brute force + optimal) therefore carries 2 of
these complete write-ups.

### Worked example (calibrates depth — `last-stone-weight`, Optimal solution)

> **Approach:** Optimal (Max-Heap) · O(n log n) time, O(n) space
>
> **Overview:** Push every stone into a max-heap. Repeatedly pop the two
> heaviest; if they differ, push the difference back. The heap always
> hands you the two current heaviest in O(log n), instead of a full O(n)
> rescan each round.
>
> ```js
> function lastStoneWeight(stones) {
>   const heap = new MaxHeap(stones);      // O(n) heapify
>   while (heap.size() > 1) {
>     const a = heap.pop();                // heaviest
>     const b = heap.pop();                // second heaviest
>     if (a !== b) heap.push(a - b);       // smashed remainder survives
>   }
>   return heap.size() ? heap.pop() : 0;
> }
> ```
>
> **Line-by-line:**
>
> | Line | Code | Explanation |
> |---|---|---|
> | 1 | `const heap = new MaxHeap(stones)` | Build a max-heap from all stones in O(n) via heapify — not O(n log n) one-at-a-time inserts. |
> | 2 | `while (heap.size() > 1)` | Keep smashing while at least two stones remain to compare. |
> | 3 | `const a = heap.pop()` | Remove and return the current heaviest stone, O(log n). |
> | 4 | `const b = heap.pop()` | Remove and return the next-heaviest stone. |
> | 5 | `if (a !== b) heap.push(a - b)` | Equal stones annihilate each other (nothing pushed back); unequal stones leave a remainder stone with weight `a - b`. |
> | 6 | `return heap.size() ? heap.pop() : 0` | One stone survives → return its weight; none survive → return `0`. |
>
> **Dry run 1** — `[2,7,4,1,8,1]`:
> heap=[8,7,4,2,1,1] → pop 8,7 → push 1 → heap=[4,2,1,1,1] → pop 4,2 →
> push 2 → heap=[2,1,1,1] → pop 2,1 → push 1 → heap=[1,1,1] → pop 1,1 →
> push 0 → heap=[1,0] → pop 1,0 → push 1 → heap=[1] → return **1**.
>
> **Dry run 2** — `[2,2]`:
> heap=[2,2] → pop 2,2 → equal, push nothing → heap=[] → return **0**.

Every one of the 50 problems' solutions gets this depth. Problems with 2
approaches (most of them) get this twice — once per approach.

### UI

`src/components/ProblemWorkspace.tsx`'s left panel currently renders
`description` directly with no tab chrome. It becomes a 4-tab switcher:

- **Description** — existing content, unchanged.
- **Solution** — if `solutions.length > 1`, a pill-switcher between
  approaches (e.g. "Brute Force" | "Optimal") above the content; renders
  the active solution's `overviewMarkdown`, `code` (syntax-highlighted
  block), `lineByLineMarkdown`, and `dryRunMarkdown` via the existing
  `ProblemMarkdown` component (the table and code-block markdown it
  already needs to render are standard GFM, already supported).
- **Related** — renders `relatedSlugs` as a list of links to
  `/problems/{slug}`, resolved through the existing problem map (reusing
  the `prevSlug`/`nextSlug` `Link` pattern already in this file) with each
  link's title looked up, not just the raw slug shown.
- **Real-World** — renders `realWorldUsageMarkdown` via `ProblemMarkdown`.

A problem with no `solutions`/`relatedSlugs`/`realWorldUsageMarkdown` (there
should be none left after this phase, but the fields stay optional for
forward-compatibility) simply shows an empty/placeholder state on that tab
rather than crashing.

### Retrofit inventory — all 50 problems get this treatment

**New (Heaps, 7):** the 7 problems listed in Part 1.

**Existing (43, across 7 shipped topics) — full backfill:**

*Arrays (5):* `two-sum`, `contains-duplicate`, `product-of-array-except-self`, `maximum-subarray`, `merge-intervals`

*Two Pointers (5):* `valid-palindrome`, `two-sum-ii`, `three-sum`, `container-with-most-water`, `trapping-rain-water`

*Sliding Window (5):* `best-time-to-buy-sell-stock`, `longest-substring-without-repeating`, `longest-repeating-character-replacement`, `minimum-window-substring`, `sliding-window-maximum`

*Linked Lists (5):* `reverse-linked-list`, `merge-two-sorted-lists`, `linked-list-cycle`, `remove-nth-node-from-end-of-list`, `merge-k-sorted-lists`

*Stack (5):* `valid-parentheses`, `min-stack`, `evaluate-reverse-polish-notation`, `generate-parentheses`, `daily-temperatures`

*Binary Search (6):* `binary-search`, `search-2d-matrix`, `koko-eating-bananas`, `search-rotated-array`, `find-min-rotated`, `time-based-kv-store`

*Trees (12):* `invert-binary-tree`, `max-depth-binary-tree`, `diameter-binary-tree`, `balanced-binary-tree`, `same-tree`, `subtree-of-another-tree`, `level-order-traversal`, `validate-bst`, `kth-smallest-bst`, `lowest-common-ancestor-bst`, `max-path-sum`, `serialize-deserialize-tree`

Each of these 43 gets `solutions` (brute force + optimal, or a single
`solutions` entry for problems with no meaningfully distinct brute-force
approach — e.g. `reverse-linked-list` — noted per-problem in the plan),
`relatedSlugs`, and `realWorldUsageMarkdown`, matching the same depth as
the Heaps problems. `relatedSlugs` values must reference real slugs already
present in the app (cross-checked against this inventory list) — no
forward references to not-yet-built problems.

## Files touched

- `src/content/types.ts` — add `unordered?: boolean` to `TestCase`; add
  `Solution` interface; add `solutions?`, `relatedSlugs?`,
  `realWorldUsageMarkdown?` to `Problem`.
- `src/workers/code-runner.worker.ts` — add `unorderedEqual`, branch at the
  comparison site.
- `src/content/problems/heaps.ts` — new file, 7 problems, full Deep
  Solutions content included from creation (no separate backfill pass
  needed for this file).
- `src/content/problems/arrays.ts`, `two-pointers.ts`, `sliding-window.ts`,
  `linked-lists.ts`, `stack.ts`, `binary-search.ts`, `trees.ts` — each
  existing problem object gains `solutions`, `relatedSlugs`,
  `realWorldUsageMarkdown`.
- `src/content/topics.ts` — add `heaps` topic entry (`order: 8`).
- `src/content/index.ts` — wire up `heaps.ts` (alphabetical: between
  `binary-search` and `linked-lists`).
- `src/components/ProblemWorkspace.tsx` — add the 4-tab switcher.
- `src/components/ProblemMarkdown.tsx` — no changes needed; already uses
  `remark-gfm`, so the `lineByLineMarkdown` tables and fenced code blocks
  render correctly with the existing component (confirmed by reading the
  file during design).

No changes to `run-code.ts` or `RunResult`/`TestResult` — this phase only
adds display content and one comparison mode, the execution/grading
contract is unchanged.

## Testing / validation plan

1. `npx tsc --noEmit` — type-check.
2. Task-level and whole-branch subagent reviews. Given the sheer volume of
   authored content (100 solution write-ups across 50 problems), reviewers
   are specifically asked to spot-check dry-run traces against the actual
   algorithm for correctness (a dry run that silently drifts from what the
   code actually does is worse than no dry run) — not read all 100 in full
   depth, but sample deliberately across topics and flag any pattern of
   drift.
3. Browser smoke test: verify the 4-tab UI renders correctly (tab
   switching, markdown/table rendering, multi-solution pill-switcher, a
   `relatedSlugs` link that actually navigates) for at least one problem
   with 2 solutions and one with a single solution.
4. `unordered` harness path smoke-tested via `k-closest-points-to-origin`
   with a correct solution that returns the k points in a different order
   than `expected`.

## Out of scope

- Further heap-adjacent problems (Merge K Sorted Lists already exists and
  is in the Linked Lists backfill list, not duplicated here; Sliding
  Window Maximum uses a deque, not a heap, and stays as-is).
- Further generalizing `unordered` beyond top-level array multiset
  comparison.
- User-facing UI for *submitting* alternate solutions or community
  discussion — `solutions` is fully authored content, not a submission
  system.
- Retrofitting topics not yet built (Backtracking, Trie, Graphs, etc.) —
  they get Deep Solutions content as part of their own initial build, the
  same way Heaps does here.

# Binary Search Topic Design Spec

**Date:** 2026-07-27
**Status:** Approved
**Author:** Roushan + Claude Code

## Goal

Ship the third post-v1 curriculum expansion — the "Binary Search" pattern
topic — reusing the operations-based test harness built for the Stack
topic as-is, with no further harness changes.

## Content scope

New topic `binary-search`, track `pattern`, `order: 6` (next global slot
after `stack`).

6 problems, in build/display order:

| # | Slug | Title | Difficulty | Entry point |
|---|------|-------|-----------|--------------|
| 1 | `binary-search` | Binary Search | easy | `binarySearch` |
| 2 | `search-2d-matrix` | Search a 2D Matrix | medium | `searchMatrix` |
| 3 | `koko-eating-bananas` | Koko Eating Bananas | medium | `minEatingSpeed` |
| 4 | `search-rotated-array` | Search in Rotated Sorted Array | medium | `search` |
| 5 | `find-min-rotated` | Find Minimum in Rotated Sorted Array | medium | `findMin` |
| 6 | `time-based-kv-store` | Time Based Key-Value Store | medium | `TimeMap` (class) |

Difficulty spread is 1 easy / 5 medium — intentionally heavier than
Arrays/Two Pointers, same reasoning as the Stack topic: binary search
problems below "medium" are mostly restatements of the classic algorithm.
Confirmed acceptable.

Each problem follows the existing `Problem` content shape: markdown
`description`, `starterCode`, `functionName`, `testCases`, `maangTags`,
`difficulty`. `time-based-kv-store`'s `functionName` is `"TimeMap"`, using
the operations-based `TestCase` fields (`operations`/`args`) added for the
Stack topic — no harness changes required, this is the mechanism's second
consumer.

### Problem details

**1. `binary-search`** — `binarySearch(nums: number[], target: number): number`,
returns the index of `target` in a sorted `nums`, or `-1`.
- `{ input: [[-1,0,3,5,9,12], 9], expected: 4 }`
- `{ input: [[-1,0,3,5,9,12], 2], expected: -1 }`
- `{ input: [[5], 5], expected: 0 }`
- `{ input: [[], 5], expected: -1 }`

**2. `search-2d-matrix`** — `searchMatrix(matrix: number[][], target: number): boolean`.
Rows sorted ascending; each row's first value is greater than the previous
row's last value (matrix is a sorted array reshaped into rows) — binary
search treating the matrix as a flattened sorted array via
`row = Math.floor(mid / cols)`, `col = mid % cols`.
- `{ input: [[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3], expected: true }`
- `{ input: [[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 13], expected: false }`
- `{ input: [[[1]], 1], expected: true }`

**3. `koko-eating-bananas`** — `minEatingSpeed(piles: number[], h: number): number`
(LeetCode 875). Binary search on the answer space `[1, max(piles)]`; for a
candidate speed `k`, total hours = `sum(ceil(pile / k) for pile in piles)`;
find the minimum `k` where total hours `<= h`.
- `{ input: [[3,6,7,11], 8], expected: 4 }`
- `{ input: [[30,11,23,4,20], 5], expected: 30 }`
- `{ input: [[30,11,23,4,20], 6], expected: 23 }`

**4. `search-rotated-array`** — `search(nums: number[], target: number): number`
(LeetCode 33). `nums` is ascending-sorted then rotated at an unknown pivot,
all values distinct. Modified binary search: at each midpoint, determine
which half is properly sorted, then check if target lies in that half's
range.
- `{ input: [[4,5,6,7,0,1,2], 0], expected: 4 }`
- `{ input: [[4,5,6,7,0,1,2], 3], expected: -1 }`
- `{ input: [[1], 0], expected: -1 }`

**5. `find-min-rotated`** — `findMin(nums: number[]): number` (LeetCode 153).
Same rotated-array shape as #4, values distinct. Binary search comparing
`nums[mid]` to `nums[right]` to decide which half contains the rotation
point.
- `{ input: [[3,4,5,1,2]], expected: 1 }`
- `{ input: [[4,5,6,7,0,1,2]], expected: 0 }`
- `{ input: [[11,13,15,17]], expected: 11 }`

**6. `time-based-kv-store`** — `TimeMap` class (LeetCode 981).
- `set(key: string, value: string, timestamp: number): void`
- `get(key: string, timestamp: number): string` — returns the value set at
  the largest timestamp `<= timestamp` for `key`, or `""` if none exists.
  Each key's per-key timestamp list is append-only and strictly
  increasing (guaranteed by the problem), so `get` binary searches it.
- Operations-based test case (LeetCode's own example, verified by hand):
  ```
  operations: ["TimeMap","set","get","get","set","get","get"]
  args: [[], ["foo","bar",1], ["foo",1], ["foo",3], ["foo","bar2",4], ["foo",4], ["foo",5]]
  expected: [null, null, "bar", "bar", null, "bar2", "bar2"]
  ```

## Test harness

No changes. `time-based-kv-store` consumes the `operations`/`args`/
`expected` fields and worker branch built for the Stack topic's Min Stack
problem, unmodified. This is confirmation the mechanism generalizes to a
second class-based problem as intended.

**Files touched:**
- `src/content/problems/binary-search.ts` — new file, 6 problems.
- `src/content/topics.ts` — add `binary-search` topic entry.
- `src/content/index.ts` — wire up the new problems file (matches existing
  pattern for arrays/two-pointers/sliding-window/linked-lists/stack).

No changes to `types.ts`, `code-runner.worker.ts`, `run-code.ts`, or any UI
component.

## Testing / validation plan

Consistent with prior phases:

1. `npx tsc --noEmit` — type-check the new content.
2. Manual verification of correctness is via the task-level and
   whole-branch subagent reviews (no browser E2E task this phase, per the
   precedent set in the Linked Lists and Stack topics).

No new automated test infra introduced (none exists in this repo).

## Out of scope (this phase)

- Trees, Heaps, Backtracking, Trie, Graphs, DP, Greedy, Intervals, Math &
  Geometry, Bit Manipulation (later roadmap phases)
- Median of Two Sorted Arrays (hard-tier binary-search problem, considered
  and deferred — significantly harder than the rest of this topic's set;
  can be added to a later review-pass topic if needed)
- Any UI changes to `ProblemWorkspace`, `ProblemMarkdown`, or dashboard
  components
- Further generalizing the operations mechanism (already generalized by
  the Stack topic; this phase only reuses it)

# Linked Lists Topic + Non-JSON Test Harness Design Spec

**Date:** 2026-07-26
**Status:** Approved
**Author:** Roushan + Claude Code

## Goal

Ship the first post-v1 curriculum expansion — the "Linked Lists" foundation
topic — and extend the sandboxed test harness so it can express and grade
linked-list-shaped inputs/outputs, which the current JSON-only harness
cannot represent.

## Content scope

New topic `linked-lists`, track `foundation`, `order: 4` (next global slot
after `sliding-window`).

5 problems, in build/display order:

| # | Slug | Title | Difficulty | functionName |
|---|------|-------|-----------|--------------|
| 1 | `reverse-linked-list` | Reverse Linked List | easy | `reverseList` |
| 2 | `merge-two-sorted-lists` | Merge Two Sorted Lists | easy | `mergeTwoLists` |
| 3 | `linked-list-cycle` | Linked List Cycle | easy | `hasCycle` |
| 4 | `remove-nth-node-from-end-of-list` | Remove Nth Node From End of List | medium | `removeNthFromEnd` |
| 5 | `merge-k-sorted-lists` | Merge K Sorted Lists | hard | `mergeKLists` |

Difficulty spread is 3 easy / 1 medium / 1 hard — intentionally uneven
(deviates from Arrays' 2/3 split) because Merge K Sorted Lists was chosen
over Reorder List for extra interview weight, and the three easy problems
are genuinely single-pointer-traversal trivial. Confirmed acceptable.

Each problem follows the existing `Problem` content shape: markdown
`description`, `starterCode`, `functionName`, `testCases`, `maangTags`,
`difficulty`. Linked-list problems' `starterCode` additionally includes the
classic LeetCode comment-block list definition, e.g.:

```js
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *   this.val = (val === undefined ? 0 : val)
 *   this.next = (next === undefined ? null : next)
 * }
 */
```

This is a comment only — it does not declare a real class the student must
match. The harness's hydrate/dehydrate logic is duck-typed on `{val, next}`
shape, so it's independent of whatever (if anything) the student declares.

## Test harness extension

**Problem:** the current harness (`code-runner.worker.ts`) passes
`testCase.input` through `postMessage` structured-clone and calls
`fn(...testCase.input)` directly, comparing the return value to `expected`
via `JSON.stringify` equality. This only works for plain JSON-representable
values — there's no way to express a `ListNode` chain as a test case today.

**Approach: marker-based hydrate/dehydrate.** Fully backward-compatible —
existing 15 problems need zero changes.

- `TestCase.input` entries may contain tagged marker objects:
  - `{ __listNode: number[] }` — a plain singly-linked list built from the
    array.
  - `{ __cycleList: { values: number[]; pos: number } }` — a linked list
    with a cycle: `pos` is the 0-based index the tail's `next` points back
    to; `pos: -1` means no cycle.
- Before invoking the student's function, the worker deep-walks the
  `input` array (recursing through nested arrays/objects) and replaces any
  marker object it finds with a real `{val, next}` chain. Deep-walking
  means markers work when nested — e.g. `mergeKLists`'s single array
  argument containing three `__listNode` markers hydrates correctly with
  no per-argument-position configuration needed.
- `TestCase` gains one new optional field: `resultType?: "list"`. When set,
  the worker converts the student's *returned* list-shaped value back into
  a plain array (via traversal) before running the existing deep-equal
  comparison against `expected`. `expected` is always authored as a plain
  array/value — never a marker — since it's the harness's own comparison
  target, not something that needs hydrating.
- Omitting `resultType` preserves today's exact behavior (raw `actual` vs
  `expected`, no conversion) — this is how all 15 existing problems
  continue to work, untouched.
- Failure path: if dehydration throws (e.g. student returned `undefined`
  or a malformed shape), the existing per-test-case `try/catch` in the
  worker catches it and reports the raw returned value as `actual` for
  debugging, rather than crashing the whole test run.

**Files touched:**
- `src/content/types.ts` — add `resultType?: "list"` to `TestCase`.
- `src/workers/code-runner.worker.ts` — add marker hydration (deep-walk
  before calling `fn`) and list dehydration (when `resultType === "list"`,
  after calling `fn`, before comparison).
- `src/content/problems/linked-lists.ts` — new file, 5 problems.
- `src/content/topics.ts` — add `linked-lists` topic entry.
- `src/content/index.ts` — wire up the new problems file (matches existing
  pattern for arrays/two-pointers/sliding-window).

No changes to `run-code.ts` (already forwards the `testCases` blob
opaquely) or `ProblemWorkspace.tsx` (already renders `expected`/`actual`
via `formatJson` on whatever the worker returns — dehydrated `actual` and
plain-array `expected` are both clean, marker-free values by the time they
reach the UI, so no leakage of internal marker syntax to the student).

**Extensibility note (not part of this phase's scope):** the marker
vocabulary is intentionally a small `switch`/lookup inside one `hydrate()`
function, so a future topic (e.g. Trees needing `__treeNode`, or a
random-pointer list problem needing `__randomNode`) can add a new marker
case without redesigning the mechanism. Not building those now — YAGNI.

## Testing / validation plan

No test framework exists in this repo (`package.json` only has
`lint`/`build`/`db:*` scripts — no jest/vitest). Consistent with the v1
spec's "Out of scope: app test suite (manual verification)":

1. `npx tsc --noEmit` — type-check the harness changes and new content.
2. `npm run dev` + browser click-through for **all 5** new problems: paste
   a correct reference solution into each, click Run Tests, confirm all
   hidden test cases pass — including the no-cycle edge case
   (`linked-list-cycle` with `pos: -1`) and empty-list edge cases for the
   merge problems.

No new automated test infra introduced.

## Out of scope (this phase)

- Trees, Graphs, DP, Greedy, Backtracking, Heaps (later roadmap phases)
- `__randomNode` marker / Copy List with Random Pointer (no problem in
  this phase needs it)
- Any UI changes to `ProblemWorkspace`, `ProblemMarkdown`, or dashboard
  components
- README roadmap checkbox updates (can be a follow-up doc touch, not
  functional work)

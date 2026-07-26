# Stack Topic + Operations-Based Test Harness Design Spec

**Date:** 2026-07-27
**Status:** Approved
**Author:** Roushan + Claude Code

## Goal

Ship the second post-v1 curriculum expansion — the "Stack" pattern topic —
and extend the sandboxed test harness so it can grade class-based
(multi-method) problems, which the current function-only harness cannot
express.

## Content scope

New topic `stack`, track `pattern`, `order: 5` (next global slot after
`linked-lists`).

5 problems, in build/display order:

| # | Slug | Title | Difficulty | Entry point |
|---|------|-------|-----------|--------------|
| 1 | `valid-parentheses` | Valid Parentheses | easy | `isValid` |
| 2 | `min-stack` | Min Stack | medium | `MinStack` (class) |
| 3 | `evaluate-reverse-polish-notation` | Evaluate Reverse Polish Notation | medium | `evalRPN` |
| 4 | `generate-parentheses` | Generate Parentheses | medium | `generateParenthesis` |
| 5 | `daily-temperatures` | Daily Temperatures | medium | `dailyTemperatures` |

Difficulty spread is 1 easy / 4 medium — intentionally heavier than prior
topics because stack problems below "medium" are mostly restatements of
Valid Parentheses; confirmed acceptable.

Each problem follows the existing `Problem` content shape: markdown
`description`, `starterCode`, `functionName`, `testCases`, `maangTags`,
`difficulty`. `min-stack`'s `functionName` is `"MinStack"`, the class name
— the harness's `typeof functionName === "function"` check already passes
for ES6 classes (they're functions under the hood), so no change is needed
to how the harness locates the entry point.

## Test harness extension

**Problem:** the current harness (`code-runner.worker.ts`) only supports
pure functions: it hydrates `testCase.input`, calls
`fn(...hydratedInput)` once, and compares the return value to `expected`.
Min Stack (and any future "Design a data structure" problem — LRU Cache,
etc.) needs a *sequence* of method calls against one stateful instance,
which this shape cannot express.

**Approach: operations-based test cases.** Fully backward-compatible —
existing 20 problems (Arrays through Linked Lists) need zero changes.

- `TestCase` gains two new optional fields:
  - `operations?: string[]` — a method-call sequence. Index 0 is always
    the constructor call and must match the problem's `functionName`
    (the class name), by convention only (the harness does not enforce
    the name match — the classname `fn` reference is invoked directly at
    index 0 regardless of what string is written there, matching
    LeetCode's own display convention of writing the class name in the
    operations array).
  - `args?: unknown[][]` — arguments for each operation, index-aligned
    with `operations`.
- `TestCase.input` becomes optional (`input?: unknown[]`) since
  operations-based cases don't use it. `expected` is unchanged in type
  (`unknown`) but for operations-based cases is authored as an array,
  index-aligned with `operations`, with `null` at index 0 (the
  constructor's "return value").
- Worker behavior: when `testCase.operations` is present, the worker
  branches to a new execution path instead of the single-call path:
  1. `const instance = new fn(...hydrate(args[0]))` for index 0; push
     `null` onto an `outputs` array (constructors have no meaningful
     return value to grade).
  2. For each subsequent index `i`, call
     `instance[operations[i]](...hydrate(args[i]))` and push the result
     onto `outputs` — but first map a JS `undefined` return (e.g. from
     `push`/`pop` which return nothing) to `null`, matching the
     `expected` array's convention and LeetCode's own judge behavior.
  3. `actual` becomes the full `outputs` array, compared to `expected`
     via the existing `deepEqual` (unchanged — already array-safe via
     `JSON.stringify`).
- Marker hydration (`hydrate()`) is applied to each operation's `args`
  identically to how it's applied to `input` today — for free, no new
  code path needed. No Stack problem currently uses list/cycle markers,
  but this keeps the mechanism uniform for future class-based problems
  that might (e.g. a linked-list-backed design problem).
- Failure path: if a method doesn't exist on the instance, or the
  constructor/method throws, the existing per-test-case `try/catch` in
  the worker catches it. `actual` stays `undefined` (its initial value,
  same pattern as the list-dehydration failure path) since the throw
  happens before `actual` is assigned the `outputs` array; the worker
  reports the error message and `actual: undefined` rather than crashing
  the whole test run.

**Files touched:**
- `src/content/types.ts` — add `operations?: string[]` and
  `args?: unknown[][]` to `TestCase`; make `input` optional.
- `src/workers/code-runner.worker.ts` — mirror the same two fields on
  `WorkerTestCase`; add the operations-mode branch in the test-execution
  loop, alongside (not replacing) the existing function-call path.
- `src/content/problems/stack.ts` — new file, 5 problems.
- `src/content/topics.ts` — add `stack` topic entry.
- `src/content/index.ts` — wire up the new problems file (matches
  existing pattern for arrays/two-pointers/sliding-window/linked-lists).

No changes to `run-code.ts` (already forwards the `testCases` blob
opaquely) or `ProblemWorkspace.tsx` (renders whatever `actual`/`expected`
the worker returns — an operations-mode result is just a plain array by
the time it reaches the UI, no leakage of internal mechanics).

**Extensibility note (not part of this phase's scope):** this is the
second marker/mode-style extension to the harness (after linked lists'
hydrate/dehydrate), continuing the pattern of additive, optional
`TestCase` fields gated by presence-checks rather than a single
discriminated-union rewrite. A future "Design" problem (LRU Cache, etc.)
reuses this mechanism directly. Not building further generalization now —
YAGNI.

## Testing / validation plan

Consistent with prior phases:

1. `npx tsc --noEmit` — type-check the harness changes and new content.
2. Manual verification of correctness is via the task-level and
   whole-branch subagent reviews (no browser E2E task this phase, per the
   precedent set in the Linked Lists topic where E2E verification was
   dropped from the plan).

No new automated test infra introduced (none exists in this repo).

## Out of scope (this phase)

- Binary Search, Trees, Heaps, Backtracking, Trie, Graphs, DP, Greedy,
  Intervals, Math & Geometry, Bit Manipulation (later roadmap phases)
- Car Fleet (considered, deferred — physics/simulation flavor rather than
  pure stack mechanics; can be added to a later review-pass topic if
  needed)
- Any UI changes to `ProblemWorkspace`, `ProblemMarkdown`, or dashboard
  components
- Further generalizing the operations mechanism beyond what Min Stack
  needs (e.g. no generic "instance registry" or multi-instance support)

# Heaps Topic + Deep Solutions Retrofit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Heaps pattern topic (7 problems) and retrofit a "Deep Solutions" feature (multi-approach worked solutions, related problems, real-world usage, all in a new 4-tab UI) onto every problem in the app — the 7 new Heaps problems plus all 43 already-shipped problems, 50 total.

**Architecture:** Two additive, backward-compatible changes ride together: (1) a new optional `TestCase.unordered` flag plus `unorderedEqual` comparison in the grading worker, needed only by `k-closest-points-to-origin`; (2) a new optional `Solution[]` field plus `relatedSlugs`/`realWorldUsageMarkdown` on `Problem`, rendered by a new 4-tab switcher in `ProblemWorkspace.tsx`. No existing field changes meaning, no existing test behavior changes — every change is a new optional field or a new UI tab.

**Tech Stack:** Next.js App Router, TypeScript, React 19, `react-markdown` + `remark-gfm` (already wired, renders GFM tables and fenced code blocks with zero changes), Web Worker sandboxed grading (`src/workers/code-runner.worker.ts`).

## Global Constraints

- Full spec: `docs/superpowers/specs/2026-07-27-heaps-and-deep-solutions-design.md` — read it if any task here is ambiguous; this plan's literal values govern.
- No test framework in this repo (`package.json` has no `test` script — confirmed). Validation is `npx tsc --noEmit` (must stay clean after every task) and `npm run lint` (must stay clean for files the task touches). Trees/Binary Search topics used this same validation method — follow suit.
- Every new/modified `Problem` object must satisfy the `Problem` interface exactly as extended in Task 1 — no extra fields, no typos in field names (`solutions`, `relatedSlugs`, `realWorldUsageMarkdown`, all optional).
- `relatedSlugs` values must be real slugs that exist somewhere in the app once all 50 problems are shipped (cross-check against the full slug inventory in this plan — every slug used in every `relatedSlugs` array appears as a `slug:` value in some task in this plan).
- Every `dryRunMarkdown` trace must be checkable against the problem's own `testCases` — use the actual input/expected values already defined for that problem, never invented ones.
- Every `code` field in a `Solution` must be a correct, standalone, runnable solution to the problem (matching the problem's `functionName`/class shape) — not pseudocode.
- Difficulty spread and problem order for Heaps: exactly as listed in Task 3 below (2 easy / 4 medium / 1 hard, in that display order).
- Existing `description`, `starterCode`, `functionName`, and `testCases` on all 43 existing problems are UNCHANGED by this plan — backfill tasks only ADD `solutions`/`relatedSlugs`/`realWorldUsageMarkdown` fields to each existing problem object, nothing else in those files is touched except one exception: two existing Trees test-case rationale comments are untouched too (already correct from the Trees topic's own closeout).

---

## Task 1: Schema extension — `Solution` type, `Problem`/`TestCase` fields, `unorderedEqual` harness comparison

**Files:**
- Modify: `src/content/types.ts`
- Modify: `src/workers/code-runner.worker.ts`

**Interfaces:**
- Produces: `export interface Solution { approach: string; timeComplexity: string; spaceComplexity: string; overviewMarkdown: string; code: string; lineByLineMarkdown: string; dryRunMarkdown: string; }` in `src/content/types.ts`, plus `Problem.solutions?: Solution[]`, `Problem.relatedSlugs?: string[]`, `Problem.realWorldUsageMarkdown?: string`, and `TestCase.unordered?: boolean`. All later tasks that author problem content depend on this exact shape.
- Produces: `unorderedEqual(a: unknown, b: unknown): boolean` in `src/workers/code-runner.worker.ts`, used at the grading comparison site.

- [ ] **Step 1: Add `unordered` to `TestCase` in `src/content/types.ts`**

Open `src/content/types.ts`. The current `TestCase` interface (lines 6-15) is:

```typescript
export interface TestCase {
  input?: unknown[];
  expected: unknown;
  label?: string;
  resultType?: "list" | "tree";
  operations?: string[];
  args?: unknown[][];
  operationResultTypes?: Array<"tree" | null>;
  skipOutputCheck?: number[];
}
```

Add one field, `unordered?: boolean;`, so it reads:

```typescript
export interface TestCase {
  input?: unknown[];
  expected: unknown;
  label?: string;
  resultType?: "list" | "tree";
  operations?: string[];
  args?: unknown[][];
  operationResultTypes?: Array<"tree" | null>;
  skipOutputCheck?: number[];
  unordered?: boolean;
}
```

- [ ] **Step 2: Add the `Solution` interface and extend `Problem` in `src/content/types.ts`**

Immediately above the existing `export interface Problem {` block (currently lines 17-27), insert:

```typescript
export interface Solution {
  approach: string;
  timeComplexity: string;
  spaceComplexity: string;
  overviewMarkdown: string;
  code: string;
  lineByLineMarkdown: string;
  dryRunMarkdown: string;
}
```

Then extend the existing `Problem` interface — the current version is:

```typescript
export interface Problem {
  slug: string;
  title: string;
  difficulty: Difficulty;
  maangTags: MaangTag[];
  topicSlug: string;
  description: string;
  starterCode: string;
  functionName: string;
  testCases: TestCase[];
}
```

Add three optional fields at the end so it reads:

```typescript
export interface Problem {
  slug: string;
  title: string;
  difficulty: Difficulty;
  maangTags: MaangTag[];
  topicSlug: string;
  description: string;
  starterCode: string;
  functionName: string;
  testCases: TestCase[];
  solutions?: Solution[];
  relatedSlugs?: string[];
  realWorldUsageMarkdown?: string;
}
```

- [ ] **Step 3: Verify the type-check fails without the worker changes, then confirm types.ts alone is clean**

Run: `npx tsc --noEmit`
Expected: clean (types.ts changes are purely additive/optional — nothing consumes them yet, so this must already pass). If it does not pass, stop and re-check Steps 1-2 for a typo.

- [ ] **Step 4: Add `unordered` to the worker's local `WorkerTestCase` interface**

Open `src/workers/code-runner.worker.ts`. The current `WorkerTestCase` interface (lines 3-12) is:

```typescript
interface WorkerTestCase {
  input?: unknown[];
  expected: unknown;
  label?: string;
  resultType?: "list" | "tree";
  operations?: string[];
  args?: unknown[][];
  operationResultTypes?: Array<"tree" | null>;
  skipOutputCheck?: number[];
}
```

Add the same field:

```typescript
interface WorkerTestCase {
  input?: unknown[];
  expected: unknown;
  label?: string;
  resultType?: "list" | "tree";
  operations?: string[];
  args?: unknown[][];
  operationResultTypes?: Array<"tree" | null>;
  skipOutputCheck?: number[];
  unordered?: boolean;
}
```

- [ ] **Step 5: Add `unorderedEqual` next to `deepEqual`**

The current `deepEqual` function (lines 239-241) is:

```typescript
function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
```

Immediately after it, add:

```typescript
function unorderedEqual(a: unknown, b: unknown): boolean {
  if (!Array.isArray(a) || !Array.isArray(b)) return deepEqual(a, b);
  if (a.length !== b.length) return false;
  const sortedA = [...a].map((x) => JSON.stringify(x)).sort();
  const sortedB = [...b].map((x) => JSON.stringify(x)).sort();
  return deepEqual(sortedA, sortedB);
}
```

- [ ] **Step 6: Branch on `testCase.unordered` at the comparison site**

The current comparison site (line 355, inside the non-operations branch of the test-case map at lines 344-355) is:

```typescript
        const passed = deepEqual(actual, testCase.expected);
```

Change it to:

```typescript
        const passed = testCase.unordered
          ? unorderedEqual(actual, testCase.expected)
          : deepEqual(actual, testCase.expected);
```

This is the single comparison site used by both the `operations` branch and the plain `input`/`expected` branch (both fall through to this line), so this one change covers both.

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 8: Manual smoke test of `unorderedEqual`**

No test framework exists in this repo, so verify the new function's logic directly with a throwaway Node script (delete it after):

```bash
cat > /tmp/unordered-check.mjs << 'EOF'
function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function unorderedEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return deepEqual(a, b);
  if (a.length !== b.length) return false;
  const sortedA = [...a].map((x) => JSON.stringify(x)).sort();
  const sortedB = [...b].map((x) => JSON.stringify(x)).sort();
  return deepEqual(sortedA, sortedB);
}
console.assert(unorderedEqual([[3,3],[-2,4]], [[-2,4],[3,3]]) === true, "reordered arrays should match");
console.assert(unorderedEqual([[3,3],[-2,4]], [[3,3],[-2,4]]) === true, "identical order should match");
console.assert(unorderedEqual([[3,3]], [[-2,4]]) === false, "different contents should not match");
console.assert(unorderedEqual([[3,3],[-2,4]], [[3,3]]) === false, "different lengths should not match");
console.assert(unorderedEqual(5, 5) === true, "non-array scalars fall back to deepEqual");
console.log("all unorderedEqual checks passed");
EOF
node /tmp/unordered-check.mjs
rm /tmp/unordered-check.mjs
```

Expected output: `all unordered checks passed` with no assertion failures printed.

- [ ] **Step 9: Lint**

Run: `npm run lint`
Expected: clean on `src/content/types.ts` and `src/workers/code-runner.worker.ts`.

- [ ] **Step 10: Commit**

```bash
git add src/content/types.ts src/workers/code-runner.worker.ts
git commit -m "Add Solution/related/real-world fields and unordered test comparison"
```

## Task 2: Heaps topic — 7 problems with full Deep Solutions content

**Files:**
- Create: `src/content/problems/heaps.ts`
- Modify: `src/content/topics.ts`
- Modify: `src/content/index.ts`

**Interfaces:**
- Consumes: `Solution`, `Problem.solutions?`, `Problem.relatedSlugs?`, `Problem.realWorldUsageMarkdown?`, `TestCase.unordered?` from Task 1's `src/content/types.ts`.
- Produces: `export const heapProblems: Problem[]` (7 problems, slugs `kth-largest-in-stream`, `last-stone-weight`, `k-closest-points-to-origin`, `kth-largest-element-in-array`, `task-scheduler`, `design-twitter`, `find-median-from-data-stream`), the `heaps` topic entry in `topics.ts`, and `heapProblems` wired into `index.ts`'s `allProblems` array. Task 4 (backfill topics) does not depend on this task's output, but the whole-branch review and `relatedSlugs` cross-checks do.

- [ ] **Step 1: Create `src/content/problems/heaps.ts`**

```typescript
import type { Problem } from "../types";

export const heapProblems: Problem[] = [
  {
    slug: "kth-largest-in-stream",
    title: "Kth Largest Element in a Stream",
    difficulty: "easy",
    maangTags: ["Amazon", "Google"],
    topicSlug: "heaps",
    functionName: "KthLargest",
    description: `## Problem

Design a class to find the \`k\`-th largest element in a stream of numbers. \`KthLargest(k, nums)\` initializes the object with the integer \`k\` and an initial stream \`nums\`. \`add(val)\` appends \`val\` to the stream and returns the current \`k\`-th largest element.

## Example

\`\`\`
Input:  ["KthLargest","add","add","add","add","add"]
        [[3,[4,5,8,2]],[3],[5],[10],[9],[4]]
Output: [null,4,5,5,8,8]
\`\`\`

## Senior interview angle

Keep a **min-heap capped at size \`k\`**. Its root is always the \`k\`-th largest value seen so far, because everything smaller than the root has been evicted. Each \`add\` is O(log k), not O(n log n) — the size-\`k\` cap is what makes this a heap problem instead of a sorting problem.

## Pattern

\`Fixed-size min-heap\` — the base case for every later "top-K of a stream" problem in this topic.`,
    starterCode: `class KthLargest {
  /**
   * @param {number} k
   * @param {number[]} nums
   */
  constructor(k, nums) {
    // Your code here
  }

  /**
   * @param {number} val
   * @return {number}
   */
  add(val) {
    // Your code here
  }
}`,
    testCases: [
      {
        operations: ["KthLargest", "add", "add", "add", "add", "add"],
        args: [[3, [4, 5, 8, 2]], [3], [5], [10], [9], [4]],
        expected: [null, 4, 5, 5, 8, 8],
      },
      {
        operations: ["KthLargest", "add", "add", "add", "add", "add"],
        args: [[1, []], [-3], [-2], [-4], [0], [4]],
        expected: [null, -3, -2, -2, 0, 4],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Re-sort on Every Add)",
        timeComplexity: "O(n log n) per add",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Keep every number seen so far in a plain array. On each `add`, push the new value, sort the whole array ascending, and read the element `k` from the end. Correct, but re-sorts the entire history on every single call.",
        code: `class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.nums = [...nums];
  }

  add(val) {
    this.nums.push(val);                       // append new value
    this.nums.sort((a, b) => a - b);            // O(n log n) full re-sort
    return this.nums[this.nums.length - this.k]; // k-th from the end
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 1-2 | \`constructor(k, nums)\` | Store \`k\` and copy the initial stream so we never mutate the caller's array. |
| 3 | \`this.k = k\` | Remember how many "largest" elements matter. |
| 4 | \`this.nums = [...nums]\` | Own copy — every future \`add\` grows this array. |
| 8 | \`this.nums.push(val)\` | Append the new stream value. |
| 9 | \`this.nums.sort((a, b) => a - b)\` | Full ascending re-sort — O(n log n), the cost this problem's heap solution exists to avoid. |
| 10 | \`return this.nums[this.nums.length - this.k]\` | With ascending order, index \`length - k\` is exactly the \`k\`-th largest. |`,
        dryRunMarkdown: `**Dry run 1** — \`k=3, nums=[4,5,8,2]\`:
\`add(3)\`: nums=[4,5,8,2,3] → sort → [2,3,4,5,8] → index 5-3=2 → **4**
\`add(5)\`: nums=[2,3,4,5,8,5] → sort → [2,3,4,5,5,8] → index 6-3=3 → **5**
\`add(10)\`: sort → [2,3,4,5,5,8,10] → index 7-3=4 → **5**
\`add(9)\`: sort → [2,3,4,5,5,8,9,10] → index 8-3=5 → **8**
\`add(4)\`: sort → [2,3,4,4,5,5,8,9,10] → index 9-3=6 → **8**
Results: [4,5,5,8,8] — matches expected.

**Dry run 2** — \`k=1, nums=[]\`:
\`add(-3)\`: [-3] → index 1-1=0 → **-3**
\`add(-2)\`: [-3,-2] → index 1 → **-2**
\`add(-4)\`: [-4,-3,-2] → index 2 → **-2**
\`add(0)\`: [-4,-3,-2,0] → index 3 → **0**
\`add(4)\`: [-4,-3,-2,0,4] → index 4 → **4**
Results: [-3,-2,-2,0,4] — matches expected.`,
      },
      {
        approach: "Optimal (Fixed-Size Min-Heap)",
        timeComplexity: "O(log k) per add, O(n log k) to build",
        spaceComplexity: "O(k)",
        overviewMarkdown:
          "Maintain a min-heap that never holds more than `k` elements. On every push, if the heap grows past `k`, pop the minimum — the smallest of the current top-`k` is exactly what deserves eviction. The heap's root is always the `k`-th largest value seen so far.",
        code: `class MinHeap {
  constructor() { this.data = []; }
  size() { return this.data.length; }
  peek() { return this.data[0]; }
  push(val) {
    this.data.push(val);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p] <= this.data[i]) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length) {
      this.data[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let smallest = i;
        if (l < this.data.length && this.data[l] < this.data[smallest]) smallest = l;
        if (r < this.data.length && this.data[r] < this.data[smallest]) smallest = r;
        if (smallest === i) break;
        [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
        i = smallest;
      }
    }
    return top;
  }
}

class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.heap = new MinHeap();
    for (const num of nums) this.add(num);      // reuse add() to seed the stream
  }

  add(val) {
    this.heap.push(val);
    if (this.heap.size() > this.k) this.heap.pop(); // evict the smallest over-capacity element
    return this.heap.peek();                         // root = k-th largest
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 32-34 | \`constructor(k, nums)\` | Store \`k\`, create an empty min-heap, then feed every initial number through \`add\` so seeding and streaming share one code path. |
| 37 | \`this.heap.push(val)\` | Insert the new value; heap grows to size ≤ k+1. |
| 38 | \`if (this.heap.size() > this.k) this.heap.pop()\` | If capacity is exceeded, remove the current smallest — it's no longer in the top \`k\`. |
| 39 | \`return this.heap.peek()\` | The heap's root is the smallest of the current top-\`k\`, i.e. the \`k\`-th largest overall. |
| 5-13 (helper) | \`push(val)\` | Standard sift-up: append then bubble toward the root while a child is smaller than its parent. |
| 15-29 (helper) | \`pop()\` | Standard sift-down: move the last element to the root, then bubble it down toward its smaller child until the heap property holds. |`,
        dryRunMarkdown: `**Dry run 1** — \`k=3, nums=[4,5,8,2]\` (contents shown as sorted sets, not raw array layout):
Constructor seeds via \`add\`: add4→{4}; add5→{4,5}; add8→{4,5,8}; add2→push2→{2,4,5,8} size4>3→pop min(2)→{4,5,8}.
\`add(3)\`: push3→{3,4,5,8} size4>3→pop min(3)→{4,5,8}. peek=**4**
\`add(5)\`: push5→{4,5,5,8} size4>3→pop min(4)→{5,5,8}. peek=**5**
\`add(10)\`: push10→{5,5,8,10} size4>3→pop min(5)→{5,8,10}. peek=**5**
\`add(9)\`: push9→{5,8,9,10} size4>3→pop min(5)→{8,9,10}. peek=**8**
\`add(4)\`: push4→{4,8,9,10} size4>3→pop min(4)→{8,9,10}. peek=**8**
Results: [4,5,5,8,8] — matches expected.

**Dry run 2** — \`k=1, nums=[]\`:
\`add(-3)\`: push-3→{-3} size1 not>1. peek=**-3**
\`add(-2)\`: push-2→{-3,-2} size2>1→pop min(-3)→{-2}. peek=**-2**
\`add(-4)\`: push-4→{-4,-2} size2>1→pop min(-4)→{-2}. peek=**-2**
\`add(0)\`: push0→{-2,0} size2>1→pop min(-2)→{0}. peek=**0**
\`add(4)\`: push4→{0,4} size2>1→pop min(0)→{4}. peek=**4**
Results: [-3,-2,-2,0,4] — matches expected.`,
      },
    ],
    relatedSlugs: ["kth-largest-element-in-array", "find-median-from-data-stream"],
    realWorldUsageMarkdown: `A capped min-heap is exactly how a **live leaderboard** or **trending-scores** widget stays cheap: instead of re-sorting every score on every update, it keeps only the current top-K and evicts the weakest entry on overflow. The same shape shows up in monitoring systems that need "the current \`k\`-th highest latency/error-rate reading" from a metrics stream without retaining full history.`,
  },
  {
    slug: "last-stone-weight",
    title: "Last Stone Weight",
    difficulty: "easy",
    maangTags: ["Amazon", "Google"],
    topicSlug: "heaps",
    functionName: "lastStoneWeight",
    description: `## Problem

You are given an array \`stones\` of stone weights. On each turn, smash the two heaviest stones together: if they're equal, both are destroyed; otherwise the lighter is destroyed and the heavier becomes \`heavier - lighter\`. Return the weight of the last remaining stone, or \`0\` if none remain.

## Example

\`\`\`
Input: stones = [2,7,4,1,8,1]
Output: 1
\`\`\`

## Senior interview angle

"Repeatedly grab the two largest" is a max-heap tell. Each smash is two pops and at most one push, all O(log n) — versus rescanning the whole array for the top two every round.

## Pattern

\`Max-heap simulation\` — repeatedly extract-max, transform, reinsert.`,
    starterCode: `/**
 * @param {number[]} stones
 * @return {number}
 */
function lastStoneWeight(stones) {
  // Your code here
}`,
    testCases: [
      { input: [[2, 7, 4, 1, 8, 1]], expected: 1 },
      { input: [[1]], expected: 1 },
      { input: [[2, 2]], expected: 0 },
    ],
    solutions: [
      {
        approach: "Brute Force (Linear Scan for the Top Two)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Each round, scan the remaining stones to find the index of the heaviest, remove it, scan again for the new heaviest, remove that too, and push back the nonzero difference. No heap needed, but every round costs a full linear scan.",
        code: `function lastStoneWeight(stones) {
  const arr = [...stones];
  while (arr.length > 1) {
    let i1 = 0;
    for (let i = 1; i < arr.length; i++) {          // find heaviest
      if (arr[i] > arr[i1]) i1 = i;
    }
    const a = arr.splice(i1, 1)[0];
    let i2 = 0;
    for (let i = 1; i < arr.length; i++) {          // find new heaviest
      if (arr[i] > arr[i2]) i2 = i;
    }
    const b = arr.splice(i2, 1)[0];
    if (a !== b) arr.push(a - b);                    // remainder survives
  }
  return arr.length ? arr[0] : 0;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`const arr = [...stones]\` | Work on a copy so the caller's array is untouched. |
| 3 | \`while (arr.length > 1)\` | Keep smashing while two or more stones remain. |
| 4-7 | first scan loop | Linear scan to find the index of the current heaviest stone. |
| 8 | \`arr.splice(i1, 1)[0]\` | Remove and capture it as \`a\`. |
| 9-12 | second scan loop | Linear scan (over the now-shorter array) for the next heaviest. |
| 13 | \`arr.splice(i2, 1)[0]\` | Remove and capture it as \`b\`. |
| 14 | \`if (a !== b) arr.push(a - b)\` | Equal stones annihilate; unequal stones leave a remainder. |
| 16 | \`return arr.length ? arr[0] : 0\` | One stone left → its weight; none left → 0. |`,
        dryRunMarkdown: `**Dry run 1** — \`[2,7,4,1,8,1]\`:
Round1: heaviest=8, remove→[2,7,4,1,1]; heaviest=7, remove→[2,4,1,1]; diff=1→push→[2,4,1,1,1]
Round2: heaviest=4→[2,1,1,1]; heaviest=2→[1,1,1]; diff=2→push→[1,1,1,2]
Round3: heaviest=2→[1,1,1]; heaviest=1→[1,1]; diff=1→push→[1,1,1]
Round4: heaviest=1→[1,1]; heaviest=1→[1]; diff=0→nothing pushed→[1]
length=1, loop ends → return **1** — matches expected.

**Dry run 2** — \`[2,2]\`:
Round1: heaviest=2→[2]; heaviest=2→[]; diff=0→nothing pushed→[]
length=0, loop ends → return **0** — matches expected.`,
      },
      {
        approach: "Optimal (Max-Heap)",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Push every stone into a max-heap. Repeatedly pop the two heaviest; if they differ, push the difference back. The heap always hands you the two current heaviest in O(log n), instead of a full O(n) rescan each round.",
        code: `class MaxHeap {
  constructor(values = []) {
    this.data = [...values];
    for (let i = (this.data.length >> 1) - 1; i >= 0; i--) this.siftDown(i); // O(n) heapify
  }
  size() { return this.data.length; }
  push(val) {
    this.data.push(val);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p] >= this.data[i]) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length) { this.data[0] = last; this.siftDown(0); }
    return top;
  }
  siftDown(i) {
    while (true) {
      const l = 2 * i + 1, r = 2 * i + 2;
      let largest = i;
      if (l < this.data.length && this.data[l] > this.data[largest]) largest = l;
      if (r < this.data.length && this.data[r] > this.data[largest]) largest = r;
      if (largest === i) break;
      [this.data[i], this.data[largest]] = [this.data[largest], this.data[i]];
      i = largest;
    }
  }
}

function lastStoneWeight(stones) {
  const heap = new MaxHeap(stones);      // O(n) heapify
  while (heap.size() > 1) {
    const a = heap.pop();                // heaviest
    const b = heap.pop();                // second heaviest
    if (a !== b) heap.push(a - b);       // smashed remainder survives
  }
  return heap.size() ? heap.pop() : 0;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 30 | \`const heap = new MaxHeap(stones)\` | Build a max-heap from all stones in O(n) via heapify — not O(n log n) one-at-a-time inserts. |
| 31 | \`while (heap.size() > 1)\` | Keep smashing while at least two stones remain to compare. |
| 32 | \`const a = heap.pop()\` | Remove and return the current heaviest stone, O(log n). |
| 33 | \`const b = heap.pop()\` | Remove and return the next-heaviest stone. |
| 34 | \`if (a !== b) heap.push(a - b)\` | Equal stones annihilate each other (nothing pushed back); unequal stones leave a remainder stone with weight \`a - b\`. |
| 35 | \`return heap.size() ? heap.pop() : 0\` | One stone survives → return its weight; none survive → return \`0\`. |`,
        dryRunMarkdown: `**Dry run 1** — \`[2,7,4,1,8,1]\`:
heapify → {8,7,4,2,1,1} → pop8,pop7 → push(8-7=1) → {4,2,1,1,1} → pop4,pop2 → push(4-2=2) → {2,1,1,1} → pop2,pop1 → push(2-1=1) → {1,1,1} → pop1,pop1 → equal, push nothing → {1} → size=1, loop ends → return **1** — matches expected.

**Dry run 2** — \`[2,2]\`:
heapify → {2,2} → pop2,pop2 → equal, push nothing → {} → size=0, loop ends → return **0** — matches expected.`,
      },
    ],
    relatedSlugs: ["kth-largest-element-in-array", "task-scheduler"],
    realWorldUsageMarkdown: `The "repeatedly combine the two largest" shape appears in **Huffman coding** (merge the two least-frequent nodes, generalized to a min-heap) and in load-balancing simulations where the two heaviest jobs/loads get merged or reconciled each round until the system settles.`,
  },
  {
    slug: "k-closest-points-to-origin",
    title: "K Closest Points to Origin",
    difficulty: "medium",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "heaps",
    functionName: "kClosest",
    description: `## Problem

Given an array of \`points\` where \`points[i] = [x, y]\`, return the \`k\` points closest to the origin \`(0, 0)\`, in **any order**.

## Example

\`\`\`
Input: points = [[3,3],[5,-1],[-2,4]], k = 2
Output: [[3,3],[-2,4]]
\`\`\`

## Senior interview angle

Compare **squared** Euclidean distance — \`x*x + y*y\` — never take an actual square root; it's monotonic with true distance and avoids floating point entirely. Because output order doesn't matter, a **max-heap capped at size \`k\`** (evict the farthest when over capacity) beats a full sort.

## Pattern

\`Fixed-size max-heap on a derived key\` — same fixed-size-heap shape as Kth Largest in a Stream, keyed on squared distance instead of raw value.`,
    starterCode: `/**
 * @param {number[][]} points
 * @param {number} k
 * @return {number[][]}
 */
function kClosest(points, k) {
  // Your code here
}`,
    testCases: [
      { input: [[[1, 3], [-2, 2]], 1], expected: [[-2, 2]], unordered: true },
      {
        input: [[[3, 3], [5, -1], [-2, 4]], 2],
        expected: [[3, 3], [-2, 4]],
        unordered: true,
      },
      {
        input: [[[1, 1], [3, 3], [2, 2]], 2],
        expected: [[1, 1], [2, 2]],
        unordered: true,
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Sort by Distance)",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Compute each point's squared distance, sort all points ascending by that key, and take the first `k`. Simple and correct, but sorts the entire array even when `k` is tiny.",
        code: `function kClosest(points, k) {
  const sorted = [...points].sort(
    (a, b) => (a[0] ** 2 + a[1] ** 2) - (b[0] ** 2 + b[1] ** 2), // ascending by squared distance
  );
  return sorted.slice(0, k);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`const sorted = [...points].sort(...)\` | Copy the array (don't mutate the caller's), sort ascending by squared distance from origin. |
| 3 | \`(a[0]**2 + a[1]**2) - (b[0]**2 + b[1]**2)\` | Squared distance avoids \`Math.sqrt\`; the comparator is still correctly ordered because squaring is monotonic for non-negative distances. |
| 5 | \`return sorted.slice(0, k)\` | The first \`k\` entries of a distance-ascending sort are the \`k\` closest. |`,
        dryRunMarkdown: `**Dry run 1** — \`points=[[3,3],[5,-1],[-2,4]], k=2\`:
distances: [3,3]→9+9=18, [5,-1]→25+1=26, [-2,4]→4+16=20
sort ascending by distance: [3,3](18), [-2,4](20), [5,-1](26)
slice(0,2) → **[[3,3],[-2,4]]** — matches expected (order-insensitive).

**Dry run 2** — \`points=[[1,1],[3,3],[2,2]], k=2\`:
distances: [1,1]→2, [3,3]→18, [2,2]→8
sort ascending: [1,1](2), [2,2](8), [3,3](18)
slice(0,2) → **[[1,1],[2,2]]** — matches expected.`,
      },
      {
        approach: "Optimal (Fixed-Size Max-Heap)",
        timeComplexity: "O(n log k)",
        spaceComplexity: "O(k)",
        overviewMarkdown:
          "Keep a max-heap of at most `k` points, keyed by squared distance. Push each point; if the heap exceeds size `k`, pop the farthest — it can't be among the final `k` closest. What remains in the heap at the end is exactly the answer, since output order is unconstrained.",
        code: `class Heap {
  constructor(compare) { this.data = []; this.compare = compare; }
  size() { return this.data.length; }
  toArray() { return this.data; }
  push(val) {
    this.data.push(val);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.compare(this.data[p], this.data[i]) <= 0) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length) {
      this.data[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let best = i;
        if (l < this.data.length && this.compare(this.data[l], this.data[best]) < 0) best = l;
        if (r < this.data.length && this.compare(this.data[r], this.data[best]) < 0) best = r;
        if (best === i) break;
        [this.data[i], this.data[best]] = [this.data[best], this.data[i]];
        i = best;
      }
    }
    return top;
  }
}

function kClosest(points, k) {
  const dist = ([x, y]) => x * x + y * y;
  const heap = new Heap((a, b) => dist(b) - dist(a)); // "smaller" = farther, so max-heap pops farthest first
  for (const point of points) {
    heap.push(point);
    if (heap.size() > k) heap.pop();                   // evict the current farthest
  }
  return heap.toArray();
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 32 | \`const dist = ([x, y]) => x * x + y * y\` | Squared-distance key, computed on demand. |
| 33 | \`new Heap((a, b) => dist(b) - dist(a))\` | Comparator returns negative when \`a\` is farther than \`b\`, so this \`Heap\` behaves as a max-heap on distance — its root is always the current farthest point. |
| 34-37 | \`for (const point of points) { heap.push(point); if (heap.size() > k) heap.pop(); }\` | Push every point; whenever the heap exceeds capacity \`k\`, evict the farthest — it cannot be in the final top-\`k\` closest. |
| 38 | \`return heap.toArray()\` | Whatever remains is exactly the \`k\` closest points, in heap-internal (unspecified) order — fine since the problem allows any order. |`,
        dryRunMarkdown: `**Dry run 1** — \`points=[[3,3],[5,-1],[-2,4]], k=2\` (heap contents shown as \`point(dist)\`):
push[3,3](18) → {[3,3](18)}
push[5,-1](26) → {[3,3](18),[5,-1](26)} size2, not>2
push[-2,4](20) → {[3,3](18),[5,-1](26),[-2,4](20)} size3>2 → pop farthest [5,-1](26) → {[3,3](18),[-2,4](20)}
Result: **[[3,3],[-2,4]]** — matches expected (order-insensitive).

**Dry run 2** — \`points=[[1,1],[3,3],[2,2]], k=2\`:
push[1,1](2) → {[1,1](2)}
push[3,3](18) → {[1,1](2),[3,3](18)} size2, not>2
push[2,2](8) → {[1,1](2),[3,3](18),[2,2](8)} size3>2 → pop farthest [3,3](18) → {[1,1](2),[2,2](8)}
Result: **[[1,1],[2,2]]** — matches expected.`,
      },
    ],
    relatedSlugs: ["kth-largest-element-in-array", "merge-k-sorted-lists"],
    realWorldUsageMarkdown: `Fixed-size max-heaps on a distance key power **"nearest K" geospatial queries** — ride-share driver matching, store locators, and the candidate-generation step of k-nearest-neighbor recommendation systems, where a full sort of every point against every query would be too slow at scale.`,
  },
  {
    slug: "kth-largest-element-in-array",
    title: "Kth Largest Element in an Array",
    difficulty: "medium",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "heaps",
    functionName: "findKthLargest",
    description: `## Problem

Given an integer array \`nums\` and an integer \`k\`, return the \`k\`-th largest element — the \`k\`-th largest in **sorted order**, not the \`k\`-th distinct value.

## Example

\`\`\`
Input: nums = [3,2,1,5,6,4], k = 2
Output: 5
\`\`\`

## Senior interview angle

Same fixed-size min-heap trick as Kth Largest in a Stream, applied to a static array instead of a live stream. Mention **quickselect** (average O(n), Hoare partition around a random pivot) as the alternative that beats O(n log k) on average, at the cost of a worse O(n²) worst case without care.

## Pattern

\`Fixed-size min-heap\` — the static-array counterpart to Kth Largest in a Stream; same heap invariant, no streaming state to maintain between calls.`,
    starterCode: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
function findKthLargest(nums, k) {
  // Your code here
}`,
    testCases: [
      { input: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
      { input: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
      { input: [[1], 1], expected: 1 },
    ],
    solutions: [
      {
        approach: "Brute Force (Sort Descending)",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Sort a copy of `nums` in descending order and read index `k - 1`. Correct and simple, but does far more work than necessary when `k` is small relative to `n`.",
        code: `function findKthLargest(nums, k) {
  const sorted = [...nums].sort((a, b) => b - a); // descending
  return sorted[k - 1];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`[...nums].sort((a, b) => b - a)\` | Copy and sort descending, so index 0 is the largest. |
| 3 | \`return sorted[k - 1]\` | 1-indexed \`k\`-th largest sits at 0-indexed position \`k - 1\`. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[3,2,1,5,6,4], k=2\`:
sort descending → [6,5,4,3,2,1]
index k-1=1 → **5** — matches expected.

**Dry run 2** — \`nums=[3,2,3,1,2,4,5,5,6], k=4\`:
sort descending → [6,5,5,4,3,3,2,2,1]
index k-1=3 → **4** — matches expected.`,
      },
      {
        approach: "Optimal (Fixed-Size Min-Heap)",
        timeComplexity: "O(n log k)",
        spaceComplexity: "O(k)",
        overviewMarkdown:
          "Push every number into a min-heap capped at size `k`, popping the minimum whenever the cap is exceeded. After processing all `n` numbers, the heap holds exactly the `k` largest, and its root — the smallest of those — is the `k`-th largest overall.",
        code: `class MinHeap {
  constructor() { this.data = []; }
  size() { return this.data.length; }
  peek() { return this.data[0]; }
  push(val) {
    this.data.push(val);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p] <= this.data[i]) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length) {
      this.data[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let smallest = i;
        if (l < this.data.length && this.data[l] < this.data[smallest]) smallest = l;
        if (r < this.data.length && this.data[r] < this.data[smallest]) smallest = r;
        if (smallest === i) break;
        [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
        i = smallest;
      }
    }
    return top;
  }
}

function findKthLargest(nums, k) {
  const heap = new MinHeap();
  for (const num of nums) {
    heap.push(num);
    if (heap.size() > k) heap.pop();      // evict the smallest over-capacity element
  }
  return heap.peek();                      // root = k-th largest
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 31 | \`const heap = new MinHeap()\` | Start with an empty capped heap. |
| 32-35 | \`for (const num of nums) { heap.push(num); if (heap.size() > k) heap.pop(); }\` | Push every number; whenever the heap exceeds \`k\`, evict the current minimum — it can't be among the final top-\`k\` largest. |
| 36 | \`return heap.peek()\` | After the pass, the heap holds the \`k\` largest values; its root is the smallest of them, i.e. the \`k\`-th largest overall. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[3,2,1,5,6,4], k=2\`:
push3→{3}; push2→{2,3}; push1→{1,2,3} size3>2→pop1→{2,3}; push5→{2,3,5} size3>2→pop2→{3,5}; push6→{3,5,6} size3>2→pop3→{5,6}; push4→{4,5,6} size3>2→pop4→{5,6}
Final heap {5,6}, peek=**5** — matches expected.

**Dry run 2** — \`nums=[3,2,3,1,2,4,5,5,6], k=4\`:
push3→{3}; push2→{2,3}; push3→{2,3,3}; push1→{1,2,3,3} size4, not>4
push2→{1,2,2,3,3} size5>4→pop1→{2,2,3,3}
push4→{2,2,3,3,4} size5>4→pop2→{2,3,3,4}
push5→{2,3,3,4,5} size5>4→pop2→{3,3,4,5}
push5→{3,3,4,5,5} size5>4→pop3→{3,4,5,5}
push6→{3,4,5,5,6} size5>4→pop3→{4,5,5,6}
Final heap {4,5,5,6}, peek=**4** — matches expected.`,
      },
    ],
    relatedSlugs: ["kth-largest-in-stream", "k-closest-points-to-origin"],
    realWorldUsageMarkdown: `The fixed-size heap here is the textbook mechanism behind **percentile/threshold computations** — e.g. tracking the "95th percentile latency" bucket boundary from a batch of measurements without a full sort — and is the same idea database query planners use for top-K selection pushdown.`,
  },
  {
    slug: "task-scheduler",
    title: "Task Scheduler",
    difficulty: "medium",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "heaps",
    functionName: "leastInterval",
    description: `## Problem

Given a list \`tasks\` (each a letter representing a task type) and a non-negative cooldown \`n\`, return the minimum number of time units to finish all tasks. The same task type must be separated by at least \`n\` other units of time (idle allowed).

## Example

\`\`\`
Input: tasks = ["A","A","A","B","B","B"], n = 2
Output: 8
\`\`\`

## Senior interview angle

Two valid mental models, both worth knowing: **simulate it** with a max-heap of remaining frequencies plus a cooldown queue (concrete, generalizes if the rules change), or derive the **closed-form**: let \`maxFreq\` be the highest task frequency and \`numMax\` the count of tasks tied at that frequency; the answer is \`max(tasks.length, (maxFreq - 1) * (n + 1) + numMax)\`. The most-frequent task defines \`(maxFreq - 1)\` full cooldown cycles of length \`n + 1\`, and \`numMax\` accounts for every tied-for-most-frequent task needing its own slot in the final cycle.

## Pattern

\`Max-heap simulation, with a closed-form shortcut\` — the heap simulation is the intuitive/generalizable answer; the formula is the O(n) optimization once the invariant is understood.`,
    starterCode: `/**
 * @param {string[]} tasks
 * @param {number} n
 * @return {number}
 */
function leastInterval(tasks, n) {
  // Your code here
}`,
    testCases: [
      { input: [["A", "A", "A", "B", "B", "B"], 2], expected: 8 },
      { input: [["A", "A", "A", "B", "B", "B"], 0], expected: 6 },
      {
        input: [["A", "A", "A", "A", "A", "A", "B", "C", "D", "E", "F", "G"], 2],
        expected: 16,
      },
    ],
    solutions: [
      {
        approach: "Simulation (Max-Heap + Cooldown Queue)",
        timeComplexity: "O(total · log 26)",
        spaceComplexity: "O(26)",
        overviewMarkdown:
          "Count each task's frequency and load them into a max-heap. Each time unit, pop the most-frequent available task and execute it; if it still has remaining count, it goes into a cooldown queue tagged with the time it becomes available again (`currentTime + n + 1`). Before popping, move any cooled-down tasks from the queue back into the heap. Idle a unit whenever nothing is available.",
        code: `class MaxHeap {
  constructor(values = []) {
    this.data = [...values];
    for (let i = (this.data.length >> 1) - 1; i >= 0; i--) this.siftDown(i);
  }
  size() { return this.data.length; }
  push(val) {
    this.data.push(val);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p] >= this.data[i]) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length) { this.data[0] = last; this.siftDown(0); }
    return top;
  }
  siftDown(i) {
    while (true) {
      const l = 2 * i + 1, r = 2 * i + 2;
      let largest = i;
      if (l < this.data.length && this.data[l] > this.data[largest]) largest = l;
      if (r < this.data.length && this.data[r] > this.data[largest]) largest = r;
      if (largest === i) break;
      [this.data[i], this.data[largest]] = [this.data[largest], this.data[i]];
      i = largest;
    }
  }
}

function leastInterval(tasks, n) {
  const freq = new Map();
  for (const t of tasks) freq.set(t, (freq.get(t) ?? 0) + 1);
  const heap = new MaxHeap([...freq.values()]);
  const cooldown = [];                                  // [remainingCount, availableAtTime]
  let time = 0;
  let remainingTasks = tasks.length;

  while (remainingTasks > 0) {
    while (cooldown.length && cooldown[0][1] <= time) {  // move cooled-down tasks back
      heap.push(cooldown.shift()[0]);
    }
    if (heap.size() === 0) {
      time++;                                            // nothing available: idle
      continue;
    }
    const count = heap.pop() - 1;
    remainingTasks--;
    if (count > 0) cooldown.push([count, time + n + 1]);
    time++;
  }
  return time;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 30-31 | \`freq\` map | Count occurrences of each task letter. |
| 32 | \`new MaxHeap([...freq.values()])\` | Heapify the raw frequency counts (letters don't matter for scheduling, only counts do). |
| 33 | \`cooldown = []\` | Holds \`[remainingCount, availableAtTime]\` pairs for tasks currently on cooldown. |
| 38-40 | \`while (cooldown.length && cooldown[0][1] <= time)\` | Before picking a task this tick, move any task whose cooldown has expired back into the heap. |
| 41-44 | \`if (heap.size() === 0) { time++; continue; }\` | Nothing available to run this tick — idle and advance time. |
| 45-46 | \`const count = heap.pop() - 1; remainingTasks--\` | Run the most-frequent available task once; account for one fewer remaining instance. |
| 47 | \`if (count > 0) cooldown.push([count, time + n + 1])\` | If the task still has instances left, it can't run again until \`n\` units after this one. |
| 48 | \`time++\` | Every executed or idle tick advances the clock by one. |`,
        dryRunMarkdown: `**Dry run 1** — \`tasks=[A,A,A,B,B,B], n=2\` (freq A=3,B=3):
t0: heap={3(A),3(B)} → pop A(rem2) → cooldown [A available@3] 
t1: heap={3(B)} → pop B(rem2) → cooldown [A@3, B@4]
t2: heap={} , nothing available (A@3,B@4 not yet) → idle
t3: A cools down → heap={2(A)} → pop A(rem1) → cooldown [B@4, A@6]
t4: B cools down → heap={2(B)} → pop B(rem1) → cooldown [A@6, B@7]
t5: heap={} → idle
t6: A cools down → heap={1(A)} → pop A(rem0, done)
t7: B cools down → heap={1(B)} → pop B(rem0, done)
All tasks done after tick 7 → total time = **8** — matches expected.

**Dry run 2** — \`tasks=[A,A,A,B,B,B], n=0\` (no cooldown gap):
t0: pop A(rem2, avail@1) t1: pop B(rem2, avail@2) t2: pop A(rem1, avail@3) t3: pop B(rem1, avail@4) t4: pop A(rem0, done) t5: pop B(rem0, done)
Total time = **6** — matches expected.`,
      },
      {
        approach: "Optimal (Closed-Form Frequency Math)",
        timeComplexity: "O(n) (n = tasks.length)",
        spaceComplexity: "O(26)",
        overviewMarkdown:
          "Count frequencies. Let `maxFreq` be the highest count and `numMax` how many task types share it. The most-frequent task type forces `(maxFreq - 1)` full cycles of length `n + 1` (one execution plus cooldown), and the final cycle needs one slot per tied-for-most-frequent task. If there are enough other distinct tasks to fill every cooldown gap, the answer degrades to simply `tasks.length` — hence the `max` with the raw count.",
        code: `function leastInterval(tasks, n) {
  const freq = new Map();
  for (const t of tasks) freq.set(t, (freq.get(t) ?? 0) + 1);

  const maxFreq = Math.max(...freq.values());
  const numMax = [...freq.values()].filter((f) => f === maxFreq).length;

  const gapsFilled = (maxFreq - 1) * (n + 1) + numMax;
  return Math.max(tasks.length, gapsFilled);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`freq\` map | Count occurrences of each task letter. |
| 5 | \`const maxFreq = Math.max(...freq.values())\` | The most frequent task type defines the longest chain of forced cooldowns. |
| 6 | \`numMax = [...freq.values()].filter((f) => f === maxFreq).length\` | How many task types are tied for that maximum — each needs its own slot in the final (incomplete) cycle. |
| 8 | \`(maxFreq - 1) * (n + 1) + numMax\` | \`(maxFreq - 1)\` full cycles of length \`n + 1\` (execute + cooldown), plus the final cycle holding exactly \`numMax\` executions with no trailing cooldown needed. |
| 9 | \`Math.max(tasks.length, gapsFilled)\` | If other tasks are plentiful enough to fill every cooldown gap with real work, the schedule can't be shorter than just running every task once. |`,
        dryRunMarkdown: `**Dry run 1** — \`tasks=[A,A,A,B,B,B], n=2\`:
freq={A:3,B:3} → maxFreq=3, numMax=2 (A and B both hit 3)
gapsFilled = (3-1)*(2+1)+2 = 2*3+2 = 8
max(tasks.length=6, 8) = **8** — matches expected.

**Dry run 2** — \`tasks=[A,A,A,A,A,A,B,C,D,E,F,G], n=2\`:
freq={A:6,B:1,C:1,D:1,E:1,F:1,G:1} → maxFreq=6, numMax=1 (only A)
gapsFilled = (6-1)*(2+1)+1 = 5*3+1 = 16
max(tasks.length=12, 16) = **16** — matches expected.`,
      },
    ],
    relatedSlugs: ["daily-temperatures", "merge-intervals"],
    realWorldUsageMarkdown: `This is a real **CPU/thread scheduler** shape: enforcing a minimum cooldown between repeated job types prevents any single job from starving others or hammering a shared resource (a rate-limited external API, a specific database shard). Job queues that rate-limit "the same job type can't run twice within N seconds" implement exactly this cooldown-cycle logic.`,
  },
  {
    slug: "design-twitter",
    title: "Design Twitter",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta", "Google"],
    topicSlug: "heaps",
    functionName: "Twitter",
    description: `## Problem

Design a simplified Twitter. Implement \`Twitter\`:
- \`postTweet(userId, tweetId)\` — user composes a new tweet.
- \`getNewsFeed(userId)\` — the 10 most recent tweet IDs from the user and everyone they follow, most recent first.
- \`follow(followerId, followeeId)\` / \`unfollow(followerId, followeeId)\`.

## Example

\`\`\`
Input:  ["Twitter","postTweet","getNewsFeed","follow","postTweet","getNewsFeed","unfollow","getNewsFeed"]
        [[],[1,5],[1],[1,2],[2,6],[1],[1,2],[1]]
Output: [null,null,[5],null,null,[6,5],null,[5]]
\`\`\`

## Senior interview angle

Tag every tweet with a **global, strictly increasing timestamp counter** at post time — that turns "most recent" into a plain numeric comparison. \`getNewsFeed\` is then a **k-way merge**: each candidate (self + followees) contributes a timestamp-sorted list of tweets, and a max-heap merges them, always pulling the globally most recent tweet next, until 10 are collected or every source is exhausted.

## Pattern

\`K-way merge via max-heap\` — the same idea as Merge K Sorted Lists, but merging per-user tweet timelines instead of linked lists, capped at 10 results instead of merging every element.`,
    starterCode: `class Twitter {
  constructor() {
    // Your code here
  }

  /**
   * @param {number} userId
   * @param {number} tweetId
   * @return {void}
   */
  postTweet(userId, tweetId) {
    // Your code here
  }

  /**
   * @param {number} userId
   * @return {number[]}
   */
  getNewsFeed(userId) {
    // Your code here
  }

  /**
   * @param {number} followerId
   * @param {number} followeeId
   * @return {void}
   */
  follow(followerId, followeeId) {
    // Your code here
  }

  /**
   * @param {number} followerId
   * @param {number} followeeId
   * @return {void}
   */
  unfollow(followerId, followeeId) {
    // Your code here
  }
}`,
    testCases: [
      {
        operations: [
          "Twitter", "postTweet", "getNewsFeed", "follow", "postTweet", "getNewsFeed", "unfollow", "getNewsFeed",
        ],
        args: [[], [1, 5], [1], [1, 2], [2, 6], [1], [1, 2], [1]],
        expected: [null, null, [5], null, null, [6, 5], null, [5]],
      },
      {
        operations: ["Twitter", "postTweet", "postTweet", "getNewsFeed", "getNewsFeed"],
        args: [[], [1, 10], [1, 11], [1], [2]],
        expected: [null, null, null, [11, 10], []],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Collect All, Sort, Slice)",
        timeComplexity: "O(t log t) per getNewsFeed (t = total tweets from self + followees)",
        spaceComplexity: "O(t)",
        overviewMarkdown:
          "Give every tweet a timestamp on post. For `getNewsFeed`, gather every tweet from the caller and everyone they follow into one array, sort descending by timestamp, and take the first 10. Simple, but re-collects and re-sorts everything on every call.",
        code: `class Twitter {
  constructor() {
    this.time = 0;
    this.tweets = new Map();   // userId -> [{ tweetId, time }]
    this.following = new Map(); // userId -> Set of followeeIds
  }

  postTweet(userId, tweetId) {
    if (!this.tweets.has(userId)) this.tweets.set(userId, []);
    this.tweets.get(userId).push({ tweetId, time: this.time++ });
  }

  getNewsFeed(userId) {
    const sources = [userId, ...(this.following.get(userId) ?? [])];
    const all = sources.flatMap((id) => this.tweets.get(id) ?? []);
    all.sort((a, b) => b.time - a.time);       // most recent first
    return all.slice(0, 10).map((t) => t.tweetId);
  }

  follow(followerId, followeeId) {
    if (!this.following.has(followerId)) this.following.set(followerId, new Set());
    this.following.get(followerId).add(followeeId);
  }

  unfollow(followerId, followeeId) {
    this.following.get(followerId)?.delete(followeeId);
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-4 | constructor | Global \`time\` counter, per-user tweet lists, per-user following sets. |
| 8-9 | \`postTweet\` | Append the tweet tagged with the current global time, then increment the counter. |
| 12 | \`sources = [userId, ...(this.following.get(userId) ?? [])]\` | Self plus every followee — the candidate pool for the feed. |
| 13 | \`sources.flatMap((id) => this.tweets.get(id) ?? [])\` | Flatten every candidate's tweets into one array. |
| 14 | \`all.sort((a, b) => b.time - a.time)\` | Sort descending by post time. |
| 15 | \`all.slice(0, 10).map((t) => t.tweetId)\` | Top 10 most recent, tweet IDs only. |
| 18-19 | \`follow\` | Lazily create the follower's following-set, then add the followee. |
| 22 | \`unfollow\` | Optional-chained delete — safe even if \`follow\` was never called for this user. |`,
        dryRunMarkdown: `**Dry run 1** — matching the example operation sequence:
\`postTweet(1,5)\` → tweets[1]=[{5,t0}], time=1
\`getNewsFeed(1)\` → sources=[1], all=[{5,t0}] → **[5]**
\`follow(1,2)\` → following[1]={2}
\`postTweet(2,6)\` → tweets[2]=[{6,t1}], time=2
\`getNewsFeed(1)\` → sources=[1,2], all=[{5,t0},{6,t1}] → sort desc → [{6,t1},{5,t0}] → **[6,5]**
\`unfollow(1,2)\` → following[1]={}
\`getNewsFeed(1)\` → sources=[1], all=[{5,t0}] → **[5]**
Results: [null,[5],null,null,[6,5],null,[5]] (excluding the constructor's leading null) — matches expected.

**Dry run 2** — \`postTweet(1,10); postTweet(1,11); getNewsFeed(1); getNewsFeed(2)\`:
tweets[1]=[{10,t0},{11,t1}]
\`getNewsFeed(1)\` → sort desc → [{11,t1},{10,t0}] → **[11,10]**
\`getNewsFeed(2)\` → sources=[2], no tweets, no following → **[]**
Matches expected \`[[11,10],[]]\`.`,
      },
      {
        approach: "Optimal (K-Way Merge via Max-Heap)",
        timeComplexity: "O(f + 10 log f) per getNewsFeed (f = number of followees + self)",
        spaceComplexity: "O(f)",
        overviewMarkdown:
          "Instead of collecting every tweet, seed a max-heap with just the most recent tweet from each candidate source (self + followees). Pop the globally most-recent tweet, and if that source has an older tweet, push it in next. Stop after 10 pops or an empty heap — this touches at most one heap operation per candidate tweet actually needed, not every tweet in history.",
        code: `class Heap {
  constructor(compare) { this.data = []; this.compare = compare; }
  size() { return this.data.length; }
  push(val) {
    this.data.push(val);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.compare(this.data[p], this.data[i]) <= 0) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length) {
      this.data[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let best = i;
        if (l < this.data.length && this.compare(this.data[l], this.data[best]) < 0) best = l;
        if (r < this.data.length && this.compare(this.data[r], this.data[best]) < 0) best = r;
        if (best === i) break;
        [this.data[i], this.data[best]] = [this.data[best], this.data[i]];
        i = best;
      }
    }
    return top;
  }
}

class Twitter {
  constructor() {
    this.time = 0;
    this.tweets = new Map();    // userId -> [{ tweetId, time }] oldest to newest
    this.following = new Map();
  }

  postTweet(userId, tweetId) {
    if (!this.tweets.has(userId)) this.tweets.set(userId, []);
    this.tweets.get(userId).push({ tweetId, time: this.time++ });
  }

  getNewsFeed(userId) {
    const sources = [userId, ...(this.following.get(userId) ?? [])];
    const heap = new Heap((a, b) => b.time - a.time); // max-heap by time
    for (const id of sources) {
      const list = this.tweets.get(id);
      if (list?.length) heap.push({ ...list[list.length - 1], userId: id, idx: list.length - 1 });
    }
    const result = [];
    while (result.length < 10 && heap.size() > 0) {
      const entry = heap.pop();
      result.push(entry.tweetId);
      if (entry.idx > 0) {
        const list = this.tweets.get(entry.userId);
        heap.push({ ...list[entry.idx - 1], userId: entry.userId, idx: entry.idx - 1 });
      }
    }
    return result;
  }

  follow(followerId, followeeId) {
    if (!this.following.has(followerId)) this.following.set(followerId, new Set());
    this.following.get(followerId).add(followeeId);
  }

  unfollow(followerId, followeeId) {
    this.following.get(followerId)?.delete(followeeId);
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 40 | \`sources = [userId, ...followees]\` | Same candidate pool as the brute force. |
| 41 | \`new Heap((a, b) => b.time - a.time)\` | Max-heap keyed by tweet time — root is always the globally most recent unconsumed tweet. |
| 42-45 | seed loop | Push only each source's single most-recent tweet, tagged with which user it came from and its index, so the next-older tweet can be found later. |
| 47-54 | merge loop | Pop the most recent; record it; if that source has an older tweet left, push it in — this is the "k-way merge" step, advancing exactly one source at a time. |
| 48 | \`while (result.length < 10 && heap.size() > 0)\` | Stop at 10 results or when every source is exhausted, whichever comes first. |`,
        dryRunMarkdown: `**Dry run 1** — after \`follow(1,2)\` and both tweets posted, \`getNewsFeed(1)\`:
sources=[1,2]. tweets[1]=[{5,t0}], tweets[2]=[{6,t1}].
Seed heap: push{5,t0,user1,idx0}, push{6,t1,user2,idx0} → heap={ (6,t1) top, (5,t0) }
Pop (6,t1) → result=[6]; idx0 has no older tweet (idx-1<0) → nothing pushed
Pop (5,t0) → result=[6,5]; idx0 has no older tweet → nothing pushed
Heap empty → stop. Result=**[6,5]** — matches expected.

**Dry run 2** — \`postTweet(1,10); postTweet(1,11); getNewsFeed(1)\`:
tweets[1]=[{10,t0},{11,t1}] (index0=10 oldest, index1=11 newest).
Seed: only source is user1, most recent = {11,t1,idx1} → heap={(11,t1)}
Pop(11,t1) → result=[11]; idx1>0 → push tweets[1][0]={10,t0,idx0} → heap={(10,t0)}
Pop(10,t0) → result=[11,10]; idx0, no older → nothing pushed
Heap empty → stop. Result=**[11,10]** — matches expected.`,
      },
    ],
    relatedSlugs: ["merge-k-sorted-lists", "find-median-from-data-stream"],
    realWorldUsageMarkdown: `Fan-out-on-read social feeds work exactly this way in production: rather than storing a precomputed feed per user, the server **merges each followee's per-user timeline on read**, using a heap to avoid re-sorting the full history every request. Any system that merges multiple already-sorted per-source streams into one global ordered feed (log aggregation, multi-shard "recent activity" views) reuses this shape.`,
  },
  {
    slug: "find-median-from-data-stream",
    title: "Find Median From Data Stream",
    difficulty: "hard",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "heaps",
    functionName: "MedianFinder",
    description: `## Problem

Design a data structure that supports adding integers from a stream (\`addNum\`) and finding the median of all elements added so far (\`findMedian\`), at any point in the stream.

## Example

\`\`\`
Input:  ["MedianFinder","addNum","addNum","findMedian","addNum","findMedian"]
        [[],[1],[2],[],[3],[]]
Output: [null,null,null,1.5,null,2]
\`\`\`

## Senior interview angle

Split the stream into two halves with a heap each: a **max-heap for the lower half** and a **min-heap for the upper half**, rebalanced after every insert so their sizes never differ by more than 1. The median is then O(1) to read: either the larger heap's root (odd total) or the average of both roots (even total). This avoids the O(n) insert cost of keeping one fully sorted array.

## Pattern

\`Two-heap median maintenance\` — the canonical "streaming median" structure; the two-heap split generalizes to streaming percentile tracking beyond just the 50th.`,
    starterCode: `class MedianFinder {
  constructor() {
    // Your code here
  }

  /**
   * @param {number} num
   * @return {void}
   */
  addNum(num) {
    // Your code here
  }

  /**
   * @return {number}
   */
  findMedian() {
    // Your code here
  }
}`,
    testCases: [
      {
        operations: ["MedianFinder", "addNum", "addNum", "findMedian", "addNum", "findMedian"],
        args: [[], [1], [2], [], [3], []],
        expected: [null, null, null, 1.5, null, 2],
      },
      {
        operations: [
          "MedianFinder", "addNum", "addNum", "addNum", "findMedian", "addNum", "findMedian",
        ],
        args: [[], [5], [2], [8], [], [1], []],
        expected: [null, null, null, null, 5, null, 3.5],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Sorted Array Insert)",
        timeComplexity: "O(n) per addNum (insert position + shift), O(1) per findMedian",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Keep a single array always sorted. Every `addNum` finds the correct insert position (linear scan, or binary search for the position — the shift to make room is still O(n)) and splices the value in. `findMedian` just reads the middle index(es) directly.",
        code: `class MedianFinder {
  constructor() {
    this.nums = [];
  }

  addNum(num) {
    let i = 0;
    while (i < this.nums.length && this.nums[i] < num) i++; // find sorted insert position
    this.nums.splice(i, 0, num);
  }

  findMedian() {
    const n = this.nums.length;
    const mid = n >> 1;
    return n % 2 === 0
      ? (this.nums[mid - 1] + this.nums[mid]) / 2
      : this.nums[mid];
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-8 | \`addNum\` | Linear scan for the first index not less than \`num\`, then \`splice\` inserts it there, shifting later elements. |
| 12-13 | \`n\`, \`mid\` | Total count and the array's midpoint index. |
| 14-16 | \`n % 2 === 0 ? average of the two middle : the single middle\` | Even count → average the two central elements; odd count → the single central element is the median. |`,
        dryRunMarkdown: `**Dry run 1** — \`addNum(1); addNum(2); findMedian(); addNum(3); findMedian()\`:
addNum(1) → nums=[1]
addNum(2) → insert pos1 → nums=[1,2]
findMedian() → n=2 even, mid=1 → (nums[0]+nums[1])/2=(1+2)/2=**1.5**
addNum(3) → insert pos2 → nums=[1,2,3]
findMedian() → n=3 odd, mid=1 → nums[1]=**2**
Results: [1.5, 2] — matches expected.

**Dry run 2** — \`addNum(5); addNum(2); addNum(8); findMedian(); addNum(1); findMedian()\`:
addNum(5) → [5]; addNum(2) → insert pos0 → [2,5]; addNum(8) → insert pos2 → [2,5,8]
findMedian() → n=3 odd, mid=1 → nums[1]=**5**
addNum(1) → insert pos0 → [1,2,5,8]
findMedian() → n=4 even, mid=2 → (nums[1]+nums[2])/2=(2+5)/2=**3.5**
Results: [5, 3.5] — matches expected.`,
      },
      {
        approach: "Optimal (Two Heaps)",
        timeComplexity: "O(log n) per addNum, O(1) per findMedian",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Maintain `lo`, a max-heap holding the smaller half of the numbers, and `hi`, a min-heap holding the larger half, kept balanced so their sizes differ by at most 1 (with `lo` allowed exactly one extra element). Every `addNum` pushes to `lo`, moves `lo`'s max into `hi`, then — if that overcorrected — moves `hi`'s min back to `lo`. `findMedian` reads the root(s) directly.",
        code: `class MinHeap {
  constructor() { this.data = []; }
  size() { return this.data.length; }
  peek() { return this.data[0]; }
  push(val) {
    this.data.push(val);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p] <= this.data[i]) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length) {
      this.data[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let smallest = i;
        if (l < this.data.length && this.data[l] < this.data[smallest]) smallest = l;
        if (r < this.data.length && this.data[r] < this.data[smallest]) smallest = r;
        if (smallest === i) break;
        [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
        i = smallest;
      }
    }
    return top;
  }
}

class MaxHeap extends MinHeap {
  push(val) { super.push(-val); }
  pop() { return -super.pop(); }
  peek() { return -super.peek(); }
}

class MedianFinder {
  constructor() {
    this.lo = new MaxHeap();  // smaller half
    this.hi = new MinHeap();  // larger half
  }

  addNum(num) {
    this.lo.push(num);
    this.hi.push(this.lo.pop());               // move lo's max into hi
    if (this.hi.size() > this.lo.size()) {
      this.lo.push(this.hi.pop());              // rebalance back if hi overtook lo
    }
  }

  findMedian() {
    if (this.lo.size() > this.hi.size()) return this.lo.peek();
    return (this.lo.peek() + this.hi.peek()) / 2;
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 34-36 | \`MaxHeap extends MinHeap\` | Negating every value on the way in/out turns the min-heap into a max-heap with zero duplicated sift logic. |
| 40-41 | constructor | \`lo\` (max-heap) holds the lower half, \`hi\` (min-heap) holds the upper half. |
| 45 | \`this.lo.push(num)\` | Always insert into \`lo\` first — simplest consistent entry point. |
| 46 | \`this.hi.push(this.lo.pop())\` | Move \`lo\`'s current maximum into \`hi\` — guarantees every element in \`lo\` is ≤ every element in \`hi\`. |
| 47-49 | rebalance | If that push made \`hi\` strictly larger than \`lo\`, move \`hi\`'s minimum back — keeps sizes within 1 of each other, \`lo\` never smaller. |
| 53-54 | \`findMedian\` | Odd total (\`lo\` has the extra element) → \`lo\`'s max is the median; even total → average both roots. |`,
        dryRunMarkdown: `**Dry run 1** — \`addNum(1); addNum(2); findMedian(); addNum(3); findMedian()\`:
addNum(1): lo={1}→push→hi={1}. hi.size1>lo.size0→pop hi min1→lo={1}. Final lo={1},hi={}.
addNum(2): lo={1,2}max2→pop2→hi={2}. hi.size1>lo.size1? no→ no rebalance. Final lo={1},hi={2}.
findMedian(): lo.size1===hi.size1→even→(1+2)/2=**1.5** — matches.
addNum(3): lo={1,3}max3→pop3→hi={2,3}min2. hi.size2>lo.size1→pop hi min2→lo={1,2}max2. Final lo={1,2},hi={3}.
findMedian(): lo.size2>hi.size1→**2** — matches.

**Dry run 2** — \`addNum(5); addNum(2); addNum(8); findMedian(); addNum(1); findMedian()\`:
addNum(5): lo={5}→pop5→hi={5}. hi1>lo0→pop hi5→lo={5}. lo={5},hi={}.
addNum(2): lo={5,2}max5→pop5→hi={5}. hi1>lo1? no. lo={2},hi={5}.
addNum(8): lo={2,8}max8→pop8→hi={5,8}min5. hi2>lo1→pop hi5→lo={2,5}max5. lo={2,5},hi={8}.
findMedian(): lo.size2>hi.size1→**5** — matches.
addNum(1): lo={2,5,1}max5→pop5→hi={5,8}min5. hi2>lo2? no. lo={2,1},hi={5,8}.
findMedian(): lo.size2===hi.size2→(2+5)/2=**3.5** — matches.`,
      },
    ],
    relatedSlugs: ["kth-largest-in-stream", "kth-largest-element-in-array"],
    realWorldUsageMarkdown: `Real-time monitoring dashboards use the two-heap trick to report a **running median latency or price** from a live stream without re-sorting the full history on every tick — financial tick-data systems and infrastructure metrics pipelines both need "median so far" as new data points constantly arrive.`,
  },
];
```

- [ ] **Step 2: Add the `heaps` topic entry to `src/content/topics.ts`**

Insert this object at the end of the `topics` array (after the `trees` entry, before the closing `];`):

```typescript
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
```

- [ ] **Step 3: Wire `heaps.ts` into `src/content/index.ts`**

The current imports (lines 1-7) are:

```typescript
import { arrayProblems } from "./problems/arrays";
import { binarySearchProblems } from "./problems/binary-search";
import { linkedListProblems } from "./problems/linked-lists";
import { slidingWindowProblems } from "./problems/sliding-window";
import { stackProblems } from "./problems/stack";
import { treeProblems } from "./problems/trees";
import { twoPointerProblems } from "./problems/two-pointers";
```

Add the `heaps` import alphabetically (after `binary-search`, before `linked-lists`):

```typescript
import { arrayProblems } from "./problems/arrays";
import { binarySearchProblems } from "./problems/binary-search";
import { heapProblems } from "./problems/heaps";
import { linkedListProblems } from "./problems/linked-lists";
import { slidingWindowProblems } from "./problems/sliding-window";
import { stackProblems } from "./problems/stack";
import { treeProblems } from "./problems/trees";
import { twoPointerProblems } from "./problems/two-pointers";
```

Then the current `allProblems` array (lines 14-22) is:

```typescript
const allProblems: Problem[] = [
  ...arrayProblems,
  ...twoPointerProblems,
  ...slidingWindowProblems,
  ...linkedListProblems,
  ...stackProblems,
  ...binarySearchProblems,
  ...treeProblems,
];
```

Add `...heapProblems` (position doesn't affect correctness — appending at the end matches the topic's `order: 8` being last):

```typescript
const allProblems: Problem[] = [
  ...arrayProblems,
  ...twoPointerProblems,
  ...slidingWindowProblems,
  ...linkedListProblems,
  ...stackProblems,
  ...binarySearchProblems,
  ...treeProblems,
  ...heapProblems,
];
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: clean. If it fails, the most likely cause is a mismatched field name in one of the 7 `Solution` objects — cross-check against the `Solution` interface from Task 1.

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: clean on `src/content/problems/heaps.ts`, `src/content/topics.ts`, `src/content/index.ts`.

- [ ] **Step 6: Commit**

```bash
git add src/content/problems/heaps.ts src/content/topics.ts src/content/index.ts
git commit -m "Add Heaps topic with 7 problems and full Deep Solutions content"
```

## Task 3: UI — 4-tab switcher (Description / Solution / Related / Real-World)

**Files:**
- Modify: `src/components/ProblemWorkspace.tsx`

**Interfaces:**
- Consumes: `Problem.solutions?: Solution[]`, `Problem.relatedSlugs?: string[]`, `Problem.realWorldUsageMarkdown?: string` (Task 1), the 7 Heaps problems from Task 2 (used for manual smoke testing — they're the first problems with real `solutions`/`relatedSlugs`/`realWorldUsageMarkdown` data), `getProblemBySlug(slug: string): Problem | undefined` from `src/content/index.ts:31-33` (already exists, unmodified).
- Produces: no new exports — this is a leaf UI change. `ProblemMarkdown` (`src/components/ProblemMarkdown.tsx`) is reused as-is for rendering every tab's markdown content; it needs no changes since it already supports GFM tables and fenced code blocks via `remark-gfm`.

This task depends on Task 2 being merged first (or at least present in the working tree) so there's real `solutions`/`relatedSlugs`/`realWorldUsageMarkdown` data to manually verify the new tabs against — every other existing problem has those fields `undefined`, which only exercises the empty-state paths.

- [ ] **Step 1: Add tab state and reset it on problem change**

In `src/components/ProblemWorkspace.tsx`, the current state block (lines 46-53) is:

```typescript
  const { data: session } = useSession();
  const [code, setCode] = useState(initialCode ?? problem.starterCode);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ProgressStatus>(
    initialStatus ?? "unsolved",
  );
  const [result, setResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
```

Add a `WorkspaceTab` type above the component (after the `ProblemWorkspaceProps` interface, before `export function ProblemWorkspace`) and two new state variables in the block above:

```typescript
type WorkspaceTab = "description" | "solution" | "related" | "real-world";
```

```typescript
  const { data: session } = useSession();
  const [code, setCode] = useState(initialCode ?? problem.starterCode);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ProgressStatus>(
    initialStatus ?? "unsolved",
  );
  const [result, setResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("description");
  const [activeApproachIndex, setActiveApproachIndex] = useState(0);
```

The current `useEffect` that resets per-problem state (lines 55-60) is:

```typescript
  useEffect(() => {
    setCode(initialCode ?? problem.starterCode);
    setStatus(initialStatus ?? "unsolved");
    setResult(null);
    setSaveMessage(null);
  }, [problem.slug, initialCode, initialStatus, problem.starterCode]);
```

Add the two new pieces of state to its reset so navigating to the next/previous problem always lands back on the Description tab and the first Solution approach:

```typescript
  useEffect(() => {
    setCode(initialCode ?? problem.starterCode);
    setStatus(initialStatus ?? "unsolved");
    setResult(null);
    setSaveMessage(null);
    setActiveTab("description");
    setActiveApproachIndex(0);
  }, [problem.slug, initialCode, initialStatus, problem.starterCode]);
```

- [ ] **Step 2: Replace the single-panel content area with the 4-tab switcher**

The current content area (lines 160-162) is:

```typescript
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ProblemMarkdown description={problem.description} />
        </div>
```

Replace it with a tab bar plus a content area that branches on `activeTab`:

```typescript
        <div className="flex border-b border-zinc-200 px-5 dark:border-zinc-800">
          {(
            [
              { key: "description", label: "Description" },
              { key: "solution", label: "Solution" },
              { key: "related", label: "Related" },
              { key: "real-world", label: "Real-World" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
                activeTab === tab.key
                  ? "border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {activeTab === "description" && (
            <ProblemMarkdown description={problem.description} />
          )}

          {activeTab === "solution" && (
            <>
              {!problem.solutions || problem.solutions.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No worked solution has been written up for this problem yet.
                </p>
              ) : (
                <>
                  {problem.solutions.length > 1 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {problem.solutions.map((solution, index) => (
                        <button
                          key={solution.approach}
                          type="button"
                          onClick={() => setActiveApproachIndex(index)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset ${
                            activeApproachIndex === index
                              ? "bg-violet-600 text-white ring-violet-600"
                              : "text-zinc-600 ring-zinc-300 hover:bg-zinc-100 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {solution.approach}
                        </button>
                      ))}
                    </div>
                  )}
                  <ProblemMarkdown
                    description={buildSolutionMarkdown(
                      problem.solutions[
                        Math.min(activeApproachIndex, problem.solutions.length - 1)
                      ],
                    )}
                  />
                </>
              )}
            </>
          )}

          {activeTab === "related" && (
            <>
              {!problem.relatedSlugs || problem.relatedSlugs.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No related problems have been linked yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {problem.relatedSlugs.map((slug) => {
                    const related = getProblemBySlug(slug);
                    if (!related) return null;
                    return (
                      <li key={slug}>
                        <Link
                          href={`/problems/${slug}`}
                          className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm hover:border-violet-400 dark:border-zinc-700"
                        >
                          <span>{related.title}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${difficultyBadgeClass(related.difficulty)}`}
                          >
                            {related.difficulty}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}

          {activeTab === "real-world" && (
            <ProblemMarkdown
              description={
                problem.realWorldUsageMarkdown ??
                "Real-world usage notes have not been written for this problem yet."
              }
            />
          )}
        </div>
```

- [ ] **Step 3: Add the `buildSolutionMarkdown` helper and the `getProblemBySlug` import**

`buildSolutionMarkdown` composes one `Solution` object's structured fields into a single markdown string, reusing `ProblemMarkdown`'s existing GFM-table and fenced-code-block rendering instead of building bespoke JSX for each field. Add it above the `ProblemWorkspace` component, right after the `WorkspaceTab` type added in Step 1:

```typescript
type WorkspaceTab = "description" | "solution" | "related" | "real-world";

function buildSolutionMarkdown(solution: Problem["solutions"] extends (infer S)[] | undefined ? S : never): string {
  return `## Overview

${solution.overviewMarkdown}

**Time complexity:** ${solution.timeComplexity} · **Space complexity:** ${solution.spaceComplexity}

## Code

\`\`\`javascript
${solution.code}
\`\`\`

## Line by Line

${solution.lineByLineMarkdown}

## Dry Run

${solution.dryRunMarkdown}`;
}
```

Add `getProblemBySlug` to the existing content import. The current import (line 8) is:

```typescript
import type { Problem, ProgressStatus, RunResult } from "@/content/types";
```

Change it to also import `getProblemBySlug` from `@/content` (the barrel that re-exports `types` via `export * from "./types"`, per `src/content/index.ts:11`):

```typescript
import { getProblemBySlug } from "@/content";
import type { Problem, ProgressStatus, RunResult } from "@/content/types";
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: clean. If `buildSolutionMarkdown`'s parameter type errors, simplify it to `(solution: NonNullable<Problem["solutions"]>[number])` — both spellings are equivalent, but if the conditional type trips up the compiler in this TS version, the indexed-access form is the safer fallback.

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: clean on `src/components/ProblemWorkspace.tsx`.

- [ ] **Step 6: Manual smoke test**

Run: `npm run dev`, then in a browser:
1. Visit `/problems/kth-largest-in-stream` (a Heaps problem from Task 2, with real `solutions`/`relatedSlugs`/`realWorldUsageMarkdown`).
2. Confirm all 4 tabs render: Description (unchanged from before), Solution (shows a pill switcher for "Brute Force..." vs "Optimal...", overview/code/table/dry-run render correctly, code block is syntax-visible), Related (2 linked problems with working `/problems/<slug>` links), Real-World (renders the writeup).
3. Click between the two Solution pills and confirm the content swaps.
4. Click "Next" to navigate to `last-stone-weight` and confirm the tab resets to Description and the approach pill resets to the first solution.
5. Visit `/problems/two-sum` (a pre-existing problem with no `solutions`/`relatedSlugs`/`realWorldUsageMarkdown` yet, until Task 4 lands) and confirm the Solution/Related/Real-World tabs show their empty-state messages instead of crashing.

- [ ] **Step 7: Commit**

```bash
git add src/components/ProblemWorkspace.tsx
git commit -m "Add Description/Solution/Related/Real-World tab switcher to ProblemWorkspace"
```

## Task 4: Backfill Deep Solutions — Arrays & Hashing (5 problems)

**Files:**
- Modify: `src/content/problems/arrays.ts`

**Interfaces:**
- Consumes: `Solution` type and `Problem.solutions?`/`relatedSlugs?`/`realWorldUsageMarkdown?` from Task 1's `src/content/types.ts`.
- Produces: nothing new — this task only adds data to existing `Problem` objects. `description`, `starterCode`, `functionName`, and `testCases` on all 5 problems are UNCHANGED.

Each step below inserts three new fields (`solutions`, `relatedSlugs`, `realWorldUsageMarkdown`) immediately after a problem's existing `testCases` array and before that problem object's closing `},`. The anchor shown in each step's "Find" block is the exact current closing of that problem's `testCases` array in `src/content/problems/arrays.ts` — match it verbatim (it is unique per problem) and insert the new fields right after it, keeping the trailing `},`.

- [ ] **Step 1: `two-sum` — add solutions**

Find:
```typescript
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] },
    ],
  },
```

Replace with (same content, fields appended before the closing `},`):

```typescript
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] },
    ],
    solutions: [
      {
        approach: "Brute Force (Nested Loop)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Check every pair of indices for a sum equal to `target`. Correct and simple, but rechecks pairs that a single pass could rule out immediately.",
        code: `function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return [];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`for (let i = 0; ...)\` | Fix the first index of the pair. |
| 3 | \`for (let j = i + 1; ...)\` | Scan every later index so no pair is checked twice or against itself. |
| 4 | \`if (nums[i] + nums[j] === target) return [i, j]\` | Found the pair — return immediately. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[3,2,4], target=6\`:
i=0(3): j=1(2)→5≠6; j=2(4)→7≠6
i=1(2): j=2(4)→6=6 → return **[1,2]** — matches expected.

**Dry run 2** — \`nums=[3,3], target=6\`:
i=0(3): j=1(3)→6=6 → return **[0,1]** — matches expected.`,
      },
      {
        approach: "Optimal (Hash Map Complement Lookup)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Walk the array once. Before adding the current number to a map, check whether its complement (`target - nums[i]`) is already in the map — if so, the pair is found in one pass. Each number is inserted once and looked up once.",
        code: `function twoSum(nums, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`const seen = new Map()\` | Maps a value already seen to its index. |
| 4 | \`const complement = target - nums[i]\` | The value that would complete the pair with the current number. |
| 5 | \`if (seen.has(complement)) return [seen.get(complement), i]\` | If that complement was already seen, we've found the pair — return its earlier index and the current index. |
| 6 | \`seen.set(nums[i], i)\` | Record the current number for future lookups, only reached if no match yet. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[3,2,4], target=6\`:
i=0(3): complement=3, not in map → map={3:0}
i=1(2): complement=4, not in map → map={3:0,2:1}
i=2(4): complement=2, in map at index1 → return **[1,2]** — matches expected.

**Dry run 2** — \`nums=[3,3], target=6\`:
i=0(3): complement=3, not in map (map empty) → map={3:0}
i=1(3): complement=3, in map at index0 → return **[0,1]** — matches expected.`,
      },
    ],
    relatedSlugs: ["two-sum-ii", "three-sum"],
    realWorldUsageMarkdown: `The complement-lookup pattern shows up anywhere two records need to be matched by a combined value: reconciling a payment against a target invoice amount, pairing transactions that cancel out to zero, or matching cache keys in O(1) instead of rescanning a log.`,
  },
```

- [ ] **Step 2: `contains-duplicate` — add solutions**

Find:
```typescript
    testCases: [
      { input: [[1, 2, 3, 1]], expected: true },
      { input: [[1, 2, 3, 4]], expected: false },
      { input: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: [[1, 2, 3, 1]], expected: true },
      { input: [[1, 2, 3, 4]], expected: false },
      { input: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true },
    ],
    solutions: [
      {
        approach: "Brute Force (Nested Loop)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Compare every pair of elements. If any two match, a duplicate exists. No extra memory, but quadratic time.",
        code: `function containsDuplicate(nums) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] === nums[j]) return true;
    }
  }
  return false;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | nested loops | Compare every index \`i\` against every later index \`j\`. |
| 4 | \`if (nums[i] === nums[j]) return true\` | A match found anywhere means a duplicate exists. |
| 6 | \`return false\` | No pair matched after checking all of them. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,3,1]\`:
i=0(1): j=1(2)no; j=2(3)no; j=3(1) match! → return **true** — matches expected.

**Dry run 2** — \`[1,2,3,4]\`:
All \`(i,j)\` pairs checked, no equal values found → return **false** — matches expected.`,
      },
      {
        approach: "Optimal (Hash Set)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Walk the array once, adding each value to a set. If a value is already in the set before it's added, it's a duplicate — return immediately without scanning the rest.",
        code: `function containsDuplicate(nums) {
  const seen = new Set();
  for (const num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`const seen = new Set()\` | Tracks every distinct value encountered so far. |
| 4 | \`if (seen.has(num)) return true\` | Seeing a value already in the set means it appeared twice — a duplicate. |
| 5 | \`seen.add(num)\` | Only reached on a first sighting — record it for future comparisons. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,3,1]\`:
1: not seen → {1}. 2: not seen → {1,2}. 3: not seen → {1,2,3}. 1: already in set → return **true** — matches expected.

**Dry run 2** — \`[1,2,3,4]\`:
Every value is new when checked → set grows to {1,2,3,4}, loop ends → return **false** — matches expected.`,
      },
    ],
    relatedSlugs: ["two-sum", "longest-substring-without-repeating"],
    realWorldUsageMarkdown: `A hash set for "have I seen this before" is the core of deduplication passes in ETL pipelines, detecting repeated event IDs in a message queue (idempotency checks), and flagging duplicate rows before a database insert.`,
  },
```

- [ ] **Step 3: `product-of-array-except-self` — add solutions**

Find:
```typescript
    testCases: [
      { input: [[1, 2, 3, 4]], expected: [24, 12, 8, 6] },
      { input: [[-1, 1, 0, -3, 3]], expected: [0, 0, 9, 0, 0] },
      { input: [[2, 3]], expected: [3, 2] },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: [[1, 2, 3, 4]], expected: [24, 12, 8, 6] },
      { input: [[-1, 1, 0, -3, 3]], expected: [0, 0, 9, 0, 0] },
      { input: [[2, 3]], expected: [3, 2] },
    ],
    solutions: [
      {
        approach: "Brute Force (Product of the Rest, Per Index)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(n) for the output array",
        overviewMarkdown:
          "For each index, multiply every other element with an inner loop. Naturally handles zeros correctly (no division involved), but redoes the multiplication work for every index.",
        code: `function productExceptSelf(nums) {
  const answer = [];
  for (let i = 0; i < nums.length; i++) {
    let product = 1;
    for (let j = 0; j < nums.length; j++) {
      if (j !== i) product *= nums[j];
    }
    answer.push(product);
  }
  return answer;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | outer loop over \`i\` | One output value computed per index. |
| 4-7 | inner loop over \`j\` | Multiply every element except \`nums[i]\` itself. |
| 8 | \`answer.push(product)\` | Store the product of everything except \`nums[i]\`. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,3,4]\`:
i=0: 2*3*4=24. i=1: 1*3*4=12. i=2: 1*2*4=8. i=3: 1*2*3=6.
Result: **[24,12,8,6]** — matches expected.

**Dry run 2** — \`[-1,1,0,-3,3]\`:
i=0: 1*0*-3*3=0. i=1: -1*0*-3*3=0. i=2: -1*1*-3*3=9. i=3: -1*1*0*3=0. i=4: -1*1*0*-3=0.
Result: **[0,0,9,0,0]** — matches expected.`,
      },
      {
        approach: "Optimal (Prefix × Suffix, O(1) Extra Space)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) extra (output array doesn't count)",
        overviewMarkdown:
          "First pass: fill `answer[i]` with the product of everything before `i` (prefix product). Second pass, walking backward: multiply `answer[i]` by a running suffix product of everything after `i`. Together they give the product of everything except `nums[i]`, without division and without a separate prefix/suffix array.",
        code: `function productExceptSelf(nums) {
  const n = nums.length;
  const answer = new Array(n).fill(1);

  for (let i = 1; i < n; i++) {
    answer[i] = answer[i - 1] * nums[i - 1];       // prefix product up to i-1
  }

  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    answer[i] *= suffix;                            // fold in product of everything after i
    suffix *= nums[i];
  }

  return answer;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`answer = new Array(n).fill(1)\` | \`answer[0]\` has no elements before it, so it starts at the multiplicative identity, 1. |
| 5-7 | prefix pass | \`answer[i]\` becomes the product of \`nums[0..i-1]\` — everything strictly before \`i\`. |
| 9 | \`let suffix = 1\` | Running product of everything strictly after the current index, starting empty. |
| 10-13 | suffix pass (right to left) | Multiply in the suffix product before updating it, so \`nums[i]\` itself is never included. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,3,4]\`:
Prefix pass: answer=[1,1,2,6]
Suffix pass: i3: answer[3]=6*1=6, suffix=4; i2: answer[2]=2*4=8, suffix=12; i1: answer[1]=1*12=12, suffix=24; i0: answer[0]=1*24=24, suffix=24
Result: **[24,12,8,6]** — matches expected.

**Dry run 2** — \`[-1,1,0,-3,3]\`:
Prefix pass: answer=[1,-1,-1,0,0]
Suffix pass: i4: answer[4]=0*1=0, suffix=3; i3: answer[3]=0*3=0, suffix=-9; i2: answer[2]=-1*-9=9, suffix=0; i1: answer[1]=-1*0=0, suffix=0; i0: answer[0]=1*0=0, suffix=0
Result: **[0,0,9,0,0]** — matches expected.`,
      },
    ],
    relatedSlugs: ["maximum-subarray", "trapping-rain-water"],
    realWorldUsageMarkdown: `Prefix/suffix accumulation without a single "leave-one-out" recompute is the same trick behind Trapping Rain Water's left/right max arrays, and behind analytics dashboards computing "everyone's rank excluding themselves" (e.g. total team revenue minus each rep's own contribution) in one linear pass.`,
  },
```

- [ ] **Step 4: `maximum-subarray` — add solutions**

Find:
```typescript
    testCases: [
      { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { input: [[1]], expected: 1 },
      { input: [[5, 4, -1, 7, 8]], expected: 23 },
      { input: [[-1]], expected: -1 },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { input: [[1]], expected: 1 },
      { input: [[5, 4, -1, 7, 8]], expected: 23 },
      { input: [[-1]], expected: -1 },
    ],
    solutions: [
      {
        approach: "Brute Force (All Subarray Sums)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "For every starting index, extend the subarray one element at a time, tracking a running sum and the best sum seen. Covers every contiguous subarray without recomputing sums from scratch each time, but still quadratic.",
        code: `function maxSubArray(nums) {
  let best = nums[0];
  for (let i = 0; i < nums.length; i++) {
    let sum = 0;
    for (let j = i; j < nums.length; j++) {
      sum += nums[j];
      best = Math.max(best, sum);
    }
  }
  return best;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`let best = nums[0]\` | Seed with a valid subarray (a single element) in case all values are negative. |
| 3-8 | nested loops | For each start \`i\`, extend the subarray through every end \`j >= i\`, keeping a running sum. |
| 7 | \`best = Math.max(best, sum)\` | Track the best sum seen across every subarray. |`,
        dryRunMarkdown: `**Dry run 1** — \`[5,4,-1,7,8]\`:
start=0: 5(best5)→9(best9)→8→15(best15)→23(best23)
start=1: 4→3→10→18 (none beat 23)
Remaining starts can't beat 23 either → return **23** — matches expected.

**Dry run 2** — \`[-1]\`:
start=0: sum=-1, best=max(-1,-1)=-1 → return **-1** — matches expected.`,
      },
      {
        approach: "Optimal (Kadane's Algorithm)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Track the best sum of a subarray ending exactly at the current index (`current`). At each step, either extend the previous subarray or start fresh at the current element — whichever is larger. The running maximum of `current` across the whole pass is the answer.",
        code: `function maxSubArray(nums) {
  let current = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]); // extend or restart
    best = Math.max(best, current);
  }
  return best;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | seed \`current\`/\`best\` with \`nums[0]\` | A single-element subarray is always valid, so start there. |
| 5 | \`current = Math.max(nums[i], current + nums[i])\` | If extending the running subarray would be worse than starting fresh at \`nums[i]\`, restart — a negative running sum can only hurt. |
| 6 | \`best = Math.max(best, current)\` | Record the best subarray-ending-here seen across the whole pass. |`,
        dryRunMarkdown: `**Dry run 1** — \`[-2,1,-3,4,-1,2,1,-5,4]\`:
current=-2,best=-2
1: max(1,-1)=1, best=1
-3: max(-3,-2)=-2, best=1
4: max(4,2)=4, best=4
-1: max(-1,3)=3, best=4
2: max(2,5)=5, best=5
1: max(1,6)=6, best=6
-5: max(-5,1)=1, best=6
4: max(4,5)=5, best=6
Result: **6** — matches expected.

**Dry run 2** — \`[5,4,-1,7,8]\`:
current=5,best=5
4: max(4,9)=9,best=9
-1: max(-1,8)=8,best=9
7: max(7,15)=15,best=15
8: max(8,23)=23,best=23
Result: **23** — matches expected.`,
      },
    ],
    relatedSlugs: ["best-time-to-buy-sell-stock", "sliding-window-maximum"],
    realWorldUsageMarkdown: `Kadane's "extend or restart" rule is the standard way to find the best contiguous trading window in a price-change series, or the strongest burst of signal in a noisy sensor stream — anywhere the question is "what's the best contiguous run in this sequence."`,
  },
```

- [ ] **Step 5: `merge-intervals` — add solutions**

Find:
```typescript
    testCases: [
      {
        input: [[[1, 3], [2, 6], [8, 10], [15, 18]]],
        expected: [[1, 6], [8, 10], [15, 18]],
      },
      { input: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
      { input: [[[1, 4], [0, 4]]], expected: [[0, 4]] },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      {
        input: [[[1, 3], [2, 6], [8, 10], [15, 18]]],
        expected: [[1, 6], [8, 10], [15, 18]],
      },
      { input: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
      { input: [[[1, 4], [0, 4]]], expected: [[0, 4]] },
    ],
    solutions: [
      {
        approach: "Brute Force (Repeated Pairwise Merge, No Sort)",
        timeComplexity: "O(n³) worst case",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Without sorting, repeatedly scan every pair of intervals for an overlap; merge the first overlapping pair found and restart the scan. Stop when a full pass finds no overlaps left. Correct without depending on sort order, but can re-scan many times.",
        code: `function mergeIntervals(intervals) {
  let result = intervals.map((interval) => [...interval]);
  let merged = true;
  while (merged) {
    merged = false;
    outer: for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const [aStart, aEnd] = result[i];
        const [bStart, bEnd] = result[j];
        if (aStart <= bEnd && bStart <= aEnd) {
          result[i] = [Math.min(aStart, bStart), Math.max(aEnd, bEnd)];
          result.splice(j, 1);
          merged = true;
          break outer;
        }
      }
    }
  }
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`result = intervals.map(...)\` | Work on a mutable copy of copies, so the caller's array/intervals are untouched. |
| 3-4 | \`merged\` flag + \`while\` loop | Keep scanning as long as the previous pass found and applied a merge. |
| 9 | \`aStart <= bEnd && bStart <= aEnd\` | Standard overlap test — true whenever the two intervals touch or cross. |
| 10-13 | merge and restart | Replace the pair with their union, remove the duplicate, and break out to rescan from the top. |`,
        dryRunMarkdown: `**Dry run 1** — \`[[1,4],[4,5]]\`:
Pass1: check (1,4)&(4,5): \`1<=5 && 4<=4\` → true → merge → [1,5]. result=[[1,5]].
Pass2: only one interval, no pairs → stable → return **[[1,5]]** — matches expected.

**Dry run 2** — \`[[1,3],[2,6],[8,10],[15,18]]\`:
Pass1: (1,3)&(2,6) overlap → merge → [1,6]. result=[[1,6],[8,10],[15,18]].
Pass2: (1,6)&(8,10): \`1<=10 && 8<=6\` → false; (1,6)&(15,18): false; (8,10)&(15,18): false → no merge → stable.
Result: **[[1,6],[8,10],[15,18]]** — matches expected.`,
      },
      {
        approach: "Optimal (Sort by Start, Linear Merge)",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Sort intervals by start value. Then walk through once: if the current interval overlaps the last interval placed in the result, extend that result interval's end; otherwise append the current interval as a new entry. Sorting guarantees any interval that could overlap the last result interval is checked immediately after it.",
        code: `function mergeIntervals(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const result = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const last = result[result.length - 1];
    const [start, end] = sorted[i];
    if (start <= last[1]) {
      last[1] = Math.max(last[1], end);   // extend the last merged interval
    } else {
      result.push([start, end]);          // no overlap, start a new interval
    }
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`sorted = [...intervals].sort((a, b) => a[0] - b[0])\` | Sort ascending by start — this is what lets a single linear pass catch every overlap. |
| 3 | \`result = [sorted[0]]\` | Seed the result with the first (earliest-starting) interval. |
| 6-7 | \`last\`, \`[start, end]\` | Compare the current interval against the most recently placed result interval. |
| 8-9 | \`if (start <= last[1])\` | Overlap (or touching) — extend \`last\`'s end to cover the current interval too. |
| 10-11 | \`else result.push(...)\` | No overlap — the current interval starts a new group. |`,
        dryRunMarkdown: `**Dry run 1** — \`[[1,3],[2,6],[8,10],[15,18]]\`:
sorted (already in order): [[1,3],[2,6],[8,10],[15,18]]. result=[[1,3]].
[2,6]: 2<=3 → extend last to [1,6]. result=[[1,6]].
[8,10]: 8<=6? no → push. result=[[1,6],[8,10]].
[15,18]: 15<=10? no → push. result=[[1,6],[8,10],[15,18]].
Matches expected.

**Dry run 2** — \`[[1,4],[0,4]]\`:
sorted by start: [[0,4],[1,4]]. result=[[0,4]].
[1,4]: 1<=4 → extend last to [max(4,4)=4] → [0,4]. result=[[0,4]].
Matches expected \`[[0,4]]\`.`,
      },
    ],
    relatedSlugs: ["task-scheduler"],
    realWorldUsageMarkdown: `Sort-then-sweep interval merging is exactly how calendar apps collapse overlapping busy blocks into free/busy windows, and how resource-booking systems (conference rooms, rental equipment) coalesce reservation ranges before checking for conflicts.`,
  },
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 7: Lint**

Run: `npm run lint`
Expected: clean on `src/content/problems/arrays.ts`.

- [ ] **Step 8: Commit**

```bash
git add src/content/problems/arrays.ts
git commit -m "Backfill Deep Solutions content for Arrays & Hashing topic"
```

## Task 5: Backfill Deep Solutions — Two Pointers (5 problems)

**Files:**
- Modify: `src/content/problems/two-pointers.ts`

**Interfaces:**
- Consumes: `Solution` type and `Problem.solutions?`/`relatedSlugs?`/`realWorldUsageMarkdown?` from Task 1.
- Produces: nothing new — data-only addition. `description`/`starterCode`/`functionName`/`testCases` on all 5 problems are UNCHANGED.

Same insertion pattern as Task 4: each step's "Find" block is the exact current closing of that problem's `testCases` array in `src/content/problems/two-pointers.ts` — match verbatim, insert the three new fields before the closing `},`.

- [ ] **Step 1: `valid-palindrome` — add solutions**

Find:
```typescript
    testCases: [
      { input: ["A man, a plan, a canal: Panama"], expected: true },
      { input: ["race a car"], expected: false },
      { input: [" "], expected: true },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: ["A man, a plan, a canal: Panama"], expected: true },
      { input: ["race a car"], expected: false },
      { input: [" "], expected: true },
    ],
    solutions: [
      {
        approach: "Brute Force (Clean, Then Compare to Reverse)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Strip non-alphanumeric characters and lowercase everything into a new string, then compare that string to its own reverse. Simple and clear, but allocates two extra full-length strings.",
        code: `function isPalindrome(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const reversed = cleaned.split("").reverse().join("");
  return cleaned === reversed;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`s.toLowerCase().replace(/[^a-z0-9]/g, "")\` | Lowercase everything, then strip anything that isn't a letter or digit. |
| 3 | \`cleaned.split("").reverse().join("")\` | Build the reverse of the cleaned string. |
| 4 | \`return cleaned === reversed\` | A palindrome reads identically forwards and backwards. |`,
        dryRunMarkdown: `**Dry run 1** — \`"race a car"\`:
cleaned = "raceacar"; reversed = "racaecar"
"raceacar" !== "racaecar" → return **false** — matches expected.

**Dry run 2** — \`" "\`:
cleaned = "" (the single space is stripped); reversed = ""
"" === "" → return **true** — matches expected.`,
      },
      {
        approach: "Optimal (Two Pointers, In Place)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Walk `left` from the start and `right` from the end toward the middle. At each step, skip past any non-alphanumeric character on either side, then compare the two characters (case-insensitively). A mismatch means not a palindrome; the pointers crossing without one means it is — no new strings ever built.",
        code: `function isPalindrome(s) {
  const isAlnum = (ch) => /[a-z0-9]/i.test(ch);
  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    while (left < right && !isAlnum(s[left])) left++;
    while (left < right && !isAlnum(s[right])) right--;
    if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
    left++;
    right--;
  }
  return true;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-4 | \`left\`/\`right\` init | Start converging from both ends of the string. |
| 7 | inner \`while\` on \`left\` | Skip forward past any non-alphanumeric character. |
| 8 | inner \`while\` on \`right\` | Skip backward past any non-alphanumeric character. |
| 9 | \`if (s[left].toLowerCase() !== s[right].toLowerCase()) return false\` | Compare the two next "real" characters case-insensitively — any mismatch fails the palindrome check immediately. |
| 10-11 | \`left++; right--\` | Converge one step further after a successful match. |`,
        dryRunMarkdown: `**Dry run 1** — \`"race a car"\` (indices 0-9: r,a,c,e,' ',a,' ',c,a,r):
left=0('r'),right=9('r') → equal → left=1,right=8
left=1('a'),right=8('a') → equal → left=2,right=7
left=2('c'),right=7('c') → equal → left=3,right=6
left=3('e'), right=6(' ') → skip right (not alnum) → right=5('a')
'e' vs 'a' → mismatch → return **false** — matches expected.

**Dry run 2** — \`" "\`:
left=0,right=0 → \`left < right\` is false immediately (single space, indices equal) → loop never runs → return **true** — matches expected.`,
      },
    ],
    relatedSlugs: ["two-sum-ii"],
    realWorldUsageMarkdown: `Converging-pointer scans over cleaned text power input-sanitization palindrome/format checks (e.g. validating a normalized ID or checksum reads the same both ways), and the same skip-invalid-then-compare shape appears in DNA sequence palindrome detection in bioinformatics tooling.`,
  },
```

- [ ] **Step 2: `two-sum-ii` — add solutions**

Find:
```typescript
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [1, 2] },
      { input: [[2, 3, 4], 6], expected: [1, 3] },
      { input: [[-1, 0], -1], expected: [1, 2] },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [1, 2] },
      { input: [[2, 3, 4], 6], expected: [1, 3] },
      { input: [[-1, 0], -1], expected: [1, 2] },
    ],
    solutions: [
      {
        approach: "Brute Force (Nested Loop)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Check every pair, same as unsorted Two Sum — the input being sorted isn't exploited at all here. Correct, but ignores the structure the problem hands you for free.",
        code: `function twoSumII(numbers, target) {
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      if (numbers[i] + numbers[j] === target) return [i + 1, j + 1]; // 1-indexed
    }
  }
  return [];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | nested loops | Check every pair \`(i, j)\` with \`j > i\`. |
| 4 | \`return [i + 1, j + 1]\` | Convert to 1-indexed as the problem requires. |`,
        dryRunMarkdown: `**Dry run 1** — \`numbers=[2,3,4], target=6\`:
i=0(2): j=1(3)→5≠6; j=2(4)→6=6 → return **[1,3]** — matches expected.

**Dry run 2** — \`numbers=[-1,0], target=-1\`:
i=0(-1): j=1(0)→-1=-1 → return **[1,2]** — matches expected.`,
      },
      {
        approach: "Optimal (Opposite-End Two Pointers)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Because the array is sorted, start `left` at the beginning and `right` at the end. If the current sum is too small, the only way to increase it is to move `left` rightward (a bigger number); if too large, move `right` leftward (a smaller number). This exploits sortedness to avoid any extra memory.",
        code: `function twoSumII(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1]; // 1-indexed
    if (sum < target) left++;
    else right--;
  }
  return [];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`left\`/\`right\` init | Start at opposite ends of the sorted array. |
| 6 | \`if (sum === target)\` | Found it — return 1-indexed positions. |
| 7 | \`if (sum < target) left++\` | Sum too small — the only way up is a larger left value, since the array is sorted ascending. |
| 8 | \`else right--\` | Sum too large — shrink it by taking a smaller right value. |`,
        dryRunMarkdown: `**Dry run 1** — \`numbers=[2,3,4], target=6\`:
left=0(2),right=2(4): sum=6=6 → return **[1,3]** — matches expected.

**Dry run 2** — \`numbers=[-1,0], target=-1\`:
left=0(-1),right=1(0): sum=-1=-1 → return **[1,2]** — matches expected.`,
      },
    ],
    relatedSlugs: ["two-sum", "three-sum"],
    realWorldUsageMarkdown: `Opposite-end pointer convergence is the standard way to exploit an already-sorted index — a sorted-scan query planner or a merge step over a sorted column range can find matching pairs in one linear pass instead of a hash lookup, trading extra memory for the guarantee that the data is ordered.`,
  },
```

- [ ] **Step 3: `three-sum` — add solutions**

Find:
```typescript
    testCases: [
      {
        input: [[-1, 0, 1, 2, -1, -4]],
        expected: [
          [-1, -1, 2],
          [-1, 0, 1],
        ],
      },
      { input: [[0, 1, 1]], expected: [] },
      { input: [[0, 0, 0]], expected: [[0, 0, 0]] },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      {
        input: [[-1, 0, 1, 2, -1, -4]],
        expected: [
          [-1, -1, 2],
          [-1, 0, 1],
        ],
      },
      { input: [[0, 1, 1]], expected: [] },
      { input: [[0, 0, 0]], expected: [[0, 0, 0]] },
    ],
    solutions: [
      {
        approach: "Brute Force (Sorted Triple Loop + Dedup Set)",
        timeComplexity: "O(n³)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Sort first (this makes duplicate triplets trivially comparable as strings), then check every triple of indices `i < j < k` for a zero sum, recording each unique triplet in a `Set` keyed by its stringified values so duplicates collapse automatically.",
        code: `function threeSum(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const seen = new Set();
  const result = [];

  for (let i = 0; i < sorted.length - 2; i++) {
    for (let j = i + 1; j < sorted.length - 1; j++) {
      for (let k = j + 1; k < sorted.length; k++) {
        if (sorted[i] + sorted[j] + sorted[k] === 0) {
          const key = \`\${sorted[i]},\${sorted[j]},\${sorted[k]}\`;
          if (!seen.has(key)) {
            seen.add(key);
            result.push([sorted[i], sorted[j], sorted[k]]);
          }
        }
      }
    }
  }
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`sorted = [...nums].sort((a, b) => a - b)\` | Sorting makes equal-valued triplets produce identical string keys, which is what makes the \`Set\` dedup work. |
| 3-4 | \`seen\`, \`result\` | Track which value-triplets have already been emitted. |
| 6-8 | triple nested loop | Check every combination of three distinct sorted-array positions. |
| 10-13 | dedup and record | Only push a triplet the first time its value-combination is seen. |`,
        dryRunMarkdown: `**Dry run 1** — \`[0,0,0]\`:
sorted=[0,0,0]. Only combination i=0,j=1,k=2: sum=0 → key "0,0,0" not seen → push [0,0,0].
Result: **[[0,0,0]]** — matches expected.

**Dry run 2** — \`[-1,0,1,2,-1,-4]\`:
sorted=[-4,-1,-1,0,1,2]. Scanning all \`i<j<k\`, the zero-sum triples found in order are: \`(i=1,j=2,k=5)\` → values \`(-1,-1,2)\` (first) and \`(i=1,j=3,k=4)\` → values \`(-1,0,1)\` (second); a later duplicate \`(i=2,j=3,k=4)\` also sums to zero but is skipped since \`"-1,0,1"\` was already seen.
Result: **[[-1,-1,2],[-1,0,1]]** — matches expected (including order).`,
      },
      {
        approach: "Optimal (Sort + Fix One + Two Pointers)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(n) for the sort / output",
        overviewMarkdown:
          "Sort the array. Fix each index `i` as the smallest element of a candidate triplet, then two-pointer the remainder (`left = i+1`, `right = n-1`) looking for a pair summing to `-nums[i]`, exactly like Two Sum II. Skip over duplicate values for `i` and for `left`/`right` after a successful match to avoid emitting the same triplet twice.",
        code: `function threeSum(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < sorted.length - 2; i++) {
    if (i > 0 && sorted[i] === sorted[i - 1]) continue; // skip duplicate anchors
    let left = i + 1;
    let right = sorted.length - 1;

    while (left < right) {
      const sum = sorted[i] + sorted[left] + sorted[right];
      if (sum === 0) {
        result.push([sorted[i], sorted[left], sorted[right]]);
        while (left < right && sorted[left] === sorted[left + 1]) left++;
        while (left < right && sorted[right] === sorted[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`sorted = [...nums].sort((a, b) => a - b)\` | Sorting enables both the duplicate-skip logic and the two-pointer scan. |
| 6 | \`if (i > 0 && sorted[i] === sorted[i - 1]) continue\` | Skip re-anchoring on a value already tried as the smallest element of a triplet. |
| 7-8 | \`left\`/\`right\` init | Two-pointer the remainder of the array for a pair summing to \`-sorted[i]\`. |
| 12-17 | match found | Record the triplet, then skip past any further duplicate values at \`left\`/\`right\` before moving both pointers inward. |
| 18-20 | \`sum < 0\` / \`else\` | Standard sorted two-pointer narrowing, same logic as Two Sum II. |`,
        dryRunMarkdown: `**Dry run 1** — \`[-1,0,1,2,-1,-4]\`:
sorted=[-4,-1,-1,0,1,2].
i=0(-4): left1(-1),right5(2)→sum-3<0→left++; left2(-1),right5→sum-3<0→left++; left3(0),right5→sum-2<0→left++; left4(1),right5→sum-1<0→left++→left=right=5→stop. No triplet.
i=1(-1): left2(-1),right5(2)→sum=0 → push **[-1,-1,2]**; no adjacent dup at left/right→left3,right4. sum=-1+0+1=0 → push **[-1,0,1]**; left4=right4→stop.
i=2(-1): duplicate of sorted[1]=-1 → skip.
i=3(0): left4(1),right5(2)→sum=3>0→right--→left4=right4→stop.
Result: **[[-1,-1,2],[-1,0,1]]** — matches expected (including order).

**Dry run 2** — \`[0,1,1]\`:
sorted=[0,1,1]. \`i < sorted.length - 2\` → \`i < 1\` → only i=0(0): left1(1),right2(1)→sum=0+1+1=2>0→right--→left1=right1→stop. No triplet.
Result: **[]** — matches expected.`,
      },
    ],
    relatedSlugs: ["two-sum-ii", "container-with-most-water"],
    realWorldUsageMarkdown: `Fix-one-then-two-pointer-the-rest generalizes k-Sum problems used in combinatorial search — e.g. finding three trades whose amounts net to zero for reconciliation, or three chemical concentrations that balance a target ratio. It's also the standard warm-up for 4Sum and general k-Sum, which reduce recursively to this same core.`,
  },
```

- [ ] **Step 4: `container-with-most-water` — add solutions**

Find:
```typescript
    testCases: [
      { input: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
      { input: [[1, 1]], expected: 1 },
      { input: [[4, 3, 2, 1, 4]], expected: 16 },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
      { input: [[1, 1]], expected: 1 },
      { input: [[4, 3, 2, 1, 4]], expected: 16 },
    ],
    solutions: [
      {
        approach: "Brute Force (Every Pair of Lines)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Check every pair of lines, compute the area bounded by the shorter of the two and the distance between them, and track the maximum. Correct, but re-examines pairs a greedy scan can rule out.",
        code: `function maxArea(height) {
  let best = 0;
  for (let i = 0; i < height.length; i++) {
    for (let j = i + 1; j < height.length; j++) {
      const area = Math.min(height[i], height[j]) * (j - i);
      best = Math.max(best, area);
    }
  }
  return best;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-4 | nested loops | Consider every pair of lines \`(i, j)\`. |
| 5 | \`Math.min(height[i], height[j]) * (j - i)\` | Water height is capped by the shorter line; width is the distance between them. |
| 6 | \`best = Math.max(best, area)\` | Track the largest area seen. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,1]\`:
Only pair (0,1): min(1,1)*1=1 → return **1** — matches expected.

**Dry run 2** — \`[4,3,2,1,4]\`:
Pairs: (0,1)=3,(0,2)=4,(0,3)=3,(0,4)=16,(1,2)=2,(1,3)=2,(1,4)=9,(2,3)=1,(2,4)=4,(3,4)=1
Max = **16** — matches expected.`,
      },
      {
        approach: "Optimal (Greedy Two Pointers)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Start pointers at both ends. The shorter of the two lines is always the bottleneck — no matter which line it's paired with next, the width will only shrink, so keeping it can never produce a bigger area than moving past it. Move the shorter pointer inward each step; the taller one stays since it might pair better with a future, taller partner.",
        code: `function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let best = 0;

  while (left < right) {
    const area = Math.min(height[left], height[right]) * (right - left);
    best = Math.max(best, area);
    if (height[left] < height[right]) left++;
    else right--;
  }
  return best;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`left\`/\`right\` init | Start at the widest possible container. |
| 7 | \`Math.min(height[left], height[right]) * (right - left)\` | Same area formula — shorter line caps the water height. |
| 9 | \`if (height[left] < height[right]) left++\` | The shorter line is the bottleneck; moving it is the only way a wider-but-shorter pairing could beat the current area. |
| 10 | \`else right--\` | Symmetric case — the right line is the (weakly) shorter one, so it moves instead. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,1]\`:
left0(1),right1(1): area=min(1,1)*1=1, best=1. Heights equal → move left → left1=right1 → loop ends.
Return **1** — matches expected.

**Dry run 2** — \`[4,3,2,1,4]\`:
left0(4),right4(4): area=min(4,4)*4=16, best=16. Equal → move left → left1(3).
left1(3),right4(4): area=min(3,4)*3=9, best=16. left shorter → move left → left2(2).
left2(2),right4(4): area=min(2,4)*2=4, best=16. left shorter → move left → left3(1).
left3(1),right4(4): area=min(1,4)*1=1, best=16. left shorter → move left → left4=right4 → loop ends.
Return **16** — matches expected.`,
      },
    ],
    relatedSlugs: ["trapping-rain-water", "three-sum"],
    realWorldUsageMarkdown: `"The shorter side is always the bottleneck" is a general capacity-planning insight: the max throughput between two points in a pipeline or network is bounded by its narrowest link, and the same greedy elimination (discard the constrained side, keep the other as a candidate for a better future pairing) shows up in reservoir/dam siting problems.`,
  },
```

- [ ] **Step 5: `trapping-rain-water` — add solutions**

Find:
```typescript
    testCases: [
      {
        input: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]],
        expected: 6,
      },
      { input: [[4, 2, 0, 3, 2, 5]], expected: 9 },
      { input: [[2, 0, 2]], expected: 2 },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      {
        input: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]],
        expected: 6,
      },
      { input: [[4, 2, 0, 3, 2, 5]], expected: 9 },
      { input: [[2, 0, 2]], expected: 2 },
    ],
    solutions: [
      {
        approach: "Brute Force (Per-Index Left/Right Max Scan)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "For every index, rescan left to find the tallest bar to its left and rescan right for the tallest to its right. The water trapped at that index is the shorter of those two maxes minus the bar's own height (never negative). Correct, but every index triggers two fresh O(n) scans.",
        code: `function trap(height) {
  let total = 0;
  for (let i = 0; i < height.length; i++) {
    let leftMax = 0;
    for (let l = 0; l <= i; l++) leftMax = Math.max(leftMax, height[l]);
    let rightMax = 0;
    for (let r = i; r < height.length; r++) rightMax = Math.max(rightMax, height[r]);
    total += Math.min(leftMax, rightMax) - height[i];
  }
  return total;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4-5 | \`leftMax\` scan | Tallest bar at or before index \`i\`. |
| 6-7 | \`rightMax\` scan | Tallest bar at or after index \`i\`. |
| 8 | \`Math.min(leftMax, rightMax) - height[i]\` | Water sits up to the shorter surrounding wall; subtracting the bar's own height gives the trapped amount at \`i\` (0 when \`i\` itself is the tallest wall on one side). |`,
        dryRunMarkdown: `**Dry run 1** — \`[2,0,2]\`:
i=0: leftMax=2, rightMax=max(2,0,2)=2 → min(2,2)-2=0
i=1: leftMax=max(2,0)=2, rightMax=max(0,2)=2 → min(2,2)-0=2
i=2: leftMax=max(2,0,2)=2, rightMax=2 → min(2,2)-2=0
Total: 0+2+0 = **2** — matches expected.

**Dry run 2** — \`[4,2,0,3,2,5]\`:
leftMax per index: [4,4,4,4,4,5]. rightMax per index: [5,5,5,5,5,5].
water per index: [0,2,4,1,2,0]. Total = **9** — matches expected.`,
      },
      {
        approach: "Optimal (Two Pointers, O(1) Space)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Track a running `leftMax`/`rightMax` while converging `left` and `right` pointers. At each step, advance whichever side is currently shorter: that side's own running max is guaranteed to be the true bounding wall (since the other side already has something at least as tall further out), so its trapped water is exactly `runningMax - height[side]`.",
        code: `function trap(height) {
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let total = 0;

  while (left < right) {
    if (height[left] < height[right]) {
      leftMax = Math.max(leftMax, height[left]);
      total += leftMax - height[left];
      left++;
    } else {
      rightMax = Math.max(rightMax, height[right]);
      total += rightMax - height[right];
      right--;
    }
  }
  return total;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-5 | pointer/running-max init | \`leftMax\`/\`rightMax\` track the tallest bar seen so far from each side. |
| 9 | \`if (height[left] < height[right])\` | The shorter side is guaranteed to be bounded by its own running max — the far side already has something at least as tall. |
| 10-12 | left branch | Update \`leftMax\`, add trapped water at \`left\` (0 if \`height[left]\` is itself the new max), advance. |
| 13-16 | right branch | Symmetric handling for the right side. |`,
        dryRunMarkdown: `**Dry run 1** — \`[4,2,0,3,2,5]\`:
left0(4),right5(5),leftMax0,rightMax0,total0.
4<5 → leftMax=max(0,4)=4, total+=4-4=0 → total=0, left=1
2<5 → leftMax=max(4,2)=4, total+=4-2=2 → total=2, left=2
0<5 → leftMax=4, total+=4-0=4 → total=6, left=3
3<5 → leftMax=4, total+=4-3=1 → total=7, left=4
2<5 → leftMax=4, total+=4-2=2 → total=9, left=5 → left=right → stop
Total: **9** — matches expected.

**Dry run 2** — \`[2,0,2]\`:
left0(2),right2(2),leftMax0,rightMax0,total0.
height[left]=2 < height[right]=2? false → right branch: rightMax=max(0,2)=2, total+=2-2=0 → total=0, right=1
left0(2),right1(0): height[left]=2 < height[right]=0? false → right branch: rightMax=max(2,0)=2, total+=2-0=2 → total=2, right=0 → left=right → stop
Total: **2** — matches expected.`,
      },
    ],
    relatedSlugs: ["container-with-most-water", "daily-temperatures"],
    realWorldUsageMarkdown: `The two-pointer running-max technique is used in literal terrain/GIS water-retention modeling (how much runoff pools across an elevation profile), and the "shorter side is bounded by its own running max" insight is the same core idea behind stock-span and monotonic-boundary problems like Daily Temperatures.`,
  },
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 7: Lint**

Run: `npm run lint`
Expected: clean on `src/content/problems/two-pointers.ts`.

- [ ] **Step 8: Commit**

```bash
git add src/content/problems/two-pointers.ts
git commit -m "Backfill Deep Solutions content for Two Pointers topic"
```

## Task 6: Backfill Deep Solutions — Sliding Window (5 problems)

**Files:**
- Modify: `src/content/problems/sliding-window.ts`

**Interfaces:**
- Consumes: `Solution` type and `Problem.solutions?`/`relatedSlugs?`/`realWorldUsageMarkdown?` from Task 1.
- Produces: nothing new — data-only addition. `description`/`starterCode`/`functionName`/`testCases` on all 5 problems are UNCHANGED.

- [ ] **Step 1: `best-time-to-buy-sell-stock` — add solutions**

Find:
```typescript
    testCases: [
      { input: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { input: [[7, 6, 4, 3, 1]], expected: 0 },
      { input: [[2, 4, 1]], expected: 2 },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { input: [[7, 6, 4, 3, 1]], expected: 0 },
      { input: [[2, 4, 1]], expected: 2 },
    ],
    solutions: [
      {
        approach: "Brute Force (Every Buy/Sell Pair)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Check every pair of days `(buy, sell)` with `sell > buy`, compute the profit, and track the max. Correct, but re-derives the best buy day for every possible sell day instead of remembering it.",
        code: `function maxProfit(prices) {
  let best = 0;
  for (let i = 0; i < prices.length; i++) {
    for (let j = i + 1; j < prices.length; j++) {
      best = Math.max(best, prices[j] - prices[i]);
    }
  }
  return best;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-4 | nested loops | Consider every buy day \`i\` and every later sell day \`j\`. |
| 5 | \`Math.max(best, prices[j] - prices[i])\` | Track the best profit found; \`best\` starts at 0 to cover "no profitable trade exists." |`,
        dryRunMarkdown: `**Dry run 1** — \`[2,4,1]\`:
Pairs: (0,1)=4-2=2, (0,2)=1-2=-1, (1,2)=1-4=-3. Max(0,2,-1,-3) = **2** — matches expected.

**Dry run 2** — \`[7,6,4,3,1]\`:
Every later price is lower than every earlier one, so every pair gives a negative profit. \`best\` never rises above its initial 0 → return **0** — matches expected.`,
      },
      {
        approach: "Optimal (Running Minimum, One Pass)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Walk the prices once, tracking the lowest price seen so far (`minSoFar`). At each day, the best possible profit if selling today is `price - minSoFar` — no need to remember which day the minimum happened on, just its value.",
        code: `function maxProfit(prices) {
  let minSoFar = Infinity;
  let best = 0;

  for (const price of prices) {
    minSoFar = Math.min(minSoFar, price);
    best = Math.max(best, price - minSoFar);
  }
  return best;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`minSoFar = Infinity\` | No price seen yet. |
| 6 | \`minSoFar = Math.min(minSoFar, price)\` | Update the cheapest buy price seen up to and including today. |
| 7 | \`best = Math.max(best, price - minSoFar)\` | If today were the sell day, this is the best possible profit — compare against the running best. |`,
        dryRunMarkdown: `**Dry run 1** — \`[2,4,1]\`:
price=2: minSoFar=2, profit=0, best=0
price=4: minSoFar=2, profit=2, best=2
price=1: minSoFar=1, profit=0, best stays 2
Return **2** — matches expected.

**Dry run 2** — \`[7,6,4,3,1]\`:
Each price is a new low, so \`profit = price - minSoFar\` is always 0 at the moment \`minSoFar\` updates to that same price. \`best\` never leaves 0.
Return **0** — matches expected.`,
      },
    ],
    relatedSlugs: ["longest-substring-without-repeating"],
    realWorldUsageMarkdown: `Tracking a running minimum (or maximum) while scanning once is the same shape behind monitoring baselines — e.g. remembering the lowest latency observed so far to size the magnitude of a current spike, or the cheapest historical price to flag a buying opportunity in a live feed, all without storing the full history.`,
  },
```

- [ ] **Step 2: `longest-substring-without-repeating` — add solutions**

Find:
```typescript
    testCases: [
      { input: ["abcabcbb"], expected: 3 },
      { input: ["bbbbb"], expected: 1 },
      { input: ["pwwkew"], expected: 3 },
      { input: [""], expected: 0 },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: ["abcabcbb"], expected: 3 },
      { input: ["bbbbb"], expected: 1 },
      { input: ["pwwkew"], expected: 3 },
      { input: [""], expected: 0 },
    ],
    solutions: [
      {
        approach: "Brute Force (Expand From Every Start)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "For every starting index, extend a substring rightward using a `Set` until a repeat is hit, tracking the longest run seen. Simple, but restarts the scan (and the set) from scratch at every start index instead of reusing earlier work.",
        code: `function lengthOfLongestSubstring(s) {
  let maxLen = 0;
  for (let i = 0; i < s.length; i++) {
    const seen = new Set();
    let j = i;
    while (j < s.length && !seen.has(s[j])) {
      seen.add(s[j]);
      j++;
    }
    maxLen = Math.max(maxLen, j - i);
  }
  return maxLen;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | outer loop over start index \`i\` | Try every possible substring start. |
| 4-8 | inner \`while\` | Extend \`j\` rightward while characters stay unique, tracking them in \`seen\`. |
| 9 | \`maxLen = Math.max(maxLen, j - i)\` | \`j - i\` is the length of the longest unique run starting at \`i\`. |`,
        dryRunMarkdown: `**Dry run 1** — \`"bbbbb"\`:
i=0: seen={}, j=0 'b' not seen→add, j=1 'b' seen→stop. len=1-0=1. maxLen=1.
i=1..4: same pattern, each gives len=1. maxLen stays **1** — matches expected.

**Dry run 2** — \`"pwwkew"\`:
i=0: 'p','w' unique, then 'w' repeats at j=2 → len=2.
i=1: 'w','w' repeats immediately at j=2 → len=1.
i=2: 'w','k','e' unique, then 'w' repeats at j=5 → len=3.
i=3: 'k','e','w' unique, reaches end → len=3.
i=4: 'e','w' unique, reaches end → len=2.
i=5: 'w' → len=1.
Max = **3** — matches expected.`,
      },
      {
        approach: "Optimal (Sliding Window with Last-Seen Index)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(min(n, alphabet size))",
        overviewMarkdown:
          "Slide a window `[left, right]` across the string using a map of each character's last-seen index. When `right` lands on a character already in the window, jump `left` directly past its previous occurrence instead of incrementing one step at a time — this is what turns the brute force's restart-from-scratch into a single forward pass.",
        code: `function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (lastSeen.has(c) && lastSeen.get(c) >= left) {
      left = lastSeen.get(c) + 1;
    }
    lastSeen.set(c, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`lastSeen\` map | Character → most recent index it appeared at. |
| 7-9 | \`if (lastSeen.has(c) && lastSeen.get(c) >= left)\` | Only jump \`left\` if the previous occurrence is still inside the current window — a stale (already-passed) occurrence doesn't matter. |
| 10 | \`lastSeen.set(c, right)\` | Record this occurrence as the newest. |
| 11 | \`maxLen = Math.max(maxLen, right - left + 1)\` | Current window size is a candidate for the answer. |`,
        dryRunMarkdown: `**Dry run 1** — \`"pwwkew"\`:
right0'p': not seen → lastSeen{p:0}. maxLen=1.
right1'w': not seen → lastSeen{p:0,w:1}. maxLen=2.
right2'w': seen at 1 ≥ left(0) → left=2. lastSeen{p:0,w:2}. maxLen=max(2,1)=2.
right3'k': not seen → lastSeen{...,k:3}. maxLen=max(2,3-2+1=2)=2.
right4'e': not seen → lastSeen{...,e:4}. maxLen=max(2,4-2+1=3)=3.
right5'w': seen at 2, but 2 < left(2)? equal, so \`>= left\` → left=3. lastSeen{...,w:5}. maxLen=max(3,5-3+1=3)=3.
Return **3** — matches expected.

**Dry run 2** — \`"bbbbb"\`:
right0'b': lastSeen{b:0}. maxLen=1.
right1'b': seen at 0 ≥ left(0) → left=1. lastSeen{b:1}. maxLen=max(1,1)=1.
right2'b': seen at1≥left(1)→left=2. maxLen stays 1. ... pattern repeats.
Return **1** — matches expected.`,
      },
    ],
    relatedSlugs: ["longest-repeating-character-replacement", "minimum-window-substring"],
    realWorldUsageMarkdown: `The jump-left-past-the-duplicate technique is used in log deduplication and rate limiting — e.g. "reject this event if its token appeared anywhere in the last N-event window" — and in unique-session windowing for streaming analytics, where the window must always represent a currently-unique set without rescanning from scratch on every new event.`,
  },
```

- [ ] **Step 3: `longest-repeating-character-replacement` — add solutions**

Find:
```typescript
    testCases: [
      { input: ["AABABBA", 1], expected: 4 },
      { input: ["ABAB", 2], expected: 4 },
      { input: ["AAAA", 2], expected: 4 },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: ["AABABBA", 1], expected: 4 },
      { input: ["ABAB", 2], expected: 4 },
      { input: ["AAAA", 2], expected: 4 },
    ],
    solutions: [
      {
        approach: "Brute Force (Per-Start Expansion with Early Break)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1) (fixed 26-letter frequency map)",
        overviewMarkdown:
          "For every starting index, extend a window rightward, maintaining a frequency count and the max-frequency character seen. Since window size grows by 1 and the max frequency can grow by at most 1 each step, once the window becomes invalid (`size - maxFreq > k`) it stays invalid for that start — so the inner loop can break early.",
        code: `function characterReplacement(s, k) {
  let maxLen = 0;
  for (let i = 0; i < s.length; i++) {
    const freq = {};
    let maxFreq = 0;
    for (let j = i; j < s.length; j++) {
      freq[s[j]] = (freq[s[j]] || 0) + 1;
      maxFreq = Math.max(maxFreq, freq[s[j]]);
      const windowSize = j - i + 1;
      if (windowSize - maxFreq > k) break;
      maxLen = Math.max(maxLen, windowSize);
    }
  }
  return maxLen;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | outer loop over start \`i\` | Try every possible window start. |
| 6-9 | inner loop, frequency tracking | Extend \`j\`, updating the count of the most frequent character in \`[i, j]\`. |
| 10-11 | \`if (windowSize - maxFreq > k) break\` | Non-majority characters exceed the allowed \`k\` replacements — this window (and every longer one from the same start) is invalid, so stop extending. |
| 12 | \`maxLen = Math.max(...)\` | A valid window is a candidate answer. |`,
        dryRunMarkdown: `**Dry run 1** — \`"ABAB", k=2\`:
i=0: j=0'A'(freq A:1,maxFreq1,size1,1-1=0≤2,maxLen1); j=1'B'(freq A:1,B:1,maxFreq1,size2,2-1=1≤2,maxLen2); j=2'A'(freq A:2,B:1,maxFreq2,size3,3-2=1≤2,maxLen3); j=3'B'(freq A:2,B:2,maxFreq2,size4,4-2=2≤2,maxLen4).
i=1,2,3: shorter remaining string, can't beat 4.
Return **4** — matches expected.

**Dry run 2** — \`"AAAA", k=2\`:
i=0: every character is 'A', so \`maxFreq\` always equals \`windowSize\` → \`windowSize - maxFreq = 0 ≤ k\` the whole way → maxLen reaches 4.
Return **4** — matches expected.`,
      },
      {
        approach: "Optimal (Sliding Window, Non-Shrinking)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) (fixed 26-letter frequency map)",
        overviewMarkdown:
          "Slide `right` across the string, always expanding. If the window becomes invalid, slide `left` forward by exactly one instead of re-validating — the window's *size* never needs to shrink below the best length already found, because a smaller invalid window can't beat the current best anyway. `maxFreq` is allowed to go stale (never decreased) — it can only ever be an overestimate for a past position, and an overestimate only makes the algorithm slightly more conservative about when to slide, never wrong about the final answer.",
        code: `function characterReplacement(s, k) {
  const freq = {};
  let left = 0;
  let maxFreq = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    freq[s[right]] = (freq[s[right]] || 0) + 1;
    maxFreq = Math.max(maxFreq, freq[s[right]]);

    if (right - left + 1 - maxFreq > k) {
      freq[s[left]]--;
      left++;
    }
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-4 | \`freq\`, \`left\`, \`maxFreq\` | Track character counts in the current window and the best (possibly stale) max frequency seen. |
| 8-9 | update \`freq\`/\`maxFreq\` for the new right character | Standard window expansion. |
| 11-14 | \`if (... > k)\` | Window invalid — slide (not shrink) by moving \`left\` forward one step; net window size stays the same. |
| 15 | \`maxLen = Math.max(...)\` | Track the best window size seen. |`,
        dryRunMarkdown: `**Dry run 1** — \`"AABABBA", k=1\`:
right0'A': freq{A:1}, maxFreq1, size1, 1-1=0≤1, maxLen1.
right1'A': freq{A:2}, maxFreq2, size2, 2-2=0≤1, maxLen2.
right2'B': freq{A:2,B:1}, maxFreq2, size3, 3-2=1≤1, maxLen3.
right3'A': freq{A:3,B:1}, maxFreq3, size4, 4-3=1≤1, maxLen4.
right4'B': freq{A:3,B:2}, maxFreq stays3(stale, real max is3), size(right-left+1)=4-0+1=5, 5-3=2>1 → slide: freq[s[0]='A']-- → freq{A:2,B:2}, left=1. maxLen=max(4, 4-1+1=4)=4.
right5'B': freq{A:2,B:3}, maxFreq=max(3,3)=3, size=5-1+1=5, 5-3=2>1 → slide: freq[s[1]='A']-- → freq{A:1,B:3}, left=2. maxLen=max(4,5-2+1=4)=4.
right6'A': freq{A:2,B:3}, maxFreq=3, size=6-2+1=5, 5-3=2>1 → slide: freq[s[2]='B']-- → freq{A:2,B:2}, left=3. maxLen=max(4,6-3+1=4)=4.
Return **4** — matches expected.

**Dry run 2** — \`"AAAA", k=2\`:
Every character is 'A'; \`maxFreq\` tracks the growing count exactly, so \`size - maxFreq\` stays 0 the whole way and \`left\` never moves. Final window is the whole string.
Return **4** — matches expected.`,
      },
    ],
    relatedSlugs: ["longest-substring-without-repeating", "sliding-window-maximum"],
    realWorldUsageMarkdown: `The "windowSize - maxFrequency ≤ k" validity check generalizes to noisy-signal analysis — e.g. finding the longest run of a dominant sensor reading while tolerating up to k corrupted samples, or burst-tolerant stream analysis in error-correction contexts where a bounded number of outliers shouldn't break a run.`,
  },
```

- [ ] **Step 4: `minimum-window-substring` — add solutions**

Find:
```typescript
    testCases: [
      { input: ["ADOBECODEBANC", "ABC"], expected: "BANC" },
      { input: ["a", "a"], expected: "a" },
      { input: ["a", "aa"], expected: "" },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: ["ADOBECODEBANC", "ABC"], expected: "BANC" },
      { input: ["a", "a"], expected: "a" },
      { input: ["a", "aa"], expected: "" },
    ],
    solutions: [
      {
        approach: "Brute Force (Every Substring, Verify Containment)",
        timeComplexity: "O(n³)",
        spaceComplexity: "O(m)",
        overviewMarkdown:
          "Check every substring `s[i..j]`, and for each one build a frequency count to verify it contains every character of `t` at least as many times. Track the shortest valid one. Straightforward, but rebuilds a frequency count from scratch for every single substring.",
        code: `function minWindow(s, t) {
  const need = {};
  for (const c of t) need[c] = (need[c] || 0) + 1;

  const containsAll = (sub) => {
    const have = {};
    for (const c of sub) have[c] = (have[c] || 0) + 1;
    return Object.keys(need).every((c) => (have[c] || 0) >= need[c]);
  };

  let best = "";
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      const sub = s.slice(i, j + 1);
      if (sub.length >= t.length && containsAll(sub)) {
        if (best === "" || sub.length < best.length) best = sub;
        break; // no need to extend this start further once valid
      }
    }
  }
  return best;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`need\` | Required character counts from \`t\`. |
| 5-9 | \`containsAll\` | Checks whether a candidate substring has at least the required count of every needed character. |
| 12-13 | nested loops | Every substring \`s[i..j]\`. |
| 14-17 | check and record | Once a start \`i\` yields a valid window, it's the shortest for that start (extending further only grows it), so \`break\` and move to the next \`i\`. |`,
        dryRunMarkdown: `**Dry run 1** — \`s="a", t="a"\`:
i=0,j=0: sub="a", contains {a:1}≥{a:1} → valid, best="a", break.
Return **"a"** — matches expected.

**Dry run 2** — \`s="a", t="aa"\`:
Only possible substring is "a" (length1 < t.length 2, and even checking it: have{a:1} ≥ need{a:2}? no) → never valid.
Return **""** — matches expected.`,
      },
      {
        approach: "Optimal (Sliding Window with Formed/Required Counts)",
        timeComplexity: "O(n + m)",
        spaceComplexity: "O(m)",
        overviewMarkdown:
          "Expand `right` across `s`, tracking how many *distinct required characters* currently have enough copies in the window (`formed`) versus how many are needed (`required`). Whenever `formed === required` the window is valid — shrink `left` as far as possible while it stays valid, recording the shortest window found along the way.",
        code: `function minWindow(s, t) {
  if (t.length > s.length) return "";
  const need = {};
  for (const c of t) need[c] = (need[c] || 0) + 1;
  const required = Object.keys(need).length;

  const windowCounts = {};
  let formed = 0;
  let left = 0;
  let resLen = Infinity;
  let resLeft = 0;

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    windowCounts[c] = (windowCounts[c] || 0) + 1;
    if (need[c] && windowCounts[c] === need[c]) formed++;

    while (formed === required) {
      if (right - left + 1 < resLen) {
        resLen = right - left + 1;
        resLeft = left;
      }
      const lc = s[left];
      windowCounts[lc]--;
      if (need[lc] && windowCounts[lc] < need[lc]) formed--;
      left++;
    }
  }
  return resLen === Infinity ? "" : s.slice(resLeft, resLeft + resLen);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4-5 | \`need\`, \`required\` | Required counts per character, and how many distinct required characters exist. |
| 15-16 | \`if (need[c] && windowCounts[c] === need[c]) formed++\` | This character just reached exactly the required count — one more distinct requirement is now satisfied. |
| 18-25 | \`while (formed === required)\` | Window is fully valid — record it if it's the shortest so far, then try shrinking from the left. |
| 22-23 | \`if (need[lc] && windowCounts[lc] < need[lc]) formed--\` | Shrinking dropped a required character below its needed count — the window is no longer valid, so the while loop will stop after this iteration. |`,
        dryRunMarkdown: `**Dry run 1** — \`s="a", t="a"\`:
need={a:1}, required=1.
right0'a': windowCounts{a:1}, need[a]&&1===1→formed=1. While(formed===1): window="a"(len1)<Infinity→resLen=1,resLeft=0. Shrink: windowCounts[a]=0, 0<1→formed=0, left=1. Exit while.
Return **"a"** — matches expected.

**Dry run 2** — \`s="a", t="aa"\`:
need={a:2}, required=1.
right0'a': windowCounts{a:1}. need[a]=2, 1===2? no → formed stays 0. Loop ends (s exhausted).
resLen never updated (stays Infinity) → return **""** — matches expected.

**Dry run 3** — \`s="ADOBECODEBANC", t="ABC"\`:
need={A:1,B:1,C:1}, required=3. Expanding right, \`formed\` reaches 3 for the first time at right=5 (window "ADOBEC", length 6) — shrinking from there drops \`formed\` back to 2. Expanding again, \`formed\` reaches 3 a second time at right=10 (window "DOBECODEBA" onward); shrinking this time walks left all the way from index 1 to index 9, passing through valid windows of length 10, 9, 8, 7, 6 (tied, not shorter), then finding new shortest windows "EBANC" (length 5, left=8) and finally "BANC" (length 4, left=9) before invalidity breaks the shrink at left=10.
Final shortest window: \`s.slice(9, 13)\` = **"BANC"** — matches expected.`,
      },
    ],
    relatedSlugs: ["longest-substring-without-repeating", "sliding-window-maximum"],
    realWorldUsageMarkdown: `The formed/required frequency-matching window models exact multi-criteria search — e.g. finding the shortest log excerpt that contains every required event code, or the shortest DNA segment containing all bases of a target motif in bioinformatics — anywhere "shrink while still satisfying every requirement" applies.`,
  },
```

- [ ] **Step 5: `sliding-window-maximum` — add solutions**

Find:
```typescript
    testCases: [
      {
        input: [[1, 3, -1, -3, 5, 3, 6, 7], 3],
        expected: [3, 3, 5, 5, 6, 7],
      },
      { input: [[1], 1], expected: [1] },
      { input: [[1, -1], 1], expected: [1, -1] },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      {
        input: [[1, 3, -1, -3, 5, 3, 6, 7], 3],
        expected: [3, 3, 5, 5, 6, 7],
      },
      { input: [[1], 1], expected: [1] },
      { input: [[1, -1], 1], expected: [1, -1] },
    ],
    solutions: [
      {
        approach: "Brute Force (Scan Each Window)",
        timeComplexity: "O(n·k)",
        spaceComplexity: "O(1) extra (excluding output)",
        overviewMarkdown:
          "For each window position, scan its `k` elements to find the max. Simple and correct, but rescans overlapping elements in every window instead of reusing prior work.",
        code: `function maxSlidingWindow(nums, k) {
  const result = [];
  for (let i = 0; i + k <= nums.length; i++) {
    let windowMax = -Infinity;
    for (let j = i; j < i + k; j++) {
      windowMax = Math.max(windowMax, nums[j]);
    }
    result.push(windowMax);
  }
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`for (let i = 0; i + k <= nums.length; i++)\` | Every valid window start position. |
| 4-7 | inner scan | Find the max within \`[i, i+k)\` from scratch. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[1], k=1\`:
Window [0,0]: max=1 → result=[1] — matches expected.

**Dry run 2** — \`nums=[1,-1], k=1\`:
Window [0,0]: max=1. Window [1,1]: max=-1 → result=[1,-1] — matches expected.`,
      },
      {
        approach: "Optimal (Monotonic Deque of Indices)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(k)",
        overviewMarkdown:
          "Maintain a deque of indices whose corresponding values are in strictly decreasing order — the front is always the max of the current window. On each step: pop from the back any indices whose values are ≤ the new value (they can never be the max again, since the new element is both later and at least as large), push the new index, then drop the front index if it has slid out of the window. Each index is pushed and popped at most once, giving O(n) total.",
        code: `function maxSlidingWindow(nums, k) {
  const deque = []; // stores indices, values decreasing left to right
  const result = [];

  for (let i = 0; i < nums.length; i++) {
    while (deque.length && nums[deque[deque.length - 1]] <= nums[i]) {
      deque.pop();
    }
    deque.push(i);

    if (deque[0] <= i - k) deque.shift();

    if (i >= k - 1) result.push(nums[deque[0]]);
  }
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-8 | pop smaller trailing values | Any index whose value is ≤ the new one is useless — the new one outlives and outsizes it. |
| 9 | \`deque.push(i)\` | Add the current index; the deque stays value-decreasing. |
| 11 | \`if (deque[0] <= i - k) deque.shift()\` | Drop the front index once it's outside the current window. |
| 13 | \`if (i >= k - 1) result.push(nums[deque[0]])\` | Once the first full window is reached, the front of the deque is always this window's max. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[1,3,-1,-3,5,3,6,7], k=3\`:
i0(1): deque=[0].
i1(3): nums[0]=1≤3→pop. deque=[1].
i2(-1): nums[1]=3≤-1? no→push. deque=[1,2]. front1>i-k=-1, keep. i≥2→result=[3].
i3(-3): nums[2]=-1≤-3? no→push. deque=[1,2,3]. front1>0, keep. result=[3,3].
i4(5): nums[3]=-3≤5→pop→[1,2]; nums[2]=-1≤5→pop→[1]; nums[1]=3≤5→pop→[]. push4→[4]. front4>1,keep. result=[3,3,5].
i5(3): nums[4]=5≤3? no→push. deque=[4,5]. front4>2,keep. result=[3,3,5,5].
i6(6): nums[5]=3≤6→pop→[4]; nums[4]=5≤6→pop→[]. push6→[6]. front6>3,keep. result=[3,3,5,5,6].
i7(7): nums[6]=6≤7→pop→[]. push7→[7]. front7>4,keep. result=[3,3,5,5,6,7].
Return **[3,3,5,5,6,7]** — matches expected.

**Dry run 2** — \`nums=[1,-1], k=1\`:
i0(1): deque=[0]. front0>i-k=-1,keep. i≥0→result=[1].
i1(-1): nums[0]=1≤-1? no→push. deque=[0,1]. front0≤i-k=0→shift. deque=[1]. result=[1,-1].
Return **[1,-1]** — matches expected.`,
      },
    ],
    relatedSlugs: ["minimum-window-substring", "longest-repeating-character-replacement"],
    realWorldUsageMarkdown: `The monotonic deque is the standard technique behind streaming rolling-max/min analytics — e.g. tracking the maximum stock price or sensor reading over a trailing time window in real time — where O(1) amortized updates per new data point matter at high throughput.`,
  },
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 7: Lint**

Run: `npm run lint`
Expected: clean on `src/content/problems/sliding-window.ts`.

- [ ] **Step 8: Commit**

```bash
git add src/content/problems/sliding-window.ts
git commit -m "Backfill Deep Solutions content for Sliding Window topic"
```

## Task 7: Backfill Deep Solutions — Linked Lists (5 problems)

**Files:**
- Modify: `src/content/problems/linked-lists.ts`

**Interfaces:**
- Consumes: `Solution` type and `Problem.solutions?`/`relatedSlugs?`/`realWorldUsageMarkdown?` from Task 1.
- Produces: nothing new — data-only addition. `description`/`starterCode`/`functionName`/`testCases` on all 5 problems are UNCHANGED. Solution `code` blocks in this file may reference plain object literals (`{ val, next }`) instead of the `ListNode` constructor shown in `starterCode` — both shapes work identically against the worker's duck-typed list hydration/dehydration (`"val" in x && "next" in x`), and this keeps the example code copy-pasteable without requiring the `listNodeDefinition` boilerplate.

- [ ] **Step 1: `reverse-linked-list` — add solutions**

Find:
```typescript
    testCases: [
      { input: [{ __listNode: [1, 2, 3, 4, 5] }], expected: [5, 4, 3, 2, 1], resultType: "list" },
      { input: [{ __listNode: [1, 2] }], expected: [2, 1], resultType: "list" },
      { input: [{ __listNode: [] }], expected: [], resultType: "list" },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: [{ __listNode: [1, 2, 3, 4, 5] }], expected: [5, 4, 3, 2, 1], resultType: "list" },
      { input: [{ __listNode: [1, 2] }], expected: [2, 1], resultType: "list" },
      { input: [{ __listNode: [] }], expected: [], resultType: "list" },
    ],
    solutions: [
      {
        approach: "Recursive",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n) — call stack depth",
        overviewMarkdown:
          "Recurse to the end of the list first, then, as each call unwinds, point the *next* node's `next` back at the current node. The base case (empty list or single node) is already 'reversed'. Elegant, but every node adds a stack frame — risky for very long lists.",
        code: `function reverseList(head) {
  if (!head || !head.next) return head;
  const newHead = reverseList(head.next);
  head.next.next = head;
  head.next = null;
  return newHead;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`if (!head || !head.next) return head\` | Base case: an empty list or a single node is its own reversal. |
| 3 | \`const newHead = reverseList(head.next)\` | Recurse first — \`newHead\` ends up being the original list's tail, which becomes the new head. |
| 4 | \`head.next.next = head\` | The node right after \`head\` should now point back at \`head\`. |
| 5 | \`head.next = null\` | \`head\` becomes the new tail, so its forward pointer must be cleared. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,3,4,5]\`:
\`reverseList(1)\` → calls \`reverseList(2)\` → calls \`reverseList(3)\` → calls \`reverseList(4)\` → calls \`reverseList(5)\`: node5.next is null → base case → returns node5.
Unwinding \`reverseList(4)\`: node5.next=node4; node4.next=null. Returns newHead=node5.
Unwinding \`reverseList(3)\`: node4.next=node3; node3.next=null. Returns node5.
Unwinding \`reverseList(2)\`: node3.next=node2; node2.next=null. Returns node5.
Unwinding \`reverseList(1)\`: node2.next=node1; node1.next=null. Returns node5.
Final chain: 5→4→3→2→1→null = **[5,4,3,2,1]** — matches expected.

**Dry run 2** — \`[]\`:
\`head\` is \`null\` → base case \`!head\` is true → return \`null\` → **[]** — matches expected.`,
      },
      {
        approach: "Optimal (Iterative Three-Pointer Walk)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Walk the list once with three pointers: `prev` (the reversed portion built so far), `curr` (the node being relinked), and `next` (saved before it's overwritten, so the walk doesn't lose the rest of the list). This is the expected senior-level answer — no extra space, no recursion risk.",
        code: `function reverseList(head) {
  let prev = null;
  let curr = head;

  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`prev = null\`, \`curr = head\` | Nothing reversed yet; start walking from the original head. |
| 6 | \`const next = curr.next\` | Save the rest of the list before the pointer below overwrites it. |
| 7 | \`curr.next = prev\` | Point the current node backward, into the reversed portion. |
| 8-9 | \`prev = curr; curr = next\` | Advance both pointers one step. |
| 11 | \`return prev\` | When \`curr\` becomes \`null\`, \`prev\` is sitting on the new head (the original list's last node). |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,3,4,5]\`:
prev=null, curr=1. next=2, node1.next=null, prev=1, curr=2 → chain so far: 1→null
next=3, node2.next=1, prev=2, curr=3 → chain: 2→1→null
next=4, node3.next=2, prev=3, curr=4 → chain: 3→2→1→null
next=5, node4.next=3, prev=4, curr=5 → chain: 4→3→2→1→null
next=null, node5.next=4, prev=5, curr=null → chain: 5→4→3→2→1→null
Loop ends (curr is null). Return prev=5 → **[5,4,3,2,1]** — matches expected.

**Dry run 2** — \`[]\`:
curr=head=null → \`while (curr)\` is false immediately → return prev=null → **[]** — matches expected.`,
      },
    ],
    relatedSlugs: ["merge-two-sorted-lists"],
    realWorldUsageMarkdown: `In-place pointer reversal is the base building block for undo/redo history reversal, reversing browser back-navigation stacks, and any "reverse a sub-range" or "reverse in groups of k" variant used in text-processing and low-level buffer manipulation.`,
  },
```

- [ ] **Step 2: `merge-two-sorted-lists` — add solutions**

Find:
```typescript
    testCases: [
      {
        input: [{ __listNode: [1, 2, 4] }, { __listNode: [1, 3, 4] }],
        expected: [1, 1, 2, 3, 4, 4],
        resultType: "list",
      },
      { input: [{ __listNode: [] }, { __listNode: [] }], expected: [], resultType: "list" },
      { input: [{ __listNode: [] }, { __listNode: [0] }], expected: [0], resultType: "list" },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      {
        input: [{ __listNode: [1, 2, 4] }, { __listNode: [1, 3, 4] }],
        expected: [1, 1, 2, 3, 4, 4],
        resultType: "list",
      },
      { input: [{ __listNode: [] }, { __listNode: [] }], expected: [], resultType: "list" },
      { input: [{ __listNode: [] }, { __listNode: [0] }], expected: [0], resultType: "list" },
    ],
    solutions: [
      {
        approach: "Brute Force (Collect, Sort, Rebuild)",
        timeComplexity: "O((n+m) log(n+m))",
        spaceComplexity: "O(n+m)",
        overviewMarkdown:
          "Walk both lists into a single array of values, sort it, then build a brand new list from the sorted array. Correct and easy to reason about, but throws away the fact that both inputs are already sorted, and allocates entirely new nodes.",
        code: `function mergeTwoLists(list1, list2) {
  const values = [];
  for (let curr = list1; curr; curr = curr.next) values.push(curr.val);
  for (let curr = list2; curr; curr = curr.next) values.push(curr.val);
  values.sort((a, b) => a - b);

  const dummy = { val: 0, next: null };
  let tail = dummy;
  for (const v of values) {
    tail.next = { val: v, next: null };
    tail = tail.next;
  }
  return dummy.next;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-4 | collect values | Walk both lists into one flat array, ignoring their existing order. |
| 5 | \`values.sort((a, b) => a - b)\` | Numeric sort, since default \`.sort()\` is lexicographic. |
| 7-11 | rebuild | Construct fresh nodes for every value in sorted order. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,4]\`, \`[1,3,4]\`:
values=[1,2,4,1,3,4] → sorted=[1,1,2,3,4,4] → rebuild → **[1,1,2,3,4,4]** — matches expected.

**Dry run 2** — \`[]\`, \`[0]\`:
values=[0] → sorted=[0] → rebuild → **[0]** — matches expected.`,
      },
      {
        approach: "Optimal (Dummy Node + Two-Pointer Splice)",
        timeComplexity: "O(n+m)",
        spaceComplexity: "O(1) extra — splices existing nodes, never allocates new ones",
        overviewMarkdown:
          "Walk both lists simultaneously with a `dummy` head to avoid special-casing the first node of the result. At each step, splice whichever current node has the smaller value onto the result's tail and advance that list's pointer. When one list runs out, the remainder of the other is already sorted, so it can be spliced on wholesale.",
        code: `function mergeTwoLists(list1, list2) {
  const dummy = { val: 0, next: null };
  let tail = dummy;
  let a = list1;
  let b = list2;

  while (a && b) {
    if (a.val <= b.val) {
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a || b;
  return dummy.next;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`dummy\`, \`tail\` | \`dummy.next\` will end up as the real head — no special-casing needed for "what's the first node." |
| 7-13 | \`while (a && b)\` | Splice the smaller of the two current nodes onto the tail; splicing (relinking \`.next\`) reuses existing nodes instead of copying values. |
| 15 | \`tail.next = a \|\| b\` | Whichever list still has nodes left is already sorted — attach it directly, no further comparison needed. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,4]\`, \`[1,3,4]\`:
a=1(list1),b=1(list2): 1≤1 → splice a → tail=a-node(1). a=2.
a=2,b=1: 2≤1? no → splice b → tail=b-node(1). b=3.
a=2,b=3: 2≤3 → splice a → tail=a-node(2). a=4.
a=4,b=3: 4≤3? no → splice b → tail=b-node(3). b=4.
a=4,b=4: 4≤4 → splice a → tail=a-node(4). a=null.
Loop ends (a is null). \`tail.next = a || b\` = b-node(4).
Result: 1(list1)→1(list2)→2→3→4(list1)→4(list2) = **[1,1,2,3,4,4]** — matches expected.

**Dry run 2** — \`[]\`, \`[0]\`:
a=null, b=0-node. \`while (a && b)\` is false immediately (a is falsy). \`tail.next = a || b\` = b(0-node).
Result: **[0]** — matches expected.`,
      },
    ],
    relatedSlugs: ["merge-k-sorted-lists", "reverse-linked-list"],
    realWorldUsageMarkdown: `The dummy-head splice-merge is the literal merge step inside external merge sort — merging two already-sorted runs of data too large to fit in memory — and the same pattern merges two sorted event streams (e.g. combining timestamped logs from two sources into one ordered feed) without copying any records.`,
  },
```

- [ ] **Step 3: `linked-list-cycle` — add solutions**

Find:
```typescript
    testCases: [
      { input: [{ __cycleList: { values: [3, 2, 0, -4], pos: 1 } }], expected: true },
      { input: [{ __cycleList: { values: [1, 2], pos: 0 } }], expected: true },
      { input: [{ __cycleList: { values: [1], pos: -1 } }], expected: false },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: [{ __cycleList: { values: [3, 2, 0, -4], pos: 1 } }], expected: true },
      { input: [{ __cycleList: { values: [1, 2], pos: 0 } }], expected: true },
      { input: [{ __cycleList: { values: [1], pos: -1 } }], expected: false },
    ],
    solutions: [
      {
        approach: "Brute Force (Hash Set of Visited Nodes)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Walk the list, remembering every node object visited in a `Set`. If the walk ever revisits a node already in the set, there's a cycle; if it reaches `null`, there isn't. Correct and simple, but uses O(n) extra memory — an interviewer will immediately ask for the O(1)-space version.",
        code: `function hasCycle(head) {
  const seen = new Set();
  let curr = head;
  while (curr) {
    if (seen.has(curr)) return true;
    seen.add(curr);
    curr = curr.next;
  }
  return false;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`seen\` | Tracks node object identity, not values — two different nodes can share a value. |
| 5 | \`if (seen.has(curr)) return true\` | Revisiting a node object is only possible if a cycle loops back to it. |
| 6-7 | \`seen.add(curr); curr = curr.next\` | Mark this node visited and advance. |`,
        dryRunMarkdown: `**Dry run 1** — \`values=[1], pos=-1\` (no cycle, single node whose \`next\` is \`null\`):
curr=node1: not in seen → add. curr=node1.next=null. Loop ends (curr is null) → return **false** — matches expected.

**Dry run 2** — \`values=[1,2], pos=0\` (node2.next points back to node1):
curr=node1: not seen → add {node1}. curr=node2.
curr=node2: not seen → add {node1,node2}. curr=node2.next=node1 (the cycle).
curr=node1: \`seen.has(node1)\` → true → return **true** — matches expected.`,
      },
      {
        approach: "Optimal (Floyd's Fast & Slow Pointers)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Move `slow` one step and `fast` two steps at a time. If there's no cycle, `fast` reaches the end first. If there is a cycle, `fast` eventually laps `slow` inside the loop and they land on the same node — no extra memory needed to detect it.",
        code: `function hasCycle(head) {
  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`slow = fast = head\` | Both pointers start at the same place. |
| 5 | \`while (fast && fast.next)\` | Stop safely if \`fast\` (the faster pointer) runs off the end — that means no cycle. |
| 6-7 | \`slow = slow.next; fast = fast.next.next\` | \`fast\` gains one extra step of distance on \`slow\` every iteration. |
| 8 | \`if (slow === fast) return true\` | Inside a cycle, the gap between them shrinks by 1 each iteration and must eventually hit 0 — they meet. |`,
        dryRunMarkdown: `**Dry run 1** — \`values=[1], pos=-1\` (node1.next = null):
slow=node1, fast=node1. \`while (fast && fast.next)\`: fast.next is \`null\` → condition false immediately → return **false** — matches expected.

**Dry run 2** — \`values=[1,2], pos=0\` (node1→node2→node1→…):
slow=node1, fast=node1.
Iteration: fast(node1) && fast.next(node2) → true. slow=slow.next=node2. fast=fast.next.next=node1.next.next=node2.next=node1. slow(node2)===fast(node1)? no.
Iteration: fast(node1) && fast.next(node2) → true. slow=slow.next=node2.next=node1. fast=fast.next.next=node1.next.next=node2.next=node1. slow(node1)===fast(node1)? **yes** → return **true** — matches expected.`,
      },
    ],
    relatedSlugs: ["remove-nth-node-from-end-of-list"],
    realWorldUsageMarkdown: `Floyd's fast/slow technique detects infinite loops in any linked structure — state-machine transition graphs, circular configuration references, or resolving symlink loops — in O(1) space, and the same two-speed-pointer idea is reused to find a cycle's entry point and to find the middle of a list in one pass.`,
  },
```

- [ ] **Step 4: `remove-nth-node-from-end-of-list` — add solutions**

Find:
```typescript
    testCases: [
      { input: [{ __listNode: [1, 2, 3, 4, 5] }, 2], expected: [1, 2, 3, 5], resultType: "list" },
      { input: [{ __listNode: [1] }, 1], expected: [], resultType: "list" },
      { input: [{ __listNode: [1, 2] }, 1], expected: [1], resultType: "list" },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: [{ __listNode: [1, 2, 3, 4, 5] }, 2], expected: [1, 2, 3, 5], resultType: "list" },
      { input: [{ __listNode: [1] }, 1], expected: [], resultType: "list" },
      { input: [{ __listNode: [1, 2] }, 1], expected: [1], resultType: "list" },
    ],
    solutions: [
      {
        approach: "Brute Force (Two Pass — Count, Then Remove)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "First pass counts the list's length. Second pass walks to the node just before the target (`length - n` steps from a dummy head) and unlinks it. Correct and still linear time, but requires seeing the whole list before starting the second walk — the one-pass version needs no length lookup at all.",
        code: `function removeNthFromEnd(head, n) {
  let length = 0;
  for (let curr = head; curr; curr = curr.next) length++;

  const dummy = { val: 0, next: head };
  let curr = dummy;
  for (let i = 0; i < length - n; i++) {
    curr = curr.next;
  }
  curr.next = curr.next.next;
  return dummy.next;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | first pass | Count total nodes. |
| 5-6 | \`dummy\` | Lets removing the actual first node work with the same code path as removing any other node. |
| 7-9 | second pass | Walk \`length - n\` steps from \`dummy\` to land on the node just before the target. |
| 10 | \`curr.next = curr.next.next\` | Unlink the target node. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,3,4,5], n=2\`:
length=5. dummy→1→2→3→4→5. Walk \`length-n=3\` steps from dummy: dummy→node1→node2→node3. curr=node3(val3).
\`curr.next = curr.next.next\` → node3.next = node5 (skips node4).
Result: 1→2→3→5 = **[1,2,3,5]** — matches expected.

**Dry run 2** — \`[1], n=1\`:
length=1. dummy→1. Walk \`length-n=0\` steps → curr=dummy.
\`curr.next = curr.next.next\` → dummy.next = node1.next = null.
Result: **[]** — matches expected.`,
      },
      {
        approach: "Optimal (One-Pass, Fixed-Gap Two Pointers)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Advance a `lead` pointer `n` steps ahead of `trail` first, then move both together until `lead` falls off the end. When that happens, `trail` is sitting exactly one node before the target — no length lookup needed, and the whole list is walked only once.",
        code: `function removeNthFromEnd(head, n) {
  const dummy = { val: 0, next: head };
  let lead = dummy;
  let trail = dummy;

  for (let i = 0; i < n; i++) lead = lead.next;

  while (lead.next) {
    lead = lead.next;
    trail = trail.next;
  }
  trail.next = trail.next.next;
  return dummy.next;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-4 | \`dummy\`, \`lead\`, \`trail\` | Both pointers start at \`dummy\`; the gap between them will be established next. |
| 6 | \`for (let i = 0; i < n; i++) lead = lead.next\` | Open up an \`n\`-node gap between \`lead\` and \`trail\`. |
| 8-11 | \`while (lead.next)\` | Advance both together; the fixed gap means \`trail\` reaches "one before the target" exactly when \`lead\` reaches the last node. |
| 12 | \`trail.next = trail.next.next\` | Unlink the target node. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,3,4,5], n=2\`:
dummy→1→2→3→4→5. lead=trail=dummy.
Advance lead 2 steps: lead=node1→node2.
While lead.next: lead.next=node3 → lead=node3, trail=node1. lead.next=node4 → lead=node4, trail=node2. lead.next=node5 → lead=node5, trail=node3. lead.next=null → stop.
trail=node3. \`trail.next = trail.next.next\` → node3.next=node5 (skips node4).
Result: 1→2→3→5 = **[1,2,3,5]** — matches expected.

**Dry run 2** — \`[1,2], n=1\`:
dummy→1→2. lead=trail=dummy. Advance lead 1 step: lead=node1.
While lead.next: lead.next=node2 → lead=node2, trail=node1. lead.next=null → stop.
trail=node1. \`trail.next = trail.next.next\` → node1.next=node2.next=null.
Result: **[1]** — matches expected.`,
      },
    ],
    relatedSlugs: ["linked-list-cycle", "merge-two-sorted-lists"],
    realWorldUsageMarkdown: `The fixed-gap two-pointer technique processes a "trailing window" over data whose total length isn't known upfront — e.g. computing a streaming median-of-last-N over a live feed, or enforcing a sliding rate-limit counter over an append-only log — all without a first pass to count elements.`,
  },
```

- [ ] **Step 5: `merge-k-sorted-lists` — add solutions**

Find:
```typescript
    testCases: [
      {
        input: [[{ __listNode: [1, 4, 5] }, { __listNode: [1, 3, 4] }, { __listNode: [2, 6] }]],
        expected: [1, 1, 2, 3, 4, 4, 5, 6],
        resultType: "list",
      },
      { input: [[]], expected: [], resultType: "list" },
      { input: [[{ __listNode: [] }]], expected: [], resultType: "list" },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      {
        input: [[{ __listNode: [1, 4, 5] }, { __listNode: [1, 3, 4] }, { __listNode: [2, 6] }]],
        expected: [1, 1, 2, 3, 4, 4, 5, 6],
        resultType: "list",
      },
      { input: [[]], expected: [], resultType: "list" },
      { input: [[{ __listNode: [] }]], expected: [], resultType: "list" },
    ],
    solutions: [
      {
        approach: "Brute Force (Collect All, Sort, Rebuild)",
        timeComplexity: "O(N log N) where N is the total number of nodes",
        spaceComplexity: "O(N)",
        overviewMarkdown:
          "Flatten every list into one array of values, sort it, then build a fresh list from the sorted array. Ignores that each input list already arrives sorted — the k-way merge below exploits that instead.",
        code: `function mergeKLists(lists) {
  const values = [];
  for (const list of lists) {
    for (let curr = list; curr; curr = curr.next) values.push(curr.val);
  }
  values.sort((a, b) => a - b);

  const dummy = { val: 0, next: null };
  let tail = dummy;
  for (const v of values) {
    tail.next = { val: v, next: null };
    tail = tail.next;
  }
  return dummy.next;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-5 | flatten | Walk every list in \`lists\`, collecting every value into one array. |
| 6 | \`values.sort((a, b) => a - b)\` | Numeric sort across the combined set. |
| 8-12 | rebuild | Build a new list from the sorted values. |`,
        dryRunMarkdown: `**Dry run 1** — \`[[1,4,5],[1,3,4],[2,6]]\`:
values=[1,4,5,1,3,4,2,6] → sorted=[1,1,2,3,4,4,5,6] → rebuild → **[1,1,2,3,4,4,5,6]** — matches expected.

**Dry run 2** — \`[]\` (empty array of lists):
The outer \`for\` loop never runs → values=[] → sorted=[] → \`dummy.next\` stays \`null\` → **[]** — matches expected.`,
      },
      {
        approach: "Optimal (Min-Heap of the k Current Heads)",
        timeComplexity: "O(N log k) where N is the total number of nodes and k is the number of lists",
        spaceComplexity: "O(k) for the heap",
        overviewMarkdown:
          "Push the head node of every non-empty list into a min-heap keyed by `.val`. Repeatedly pop the smallest, splice it onto the result, and push its successor (if any) back into the heap. The heap only ever holds at most one node per list (`k` at a time), so each of the `N` total pops/pushes costs `O(log k)` instead of the brute force's `O(log N)` per comparison across everything at once.",
        code: `class MinHeap {
  constructor() {
    this.data = [];
  }
  size() {
    return this.data.length;
  }
  push(node) {
    this.data.push(node);
    let i = this.data.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.data[parent].val <= this.data[i].val) break;
      [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
      i = parent;
    }
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last;
      let i = 0;
      while (true) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let smallest = i;
        if (left < this.data.length && this.data[left].val < this.data[smallest].val) smallest = left;
        if (right < this.data.length && this.data[right].val < this.data[smallest].val) smallest = right;
        if (smallest === i) break;
        [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
        i = smallest;
      }
    }
    return top;
  }
}

function mergeKLists(lists) {
  const heap = new MinHeap();
  for (const node of lists) {
    if (node) heap.push(node);
  }

  const dummy = { val: 0, next: null };
  let tail = dummy;
  while (heap.size() > 0) {
    const node = heap.pop();
    tail.next = node;
    tail = tail.next;
    if (node.next) heap.push(node.next);
  }
  return dummy.next;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 1-38 | \`MinHeap\` | Standard array-backed binary min-heap, ordered by \`.val\`, with \`push\` (sift up) and \`pop\` (sift down). |
| 41-43 | seed the heap | Push each list's head node — skip \`null\` heads (empty input lists). |
| 47-52 | main loop | Pop the globally-smallest current head, splice it onto the result, and if that node has a successor, push it in as the new candidate from its list. |`,
        dryRunMarkdown: `**Dry run 1** — \`[[1,4,5],[1,3,4],[2,6]]\`:
Seed heap with heads: 1 (list0), 1 (list1), 2 (list2).
Each pop removes the current minimum and immediately pushes that list's next node (if any); the sequence of popped values in order is: 1(list0)→push 4(list0); 1(list1)→push 3(list1); 2(list2)→push 6(list2); 3(list1)→push 4(list1); 4(list0)→push 5(list0); 4(list1)→list1 exhausted, no push; 5(list0)→list0 exhausted, no push; 6(list2)→list2 exhausted, no push. Heap empties after that.
Spliced in pop order: **[1,1,2,3,4,4,5,6]** — matches expected.

**Dry run 2** — \`[]\` (empty array of lists):
The seeding loop never runs (no lists to iterate) → heap stays empty → \`while (heap.size() > 0)\` never executes → \`dummy.next\` stays \`null\` → **[]** — matches expected.`,
      },
    ],
    relatedSlugs: ["merge-two-sorted-lists", "kth-largest-element-in-array"],
    realWorldUsageMarkdown: `The min-heap k-way merge is exactly how external merge sort combines k already-sorted runs read from disk when the full dataset doesn't fit in memory, and it's the same technique log-aggregation systems use to merge k timestamp-sorted shards into one globally ordered event stream.`,
  },
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 7: Lint**

Run: `npm run lint`
Expected: clean on `src/content/problems/linked-lists.ts`.

- [ ] **Step 8: Commit**

```bash
git add src/content/problems/linked-lists.ts
git commit -m "Backfill Deep Solutions content for Linked Lists topic"
```

## Task 8: Backfill Deep Solutions — Stack (5 problems)

**Files:**
- Modify: `src/content/problems/stack.ts`

**Interfaces:**
- Consumes: `Solution` type and `Problem.solutions?`/`relatedSlugs?`/`realWorldUsageMarkdown?` from Task 1.
- Produces: nothing new — data-only addition. `description`/`starterCode`/`functionName`/`testCases` on all 5 problems are UNCHANGED. `evaluate-reverse-polish-notation` gets exactly 1 solution (no meaningfully distinct second approach), per the plan's Global Constraints.

- [ ] **Step 1: `valid-parentheses` — add solutions**

Find:
```typescript
    testCases: [
      { input: ["()"], expected: true },
      { input: ["()[]{}"], expected: true },
      { input: ["(]"], expected: false },
      { input: ["([)]"], expected: false },
      { input: ["{[]}"], expected: true },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: ["()"], expected: true },
      { input: ["()[]{}"], expected: true },
      { input: ["(]"], expected: false },
      { input: ["([)]"], expected: false },
      { input: ["{[]}"], expected: true },
    ],
    solutions: [
      {
        approach: "Brute Force (Repeated Pair Reduction)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Repeatedly remove any adjacent matched pair (`()`, `[]`, or `{}`) from the string. If the string can be fully reduced to empty, it was valid; if reduction stalls with characters remaining (including interleaved cases like `\"([)]\"`, where no adjacent pair ever exists to remove), it wasn't. Each full pass is O(n), and a fully-nested string needs O(n) passes to fully collapse.",
        code: `function isValid(s) {
  let prev;
  do {
    prev = s;
    s = s.replace("()", "").replace("[]", "").replace("{}", "");
  } while (s !== prev);
  return s === "";
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4 | \`s.replace("()", "").replace("[]", "").replace("{}", "")\` | Remove the first occurrence of each pair type (each \`.replace\` without a global flag removes only one match). |
| 5 | \`while (s !== prev)\` | Keep collapsing as long as a pass actually removed something. |
| 6 | \`return s === ""\` | Fully valid input collapses completely; any leftover character (unmatched or interleaved) means it wasn't. |`,
        dryRunMarkdown: `**Dry run 1** — \`"([)]"\`:
Pass 1: no literal \`"()"\` substring exists (after \`(\` comes \`[\`, not \`)\`), no literal \`"[]"\` exists (after \`[\` comes \`)\`, not \`]\`), no \`"{}"\` exists → \`s\` unchanged, still \`"([)]"\`. Since \`s === prev\`, the loop stops after one pass.
\`s === ""\`? No → return **false** — matches expected.

**Dry run 2** — \`"{[]}"\`:
Pass 1: no \`"()"\`; \`"[]"\` found inside → removes to \`"{}"\`; then \`"{}"\` found → removes to \`""\`. \`s\` changed, so loop continues.
Pass 2: \`s = ""\`, nothing to remove, unchanged → loop stops.
\`s === ""\`? Yes → return **true** — matches expected.`,
      },
      {
        approach: "Optimal (Stack as a Matcher)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Push every opening bracket. On a closing bracket, the top of the stack must be its matching opener — pop and continue if so, fail immediately if not. At the end, the stack must be empty (no unclosed openers left). A counter alone can't work here: order matters, not just totals (`\"([)]\"` has balanced counts of each bracket type but is still invalid).",
        code: `function isValid(s) {
  const stack = [];
  const pairs = { ")": "(", "]": "[", "}": "{" };

  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch);
    } else if (stack.pop() !== pairs[ch]) {
      return false;
    }
  }
  return stack.length === 0;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`pairs\` | Maps each closer to the opener it must match. |
| 6-7 | opener branch | Push any opening bracket. |
| 8-9 | \`else if (stack.pop() !== pairs[ch]) return false\` | Popping an empty stack yields \`undefined\`, which also fails the comparison correctly — a closer with nothing open to match it is invalid. |
| 11 | \`return stack.length === 0\` | Every opener must have been matched — nothing left unclosed. |`,
        dryRunMarkdown: `**Dry run 1** — \`"([)]"\`:
\`(\` → push → stack=\`['(']\`.
\`[\` → push → stack=\`['(','[']\`.
\`)\` → \`pairs[')'] = '('\`; \`stack.pop()\` returns \`'['\`, which is \`!== '('\` → return **false** — matches expected.

**Dry run 2** — \`"{[]}"\`:
\`{\` → push → stack=\`['{']\`.
\`[\` → push → stack=\`['{','[']\`.
\`]\` → \`pairs[']'] = '['\`; \`stack.pop()\` returns \`'['\`, matches → stack=\`['{']\`.
\`}\` → \`pairs['}'] = '{'\`; \`stack.pop()\` returns \`'{'\`, matches → stack=\`[]\`.
Loop ends; \`stack.length === 0\` → return **true** — matches expected.`,
      },
    ],
    relatedSlugs: ["min-stack"],
    realWorldUsageMarkdown: `Stack-based bracket matching is the literal mechanism behind syntax validation in compilers and linters (matching braces/parens in source code), JSON/XML well-formedness checks, and matching opening/closing tags in HTML validators.`,
  },
```

- [ ] **Step 2: `min-stack` — add solutions**

Find:
```typescript
    testCases: [
      {
        operations: ["MinStack", "push", "push", "push", "getMin", "pop", "top", "getMin"],
        args: [[], [-2], [0], [-3], [], [], [], []],
        expected: [null, null, null, null, -3, null, 0, -2],
      },
      {
        operations: ["MinStack", "push", "push", "getMin", "pop", "getMin"],
        args: [[], [5], [3], [], [], []],
        expected: [null, null, null, 3, null, 5],
      },
      {
        operations: ["MinStack", "push", "push", "push", "getMin", "pop", "getMin", "top"],
        args: [[], [2], [0], [0], [], [], [], []],
        expected: [null, null, null, null, 0, null, 0, 0],
      },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      {
        operations: ["MinStack", "push", "push", "push", "getMin", "pop", "top", "getMin"],
        args: [[], [-2], [0], [-3], [], [], [], []],
        expected: [null, null, null, null, -3, null, 0, -2],
      },
      {
        operations: ["MinStack", "push", "push", "getMin", "pop", "getMin"],
        args: [[], [5], [3], [], [], []],
        expected: [null, null, null, 3, null, 5],
      },
      {
        operations: ["MinStack", "push", "push", "push", "getMin", "pop", "getMin", "top"],
        args: [[], [2], [0], [0], [], [], [], []],
        expected: [null, null, null, null, 0, null, 0, 0],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Rescan for Min on Every Query)",
        timeComplexity: "O(1) push/pop/top, O(n) getMin",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Use a single plain array and scan the whole thing for the minimum every time `getMin()` is called. Simple, but violates the problem's O(1)-for-every-operation requirement — an interviewer will ask for the auxiliary-stack trick immediately.",
        code: `class MinStack {
  constructor() {
    this.stack = [];
  }
  push(val) {
    this.stack.push(val);
  }
  pop() {
    this.stack.pop();
  }
  top() {
    return this.stack[this.stack.length - 1];
  }
  getMin() {
    return Math.min(...this.stack);
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5 | \`push(val)\` | Ordinary array push. |
| 14 | \`Math.min(...this.stack)\` | Rescans every element currently on the stack — O(n) work on every call. |`,
        dryRunMarkdown: `**Dry run 1** — \`push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()\`:
push(-2)→[-2]. push(0)→[-2,0]. push(-3)→[-2,0,-3]. getMin()=min(-2,0,-3)=**-3**. pop()→[-2,0]. top()=**0**. getMin()=min(-2,0)=**-2**.
Outputs: [null,null,null,null,-3,null,0,-2] — matches expected.

**Dry run 2** — \`push(2), push(0), push(0), getMin(), pop(), getMin(), top()\`:
push(2)→[2]. push(0)→[2,0]. push(0)→[2,0,0]. getMin()=min(2,0,0)=**0**. pop()→[2,0]. getMin()=min(2,0)=**0**. top()=**0**.
Outputs: [null,null,null,null,0,null,0,0] — matches expected.`,
      },
      {
        approach: "Optimal (Auxiliary Min-Stack)",
        timeComplexity: "O(1) for every operation",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Maintain a second stack, `minStack`, in lockstep with the main one: each push also pushes the minimum of the new value and the current minimum, so `minStack`'s top is always the running minimum of everything currently on the main stack. Popping both together keeps them in sync without ever rescanning.",
        code: `class MinStack {
  constructor() {
    this.stack = [];
    this.minStack = [];
  }
  push(val) {
    this.stack.push(val);
    const currentMin =
      this.minStack.length === 0
        ? val
        : Math.min(val, this.minStack[this.minStack.length - 1]);
    this.minStack.push(currentMin);
  }
  pop() {
    this.stack.pop();
    this.minStack.pop();
  }
  top() {
    return this.stack[this.stack.length - 1];
  }
  getMin() {
    return this.minStack[this.minStack.length - 1];
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 7-11 | \`currentMin\` | The minimum of the incoming value and whatever was the running minimum just before it. |
| 12 | \`this.minStack.push(currentMin)\` | \`minStack\` grows in lockstep with \`stack\`, one entry per push. |
| 15-17 | \`pop()\` | Popping both stacks together keeps them aligned — \`minStack\`'s new top is automatically the correct minimum for the remaining elements. |
| 22 | \`getMin()\` | Just reads \`minStack\`'s top — O(1), no scanning. |`,
        dryRunMarkdown: `**Dry run 1** — \`push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()\`:
push(-2): stack=[-2], minStack empty→currentMin=-2, minStack=[-2].
push(0): stack=[-2,0], currentMin=min(0,-2)=-2, minStack=[-2,-2].
push(-3): stack=[-2,0,-3], currentMin=min(-3,-2)=-3, minStack=[-2,-2,-3].
getMin()→minStack top=**-3**.
pop(): stack=[-2,0], minStack=[-2,-2].
top()→stack top=**0**.
getMin()→minStack top=**-2**.
Outputs: [null,null,null,null,-3,null,0,-2] — matches expected.

**Dry run 2** — \`push(5), push(3), getMin(), pop(), getMin()\`:
push(5): stack=[5], minStack=[5].
push(3): stack=[5,3], currentMin=min(3,5)=3, minStack=[5,3].
getMin()→**3**.
pop(): stack=[5], minStack=[5].
getMin()→**5**.
Outputs: [null,null,null,3,null,5] — matches expected.`,
      },
    ],
    relatedSlugs: ["valid-parentheses", "kth-largest-in-stream"],
    realWorldUsageMarkdown: `The "shadow stack tracks a running aggregate" pattern generalizes to any O(1)-query running statistic over a LIFO structure — undo systems that need the running minimum/maximum of a value across an edit history, or a browser back-stack that tracks the deepest scroll position visited, all without rescanning history on every query.`,
  },
```

- [ ] **Step 3: `evaluate-reverse-polish-notation` — add solutions**

Find:
```typescript
    testCases: [
      { input: [["2", "1", "+", "3", "*"]], expected: 9 },
      { input: [["4", "13", "5", "/", "+"]], expected: 6 },
      {
        input: [["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]],
        expected: 22,
      },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: [["2", "1", "+", "3", "*"]], expected: 9 },
      { input: [["4", "13", "5", "/", "+"]], expected: 6 },
      {
        input: [["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]],
        expected: 22,
      },
    ],
    solutions: [
      {
        approach: "Stack-Based Evaluation",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Push numbers as they're seen. On an operator, pop the two most recent operands, apply the operator, and push the result back. Order matters for `-` and `/`: the first pop is the *right-hand* operand and the second is the *left-hand* one, since it was pushed earlier. This is the only meaningfully distinct approach — RPN is specifically designed to be evaluated with a single stack in one linear pass, which is exactly what a compiler does after parsing infix expressions into postfix form.",
        code: `function evalRPN(tokens) {
  const stack = [];
  const ops = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => Math.trunc(a / b),
  };

  for (const token of tokens) {
    if (ops[token]) {
      const b = stack.pop();
      const a = stack.pop();
      stack.push(ops[token](a, b));
    } else {
      stack.push(Number(token));
    }
  }
  return stack.pop();
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-8 | \`ops\` | One function per operator; \`Math.trunc\` (not \`Math.floor\`) gives truncate-toward-zero, which matters for negative results. |
| 11-14 | operator branch | \`b\` is popped first (it was pushed second, i.e. it's the right-hand operand), \`a\` second (the left-hand operand) — applying \`ops[token](a, b)\` preserves the correct operand order for \`-\` and \`/\`. |
| 15-16 | operand branch | Numbers are parsed and pushed directly. |
| 19 | \`return stack.pop()\` | A well-formed RPN expression leaves exactly one value on the stack: the result. |`,
        dryRunMarkdown: `**Dry run 1** — \`["2","1","+","3","*"]\`:
push "2"→[2]. push "1"→[2,1]. "+": b=1,a=2 → push(2+1=3)→[3]. push "3"→[3,3]. "*": b=3,a=3 → push(3*3=9)→[9].
Return **9** — matches expected.

**Dry run 2** — \`["4","13","5","/","+"]\`:
push "4"→[4]. push "13"→[4,13]. push "5"→[4,13,5]. "/": b=5,a=13 → push(Math.trunc(13/5)=Math.trunc(2.6)=2)→[4,2]. "+": b=2,a=4 → push(4+2=6)→[6].
Return **6** — matches expected.`,
      },
    ],
    relatedSlugs: ["valid-parentheses", "min-stack"],
    realWorldUsageMarkdown: `Stack-based RPN evaluation is literally how postfix/RPN calculators (like classic HP calculators) work internally, and it's the execution model simple compilers and virtual machines use for postfix bytecode — parsing infix source into postfix once removes the need to handle operator precedence or parentheses at evaluation time.`,
  },
```

- [ ] **Step 4: `generate-parentheses` — add solutions**

Find:
```typescript
    testCases: [
      { input: [1], expected: ["()"] },
      { input: [2], expected: ["(())", "()()"] },
      { input: [3], expected: ["((()))", "(()())", "(())()", "()(())", "()()()"] },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: [1], expected: ["()"] },
      { input: [2], expected: ["(())", "()()"] },
      { input: [3], expected: ["((()))", "(()())", "(())()", "()(())", "()()()"] },
    ],
    solutions: [
      {
        approach: "Brute Force (Generate All, Then Filter)",
        timeComplexity: "O(2^(2n) · n)",
        spaceComplexity: "O(2^(2n) · n)",
        overviewMarkdown:
          "Generate every possible length-`2n` string over `{'(', ')'}` by recursively trying `'('` then `')'` at each position (depth-first, so `'('` is always explored before `')'` — this preserves the same left-to-right ordering the optimal solution produces), then keep only the ones that are valid (checked via a running balance that never goes negative and ends at zero). Correct, but explores exponentially many invalid branches the optimal approach prunes immediately.",
        code: `function generateParenthesis(n) {
  const result = [];

  const isValidCombo = (str) => {
    let balance = 0;
    for (const ch of str) {
      balance += ch === "(" ? 1 : -1;
      if (balance < 0) return false;
    }
    return balance === 0;
  };

  const build = (current) => {
    if (current.length === 2 * n) {
      if (isValidCombo(current)) result.push(current);
      return;
    }
    build(current + "(");
    build(current + ")");
  };

  build("");
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4-10 | \`isValidCombo\` | A string is well-formed if the running open-minus-close balance never dips below zero and ends at exactly zero. |
| 13-19 | \`build\` | Explore both choices (\`'('\` first, then \`')'\`) at every position, unconditionally, until the target length is reached. |`,
        dryRunMarkdown: `**Dry run 1** — \`n=1\`:
\`build("")\` → \`build("(")\` → \`build("((")\`: length2=2n, \`isValidCombo("((")\`: balance 1,2 → ends at 2≠0 → invalid, not pushed. Back up, try \`build("()")\`: length2=2n, \`isValidCombo("()")\`: balance 1,0 → ends at 0, never negative → valid → push \`"()"\`.
Back at root, try \`build(")")\` → \`build(")(")\`: balance starts at -1 (negative immediately) → invalid. \`build("))")\`: balance -1,-2 → invalid.
Result: **["()"]** — matches expected.

**Dry run 2** — \`n=2\`:
Enumerating all 16 length-4 strings in \`'('\`-then-\`')'\` depth-first order and checking validity, exactly two survive, in this order: \`"(())"\` (balance 1,2,1,0 — always ≥0, ends at 0 ✓) and \`"()()"\` (balance 1,0,1,0 — always ≥0, ends at 0 ✓). Every other combination either goes negative mid-string or doesn't end at zero.
Result: **["(())","()()"]** — matches expected (including order, since filtering preserves generation order).`,
      },
      {
        approach: "Optimal (Constrained Backtracking)",
        timeComplexity: "O(4^n / √n) — the nth Catalan number of valid strings, each built in O(n)",
        spaceComplexity: "O(n) recursion depth (plus output)",
        overviewMarkdown:
          "Track two counters, `open` and `close`, instead of validating full strings after the fact. Only branch to add `'('` when `open < n`, and only branch to add `')'` when `close < open` (never more closes than opens so far). These two counters ARE the validity invariant — every leaf the recursion reaches is automatically a valid, complete combination, so there's nothing left to filter.",
        code: `function generateParenthesis(n) {
  const result = [];

  const backtrack = (current, open, close) => {
    if (current.length === 2 * n) {
      result.push(current);
      return;
    }
    if (open < n) backtrack(current + "(", open + 1, close);
    if (close < open) backtrack(current + ")", open, close + 1);
  };

  backtrack("", 0, 0);
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-8 | base case | Once the string reaches length \`2n\`, the counters guarantee it's valid — record it directly. |
| 9 | \`if (open < n) backtrack(current + "(", ...)\` | Only add an open paren if there's still budget for one. |
| 10 | \`if (close < open) backtrack(current + ")", ...)\` | Only add a close paren if it wouldn't outnumber the opens placed so far. |`,
        dryRunMarkdown: `**Dry run 1** — \`n=1\`:
\`backtrack("",0,0)\`: open(0)<1 → \`backtrack("(",1,0)\`: length1≠2. open(1)<1? no. close(0)<open(1) → \`backtrack("()",1,1)\`: length2=2 → push \`"()"\`.
Back at root: close(0)<open(0)? no — no further branch.
Result: **["()"]** — matches expected.

**Dry run 2** — \`n=2\`:
\`backtrack("",0,0)\`: open<2 → \`backtrack("(",1,0)\`.
  \`backtrack("(",1,0)\`: open<2 → \`backtrack("((",2,0)\`.
    \`backtrack("((",2,0)\`: open(2)<2? no. close(0)<open(2) → \`backtrack("(()",2,1)\`.
      \`backtrack("(()",2,1)\`: open(2)<2? no. close(1)<open(2) → \`backtrack("(())",2,2)\`: length4=4 → push \`"(())"\`.
  Back at \`backtrack("(",1,0)\`: close(0)<open(1) → \`backtrack("()",1,1)\`.
    \`backtrack("()",1,1)\`: open(1)<2 → \`backtrack("()(",2,1)\`.
      \`backtrack("()(",2,1)\`: open(2)<2? no. close(1)<open(2) → \`backtrack("()()",2,2)\`: length4=4 → push \`"()()"\`.
Back at root: close(0)<open(0)? no.
Result: **["(())","()()"]** — matches expected (including order).`,
      },
    ],
    relatedSlugs: ["valid-parentheses"],
    realWorldUsageMarkdown: `Backtracking that prunes via a running validity invariant (instead of generate-then-filter) is the general technique behind combinatorial test-case generators — e.g. producing every valid nested JSON/XML skeleton up to a given depth for fuzz testing — and compiler grammar-rule enumeration where partial derivations are discarded the moment they can no longer be completed validly.`,
  },
```

- [ ] **Step 5: `daily-temperatures` — add solutions**

Find:
```typescript
    testCases: [
      {
        input: [[73, 74, 75, 71, 69, 72, 76, 73]],
        expected: [1, 1, 4, 2, 1, 1, 0, 0],
      },
      { input: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
      { input: [[30, 60, 90]], expected: [1, 1, 0] },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      {
        input: [[73, 74, 75, 71, 69, 72, 76, 73]],
        expected: [1, 1, 4, 2, 1, 1, 0, 0],
      },
      { input: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
      { input: [[30, 60, 90]], expected: [1, 1, 0] },
    ],
    solutions: [
      {
        approach: "Brute Force (Scan Forward From Each Day)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1) extra (excluding output)",
        overviewMarkdown:
          "For each day, scan forward day by day until a strictly warmer temperature is found, recording the gap. Correct, but rescans the same future days over and over from every starting point.",
        code: `function dailyTemperatures(temperatures) {
  const answer = new Array(temperatures.length).fill(0);
  for (let i = 0; i < temperatures.length; i++) {
    for (let j = i + 1; j < temperatures.length; j++) {
      if (temperatures[j] > temperatures[i]) {
        answer[i] = j - i;
        break;
      }
    }
  }
  return answer;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-4 | nested loops | For each day \`i\`, scan every later day \`j\`. |
| 5-7 | first warmer day found | Record the gap and stop scanning for this \`i\` — \`answer[i]\` stays 0 by default if no warmer day exists. |`,
        dryRunMarkdown: `**Dry run 1** — \`[30,60,90]\`:
i=0(30): j=1(60)>30 → gap=1.
i=1(60): j=2(90)>60 → gap=1.
i=2(90): no later day → stays 0.
Result: **[1,1,0]** — matches expected.

**Dry run 2** — \`[30,40,50,60]\`:
i=0(30): j=1(40)>30 → gap=1. i=1(40): j=2(50)>40 → gap=1. i=2(50): j=3(60)>50 → gap=1. i=3(60): no later day → 0.
Result: **[1,1,1,0]** — matches expected.`,
      },
      {
        approach: "Optimal (Monotonic Decreasing Stack)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Keep a stack of indices whose temperatures are decreasing from bottom to top. For each new day, pop every index on the stack with a colder temperature than today's — today is the answer (the 'next warmer day') for all of them — then push today's index. Each index is pushed and popped at most once across the whole run, which is the O(n) argument to state explicitly (the nested-looking pop loop doesn't make this O(n²)).",
        code: `function dailyTemperatures(temperatures) {
  const answer = new Array(temperatures.length).fill(0);
  const stack = []; // indices, with decreasing temperatures bottom to top

  for (let i = 0; i < temperatures.length; i++) {
    while (stack.length && temperatures[stack[stack.length - 1]] < temperatures[i]) {
      const prevIndex = stack.pop();
      answer[prevIndex] = i - prevIndex;
    }
    stack.push(i);
  }
  return answer;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-9 | \`while\` loop | Every index left colder than today just found its "next warmer day" — pop it and record the gap. |
| 10 | \`stack.push(i)\` | Today becomes a candidate for some future warmer day. |`,
        dryRunMarkdown: `**Dry run 1** — \`[30,60,90]\`:
i0(30): stack empty → push. stack=[0].
i1(60): temps[0]=30<60 → pop0, answer[0]=1-0=1. stack=[]. push1. stack=[1].
i2(90): temps[1]=60<90 → pop1, answer[1]=2-1=1. stack=[]. push2. stack=[2].
Loop ends; index2 never popped, stays 0.
Result: **[1,1,0]** — matches expected.

**Dry run 2** — \`[73,74,75,71,69,72,76,73]\`:
i0(73): push. stack=[0].
i1(74): temps[0]=73<74 → pop0, answer[0]=1. stack=[]. push1. stack=[1].
i2(75): temps[1]=74<75 → pop1, answer[1]=1. stack=[]. push2. stack=[2].
i3(71): temps[2]=75<71? no → push3. stack=[2,3].
i4(69): temps[3]=71<69? no → push4. stack=[2,3,4].
i5(72): temps[4]=69<72 → pop4, answer[4]=5-4=1. temps[3]=71<72 → pop3, answer[3]=5-3=2. temps[2]=75<72? no → stop. push5. stack=[2,5].
i6(76): temps[5]=72<76 → pop5, answer[5]=6-5=1. temps[2]=75<76 → pop2, answer[2]=6-2=4. stack=[]. push6. stack=[6].
i7(73): temps[6]=76<73? no → push7. stack=[6,7].
Loop ends; indices 6,7 never popped, stay 0.
Result: **[1,1,4,2,1,1,0,0]** — matches expected.`,
      },
    ],
    relatedSlugs: ["sliding-window-maximum", "valid-parentheses"],
    realWorldUsageMarkdown: `The monotonic stack "next greater element" technique is the classic approach behind stock-span problems (how many consecutive prior days had a lower price), and the same next-greater/next-smaller-index idea underlies largest-rectangle-in-histogram computations and car-fleet-style catch-up/collision simulations.`,
  },
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 7: Lint**

Run: `npm run lint`
Expected: clean on `src/content/problems/stack.ts`.

- [ ] **Step 8: Commit**

```bash
git add src/content/problems/stack.ts
git commit -m "Backfill Deep Solutions content for Stack topic"
```

## Task 9: Backfill Deep Solutions — Binary Search (6 problems)

**Files:**
- Modify: `src/content/problems/binary-search.ts`

**Interfaces:**
- Consumes: `Solution` type and `Problem.solutions?`/`relatedSlugs?`/`realWorldUsageMarkdown?` from Task 1.
- Produces: nothing new — data-only addition. `description`/`starterCode`/`functionName`/`testCases` on all 6 problems are UNCHANGED. All 6 get exactly 2 solutions.

- [ ] **Step 1: `binary-search` — add solutions**

Find:
```typescript
    testCases: [
      { input: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { input: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      { input: [[5], 5], expected: 0 },
      { input: [[], 5], expected: -1 },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { input: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      { input: [[5], 5], expected: 0 },
      { input: [[], 5], expected: -1 },
    ],
    solutions: [
      {
        approach: "Brute Force (Linear Scan)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Check every element left to right until `target` is found. Correct, but ignores the fact that the array is sorted — the whole point of this problem is to exploit that structure instead.",
        code: `function binarySearch(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === target) return i;
  }
  return -1;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-4 | \`for\` loop | Check each index in order; return immediately on a match. |
| 5 | \`return -1\` | Reached only if no element matched. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[-1,0,3,5,9,12], target=9\`:
i=0(-1)≠9. i=1(0)≠9. i=2(3)≠9. i=3(5)≠9. i=4(9)===9 → return **4** — matches expected.

**Dry run 2** — \`nums=[], target=5\`:
Loop body never runs (length 0) → return **-1** — matches expected.`,
      },
      {
        approach: "Optimal (Binary Search)",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Maintain `left <= right` as the invariant over the still-possible range. Compare the midpoint to `target` and discard the half that can't contain it — never re-scan a discarded half. The loop's termination condition, `left > right`, means the range is empty and `target` isn't present.",
        code: `function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5 | \`while (left <= right)\` | The search range is non-empty exactly when this holds. |
| 7 | \`if (nums[mid] === target) return mid\` | Found it. |
| 8-10 | \`nums[mid] < target\` | Target must be to the right — discard \`[left, mid]\`. |
| 10-12 | else | Target must be to the left — discard \`[mid, right]\`. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[-1,0,3,5,9,12], target=9\`:
left=0,right=5, mid=2 (\`nums[2]=3\`): 3<9 → left=3.
left=3,right=5, mid=4 (\`nums[4]=9\`): match → return **4** — matches expected.

**Dry run 2** — \`nums=[], target=5\`:
left=0,right=-1. \`left <= right\`? 0<=-1 is false → loop never runs → return **-1** — matches expected.`,
      },
    ],
    relatedSlugs: ["search-2d-matrix", "search-rotated-array"],
    realWorldUsageMarkdown: `Binary search is the algorithm underlying database index lookups (B-tree node traversal), language-standard-library search utilities, and \`git bisect\`, which binary searches commit history to find the first bad commit.`,
  },
```

- [ ] **Step 2: `search-2d-matrix` — add solutions**

Find:
```typescript
      {
        input: [
          [
            [1, 3, 5, 7],
            [10, 11, 16, 20],
            [23, 30, 34, 60],
          ],
          0,
        ],
        expected: false,
      },
    ],
  },
```

Replace with:

```typescript
      {
        input: [
          [
            [1, 3, 5, 7],
            [10, 11, 16, 20],
            [23, 30, 34, 60],
          ],
          0,
        ],
        expected: false,
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Scan Every Cell)",
        timeComplexity: "O(m·n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Check every cell in the matrix, row by row. Correct, but ignores that each row is sorted AND every row's values sit entirely above the previous row's — the matrix is really one long sorted sequence in disguise.",
        code: `function searchMatrix(matrix, target) {
  for (const row of matrix) {
    for (const val of row) {
      if (val === target) return true;
    }
  }
  return false;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-6 | nested loops | Check every cell unconditionally; no use of sortedness. |`,
        dryRunMarkdown: `**Dry run 1** — \`matrix=[[1,3,5,7],[10,11,16,20],[23,30,34,60]], target=3\`:
Row0: 1≠3, 3===3 → return **true** — matches expected.

**Dry run 2** — same matrix, \`target=13\`:
Row0: 1,3,5,7 — none match. Row1: 10,11,16,20 — none match. Row2: 23,30,34,60 — none match. Loop ends → return **false** — matches expected.`,
      },
      {
        approach: "Optimal (Binary Search on Flattened Index)",
        timeComplexity: "O(log(m·n))",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Treat the matrix as a single sorted array of length `m*n` and binary search it directly, without ever materializing the flattened array: for a flat index `mid`, `row = Math.floor(mid / cols)` and `col = mid % cols` recover the 2D position in O(1). This beats the weaker 'binary search rows, then binary search within a row' approach (which is also O(log m + log n) but requires two separate searches) by doing one search over the combined space.",
        code: `function searchMatrix(matrix, target) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  let left = 0;
  let right = rows * cols - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const val = matrix[Math.floor(mid / cols)][mid % cols];
    if (val === target) return true;
    if (val < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return false;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 8 | \`matrix[Math.floor(mid / cols)][mid % cols]\` | Recovers the 2D cell for flat index \`mid\` in O(1) — no actual flattening needed. |
| 9-14 | comparison | Same discard-a-half logic as plain binary search, just over the implicit flat sequence. |`,
        dryRunMarkdown: `**Dry run 1** — \`matrix=[[1,3,5,7],[10,11,16,20],[23,30,34,60]], target=3\`:
rows=3, cols=4, left=0, right=11.
mid=5 → row1,col1 → \`matrix[1][1]=11\`. 11<3? no → right=4.
left=0,right=4, mid=2 → row0,col2 → \`matrix[0][2]=5\`. 5<3? no → right=1.
left=0,right=1, mid=0 → row0,col0 → \`matrix[0][0]=1\`. 1<3 → left=1.
left=1,right=1, mid=1 → row0,col1 → \`matrix[0][1]=3\` → match → return **true** — matches expected.

**Dry run 2** — same matrix, \`target=16\`:
left=0,right=11, mid=5 → \`matrix[1][1]=11\`. 11<16 → left=6.
left=6,right=11, mid=8 → row2,col0 → \`matrix[2][0]=23\`. 23<16? no → right=7.
left=6,right=7, mid=6 → row1,col2 → \`matrix[1][2]=16\` → match → return **true** — matches expected.`,
      },
    ],
    relatedSlugs: ["binary-search"],
    realWorldUsageMarkdown: `Binary searching over an implicit flattened index — recovering a multi-dimensional position from a single search index via arithmetic instead of materializing the flat structure — is the same trick used to binary search a paginated or virtualized dataset (e.g. spreadsheet cells addressed by row/column) without loading it all into memory as one array.`,
  },
```

- [ ] **Step 3: `koko-eating-bananas` — add solutions**

Find:
```typescript
    testCases: [
      { input: [[3, 6, 7, 11], 8], expected: 4 },
      { input: [[30, 11, 23, 4, 20], 5], expected: 30 },
      { input: [[30, 11, 23, 4, 20], 6], expected: 23 },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: [[3, 6, 7, 11], 8], expected: 4 },
      { input: [[30, 11, 23, 4, 20], 5], expected: 30 },
      { input: [[30, 11, 23, 4, 20], 6], expected: 23 },
    ],
    solutions: [
      {
        approach: "Brute Force (Try Every Speed From 1 Upward)",
        timeComplexity: "O(max(piles) · n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Try every candidate speed `k` starting from 1, computing the total hours needed at that speed, and return the first `k` where the hours fit within `h`. Correct — since hours-needed is monotonically non-increasing as `k` grows, the first `k` that works is the minimum — but scans every speed below the answer one at a time instead of jumping straight there.",
        code: `function minEatingSpeed(piles, h) {
  const maxPile = Math.max(...piles);
  for (let k = 1; k <= maxPile; k++) {
    const hours = piles.reduce((sum, pile) => sum + Math.ceil(pile / k), 0);
    if (hours <= h) return k;
  }
  return maxPile;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`maxPile\` | No speed faster than the largest pile is ever necessary — one pile takes exactly 1 hour at that speed. |
| 4 | \`Math.ceil(pile / k)\` | Hours to finish one pile at speed \`k\` — partial hours still cost a full hour. |
| 5 | \`if (hours <= k) return k\` | First (smallest) \`k\` that fits within \`h\` hours, thanks to monotonicity. |`,
        dryRunMarkdown: `**Dry run 1** — \`piles=[3,6,7,11], h=8\`:
k=1: hours=3+6+7+11=27>8.
k=2: ceil(3/2)+ceil(6/2)+ceil(7/2)+ceil(11/2) = 2+3+4+6 = 15>8.
k=3: 1+2+3+4 = 10>8.
k=4: ceil(3/4)+ceil(6/4)+ceil(7/4)+ceil(11/4) = 1+2+2+3 = 8<=8 → return **4** — matches expected.

**Dry run 2** — \`piles=[30,11,23,4,20], h=5\`:
k needs to reach 30 before hours drops to ≤5 (each pile must take exactly 1 hour, requiring \`k\` at or above every pile's size — the largest is 30). At k=29: ceil(30/29)+ceil(11/29)+ceil(23/29)+ceil(4/29)+ceil(20/29) = 2+1+1+1+1 = 6>5. At k=30: 1+1+1+1+1 = 5<=5 → return **30** — matches expected.`,
      },
      {
        approach: "Optimal (Binary Search on the Answer)",
        timeComplexity: "O(n · log(max(piles)))",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "This is binary search on the answer, not on the input array: the search space is the candidate eating speed `k`, ranging from `1` to `max(piles)`. The predicate 'can she finish within `h` hours at speed `k`?' is monotonic in `k` — once it's true for some speed, it stays true for every faster speed — so binary search finds the smallest `k` where it flips from false to true.",
        code: `function minEatingSpeed(piles, h) {
  const hoursNeeded = (k) =>
    piles.reduce((sum, pile) => sum + Math.ceil(pile / k), 0);

  let left = 1;
  let right = Math.max(...piles);
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (hoursNeeded(mid) <= h) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }
  return left;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`hoursNeeded\` | Total hours to finish all piles at speed \`k\`. |
| 6 | \`while (left < right)\` | Standard "find leftmost value satisfying a predicate" binary search shape. |
| 8-10 | \`hoursNeeded(mid) <= h\` | Speed \`mid\` works — it or something slower might be the answer, so keep \`mid\` in range (\`right = mid\`, not \`mid - 1\`). |
| 10-12 | else | Speed \`mid\` is too slow — the answer must be faster, so discard it (\`left = mid + 1\`). |`,
        dryRunMarkdown: `**Dry run 1** — \`piles=[3,6,7,11], h=8\`:
left=1,right=11, mid=6: hours = ceil(3/6)+ceil(6/6)+ceil(7/6)+ceil(11/6) = 1+1+2+2 = 6<=8 → right=6.
left=1,right=6, mid=3: hours=1+2+3+4=10>8 → left=4.
left=4,right=6, mid=5: hours=ceil(3/5)+ceil(6/5)+ceil(7/5)+ceil(11/5)=1+2+2+3=8<=8 → right=5.
left=4,right=5, mid=4: hours=1+2+2+3=8<=8 → right=4.
left=4,right=4 → loop ends → return **4** — matches expected.

**Dry run 2** — \`piles=[30,11,23,4,20], h=5\`:
left=1,right=30, mid=15: hours=2+1+2+1+2=8>5 → left=16.
left=16,right=30, mid=23: hours=ceil(30/23)+ceil(11/23)+ceil(23/23)+ceil(4/23)+ceil(20/23)=2+1+1+1+1=6>5 → left=24.
left=24,right=30, mid=27: hours=ceil(30/27)+1+1+1+1=2+1+1+1+1=6>5 → left=28.
left=28,right=30, mid=29: hours=ceil(30/29)+1+1+1+1=2+1+1+1+1=6>5 → left=30.
left=30,right=30 → loop ends → return **30** — matches expected.`,
      },
    ],
    relatedSlugs: ["binary-search"],
    realWorldUsageMarkdown: `Binary-search-on-the-answer is the general technique behind resource-allocation problems where the "right" value is expensive to compute directly but cheap to *verify* — e.g. the minimum bandwidth needed to finish a set of uploads within a time budget, or the minimum truck capacity to ship a sequence of packages within D days. Anywhere a monotonic feasibility check can replace a closed-form formula, this pattern applies.`,
  },
```

- [ ] **Step 4: `search-rotated-array` — add solutions**

Find:
```typescript
    testCases: [
      { input: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
      { input: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
      { input: [[1], 0], expected: -1 },
      { input: [[4, 5, 6, 7, 0, 1, 2], 5], expected: 1 },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
      { input: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
      { input: [[1], 0], expected: -1 },
      { input: [[4, 5, 6, 7, 0, 1, 2], 5], expected: 1 },
    ],
    solutions: [
      {
        approach: "Brute Force (Linear Scan)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Check every element left to right until `target` is found. Correct regardless of rotation (rotation doesn't matter if you're not exploiting sortedness at all), but throws away the O(log n) requirement entirely.",
        code: `function search(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === target) return i;
  }
  return -1;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-4 | \`for\` loop | Check each index in order. |
| 5 | \`return -1\` | No match found anywhere. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[4,5,6,7,0,1,2], target=0\`:
i=0(4)≠0. i=1(5)≠0. i=2(6)≠0. i=3(7)≠0. i=4(0)===0 → return **4** — matches expected.

**Dry run 2** — same array, \`target=3\`:
Every element (4,5,6,7,0,1,2) checked, none equal 3 → return **-1** — matches expected.`,
      },
      {
        approach: "Optimal (Pivoted Binary Search)",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "At each midpoint, at least one half (`[left, mid]` or `[mid, right]`) is guaranteed to be normally sorted, even though the whole array isn't. Determine which half is sorted by comparing `nums[left]` to `nums[mid]`, then check whether `target` falls within that sorted half's value range to decide which half to recurse into — this is the one extra decision layered on top of plain binary search.",
        code: `function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;

    if (nums[left] <= nums[mid]) {
      // Left half [left, mid] is normally sorted.
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      // Right half [mid, right] is normally sorted.
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }
  return -1;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 9 | \`nums[left] <= nums[mid]\` | If true, \`[left, mid]\` has no rotation break in it — it's normally sorted. |
| 10-14 | left half sorted | \`target\` is in \`[nums[left], nums[mid])\` → search left half; otherwise it must be in the right half. |
| 16-20 | right half sorted (else branch) | Symmetric logic: \`target\` is in \`(nums[mid], nums[right]]\` → search right half; otherwise search left half. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[4,5,6,7,0,1,2], target=0\`:
left=0,right=6, mid=3 (\`nums[3]=7\`): 7≠0. \`nums[0]=4 <= nums[3]=7\` → left half sorted. Is \`4<=0<7\`? No → left=4.
left=4,right=6, mid=5 (\`nums[5]=1\`): 1≠0. \`nums[4]=0 <= nums[5]=1\` → left half \`[4,5]\` sorted. Is \`0<=0<1\`? Yes → right=4.
left=4,right=4, mid=4 (\`nums[4]=0\`): match → return **4** — matches expected.

**Dry run 2** — same array, \`target=5\`:
left=0,right=6, mid=3 (\`nums[3]=7\`): 7≠5. \`nums[0]=4<=7\` → left half sorted. Is \`4<=5<7\`? Yes → right=2.
left=0,right=2, mid=1 (\`nums[1]=5\`): match → return **1** — matches expected.`,
      },
    ],
    relatedSlugs: ["find-min-rotated", "binary-search"],
    realWorldUsageMarkdown: `Pivoted binary search models any circularly-shifted sorted structure — for example, searching a circular buffer, or a log file whose entries wrapped around at a rotation boundary, without first physically un-rotating the data.`,
  },
```

- [ ] **Step 5: `find-min-rotated` — add solutions**

Find:
```typescript
    testCases: [
      { input: [[3, 4, 5, 1, 2]], expected: 1 },
      { input: [[4, 5, 6, 7, 0, 1, 2]], expected: 0 },
      { input: [[11, 13, 15, 17]], expected: 11 },
      { input: [[1]], expected: 1 },
    ],
  },
```

Replace with:

```typescript
    testCases: [
      { input: [[3, 4, 5, 1, 2]], expected: 1 },
      { input: [[4, 5, 6, 7, 0, 1, 2]], expected: 0 },
      { input: [[11, 13, 15, 17]], expected: 11 },
      { input: [[1]], expected: 1 },
    ],
    solutions: [
      {
        approach: "Brute Force (Scan for Minimum)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Scan the whole array and track the smallest value seen. Correct — rotation doesn't matter to a plain min-scan — but ignores the sortedness that lets binary search find the rotation point directly.",
        code: `function findMin(nums) {
  let min = nums[0];
  for (const val of nums) {
    if (val < min) min = val;
  }
  return min;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-4 | scan | Track the running minimum across every element. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[3,4,5,1,2]\`:
min=3. 4 not<3. 5 not<3. 1<3→min=1. 2 not<1.
Return **1** — matches expected.

**Dry run 2** — \`nums=[11,13,15,17]\`:
min=11. 13,15,17 all not<11.
Return **11** — matches expected.`,
      },
      {
        approach: "Optimal (Binary Search for the Rotation Point)",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Compare `nums[mid]` to `nums[right]`, not `nums[left]`. `nums[mid] > nums[right]` means the rotation point (and the minimum) is strictly to the right of `mid`, so discard `[left, mid]`; otherwise the minimum is at or before `mid`, so discard `(mid, right]` while keeping `mid` itself as a candidate. Comparing against `right` instead of `left` is what keeps the invariant correct even when the array isn't rotated at all (a degenerate case of the same logic, not a special case to branch on).",
        code: `function findMin(nums) {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] > nums[right]) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return nums[left];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6 | \`nums[mid] > nums[right]\` | The rotation break is between \`mid\` and \`right\` — the minimum is somewhere after \`mid\`. |
| 7 | \`left = mid + 1\` | Discard \`mid\` itself (it can't be the minimum since something smaller lies ahead of it). |
| 9 | \`right = mid\` | \`mid\` might BE the minimum, so keep it in range (unlike plain binary search's \`mid - 1\`). |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[3,4,5,1,2]\`:
left=0,right=4, mid=2 (\`nums[2]=5\`): \`nums[right]=2\`. 5>2 → left=3.
left=3,right=4, mid=3 (\`nums[3]=1\`): \`nums[right]=2\`. 1>2? No → right=3.
left=3,right=3 → loop ends → return \`nums[3]\` = **1** — matches expected.

**Dry run 2** — \`nums=[11,13,15,17]\` (no actual rotation):
left=0,right=3, mid=1 (\`nums[1]=13\`): \`nums[right]=17\`. 13>17? No → right=1.
left=0,right=1, mid=0 (\`nums[0]=11\`): \`nums[right]=13\`. 11>13? No → right=0.
left=0,right=0 → loop ends → return \`nums[0]\` = **11** — matches expected (the degenerate "no rotation" case falls out of the same logic with no special-casing).`,
      },
    ],
    relatedSlugs: ["search-rotated-array"],
    realWorldUsageMarkdown: `Locating the rotation point via binary search is the same operation used to find the "start of day" boundary in a rotated/wrapped time-series buffer, or the write-pointer position in a circularly-sorted ring buffer.`,
  },
```

- [ ] **Step 6: `time-based-kv-store` — add solutions**

Find:
```typescript
      {
        operations: ["TimeMap", "set", "set", "get", "get", "get"],
        args: [
          [],
          ["foo", "bar", 1],
          ["foo", "bar2", 4],
          ["foo", 3],
          ["foo", 5],
          ["baz", 1],
        ],
        expected: [null, null, null, "bar", "bar2", ""],
      },
    ],
  },
];
```

Replace with:

```typescript
      {
        operations: ["TimeMap", "set", "set", "get", "get", "get"],
        args: [
          [],
          ["foo", "bar", 1],
          ["foo", "bar2", 4],
          ["foo", 3],
          ["foo", 5],
          ["baz", 1],
        ],
        expected: [null, null, null, "bar", "bar2", ""],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Linear Scan per Get)",
        timeComplexity: "O(1) set, O(n) get (n = entries for that key)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Store each key's `(timestamp, value)` pairs in an array, appended in arrival order. Since `set` is always called with strictly increasing timestamps per key, the array is already sorted — so `get` can just scan it in order, keeping the last value whose timestamp is `<= query` and stopping once a later timestamp is passed.",
        code: `class TimeMap {
  constructor() {
    this.store = new Map();
  }
  set(key, value, timestamp) {
    if (!this.store.has(key)) this.store.set(key, []);
    this.store.get(key).push([timestamp, value]);
  }
  get(key, timestamp) {
    const entries = this.store.get(key);
    if (!entries) return "";
    let result = "";
    for (const [ts, value] of entries) {
      if (ts <= timestamp) {
        result = value;
      } else {
        break;
      }
    }
    return result;
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-8 | \`set\` | Appends to the key's list; the strictly-increasing-timestamp guarantee keeps it sorted with no extra work. |
| 13-18 | scan | Keeps overwriting \`result\` as long as timestamps are \`<= timestamp\`; stops (via \`break\`) the moment one exceeds it — the last kept value is the answer. |`,
        dryRunMarkdown: `**Dry run 1** — \`set("foo","bar",1), get("foo",1), get("foo",3), set("foo","bar2",4), get("foo",4), get("foo",5)\`:
set("foo","bar",1) → \`store.foo=[[1,"bar"]]\`.
get("foo",1): \`1<=1\` → result="bar". Return **"bar"** — matches expected.
get("foo",3): \`1<=3\` → result="bar". Return **"bar"** — matches expected.
set("foo","bar2",4) → \`store.foo=[[1,"bar"],[4,"bar2"]]\`.
get("foo",4): \`1<=4\`→result="bar"; \`4<=4\`→result="bar2". Return **"bar2"** — matches expected.
get("foo",5): \`1<=5\`→result="bar"; \`4<=5\`→result="bar2". Return **"bar2"** — matches expected.
Outputs: [null,null,"bar","bar",null,"bar2","bar2"] — matches expected.`,
      },
      {
        approach: "Optimal (Binary Search per Get)",
        timeComplexity: "O(1) set, O(log n) get (n = entries for that key)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Same storage as the brute force (strictly increasing timestamps per key keep each key's list sorted for free), but `get` becomes binary search for the rightmost entry with `timestamp <= query` instead of a linear scan — the same 'find rightmost value satisfying a predicate' shape as plain binary search, applied to one key's list of pairs instead of a flat array.",
        code: `class TimeMap {
  constructor() {
    this.store = new Map();
  }
  set(key, value, timestamp) {
    if (!this.store.has(key)) this.store.set(key, []);
    this.store.get(key).push([timestamp, value]);
  }
  get(key, timestamp) {
    const entries = this.store.get(key);
    if (!entries || entries.length === 0) return "";

    let left = 0;
    let right = entries.length - 1;
    let result = "";
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (entries[mid][0] <= timestamp) {
        result = entries[mid][1];
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    return result;
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 13-21 | binary search | Whenever \`entries[mid]\`'s timestamp qualifies, record it as the best-so-far \`result\` and keep searching right (a later entry might qualify too and be more recent); otherwise search left. |`,
        dryRunMarkdown: `**Dry run 1** — \`set("foo","bar",1), set("foo","bar2",4), get("foo",3), get("foo",5), get("baz",1)\`:
After both sets: \`store.foo=[[1,"bar"],[4,"bar2"]]\`.
get("foo",3): left=0,right=1. mid=0: \`entries[0][0]=1<=3\` → result="bar", left=1. left=1,right=1, mid=1: \`entries[1][0]=4<=3\`? No → right=0. left=1,right=0 → stop. Return **"bar"** — matches expected.
get("foo",5): left=0,right=1. mid=0: \`1<=5\` → result="bar", left=1. left=1,right=1, mid=1: \`4<=5\` → result="bar2", left=2. left=2,right=1 → stop. Return **"bar2"** — matches expected.
get("baz",1): \`store.get("baz")\` is \`undefined\` → return **""** — matches expected.
Outputs: [null,null,null,"bar","bar2",""] — matches expected.`,
      },
    ],
    relatedSlugs: ["binary-search"],
    realWorldUsageMarkdown: `This exact pattern — an append-only per-key timestamped log plus binary search for "value as of time T" — is the core lookup mechanism behind time-series databases and MVCC-style snapshot reads in transactional databases, where a query must see the state as it existed at a specific point in time.`,
  },
];
```

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 8: Lint**

Run: `npm run lint`
Expected: clean on `src/content/problems/binary-search.ts`.

- [ ] **Step 9: Commit**

```bash
git add src/content/problems/binary-search.ts
git commit -m "Backfill Deep Solutions content for Binary Search topic"
```

## Task 10: Backfill Deep Solutions — Trees (12 problems)

**Files:**
- Modify: `src/content/problems/trees.ts`

**Interfaces:**
- Consumes: `Solution` type and `Problem.solutions?`/`relatedSlugs?`/`realWorldUsageMarkdown?` from Task 1. Solution `code` blocks may treat `TreeNode` values as plain `{ val, left, right }` object literals, since the worker's tree hydration (`arrayToTree`/`treeToArray` in `code-runner.worker.ts`) is duck-typed on those three properties.
- Produces: nothing new — data-only addition. `description`/`starterCode`/`functionName`/`testCases` on all 12 problems are UNCHANGED. Solution counts: `invert-binary-tree`(2), `max-depth-binary-tree`(2), `diameter-binary-tree`(2), `balanced-binary-tree`(2), `same-tree`(1), `subtree-of-another-tree`(1), `level-order-traversal`(1), `validate-bst`(2), `kth-smallest-bst`(2), `lowest-common-ancestor-bst`(2), `max-path-sum`(1), `serialize-deserialize-tree`(1).

- [ ] **Step 1: `invert-binary-tree` — add solutions**

Find:
```typescript
    testCases: [
      { input: [{ __treeNode: [4, 2, 7, 1, 3, 6, 9] }], expected: [4, 7, 2, 9, 6, 3, 1], resultType: "tree" },
      { input: [{ __treeNode: [2, 1, 3] }], expected: [2, 3, 1], resultType: "tree" },
      { input: [{ __treeNode: [] }], expected: [], resultType: "tree" },
    ],
  },
  {
    slug: "max-depth-binary-tree",
```

Replace with:

```typescript
    testCases: [
      { input: [{ __treeNode: [4, 2, 7, 1, 3, 6, 9] }], expected: [4, 7, 2, 9, 6, 3, 1], resultType: "tree" },
      { input: [{ __treeNode: [2, 1, 3] }], expected: [2, 3, 1], resultType: "tree" },
      { input: [{ __treeNode: [] }], expected: [], resultType: "tree" },
    ],
    solutions: [
      {
        approach: "Recursive (Top-Down Swap)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h) recursion stack (h = tree height)",
        overviewMarkdown:
          "Recurse into both children first, then swap the (now-inverted) results into `left`/`right`. The order of the swap relative to the recursive calls doesn't actually matter — swapping before recursing works identically — but computing the inverted children first reads more naturally as 'invert everything below, then attach it swapped.'",
        code: `function invertTree(root) {
  if (root === null) return null;

  const left = invertTree(root.left);
  const right = invertTree(root.right);
  root.left = right;
  root.right = left;

  return root;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`if (root === null) return null\` | An empty subtree inverts to itself. |
| 4-5 | recurse | Invert both subtrees first. |
| 6-7 | swap | Attach the inverted right subtree as the new left, and vice versa. |`,
        dryRunMarkdown: `**Dry run 1** — \`{__treeNode:[2,1,3]}\` (root 2, left leaf 1, right leaf 3):
\`invertTree(root2)\`: \`left = invertTree(node1)\` — node1 is a leaf, both its (null) children invert to themselves, so it returns unchanged. \`right = invertTree(node3)\` — same, unchanged.
\`root.left = right\` (node3), \`root.right = left\` (node1).
Result tree: root2(left=node3, right=node1) → level-order array **[2,3,1]** — matches expected.

**Dry run 2** — \`{__treeNode:[]}\`:
\`root === null\` → return \`null\` immediately → dehydrates to **[]** — matches expected.`,
      },
      {
        approach: "Iterative (BFS with a Queue)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n) queue (worst case, a full last level)",
        overviewMarkdown:
          "Process nodes breadth-first: dequeue a node, swap its two children, then enqueue whichever children exist (post-swap) so their children get swapped too. No recursion stack — useful when tree depth could risk a stack overflow.",
        code: `function invertTree(root) {
  if (root === null) return null;

  const queue = [root];
  while (queue.length) {
    const node = queue.shift();
    [node.left, node.right] = [node.right, node.left];
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }

  return root;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 7 | \`[node.left, node.right] = [node.right, node.left]\` | Swap this node's children in place. |
| 8-9 | enqueue | Push whatever ended up in \`left\`/\`right\` (the original children, now swapped in) so their subtrees get inverted too. |`,
        dryRunMarkdown: `**Dry run 1** — \`{__treeNode:[4,2,7,1,3,6,9]}\` (root 4, left subtree 2(1,3), right subtree 7(6,9)):
Dequeue 4: swap → left=7,right=2. Push 7,2. queue=[7,2].
Dequeue 7 (orig subtree root, children 6,9): swap → left=9,right=6. Push 9,6. queue=[2,9,6].
Dequeue 2 (orig subtree root, children 1,3): swap → left=3,right=1. Push 3,1. queue=[9,6,3,1].
Dequeue 9,6,3,1 in turn — all leaves, swapping \`null\`/\`null\` does nothing, nothing pushed.
Final tree: root4(left=7,right=2); 7(left=9,right=6); 2(left=3,right=1) → level-order array **[4,7,2,9,6,3,1]** — matches expected.

**Dry run 2** — \`{__treeNode:[]}\`:
\`root === null\` → return \`null\` immediately, loop never runs → dehydrates to **[]** — matches expected.`,
      },
    ],
    relatedSlugs: ["max-depth-binary-tree"],
    realWorldUsageMarkdown: `This "transform every node, bottom-up or breadth-first" recursion shape underlies compiler AST transformation passes (e.g. constant folding, tree rewriting) and mirroring a layout tree for right-to-left locales.`,
  },
  {
    slug: "max-depth-binary-tree",
```

- [ ] **Step 2: `max-depth-binary-tree` — add solutions**

Find:
```typescript
    testCases: [
      { input: [{ __treeNode: [3, 9, 20, null, null, 15, 7] }], expected: 3 },
      { input: [{ __treeNode: [1, null, 2] }], expected: 2 },
      { input: [{ __treeNode: [] }], expected: 0 },
    ],
  },
  {
    slug: "diameter-binary-tree",
```

Replace with:

```typescript
    testCases: [
      { input: [{ __treeNode: [3, 9, 20, null, null, 15, 7] }], expected: 3 },
      { input: [{ __treeNode: [1, null, 2] }], expected: 2 },
      { input: [{ __treeNode: [] }], expected: 0 },
    ],
    solutions: [
      {
        approach: "Recursive (Post-Order)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h) recursion stack",
        overviewMarkdown:
          "The entire solution is one recurrence: an empty subtree has depth 0; otherwise depth is 1 plus the deeper of the two children's depths. The interview signal here isn't the recursion — it's stating the `null → 0` base case cleanly, since every other depth-based problem in this topic reuses this exact shape.",
        code: `function maxDepth(root) {
  if (root === null) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | base case | An empty subtree contributes 0 depth. |
| 3 | recurrence | 1 (for this node) plus whichever child subtree is deeper. |`,
        dryRunMarkdown: `**Dry run 1** — \`{__treeNode:[1,null,2]}\` (root 1, no left child, right child leaf 2):
\`maxDepth(root1) = 1 + max(maxDepth(null), maxDepth(node2))\`.
\`maxDepth(null) = 0\`. \`maxDepth(node2) = 1 + max(maxDepth(null), maxDepth(null)) = 1 + max(0,0) = 1\`.
\`maxDepth(root1) = 1 + max(0, 1) = 2\` — matches expected.

**Dry run 2** — \`{__treeNode:[]}\`:
\`root === null\` → return **0** — matches expected.`,
      },
      {
        approach: "Iterative (BFS Level Count)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n) queue (worst case)",
        overviewMarkdown:
          "Process the tree level by level, incrementing a counter once per full level processed (using the same queue-length-snapshot trick as Level Order Traversal). The final counter value is the depth. No recursion stack, at the cost of an explicit queue.",
        code: `function maxDepth(root) {
  if (root === null) return 0;

  const queue = [root];
  let depth = 0;
  while (queue.length) {
    const levelSize = queue.length;
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    depth++;
  }

  return depth;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6 | \`levelSize\` | Snapshot how many nodes belong to the current level before enqueuing the next one. |
| 8-11 | inner loop | Dequeue exactly this level's nodes, enqueuing their children for the next level. |
| 12 | \`depth++\` | One full level processed. |`,
        dryRunMarkdown: `**Dry run 1** — \`{__treeNode:[3,9,20,null,null,15,7]}\`:
queue=[3], depth=0.
Level 1: levelSize=1, dequeue 3, push 9,20 → queue=[9,20]. depth=1.
Level 2: levelSize=2, dequeue 9 (leaf, no push), dequeue 20 (push 15,7) → queue=[15,7]. depth=2.
Level 3: levelSize=2, dequeue 15 (leaf), dequeue 7 (leaf) → queue=[]. depth=3.
Queue empty → loop ends → return **3** — matches expected.

**Dry run 2** — \`{__treeNode:[]}\`:
\`root === null\` → return **0** immediately, loop never runs — matches expected.`,
      },
    ],
    relatedSlugs: ["diameter-binary-tree", "balanced-binary-tree"],
    realWorldUsageMarkdown: `Post-order height computation is the base primitive behind rebalancing triggers in self-balancing trees (e.g. AVL rotation decisions) and behind computing DOM/render-tree nesting depth for accessibility tooling or CSS containment checks.`,
  },
  {
    slug: "diameter-binary-tree",
```

- [ ] **Step 3: `diameter-binary-tree` — add solutions**

Find:
```typescript
    testCases: [
      { input: [{ __treeNode: [1, 2, 3, 4, 5] }], expected: 3 },
      { input: [{ __treeNode: [1, 2] }], expected: 1 },
      { input: [{ __treeNode: [1] }], expected: 0 },
      { input: [{ __treeNode: [1, 2, null, 3, 4, 5, null, 6] }], expected: 4 },
    ],
  },
  {
    slug: "balanced-binary-tree",
```

Replace with:

```typescript
    testCases: [
      { input: [{ __treeNode: [1, 2, 3, 4, 5] }], expected: 3 },
      { input: [{ __treeNode: [1, 2] }], expected: 1 },
      { input: [{ __treeNode: [1] }], expected: 0 },
      { input: [{ __treeNode: [1, 2, null, 3, 4, 5, null, 6] }], expected: 4 },
    ],
    solutions: [
      {
        approach: "Brute Force (Recompute Height at Every Node)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(h) recursion stack",
        overviewMarkdown:
          "Visit every node; at each one, independently compute `height(left) + height(right)` via a fresh height traversal, and track the maximum seen. Correct, but each `height` call re-walks its whole subtree from scratch, so nodes near the root get their subtrees re-measured over and over — O(n) work at O(n) nodes.",
        code: `function diameterOfBinaryTree(root) {
  const height = (node) => {
    if (node === null) return 0;
    return 1 + Math.max(height(node.left), height(node.right));
  };

  let maxDiameter = 0;
  const traverse = (node) => {
    if (node === null) return;
    const through = height(node.left) + height(node.right);
    maxDiameter = Math.max(maxDiameter, through);
    traverse(node.left);
    traverse(node.right);
  };

  traverse(root);
  return maxDiameter;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-5 | \`height\` | Independent height computation, called fresh for every node visited by \`traverse\`. |
| 9 | \`through\` | Diameter of the longest path passing through this specific node — in edges, so no \`+1\`. |
| 11-12 | \`traverse\` | Visit every node so no candidate "through" path is missed. |`,
        dryRunMarkdown: `**Dry run 1** — \`{__treeNode:[1,2]}\` (root 1, left leaf 2, no right):
\`traverse(root1)\`: \`through = height(node2) + height(null) = 1 + 0 = 1\`. \`maxDiameter = 1\`.
\`traverse(node2)\`: \`through = height(null) + height(null) = 0\`. \`maxDiameter\` stays 1.
Final \`maxDiameter\` = **1** — matches expected.

**Dry run 2** — \`{__treeNode:[1]}\` (single leaf):
\`traverse(root1)\`: \`through = height(null) + height(null) = 0\`. \`maxDiameter = 0\`.
Final \`maxDiameter\` = **0** — matches expected.`,
      },
      {
        approach: "Optimal (Single Post-Order Pass with a Side-Channel Max)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h) recursion stack",
        overviewMarkdown:
          "Compute height and diameter in the same traversal: the `height` helper, while computing each node's height bottom-up, also updates a running `maxDiameter` using that node's already-computed left/right heights — no separate re-measurement needed. This is Maximum Depth's exact recurrence, plus one extra line tracking the best `leftHeight + rightHeight` seen across every node, not just the root's.",
        code: `function diameterOfBinaryTree(root) {
  let maxDiameter = 0;

  const height = (node) => {
    if (node === null) return 0;
    const leftHeight = height(node.left);
    const rightHeight = height(node.right);
    maxDiameter = Math.max(maxDiameter, leftHeight + rightHeight);
    return 1 + Math.max(leftHeight, rightHeight);
  };

  height(root);
  return maxDiameter;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-7 | \`leftHeight\`/\`rightHeight\` | Computed once per node, bottom-up (post-order) — never recomputed. |
| 8 | \`maxDiameter = Math.max(...)\` | The diameter through this node, folded into the running best as the recursion unwinds. |
| 9 | \`return 1 + Math.max(...)\` | The height value the parent needs — kept separate from the diameter side-channel. |`,
        dryRunMarkdown: `**Dry run 1** — \`{__treeNode:[1,2,3,4,5]}\` (root 1, left 2(children 4,5), right leaf 3):
\`height(root1)\`: \`leftHeight = height(node2)\`.
  \`height(node2)\`: \`leftHeight2 = height(node4) = 1\` (leaf). \`rightHeight2 = height(node5) = 1\` (leaf). \`maxDiameter = max(0, 1+1=2) = 2\`. Returns \`1 + max(1,1) = 2\`.
\`leftHeight(root) = 2\`. \`rightHeight = height(node3) = 1\` (leaf, no diameter contribution — \`max(2, 0+0=0)\` stays 2).
\`maxDiameter = max(2, leftHeight+rightHeight = 2+1 = 3) = 3\`.
Final \`maxDiameter\` = **3** — matches expected.

**Dry run 2** — \`{__treeNode:[1,2,null,3,4,5,null,6]}\` (root 1(left=2,right=null); 2(left=3,right=4); 3(left=5,right=null); 4(left=6,right=null); 5,6 leaves):
\`height(node3)\`: \`leftHeight=height(node5)=1\`, \`rightHeight=height(null)=0\`. \`maxDiameter=max(0,1)=1\`. Returns \`1+max(1,0)=2\`.
\`height(node4)\`: \`leftHeight=height(node6)=1\`, \`rightHeight=0\`. \`maxDiameter=max(1,1)=1\` (unchanged). Returns \`1+max(1,0)=2\`.
\`height(node2)\`: \`leftHeight=height(node3)=2\`, \`rightHeight=height(node4)=2\`. \`maxDiameter=max(1, 2+2=4)=4\`. Returns \`1+max(2,2)=3\`.
\`height(root1)\`: \`leftHeight=height(node2)=3\`, \`rightHeight=height(null)=0\`. \`maxDiameter=max(4, 3+0=3)=4\` (unchanged).
Final \`maxDiameter\` = **4** — matches expected.`,
      },
    ],
    relatedSlugs: ["max-depth-binary-tree", "balanced-binary-tree"],
    realWorldUsageMarkdown: `Computing a bottom-up value while simultaneously tracking a running global best is the same shape used in critical-path analysis over weighted DAGs — e.g. computing a build system's critical path, where the longest chain doesn't have to pass through any particular node.`,
  },
  {
    slug: "balanced-binary-tree",
```

- [ ] **Step 4: `balanced-binary-tree` — add solutions**

Find:
```typescript
    testCases: [
      { input: [{ __treeNode: [3, 9, 20, null, null, 15, 7] }], expected: true },
      { input: [{ __treeNode: [1, 2, 2, 3, 3, null, null, 4, 4] }], expected: false },
      { input: [{ __treeNode: [] }], expected: true },
      { input: [{ __treeNode: [1, 2, 5, 3, null, 6, null, 4] }], expected: false },
    ],
  },
  {
    slug: "same-tree",
```

Replace with:

```typescript
    testCases: [
      { input: [{ __treeNode: [3, 9, 20, null, null, 15, 7] }], expected: true },
      { input: [{ __treeNode: [1, 2, 2, 3, 3, null, null, 4, 4] }], expected: false },
      { input: [{ __treeNode: [] }], expected: true },
      { input: [{ __treeNode: [1, 2, 5, 3, null, 6, null, 4] }], expected: false },
    ],
    solutions: [
      {
        approach: "Brute Force (Recompute Height, Check Every Node)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(h) recursion stack",
        overviewMarkdown:
          "At every node, independently compute the heights of its left and right subtrees (each a fresh full traversal) and compare them; if the difference exceeds 1, fail. Otherwise recurse into both children and check them too. Correct, but every node's subtree gets re-measured by every ancestor's check.",
        code: `function isBalanced(root) {
  const height = (node) => {
    if (node === null) return 0;
    return 1 + Math.max(height(node.left), height(node.right));
  };

  if (root === null) return true;
  const leftHeight = height(root.left);
  const rightHeight = height(root.right);
  if (Math.abs(leftHeight - rightHeight) > 1) return false;
  return isBalanced(root.left) && isBalanced(root.right);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 7-9 | height check at this node | Independently computed, ignoring any height work done by the parent's or child's checks. |
| 10 | recurse | Even if this node passes, both subtrees must independently pass too. |`,
        dryRunMarkdown: `**Dry run 1** — \`{__treeNode:[]}\`:
\`root === null\` → return **true** immediately — matches expected.

**Dry run 2** — \`{__treeNode:[1,2,5,3,null,6,null,4]}\` (root 1(left=2,right=5); 2(left=3,right=null); 5(left=6,right=null); 3(left=4,right=null); 4,6 leaves):
\`isBalanced(root1)\`: \`leftHeight = height(node2)\`. \`height(node3) = 1+max(height(node4)=1, 0) = 2\`, so \`height(node2) = 1+max(2,0) = 3\`. \`rightHeight = height(node5) = 1+max(height(node6)=1,0) = 2\`. \`|3-2|=1\`, not \`>1\` → passes at the root. Recurse: \`isBalanced(node2) && isBalanced(node5)\`.
\`isBalanced(node2)\`: \`leftHeight = height(node3) = 2\` (recomputed). \`rightHeight = height(null) = 0\`. \`|2-0|=2 > 1\` → return **false**.
Overall: \`false && ...\` → return **false** — matches expected.`,
      },
      {
        approach: "Optimal (Post-Order Height with Early-Exit Sentinel)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h) recursion stack",
        overviewMarkdown:
          "Fold the height computation and the balance check into one bottom-up pass: `checkHeight` returns a node's real height normally, but the instant it detects an imbalance anywhere below (in itself or a child), it returns the sentinel `-1` instead and every ancestor immediately propagates that `-1` back up without doing any further work. This short-circuits the rest of the tree the moment a single violation is found, rather than computing a full height that will never be used.",
        code: `function isBalanced(root) {
  const checkHeight = (node) => {
    if (node === null) return 0;

    const leftHeight = checkHeight(node.left);
    if (leftHeight === -1) return -1;

    const rightHeight = checkHeight(node.right);
    if (rightHeight === -1) return -1;

    if (Math.abs(leftHeight - rightHeight) > 1) return -1;
    return 1 + Math.max(leftHeight, rightHeight);
  };

  return checkHeight(root) !== -1;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-6 | left sentinel check | If the left subtree already failed, bail immediately — no point computing the right subtree's height. |
| 8-9 | right sentinel check | Same short-circuit for the right subtree. |
| 11 | imbalance check | Only reached if both children are internally balanced — checks this node's own balance. |
| 12 | normal return | A real height, propagated up for the parent's own check. |`,
        dryRunMarkdown: `**Dry run 1** — \`{__treeNode:[3,9,20,null,null,15,7]}\` (root 3(left=9 leaf,right=20(15,7))):
\`checkHeight(node9) = 1\`. \`checkHeight(node20)\`: \`leftHeight=checkHeight(node15)=1\`, \`rightHeight=checkHeight(node7)=1\`, diff 0 → returns \`1+max(1,1)=2\`.
\`checkHeight(root3)\`: \`leftHeight=1\`, \`rightHeight=2\`, \`|1-2|=1\`, not \`>1\` → returns \`1+max(1,2)=3\`.
\`checkHeight(root) = 3 !== -1\` → return **true** — matches expected.

**Dry run 2** — \`{__treeNode:[1,2,2,3,3,null,null,4,4]}\` (root 1(left=A,right=B); A(left=C,right=D); B leaf; C(left=E,right=F); D,E,F leaves):
\`checkHeight(C)\`: \`leftHeight=checkHeight(E)=1\`, \`rightHeight=checkHeight(F)=1\`, diff 0 → returns \`1+max(1,1)=2\`.
\`checkHeight(A)\`: \`leftHeight=checkHeight(C)=2\`, \`rightHeight=checkHeight(D)=1\`, \`|2-1|=1\`, ok → returns \`1+max(2,1)=3\`.
\`checkHeight(B)=1\` (leaf).
\`checkHeight(root1)\`: \`leftHeight=checkHeight(A)=3\`, \`rightHeight=checkHeight(B)=1\`, \`|3-1|=2 > 1\` → returns **-1**.
\`checkHeight(root) = -1\` → \`-1 !== -1\` is false → return **false** — matches expected.`,
      },
    ],
    relatedSlugs: ["diameter-binary-tree", "max-depth-binary-tree"],
    realWorldUsageMarkdown: `The early-exit sentinel pattern — propagating an "already failed" signal up through a recursion instead of finishing every computation before checking — is the general short-circuit-validation technique used in nested schema/config validators that need to bail out of a deep structure the instant the first violation is found.`,
  },
  {
    slug: "same-tree",
```

- [ ] **Step 5: `same-tree` — add solution**

Find:
```typescript
    testCases: [
      { input: [{ __treeNode: [1, 2, 3] }, { __treeNode: [1, 2, 3] }], expected: true },
      { input: [{ __treeNode: [1, 2] }, { __treeNode: [1, null, 2] }], expected: false },
      { input: [{ __treeNode: [1, 2, 1] }, { __treeNode: [1, 1, 2] }], expected: false },
    ],
  },
  {
    slug: "subtree-of-another-tree",
```

Replace with:

```typescript
    testCases: [
      { input: [{ __treeNode: [1, 2, 3] }, { __treeNode: [1, 2, 3] }], expected: true },
      { input: [{ __treeNode: [1, 2] }, { __treeNode: [1, null, 2] }], expected: false },
      { input: [{ __treeNode: [1, 2, 1] }, { __treeNode: [1, 1, 2] }], expected: false },
    ],
    solutions: [
      {
        approach: "Paired-Tree Recursion",
        timeComplexity: "O(min(n, m))",
        spaceComplexity: "O(min(h_p, h_q)) recursion stack",
        overviewMarkdown:
          "Walk both trees in lockstep. Three-way check at every pair of nodes: both `null` → match; exactly one `null` → mismatch (this is the case that's easy to forget — skipping it lets a shorter tree silently 'match' by never being compared against the longer tree's extra nodes); both present → compare `.val` and recurse into both children pairs.",
        code: `function isSameTree(p, q) {
  if (p === null && q === null) return true;
  if (p === null || q === null) return false;
  if (p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | both null | Two empty subtrees are trivially identical. |
| 3 | exactly one null | One tree has a node the other doesn't — mismatch. This check must come before the \`.val\` comparison, or accessing \`.val\` on \`null\` would throw. |
| 4 | value mismatch | Both nodes exist but disagree. |
| 5 | recurse | Both children pairs must also match. |`,
        dryRunMarkdown: `**Dry run 1** — \`p={__treeNode:[1,2]}, q={__treeNode:[1,null,2]}\` (p: root1(left=2,right=null); q: root1(left=null,right=2)):
\`isSameTree(p,q)\`: neither null, \`p.val=1===q.val=1\` ok. Recurse: \`isSameTree(p.left=node2, q.left=null)\`: \`p.left\` is not null but \`q.left\` is → exactly-one-null case → return **false**.
Overall: \`false && ...\` → return **false** — matches expected.

**Dry run 2** — \`p={__treeNode:[1,2,1]}, q={__treeNode:[1,1,2]}\` (p: root1(left=2,right=1); q: root1(left=1,right=2)):
\`isSameTree(p,q)\`: \`1===1\` ok. \`isSameTree(p.left=node2, q.left=node1)\`: both non-null, \`p.left.val=2 !== q.left.val=1\` → return **false**.
Overall → return **false** — matches expected.`,
      },
    ],
    relatedSlugs: ["subtree-of-another-tree"],
    realWorldUsageMarkdown: `This exact three-way structural-equality check (both null / exactly one null / both present-and-recurse) is the core primitive behind tree-diffing algorithms — virtual DOM reconciliation and structural JSON/AST diffing tools both boil down to this comparison at every node pair.`,
  },
  {
    slug: "subtree-of-another-tree",
```

- [ ] **Step 6: `subtree-of-another-tree` — add solution**

Find:
```typescript
    testCases: [
      { input: [{ __treeNode: [3, 4, 5, 1, 2] }, { __treeNode: [4, 1, 2] }], expected: true },
      { input: [{ __treeNode: [3, 4, 5, 1, 2, null, null, null, null, 0] }, { __treeNode: [4, 1, 2] }], expected: false },
      { input: [{ __treeNode: [1] }, { __treeNode: [1] }], expected: true },
    ],
  },
  {
    slug: "level-order-traversal",
```

Replace with:

```typescript
    testCases: [
      { input: [{ __treeNode: [3, 4, 5, 1, 2] }, { __treeNode: [4, 1, 2] }], expected: true },
      { input: [{ __treeNode: [3, 4, 5, 1, 2, null, null, null, null, 0] }, { __treeNode: [4, 1, 2] }], expected: false },
      { input: [{ __treeNode: [1] }, { __treeNode: [1] }], expected: true },
    ],
    solutions: [
      {
        approach: "Recursive Search + Paired-Tree Comparison",
        timeComplexity: "O(n·m) worst case (n = |root|, m = |subRoot|)",
        spaceComplexity: "O(h) recursion stack",
        overviewMarkdown:
          "At every node in `root`, run the exact Same Tree check against `subRoot`; if it doesn't match at this node, recurse into `root`'s left and right children and try again there. This composes Same Tree as a helper inside a tree-wide search — the first place in this topic where one problem's solution literally calls another's. A hashing/serialization approach can beat the O(n·m) worst case, but this direct recursive check is the expected baseline.",
        code: `function isSameTree(p, q) {
  if (p === null && q === null) return true;
  if (p === null || q === null) return false;
  if (p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}

function isSubtree(root, subRoot) {
  if (root === null) return false;
  if (isSameTree(root, subRoot)) return true;
  return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 9 | \`if (root === null) return false\` | Ran out of tree without finding a match. |
| 10 | \`isSameTree(root, subRoot)\` | Try matching \`subRoot\` rooted right here. |
| 11 | recurse | If this node isn't the match, look for the match somewhere in either subtree. |`,
        dryRunMarkdown: `**Dry run 1** — \`root={__treeNode:[3,4,5,1,2]}, subRoot={__treeNode:[4,1,2]}\` (root: 3(left=4(left=1,right=2), right=5)):
\`isSubtree(node3, subRoot)\`: \`isSameTree(node3, subRoot)\`: \`3 !== 4\` → false. Recurse: \`isSubtree(node4, subRoot) || isSubtree(node5, subRoot)\`.
\`isSubtree(node4, subRoot)\`: \`isSameTree(node4, subRoot)\`: \`4===4\` ok; \`isSameTree(node4.left=1, subRoot.left=1)\` → both leaves, \`1===1\` → true; \`isSameTree(node4.right=2, subRoot.right=2)\` → true. So \`isSameTree(node4,subRoot) = true\` → \`isSubtree(node4,...) = true\`.
Short-circuits the \`||\` → overall return **true** — matches expected.

**Dry run 2** — \`root={__treeNode:[1]}, subRoot={__treeNode:[1]}\` (both single-node leaves):
\`isSubtree(root, subRoot)\`: \`isSameTree(root, subRoot)\`: both val 1, both children null on both sides → **true** → return **true** — matches expected.`,
      },
    ],
    relatedSlugs: ["same-tree"],
    realWorldUsageMarkdown: `"Does this pattern occur anywhere in this larger structure" via recursive search-and-compare is the same shape used for AST pattern matching in code linters and codemods that scan a syntax tree for a subtree matching a template.`,
  },
  {
    slug: "level-order-traversal",
```

- [ ] **Step 7: `level-order-traversal` — add solution**

Find:
```typescript
    testCases: [
      { input: [{ __treeNode: [3, 9, 20, null, null, 15, 7] }], expected: [[3], [9, 20], [15, 7]] },
      { input: [{ __treeNode: [1] }], expected: [[1]] },
      { input: [{ __treeNode: [] }], expected: [] },
    ],
  },
  {
    slug: "validate-bst",
```

Replace with:

```typescript
    testCases: [
      { input: [{ __treeNode: [3, 9, 20, null, null, 15, 7] }], expected: [[3], [9, 20], [15, 7]] },
      { input: [{ __treeNode: [1] }], expected: [[1]] },
      { input: [{ __treeNode: [] }], expected: [] },
    ],
    solutions: [
      {
        approach: "BFS by Level (Queue-Length Snapshot)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n) queue (worst case, a full last level) plus O(n) output",
        overviewMarkdown:
          "Standard BFS with a queue, with one crucial trick: snapshot `queue.length` at the START of each outer-loop iteration, before dequeuing anything. That snapshot is what separates 'process exactly one level's worth of nodes' from 'process one node' — without it, the queue keeps growing with the next level's children while you're still dequeuing the current level, and there'd be no way to tell where one level ends and the next begins.",
        code: `function levelOrder(root) {
  if (root === null) return [];

  const result = [];
  const queue = [root];

  while (queue.length) {
    const levelSize = queue.length;
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 8 | \`levelSize = queue.length\` | Frozen count of this level's nodes, taken before any of this level's children get enqueued. |
| 10-15 | inner loop | Runs exactly \`levelSize\` times — one full level, no more, no less — regardless of how many children get pushed mid-loop. |
| 16 | \`result.push(level)\` | Each level becomes its own sub-array in the output. |`,
        dryRunMarkdown: `**Dry run 1** — \`{__treeNode:[3,9,20,null,null,15,7]}\`:
queue=[3]. Level 1: levelSize=1 → dequeue 3, level=[3], push 9,20 → queue=[9,20]. result=[[3]].
Level 2: levelSize=2 → dequeue 9 (leaf, level=[9]), dequeue 20 (level=[9,20], push 15,7) → queue=[15,7]. result=[[3],[9,20]].
Level 3: levelSize=2 → dequeue 15 (level=[15]), dequeue 7 (level=[15,7]) → queue=[]. result=[[3],[9,20],[15,7]].
Queue empty → loop ends → return **[[3],[9,20],[15,7]]** — matches expected.

**Dry run 2** — \`{__treeNode:[]}\`:
\`root === null\` → return **[]** immediately — matches expected.`,
      },
    ],
    relatedSlugs: ["invert-binary-tree"],
    realWorldUsageMarkdown: `The queue-length-snapshot BFS-by-level pattern is the standard technique for computing per-generation groupings in org-chart/hierarchy rendering UIs, and for breadth-limited web crawlers that need to fully process one "depth" of links before following the next.`,
  },
  {
    slug: "validate-bst",
```

- [ ] **Step 8: `validate-bst` — add solutions**

Find:
```typescript
    testCases: [
      { input: [{ __treeNode: [2, 1, 3] }], expected: true },
      { input: [{ __treeNode: [5, 1, 4, null, null, 3, 6] }], expected: false },
      { input: [{ __treeNode: [1, 1] }], expected: false },
      { input: [{ __treeNode: [5, 4, 6, null, null, 3, 7] }], expected: false },
    ],
  },
  {
    slug: "kth-smallest-bst",
```

Replace with:

```typescript
    testCases: [
      { input: [{ __treeNode: [2, 1, 3] }], expected: true },
      { input: [{ __treeNode: [5, 1, 4, null, null, 3, 6] }], expected: false },
      { input: [{ __treeNode: [1, 1] }], expected: false },
      { input: [{ __treeNode: [5, 4, 6, null, null, 3, 7] }], expected: false },
    ],
    solutions: [
      {
        approach: "Brute Force (In-Order Collect, Then Check)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "An in-order traversal of a valid BST visits values in strictly increasing order — so collect every value via in-order traversal into an array, then make a second pass checking the array is strictly increasing. Correct and O(n), but always walks the entire tree and materializes the full array before it can report a violation, even one near the very first node.",
        code: `function isValidBST(root) {
  const values = [];
  const inorder = (node) => {
    if (node === null) return;
    inorder(node.left);
    values.push(node.val);
    inorder(node.right);
  };
  inorder(root);

  for (let i = 1; i < values.length; i++) {
    if (values[i] <= values[i - 1]) return false;
  }
  return true;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-8 | \`inorder\` | Standard left-root-right traversal — a valid BST's values come out sorted. |
| 10-12 | check pass | Any non-increasing adjacent pair means the tree wasn't actually a valid BST. |`,
        dryRunMarkdown: `**Dry run 1** — \`{__treeNode:[1,1]}\` (root 1, left leaf 1, no right):
\`inorder\`: visits left leaf (push 1) → values=[1]; visits root (push 1) → values=[1,1]; no right subtree.
Check: \`i=1\`: \`values[1]=1 <= values[0]=1\` → return **false** — matches expected.

**Dry run 2** — \`{__treeNode:[2,1,3]}\` (root 2, left leaf 1, right leaf 3):
\`inorder\`: left leaf 1 → values=[1]; root 2 → values=[1,2]; right leaf 3 → values=[1,2,3].
Check: \`i=1\`: \`2<=1\`? no. \`i=2\`: \`3<=2\`? no. Return **true** — matches expected.`,
      },
      {
        approach: "Optimal (Bounds-Propagation Recursion)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h) recursion stack",
        overviewMarkdown:
          "Thread a `(low, high)` open-interval bound down through the recursion, tightening it on every branch: going left, the current node's value becomes the new `high`; going right, it becomes the new `low`. Every node is checked against every applicable ancestor's constraint, not just its immediate parent — this fixes the classic bug of checking only `node.left.val < node.val < node.right.val`, which misses a right-subtree node that's smaller than a distant ancestor while still being larger than its immediate parent. Also short-circuits on the first violation found, unlike the brute force.",
        code: `function isValidBST(root) {
  const validate = (node, low, high) => {
    if (node === null) return true;
    if (node.val <= low || node.val >= high) return false;
    return validate(node.left, low, node.val) && validate(node.right, node.val, high);
  };

  return validate(root, -Infinity, Infinity);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4 | bound check | This node must be strictly within \`(low, high)\`, the accumulated constraint from every ancestor above it. |
| 5 | recurse left | Left subtree's upper bound tightens to this node's value. |
| 5 | recurse right | Right subtree's lower bound tightens to this node's value. |`,
        dryRunMarkdown: `**Dry run 1** — \`{__treeNode:[5,1,4,null,null,3,6]}\` (root 5, left leaf 1, right 4(left=3,right=6)):
\`validate(root5, -Inf, Inf)\`: 5 within bounds, ok. \`validate(node1, -Inf, 5)\`: 1 within \`(-Inf,5)\`, leaf → true. \`validate(node4, 5, Inf)\`: \`node4.val=4\`, and \`4 <= low(5)\` → return **false**.
Overall: \`true && false\` → return **false** — matches expected.

**Dry run 2** — \`{__treeNode:[2,1,3]}\`:
\`validate(root2, -Inf, Inf)\`: ok. \`validate(node1, -Inf, 2)\`: \`1\` within \`(-Inf,2)\`, leaf → true. \`validate(node3, 2, Inf)\`: \`3\` within \`(2,Inf)\`, leaf → true.
Overall: \`true && true\` → return **true** — matches expected.`,
      },
    ],
    relatedSlugs: ["kth-smallest-bst"],
    realWorldUsageMarkdown: `Bounds-propagation recursion — threading accumulated constraints down through a traversal instead of checking only local parent-child relationships — is the general technique behind range-constraint validation in nested schema validators and constraint-propagation solvers for interval-scheduling problems.`,
  },
  {
    slug: "kth-smallest-bst",
```

- [ ] **Step 9: `kth-smallest-bst` — add solutions**

Find:
```typescript
    testCases: [
      { input: [{ __treeNode: [3, 1, 4, null, 2] }, 1], expected: 1 },
      { input: [{ __treeNode: [5, 3, 6, 2, 4, null, null, 1] }, 3], expected: 3 },
      { input: [{ __treeNode: [1] }, 1], expected: 1 },
    ],
  },
  {
    slug: "lowest-common-ancestor-bst",
```

Replace with:

```typescript
    testCases: [
      { input: [{ __treeNode: [3, 1, 4, null, 2] }, 1], expected: 1 },
      { input: [{ __treeNode: [5, 3, 6, 2, 4, null, null, 1] }, 3], expected: 3 },
      { input: [{ __treeNode: [1] }, 1], expected: 1 },
    ],
    solutions: [
      {
        approach: "Brute Force (Full In-Order Collect, Then Index)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Collect every value via a full in-order traversal (which visits a BST in sorted order) into an array, then return `values[k - 1]`. Correct, but always walks the entire tree regardless of how small `k` is — no early exit even when the answer is found in the very first few visits.",
        code: `function kthSmallest(root, k) {
  const values = [];
  const inorder = (node) => {
    if (node === null) return;
    inorder(node.left);
    values.push(node.val);
    inorder(node.right);
  };
  inorder(root);
  return values[k - 1];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-8 | \`inorder\` | Full traversal; the BST invariant guarantees the collected values come out sorted ascending. |
| 9 | \`values[k - 1]\` | 1-indexed \`k\` → 0-indexed array access. |`,
        dryRunMarkdown: `**Dry run 1** — \`root={__treeNode:[3,1,4,null,2]}, k=1\` (root 3, left=1(right=2), right=4):
\`inorder\`: visits node1's left (null, skip), pushes 1 → values=[1]; visits node1's right=node2, pushes 2 → values=[1,2]; pushes root=3 → values=[1,2,3]; visits node4, pushes 4 → values=[1,2,3,4].
Return \`values[0]\` = **1** — matches expected.

**Dry run 2** — \`root={__treeNode:[1]}, k=1\`:
\`inorder\`: single leaf → values=[1]. Return \`values[0]\` = **1** — matches expected.`,
      },
      {
        approach: "Optimal (In-Order Traversal with Early Stop)",
        timeComplexity: "O(h + k)",
        spaceComplexity: "O(h) recursion stack",
        overviewMarkdown:
          "Same in-order-is-sorted insight, but stop the instant the k-th value is visited instead of walking the whole tree. A `result !== null` guard checked at the top of every recursive call (and again right after the left-subtree call returns) short-circuits all remaining work once the answer is found — this matters when `k` is much smaller than the tree size.",
        code: `function kthSmallest(root, k) {
  let count = 0;
  let result = null;

  const inorder = (node) => {
    if (node === null || result !== null) return;
    inorder(node.left);
    if (result !== null) return;
    count++;
    if (count === k) {
      result = node.val;
      return;
    }
    inorder(node.right);
  };

  inorder(root);
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6 | guard | Stop immediately if the answer's already been found, or this branch is empty. |
| 8 | guard after left recursion | The left subtree may have already found the answer — check again before doing any work at this node. |
| 9-13 | count and record | This node is the next value in sorted order; if it's the k-th, record it and stop recursing right. |`,
        dryRunMarkdown: `**Dry run 1** — \`root={__treeNode:[5,3,6,2,4,null,null,1]}, k=3\` (root 5(left=3,right=6); 3(left=2,right=4); 2(left=1,right=null); 6,4,1 leaves):
\`inorder(root5)\` → \`inorder(node3)\` → \`inorder(node2)\` → \`inorder(node1)\`: left is null, no-op. \`count++\` → count=1. \`1===3\`? no. \`inorder(node1.right=null)\` no-op. Return.
Back in node2's frame: \`result\` still null. \`count++\` → count=2. \`2===3\`? no. \`inorder(node2.right=null)\` no-op. Return.
Back in node3's frame: \`result\` still null. \`count++\` → count=3. \`3===3\` → \`result = node3.val = 3\`. Return.
Back in root5's frame (after \`inorder(root.left)\` returns): \`result !== null\` → true → return immediately, skipping \`count++\` and \`inorder(root.right)\`.
Final \`result\` = **3** — matches expected.

**Dry run 2** — \`root={__treeNode:[3,1,4,null,2]}, k=1\` (root 3, left=1(right=2), right=4):
\`inorder(root3)\` → \`inorder(node1)\`: left null, no-op. \`count++\` → count=1. \`1===1\` → \`result = node1.val = 1\`. Return.
Back in root3's frame: \`result !== null\` → return immediately.
Final \`result\` = **1** — matches expected.`,
      },
    ],
    relatedSlugs: ["validate-bst"],
    realWorldUsageMarkdown: `Early-stopping in-order traversal — walk a sorted structure but bail the instant the target rank is reached — is the same idea behind rank/select queries in order-statistics trees, and behind "load the first N sorted rows" pagination over a tree-backed index without materializing the full sorted set.`,
  },
  {
    slug: "lowest-common-ancestor-bst",
```

- [ ] **Step 10: `lowest-common-ancestor-bst` — add solutions**

Find:
```typescript
      {
        // LCA(2, 1) is the root itself — its subtree is the whole 2-node tree.
        input: [{ __treeNode: [2, 1] }, { __treeNode: [2] }, { __treeNode: [1] }],
        expected: [2, 1],
        resultType: "tree",
      },
    ],
  },
  {
    slug: "max-path-sum",
```

Replace with:

```typescript
      {
        // LCA(2, 1) is the root itself — its subtree is the whole 2-node tree.
        input: [{ __treeNode: [2, 1] }, { __treeNode: [2] }, { __treeNode: [1] }],
        expected: [2, 1],
        resultType: "tree",
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Path-Finding, General Tree LCA)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h) for each stored path",
        overviewMarkdown:
          "Ignore the BST ordering entirely and solve the general-tree version: find the root-to-node path for `p` and for `q` separately (each a DFS search), then walk both paths together and take the last node where they still agree — that's the LCA. Correct for any binary tree, not just a BST, but doesn't exploit the sorted structure this problem actually has.",
        code: `function lowestCommonAncestor(root, p, q) {
  const findPath = (node, target, path) => {
    if (node === null) return false;
    path.push(node);
    if (node.val === target) return true;
    if (findPath(node.left, target, path) || findPath(node.right, target, path)) {
      return true;
    }
    path.pop();
    return false;
  };

  const pathToP = [];
  const pathToQ = [];
  findPath(root, p.val, pathToP);
  findPath(root, q.val, pathToQ);

  let lca = null;
  for (let i = 0; i < pathToP.length && i < pathToQ.length; i++) {
    if (pathToP[i] === pathToQ[i]) {
      lca = pathToP[i];
    } else {
      break;
    }
  }
  return lca;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-10 | \`findPath\` | DFS that builds up \`path\` as it descends, backtracking (\`path.pop()\`) out of any branch that doesn't contain \`target\`. |
| 16-17 | build both paths | Two independent searches from the root. |
| 19-25 | compare paths | The last node where both paths still match is the deepest common ancestor. |`,
        dryRunMarkdown: `**Dry run 1** — \`root={__treeNode:[2,1]}, p={__treeNode:[2]}, q={__treeNode:[1]}\` (root 2, left leaf 1):
\`findPath(root, 2, pathToP)\`: push root → path=[root]. \`root.val===2\` → true. \`pathToP=[root]\`.
\`findPath(root, 1, pathToQ)\`: push root → path=[root]. \`2≠1\`. Recurse left: \`findPath(node1, 1, path)\`: push node1 → path=[root,node1]. \`1===1\` → true, propagates up. \`pathToQ=[root,node1]\`.
Compare: \`i=0\`: \`pathToP[0]===pathToQ[0]\` (both root) → \`lca=root\`. \`i=1\`: \`i < pathToP.length\` is \`1<1\` → false → stop.
Return root → dehydrates to the whole tree **[2,1]** — matches expected.

**Dry run 2** — \`root={__treeNode:[6,2,8,0,4,7,9,null,null,3,5]}, p={__treeNode:[2]}, q={__treeNode:[4]}\` (root 6(left=2,right=8); 2(left=0,right=4); 4(left=3,right=5); 8(left=7,right=9); 0,7,9,3,5 leaves):
\`findPath(root, 2, pathToP)\`: \`6≠2\` → recurse left into node2 → \`2===2\` → \`pathToP=[root6, node2]\`.
\`findPath(root, 4, pathToQ)\`: \`6≠4\` → recurse into node2 → \`2≠4\` → recurse into node2.left=node0 → \`0≠4\`, both children null → backtrack, pop node0. Recurse into node2.right=node4 → \`4===4\` → \`pathToQ=[root6, node2, node4]\`.
Compare: \`i=0\`: root6===root6 → \`lca=root6\`. \`i=1\`: node2===node2 → \`lca=node2\`. \`i=2\`: \`i<pathToP.length\` is \`2<2\` → false → stop.
Return node2 → its subtree dehydrates to **[2,0,4,null,null,3,5]** — matches expected.`,
      },
      {
        approach: "Optimal (BST-Ordering-Guided Descent)",
        timeComplexity: "O(h)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Starting at `root`, use the BST ordering to eliminate an entire branch at each step, the same way plain binary search eliminates half an array: if both `p.val` and `q.val` are less than the current node's value, the LCA must be in the left subtree; if both are greater, it's in the right subtree; the moment they're not both on the same side — including either one equal to the current node — the current node is the answer, since that's the split point where `p` and `q`'s paths diverge (or one of them is an ancestor of the other).",
        code: `function lowestCommonAncestor(root, p, q) {
  let node = root;
  while (node !== null) {
    if (p.val < node.val && q.val < node.val) {
      node = node.left;
    } else if (p.val > node.val && q.val > node.val) {
      node = node.right;
    } else {
      return node;
    }
  }
  return null;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4-5 | both less | Descend left — the split point can't be here or to the right. |
| 6-7 | both greater | Descend right — symmetric case. |
| 8-9 | otherwise | \`p\` and \`q\` are on different sides of (or one equals) this node — this is the LCA. |`,
        dryRunMarkdown: `**Dry run 1** — \`root={__treeNode:[6,2,8,0,4,7,9,null,null,3,5]}, p.val=2, q.val=8\`:
\`node=root6\`: is \`2<6 && 8<6\`? \`8<6\` is false → not both less. Is \`2>6 && 8>6\`? \`2>6\` is false → not both greater. Else → return \`node6\`.
Dehydrates to the whole tree **[6,2,8,0,4,7,9,null,null,3,5]** — matches expected.

**Dry run 2** — same root, \`p.val=2, q.val=4\`:
\`node=root6\`: \`2<6 && 4<6\` → both true → \`node = node.left = node2\`.
\`node=node2\` (val 2): \`2<2\`? false → not both less. \`2>2\`? false → not both greater. Else → return \`node2\`.
Dehydrates to node2's subtree **[2,0,4,null,null,3,5]** — matches expected.`,
      },
    ],
    relatedSlugs: ["kth-smallest-bst", "validate-bst"],
    realWorldUsageMarkdown: `BST-ordering-guided descent — eliminating an entire branch based on a single comparison to a search key — is the same principle behind range queries in database B-tree indexes and behind sorted-path-segment lookups in filesystem directory trees.`,
  },
  {
    slug: "max-path-sum",
```

- [ ] **Step 11: `max-path-sum` — add solution**

Find:
```typescript
    testCases: [
      { input: [{ __treeNode: [1, 2, 3] }], expected: 6 },
      { input: [{ __treeNode: [-10, 9, 20, null, null, 15, 7] }], expected: 42 },
      { input: [{ __treeNode: [-3] }], expected: -3 },
      { input: [{ __treeNode: [2, -1, -2] }], expected: 2 },
    ],
  },
  {
    slug: "serialize-deserialize-tree",
```

Replace with:

```typescript
    testCases: [
      { input: [{ __treeNode: [1, 2, 3] }], expected: 6 },
      { input: [{ __treeNode: [-10, 9, 20, null, null, 15, 7] }], expected: 42 },
      { input: [{ __treeNode: [-3] }], expected: -3 },
      { input: [{ __treeNode: [2, -1, -2] }], expected: 2 },
    ],
    solutions: [
      {
        approach: "Post-Order Recursion with Two Return Channels",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h) recursion stack",
        overviewMarkdown:
          "Two different quantities are needed at every node, and conflating them is the classic bug: (1) the best sum \"returnable\" upward to a parent — `maxGain` — which can only extend through ONE child, since a path handed to a parent can't fork in two directions (`node.val + max(leftGain, rightGain, 0)`); and (2) the best sum \"through\" this node as a complete, potentially-final path — which CAN use both children (`node.val + leftGain + rightGain`) — tracked in a side-channel `maxSum` that's never returned to the caller, only updated. Clamping each child's gain to at least `0` handles the case where including that child would only hurt the sum (skip it instead).",
        code: `function maxPathSum(root) {
  let maxSum = -Infinity;

  const maxGain = (node) => {
    if (node === null) return 0;

    const leftGain = Math.max(maxGain(node.left), 0);
    const rightGain = Math.max(maxGain(node.right), 0);

    maxSum = Math.max(maxSum, node.val + leftGain + rightGain);

    return node.val + Math.max(leftGain, rightGain);
  };

  maxGain(root);
  return maxSum;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 7-8 | \`leftGain\`/\`rightGain\` | Clamped to \`0\` — a negative-sum child is worth excluding rather than including. |
| 10 | \`maxSum\` update | The best full path THROUGH this node — allowed to use both children, since this is a candidate final answer, not something being handed further up. |
| 12 | return value | The best path a parent could extend THROUGH this node upward — can only take one child's branch, since a path can't fork. |`,
        dryRunMarkdown: `**Dry run 1** — \`{__treeNode:[2,-1,-2]}\` (root 2, left leaf -1, right leaf -2):
\`maxGain(node -1)\`: \`leftGain=max(0,0)=0\`, \`rightGain=0\`. \`maxSum=max(-Inf, -1+0+0=-1)=-1\`. Returns \`-1+max(0,0)=-1\`.
\`leftGain(root)=max(-1,0)=0\` (clamped — including the -1 child would hurt).
\`maxGain(node -2)\`: similarly \`maxSum=max(-1,-2)=-1\` (unchanged, -2<-1). Returns \`-2\`.
\`rightGain(root)=max(-2,0)=0\` (clamped).
\`maxSum=max(-1, root.val+leftGain+rightGain = 2+0+0=2)=2\`.
Final \`maxSum\` = **2** — matches expected.

**Dry run 2** — \`{__treeNode:[-10,9,20,null,null,15,7]}\` (root -10, left leaf 9, right 20(left=15,right=7)):
\`maxGain(node9)\`: leaf → \`maxSum=max(-Inf,9)=9\`. Returns 9. \`leftGain(root)=max(9,0)=9\`.
\`maxGain(node15)\`: leaf → \`maxSum=max(9,15)=15\`. Returns 15. \`maxGain(node7)\`: leaf → \`maxSum=max(15,7)=15\` (unchanged). Returns 7.
\`maxGain(node20)\`: \`leftGain=max(15,0)=15\`, \`rightGain=max(7,0)=7\`. \`maxSum=max(15, 20+15+7=42)=42\`. Returns \`20+max(15,7)=35\`.
\`rightGain(root)=max(35,0)=35\`.
\`maxSum=max(42, root.val+leftGain+rightGain = -10+9+35=34)=42\` (unchanged, 34<42).
Final \`maxSum\` = **42** — matches expected.`,
      },
    ],
    relatedSlugs: ["diameter-binary-tree"],
    realWorldUsageMarkdown: `The "two return channels" pattern — a bounded value passed up for the caller's use, plus a separate unbounded global tracking the true best-seen-so-far — is the general shape used in critical-path analysis over weighted trees or DAGs, such as finding the most profitable root-to-anywhere path in a decision tree.`,
  },
  {
    slug: "serialize-deserialize-tree",
```

- [ ] **Step 12: `serialize-deserialize-tree` — add solution**

Find:
```typescript
    testCases: [
      {
        operations: ["Codec", "serialize", "deserialize"],
        args: [[], [{ __treeNode: [1, 2, 3, null, null, 4, 5] }], ["$prevOutput"]],
        expected: [null, null, [1, 2, 3, null, null, 4, 5]],
        operationResultTypes: [null, null, "tree"],
        skipOutputCheck: [1],
      },
    ],
  },
];
```

Replace with:

```typescript
    testCases: [
      {
        operations: ["Codec", "serialize", "deserialize"],
        args: [[], [{ __treeNode: [1, 2, 3, null, null, 4, 5] }], ["$prevOutput"]],
        expected: [null, null, [1, 2, 3, null, null, 4, 5]],
        operationResultTypes: [null, null, "tree"],
        skipOutputCheck: [1],
      },
    ],
    solutions: [
      {
        approach: "Pre-Order DFS with a Null Sentinel",
        timeComplexity: "O(n) for both serialize and deserialize",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "There's no fixed wire format for this problem — any encoding that survives a round trip is correct. `serialize` does a pre-order DFS, emitting a sentinel token (`\"#\"`) for every `null` child so the shape is fully recoverable. `deserialize` consumes that same token stream recursively, in the exact same pre-order it was written, treating `\"#\"` as the base case. The critical constraint: whatever traversal order encodes the tree, decoding MUST replay tokens in that identical order — pre-order was chosen here because unlike in-order, it uniquely determines a tree's shape without needing the node count or explicit null markers for leaves... though this implementation still includes explicit null markers for simplicity and unambiguous parsing either way.",
        code: `class Codec {
  serialize(root) {
    const values = [];

    const dfs = (node) => {
      if (node === null) {
        values.push("#");
        return;
      }
      values.push(String(node.val));
      dfs(node.left);
      dfs(node.right);
    };

    dfs(root);
    return values.join(",");
  }

  deserialize(data) {
    const values = data.split(",");
    let index = 0;

    const dfs = () => {
      const value = values[index];
      index++;
      if (value === "#") return null;
      const node = { val: Number(value), left: null, right: null };
      node.left = dfs();
      node.right = dfs();
      return node;
    };

    return dfs();
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-8 | null sentinel | Every missing child is recorded explicitly as \`"#"\`, so the shape isn't ambiguous during decoding. |
| 9-11 | pre-order emit | Node's own value first, then left subtree, then right subtree — root-left-right. |
| 22-24 | \`dfs()\` in deserialize | Reads one token at a time, advancing \`index\` — reconstructing left before right mirrors exactly how they were written. |`,
        dryRunMarkdown: `**Dry run 1 (the provided test case)** — \`{__treeNode:[1,2,3,null,null,4,5]}\` (root 1(left=2 leaf, right=3(left=4,right=5))):
\`serialize\`: pre-order emits \`"1"\`, then node2's subtree: \`"2"\`, \`"#"\` (its left), \`"#"\` (its right); then node3's subtree: \`"3"\`, then node4: \`"4"\`,\`"#"\`,\`"#"\`; then node5: \`"5"\`,\`"#"\`,\`"#"\`.
Joined: \`"1,2,#,#,3,4,#,#,5,#,#"\`.
\`deserialize\`: tokens=\`["1","2","#","#","3","4","#","#","5","#","#"]\`, index=0.
\`dfs()\`: reads \`"1"\` (index→1) → node{val:1}. \`node.left = dfs()\`: reads \`"2"\` (index→2) → node2{val:2}. \`node2.left = dfs()\`: reads \`"#"\` (index→3) → null. \`node2.right = dfs()\`: reads \`"#"\` (index→4) → null. Returns node2{val:2,left:null,right:null}.
\`node.right = dfs()\`: reads \`"3"\` (index→5) → node3{val:3}. \`node3.left = dfs()\`: reads \`"4"\` (index→6) → node4{val:4}. \`node4.left=dfs()\`: reads \`"#"\`(index→7)→null. \`node4.right=dfs()\`: reads \`"#"\`(index→8)→null. Returns node4.
\`node3.right = dfs()\`: reads \`"5"\` (index→9) → node5{val:5}. \`node5.left=dfs()\`: reads \`"#"\`(index→10)→null. \`node5.right=dfs()\`: reads \`"#"\`(index→11)→null. Returns node5.
Final reconstructed tree: root1(left=node2 leaf, right=node3(left=node4,right=node5)) — structurally identical to the original. Dehydrates to **[1,2,3,null,null,4,5]** — matches expected.

**Dry run 2 (additional edge case beyond the single provided test)** — a single-node tree \`{val:5,left:null,right:null}\`:
\`serialize\`: emits \`"5"\`, then \`"#"\` (left), \`"#"\` (right) → joined \`"5,#,#"\`.
\`deserialize("5,#,#")\`: tokens=\`["5","#","#"]\`. \`dfs()\`: reads \`"5"\` → node{val:5}. \`node.left=dfs()\`: reads \`"#"\` → null. \`node.right=dfs()\`: reads \`"#"\` → null. Returns node{val:5,left:null,right:null} — an exact round-trip of the original single-node tree.`,
      },
    ],
    relatedSlugs: ["level-order-traversal", "validate-bst"],
    realWorldUsageMarkdown: `Pre-order DFS with a null sentinel is the same encode/decode scheme used by real serialization formats for tree-shaped data — S-expressions, and the on-disk encoding of expression trees/ASTs used by some compilers' intermediate representations.`,
  },
];
```

- [ ] **Step 13: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 14: Lint**

Run: `npm run lint`
Expected: clean on `src/content/problems/trees.ts`.

- [ ] **Step 15: Commit**

```bash
git add src/content/problems/trees.ts
git commit -m "Backfill Deep Solutions content for Trees topic"
```

<!-- APPEND-HERE -->

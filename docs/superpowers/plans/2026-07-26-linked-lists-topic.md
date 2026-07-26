# Linked Lists Topic + Marker-Based Test Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the "Linked Lists" foundation topic (5 problems) and extend the sandboxed test harness so it can hydrate linked-list-shaped test inputs and grade linked-list-shaped outputs, which the current JSON-only harness cannot represent.

**Architecture:** Add a marker-based hydrate/dehydrate layer to the Web Worker test runner (`code-runner.worker.ts`): test-case inputs may contain `{ __listNode: number[] }` or `{ __cycleList: { values, pos } }` tagged objects that get deep-walked and converted into real `{val, next}` chains before the student's function runs; when a test case sets `resultType: "list"`, the student's returned chain is converted back to a plain array before comparison. This is fully additive — no existing problem or file outside the two touched needs to change.

**Tech Stack:** TypeScript, Next.js 16, Web Worker (`code-runner.worker.ts`), no test framework (project has none — verification is `tsc --noEmit` + manual browser click-through, per project convention).

## Global Constraints

- Marker key names are exact: `__listNode` (payload: `number[]`) and `__cycleList` (payload: `{ values: number[]; pos: number }`, `pos: -1` = no cycle).
- New `TestCase` field is exact: `resultType?: "list"`. Omitted = today's behavior, byte-for-byte unchanged.
- Hydrate/dehydrate must be duck-typed on `{val, next}` — never reference a real `ListNode` class or `instanceof`.
- No new test framework, dependency, or config file. Verification is `npx tsc --noEmit` plus manual browser click-through via `npm run dev` (existing project convention — see `docs/superpowers/specs/2026-07-26-dsa-playground-design.md`, "Out of scope: app test suite").
- New topic: slug `linked-lists`, `track: "foundation"`, `order: 4`.
- 5 problems, exact slugs/functionNames: `reverse-linked-list` (`reverseList`), `merge-two-sorted-lists` (`mergeTwoLists`), `linked-list-cycle` (`hasCycle`), `remove-nth-node-from-end-of-list` (`removeNthFromEnd`), `merge-k-sorted-lists` (`mergeKLists`).
- Follow existing content file conventions exactly (see `src/content/problems/arrays.ts`): markdown `description` with `## Problem` / `## Example` / `## Senior interview angle` / `## Pattern` sections, JSDoc-commented `starterCode` with a `// Your code here` body.

---

### Task 1: Marker-based hydrate/dehydrate in the test harness

**Files:**
- Modify: `src/content/types.ts` — add `resultType?: "list"` to `TestCase`.
- Modify: `src/workers/code-runner.worker.ts` — add hydrate/dehydrate logic, wire into the existing `self.onmessage` handler.

**Interfaces:**
- Consumes: nothing from other tasks (this is the foundation task).
- Produces: the `TestCase.resultType` field and the marker convention (`{ __listNode: number[] }`, `{ __cycleList: { values: number[]; pos: number } }`) that Task 2's content file will use. Also produces the worker's runtime behavior: any `TestCase.input` entry (including nested inside arrays) matching a marker shape is hydrated before the student's function is called; if `resultType === "list"`, the function's return value is converted back to a plain array before comparison against `expected`.

- [ ] **Step 1: Write a throwaway verification script for the hydrate/dehydrate algorithm**

Before touching the real worker file, verify the algorithm in isolation. Create `/tmp/verify-harness.mjs` (outside the repo, not committed):

```js
function arrayToList(values) {
  let head = null;
  let tail = null;
  for (const val of values) {
    const node = { val, next: null };
    if (!head) head = node;
    else tail.next = node;
    tail = node;
  }
  return head;
}

function buildCycleList(values, pos) {
  const head = arrayToList(values);
  if (pos < 0 || !head) return head;
  const nodes = [];
  let current = head;
  while (current) {
    nodes.push(current);
    current = current.next;
  }
  nodes[nodes.length - 1].next = nodes[pos] ?? null;
  return head;
}

function listToArray(node) {
  const values = [];
  let current = node;
  const seen = new Set();
  while (current && typeof current === "object" && "val" in current) {
    if (seen.has(current)) break;
    seen.add(current);
    values.push(current.val);
    current = current.next;
  }
  return values;
}

function isListNodeMarker(value) {
  return typeof value === "object" && value !== null && Array.isArray(value.__listNode);
}

function isCycleListMarker(value) {
  return typeof value === "object" && value !== null && typeof value.__cycleList === "object" && value.__cycleList !== null;
}

function hydrate(value) {
  if (Array.isArray(value)) return value.map(hydrate);
  if (isListNodeMarker(value)) return arrayToList(value.__listNode);
  if (isCycleListMarker(value)) return buildCycleList(value.__cycleList.values, value.__cycleList.pos);
  if (value && typeof value === "object") {
    const result = {};
    for (const [k, v] of Object.entries(value)) result[k] = hydrate(v);
    return result;
  }
  return value;
}

function assertEqual(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    console.error(`FAIL ${label}: got ${a}, want ${e}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS ${label}`);
  }
}

// Plain list round-trip
assertEqual(listToArray(hydrate({ __listNode: [1, 2, 3] })), [1, 2, 3], "plain list round-trip");

// Empty list hydrates to null, dehydrates to []
assertEqual(listToArray(hydrate({ __listNode: [] })), [], "empty list round-trip");

// Nested inside an array (mergeKLists shape)
const hydratedLists = hydrate([{ __listNode: [1, 4] }, { __listNode: [2, 3] }]);
assertEqual(hydratedLists.map(listToArray), [[1, 4], [2, 3]], "nested array of lists");

// Cycle: pos 1 means tail points back to index 1
const cyclic = hydrate({ __cycleList: { values: [3, 2, 0, -4], pos: 1 } });
let slow = cyclic, fast = cyclic, hasCycle = false;
while (fast && fast.next) {
  slow = slow.next;
  fast = fast.next.next;
  if (slow === fast) { hasCycle = true; break; }
}
assertEqual(hasCycle, true, "cycle detected");

// pos -1 means no cycle
const acyclic = hydrate({ __cycleList: { values: [1, 2], pos: -1 } });
assertEqual(acyclic.next.next, null, "no cycle when pos is -1");

console.log("done");
```

- [ ] **Step 2: Run the verification script**

Run: `node /tmp/verify-harness.mjs`
Expected: five `PASS` lines and `done`, exit code 0. If anything fails, fix the algorithm in the script before moving on — do not proceed to Step 3 with a broken algorithm.

- [ ] **Step 3: Add `resultType` to the `TestCase` type**

In `src/content/types.ts`, update the `TestCase` interface:

```ts
export interface TestCase {
  input: unknown[];
  expected: unknown;
  label?: string;
  resultType?: "list";
}
```

- [ ] **Step 4: Port the verified algorithm into the worker**

In `src/workers/code-runner.worker.ts`, add these declarations after the existing interface declarations (after line 29, before `function deepEqual`):

```ts
interface RawListNode {
  val: number;
  next: RawListNode | null;
}

interface ListNodeMarker {
  __listNode: number[];
}

interface CycleListMarker {
  __cycleList: { values: number[]; pos: number };
}

function isListNodeMarker(value: unknown): value is ListNodeMarker {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as ListNodeMarker).__listNode)
  );
}

function isCycleListMarker(value: unknown): value is CycleListMarker {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as CycleListMarker).__cycleList === "object" &&
    (value as CycleListMarker).__cycleList !== null
  );
}

function arrayToList(values: number[]): RawListNode | null {
  let head: RawListNode | null = null;
  let tail: RawListNode | null = null;
  for (const val of values) {
    const node: RawListNode = { val, next: null };
    if (!head) {
      head = node;
    } else {
      (tail as RawListNode).next = node;
    }
    tail = node;
  }
  return head;
}

function buildCycleList(values: number[], pos: number): RawListNode | null {
  const head = arrayToList(values);
  if (pos < 0 || !head) return head;

  const nodes: RawListNode[] = [];
  let current: RawListNode | null = head;
  while (current) {
    nodes.push(current);
    current = current.next;
  }
  nodes[nodes.length - 1].next = nodes[pos] ?? null;
  return head;
}

function listToArray(node: unknown): number[] {
  const values: number[] = [];
  const seen = new Set<unknown>();
  let current = node as RawListNode | null;
  while (
    current &&
    typeof current === "object" &&
    "val" in current
  ) {
    if (seen.has(current)) break;
    seen.add(current);
    values.push(current.val);
    current = current.next;
  }
  return values;
}

function hydrate(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(hydrate);
  }
  if (isListNodeMarker(value)) {
    return arrayToList(value.__listNode);
  }
  if (isCycleListMarker(value)) {
    return buildCycleList(value.__cycleList.values, value.__cycleList.pos);
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = hydrate(val);
    }
    return result;
  }
  return value;
}
```

Also update `WorkerTestCase` to include the new field:

```ts
interface WorkerTestCase {
  input: unknown[];
  expected: unknown;
  label?: string;
  resultType?: "list";
}
```

- [ ] **Step 5: Wire hydrate/dehydrate into the test execution loop**

In the same file, replace the `results` computation inside `self.onmessage` (currently `const actual = fn(...testCase.input);`) with:

```ts
const results: WorkerTestResult[] = testCases.map((testCase, index) => {
  const label = testCase.label ?? `Test case ${index + 1}`;

  try {
    const hydratedInput = testCase.input.map(hydrate);
    let actual: unknown = fn(...hydratedInput);

    if (testCase.resultType === "list") {
      actual = listToArray(actual);
    }

    const passed = deepEqual(actual, testCase.expected);

    return {
      label,
      passed,
      expected: testCase.expected,
      actual,
    };
  } catch (error) {
    return {
      label,
      passed: false,
      expected: testCase.expected,
      actual: undefined,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. If there are errors in `code-runner.worker.ts` or `types.ts`, fix them before proceeding — this is the only automated gate for this task.

- [ ] **Step 7: Delete the throwaway script and commit**

```bash
rm /tmp/verify-harness.mjs
git add src/content/types.ts src/workers/code-runner.worker.ts
git commit -m "Add marker-based list hydration to the test harness"
```

---

### Task 2: Linked Lists topic content

**Files:**
- Modify: `src/content/topics.ts` — add the `linked-lists` topic entry.
- Create: `src/content/problems/linked-lists.ts` — 5 problems.
- Modify: `src/content/index.ts` — import and register the new problems array.

**Interfaces:**
- Consumes: `TestCase.resultType` and the `__listNode` / `__cycleList` markers from Task 1. Consumes the `Problem` and `Topic` types from `src/content/types.ts` (unchanged shape otherwise) and the `arrayProblems` / `twoPointerProblems` / `slidingWindowProblems` wiring pattern from `src/content/index.ts:1-14`.
- Produces: `linkedListProblems: Problem[]` (named export from `src/content/problems/linked-lists.ts`), consumed by Task 2's own `index.ts` edit — no later task depends on this.

- [ ] **Step 1: Add the topic entry**

In `src/content/topics.ts`, add a new entry to the `topics` array (after the `sliding-window` entry, before the closing `];`):

```ts
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
```

- [ ] **Step 2: Create the problems file**

Create `src/content/problems/linked-lists.ts`:

```ts
import type { Problem } from "../types";

const listNodeDefinition = `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *   this.val = (val === undefined ? 0 : val)
 *   this.next = (next === undefined ? null : next)
 * }
 */
`;

export const linkedListProblems: Problem[] = [
  {
    slug: "reverse-linked-list",
    title: "Reverse Linked List",
    difficulty: "easy",
    maangTags: ["Google", "Amazon", "Meta"],
    topicSlug: "linked-lists",
    functionName: "reverseList",
    description: `## Problem

Given the \`head\` of a singly linked list, reverse the list and return the new head.

## Example

\`\`\`
Input: head = [1, 2, 3, 4, 5]
Output: [5, 4, 3, 2, 1]
\`\`\`

## Constraints

- \`0 <= list length <= 5000\`

## Senior interview angle

The bar is **O(1) extra space, iterative, three-pointer walk** (\`prev\`, \`curr\`, \`next\`). Mention the recursive version too — it's O(n) space on the call stack, which matters if the list is long.

## Pattern

\`In-place pointer reversal\` — the base case every later "reverse a sub-range" or "reverse in groups of k" problem builds on.`,
    starterCode: `${listNodeDefinition}
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
  // Your code here
}`,
    testCases: [
      { input: [{ __listNode: [1, 2, 3, 4, 5] }], expected: [5, 4, 3, 2, 1], resultType: "list" },
      { input: [{ __listNode: [1, 2] }], expected: [2, 1], resultType: "list" },
      { input: [{ __listNode: [] }], expected: [], resultType: "list" },
    ],
  },
  {
    slug: "merge-two-sorted-lists",
    title: "Merge Two Sorted Lists",
    difficulty: "easy",
    maangTags: ["Amazon", "Meta", "Apple"],
    topicSlug: "linked-lists",
    functionName: "mergeTwoLists",
    description: `## Problem

Merge two sorted linked lists \`list1\` and \`list2\` and return the head of the merged, still-sorted list.

## Example

\`\`\`
Input: list1 = [1, 2, 4], list2 = [1, 3, 4]
Output: [1, 1, 2, 3, 4, 4]
\`\`\`

## Senior interview angle

The **dummy head node** trick removes all the special-casing around "what's the first node of the result". Use it here and reuse it for every future merge/partition list problem.

## Pattern

\`Dummy node + two-pointer merge\` — O(n + m) time, O(1) extra space (splicing existing nodes, not copying values).`,
    starterCode: `${listNodeDefinition}
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
function mergeTwoLists(list1, list2) {
  // Your code here
}`,
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
  {
    slug: "linked-list-cycle",
    title: "Linked List Cycle",
    difficulty: "easy",
    maangTags: ["Amazon", "Google"],
    topicSlug: "linked-lists",
    functionName: "hasCycle",
    description: `## Problem

Given the \`head\` of a linked list, return \`true\` if the list has a cycle, \`false\` otherwise.

## Example

\`\`\`
Input: head = [3, 2, 0, -4], the tail connects back to index 1
Output: true
\`\`\`

## Senior interview angle

**Floyd's cycle detection** (fast/slow pointers) is the expected O(1)-space answer — the hash-set-of-visited-nodes approach is O(n) space and interviewers will ask you to improve on it immediately.

## Pattern

\`Fast & slow pointers\` — the same technique later finds the cycle's start node, the middle of a list, and duplicate numbers in an array.`,
    starterCode: `${listNodeDefinition}
/**
 * @param {ListNode} head
 * @return {boolean}
 */
function hasCycle(head) {
  // Your code here
}`,
    testCases: [
      { input: [{ __cycleList: { values: [3, 2, 0, -4], pos: 1 } }], expected: true },
      { input: [{ __cycleList: { values: [1, 2], pos: 0 } }], expected: true },
      { input: [{ __cycleList: { values: [1], pos: -1 } }], expected: false },
    ],
  },
  {
    slug: "remove-nth-node-from-end-of-list",
    title: "Remove Nth Node From End of List",
    difficulty: "medium",
    maangTags: ["Meta", "Amazon"],
    topicSlug: "linked-lists",
    functionName: "removeNthFromEnd",
    description: `## Problem

Given the \`head\` of a linked list, remove the \`n\`th node from the end of the list and return its head.

## Example

\`\`\`
Input: head = [1, 2, 3, 4, 5], n = 2
Output: [1, 2, 3, 5]
\`\`\`

## Senior interview angle

The one-pass answer: advance a lead pointer \`n\` steps ahead, then move both pointers together until lead hits the end — the trailing pointer now sits right before the node to remove. Use a **dummy head** so removing the actual first node needs no special case.

## Pattern

\`Two-pointer gap\` — fixed-gap pointer pairs solve this and "find the middle" family of problems in one pass instead of two.`,
    starterCode: `${listNodeDefinition}
/**
 * @param {ListNode} head
 * @param {number} n
 * @return {ListNode}
 */
function removeNthFromEnd(head, n) {
  // Your code here
}`,
    testCases: [
      { input: [{ __listNode: [1, 2, 3, 4, 5] }, 2], expected: [1, 2, 3, 5], resultType: "list" },
      { input: [{ __listNode: [1] }, 1], expected: [], resultType: "list" },
      { input: [{ __listNode: [1, 2] }, 1], expected: [1], resultType: "list" },
    ],
  },
  {
    slug: "merge-k-sorted-lists",
    title: "Merge K Sorted Lists",
    difficulty: "hard",
    maangTags: ["Google", "Amazon", "Meta"],
    topicSlug: "linked-lists",
    functionName: "mergeKLists",
    description: `## Problem

You are given an array \`lists\` of \`k\` sorted linked lists. Merge all the lists into one sorted list and return its head.

## Example

\`\`\`
Input: lists = [[1, 4, 5], [1, 3, 4], [2, 6]]
Output: [1, 1, 2, 3, 4, 4, 5, 6]
\`\`\`

## Senior interview angle

Naive pairwise merge is O(kN) where N is total nodes. The bar-raiser answer is a **min-heap of the k current head nodes**, giving O(N log k) — or **divide-and-conquer pairwise merging**, also O(N log k), which needs no heap. Know both; explain the log k factor either way.

## Pattern

\`Heap / divide-and-conquer merge\` — generalizes "Merge Two Sorted Lists" to k inputs; the same heap idea reappears in "K closest points" and "top k frequent elements".`,
    starterCode: `${listNodeDefinition}
/**
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
function mergeKLists(lists) {
  // Your code here
}`,
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
];
```

- [ ] **Step 3: Wire the new problems into `getAllProblems`**

In `src/content/index.ts`, add the import and spread it into `allProblems`:

```ts
import { arrayProblems } from "./problems/arrays";
import { linkedListProblems } from "./problems/linked-lists";
import { slidingWindowProblems } from "./problems/sliding-window";
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
];
```

(Keep imports alphabetically ordered as shown — matches the existing file's ordering convention.)

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/content/topics.ts src/content/problems/linked-lists.ts src/content/index.ts
git commit -m "Add Linked Lists topic with 5 problems"
```

---

### Task 3: End-to-end verification

**Files:** none (no code changes — verification only).

**Interfaces:**
- Consumes: the running app with Task 1 + Task 2 merged.
- Produces: nothing for later tasks — this is the final task in this plan.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (in the background, or in a separate terminal)
Expected: server starts on `http://localhost:3000` without errors in the terminal.

- [ ] **Step 2: Confirm the topic appears on the dashboard**

Open `http://localhost:3000` in a browser. Expected: a "Linked Lists" card appears under **Foundation Track**, showing `0/5`.

- [ ] **Step 3: Verify each of the 5 problems with a correct reference solution**

For each problem below, navigate to `http://localhost:3000/problems/<slug>`, replace the starter code's function body with the given reference solution (paste it in place of the whole `function ... { }` block, keeping the `listNodeDefinition` comment above it untouched), click **Run Tests**, and confirm **all 3 tests pass** with no error banner.

`reverse-linked-list`:
```js
function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}
```

`merge-two-sorted-lists`:
```js
function mergeTwoLists(list1, list2) {
  const dummy = { val: 0, next: null };
  let tail = dummy;
  while (list1 && list2) {
    if (list1.val <= list2.val) {
      tail.next = list1;
      list1 = list1.next;
    } else {
      tail.next = list2;
      list2 = list2.next;
    }
    tail = tail.next;
  }
  tail.next = list1 || list2;
  return dummy.next;
}
```

`linked-list-cycle`:
```js
function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
```

`remove-nth-node-from-end-of-list`:
```js
function removeNthFromEnd(head, n) {
  const dummy = { val: 0, next: head };
  let lead = dummy;
  let trail = dummy;
  for (let i = 0; i < n; i++) {
    lead = lead.next;
  }
  while (lead.next) {
    lead = lead.next;
    trail = trail.next;
  }
  trail.next = trail.next.next;
  return dummy.next;
}
```

`merge-k-sorted-lists`:
```js
function mergeKLists(lists) {
  function mergeTwo(a, b) {
    const dummy = { val: 0, next: null };
    let tail = dummy;
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
  }

  let lists2 = lists.filter((l) => l);
  if (lists2.length === 0) return null;
  while (lists2.length > 1) {
    const merged = [];
    for (let i = 0; i < lists2.length; i += 2) {
      merged.push(
        i + 1 < lists2.length ? mergeTwo(lists2[i], lists2[i + 1]) : lists2[i],
      );
    }
    lists2 = merged;
  }
  return lists2[0];
}
```

- [ ] **Step 4: Confirm progress reflects on the dashboard**

Navigate back to `http://localhost:3000`. Expected: "Linked Lists" card shows `5/5`, and the top banner's "X solved" count increased by 5.

- [ ] **Step 5: Stop the dev server**

Kill the `npm run dev` process (Ctrl+C, or `pkill -f "next dev"` if backgrounded).

No commit for this task — it's verification only, not a code change.

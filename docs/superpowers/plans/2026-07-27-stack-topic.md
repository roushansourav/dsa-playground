# Stack Topic + Operations-Based Test Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the "Stack" pattern topic (5 problems) and extend the sandboxed test harness so it can grade class-based (multi-method) solutions, which the current function-only harness cannot represent.

**Architecture:** Add an operations-based test mode to the Web Worker test runner (`code-runner.worker.ts`): a `TestCase` may set `operations: string[]` (a method-call sequence, index 0 = constructor) and `args: unknown[][]` (index-aligned arguments) instead of `input`/single-call `expected`. When `operations` is present, the worker constructs `new fn(...args[0])`, then calls each subsequent method on the instance, collecting results (mapping `undefined` to `null`) into an array compared against `expected`. This is fully additive — no existing problem or file outside the two touched needs to change.

**Tech Stack:** TypeScript, Next.js 16, Web Worker (`code-runner.worker.ts`), no test framework (project has none — verification is `tsc --noEmit` + subagent review, per project convention).

## Global Constraints

- New `TestCase` fields are exact: `operations?: string[]` and `args?: unknown[][]`. `input` becomes optional (`input?: unknown[]`). Omitting `operations` = today's behavior, byte-for-byte unchanged.
- Operations mode: index 0 of `operations`/`args` is always the constructor call (`new fn(...args[0])`); `expected[0]` is always `null`. Every method's `undefined` return is mapped to `null` before comparison, matching LeetCode's judge convention.
- No new test framework, dependency, or config file. Verification is `npx tsc --noEmit` plus task/whole-branch subagent review (existing project convention — see `docs/superpowers/specs/2026-07-27-stack-topic-design.md`).
- New topic: slug `stack`, `track: "pattern"`, `order: 5`.
- 5 problems, exact slugs/functionNames: `valid-parentheses` (`isValid`), `min-stack` (`MinStack`, class), `evaluate-reverse-polish-notation` (`evalRPN`), `generate-parentheses` (`generateParenthesis`), `daily-temperatures` (`dailyTemperatures`).
- Follow existing content file conventions exactly (see `src/content/problems/arrays.ts`): markdown `description` with `## Problem` / `## Example` / `## Senior interview angle` / `## Pattern` sections, JSDoc-commented `starterCode` with a `// Your code here` body.

---

### Task 1: Operations-based test mode in the harness

**Files:**
- Modify: `src/content/types.ts` — add `operations?: string[]` and `args?: unknown[][]` to `TestCase`; make `input` optional.
- Modify: `src/workers/code-runner.worker.ts` — add the operations-mode branch, wire into the existing `self.onmessage` handler.

**Interfaces:**
- Consumes: nothing from other tasks (this is the foundation task).
- Produces: the `TestCase.operations`/`TestCase.args` fields that Task 2's `min-stack` problem will use. Also produces the worker's runtime behavior: when `testCase.operations` is set, the worker constructs an instance via `new fn(...hydrate(args[0]))`, calls `instance[operations[i]](...hydrate(args[i]))` for each later index, and compares the collected `outputs` array (with `undefined` mapped to `null`) against `expected`.

- [ ] **Step 1: Write a throwaway verification script for the operations-mode algorithm**

Before touching the real worker file, verify the algorithm in isolation. Create `/tmp/verify-ops-harness.mjs` (outside the repo, not committed):

```js
class MinStack {
  constructor() {
    this.stack = [];
    this.minStack = [];
  }
  push(val) {
    this.stack.push(val);
    if (this.minStack.length === 0 || val <= this.minStack[this.minStack.length - 1]) {
      this.minStack.push(val);
    } else {
      this.minStack.push(this.minStack[this.minStack.length - 1]);
    }
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
}

function runOperations(fn, operations, args) {
  const outputs = [];
  let instance;
  operations.forEach((op, i) => {
    const callArgs = args[i] ?? [];
    if (i === 0) {
      instance = new fn(...callArgs);
      outputs.push(null);
    } else {
      const result = instance[op](...callArgs);
      outputs.push(result === undefined ? null : result);
    }
  });
  return outputs;
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

const ops1 = ["MinStack", "push", "push", "push", "getMin", "pop", "top", "getMin"];
const args1 = [[], [-2], [0], [-3], [], [], [], []];
assertEqual(runOperations(MinStack, ops1, args1), [null, null, null, null, -3, null, 0, -2], "min stack sequence 1");

const ops2 = ["MinStack", "push", "push", "getMin", "pop", "getMin"];
const args2 = [[], [5], [3], [], [], []];
assertEqual(runOperations(MinStack, ops2, args2), [null, null, null, 3, null, 5], "min stack sequence 2");

console.log("done");
```

- [ ] **Step 2: Run the verification script**

Run: `node /tmp/verify-ops-harness.mjs`
Expected: two `PASS` lines and `done`, exit code 0. If anything fails, fix the algorithm in the script before moving on — do not proceed to Step 3 with a broken algorithm.

- [ ] **Step 3: Add `operations`/`args` to the `TestCase` type, make `input` optional**

In `src/content/types.ts`, update the `TestCase` interface:

```ts
export interface TestCase {
  input?: unknown[];
  expected: unknown;
  label?: string;
  resultType?: "list";
  operations?: string[];
  args?: unknown[][];
}
```

- [ ] **Step 4: Mirror the field changes on `WorkerTestCase`**

In `src/workers/code-runner.worker.ts`, update `WorkerTestCase`:

```ts
interface WorkerTestCase {
  input?: unknown[];
  expected: unknown;
  label?: string;
  resultType?: "list";
  operations?: string[];
  args?: unknown[][];
}
```

- [ ] **Step 5: Add the operations-mode branch to the test execution loop**

In the same file, inside the `testCases.map((testCase, index) => { ... })` callback, replace the current body of the `try` block (which reads `const hydratedInput = testCase.input.map(hydrate); actual = fn(...hydratedInput); if (testCase.resultType === "list") { actual = listToArray(actual); }`) with:

```ts
if (testCase.operations) {
  const ops = testCase.operations;
  const argsList = testCase.args ?? [];
  const outputs: unknown[] = [];
  let instance: unknown;

  ops.forEach((op, opIndex) => {
    const callArgs = (argsList[opIndex] ?? []).map(hydrate);
    if (opIndex === 0) {
      instance = new (fn as unknown as new (...ctorArgs: unknown[]) => unknown)(
        ...callArgs,
      );
      outputs.push(null);
    } else {
      const method = (instance as Record<string, (...methodArgs: unknown[]) => unknown>)[op];
      const result = method.apply(instance, callArgs);
      outputs.push(result === undefined ? null : result);
    }
  });

  actual = outputs;
} else {
  const hydratedInput = (testCase.input ?? []).map(hydrate);
  actual = fn(...hydratedInput);

  if (testCase.resultType === "list") {
    actual = listToArray(actual);
  }
}
```

`actual` is already declared as `let actual: unknown;` above the `try` block from the Linked Lists task — reuse it, do not redeclare.

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. If there are errors in `code-runner.worker.ts` or `types.ts`, fix them before proceeding — this is the only automated gate for this task.

- [ ] **Step 7: Delete the throwaway script and commit**

```bash
rm /tmp/verify-ops-harness.mjs
git add src/content/types.ts src/workers/code-runner.worker.ts
git commit -m "Add operations-based test mode to the harness for class-based problems"
```

---

### Task 2: Stack topic content

**Files:**
- Modify: `src/content/topics.ts` — add the `stack` topic entry.
- Create: `src/content/problems/stack.ts` — 5 problems.
- Modify: `src/content/index.ts` — import and register the new problems array.

**Interfaces:**
- Consumes: `TestCase.operations`/`TestCase.args` from Task 1 (used by `min-stack`'s test cases). Consumes the `Problem` and `Topic` types from `src/content/types.ts` (unchanged shape otherwise) and the existing problems-array wiring pattern from `src/content/index.ts:1-16`.
- Produces: `stackProblems: Problem[]` (named export from `src/content/problems/stack.ts`), consumed by this task's own `index.ts` edit — no later task depends on this.

- [ ] **Step 1: Add the topic entry**

In `src/content/topics.ts`, add a new entry to the `topics` array (after the `linked-lists` entry, before the closing `];`):

```ts
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
```

- [ ] **Step 2: Create the problems file**

Create `src/content/problems/stack.ts`:

```ts
import type { Problem } from "../types";

export const stackProblems: Problem[] = [
  {
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "easy",
    maangTags: ["Google", "Amazon", "Meta"],
    topicSlug: "stack",
    functionName: "isValid",
    description: `## Problem

Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\`, and \`']'\`, determine if the input string is valid. Brackets must close in the correct order and every open bracket must have a matching close of the same type.

## Example

\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\`

## Constraints

- \`1 <= s.length <= 10^4\`

## Senior interview angle

Push opens, and on a close check the **top of the stack** matches — pop on match, fail fast on mismatch. State clearly why a stack (not a counter) is required: order matters, not just counts (\`"([)]"\` has balanced counts but is invalid).

## Pattern

\`Stack as a matcher\` — the base case for every later "validate nested structure" problem (e.g. validating a simplified path, or a parser).`,
    starterCode: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Your code here
}`,
    testCases: [
      { input: ["()"], expected: true },
      { input: ["()[]{}"], expected: true },
      { input: ["(]"], expected: false },
      { input: ["([)]"], expected: false },
      { input: ["{[]}"], expected: true },
    ],
  },
  {
    slug: "min-stack",
    title: "Min Stack",
    difficulty: "medium",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "stack",
    functionName: "MinStack",
    description: `## Problem

Design a stack that supports \`push\`, \`pop\`, \`top\`, and retrieving the minimum element, all in **O(1)** time.

Implement the \`MinStack\` class:
- \`MinStack()\` initializes the stack.
- \`push(val)\` pushes \`val\` onto the stack.
- \`pop()\` removes the element on top of the stack.
- \`top()\` returns the element on top of the stack.
- \`getMin()\` returns the minimum element in the stack.

## Example

\`\`\`
Input:  ["MinStack","push","push","push","getMin","pop","top","getMin"]
        [[],[-2],[0],[-3],[],[],[],[]]
Output: [null,null,null,null,-3,null,0,-2]
\`\`\`

## Senior interview angle

The O(1) trick is a **second stack tracking the running minimum**: on push, push \`Math.min(val, currentMin)\` (or the current min itself if larger); on pop, pop both stacks together. This avoids re-scanning for the min and avoids storing pair tuples.

## Pattern

\`Auxiliary stack for O(1) aggregate queries\` — the same "shadow stack tracks a running aggregate" idea generalizes to max-stack, or stack-with-running-sum.`,
    starterCode: `class MinStack {
  constructor() {
    // Your code here
  }

  /**
   * @param {number} val
   * @return {void}
   */
  push(val) {
    // Your code here
  }

  /**
   * @return {void}
   */
  pop() {
    // Your code here
  }

  /**
   * @return {number}
   */
  top() {
    // Your code here
  }

  /**
   * @return {number}
   */
  getMin() {
    // Your code here
  }
}`,
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
    ],
  },
  {
    slug: "evaluate-reverse-polish-notation",
    title: "Evaluate Reverse Polish Notation",
    difficulty: "medium",
    maangTags: ["Amazon", "Google"],
    topicSlug: "stack",
    functionName: "evalRPN",
    description: `## Problem

Evaluate the value of an arithmetic expression given as an array of tokens in **Reverse Polish Notation**. Valid operators are \`+\`, \`-\`, \`*\`, and \`/\`. Division between two integers truncates toward zero.

## Example

\`\`\`
Input: tokens = ["2","1","+","3","*"]
Output: 9
Explanation: ((2 + 1) * 3) = 9
\`\`\`

## Senior interview angle

Push operands; on an operator, **pop two, apply, push the result back** — order matters for \`-\` and \`/\` (the first pop is the right-hand operand, the second is the left-hand). Use \`Math.trunc\`, not \`Math.floor\`, for truncate-toward-zero on negative results.

## Pattern

\`Stack as a calculator\` — RPN evaluation is how a compiler evaluates expressions after parsing infix to postfix; the stack replaces the need for operator precedence/parentheses entirely.`,
    starterCode: `/**
 * @param {string[]} tokens
 * @return {number}
 */
function evalRPN(tokens) {
  // Your code here
}`,
    testCases: [
      { input: [["2", "1", "+", "3", "*"]], expected: 9 },
      { input: [["4", "13", "5", "/", "+"]], expected: 6 },
      {
        input: [["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]],
        expected: 22,
      },
    ],
  },
  {
    slug: "generate-parentheses",
    title: "Generate Parentheses",
    difficulty: "medium",
    maangTags: ["Google", "Meta", "Amazon"],
    topicSlug: "stack",
    functionName: "generateParenthesis",
    description: `## Problem

Given \`n\` pairs of parentheses, return all combinations of well-formed parentheses strings, in this exact order: generated by always trying to place an open paren before a close paren at each step (standard backtracking order).

## Example

\`\`\`
Input: n = 3
Output: ["((()))","(()())","(())()","()(())","()()()"]
\`\`\`

## Senior interview angle

Backtrack with two counters (\`open\`, \`close\`) instead of validating full strings after the fact: add \`(\` whenever \`open < n\`, add \`)\` whenever \`close < open\`. This prunes invalid branches immediately instead of generating-then-filtering \`2^(2n)\` strings.

## Pattern

\`Constrained backtracking\` — the counters ARE the validity invariant, so every leaf reached is automatically valid. The same shape (branch only when a local constraint allows it) shows up in N-Queens and Sudoku solvers.`,
    starterCode: `/**
 * @param {number} n
 * @return {string[]}
 */
function generateParenthesis(n) {
  // Your code here
}`,
    testCases: [
      { input: [1], expected: ["()"] },
      { input: [2], expected: ["(())", "()()"] },
      { input: [3], expected: ["((()))", "(()())", "(())()", "()(())", "()()()"] },
    ],
  },
  {
    slug: "daily-temperatures",
    title: "Daily Temperatures",
    difficulty: "medium",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "stack",
    functionName: "dailyTemperatures",
    description: `## Problem

Given an array \`temperatures\`, return an array \`answer\` where \`answer[i]\` is the number of days until a warmer temperature. If there is no future day for which this is possible, \`answer[i] = 0\`.

## Example

\`\`\`
Input: temperatures = [73,74,75,71,69,72,76,73]
Output: [1,1,4,2,1,1,0,0]
\`\`\`

## Senior interview angle

The **monotonic decreasing stack** (of indices) is the O(n) answer: push indices while temperatures are non-increasing; whenever the current temperature beats the stack's top, pop it and record the day-gap. Each index is pushed and popped at most once — that's the O(n) argument to state explicitly, since the nested loop looks O(n²) at a glance.

## Pattern

\`Monotonic stack\` — the canonical "next greater element" technique; reused verbatim for Next Greater Element I/II and Car Fleet.`,
    starterCode: `/**
 * @param {number[]} temperatures
 * @return {number[]}
 */
function dailyTemperatures(temperatures) {
  // Your code here
}`,
    testCases: [
      {
        input: [[73, 74, 75, 71, 69, 72, 76, 73]],
        expected: [1, 1, 4, 2, 1, 1, 0, 0],
      },
      { input: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
      { input: [[30, 60, 90]], expected: [1, 1, 0] },
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
import { stackProblems } from "./problems/stack";
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
];
```

(Keep imports alphabetically ordered as shown — matches the existing file's ordering convention.)

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/content/topics.ts src/content/problems/stack.ts src/content/index.ts
git commit -m "Add Stack topic with 5 problems"
```

---

Plan complete after Task 2. Both tasks are independently type-checked and reviewed (task-level review + final whole-branch review), which is the plan's automated gate — consistent with the Linked Lists topic precedent.

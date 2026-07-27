# Trees Topic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the "Trees" pattern topic (12 problems) and extend the test harness with binary-tree hydration/dehydration support, including a round-trip verification mode for the `Codec` serialize/deserialize problem.

**Architecture:** Two tasks. Task 1 extends `TestCase` and the worker's execution engine with tree support (hydrate a `{__treeNode: [...]}` marker into a real tree, dehydrate a returned tree back into array form, and support chaining one operation's real output into a later operation's input). Task 2 adds the 12-problem content file plus the standard topic/index wiring, consuming Task 1's new capabilities.

**Tech Stack:** TypeScript, Next.js content model under `src/content/`, a Web Worker test-execution engine at `src/workers/code-runner.worker.ts`.

## Global Constraints

- New topic: slug `trees`, `track: "pattern"`, `order: 7`.
- 12 problems, exact slugs/functionNames (see Task 2's problem table).
- `maangTags` values must come only from the actual `MaangTag` union in `src/content/types.ts`: `"Google" | "Amazon" | "Apple" | "Netflix" | "Meta"`. Do not use any other company name (this bit the Binary Search topic's plan — verify against the real union before writing any tag).
- Tree hydration marker shape: `{ __treeNode: (number | null)[] }`, values in LeetCode's canonical level-order-with-nulls format. A non-null node consumes the next two array slots for its children; a `null` entry consumes zero further slots.
- Tree dehydration (`treeToArray`) must throw on a non-tree-shaped, non-null value — do not silently coerce or return a partial result (matches `listToArray`'s existing philosophy).
- `lowestCommonAncestor`'s `p`/`q` test-case inputs are standalone single-node trees (`{ __treeNode: [val] }`), not references into the `root` argument. Do not attempt cross-argument node resolution — this is a deliberate, documented scope decision (see spec), not a bug to fix.
- No changes to `run-code.ts` or any UI component. No new npm dependencies (no ts-node/tsx — verification scripts run as plain `.js` via `node` directly).
- Follow existing content file conventions exactly (see `src/content/problems/binary-search.ts` and `src/content/problems/linked-lists.ts` for reference): markdown `description` with `## Problem` / `## Example` / `## Senior interview angle` / `## Pattern` sections, JSDoc-commented `starterCode` with a `// Your code here` body, and a shared `treeNodeDefinition` string constant prepended to each problem's `starterCode` (mirroring `linked-lists.ts`'s `listNodeDefinition` pattern).

---

## Task 1: Extend the test harness for binary trees

**Files:**
- Modify: `src/content/types.ts`
- Modify: `src/workers/code-runner.worker.ts`

**Interfaces:**
- Consumes: nothing from other tasks (this is the foundational task).
- Produces (for Task 2 to use):
  - `TestCase.resultType?: "list" | "tree"` — when `"tree"`, a single-function test's return value is dehydrated via `treeToArray` before comparison.
  - Hydration marker `{ __treeNode: (number | null)[] }` — usable anywhere inside `TestCase.input` or operations `args`; `hydrate()` converts it into a real `{val, left, right}` tree object.
  - `TestCase.operationResultTypes?: Array<"tree" | null>` — parallel to `operations`; marks which per-operation outputs get `treeToArray`-dehydrated before comparison.
  - `TestCase.skipOutputCheck?: number[]` — operation indices whose actual output is forced to `null` on both sides of the comparison (used when an operation's output format is implementation-defined, e.g. `serialize`'s string).
  - The literal sentinel string `"$prevOutput"` as an element of an operations `args[i]` array — substituted with the *real, undehydrated* return value of operation `i - 1` (not hydrated further).

### Step 1: Update `TestCase` in `src/content/types.ts`

Read the current file first — it's 52 lines. Replace the `TestCase` interface (currently lines 6-13):

```typescript
export interface TestCase {
  input?: unknown[];
  expected: unknown;
  label?: string;
  resultType?: "list";
  operations?: string[];
  args?: unknown[][];
}
```

with:

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

Nothing else in the file changes.

### Step 2: Update `WorkerTestCase` in `src/workers/code-runner.worker.ts`

Read the current file first — it's 291 lines. Replace the `WorkerTestCase` interface (currently lines 3-10):

```typescript
interface WorkerTestCase {
  input?: unknown[];
  expected: unknown;
  label?: string;
  resultType?: "list";
  operations?: string[];
  args?: unknown[][];
}
```

with:

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

### Step 3: Add tree hydrate/dehydrate functions

Find the end of the `listToArray` function (it ends with a closing `}` followed by a blank line, then `function hydrate(value: unknown): unknown {`). Insert the following new block immediately after `listToArray`'s closing brace and before `function hydrate`:

```typescript
interface RawTreeNode {
  val: number;
  left: RawTreeNode | null;
  right: RawTreeNode | null;
}

interface TreeNodeMarker {
  __treeNode: (number | null)[];
}

function isTreeNodeMarker(value: unknown): value is TreeNodeMarker {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as TreeNodeMarker).__treeNode)
  );
}

function arrayToTree(values: (number | null)[]): RawTreeNode | null {
  if (values.length === 0 || values[0] === null) return null;
  const root: RawTreeNode = { val: values[0], left: null, right: null };
  const queue: RawTreeNode[] = [root];
  let i = 1;
  while (queue.length && i < values.length) {
    const node = queue.shift() as RawTreeNode;
    if (i < values.length) {
      const leftVal = values[i++];
      if (leftVal !== null) {
        const leftNode: RawTreeNode = { val: leftVal, left: null, right: null };
        node.left = leftNode;
        queue.push(leftNode);
      }
    }
    if (i < values.length) {
      const rightVal = values[i++];
      if (rightVal !== null) {
        const rightNode: RawTreeNode = { val: rightVal, left: null, right: null };
        node.right = rightNode;
        queue.push(rightNode);
      }
    }
  }
  return root;
}

function treeToArray(node: unknown): (number | null)[] {
  if (node === null) return [];

  const values: (number | null)[] = [];
  const queue: unknown[] = [node];

  while (queue.length) {
    const current = queue.shift();
    if (current === null) {
      values.push(null);
      continue;
    }

    const isTreeNodeShape =
      typeof current === "object" &&
      current !== undefined &&
      "val" in (current as object) &&
      "left" in (current as object) &&
      "right" in (current as object);

    if (!isTreeNodeShape) {
      throw new Error(
        `Expected a tree node or null, but received ${JSON.stringify(current)}`,
      );
    }

    const typedCurrent = current as RawTreeNode;
    values.push(typedCurrent.val);
    queue.push(typedCurrent.left);
    queue.push(typedCurrent.right);
  }

  while (values.length && values[values.length - 1] === null) {
    values.pop();
  }

  return values;
}
```

### Step 4: Extend `hydrate()` to recognize the tree marker

The current `hydrate` function is:

```typescript
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

Add a branch for `isTreeNodeMarker` after the `isCycleListMarker` branch:

```typescript
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
  if (isTreeNodeMarker(value)) {
    return arrayToTree(value.__treeNode);
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

### Step 5: Extend the non-operations branch's `resultType` handling

Inside `self.onmessage`, find:

```typescript
        } else {
          const hydratedInput = (testCase.input ?? []).map(hydrate);
          actual = fn(...hydratedInput);

          if (testCase.resultType === "list") {
            actual = listToArray(actual);
          }
        }
```

Replace with:

```typescript
        } else {
          const hydratedInput = (testCase.input ?? []).map(hydrate);
          actual = fn(...hydratedInput);

          if (testCase.resultType === "list") {
            actual = listToArray(actual);
          } else if (testCase.resultType === "tree") {
            actual = treeToArray(actual);
          }
        }
```

### Step 6: Extend the operations branch for chaining and per-op dehydration

Find the current operations branch:

```typescript
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
```

Replace with:

```typescript
        if (testCase.operations) {
          const ops = testCase.operations;
          const argsList = testCase.args ?? [];
          const outputs: unknown[] = [];
          const rawOutputs: unknown[] = [];
          let instance: unknown;

          ops.forEach((op, opIndex) => {
            const rawArgs = argsList[opIndex] ?? [];
            const callArgs = rawArgs.map((arg) =>
              arg === "$prevOutput" ? rawOutputs[opIndex - 1] : hydrate(arg),
            );

            if (opIndex === 0) {
              instance = new (fn as unknown as new (...ctorArgs: unknown[]) => unknown)(
                ...callArgs,
              );
              rawOutputs.push(undefined);
              outputs.push(null);
              return;
            }

            const method = (instance as Record<string, (...methodArgs: unknown[]) => unknown>)[op];
            const rawResult = method.apply(instance, callArgs);
            rawOutputs.push(rawResult);

            if (testCase.skipOutputCheck?.includes(opIndex)) {
              outputs.push(null);
            } else if (testCase.operationResultTypes?.[opIndex] === "tree") {
              outputs.push(treeToArray(rawResult));
            } else {
              outputs.push(rawResult === undefined ? null : rawResult);
            }
          });

          actual = outputs;
        } else {
```

Note this is a strict superset of the previous behavior: when `skipOutputCheck`, `operationResultTypes`, and `"$prevOutput"` are all absent (every existing `MinStack` and `TimeMap` test case), the output for each operation is computed exactly as before.

### Step 7: Write and run a throwaway verification script

There is no automated test infrastructure in this repo and no `ts-node`/`tsx` dependency — verify the new tree logic by hand-running a plain JS script with `node` directly, then deleting it. Do not commit this script.

Create `/tmp/verify-tree-harness.js` with this exact content:

```javascript
function arrayToTree(values) {
  if (values.length === 0 || values[0] === null) return null;
  const root = { val: values[0], left: null, right: null };
  const queue = [root];
  let i = 1;
  while (queue.length && i < values.length) {
    const node = queue.shift();
    if (i < values.length) {
      const leftVal = values[i++];
      if (leftVal !== null) {
        const leftNode = { val: leftVal, left: null, right: null };
        node.left = leftNode;
        queue.push(leftNode);
      }
    }
    if (i < values.length) {
      const rightVal = values[i++];
      if (rightVal !== null) {
        const rightNode = { val: rightVal, left: null, right: null };
        node.right = rightNode;
        queue.push(rightNode);
      }
    }
  }
  return root;
}

function treeToArray(node) {
  if (node === null) return [];
  const values = [];
  const queue = [node];
  while (queue.length) {
    const current = queue.shift();
    if (current === null) {
      values.push(null);
      continue;
    }
    const isTreeNodeShape =
      typeof current === "object" &&
      current !== undefined &&
      "val" in current &&
      "left" in current &&
      "right" in current;
    if (!isTreeNodeShape) {
      throw new Error(`Expected a tree node or null, but received ${JSON.stringify(current)}`);
    }
    values.push(current.val);
    queue.push(current.left);
    queue.push(current.right);
  }
  while (values.length && values[values.length - 1] === null) {
    values.pop();
  }
  return values;
}

function assertDeepEqual(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`FAIL ${label}: expected ${e}, got ${a}`);
  }
  console.log(`PASS ${label}`);
}

const asymmetric = [3, 9, 20, null, null, 15, 7];
assertDeepEqual(treeToArray(arrayToTree(asymmetric)), asymmetric, "asymmetric round-trip");

assertDeepEqual(treeToArray(arrayToTree([])), [], "empty round-trip");

assertDeepEqual(treeToArray(arrayToTree([5])), [5], "single-node round-trip");

const leftSkewed = [1, 2, null, 3];
assertDeepEqual(treeToArray(arrayToTree(leftSkewed)), leftSkewed, "left-skewed round-trip");

let threw = false;
try {
  treeToArray({ notATreeNode: true });
} catch (e) {
  threw = true;
}
if (!threw) throw new Error("FAIL malformed-input: expected treeToArray to throw");
console.log("PASS malformed-input throws");

console.log("All tree harness checks passed.");
```

Run: `node /tmp/verify-tree-harness.js`

Expected output: six `PASS` lines followed by `All tree harness checks passed.` — with no error thrown. This confirms, independent of the TypeScript compiler, that `arrayToTree`/`treeToArray` round-trip correctly on a symmetric case, an empty tree, a single node, an asymmetric/left-skewed case that exercises the trailing-null trim mid-array, and that malformed input throws instead of silently mismatching.

If any assertion fails, the logic in Steps 3-6 has a bug relative to this plan — fix `code-runner.worker.ts` (not the verification script) and re-run until all six pass.

Delete the script when done: `rm /tmp/verify-tree-harness.js`

### Step 8: Type-check

Run: `npx tsc --noEmit`

Expected: no output, exit code 0.

### Step 9: Commit

```bash
git add src/content/types.ts src/workers/code-runner.worker.ts
git commit -m "Extend test harness with binary tree hydrate/dehydrate and operation chaining"
```

---

## Task 2: Add Trees topic content

**Files:**
- Create: `src/content/problems/trees.ts`
- Modify: `src/content/topics.ts`
- Modify: `src/content/index.ts`

**Interfaces:**
- Consumes: `TestCase.resultType: "tree"`, the `{ __treeNode: (number | null)[] }` hydration marker, `TestCase.operationResultTypes`, `TestCase.skipOutputCheck`, and the `"$prevOutput"` args sentinel — all from Task 1, already merged before this task starts.
- Produces: `export const treeProblems: Problem[]` (12 problems) from `src/content/problems/trees.ts`, consumed by `src/content/index.ts`.

### Step 1: Create `src/content/problems/trees.ts`

```typescript
import type { Problem } from "../types";

const treeNodeDefinition = `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *   this.val = (val === undefined ? 0 : val)
 *   this.left = (left === undefined ? null : left)
 *   this.right = (right === undefined ? null : right)
 * }
 */
`;

export const treeProblems: Problem[] = [
  {
    slug: "invert-binary-tree",
    title: "Invert Binary Tree",
    difficulty: "easy",
    maangTags: ["Google", "Amazon", "Meta"],
    topicSlug: "trees",
    functionName: "invertTree",
    description: `## Problem

Given the \`root\` of a binary tree, invert the tree — swap every node's left and right children — and return its root.

## Example

\`\`\`
Input: root = [4,2,7,1,3,6,9]
Output: [4,7,2,9,6,3,1]
\`\`\`

## Senior interview angle

Swap \`node.left\` and \`node.right\` at every node, then recurse into both (now-swapped) children — order of the swap vs. the recursive calls doesn't matter as long as you recurse into both. This became a famous interview question after a well-known "couldn't invert a binary tree" incident — the actual bar is a clean 3-line recursive solution, not cleverness.

## Pattern

\`Binary tree recursion, structural mutation\` — the base case for every later "transform every node" tree problem.`,
    starterCode: `${treeNodeDefinition}
/**
 * @param {TreeNode} root
 * @return {TreeNode}
 */
function invertTree(root) {
  // Your code here
}`,
    testCases: [
      { input: [{ __treeNode: [4, 2, 7, 1, 3, 6, 9] }], expected: [4, 7, 2, 9, 6, 3, 1], resultType: "tree" },
      { input: [{ __treeNode: [2, 1, 3] }], expected: [2, 3, 1], resultType: "tree" },
      { input: [{ __treeNode: [] }], expected: [], resultType: "tree" },
    ],
  },
  {
    slug: "max-depth-binary-tree",
    title: "Maximum Depth of Binary Tree",
    difficulty: "easy",
    maangTags: ["Amazon", "Google"],
    topicSlug: "trees",
    functionName: "maxDepth",
    description: `## Problem

Given the \`root\` of a binary tree, return its maximum depth — the number of nodes along the longest path from the root down to the farthest leaf.

## Example

\`\`\`
Input: root = [3,9,20,null,null,15,7]
Output: 3
\`\`\`

## Senior interview angle

\`maxDepth(node) = node ? 1 + max(maxDepth(node.left), maxDepth(node.right)) : 0\` — the entire solution is that one line. The interview signal isn't the recursion itself but whether you can state the base case (\`null\` returns \`0\`) without hesitating, since every other tree-depth problem in this topic reuses this exact shape.

## Pattern

\`Post-order height computation\` — compute a value bottom-up from children before using it at the parent; Diameter of Binary Tree and Balanced Binary Tree both extend this same computation.`,
    starterCode: `${treeNodeDefinition}
/**
 * @param {TreeNode} root
 * @return {number}
 */
function maxDepth(root) {
  // Your code here
}`,
    testCases: [
      { input: [{ __treeNode: [3, 9, 20, null, null, 15, 7] }], expected: 3 },
      { input: [{ __treeNode: [1, null, 2] }], expected: 2 },
      { input: [{ __treeNode: [] }], expected: 0 },
    ],
  },
  {
    slug: "diameter-binary-tree",
    title: "Diameter of Binary Tree",
    difficulty: "easy",
    maangTags: ["Amazon", "Meta"],
    topicSlug: "trees",
    functionName: "diameterOfBinaryTree",
    description: `## Problem

Given the \`root\` of a binary tree, return the length of the diameter — the length (in **edges**) of the longest path between any two nodes. The path does not have to pass through the root.

## Example

\`\`\`
Input: root = [1,2,3,4,5]
Output: 3
\`\`\`

## Senior interview angle

The diameter through any given node equals \`height(left) + height(right)\` — not \`1 + height(left) + height(right)\`, since the path is measured in edges, not nodes. Compute heights post-order and track a running max of \`leftHeight + rightHeight\` across every node visited, in the same single pass, rather than recomputing height separately for each candidate node (which would be O(n²)).

## Pattern

\`Post-order height computation with a side-channel max\` — the height computation from Maximum Depth, plus tracking the best value seen across all nodes rather than just returning the root's value.`,
    starterCode: `${treeNodeDefinition}
/**
 * @param {TreeNode} root
 * @return {number}
 */
function diameterOfBinaryTree(root) {
  // Your code here
}`,
    testCases: [
      { input: [{ __treeNode: [1, 2, 3, 4, 5] }], expected: 3 },
      { input: [{ __treeNode: [1, 2] }], expected: 1 },
      { input: [{ __treeNode: [1] }], expected: 0 },
    ],
  },
  {
    slug: "balanced-binary-tree",
    title: "Balanced Binary Tree",
    difficulty: "easy",
    maangTags: ["Amazon", "Google", "Apple"],
    topicSlug: "trees",
    functionName: "isBalanced",
    description: `## Problem

Given the \`root\` of a binary tree, determine if it is height-balanced — at every node, the height difference between its left and right subtrees is at most 1.

## Example

\`\`\`
Input: root = [3,9,20,null,null,15,7]
Output: true
\`\`\`

## Senior interview angle

A naive solution recomputes height at every node (O(n²)). The O(n) version returns a sentinel (e.g. \`-1\`) from the height helper the instant an imbalance is found anywhere below, short-circuiting the rest of the tree instead of computing a full height it will never use. Stating that optimization unprompted is the signal that separates "solved it" from "solved it well."

## Pattern

\`Post-order height computation with early-exit sentinel\` — same shape as Diameter, with a fail-fast condition layered on top.`,
    starterCode: `${treeNodeDefinition}
/**
 * @param {TreeNode} root
 * @return {boolean}
 */
function isBalanced(root) {
  // Your code here
}`,
    testCases: [
      { input: [{ __treeNode: [3, 9, 20, null, null, 15, 7] }], expected: true },
      { input: [{ __treeNode: [1, 2, 2, 3, 3, null, null, 4, 4] }], expected: false },
      { input: [{ __treeNode: [] }], expected: true },
    ],
  },
  {
    slug: "same-tree",
    title: "Same Tree",
    difficulty: "easy",
    maangTags: ["Amazon", "Apple"],
    topicSlug: "trees",
    functionName: "isSameTree",
    description: `## Problem

Given the roots of two binary trees \`p\` and \`q\`, return \`true\` if they are structurally identical and every corresponding node has the same value.

## Example

\`\`\`
Input: p = [1,2,3], q = [1,2,3]
Output: true
\`\`\`

## Senior interview angle

Three-way check at every pair of nodes: both \`null\` (match), exactly one \`null\` (mismatch), or both present with equal \`.val\` and both subtrees recursively equal. Missing the "exactly one is null" case is the most common bug — it's easy to write a solution that crashes or silently misreads a shorter tree as matching.

## Pattern

\`Paired-tree recursion\` — walking two trees in lockstep; Subtree of Another Tree reuses this exact check as a helper.`,
    starterCode: `${treeNodeDefinition}
/**
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {boolean}
 */
function isSameTree(p, q) {
  // Your code here
}`,
    testCases: [
      { input: [{ __treeNode: [1, 2, 3] }, { __treeNode: [1, 2, 3] }], expected: true },
      { input: [{ __treeNode: [1, 2] }, { __treeNode: [1, null, 2] }], expected: false },
      { input: [{ __treeNode: [1, 2, 1] }, { __treeNode: [1, 1, 2] }], expected: false },
    ],
  },
  {
    slug: "subtree-of-another-tree",
    title: "Subtree of Another Tree",
    difficulty: "easy",
    maangTags: ["Amazon", "Meta", "Google"],
    topicSlug: "trees",
    functionName: "isSubtree",
    description: `## Problem

Given the roots of two binary trees \`root\` and \`subRoot\`, return \`true\` if there is a node in \`root\` such that the subtree rooted at that node is identical to \`subRoot\`.

## Example

\`\`\`
Input: root = [3,4,5,1,2], subRoot = [4,1,2]
Output: true
\`\`\`

## Senior interview angle

At every node in \`root\`, run the exact same-tree check from the previous problem against \`subRoot\`; if it doesn't match, recurse into \`root\`'s left and right children and try again. This is O(n·m) worst case (comparing at every node) — mention that a hashing/serialization approach can do better, but the direct recursive check is the expected baseline solution.

## Pattern

\`Recursive search + paired-tree comparison\` — composing Same Tree as a helper inside a tree-wide search, the first place in this topic where one problem's solution literally calls another's.`,
    starterCode: `${treeNodeDefinition}
/**
 * @param {TreeNode} root
 * @param {TreeNode} subRoot
 * @return {boolean}
 */
function isSubtree(root, subRoot) {
  // Your code here
}`,
    testCases: [
      { input: [{ __treeNode: [3, 4, 5, 1, 2] }, { __treeNode: [4, 1, 2] }], expected: true },
      { input: [{ __treeNode: [3, 4, 5, 1, 2, null, null, null, null, 0] }, { __treeNode: [4, 1, 2] }], expected: false },
      { input: [{ __treeNode: [1] }, { __treeNode: [1] }], expected: true },
    ],
  },
  {
    slug: "level-order-traversal",
    title: "Binary Tree Level Order Traversal",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta", "Apple"],
    topicSlug: "trees",
    functionName: "levelOrder",
    description: `## Problem

Given the \`root\` of a binary tree, return the values of its nodes as a list of levels — each level's values grouped into their own sub-array, from top to bottom.

## Example

\`\`\`
Input: root = [3,9,20,null,null,15,7]
Output: [[3],[9,20],[15,7]]
\`\`\`

## Senior interview angle

Standard BFS with a queue, but the trick is snapshotting \`queue.length\` at the start of each iteration of the outer loop before dequeuing — that's what separates "process one level's worth of nodes" from "process one node," since the queue keeps growing with the next level's nodes as you dequeue the current one.

## Pattern

\`BFS by level, queue-length snapshot\` — the first BFS-shaped problem in this topic; Binary Tree Right Side View and Zigzag Level Order (not in this topic's set) are direct extensions of the same snapshot trick.`,
    starterCode: `${treeNodeDefinition}
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
function levelOrder(root) {
  // Your code here
}`,
    testCases: [
      { input: [{ __treeNode: [3, 9, 20, null, null, 15, 7] }], expected: [[3], [9, 20], [15, 7]] },
      { input: [{ __treeNode: [1] }], expected: [[1]] },
      { input: [{ __treeNode: [] }], expected: [] },
    ],
  },
  {
    slug: "validate-bst",
    title: "Validate Binary Search Tree",
    difficulty: "medium",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "trees",
    functionName: "isValidBST",
    description: `## Problem

Given the \`root\` of a binary tree, determine if it is a valid binary search tree — every node's value must be strictly greater than all values in its left subtree and strictly less than all values in its right subtree.

## Example

\`\`\`
Input: root = [5,1,4,null,null,3,6]
Output: false
\`\`\`

## Senior interview angle

The bug almost everyone writes first: checking a node only against its immediate children (\`node.left.val < node.val < node.right.val\`), which misses violations further down — a right-subtree node can be smaller than a distant ancestor even while being larger than its immediate parent. The correct solution threads a \`(low, high)\` bound down through the recursion, tightening it on each branch, so every node is checked against every applicable ancestor, not just its parent.

## Pattern

\`Bounds-propagation recursion\` — passing accumulated constraints down through recursive calls, rather than checking only local, one-level relationships.`,
    starterCode: `${treeNodeDefinition}
/**
 * @param {TreeNode} root
 * @return {boolean}
 */
function isValidBST(root) {
  // Your code here
}`,
    testCases: [
      { input: [{ __treeNode: [2, 1, 3] }], expected: true },
      { input: [{ __treeNode: [5, 1, 4, null, null, 3, 6] }], expected: false },
      { input: [{ __treeNode: [1, 1] }], expected: false },
    ],
  },
  {
    slug: "kth-smallest-bst",
    title: "Kth Smallest Element in a BST",
    difficulty: "medium",
    maangTags: ["Google", "Amazon"],
    topicSlug: "trees",
    functionName: "kthSmallest",
    description: `## Problem

Given the \`root\` of a binary search tree and an integer \`k\`, return the \`k\`-th smallest value among all node values in the tree (1-indexed).

## Example

\`\`\`
Input: root = [5,3,6,2,4,null,null,1], k = 3
Output: 3
\`\`\`

## Senior interview angle

An in-order traversal of a BST visits nodes in sorted order — that single fact turns this into "in-order traversal, stop and return at the \`k\`-th value visited," with no sorting or auxiliary array required. Mention the follow-up: if the tree is modified frequently and \`kthSmallest\` is called repeatedly, augmenting each node with a subtree-size count answers each query in O(h) instead of O(k).

## Pattern

\`In-order traversal as a sorted sequence\` — the BST invariant that in-order = sorted order, which every BST-specific problem in this topic (this one and Validate BST) ultimately leans on.`,
    starterCode: `${treeNodeDefinition}
/**
 * @param {TreeNode} root
 * @param {number} k
 * @return {number}
 */
function kthSmallest(root, k) {
  // Your code here
}`,
    testCases: [
      { input: [{ __treeNode: [3, 1, 4, null, 2] }, 1], expected: 1 },
      { input: [{ __treeNode: [5, 3, 6, 2, 4, null, null, 1] }, 3], expected: 3 },
      { input: [{ __treeNode: [1] }, 1], expected: 1 },
    ],
  },
  {
    slug: "lowest-common-ancestor-bst",
    title: "Lowest Common Ancestor of a BST",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta"],
    topicSlug: "trees",
    functionName: "lowestCommonAncestor",
    description: `## Problem

Given the \`root\` of a binary search tree, and two nodes \`p\` and \`q\` in the tree (given here as standalone nodes carrying the values to search for — compare by \`.val\`, not by object identity), return their lowest common ancestor: the deepest node in the tree that has both \`p\` and \`q\` as descendants (a node can be a descendant of itself).

## Example

\`\`\`
Input: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8
Output: 6
\`\`\`

## Senior interview angle

Exploit the BST ordering instead of doing a general tree LCA (which would need full-tree search): starting at \`root\`, if both \`p.val\` and \`q.val\` are less than the current node's value, the LCA is somewhere in the left subtree; if both are greater, it's in the right subtree; the moment they're not both on the same side (including either one equaling the current node), the current node is the answer. This is O(h), not O(n).

## Pattern

\`BST-ordering-guided descent\` — using sort order to eliminate a branch entirely, the same idea Binary Search itself is built on, applied to tree structure instead of an array.`,
    starterCode: `${treeNodeDefinition}
/**
 * @param {TreeNode} root
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {TreeNode}
 */
function lowestCommonAncestor(root, p, q) {
  // Your code here
}`,
    testCases: [
      {
        // LCA(2, 8) is the root itself — treeToArray dehydrates the whole
        // subtree hanging off the returned node, which here is the full tree.
        input: [
          { __treeNode: [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5] },
          { __treeNode: [2] },
          { __treeNode: [8] },
        ],
        expected: [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5],
        resultType: "tree",
      },
      {
        // LCA(2, 4) is node 2 — its subtree is [2 -> left 0 (leaf), right 4 -> left 3, right 5].
        input: [
          { __treeNode: [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5] },
          { __treeNode: [2] },
          { __treeNode: [4] },
        ],
        expected: [2, 0, 4, null, null, 3, 5],
        resultType: "tree",
      },
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
    title: "Binary Tree Maximum Path Sum",
    difficulty: "hard",
    maangTags: ["Amazon", "Meta", "Google"],
    topicSlug: "trees",
    functionName: "maxPathSum",
    description: `## Problem

Given the \`root\` of a binary tree, return the maximum path sum of any non-empty path. A path is any sequence of nodes connected by edges, where each node appears at most once, and it does not need to pass through the root.

## Example

\`\`\`
Input: root = [-10,9,20,null,null,15,7]
Output: 42
\`\`\`

## Senior interview angle

Two different quantities are needed at every node, and conflating them is the classic bug: (1) the best sum "returnable" upward to a parent, which can only extend through **one** child (\`node.val + max(0, leftGain, rightGain)\`), since a path returned upward can't fork; and (2) the best sum "through" the node as a potential full path, which **can** use both children (\`node.val + max(0, leftGain) + max(0, rightGain)\`), tracked in a running global max but never returned to the caller. Clamping negative gains to \`0\` handles the case where including a child only hurts the sum.

## Pattern

\`Post-order recursion with two return channels\` — a value passed up for the caller to use, and a separate side-channel global tracking the true answer, since the two aren't the same quantity.`,
    starterCode: `${treeNodeDefinition}
/**
 * @param {TreeNode} root
 * @return {number}
 */
function maxPathSum(root) {
  // Your code here
}`,
    testCases: [
      { input: [{ __treeNode: [1, 2, 3] }], expected: 6 },
      { input: [{ __treeNode: [-10, 9, 20, null, null, 15, 7] }], expected: 42 },
      { input: [{ __treeNode: [-3] }], expected: -3 },
    ],
  },
  {
    slug: "serialize-deserialize-tree",
    title: "Serialize and Deserialize Binary Tree",
    difficulty: "hard",
    maangTags: ["Amazon", "Google", "Apple"],
    topicSlug: "trees",
    functionName: "Codec",
    description: `## Problem

Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work — you just need to ensure a binary tree can be serialized to a string, and that string can be deserialized back to the original tree structure.

Implement the \`Codec\` class:
- \`Codec()\` initializes the object.
- \`serialize(root)\` encodes a tree to a single string.
- \`deserialize(data)\` decodes your encoded string back to a tree.

## Example

\`\`\`
Input: root = [1,2,3,null,null,4,5]
serialize(root) -> (any string encoding you choose)
deserialize(that string) -> [1,2,3,null,null,4,5]
\`\`\`

## Senior interview angle

There's no fixed wire format — any encoding that survives a round trip is correct. The standard approach is a pre-order DFS that emits a sentinel (e.g. \`"#"\`) for \`null\` children, joined with a delimiter; \`deserialize\` then consumes that same token stream recursively in the same pre-order it was written, using \`"#"\` as the base case. BFS-based encodings work too, but pre-order is the one most candidates land on unprompted.

## Pattern

\`Encode/decode via a consistent traversal order\` — the traversal used to serialize must be the exact one used to deserialize; the topic's earlier traversals (in-order for BST properties, level-order for BFS grouping) reappear here as an encoding choice rather than an answer in themselves.`,
    starterCode: `class Codec {
  constructor() {
    // Your code here
  }

  /**
   * @param {TreeNode} root
   * @return {string}
   */
  serialize(root) {
    // Your code here
  }

  /**
   * @param {string} data
   * @return {TreeNode}
   */
  deserialize(data) {
    // Your code here
  }
}`,
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

### Step 2: Type-check standalone

Run: `npx tsc --noEmit`

Expected: no output, exit code 0. If `Codec` fails to satisfy `functionName: string` typing or any test case fails to satisfy `TestCase`, re-check the shapes above against Task 1's `types.ts` changes.

### Step 3: Add topic entry to `src/content/topics.ts`

The file currently ends with the `binary-search` entry (closing at line 106) followed by the closing `];` (line 107). Insert a new entry after `binary-search`'s closing `},` and before `];`:

```typescript
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
```

The full array (`topics`) should now have 7 entries. Do not modify the `foundationTopics`/`patternTopics` export logic below the array — it already derives correctly from `order`.

### Step 4: Wire up in `src/content/index.ts`

Current imports (lines 1-6):

```typescript
import { arrayProblems } from "./problems/arrays";
import { binarySearchProblems } from "./problems/binary-search";
import { linkedListProblems } from "./problems/linked-lists";
import { slidingWindowProblems } from "./problems/sliding-window";
import { stackProblems } from "./problems/stack";
import { twoPointerProblems } from "./problems/two-pointers";
```

Add the new import in alphabetical order (`trees` sorts after `stack`, before `two-pointers`):

```typescript
import { arrayProblems } from "./problems/arrays";
import { binarySearchProblems } from "./problems/binary-search";
import { linkedListProblems } from "./problems/linked-lists";
import { slidingWindowProblems } from "./problems/sliding-window";
import { stackProblems } from "./problems/stack";
import { treeProblems } from "./problems/trees";
import { twoPointerProblems } from "./problems/two-pointers";
```

Current `allProblems` array:

```typescript
const allProblems: Problem[] = [
  ...arrayProblems,
  ...twoPointerProblems,
  ...slidingWindowProblems,
  ...linkedListProblems,
  ...stackProblems,
  ...binarySearchProblems,
];
```

Add `...treeProblems` last, since `order: 7` is the highest so far:

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

Nothing else in the file changes.

### Step 5: Final type-check

Run: `npx tsc --noEmit`

Expected: no output, exit code 0.

### Step 6: Commit

```bash
git add src/content/problems/trees.ts src/content/topics.ts src/content/index.ts
git commit -m "Add Trees topic with 12 problems"
```

---

## After both tasks: browser smoke test (controller-run, not a subagent task)

Unlike the content-only Binary Search/Stack topics, this phase adds new runtime logic (`arrayToTree`, `treeToArray`, operation chaining) that only a real code execution proves end-to-end — the throwaway Node script in Task 1 verifies the tree functions in isolation, but not that the Worker actually wires them into a browser test run correctly. Before the final whole-branch review concludes, start the dev server (`npm run dev`) and, in a browser, submit a correct solution for at least:
- `invert-binary-tree` (exercises `resultType: "tree"` on a plain function return)
- `serialize-deserialize-tree` (exercises `"$prevOutput"` chaining, `skipOutputCheck`, and `operationResultTypes` together — the highest-risk new path)

confirming all test cases pass in the actual running app, not just under `tsc --noEmit`.

## Plan complete after Task 2.

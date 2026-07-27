# Trees Topic Design Spec

**Date:** 2026-07-27
**Status:** Approved
**Author:** Roushan + Claude Code

## Goal

Ship the fourth post-v1 curriculum expansion — the "Trees" pattern topic —
and extend the test harness with binary-tree hydration/dehydration, the
first genuinely new harness capability since the Linked Lists topic added
list support.

## Content scope

New topic `trees`, track `pattern`, `order: 7` (next global slot after
`binary-search`).

12 problems, in build/display order:

| # | Slug | Title | Difficulty | Entry point |
|---|------|-------|-----------|--------------|
| 1 | `invert-binary-tree` | Invert Binary Tree | easy | `invertTree` |
| 2 | `max-depth-binary-tree` | Maximum Depth of Binary Tree | easy | `maxDepth` |
| 3 | `diameter-binary-tree` | Diameter of Binary Tree | easy | `diameterOfBinaryTree` |
| 4 | `balanced-binary-tree` | Balanced Binary Tree | easy | `isBalanced` |
| 5 | `same-tree` | Same Tree | easy | `isSameTree` |
| 6 | `subtree-of-another-tree` | Subtree of Another Tree | easy | `isSubtree` |
| 7 | `level-order-traversal` | Binary Tree Level Order Traversal | medium | `levelOrder` |
| 8 | `validate-bst` | Validate Binary Search Tree | medium | `isValidBST` |
| 9 | `kth-smallest-bst` | Kth Smallest Element in a BST | medium | `kthSmallest` |
| 10 | `lowest-common-ancestor-bst` | Lowest Common Ancestor of a BST | medium | `lowestCommonAncestor` |
| 11 | `max-path-sum` | Binary Tree Maximum Path Sum | hard | `maxPathSum` |
| 12 | `serialize-deserialize-tree` | Serialize and Deserialize Binary Tree | hard | `Codec` (class) |

Difficulty spread is 6 easy / 4 medium / 2 hard — the topic's first hard
tier, matching its role as the pivot into recursion-heavy patterns. Each
problem follows the existing `Problem` content shape: markdown
`description`, `starterCode`, `functionName`, `testCases`, `maangTags`,
`difficulty`. `maangTags` values are drawn only from the actual
`MaangTag` union (`Google | Amazon | Apple | Netflix | Meta`) — confirmed
against `src/content/types.ts` directly before writing any test data, per
the lesson from the Binary Search topic's plan bug.

### Problem details

**1. `invert-binary-tree`** — `invertTree(root: TreeNode | null): TreeNode | null`
(LeetCode 226). Swap every node's left/right children, recursively.
- `{ input: [{ __treeNode: [4,2,7,1,3,6,9] }], expected: [4,7,2,9,6,3,1], resultType: "tree" }`
- `{ input: [{ __treeNode: [2,1,3] }], expected: [2,3,1], resultType: "tree" }`
- `{ input: [{ __treeNode: [] }], expected: [], resultType: "tree" }`

**2. `max-depth-binary-tree`** — `maxDepth(root: TreeNode | null): number`
(LeetCode 104). Recursive `1 + max(depth(left), depth(right))`, `0` for
`null`.
- `{ input: [{ __treeNode: [3,9,20,null,null,15,7] }], expected: 3 }`
- `{ input: [{ __treeNode: [1,null,2] }], expected: 2 }`
- `{ input: [{ __treeNode: [] }], expected: 0 }`

**3. `diameter-binary-tree`** — `diameterOfBinaryTree(root: TreeNode | null): number`
(LeetCode 543). Longest path between any two nodes, measured in edges;
computed as the max of `leftHeight + rightHeight` across all nodes during
a single post-order height computation.
- `{ input: [{ __treeNode: [1,2,3,4,5] }], expected: 3 }`
- `{ input: [{ __treeNode: [1,2] }], expected: 1 }`
- `{ input: [{ __treeNode: [1] }], expected: 0 }`

**4. `balanced-binary-tree`** — `isBalanced(root: TreeNode | null): boolean`
(LeetCode 110). At every node, `|height(left) - height(right)| <= 1`,
recursively, short-circuiting to `-1`/sentinel on imbalance for O(n).
- `{ input: [{ __treeNode: [3,9,20,null,null,15,7] }], expected: true }`
- `{ input: [{ __treeNode: [1,2,2,3,3,null,null,4,4] }], expected: false }`
- `{ input: [{ __treeNode: [] }], expected: true }`

**5. `same-tree`** — `isSameTree(p: TreeNode | null, q: TreeNode | null): boolean`
(LeetCode 100). Two independently hydrated trees; structural + value
equality, recursively.
- `{ input: [{ __treeNode: [1,2,3] }, { __treeNode: [1,2,3] }], expected: true }`
- `{ input: [{ __treeNode: [1,2] }, { __treeNode: [1,null,2] }], expected: false }`
- `{ input: [{ __treeNode: [1,2,1] }, { __treeNode: [1,1,2] }], expected: false }`

**6. `subtree-of-another-tree`** — `isSubtree(root: TreeNode | null, subRoot: TreeNode | null): boolean`
(LeetCode 572). For every node in `root`, check whether the subtree rooted
there is identical (via the same-tree check) to `subRoot`.
- `{ input: [{ __treeNode: [3,4,5,1,2] }, { __treeNode: [4,1,2] }], expected: true }`
- `{ input: [{ __treeNode: [3,4,5,1,2,null,null,null,null,0] }, { __treeNode: [4,1,2] }], expected: false }`
- `{ input: [{ __treeNode: [1] }, { __treeNode: [1] }], expected: true }`

**7. `level-order-traversal`** — `levelOrder(root: TreeNode | null): number[][]`
(LeetCode 102). BFS, grouping each level into its own sub-array. Return
type is a plain nested array — no dehydration needed, the function never
returns tree nodes.
- `{ input: [{ __treeNode: [3,9,20,null,null,15,7] }], expected: [[3],[9,20],[15,7]] }`
- `{ input: [{ __treeNode: [1] }], expected: [[1]] }`
- `{ input: [{ __treeNode: [] }], expected: [] }`

**8. `validate-bst`** — `isValidBST(root: TreeNode | null): boolean`
(LeetCode 98). Recursive bounds-checking (`low < node.val < high`,
propagating tightened bounds down each branch) — the standard trap being a
node-vs-immediate-children-only check, which this test set specifically
targets with case 2.
- `{ input: [{ __treeNode: [2,1,3] }], expected: true }`
- `{ input: [{ __treeNode: [5,1,4,null,null,3,6] }], expected: false }`
- `{ input: [{ __treeNode: [1,1] }], expected: false }`

**9. `kth-smallest-bst`** — `kthSmallest(root: TreeNode | null, k: number): number`
(LeetCode 230). In-order traversal of a BST yields sorted values;
return the `k`-th (1-indexed).
- `{ input: [{ __treeNode: [3,1,4,null,2] }, 1], expected: 1 }`
- `{ input: [{ __treeNode: [5,3,6,2,4,null,null,1] }, 3], expected: 3 }`
- `{ input: [{ __treeNode: [1] }, 1], expected: 1 }`

**10. `lowest-common-ancestor-bst`** — `lowestCommonAncestor(root: TreeNode, p: TreeNode, q: TreeNode): TreeNode`
(LeetCode 235). Exploit BST ordering: walk from root, branching toward
whichever side both `p.val` and `q.val` fall on, until they diverge (or one
equals the current node) — that node is the LCA. `p`/`q` hydrate as
**standalone single-node trees**, not references into `root` — see Harness
extension below for why, and note the problem statement instructs
comparing via `.val`, matching this standard technique. The returned
node is a real object from within the original `root` tree, still
attached to its real children, so `resultType: "tree"` dehydration
serializes the **entire subtree hanging off the returned node** via BFS —
not just the node's own value.
- `{ input: [{ __treeNode: [6,2,8,0,4,7,9,null,null,3,5] }, { __treeNode: [2] }, { __treeNode: [8] }], expected: [6,2,8,0,4,7,9,null,null,3,5], resultType: "tree" }`
- `{ input: [{ __treeNode: [6,2,8,0,4,7,9,null,null,3,5] }, { __treeNode: [2] }, { __treeNode: [4] }], expected: [2,0,4,null,null,3,5], resultType: "tree" }`
- `{ input: [{ __treeNode: [2,1] }, { __treeNode: [2] }, { __treeNode: [1] }], expected: [2,1], resultType: "tree" }`

**11. `max-path-sum`** — `maxPathSum(root: TreeNode | null): number`
(LeetCode 124). At each node during a post-order traversal, compute the
best downward single-branch sum to return to the parent (clamped at 0 to
discard negative branches), while tracking a global max across
`node.val + leftGain + rightGain` (a path allowed to bend through the
node, not returnable upward).
- `{ input: [{ __treeNode: [1,2,3] }], expected: 6 }`
- `{ input: [{ __treeNode: [-10,9,20,null,null,15,7] }], expected: 42 }`
- `{ input: [{ __treeNode: [-3] }], expected: -3 }`

**12. `serialize-deserialize-tree`** — `Codec` class (LeetCode 297).
- `serialize(root: TreeNode | null): string` — any encoding the student
  chooses.
- `deserialize(data: string): TreeNode | null` — must reconstruct a tree
  equivalent to the original from whatever `serialize` produced.
- Operations-based test case exercising the harness's new chaining
  mechanism (see below):
  ```
  operations: ["Codec", "serialize", "deserialize"]
  args: [[], [{ __treeNode: [1,2,3,null,null,4,5] }], ["$prevOutput"]]
  expected: [null, null, [1,2,3,null,null,4,5]]
  operationResultTypes: [null, null, "tree"]
  skipOutputCheck: [1]
  ```
  Op 1 (`serialize`)'s actual output feeds op 2 (`deserialize`) via
  `"$prevOutput"`; op 1's own output isn't checked (`skipOutputCheck: [1]`,
  forced to `null` on both sides); op 2's output is dehydrated via
  `operationResultTypes[2] = "tree"` and compared against the original
  tree's array form. This is a **round-trip assertion**, not a fixed
  wire-format assertion — any valid `serialize` encoding passes, matching
  the real problem's actual freedom.

## Harness extension

This phase adds binary-tree support to the operations-based/hydration
mechanism built for Linked Lists and Stack, fully additive — no existing
field, branch, or test case changes behavior.

### `src/content/types.ts`

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

Only `resultType`'s union grows (`"list" | "tree"`) and two new optional
fields are added. Every existing `TestCase` object remains valid as-is.

### `src/workers/code-runner.worker.ts`

**Hydration marker:** `{ __treeNode: (number | null)[] }`, values in
LeetCode's canonical level-order-with-nulls format (e.g.
`[3,9,20,null,null,15,7]`). `arrayToTree` builds the tree via BFS: each
non-null node consumes the next two array slots for its children; a
`null` entry consumes zero further slots (its "children" are never
emitted) — the same asymmetric rule LeetCode's own examples use, distinct
from a naive complete-binary-tree index formula.

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
```

**Dehydration:** `treeToArray` mirrors `listToArray`'s explicit-failure
philosophy — a returned value that is neither `null` nor `{val, left,
right}`-shaped throws, surfacing the real malformed value as a failed
test rather than silently mismatching.

```typescript
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

**`hydrate()` extension:** add one branch, alongside the existing
`isListNodeMarker`/`isCycleListMarker` checks:

```typescript
if (isTreeNodeMarker(value)) {
  return arrayToTree(value.__treeNode);
}
```

**Non-operations branch extension:** alongside the existing
`resultType === "list"` check:

```typescript
if (testCase.resultType === "list") {
  actual = listToArray(actual);
} else if (testCase.resultType === "tree") {
  actual = treeToArray(actual);
}
```

**Operations branch extension** (for `Codec`): the existing loop tracks
only a comparison-facing `outputs` array. Add a parallel `rawOutputs`
array holding each operation's real, undehydrated return value, used for
`"$prevOutput"` chaining and as the source for per-op dehydration:

```typescript
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
```

This is a strict superset of the current operations loop: when
`skipOutputCheck`/`operationResultTypes`/`"$prevOutput"` are absent (every
existing test case for `MinStack` and `TimeMap`), behavior is byte-for-byte
identical to today's implementation.

### Why `p`/`q` are standalone trees, not root references

`lowestCommonAncestor`'s canonical signature passes `p`/`q` as `TreeNode`
references that are physically part of `root`'s structure, so a reference
check (`node === p`) is a valid alternative to a value check. Supporting
that here would require hydrating `root` first, then searching it by value
to resolve `p`/`q` to the *same* object instances — a cross-argument
dependency `hydrate()` doesn't have today (it hydrates each argument
independently). Since this problem is BST-specific, the standard and
expected technique is a value comparison exploiting sort order, which does
not need reference identity. `p`/`q` are hydrated as ordinary standalone
single-node trees (`{ __treeNode: [5] }`); the problem description
explicitly instructs comparing via `.val`. Building cross-argument node
resolution for this one case would be disproportionate — noted here as a
deliberate, documented simplification rather than a gap.

## Files touched

- `src/content/types.ts` — extend `TestCase` (see above).
- `src/workers/code-runner.worker.ts` — add tree hydrate/dehydrate,
  extend the operations loop (see above).
- `src/content/problems/trees.ts` — new file, 12 problems.
- `src/content/topics.ts` — add `trees` topic entry.
- `src/content/index.ts` — wire up the new problems file (matches existing
  pattern for arrays/two-pointers/sliding-window/linked-lists/stack/
  binary-search).

No changes to `run-code.ts` or any UI component — the harness's public
shape (`RunResult`, `TestResult`) is unchanged; only `TestCase`'s
internal structure grows.

## Testing / validation plan

1. `npx tsc --noEmit` — type-check the new content and harness code.
2. Task-level and whole-branch subagent reviews (per established
   process), with the whole-branch reviewer specifically asked to
   hand-trace `arrayToTree`/`treeToArray` and the `Codec` chaining path
   against the worker source, the way the Binary Search topic's final
   review hand-traced `TimeMap`.
3. **Browser smoke test** (new for this phase — prior content-only topics
   skipped this since they touched no runtime code): after implementation,
   start the dev server and manually run at least the `invert-binary-tree`
   and `serialize-deserialize-tree` problems in the browser with a correct
   solution, confirming the new `resultType: "tree"` and `"$prevOutput"`/
   `operationResultTypes`/`skipOutputCheck` paths actually execute
   correctly at runtime, not just in the subagent reviewers' static
   reading of the diff.

## Out of scope (this phase)

- Further tree-adjacent topics (Trie, N-ary trees, threaded trees,
  self-balancing BSTs) — later roadmap phases (Trie is already a named
  phase).
- General-purpose node-reference resolution in the hydration mechanism
  (deliberately scoped out for `lowestCommonAncestor`, see above).
- Any UI changes to `ProblemWorkspace`, `ProblemMarkdown`, or dashboard
  components.
- Further generalizing `"$prevOutput"`/`operationResultTypes`/
  `skipOutputCheck` beyond what `Codec` needs (e.g. multi-step chains,
  chaining from more than one operation back) — add if a future topic
  actually needs it.

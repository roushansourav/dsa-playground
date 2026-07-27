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

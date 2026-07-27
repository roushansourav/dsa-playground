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

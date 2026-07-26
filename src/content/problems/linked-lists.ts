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

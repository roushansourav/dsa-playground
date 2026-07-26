import type { Problem } from "../types";

export const binarySearchProblems: Problem[] = [
  {
    slug: "binary-search",
    title: "Binary Search",
    difficulty: "easy",
    maangTags: ["Google", "Amazon", "Meta"],
    topicSlug: "binary-search",
    functionName: "binarySearch",
    description: `## Problem

Given an array of integers \`nums\` sorted in ascending order, and an integer \`target\`, return the index of \`target\` in \`nums\`, or \`-1\` if it is not present. Must run in **O(log n)** time.

## Example

\`\`\`
Input: nums = [-1,0,3,5,9,12], target = 9
Output: 4
\`\`\`

## Senior interview angle

The invariant that matters: \`left <= right\`, and after each comparison exactly one half is discarded — never re-scan a discarded half. State the loop's termination condition explicitly (\`left > right\` means "not found") rather than reasoning about it implicitly.

## Pattern

\`Binary search on a sorted array\` — the base case for every later "binary search on the answer" or "binary search on a rotated array" problem in this topic.`,
    starterCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function binarySearch(nums, target) {
  // Your code here
}`,
    testCases: [
      { input: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { input: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      { input: [[5], 5], expected: 0 },
      { input: [[], 5], expected: -1 },
    ],
  },
  {
    slug: "search-2d-matrix",
    title: "Search a 2D Matrix",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta", "Google"],
    topicSlug: "binary-search",
    functionName: "searchMatrix",
    description: `## Problem

Write an efficient algorithm that searches for a value \`target\` in an \`m x n\` integer matrix. Each row is sorted in ascending order, and the first integer of each row is greater than the last integer of the previous row — meaning the whole matrix, read row by row, is one sorted sequence. Return \`true\` if \`target\` exists in \`matrix\`, else \`false\`. Must run in **O(log(m * n))** time.

## Example

\`\`\`
Input: matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3
Output: true
\`\`\`

## Senior interview angle

Treat the matrix as a single flattened sorted array of length \`m * n\` and binary search it directly: for a flat index \`mid\`, \`row = Math.floor(mid / cols)\` and \`col = mid % cols\` recover the 2D position. This is the single-pass O(log(m*n)) solution, versus the weaker "binary search rows, then binary search within a row" approach.

## Pattern

\`Binary search over an implicit sorted sequence\` — the data doesn't need to literally be flat; if there is a total order and O(1) random access by index, binary search applies directly.`,
    starterCode: `/**
 * @param {number[][]} matrix
 * @param {number} target
 * @return {boolean}
 */
function searchMatrix(matrix, target) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            [1, 3, 5, 7],
            [10, 11, 16, 20],
            [23, 30, 34, 60],
          ],
          3,
        ],
        expected: true,
      },
      {
        input: [
          [
            [1, 3, 5, 7],
            [10, 11, 16, 20],
            [23, 30, 34, 60],
          ],
          13,
        ],
        expected: false,
      },
      { input: [[[1]], 1], expected: true },
      {
        input: [
          [
            [1, 3, 5, 7],
            [10, 11, 16, 20],
            [23, 30, 34, 60],
          ],
          16,
        ],
        expected: true,
      },
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
  {
    slug: "koko-eating-bananas",
    title: "Koko Eating Bananas",
    difficulty: "medium",
    maangTags: ["Google", "Amazon"],
    topicSlug: "binary-search",
    functionName: "minEatingSpeed",
    description: `## Problem

Koko has \`piles.length\` piles of bananas; the \`i\`-th pile has \`piles[i]\` bananas. She has \`h\` hours to eat all the bananas. Each hour she picks a pile and eats up to \`k\` bananas from it — if the pile has fewer than \`k\` bananas she finishes it and does not eat from another pile that hour. Return the minimum integer \`k\` such that she can eat all the bananas within \`h\` hours.

## Example

\`\`\`
Input: piles = [3,6,7,11], h = 8
Output: 4
\`\`\`

## Senior interview angle

This is **binary search on the answer**, not on the input array: the search space is the candidate eating speed \`k\`, ranging from \`1\` to \`Math.max(...piles)\`. For a given \`k\`, the hours required (\`sum(Math.ceil(pile / k))\` over all piles) is monotonically non-increasing as \`k\` grows — that monotonicity is exactly what binary search needs, and naming it explicitly is the tell that separates this pattern from a plain array search.

## Pattern

\`Binary search on the answer space\` — search over a monotonic predicate ("is speed k fast enough?") rather than over array positions; the same shape solves capacity-to-ship-packages-in-D-days and split-array-largest-sum.`,
    starterCode: `/**
 * @param {number[]} piles
 * @param {number} h
 * @return {number}
 */
function minEatingSpeed(piles, h) {
  // Your code here
}`,
    testCases: [
      { input: [[3, 6, 7, 11], 8], expected: 4 },
      { input: [[30, 11, 23, 4, 20], 5], expected: 30 },
      { input: [[30, 11, 23, 4, 20], 6], expected: 23 },
    ],
  },
  {
    slug: "search-rotated-array",
    title: "Search in Rotated Sorted Array",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta", "Apple"],
    topicSlug: "binary-search",
    functionName: "search",
    description: `## Problem

There is an integer array \`nums\` sorted in ascending order (with distinct values), rotated at some unknown pivot. Given the rotated \`nums\` and an integer \`target\`, return the index of \`target\` if it exists, or \`-1\` otherwise. Must run in **O(log n)** time.

## Example

\`\`\`
Input: nums = [4,5,6,7,0,1,2], target = 0
Output: 4
\`\`\`

## Senior interview angle

At each midpoint, at least one half (\`[left, mid]\` or \`[mid, right]\`) is guaranteed to be normally sorted, even though the whole array isn't. Determine which half is sorted by comparing \`nums[left]\` and \`nums[mid]\`, then check whether \`target\` falls within that sorted half's value range to decide which half to recurse into — this is the one extra decision layered on top of plain binary search.

## Pattern

\`Binary search on a rotated/pivoted array\` — identifying "which half is sorted" generalizes directly to Find Minimum in Rotated Sorted Array and Search in Rotated Sorted Array II (with duplicates).`,
    starterCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
  // Your code here
}`,
    testCases: [
      { input: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
      { input: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
      { input: [[1], 0], expected: -1 },
      { input: [[4, 5, 6, 7, 0, 1, 2], 5], expected: 1 },
    ],
  },
  {
    slug: "find-min-rotated",
    title: "Find Minimum in Rotated Sorted Array",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta"],
    topicSlug: "binary-search",
    functionName: "findMin",
    description: `## Problem

Given the rotated sorted array \`nums\` (ascending order, rotated at an unknown pivot, all values distinct), return the minimum element. Must run in **O(log n)** time.

## Example

\`\`\`
Input: nums = [3,4,5,1,2]
Output: 1
\`\`\`

## Senior interview angle

Compare \`nums[mid]\` to \`nums[right]\`, not \`nums[left]\` — \`nums[mid] > nums[right]\` means the rotation point (and the minimum) is strictly to the right of \`mid\`, so discard \`[left, mid]\`; otherwise the minimum is at or before \`mid\`, so discard \`(mid, right]\` while keeping \`mid\` itself as a candidate. Comparing against \`right\` instead of \`left\` is what keeps the invariant correct even when the array isn't rotated at all — that's a degenerate case of the same logic, not a special case to branch on.

## Pattern

\`Binary search on a rotated/pivoted array\` — same family as Search in Rotated Sorted Array, minus the target-comparison step.`,
    starterCode: `/**
 * @param {number[]} nums
 * @return {number}
 */
function findMin(nums) {
  // Your code here
}`,
    testCases: [
      { input: [[3, 4, 5, 1, 2]], expected: 1 },
      { input: [[4, 5, 6, 7, 0, 1, 2]], expected: 0 },
      { input: [[11, 13, 15, 17]], expected: 11 },
      { input: [[1]], expected: 1 },
    ],
  },
  {
    slug: "time-based-kv-store",
    title: "Time Based Key-Value Store",
    difficulty: "medium",
    maangTags: ["Amazon", "Apple", "Google"],
    topicSlug: "binary-search",
    functionName: "TimeMap",
    description: `## Problem

Design a time-based key-value store that can store multiple values for the same key at different timestamps, and retrieve the key's value at (or just before) a given timestamp.

Implement the \`TimeMap\` class:
- \`TimeMap()\` initializes the object.
- \`set(key, value, timestamp)\` stores the key \`key\` with the value \`value\` at the given \`timestamp\`.
- \`get(key, timestamp)\` returns the value associated with \`key\` at the largest \`timestamp_prev <= timestamp\`. If there are no values, returns \`""\`.

\`set\` is always called with strictly increasing \`timestamp\` values for the same key.

## Example

\`\`\`
Input:  ["TimeMap","set","get","get","set","get","get"]
        [[],["foo","bar",1],["foo",1],["foo",3],["foo","bar2",4],["foo",4],["foo",5]]
Output: [null,null,"bar","bar",null,"bar2","bar2"]
\`\`\`

## Senior interview angle

Because \`set\` timestamps arrive strictly increasing per key, each key's stored \`(timestamp, value)\` pairs are already sorted by timestamp — no extra sort step needed. \`get\` becomes binary search for the largest timestamp \`<= query\`, the same "find rightmost value satisfying a predicate" shape as plain binary search, applied to one key's list of pairs instead of a flat array. Naming that invariant explicitly is what turns an apparent "search a map of lists" design problem into a plain binary search problem.

## Pattern

\`Binary search inside a design problem\` — the class shell (state + API surface) is separate from the actual algorithmic content (binary search on one key's timestamp list); recognizing that separation is the interview skill, not the class boilerplate itself.`,
    starterCode: `class TimeMap {
  constructor() {
    // Your code here
  }

  /**
   * @param {string} key
   * @param {string} value
   * @param {number} timestamp
   * @return {void}
   */
  set(key, value, timestamp) {
    // Your code here
  }

  /**
   * @param {string} key
   * @param {number} timestamp
   * @return {string}
   */
  get(key, timestamp) {
    // Your code here
  }
}`,
    testCases: [
      {
        operations: ["TimeMap", "set", "get", "get", "set", "get", "get"],
        args: [
          [],
          ["foo", "bar", 1],
          ["foo", 1],
          ["foo", 3],
          ["foo", "bar2", 4],
          ["foo", 4],
          ["foo", 5],
        ],
        expected: [null, null, "bar", "bar", null, "bar2", "bar2"],
      },
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

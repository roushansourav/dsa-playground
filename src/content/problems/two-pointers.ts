import type { Problem } from "../types";

export const twoPointerProblems: Problem[] = [
  {
    slug: "valid-palindrome",
    title: "Valid Palindrome",
    difficulty: "easy",
    maangTags: ["Meta", "Amazon"],
    topicSlug: "two-pointers",
    functionName: "isPalindrome",
    description: `## Problem

Given a string \`s\`, return \`true\` if it is a palindrome after converting all uppercase letters to lowercase and removing all non-alphanumeric characters.

## Example

\`\`\`
Input: s = "A man, a plan, a canal: Panama"
Output: true
\`\`\`

## Pattern: Two Pointers

The canonical **two-pointer intro** — \`left\` and \`right\` converge toward the center.

Senior angle: skip invalid chars inline vs preprocess — discuss time/space trade-off.`,
    starterCode: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
  // Your code here
}`,
    testCases: [
      { input: ["A man, a plan, a canal: Panama"], expected: true },
      { input: ["race a car"], expected: false },
      { input: [" "], expected: true },
    ],
  },
  {
    slug: "two-sum-ii",
    title: "Two Sum II — Sorted Input",
    difficulty: "medium",
    maangTags: ["Google", "Amazon"],
    topicSlug: "two-pointers",
    functionName: "twoSumII",
    description: `## Problem

Given a **1-indexed** sorted array \`numbers\` and a \`target\`, return the indices (1-indexed) of two numbers that add to \`target\`.

Exactly one solution exists. Use **O(1)** extra space.

## Example

\`\`\`
Input: numbers = [2, 7, 11, 15], target = 9
Output: [1, 2]
\`\`\`

## Pattern: Opposite-End Two Pointers

When the array is sorted, move \`left\` or \`right\` based on whether the current sum is too small or too large — O(n).

Contrast with hash-map Two Sum to show you pick the tool based on constraints.`,
    starterCode: `/**
 * @param {number[]} numbers
 * @param {number} target
 * @return {number[]}
 */
function twoSumII(numbers, target) {
  // Your code here
}`,
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [1, 2] },
      { input: [[2, 3, 4], 6], expected: [1, 3] },
      { input: [[-1, 0], -1], expected: [1, 2] },
    ],
  },
  {
    slug: "three-sum",
    title: "3Sum",
    difficulty: "medium",
    maangTags: ["Google", "Meta", "Amazon"],
    topicSlug: "two-pointers",
    functionName: "threeSum",
    description: `## Problem

Given an integer array \`nums\`, return all unique triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j != k\` and they sum to zero.

## Example

\`\`\`
Input: nums = [-1, 0, 1, 2, -1, -4]
Output: [[-1, -1, 2], [-1, 0, 1]]
\`\`\`

## Pattern: Sort + Fix One + Two Pointers

O(n²) — sort, iterate anchor, two-pointer the remainder. **Duplicate skipping** is where seniors lose points.

Follow-up: 4Sum, k-Sum (reduce recursively).`,
    starterCode: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
  // Your code here
}`,
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
  {
    slug: "container-with-most-water",
    title: "Container With Most Water",
    difficulty: "medium",
    maangTags: ["Google", "Amazon", "Apple"],
    topicSlug: "two-pointers",
    functionName: "maxArea",
    description: `## Problem

Given \`height[i]\` representing vertical lines, find two lines that together with the x-axis form a container holding the **maximum amount of water**.

Return the maximum area.

## Example

\`\`\`
Input: height = [1, 8, 6, 2, 5, 4, 8, 3, 7]
Output: 49
\`\`\`

## Pattern: Greedy Two Pointers

Move the pointer at the **shorter** line inward — the shorter line is the bottleneck. O(n).

Senior follow-up: prove why greedy is optimal.`,
    starterCode: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {
  // Your code here
}`,
    testCases: [
      { input: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
      { input: [[1, 1]], expected: 1 },
      { input: [[4, 3, 2, 1, 4]], expected: 16 },
    ],
  },
  {
    slug: "trapping-rain-water",
    title: "Trapping Rain Water",
    difficulty: "hard",
    maangTags: ["Google", "Amazon", "Meta"],
    topicSlug: "two-pointers",
    functionName: "trap",
    description: `## Problem

Given \`height\` representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

## Example

\`\`\`
Input: height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
Output: 6
\`\`\`

## Pattern: Two Pointers (or Monotonic Stack)

Three solutions seniors should know:
1. Prefix max arrays — O(n) time, O(n) space
2. Two pointers — O(n) time, O(1) space ← target
3. Monotonic stack — O(n), different intuition

This is a frequent **hard** filter at Google/Meta.`,
    starterCode: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
  // Your code here
}`,
    testCases: [
      {
        input: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]],
        expected: 6,
      },
      { input: [[4, 2, 0, 3, 2, 5]], expected: 9 },
      { input: [[2, 0, 2]], expected: 2 },
    ],
  },
];

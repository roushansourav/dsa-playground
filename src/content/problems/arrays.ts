import type { Problem } from "../types";

export const arrayProblems: Problem[] = [
  {
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "easy",
    maangTags: ["Google", "Amazon", "Meta"],
    topicSlug: "arrays",
    functionName: "twoSum",
    description: `## Problem

Given an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers that add up to \`target\`.

You may assume each input has **exactly one** solution, and you may not use the same element twice.

## Example

\`\`\`
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
\`\`\`

## Constraints

- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`

## Senior interview angle

The brute-force O(n²) scan is the warm-up. The expected answer is **one pass with a hash map** — O(n) time, O(n) space. Interviewers watch for:
- Returning indices, not values
- Handling duplicate values correctly
- Discussing trade-offs vs sorting + two pointers (O(n log n), O(1) extra space)

## Pattern

\`Hash Map / Complement Lookup\` — store \`target - nums[i]\` as you scan.`,
    starterCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your code here
}`,
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] },
    ],
  },
  {
    slug: "contains-duplicate",
    title: "Contains Duplicate",
    difficulty: "easy",
    maangTags: ["Amazon", "Apple"],
    topicSlug: "arrays",
    functionName: "containsDuplicate",
    description: `## Problem

Given an integer array \`nums\`, return \`true\` if any value appears **at least twice**, otherwise return \`false\`.

## Example

\`\`\`
Input: nums = [1, 2, 3, 1]
Output: true
\`\`\`

## Senior interview angle

Three valid approaches — know all three and when to pick each:
1. **Set** — O(n) time, O(n) space (most common)
2. **Sort** — O(n log n), O(1) extra if in-place
3. **Bit tricks** — only for constrained domains

At senior level, mention early exit optimization and immutability concerns.`,
    starterCode: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function containsDuplicate(nums) {
  // Your code here
}`,
    testCases: [
      { input: [[1, 2, 3, 1]], expected: true },
      { input: [[1, 2, 3, 4]], expected: false },
      { input: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true },
    ],
  },
  {
    slug: "product-of-array-except-self",
    title: "Product of Array Except Self",
    difficulty: "medium",
    maangTags: ["Google", "Meta", "Amazon"],
    topicSlug: "arrays",
    functionName: "productExceptSelf",
    description: `## Problem

Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` equals the product of all elements except \`nums[i]\`.

You must solve it in **O(n)** time **without using division**.

## Example

\`\`\`
Input: nums = [1, 2, 3, 4]
Output: [24, 12, 8, 6]
\`\`\`

## Senior interview angle

Classic **prefix / suffix product** problem. The follow-up is always: "Can you do O(1) extra space?" (output array doesn't count).

Watch for zeros — they zero out entire prefix/suffix regions.`,
    starterCode: `/**
 * @param {number[]} nums
 * @return {number[]}
 */
function productExceptSelf(nums) {
  // Your code here
}`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: [24, 12, 8, 6] },
      { input: [[-1, 1, 0, -3, 3]], expected: [0, 0, 9, 0, 0] },
      { input: [[2, 3]], expected: [3, 2] },
    ],
  },
  {
    slug: "maximum-subarray",
    title: "Maximum Subarray (Kadane's)",
    difficulty: "medium",
    maangTags: ["Google", "Amazon", "Netflix"],
    topicSlug: "arrays",
    functionName: "maxSubArray",
    description: `## Problem

Given an integer array \`nums\`, find the contiguous subarray with the **largest sum** and return that sum.

## Example

\`\`\`
Input: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
Output: 6  (subarray [4, -1, 2, 1])
\`\`\`

## Senior interview angle

**Kadane's algorithm** — O(n) greedy DP. Senior candidates should:
- Explain why greedy works (optimal substructure)
- Handle all-negative arrays
- Extend to "return the subarray indices" without re-scanning

Bridges directly to **Dynamic Programming** track later.`,
    starterCode: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  // Your code here
}`,
    testCases: [
      { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { input: [[1]], expected: 1 },
      { input: [[5, 4, -1, 7, 8]], expected: 23 },
      { input: [[-1]], expected: -1 },
    ],
  },
  {
    slug: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "medium",
    maangTags: ["Google", "Meta", "Amazon"],
    topicSlug: "arrays",
    functionName: "mergeIntervals",
    description: `## Problem

Given an array of intervals \`intervals\` where \`intervals[i] = [start, end]\`, merge all overlapping intervals and return the result.

## Example

\`\`\`
Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
\`\`\`

## Senior interview angle

Sort by start, then linear merge — O(n log n). This problem appears constantly in calendar/scheduling system design follow-ups.

Senior tip: discuss **interval insertion** and **meeting rooms II** as natural extensions.`,
    starterCode: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function mergeIntervals(intervals) {
  // Your code here
}`,
    testCases: [
      {
        input: [[[1, 3], [2, 6], [8, 10], [15, 18]]],
        expected: [[1, 6], [8, 10], [15, 18]],
      },
      { input: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
      { input: [[[1, 4], [0, 4]]], expected: [[0, 4]] },
    ],
  },
];

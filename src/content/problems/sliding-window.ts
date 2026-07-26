import type { Problem } from "../types";

export const slidingWindowProblems: Problem[] = [
  {
    slug: "best-time-to-buy-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "easy",
    maangTags: ["Amazon", "Google", "Apple"],
    topicSlug: "sliding-window",
    functionName: "maxProfit",
    description: `## Problem

Given an array \`prices\` where \`prices[i]\` is the stock price on day \`i\`, return the **maximum profit** from one buy and one sell. You must buy before you sell.

## Example

\`\`\`
Input: prices = [7, 1, 5, 3, 6, 4]
Output: 5  (buy at 1, sell at 6)
\`\`\`

## Pattern: Sliding Window / Running Minimum

Track the minimum price seen so far; at each day compute \`price - minSoFar\`. O(n) one pass.

Also teachable as **Kadane's variant** — max subarray on price differences.`,
    starterCode: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
  // Your code here
}`,
    testCases: [
      { input: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { input: [[7, 6, 4, 3, 1]], expected: 0 },
      { input: [[2, 4, 1]], expected: 2 },
    ],
  },
  {
    slug: "longest-substring-without-repeating",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "medium",
    maangTags: ["Google", "Amazon", "Meta"],
    topicSlug: "sliding-window",
    functionName: "lengthOfLongestSubstring",
    description: `## Problem

Given a string \`s\`, return the length of the **longest substring** without repeating characters.

## Example

\`\`\`
Input: s = "abcabcbb"
Output: 3  ("abc")
\`\`\`

## Pattern: Variable-Size Sliding Window + Hash Set/Map

Expand \`right\`, shrink \`left\` when duplicate found. Track last-seen index for O(n) with map.

One of the **top 5** most asked string problems at MAANG.`,
    starterCode: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Your code here
}`,
    testCases: [
      { input: ["abcabcbb"], expected: 3 },
      { input: ["bbbbb"], expected: 1 },
      { input: ["pwwkew"], expected: 3 },
      { input: [""], expected: 0 },
    ],
  },
  {
    slug: "longest-repeating-character-replacement",
    title: "Longest Repeating Character Replacement",
    difficulty: "medium",
    maangTags: ["Google", "Meta"],
    topicSlug: "sliding-window",
    functionName: "characterReplacement",
    description: `## Problem

Given a string \`s\` and integer \`k\`, return the length of the longest substring containing the **same letter** after performing at most \`k\` character replacements.

## Example

\`\`\`
Input: s = "AABABBA", k = 1
Output: 4  ("AABA" or "ABBA")
\`\`\`

## Pattern: Sliding Window with Frequency Map

Window is valid when \`windowSize - maxFrequency <= k\`. Shrink when invalid.

Senior tip: you don't need the exact max freq on shrink — a stale max still gives correct answer.`,
    starterCode: `/**
 * @param {string} s
 * @param {number} k
 * @return {number}
 */
function characterReplacement(s, k) {
  // Your code here
}`,
    testCases: [
      { input: ["AABABBA", 1], expected: 4 },
      { input: ["ABAB", 2], expected: 4 },
      { input: ["AAAA", 2], expected: 4 },
    ],
  },
  {
    slug: "minimum-window-substring",
    title: "Minimum Window Substring",
    difficulty: "hard",
    maangTags: ["Google", "Meta", "Amazon"],
    topicSlug: "sliding-window",
    functionName: "minWindow",
    description: `## Problem

Given strings \`s\` and \`t\`, return the **minimum window substring** of \`s\` such that every character in \`t\` (including duplicates) is included. Return \`""\` if none exists.

## Example

\`\`\`
Input: s = "ADOBECODEBANC", t = "ABC"
Output: "BANC"
\`\`\`

## Pattern: Sliding Window + Frequency Map

Expand until valid, shrink to minimize. Track \`formed\` vs \`required\` character counts.

**Hard-tier staple** — tests map management under pressure.`,
    starterCode: `/**
 * @param {string} s
 * @param {string} t
 * @return {string}
 */
function minWindow(s, t) {
  // Your code here
}`,
    testCases: [
      { input: ["ADOBECODEBANC", "ABC"], expected: "BANC" },
      { input: ["a", "a"], expected: "a" },
      { input: ["a", "aa"], expected: "" },
    ],
  },
  {
    slug: "sliding-window-maximum",
    title: "Sliding Window Maximum",
    difficulty: "hard",
    maangTags: ["Google", "Amazon", "Netflix"],
    topicSlug: "sliding-window",
    functionName: "maxSlidingWindow",
    description: `## Problem

Given an array \`nums\` and window size \`k\`, return the maximum value in each sliding window.

## Example

\`\`\`
Input: nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3
Output: [3, 3, 5, 5, 6, 7]
\`\`\`

## Pattern: Monotonic Deque inside Sliding Window

Maintain a deque of **indices** with decreasing values. Front is always the window max.

O(n) — each element pushed/popped once. Classic **hard** that separates L5 candidates.`,
    starterCode: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
function maxSlidingWindow(nums, k) {
  // Your code here
}`,
    testCases: [
      {
        input: [[1, 3, -1, -3, 5, 3, 6, 7], 3],
        expected: [3, 3, 5, 5, 6, 7],
      },
      { input: [[1], 1], expected: [1] },
      { input: [[1, -1], 1], expected: [1, -1] },
    ],
  },
];

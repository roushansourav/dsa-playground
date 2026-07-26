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

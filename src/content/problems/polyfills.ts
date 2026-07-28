import type { Problem } from "../types";

export const polyfillProblems: Problem[] = [
  {
    slug: "array-map-polyfill",
    title: "Array.prototype.map Polyfill",
    difficulty: "easy",
    maangTags: ["Meta", "Google", "Amazon"],
    topicSlug: "polyfills",
    functionName: "arrayMap",
    description: `## Problem

Implement \`Array.prototype.map\` from scratch. Given an array \`arr\` and a callback \`fn\`, return a new array where each element is the result of calling \`fn(element, index, arr)\`.

Do **not** use the built-in \`Array.prototype.map\`.

## Example

\`\`\`
Input: arr = [1, 2, 3], fn = (x) => x * 2
Output: [2, 4, 6]
\`\`\`

## Constraints

- \`arr\` is a valid JavaScript array.
- \`fn\` receives \`(currentValue, index, originalArray)\`.
- Must return a new array of the same length.

## Senior interview angle

Map is a pure transform — it never mutates, always returns a same-length array. The callback signature is \`(element, index, array)\`. State this explicitly; interviewers will probe whether you remember the full arity, and occasionally ask about the optional \`thisArg\` parameter.

## Pattern

\`Array iteration polyfill\` — the mental model for all five core iteration polyfills (map, filter, reduce, forEach, find): iterate with a plain \`for\` loop, apply the callback with the correct arity, accumulate or act on the result.`,
    starterCode: `/**
 * @param {any[]} arr
 * @param {Function} fn
 * @return {any[]}
 */
function arrayMap(arr, fn) {
  // Your code here
}`,
    testCases: [
      { input: [[1, 2, 3], (x: number) => x * 2], expected: [2, 4, 6] },
      { input: [[1, 2, 3], (x: number, i: number) => x + i], expected: [1, 3, 5] },
      { input: [[], (x: number) => x], expected: [] },
      { input: [["a", "b", "c"], (x: string) => x.toUpperCase()], expected: ["A", "B", "C"] },
    ],
    solutions: [
      {
        approach: "For-Loop Implementation",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Iterate the array with a plain indexed `for` loop, call the callback with `(element, index, arr)`, and push the result into a new accumulator array. Returning the accumulator without mutating `arr` is the key contract.",
        code: `function arrayMap(arr, fn) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i], i, arr));
  }
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`const result = []\` | Allocate a fresh array — map never mutates the input. |
| 4 | \`fn(arr[i], i, arr)\` | Full three-argument signature: value, index, original array. |
| 6 | \`return result\` | Always returns a new array of the same length as the input. |`,
        dryRunMarkdown: `**Dry run** — \`arr=[1,2,3], fn=(x)=>x*2\`:
i=0: fn(1,0,[1,2,3])=2 → result=[2].
i=1: fn(2,1,[1,2,3])=4 → result=[2,4].
i=2: fn(3,2,[1,2,3])=6 → result=[2,4,6].
Return **[2,4,6]** — matches expected.`,
      },
    ],
    relatedSlugs: ["array-filter-polyfill", "array-reduce-polyfill", "array-foreach-polyfill"],
    realWorldUsageMarkdown: `\`Array.prototype.map\` is the backbone of every data-transformation pipeline in JavaScript — rendering lists in React, transforming API responses before storing them, or producing a new array of keys from an array of objects. Understanding the polyfill clarifies exactly what map guarantees: no mutation, same length, full callback arity.`,
  },
  {
    slug: "array-filter-polyfill",
    title: "Array.prototype.filter Polyfill",
    difficulty: "easy",
    maangTags: ["Meta", "Google", "Amazon"],
    topicSlug: "polyfills",
    functionName: "arrayFilter",
    description: `## Problem

Implement \`Array.prototype.filter\` from scratch. Given an array \`arr\` and a predicate \`fn\`, return a new array containing only the elements for which \`fn(element, index, arr)\` returns a truthy value.

Do **not** use the built-in \`Array.prototype.filter\`.

## Example

\`\`\`
Input: arr = [1, 2, 3, 4, 5], fn = (x) => x % 2 === 0
Output: [2, 4]
\`\`\`

## Constraints

- The returned array must preserve the original relative order.
- The callback receives \`(currentValue, index, originalArray)\`.

## Senior interview angle

Filter preserves order and only keeps elements — the result can be shorter than the input (unlike map). The predicate is truthy/falsy, not strictly boolean; a common follow-up is "what if the callback returns \`0\` or \`null\`?" — both are falsy and correctly excluded.

## Pattern

\`Array iteration polyfill\` — iterate, test the predicate, conditionally push. Same three-argument callback arity as map.`,
    starterCode: `/**
 * @param {any[]} arr
 * @param {Function} fn
 * @return {any[]}
 */
function arrayFilter(arr, fn) {
  // Your code here
}`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], (x: number) => x % 2 === 0], expected: [2, 4] },
      { input: [[1, 2, 3], (x: number) => x > 10], expected: [] },
      { input: [["apple", "banana", "cherry"], (s: string) => s.length > 5], expected: ["banana", "cherry"] },
      { input: [[false, 0, null, 1, "hi"], (x: unknown) => Boolean(x)], expected: [1, "hi"] },
    ],
    solutions: [
      {
        approach: "For-Loop with Conditional Push",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Iterate with a plain `for` loop. Call the predicate with the full three-argument signature. Only push to the result array when the predicate returns truthy. Return the result — it may be shorter than `arr`.",
        code: `function arrayFilter(arr, fn) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (fn(arr[i], i, arr)) {
      result.push(arr[i]);
    }
  }
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4 | \`if (fn(arr[i], i, arr))\` | Truthy check — \`0\`, \`null\`, \`""\`, \`false\`, \`undefined\`, and \`NaN\` all cause the element to be skipped. |
| 5 | \`result.push(arr[i])\` | Push the original element (not the return value of \`fn\`, which is filter's key difference from map). |`,
        dryRunMarkdown: `**Dry run** — \`arr=[1,2,3,4,5], fn=(x)=>x%2===0\`:
i=0(1): fn=false → skip. i=1(2): fn=true → push. i=2(3): fn=false → skip. i=3(4): fn=true → push. i=4(5): fn=false → skip.
Return **[2,4]** — matches expected.`,
      },
    ],
    relatedSlugs: ["array-map-polyfill", "array-reduce-polyfill", "array-find-polyfill"],
    realWorldUsageMarkdown: `\`Array.prototype.filter\` is used any time you need a subset of an array — filtering active users from a full list, removing null/undefined values from API response fields, or narrowing a list of items by a search string. The polyfill clarifies that filter never mutates and never changes element order.`,
  },
  {
    slug: "array-reduce-polyfill",
    title: "Array.prototype.reduce Polyfill",
    difficulty: "medium",
    maangTags: ["Meta", "Google", "Amazon"],
    topicSlug: "polyfills",
    functionName: "arrayReduce",
    description: `## Problem

Implement \`Array.prototype.reduce\` from scratch. Given an array \`arr\`, a callback \`fn(accumulator, currentValue, index, array)\`, and an optional \`initialValue\`, fold the array into a single value.

If \`initialValue\` is provided, start from \`arr[0]\` with the accumulator equal to \`initialValue\`.
If \`initialValue\` is **not** provided, use \`arr[0]\` as the initial accumulator and start iteration from \`arr[1]\`. Calling reduce on an empty array with no initial value must throw a \`TypeError\`.

Do **not** use the built-in \`Array.prototype.reduce\`.

## Example

\`\`\`
Input: arr = [1, 2, 3, 4], fn = (acc, x) => acc + x, initialValue = 0
Output: 10
\`\`\`

## Constraints

- The callback receives \`(accumulator, currentValue, index, originalArray)\`.
- Must handle the no-\`initialValue\` case correctly.
- Must throw \`TypeError\` on empty array with no initial value.

## Senior interview angle

Reduce is the single hardest of the five iteration polyfills because of the two-branch initialValue logic. State both branches before coding: "if \`initialValue\` is present, accumulator starts as \`initialValue\` and we iterate from index 0; if absent, accumulator starts as \`arr[0]\` and we iterate from index 1." Forgetting to throw on empty-array-no-initial is the most common miss.

## Pattern

\`Array iteration polyfill\` — the fold primitive. Every other iteration method (map, filter, forEach) can be implemented in terms of reduce, which is the insight interviewers probe with "can you implement map using reduce?"`,
    starterCode: `/**
 * @param {any[]} arr
 * @param {Function} fn
 * @param {any} [initialValue]
 * @return {any}
 */
function arrayReduce(arr, fn, initialValue) {
  // Your code here
}`,
    testCases: [
      { input: [[1, 2, 3, 4], (acc: number, x: number) => acc + x, 0], expected: 10 },
      { input: [[1, 2, 3, 4], (acc: number, x: number) => acc + x], expected: 10 },
      { input: [["a", "b", "c"], (acc: string, x: string) => acc + x, ""], expected: "abc" },
      { input: [[5], (acc: number, x: number) => acc * x], expected: 5 },
    ],
    solutions: [
      {
        approach: "Two-Branch Accumulator Loop",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Handle the two initialValue branches explicitly: if provided, set `acc = initialValue` and start at index 0; if absent, guard for an empty array (throw `TypeError`), then set `acc = arr[0]` and start at index 1. After that, the loop is identical in both branches.",
        code: `function arrayReduce(arr, fn, initialValue) {
  const hasInitial = arguments.length >= 3;
  if (!hasInitial && arr.length === 0) {
    throw new TypeError("Reduce of empty array with no initial value");
  }

  let acc = hasInitial ? initialValue : arr[0];
  let startIndex = hasInitial ? 0 : 1;

  for (let i = startIndex; i < arr.length; i++) {
    acc = fn(acc, arr[i], i, arr);
  }
  return acc;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`arguments.length >= 3\` | Distinguishes \`reduce(arr, fn, undefined)\` (initial value explicitly passed as \`undefined\`) from \`reduce(arr, fn)\` (no third argument). Checking \`initialValue !== undefined\` would incorrectly treat the former as "no initial value." |
| 3-5 | TypeError guard | Spec-required: reduces over an empty array with no accumulator to start from is undefined behavior. |
| 7-8 | branch | The only difference between the two cases is the starting accumulator and starting index. |
| 11 | \`fn(acc, arr[i], i, arr)\` | Full four-argument callback: accumulator, current value, current index, full array. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,3,4], (acc,x)=>acc+x, 0\`:
hasInitial=true, acc=0, startIndex=0.
i=0: acc=fn(0,1,0,[...])=1. i=1: acc=fn(1,2,1,[...])=3. i=2: acc=fn(3,3,2,[...])=6. i=3: acc=fn(6,4,3,[...])=10.
Return **10** — matches expected.

**Dry run 2** — \`[1,2,3,4], (acc,x)=>acc+x\` (no initial):
hasInitial=false, arr.length=4>0. acc=arr[0]=1, startIndex=1.
i=1: acc=fn(1,2,1)=3. i=2: acc=fn(3,3,2)=6. i=3: acc=fn(6,4,3)=10.
Return **10** — matches expected.`,
      },
    ],
    relatedSlugs: ["array-map-polyfill", "array-filter-polyfill", "array-foreach-polyfill"],
    realWorldUsageMarkdown: `\`Array.prototype.reduce\` is the universal fold — used to sum arrays, build objects from arrays, flatten nested structures, and implement map/filter themselves. Understanding the polyfill clarifies the two-branch initialValue logic that trips up even experienced developers when they hit \`TypeError: Reduce of empty array\` in production.`,
  },
  {
    slug: "array-foreach-polyfill",
    title: "Array.prototype.forEach Polyfill",
    difficulty: "easy",
    maangTags: ["Meta", "Google"],
    topicSlug: "polyfills",
    functionName: "arrayForEach",
    description: `## Problem

Implement \`Array.prototype.forEach\` from scratch. Given an array \`arr\` and a callback \`fn\`, call \`fn(element, index, arr)\` for each element and return \`undefined\`.

Do **not** use the built-in \`Array.prototype.forEach\`.

## Example

\`\`\`
Input: arr = [1, 2, 3], fn = (x) => { side effects }
Output: undefined (side effects observed)
\`\`\`

## Constraints

- Must always return \`undefined\`.
- Any return value from \`fn\` is discarded.

## Senior interview angle

The key distinguishing property: forEach **always returns undefined** and the callback's return value is discarded. This is how it differs from map (which collects return values) — state this up front. A common follow-up is "how do you break out of forEach?" — you can't; it visits every element. Use a plain \`for\` loop or throw an exception (considered an anti-pattern) if early exit is needed.

## Pattern

\`Array iteration polyfill\` — the simplest of the five. forEach is forEach purely for side effects; there's no accumulation, no predicate, no new array.`,
    starterCode: `/**
 * @param {any[]} arr
 * @param {Function} fn
 * @return {undefined}
 */
function arrayForEach(arr, fn) {
  // Your code here
}`,
    testCases: [
      {
        input: [[1, 2, 3], (x: number, _i: number, _a: number[]) => x],
        expected: undefined,
        label: "returns undefined",
      },
      {
        input: [[], (x: number) => x],
        expected: undefined,
        label: "empty array",
      },
    ],
    solutions: [
      {
        approach: "For-Loop, Discard Return Value",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Iterate with a plain `for` loop and call the callback with the full three-argument signature. Do not collect the return value. Let the function implicitly return `undefined`.",
        code: `function arrayForEach(arr, fn) {
  for (let i = 0; i < arr.length; i++) {
    fn(arr[i], i, arr);
  }
  // implicit return undefined
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`fn(arr[i], i, arr)\` | Call with full arity; the return value is not captured. |
| 5 | no return statement | Functions without a return statement return \`undefined\` — this is the guaranteed contract of \`forEach\`. |`,
        dryRunMarkdown: `**Dry run** — \`arr=[1,2,3], fn=(x)=>sideEffect(x)\`:
i=0: fn(1,0,[1,2,3]) called. i=1: fn(2,1,[1,2,3]) called. i=2: fn(3,2,[1,2,3]) called.
Return **undefined** — matches expected.`,
      },
    ],
    relatedSlugs: ["array-map-polyfill", "array-filter-polyfill"],
    realWorldUsageMarkdown: `\`forEach\` is the standard way to iterate an array purely for side effects — logging, mutating external state, or triggering DOM updates — when you don't need a new array. Knowing it always returns \`undefined\` and can't break early helps you choose the right tool (a \`for…of\` loop instead) when early exit is needed.`,
  },
  {
    slug: "array-find-polyfill",
    title: "Array.prototype.find Polyfill",
    difficulty: "easy",
    maangTags: ["Meta", "Google", "Amazon"],
    topicSlug: "polyfills",
    functionName: "arrayFind",
    description: `## Problem

Implement \`Array.prototype.find\` from scratch. Given an array \`arr\` and a predicate \`fn\`, return the **first element** for which \`fn(element, index, arr)\` returns truthy. Return \`undefined\` if no element matches.

Do **not** use the built-in \`Array.prototype.find\`.

## Example

\`\`\`
Input: arr = [5, 12, 8, 130, 44], fn = (x) => x > 10
Output: 12
\`\`\`

## Constraints

- Return the element itself (not the index).
- Return \`undefined\` if no match is found.
- Stop as soon as the first match is found.

## Senior interview angle

\`find\` returns the **element** (not the index — that's \`findIndex\`). It short-circuits on the first truthy match and returns \`undefined\` (not \`-1\`, not \`null\`) on no match. Common follow-up: "what's the difference between \`find\` and \`findIndex\`?" — state it before they ask.

## Pattern

\`Array iteration polyfill\` — early-return variant. The short-circuit return distinguishes it from forEach.`,
    starterCode: `/**
 * @param {any[]} arr
 * @param {Function} fn
 * @return {any}
 */
function arrayFind(arr, fn) {
  // Your code here
}`,
    testCases: [
      { input: [[5, 12, 8, 130, 44], (x: number) => x > 10], expected: 12 },
      { input: [[1, 2, 3], (x: number) => x > 10], expected: undefined },
      { input: [[], (x: number) => x > 0], expected: undefined },
      { input: [[{ id: 1 }, { id: 2 }], (o: { id: number }) => o.id === 2], expected: { id: 2 } },
    ],
    solutions: [
      {
        approach: "For-Loop with Early Return",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Iterate with a plain `for` loop. Return the element immediately when the predicate fires. If the loop completes without a match, fall through and return `undefined` (implicit).",
        code: `function arrayFind(arr, fn) {
  for (let i = 0; i < arr.length; i++) {
    if (fn(arr[i], i, arr)) {
      return arr[i];
    }
  }
  return undefined;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`if (fn(arr[i], i, arr))\` | Truthy check — same as filter's predicate evaluation. |
| 4 | \`return arr[i]\` | Return the element itself, not \`true\` or the index. |
| 7 | \`return undefined\` | Explicit for clarity; functions implicitly return \`undefined\` anyway. |`,
        dryRunMarkdown: `**Dry run** — \`arr=[5,12,8,130,44], fn=(x)=>x>10\`:
i=0(5): 5>10? no. i=1(12): 12>10? yes → return **12** — matches expected.`,
      },
    ],
    relatedSlugs: ["array-findindex-polyfill", "array-filter-polyfill"],
    realWorldUsageMarkdown: `\`find\` is the go-to when you need one item from a collection — finding a user by ID, locating the first error in a validation result, or pulling out the first matching config entry. The polyfill makes the short-circuit-and-return-element contract explicit, clarifying why it's preferable to \`filter()[0]\` (which scans the whole array even after a match is found).`,
  },
  {
    slug: "array-findindex-polyfill",
    title: "Array.prototype.findIndex Polyfill",
    difficulty: "easy",
    maangTags: ["Meta", "Google"],
    topicSlug: "polyfills",
    functionName: "arrayFindIndex",
    description: `## Problem

Implement \`Array.prototype.findIndex\` from scratch. Given an array \`arr\` and a predicate \`fn\`, return the **index** of the first element for which \`fn(element, index, arr)\` returns truthy. Return \`-1\` if no element matches.

Do **not** use the built-in \`Array.prototype.findIndex\`.

## Example

\`\`\`
Input: arr = [5, 12, 8, 130, 44], fn = (x) => x > 10
Output: 1
\`\`\`

## Constraints

- Return the index (number), not the element.
- Return \`-1\` if no match found (not \`undefined\`).

## Senior interview angle

The twin of \`find\` — same predicate mechanics, but returns the index instead of the value, and returns \`-1\` on no-match instead of \`undefined\`. State the \`-1\` sentinel explicitly; it's different from \`find\`'s \`undefined\` and it's what \`indexOf\` also uses.

## Pattern

\`Array iteration polyfill\` — early-return index variant.`,
    starterCode: `/**
 * @param {any[]} arr
 * @param {Function} fn
 * @return {number}
 */
function arrayFindIndex(arr, fn) {
  // Your code here
}`,
    testCases: [
      { input: [[5, 12, 8, 130, 44], (x: number) => x > 10], expected: 1 },
      { input: [[1, 2, 3], (x: number) => x > 10], expected: -1 },
      { input: [[], (x: number) => x > 0], expected: -1 },
      { input: [[10, 20, 30], (x: number) => x === 20], expected: 1 },
    ],
    solutions: [
      {
        approach: "For-Loop with Early Index Return",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Iterate with a `for` loop, return the index `i` when the predicate first fires, return `-1` if the loop exhausts.",
        code: `function arrayFindIndex(arr, fn) {
  for (let i = 0; i < arr.length; i++) {
    if (fn(arr[i], i, arr)) {
      return i;
    }
  }
  return -1;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4 | \`return i\` | Return the index, not the element — this is the sole difference from \`find\`. |
| 7 | \`return -1\` | The standard "not found" sentinel for index-returning functions (\`indexOf\`, \`findIndex\`, \`lastIndexOf\` all use \`-1\`). |`,
        dryRunMarkdown: `**Dry run** — \`arr=[5,12,8,130,44], fn=(x)=>x>10\`:
i=0(5): 5>10? no. i=1(12): 12>10? yes → return **1** — matches expected.`,
      },
    ],
    relatedSlugs: ["array-find-polyfill", "array-filter-polyfill"],
    realWorldUsageMarkdown: `\`findIndex\` is the right tool when you need the position rather than the item itself — for splice operations, for tracking which item in a state array to update by index, or for checking "is this element anywhere in the array" when the elements aren't primitives (where \`indexOf\` with reference equality would fail on objects).`,
  },
  {
    slug: "array-every-polyfill",
    title: "Array.prototype.every Polyfill",
    difficulty: "easy",
    maangTags: ["Meta", "Google"],
    topicSlug: "polyfills",
    functionName: "arrayEvery",
    description: `## Problem

Implement \`Array.prototype.every\` from scratch. Given an array \`arr\` and a predicate \`fn\`, return \`true\` if \`fn(element, index, arr)\` returns truthy for **every** element, and \`false\` as soon as any element fails.

An empty array must return \`true\` (vacuous truth).

Do **not** use the built-in \`Array.prototype.every\`.

## Example

\`\`\`
Input: arr = [2, 4, 6], fn = (x) => x % 2 === 0
Output: true
\`\`\`

## Constraints

- Short-circuit and return \`false\` on the first failing element.
- Empty array → \`true\`.

## Senior interview angle

The vacuous truth on an empty array is the critical edge case — returning \`true\` for \`[]\` is mathematically correct ("there is no element that fails") and matches the spec. Pair \`every\` with \`some\` mentally: \`every\` short-circuits on \`false\`, \`some\` short-circuits on \`true\`.

## Pattern

\`Short-circuit boolean iteration\` — every and some are the boolean duals. Implement every as "return false early, then true at the end" and some as "return true early, then false at the end."`,
    starterCode: `/**
 * @param {any[]} arr
 * @param {Function} fn
 * @return {boolean}
 */
function arrayEvery(arr, fn) {
  // Your code here
}`,
    testCases: [
      { input: [[2, 4, 6], (x: number) => x % 2 === 0], expected: true },
      { input: [[2, 3, 6], (x: number) => x % 2 === 0], expected: false },
      { input: [[], (x: number) => x > 0], expected: true, label: "vacuous truth on empty" },
      { input: [[1], (x: number) => x > 0], expected: true },
    ],
    solutions: [
      {
        approach: "For-Loop with Early False Return",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Return `false` immediately when a predicate call fails. If the loop completes (including the empty-array case where it never runs), return `true`.",
        code: `function arrayEvery(arr, fn) {
  for (let i = 0; i < arr.length; i++) {
    if (!fn(arr[i], i, arr)) {
      return false;
    }
  }
  return true;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`if (!fn(...))\` | Negate the predicate — fail as soon as any element doesn't satisfy it. |
| 7 | \`return true\` | Reached only when every element passed (or the array was empty). |`,
        dryRunMarkdown: `**Dry run** — \`[2,4,6], (x)=>x%2===0\`:
i=0(2): 2%2===0? true → continue. i=1(4): true → continue. i=2(6): true → continue. Loop ends → return **true** — matches expected.`,
      },
    ],
    relatedSlugs: ["array-some-polyfill", "array-filter-polyfill"],
    realWorldUsageMarkdown: `\`every\` is used for validation: "are all fields filled in?", "do all items in this order have stock?", "is every response status 200?" — short-circuiting means it stops scanning the moment it finds a problem, which matters for large arrays or expensive predicates.`,
  },
  {
    slug: "array-some-polyfill",
    title: "Array.prototype.some Polyfill",
    difficulty: "easy",
    maangTags: ["Meta", "Google"],
    topicSlug: "polyfills",
    functionName: "arraySome",
    description: `## Problem

Implement \`Array.prototype.some\` from scratch. Given an array \`arr\` and a predicate \`fn\`, return \`true\` as soon as any element satisfies \`fn(element, index, arr)\`. Return \`false\` if no element ever does.

An empty array must return \`false\`.

Do **not** use the built-in \`Array.prototype.some\`.

## Example

\`\`\`
Input: arr = [1, 2, 3], fn = (x) => x > 2
Output: true
\`\`\`

## Constraints

- Short-circuit and return \`true\` on the first passing element.
- Empty array → \`false\`.

## Senior interview angle

The dual of \`every\`: where \`every\` short-circuits on false and returns true at the end, \`some\` short-circuits on true and returns false at the end. The empty array returns \`false\` (no element passed) — the opposite of \`every\`'s vacuous truth. State both edge cases as a pair.

## Pattern

\`Short-circuit boolean iteration\` — the boolean dual of every.`,
    starterCode: `/**
 * @param {any[]} arr
 * @param {Function} fn
 * @return {boolean}
 */
function arraySome(arr, fn) {
  // Your code here
}`,
    testCases: [
      { input: [[1, 2, 3], (x: number) => x > 2], expected: true },
      { input: [[1, 2, 3], (x: number) => x > 10], expected: false },
      { input: [[], (x: number) => x > 0], expected: false, label: "empty array is false" },
      { input: [[false, 0, null, 1], (x: unknown) => Boolean(x)], expected: true },
    ],
    solutions: [
      {
        approach: "For-Loop with Early True Return",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Return `true` immediately when a predicate call passes. If the loop exhausts without a match, return `false`.",
        code: `function arraySome(arr, fn) {
  for (let i = 0; i < arr.length; i++) {
    if (fn(arr[i], i, arr)) {
      return true;
    }
  }
  return false;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-5 | early true | Short-circuit the moment any element satisfies the predicate. |
| 7 | \`return false\` | No element ever passed (including empty array where the loop never ran). |`,
        dryRunMarkdown: `**Dry run** — \`[1,2,3], (x)=>x>2\`:
i=0(1): 1>2? no. i=1(2): 2>2? no. i=2(3): 3>2? yes → return **true** — matches expected.`,
      },
    ],
    relatedSlugs: ["array-every-polyfill", "array-find-polyfill"],
    realWorldUsageMarkdown: `\`some\` is used for "does any element match?" checks: "does the cart have any out-of-stock items?", "has any validation error fired?", "is any user an admin?" — it stops scanning the moment it finds a match, making it more efficient than \`filter().length > 0\` for large arrays.`,
  },
  {
    slug: "array-flat-polyfill",
    title: "Array.prototype.flat Polyfill",
    difficulty: "medium",
    maangTags: ["Google", "Meta"],
    topicSlug: "polyfills",
    functionName: "arrayFlat",
    description: `## Problem

Implement \`Array.prototype.flat\` from scratch. Given an array \`arr\` and an optional \`depth\` (default \`1\`), flatten nested arrays up to the given depth. Passing \`Infinity\` must fully flatten.

Do **not** use the built-in \`Array.prototype.flat\`.

## Example

\`\`\`
Input: arr = [1, [2, [3, [4]]]], depth = 2
Output: [1, 2, 3, [4]]
\`\`\`

## Constraints

- Default depth is \`1\`.
- \`depth = Infinity\` means fully flatten.
- Non-array elements are left as-is.

## Senior interview angle

The two-approach comparison is the interesting part: brute force rewrites as \`depth\` passes over the array; the optimal recursive approach tracks remaining depth as it descends. State the base cases: "if \`depth === 0\` or the element is not an array, push it as-is." The \`Infinity\` depth falls out naturally from the recursive check.

## Pattern

\`Recursive depth-bounded traversal\` — the depth parameter makes this more nuanced than most polyfills; it requires thinking about recursive state rather than just a loop.`,
    starterCode: `/**
 * @param {any[]} arr
 * @param {number} [depth=1]
 * @return {any[]}
 */
function arrayFlat(arr, depth = 1) {
  // Your code here
}`,
    testCases: [
      { input: [[1, [2, [3, [4]]]]], expected: [1, 2, [3, [4]]], label: "default depth 1" },
      { input: [[1, [2, [3, [4]]]], 2], expected: [1, 2, 3, [4]] },
      { input: [[1, [2, [3, [4]]]], Infinity], expected: [1, 2, 3, 4] },
      { input: [[[1], [2], [3]]], expected: [1, 2, 3] },
      { input: [[1, 2, 3]], expected: [1, 2, 3], label: "already flat" },
    ],
    solutions: [
      {
        approach: "Brute Force (Repeated Single-Level Flattening)",
        timeComplexity: "O(n × depth)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Run a single-level flatten pass exactly `depth` times. Each pass replaces every top-level array with its contents. Doesn't naturally handle `Infinity` depth without special-casing it.",
        code: `function arrayFlat(arr, depth = 1) {
  let result = [...arr];
  for (let d = 0; d < depth; d++) {
    const next = [];
    let flattened = false;
    for (const item of result) {
      if (Array.isArray(item)) {
        next.push(...item);
        flattened = true;
      } else {
        next.push(item);
      }
    }
    result = next;
    if (!flattened) break; // already fully flat
  }
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`for (let d = 0; d < depth; d++)\` | Run exactly \`depth\` flattening passes — one level per pass. |
| 8 | \`next.push(...item)\` | Spread the array one level into \`next\`. |
| 14 | \`if (!flattened) break\` | Early exit if a full pass made no change — already flat. |`,
        dryRunMarkdown: `**Dry run** — \`[1,[2,[3]]], depth=2\`:
Pass 1: [1] stays 1, [2,[3]] spreads to 2,[3] → result=[1,2,[3]].
Pass 2: 1 and 2 stay, [3] spreads to 3 → result=[1,2,3].
Return **[1,2,3]** — matches expected.`,
      },
      {
        approach: "Optimal (Recursive Depth Tracking)",
        timeComplexity: "O(n) total elements visited",
        spaceComplexity: "O(n + depth) stack",
        overviewMarkdown:
          "Recursively process the array. At each element, if it is an array and `depth > 0`, recurse with `depth - 1`; otherwise push it directly. `Infinity - 1 === Infinity`, so the `Infinity` case falls out naturally.",
        code: `function arrayFlat(arr, depth = 1) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      result.push(...arrayFlat(item, depth - 1));
    } else {
      result.push(item);
    }
  }
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4 | \`Array.isArray(item) && depth > 0\` | Only recurse if there's depth budget left — avoids over-flattening. |
| 5 | \`arrayFlat(item, depth - 1)\` | Consume one level of depth as we descend. \`Infinity - 1 === Infinity\` so full-flatten works naturally. |`,
        dryRunMarkdown: `**Dry run** — \`[1,[2,[3,[4]]]], depth=2\`:
item=1: not array → push 1.
item=[2,[3,[4]]]: array, depth=2>0 → recurse with depth=1.
  item=2: push 2. item=[3,[4]]: array, depth=1>0 → recurse with depth=0.
    item=3: push 3. item=[4]: array but depth=0 → push [4] as-is.
  → returns [3,[4]]. Spread into parent → [2,3,[4]].
Spread into root → result=[1,2,3,[4]].
Return **[1,2,3,[4]]** — matches expected.`,
      },
    ],
    relatedSlugs: ["array-flatmap-polyfill", "array-map-polyfill"],
    realWorldUsageMarkdown: `\`flat\` is used to normalize nested API responses, flatten categories-of-items into a single list, or process tree structures that arrive as nested arrays. Understanding depth tracking in the polyfill is directly applicable to any recursive tree-flattening problem.`,
  },
  {
    slug: "array-flatmap-polyfill",
    title: "Array.prototype.flatMap Polyfill",
    difficulty: "medium",
    maangTags: ["Google", "Meta"],
    topicSlug: "polyfills",
    functionName: "arrayFlatMap",
    description: `## Problem

Implement \`Array.prototype.flatMap\` from scratch. Given an array \`arr\` and a mapping callback \`fn\`, apply \`fn(element, index, arr)\` to each element and flatten the result by exactly **one level**. Equivalent to \`map\` followed by \`flat(1)\`, but in a single pass.

Do **not** use the built-in \`Array.prototype.flatMap\`.

## Example

\`\`\`
Input: arr = [1, 2, 3], fn = (x) => [x, x * 2]
Output: [1, 2, 2, 4, 3, 6]
\`\`\`

## Constraints

- Flatten only one level deep — always.
- Non-array callback return values are pushed directly (same as \`flat(1)\` behavior).

## Senior interview angle

\`flatMap\` is always exactly \`map\` + \`flat(1)\` — depth is not configurable. State this before coding. The implementation is a single pass (not map-then-flat over a new array), which is the efficiency argument: one allocation vs two. A common follow-up is "implement flatMap using reduce" — show that too.

## Pattern

\`Map + one-level flatten in a single pass\` — the combination that replaces the verbose \`[].concat(...arr.map(fn))\` idiom.`,
    starterCode: `/**
 * @param {any[]} arr
 * @param {Function} fn
 * @return {any[]}
 */
function arrayFlatMap(arr, fn) {
  // Your code here
}`,
    testCases: [
      { input: [[1, 2, 3], (x: number) => [x, x * 2]], expected: [1, 2, 2, 4, 3, 6] },
      { input: [["hello", "world"], (s: string) => s.split("")], expected: ["h", "e", "l", "l", "o", "w", "o", "r", "l", "d"] },
      { input: [[1, 2, 3], (x: number) => x], expected: [1, 2, 3], label: "scalar return, no flattening" },
      { input: [[[1, 2], [3, 4]], (a: number[]) => a], expected: [1, 2, 3, 4] },
    ],
    solutions: [
      {
        approach: "Single-Pass with Concat",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Iterate, apply the callback, and push either the array's contents (one level spread) or the scalar value directly. One allocation, one pass — no intermediate mapped array created.",
        code: `function arrayFlatMap(arr, fn) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const mapped = fn(arr[i], i, arr);
    if (Array.isArray(mapped)) {
      for (const item of mapped) {
        result.push(item);
      }
    } else {
      result.push(mapped);
    }
  }
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4 | \`const mapped = fn(...)\` | Apply the callback — result may be anything. |
| 5-8 | array branch | Spread one level by iterating the mapped array and pushing each element. |
| 9-11 | scalar branch | Non-array results go in directly — not further flattened. |`,
        dryRunMarkdown: `**Dry run** — \`[1,2,3], fn=(x)=>[x,x*2]\`:
i=0: mapped=[1,2] → push 1,2. i=1: mapped=[2,4] → push 2,4. i=2: mapped=[3,6] → push 3,6.
Return **[1,2,2,4,3,6]** — matches expected.`,
      },
    ],
    relatedSlugs: ["array-flat-polyfill", "array-map-polyfill", "array-reduce-polyfill"],
    realWorldUsageMarkdown: `\`flatMap\` is the clean replacement for \`[].concat(...arr.map(fn))\` — used to expand each item into zero or more results (tokenizing sentences into words, expanding a product with its variants, or filtering-and-transforming in one step by returning \`[]\` for items to skip).`,
  },
  {
    slug: "function-bind-polyfill",
    title: "Function.prototype.bind Polyfill",
    difficulty: "medium",
    maangTags: ["Meta", "Google", "Amazon"],
    topicSlug: "polyfills",
    functionName: "functionBind",
    description: `## Problem

Implement \`Function.prototype.bind\` from scratch. Given a function \`fn\`, a \`thisArg\`, and optional partial arguments \`...partialArgs\`, return a new function that, when called, invokes \`fn\` with \`this\` set to \`thisArg\` and any partial arguments prepended to the call arguments.

Do **not** use the built-in \`Function.prototype.bind\`.

## Example

\`\`\`
Input: fn = function(a, b) { return this.x + a + b; }, thisArg = { x: 10 }, partialArgs = [5]
// Returned bound function called with (3):
Output: 18   // 10 + 5 + 3
\`\`\`

## Constraints

- \`thisArg\` is the permanent \`this\` context.
- Partial arguments are prepended to any future call arguments.
- The returned function must work with the \`new\` operator (constructor binding is a bonus/follow-up).

## Senior interview angle

The two subtleties are: 1) partial application — prepend \`partialArgs\` to the live call's \`args\`, and 2) \`new\`-override behavior — when the bound function is used as a constructor, \`this\` should be the newly created object, not \`thisArg\`. For a frontend interview the core (partial args + fixed \`this\`) is the required scope; \`new\`-override is a follow-up stretch.

## Pattern

\`Closure over thisArg and partial args\` — the canonical closure-as-state pattern. The returned function closes over \`thisArg\` and \`partialArgs\` and uses \`Function.prototype.call\` (or \`apply\`) to set \`this\` on each invocation.`,
    starterCode: `/**
 * @param {Function} fn
 * @param {any} thisArg
 * @param {...any} partialArgs
 * @return {Function}
 */
function functionBind(fn, thisArg, ...partialArgs) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          function (this: { x: number }, a: number, b: number) { return this.x + a + b; },
          { x: 10 },
          5,
        ],
        expected: 18,
        label: "bind with thisArg and partial args, then call with (3)",
      },
      {
        input: [
          function (this: { name: string }) { return this.name; },
          { name: "Alice" },
        ],
        expected: "Alice",
        label: "bind thisArg only",
      },
      {
        input: [
          function (a: number, b: number, c: number) { return a + b + c; },
          null,
          1,
          2,
        ],
        expected: 6,
        label: "null thisArg, partial args (1,2), call with (3)",
      },
    ],
    solutions: [
      {
        approach: "Closure with apply",
        timeComplexity: "O(1) to create, O(n) per call where n = argument count",
        spaceComplexity: "O(k) where k = number of partial args",
        overviewMarkdown:
          "Capture `thisArg` and `partialArgs` in a closure. Return a new function that concatenates `partialArgs` with the live call arguments and invokes `fn` via `apply` to set `this`.",
        code: `function functionBind(fn, thisArg, ...partialArgs) {
  return function (...args) {
    return fn.apply(thisArg, [...partialArgs, ...args]);
  };
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`return function (...args)\` | Returns a new function — the bound function — that captures \`thisArg\` and \`partialArgs\`. |
| 3 | \`fn.apply(thisArg, [...])\` | \`apply\` sets \`this\` and accepts the argument list as an array. |
| 3 | \`[...partialArgs, ...args]\` | Partial arguments come first (left-to-right), then the live call arguments. |`,
        dryRunMarkdown: `**Dry run** — \`fn=(a,b)=>this.x+a+b, thisArg={x:10}, partialArgs=[5]\`:
Returned bound function. Called with (3):
args=[3]. fn.apply({x:10}, [5,3]). Inside fn: this.x=10, a=5, b=3 → 10+5+3=**18** — matches expected.`,
      },
    ],
    relatedSlugs: ["function-call-apply-polyfill"],
    realWorldUsageMarkdown: `\`bind\` is used to lock a function's \`this\` context (for event handlers, class methods passed as callbacks) and for partial application (creating a specialized version of a function with some arguments pre-filled). Understanding the polyfill clarifies exactly what "fixing \`this\`" means in JavaScript's late-binding model.`,
  },
  {
    slug: "function-call-apply-polyfill",
    title: "Function.prototype.call / apply Polyfill",
    difficulty: "medium",
    maangTags: ["Meta", "Google"],
    topicSlug: "polyfills",
    functionName: "functionCall",
    description: `## Problem

Implement \`Function.prototype.call\` from scratch as a standalone function \`functionCall(fn, thisArg, ...args)\`. It must invoke \`fn\` with \`this\` set to \`thisArg\` and the provided arguments.

Do **not** use \`Function.prototype.call\` or \`Function.prototype.apply\` in your implementation.

## Example

\`\`\`
Input: fn = function(a, b) { return this.x + a + b; }, thisArg = { x: 1 }, args = [2, 3]
Output: 6
\`\`\`

## Constraints

- If \`thisArg\` is \`null\` or \`undefined\`, \`this\` should default to the global object (or \`{}\` in strict mode).
- Do not use \`call\`, \`apply\`, or \`bind\` to invoke \`fn\`.

## Senior interview angle

The implementation trick is to temporarily attach \`fn\` as a property on \`thisArg\` — calling an object method sets \`this\` to that object — then delete it after the call. Use a unique key (Symbol or an improbable string like \`'__fn__'\`) to avoid colliding with existing properties. This is the "set \`this\` without using call/apply" pattern that shows you understand how method invocation establishes \`this\`.

## Pattern

\`Dynamic this via temporary property assignment\` — the underlying mechanism that proves you understand that \`this\` is determined by call-site, not definition-site.`,
    starterCode: `/**
 * @param {Function} fn
 * @param {any} thisArg
 * @param {...any} args
 * @return {any}
 */
function functionCall(fn, thisArg, ...args) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          function (this: { x: number }, a: number, b: number) { return this.x + a + b; },
          { x: 1 },
          2,
          3,
        ],
        expected: 6,
      },
      {
        input: [
          function (this: { name: string }) { return this.name.toUpperCase(); },
          { name: "hello" },
        ],
        expected: "HELLO",
      },
      {
        input: [() => 42, null],
        expected: 42,
        label: "arrow function ignores thisArg",
      },
    ],
    solutions: [
      {
        approach: "Temporary Property on thisArg",
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Temporarily assign `fn` as a property of `thisArg` (using a Symbol to avoid collisions), call it as a method (so `this === thisArg` inside the call), then delete the property and return the result.",
        code: `function functionCall(fn, thisArg, ...args) {
  // Normalize null/undefined to an empty object
  const ctx = (thisArg === null || thisArg === undefined) ? {} : Object(thisArg);

  // Use a Symbol to avoid overwriting existing properties
  const key = Symbol("fn");
  ctx[key] = fn;

  const result = ctx[key](...args);
  delete ctx[key];
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`Object(thisArg)\` | Wraps primitives (numbers, strings) in their object wrappers so property assignment works. |
| 6 | \`Symbol("fn")\` | A unique symbol — guaranteed not to collide with any existing property on \`ctx\`. |
| 7 | \`ctx[key] = fn\` | Attaching \`fn\` as a method of \`ctx\` means calling it with \`ctx[key]()\` sets \`this === ctx\`. |
| 9 | \`ctx[key](...args)\` | Method invocation — \`this\` is set to \`ctx\` by the call site, not by call/apply. |
| 10 | \`delete ctx[key]\` | Clean up — leave \`thisArg\` exactly as we found it. |`,
        dryRunMarkdown: `**Dry run** — \`fn=(a,b)=>this.x+a+b, thisArg={x:1}, args=[2,3]\`:
ctx={x:1}. key=Symbol. ctx[key]=fn. Call: ctx[key](2,3) → this={x:1}, returns 1+2+3=6. delete ctx[key]. ctx={x:1} (restored). Return **6** — matches expected.`,
      },
    ],
    relatedSlugs: ["function-bind-polyfill"],
    realWorldUsageMarkdown: `\`call\`/\`apply\` are used whenever you need to borrow a method from one object and run it against another — calling \`Array.prototype.slice.call(arguments)\` to convert an arguments object to an array, or invoking a mixin's method on a different class instance. The polyfill reveals that JavaScript's \`this\` is purely a call-site decision, not a lexical one.`,
  },
  {
    slug: "object-assign-polyfill",
    title: "Object.assign Polyfill",
    difficulty: "easy",
    maangTags: ["Meta", "Google", "Amazon"],
    topicSlug: "polyfills",
    functionName: "objectAssign",
    description: `## Problem

Implement \`Object.assign\` from scratch. Given a \`target\` object and one or more \`source\` objects, copy all **own enumerable** properties from each source onto \`target\` (left to right), and return \`target\`.

Do **not** use the built-in \`Object.assign\`.

## Example

\`\`\`
Input: target = { a: 1 }, sources = [{ b: 2 }, { c: 3 }]
Output: { a: 1, b: 2, c: 3 }   (target is mutated and returned)
\`\`\`

## Constraints

- Later sources overwrite earlier sources on key conflicts.
- Only own enumerable string-keyed properties are copied (skip inherited and non-enumerable).
- Primitives as sources are skipped (only objects have enumerable own properties).
- \`target\` is returned, mutated.

## Senior interview angle

Three edge cases to state up front: 1) sources are processed left-to-right (later sources win on conflicts), 2) only **own enumerable** properties (not inherited — use \`hasOwnProperty\` or \`for…in\` + \`hasOwnProperty\` check), 3) \`target\` is mutated and returned (not a new object). Symbol-keyed properties are copied by the native spec but acceptable to skip in an interview unless specifically asked.

## Pattern

\`Shallow copy / merge\` — the foundation for all "spread into a new object" patterns; \`{...a, ...b}\` is syntactic sugar for \`Object.assign({}, a, b)\`.`,
    starterCode: `/**
 * @param {Object} target
 * @param {...Object} sources
 * @return {Object}
 */
function objectAssign(target, ...sources) {
  // Your code here
}`,
    testCases: [
      { input: [{ a: 1 }, { b: 2 }, { c: 3 }], expected: { a: 1, b: 2, c: 3 } },
      { input: [{ a: 1, b: 2 }, { b: 3, c: 4 }], expected: { a: 1, b: 3, c: 4 }, label: "later source overwrites" },
      { input: [{}, { a: 1 }], expected: { a: 1 } },
      { input: [{ a: 1 }], expected: { a: 1 }, label: "no sources" },
    ],
    solutions: [
      {
        approach: "for…in with hasOwnProperty Guard",
        timeComplexity: "O(n × k) — n sources, k properties per source",
        spaceComplexity: "O(1) extra",
        overviewMarkdown:
          "Iterate over each source with `for…in`. Guard with `hasOwnProperty` to skip inherited properties. Copy each own enumerable key to `target`. Return `target`.",
        code: `function objectAssign(target, ...sources) {
  if (target === null || target === undefined) {
    throw new TypeError("Cannot convert undefined or null to object");
  }
  const to = Object(target);

  for (const source of sources) {
    if (source === null || source === undefined) continue;
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        to[key] = source[key];
      }
    }
  }
  return to;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-4 | null guard | Spec: throws if target is null/undefined — can't add properties to nothing. |
| 5 | \`Object(target)\` | Wraps primitives so property assignment works on them. |
| 7 | \`if (source === null || undefined) continue\` | Skip null/undefined sources silently (spec behavior). |
| 10 | \`hasOwnProperty.call(source, key)\` | \`for…in\` includes inherited enumerable properties; \`hasOwnProperty\` filters to own-only. |`,
        dryRunMarkdown: `**Dry run** — \`target={a:1}, sources=[{b:2},{c:3}]\`:
source={b:2}: key "b" is own → to.b=2. source={c:3}: key "c" is own → to.c=3.
target={a:1,b:2,c:3}. Return **{a:1,b:2,c:3}** — matches expected.`,
      },
    ],
    relatedSlugs: ["object-create-polyfill"],
    realWorldUsageMarkdown: `\`Object.assign\` is the imperative equivalent of object spread — used in Redux reducers (\`Object.assign({}, state, { loading: true })\`), merging config defaults with user options, and building composed objects from mixins. The polyfill clarifies that it's shallow (nested objects are copied by reference) and that it mutates the first argument.`,
  },
  {
    slug: "object-create-polyfill",
    title: "Object.create Polyfill",
    difficulty: "medium",
    maangTags: ["Meta", "Google"],
    topicSlug: "polyfills",
    functionName: "objectCreate",
    description: `## Problem

Implement \`Object.create\` from scratch. Given a \`proto\` object (or \`null\`), return a new object whose prototype (\`[[Prototype]]\`) is set to \`proto\`.

Do **not** use the built-in \`Object.create\`.

## Example

\`\`\`
Input: proto = { greet() { return "hello"; } }
// Returned object:
output.greet()  // "hello" — inherited via the prototype chain
Object.getPrototypeOf(output) === proto  // true
\`\`\`

## Constraints

- The returned object must have \`proto\` as its \`[[Prototype]]\`.
- If \`proto\` is \`null\`, the returned object has no prototype (bare object with no inherited \`toString\` etc.).
- The second \`propertiesObject\` parameter (property descriptors) is a bonus stretch.

## Senior interview angle

The classic polyfill uses a temporary empty constructor function, sets its \`prototype\`, and returns \`new F()\`. State why this works: \`new F()\` creates an object whose \`[[Prototype]]\` is \`F.prototype\`, and we've just set \`F.prototype = proto\`. This is the Beresford/Crockford pattern from before \`Object.create\` was widely available, and understanding it clarifies how the prototype chain really works.

## Pattern

\`Prototype chain manipulation\` — the polyfill that exposes exactly how JavaScript's object model connects constructor functions, \`prototype\` properties, and \`[[Prototype]]\` links.`,
    starterCode: `/**
 * @param {Object|null} proto
 * @return {Object}
 */
function objectCreate(proto) {
  // Your code here
}`,
    testCases: [
      {
        input: [{ greet() { return "hello"; } }],
        expected: "hello",
        label: "inherited method accessible on returned object",
      },
      {
        input: [null],
        expected: true,
        label: "null proto — Object.getPrototypeOf result is null",
      },
      {
        input: [Array.prototype],
        expected: true,
        label: "prototype chain set correctly",
      },
    ],
    solutions: [
      {
        approach: "Temporary Constructor Function (Crockford Pattern)",
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Create a temporary empty function `F`, assign `proto` to `F.prototype`, then return `new F()`. The `new` operator creates an object whose `[[Prototype]]` is `F.prototype` — which we've set to `proto`. For `proto === null`, use `__proto__ = null` assignment as a fallback (or modern environments support `Object.setPrototypeOf`).",
        code: `function objectCreate(proto) {
  if (proto !== null && typeof proto !== "object" && typeof proto !== "function") {
    throw new TypeError("Object prototype must be an Object or null");
  }

  function F() {}
  F.prototype = proto;
  const obj = new F();

  // Handle the null-prototype case
  if (proto === null) {
    obj.__proto__ = null;
  }

  return obj;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-4 | type guard | Spec: the prototype argument must be an object, a function, or \`null\`. |
| 6 | \`function F() {}\` | A throw-away constructor — its body doesn't matter, only its \`prototype\` property. |
| 7 | \`F.prototype = proto\` | This is the key line: \`new F()\` will create an object with \`[[Prototype]] === F.prototype === proto\`. |
| 11-13 | null proto | Browsers' \`new F()\` with \`F.prototype = null\` may fall back to \`Object.prototype\`; explicitly severing with \`__proto__ = null\` is the correct fix. |`,
        dryRunMarkdown: `**Dry run** — \`proto = { greet() { return "hello"; } }\`:
F.prototype = { greet(){...} }. new F() → obj created, obj.[[Prototype]] = F.prototype.
obj.greet() → walks prototype chain → finds greet on proto → return **"hello"** — matches expected.`,
      },
    ],
    relatedSlugs: ["object-assign-polyfill"],
    realWorldUsageMarkdown: `\`Object.create\` is the explicit prototype-assignment API — used for clean prototypal inheritance without constructors, for creating truly property-less objects (\`Object.create(null)\`) as safe hash maps, and as the foundation of the "parasitic combination inheritance" pattern that predated ES6 classes.`,
  },
  {
    slug: "promise-all-polyfill",
    title: "Promise.all Polyfill",
    difficulty: "hard",
    maangTags: ["Meta", "Google", "Amazon"],
    topicSlug: "polyfills",
    functionName: "promiseAll",
    description: `## Problem

Implement \`Promise.all\` from scratch. Given an array of promises (or values) \`promises\`, return a single Promise that:

- **Resolves** with an array of all resolved values (in the same order as the input) when **all** promises resolve.
- **Rejects** immediately with the reason of the first promise that rejects.

Do **not** use the built-in \`Promise.all\`.

## Example

\`\`\`
Input: [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]
Output: Promise resolves to [1, 2, 3]

Input: [Promise.resolve(1), Promise.reject("error"), Promise.resolve(3)]
Output: Promise rejects with "error"
\`\`\`

## Constraints

- Preserve the order of resolved values (index-based, not resolution-order).
- An empty array resolves to \`[]\`.
- Non-promise values are treated as already-resolved promises.

## Senior interview angle

Two subtleties: 1) **order preservation** — use the original index to store results, not arrival order; 2) **reject fast once** — once rejected, ignore any further resolutions or rejections (set a \`rejected\` flag or just rely on the outer promise being settled). Handling non-promise values via \`Promise.resolve(val)\` wrapping is the clean way to normalize the input.

## Pattern

\`Concurrent promise coordination\` — tracking a counter of pending resolutions is the core coordination primitive that also appears in \`Promise.allSettled\` and in custom rate-limited batch fetchers.`,
    starterCode: `/**
 * @param {Promise[]} promises
 * @return {Promise}
 */
function promiseAll(promises) {
  // Your code here
}`,
    testCases: [
      {
        input: [[Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]],
        expected: [1, 2, 3],
        label: "all resolve",
      },
      {
        input: [[]],
        expected: [],
        label: "empty array resolves to []",
      },
      {
        input: [[1, 2, 3]],
        expected: [1, 2, 3],
        label: "plain values treated as resolved",
      },
    ],
    solutions: [
      {
        approach: "Counter + Index-Based Result Array",
        timeComplexity: "O(n) setup, then async",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Create a result array pre-sized to the input length. Track a `pending` counter initialized to `promises.length`. On each resolution, store the value at its original index and decrement `pending`; when `pending` reaches 0, resolve the outer promise with the result array. On any rejection, reject the outer promise immediately.",
        code: `function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) {
      resolve([]);
      return;
    }

    const results = new Array(promises.length);
    let pending = promises.length;

    promises.forEach((promise, index) => {
      Promise.resolve(promise).then((value) => {
        results[index] = value;
        pending--;
        if (pending === 0) {
          resolve(results);
        }
      }).catch(reject);
    });
  });
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-5 | empty guard | Empty input resolves immediately to \`[]\`. |
| 8 | \`new Array(promises.length)\` | Pre-size so index assignment preserves order regardless of resolution timing. |
| 11 | \`Promise.resolve(promise)\` | Normalizes non-promise values (wraps them in an already-resolved promise). |
| 13 | \`results[index] = value\` | Store by index, not by arrival order — this is the order-preservation mechanism. |
| 15 | \`if (pending === 0) resolve(results)\` | All settled — resolve with the ordered results. |
| 17 | \`.catch(reject)\` | First rejection propagates immediately to the outer reject. |`,
        dryRunMarkdown: `**Dry run** — \`[Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]\`:
pending=3, results=[,,].
index0 resolves with 1: results=[1,,], pending=2.
index1 resolves with 2: results=[1,2,], pending=1.
index2 resolves with 3: results=[1,2,3], pending=0 → resolve([1,2,3]).
Outer promise resolves with **[1,2,3]** — matches expected.`,
      },
    ],
    relatedSlugs: ["promise-race-polyfill"],
    realWorldUsageMarkdown: `\`Promise.all\` is the standard way to fire multiple async operations (API calls, file reads, database queries) concurrently and wait for all of them — used whenever independent async work can be parallelized and you need all results before proceeding. The polyfill makes the fail-fast and order-preservation contracts explicit.`,
  },
  {
    slug: "promise-race-polyfill",
    title: "Promise.race Polyfill",
    difficulty: "medium",
    maangTags: ["Meta", "Google"],
    topicSlug: "polyfills",
    functionName: "promiseRace",
    description: `## Problem

Implement \`Promise.race\` from scratch. Given an array of promises (or values), return a Promise that settles (resolves or rejects) with the outcome of whichever promise settles **first**.

Do **not** use the built-in \`Promise.race\`.

## Example

\`\`\`
Input: [
  new Promise(res => setTimeout(() => res("slow"), 1000)),
  new Promise(res => setTimeout(() => res("fast"), 100)),
]
Output: Promise resolves with "fast"
\`\`\`

## Constraints

- The first settled promise (resolve or reject) determines the outcome — all others are ignored.
- Non-promise values are treated as immediately-resolved.
- An empty array leaves the returned promise forever pending (spec behavior).

## Senior interview angle

\`Promise.race\` is simpler than \`Promise.all\` — no counter, no result array. The outer promise is settled by whichever handler fires first; a JavaScript Promise can only be settled once, so subsequent resolutions/rejections are silently ignored. State this: "once the outer resolve or reject is called, it becomes a no-op — Promise settling is idempotent."

## Pattern

\`First-settler wins\` — the pattern behind timeout wrappers (\`Promise.race([fetch(...), timeout(5000)])\`) and cancellable operation primitives.`,
    starterCode: `/**
 * @param {Promise[]} promises
 * @return {Promise}
 */
function promiseRace(promises) {
  // Your code here
}`,
    testCases: [
      {
        input: [[Promise.resolve("first"), new Promise((res) => setTimeout(() => res("second"), 100))]],
        expected: "first",
        label: "already-resolved promise wins",
      },
      {
        input: [["value"]],
        expected: "value",
        label: "non-promise value resolves immediately",
      },
    ],
    solutions: [
      {
        approach: "Attach resolve/reject to every promise, first one wins",
        timeComplexity: "O(n) setup",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Attach both a resolve and a reject handler to every promise in the array. The outer promise will be settled by whichever fires first; all subsequent calls to `resolve` or `reject` are no-ops because a Promise can only be settled once.",
        code: `function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    for (const promise of promises) {
      Promise.resolve(promise).then(resolve).catch(reject);
    }
  });
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4 | \`Promise.resolve(promise)\` | Normalizes plain values to resolved promises. |
| 4 | \`.then(resolve).catch(reject)\` | Wire the outer settle functions directly — whichever fires first wins, and subsequent calls are silently dropped. |`,
        dryRunMarkdown: `**Dry run** — \`[Promise.resolve("first"), delayedPromise("second")]\`:
Both promises get \`.then(resolve)\` attached. \`Promise.resolve("first")\` is already settled — its \`.then\` fires synchronously (in microtask), calling \`resolve("first")\`. Outer promise settles as resolved "first". When delayedPromise later resolves with "second", \`resolve("second")\` is called but the outer promise is already settled — no-op.
Result: **"first"** — matches expected.`,
      },
    ],
    relatedSlugs: ["promise-all-polyfill"],
    realWorldUsageMarkdown: `\`Promise.race\` is the standard timeout pattern — racing a real async operation against a \`setTimeout\`-based timeout promise gives you a clean "fail after N ms" primitive. It's also used for cache-vs-network racing strategies (return whichever of the cached value or the fresh fetch arrives first).`,
  },
  {
    slug: "debounce-polyfill",
    title: "Debounce",
    difficulty: "medium",
    maangTags: ["Meta", "Google", "Amazon"],
    topicSlug: "polyfills",
    functionName: "debounce",
    description: `## Problem

Implement a \`debounce\` function. Given a function \`fn\` and a delay \`ms\`, return a debounced version that delays invoking \`fn\` until \`ms\` milliseconds have elapsed since the **last** call. Each new call within the delay window resets the timer.

## Example

\`\`\`
const debouncedFn = debounce(fn, 300);
debouncedFn("a"); // timer starts
debouncedFn("b"); // timer resets
debouncedFn("c"); // timer resets
// 300ms passes → fn("c") called once
\`\`\`

## Constraints

- Only the **last** call within a burst is actually executed.
- The debounced function should return a cancel method to clear the pending timer (bonus).

## Senior interview angle

The core insight: store the timer ID in a closure, call \`clearTimeout\` on every invocation before setting a new one. The common mistake is forgetting to capture the arguments from the *latest* call — if you close over \`args\` correctly (inside the returned function), the timeout callback always sees the most-recent call's arguments. A follow-up is "leading edge debounce" (fire on first call, suppress subsequent ones).

## Pattern

\`Timer management with closure\` — debounce and throttle are the two fundamental rate-limiting patterns in front-end engineering; they underlie every search-as-you-type input, scroll handler, and resize listener.`,
    starterCode: `/**
 * @param {Function} fn
 * @param {number} ms
 * @return {Function}
 */
function debounce(fn, ms) {
  // Your code here
}`,
    testCases: [
      {
        input: [(x: string) => x, 0],
        expected: "last",
        label: "returns debounced function that fires on final call",
      },
    ],
    solutions: [
      {
        approach: "Closure over timer ID",
        timeComplexity: "O(1) per call",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Close over a `timerId` variable. On every call, clear any existing timer and set a new one for `ms` milliseconds in the future. The timeout callback captures the current call's arguments via the closure.",
        code: `function debounce(fn, ms) {
  let timerId;

  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, ms);
  };
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`let timerId\` | Shared state across all calls — persists in the closure. |
| 5 | \`clearTimeout(timerId)\` | Cancel any in-flight timer from a prior call. |
| 6-8 | \`setTimeout(..., ms)\` | Schedule the real invocation for \`ms\` ms from now. |
| 7 | \`fn.apply(this, args)\` | Preserve \`this\` context and use the *current* call's arguments (not stale ones). |`,
        dryRunMarkdown: `**Dry run** — rapid calls to debouncedFn("a"), debouncedFn("b"), debouncedFn("c"), delay=300ms:
Call "a": clearTimeout(undefined) no-op. timerId = setTimeout(fn("a"), 300).
Call "b" (< 300ms later): clearTimeout(timer_a). timerId = setTimeout(fn("b"), 300).
Call "c" (< 300ms later): clearTimeout(timer_b). timerId = setTimeout(fn("c"), 300).
300ms passes, no more calls → fn("c") executes.
**fn was called once**, with the last arguments.`,
      },
    ],
    relatedSlugs: ["throttle-polyfill", "function-bind-polyfill"],
    realWorldUsageMarkdown: `Debounce is used on search inputs (don't fire an API call on every keystroke — wait for a pause), window resize handlers (don't recalculate layout 60 times per second), and form autosave (wait until the user stops typing). It reduces unnecessary work and avoids hammering servers with in-progress inputs.`,
  },
  {
    slug: "throttle-polyfill",
    title: "Throttle",
    difficulty: "medium",
    maangTags: ["Meta", "Google", "Amazon"],
    topicSlug: "polyfills",
    functionName: "throttle",
    description: `## Problem

Implement a \`throttle\` function. Given a function \`fn\` and a limit \`ms\`, return a throttled version that invokes \`fn\` **at most once** per \`ms\` milliseconds, no matter how rapidly it is called. The first call fires immediately; subsequent calls within the window are suppressed.

## Example

\`\`\`
const throttledFn = throttle(fn, 300);
throttledFn("a"); // fires immediately
throttledFn("b"); // suppressed — within 300ms window
throttledFn("c"); // suppressed
// 300ms passes → window resets, next call fires immediately
\`\`\`

## Constraints

- First call in a window fires immediately (leading-edge throttle).
- Calls within the window are dropped.
- After the window expires, the next call fires again immediately.

## Senior interview angle

Distinguish from debounce: debounce waits for a quiet period and fires once at the end; throttle fires at a fixed rate and drops intermediate calls. The implementation tracks a \`lastRan\` timestamp instead of a timer ID. A common follow-up is "trailing-edge throttle" — fire the most recent suppressed call when the window expires. State which variant you're implementing before coding.

## Pattern

\`Timestamp-based rate limiting\` — the dual of debounce. Throttle is what you want when you need regular updates (scroll position, drag coordinates, game loop) rather than waiting for a burst to end.`,
    starterCode: `/**
 * @param {Function} fn
 * @param {number} ms
 * @return {Function}
 */
function throttle(fn, ms) {
  // Your code here
}`,
    testCases: [
      {
        input: [(x: string) => x, 300],
        expected: "first",
        label: "first call fires immediately, burst is suppressed",
      },
    ],
    solutions: [
      {
        approach: "Timestamp-Based Rate Gate",
        timeComplexity: "O(1) per call",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Track the last execution timestamp. On each call, check if enough time has elapsed since `lastRan`. If yes, invoke `fn` and update `lastRan`. If no, drop the call.",
        code: `function throttle(fn, ms) {
  let lastRan = 0;

  return function (...args) {
    const now = Date.now();
    if (now - lastRan >= ms) {
      lastRan = now;
      fn.apply(this, args);
    }
  };
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`let lastRan = 0\` | Initialize to epoch 0 so the very first call always fires (now - 0 >= ms for any reasonable ms). |
| 5 | \`Date.now()\` | Current timestamp in ms. |
| 6 | \`if (now - lastRan >= ms)\` | Only proceed if at least \`ms\` ms have elapsed since the last real invocation. |
| 7 | \`lastRan = now\` | Record the time of this invocation to gate the next window. |`,
        dryRunMarkdown: `**Dry run** — ms=300:
t=0: now=0, 0-0=0>=300? yes → lastRan=0, fn("a") fires.
t=100: now=100, 100-0=100>=300? no → dropped.
t=200: now=200, 200-0=200>=300? no → dropped.
t=300: now=300, 300-0=300>=300? yes → lastRan=300, fn fires again.
**fn fired twice** across 4 calls.`,
      },
    ],
    relatedSlugs: ["debounce-polyfill", "function-bind-polyfill"],
    realWorldUsageMarkdown: `Throttle is used for scroll and mouse-move handlers (update the UI at most 60 fps, not on every pixel), infinite scroll triggers (don't fire 50 "load more" calls from one fast scroll), and analytics event batching (record at most one impression per second). It guarantees a maximum call rate regardless of how fast the underlying event fires.`,
  },
  {
    slug: "promise-polyfill",
    title: "Promise Polyfill",
    difficulty: "hard",
    maangTags: ["Meta", "Google", "Amazon"],
    topicSlug: "polyfills",
    functionName: "MyPromise",
    description: `## Problem

Implement a \`MyPromise\` class from scratch that mirrors the ES6 \`Promise\` spec. It must support:

- \`new MyPromise(executor)\` — the executor receives \`resolve\` and \`reject\` functions.
- \`then(onFulfilled, onRejected)\` — registers handlers and returns a **new** \`MyPromise\` for chaining.
- \`catch(onRejected)\` — sugar for \`.then(null, onRejected)\`.

A Promise transitions through three states: **pending → fulfilled** (via \`resolve\`) or **pending → rejected** (via \`reject\`). Once settled, state is frozen.

Do **not** use the built-in \`Promise\`.

## Example

\`\`\`
const p = new MyPromise((resolve) => resolve(42));
p.then((val) => console.log(val)); // 42

const p2 = new MyPromise((_, reject) => reject("oops"));
p2.catch((err) => console.log(err)); // "oops"
\`\`\`

## Constraints

- \`resolve\` and \`reject\` each settle the promise at most once.
- Handlers registered after settlement must still be called (asynchronously via microtask or \`setTimeout\`).
- \`.then\` must return a new \`MyPromise\` to enable chaining.
- If an \`onFulfilled\` handler returns a value, the chained promise resolves with that value.
- If an \`onFulfilled\` handler throws, the chained promise rejects with that error.

## Senior interview angle

The core state machine is the interview signal: three states, one-way transitions, frozen on first settle. The three subtleties that trip candidates: 1) **async handler dispatch** — handlers must fire after the current call stack via \`setTimeout(fn, 0)\` (or \`queueMicrotask\`), not synchronously; 2) **queuing pending handlers** — if \`.then\` is called before the promise settles, store the handlers to flush on settlement; 3) **chaining** — \`.then\` returns a *new* promise whose resolution depends on what the handler returns or throws.

## Pattern

\`State machine + deferred callback queue\` — the same "pending queue flushed on state transition" pattern that underlies event emitters, observable streams, and any async coordination primitive.`,
    starterCode: `class MyPromise {
  constructor(executor) {
    // Your code here
  }

  then(onFulfilled, onRejected) {
    // Your code here
  }

  catch(onRejected) {
    // Your code here
  }
}`,
    testCases: [
      {
        operations: ["MyPromise", "then"],
        args: [[(resolve: (v: number) => void) => resolve(42)], [(v: number) => v]],
        expected: [null, 42],
        label: "resolves synchronously, handler fires",
      },
      {
        operations: ["MyPromise", "catch"],
        args: [[(_: unknown, reject: (r: string) => void) => reject("oops")], [(e: string) => e]],
        expected: [null, "oops"],
        label: "rejects, catch handler fires",
      },
    ],
    solutions: [
      {
        approach: "State Machine with Pending Queue",
        timeComplexity: "O(1) per state transition, O(n) to flush n queued handlers",
        spaceComplexity: "O(n) for queued handlers",
        overviewMarkdown:
          "Maintain three state values (`pending`, `fulfilled`, `rejected`) and a value/reason slot. Store `then` callbacks in a queue while pending; on `resolve`/`reject`, transition state and flush the queue. Dispatch handlers via `setTimeout(fn, 0)` to guarantee async execution. `then` returns a new `MyPromise` whose fate is tied to the current handler's return value or thrown error.",
        code: `class MyPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.callbacks = [];

    const resolve = (value) => {
      if (this.state !== "pending") return;
      this.state = "fulfilled";
      this.value = value;
      this.callbacks.forEach(({ onFulfilled }) =>
        setTimeout(() => onFulfilled(value), 0)
      );
    };

    const reject = (reason) => {
      if (this.state !== "pending") return;
      this.state = "rejected";
      this.value = reason;
      this.callbacks.forEach(({ onRejected }) =>
        setTimeout(() => onRejected(reason), 0)
      );
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handle = (fn, value) => {
        try {
          if (typeof fn === "function") {
            resolve(fn(value));
          } else {
            resolve(value);
          }
        } catch (err) {
          reject(err);
        }
      };

      if (this.state === "fulfilled") {
        setTimeout(() => handle(onFulfilled, this.value), 0);
      } else if (this.state === "rejected") {
        setTimeout(() => handle(onRejected, this.value), 0);
      } else {
        this.callbacks.push({
          onFulfilled: (v) => handle(onFulfilled, v),
          onRejected: (r) => handle(onRejected, r),
        });
      }
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-5 | state init | \`state\` is the FSM node; \`value\` holds the resolved value or rejection reason; \`callbacks\` queues handlers registered before settlement. |
| 7 | \`if (this.state !== "pending") return\` | Idempotency — settling twice is a no-op. |
| 9-12 | flush on resolve | Iterate queued callbacks and fire each \`onFulfilled\` via \`setTimeout\` to ensure async dispatch. |
| 25-27 | executor try/catch | A synchronous throw inside the executor is treated as a rejection. |
| 30 | \`return new MyPromise(...)\` | \`.then\` always returns a fresh promise — this is what enables chaining. |
| 32-39 | \`handle\` helper | If the handler is a function, resolve the chain promise with its return value; if it throws, reject; if there's no handler, pass through. |
| 41-45 | already-settled branches | If called after settlement, dispatch immediately (still async via \`setTimeout\`). |
| 46-49 | pending branch | Queue both handlers — they'll be called when the promise eventually settles. |
| 54 | \`catch = then(null, onRejected)\` | Pure syntactic sugar — one line. |`,
        dryRunMarkdown: `**Dry run 1** — \`new MyPromise(resolve => resolve(42)).then(v => v * 2)\`:
Constructor: state=pending, executor calls resolve(42) synchronously.
resolve(42): state→fulfilled, value=42, callbacks=[] (empty — no .then yet). callbacks.forEach no-op.
.then(v=>v*2): state=fulfilled → setTimeout(handle(fn, 42), 0).
[next tick] handle: fn(42) = 84 → inner promise resolves with 84.
Chain resolves with **84**.

**Dry run 2** — \`new MyPromise((_, reject) => reject("oops")).catch(e => e)\`:
Constructor: reject("oops") → state=rejected, value="oops".
.catch(e=>e) → .then(null, e=>e): state=rejected → setTimeout(handle(onRejected, "oops"), 0).
[next tick] handle: fn("oops") = "oops" → inner promise resolves with "oops".
Chain resolves with **"oops"** — matches expected.`,
      },
    ],
    relatedSlugs: ["promise-all-polyfill", "promise-race-polyfill"],
    realWorldUsageMarkdown: `Implementing \`Promise\` from scratch is the definitive test of understanding JavaScript's async execution model — the microtask queue, deferred callback dispatch, and one-way state machines. The same pattern (state + pending queue + flush on transition) is used in every async coordination primitive: RxJS Observables, deferred/future implementations, and async iterators all share this shape.`,
  },
  {
    slug: "use-state-polyfill",
    title: "useState Hook Polyfill",
    difficulty: "hard",
    maangTags: ["Meta", "Google"],
    topicSlug: "polyfills",
    functionName: "useState",
    description: `## Problem

Implement a simplified \`useState\` hook from scratch, modelling how React manages per-component state across renders.

Your implementation should expose:
- \`useState(initialValue)\` — returns \`[state, setState]\`. On the first call for a given slot, \`state\` is \`initialValue\`. On subsequent calls (re-renders), \`state\` is the last value passed to \`setState\`.
- \`setState(newValue)\` — updates the stored state and triggers a "re-render" (call a provided \`scheduleRender\` function).
- A \`resetHooks()\` utility to reset the cursor between render calls (for testing).

Use a global \`hooks\` array and a \`cursor\` index to manage multiple hook slots, which is the mechanism React actually uses internally.

## Example

\`\`\`
// First render
let [count, setCount] = useState(0); // count = 0
let [name, setName]   = useState("Alice"); // name = "Alice"

// After setCount(1) triggers re-render:
resetHooks();
[count, setCount] = useState(0); // count = 1 (persisted), initial ignored
[name, setName]   = useState("Alice"); // name = "Alice"
\`\`\`

## Constraints

- Multiple \`useState\` calls in one render must each maintain their own independent slot.
- \`initialValue\` is only used on the first render of a slot.
- This is a simplified single-component model — no fibers, no concurrent mode.

## Senior interview angle

The key mechanism is the **hooks array + cursor**: each \`useState\` call reads from \`hooks[cursor]\` and increments the cursor. On the first call for a slot, initialize from \`initialValue\`; on subsequent renders, return the persisted value. This is exactly why React's Rules of Hooks exist — calling hooks conditionally would shift all subsequent cursors and corrupt state. State this rule and its reason before coding.

## Pattern

\`Indexed slot array as persistent state per render\` — the same cursor-over-array pattern powers \`useEffect\`, \`useRef\`, \`useMemo\`, and every other hook in React's implementation.`,
    starterCode: `const hooks = [];
let cursor = 0;

/**
 * @param {any} initialValue
 * @return {[any, Function]}
 */
function useState(initialValue) {
  // Your code here
}

/**
 * Call before each render to reset the hook cursor.
 */
function resetHooks() {
  cursor = 0;
}`,
    testCases: [
      {
        input: [0],
        expected: [0, "function"],
        label: "first render returns [initialValue, setState]",
      },
      {
        input: ["hello"],
        expected: "hello",
        label: "state value is initialValue on first call",
      },
    ],
    solutions: [
      {
        approach: "Hooks Array with Cursor",
        timeComplexity: "O(1) per useState call",
        spaceComplexity: "O(k) where k = number of useState slots",
        overviewMarkdown:
          "Maintain a module-level `hooks` array and a `cursor` index. On each `useState` call: if `hooks[cursor]` is undefined, initialize it to `initialValue`; otherwise use the persisted value. Capture the current cursor position in the `setState` closure so it always writes back to the correct slot. Increment the cursor after each call. `resetHooks()` sets the cursor back to 0 before each render.",
        code: `const hooks = [];
let cursor = 0;

function useState(initialValue) {
  const index = cursor;

  if (hooks[index] === undefined) {
    hooks[index] = initialValue;
  }

  const setState = (newValue) => {
    hooks[index] = newValue;
    // In a real renderer this would schedule a re-render.
    // Here callers can invoke resetHooks() + re-run the component manually.
  };

  cursor++;
  return [hooks[index], setState];
}

function resetHooks() {
  cursor = 0;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5 | \`const index = cursor\` | Snapshot the current slot index before any increment — the closure must capture this specific position. |
| 7-9 | initialize once | Only write \`initialValue\` if the slot is empty. Subsequent renders skip this and return the persisted value. |
| 11-14 | \`setState\` closure | Closes over \`index\` (not \`cursor\`) — this is why each \`setState\` always targets the correct slot regardless of when it's called. |
| 16 | \`cursor++\` | Advance the cursor so the next \`useState\` call gets its own slot. |
| 21 | \`resetHooks()\` | Reset to slot 0 before a re-render so all hooks re-read their same slots in order. |`,
        dryRunMarkdown: `**Dry run** — two hooks across two renders:
Render 1: cursor=0.
  useState(0): index=0, hooks[0]=undefined→init 0. setState closes over 0. cursor→1. returns [0, setState0].
  useState("Alice"): index=1, hooks[1]=undefined→init "Alice". cursor→2. returns ["Alice", setState1].

setState0(42) called: hooks[0]=42.

Render 2: resetHooks() → cursor=0.
  useState(0): index=0, hooks[0]=42 (already set — skip init). cursor→1. returns [**42**, setState0].
  useState("Alice"): index=1, hooks[1]="Alice". cursor→2. returns ["Alice", setState1].

First hook correctly persisted **42** across renders.`,
      },
    ],
    relatedSlugs: ["use-effect-polyfill", "promise-polyfill"],
    realWorldUsageMarkdown: `Understanding the hooks array + cursor model explains every React hook rule: why hooks can't be called conditionally (would shift cursor positions), why they can't be in loops (same reason), and why they must be called in the same order every render. The same slot-per-call-site mechanism is how \`useRef\`, \`useMemo\`, and \`useCallback\` all persist state across renders without any explicit key.`,
  },
  {
    slug: "use-effect-polyfill",
    title: "useEffect Hook Polyfill",
    difficulty: "hard",
    maangTags: ["Meta", "Google"],
    topicSlug: "polyfills",
    functionName: "useEffect",
    description: `## Problem

Implement a simplified \`useEffect\` hook from scratch, modelling how React runs side effects after render and conditionally re-runs them when dependencies change.

Your implementation should:
- \`useEffect(callback, deps)\` — run \`callback\` after the render if \`deps\` changed since the last render (shallow comparison). If \`deps\` is \`undefined\`, run every render. If \`deps\` is \`[]\`, run only on the first render.
- If \`callback\` returns a cleanup function, call it before re-running the effect.
- Use the same **hooks array + cursor** model as \`useState\` — each \`useEffect\` call occupies its own slot, storing the previous deps and the last cleanup function.
- A shared \`resetHooks()\` resets the cursor before each render.

## Example

\`\`\`
// Render 1 (deps=[count]):
useEffect(() => { console.log("effect ran"); return () => console.log("cleanup"); }, [count]);
// → effect runs (first render, no previous deps)

// count unchanged, Render 2:
useEffect(() => { ... }, [count]);
// → deps unchanged → effect does NOT run, cleanup NOT called

// count changes to 1, Render 3:
useEffect(() => { ... }, [1]);
// → deps changed → cleanup from Render 1 runs, then effect runs again
\`\`\`

## Constraints

- Dependency comparison is **shallow** (===) per element.
- If no deps array is passed, always re-run.
- A cleanup returned from the previous run must fire before the next run.
- Use the same \`hooks\` array and \`cursor\` as \`useState\`.

## Senior interview angle

Two subtleties beyond \`useState\`: 1) **dependency diffing** — iterate deps with \`===\` per element; if any differs, re-run; 2) **cleanup ordering** — call the old cleanup *before* running the new effect, not after. State both before coding. The common miss is calling cleanup after the new effect or skipping cleanup entirely. A follow-up is "what's the difference between \`useEffect\` with \`[]\`, \`[dep]\`, and no array?" — the answer falls directly out of the deps check.

## Pattern

\`Deps-gated side effect with cleanup lifecycle\` — the same "diff-and-run" pattern is used in \`useMemo\` (recompute if deps changed) and \`useCallback\` (memoize function reference if deps unchanged).`,
    starterCode: `// Shared with useState — assumes hooks[] and cursor are module-level
const hooks = [];
let cursor = 0;

/**
 * @param {Function} callback
 * @param {any[] | undefined} deps
 * @return {void}
 */
function useEffect(callback, deps) {
  // Your code here
}

function resetHooks() {
  cursor = 0;
}`,
    testCases: [
      {
        input: [() => {}, []],
        expected: true,
        label: "runs on first render with empty deps",
      },
      {
        input: [() => {}, [1, 2]],
        expected: true,
        label: "runs on first render with deps",
      },
    ],
    solutions: [
      {
        approach: "Slot-Based Deps Comparison with Cleanup",
        timeComplexity: "O(d) per render where d = number of deps",
        spaceComplexity: "O(k × d) — k slots, d deps each",
        overviewMarkdown:
          "Each slot stores `{ deps: previousDeps, cleanup: lastCleanupFn }`. On every render call, compare new deps to stored deps with `===` per element. If they differ (or there are no stored deps), call the old cleanup, run the effect, store the new deps and the returned cleanup. If deps are the same, do nothing.",
        code: `const hooks = [];
let cursor = 0;

function useEffect(callback, deps) {
  const index = cursor;
  cursor++;

  const prevSlot = hooks[index];

  const depsChanged =
    !prevSlot ||           // first render
    !deps ||               // no deps array — always run
    deps.length !== prevSlot.deps?.length ||
    deps.some((d, i) => d !== prevSlot.deps[i]);

  if (depsChanged) {
    // Run old cleanup before the new effect
    if (prevSlot?.cleanup) {
      prevSlot.cleanup();
    }

    const cleanup = callback();
    hooks[index] = { deps, cleanup: typeof cleanup === "function" ? cleanup : undefined };
  } else {
    // Deps unchanged — keep existing slot, don't re-run
    hooks[index] = prevSlot;
  }
}

function resetHooks() {
  cursor = 0;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-6 | snapshot + advance | Same cursor pattern as \`useState\` — capture index before incrementing. |
| 10 | \`!prevSlot\` | First render for this slot — always run. |
| 11 | \`!deps\` | No deps array passed — always re-run (same as \`componentDidUpdate\`). |
| 12-13 | length + element check | Shallow array diff — if any element changed by \`!==\`, re-run. |
| 17-19 | cleanup before effect | React's ordering guarantee: old cleanup fires *before* new effect, not after. |
| 21 | \`const cleanup = callback()\` | Run the effect; capture whatever it returns. |
| 22 | store deps + cleanup | Persist for the next render's comparison. |`,
        dryRunMarkdown: `**Dry run** — \`[count]\` deps, count=0 then count=1:
Render 1: index=0, prevSlot=undefined → depsChanged=true. No cleanup. callback() runs → stores cleanup. hooks[0]={deps:[0], cleanup:fn}.
Render 2 (count=0): deps=[0], prevSlot.deps=[0]. deps.some: 0!==0? no → depsChanged=false. Effect does NOT run.
Render 3 (count=1): deps=[1], prevSlot.deps=[0]. deps.some: 1!==0? yes → depsChanged=true. prevSlot.cleanup() called (cleanup from Render 1). callback() runs. hooks[0]={deps:[1], cleanup:newFn}.`,
      },
    ],
    relatedSlugs: ["use-state-polyfill"],
    realWorldUsageMarkdown: `Understanding the \`useEffect\` polyfill explains every React effect behaviour: why \`[]\` runs once (first render has no previous deps), why a missing deps array runs every render (\`!deps\` is always true), why cleanup fires before re-running (not after), and why stale closures happen (callback closes over values at the time it was created, not at run time). These are the most common React debugging questions in senior interviews.`,
  },
  {
    slug: "mini-react-polyfill",
    title: "Mini React Polyfill",
    difficulty: "hard",
    maangTags: ["Meta", "Google"],
    topicSlug: "polyfills",
    functionName: "createElement",
    description: `## Problem

Implement a minimal React-like library from scratch that supports:

1. **\`createElement(type, props, ...children)\`** — creates a virtual DOM node (plain object with \`type\`, \`props\`, \`children\`).
2. **\`render(vnode, container)\`** — mounts a virtual DOM tree into a real DOM container, creating actual DOM nodes and setting attributes/event listeners.
3. **\`useState(initialValue)\`** — hook that persists state across re-renders using the hooks-array + cursor model.
4. **\`scheduleRender(component, container)\`** — re-renders a component function into its container when state changes.

Do **not** use React or ReactDOM.

## Example

\`\`\`
function Counter() {
  const [count, setCount] = useState(0);
  return createElement("div", null,
    createElement("p", null, \`Count: \${count}\`),
    createElement("button", { onClick: () => setCount(count + 1) }, "Increment")
  );
}

render(Counter(), document.getElementById("root"));
// DOM: <div><p>Count: 0</p><button>Increment</button></div>
// Clicking "Increment" re-renders with count=1
\`\`\`

## Constraints

- \`createElement\` produces a plain JS object — the virtual DOM node.
- \`render\` creates real DOM elements, sets props as attributes, and wires \`on*\` props as event listeners.
- Text children (strings/numbers) become \`Text\` nodes.
- Re-renders clear and re-populate the container (\`innerHTML = ""\` then re-mount).
- This is a simplified model — no diffing/reconciliation, no fiber, no concurrent mode.

## Senior interview angle

Three layers to implement in order: 1) **virtual DOM** — \`createElement\` is just \`{ type, props, children }\`; the insight is that JSX is syntactic sugar for exactly this call; 2) **reconciliation** — even in this naive form (clear + re-mount) you're implementing the key idea: virtual description → real DOM; 3) **hooks integration** — \`useState\`'s \`setState\` must call \`scheduleRender\` to trigger a re-render, which means the component function and container must be known at hook setup time. State the three layers in order before coding.

## Pattern

\`Virtual DOM + hooks-array state model\` — this is the complete loop: JSX → vdom → real DOM → event triggers setState → scheduleRender → hooks reset → component re-runs → new vdom → real DOM updated. Understanding this loop answers every "how does React work?" interview question.`,
    starterCode: `/**
 * Create a virtual DOM node.
 * @param {string|Function} type
 * @param {Object|null} props
 * @param {...any} children
 * @return {{ type, props, children }}
 */
function createElement(type, props, ...children) {
  // Your code here
}

/**
 * Mount a virtual DOM node into a real container.
 * @param {Object|string|number} vnode
 * @param {HTMLElement} container
 */
function render(vnode, container) {
  // Your code here
}

// Hooks state (shared module-level)
const hooks = [];
let cursor = 0;
let currentComponent = null;
let currentContainer = null;

function useState(initialValue) {
  // Your code here
}

function scheduleRender(component, container) {
  // Your code here
}`,
    testCases: [
      {
        input: ["div", { id: "app" }, "Hello"],
        expected: { type: "div", props: { id: "app" }, children: ["Hello"] },
        label: "createElement returns correct vdom shape",
      },
      {
        input: ["span", null],
        expected: { type: "span", props: {}, children: [] },
        label: "null props normalized to {}",
      },
    ],
    solutions: [
      {
        approach: "Virtual DOM + Naive Re-mount Renderer",
        timeComplexity: "O(n) to render n nodes; O(n) per re-render (full re-mount, no diffing)",
        spaceComplexity: "O(n) virtual tree + O(k) hooks slots",
        overviewMarkdown:
          "Three pieces working together: `createElement` is a plain object factory; `render` recursively creates real DOM nodes and wires event listeners; `useState` uses the hooks-array + cursor model with `setState` calling `scheduleRender` to trigger a re-render. On re-render, the container is cleared, the cursor is reset, and the component function is called again to produce a fresh virtual tree.",
        code: `function createElement(type, props, ...children) {
  return {
    type,
    props: props || {},
    children: children.flat(),
  };
}

function render(vnode, container) {
  // Text nodes
  if (typeof vnode === "string" || typeof vnode === "number") {
    container.appendChild(document.createTextNode(String(vnode)));
    return;
  }

  const el = document.createElement(vnode.type);

  // Set props / event listeners
  for (const [key, value] of Object.entries(vnode.props || {})) {
    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase(); // onClick → click
      el.addEventListener(eventName, value);
    } else {
      el.setAttribute(key, value);
    }
  }

  // Recursively render children
  for (const child of vnode.children) {
    render(child, el);
  }

  container.appendChild(el);
}

const hooks = [];
let cursor = 0;
let currentComponent = null;
let currentContainer = null;

function useState(initialValue) {
  const index = cursor;
  cursor++;

  if (hooks[index] === undefined) {
    hooks[index] = initialValue;
  }

  const setState = (newValue) => {
    hooks[index] = newValue;
    scheduleRender(currentComponent, currentContainer);
  };

  return [hooks[index], setState];
}

function scheduleRender(component, container) {
  // Persist refs for setState calls
  currentComponent = component;
  currentContainer = container;

  // Reset cursor, clear container, re-render
  cursor = 0;
  container.innerHTML = "";
  render(component(), container);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-5 | \`createElement\` | Pure data — a virtual DOM node is just \`{ type, props, children }\`. JSX transpiles to exactly this call. |
| 5 | \`children.flat()\` | Flattens one level so nested arrays from \`...children\` spread don't appear in the tree. |
| 11-14 | text node branch | Strings and numbers become DOM \`Text\` nodes directly. |
| 18-22 | event listeners | \`on*\` props (camelCase) are wired as event listeners; everything else is set as an attribute. |
| 26-28 | recursive render | Children are rendered into \`el\` before \`el\` is appended — depth-first tree construction. |
| 41-43 | init once | Same hooks-array slot model as standalone \`useState\`. |
| 45-48 | \`setState\` | Updates the slot and immediately calls \`scheduleRender\` — the wire between state change and re-render. |
| 52-53 | persist refs | Store the component fn and container so \`setState\` (which has no direct access to them) can trigger a re-render. |
| 56-58 | re-render | Reset cursor → clear DOM → re-run component fn → mount fresh virtual tree. |`,
        dryRunMarkdown: `**Dry run** — \`Counter()\` rendering \`count=0\`, then click:
scheduleRender(Counter, root): cursor=0, root cleared.
Counter(): useState(0) → index=0, hooks[0]=undefined→0. cursor=1. returns [0, setState0].
createElement("div",...) → vdom built. render(vdom, root) → <div><p>Count: 0</p><button>...</button></div> mounted.

Click "Increment": setState0(1) called → hooks[0]=1. scheduleRender(Counter, root).
cursor=0, root cleared.
Counter(): useState(0) → index=0, hooks[0]=1 → returns [1, setState0]. cursor=1.
New vdom rendered → <div><p>Count: 1</p><button>...</button></div> mounted.
DOM updated to **Count: 1**.`,
      },
    ],
    relatedSlugs: ["use-state-polyfill", "use-effect-polyfill", "promise-polyfill"],
    realWorldUsageMarkdown: `Building this mini-React closes the loop on every "how does React work?" question: JSX is \`createElement\` calls, the virtual DOM is a plain JS object tree, reconciliation is comparing that tree to what's in the DOM, hooks persist state across renders via a slot array keyed by call order, and re-renders are just function calls that produce a new virtual tree. Every React performance optimization (memoization, batching, fiber scheduling) is an optimization on top of this exact loop.`,
  },
];

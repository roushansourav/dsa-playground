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
    solutions: [
      {
        approach: "Brute Force (Nested Loop)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Check every pair of indices for a sum equal to `target`. Correct and simple, but rechecks pairs that a single pass could rule out immediately.",
        code: `function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return [];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`for (let i = 0; ...)\` | Fix the first index of the pair. |
| 3 | \`for (let j = i + 1; ...)\` | Scan every later index so no pair is checked twice or against itself. |
| 4 | \`if (nums[i] + nums[j] === target) return [i, j]\` | Found the pair — return immediately. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[3,2,4], target=6\`:
i=0(3): j=1(2)→5≠6; j=2(4)→7≠6
i=1(2): j=2(4)→6=6 → return **[1,2]** — matches expected.

**Dry run 2** — \`nums=[3,3], target=6\`:
i=0(3): j=1(3)→6=6 → return **[0,1]** — matches expected.`,
      },
      {
        approach: "Optimal (Hash Map Complement Lookup)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Walk the array once. Before adding the current number to a map, check whether its complement (`target - nums[i]`) is already in the map — if so, the pair is found in one pass. Each number is inserted once and looked up once.",
        code: `function twoSum(nums, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`const seen = new Map()\` | Maps a value already seen to its index. |
| 4 | \`const complement = target - nums[i]\` | The value that would complete the pair with the current number. |
| 5 | \`if (seen.has(complement)) return [seen.get(complement), i]\` | If that complement was already seen, we've found the pair — return its earlier index and the current index. |
| 6 | \`seen.set(nums[i], i)\` | Record the current number for future lookups, only reached if no match yet. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[3,2,4], target=6\`:
i=0(3): complement=3, not in map → map={3:0}
i=1(2): complement=4, not in map → map={3:0,2:1}
i=2(4): complement=2, in map at index1 → return **[1,2]** — matches expected.

**Dry run 2** — \`nums=[3,3], target=6\`:
i=0(3): complement=3, not in map (map empty) → map={3:0}
i=1(3): complement=3, in map at index0 → return **[0,1]** — matches expected.`,
      },
    ],
    relatedSlugs: ["two-sum-ii", "three-sum"],
    realWorldUsageMarkdown: `The complement-lookup pattern shows up anywhere two records need to be matched by a combined value: reconciling a payment against a target invoice amount, pairing transactions that cancel out to zero, or matching cache keys in O(1) instead of rescanning a log.`,
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
    solutions: [
      {
        approach: "Brute Force (Nested Loop)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Compare every pair of elements. If any two match, a duplicate exists. No extra memory, but quadratic time.",
        code: `function containsDuplicate(nums) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] === nums[j]) return true;
    }
  }
  return false;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | nested loops | Compare every index \`i\` against every later index \`j\`. |
| 4 | \`if (nums[i] === nums[j]) return true\` | A match found anywhere means a duplicate exists. |
| 6 | \`return false\` | No pair matched after checking all of them. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,3,1]\`:
i=0(1): j=1(2)no; j=2(3)no; j=3(1) match! → return **true** — matches expected.

**Dry run 2** — \`[1,2,3,4]\`:
All \`(i,j)\` pairs checked, no equal values found → return **false** — matches expected.`,
      },
      {
        approach: "Optimal (Hash Set)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Walk the array once, adding each value to a set. If a value is already in the set before it's added, it's a duplicate — return immediately without scanning the rest.",
        code: `function containsDuplicate(nums) {
  const seen = new Set();
  for (const num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`const seen = new Set()\` | Tracks every distinct value encountered so far. |
| 4 | \`if (seen.has(num)) return true\` | Seeing a value already in the set means it appeared twice — a duplicate. |
| 5 | \`seen.add(num)\` | Only reached on a first sighting — record it for future comparisons. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,3,1]\`:
1: not seen → {1}. 2: not seen → {1,2}. 3: not seen → {1,2,3}. 1: already in set → return **true** — matches expected.

**Dry run 2** — \`[1,2,3,4]\`:
Every value is new when checked → set grows to {1,2,3,4}, loop ends → return **false** — matches expected.`,
      },
    ],
    relatedSlugs: ["two-sum", "longest-substring-without-repeating"],
    realWorldUsageMarkdown: `A hash set for "have I seen this before" is the core of deduplication passes in ETL pipelines, detecting repeated event IDs in a message queue (idempotency checks), and flagging duplicate rows before a database insert.`,
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
    solutions: [
      {
        approach: "Brute Force (Product of the Rest, Per Index)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(n) for the output array",
        overviewMarkdown:
          "For each index, multiply every other element with an inner loop. Naturally handles zeros correctly (no division involved), but redoes the multiplication work for every index.",
        code: `function productExceptSelf(nums) {
  const answer = [];
  for (let i = 0; i < nums.length; i++) {
    let product = 1;
    for (let j = 0; j < nums.length; j++) {
      if (j !== i) product *= nums[j];
    }
    answer.push(product);
  }
  return answer;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | outer loop over \`i\` | One output value computed per index. |
| 4-7 | inner loop over \`j\` | Multiply every element except \`nums[i]\` itself. |
| 8 | \`answer.push(product)\` | Store the product of everything except \`nums[i]\`. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,3,4]\`:
i=0: 2*3*4=24. i=1: 1*3*4=12. i=2: 1*2*4=8. i=3: 1*2*3=6.
Result: **[24,12,8,6]** — matches expected.

**Dry run 2** — \`[-1,1,0,-3,3]\`:
i=0: 1*0*-3*3=0. i=1: -1*0*-3*3=0. i=2: -1*1*-3*3=9. i=3: -1*1*0*3=0. i=4: -1*1*0*-3=0.
Result: **[0,0,9,0,0]** — matches expected.`,
      },
      {
        approach: "Optimal (Prefix × Suffix, O(1) Extra Space)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) extra (output array doesn't count)",
        overviewMarkdown:
          "First pass: fill `answer[i]` with the product of everything before `i` (prefix product). Second pass, walking backward: multiply `answer[i]` by a running suffix product of everything after `i`. Together they give the product of everything except `nums[i]`, without division and without a separate prefix/suffix array.",
        code: `function productExceptSelf(nums) {
  const n = nums.length;
  const answer = new Array(n).fill(1);

  for (let i = 1; i < n; i++) {
    answer[i] = answer[i - 1] * nums[i - 1];       // prefix product up to i-1
  }

  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    answer[i] *= suffix;                            // fold in product of everything after i
    suffix *= nums[i];
  }

  return answer;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`answer = new Array(n).fill(1)\` | \`answer[0]\` has no elements before it, so it starts at the multiplicative identity, 1. |
| 5-7 | prefix pass | \`answer[i]\` becomes the product of \`nums[0..i-1]\` — everything strictly before \`i\`. |
| 9 | \`let suffix = 1\` | Running product of everything strictly after the current index, starting empty. |
| 10-13 | suffix pass (right to left) | Multiply in the suffix product before updating it, so \`nums[i]\` itself is never included. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,3,4]\`:
Prefix pass: answer=[1,1,2,6]
Suffix pass: i3: answer[3]=6*1=6, suffix=4; i2: answer[2]=2*4=8, suffix=12; i1: answer[1]=1*12=12, suffix=24; i0: answer[0]=1*24=24, suffix=24
Result: **[24,12,8,6]** — matches expected.

**Dry run 2** — \`[-1,1,0,-3,3]\`:
Prefix pass: answer=[1,-1,-1,0,0]
Suffix pass: i4: answer[4]=0*1=0, suffix=3; i3: answer[3]=0*3=0, suffix=-9; i2: answer[2]=-1*-9=9, suffix=0; i1: answer[1]=-1*0=0, suffix=0; i0: answer[0]=1*0=0, suffix=0
Result: **[0,0,9,0,0]** — matches expected.`,
      },
    ],
    relatedSlugs: ["maximum-subarray", "trapping-rain-water"],
    realWorldUsageMarkdown: `Prefix/suffix accumulation without a single "leave-one-out" recompute is the same trick behind Trapping Rain Water's left/right max arrays, and behind analytics dashboards computing "everyone's rank excluding themselves" (e.g. total team revenue minus each rep's own contribution) in one linear pass.`,
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
    solutions: [
      {
        approach: "Brute Force (All Subarray Sums)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "For every starting index, extend the subarray one element at a time, tracking a running sum and the best sum seen. Covers every contiguous subarray without recomputing sums from scratch each time, but still quadratic.",
        code: `function maxSubArray(nums) {
  let best = nums[0];
  for (let i = 0; i < nums.length; i++) {
    let sum = 0;
    for (let j = i; j < nums.length; j++) {
      sum += nums[j];
      best = Math.max(best, sum);
    }
  }
  return best;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`let best = nums[0]\` | Seed with a valid subarray (a single element) in case all values are negative. |
| 3-8 | nested loops | For each start \`i\`, extend the subarray through every end \`j >= i\`, keeping a running sum. |
| 7 | \`best = Math.max(best, sum)\` | Track the best sum seen across every subarray. |`,
        dryRunMarkdown: `**Dry run 1** — \`[5,4,-1,7,8]\`:
start=0: 5(best5)→9(best9)→8→15(best15)→23(best23)
start=1: 4→3→10→18 (none beat 23)
Remaining starts can't beat 23 either → return **23** — matches expected.

**Dry run 2** — \`[-1]\`:
start=0: sum=-1, best=max(-1,-1)=-1 → return **-1** — matches expected.`,
      },
      {
        approach: "Optimal (Kadane's Algorithm)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Track the best sum of a subarray ending exactly at the current index (`current`). At each step, either extend the previous subarray or start fresh at the current element — whichever is larger. The running maximum of `current` across the whole pass is the answer.",
        code: `function maxSubArray(nums) {
  let current = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]); // extend or restart
    best = Math.max(best, current);
  }
  return best;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | seed \`current\`/\`best\` with \`nums[0]\` | A single-element subarray is always valid, so start there. |
| 5 | \`current = Math.max(nums[i], current + nums[i])\` | If extending the running subarray would be worse than starting fresh at \`nums[i]\`, restart — a negative running sum can only hurt. |
| 6 | \`best = Math.max(best, current)\` | Record the best subarray-ending-here seen across the whole pass. |`,
        dryRunMarkdown: `**Dry run 1** — \`[-2,1,-3,4,-1,2,1,-5,4]\`:
current=-2,best=-2
1: max(1,-1)=1, best=1
-3: max(-3,-2)=-2, best=1
4: max(4,2)=4, best=4
-1: max(-1,3)=3, best=4
2: max(2,5)=5, best=5
1: max(1,6)=6, best=6
-5: max(-5,1)=1, best=6
4: max(4,5)=5, best=6
Result: **6** — matches expected.

**Dry run 2** — \`[5,4,-1,7,8]\`:
current=5,best=5
4: max(4,9)=9,best=9
-1: max(-1,8)=8,best=9
7: max(7,15)=15,best=15
8: max(8,23)=23,best=23
Result: **23** — matches expected.`,
      },
    ],
    relatedSlugs: ["best-time-to-buy-sell-stock", "sliding-window-maximum"],
    realWorldUsageMarkdown: `Kadane's "extend or restart" rule is the standard way to find the best contiguous trading window in a price-change series, or the strongest burst of signal in a noisy sensor stream — anywhere the question is "what's the best contiguous run in this sequence."`,
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
    solutions: [
      {
        approach: "Brute Force (Repeated Pairwise Merge, No Sort)",
        timeComplexity: "O(n³) worst case",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Without sorting, repeatedly scan every pair of intervals for an overlap; merge the first overlapping pair found and restart the scan. Stop when a full pass finds no overlaps left. Correct without depending on sort order, but can re-scan many times.",
        code: `function mergeIntervals(intervals) {
  let result = intervals.map((interval) => [...interval]);
  let merged = true;
  while (merged) {
    merged = false;
    outer: for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const [aStart, aEnd] = result[i];
        const [bStart, bEnd] = result[j];
        if (aStart <= bEnd && bStart <= aEnd) {
          result[i] = [Math.min(aStart, bStart), Math.max(aEnd, bEnd)];
          result.splice(j, 1);
          merged = true;
          break outer;
        }
      }
    }
  }
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`result = intervals.map(...)\` | Work on a mutable copy of copies, so the caller's array/intervals are untouched. |
| 3-4 | \`merged\` flag + \`while\` loop | Keep scanning as long as the previous pass found and applied a merge. |
| 9 | \`aStart <= bEnd && bStart <= aEnd\` | Standard overlap test — true whenever the two intervals touch or cross. |
| 10-13 | merge and restart | Replace the pair with their union, remove the duplicate, and break out to rescan from the top. |`,
        dryRunMarkdown: `**Dry run 1** — \`[[1,4],[4,5]]\`:
Pass1: check (1,4)&(4,5): \`1<=5 && 4<=4\` → true → merge → [1,5]. result=[[1,5]].
Pass2: only one interval, no pairs → stable → return **[[1,5]]** — matches expected.

**Dry run 2** — \`[[1,3],[2,6],[8,10],[15,18]]\`:
Pass1: (1,3)&(2,6) overlap → merge → [1,6]. result=[[1,6],[8,10],[15,18]].
Pass2: (1,6)&(8,10): \`1<=10 && 8<=6\` → false; (1,6)&(15,18): false; (8,10)&(15,18): false → no merge → stable.
Result: **[[1,6],[8,10],[15,18]]** — matches expected.`,
      },
      {
        approach: "Optimal (Sort by Start, Linear Merge)",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Sort intervals by start value. Then walk through once: if the current interval overlaps the last interval placed in the result, extend that result interval's end; otherwise append the current interval as a new entry. Sorting guarantees any interval that could overlap the last result interval is checked immediately after it.",
        code: `function mergeIntervals(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const result = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const last = result[result.length - 1];
    const [start, end] = sorted[i];
    if (start <= last[1]) {
      last[1] = Math.max(last[1], end);   // extend the last merged interval
    } else {
      result.push([start, end]);          // no overlap, start a new interval
    }
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`sorted = [...intervals].sort((a, b) => a[0] - b[0])\` | Sort ascending by start — this is what lets a single linear pass catch every overlap. |
| 3 | \`result = [sorted[0]]\` | Seed the result with the first (earliest-starting) interval. |
| 6-7 | \`last\`, \`[start, end]\` | Compare the current interval against the most recently placed result interval. |
| 8-9 | \`if (start <= last[1])\` | Overlap (or touching) — extend \`last\`'s end to cover the current interval too. |
| 10-11 | \`else result.push(...)\` | No overlap — the current interval starts a new group. |`,
        dryRunMarkdown: `**Dry run 1** — \`[[1,3],[2,6],[8,10],[15,18]]\`:
sorted (already in order): [[1,3],[2,6],[8,10],[15,18]]. result=[[1,3]].
[2,6]: 2<=3 → extend last to [1,6]. result=[[1,6]].
[8,10]: 8<=6? no → push. result=[[1,6],[8,10]].
[15,18]: 15<=10? no → push. result=[[1,6],[8,10],[15,18]].
Matches expected.

**Dry run 2** — \`[[1,4],[0,4]]\`:
sorted by start: [[0,4],[1,4]]. result=[[0,4]].
[1,4]: 1<=4 → extend last to [max(4,4)=4] → [0,4]. result=[[0,4]].
Matches expected \`[[0,4]]\`.`,
      },
    ],
    relatedSlugs: ["task-scheduler"],
    realWorldUsageMarkdown: `Sort-then-sweep interval merging is exactly how calendar apps collapse overlapping busy blocks into free/busy windows, and how resource-booking systems (conference rooms, rental equipment) coalesce reservation ranges before checking for conflicts.`,
  },
];

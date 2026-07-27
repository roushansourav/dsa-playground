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
    solutions: [
      {
        approach: "Brute Force (Clean, Then Compare to Reverse)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Strip non-alphanumeric characters and lowercase everything into a new string, then compare that string to its own reverse. Simple and clear, but allocates two extra full-length strings.",
        code: `function isPalindrome(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const reversed = cleaned.split("").reverse().join("");
  return cleaned === reversed;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`s.toLowerCase().replace(/[^a-z0-9]/g, "")\` | Lowercase everything, then strip anything that isn't a letter or digit. |
| 3 | \`cleaned.split("").reverse().join("")\` | Build the reverse of the cleaned string. |
| 4 | \`return cleaned === reversed\` | A palindrome reads identically forwards and backwards. |`,
        dryRunMarkdown: `**Dry run 1** — \`"race a car"\`:
cleaned = "raceacar"; reversed = "racaecar"
"raceacar" !== "racaecar" → return **false** — matches expected.

**Dry run 2** — \`" "\`:
cleaned = "" (the single space is stripped); reversed = ""
"" === "" → return **true** — matches expected.`,
      },
      {
        approach: "Optimal (Two Pointers, In Place)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Walk `left` from the start and `right` from the end toward the middle. At each step, skip past any non-alphanumeric character on either side, then compare the two characters (case-insensitively). A mismatch means not a palindrome; the pointers crossing without one means it is — no new strings ever built.",
        code: `function isPalindrome(s) {
  const isAlnum = (ch) => /[a-z0-9]/i.test(ch);
  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    while (left < right && !isAlnum(s[left])) left++;
    while (left < right && !isAlnum(s[right])) right--;
    if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
    left++;
    right--;
  }
  return true;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-4 | \`left\`/\`right\` init | Start converging from both ends of the string. |
| 7 | inner \`while\` on \`left\` | Skip forward past any non-alphanumeric character. |
| 8 | inner \`while\` on \`right\` | Skip backward past any non-alphanumeric character. |
| 9 | \`if (s[left].toLowerCase() !== s[right].toLowerCase()) return false\` | Compare the two next "real" characters case-insensitively — any mismatch fails the palindrome check immediately. |
| 10-11 | \`left++; right--\` | Converge one step further after a successful match. |`,
        dryRunMarkdown: `**Dry run 1** — \`"race a car"\` (indices 0-9: r,a,c,e,' ',a,' ',c,a,r):
left=0('r'),right=9('r') → equal → left=1,right=8
left=1('a'),right=8('a') → equal → left=2,right=7
left=2('c'),right=7('c') → equal → left=3,right=6
left=3('e'), right=6(' ') → skip right (not alnum) → right=5('a')
'e' vs 'a' → mismatch → return **false** — matches expected.

**Dry run 2** — \`" "\`:
left=0,right=0 → \`left < right\` is false immediately (single space, indices equal) → loop never runs → return **true** — matches expected.`,
      },
    ],
    relatedSlugs: ["two-sum-ii"],
    realWorldUsageMarkdown: `Converging-pointer scans over cleaned text power input-sanitization palindrome/format checks (e.g. validating a normalized ID or checksum reads the same both ways), and the same skip-invalid-then-compare shape appears in DNA sequence palindrome detection in bioinformatics tooling.`,
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
    solutions: [
      {
        approach: "Brute Force (Nested Loop)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Check every pair, same as unsorted Two Sum — the input being sorted isn't exploited at all here. Correct, but ignores the structure the problem hands you for free.",
        code: `function twoSumII(numbers, target) {
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      if (numbers[i] + numbers[j] === target) return [i + 1, j + 1]; // 1-indexed
    }
  }
  return [];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | nested loops | Check every pair \`(i, j)\` with \`j > i\`. |
| 4 | \`return [i + 1, j + 1]\` | Convert to 1-indexed as the problem requires. |`,
        dryRunMarkdown: `**Dry run 1** — \`numbers=[2,3,4], target=6\`:
i=0(2): j=1(3)→5≠6; j=2(4)→6=6 → return **[1,3]** — matches expected.

**Dry run 2** — \`numbers=[-1,0], target=-1\`:
i=0(-1): j=1(0)→-1=-1 → return **[1,2]** — matches expected.`,
      },
      {
        approach: "Optimal (Opposite-End Two Pointers)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Because the array is sorted, start `left` at the beginning and `right` at the end. If the current sum is too small, the only way to increase it is to move `left` rightward (a bigger number); if too large, move `right` leftward (a smaller number). This exploits sortedness to avoid any extra memory.",
        code: `function twoSumII(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1]; // 1-indexed
    if (sum < target) left++;
    else right--;
  }
  return [];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`left\`/\`right\` init | Start at opposite ends of the sorted array. |
| 6 | \`if (sum === target)\` | Found it — return 1-indexed positions. |
| 7 | \`if (sum < target) left++\` | Sum too small — the only way up is a larger left value, since the array is sorted ascending. |
| 8 | \`else right--\` | Sum too large — shrink it by taking a smaller right value. |`,
        dryRunMarkdown: `**Dry run 1** — \`numbers=[2,3,4], target=6\`:
left=0(2),right=2(4): sum=6=6 → return **[1,3]** — matches expected.

**Dry run 2** — \`numbers=[-1,0], target=-1\`:
left=0(-1),right=1(0): sum=-1=-1 → return **[1,2]** — matches expected.`,
      },
    ],
    relatedSlugs: ["two-sum", "three-sum"],
    realWorldUsageMarkdown: `Opposite-end pointer convergence is the standard way to exploit an already-sorted index — a sorted-scan query planner or a merge step over a sorted column range can find matching pairs in one linear pass instead of a hash lookup, trading extra memory for the guarantee that the data is ordered.`,
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
    solutions: [
      {
        approach: "Brute Force (Sorted Triple Loop + Dedup Set)",
        timeComplexity: "O(n³)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Sort first (this makes duplicate triplets trivially comparable as strings), then check every triple of indices `i < j < k` for a zero sum, recording each unique triplet in a `Set` keyed by its stringified values so duplicates collapse automatically.",
        code: `function threeSum(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const seen = new Set();
  const result = [];

  for (let i = 0; i < sorted.length - 2; i++) {
    for (let j = i + 1; j < sorted.length - 1; j++) {
      for (let k = j + 1; k < sorted.length; k++) {
        if (sorted[i] + sorted[j] + sorted[k] === 0) {
          const key = \`\${sorted[i]},\${sorted[j]},\${sorted[k]}\`;
          if (!seen.has(key)) {
            seen.add(key);
            result.push([sorted[i], sorted[j], sorted[k]]);
          }
        }
      }
    }
  }
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`sorted = [...nums].sort((a, b) => a - b)\` | Sorting makes equal-valued triplets produce identical string keys, which is what makes the \`Set\` dedup work. |
| 3-4 | \`seen\`, \`result\` | Track which value-triplets have already been emitted. |
| 6-8 | triple nested loop | Check every combination of three distinct sorted-array positions. |
| 10-13 | dedup and record | Only push a triplet the first time its value-combination is seen. |`,
        dryRunMarkdown: `**Dry run 1** — \`[0,0,0]\`:
sorted=[0,0,0]. Only combination i=0,j=1,k=2: sum=0 → key "0,0,0" not seen → push [0,0,0].
Result: **[[0,0,0]]** — matches expected.

**Dry run 2** — \`[-1,0,1,2,-1,-4]\`:
sorted=[-4,-1,-1,0,1,2]. Scanning all \`i<j<k\`, the zero-sum triples found in order are: \`(i=1,j=2,k=5)\` → values \`(-1,-1,2)\` (first) and \`(i=1,j=3,k=4)\` → values \`(-1,0,1)\` (second); a later duplicate \`(i=2,j=3,k=4)\` also sums to zero but is skipped since \`"-1,0,1"\` was already seen.
Result: **[[-1,-1,2],[-1,0,1]]** — matches expected (including order).`,
      },
      {
        approach: "Optimal (Sort + Fix One + Two Pointers)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(n) for the sort / output",
        overviewMarkdown:
          "Sort the array. Fix each index `i` as the smallest element of a candidate triplet, then two-pointer the remainder (`left = i+1`, `right = n-1`) looking for a pair summing to `-nums[i]`, exactly like Two Sum II. Skip over duplicate values for `i` and for `left`/`right` after a successful match to avoid emitting the same triplet twice.",
        code: `function threeSum(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < sorted.length - 2; i++) {
    if (i > 0 && sorted[i] === sorted[i - 1]) continue; // skip duplicate anchors
    let left = i + 1;
    let right = sorted.length - 1;

    while (left < right) {
      const sum = sorted[i] + sorted[left] + sorted[right];
      if (sum === 0) {
        result.push([sorted[i], sorted[left], sorted[right]]);
        while (left < right && sorted[left] === sorted[left + 1]) left++;
        while (left < right && sorted[right] === sorted[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`sorted = [...nums].sort((a, b) => a - b)\` | Sorting enables both the duplicate-skip logic and the two-pointer scan. |
| 6 | \`if (i > 0 && sorted[i] === sorted[i - 1]) continue\` | Skip re-anchoring on a value already tried as the smallest element of a triplet. |
| 7-8 | \`left\`/\`right\` init | Two-pointer the remainder of the array for a pair summing to \`-sorted[i]\`. |
| 12-17 | match found | Record the triplet, then skip past any further duplicate values at \`left\`/\`right\` before moving both pointers inward. |
| 18-20 | \`sum < 0\` / \`else\` | Standard sorted two-pointer narrowing, same logic as Two Sum II. |`,
        dryRunMarkdown: `**Dry run 1** — \`[-1,0,1,2,-1,-4]\`:
sorted=[-4,-1,-1,0,1,2].
i=0(-4): left1(-1),right5(2)→sum-3<0→left++; left2(-1),right5→sum-3<0→left++; left3(0),right5→sum-2<0→left++; left4(1),right5→sum-1<0→left++→left=right=5→stop. No triplet.
i=1(-1): left2(-1),right5(2)→sum=0 → push **[-1,-1,2]**; no adjacent dup at left/right→left3,right4. sum=-1+0+1=0 → push **[-1,0,1]**; left4=right4→stop.
i=2(-1): duplicate of sorted[1]=-1 → skip.
i=3(0): left4(1),right5(2)→sum=3>0→right--→left4=right4→stop.
Result: **[[-1,-1,2],[-1,0,1]]** — matches expected (including order).

**Dry run 2** — \`[0,1,1]\`:
sorted=[0,1,1]. \`i < sorted.length - 2\` → \`i < 1\` → only i=0(0): left1(1),right2(1)→sum=0+1+1=2>0→right--→left1=right1→stop. No triplet.
Result: **[]** — matches expected.`,
      },
    ],
    relatedSlugs: ["two-sum-ii", "container-with-most-water"],
    realWorldUsageMarkdown: `Fix-one-then-two-pointer-the-rest generalizes k-Sum problems used in combinatorial search — e.g. finding three trades whose amounts net to zero for reconciliation, or three chemical concentrations that balance a target ratio. It's also the standard warm-up for 4Sum and general k-Sum, which reduce recursively to this same core.`,
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
    solutions: [
      {
        approach: "Brute Force (Every Pair of Lines)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Check every pair of lines, compute the area bounded by the shorter of the two and the distance between them, and track the maximum. Correct, but re-examines pairs a greedy scan can rule out.",
        code: `function maxArea(height) {
  let best = 0;
  for (let i = 0; i < height.length; i++) {
    for (let j = i + 1; j < height.length; j++) {
      const area = Math.min(height[i], height[j]) * (j - i);
      best = Math.max(best, area);
    }
  }
  return best;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-4 | nested loops | Consider every pair of lines \`(i, j)\`. |
| 5 | \`Math.min(height[i], height[j]) * (j - i)\` | Water height is capped by the shorter line; width is the distance between them. |
| 6 | \`best = Math.max(best, area)\` | Track the largest area seen. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,1]\`:
Only pair (0,1): min(1,1)*1=1 → return **1** — matches expected.

**Dry run 2** — \`[4,3,2,1,4]\`:
Pairs: (0,1)=3,(0,2)=4,(0,3)=3,(0,4)=16,(1,2)=2,(1,3)=2,(1,4)=9,(2,3)=1,(2,4)=4,(3,4)=1
Max = **16** — matches expected.`,
      },
      {
        approach: "Optimal (Greedy Two Pointers)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Start pointers at both ends. The shorter of the two lines is always the bottleneck — no matter which line it's paired with next, the width will only shrink, so keeping it can never produce a bigger area than moving past it. Move the shorter pointer inward each step; the taller one stays since it might pair better with a future, taller partner.",
        code: `function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let best = 0;

  while (left < right) {
    const area = Math.min(height[left], height[right]) * (right - left);
    best = Math.max(best, area);
    if (height[left] < height[right]) left++;
    else right--;
  }
  return best;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`left\`/\`right\` init | Start at the widest possible container. |
| 7 | \`Math.min(height[left], height[right]) * (right - left)\` | Same area formula — shorter line caps the water height. |
| 9 | \`if (height[left] < height[right]) left++\` | The shorter line is the bottleneck; moving it is the only way a wider-but-shorter pairing could beat the current area. |
| 10 | \`else right--\` | Symmetric case — the right line is the (weakly) shorter one, so it moves instead. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,1]\`:
left0(1),right1(1): area=min(1,1)*1=1, best=1. Heights equal → move left → left1=right1 → loop ends.
Return **1** — matches expected.

**Dry run 2** — \`[4,3,2,1,4]\`:
left0(4),right4(4): area=min(4,4)*4=16, best=16. Equal → move left → left1(3).
left1(3),right4(4): area=min(3,4)*3=9, best=16. left shorter → move left → left2(2).
left2(2),right4(4): area=min(2,4)*2=4, best=16. left shorter → move left → left3(1).
left3(1),right4(4): area=min(1,4)*1=1, best=16. left shorter → move left → left4=right4 → loop ends.
Return **16** — matches expected.`,
      },
    ],
    relatedSlugs: ["trapping-rain-water", "three-sum"],
    realWorldUsageMarkdown: `"The shorter side is always the bottleneck" is a general capacity-planning insight: the max throughput between two points in a pipeline or network is bounded by its narrowest link, and the same greedy elimination (discard the constrained side, keep the other as a candidate for a better future pairing) shows up in reservoir/dam siting problems.`,
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
    solutions: [
      {
        approach: "Brute Force (Per-Index Left/Right Max Scan)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "For every index, rescan left to find the tallest bar to its left and rescan right for the tallest to its right. The water trapped at that index is the shorter of those two maxes minus the bar's own height (never negative). Correct, but every index triggers two fresh O(n) scans.",
        code: `function trap(height) {
  let total = 0;
  for (let i = 0; i < height.length; i++) {
    let leftMax = 0;
    for (let l = 0; l <= i; l++) leftMax = Math.max(leftMax, height[l]);
    let rightMax = 0;
    for (let r = i; r < height.length; r++) rightMax = Math.max(rightMax, height[r]);
    total += Math.min(leftMax, rightMax) - height[i];
  }
  return total;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4-5 | \`leftMax\` scan | Tallest bar at or before index \`i\`. |
| 6-7 | \`rightMax\` scan | Tallest bar at or after index \`i\`. |
| 8 | \`Math.min(leftMax, rightMax) - height[i]\` | Water sits up to the shorter surrounding wall; subtracting the bar's own height gives the trapped amount at \`i\` (0 when \`i\` itself is the tallest wall on one side). |`,
        dryRunMarkdown: `**Dry run 1** — \`[2,0,2]\`:
i=0: leftMax=2, rightMax=max(2,0,2)=2 → min(2,2)-2=0
i=1: leftMax=max(2,0)=2, rightMax=max(0,2)=2 → min(2,2)-0=2
i=2: leftMax=max(2,0,2)=2, rightMax=2 → min(2,2)-2=0
Total: 0+2+0 = **2** — matches expected.

**Dry run 2** — \`[4,2,0,3,2,5]\`:
leftMax per index: [4,4,4,4,4,5]. rightMax per index: [5,5,5,5,5,5].
water per index: [0,2,4,1,2,0]. Total = **9** — matches expected.`,
      },
      {
        approach: "Optimal (Two Pointers, O(1) Space)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Track a running `leftMax`/`rightMax` while converging `left` and `right` pointers. At each step, advance whichever side is currently shorter: that side's own running max is guaranteed to be the true bounding wall (since the other side already has something at least as tall further out), so its trapped water is exactly `runningMax - height[side]`.",
        code: `function trap(height) {
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let total = 0;

  while (left < right) {
    if (height[left] < height[right]) {
      leftMax = Math.max(leftMax, height[left]);
      total += leftMax - height[left];
      left++;
    } else {
      rightMax = Math.max(rightMax, height[right]);
      total += rightMax - height[right];
      right--;
    }
  }
  return total;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-5 | pointer/running-max init | \`leftMax\`/\`rightMax\` track the tallest bar seen so far from each side. |
| 9 | \`if (height[left] < height[right])\` | The shorter side is guaranteed to be bounded by its own running max — the far side already has something at least as tall. |
| 10-12 | left branch | Update \`leftMax\`, add trapped water at \`left\` (0 if \`height[left]\` is itself the new max), advance. |
| 13-16 | right branch | Symmetric handling for the right side. |`,
        dryRunMarkdown: `**Dry run 1** — \`[4,2,0,3,2,5]\`:
left0(4),right5(5),leftMax0,rightMax0,total0.
4<5 → leftMax=max(0,4)=4, total+=4-4=0 → total=0, left=1
2<5 → leftMax=max(4,2)=4, total+=4-2=2 → total=2, left=2
0<5 → leftMax=4, total+=4-0=4 → total=6, left=3
3<5 → leftMax=4, total+=4-3=1 → total=7, left=4
2<5 → leftMax=4, total+=4-2=2 → total=9, left=5 → left=right → stop
Total: **9** — matches expected.

**Dry run 2** — \`[2,0,2]\`:
left0(2),right2(2),leftMax0,rightMax0,total0.
height[left]=2 < height[right]=2? false → right branch: rightMax=max(0,2)=2, total+=2-2=0 → total=0, right=1
left0(2),right1(0): height[left]=2 < height[right]=0? false → right branch: rightMax=max(2,0)=2, total+=2-0=2 → total=2, right=0 → left=right → stop
Total: **2** — matches expected.`,
      },
    ],
    relatedSlugs: ["container-with-most-water", "daily-temperatures"],
    realWorldUsageMarkdown: `The two-pointer running-max technique is used in literal terrain/GIS water-retention modeling (how much runoff pools across an elevation profile), and the "shorter side is bounded by its own running max" insight is the same core idea behind stock-span and monotonic-boundary problems like Daily Temperatures.`,
  },
];

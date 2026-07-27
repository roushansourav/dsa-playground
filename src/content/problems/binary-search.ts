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
    solutions: [
      {
        approach: "Brute Force (Linear Scan)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Check every element left to right until `target` is found. Correct, but ignores the fact that the array is sorted — the whole point of this problem is to exploit that structure instead.",
        code: `function binarySearch(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === target) return i;
  }
  return -1;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-4 | \`for\` loop | Check each index in order; return immediately on a match. |
| 5 | \`return -1\` | Reached only if no element matched. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[-1,0,3,5,9,12], target=9\`:
i=0(-1)≠9. i=1(0)≠9. i=2(3)≠9. i=3(5)≠9. i=4(9)===9 → return **4** — matches expected.

**Dry run 2** — \`nums=[], target=5\`:
Loop body never runs (length 0) → return **-1** — matches expected.`,
      },
      {
        approach: "Optimal (Binary Search)",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Maintain `left <= right` as the invariant over the still-possible range. Compare the midpoint to `target` and discard the half that can't contain it — never re-scan a discarded half. The loop's termination condition, `left > right`, means the range is empty and `target` isn't present.",
        code: `function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5 | \`while (left <= right)\` | The search range is non-empty exactly when this holds. |
| 7 | \`if (nums[mid] === target) return mid\` | Found it. |
| 8-10 | \`nums[mid] < target\` | Target must be to the right — discard \`[left, mid]\`. |
| 10-12 | else | Target must be to the left — discard \`[mid, right]\`. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[-1,0,3,5,9,12], target=9\`:
left=0,right=5, mid=2 (\`nums[2]=3\`): 3<9 → left=3.
left=3,right=5, mid=4 (\`nums[4]=9\`): match → return **4** — matches expected.

**Dry run 2** — \`nums=[], target=5\`:
left=0,right=-1. \`left <= right\`? 0<=-1 is false → loop never runs → return **-1** — matches expected.`,
      },
    ],
    relatedSlugs: ["search-2d-matrix", "search-rotated-array"],
    realWorldUsageMarkdown: `Binary search is the algorithm underlying database index lookups (B-tree node traversal), language-standard-library search utilities, and \`git bisect\`, which binary searches commit history to find the first bad commit.`,
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
    solutions: [
      {
        approach: "Brute Force (Scan Every Cell)",
        timeComplexity: "O(m·n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Check every cell in the matrix, row by row. Correct, but ignores that each row is sorted AND every row's values sit entirely above the previous row's — the matrix is really one long sorted sequence in disguise.",
        code: `function searchMatrix(matrix, target) {
  for (const row of matrix) {
    for (const val of row) {
      if (val === target) return true;
    }
  }
  return false;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-6 | nested loops | Check every cell unconditionally; no use of sortedness. |`,
        dryRunMarkdown: `**Dry run 1** — \`matrix=[[1,3,5,7],[10,11,16,20],[23,30,34,60]], target=3\`:
Row0: 1≠3, 3===3 → return **true** — matches expected.

**Dry run 2** — same matrix, \`target=13\`:
Row0: 1,3,5,7 — none match. Row1: 10,11,16,20 — none match. Row2: 23,30,34,60 — none match. Loop ends → return **false** — matches expected.`,
      },
      {
        approach: "Optimal (Binary Search on Flattened Index)",
        timeComplexity: "O(log(m·n))",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Treat the matrix as a single sorted array of length `m*n` and binary search it directly, without ever materializing the flattened array: for a flat index `mid`, `row = Math.floor(mid / cols)` and `col = mid % cols` recover the 2D position in O(1). This beats the weaker 'binary search rows, then binary search within a row' approach (which is also O(log m + log n) but requires two separate searches) by doing one search over the combined space.",
        code: `function searchMatrix(matrix, target) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  let left = 0;
  let right = rows * cols - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const val = matrix[Math.floor(mid / cols)][mid % cols];
    if (val === target) return true;
    if (val < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return false;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 8 | \`matrix[Math.floor(mid / cols)][mid % cols]\` | Recovers the 2D cell for flat index \`mid\` in O(1) — no actual flattening needed. |
| 9-14 | comparison | Same discard-a-half logic as plain binary search, just over the implicit flat sequence. |`,
        dryRunMarkdown: `**Dry run 1** — \`matrix=[[1,3,5,7],[10,11,16,20],[23,30,34,60]], target=3\`:
rows=3, cols=4, left=0, right=11.
mid=5 → row1,col1 → \`matrix[1][1]=11\`. 11<3? no → right=4.
left=0,right=4, mid=2 → row0,col2 → \`matrix[0][2]=5\`. 5<3? no → right=1.
left=0,right=1, mid=0 → row0,col0 → \`matrix[0][0]=1\`. 1<3 → left=1.
left=1,right=1, mid=1 → row0,col1 → \`matrix[0][1]=3\` → match → return **true** — matches expected.

**Dry run 2** — same matrix, \`target=16\`:
left=0,right=11, mid=5 → \`matrix[1][1]=11\`. 11<16 → left=6.
left=6,right=11, mid=8 → row2,col0 → \`matrix[2][0]=23\`. 23<16? no → right=7.
left=6,right=7, mid=6 → row1,col2 → \`matrix[1][2]=16\` → match → return **true** — matches expected.`,
      },
    ],
    relatedSlugs: ["binary-search"],
    realWorldUsageMarkdown: `Binary searching over an implicit flattened index — recovering a multi-dimensional position from a single search index via arithmetic instead of materializing the flat structure — is the same trick used to binary search a paginated or virtualized dataset (e.g. spreadsheet cells addressed by row/column) without loading it all into memory as one array.`,
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
    solutions: [
      {
        approach: "Brute Force (Try Every Speed From 1 Upward)",
        timeComplexity: "O(max(piles) · n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Try every candidate speed `k` starting from 1, computing the total hours needed at that speed, and return the first `k` where the hours fit within `h`. Correct — since hours-needed is monotonically non-increasing as `k` grows, the first `k` that works is the minimum — but scans every speed below the answer one at a time instead of jumping straight there.",
        code: `function minEatingSpeed(piles, h) {
  const maxPile = Math.max(...piles);
  for (let k = 1; k <= maxPile; k++) {
    const hours = piles.reduce((sum, pile) => sum + Math.ceil(pile / k), 0);
    if (hours <= h) return k;
  }
  return maxPile;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`maxPile\` | No speed faster than the largest pile is ever necessary — one pile takes exactly 1 hour at that speed. |
| 4 | \`Math.ceil(pile / k)\` | Hours to finish one pile at speed \`k\` — partial hours still cost a full hour. |
| 5 | \`if (hours <= k) return k\` | First (smallest) \`k\` that fits within \`h\` hours, thanks to monotonicity. |`,
        dryRunMarkdown: `**Dry run 1** — \`piles=[3,6,7,11], h=8\`:
k=1: hours=3+6+7+11=27>8.
k=2: ceil(3/2)+ceil(6/2)+ceil(7/2)+ceil(11/2) = 2+3+4+6 = 15>8.
k=3: 1+2+3+4 = 10>8.
k=4: ceil(3/4)+ceil(6/4)+ceil(7/4)+ceil(11/4) = 1+2+2+3 = 8<=8 → return **4** — matches expected.

**Dry run 2** — \`piles=[30,11,23,4,20], h=5\`:
k needs to reach 30 before hours drops to ≤5 (each pile must take exactly 1 hour, requiring \`k\` at or above every pile's size — the largest is 30). At k=29: ceil(30/29)+ceil(11/29)+ceil(23/29)+ceil(4/29)+ceil(20/29) = 2+1+1+1+1 = 6>5. At k=30: 1+1+1+1+1 = 5<=5 → return **30** — matches expected.`,
      },
      {
        approach: "Optimal (Binary Search on the Answer)",
        timeComplexity: "O(n · log(max(piles)))",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "This is binary search on the answer, not on the input array: the search space is the candidate eating speed `k`, ranging from `1` to `max(piles)`. The predicate 'can she finish within `h` hours at speed `k`?' is monotonic in `k` — once it's true for some speed, it stays true for every faster speed — so binary search finds the smallest `k` where it flips from false to true.",
        code: `function minEatingSpeed(piles, h) {
  const hoursNeeded = (k) =>
    piles.reduce((sum, pile) => sum + Math.ceil(pile / k), 0);

  let left = 1;
  let right = Math.max(...piles);
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (hoursNeeded(mid) <= h) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }
  return left;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`hoursNeeded\` | Total hours to finish all piles at speed \`k\`. |
| 6 | \`while (left < right)\` | Standard "find leftmost value satisfying a predicate" binary search shape. |
| 8-10 | \`hoursNeeded(mid) <= h\` | Speed \`mid\` works — it or something slower might be the answer, so keep \`mid\` in range (\`right = mid\`, not \`mid - 1\`). |
| 10-12 | else | Speed \`mid\` is too slow — the answer must be faster, so discard it (\`left = mid + 1\`). |`,
        dryRunMarkdown: `**Dry run 1** — \`piles=[3,6,7,11], h=8\`:
left=1,right=11, mid=6: hours = ceil(3/6)+ceil(6/6)+ceil(7/6)+ceil(11/6) = 1+1+2+2 = 6<=8 → right=6.
left=1,right=6, mid=3: hours=1+2+3+4=10>8 → left=4.
left=4,right=6, mid=5: hours=ceil(3/5)+ceil(6/5)+ceil(7/5)+ceil(11/5)=1+2+2+3=8<=8 → right=5.
left=4,right=5, mid=4: hours=1+2+2+3=8<=8 → right=4.
left=4,right=4 → loop ends → return **4** — matches expected.

**Dry run 2** — \`piles=[30,11,23,4,20], h=5\`:
left=1,right=30, mid=15: hours=2+1+2+1+2=8>5 → left=16.
left=16,right=30, mid=23: hours=ceil(30/23)+ceil(11/23)+ceil(23/23)+ceil(4/23)+ceil(20/23)=2+1+1+1+1=6>5 → left=24.
left=24,right=30, mid=27: hours=ceil(30/27)+1+1+1+1=2+1+1+1+1=6>5 → left=28.
left=28,right=30, mid=29: hours=ceil(30/29)+1+1+1+1=2+1+1+1+1=6>5 → left=30.
left=30,right=30 → loop ends → return **30** — matches expected.`,
      },
    ],
    relatedSlugs: ["binary-search"],
    realWorldUsageMarkdown: `Binary-search-on-the-answer is the general technique behind resource-allocation problems where the "right" value is expensive to compute directly but cheap to *verify* — e.g. the minimum bandwidth needed to finish a set of uploads within a time budget, or the minimum truck capacity to ship a sequence of packages within D days. Anywhere a monotonic feasibility check can replace a closed-form formula, this pattern applies.`,
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
    solutions: [
      {
        approach: "Brute Force (Linear Scan)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Check every element left to right until `target` is found. Correct regardless of rotation (rotation doesn't matter if you're not exploiting sortedness at all), but throws away the O(log n) requirement entirely.",
        code: `function search(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === target) return i;
  }
  return -1;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-4 | \`for\` loop | Check each index in order. |
| 5 | \`return -1\` | No match found anywhere. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[4,5,6,7,0,1,2], target=0\`:
i=0(4)≠0. i=1(5)≠0. i=2(6)≠0. i=3(7)≠0. i=4(0)===0 → return **4** — matches expected.

**Dry run 2** — same array, \`target=3\`:
Every element (4,5,6,7,0,1,2) checked, none equal 3 → return **-1** — matches expected.`,
      },
      {
        approach: "Optimal (Pivoted Binary Search)",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "At each midpoint, at least one half (`[left, mid]` or `[mid, right]`) is guaranteed to be normally sorted, even though the whole array isn't. Determine which half is sorted by comparing `nums[left]` to `nums[mid]`, then check whether `target` falls within that sorted half's value range to decide which half to recurse into — this is the one extra decision layered on top of plain binary search.",
        code: `function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;

    if (nums[left] <= nums[mid]) {
      // Left half [left, mid] is normally sorted.
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      // Right half [mid, right] is normally sorted.
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }
  return -1;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 9 | \`nums[left] <= nums[mid]\` | If true, \`[left, mid]\` has no rotation break in it — it's normally sorted. |
| 10-14 | left half sorted | \`target\` is in \`[nums[left], nums[mid])\` → search left half; otherwise it must be in the right half. |
| 16-20 | right half sorted (else branch) | Symmetric logic: \`target\` is in \`(nums[mid], nums[right]]\` → search right half; otherwise search left half. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[4,5,6,7,0,1,2], target=0\`:
left=0,right=6, mid=3 (\`nums[3]=7\`): 7≠0. \`nums[0]=4 <= nums[3]=7\` → left half sorted. Is \`4<=0<7\`? No → left=4.
left=4,right=6, mid=5 (\`nums[5]=1\`): 1≠0. \`nums[4]=0 <= nums[5]=1\` → left half \`[4,5]\` sorted. Is \`0<=0<1\`? Yes → right=4.
left=4,right=4, mid=4 (\`nums[4]=0\`): match → return **4** — matches expected.

**Dry run 2** — same array, \`target=5\`:
left=0,right=6, mid=3 (\`nums[3]=7\`): 7≠5. \`nums[0]=4<=7\` → left half sorted. Is \`4<=5<7\`? Yes → right=2.
left=0,right=2, mid=1 (\`nums[1]=5\`): match → return **1** — matches expected.`,
      },
    ],
    relatedSlugs: ["find-min-rotated", "binary-search"],
    realWorldUsageMarkdown: `Pivoted binary search models any circularly-shifted sorted structure — for example, searching a circular buffer, or a log file whose entries wrapped around at a rotation boundary, without first physically un-rotating the data.`,
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
    solutions: [
      {
        approach: "Brute Force (Scan for Minimum)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Scan the whole array and track the smallest value seen. Correct — rotation doesn't matter to a plain min-scan — but ignores the sortedness that lets binary search find the rotation point directly.",
        code: `function findMin(nums) {
  let min = nums[0];
  for (const val of nums) {
    if (val < min) min = val;
  }
  return min;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-4 | scan | Track the running minimum across every element. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[3,4,5,1,2]\`:
min=3. 4 not<3. 5 not<3. 1<3→min=1. 2 not<1.
Return **1** — matches expected.

**Dry run 2** — \`nums=[11,13,15,17]\`:
min=11. 13,15,17 all not<11.
Return **11** — matches expected.`,
      },
      {
        approach: "Optimal (Binary Search for the Rotation Point)",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Compare `nums[mid]` to `nums[right]`, not `nums[left]`. `nums[mid] > nums[right]` means the rotation point (and the minimum) is strictly to the right of `mid`, so discard `[left, mid]`; otherwise the minimum is at or before `mid`, so discard `(mid, right]` while keeping `mid` itself as a candidate. Comparing against `right` instead of `left` is what keeps the invariant correct even when the array isn't rotated at all (a degenerate case of the same logic, not a special case to branch on).",
        code: `function findMin(nums) {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] > nums[right]) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return nums[left];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6 | \`nums[mid] > nums[right]\` | The rotation break is between \`mid\` and \`right\` — the minimum is somewhere after \`mid\`. |
| 7 | \`left = mid + 1\` | Discard \`mid\` itself (it can't be the minimum since something smaller lies ahead of it). |
| 9 | \`right = mid\` | \`mid\` might BE the minimum, so keep it in range (unlike plain binary search's \`mid - 1\`). |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[3,4,5,1,2]\`:
left=0,right=4, mid=2 (\`nums[2]=5\`): \`nums[right]=2\`. 5>2 → left=3.
left=3,right=4, mid=3 (\`nums[3]=1\`): \`nums[right]=2\`. 1>2? No → right=3.
left=3,right=3 → loop ends → return \`nums[3]\` = **1** — matches expected.

**Dry run 2** — \`nums=[11,13,15,17]\` (no actual rotation):
left=0,right=3, mid=1 (\`nums[1]=13\`): \`nums[right]=17\`. 13>17? No → right=1.
left=0,right=1, mid=0 (\`nums[0]=11\`): \`nums[right]=13\`. 11>13? No → right=0.
left=0,right=0 → loop ends → return \`nums[0]\` = **11** — matches expected (the degenerate "no rotation" case falls out of the same logic with no special-casing).`,
      },
    ],
    relatedSlugs: ["search-rotated-array"],
    realWorldUsageMarkdown: `Locating the rotation point via binary search is the same operation used to find the "start of day" boundary in a rotated/wrapped time-series buffer, or the write-pointer position in a circularly-sorted ring buffer.`,
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
    solutions: [
      {
        approach: "Brute Force (Linear Scan per Get)",
        timeComplexity: "O(1) set, O(n) get (n = entries for that key)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Store each key's `(timestamp, value)` pairs in an array, appended in arrival order. Since `set` is always called with strictly increasing timestamps per key, the array is already sorted — so `get` can just scan it in order, keeping the last value whose timestamp is `<= query` and stopping once a later timestamp is passed.",
        code: `class TimeMap {
  constructor() {
    this.store = new Map();
  }
  set(key, value, timestamp) {
    if (!this.store.has(key)) this.store.set(key, []);
    this.store.get(key).push([timestamp, value]);
  }
  get(key, timestamp) {
    const entries = this.store.get(key);
    if (!entries) return "";
    let result = "";
    for (const [ts, value] of entries) {
      if (ts <= timestamp) {
        result = value;
      } else {
        break;
      }
    }
    return result;
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-8 | \`set\` | Appends to the key's list; the strictly-increasing-timestamp guarantee keeps it sorted with no extra work. |
| 13-18 | scan | Keeps overwriting \`result\` as long as timestamps are \`<= timestamp\`; stops (via \`break\`) the moment one exceeds it — the last kept value is the answer. |`,
        dryRunMarkdown: `**Dry run 1** — \`set("foo","bar",1), get("foo",1), get("foo",3), set("foo","bar2",4), get("foo",4), get("foo",5)\`:
set("foo","bar",1) → \`store.foo=[[1,"bar"]]\`.
get("foo",1): \`1<=1\` → result="bar". Return **"bar"** — matches expected.
get("foo",3): \`1<=3\` → result="bar". Return **"bar"** — matches expected.
set("foo","bar2",4) → \`store.foo=[[1,"bar"],[4,"bar2"]]\`.
get("foo",4): \`1<=4\`→result="bar"; \`4<=4\`→result="bar2". Return **"bar2"** — matches expected.
get("foo",5): \`1<=5\`→result="bar"; \`4<=5\`→result="bar2". Return **"bar2"** — matches expected.
Outputs: [null,null,"bar","bar",null,"bar2","bar2"] — matches expected.`,
      },
      {
        approach: "Optimal (Binary Search per Get)",
        timeComplexity: "O(1) set, O(log n) get (n = entries for that key)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Same storage as the brute force (strictly increasing timestamps per key keep each key's list sorted for free), but `get` becomes binary search for the rightmost entry with `timestamp <= query` instead of a linear scan — the same 'find rightmost value satisfying a predicate' shape as plain binary search, applied to one key's list of pairs instead of a flat array.",
        code: `class TimeMap {
  constructor() {
    this.store = new Map();
  }
  set(key, value, timestamp) {
    if (!this.store.has(key)) this.store.set(key, []);
    this.store.get(key).push([timestamp, value]);
  }
  get(key, timestamp) {
    const entries = this.store.get(key);
    if (!entries || entries.length === 0) return "";

    let left = 0;
    let right = entries.length - 1;
    let result = "";
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (entries[mid][0] <= timestamp) {
        result = entries[mid][1];
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    return result;
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 13-21 | binary search | Whenever \`entries[mid]\`'s timestamp qualifies, record it as the best-so-far \`result\` and keep searching right (a later entry might qualify too and be more recent); otherwise search left. |`,
        dryRunMarkdown: `**Dry run 1** — \`set("foo","bar",1), set("foo","bar2",4), get("foo",3), get("foo",5), get("baz",1)\`:
After both sets: \`store.foo=[[1,"bar"],[4,"bar2"]]\`.
get("foo",3): left=0,right=1. mid=0: \`entries[0][0]=1<=3\` → result="bar", left=1. left=1,right=1, mid=1: \`entries[1][0]=4<=3\`? No → right=0. left=1,right=0 → stop. Return **"bar"** — matches expected.
get("foo",5): left=0,right=1. mid=0: \`1<=5\` → result="bar", left=1. left=1,right=1, mid=1: \`4<=5\` → result="bar2", left=2. left=2,right=1 → stop. Return **"bar2"** — matches expected.
get("baz",1): \`store.get("baz")\` is \`undefined\` → return **""** — matches expected.
Outputs: [null,null,null,"bar","bar2",""] — matches expected.`,
      },
    ],
    relatedSlugs: ["binary-search"],
    realWorldUsageMarkdown: `This exact pattern — an append-only per-key timestamped log plus binary search for "value as of time T" — is the core lookup mechanism behind time-series databases and MVCC-style snapshot reads in transactional databases, where a query must see the state as it existed at a specific point in time.`,
  },
];

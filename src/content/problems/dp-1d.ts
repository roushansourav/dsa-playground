import type { Problem } from "../types";

export const oneDDpProblems: Problem[] = [
  {
    slug: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "easy",
    maangTags: ["Amazon", "Apple"],
    topicSlug: "1d-dp",
    functionName: "climbStairs",
    description: `## Problem

You are climbing a staircase with \`n\` steps. Each time you can climb either \`1\` or \`2\` steps. Return the number of **distinct ways** you can climb to the top.

## Example

\`\`\`
Input: n = 3
Output: 3
Explanation: (1,1,1), (1,2), (2,1) — three distinct step sequences.
\`\`\`

## Constraints

- \`1 <= n <= 45\`

## Senior interview angle

This is the "hello world" of DP — \`ways(n) = ways(n-1) + ways(n-2)\`, structurally identical to Fibonacci. The interview signal isn't the recurrence (most candidates spot it fast); it's whether you notice you only ever need the **last two values** and collapse an O(n) table into two rolling variables — the same space-optimization move that recurs across every 1-D DP problem in this topic.

## Pattern

\`1-D bottom-up DP (2-state rolling)\` — compute f(n) from f(n-1) and f(n-2), keep only the last two values in memory.`,
    starterCode: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  // Your code here
}`,
    testCases: [
      { input: [2], expected: 2 },
      { input: [3], expected: 3 },
      { input: [5], expected: 8 },
    ],
    solutions: [
      {
        approach: "Brute Force (Recursion)",
        timeComplexity: "O(2^n)",
        spaceComplexity: "O(n) call stack",
        overviewMarkdown:
          "Recurse directly on the definition: `ways(n) = ways(n-1) + ways(n-2)`, with base cases `n <= 2`. Correct, but the same subproblem gets recomputed exponentially many times — `climbStairs(3)` gets called once while computing `climbStairs(5)`, and once more while computing `climbStairs(4)` on the way there.",
        code: `function climbStairs(n) {
  if (n <= 2) return n;
  return climbStairs(n - 1) + climbStairs(n - 2);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`if (n <= 2) return n;\` | Base case: 1 step has 1 way, 2 steps has 2 ways (1+1 or 2). |
| 3 | \`return climbStairs(n-1) + climbStairs(n-2);\` | Last move onto step \`n\` was either a 1-step (from \`n-1\`) or a 2-step (from \`n-2\`) — sum the ways to reach each. |`,
        dryRunMarkdown: `**Dry run 1 (n=3)**:
\`climbStairs(3)\` = \`climbStairs(2)\` + \`climbStairs(1)\` = 2 + 1 = **3** — matches expected.

**Dry run 2 (n=5)**:
\`climbStairs(5)\` = \`climbStairs(4)\` + \`climbStairs(3)\`.
\`climbStairs(4)\` = \`climbStairs(3)\` + \`climbStairs(2)\` = 3 + 2 = 5 (note: \`climbStairs(3)\` computed here from scratch).
\`climbStairs(3)\` = 3 (recomputed again, independently, for the outer call — this duplicate work is exactly what the optimal solution eliminates).
Total = 5 + 3 = **8** — matches expected.`,
      },
      {
        approach: "Optimal (Bottom-Up, O(1) Space)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Build the answer from the bottom up, but only ever keep the last two values (`prev2`, `prev1`) instead of a full table. At each step, `curr = prev1 + prev2`, then slide the window forward. No recomputation, no recursion.",
        code: `function climbStairs(n) {
  if (n <= 2) return n;

  let prev2 = 1; // ways(1)
  let prev1 = 2; // ways(2)

  for (let i = 3; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }

  return prev1;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`if (n <= 2) return n;\` | Same base case as brute force — no loop needed for 1 or 2 steps. |
| 4-5 | \`prev2 = 1; prev1 = 2;\` | Seed the rolling window with \`ways(1)\` and \`ways(2)\`. |
| 7 | \`for (let i = 3; i <= n; i++)\` | Walk forward one step count at a time from 3 up to \`n\`. |
| 8 | \`const curr = prev1 + prev2;\` | \`ways(i) = ways(i-1) + ways(i-2)\` — the same recurrence, but reading from cached values instead of recursing. |
| 9-10 | \`prev2 = prev1; prev1 = curr;\` | Slide the two-value window forward for the next iteration. |
| 13 | \`return prev1;\` | After the loop, \`prev1\` holds \`ways(n)\`. |`,
        dryRunMarkdown: `**Dry run 1 (n=3)**: prev2=1, prev1=2.
i=3: curr=2+1=3, prev2=2, prev1=3.
Loop ends (i=4>3). Return **3** — matches expected.

**Dry run 2 (n=5)**: prev2=1, prev1=2.
i=3: curr=3, prev2=2, prev1=3.
i=4: curr=3+2=5, prev2=3, prev1=5.
i=5: curr=5+3=8, prev2=5, prev1=8.
Loop ends (i=6>5). Return **8** — matches expected.`,
      },
    ],
    relatedSlugs: ["house-robber", "coin-change"],
    realWorldUsageMarkdown: `The 2-state rolling-DP shape here is the same mechanism behind Fibonacci-style resource models: population/interest growth projections, and any "current value depends on the previous two states" simulation (recurrence relations in signal processing, tiling-count problems in combinatorics).`,
  },
  {
    slug: "house-robber",
    title: "House Robber",
    difficulty: "medium",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "1d-dp",
    functionName: "rob",
    description: `## Problem

You are a robber planning to rob houses along a street. Each house has some amount of money, given by \`nums\`. Adjacent houses have a connected security system — robbing two adjacent houses on the same night triggers the alarm. Return the **maximum** amount of money you can rob without robbing two adjacent houses.

## Example

\`\`\`
Input: nums = [2,7,9,3,1]
Output: 12
Explanation: Rob house 0 (2), house 2 (9), house 4 (1) = 12.
\`\`\`

## Constraints

- \`1 <= nums.length <= 100\`
- \`0 <= nums[i] <= 400\`

## Senior interview angle

At every house \`i\` you have exactly two choices: skip it (carry forward the best total through \`i-1\`), or take it (its value plus the best total through \`i-2\`, since \`i-1\` is now off-limits). That "take vs. skip, constrained by adjacency" framing is the template for a whole family of interview problems — this one is the cleanest possible instance of it, and House Robber II builds directly on top.

## Pattern

\`1-D DP (include/exclude with adjacency constraint)\` — track the best total ending with the previous house excluded vs. included, rolled forward in O(1) space.`,
    starterCode: `/**
 * @param {number[]} nums
 * @return {number}
 */
function rob(nums) {
  // Your code here
}`,
    testCases: [
      { input: [[1, 2, 3, 1]], expected: 4 },
      { input: [[2, 7, 9, 3, 1]], expected: 12 },
      { input: [[2, 1, 1, 2]], expected: 4 },
    ],
    solutions: [
      {
        approach: "Brute Force (Recursion)",
        timeComplexity: "O(2^n)",
        spaceComplexity: "O(n) call stack",
        overviewMarkdown:
          "At each index, recursively try both choices — skip this house (`helper(i+1)`) or rob it and jump past the next one (`nums[i] + helper(i+2)`) — and take the max. Correct, but `helper(i)` gets re-entered from multiple call paths, so the tree of calls grows exponentially with `n`.",
        code: `function rob(nums) {
  function helper(i) {
    if (i >= nums.length) return 0;

    const skip = helper(i + 1);
    const take = nums[i] + helper(i + 2);
    return Math.max(skip, take);
  }

  return helper(0);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`if (i >= nums.length) return 0;\` | Ran off the end of the street — nothing left to rob. |
| 5 | \`const skip = helper(i + 1);\` | Choice 1: don't rob house \`i\`, move to \`i+1\` unconstrained. |
| 6 | \`const take = nums[i] + helper(i + 2);\` | Choice 2: rob house \`i\`, so house \`i+1\` is now off-limits — jump to \`i+2\`. |
| 7 | \`return Math.max(skip, take);\` | Best of the two choices at this house. |`,
        dryRunMarkdown: `**Dry run 1 ([1,2,3,1])**:
\`helper(0)\`: skip=\`helper(1)\`, take=\`1 + helper(2)\`.
\`helper(2)\`: skip=\`helper(3)\`=1, take=\`3 + helper(4)\`=3+0=3 → max=3.
\`helper(1)\`: skip=\`helper(2)\`=3, take=\`2 + helper(3)\`=2+1=3 → max=3.
Back to \`helper(0)\`: skip=3, take=\`1 + 3\`=4 → max=**4** — matches expected.

**Dry run 2 ([2,7,9,3,1])**:
Best path robs indices 0 and 2 and 4: \`2 + 9 + 1 = 12\`. The recursion explores every skip/take combination and the take-heavy path \`helper(0)\` take → \`helper(2)\` take → \`helper(4)\` take surfaces exactly this sum, which dominates all other branches (e.g. robbing 1 and 3 only gives \`7+3=10\`). Result: **12** — matches expected.`,
      },
      {
        approach: "Optimal (Rolling DP, O(1) Space)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Walk left to right keeping two rolling values: `prev` (best total *not* including the current house) and `curr` (best total including up through the current house). At each house, the new best is `max(curr, prev + num)` — either skip it (keep `curr`) or take it (`prev` plus this house's value, since `prev` excludes the immediately preceding house).",
        code: `function rob(nums) {
  let prev = 0;
  let curr = 0;

  for (const num of nums) {
    const next = Math.max(curr, prev + num);
    prev = curr;
    curr = next;
  }

  return curr;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`let prev = 0; let curr = 0;\` | Best total through "one house ago" and "this house," both starting empty. |
| 5 | \`for (const num of nums)\` | Scan left to right, one house at a time. |
| 6 | \`const next = Math.max(curr, prev + num);\` | Skip this house (keep \`curr\`) vs. take it (\`prev\` + its value, since \`prev\` already excludes the immediately preceding house). |
| 7-8 | \`prev = curr; curr = next;\` | Slide the two-value window forward. |
| 11 | \`return curr;\` | Best total after considering every house. |`,
        dryRunMarkdown: `**Dry run 1 ([1,2,3,1])**: prev=0, curr=0.
num=1: next=max(0,0+1)=1, prev=0, curr=1.
num=2: next=max(1,0+2)=2, prev=1, curr=2.
num=3: next=max(2,1+3)=4, prev=2, curr=4.
num=1: next=max(4,2+1)=4, prev=4, curr=4.
Return **4** — matches expected.

**Dry run 2 ([2,7,9,3,1])**: prev=0, curr=0.
num=2: next=max(0,2)=2, prev=0, curr=2.
num=7: next=max(2,0+7)=7, prev=2, curr=7.
num=9: next=max(7,2+9)=11, prev=7, curr=11.
num=3: next=max(11,7+3)=11, prev=11, curr=11.
num=1: next=max(11,11+1)=12, prev=11, curr=12.
Return **12** — matches expected.`,
      },
    ],
    relatedSlugs: ["house-robber-ii", "climbing-stairs"],
    realWorldUsageMarkdown: `The "maximize value subject to a no-two-adjacent constraint" shape shows up in ad-slot scheduling (don't place competing ads back-to-back), non-adjacent seat/resource selection, and cooldown-constrained job scheduling where consuming one time slot blocks the very next one.`,
  },
  {
    slug: "house-robber-ii",
    title: "House Robber II",
    difficulty: "medium",
    maangTags: ["Amazon", "Google"],
    topicSlug: "1d-dp",
    functionName: "robCircular",
    description: `## Problem

Same rules as House Robber, except the houses are arranged in a **circle** — the first and last house are now adjacent to each other too. Return the maximum amount you can rob without robbing two adjacent houses.

## Example

\`\`\`
Input: nums = [2,3,2]
Output: 3
Explanation: Robbing house 0 and house 2 isn't allowed — they're adjacent in the circle. Best is house 1 alone: 3.
\`\`\`

## Constraints

- \`1 <= nums.length <= 100\`
- \`0 <= nums[i] <= 1000\`

## Senior interview angle

The naive instinct is to write new DP for the circular case. The senior move is recognizing the circular constraint only ever rules out one pairing — "house 0 and house last both robbed" — so the whole problem reduces to two calls of the **already-solved linear** House Robber: once excluding the last house, once excluding the first, and take the max. Reusing a solved subproblem instead of re-deriving a new recurrence from scratch is exactly the kind of composition interviewers want to see.

## Pattern

\`1-D DP reduction (circular → two linear subproblems)\` — break the circular constraint by excluding one endpoint at a time.`,
    starterCode: `/**
 * @param {number[]} nums
 * @return {number}
 */
function robCircular(nums) {
  // Your code here
}`,
    testCases: [
      { input: [[2, 3, 2]], expected: 3 },
      { input: [[1, 2, 3, 1]], expected: 4 },
      { input: [[1, 2, 3]], expected: 3 },
    ],
    solutions: [
      {
        approach: "Brute Force (Subset Enumeration)",
        timeComplexity: "O(2^n · n)",
        spaceComplexity: "O(1) extra",
        overviewMarkdown:
          "Enumerate every subset of house indices via a bitmask. A subset is valid only if it contains no two indices that are adjacent **including the circular wraparound** (`i` and `(i+1) % n`). Track the max sum across all valid subsets. Exhaustive and exponential, but a direct restatement of the constraint with no cleverness required.",
        code: `function robCircular(nums) {
  const n = nums.length;
  if (n === 1) return nums[0];

  let best = 0;

  for (let mask = 0; mask < (1 << n); mask++) {
    let valid = true;
    let sum = 0;

    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        sum += nums[i];
        const next = (i + 1) % n;
        if (mask & (1 << next)) {
          valid = false;
          break;
        }
      }
    }

    if (valid) best = Math.max(best, sum);
  }

  return best;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`if (n === 1) return nums[0];\` | One house — no adjacency to worry about, including with "itself." |
| 7 | \`for (let mask = 0; mask < (1 << n); mask++)\` | Try every one of the \`2^n\` possible house subsets. |
| 11 | \`if (mask & (1 << i))\` | House \`i\` is included in this subset. |
| 13 | \`const next = (i + 1) % n;\` | The circular neighbor — wraps house \`n-1\` back to house \`0\`. |
| 14 | \`if (mask & (1 << next)) { valid = false; break; }\` | Both \`i\` and its circular neighbor are robbed — invalid, discard this subset. |
| 19 | \`if (valid) best = Math.max(best, sum);\` | Keep the best sum among all valid (non-adjacent, circular-aware) subsets. |`,
        dryRunMarkdown: `**Dry run 1 ([2,3,2])**: n=3. Valid single-house subsets: {0}=2, {1}=3, {2}=2. Two-house subsets: {0,1} adjacent (invalid), {1,2} adjacent (invalid), {0,2} — check: house 2's circular neighbor is \`(2+1)%3=0\`, and house 0 is also in the mask → invalid (0 and 2 are circular neighbors). No valid multi-house subset exists. Best = **3** — matches expected.

**Dry run 2 ([1,2,3])**: n=3, same circular-adjacency structure as above (every pair is adjacent in a 3-cycle). Best single house = index 2, value **3** — matches expected.`,
      },
      {
        approach: "Optimal (Two Linear House-Robber Passes)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n) for the slices, O(1) if indices are passed instead",
        overviewMarkdown:
          "The circular constraint only ever forbids robbing *both* house 0 and the last house. So the answer is the max of two linear House Robber runs: one over `nums[0..n-2]` (excludes the last house), one over `nums[1..n-1]` (excludes the first). Either run is free to rob the other endpoint, and since they never both include index 0 *and* the last index simultaneously, the circular constraint is automatically satisfied.",
        code: `function robCircular(nums) {
  const n = nums.length;
  if (n === 1) return nums[0];

  function robLine(houses) {
    let prev = 0;
    let curr = 0;
    for (const num of houses) {
      const next = Math.max(curr, prev + num);
      prev = curr;
      curr = next;
    }
    return curr;
  }

  return Math.max(robLine(nums.slice(0, n - 1)), robLine(nums.slice(1)));
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`if (n === 1) return nums[0];\` | Single house has no circular neighbor to conflict with. |
| 5-13 | \`function robLine(houses) { ... }\` | Exact same rolling-DP linear House Robber from the previous problem, reused as-is. |
| 16 | \`nums.slice(0, n - 1)\` | Every house except the last — the last house is never robbed in this run. |
| 16 | \`nums.slice(1)\` | Every house except the first — the first house is never robbed in this run. |
| 16 | \`Math.max(...)\` | Whichever exclusion yields more is the answer; the circular pair (first, last) is never both included in either run. |`,
        dryRunMarkdown: `**Dry run 1 ([2,3,2])**:
\`robLine([2,3])\` (drop last): prev=0,curr=0 → num=2: curr=2 → num=3: next=max(2,0+3)=3, curr=3. Result 3.
\`robLine([3,2])\` (drop first): prev=0,curr=0 → num=3: curr=3 → num=2: next=max(3,0+2)=3, curr=3. Result 3.
\`max(3,3)\` = **3** — matches expected.

**Dry run 2 ([1,2,3,1])**:
\`robLine([1,2,3])\` (drop last): num=1→curr=1; num=2→next=max(1,0+2)=2,curr=2; num=3→next=max(2,1+3)=4,curr=4. Result 4.
\`robLine([2,3,1])\` (drop first): num=2→curr=2; num=3→next=max(2,0+3)=3,curr=3; num=1→next=max(3,2+1)=3,curr=3. Result 3.
\`max(4,3)\` = **4** — matches expected.`,
      },
    ],
    relatedSlugs: ["house-robber", "longest-increasing-subsequence"],
    realWorldUsageMarkdown: `The "reduce a circular constraint to two linear subproblems" trick generalizes to any cyclic scheduling problem — non-adjacent shift selection on a rotating roster, or seat/resource selection around a round table where wraparound adjacency matters.`,
  },
  {
    slug: "longest-palindromic-substring",
    title: "Longest Palindromic Substring",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta"],
    topicSlug: "1d-dp",
    functionName: "longestPalindrome",
    description: `## Problem

Given a string \`s\`, return the **longest substring** of \`s\` that reads the same forwards and backwards.

## Example

\`\`\`
Input: s = "cbbd"
Output: "bb"
\`\`\`

## Constraints

- \`1 <= s.length <= 1000\`
- \`s\` consists of only lowercase English letters.

## Senior interview angle

The brute-force check-every-substring approach is O(n³) — O(n²) substrings, each needing an O(n) palindrome check. The optimal move is **expand around center**: every palindrome has a center (a single character for odd length, a gap between two characters for even length), and there are exactly \`2n - 1\` possible centers. Expanding outward from each one until the characters stop matching gives O(n²) time in O(1) space — no DP table required, which surprises candidates who reflexively reach for one.

## Pattern

\`Expand Around Center\` — try every possible palindrome center once, grow outward while both sides match.`,
    starterCode: `/**
 * @param {string} s
 * @return {string}
 */
function longestPalindrome(s) {
  // Your code here
}`,
    testCases: [
      { input: ["cbbd"], expected: "bb" },
      { input: ["abcbef"], expected: "bcb" },
      { input: ["a"], expected: "a" },
    ],
    solutions: [
      {
        approach: "Brute Force (Check Every Substring)",
        timeComplexity: "O(n³)",
        spaceComplexity: "O(1) extra",
        overviewMarkdown:
          "Try every `(i, j)` substring, check if it's a palindrome by scanning inward from both ends, and keep the longest one found. Only bothers checking a substring when it could beat the current best (`j - i + 1 > maxLen`), but still redoes an O(n) scan per candidate.",
        code: `function longestPalindrome(s) {
  let start = 0;
  let maxLen = 1;

  function isPalindrome(i, j) {
    while (i < j) {
      if (s[i] !== s[j]) return false;
      i++;
      j--;
    }
    return true;
  }

  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      if (j - i + 1 > maxLen && isPalindrome(i, j)) {
        start = i;
        maxLen = j - i + 1;
      }
    }
  }

  return s.slice(start, start + maxLen);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-11 | \`isPalindrome(i, j)\` | Two-pointer scan inward from both ends of the candidate substring; bails early on the first mismatch. |
| 14 | \`for (let i ...)\` / \`for (let j = i; ...)\` | Try every substring \`s[i..j]\` starting position paired with every end position. |
| 15 | \`if (j - i + 1 > maxLen && isPalindrome(i, j))\` | Only run the O(n) check when this substring could actually improve the answer. |
| 16-17 | \`start = i; maxLen = j - i + 1;\` | Record the new best. |
| 21 | \`return s.slice(start, start + maxLen);\` | Extract the winning substring. |`,
        dryRunMarkdown: `**Dry run 1 ("cbbd")**: Scanning pairs, \`i=1,j=2\` gives substring "bb", length 2 > current max 1, and \`isPalindrome(1,2)\` is true ('b'==='b') → start=1, maxLen=2. No longer palindrome found afterward (e.g. "bbd" fails since 'b'≠'d'). Result: \`s.slice(1,3)\` = **"bb"** — matches expected.

**Dry run 2 ("abcbef")**: \`i=1,j=3\` gives substring "bcb", length 3 > current max, and \`isPalindrome(1,3)\`: s[1]='b', s[3]='b' match, pointers cross → true → start=1, maxLen=3. Nothing longer follows. Result: \`s.slice(1,4)\` = **"bcb"** — matches expected.`,
      },
      {
        approach: "Optimal (Expand Around Center)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Every palindrome is defined by its center. For each index `i`, expand around the odd-length center `(i, i)` and the even-length center `(i, i+1)`, growing outward while the two sides match. Track the longest expansion seen across all `2n - 1` centers — no substring is ever re-scanned from scratch.",
        code: `function longestPalindrome(s) {
  let start = 0;
  let maxLen = 0;

  function expand(l, r) {
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      l--;
      r++;
    }
    return r - l - 1; // length of the palindrome found
  }

  for (let i = 0; i < s.length; i++) {
    const len1 = expand(i, i);     // odd length, centered on i
    const len2 = expand(i, i + 1); // even length, centered between i and i+1
    const len = Math.max(len1, len2);

    if (len > maxLen) {
      maxLen = len;
      start = i - Math.floor((len - 1) / 2);
    }
  }

  return s.slice(start, start + maxLen);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-10 | \`expand(l, r)\` | Grow outward while both sides stay in bounds and equal; returns the final palindrome length once it stops. |
| 13 | \`const len1 = expand(i, i);\` | Odd-length palindrome candidate centered exactly on \`i\`. |
| 14 | \`const len2 = expand(i, i + 1);\` | Even-length palindrome candidate centered on the gap between \`i\` and \`i+1\`. |
| 17-19 | \`if (len > maxLen) { ... start = i - Math.floor((len-1)/2); }\` | Convert the winning center + length back into a start index. |
| 22 | \`return s.slice(start, start + maxLen);\` | Extract the longest palindrome found. |`,
        dryRunMarkdown: `**Dry run 1 ("cbbd")**:
i=0 ('c'): len1=1, len2 expand(0,1): 'c'≠'b'→0. len=1 → maxLen=1, start=0.
i=1 ('b'): len1 expand(1,1): 'b'='b', then s[0]='c' vs s[2]='b' mismatch → length 1. len2 expand(1,2): s[1]='b'=s[2]='b', then s[0]='c' vs s[3]='d' mismatch → length 2. len=2 > maxLen(1) → maxLen=2, start=1-0=1.
i=2 ('b'): len1=1, len2 expand(2,3): 'b'≠'d'→0. len=1, no update.
i=3 ('d'): len1=1, no update.
Result: \`s.slice(1,3)\` = **"bb"** — matches expected.

**Dry run 2 ("abcbef")**:
i=0: len1=1,len2=0 → maxLen=1,start=0.
i=1 ('b'): len1 expand(1,1): s[0]='a' vs s[2]='c' mismatch → length 1. len2 expand(1,2): 'b'≠'c'→0. No update.
i=2 ('c'): len1 expand(2,2): s[1]='b'=s[3]='b' match, then s[0]='a' vs s[4]='e' mismatch → length 3. len2 expand(2,3): 'c'≠'b'→0. len=3 > maxLen(1) → maxLen=3, start=2-1=1.
i=3,4,5: nothing longer.
Result: \`s.slice(1,4)\` = **"bcb"** — matches expected.`,
      },
    ],
    relatedSlugs: ["valid-palindrome", "longest-increasing-subsequence"],
    realWorldUsageMarkdown: `Palindrome detection over strings shows up in bioinformatics (finding palindromic DNA/RNA sequences that mark restriction-enzyme cut sites) and in text-processing tools that locate mirrored substrings for compression heuristics or pattern-based validation.`,
  },
  {
    slug: "coin-change",
    title: "Coin Change",
    difficulty: "medium",
    maangTags: ["Google", "Amazon"],
    topicSlug: "1d-dp",
    functionName: "coinChange",
    description: `## Problem

Given an array of coin denominations \`coins\` and a target \`amount\`, return the **fewest number of coins** needed to make up that amount. If it's impossible, return \`-1\`. You have an unlimited supply of each coin.

## Example

\`\`\`
Input: coins = [1,2,5], amount = 11
Output: 3
Explanation: 11 = 5 + 5 + 1
\`\`\`

## Constraints

- \`1 <= coins.length <= 12\`
- \`1 <= coins[i] <= 2^31 - 1\`
- \`0 <= amount <= 10^4\`

## Senior interview angle

This is unbounded knapsack in disguise — each coin can be reused, so the recurrence is \`dp[amount] = 1 + min(dp[amount - coin])\` over every coin, not a single include/exclude choice per item. Candidates who've only seen 0/1 knapsack often write a per-coin single-use DP by mistake; correctly modeling "unlimited reuse" (loop coins inside the amount loop, not the other way with a used-flag) is the actual signal here.

## Pattern

\`1-D bottom-up DP (unbounded knapsack)\` — build up the minimum-coin answer for every amount from 0 to the target, reusing each coin freely.`,
    starterCode: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {
  // Your code here
}`,
    testCases: [
      { input: [[1, 2, 5], 11], expected: 3 },
      { input: [[2], 3], expected: -1 },
      { input: [[1], 0], expected: 0 },
    ],
    solutions: [
      {
        approach: "Brute Force (Recursion)",
        timeComplexity: "O(coins^amount)",
        spaceComplexity: "O(amount) call stack",
        overviewMarkdown:
          "At every remaining amount, try subtracting every coin and recurse, taking the minimum count across all choices plus 1. Correct, but the same `remaining` value gets recomputed from many different coin-choice paths, so the call tree blows up exponentially.",
        code: `function coinChange(coins, amount) {
  function helper(remaining) {
    if (remaining === 0) return 0;
    if (remaining < 0) return Infinity;

    let minCoins = Infinity;
    for (const coin of coins) {
      minCoins = Math.min(minCoins, helper(remaining - coin) + 1);
    }
    return minCoins;
  }

  const result = helper(amount);
  return result === Infinity ? -1 : result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`if (remaining === 0) return 0;\` | Hit the target exactly — no more coins needed. |
| 4 | \`if (remaining < 0) return Infinity;\` | Overshot — this path is invalid, sentinel it out of the min. |
| 7-9 | \`for (const coin of coins) { minCoins = Math.min(...) }\` | Try every coin as "the last coin used," recurse on what's left, add 1 for this coin, keep the best. |
| 13 | \`return result === Infinity ? -1 : result;\` | Translate "no valid path found" back into the required \`-1\`. |`,
        dryRunMarkdown: `**Dry run 1 (coins=[1,2,5], amount=11)**: \`helper(11)\` tries coin 1→\`helper(10)+1\`, coin 2→\`helper(9)+1\`, coin 5→\`helper(6)+1\`. Following the winning path: \`helper(6)\` (via coin 5) tries coin 5 again → \`helper(1)+1\` → \`helper(1)\` via coin 1 → \`helper(0)+1=1\`, so \`helper(1)=1\`, \`helper(6)=2\`, \`helper(11)=3\`. Note \`helper(6)\` is also reachable via \`11-5\`, \`9-... \`, etc. — recomputed independently on each path, which is the exponential blowup. Result: **3** — matches expected.

**Dry run 2 (coins=[2], amount=3)**: \`helper(3)\`: only coin 2 → \`helper(1)+1\`. \`helper(1)\`: only coin 2 → \`helper(-1)+1\` = \`Infinity+1\` = Infinity. So \`helper(1)=Infinity\`, \`helper(3)=Infinity\` → **-1** — matches expected (3 is unreachable using only 2s).`,
      },
      {
        approach: "Optimal (Bottom-Up DP)",
        timeComplexity: "O(amount · coins.length)",
        spaceComplexity: "O(amount)",
        overviewMarkdown:
          "Build a table `dp[0..amount]` where `dp[i]` is the fewest coins to make amount `i`, starting from `dp[0] = 0`. For each amount from 1 up to the target, try every coin no larger than the current amount and take the best `dp[i - coin] + 1`. Every subamount is computed exactly once.",
        code: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1;
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`dp = new Array(amount+1).fill(Infinity); dp[0] = 0;\` | \`dp[0]=0\` (zero coins needed for zero amount); everything else starts "unreachable." |
| 5 | \`for (let i = 1; i <= amount; i++)\` | Build up every subamount from 1 to the target, smallest first. |
| 6-8 | \`for (const coin of coins) { if (coin <= i && ...) dp[i] = dp[i-coin]+1; }\` | For each coin usable at this amount, check if using it as the last coin beats the current best for \`dp[i]\`. |
| 11 | \`return dp[amount] === Infinity ? -1 : dp[amount];\` | \`Infinity\` still there means no combination of coins reaches this amount. |`,
        dryRunMarkdown: `**Dry run 1 (coins=[1,2,5], amount=11)**: Building the table: dp[0]=0, dp[1]=1, dp[2]=1, dp[3]=2, dp[4]=2, dp[5]=1, dp[6]=2, dp[7]=2, dp[8]=3, dp[9]=3, dp[10]=2, dp[11]=3 (best: dp[6]+1 via coin 5, and dp[6]=dp[1]+1 via coin 5, i.e. 5+5+1). Return dp[11] = **3** — matches expected.

**Dry run 2 (coins=[2], amount=3)**: dp=[0,∞,∞,∞]. i=1: coin 2 > 1, skip → dp[1] stays ∞. i=2: coin 2 ≤ 2, dp[0]+1=1 < ∞ → dp[2]=1. i=3: coin 2 ≤ 3, dp[1]+1 = ∞+1 = ∞, not < dp[3]=∞ → dp[3] stays ∞. Return **-1** — matches expected.

**Dry run 3 (coins=[1], amount=0)**: Loop body never executes (\`i\` runs from 1 to 0, an empty range). Return dp[0] = **0** — matches expected.`,
      },
    ],
    relatedSlugs: ["climbing-stairs", "word-break"],
    realWorldUsageMarkdown: `This is the textbook change-making algorithm behind cashier/vending-machine logic and currency denomination optimization, and it generalizes to any "minimum number of fixed-size units to exactly hit a target" problem — cutting stock to length, or minimum batched API calls to reach a rate-limited quota.`,
  },
  {
    slug: "word-break",
    title: "Word Break",
    difficulty: "medium",
    maangTags: ["Google", "Amazon", "Meta"],
    topicSlug: "1d-dp",
    functionName: "wordBreak",
    description: `## Problem

Given a string \`s\` and a dictionary of strings \`wordDict\`, return \`true\` if \`s\` can be segmented into a space-separated sequence of one or more dictionary words. The same dictionary word may be reused multiple times.

## Example

\`\`\`
Input: s = "leetcode", wordDict = ["leet","code"]
Output: true
Explanation: "leetcode" segments as "leet" + "code".
\`\`\`

## Constraints

- \`1 <= s.length <= 300\`
- \`1 <= wordDict.length <= 1000\`
- \`s\` and every word in \`wordDict\` consist of lowercase English letters.

## Senior interview angle

The key realization: define \`dp[i]\` = "can s[0..i) be fully segmented?". Then \`dp[i]\` is true if there's *any* earlier breakpoint \`j < i\` where \`dp[j]\` is true **and** \`s[j..i)\` is a dictionary word. This is the same "is there a valid split point" shape as Word Break II and Palindrome Partitioning — recognizing that shape and building the boolean prefix table is worth more than any dictionary-lookup micro-optimization.

## Pattern

\`1-D bottom-up DP (valid-prefix table)\` — \`dp[i]\` depends on some earlier \`dp[j]\` plus a dictionary check on the substring between them.`,
    starterCode: `/**
 * @param {string} s
 * @param {string[]} wordDict
 * @return {boolean}
 */
function wordBreak(s, wordDict) {
  // Your code here
}`,
    testCases: [
      { input: ["leetcode", ["leet", "code"]], expected: true },
      { input: ["applepenapple", ["apple", "pen"]], expected: true },
      {
        input: ["catsandog", ["cats", "dog", "sand", "and", "cat"]],
        expected: false,
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Recursion, No Memoization)",
        timeComplexity: "O(2^n)",
        spaceComplexity: "O(n) call stack",
        overviewMarkdown:
          "From each starting index, try every possible next dictionary word (every prefix of the remainder that's in the dictionary) and recurse on what's left. Returns true as soon as any path reaches the end of the string. Correct, but `helper(start)` gets re-entered from many different earlier split points, causing exponential blowup on strings with repeated substructure.",
        code: `function wordBreak(s, wordDict) {
  const wordSet = new Set(wordDict);

  function helper(start) {
    if (start === s.length) return true;

    for (let end = start + 1; end <= s.length; end++) {
      if (wordSet.has(s.slice(start, end)) && helper(end)) {
        return true;
      }
    }

    return false;
  }

  return helper(0);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`const wordSet = new Set(wordDict);\` | O(1) dictionary membership checks instead of scanning the array. |
| 5 | \`if (start === s.length) return true;\` | Consumed the whole string via valid words — success. |
| 7-11 | \`for (let end = start+1; ...) { if (wordSet.has(...) && helper(end)) return true; }\` | Try every possible next word starting at \`start\`; if it's in the dictionary and the rest can also be segmented, this path works. |
| 13 | \`return false;\` | No word length from \`start\` led to a full segmentation. |`,
        dryRunMarkdown: `**Dry run 1 ("leetcode", ["leet","code"])**: \`helper(0)\`: end=4 → "leet" ∈ set → recurse \`helper(4)\`: end=8 → "code" ∈ set → recurse \`helper(8)\`: \`start===s.length(8)\` → **true**, propagates all the way up. Result: **true** — matches expected.

**Dry run 2 ("catsandog", ["cats","dog","sand","and","cat"])**: \`helper(0)\` tries "cat" (end=3) → \`helper(3)\`: tries "sand" (end=7) → \`helper(7)\`: remaining is "og" — no dictionary word matches any prefix of "og" → returns false. Back at \`helper(3)\`, no other substring of "sandog" is in the dictionary → false. Back at \`helper(0)\`, try "cats" (end=4) → \`helper(4)\`: remaining "andog" — "and" (end=7) is in the dictionary → \`helper(7)\`: same "og" dead end as before → false. No other option from \`helper(4)\` or \`helper(0)\` succeeds. Result: **false** — matches expected.`,
      },
      {
        approach: "Optimal (Bottom-Up DP)",
        timeComplexity: "O(n² ) (n² substrings, O(1) average Set lookup)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Build `dp[0..n]` where `dp[i]` means \"`s[0..i)` can be fully segmented.\" `dp[0] = true` (empty prefix trivially segments). For each `i`, scan every earlier split point `j`; if `dp[j]` is true and `s[j..i)` is a dictionary word, `dp[i]` is true. Every prefix is resolved exactly once, unlike the exponential re-derivation in brute force.",
        code: `function wordBreak(s, wordDict) {
  const wordSet = new Set(wordDict);
  const n = s.length;
  const dp = new Array(n + 1).fill(false);
  dp[0] = true;

  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && wordSet.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }

  return dp[n];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4-5 | \`dp = new Array(n+1).fill(false); dp[0] = true;\` | \`dp[0]\`: the empty prefix is trivially segmentable, seeding every future word boundary. |
| 7 | \`for (let i = 1; i <= n; i++)\` | Resolve every prefix length from 1 up to the full string, smallest first. |
| 8-11 | \`for (let j = 0; j < i; j++) { if (dp[j] && wordSet.has(s.slice(j,i))) { dp[i]=true; break; } }\` | Try every earlier split point \`j\`; if the prefix up to \`j\` was already segmentable and \`s[j..i)\` is a dictionary word, this prefix works too. |
| 14 | \`return dp[n];\` | Whether the entire string can be segmented. |`,
        dryRunMarkdown: `**Dry run 1 ("leetcode", n=8)**: dp[0]=true. i=4,j=0: \`s.slice(0,4)\`="leet" ∈ set and dp[0]=true → dp[4]=true. i=8,j=4: \`s.slice(4,8)\`="code" ∈ set and dp[4]=true → dp[8]=true. Return dp[8] = **true** — matches expected.

**Dry run 2 ("catsandog", n=9)**: dp[0]=true. i=3,j=0: "cat" ∈ set, dp[0]=true → dp[3]=true. i=4,j=0: "cats" ∈ set, dp[0]=true → dp[4]=true. i=7,j=3: "sand" ∈ set, dp[3]=true → dp[7]=true. i=9: check every j — dp[7]=true but \`s.slice(7,9)\`="og" ∉ set; dp[4]=true but \`s.slice(4,9)\`="andog" ∉ set; dp[3]=true but \`s.slice(3,9)\`="sandog" ∉ set; dp[0]=true but the full string "catsandog" ∉ set. No valid \`j\` found → dp[9] stays false. Return **false** — matches expected.`,
      },
    ],
    relatedSlugs: ["longest-increasing-subsequence", "coin-change"],
    realWorldUsageMarkdown: `The valid-prefix-table shape is the core of tokenizing/segmenting text without explicit spaces against a known dictionary — Chinese/Japanese word segmentation, URL slug parsing, and hashtag decomposition ("#lifeisgood" → "life is good") all reduce to Word Break.`,
  },
  {
    slug: "longest-increasing-subsequence",
    title: "Longest Increasing Subsequence",
    difficulty: "medium",
    maangTags: ["Google", "Amazon"],
    topicSlug: "1d-dp",
    functionName: "lengthOfLIS",
    description: `## Problem

Given an integer array \`nums\`, return the length of the longest **strictly increasing** subsequence. A subsequence doesn't need to be contiguous, just in the original relative order.

## Example

\`\`\`
Input: nums = [10,9,2,5,3,7,101,18]
Output: 4
Explanation: The LIS is [2,3,7,101] (or [2,5,7,101], both length 4).
\`\`\`

## Constraints

- \`1 <= nums.length <= 2500\`
- \`-10^4 <= nums[i] <= 10^4\`

## Senior interview angle

Nearly every candidate can derive the O(n²) DP (\`dp[i]\` = longest LIS ending at \`i\`, checking every earlier \`j\`). The senior differentiator is the O(n log n) **patience sorting** trick: maintain an array \`tails\` where \`tails[k]\` is the smallest possible tail value of any increasing subsequence of length \`k+1\`. Binary-searching for where each new number fits keeps \`tails\` sorted and shrinks the problem to one binary search per element — \`tails\` itself is *not* a valid subsequence, which is the detail that trips people up when asked to also reconstruct the actual sequence.

## Pattern

\`Patience sorting + binary search\` — track the smallest tail achievable for every subsequence length, growing or replacing tails in O(log n) per element.`,
    starterCode: `/**
 * @param {number[]} nums
 * @return {number}
 */
function lengthOfLIS(nums) {
  // Your code here
}`,
    testCases: [
      { input: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4 },
      { input: [[0, 1, 0, 3, 2, 3]], expected: 4 },
      { input: [[7, 7, 7, 7]], expected: 1 },
    ],
    solutions: [
      {
        approach: "Brute Force (Recursion)",
        timeComplexity: "O(2^n)",
        spaceComplexity: "O(n) call stack",
        overviewMarkdown:
          "At each index, decide to skip it, or take it if it's strictly greater than the previously taken element (tracked via `prevIndex`), and recurse either way. Take the max over both choices at every step. Explores every subsequence, so it's exponential.",
        code: `function lengthOfLIS(nums) {
  function helper(i, prevIndex) {
    if (i === nums.length) return 0;

    const skip = helper(i + 1, prevIndex);

    let take = 0;
    if (prevIndex === -1 || nums[i] > nums[prevIndex]) {
      take = 1 + helper(i + 1, i);
    }

    return Math.max(skip, take);
  }

  return helper(0, -1);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`if (i === nums.length) return 0;\` | Ran out of elements — no more to add to the subsequence. |
| 5 | \`const skip = helper(i + 1, prevIndex);\` | Choice 1: leave \`nums[i]\` out entirely, "last taken" stays unchanged. |
| 8-10 | \`if (prevIndex === -1 \|\| nums[i] > nums[prevIndex]) { take = 1 + helper(i+1, i); }\` | Choice 2: only legal if nothing's been taken yet, or \`nums[i]\` strictly extends the increasing run — then it becomes the new "last taken." |
| 12 | \`return Math.max(skip, take);\` | Best of the two choices. |`,
        dryRunMarkdown: `**Dry run 1 ([10,9,2,5,3,7,101,18])**: The winning path takes indices 2,4,5,6 (values 2,3,7,101) or 2,3,5,6 (values 2,5,7,101) — either way a strictly increasing run of length 4. At each of those indices, \`nums[i] > nums[prevIndex]\` holds against the last taken value, so \`take\` fires and accumulates \`1 + ...\` four times; every other branch (e.g. trying to extend from 10 or 9 first) dead-ends shorter. \`helper(0,-1)\` returns the max across all branches: **4** — matches expected.

**Dry run 2 ([7,7,7,7])**: \`helper(0,-1)\`: \`prevIndex===-1\` so taking \`nums[0]=7\` is allowed → \`take = 1 + helper(1,0)\`. Inside \`helper(1,0)\`: \`nums[1]=7\` is not \`> nums[0]=7\` (not strictly greater) → take is disallowed, only skip continues, and the same holds all the way down — nothing more can ever be taken after the first element. So \`helper(1,0)=0\`, \`take=1\`. The skip branch at the top, \`helper(1,-1)\`, can also take exactly one 7 by the same logic, also yielding 1. Max = **1** — matches expected.`,
      },
      {
        approach: "Optimal (Patience Sorting + Binary Search)",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Maintain `tails`, where `tails[k]` is the smallest tail value achievable by an increasing subsequence of length `k+1` seen so far. For each new number, binary-search `tails` for the first entry `>= num`: if found, replace it (a smaller tail keeps future extensions easier); if not found, append (this number extends the longest run found so far). The final length of `tails` is the LIS length — `tails` itself may not be an actual subsequence of `nums`, only its length is meaningful.",
        code: `function lengthOfLIS(nums) {
  const tails = [];

  for (const num of nums) {
    let lo = 0;
    let hi = tails.length;

    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (tails[mid] < num) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }

    if (lo === tails.length) {
      tails.push(num);
    } else {
      tails[lo] = num;
    }
  }

  return tails.length;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`const tails = [];\` | \`tails[k]\` = smallest tail value of any increasing subsequence of length \`k+1\` found so far. |
| 5-13 | binary search loop | Find the leftmost position in \`tails\` that is \`>= num\` (lower bound). |
| 15-16 | \`if (lo === tails.length) tails.push(num);\` | \`num\` is bigger than every current tail — it extends the longest run by one. |
| 17-18 | \`else tails[lo] = num;\` | \`num\` can replace an existing tail with a smaller value, keeping future extensions easier without changing the achieved length. |
| 22 | \`return tails.length;\` | The number of tail slots ever created equals the LIS length. |`,
        dryRunMarkdown: `**Dry run 1 ([10,9,2,5,3,7,101,18])**:
10 → tails=[10].
9 → 9<10, replace idx0 → tails=[9].
2 → 2<9, replace idx0 → tails=[2].
5 → 5>2, append → tails=[2,5].
3 → binary search: 3>2, 3<5 → lo=1, replace idx1 → tails=[2,3].
7 → 7>3, append → tails=[2,3,7].
101 → append → tails=[2,3,7,101].
18 → 18<101, replace idx3 → tails=[2,3,7,18].
Final \`tails.length\` = **4** — matches expected.

**Dry run 2 ([0,1,0,3,2,3])**:
0 → tails=[0].
1 → append → tails=[0,1].
0 → replace idx0 → tails=[0,1].
3 → append → tails=[0,1,3].
2 → binary search: 2>1, 2<3 → lo=2, replace idx2 → tails=[0,1,2].
3 → append → tails=[0,1,2,3].
Final \`tails.length\` = **4** — matches expected.`,
      },
    ],
    relatedSlugs: ["longest-palindromic-substring", "house-robber-ii"],
    realWorldUsageMarkdown: `Patience-sorting LIS underlies "patience diff" algorithms used by version-control tools to find long unchanged runs between file versions, stock-price "longest non-decreasing run" analyses, and box-stacking/scheduling problems that reduce to finding the longest strictly increasing chain of constraints.`,
  },
];

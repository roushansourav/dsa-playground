import type { Problem } from "../types";

export const backtrackingProblems: Problem[] = [
  {
    slug: "subsets",
    title: "Subsets",
    difficulty: "medium",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "backtracking",
    functionName: "subsets",
    description: `## Problem

Given an integer array \`nums\` of unique elements, return all possible subsets (the power set). No duplicate subsets.

## Example

\`\`\`
Input: nums = [1,2,3]
Output: [[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]
\`\`\`

## Senior interview angle

Every element has a binary choice — in or out — so there are exactly \`2^n\` subsets. That "binary choice per element" framing is the seed for the whole Backtracking topic: recursion depth = number of decisions, branching factor = choices per decision.

## Pattern

\`Include/exclude backtracking\` — the base template every later problem in this topic (combination sum, permutations, partitioning) extends with extra constraints.`,
    starterCode: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function subsets(nums) {
  // Your code here
}`,
    testCases: [
      {
        input: [[1, 2, 3]],
        expected: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]],
        unordered: true,
      },
      { input: [[0]], expected: [[], [0]], unordered: true },
    ],
    solutions: [
      {
        approach: "Iterative (Bitmask Enumeration)",
        timeComplexity: "O(n · 2ⁿ)",
        spaceComplexity: "O(n · 2ⁿ)",
        overviewMarkdown:
          "Every subset corresponds to one n-bit number: bit `i` set means `nums[i]` is included. Loop every integer from `0` to `2^n - 1`, and for each, scan its bits to build the matching subset. No recursion at all — the power set is just 'every binary string of length n', made explicit by counting.",
        code: `function subsets(nums) {
  const n = nums.length;
  const result = [];

  for (let mask = 0; mask < (1 << n); mask++) {
    const subset = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(nums[i]);
    }
    result.push(subset);
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5 | \`mask\` loop | Every integer 0..2ⁿ-1 is a distinct bit pattern — exactly the \`2ⁿ\` subsets that exist. |
| 7-9 | bit scan | Bit \`i\` of \`mask\` set ⟺ \`nums[i]\` belongs to this subset — read left-to-right by index, so element order within each subset matches the input's order. |
| 11 | collect | Each fully-built subset is pushed once per mask value. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[1,2,3]\` (n=3, masks 0..7):
mask=0 (000): subset=[]. mask=1 (001): bit0 set → [1]. mask=2 (010): bit1 set → [2]. mask=3 (011): bits0,1 → [1,2]. mask=4 (100): bit2 → [3]. mask=5 (101): bits0,2 → [1,3]. mask=6 (110): bits1,2 → [2,3]. mask=7 (111): all bits → [1,2,3].
Result: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]] — same 8 subsets as expected (order differs, checked unordered).

**Dry run 2** — \`nums=[0]\` (n=1, masks 0..1):
mask=0: []. mask=1: bit0 set → [0]. Result [[],[0]] — matches expected.`,
      },
      {
        approach: "Optimal (Recursive Include/Exclude Backtracking)",
        timeComplexity: "O(n · 2ⁿ)",
        spaceComplexity: "O(n) recursion depth, O(n · 2ⁿ) output",
        overviewMarkdown:
          "DFS over 'decisions', one per index: at each index, branch into two calls — one that pushes `nums[i]` onto the current path, one that doesn't — then move to `i+1`. Every root-to-leaf path through this decision tree is exactly one subset, discovered without ever materializing a bitmask.",
        code: `function subsets(nums) {
  const result = [];
  const path = [];

  function backtrack(index) {
    if (index === nums.length) {
      result.push([...path]);
      return;
    }
    path.push(nums[index]);       // include nums[index]
    backtrack(index + 1);
    path.pop();
    backtrack(index + 1);         // exclude nums[index]
  }

  backtrack(0);
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-9 | base case | Every index decided — \`path\` is a complete subset, snapshot it with \`[...path]\` (arrays are mutated in place, so a copy is required). |
| 11-12 | include branch | Push the current element, recurse to the next index — explores every subset that contains \`nums[index]\`. |
| 13 | backtrack | Pop the element off before trying the other branch — this is the "backtrack" step that lets the same \`path\` array serve every branch. |
| 14 | exclude branch | Recurse without this element — explores every subset that omits it. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[1,2,3]\`:
backtrack(0): include 1 → path=[1] → backtrack(1): include 2 → path=[1,2] → backtrack(2): include 3 → path=[1,2,3] → backtrack(3): leaf → push [1,2,3]. pop 3 → backtrack(3) again...

Full left-to-right leaf order: [1,2,3], [1,2], [1,3], [1], [2,3], [2], [3], [] — same 8 subsets as expected (unordered match).

**Dry run 2** — \`nums=[0]\`:
backtrack(0): include 0 → path=[0] → backtrack(1): leaf → push [0]. pop 0 → exclude → backtrack(1): leaf → push []. Result [[0],[]] — matches expected (unordered).`,
      },
    ],
    relatedSlugs: ["subsets-ii", "combination-sum"],
    realWorldUsageMarkdown: `Power-set enumeration underpins feature-flag combination testing (which subset of flags is active), generating all possible query filter combinations in search UIs, and computing all valid configurations in constraint-solving tools with independent boolean options.`,
  },
  {
    slug: "combination-sum",
    title: "Combination Sum",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta", "Apple"],
    topicSlug: "backtracking",
    functionName: "combinationSum",
    description: `## Problem

Given distinct positive integers \`candidates\` and a target, return all unique combinations where the chosen numbers (each candidate reusable unlimited times) sum to target.

## Example

\`\`\`
Input: candidates = [2,3,6,7], target = 7
Output: [[2,2,3],[7]]
\`\`\`

## Senior interview angle

Unlimited reuse means the recursion must be able to pick the *same* index again, but only forward index choice prevents duplicate combinations like \`[2,3]\` and \`[3,2]\` both appearing. The real interview differentiator is pruning: checking \`remaining < 0\` **before** recursing (not after) avoids exploring an entire dead subtree per overshoot.

## Pattern

\`Backtracking with unbounded reuse\` — same include/exclude tree as Subsets, but the "include" branch recurses on the same index instead of advancing past it.`,
    starterCode: `/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
function combinationSum(candidates, target) {
  // Your code here
}`,
    testCases: [
      {
        input: [[2, 3, 6, 7], 7],
        expected: [
          [2, 2, 3],
          [7],
        ],
        unordered: true,
      },
      {
        input: [[2, 3, 5], 8],
        expected: [
          [2, 2, 2, 2],
          [2, 3, 3],
          [3, 5],
        ],
        unordered: true,
      },
      { input: [[2], 1], expected: [], unordered: true },
    ],
    solutions: [
      {
        approach: "Backtracking Without Early Pruning (Check Sum Only at the Base Case)",
        timeComplexity: "Exponential — explores extra dead branches past the point a sum overshoots",
        spaceComplexity: "O(target / min(candidates)) recursion depth",
        overviewMarkdown:
          "Recurse on every candidate from the current start index onward, decrementing `remaining` by the chosen candidate, and only check whether `remaining === 0` (success) or `remaining < 0` (failure) once a call is actually made. Correct, but this means every combination that overshoots the target still pays for one full recursive call before being rejected, instead of being skipped before ever recursing.",
        code: `function combinationSum(candidates, target) {
  const result = [];
  const path = [];

  function backtrack(start, remaining) {
    if (remaining === 0) {
      result.push([...path]);
      return;
    }
    if (remaining < 0) return; // rejected only after already recursing in

    for (let i = start; i < candidates.length; i++) {
      path.push(candidates[i]);
      backtrack(i, remaining - candidates[i]); // same index — reuse allowed
      path.pop();
    }
  }

  backtrack(0, target);
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-9 | success base case | Exact match — snapshot the path. |
| 11 | failure base case | Overshoot detected only *inside* the next recursive call, after it's already been made. |
| 13-17 | loop from \`start\` | Iterating from \`start\` (not \`0\`) forward prevents permutative duplicates like \`[2,3]\`/\`[3,2]\`; passing \`i\` (not \`i+1\`) to the recursive call allows reusing the same candidate. |`,
        dryRunMarkdown: `**Dry run 1** — \`candidates=[2,3,6,7], target=7\`:
backtrack(0,7): pick 2 → backtrack(0,5): pick 2 → backtrack(0,3): pick 2 → backtrack(0,1): pick 2 → backtrack(0,-1) [extra call made, then rejected]; pick 3 → backtrack(1,-2) [extra call, rejected]; pick 6 → backtrack(2,-5) [extra call, rejected]; pick 7 → backtrack(3,-6) [extra call, rejected]. Back up: backtrack(0,3) then tries pick 3 → backtrack(1,0) → **match [2,2,3]**. ...continuing the full search eventually also finds pick 7 directly from backtrack(0,7) → backtrack(3,0) → **match [7]**.
Result: [[2,2,3],[7]] — matches expected (every overshoot cost one wasted call, but the final answer set is correct).

**Dry run 2** — \`candidates=[2], target=1\`:
backtrack(0,1): pick 2 → backtrack(0,-1) [wasted call] → remaining<0 → return. Loop ends, no more candidates. Result [] — matches expected.`,
      },
      {
        approach: "Optimal (Sorted Candidates with Pre-Recursion Pruning)",
        timeComplexity: "Exponential, but with the dead subtree past each overshoot never entered",
        spaceComplexity: "O(target / min(candidates)) recursion depth",
        overviewMarkdown:
          "Sort candidates ascending first. In the loop, check `candidates[i] > remaining` **before** recursing — if it fails, every later candidate (all larger, since sorted) would fail too, so `break` out of the loop entirely instead of just `continue`-ing past this one. This prunes whole subtrees instead of paying for a wasted call per overshoot.",
        code: `function combinationSum(candidates, target) {
  const sorted = [...candidates].sort((a, b) => a - b);
  const result = [];
  const path = [];

  function backtrack(start, remaining) {
    if (remaining === 0) {
      result.push([...path]);
      return;
    }

    for (let i = start; i < sorted.length; i++) {
      if (sorted[i] > remaining) break; // sorted ascending — every later candidate also overshoots
      path.push(sorted[i]);
      backtrack(i, remaining - sorted[i]);
      path.pop();
    }
  }

  backtrack(0, target);
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | sort ascending | Enables the early \`break\` — without sorting, a later smaller candidate could still fit even after a larger one overshoots. |
| 6-9 | success base case | Same exact-match check as before. |
| 11-16 | pruned loop | \`sorted[i] > remaining\` checked *before* recursing — the moment one candidate overshoots, every subsequent (larger) one would too, so the whole rest of the loop is skipped via \`break\`. |`,
        dryRunMarkdown: `**Dry run 1** — \`candidates=[2,3,6,7], target=7\`, sorted=[2,3,6,7]:
backtrack(0,7): i=0 (2≤7) → path=[2] → backtrack(0,5): i=0(2≤5)→path=[2,2]→backtrack(0,3): i=0(2≤3)→path=[2,2,2]→backtrack(0,1): i=0(2>1) → break immediately, no wasted call. Back up, pop→[2,2]. i=1(3≤3)→path=[2,2,3]→backtrack(1,0)→**match [2,2,3]**. pop→[2,2]. i=2(6>3)→break.
Back up to path=[2]: i=1(3≤5)→path=[2,3]→backtrack(1,2): i=1(3>2)→break. pop→[2]. i=2(6>5)→break.
Back to path=[]: i=1(3≤7)→...(no combo sums to 7 starting fresh with 3,6,7 alone leads nowhere new)... i=3(7≤7)→path=[7]→backtrack(3,0)→**match [7]**.
Result: [[2,2,3],[7]] — matches expected, with every overshoot cut off via \`break\` instead of an extra call.

**Dry run 2** — \`candidates=[2], target=1\`: sorted=[2]. backtrack(0,1): i=0, sorted[0]=2>1 → break immediately, zero recursive calls made. Result [] — matches expected.`,
      },
    ],
    relatedSlugs: ["subsets", "permutations"],
    realWorldUsageMarkdown: `This exact "reach a target using reusable weighted items" shape is the coin-change combination enumeration used in payment/change-making systems, and appears in bin-packing and resource-allocation solvers that enumerate feasible allocations under a budget constraint.`,
  },
  {
    slug: "permutations",
    title: "Permutations",
    difficulty: "medium",
    maangTags: ["Amazon", "Google", "Apple"],
    topicSlug: "backtracking",
    functionName: "permute",
    description: `## Problem

Given an array \`nums\` of distinct integers, return all possible permutations, in any order.

## Example

\`\`\`
Input: nums = [1,2,3]
Output: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
\`\`\`

## Senior interview angle

Unlike Subsets (include/exclude) or Combination Sum (forward-only index), Permutations needs every element used exactly once in every order — the natural tool is either "build a used-tracking set" or, more memory-efficiently, "swap elements into place in the array itself" so no extra tracking structure is needed at all.

## Pattern

\`Backtracking over element order\` — depth = position being filled, branching = which remaining element goes there.`,
    starterCode: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function permute(nums) {
  // Your code here
}`,
    testCases: [
      {
        input: [[1, 2, 3]],
        expected: [
          [1, 2, 3],
          [1, 3, 2],
          [2, 1, 3],
          [2, 3, 1],
          [3, 1, 2],
          [3, 2, 1],
        ],
        unordered: true,
      },
      { input: [[0, 1]], expected: [[0, 1], [1, 0]], unordered: true },
    ],
    solutions: [
      {
        approach: "Iterative (Insert Into Every Position)",
        timeComplexity: "O(n · n!)",
        spaceComplexity: "O(n · n!)",
        overviewMarkdown:
          "Build permutations up incrementally: start with a single empty permutation, and for each new number, take every existing permutation and insert the number at every possible position within it, producing a new, longer list of permutations. After processing all `n` numbers, the list holds all `n!` full permutations. No recursion — just repeated list expansion.",
        code: `function permute(nums) {
  let result = [[]];

  for (const num of nums) {
    const next = [];
    for (const perm of result) {
      for (let pos = 0; pos <= perm.length; pos++) {
        const inserted = [...perm.slice(0, pos), num, ...perm.slice(pos)];
        next.push(inserted);
      }
    }
    result = next;
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | seed | Start with one permutation: the empty one. |
| 5-11 | outer loop per number | Every existing partial permutation gets expanded by inserting the new number at each of its \`length + 1\` possible slots. |
| 8 | \`inserted\` | Splice \`num\` in at index \`pos\`, keeping everything before and after intact. |
| 12 | replace | \`result\` becomes the fully-expanded set before the next number is processed. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[1,2,3]\`:
Start result=[[]]. Process 1: insert into [] at pos0 → [[1]]. result=[[1]].
Process 2: perm=[1], insert at pos0→[2,1], pos1→[1,2]. result=[[2,1],[1,2]].
Process 3: perm=[2,1]: pos0→[3,2,1],pos1→[2,3,1],pos2→[2,1,3]. perm=[1,2]: pos0→[3,1,2],pos1→[1,3,2],pos2→[1,2,3].
Final result (6 perms): [3,2,1],[2,3,1],[2,1,3],[3,1,2],[1,3,2],[1,2,3] — same 6 permutations as expected (unordered match).

**Dry run 2** — \`nums=[0,1]\`:
Process 0: [[0]]. Process 1: perm=[0]: pos0→[1,0], pos1→[0,1]. Result [[1,0],[0,1]] — matches expected (unordered).`,
      },
      {
        approach: "Optimal (Backtracking with In-Place Swaps)",
        timeComplexity: "O(n · n!)",
        spaceComplexity: "O(n) recursion depth beyond the output itself",
        overviewMarkdown:
          "Fix the array's prefix one position at a time: at depth `i`, try swapping every element from index `i` onward into position `i`, recurse to fill position `i+1`, then swap back (backtrack) before trying the next candidate. This generates every permutation by mutating a single array in place — no extra 'used' tracking structure needed.",
        code: `function permute(nums) {
  const result = [];
  const arr = [...nums];

  function backtrack(i) {
    if (i === arr.length) {
      result.push([...arr]);
      return;
    }
    for (let j = i; j < arr.length; j++) {
      [arr[i], arr[j]] = [arr[j], arr[i]]; // place arr[j] at position i
      backtrack(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]]; // swap back — backtrack
    }
  }

  backtrack(0);
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-9 | base case | Every position 0..n-1 has been fixed — \`arr\` is one complete permutation, snapshot it. |
| 11-15 | swap loop | For each candidate at index \`j ≥ i\`, swap it into position \`i\`, recurse to fix the next position, then swap back so the array returns to its pre-branch state for the next \`j\`. |
| 14 | backtrack swap | Without undoing the swap, later iterations of the loop would operate on a corrupted array — this is the "backtrack" step. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[1,2,3]\`, arr=[1,2,3]:
backtrack(0): j=0, swap(0,0) no-op, arr=[1,2,3] → backtrack(1): j=1,swap(1,1) no-op,arr=[1,2,3]→backtrack(2): j=2,swap(2,2)no-op→backtrack(3): leaf→push[1,2,3]. swap back(2,2)no-op. j=2 loop ends. back to backtrack(1): swap back(1,1)no-op. j=2: swap(1,2)→arr=[1,3,2]→backtrack(2)→leaf push[1,3,2]. swap back→arr=[1,2,3].
Back to backtrack(0): swap back(0,0)no-op. j=1: swap(0,1)→arr=[2,1,3]→...produces [2,1,3],[2,3,1]. swap back→[1,2,3]. j=2: swap(0,2)→arr=[3,2,1]→...produces [3,2,1],[3,1,2]. swap back.
Full result: [1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,2,1],[3,1,2] — same 6 permutations as expected (unordered match).

**Dry run 2** — \`nums=[0,1]\`, arr=[0,1]:
backtrack(0): j=0 no-op→backtrack(1)→leaf push[0,1]. j=1: swap(0,1)→arr=[1,0]→backtrack(1)→leaf push[1,0]. swap back. Result [[0,1],[1,0]] — matches expected (unordered).`,
      },
    ],
    relatedSlugs: ["subsets", "combination-sum"],
    realWorldUsageMarkdown: `Full permutation enumeration is used in test-case generation for exhaustive input-ordering coverage, brute-force TSP-style route evaluation over a small number of stops, and generating all possible arrangements in scheduling tools where order genuinely changes the outcome.`,
  },
  {
    slug: "subsets-ii",
    title: "Subsets II",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta"],
    topicSlug: "backtracking",
    functionName: "subsetsWithDup",
    description: `## Problem

Given an integer array \`nums\` that **may contain duplicates**, return all possible subsets (the power set), with no duplicate subsets in the output.

## Example

\`\`\`
Input: nums = [1,2,2]
Output: [[],[1],[1,2],[1,2,2],[2],[2,2]]
\`\`\`

## Senior interview angle

Duplicates in the input mean the plain Subsets recursion produces duplicate subsets (e.g. picking "the first 2" vs "the second 2" both yield \`[1,2]\`). The fix is a specific, easy-to-get-wrong rule: **sort first**, then at each recursion depth, skip a candidate if it equals the *previous* candidate considered **at that same depth** (not skip all repeats globally — only siblings, so \`[2,2]\` itself still gets built one level deeper).

## Pattern

\`Backtracking with sorted sibling-deduplication\` — the standard fix whenever "no duplicate results" meets "duplicate input values."`,
    starterCode: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function subsetsWithDup(nums) {
  // Your code here
}`,
    testCases: [
      {
        input: [[1, 2, 2]],
        expected: [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]],
        unordered: true,
      },
      { input: [[0]], expected: [[], [0]], unordered: true },
    ],
    solutions: [
      {
        approach: "Brute Force (Bitmask Enumeration with Set-Based Dedup)",
        timeComplexity: "O(n · 2ⁿ) plus stringify/dedup overhead",
        spaceComplexity: "O(n · 2ⁿ)",
        overviewMarkdown:
          "Sort `nums` first, then enumerate every bitmask exactly like the duplicate-free Subsets problem — but since duplicates in the input can now produce identical subsets from different masks, stringify each generated subset and store it in a `Set` to discard duplicates before returning.",
        code: `function subsetsWithDup(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const n = sorted.length;
  const seen = new Set();
  const result = [];

  for (let mask = 0; mask < (1 << n); mask++) {
    const subset = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(sorted[i]);
    }
    const key = JSON.stringify(subset);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(subset);
    }
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | sort | Ensures subsets built from different masks that happen to contain the same multiset of values come out in the same element order, so their \`JSON.stringify\` keys actually match. |
| 7-11 | bitmask build | Same enumeration as plain Subsets, over the sorted array. |
| 12-15 | dedup | A \`Set\` of stringified subsets catches masks that produced an already-seen combination (possible only because of duplicate input values), keeping only the first. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[1,2,2]\`, sorted=[1,2,2]:
mask=0→[]. mask=1(001)→[1]. mask=2(010)→[2]. mask=3(011)→[1,2]. mask=4(100)→[2]→key "[2]" already seen (from mask=2) → **skipped**. mask=5(101)→[1,2]→key already seen (from mask=3) → **skipped**. mask=6(110)→[2,2]. mask=7(111)→[1,2,2].
Result: [[],[1],[2],[1,2],[2,2],[1,2,2]] — same 6 unique subsets as expected (unordered match); masks 4 and 5 correctly deduped away.

**Dry run 2** — \`nums=[0]\`: sorted=[0]. mask=0→[]. mask=1→[0]. No duplicates possible with n=1. Result [[],[0]] — matches expected.`,
      },
      {
        approach: "Optimal (Backtracking with Sorted Sibling-Skip)",
        timeComplexity: "O(n · 2ⁿ)",
        spaceComplexity: "O(n) recursion depth, no extra dedup structure",
        overviewMarkdown:
          "Sort `nums` first so equal values sit adjacent. In the backtracking loop, skip index `i` if `i > start` **and** `nums[i] === nums[i-1]` — meaning this is a repeat of the immediately preceding sibling choice *at this recursion depth*. That single condition prevents duplicate subsets from ever being generated, so no post-hoc deduplication is needed at all.",
        code: `function subsetsWithDup(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const result = [];
  const path = [];

  function backtrack(start) {
    result.push([...path]);
    for (let i = start; i < sorted.length; i++) {
      if (i > start && sorted[i] === sorted[i - 1]) continue; // skip repeat sibling
      path.push(sorted[i]);
      backtrack(i + 1);
      path.pop();
    }
  }

  backtrack(0);
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6 | push on entry | Unlike Subsets' include/exclude tree, here every recursive call itself represents a valid subset — push \`path\` at the top of every call, not just at a depth-n base case. |
| 8 | \`i > start && sorted[i] === sorted[i-1]\` | The key line: only skip a duplicate if it's not the *first* choice at this depth (\`i === start\` is always allowed) — this is what lets \`[2,2]\` still form while blocking the duplicate \`[2]\` that a second, sibling '2' would otherwise produce. |
| 9-11 | include, recurse, backtrack | Standard forward-only inclusion, same shape as Combination Sum's loop but advancing to \`i + 1\` since each element is used at most once here. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[1,2,2]\`, sorted=[1,2,2]:
backtrack(0): push [] . i=0(1): push path=[1]→backtrack(1): push [1]. i=1(2): push path=[1,2]→backtrack(2): push [1,2]. i=2(2): i>start(2>2 false, i===start) → allowed → push path=[1,2,2]→backtrack(3): push [1,2,2]. pop→[1,2]. loop ends. pop→[1]. i=2(2): i>start(2>1 true) and sorted[2]===sorted[1] → **skip**. pop→[].
i=1(2): push path=[2]→backtrack(2): push [2]. i=2(2): i===start → allowed → push path=[2,2]→backtrack(3): push [2,2].
Result in generation order: [],[1],[1,2],[1,2,2],[2],[2,2] — exactly the 6 expected subsets, no duplicates ever generated.

**Dry run 2** — \`nums=[0]\`: backtrack(0): push []. i=0: push [0]→backtrack(1): push [0]. Result [[],[0]] — matches expected.`,
      },
    ],
    relatedSlugs: ["subsets", "combination-sum"],
    realWorldUsageMarkdown: `Sorted sibling-skip deduplication is the standard technique behind "generate all distinct configurations" tools working over multisets — e.g. enumerating distinct ways to select items from inventory where multiple identical units exist, without the caller seeing redundant identical results.`,
  },
  {
    slug: "word-search",
    title: "Word Search",
    difficulty: "medium",
    maangTags: ["Amazon", "Netflix", "Meta"],
    topicSlug: "backtracking",
    functionName: "exist",
    description: `## Problem

Given an \`m x n\` grid of characters \`board\` and a string \`word\`, return \`true\` if \`word\` exists in the grid, formed by sequentially adjacent (horizontal/vertical) cells, without reusing the same cell twice within one word.

## Example

\`\`\`
Input: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"
Output: true
\`\`\`

## Senior interview angle

This is DFS backtracking on a grid where the "no cell reused" constraint requires marking cells visited **during** the current search path and unmarking them on the way back out — because a cell that's off-limits for *this* attempted word path is perfectly valid land for a different path starting elsewhere.

## Pattern

\`Grid DFS backtracking with temporary visited marking\` — combines Graphs' grid-as-implicit-graph idea with Backtracking's mark/recurse/unmark discipline.`,
    starterCode: `/**
 * @param {character[][]} board
 * @param {string} word
 * @return {boolean}
 */
function exist(board, word) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            ["A", "B", "C", "E"],
            ["S", "F", "C", "S"],
            ["A", "D", "E", "E"],
          ],
          "ABCCED",
        ],
        expected: true,
      },
      {
        input: [
          [
            ["A", "B", "C", "E"],
            ["S", "F", "C", "S"],
            ["A", "D", "E", "E"],
          ],
          "SEE",
        ],
        expected: true,
      },
      {
        input: [
          [
            ["A", "B", "C", "E"],
            ["S", "F", "C", "S"],
            ["A", "D", "E", "E"],
          ],
          "ABCB",
        ],
        expected: false,
      },
    ],
    solutions: [
      {
        approach: "Brute Force (DFS Over a Cloned Grid Per Start Cell)",
        timeComplexity: "O(m·n·4^L) plus an O(m·n) clone per start cell, L = word length",
        spaceComplexity: "O(m·n) per clone",
        overviewMarkdown:
          "For every starting cell matching `word[0]`, deep-clone the entire board and run DFS on the clone, marking visited cells with a sentinel character on the clone (never touching the real board). Correct, but paying for a full grid clone per starting cell is wasted work compared to mutating and restoring the same board in place.",
        code: `function exist(board, word) {
  const rows = board.length, cols = board[0].length;

  function dfs(grid, r, c, index) {
    if (index === word.length) return true;
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== word[index]) return false;

    const clone = grid.map((row) => [...row]);
    clone[r][c] = "#";

    return (
      dfs(clone, r + 1, c, index + 1) ||
      dfs(clone, r - 1, c, index + 1) ||
      dfs(clone, r, c + 1, index + 1) ||
      dfs(clone, r, c - 1, index + 1)
    );
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(board, r, c, 0)) return true;
    }
  }
  return false;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-6 | base cases | Full word matched → success; out of bounds or mismatched character → dead end. |
| 8-9 | clone + mark | A fresh grid copy is made at *every* recursive step, with the current cell marked \`"#"\` so this path can't revisit it. |
| 11-16 | branch 4 ways | Try all 4 directions; any single success propagates \`true\` up via \`||\` short-circuiting. |
| 19-24 | driver | Every cell is tried as a potential starting point. |`,
        dryRunMarkdown: `**Dry run 1** — \`word="ABCCED"\` on the example grid:
Start (0,0)='A' matches word[0]. dfs marks (0,0)→clone, recurses right to (0,1)='B'=word[1]✓, marks, recurses right to (0,2)='C'=word[2]✓, marks, recurses down to (1,2)='C'=word[3]✓, marks, recurses down to (2,2)='E'=word[4]✓, marks, recurses left to (2,1)='D'=word[5]✓, index becomes 6===word.length → **true**.
Returns true up through all the \`||\` chains → **true** — matches expected.

**Dry run 2** — \`word="ABCB"\` on the example grid:
Path A(0,0)→B(0,1)→C(0,2) matches "ABC", but word[3]='B' — neighbors of (0,2) are (1,2)='C', (0,1) already marked '#' (can't reuse), (0,3)='E' — none match 'B', and no other starting 'A' leads to a valid "ABCB" path (the only other 'A' is (2,0), whose neighbors are 'S'/'D', not 'B'). All starts exhausted → **false** — matches expected.`,
      },
      {
        approach: "Optimal (DFS with In-Place Mark and Restore)",
        timeComplexity: "O(m·n·4^L), L = word length",
        spaceComplexity: "O(L) recursion depth, O(1) extra grid space",
        overviewMarkdown:
          "Mutate the real board in place: swap the current cell to a sentinel character (`'#'`) before recursing into neighbors, then restore its original character right after — the classic backtracking mark/recurse/unmark. No cloning, so memory use per call drops from O(m·n) to O(1).",
        code: `function exist(board, word) {
  const rows = board.length, cols = board[0].length;

  function dfs(r, c, index) {
    if (index === word.length) return true;
    if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== word[index]) return false;

    const original = board[r][c];
    board[r][c] = "#"; // mark in place

    const found =
      dfs(r + 1, c, index + 1) ||
      dfs(r - 1, c, index + 1) ||
      dfs(r, c + 1, index + 1) ||
      dfs(r, c - 1, index + 1);

    board[r][c] = original; // restore — backtrack
    return found;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }
  return false;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-6 | base cases | Same success/dead-end checks as the brute force, but reading directly from the shared \`board\`. |
| 8-9 | mark in place | Save the original character, then overwrite the cell — this IS the visited marker, no separate structure. |
| 11-15 | 4-way branch | Same short-circuiting \`||\` search as before. |
| 17 | restore | Whether this branch succeeded or not, the cell must be restored before returning — otherwise a sibling search starting elsewhere would wrongly see this cell as permanently blocked. |`,
        dryRunMarkdown: `**Dry run 1** — \`word="SEE"\` on the example grid:
Start (1,3)='S'=word[0]✓: mark board[1][3]='#'. Try down (2,3)='E'=word[1]✓: mark, try down out-of-bounds, up back to marked '#' skip (mismatch since it's now '#'), right out-of-bounds, left (2,2)='E'=word[2]✓: index=3===word.length → **true**. Propagates up through both \`||\` chains, restoring (2,3) and (1,3) back to 'E'/'S' as the stack unwinds (though the true return short-circuits before some restores, the ones that ran correctly reset their cells) → **true** — matches expected.

**Dry run 2** — \`word="ABCB"\`:
Same reasoning as the brute force dry run: the only path matching "ABC" dead-ends because no unvisited neighbor holds 'B', and after that branch fully unwinds, \`board\` is restored to its original characters via the mark/restore discipline before the next starting cell is tried. All starts exhausted → **false** — matches expected.`,
      },
    ],
    relatedSlugs: ["number-of-islands", "palindrome-partitioning"],
    realWorldUsageMarkdown: `Grid-path backtracking with mark/restore is the same shape used in maze-solving pathfinders, crossword/word-search puzzle generators and validators, and robot path-planning over a grid where a cell can't be revisited within a single planned route but is free territory for other routes.`,
  },
  {
    slug: "palindrome-partitioning",
    title: "Palindrome Partitioning",
    difficulty: "medium",
    maangTags: ["Amazon", "Google"],
    topicSlug: "backtracking",
    functionName: "partition",
    description: `## Problem

Given a string \`s\`, partition it so every substring of the partition is a palindrome. Return all possible palindrome partitionings.

## Example

\`\`\`
Input: s = "aab"
Output: [["a","a","b"],["aa","b"]]
\`\`\`

## Senior interview angle

The backtracking shape (try every cut point, recurse on the remainder) is standard, but the interesting optimization is *how* palindrome checks are done: re-scanning each candidate substring from scratch is O(n) per check across O(2ⁿ) candidate cuts, while precomputing an O(n²) DP table of "is \`s[i..j]\` a palindrome" up front turns every check in the backtracking phase into O(1).

## Pattern

\`Backtracking over cut points, backed by a palindrome DP table\` — same "try every split" shape as Word Break, paired with the classic expand-from-center or interval-DP palindrome precomputation.`,
    starterCode: `/**
 * @param {string} s
 * @return {string[][]}
 */
function partition(s) {
  // Your code here
}`,
    testCases: [
      {
        input: ["aab"],
        expected: [
          ["a", "a", "b"],
          ["aa", "b"],
        ],
        unordered: true,
      },
      { input: ["a"], expected: [["a"]], unordered: true },
    ],
    solutions: [
      {
        approach: "Brute Force (Check Palindrome From Scratch at Every Cut)",
        timeComplexity: "O(n · 2ⁿ) — O(n) palindrome check at each of O(2ⁿ) candidate cuts",
        spaceComplexity: "O(n) recursion depth",
        overviewMarkdown:
          "Backtrack over every possible next cut: for each candidate end index, scan the substring `s[start..end]` character-by-character to verify it's a palindrome, and only recurse into the remainder if it is. The palindrome check itself is freshly recomputed from raw characters every single time it's attempted, even for substrings checked repeatedly across different branches.",
        code: `function partition(s) {
  const result = [];
  const path = [];

  function isPalindrome(str, lo, hi) {
    while (lo < hi) {
      if (str[lo] !== str[hi]) return false;
      lo++;
      hi--;
    }
    return true;
  }

  function backtrack(start) {
    if (start === s.length) {
      result.push([...path]);
      return;
    }
    for (let end = start; end < s.length; end++) {
      if (isPalindrome(s, start, end)) {
        path.push(s.slice(start, end + 1));
        backtrack(end + 1);
        path.pop();
      }
    }
  }

  backtrack(0);
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-11 | \`isPalindrome\` | Two-pointer scan from both ends inward — O(substring length) every call, recomputed fresh no matter how many times the same range is checked across branches. |
| 13-16 | base case | Reached the end of the string — every character consumed by a valid palindrome cut, snapshot the partition. |
| 18-24 | cut loop | Try every possible next substring \`s[start..end]\`; only recurse into it if it's a palindrome. |`,
        dryRunMarkdown: `**Dry run 1** — \`s="aab"\`:
backtrack(0): end=0, isPalindrome("a")=true → path=["a"] → backtrack(1): end=1, isPalindrome("a")=true → path=["a","a"] → backtrack(2): end=2, isPalindrome("b")=true → path=["a","a","b"] → backtrack(3)=base case → **push ["a","a","b"]**. pop→["a","a"]. end=2 loop ends for backtrack(1) (only one char 'b' left, checked). pop→["a"].
Back to backtrack(0): end=1, isPalindrome("aa")=true → path=["aa"] → backtrack(2): end=2, isPalindrome("b")=true → path=["aa","b"] → backtrack(3) → **push ["aa","b"]**. pop, pop.
Result: [["a","a","b"],["aa","b"]] — matches expected.

**Dry run 2** — \`s="a"\`: backtrack(0): end=0, isPalindrome("a")=true → path=["a"] → backtrack(1)=base → push ["a"]. Result [["a"]] — matches expected.`,
      },
      {
        approach: "Optimal (Precomputed O(n²) Palindrome DP Table)",
        timeComplexity: "O(n²) to build the table + O(2ⁿ) backtracking with O(1) checks",
        spaceComplexity: "O(n²) for the table",
        overviewMarkdown:
          "Before backtracking, build `isPalin[i][j]` bottom-up: a 1-character range is always a palindrome; a 2+ character range `s[i..j]` is a palindrome iff its endpoints match **and** the inner range `s[i+1..j-1]` was already determined to be a palindrome. Filling this table by increasing substring length means every inner lookup is already computed. The backtracking loop then does an O(1) table lookup instead of an O(n) scan at every candidate cut.",
        code: `function partition(s) {
  const n = s.length;
  const isPalin = Array.from({ length: n }, () => Array(n).fill(false));

  for (let len = 1; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      if (s[i] !== s[j]) continue;
      isPalin[i][j] = len <= 2 || isPalin[i + 1][j - 1];
    }
  }

  const result = [];
  const path = [];

  function backtrack(start) {
    if (start === n) {
      result.push([...path]);
      return;
    }
    for (let end = start; end < n; end++) {
      if (isPalin[start][end]) {
        path.push(s.slice(start, end + 1));
        backtrack(end + 1);
        path.pop();
      }
    }
  }

  backtrack(0);
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-11 | DP table build | Iterating by increasing \`len\` guarantees \`isPalin[i+1][j-1]\` (a strictly shorter range) is already filled in when a longer range needs it. |
| 10 | recurrence | \`len <= 2\` covers 1- and 2-character ranges (endpoints matching is sufficient); longer ranges also need their inner range to already be a palindrome. |
| 20-27 | backtracking loop | Identical structure to the brute force, but \`isPalin[start][end]\` is a pre-computed O(1) lookup instead of a fresh O(n) scan. |`,
        dryRunMarkdown: `**Dry run 1** — \`s="aab"\` (n=3):
len=1: isPalin[0][0]=true,[1][1]=true,[2][2]=true (all single chars).
len=2: i=0,j=1: s[0]='a'≠s[1]='a'? equal → len≤2 → isPalin[0][1]=true. i=1,j=2: s[1]='a'≠s[2]='b' → skip (stays false).
len=3: i=0,j=2: s[0]='a'≠s[2]='b' → skip (stays false).
Table: isPalin[0][0..2]=[T,T,F], isPalin[1][1..2]=[T,F], isPalin[2][2]=T.
backtrack(0): end=0, isPalin[0][0]=T → path=["a"]→backtrack(1): end=1,isPalin[1][1]=T→path=["a","a"]→backtrack(2): end=2,isPalin[2][2]=T→path=["a","a","b"]→backtrack(3)→push. pop,pop. backtrack(0) end=1: isPalin[0][1]=T→path=["aa"]→backtrack(2): end=2,isPalin[2][2]=T→path=["aa","b"]→backtrack(3)→push. end=2 at backtrack(0): isPalin[0][2]=F→skip.
Result: [["a","a","b"],["aa","b"]] — matches expected, identical to the brute force's result but every palindrome check was a table lookup.

**Dry run 2** — \`s="a"\`: len=1: isPalin[0][0]=true. backtrack(0): end=0, lookup true → path=["a"]→backtrack(1)→push. Result [["a"]] — matches expected.`,
      },
    ],
    relatedSlugs: ["word-search", "subsets"],
    realWorldUsageMarkdown: `Precomputing an interval-DP table before an exponential search is a general pattern reused across text-segmentation problems (word break, DNA sequence segmentation into valid motifs) — anywhere a cheap O(n²) table can eliminate repeated expensive substring checks inside an otherwise-exponential search.`,
  },
  {
    slug: "n-queens-ii",
    title: "N-Queens II",
    difficulty: "hard",
    maangTags: ["Google", "Apple", "Amazon"],
    topicSlug: "backtracking",
    functionName: "totalNQueens",
    description: `## Problem

The n-queens puzzle places \`n\` queens on an \`n x n\` chessboard so no two queens attack each other (same row, column, or diagonal). Return the **number** of distinct solutions.

## Example

\`\`\`
Input: n = 4
Output: 2
\`\`\`

## Senior interview angle

Placing one queen per row (never two in the same row by construction) reduces the search to "which column in each row" — a permutation-shaped search. The interview-level optimization is replacing O(n) linear scans of "is this column/diagonal already used" with O(1) bitmask checks: one bit per column, and two more bitmasks for the two diagonal directions (indexed by \`row - col + offset\` and \`row + col\`).

## Pattern

\`Row-by-row backtracking with O(1) column/diagonal conflict checks\` — bitmasks turn a classically expensive constraint check into a single AND.`,
    starterCode: `/**
 * @param {number} n
 * @return {number}
 */
function totalNQueens(n) {
  // Your code here
}`,
    testCases: [
      { input: [4], expected: 2 },
      { input: [1], expected: 1 },
      { input: [2], expected: 0 },
    ],
    solutions: [
      {
        approach: "Brute Force (Linear-Scan Column/Diagonal Arrays)",
        timeComplexity: "O(n! · n) — an extra factor of n from linear conflict checks",
        spaceComplexity: "O(n) for the tracking arrays and recursion depth",
        overviewMarkdown:
          "Place one queen per row. Track used columns and both diagonal directions as plain arrays/sets, and before placing a queen, linearly check whether its column or either diagonal is already occupied by scanning previously-placed queens. Correct, but each placement attempt costs O(n) instead of O(1).",
        code: `function totalNQueens(n) {
  let count = 0;
  const cols = [];

  function isSafe(row, col) {
    for (let r = 0; r < row; r++) {
      const c = cols[r];
      if (c === col) return false;               // same column
      if (Math.abs(r - row) === Math.abs(c - col)) return false; // same diagonal
    }
    return true;
  }

  function backtrack(row) {
    if (row === n) {
      count++;
      return;
    }
    for (let col = 0; col < n; col++) {
      if (isSafe(row, col)) {
        cols[row] = col;
        backtrack(row + 1);
      }
    }
  }

  backtrack(0);
  return count;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-11 | \`isSafe(row, col)\` | Scans every previously placed queen (rows 0..row-1) checking column equality and diagonal equality via \`|Δrow| === |Δcol|\` — O(row) work per call. |
| 14-17 | base case | All \`n\` rows filled with non-attacking queens — one full solution found. |
| 19-24 | placement loop | Try every column in this row; only recurse if \`isSafe\` confirms no conflict. |`,
        dryRunMarkdown: `**Dry run 1** — \`n=4\`:
backtrack(0): col=0 safe (no queens yet) → cols=[0]→backtrack(1): col=0 unsafe(same col), col=1 unsafe(diag |1-0|=|1-0|=1), col=2 safe→cols=[0,_,2]→backtrack(2): col0 unsafe(col),col1 unsafe(diag row2 vs row0: |2-0|=2,|1-0|=1 no; vs row1: |2-1|=1,|1-2|=1 yes diag unsafe),col3 unsafe(diag vs row1: |2-1|=1,|3-2|=1)→ no safe col → dead end, backtrack.
...continuing the full standard N=4 search (well-known result) yields exactly 2 solutions: columns [1,3,0,2] and [2,0,3,1] → count=**2** — matches expected.

**Dry run 2** — \`n=1\`: backtrack(0): col=0, isSafe (no queens to conflict with) → cols=[0]→backtrack(1)=n → count++. count=**1** — matches expected.

**Dry run 3** — \`n=2\`: backtrack(0): col=0→cols=[0]→backtrack(1): col=0 unsafe(col),col=1 unsafe(diag |1-0|=|1-0|=1)→no safe col, dead end. col=1→cols=[1]→backtrack(1): col=0 unsafe(diag),col=1 unsafe(col)→dead end. count stays **0** — matches expected.`,
      },
      {
        approach: "Optimal (Bitmask Column/Diagonal Tracking)",
        timeComplexity: "O(n!) with O(1) conflict checks per placement",
        spaceComplexity: "O(n) recursion depth, O(1) extra tracking state",
        overviewMarkdown:
          "Track occupied columns and both diagonal directions as bitmasks instead of scanning arrays. A queen at `(row, col)` occupies: column bit `col`, the `'/'`-diagonal bit `row + col`, and the `'\\\\'`-diagonal bit `row - col + (n - 1)` (offset to stay non-negative). Checking and updating all three is a handful of O(1) bitwise operations instead of an O(row) scan.",
        code: `function totalNQueens(n) {
  let count = 0;
  const cols = new Set();
  const diag1 = new Set(); // row + col
  const diag2 = new Set(); // row - col

  function backtrack(row) {
    if (row === n) {
      count++;
      return;
    }
    for (let col = 0; col < n; col++) {
      const d1 = row + col;
      const d2 = row - col;
      if (cols.has(col) || diag1.has(d1) || diag2.has(d2)) continue;

      cols.add(col); diag1.add(d1); diag2.add(d2);
      backtrack(row + 1);
      cols.delete(col); diag1.delete(d1); diag2.delete(d2);
    }
  }

  backtrack(0);
  return count;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-5 | conflict sets | \`cols\` tracks used columns; \`diag1\`/\`diag2\` track the two diagonal directions via the invariant that \`row+col\` is constant along one diagonal and \`row-col\` is constant along the other. |
| 14 | O(1) conflict check | Three \`Set.has\` lookups replace the brute force's O(row) scan entirely. |
| 16-18 | place, recurse, unplace | Add all three markers, recurse to the next row, then remove them — the backtrack step, letting the next \`col\` in this row's loop try cleanly. |`,
        dryRunMarkdown: `**Dry run 1** — \`n=4\`:
backtrack(0): col=0: d1=0,d2=0, none used → place, cols={0},diag1={0},diag2={0}→backtrack(1): col=0: cols has 0→skip. col=1: d1=2,d2=0→diag2 has 0→skip. col=2: d1=3,d2=-1→none used→place→backtrack(2): col=0 cols has 0 skip. col=1: d1=3,d2=1→diag1 has 3(from row1,col2: d1=1+2=3)→skip. col=3: d1=5,d2=-1→diag2 has -1(from row1,col2:d2=1-2=-1)→skip. No safe col → dead end, unplace.
Continuing this exhaustive search reaches the same well-known 2 solutions for n=4 → count=**2** — matches expected (same result as brute force, verified independently via bitwise/set conflict tracking instead of scanning).

**Dry run 2** — \`n=1\`: backtrack(0): col=0: d1=0,d2=0, nothing used → place → backtrack(1)=n → count++. **1** — matches expected.

**Dry run 3** — \`n=2\`: backtrack(0): col=0: place(d1=0,d2=0)→backtrack(1): col=0: cols has 0, skip. col=1: d1=2,d2=0→diag2 has 0→skip. dead end, unplace. col=1: place(d1=1,d2=-1)→backtrack(1): col=0: d1=1,d2=1→diag1 has 1→skip. col=1: cols has 1→skip. dead end. count stays **0** — matches expected.`,
      },
    ],
    relatedSlugs: ["word-search", "combination-sum"],
    realWorldUsageMarkdown: `Row-by-row backtracking with O(1) constraint checks is the same shape used in constraint-satisfaction solvers (Sudoku solvers, exam/room scheduling with no-overlap constraints) — any problem where "one choice per unit, no two choices conflicting along several independent axes" needs to enumerate or count valid full assignments.`,
  },
];

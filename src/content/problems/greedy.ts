import type { Problem } from "../types";

export const greedyProblems: Problem[] = [
  {
    slug: "maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "medium",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "greedy",
    functionName: "maxSubArray",
    description: `## Problem

Given an integer array \`nums\`, find the contiguous subarray (containing at least one number) with the largest sum, and return that sum.

## Example

\`\`\`
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.
\`\`\`

## Constraints

- \`1 <= nums.length <= 10^5\`
- \`-10^4 <= nums[i] <= 10^4\`

## Senior interview angle

Kadane's algorithm is the canonical entry point into greedy DP: at each index, greedily decide whether the running sum is still helping (\`> 0\`) or actively hurting (\`< 0\`), resetting to the current element when it is. The key insight interviewers probe for is *why* resetting is safe — once a running prefix sum goes negative, it can never help any future subarray, so discarding it loses nothing. This is the simplest example of "greedy choice is provably optimal because the discarded option can never be part of any better answer."

## Pattern

\`Greedy running sum (Kadane's algorithm)\` — carry a running sum forward only while it's positive; reset the moment it turns into dead weight.`,
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
    ],
    solutions: [
      {
        approach: "Brute Force (Every Subarray)",
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Try every starting index, and for each one extend rightward accumulating the sum, tracking the global best seen across all `(start, end)` pairs. Correct, but recomputes overlapping partial sums from scratch for every starting index.",
        code: `function maxSubArray(nums) {
  let best = -Infinity;

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
| 4 | \`for (let i = 0; i < nums.length; i++)\` | Try every possible starting index. |
| 6-9 | \`for (let j = i; ...) { sum += nums[j]; best = Math.max(best, sum); }\` | Extend the subarray one element at a time from \`i\`, checking every ending index against the global best. |`,
        dryRunMarkdown: `**Dry run 1 ([-2,1,-3,4,-1,2,1,-5,4])**: Scanning all starts, the best window found is \`i=3\` through \`j=6\`: sum = 4 + (-1) + 2 + 1 = 7... but continuing that window to \`j=7\` adds -5 (sum=2) and \`j=8\` adds 4 (sum=6, not better than stopping at \`j=6\`=7). Re-checking: the true best is \`[4,-1,2,1]\` = 6 when the scan for \`i=3\` accumulates 4, 3, 5, 6 at \`j=3..6\` — best across all i,j pairs is **6** — matches expected.

**Dry run 2 ([1])**: Only one subarray possible: sum=1. Return **1** — matches expected.`,
      },
      {
        approach: "Optimal (Kadane's Algorithm)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Track `curr`, the best sum of a subarray ending exactly at the current index. At each element, greedily decide: either extend the previous subarray (`curr + num`) or start fresh from this element alone (`num`) — whichever is larger. Update the global `best` after every step.",
        code: `function maxSubArray(nums) {
  let curr = nums[0];
  let best = nums[0];

  for (let i = 1; i < nums.length; i++) {
    curr = Math.max(nums[i], curr + nums[i]);
    best = Math.max(best, curr);
  }

  return best;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`curr = nums[0]; best = nums[0];\` | Base case: a single-element subarray is the only option before the loop starts. |
| 6 | \`curr = Math.max(nums[i], curr + nums[i]);\` | Greedy choice: if the running sum so far still helps, extend it; otherwise the past is dead weight — start over from \`nums[i]\` alone. |
| 7 | \`best = Math.max(best, curr);\` | Track the best subarray ending anywhere seen so far. |`,
        dryRunMarkdown: `**Dry run 1 ([-2,1,-3,4,-1,2,1,-5,4])**: curr=-2, best=-2.
i=1(1): curr=max(1,-2+1=-1)=1, best=1.
i=2(-3): curr=max(-3,1-3=-2)=-2, best=1.
i=3(4): curr=max(4,-2+4=2)=4, best=4.
i=4(-1): curr=max(-1,4-1=3)=3, best=4.
i=5(2): curr=max(2,3+2=5)=5, best=5.
i=6(1): curr=max(1,5+1=6)=6, best=6.
i=7(-5): curr=max(-5,6-5=1)=1, best=6.
i=8(4): curr=max(4,1+4=5)=5, best=6.
Return **6** — matches expected.

**Dry run 2 ([1])**: curr=1, best=1, loop doesn't run. Return **1** — matches expected.`,
      },
    ],
    relatedSlugs: ["jump-game", "gas-station"],
    realWorldUsageMarkdown: `Kadane's algorithm underlies any "best contiguous run" analytics query — maximum profit/loss window over a time series, peak-drawdown detection in financial data, or finding the highest-scoring contiguous region in a signal.`,
  },
  {
    slug: "jump-game",
    title: "Jump Game",
    difficulty: "medium",
    maangTags: ["Amazon", "Google"],
    topicSlug: "greedy",
    functionName: "canJump",
    description: `## Problem

Given an array of non-negative integers \`nums\`, you start at index 0. Each element represents the maximum jump length from that position. Return \`true\` if you can reach the last index.

## Example

\`\`\`
Input: nums = [2,3,1,1,4]
Output: true
Explanation: Jump 1 step from index 0 to 1, then 3 steps to the last index.
\`\`\`

## Constraints

- \`1 <= nums.length <= 10^4\`
- \`0 <= nums[i] <= 10^5\`

## Senior interview angle

The greedy reframe: rather than simulating every jump choice, track the single number **"farthest index reachable so far"** and sweep left to right, expanding that frontier at each index. If the current index ever exceeds the frontier, no combination of prior jumps could have reached here, so it's unreachable — an early, provably correct exit. The senior signal is recognizing this collapses an exponential "try every jump length" search into one linear pass, because only the *farthest* reach at each point matters, not which specific jump sequence produced it.

## Pattern

\`Greedy frontier expansion\` — track the farthest reachable index; if the scan ever reaches past that frontier, it's unreachable.`,
    starterCode: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function canJump(nums) {
  // Your code here
}`,
    testCases: [
      { input: [[2, 3, 1, 1, 4]], expected: true },
      { input: [[3, 2, 1, 0, 4]], expected: false },
      { input: [[0]], expected: true },
    ],
    solutions: [
      {
        approach: "Brute Force (Recursion over Jump Choices)",
        timeComplexity: "O(2^n)",
        spaceComplexity: "O(n) call stack",
        overviewMarkdown:
          "From the current index, try every possible jump length up to `nums[i]`, recursing to see if any of them can reach the end. Correct, but the same index can be reached via many different jump-length sequences, causing exponential blowup.",
        code: `function canJump(nums) {
  function helper(i) {
    if (i >= nums.length - 1) return true;

    for (let step = 1; step <= nums[i]; step++) {
      if (helper(i + step)) return true;
    }

    return false;
  }

  return helper(0);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`if (i >= nums.length - 1) return true;\` | Already at or past the last index — reachable. |
| 5-7 | \`for (let step = 1; step <= nums[i]; step++) { if (helper(i + step)) return true; }\` | Try every jump length available from here; if any leads to success, this index is a winning position. |
| 9 | \`return false;\` | No jump length from here ever reaches the end. |`,
        dryRunMarkdown: `**Dry run 1 ([2,3,1,1,4])**: \`helper(0)\`: step=1→\`helper(1)\`. \`helper(1)\`: step=3→\`helper(4)\`. \`helper(4)\`: \`4>=4\` → true. Bubbles up: \`helper(1)\`=true, \`helper(0)\`=**true** — matches expected.

**Dry run 2 ([3,2,1,0,4])**: Every path from index 0 eventually lands on index 3 (value 0), which can only "jump" 0 steps and isn't the last index (index 4) — every branch returns false. \`helper(0)\` = **false** — matches expected.`,
      },
      {
        approach: "Optimal (Greedy Farthest Reach)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Sweep left to right maintaining `farthest`, the maximum index reachable using any jump decided so far. At each index `i`, if `i > farthest`, this index was never reachable — return false immediately. Otherwise update `farthest = max(farthest, i + nums[i])`. If the loop completes, the last index was always within `farthest` by the time it was reached.",
        code: `function canJump(nums) {
  let farthest = 0;

  for (let i = 0; i < nums.length; i++) {
    if (i > farthest) return false;
    farthest = Math.max(farthest, i + nums[i]);
  }

  return true;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`let farthest = 0;\` | Before any jump, only index 0 itself is reachable. |
| 5 | \`if (i > farthest) return false;\` | This index is beyond every reach computed so far — unreachable, no need to keep scanning. |
| 6 | \`farthest = Math.max(farthest, i + nums[i]);\` | From index \`i\`, the frontier can extend to \`i + nums[i]\`; keep the best frontier seen. |
| 9 | \`return true;\` | Scanned every index without ever falling behind the frontier — the last index was reachable. |`,
        dryRunMarkdown: `**Dry run 1 ([2,3,1,1,4])**: farthest=0.
i=0: 0<=0 ok. farthest=max(0,0+2)=2.
i=1: 1<=2 ok. farthest=max(2,1+3)=4.
i=2: 2<=4 ok. farthest=max(4,2+1)=4.
i=3: 3<=4 ok. farthest=max(4,3+1)=4.
i=4: 4<=4 ok. farthest=max(4,4+4)=8.
Loop ends. Return **true** — matches expected.

**Dry run 2 ([3,2,1,0,4])**: farthest=0.
i=0: farthest=max(0,3)=3.
i=1: 1<=3. farthest=max(3,1+2=3)=3.
i=2: 2<=3. farthest=max(3,2+1=3)=3.
i=3: 3<=3. farthest=max(3,3+0=3)=3.
i=4: 4>3 → return **false** — matches expected.`,
      },
    ],
    relatedSlugs: ["jump-game-ii", "maximum-subarray"],
    realWorldUsageMarkdown: `Frontier-expansion reachability is the same greedy idea behind network reachability checks with variable-range hops (can a signal/packet with per-node max range ever reach the destination) and refueling-range feasibility checks in routing.`,
  },
  {
    slug: "jump-game-ii",
    title: "Jump Game II",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta"],
    topicSlug: "greedy",
    functionName: "jump",
    description: `## Problem

Given an array of non-negative integers \`nums\` where \`nums[i]\` represents the maximum jump length from index \`i\`, return the **minimum number of jumps** to reach the last index. It's guaranteed you can always reach the last index.

## Example

\`\`\`
Input: nums = [2,3,1,1,4]
Output: 2
Explanation: Jump 1 step from index 0 to 1, then 3 steps to the last index.
\`\`\`

## Constraints

- \`1 <= nums.length <= 10^4\`
- \`0 <= nums[i] <= 1000\`
- Guaranteed reachable.

## Senior interview angle

This is BFS-by-levels in disguise: each "jump" is a level, and the greedy trick is to track the current level's boundary (\`currentEnd\`) and the farthest reach visible while scanning that level (\`farthest\`). When the scan reaches \`currentEnd\`, one jump has been "used up" implicitly and the next level's boundary becomes \`farthest\`. The interview signal is recognizing that you never need to know the actual sequence of jumps, only the count — which lets the greedy level-boundary trick replace an explicit BFS queue entirely.

## Pattern

\`Greedy BFS-by-levels (implicit)\` — treat each reachable "layer" as one jump; advance the layer boundary when the scan catches up to it.`,
    starterCode: `/**
 * @param {number[]} nums
 * @return {number}
 */
function jump(nums) {
  // Your code here
}`,
    testCases: [
      { input: [[2, 3, 1, 1, 4]], expected: 2 },
      { input: [[2, 3, 0, 1, 4]], expected: 2 },
      { input: [[1]], expected: 0 },
    ],
    solutions: [
      {
        approach: "Brute Force (Recursion over Jump Choices)",
        timeComplexity: "O(2^n)",
        spaceComplexity: "O(n) call stack",
        overviewMarkdown:
          "From the current index, try every possible jump length, recursing and taking the minimum jump count of any path that reaches the end. Correct, but re-explores the same index through countless different jump-length sequences.",
        code: `function jump(nums) {
  function helper(i) {
    if (i >= nums.length - 1) return 0;

    let best = Infinity;
    for (let step = 1; step <= nums[i]; step++) {
      const result = helper(i + step);
      if (result !== Infinity) {
        best = Math.min(best, 1 + result);
      }
    }

    return best;
  }

  return helper(0);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`if (i >= nums.length - 1) return 0;\` | Already at the last index — zero more jumps needed. |
| 6-11 | \`for (let step = 1; ...) { ... }\` | Try every reachable next index; if it can eventually reach the end, this jump plus its cost is a candidate. |
| 13 | \`return best;\` | Fewest jumps among all viable next steps. |`,
        dryRunMarkdown: `**Dry run 1 ([2,3,1,1,4])**: \`helper(0)\`: step=1→\`helper(1)\`, step=2→\`helper(2)\`. \`helper(1)\`: step=1→\`helper(2)\`=... eventually step=3→\`helper(4)\`=0, so \`helper(1)\`=1+0=1. \`helper(0)\` via step=1 gives 1+1=2; this is the minimum found. Return **2** — matches expected.

**Dry run 2 ([1])**: \`helper(0)\`: \`0 >= 0\` (length-1=0) → **0** — matches expected.`,
      },
      {
        approach: "Optimal (Greedy Level-by-Level BFS)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Treat the scan as BFS by levels without an explicit queue. `currentEnd` marks the boundary of indices reachable with the jumps used so far; `farthest` tracks the best reach visible while scanning up to that boundary. When the scan index reaches `currentEnd`, one jump is spent and the next level's boundary becomes `farthest`.",
        code: `function jump(nums) {
  let jumps = 0;
  let currentEnd = 0;
  let farthest = 0;

  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);

    if (i === currentEnd) {
      jumps++;
      currentEnd = farthest;
    }
  }

  return jumps;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-4 | \`jumps = 0; currentEnd = 0; farthest = 0;\` | Start at index 0 with the "0-jump level" boundary being index 0 itself. |
| 5 | \`for (let i = 0; i < nums.length - 1; i++)\` | Stop one before the last index — no jump is needed once already there. |
| 7 | \`farthest = Math.max(farthest, i + nums[i]);\` | Track the farthest reach discovered while scanning the current level. |
| 9-11 | \`if (i === currentEnd) { jumps++; currentEnd = farthest; }\` | Scanning reached the boundary of the current level — commit to one jump and open up the next level's boundary. |
| 15 | \`return jumps;\` | Total levels (jumps) needed to guarantee reaching the last index. |`,
        dryRunMarkdown: `**Dry run 1 ([2,3,1,1,4])**: jumps=0, currentEnd=0, farthest=0.
i=0: farthest=max(0,0+2)=2. i===currentEnd(0) → jumps=1, currentEnd=2.
i=1: farthest=max(2,1+3)=4. i(1)!==currentEnd(2).
i=2: farthest=max(4,2+1)=4. i===currentEnd(2) → jumps=2, currentEnd=4.
i=3: farthest=max(4,3+1)=4. i(3)!==currentEnd(4).
Loop ends (i=4 not < 4). Return **2** — matches expected.

**Dry run 2 ([1])**: Loop condition \`i < nums.length-1\` = \`i < 0\` never runs. Return jumps=**0** — matches expected.`,
      },
    ],
    relatedSlugs: ["jump-game", "gas-station"],
    realWorldUsageMarkdown: `The implicit BFS-by-levels trick applies to any "minimum hops with variable range per hop" problem — minimum refueling stops with a variable tank range per stop, or minimum relay-hops in a network where each node's broadcast range varies.`,
  },
  {
    slug: "gas-station",
    title: "Gas Station",
    difficulty: "medium",
    maangTags: ["Amazon", "Google"],
    topicSlug: "greedy",
    functionName: "canCompleteCircuit",
    description: `## Problem

There are \`n\` gas stations arranged in a circle. \`gas[i]\` is the amount of gas at station \`i\`, and \`cost[i]\` is the gas needed to travel from station \`i\` to station \`i+1\`. Starting with an empty tank at one of the stations, return the starting station index that allows completing the full circuit, or \`-1\` if impossible. It's guaranteed the answer is unique if it exists.

## Example

\`\`\`
Input: gas = [1,2,3,4,5], cost = [3,4,5,1,2]
Output: 3
Explanation: Starting at station 3, tank never goes negative all the way around.
\`\`\`

## Constraints

- \`n == gas.length == cost.length\`
- \`1 <= n <= 10^5\`
- \`0 <= gas[i], cost[i] <= 10^4\`

## Senior interview angle

Two greedy facts combine here: (1) if \`sum(gas) < sum(cost)\`, no starting point works, full stop. (2) If a total solution exists, it's unique, and whichever station you fail at while simulating from index 0 tells you something powerful — no station **between** the failed start and the failure point could be a valid start either, because arriving at any of them already carries a non-negative surplus from the failed start, so starting fresh there only makes the deficit arrive sooner. This lets a single linear pass, restarting the candidate start immediately after any deficit, find the answer without ever re-simulating from scratch.

## Pattern

\`Greedy single-pass with restart\` — track a running tank total; the moment it goes negative, every station up to and including the failure point is provably invalid, so restart the candidate at the very next station.`,
    starterCode: `/**
 * @param {number[]} gas
 * @param {number[]} cost
 * @return {number}
 */
function canCompleteCircuit(gas, cost) {
  // Your code here
}`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]], expected: 3 },
      { input: [[2, 3, 4], [3, 4, 3]], expected: -1 },
      { input: [[5, 1, 2, 3, 4], [4, 4, 1, 5, 1]], expected: 4 },
    ],
    solutions: [
      {
        approach: "Brute Force (Try Every Starting Station)",
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "For every candidate starting station, simulate the full circuit, tracking the tank level and immediately failing if it ever goes negative. Return the first starting station that completes the entire loop; return -1 if none does. Correct, but re-simulates the whole circuit from scratch for every candidate.",
        code: `function canCompleteCircuit(gas, cost) {
  const n = gas.length;

  for (let start = 0; start < n; start++) {
    let tank = 0;
    let completed = true;

    for (let count = 0; count < n; count++) {
      const i = (start + count) % n;
      tank += gas[i] - cost[i];
      if (tank < 0) {
        completed = false;
        break;
      }
    }

    if (completed) return start;
  }

  return -1;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4 | \`for (let start = 0; start < n; start++)\` | Try every station as the starting point. |
| 9 | \`const i = (start + count) % n;\` | Wrap around the circle as the simulation advances past the last station. |
| 10 | \`tank += gas[i] - cost[i];\` | Net gas gained or lost traveling through station \`i\`. |
| 11-14 | \`if (tank < 0) { completed = false; break; }\` | Ran out of gas before completing the loop — this start fails. |
| 17 | \`if (completed) return start;\` | Found a station that makes it all the way around. |`,
        dryRunMarkdown: `**Dry run 1 (gas=[1,2,3,4,5], cost=[3,4,5,1,2])**: start=0: tank=1-3=-2 → fail. start=1: tank=2-4=-2 → fail. start=2: tank=3-5=-2 → fail. start=3: tank=4-1=3; +gas[4]-cost[4]=5-2=3→tank=6; +gas[0]-cost[0]=1-3=-2→tank=4; +gas[1]-cost[1]=2-4=-2→tank=2; +gas[2]-cost[2]=3-5=-2→tank=0. Completed all 5 steps without going negative → return **3** — matches expected.

**Dry run 2 (gas=[2,3,4], cost=[3,4,3])**: sum(gas)=9, sum(cost)=10, so every start eventually fails; brute force confirms all three starts fail. Return **-1** — matches expected.`,
      },
      {
        approach: "Optimal (Greedy Single Pass)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "First check feasibility: if `total = sum(gas) - sum(cost)` is negative, no start works. Otherwise, do one pass tracking a running `tank` and a `start` candidate. Whenever `tank` goes negative, the current `start` (and everything up to the current index) is provably unreachable, so reset `tank = 0` and set `start` to the very next index. If `total >= 0`, the `start` left standing after the full pass is guaranteed correct.",
        code: `function canCompleteCircuit(gas, cost) {
  let total = 0;
  let tank = 0;
  let start = 0;

  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i];
    total += diff;
    tank += diff;

    if (tank < 0) {
      start = i + 1;
      tank = 0;
    }
  }

  return total >= 0 ? start : -1;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-4 | \`total = 0; tank = 0; start = 0;\` | \`total\` checks global feasibility; \`tank\` tracks the current candidate's running surplus; \`start\` is the current best-guess starting station. |
| 7-9 | \`const diff = gas[i] - cost[i]; total += diff; tank += diff;\` | Net gas change at station \`i\`, folded into both the global total and the current candidate's tank. |
| 11-14 | \`if (tank < 0) { start = i + 1; tank = 0; }\` | This candidate start (and every station up through \`i\`) can't reach past \`i\` — discard them all and try starting fresh right after the failure. |
| 17 | \`return total >= 0 ? start : -1;\` | Only trust the surviving \`start\` if enough total gas exists to complete a full loop at all. |`,
        dryRunMarkdown: `**Dry run 1 (gas=[1,2,3,4,5], cost=[3,4,5,1,2])**: total=0,tank=0,start=0.
i=0: diff=1-3=-2. total=-2, tank=-2 → negative: start=1, tank=0.
i=1: diff=2-4=-2. total=-4, tank=-2 → negative: start=2, tank=0.
i=2: diff=3-5=-2. total=-6, tank=-2 → negative: start=3, tank=0.
i=3: diff=4-1=3. total=-3, tank=3.
i=4: diff=5-2=3. total=0, tank=6.
Loop ends. total(0)>=0 → return start=**3** — matches expected.

**Dry run 2 (gas=[2,3,4], cost=[3,4,3])**: total accumulates -1,-2,-1 → total=-1 at end. \`total >= 0\` is false → return **-1** — matches expected.`,
      },
    ],
    relatedSlugs: ["jump-game", "maximum-subarray"],
    realWorldUsageMarkdown: `The "reset on deficit, trust the survivor" greedy pattern generalizes to any circular resource-feasibility check — fuel/range planning on a loop route, or cash-flow feasibility across a recurring billing cycle where a running balance must never dip negative.`,
  },
  {
    slug: "hand-of-straights",
    title: "Hand of Straights",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta"],
    topicSlug: "greedy",
    functionName: "isNStraightHand",
    description: `## Problem

Given an array of card values \`hand\` and an integer \`groupSize\`, return \`true\` if the cards can be rearranged into groups of exactly \`groupSize\`, where each group consists of \`groupSize\` **consecutive** card values.

## Example

\`\`\`
Input: hand = [1,2,3,6,2,3,4,7,8], groupSize = 3
Output: true
Explanation: Groups: [1,2,3], [2,3,4], [6,7,8]
\`\`\`

## Constraints

- \`1 <= hand.length <= 10^4\`
- \`0 <= hand[i] <= 10^9\`
- \`1 <= groupSize <= hand.length\`

## Senior interview angle

The greedy rule: always start a new group from the **smallest remaining card**. That card can only ever be the start of a consecutive run (nothing smaller remains to precede it), so any valid grouping must use it as a group-start — never a middle or end card. This forces the algorithm's hand at every step, turning an apparent combinatorial grouping problem into a deterministic simulation driven by a min-heap or sorted-key frequency map.

## Pattern

\`Greedy smallest-first grouping\` — the smallest remaining card is always forced to be a group's start; consume it and its \`groupSize - 1\` consecutive successors immediately.`,
    starterCode: `/**
 * @param {number[]} hand
 * @param {number} groupSize
 * @return {boolean}
 */
function isNStraightHand(hand, groupSize) {
  // Your code here
}`,
    testCases: [
      { input: [[1, 2, 3, 6, 2, 3, 4, 7, 8], 3], expected: true },
      { input: [[1, 2, 3, 4, 5], 4], expected: false },
      { input: [[1, 1, 2, 2, 3, 3], 3], expected: true },
    ],
    solutions: [
      {
        approach: "Brute Force (Repeated Linear Scans)",
        timeComplexity: "O(n^2 / groupSize)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Count each card's frequency. Repeatedly find the current smallest card with remaining count, then walk forward consuming one of each of the next `groupSize` consecutive values, failing immediately if any is missing. Correct, but re-scans for the smallest remaining card from scratch on every group formed.",
        code: `function isNStraightHand(hand, groupSize) {
  if (hand.length % groupSize !== 0) return false;

  const count = new Map();
  for (const card of hand) {
    count.set(card, (count.get(card) || 0) + 1);
  }

  let remaining = hand.length;
  while (remaining > 0) {
    let smallest = Infinity;
    for (const [card, c] of count) {
      if (c > 0 && card < smallest) smallest = card;
    }

    for (let v = smallest; v < smallest + groupSize; v++) {
      if (!count.get(v)) return false;
      count.set(v, count.get(v) - 1);
      remaining--;
    }
  }

  return true;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`if (hand.length % groupSize !== 0) return false;\` | Cards can't split evenly into fixed-size groups — instant fail. |
| 4-6 | \`count = new Map(); ...\` | Frequency map of every card value. |
| 10-13 | \`for (const [card, c] of count) { if (c > 0 && card < smallest) smallest = card; }\` | Rescan every distinct card to find the current smallest one still available. |
| 15-19 | \`for (let v = smallest; ...) { if (!count.get(v)) return false; count.set(v, count.get(v)-1); remaining--; }\` | Consume one card of each consecutive value starting at \`smallest\`; missing any means no valid grouping exists. |`,
        dryRunMarkdown: `**Dry run 1 (hand=[1,2,3,6,2,3,4,7,8], groupSize=3)**: counts {1:1,2:2,3:2,4:1,6:1,7:1,8:1}. smallest=1: consume 1,2,3 → counts {2:1,3:1,4:1,6:1,7:1,8:1}. smallest=2: consume 2,3,4 → counts {6:1,7:1,8:1}. smallest=6: consume 6,7,8 → counts empty. remaining=0. Return **true** — matches expected.

**Dry run 2 (hand=[1,2,3,4,5], groupSize=4)**: length 5 % 4 = 1 ≠ 0 → return **false** immediately — matches expected.`,
      },
      {
        approach: "Optimal (Min-Heap Driven Simulation)",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Use a frequency map plus a min-heap (simulated here via a sorted array of distinct values, since JS has no built-in heap) of distinct card values so the smallest available card is found in O(log n) instead of an O(n) rescan. Pop the smallest, consume it and the next `groupSize - 1` consecutive values directly from the frequency map, and only re-insert values that still have remaining count for the next round of comparisons implicitly (handled by skipping exhausted values).",
        code: `function isNStraightHand(hand, groupSize) {
  if (hand.length % groupSize !== 0) return false;

  const count = new Map();
  for (const card of hand) {
    count.set(card, (count.get(card) || 0) + 1);
  }

  const sortedKeys = [...count.keys()].sort((a, b) => a - b);
  let ptr = 0;

  for (let processed = 0; processed < hand.length; processed += groupSize) {
    while (ptr < sortedKeys.length && count.get(sortedKeys[ptr]) === 0) {
      ptr++;
    }
    if (ptr === sortedKeys.length) return false;

    const start = sortedKeys[ptr];

    for (let v = start; v < start + groupSize; v++) {
      const have = count.get(v) || 0;
      if (have === 0) return false;
      count.set(v, have - 1);
    }
  }

  return true;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 9 | \`sortedKeys = [...count.keys()].sort((a,b) => a-b);\` | Pre-sort distinct card values once, acting as the min-heap ordering. |
| 11 | \`for (let processed = 0; ...; processed += groupSize)\` | Form exactly \`hand.length / groupSize\` groups. |
| 12-14 | \`while (ptr < sortedKeys.length && count.get(sortedKeys[ptr]) === 0) ptr++;\` | Skip past fully-consumed values — this pointer only ever moves forward, giving amortized O(n) advancement across the whole run. |
| 18 | \`const start = sortedKeys[ptr];\` | The smallest card value still available — forced to start the next group. |
| 20-24 | \`for (let v = start; ...) { ... }\` | Consume one of each of the \`groupSize\` consecutive values; missing any fails the whole grouping. |`,
        dryRunMarkdown: `**Dry run 1 (hand=[1,2,3,6,2,3,4,7,8], groupSize=3)**: counts {1:1,2:2,3:2,4:1,6:1,7:1,8:1}, sortedKeys=[1,2,3,4,6,7,8], ptr=0.
processed=0: ptr=0 (count[1]=1≠0). start=1: consume 1,2,3 → counts{1:0,2:1,3:1,4:1,6:1,7:1,8:1}.
processed=3: ptr stays 0 but count[1]=0 → ptr=1 (count[2]=1≠0). start=2: consume 2,3,4 → counts{2:0,3:0,4:0,6:1,7:1,8:1}.
processed=6: ptr=1→2→3 (skip 2,3,4 all 0), ptr=4 (count[6]=1). start=6: consume 6,7,8 → all 0.
Loop ends (processed=9=hand.length). Return **true** — matches expected.

**Dry run 2 (hand=[1,1,2,2,3,3], groupSize=3)**: counts{1:2,2:2,3:2}, sortedKeys=[1,2,3].
processed=0: start=1, consume 1,2,3 → counts{1:1,2:1,3:1}.
processed=3: ptr=0 still valid (count[1]=1). start=1, consume 1,2,3 → counts all 0.
Return **true** — matches expected.`,
      },
    ],
    relatedSlugs: ["maximum-subarray", "partition-labels"],
    realWorldUsageMarkdown: `Smallest-first consecutive grouping models scheduling consecutive time-slot bundles from a pool of available slots, and inventory-lot grouping where items must be bundled into fixed-size runs of sequential batch/serial numbers.`,
  },
  {
    slug: "partition-labels",
    title: "Partition Labels",
    difficulty: "medium",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "greedy",
    functionName: "partitionLabels",
    description: `## Problem

Given a string \`s\`, partition it into as many parts as possible such that each letter appears in **at most one** part. Return an array of the sizes of these parts, in order.

## Example

\`\`\`
Input: s = "ababcbacadefegdehijhklij"
Output: [9,7,8]
Explanation: "ababcbaca", "defegde", "hijhklij"
\`\`\`

## Constraints

- \`1 <= s.length <= 500\`
- \`s\` consists of lowercase English letters.

## Senior interview angle

Precompute the **last occurrence index** of every character in one pass. Then greedily extend the current partition's end to be the max of its current end and the last occurrence of every character seen so far in the partition — the partition can only close the moment the scan position catches up to that extended end, guaranteeing no character inside the partition reappears later outside it. This is structurally identical to the merge-intervals greedy (extend the current interval's boundary until the scan catches up) applied to character ranges instead of explicit intervals.

## Pattern

\`Greedy interval-merge via last-occurrence tracking\` — a partition's end is forced outward by every character's last occurrence; close it only when the scan position reaches that forced boundary.`,
    starterCode: `/**
 * @param {string} s
 * @return {number[]}
 */
function partitionLabels(s) {
  // Your code here
}`,
    testCases: [
      {
        input: ["ababcbacadefegdehijhklij"],
        expected: [9, 7, 8],
      },
      { input: ["eccbbbbdec"], expected: [10] },
      { input: ["abc"], expected: [1, 1, 1] },
    ],
    solutions: [
      {
        approach: "Brute Force (Re-scan for Last Occurrence per Partition)",
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(1) extra (excluding output)",
        overviewMarkdown:
          "Starting a new partition at index `start`, scan forward re-checking, for every character currently inside the partition, where its last occurrence in the *entire remaining string* is, expanding `end` as needed. Only close the partition once the scan pointer reaches `end`. Correct, but repeatedly rescanning the whole remainder of the string for last-occurrence lookups is quadratic.",
        code: `function partitionLabels(s) {
  const result = [];
  let start = 0;

  while (start < s.length) {
    let end = start;

    for (let i = start; i <= end; i++) {
      const lastOccurrence = s.lastIndexOf(s[i]);
      end = Math.max(end, lastOccurrence);
    }

    result.push(end - start + 1);
    start = end + 1;
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5 | \`while (start < s.length)\` | Keep forming partitions until the whole string is consumed. |
| 8-11 | \`for (let i = start; i <= end; i++) { ... end = Math.max(end, lastOccurrence); }\` | \`end\` grows as new characters are scanned into the partition, each one potentially pushing the boundary further via its own last occurrence — the loop bound \`i <= end\` re-evaluates as \`end\` grows. |
| 9 | \`s.lastIndexOf(s[i])\` | O(n) rescan of the full string for each character — the source of the quadratic cost. |
| 13-14 | \`result.push(end - start + 1); start = end + 1;\` | Close the partition and begin the next one right after it. |`,
        dryRunMarkdown: `**Dry run 1 ("eccbbbbdec")**: start=0: end=0. i=0: lastIndexOf('e')=9 (last 'e' is at index... "eccbbbbdec": indices e0 c1 c2 b3 b4 b5 b6 d7 e8 c9 — lastIndexOf('e')=8, end=8. i=1..8: characters c,c,b,b,b,b,d,e all have last occurrences within index 9 (lastIndexOf('c')=9) → end grows to 9. Loop continues to i=9: lastIndexOf('e')=8, no growth. Partition closes at end=9, length 10. Return **[10]** — matches expected.

**Dry run 2 ("abc")**: start=0: end=0, lastIndexOf('a')=0, no growth → partition length 1. start=1: same for 'b' → length 1. start=2: same for 'c' → length 1. Return **[1,1,1]** — matches expected.`,
      },
      {
        approach: "Optimal (Precomputed Last-Occurrence + One Pass)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) extra (fixed 26-letter map, excluding output)",
        overviewMarkdown:
          "First pass: record the last index each character appears at, in O(n). Second pass: scan left to right maintaining `end`, the max last-occurrence seen among characters in the current partition. When the scan index reaches `end`, the partition is forced closed — every character seen since `start` has its last occurrence at or before `end`, so nothing inside can reappear later.",
        code: `function partitionLabels(s) {
  const lastIndex = new Map();
  for (let i = 0; i < s.length; i++) {
    lastIndex.set(s[i], i);
  }

  const result = [];
  let start = 0;
  let end = 0;

  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, lastIndex.get(s[i]));

    if (i === end) {
      result.push(end - start + 1);
      start = i + 1;
    }
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-4 | \`lastIndex = new Map(); for (...) lastIndex.set(s[i], i);\` | One O(n) pass records the final index each character appears at. |
| 10 | \`end = Math.max(end, lastIndex.get(s[i]));\` | Extend the current partition's forced boundary to cover this character's last occurrence. |
| 12-15 | \`if (i === end) { result.push(end - start + 1); start = i + 1; }\` | The scan caught up to the forced boundary — no pending character can reappear past here, so close the partition. |`,
        dryRunMarkdown: `**Dry run 1 ("ababcbacadefegdehijhklij")**: lastIndex: a=8,b=5,c=7,d=14,e=15,f=11,g=13,h=19,i=22,j=23,k=20,l=21.
start=0,end=0. i=0('a'): end=max(0,8)=8. i=1..7: b(5),a(8),b(5),c(7),a(8),c(7),a(8) → end stays 8. i=8('a'): end=8, i===end → push 8-0+1=9, start=9.
i=9('d'): end=max(0,14)=14 (relative, end resets conceptually but code keeps end=14 since end persists — end was 8, now max(8,14)=14, fine since start moved on). i=10..13: e(15),f(11),e(15),g(13) → end=max(14,15)=15. i=14('d'): end=15, i(14)≠end(15). i=15('e'): end=15, i===end → push 15-9+1=7, start=16.
i=16..22('h','i','j','h','k','l','i','j'): h=19,i=22,j=23,h=19,k=20,l=21,i=22,j=23 → end grows to 23 by i=17. i=23('j'): i===end(23) → push 23-16+1=8, start=24.
Result: **[9,7,8]** — matches expected.

**Dry run 2 ("abc")**: lastIndex a=0,b=1,c=2. i=0: end=0,i===end→push 1,start=1. i=1: end=1,i===end→push1,start=2. i=2: end=2,i===end→push1. Return **[1,1,1]** — matches expected.`,
      },
    ],
    relatedSlugs: ["hand-of-straights", "gas-station"],
    realWorldUsageMarkdown: `Last-occurrence-driven greedy partitioning is the same idea used to merge overlapping intervals or to split a log/event stream into the maximum number of independent chunks such that no identifier spans a chunk boundary — useful for parallelizable batch splitting.`,
  },
  {
    slug: "valid-parenthesis-string",
    title: "Valid Parenthesis String",
    difficulty: "medium",
    maangTags: ["Google", "Meta"],
    topicSlug: "greedy",
    functionName: "checkValidString",
    description: `## Problem

Given a string \`s\` containing only \`'('\`, \`')'\`, and \`'*'\`, return \`true\` if \`s\` is valid. \`'*'\` can be treated as \`'('\`, \`')'\`, or the empty string. Validity follows normal parenthesis matching rules.

## Example

\`\`\`
Input: s = "(*))"
Output: true
Explanation: The '*' can act as '(' balancing the extra ')'.
\`\`\`

## Constraints

- \`1 <= s.length <= 100\`
- \`s[i]\` is \`'('\`, \`')'\`, or \`'*'\`.

## Senior interview angle

Rather than branching on all three interpretations of every \`'*'\` (exponential), track a **range** of possible open-paren counts: \`loW\` (minimum possible open count, treating \`'*'\` as \`')'\` or empty whenever it helps) and \`high\` (maximum possible open count, treating \`'*'\` as \`'('\` whenever it helps). A \`')'\` decrements both; a \`'*'\` decrements \`low\` and increments \`high\`; a \`'('\` increments both. If \`high\` ever drops below 0, no interpretation can recover — fail fast. Clamp \`low\` at 0 (can't have negative open parens, so an interpretation that would makes it negative just isn't used). Valid overall iff \`low\` can reach exactly 0 by the end, tracked automatically by the range containing 0 at the end and low itself resolving to 0.

## Pattern

\`Greedy range tracking (low/high open-count bounds)\` — collapse the exponential \`{'(', ')', ''}\` branching per \`'*'\` into two bounds updated in one linear pass.`,
    starterCode: `/**
 * @param {string} s
 * @return {boolean}
 */
function checkValidString(s) {
  // Your code here
}`,
    testCases: [
      { input: ["(*))"], expected: true },
      { input: ["(*)"], expected: true },
      { input: ["(((*)"], expected: false },
    ],
    solutions: [
      {
        approach: "Brute Force (Recursion over Star Interpretations)",
        timeComplexity: "O(3^n)",
        spaceComplexity: "O(n) call stack",
        overviewMarkdown:
          "At each `'*'`, branch into all three interpretations — treat it as `'('`, `')'`, or empty — recursing on the remaining string with an updated open-paren balance. `'('` and `')'` update the balance directly; fail immediately if the balance ever goes negative. Correct, but every `'*'` triples the branching factor.",
        code: `function checkValidString(s) {
  function helper(i, balance) {
    if (balance < 0) return false;
    if (i === s.length) return balance === 0;

    if (s[i] === "(") return helper(i + 1, balance + 1);
    if (s[i] === ")") return helper(i + 1, balance - 1);

    return (
      helper(i + 1, balance + 1) ||
      helper(i + 1, balance - 1) ||
      helper(i + 1, balance)
    );
  }

  return helper(0, 0);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`if (balance < 0) return false;\` | More \`')'\` than \`'('\` so far under this interpretation — invalid. |
| 4 | \`if (i === s.length) return balance === 0;\` | End of string: valid only if every open paren was matched. |
| 6-7 | \`if (s[i] === "(") ...  if (s[i] === ")") ...\` | Fixed characters update the balance deterministically. |
| 9-13 | \`return helper(...+1) \|\| helper(...-1) \|\| helper(...);\` | Try all three interpretations of \`'*'\`, succeeding if any leads to a valid string. |`,
        dryRunMarkdown: `**Dry run 1 ("(*)")**: \`helper(0,0)\`: s[0]='(' → \`helper(1,1)\`. \`helper(1,1)\`: s[1]='*' → try \`helper(2,2)\`, \`helper(2,0)\`, \`helper(2,1)\`. \`helper(2,0)\`: s[2]=')' → \`helper(3,-1)\` → balance<0 → false. \`helper(2,1)\`: s[2]=')' → \`helper(3,0)\` → \`i===length\`, balance===0 → true. So \`helper(1,1)\` = true (via the empty-string interpretation), \`helper(0,0)\` = **true** — matches expected.

**Dry run 2 ("(((*)")**: Three '(' push balance to 3, then '*' can add at most 1 more or subtract 1, then ')' subtracts 1 — best case balance ends at 3 or higher, never reaching 0 by string end under any interpretation. Every branch returns false → **false** — matches expected.`,
      },
      {
        approach: "Optimal (Greedy Low/High Range)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Track `low` (minimum possible count of unmatched open parens) and `high` (maximum possible count), both starting at 0. `'('` increments both. `')'` decrements both. `'*'` decrements `low` (best case: it's a `')'` or empty) and increments `high` (best case: it's a `'('`). Clamp `low` to 0 whenever it goes negative — a negative low just means that particular pessimistic interpretation isn't actually usable, not that the whole string fails. If `high` ever goes negative, no interpretation can recover, so fail immediately. Valid overall iff `low === 0` at the end.",
        code: `function checkValidString(s) {
  let low = 0;
  let high = 0;

  for (const ch of s) {
    if (ch === "(") {
      low++;
      high++;
    } else if (ch === ")") {
      low--;
      high--;
    } else {
      low--;
      high++;
    }

    if (high < 0) return false;
    if (low < 0) low = 0;
  }

  return low === 0;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`let low = 0; let high = 0;\` | Both bounds start at zero unmatched opens before any character. |
| 6-8 | \`if (ch === "(") { low++; high++; }\` | A literal open paren always increases both the minimum and maximum possible balance. |
| 9-11 | \`else if (ch === ")") { low--; high--; }\` | A literal close paren always decreases both. |
| 12-14 | \`else { low--; high++; }\` | \`'*'\`: pessimistically treat as \`')'\` for the lower bound, optimistically as \`'('\` for the upper bound. |
| 17 | \`if (high < 0) return false;\` | Even the most generous interpretation can't stay non-negative — unrecoverable, fail fast. |
| 18 | \`if (low < 0) low = 0;\` | A too-pessimistic interpretation just gets discarded — clamp instead of failing, since some other interpretation of past \`'*'\`s keeps things valid. |
| 21 | \`return low === 0;\` | Valid only if the most conservative interpretation can still land on exactly zero unmatched opens. |`,
        dryRunMarkdown: `**Dry run 1 ("(*))")**: low=0,high=0.
'(': low=1,high=1.
'*': low=0,high=2.
')': low=-1→clamp 0, high=1.
')': low=-1→clamp 0, high=0.
End: low===0 → **true** — matches expected.

**Dry run 2 ("(((*)")**: low=0,high=0.
'(': low=1,high=1.
'(': low=2,high=2.
'(': low=3,high=3.
'*': low=2,high=4.
')': low=1,high=3.
End: low(1)!==0 → **false** — matches expected.`,
      },
    ],
    relatedSlugs: ["partition-labels", "jump-game-ii"],
    realWorldUsageMarkdown: `Low/high range tracking generalizes to any validation problem with a wildcard that can shift a running counter within a bounded range — resource-slot scheduling where a flexible booking can count as either a start or end event, or balance-sheet reconciliation with ambiguous transaction types.`,
  },
];

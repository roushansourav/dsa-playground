import type { Problem } from "../types";

export const intervalProblems: Problem[] = [
  {
    slug: "insert-interval",
    title: "Insert Interval",
    difficulty: "medium",
    maangTags: ["Google", "Amazon"],
    topicSlug: "intervals",
    functionName: "insert",
    description: `## Problem

Given a sorted array of non-overlapping intervals \`intervals\` and a new interval \`newInterval\`, insert \`newInterval\` into \`intervals\` so the result remains sorted and non-overlapping (merging where necessary). Return the resulting array.

## Example

\`\`\`
Input: intervals = [[1,3],[6,9]], newInterval = [2,5]
Output: [[1,5],[6,9]]
\`\`\`

## Constraints

- \`0 <= intervals.length <= 10^4\`
- \`intervals[i].length == 2\`
- \`0 <= start_i <= end_i <= 10^5\`
- \`intervals\` is sorted by \`start_i\` and non-overlapping.

## Senior interview angle

Split the pass into exactly three phases: (1) copy every interval that ends strictly before \`newInterval\` starts, untouched — nothing to do yet. (2) merge every interval that overlaps \`newInterval\` by expanding \`newInterval\`'s own bounds (\`min\` of starts, \`max\` of ends) as each overlap is absorbed. (3) copy every remaining interval, untouched, after pushing the now-fully-merged \`newInterval\` once. The senior signal is doing this in one linear pass instead of merging then re-sorting — since the input is already sorted, a single index-driven scan with three phases is strictly better than "insert then run the general merge algorithm."

## Pattern

\`Three-phase linear merge (before / overlapping / after)\` — exploit the pre-sorted input to classify each interval in one pass instead of re-sorting after insertion.`,
    starterCode: `/**
 * @param {number[][]} intervals
 * @param {number[]} newInterval
 * @return {number[][]}
 */
function insert(intervals, newInterval) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            [1, 3],
            [6, 9],
          ],
          [2, 5],
        ],
        expected: [
          [1, 5],
          [6, 9],
        ],
      },
      {
        input: [
          [
            [1, 2],
            [3, 5],
            [6, 7],
            [8, 10],
            [12, 16],
          ],
          [4, 8],
        ],
        expected: [
          [1, 2],
          [3, 10],
          [12, 16],
        ],
      },
      { input: [[], [5, 7]], expected: [[5, 7]] },
    ],
    solutions: [
      {
        approach: "Brute Force (Insert, Sort, Then General Merge)",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Append `newInterval` to `intervals`, sort the combined array by start time, then run the standard sweep-and-merge algorithm (merge any interval whose start is `<= ` the current merged interval's end). Correct, but throws away the fact that `intervals` was already sorted, paying an unnecessary O(n log n) sort.",
        code: `function insert(intervals, newInterval) {
  const all = [...intervals, newInterval];
  all.sort((a, b) => a[0] - b[0]);

  const result = [];
  for (const [start, end] of all) {
    if (result.length === 0 || result[result.length - 1][1] < start) {
      result.push([start, end]);
    } else {
      result[result.length - 1][1] = Math.max(
        result[result.length - 1][1],
        end
      );
    }
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`all = [...intervals, newInterval]; all.sort(...)\` | Combine and re-sort from scratch, discarding the pre-sorted structure of \`intervals\`. |
| 6-8 | \`if (result.length === 0 \|\| result[last][1] < start)\` | No overlap with the last merged interval — start a new group. |
| 9-13 | \`result[last][1] = Math.max(...)\` | Overlaps — extend the last merged interval's end. |`,
        dryRunMarkdown: `**Dry run 1 (intervals=[[1,3],[6,9]], newInterval=[2,5])**: all sorted = [[1,3],[2,5],[6,9]]. result=[]. [1,3]: push → [[1,3]]. [2,5]: 3>=2, overlap → extend end to max(3,5)=5 → [[1,5]]. [6,9]: 5<6, no overlap → push → [[1,5],[6,9]]. Return **[[1,5],[6,9]]** — matches expected.

**Dry run 2 (intervals=[], newInterval=[5,7])**: all=[[5,7]]. result=[[5,7]]. Return **[[5,7]]** — matches expected.`,
      },
      {
        approach: "Optimal (Three-Phase Linear Scan)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n) for the output",
        overviewMarkdown:
          "Walk `intervals` once. Phase 1: push every interval ending before `newInterval` starts. Phase 2: absorb every interval that overlaps `newInterval` by widening `newInterval`'s own start/end, without pushing yet. Push the fully-widened `newInterval` once phase 2 ends. Phase 3: push every remaining interval unchanged. No sort needed since the input was already ordered.",
        code: `function insert(intervals, newInterval) {
  const result = [];
  let i = 0;
  const n = intervals.length;
  let [start, end] = newInterval;

  while (i < n && intervals[i][1] < start) {
    result.push(intervals[i]);
    i++;
  }

  while (i < n && intervals[i][0] <= end) {
    start = Math.min(start, intervals[i][0]);
    end = Math.max(end, intervals[i][1]);
    i++;
  }
  result.push([start, end]);

  while (i < n) {
    result.push(intervals[i]);
    i++;
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-9 | \`while (i < n && intervals[i][1] < start) { result.push(intervals[i]); i++; }\` | Phase 1: intervals entirely before \`newInterval\` need no changes. |
| 11-15 | \`while (i < n && intervals[i][0] <= end) { start = min(...); end = max(...); i++; }\` | Phase 2: every interval overlapping the (growing) \`newInterval\` gets absorbed by widening its bounds, not pushed individually. |
| 16 | \`result.push([start, end]);\` | Push the fully-merged interval exactly once, after absorbing every overlap. |
| 18-21 | \`while (i < n) { result.push(intervals[i]); i++; }\` | Phase 3: remaining intervals are entirely after \`newInterval\` — copy unchanged. |`,
        dryRunMarkdown: `**Dry run 1 (intervals=[[1,3],[6,9]], newInterval=[2,5])**: start=2,end=5,i=0.
Phase1: intervals[0][1]=3 < start(2)? No (3 is not < 2) → phase1 pushes nothing.
Phase2: intervals[0][0]=1 <= end(5)? Yes → start=min(2,1)=1, end=max(5,3)=5, i=1. intervals[1][0]=6 <= 5? No → stop. Push [1,5].
Phase3: push intervals[1]=[6,9].
Result: **[[1,5],[6,9]]** — matches expected.

**Dry run 2 (intervals=[], newInterval=[5,7])**: n=0, all loops skipped except push [5,7]. Return **[[5,7]]** — matches expected.`,
      },
    ],
    relatedSlugs: ["merge-intervals", "non-overlapping-intervals"],
    realWorldUsageMarkdown: `The three-phase merge is exactly how calendar systems insert a new booking into an existing sorted schedule without a full re-sort, and how CDN/network systems insert a new IP or port range into an existing sorted, non-overlapping allocation table.`,
  },
  {
    slug: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "medium",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "intervals",
    functionName: "merge",
    description: `## Problem

Given an array of intervals \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the intervals in the input.

## Example

\`\`\`
Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
\`\`\`

## Constraints

- \`1 <= intervals.length <= 10^4\`
- \`intervals[i].length == 2\`
- \`0 <= start_i <= end_i <= 10^4\`

## Senior interview angle

The entire problem collapses to one observation: **sort by start time first**, and then overlaps can only ever happen between an interval and the one immediately preceding it in the merged result — never two intervals further apart, because sorting guarantees anything in between would already have been absorbed. This is what allows a single linear sweep after the sort to be correct, and is the base case every later interval problem (Insert Interval, Meeting Rooms II) builds on or special-cases.

## Pattern

\`Sort by start, then linear sweep-and-merge\` — after sorting, only the current interval and the last merged interval ever need to be compared.`,
    starterCode: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            [1, 3],
            [2, 6],
            [8, 10],
            [15, 18],
          ],
        ],
        expected: [
          [1, 6],
          [8, 10],
          [15, 18],
        ],
      },
      {
        input: [
          [
            [1, 4],
            [4, 5],
          ],
        ],
        expected: [[1, 5]],
      },
      {
        input: [
          [
            [1, 4],
            [0, 4],
          ],
        ],
        expected: [[0, 4]],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Repeated Pairwise Merge Passes)",
        timeComplexity: "O(n^3)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Repeatedly scan all pairs of intervals; whenever two overlap, merge them into one and restart the pairwise scan over the shrunken list. Continue until a full pass finds no overlaps left. Correct, but each merge triggers another full O(n^2) rescan, and this can happen O(n) times.",
        code: `function merge(intervals) {
  let result = intervals.map((iv) => [...iv]);
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
| 5-7 | \`while (merged) { merged = false; ... }\` | Keep sweeping for overlapping pairs until an entire pass finds none. |
| 10 | \`if (aStart <= bEnd && bStart <= aEnd)\` | Two intervals overlap iff each one starts before (or when) the other ends. |
| 11-13 | \`result[i] = [min, max]; result.splice(j, 1); merged = true;\` | Merge the pair in place, remove the absorbed interval, and restart the scan since indices shifted. |`,
        dryRunMarkdown: `**Dry run 1 ([[1,3],[2,6],[8,10],[15,18]])**: Pass 1: i=0,j=1: [1,3] & [2,6] overlap (1<=6 && 2<=3) → merge to [1,6], remove index1. result=[[1,6],[8,10],[15,18]]. Restart scan (merged=true): i=0,j=1: [1,6] & [8,10]: 1<=10 && 8<=6? false → no. i=0,j=2: [1,6]&[15,18]: false. i=1,j=2: [8,10]&[15,18]: 8<=18&&15<=10? false. No merges this pass → merged stays false → loop ends. Return **[[1,6],[8,10],[15,18]]** — matches expected.

**Dry run 2 ([[1,4],[0,4]])**: i=0,j=1: [1,4]&[0,4]: 1<=4&&0<=4 → merge to [min(1,0)=0, max(4,4)=4] = [0,4]. Return **[[0,4]]** — matches expected.`,
      },
      {
        approach: "Optimal (Sort + Linear Sweep)",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Sort intervals by start time. Walk through once, keeping the last interval pushed to `result`. If the current interval's start is `<=` that last interval's end, they overlap — extend the last interval's end in place. Otherwise, push the current interval as a new group.",
        code: `function merge(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const result = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const [start, end] = sorted[i];
    const last = result[result.length - 1];

    if (start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      result.push([start, end]);
    }
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`sorted = [...intervals].sort((a, b) => a[0] - b[0]);\` | Sorting by start guarantees any overlap only ever involves the immediately preceding merged group. |
| 3 | \`const result = [sorted[0]];\` | Seed with the first interval as the first group. |
| 8-9 | \`if (start <= last[1]) last[1] = Math.max(last[1], end);\` | Overlaps the last group — extend its end (it can only grow, since intervals are sorted by start). |
| 11 | \`else result.push([start, end]);\` | No overlap — this starts a brand-new group. |`,
        dryRunMarkdown: `**Dry run 1 ([[1,3],[2,6],[8,10],[15,18]])**: sorted (already sorted) = same. result=[[1,3]].
i=1 [2,6]: last=[1,3]. 2<=3 → last[1]=max(3,6)=6 → result=[[1,6]].
i=2 [8,10]: last=[1,6]. 8<=6? No → push → result=[[1,6],[8,10]].
i=3 [15,18]: last=[8,10]. 15<=10? No → push → result=[[1,6],[8,10],[15,18]].
Return **[[1,6],[8,10],[15,18]]** — matches expected.

**Dry run 2 ([[1,4],[0,4]])**: sorted=[[0,4],[1,4]]. result=[[0,4]]. i=1 [1,4]: last=[0,4]. 1<=4 → last[1]=max(4,4)=4 → result=[[0,4]]. Return **[[0,4]]** — matches expected.`,
      },
    ],
    relatedSlugs: ["insert-interval", "meeting-rooms-ii"],
    realWorldUsageMarkdown: `Sort-then-sweep merging is the algorithm behind coalescing overlapping calendar bookings into free/busy blocks, combining overlapping IP/CIDR ranges in firewall rules, and merging overlapping genomic coordinate ranges in bioinformatics pipelines.`,
  },
  {
    slug: "non-overlapping-intervals",
    title: "Non-overlapping Intervals",
    difficulty: "medium",
    maangTags: ["Google", "Meta"],
    topicSlug: "intervals",
    functionName: "eraseOverlapIntervals",
    description: `## Problem

Given an array of intervals \`intervals\`, return the minimum number of intervals you need to remove so the rest are non-overlapping.

## Example

\`\`\`
Input: intervals = [[1,2],[2,3],[3,4],[1,3]]
Output: 1
Explanation: Remove [1,3] and the rest are non-overlapping.
\`\`\`

## Constraints

- \`1 <= intervals.length <= 10^5\`
- \`intervals[i].length == 2\`
- \`-5 * 10^4 <= start_i < end_i <= 5 * 10^4\`

## Senior interview angle

This is activity selection in disguise: sort by **end time**, not start time, then greedily keep every interval whose start is \`>=\` the end of the last interval kept, discarding (counting as removed) anything that overlaps. Sorting by end time is the crux — it guarantees the kept interval at each step leaves the most room for future intervals, which is the textbook proof for why greedy activity selection is optimal. Sorting by start time instead is the most common wrong-first-instinct here, and quietly produces a suboptimal (too-large) removal count on adversarial inputs.

## Pattern

\`Greedy activity selection (sort by end time)\` — always keep the interval that frees up the earliest end time, maximizing room for everything after it.`,
    starterCode: `/**
 * @param {number[][]} intervals
 * @return {number}
 */
function eraseOverlapIntervals(intervals) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            [1, 2],
            [2, 3],
            [3, 4],
            [1, 3],
          ],
        ],
        expected: 1,
      },
      {
        input: [
          [
            [1, 2],
            [1, 2],
            [1, 2],
          ],
        ],
        expected: 2,
      },
      {
        input: [
          [
            [1, 2],
            [2, 3],
          ],
        ],
        expected: 0,
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Try Every Subset via Recursion)",
        timeComplexity: "O(2^n)",
        spaceComplexity: "O(n) call stack",
        overviewMarkdown:
          "At each interval, decide to keep it or remove it. If kept, it must not overlap the most recently kept interval. Recurse over both choices and find the maximum number of intervals that can be kept; the answer is `n` minus that maximum. Correct, but explores every subset.",
        code: `function eraseOverlapIntervals(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);

  function helper(i, lastEnd) {
    if (i === sorted.length) return 0;

    const skip = helper(i + 1, lastEnd);

    let keep = 0;
    if (sorted[i][0] >= lastEnd) {
      keep = 1 + helper(i + 1, sorted[i][1]);
    }

    return Math.max(skip, keep);
  }

  const maxKept = helper(0, -Infinity);
  return sorted.length - maxKept;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6 | \`const skip = helper(i + 1, lastEnd);\` | Choice 1: remove this interval, \`lastEnd\` unchanged. |
| 9-11 | \`if (sorted[i][0] >= lastEnd) keep = 1 + helper(i + 1, sorted[i][1]);\` | Choice 2: keep this interval only if it doesn't overlap the last kept one; \`lastEnd\` becomes its end. |
| 13 | \`return Math.max(skip, keep);\` | Maximum intervals keepable from here onward. |
| 17 | \`return sorted.length - maxKept;\` | Minimum removals is total minus the largest non-overlapping subset kept. |`,
        dryRunMarkdown: `**Dry run 1 ([[1,2],[2,3],[3,4],[1,3]])**: sorted by start = [[1,2],[1,3],[2,3],[3,4]]. Best kept subset: [1,2],[2,3],[3,4] (size 3, all touching-not-overlapping). \`helper\` explores all subsets and finds maxKept=3. Removals = 4-3 = **1** — matches expected.

**Dry run 2 ([[1,2],[1,2],[1,2]])**: Only one of the three identical intervals can ever be kept (any second one starts at 1, which is not \`>= lastEnd(2)\`). maxKept=1. Removals = 3-1 = **2** — matches expected.`,
      },
      {
        approach: "Optimal (Greedy, Sort by End Time)",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n) for the sort",
        overviewMarkdown:
          "Sort intervals by end time. Walk through greedily keeping track of `lastEnd`, the end of the most recently kept interval. If the current interval's start is `>= lastEnd`, keep it and update `lastEnd`. Otherwise it overlaps — count it as a removal (never updating `lastEnd`, since the interval already kept has the earlier, more favorable end time).",
        code: `function eraseOverlapIntervals(intervals) {
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]);

  let removals = 0;
  let lastEnd = -Infinity;

  for (const [start, end] of sorted) {
    if (start >= lastEnd) {
      lastEnd = end;
    } else {
      removals++;
    }
  }

  return removals;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`sorted = [...intervals].sort((a, b) => a[1] - b[1]);\` | Sort by **end time** — the key greedy decision that guarantees optimality. |
| 5 | \`let lastEnd = -Infinity;\` | No interval kept yet. |
| 8-10 | \`if (start >= lastEnd) lastEnd = end;\` | No overlap with the last kept interval — keep this one, its end becomes the new bar. |
| 11-12 | \`else removals++;\` | Overlaps — must remove it (its end is later than the already-kept interval's end, so keeping it would only hurt future room). |`,
        dryRunMarkdown: `**Dry run 1 ([[1,2],[2,3],[3,4],[1,3]])**: sorted by end = [[1,2],[2,3],[1,3],[3,4]] (end values 2,3,3,4; [2,3] and [1,3] tie at end=3, order between them doesn't affect the count here). lastEnd=-∞, removals=0.
[1,2]: 1>=-∞ → keep, lastEnd=2.
[2,3]: 2>=2 → keep, lastEnd=3.
[1,3]: 1>=3? No → removals=1.
[3,4]: 3>=3 → keep, lastEnd=4.
Return removals = **1** — matches expected.

**Dry run 2 ([[1,2],[1,2],[1,2]])**: sorted=[[1,2],[1,2],[1,2]]. lastEnd=-∞.
First [1,2]: keep, lastEnd=2.
Second [1,2]: 1>=2? No → removals=1.
Third [1,2]: 1>=2? No → removals=2.
Return **2** — matches expected.`,
      },
    ],
    relatedSlugs: ["merge-intervals", "meeting-rooms"],
    realWorldUsageMarkdown: `Sort-by-end-time greedy selection is the classic algorithm behind conference-room/course scheduling to maximize the number of non-conflicting bookings kept, and job-scheduling systems that must drop the fewest tasks to eliminate resource conflicts.`,
  },
  {
    slug: "meeting-rooms",
    title: "Meeting Rooms",
    difficulty: "easy",
    maangTags: ["Google", "Amazon", "Meta"],
    topicSlug: "intervals",
    functionName: "canAttendMeetings",
    description: `## Problem

Given an array of meeting time intervals \`intervals\` where \`intervals[i] = [start_i, end_i]\`, return \`true\` if a single person could attend every meeting (i.e. no two meetings overlap).

## Example

\`\`\`
Input: intervals = [[0,30],[5,10],[15,20]]
Output: false
\`\`\`

## Constraints

- \`0 <= intervals.length <= 10^4\`
- \`intervals[i].length == 2\`
- \`0 <= start_i < end_i <= 10^6\`

## Senior interview angle

The simplest possible interval check, and worth doing fast: sort by start time, then confirm every meeting's start is \`>=\` the previous meeting's end. A meeting ending exactly when the next begins (\`[1,5]\` then \`[5,10]\`) is **not** an overlap — back-to-back is fine, since nobody needs to be in two places at once at a single instant. This edge case (\`<\` vs \`<=\`) is the one thing interviewers listen for; getting it backwards either over- or under-counts conflicts.

## Pattern

\`Sort + adjacent-pair check\` — after sorting by start, a conflict exists iff any interval starts strictly before the previous one ends.`,
    starterCode: `/**
 * @param {number[][]} intervals
 * @return {boolean}
 */
function canAttendMeetings(intervals) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            [0, 30],
            [5, 10],
            [15, 20],
          ],
        ],
        expected: false,
      },
      {
        input: [
          [
            [7, 10],
            [2, 4],
          ],
        ],
        expected: true,
      },
      {
        input: [
          [
            [1, 5],
            [5, 10],
          ],
        ],
        expected: true,
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Compare Every Pair)",
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Compare every pair of meetings directly; if any pair overlaps (one starts strictly before the other ends, in both directions), attending all of them is impossible. Correct, but quadratic when sorting could do it in one pass.",
        code: `function canAttendMeetings(intervals) {
  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      const [aStart, aEnd] = intervals[i];
      const [bStart, bEnd] = intervals[j];
      if (aStart < bEnd && bStart < aEnd) {
        return false;
      }
    }
  }
  return true;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`for (i ...) for (j = i+1 ...)\` | Check every distinct pair of meetings exactly once. |
| 6 | \`if (aStart < bEnd && bStart < aEnd)\` | Strict overlap check — touching endpoints (\`aEnd === bStart\`) is deliberately allowed. |
| 7 | \`return false;\` | Found a genuine conflict — can't attend everything. |`,
        dryRunMarkdown: `**Dry run 1 ([[0,30],[5,10],[15,20]])**: i=0,j=1: [0,30]&[5,10]: 0<10 && 5<30 → true → return **false** — matches expected.

**Dry run 2 ([[1,5],[5,10]])**: i=0,j=1: [1,5]&[5,10]: 1<10 && 5<5? \`5<5\` is false → no overlap. Loop ends without finding a conflict. Return **true** — matches expected.`,
      },
      {
        approach: "Optimal (Sort + Single Pass)",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n) for the sort",
        overviewMarkdown:
          "Sort meetings by start time. Walk through once comparing each meeting's start to the previous meeting's end. Any strict overlap (`start < previousEnd`) means attendance is impossible; reaching the end of the array without one means every meeting fits.",
        code: `function canAttendMeetings(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][0] < sorted[i - 1][1]) {
      return false;
    }
  }

  return true;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`sorted = [...intervals].sort((a, b) => a[0] - b[0]);\` | Ordering by start makes only adjacent-pair comparisons necessary. |
| 5 | \`if (sorted[i][0] < sorted[i - 1][1])\` | This meeting starts before the previous one finished — a genuine conflict. |
| 6 | \`return false;\` | One conflict is enough to make full attendance impossible. |
| 10 | \`return true;\` | No adjacent pair conflicted, so no pair anywhere conflicts (sorting guarantees this). |`,
        dryRunMarkdown: `**Dry run 1 ([[0,30],[5,10],[15,20]])**: sorted=[[0,30],[5,10],[15,20]]. i=1: sorted[1][0]=5 < sorted[0][1]=30 → **false** — matches expected.

**Dry run 2 ([[7,10],[2,4]])**: sorted=[[2,4],[7,10]]. i=1: sorted[1][0]=7 < sorted[0][1]=4? No. Loop ends. Return **true** — matches expected.

**Dry run 3 ([[1,5],[5,10]])**: sorted=[[1,5],[5,10]]. i=1: 5 < 5? No (touching, not overlapping). Return **true** — matches expected.`,
      },
    ],
    relatedSlugs: ["meeting-rooms-ii", "non-overlapping-intervals"],
    realWorldUsageMarkdown: `This exact check runs behind every "can I book this?" calendar conflict validator, and the strict-vs-inclusive endpoint comparison is the same edge case that shows up in resource-lock overlap checks (does releasing a lock at time T and acquiring at time T count as a conflict?).`,
  },
  {
    slug: "meeting-rooms-ii",
    title: "Meeting Rooms II",
    difficulty: "medium",
    maangTags: ["Google", "Amazon", "Meta"],
    topicSlug: "intervals",
    functionName: "minMeetingRooms",
    description: `## Problem

Given an array of meeting time intervals \`intervals\` where \`intervals[i] = [start_i, end_i]\`, return the minimum number of conference rooms required to hold all the meetings.

## Example

\`\`\`
Input: intervals = [[0,30],[5,10],[15,20]]
Output: 2
\`\`\`

## Constraints

- \`1 <= intervals.length <= 10^4\`
- \`0 <= start_i < end_i <= 10^6\`

## Senior interview angle

Separate the start times and end times into two independently sorted arrays and sweep them with two pointers, like merging two sorted lists. Every time a start time occurs before the earliest still-unprocessed end time, a new room is needed (increment a counter); every time an end time is processed before or at the next start, a room frees up (decrement). The peak value of this running counter across the whole sweep is the answer. The senior signal is recognizing that decoupling starts from ends (rather than tracking whole intervals) turns this into a simple two-pointer sweep — trying to reason about it interval-by-interval (e.g. with a naive heap of raw intervals) works but is more error-prone under time pressure than the pure timestamp sweep.

## Pattern

\`Two-pointer timestamp sweep\` — process sorted start times and end times independently; the running (starts processed − ends processed) count peaks at the answer.`,
    starterCode: `/**
 * @param {number[][]} intervals
 * @return {number}
 */
function minMeetingRooms(intervals) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            [0, 30],
            [5, 10],
            [15, 20],
          ],
        ],
        expected: 2,
      },
      {
        input: [
          [
            [7, 10],
            [2, 4],
          ],
        ],
        expected: 1,
      },
      {
        input: [
          [
            [9, 10],
            [4, 9],
            [4, 17],
          ],
        ],
        expected: 2,
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Min-Heap of Active End Times)",
        timeComplexity: "O(n^2) with an array-based heap simulation",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Sort meetings by start time. Maintain a list of currently \"active\" end times. For each meeting, remove any active end times that are `<=` this meeting's start (those rooms freed up), then add this meeting's end time. Track the maximum size the active list ever reaches. Correct, but scanning and removing from a plain array of active end times is O(n) per meeting.",
        code: `function minMeetingRooms(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const active = [];
  let maxRooms = 0;

  for (const [start, end] of sorted) {
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i] <= start) {
        active.splice(i, 1);
      }
    }
    active.push(end);
    maxRooms = Math.max(maxRooms, active.length);
  }

  return maxRooms;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`sorted = [...intervals].sort((a, b) => a[0] - b[0]);\` | Process meetings in start-time order. |
| 6-10 | \`for (i = active.length-1; ...) { if (active[i] <= start) active.splice(i, 1); }\` | Free up every room whose meeting has already ended by the time this one starts. |
| 11 | \`active.push(end);\` | Occupy a room for this meeting until its end time. |
| 12 | \`maxRooms = Math.max(maxRooms, active.length);\` | Track the peak simultaneous room usage. |`,
        dryRunMarkdown: `**Dry run 1 ([[0,30],[5,10],[15,20]])**: sorted (already sorted by start): [0,30],[5,10],[15,20]. active=[], maxRooms=0.
[0,30]: nothing to free. active=[30]. maxRooms=1.
[5,10]: 30<=5? No. active=[30,10]. maxRooms=2.
[15,20]: 30<=15? No. 10<=15? Yes → remove → active=[30]. active=[30,20]. maxRooms stays 2.
Return **2** — matches expected.

**Dry run 2 ([[7,10],[2,4]])**: sorted=[[2,4],[7,10]]. active=[]. [2,4]: active=[4]. maxRooms=1. [7,10]: 4<=7 → remove → active=[]. active=[10]. maxRooms stays 1. Return **1** — matches expected.`,
      },
      {
        approach: "Optimal (Two-Pointer Start/End Timestamp Sweep)",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Extract and sort all start times and all end times into two separate arrays. Walk two pointers across them: if the current start time is strictly less than the current end time, a new room is needed (advance the start pointer, increment `rooms`); otherwise a room frees up first (advance the end pointer, decrement `rooms`). Track the peak value of `rooms` across the whole sweep.",
        code: `function minMeetingRooms(intervals) {
  const starts = intervals.map((iv) => iv[0]).sort((a, b) => a - b);
  const ends = intervals.map((iv) => iv[1]).sort((a, b) => a - b);

  let rooms = 0;
  let maxRooms = 0;
  let s = 0;
  let e = 0;

  while (s < starts.length) {
    if (starts[s] < ends[e]) {
      rooms++;
      s++;
      maxRooms = Math.max(maxRooms, rooms);
    } else {
      rooms--;
      e++;
    }
  }

  return maxRooms;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`starts = ...sort(); ends = ...sort();\` | Decouple start and end timestamps entirely, each independently sorted. |
| 10 | \`if (starts[s] < ends[e])\` | The next chronological event is a meeting starting before the earliest currently-tracked meeting ends. |
| 11-13 | \`rooms++; s++; maxRooms = Math.max(...);\` | A new room is needed; track the new peak. |
| 15-16 | \`rooms--; e++;\` | The next chronological event is a meeting ending — a room frees up before (or exactly when) the next start. |`,
        dryRunMarkdown: `**Dry run 1 ([[0,30],[5,10],[15,20]])**: starts=[0,5,15], ends=[10,20,30]. rooms=0,maxRooms=0,s=0,e=0.
starts[0]=0 < ends[0]=10 → rooms=1,s=1,maxRooms=1.
starts[1]=5 < ends[0]=10 → rooms=2,s=2,maxRooms=2.
starts[2]=15 < ends[0]=10? No → rooms=1,e=1.
s(2) < starts.length(3): starts[2]=15 < ends[1]=20 → rooms=2,s=3,maxRooms stays 2.
s===starts.length → loop ends. Return **2** — matches expected.

**Dry run 2 ([[9,10],[4,9],[4,17]])**: starts=[4,4,9], ends=[9,10,17]. rooms=0,maxRooms=0.
starts[0]=4 < ends[0]=9 → rooms=1,s=1,maxRooms=1.
starts[1]=4 < ends[0]=9 → rooms=2,s=2,maxRooms=2.
starts[2]=9 < ends[0]=9? No → rooms=1,e=1.
starts[2]=9 < ends[1]=10 → rooms=2,s=3,maxRooms stays 2.
Return **2** — matches expected.`,
      },
    ],
    relatedSlugs: ["meeting-rooms", "merge-intervals"],
    realWorldUsageMarkdown: `The timestamp-sweep technique is the direct algorithm behind conference-room/resource-pool sizing (how many concurrent rooms, servers, or licenses are actually needed to cover peak demand) and is the same peak-concurrency calculation used in connection-pool and thread-pool capacity planning.`,
  },
  {
    slug: "minimum-interval-to-include-each-query",
    title: "Minimum Interval to Include Each Query",
    difficulty: "hard",
    maangTags: ["Google", "Meta"],
    topicSlug: "intervals",
    functionName: "minInterval",
    description: `## Problem

Given an array of intervals \`intervals\` where \`intervals[i] = [left_i, right_i]\` and an array of query points \`queries\`, for each query find the **size** (\`right - left + 1\`) of the smallest interval containing it. If no interval contains a query, its answer is \`-1\`. Return the answers in the same order as \`queries\`.

## Example

\`\`\`
Input: intervals = [[1,4],[2,4],[3,6],[4,4]], queries = [2,3,4,5]
Output: [3,3,1,4]
\`\`\`

## Constraints

- \`1 <= intervals.length, queries.length <= 10^5\`
- \`1 <= left_i <= right_i <= 10^7\`
- \`1 <= queries[j] <= 10^7\`

## Senior interview angle

Sort both intervals (by left endpoint) and queries (ascending), then sweep queries left to right with a **min-heap keyed on interval size**. At each query, first push every interval whose left endpoint is \`<= \` the query (it's now "in play"), then pop from the heap any interval whose right endpoint is \`< \` the query (it's expired, no longer contains this or any future — larger — query). The heap top is then the smallest surviving interval, which by construction contains the query. Sorting queries is the non-obvious move: it lets both the "add intervals" pointer and the "expire intervals" heap-pop process advance monotonically forward, never re-scanning, at the cost of needing to un-sort the answers back into the original query order at the end.

## Pattern

\`Offline query sort + min-heap sweep\` — sort queries to make interval activation and expiration both monotonic single passes, tracked with a heap ordered by interval size.`,
    starterCode: `/**
 * @param {number[][]} intervals
 * @param {number[]} queries
 * @return {number[]}
 */
function minInterval(intervals, queries) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            [1, 4],
            [2, 4],
            [3, 6],
            [4, 4],
          ],
          [2, 3, 4, 5],
        ],
        expected: [3, 3, 1, 4],
      },
      {
        input: [
          [
            [2, 3],
            [2, 5],
            [1, 8],
            [20, 25],
          ],
          [2, 19, 5, 22],
        ],
        expected: [2, -1, 4, 6],
      },
      { input: [[[1, 10]], [5]], expected: [10] },
    ],
    solutions: [
      {
        approach: "Brute Force (Scan All Intervals per Query)",
        timeComplexity: "O(n · m)",
        spaceComplexity: "O(m) for the output",
        overviewMarkdown:
          "For each query independently, scan every interval and track the smallest size among those that contain it. Simple and obviously correct, but re-scans the full interval list from scratch for every query.",
        code: `function minInterval(intervals, queries) {
  return queries.map((q) => {
    let best = -1;
    for (const [left, right] of intervals) {
      if (left <= q && q <= right) {
        const size = right - left + 1;
        if (best === -1 || size < best) {
          best = size;
        }
      }
    }
    return best;
  });
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`queries.map((q) => { ... })\` | Answer each query completely independently. |
| 4-9 | \`for (const [left, right] of intervals) { if (left <= q && q <= right) { ... } }\` | Check every interval for containment; track the smallest containing size. |
| 11 | \`return best;\` | \`-1\` if no interval ever contained \`q\`, otherwise the smallest containing size. |`,
        dryRunMarkdown: `**Dry run 1 (intervals=[[1,4],[2,4],[3,6],[4,4]], queries=[2,3,4,5])**: q=2: [1,4] size4 contains, [2,4] size3 contains, [3,6] size4 no(3<=2 false), [4,4] no → best=3. q=3: [1,4]size4, [2,4]size3, [3,6]size4 contains → best=3. q=4: [1,4]size4,[2,4]size3,[3,6]size4,[4,4]size1 → best=1. q=5: only [3,6] size4 contains → best=4. Result: **[3,3,1,4]** — matches expected.

**Dry run 2 (intervals=[[1,10]], queries=[5])**: q=5: [1,10] contains, size=10. Result: **[10]** — matches expected.`,
      },
      {
        approach: "Optimal (Sort Queries + Min-Heap Sweep)",
        timeComplexity: "O((n + m) log n)",
        spaceComplexity: "O(n + m)",
        overviewMarkdown:
          "Sort intervals by left endpoint, and process queries in ascending order (remembering their original index to reconstruct the answer array at the end). Maintain a min-heap of `[size, right]` for every interval whose left endpoint has been reached so far. For each query, first admit every interval whose left endpoint is `<=` the query; then pop and discard heap entries whose right endpoint is `<` the query (expired). The heap's minimum-size entry left standing is the answer for that query.",
        code: `function minInterval(intervals, queries) {
  const sortedIntervals = [...intervals].sort((a, b) => a[0] - b[0]);
  const order = queries
    .map((q, i) => [q, i])
    .sort((a, b) => a[0] - b[0]);

  const heap = []; // array of [size, right], kept sorted ascending by size
  const answer = new Array(queries.length).fill(-1);
  let i = 0;

  function heapPush(item) {
    heap.push(item);
    heap.sort((a, b) => a[0] - b[0]);
  }
  function heapPop() {
    return heap.shift();
  }

  for (const [q, originalIndex] of order) {
    while (i < sortedIntervals.length && sortedIntervals[i][0] <= q) {
      const [left, right] = sortedIntervals[i];
      heapPush([right - left + 1, right]);
      i++;
    }

    while (heap.length > 0 && heap[0][1] < q) {
      heapPop();
    }

    if (heap.length > 0) {
      answer[originalIndex] = heap[0][0];
    }
  }

  return answer;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`sortedIntervals = [...intervals].sort((a, b) => a[0] - b[0]);\` | Process interval activation in left-endpoint order. |
| 3-5 | \`order = queries.map((q, i) => [q, i]).sort(...)\` | Sort queries ascending while keeping each one's original index, so the final answer can be placed back correctly. |
| 8 | \`const heap = [];\` | Modeled as a sorted array for clarity; a real priority queue would make push/pop O(log n) instead of O(n log n) from the re-sort. |
| 19-23 | \`while (i < ... && sortedIntervals[i][0] <= q) { heapPush(...); i++; }\` | Admit every interval that has \"started\" by this query — the pointer \`i\` only ever moves forward. |
| 25-27 | \`while (heap.length > 0 && heap[0][1] < q) heapPop();\` | Expire intervals whose right endpoint is already behind this query — they can never contain this or any later (larger) query either. |
| 29-31 | \`if (heap.length > 0) answer[originalIndex] = heap[0][0];\` | The smallest surviving interval size is the answer for this query. |`,
        dryRunMarkdown: `**Dry run 1 (intervals=[[1,4],[2,4],[3,6],[4,4]], queries=[2,3,4,5])**: sortedIntervals (by left) = [[1,4],[2,4],[3,6],[4,4]]. order (already ascending) = [[2,0],[3,1],[4,2],[5,3]]. heap=[], i=0.
q=2: admit [1,4]→push[4,4], i=1; admit [2,4]→push[3,4], i=2 (left=3<=2? No, stop). heap sorted=[[3,4],[4,4]]. Expire: heap[0][1]=4<2? No. answer[0]=3.
q=3: admit [3,6]→push[4,6], i=3 (left=4<=3? No, stop). heap=[[3,4],[4,4],[4,6]] sorted by size. Expire: heap[0][1]=4<3? No. answer[1]=3.
q=4: admit [4,4]→push[1,4], i=4. heap=[[1,4],[3,4],[4,4],[4,6]]. Expire: heap[0][1]=4<4? No. answer[2]=1.
q=5: no more to admit (i=4=length). Expire: heap[0]=[1,4], right=4<5 → pop. Next heap[0]=[3,4], right=4<5 → pop. Next heap[0]=[4,4], right=4<5 → pop. Next heap[0]=[4,6], right=6<5? No. answer[3]=4.
Result (already in original order since order preserved indices 0,1,2,3): **[3,3,1,4]** — matches expected.

**Dry run 2 (intervals=[[1,10]], queries=[5])**: sortedIntervals=[[1,10]]. order=[[5,0]]. q=5: admit [1,10]→push[10,10], i=1. Expire: heap[0][1]=10<5? No. answer[0]=10. Result: **[10]** — matches expected.`,
      },
    ],
    relatedSlugs: ["meeting-rooms-ii", "merge-intervals"],
    realWorldUsageMarkdown: `Offline query-sort-plus-heap sweeps are the standard technique for batch-answering "smallest covering range" lookups — DNS/CIDR longest/shortest prefix matching in bulk, or finding the tightest applicable pricing tier/SLA window for a batch of timestamped events.`,
  },
  {
    slug: "car-pooling",
    title: "Car Pooling",
    difficulty: "medium",
    maangTags: ["Amazon", "Apple"],
    topicSlug: "intervals",
    functionName: "carPooling",
    description: `## Problem

A car has \`capacity\` empty seats. Given \`trips\` where \`trips[i] = [numPassengers, from, to]\` indicates a trip picking up \`numPassengers\` at mile \`from\` and dropping them off at mile \`to\`, return \`true\` if it's possible to pick up and drop off all passengers for all trips without ever exceeding \`capacity\`.

## Example

\`\`\`
Input: trips = [[2,1,5],[3,3,7]], capacity = 4
Output: false
\`\`\`

## Constraints

- \`1 <= trips.length <= 1000\`
- \`trips[i].length == 3\`
- \`1 <= numPassengers_i <= 100\`
- \`0 <= from_i < to_i <= 1000\`
- \`0 <= capacity <= 10^5\`

## Senior interview angle

This is Meeting Rooms II's timestamp-sweep, generalized from "count of overlapping intervals" to "sum of a weight (passenger count) across overlapping intervals." Record \`+numPassengers\` at each \`from\` mile and \`-numPassengers\` at each \`to\` mile on a difference array indexed by mile marker, then take a running prefix sum across all miles — the max value that running sum ever reaches is the peak simultaneous occupancy. The reframe from "track individual trips" to "track net passenger delta per mile" is what turns an apparently interval-heavy problem into a simple fixed-size array sweep, since mile markers are bounded (\`<= 1000\`).

## Pattern

\`Difference array + prefix sum sweep\` — record passenger deltas at pickup/dropoff miles, then the running prefix sum's peak is the max simultaneous occupancy.`,
    starterCode: `/**
 * @param {number[][]} trips
 * @param {number} capacity
 * @return {boolean}
 */
function carPooling(trips, capacity) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            [2, 1, 5],
            [3, 3, 7],
          ],
          4,
        ],
        expected: false,
      },
      {
        input: [
          [
            [2, 1, 5],
            [3, 3, 7],
          ],
          5,
        ],
        expected: true,
      },
      {
        input: [
          [
            [2, 1, 5],
            [3, 5, 7],
          ],
          3,
        ],
        expected: true,
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Simulate Occupancy at Every Mile)",
        timeComplexity: "O(trips.length · maxMile)",
        spaceComplexity: "O(1) extra",
        overviewMarkdown:
          "For every mile marker from 0 up to the maximum `to` value, sum up `numPassengers` for every trip whose range covers that mile, and check it never exceeds `capacity`. Correct, but re-scans every trip for every single mile.",
        code: `function carPooling(trips, capacity) {
  let maxMile = 0;
  for (const [, , to] of trips) {
    maxMile = Math.max(maxMile, to);
  }

  for (let mile = 0; mile < maxMile; mile++) {
    let occupancy = 0;
    for (const [passengers, from, to] of trips) {
      if (from <= mile && mile < to) {
        occupancy += passengers;
      }
    }
    if (occupancy > capacity) return false;
  }

  return true;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-4 | \`for (const [, , to] of trips) maxMile = Math.max(...)\` | Find how far out to check — no trip extends past the furthest \`to\`. |
| 6 | \`for (let mile = 0; mile < maxMile; mile++)\` | Check occupancy at every individual mile. |
| 8-11 | \`if (from <= mile && mile < to) occupancy += passengers;\` | This trip is actively on board at this mile (dropoff mile itself doesn't count as occupied). |
| 12 | \`if (occupancy > capacity) return false;\` | Overloaded at this mile — impossible. |`,
        dryRunMarkdown: `**Dry run 1 (trips=[[2,1,5],[3,3,7]], capacity=4)**: maxMile=7. mile=3: trip1 (1<=3<5) contributes 2, trip2 (3<=3<7) contributes 3 → occupancy=5 > 4 → return **false** — matches expected.

**Dry run 2 (trips=[[2,1,5],[3,3,7]], capacity=5)**: same occupancy peak of 5 at miles 3,4 — 5 is not \`> 5\`, so it passes at every mile. Return **true** — matches expected.`,
      },
      {
        approach: "Optimal (Difference Array + Prefix Sum)",
        timeComplexity: "O(trips.length + maxMile)",
        spaceComplexity: "O(maxMile)",
        overviewMarkdown:
          "Build a difference array indexed by mile marker (bounded by the problem's constraints at 1001 entries). For each trip, add `numPassengers` at index `from` and subtract it at index `to` (the trip is no longer aboard from `to` onward). Then sweep the array left to right accumulating a running sum — this running sum at each mile is exactly the current occupancy. Fail the moment it exceeds `capacity`.",
        code: `function carPooling(trips, capacity) {
  const delta = new Array(1001).fill(0);

  for (const [passengers, from, to] of trips) {
    delta[from] += passengers;
    delta[to] -= passengers;
  }

  let occupancy = 0;
  for (const change of delta) {
    occupancy += change;
    if (occupancy > capacity) return false;
  }

  return true;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`const delta = new Array(1001).fill(0);\` | One slot per possible mile marker (constraints guarantee \`to <= 1000\`). |
| 5-6 | \`delta[from] += passengers; delta[to] -= passengers;\` | Record the passenger count joining at pickup and leaving at dropoff, as a net change rather than tracking the trip explicitly. |
| 10-13 | \`for (const change of delta) { occupancy += change; if (occupancy > capacity) return false; }\` | Running prefix sum reconstructs actual occupancy mile by mile; any point exceeding \`capacity\` fails the whole trip plan. |`,
        dryRunMarkdown: `**Dry run 1 (trips=[[2,1,5],[3,3,7]], capacity=4)**: delta[1]+=2→2, delta[5]-=2→-2, delta[3]+=3→3, delta[7]-=3→-3.
Sweep: mile0:0. mile1: occupancy=0+2=2. mile2: 2. mile3: 2+3=5 > 4 → return **false** — matches expected.

**Dry run 2 (trips=[[2,1,5],[3,3,7]], capacity=5)**: same deltas. Sweep reaches occupancy=5 at mile3, which is not \`>5\`. mile4: still 5. mile5: 5-2=3. mile6: 3. mile7: 3-3=0. Never exceeds 5. Return **true** — matches expected.

**Dry run 3 (trips=[[2,1,5],[3,5,7]], capacity=3)**: delta[1]+=2, delta[5]-=2, delta[5]+=3 (so delta[5]=1), delta[7]-=3. Sweep: mile1: occupancy=2. mile2-4: 2. mile5: 2+1=3, not >3. mile6: 3. mile7: 3-3=0. Never exceeds 3. Return **true** — matches expected.`,
      },
    ],
    relatedSlugs: ["meeting-rooms-ii", "non-overlapping-intervals"],
    realWorldUsageMarkdown: `Difference-array occupancy sweeps power ride-share/carpool capacity validation exactly as described, and the same technique underlies any "does cumulative demand ever exceed a fixed capacity over a bounded range" check — flight seat booking across route segments, warehouse throughput over time-of-day windows.`,
  },
];

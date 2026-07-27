import type { Problem } from "../types";

export const heapProblems: Problem[] = [
  {
    slug: "kth-largest-in-stream",
    title: "Kth Largest Element in a Stream",
    difficulty: "easy",
    maangTags: ["Amazon", "Google"],
    topicSlug: "heaps",
    functionName: "KthLargest",
    description: `## Problem

Design a class to find the \`k\`-th largest element in a stream of numbers. \`KthLargest(k, nums)\` initializes the object with the integer \`k\` and an initial stream \`nums\`. \`add(val)\` appends \`val\` to the stream and returns the current \`k\`-th largest element.

## Example

\`\`\`
Input:  ["KthLargest","add","add","add","add","add"]
        [[3,[4,5,8,2]],[3],[5],[10],[9],[4]]
Output: [null,4,5,5,8,8]
\`\`\`

## Senior interview angle

Keep a **min-heap capped at size \`k\`**. Its root is always the \`k\`-th largest value seen so far, because everything smaller than the root has been evicted. Each \`add\` is O(log k), not O(n log n) — the size-\`k\` cap is what makes this a heap problem instead of a sorting problem.

## Pattern

\`Fixed-size min-heap\` — the base case for every later "top-K of a stream" problem in this topic.`,
    starterCode: `class KthLargest {
  /**
   * @param {number} k
   * @param {number[]} nums
   */
  constructor(k, nums) {
    // Your code here
  }

  /**
   * @param {number} val
   * @return {number}
   */
  add(val) {
    // Your code here
  }
}`,
    testCases: [
      {
        operations: ["KthLargest", "add", "add", "add", "add", "add"],
        args: [[3, [4, 5, 8, 2]], [3], [5], [10], [9], [4]],
        expected: [null, 4, 5, 5, 8, 8],
      },
      {
        operations: ["KthLargest", "add", "add", "add", "add", "add"],
        args: [[1, []], [-3], [-2], [-4], [0], [4]],
        expected: [null, -3, -2, -2, 0, 4],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Re-sort on Every Add)",
        timeComplexity: "O(n log n) per add",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Keep every number seen so far in a plain array. On each `add`, push the new value, sort the whole array ascending, and read the element `k` from the end. Correct, but re-sorts the entire history on every single call.",
        code: `class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.nums = [...nums];
  }

  add(val) {
    this.nums.push(val);                       // append new value
    this.nums.sort((a, b) => a - b);            // O(n log n) full re-sort
    return this.nums[this.nums.length - this.k]; // k-th from the end
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 1-2 | \`constructor(k, nums)\` | Store \`k\` and copy the initial stream so we never mutate the caller's array. |
| 3 | \`this.k = k\` | Remember how many "largest" elements matter. |
| 4 | \`this.nums = [...nums]\` | Own copy — every future \`add\` grows this array. |
| 8 | \`this.nums.push(val)\` | Append the new stream value. |
| 9 | \`this.nums.sort((a, b) => a - b)\` | Full ascending re-sort — O(n log n), the cost this problem's heap solution exists to avoid. |
| 10 | \`return this.nums[this.nums.length - this.k]\` | With ascending order, index \`length - k\` is exactly the \`k\`-th largest. |`,
        dryRunMarkdown: `**Dry run 1** — \`k=3, nums=[4,5,8,2]\`:
\`add(3)\`: nums=[4,5,8,2,3] → sort → [2,3,4,5,8] → index 5-3=2 → **4**
\`add(5)\`: nums=[2,3,4,5,8,5] → sort → [2,3,4,5,5,8] → index 6-3=3 → **5**
\`add(10)\`: sort → [2,3,4,5,5,8,10] → index 7-3=4 → **5**
\`add(9)\`: sort → [2,3,4,5,5,8,9,10] → index 8-3=5 → **8**
\`add(4)\`: sort → [2,3,4,4,5,5,8,9,10] → index 9-3=6 → **8**
Results: [4,5,5,8,8] — matches expected.

**Dry run 2** — \`k=1, nums=[]\`:
\`add(-3)\`: [-3] → index 1-1=0 → **-3**
\`add(-2)\`: [-3,-2] → index 1 → **-2**
\`add(-4)\`: [-4,-3,-2] → index 2 → **-2**
\`add(0)\`: [-4,-3,-2,0] → index 3 → **0**
\`add(4)\`: [-4,-3,-2,0,4] → index 4 → **4**
Results: [-3,-2,-2,0,4] — matches expected.`,
      },
      {
        approach: "Optimal (Fixed-Size Min-Heap)",
        timeComplexity: "O(log k) per add, O(n log k) to build",
        spaceComplexity: "O(k)",
        overviewMarkdown:
          "Maintain a min-heap that never holds more than `k` elements. On every push, if the heap grows past `k`, pop the minimum — the smallest of the current top-`k` is exactly what deserves eviction. The heap's root is always the `k`-th largest value seen so far.",
        code: `class MinHeap {
  constructor() { this.data = []; }
  size() { return this.data.length; }
  peek() { return this.data[0]; }
  push(val) {
    this.data.push(val);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p] <= this.data[i]) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length) {
      this.data[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let smallest = i;
        if (l < this.data.length && this.data[l] < this.data[smallest]) smallest = l;
        if (r < this.data.length && this.data[r] < this.data[smallest]) smallest = r;
        if (smallest === i) break;
        [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
        i = smallest;
      }
    }
    return top;
  }
}

class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.heap = new MinHeap();
    for (const num of nums) this.add(num);      // reuse add() to seed the stream
  }

  add(val) {
    this.heap.push(val);
    if (this.heap.size() > this.k) this.heap.pop(); // evict the smallest over-capacity element
    return this.heap.peek();                         // root = k-th largest
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 32-34 | \`constructor(k, nums)\` | Store \`k\`, create an empty min-heap, then feed every initial number through \`add\` so seeding and streaming share one code path. |
| 37 | \`this.heap.push(val)\` | Insert the new value; heap grows to size ≤ k+1. |
| 38 | \`if (this.heap.size() > this.k) this.heap.pop()\` | If capacity is exceeded, remove the current smallest — it's no longer in the top \`k\`. |
| 39 | \`return this.heap.peek()\` | The heap's root is the smallest of the current top-\`k\`, i.e. the \`k\`-th largest overall. |
| 5-13 (helper) | \`push(val)\` | Standard sift-up: append then bubble toward the root while a child is smaller than its parent. |
| 15-29 (helper) | \`pop()\` | Standard sift-down: move the last element to the root, then bubble it down toward its smaller child until the heap property holds. |`,
        dryRunMarkdown: `**Dry run 1** — \`k=3, nums=[4,5,8,2]\` (contents shown as sorted sets, not raw array layout):
Constructor seeds via \`add\`: add4→{4}; add5→{4,5}; add8→{4,5,8}; add2→push2→{2,4,5,8} size4>3→pop min(2)→{4,5,8}.
\`add(3)\`: push3→{3,4,5,8} size4>3→pop min(3)→{4,5,8}. peek=**4**
\`add(5)\`: push5→{4,5,5,8} size4>3→pop min(4)→{5,5,8}. peek=**5**
\`add(10)\`: push10→{5,5,8,10} size4>3→pop min(5)→{5,8,10}. peek=**5**
\`add(9)\`: push9→{5,8,9,10} size4>3→pop min(5)→{8,9,10}. peek=**8**
\`add(4)\`: push4→{4,8,9,10} size4>3→pop min(4)→{8,9,10}. peek=**8**
Results: [4,5,5,8,8] — matches expected.

**Dry run 2** — \`k=1, nums=[]\`:
\`add(-3)\`: push-3→{-3} size1 not>1. peek=**-3**
\`add(-2)\`: push-2→{-3,-2} size2>1→pop min(-3)→{-2}. peek=**-2**
\`add(-4)\`: push-4→{-4,-2} size2>1→pop min(-4)→{-2}. peek=**-2**
\`add(0)\`: push0→{-2,0} size2>1→pop min(-2)→{0}. peek=**0**
\`add(4)\`: push4→{0,4} size2>1→pop min(0)→{4}. peek=**4**
Results: [-3,-2,-2,0,4] — matches expected.`,
      },
    ],
    relatedSlugs: ["kth-largest-element-in-array", "find-median-from-data-stream"],
    realWorldUsageMarkdown: `A capped min-heap is exactly how a **live leaderboard** or **trending-scores** widget stays cheap: instead of re-sorting every score on every update, it keeps only the current top-K and evicts the weakest entry on overflow. The same shape shows up in monitoring systems that need "the current \`k\`-th highest latency/error-rate reading" from a metrics stream without retaining full history.`,
  },
  {
    slug: "last-stone-weight",
    title: "Last Stone Weight",
    difficulty: "easy",
    maangTags: ["Amazon", "Google"],
    topicSlug: "heaps",
    functionName: "lastStoneWeight",
    description: `## Problem

You are given an array \`stones\` of stone weights. On each turn, smash the two heaviest stones together: if they're equal, both are destroyed; otherwise the lighter is destroyed and the heavier becomes \`heavier - lighter\`. Return the weight of the last remaining stone, or \`0\` if none remain.

## Example

\`\`\`
Input: stones = [2,7,4,1,8,1]
Output: 1
\`\`\`

## Senior interview angle

"Repeatedly grab the two largest" is a max-heap tell. Each smash is two pops and at most one push, all O(log n) — versus rescanning the whole array for the top two every round.

## Pattern

\`Max-heap simulation\` — repeatedly extract-max, transform, reinsert.`,
    starterCode: `/**
 * @param {number[]} stones
 * @return {number}
 */
function lastStoneWeight(stones) {
  // Your code here
}`,
    testCases: [
      { input: [[2, 7, 4, 1, 8, 1]], expected: 1 },
      { input: [[1]], expected: 1 },
      { input: [[2, 2]], expected: 0 },
    ],
    solutions: [
      {
        approach: "Brute Force (Linear Scan for the Top Two)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Each round, scan the remaining stones to find the index of the heaviest, remove it, scan again for the new heaviest, remove that too, and push back the nonzero difference. No heap needed, but every round costs a full linear scan.",
        code: `function lastStoneWeight(stones) {
  const arr = [...stones];
  while (arr.length > 1) {
    let i1 = 0;
    for (let i = 1; i < arr.length; i++) {          // find heaviest
      if (arr[i] > arr[i1]) i1 = i;
    }
    const a = arr.splice(i1, 1)[0];
    let i2 = 0;
    for (let i = 1; i < arr.length; i++) {          // find new heaviest
      if (arr[i] > arr[i2]) i2 = i;
    }
    const b = arr.splice(i2, 1)[0];
    if (a !== b) arr.push(a - b);                    // remainder survives
  }
  return arr.length ? arr[0] : 0;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`const arr = [...stones]\` | Work on a copy so the caller's array is untouched. |
| 3 | \`while (arr.length > 1)\` | Keep smashing while two or more stones remain. |
| 4-7 | first scan loop | Linear scan to find the index of the current heaviest stone. |
| 8 | \`arr.splice(i1, 1)[0]\` | Remove and capture it as \`a\`. |
| 9-12 | second scan loop | Linear scan (over the now-shorter array) for the next heaviest. |
| 13 | \`arr.splice(i2, 1)[0]\` | Remove and capture it as \`b\`. |
| 14 | \`if (a !== b) arr.push(a - b)\` | Equal stones annihilate; unequal stones leave a remainder. |
| 16 | \`return arr.length ? arr[0] : 0\` | One stone left → its weight; none left → 0. |`,
        dryRunMarkdown: `**Dry run 1** — \`[2,7,4,1,8,1]\`:
Round1: heaviest=8, remove→[2,7,4,1,1]; heaviest=7, remove→[2,4,1,1]; diff=1→push→[2,4,1,1,1]
Round2: heaviest=4→[2,1,1,1]; heaviest=2→[1,1,1]; diff=2→push→[1,1,1,2]
Round3: heaviest=2→[1,1,1]; heaviest=1→[1,1]; diff=1→push→[1,1,1]
Round4: heaviest=1→[1,1]; heaviest=1→[1]; diff=0→nothing pushed→[1]
length=1, loop ends → return **1** — matches expected.

**Dry run 2** — \`[2,2]\`:
Round1: heaviest=2→[2]; heaviest=2→[]; diff=0→nothing pushed→[]
length=0, loop ends → return **0** — matches expected.`,
      },
      {
        approach: "Optimal (Max-Heap)",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Push every stone into a max-heap. Repeatedly pop the two heaviest; if they differ, push the difference back. The heap always hands you the two current heaviest in O(log n), instead of a full O(n) rescan each round.",
        code: `class MaxHeap {
  constructor(values = []) {
    this.data = [...values];
    for (let i = (this.data.length >> 1) - 1; i >= 0; i--) this.siftDown(i); // O(n) heapify
  }
  size() { return this.data.length; }
  push(val) {
    this.data.push(val);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p] >= this.data[i]) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length) { this.data[0] = last; this.siftDown(0); }
    return top;
  }
  siftDown(i) {
    while (true) {
      const l = 2 * i + 1, r = 2 * i + 2;
      let largest = i;
      if (l < this.data.length && this.data[l] > this.data[largest]) largest = l;
      if (r < this.data.length && this.data[r] > this.data[largest]) largest = r;
      if (largest === i) break;
      [this.data[i], this.data[largest]] = [this.data[largest], this.data[i]];
      i = largest;
    }
  }
}

function lastStoneWeight(stones) {
  const heap = new MaxHeap(stones);      // O(n) heapify
  while (heap.size() > 1) {
    const a = heap.pop();                // heaviest
    const b = heap.pop();                // second heaviest
    if (a !== b) heap.push(a - b);       // smashed remainder survives
  }
  return heap.size() ? heap.pop() : 0;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 30 | \`const heap = new MaxHeap(stones)\` | Build a max-heap from all stones in O(n) via heapify — not O(n log n) one-at-a-time inserts. |
| 31 | \`while (heap.size() > 1)\` | Keep smashing while at least two stones remain to compare. |
| 32 | \`const a = heap.pop()\` | Remove and return the current heaviest stone, O(log n). |
| 33 | \`const b = heap.pop()\` | Remove and return the next-heaviest stone. |
| 34 | \`if (a !== b) heap.push(a - b)\` | Equal stones annihilate each other (nothing pushed back); unequal stones leave a remainder stone with weight \`a - b\`. |
| 35 | \`return heap.size() ? heap.pop() : 0\` | One stone survives → return its weight; none survive → return \`0\`. |`,
        dryRunMarkdown: `**Dry run 1** — \`[2,7,4,1,8,1]\`:
heapify → {8,7,4,2,1,1} → pop8,pop7 → push(8-7=1) → {4,2,1,1,1} → pop4,pop2 → push(4-2=2) → {2,1,1,1} → pop2,pop1 → push(2-1=1) → {1,1,1} → pop1,pop1 → equal, push nothing → {1} → size=1, loop ends → return **1** — matches expected.

**Dry run 2** — \`[2,2]\`:
heapify → {2,2} → pop2,pop2 → equal, push nothing → {} → size=0, loop ends → return **0** — matches expected.`,
      },
    ],
    relatedSlugs: ["kth-largest-element-in-array", "task-scheduler"],
    realWorldUsageMarkdown: `The "repeatedly combine the two largest" shape appears in **Huffman coding** (merge the two least-frequent nodes, generalized to a min-heap) and in load-balancing simulations where the two heaviest jobs/loads get merged or reconciled each round until the system settles.`,
  },
  {
    slug: "k-closest-points-to-origin",
    title: "K Closest Points to Origin",
    difficulty: "medium",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "heaps",
    functionName: "kClosest",
    description: `## Problem

Given an array of \`points\` where \`points[i] = [x, y]\`, return the \`k\` points closest to the origin \`(0, 0)\`, in **any order**.

## Example

\`\`\`
Input: points = [[3,3],[5,-1],[-2,4]], k = 2
Output: [[3,3],[-2,4]]
\`\`\`

## Senior interview angle

Compare **squared** Euclidean distance — \`x*x + y*y\` — never take an actual square root; it's monotonic with true distance and avoids floating point entirely. Because output order doesn't matter, a **max-heap capped at size \`k\`** (evict the farthest when over capacity) beats a full sort.

## Pattern

\`Fixed-size max-heap on a derived key\` — same fixed-size-heap shape as Kth Largest in a Stream, keyed on squared distance instead of raw value.`,
    starterCode: `/**
 * @param {number[][]} points
 * @param {number} k
 * @return {number[][]}
 */
function kClosest(points, k) {
  // Your code here
}`,
    testCases: [
      { input: [[[1, 3], [-2, 2]], 1], expected: [[-2, 2]], unordered: true },
      {
        input: [[[3, 3], [5, -1], [-2, 4]], 2],
        expected: [[3, 3], [-2, 4]],
        unordered: true,
      },
      {
        input: [[[1, 1], [3, 3], [2, 2]], 2],
        expected: [[1, 1], [2, 2]],
        unordered: true,
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Sort by Distance)",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Compute each point's squared distance, sort all points ascending by that key, and take the first `k`. Simple and correct, but sorts the entire array even when `k` is tiny.",
        code: `function kClosest(points, k) {
  const sorted = [...points].sort(
    (a, b) => (a[0] ** 2 + a[1] ** 2) - (b[0] ** 2 + b[1] ** 2), // ascending by squared distance
  );
  return sorted.slice(0, k);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`const sorted = [...points].sort(...)\` | Copy the array (don't mutate the caller's), sort ascending by squared distance from origin. |
| 3 | \`(a[0]**2 + a[1]**2) - (b[0]**2 + b[1]**2)\` | Squared distance avoids \`Math.sqrt\`; the comparator is still correctly ordered because squaring is monotonic for non-negative distances. |
| 5 | \`return sorted.slice(0, k)\` | The first \`k\` entries of a distance-ascending sort are the \`k\` closest. |`,
        dryRunMarkdown: `**Dry run 1** — \`points=[[3,3],[5,-1],[-2,4]], k=2\`:
distances: [3,3]→9+9=18, [5,-1]→25+1=26, [-2,4]→4+16=20
sort ascending by distance: [3,3](18), [-2,4](20), [5,-1](26)
slice(0,2) → **[[3,3],[-2,4]]** — matches expected (order-insensitive).

**Dry run 2** — \`points=[[1,1],[3,3],[2,2]], k=2\`:
distances: [1,1]→2, [3,3]→18, [2,2]→8
sort ascending: [1,1](2), [2,2](8), [3,3](18)
slice(0,2) → **[[1,1],[2,2]]** — matches expected.`,
      },
      {
        approach: "Optimal (Fixed-Size Max-Heap)",
        timeComplexity: "O(n log k)",
        spaceComplexity: "O(k)",
        overviewMarkdown:
          "Keep a max-heap of at most `k` points, keyed by squared distance. Push each point; if the heap exceeds size `k`, pop the farthest — it can't be among the final `k` closest. What remains in the heap at the end is exactly the answer, since output order is unconstrained.",
        code: `class Heap {
  constructor(compare) { this.data = []; this.compare = compare; }
  size() { return this.data.length; }
  toArray() { return this.data; }
  push(val) {
    this.data.push(val);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.compare(this.data[p], this.data[i]) <= 0) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length) {
      this.data[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let best = i;
        if (l < this.data.length && this.compare(this.data[l], this.data[best]) < 0) best = l;
        if (r < this.data.length && this.compare(this.data[r], this.data[best]) < 0) best = r;
        if (best === i) break;
        [this.data[i], this.data[best]] = [this.data[best], this.data[i]];
        i = best;
      }
    }
    return top;
  }
}

function kClosest(points, k) {
  const dist = ([x, y]) => x * x + y * y;
  const heap = new Heap((a, b) => dist(b) - dist(a)); // "smaller" = farther, so max-heap pops farthest first
  for (const point of points) {
    heap.push(point);
    if (heap.size() > k) heap.pop();                   // evict the current farthest
  }
  return heap.toArray();
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 32 | \`const dist = ([x, y]) => x * x + y * y\` | Squared-distance key, computed on demand. |
| 33 | \`new Heap((a, b) => dist(b) - dist(a))\` | Comparator returns negative when \`a\` is farther than \`b\`, so this \`Heap\` behaves as a max-heap on distance — its root is always the current farthest point. |
| 34-37 | \`for (const point of points) { heap.push(point); if (heap.size() > k) heap.pop(); }\` | Push every point; whenever the heap exceeds capacity \`k\`, evict the farthest — it cannot be in the final top-\`k\` closest. |
| 38 | \`return heap.toArray()\` | Whatever remains is exactly the \`k\` closest points, in heap-internal (unspecified) order — fine since the problem allows any order. |`,
        dryRunMarkdown: `**Dry run 1** — \`points=[[3,3],[5,-1],[-2,4]], k=2\` (heap contents shown as \`point(dist)\`):
push[3,3](18) → {[3,3](18)}
push[5,-1](26) → {[3,3](18),[5,-1](26)} size2, not>2
push[-2,4](20) → {[3,3](18),[5,-1](26),[-2,4](20)} size3>2 → pop farthest [5,-1](26) → {[3,3](18),[-2,4](20)}
Result: **[[3,3],[-2,4]]** — matches expected (order-insensitive).

**Dry run 2** — \`points=[[1,1],[3,3],[2,2]], k=2\`:
push[1,1](2) → {[1,1](2)}
push[3,3](18) → {[1,1](2),[3,3](18)} size2, not>2
push[2,2](8) → {[1,1](2),[3,3](18),[2,2](8)} size3>2 → pop farthest [3,3](18) → {[1,1](2),[2,2](8)}
Result: **[[1,1],[2,2]]** — matches expected.`,
      },
    ],
    relatedSlugs: ["kth-largest-element-in-array", "merge-k-sorted-lists"],
    realWorldUsageMarkdown: `Fixed-size max-heaps on a distance key power **"nearest K" geospatial queries** — ride-share driver matching, store locators, and the candidate-generation step of k-nearest-neighbor recommendation systems, where a full sort of every point against every query would be too slow at scale.`,
  },
  {
    slug: "kth-largest-element-in-array",
    title: "Kth Largest Element in an Array",
    difficulty: "medium",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "heaps",
    functionName: "findKthLargest",
    description: `## Problem

Given an integer array \`nums\` and an integer \`k\`, return the \`k\`-th largest element — the \`k\`-th largest in **sorted order**, not the \`k\`-th distinct value.

## Example

\`\`\`
Input: nums = [3,2,1,5,6,4], k = 2
Output: 5
\`\`\`

## Senior interview angle

Same fixed-size min-heap trick as Kth Largest in a Stream, applied to a static array instead of a live stream. Mention **quickselect** (average O(n), Hoare partition around a random pivot) as the alternative that beats O(n log k) on average, at the cost of a worse O(n²) worst case without care.

## Pattern

\`Fixed-size min-heap\` — the static-array counterpart to Kth Largest in a Stream; same heap invariant, no streaming state to maintain between calls.`,
    starterCode: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
function findKthLargest(nums, k) {
  // Your code here
}`,
    testCases: [
      { input: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
      { input: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
      { input: [[1], 1], expected: 1 },
    ],
    solutions: [
      {
        approach: "Brute Force (Sort Descending)",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Sort a copy of `nums` in descending order and read index `k - 1`. Correct and simple, but does far more work than necessary when `k` is small relative to `n`.",
        code: `function findKthLargest(nums, k) {
  const sorted = [...nums].sort((a, b) => b - a); // descending
  return sorted[k - 1];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`[...nums].sort((a, b) => b - a)\` | Copy and sort descending, so index 0 is the largest. |
| 3 | \`return sorted[k - 1]\` | 1-indexed \`k\`-th largest sits at 0-indexed position \`k - 1\`. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[3,2,1,5,6,4], k=2\`:
sort descending → [6,5,4,3,2,1]
index k-1=1 → **5** — matches expected.

**Dry run 2** — \`nums=[3,2,3,1,2,4,5,5,6], k=4\`:
sort descending → [6,5,5,4,3,3,2,2,1]
index k-1=3 → **4** — matches expected.`,
      },
      {
        approach: "Optimal (Fixed-Size Min-Heap)",
        timeComplexity: "O(n log k)",
        spaceComplexity: "O(k)",
        overviewMarkdown:
          "Push every number into a min-heap capped at size `k`, popping the minimum whenever the cap is exceeded. After processing all `n` numbers, the heap holds exactly the `k` largest, and its root — the smallest of those — is the `k`-th largest overall.",
        code: `class MinHeap {
  constructor() { this.data = []; }
  size() { return this.data.length; }
  peek() { return this.data[0]; }
  push(val) {
    this.data.push(val);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p] <= this.data[i]) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length) {
      this.data[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let smallest = i;
        if (l < this.data.length && this.data[l] < this.data[smallest]) smallest = l;
        if (r < this.data.length && this.data[r] < this.data[smallest]) smallest = r;
        if (smallest === i) break;
        [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
        i = smallest;
      }
    }
    return top;
  }
}

function findKthLargest(nums, k) {
  const heap = new MinHeap();
  for (const num of nums) {
    heap.push(num);
    if (heap.size() > k) heap.pop();      // evict the smallest over-capacity element
  }
  return heap.peek();                      // root = k-th largest
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 31 | \`const heap = new MinHeap()\` | Start with an empty capped heap. |
| 32-35 | \`for (const num of nums) { heap.push(num); if (heap.size() > k) heap.pop(); }\` | Push every number; whenever the heap exceeds \`k\`, evict the current minimum — it can't be among the final top-\`k\` largest. |
| 36 | \`return heap.peek()\` | After the pass, the heap holds the \`k\` largest values; its root is the smallest of them, i.e. the \`k\`-th largest overall. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[3,2,1,5,6,4], k=2\`:
push3→{3}; push2→{2,3}; push1→{1,2,3} size3>2→pop1→{2,3}; push5→{2,3,5} size3>2→pop2→{3,5}; push6→{3,5,6} size3>2→pop3→{5,6}; push4→{4,5,6} size3>2→pop4→{5,6}
Final heap {5,6}, peek=**5** — matches expected.

**Dry run 2** — \`nums=[3,2,3,1,2,4,5,5,6], k=4\`:
push3→{3}; push2→{2,3}; push3→{2,3,3}; push1→{1,2,3,3} size4, not>4
push2→{1,2,2,3,3} size5>4→pop1→{2,2,3,3}
push4→{2,2,3,3,4} size5>4→pop2→{2,3,3,4}
push5→{2,3,3,4,5} size5>4→pop2→{3,3,4,5}
push5→{3,3,4,5,5} size5>4→pop3→{3,4,5,5}
push6→{3,4,5,5,6} size5>4→pop3→{4,5,5,6}
Final heap {4,5,5,6}, peek=**4** — matches expected.`,
      },
    ],
    relatedSlugs: ["kth-largest-in-stream", "k-closest-points-to-origin"],
    realWorldUsageMarkdown: `The fixed-size heap here is the textbook mechanism behind **percentile/threshold computations** — e.g. tracking the "95th percentile latency" bucket boundary from a batch of measurements without a full sort — and is the same idea database query planners use for top-K selection pushdown.`,
  },
  {
    slug: "task-scheduler",
    title: "Task Scheduler",
    difficulty: "medium",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "heaps",
    functionName: "leastInterval",
    description: `## Problem

Given a list \`tasks\` (each a letter representing a task type) and a non-negative cooldown \`n\`, return the minimum number of time units to finish all tasks. The same task type must be separated by at least \`n\` other units of time (idle allowed).

## Example

\`\`\`
Input: tasks = ["A","A","A","B","B","B"], n = 2
Output: 8
\`\`\`

## Senior interview angle

Two valid mental models, both worth knowing: **simulate it** with a max-heap of remaining frequencies plus a cooldown queue (concrete, generalizes if the rules change), or derive the **closed-form**: let \`maxFreq\` be the highest task frequency and \`numMax\` the count of tasks tied at that frequency; the answer is \`max(tasks.length, (maxFreq - 1) * (n + 1) + numMax)\`. The most-frequent task defines \`(maxFreq - 1)\` full cooldown cycles of length \`n + 1\`, and \`numMax\` accounts for every tied-for-most-frequent task needing its own slot in the final cycle.

## Pattern

\`Max-heap simulation, with a closed-form shortcut\` — the heap simulation is the intuitive/generalizable answer; the formula is the O(n) optimization once the invariant is understood.`,
    starterCode: `/**
 * @param {string[]} tasks
 * @param {number} n
 * @return {number}
 */
function leastInterval(tasks, n) {
  // Your code here
}`,
    testCases: [
      { input: [["A", "A", "A", "B", "B", "B"], 2], expected: 8 },
      { input: [["A", "A", "A", "B", "B", "B"], 0], expected: 6 },
      {
        input: [["A", "A", "A", "A", "A", "A", "B", "C", "D", "E", "F", "G"], 2],
        expected: 16,
      },
    ],
    solutions: [
      {
        approach: "Simulation (Max-Heap + Cooldown Queue)",
        timeComplexity: "O(total · log 26)",
        spaceComplexity: "O(26)",
        overviewMarkdown:
          "Count each task's frequency and load them into a max-heap. Each time unit, pop the most-frequent available task and execute it; if it still has remaining count, it goes into a cooldown queue tagged with the time it becomes available again (`currentTime + n + 1`). Before popping, move any cooled-down tasks from the queue back into the heap. Idle a unit whenever nothing is available.",
        code: `class MaxHeap {
  constructor(values = []) {
    this.data = [...values];
    for (let i = (this.data.length >> 1) - 1; i >= 0; i--) this.siftDown(i);
  }
  size() { return this.data.length; }
  push(val) {
    this.data.push(val);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p] >= this.data[i]) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length) { this.data[0] = last; this.siftDown(0); }
    return top;
  }
  siftDown(i) {
    while (true) {
      const l = 2 * i + 1, r = 2 * i + 2;
      let largest = i;
      if (l < this.data.length && this.data[l] > this.data[largest]) largest = l;
      if (r < this.data.length && this.data[r] > this.data[largest]) largest = r;
      if (largest === i) break;
      [this.data[i], this.data[largest]] = [this.data[largest], this.data[i]];
      i = largest;
    }
  }
}

function leastInterval(tasks, n) {
  const freq = new Map();
  for (const t of tasks) freq.set(t, (freq.get(t) ?? 0) + 1);
  const heap = new MaxHeap([...freq.values()]);
  const cooldown = [];                                  // [remainingCount, availableAtTime]
  let time = 0;
  let remainingTasks = tasks.length;

  while (remainingTasks > 0) {
    while (cooldown.length && cooldown[0][1] <= time) {  // move cooled-down tasks back
      heap.push(cooldown.shift()[0]);
    }
    if (heap.size() === 0) {
      time++;                                            // nothing available: idle
      continue;
    }
    const count = heap.pop() - 1;
    remainingTasks--;
    if (count > 0) cooldown.push([count, time + n + 1]);
    time++;
  }
  return time;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 30-31 | \`freq\` map | Count occurrences of each task letter. |
| 32 | \`new MaxHeap([...freq.values()])\` | Heapify the raw frequency counts (letters don't matter for scheduling, only counts do). |
| 33 | \`cooldown = []\` | Holds \`[remainingCount, availableAtTime]\` pairs for tasks currently on cooldown. |
| 38-40 | \`while (cooldown.length && cooldown[0][1] <= time)\` | Before picking a task this tick, move any task whose cooldown has expired back into the heap. |
| 41-44 | \`if (heap.size() === 0) { time++; continue; }\` | Nothing available to run this tick — idle and advance time. |
| 45-46 | \`const count = heap.pop() - 1; remainingTasks--\` | Run the most-frequent available task once; account for one fewer remaining instance. |
| 47 | \`if (count > 0) cooldown.push([count, time + n + 1])\` | If the task still has instances left, it can't run again until \`n\` units after this one. |
| 48 | \`time++\` | Every executed or idle tick advances the clock by one. |`,
        dryRunMarkdown: `**Dry run 1** — \`tasks=[A,A,A,B,B,B], n=2\` (freq A=3,B=3):
t0: heap={3(A),3(B)} → pop A(rem2) → cooldown [A available@3]
t1: heap={3(B)} → pop B(rem2) → cooldown [A@3, B@4]
t2: heap={} , nothing available (A@3,B@4 not yet) → idle
t3: A cools down → heap={2(A)} → pop A(rem1) → cooldown [B@4, A@6]
t4: B cools down → heap={2(B)} → pop B(rem1) → cooldown [A@6, B@7]
t5: heap={} → idle
t6: A cools down → heap={1(A)} → pop A(rem0, done)
t7: B cools down → heap={1(B)} → pop B(rem0, done)
All tasks done after tick 7 → total time = **8** — matches expected.

**Dry run 2** — \`tasks=[A,A,A,B,B,B], n=0\` (no cooldown gap):
t0: pop A(rem2, avail@1) t1: pop B(rem2, avail@2) t2: pop A(rem1, avail@3) t3: pop B(rem1, avail@4) t4: pop A(rem0, done) t5: pop B(rem0, done)
Total time = **6** — matches expected.`,
      },
      {
        approach: "Optimal (Closed-Form Frequency Math)",
        timeComplexity: "O(n) (n = tasks.length)",
        spaceComplexity: "O(26)",
        overviewMarkdown:
          "Count frequencies. Let `maxFreq` be the highest count and `numMax` how many task types share it. The most-frequent task type forces `(maxFreq - 1)` full cycles of length `n + 1` (one execution plus cooldown), and the final cycle needs one slot per tied-for-most-frequent task. If there are enough other distinct tasks to fill every cooldown gap, the answer degrades to simply `tasks.length` — hence the `max` with the raw count.",
        code: `function leastInterval(tasks, n) {
  const freq = new Map();
  for (const t of tasks) freq.set(t, (freq.get(t) ?? 0) + 1);

  const maxFreq = Math.max(...freq.values());
  const numMax = [...freq.values()].filter((f) => f === maxFreq).length;

  const gapsFilled = (maxFreq - 1) * (n + 1) + numMax;
  return Math.max(tasks.length, gapsFilled);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`freq\` map | Count occurrences of each task letter. |
| 5 | \`const maxFreq = Math.max(...freq.values())\` | The most frequent task type defines the longest chain of forced cooldowns. |
| 6 | \`numMax = [...freq.values()].filter((f) => f === maxFreq).length\` | How many task types are tied for that maximum — each needs its own slot in the final (incomplete) cycle. |
| 8 | \`(maxFreq - 1) * (n + 1) + numMax\` | \`(maxFreq - 1)\` full cycles of length \`n + 1\` (execute + cooldown), plus the final cycle holding exactly \`numMax\` executions with no trailing cooldown needed. |
| 9 | \`Math.max(tasks.length, gapsFilled)\` | If other tasks are plentiful enough to fill every cooldown gap with real work, the schedule can't be shorter than just running every task once. |`,
        dryRunMarkdown: `**Dry run 1** — \`tasks=[A,A,A,B,B,B], n=2\`:
freq={A:3,B:3} → maxFreq=3, numMax=2 (A and B both hit 3)
gapsFilled = (3-1)*(2+1)+2 = 2*3+2 = 8
max(tasks.length=6, 8) = **8** — matches expected.

**Dry run 2** — \`tasks=[A,A,A,A,A,A,B,C,D,E,F,G], n=2\`:
freq={A:6,B:1,C:1,D:1,E:1,F:1,G:1} → maxFreq=6, numMax=1 (only A)
gapsFilled = (6-1)*(2+1)+1 = 5*3+1 = 16
max(tasks.length=12, 16) = **16** — matches expected.`,
      },
    ],
    relatedSlugs: ["daily-temperatures", "merge-intervals"],
    realWorldUsageMarkdown: `This is a real **CPU/thread scheduler** shape: enforcing a minimum cooldown between repeated job types prevents any single job from starving others or hammering a shared resource (a rate-limited external API, a specific database shard). Job queues that rate-limit "the same job type can't run twice within N seconds" implement exactly this cooldown-cycle logic.`,
  },
  {
    slug: "design-twitter",
    title: "Design Twitter",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta", "Google"],
    topicSlug: "heaps",
    functionName: "Twitter",
    description: `## Problem

Design a simplified Twitter. Implement \`Twitter\`:
- \`postTweet(userId, tweetId)\` — user composes a new tweet.
- \`getNewsFeed(userId)\` — the 10 most recent tweet IDs from the user and everyone they follow, most recent first.
- \`follow(followerId, followeeId)\` / \`unfollow(followerId, followeeId)\`.

## Example

\`\`\`
Input:  ["Twitter","postTweet","getNewsFeed","follow","postTweet","getNewsFeed","unfollow","getNewsFeed"]
        [[],[1,5],[1],[1,2],[2,6],[1],[1,2],[1]]
Output: [null,null,[5],null,null,[6,5],null,[5]]
\`\`\`

## Senior interview angle

Tag every tweet with a **global, strictly increasing timestamp counter** at post time — that turns "most recent" into a plain numeric comparison. \`getNewsFeed\` is then a **k-way merge**: each candidate (self + followees) contributes a timestamp-sorted list of tweets, and a max-heap merges them, always pulling the globally most recent tweet next, until 10 are collected or every source is exhausted.

## Pattern

\`K-way merge via max-heap\` — the same idea as Merge K Sorted Lists, but merging per-user tweet timelines instead of linked lists, capped at 10 results instead of merging every element.`,
    starterCode: `class Twitter {
  constructor() {
    // Your code here
  }

  /**
   * @param {number} userId
   * @param {number} tweetId
   * @return {void}
   */
  postTweet(userId, tweetId) {
    // Your code here
  }

  /**
   * @param {number} userId
   * @return {number[]}
   */
  getNewsFeed(userId) {
    // Your code here
  }

  /**
   * @param {number} followerId
   * @param {number} followeeId
   * @return {void}
   */
  follow(followerId, followeeId) {
    // Your code here
  }

  /**
   * @param {number} followerId
   * @param {number} followeeId
   * @return {void}
   */
  unfollow(followerId, followeeId) {
    // Your code here
  }
}`,
    testCases: [
      {
        operations: [
          "Twitter", "postTweet", "getNewsFeed", "follow", "postTweet", "getNewsFeed", "unfollow", "getNewsFeed",
        ],
        args: [[], [1, 5], [1], [1, 2], [2, 6], [1], [1, 2], [1]],
        expected: [null, null, [5], null, null, [6, 5], null, [5]],
      },
      {
        operations: ["Twitter", "postTweet", "postTweet", "getNewsFeed", "getNewsFeed"],
        args: [[], [1, 10], [1, 11], [1], [2]],
        expected: [null, null, null, [11, 10], []],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Collect All, Sort, Slice)",
        timeComplexity: "O(t log t) per getNewsFeed (t = total tweets from self + followees)",
        spaceComplexity: "O(t)",
        overviewMarkdown:
          "Give every tweet a timestamp on post. For `getNewsFeed`, gather every tweet from the caller and everyone they follow into one array, sort descending by timestamp, and take the first 10. Simple, but re-collects and re-sorts everything on every call.",
        code: `class Twitter {
  constructor() {
    this.time = 0;
    this.tweets = new Map();   // userId -> [{ tweetId, time }]
    this.following = new Map(); // userId -> Set of followeeIds
  }

  postTweet(userId, tweetId) {
    if (!this.tweets.has(userId)) this.tweets.set(userId, []);
    this.tweets.get(userId).push({ tweetId, time: this.time++ });
  }

  getNewsFeed(userId) {
    const sources = [userId, ...(this.following.get(userId) ?? [])];
    const all = sources.flatMap((id) => this.tweets.get(id) ?? []);
    all.sort((a, b) => b.time - a.time);       // most recent first
    return all.slice(0, 10).map((t) => t.tweetId);
  }

  follow(followerId, followeeId) {
    if (!this.following.has(followerId)) this.following.set(followerId, new Set());
    this.following.get(followerId).add(followeeId);
  }

  unfollow(followerId, followeeId) {
    this.following.get(followerId)?.delete(followeeId);
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-4 | constructor | Global \`time\` counter, per-user tweet lists, per-user following sets. |
| 8-9 | \`postTweet\` | Append the tweet tagged with the current global time, then increment the counter. |
| 12 | \`sources = [userId, ...(this.following.get(userId) ?? [])]\` | Self plus every followee — the candidate pool for the feed. |
| 13 | \`sources.flatMap((id) => this.tweets.get(id) ?? [])\` | Flatten every candidate's tweets into one array. |
| 14 | \`all.sort((a, b) => b.time - a.time)\` | Sort descending by post time. |
| 15 | \`all.slice(0, 10).map((t) => t.tweetId)\` | Top 10 most recent, tweet IDs only. |
| 18-19 | \`follow\` | Lazily create the follower's following-set, then add the followee. |
| 22 | \`unfollow\` | Optional-chained delete — safe even if \`follow\` was never called for this user. |`,
        dryRunMarkdown: `**Dry run 1** — matching the example operation sequence:
\`postTweet(1,5)\` → tweets[1]=[{5,t0}], time=1
\`getNewsFeed(1)\` → sources=[1], all=[{5,t0}] → **[5]**
\`follow(1,2)\` → following[1]={2}
\`postTweet(2,6)\` → tweets[2]=[{6,t1}], time=2
\`getNewsFeed(1)\` → sources=[1,2], all=[{5,t0},{6,t1}] → sort desc → [{6,t1},{5,t0}] → **[6,5]**
\`unfollow(1,2)\` → following[1]={}
\`getNewsFeed(1)\` → sources=[1], all=[{5,t0}] → **[5]**
Results: [null,[5],null,null,[6,5],null,[5]] (excluding the constructor's leading null) — matches expected.

**Dry run 2** — \`postTweet(1,10); postTweet(1,11); getNewsFeed(1); getNewsFeed(2)\`:
tweets[1]=[{10,t0},{11,t1}]
\`getNewsFeed(1)\` → sort desc → [{11,t1},{10,t0}] → **[11,10]**
\`getNewsFeed(2)\` → sources=[2], no tweets, no following → **[]**
Matches expected \`[[11,10],[]]\`.`,
      },
      {
        approach: "Optimal (K-Way Merge via Max-Heap)",
        timeComplexity: "O(f + 10 log f) per getNewsFeed (f = number of followees + self)",
        spaceComplexity: "O(f)",
        overviewMarkdown:
          "Instead of collecting every tweet, seed a max-heap with just the most recent tweet from each candidate source (self + followees). Pop the globally most-recent tweet, and if that source has an older tweet, push it in next. Stop after 10 pops or an empty heap — this touches at most one heap operation per candidate tweet actually needed, not every tweet in history.",
        code: `class Heap {
  constructor(compare) { this.data = []; this.compare = compare; }
  size() { return this.data.length; }
  push(val) {
    this.data.push(val);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.compare(this.data[p], this.data[i]) <= 0) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length) {
      this.data[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let best = i;
        if (l < this.data.length && this.compare(this.data[l], this.data[best]) < 0) best = l;
        if (r < this.data.length && this.compare(this.data[r], this.data[best]) < 0) best = r;
        if (best === i) break;
        [this.data[i], this.data[best]] = [this.data[best], this.data[i]];
        i = best;
      }
    }
    return top;
  }
}

class Twitter {
  constructor() {
    this.time = 0;
    this.tweets = new Map();    // userId -> [{ tweetId, time }] oldest to newest
    this.following = new Map();
  }

  postTweet(userId, tweetId) {
    if (!this.tweets.has(userId)) this.tweets.set(userId, []);
    this.tweets.get(userId).push({ tweetId, time: this.time++ });
  }

  getNewsFeed(userId) {
    const sources = [userId, ...(this.following.get(userId) ?? [])];
    const heap = new Heap((a, b) => b.time - a.time); // max-heap by time
    for (const id of sources) {
      const list = this.tweets.get(id);
      if (list?.length) heap.push({ ...list[list.length - 1], userId: id, idx: list.length - 1 });
    }
    const result = [];
    while (result.length < 10 && heap.size() > 0) {
      const entry = heap.pop();
      result.push(entry.tweetId);
      if (entry.idx > 0) {
        const list = this.tweets.get(entry.userId);
        heap.push({ ...list[entry.idx - 1], userId: entry.userId, idx: entry.idx - 1 });
      }
    }
    return result;
  }

  follow(followerId, followeeId) {
    if (!this.following.has(followerId)) this.following.set(followerId, new Set());
    this.following.get(followerId).add(followeeId);
  }

  unfollow(followerId, followeeId) {
    this.following.get(followerId)?.delete(followeeId);
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 40 | \`sources = [userId, ...followees]\` | Same candidate pool as the brute force. |
| 41 | \`new Heap((a, b) => b.time - a.time)\` | Max-heap keyed by tweet time — root is always the globally most recent unconsumed tweet. |
| 42-45 | seed loop | Push only each source's single most-recent tweet, tagged with which user it came from and its index, so the next-older tweet can be found later. |
| 47-54 | merge loop | Pop the most recent; record it; if that source has an older tweet left, push it in — this is the "k-way merge" step, advancing exactly one source at a time. |
| 48 | \`while (result.length < 10 && heap.size() > 0)\` | Stop at 10 results or when every source is exhausted, whichever comes first. |`,
        dryRunMarkdown: `**Dry run 1** — after \`follow(1,2)\` and both tweets posted, \`getNewsFeed(1)\`:
sources=[1,2]. tweets[1]=[{5,t0}], tweets[2]=[{6,t1}].
Seed heap: push{5,t0,user1,idx0}, push{6,t1,user2,idx0} → heap={ (6,t1) top, (5,t0) }
Pop (6,t1) → result=[6]; idx0 has no older tweet (idx-1<0) → nothing pushed
Pop (5,t0) → result=[6,5]; idx0 has no older tweet → nothing pushed
Heap empty → stop. Result=**[6,5]** — matches expected.

**Dry run 2** — \`postTweet(1,10); postTweet(1,11); getNewsFeed(1)\`:
tweets[1]=[{10,t0},{11,t1}] (index0=10 oldest, index1=11 newest).
Seed: only source is user1, most recent = {11,t1,idx1} → heap={(11,t1)}
Pop(11,t1) → result=[11]; idx1>0 → push tweets[1][0]={10,t0,idx0} → heap={(10,t0)}
Pop(10,t0) → result=[11,10]; idx0, no older → nothing pushed
Heap empty → stop. Result=**[11,10]** — matches expected.`,
      },
    ],
    relatedSlugs: ["merge-k-sorted-lists", "find-median-from-data-stream"],
    realWorldUsageMarkdown: `Fan-out-on-read social feeds work exactly this way in production: rather than storing a precomputed feed per user, the server **merges each followee's per-user timeline on read**, using a heap to avoid re-sorting the full history every request. Any system that merges multiple already-sorted per-source streams into one global ordered feed (log aggregation, multi-shard "recent activity" views) reuses this shape.`,
  },
  {
    slug: "find-median-from-data-stream",
    title: "Find Median From Data Stream",
    difficulty: "hard",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "heaps",
    functionName: "MedianFinder",
    description: `## Problem

Design a data structure that supports adding integers from a stream (\`addNum\`) and finding the median of all elements added so far (\`findMedian\`), at any point in the stream.

## Example

\`\`\`
Input:  ["MedianFinder","addNum","addNum","findMedian","addNum","findMedian"]
        [[],[1],[2],[],[3],[]]
Output: [null,null,null,1.5,null,2]
\`\`\`

## Senior interview angle

Split the stream into two halves with a heap each: a **max-heap for the lower half** and a **min-heap for the upper half**, rebalanced after every insert so their sizes never differ by more than 1. The median is then O(1) to read: either the larger heap's root (odd total) or the average of both roots (even total). This avoids the O(n) insert cost of keeping one fully sorted array.

## Pattern

\`Two-heap median maintenance\` — the canonical "streaming median" structure; the two-heap split generalizes to streaming percentile tracking beyond just the 50th.`,
    starterCode: `class MedianFinder {
  constructor() {
    // Your code here
  }

  /**
   * @param {number} num
   * @return {void}
   */
  addNum(num) {
    // Your code here
  }

  /**
   * @return {number}
   */
  findMedian() {
    // Your code here
  }
}`,
    testCases: [
      {
        operations: ["MedianFinder", "addNum", "addNum", "findMedian", "addNum", "findMedian"],
        args: [[], [1], [2], [], [3], []],
        expected: [null, null, null, 1.5, null, 2],
      },
      {
        operations: [
          "MedianFinder", "addNum", "addNum", "addNum", "findMedian", "addNum", "findMedian",
        ],
        args: [[], [5], [2], [8], [], [1], []],
        expected: [null, null, null, null, 5, null, 3.5],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Sorted Array Insert)",
        timeComplexity: "O(n) per addNum (insert position + shift), O(1) per findMedian",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Keep a single array always sorted. Every `addNum` finds the correct insert position (linear scan, or binary search for the position — the shift to make room is still O(n)) and splices the value in. `findMedian` just reads the middle index(es) directly.",
        code: `class MedianFinder {
  constructor() {
    this.nums = [];
  }

  addNum(num) {
    let i = 0;
    while (i < this.nums.length && this.nums[i] < num) i++; // find sorted insert position
    this.nums.splice(i, 0, num);
  }

  findMedian() {
    const n = this.nums.length;
    const mid = n >> 1;
    return n % 2 === 0
      ? (this.nums[mid - 1] + this.nums[mid]) / 2
      : this.nums[mid];
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-8 | \`addNum\` | Linear scan for the first index not less than \`num\`, then \`splice\` inserts it there, shifting later elements. |
| 12-13 | \`n\`, \`mid\` | Total count and the array's midpoint index. |
| 14-16 | \`n % 2 === 0 ? average of the two middle : the single middle\` | Even count → average the two central elements; odd count → the single central element is the median. |`,
        dryRunMarkdown: `**Dry run 1** — \`addNum(1); addNum(2); findMedian(); addNum(3); findMedian()\`:
addNum(1) → nums=[1]
addNum(2) → insert pos1 → nums=[1,2]
findMedian() → n=2 even, mid=1 → (nums[0]+nums[1])/2=(1+2)/2=**1.5**
addNum(3) → insert pos2 → nums=[1,2,3]
findMedian() → n=3 odd, mid=1 → nums[1]=**2**
Results: [1.5, 2] — matches expected.

**Dry run 2** — \`addNum(5); addNum(2); addNum(8); findMedian(); addNum(1); findMedian()\`:
addNum(5) → [5]; addNum(2) → insert pos0 → [2,5]; addNum(8) → insert pos2 → [2,5,8]
findMedian() → n=3 odd, mid=1 → nums[1]=**5**
addNum(1) → insert pos0 → [1,2,5,8]
findMedian() → n=4 even, mid=2 → (nums[1]+nums[2])/2=(2+5)/2=**3.5**
Results: [5, 3.5] — matches expected.`,
      },
      {
        approach: "Optimal (Two Heaps)",
        timeComplexity: "O(log n) per addNum, O(1) per findMedian",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Maintain `lo`, a max-heap holding the smaller half of the numbers, and `hi`, a min-heap holding the larger half, kept balanced so their sizes differ by at most 1 (with `lo` allowed exactly one extra element). Every `addNum` pushes to `lo`, moves `lo`'s max into `hi`, then — if that overcorrected — moves `hi`'s min back to `lo`. `findMedian` reads the root(s) directly.",
        code: `class MinHeap {
  constructor() { this.data = []; }
  size() { return this.data.length; }
  peek() { return this.data[0]; }
  push(val) {
    this.data.push(val);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p] <= this.data[i]) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length) {
      this.data[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let smallest = i;
        if (l < this.data.length && this.data[l] < this.data[smallest]) smallest = l;
        if (r < this.data.length && this.data[r] < this.data[smallest]) smallest = r;
        if (smallest === i) break;
        [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
        i = smallest;
      }
    }
    return top;
  }
}

class MaxHeap extends MinHeap {
  push(val) { super.push(-val); }
  pop() { return -super.pop(); }
  peek() { return -super.peek(); }
}

class MedianFinder {
  constructor() {
    this.lo = new MaxHeap();  // smaller half
    this.hi = new MinHeap();  // larger half
  }

  addNum(num) {
    this.lo.push(num);
    this.hi.push(this.lo.pop());               // move lo's max into hi
    if (this.hi.size() > this.lo.size()) {
      this.lo.push(this.hi.pop());              // rebalance back if hi overtook lo
    }
  }

  findMedian() {
    if (this.lo.size() > this.hi.size()) return this.lo.peek();
    return (this.lo.peek() + this.hi.peek()) / 2;
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 34-36 | \`MaxHeap extends MinHeap\` | Negating every value on the way in/out turns the min-heap into a max-heap with zero duplicated sift logic. |
| 40-41 | constructor | \`lo\` (max-heap) holds the lower half, \`hi\` (min-heap) holds the upper half. |
| 45 | \`this.lo.push(num)\` | Always insert into \`lo\` first — simplest consistent entry point. |
| 46 | \`this.hi.push(this.lo.pop())\` | Move \`lo\`'s current maximum into \`hi\` — guarantees every element in \`lo\` is ≤ every element in \`hi\`. |
| 47-49 | rebalance | If that push made \`hi\` strictly larger than \`lo\`, move \`hi\`'s minimum back — keeps sizes within 1 of each other, \`lo\` never smaller. |
| 53-54 | \`findMedian\` | Odd total (\`lo\` has the extra element) → \`lo\`'s max is the median; even total → average both roots. |`,
        dryRunMarkdown: `**Dry run 1** — \`addNum(1); addNum(2); findMedian(); addNum(3); findMedian()\`:
addNum(1): lo={1}→push→hi={1}. hi.size1>lo.size0→pop hi min1→lo={1}. Final lo={1},hi={}.
addNum(2): lo={1,2}max2→pop2→hi={2}. hi.size1>lo.size1? no→ no rebalance. Final lo={1},hi={2}.
findMedian(): lo.size1===hi.size1→even→(1+2)/2=**1.5** — matches.
addNum(3): lo={1,3}max3→pop3→hi={2,3}min2. hi.size2>lo.size1→pop hi min2→lo={1,2}max2. Final lo={1,2},hi={3}.
findMedian(): lo.size2>hi.size1→**2** — matches.

**Dry run 2** — \`addNum(5); addNum(2); addNum(8); findMedian(); addNum(1); findMedian()\`:
addNum(5): lo={5}→pop5→hi={5}. hi1>lo0→pop hi5→lo={5}. lo={5},hi={}.
addNum(2): lo={5,2}max5→pop5→hi={5}. hi1>lo1? no. lo={2},hi={5}.
addNum(8): lo={2,8}max8→pop8→hi={5,8}min5. hi2>lo1→pop hi5→lo={2,5}max5. lo={2,5},hi={8}.
findMedian(): lo.size2>hi.size1→**5** — matches.
addNum(1): lo={2,5,1}max5→pop5→hi={5,8}min5. hi2>lo2? no. lo={2,1},hi={5,8}.
findMedian(): lo.size2===hi.size2→(2+5)/2=**3.5** — matches.`,
      },
    ],
    relatedSlugs: ["kth-largest-in-stream", "kth-largest-element-in-array"],
    realWorldUsageMarkdown: `Real-time monitoring dashboards use the two-heap trick to report a **running median latency or price** from a live stream without re-sorting the full history on every tick — financial tick-data systems and infrastructure metrics pipelines both need "median so far" as new data points constantly arrive.`,
  },
];

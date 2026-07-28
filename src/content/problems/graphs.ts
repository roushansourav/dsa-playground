import type { Problem } from "../types";

export const graphProblems: Problem[] = [
  {
    slug: "find-if-path-exists-in-graph",
    title: "Find if Path Exists in Graph",
    difficulty: "easy",
    maangTags: ["Google", "Amazon"],
    topicSlug: "graphs",
    functionName: "validPath",
    description: `## Problem

You have an undirected graph with \`n\` nodes labeled \`0\` to \`n-1\`, described by an edge list \`edges\`. Given \`source\` and \`destination\`, return \`true\` if there is a path between them.

## Example

\`\`\`
Input: n = 6, edges = [[0,1],[0,2],[3,5],[5,4],[4,3]], source = 0, destination = 5
Output: false
\`\`\`

## Senior interview angle

This is the "hello world" of graph traversal: build an adjacency list, then BFS or DFS from \`source\`, marking visited nodes so cycles don't cause infinite loops. The entire topic's toolkit — adjacency list construction, a visited set, and a frontier — starts here.

## Pattern

\`Graph reachability via BFS/DFS\` — the base case every later traversal problem in this topic builds on.`,
    starterCode: `/**
 * @param {number} n
 * @param {number[][]} edges
 * @param {number} source
 * @param {number} destination
 * @return {boolean}
 */
function validPath(n, edges, source, destination) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          6,
          [
            [0, 1],
            [0, 2],
            [3, 5],
            [5, 4],
            [4, 3],
          ],
          0,
          5,
        ],
        expected: false,
      },
      {
        input: [
          10,
          [
            [4, 3],
            [1, 4],
            [4, 8],
            [1, 7],
            [6, 4],
            [4, 0],
            [0, 9],
            [5, 4],
            [4, 1],
          ],
          5,
          9,
        ],
        expected: true,
      },
      { input: [1, [], 0, 0], expected: true },
    ],
    solutions: [
      {
        approach: "Brute Force (Union-Find with No Compression)",
        timeComplexity: "O(V + E) amortized, worst case O(V·E) without compression",
        spaceComplexity: "O(V)",
        overviewMarkdown:
          "Union every edge's two endpoints into the same set using a plain parent array, walking up parent pointers to find each node's root with no path compression or union by rank. Correct, but repeated finds can degrade to a long chain in adversarial input orders.",
        code: `function validPath(n, edges, source, destination) {
  const parent = Array.from({ length: n }, (_, i) => i);

  function find(x) {
    while (parent[x] !== x) x = parent[x]; // walk up, no compression
    return x;
  }

  for (const [a, b] of edges) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootA] = rootB; // no rank heuristic
  }

  return find(source) === find(destination);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`parent = [0..n-1]\` | Every node starts as its own root — \`n\` singleton sets. |
| 5-8 | \`find(x)\` | Follow parent pointers until a node points to itself (its root). No compression, so chains can grow long. |
| 11-14 | union loop | For each edge, union the two endpoints' roots by pointing one root at the other. |
| 17 | final check | \`source\` and \`destination\` are connected iff they share a root. |`,
        dryRunMarkdown: `**Dry run 1** — \`n=6, edges=[[0,1],[0,2],[3,5],[5,4],[4,3]], source=0, destination=5\`:
Union(0,1): parent[0]=1. Union(0,2): find(0)=1, parent[1]=2. Union(3,5): parent[3]=5. Union(5,4): find(5)=5, parent[5]=4. Union(4,3): find(4)=4, find(3)=find(3)→parent[3]=5→find(5)=4, so root(3)=4=root(4), no-op.
find(0): 0→1→2 = **2**. find(5): 5→4 = **4**. 2 ≠ 4 → **false** — matches expected.

**Dry run 2** — \`n=1, edges=[], source=0, destination=0\`:
No edges to union. find(0)=0, find(0)=0, equal → **true** — matches expected (a node always has a path to itself).`,
      },
      {
        approach: "Optimal (BFS Over Adjacency List)",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V + E)",
        overviewMarkdown:
          "Build an adjacency list from the edge list, then BFS outward from `source`, marking each node visited exactly once. If `destination` is ever dequeued, a path exists. A `visited` set is what keeps BFS/DFS at O(V + E) instead of re-exploring cycles forever.",
        code: `function validPath(n, edges, source, destination) {
  if (source === destination) return true;

  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }

  const visited = new Set([source]);
  const queue = [source];

  while (queue.length > 0) {
    const node = queue.shift();
    for (const next of adj[node]) {
      if (next === destination) return true;
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  return false;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | early exit | Same node — trivially reachable, no traversal needed. |
| 4-7 | adjacency list | Each edge is undirected, so both directions get recorded. |
| 9-10 | \`visited\`/\`queue\` seed | Start BFS from \`source\`, marking it visited immediately to avoid re-enqueueing it. |
| 13-21 | BFS loop | Dequeue a node, check each neighbor: if it's the destination, done; otherwise enqueue it once via the visited guard. |
| 23 | fallthrough | Queue exhausted without hitting \`destination\` — no path exists. |`,
        dryRunMarkdown: `**Dry run 1** — \`n=6, edges=[[0,1],[0,2],[3,5],[5,4],[4,3]], source=0, destination=5\`:
adj: 0→[1,2], 1→[0], 2→[0], 3→[5,4], 4→[5,3], 5→[3,4].
queue=[0], visited={0}. Dequeue 0: neighbors 1,2 — neither is 5, both new → visited={0,1,2}, queue=[1,2].
Dequeue 1: neighbor 0 — already visited, skip. Dequeue 2: neighbor 0 — already visited, skip. Queue empty → **false** — matches expected (0's component is {0,1,2}, disjoint from {3,4,5}).

**Dry run 2** — \`n=1, edges=[], source=0, destination=0\`:
Early exit on \`source === destination\` → **true** immediately — matches expected.`,
      },
    ],
    relatedSlugs: ["number-of-connected-components", "course-schedule"],
    realWorldUsageMarkdown: `Reachability checks like this power network connectivity tests (can packets reach a host?), social graph queries ("are these two people connected within N hops?"), and dependency resolvers checking whether a target module is reachable from an entry point at all before doing more expensive analysis.`,
  },
  {
    slug: "number-of-islands",
    title: "Number of Islands",
    difficulty: "medium",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "graphs",
    functionName: "numIslands",
    description: `## Problem

Given an \`m x n\` 2D grid of \`"1"\` (land) and \`"0"\` (water), return the number of islands. An island is formed by connecting adjacent lands horizontally or vertically.

## Example

\`\`\`
Input: grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
Output: 3
\`\`\`

## Senior interview angle

A grid is just a graph where each cell is a node and its 4-directional neighbors are edges. Flood-fill (DFS or BFS) from every unvisited land cell, sinking the entire island as you go so it's never counted twice. The "grid as implicit graph" framing is the single most-reused idea in this topic.

## Pattern

\`Grid flood-fill\` — DFS/BFS where the adjacency list is implicit in row/col deltas instead of an edge list.`,
    starterCode: `/**
 * @param {string[][]} grid
 * @return {number}
 */
function numIslands(grid) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            ["1", "1", "0", "0", "0"],
            ["1", "1", "0", "0", "0"],
            ["0", "0", "1", "0", "0"],
            ["0", "0", "0", "1", "1"],
          ],
        ],
        expected: 3,
      },
      {
        input: [
          [
            ["1", "1", "1"],
            ["0", "1", "0"],
            ["1", "1", "1"],
          ],
        ],
        expected: 1,
      },
      { input: [[["0"]]], expected: 0 },
    ],
    solutions: [
      {
        approach: "Brute Force (BFS with a Separate Visited Grid)",
        timeComplexity: "O(m·n)",
        spaceComplexity: "O(m·n)",
        overviewMarkdown:
          "Keep a same-shaped `visited` grid instead of mutating the input. For every unvisited land cell, BFS outward marking every connected land cell visited, and count that as one island. Same time complexity as the optimal version but pays for a full extra grid of booleans, and mutation-avoidance discipline the optimal solution skips by sinking cells in place.",
        code: `function numIslands(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  let count = 0;

  function bfs(r, c) {
    const queue = [[r, c]];
    visited[r][c] = true;
    while (queue.length > 0) {
      const [row, col] = queue.shift();
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [dr, dc] of dirs) {
        const nr = row + dr, nc = col + dc;
        if (
          nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
          !visited[nr][nc] && grid[nr][nc] === "1"
        ) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1" && !visited[r][c]) {
        count++;
        bfs(r, c);
      }
    }
  }

  return count;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4 | \`visited\` grid | Parallel boolean grid — the input \`grid\` itself is never mutated. |
| 7-24 | \`bfs(r, c)\` | Standard 4-directional BFS: queue starts at \`(r,c)\`, expands to unvisited land neighbors until exhausted. |
| 27-34 | scan loop | Every unvisited land cell found starts a fresh BFS and increments the island count — it's the "first cell" of a not-yet-counted island. |`,
        dryRunMarkdown: `**Dry run 1** — 4x5 grid from the example:
\`(0,0)='1'\`, unvisited → count=1, BFS sinks the connected block \`{(0,0),(0,1),(1,0),(1,1)}\`.
Scan continues: \`(2,2)='1'\`, unvisited → count=2, BFS visits just \`{(2,2)}\` (no land neighbors).
Continues: \`(3,3)='1'\`, unvisited → count=3, BFS visits \`{(3,3),(3,4)}\`.
No more unvisited land → **3** — matches expected.

**Dry run 2** — single-cell grid \`[["0"]]\`:
Scan finds no \`"1"\` cell → count stays **0** — matches expected.`,
      },
      {
        approach: "Optimal (DFS with In-Place Sinking)",
        timeComplexity: "O(m·n)",
        spaceComplexity: "O(m·n) worst-case recursion stack, O(1) extra grid space",
        overviewMarkdown:
          "Same flood-fill idea, but instead of a separate visited grid, mutate land cells to `\"0\"` the moment they're visited — \"sinking\" the island as DFS explores it. This avoids allocating a second grid entirely; the input doubles as its own visited-tracker.",
        code: `function numIslands(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  function sink(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== "1") return;
    grid[r][c] = "0";       // sink this cell so it's never revisited
    sink(r + 1, c);
    sink(r - 1, c);
    sink(r, c + 1);
    sink(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        count++;
        sink(r, c);
      }
    }
  }

  return count;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-12 | \`sink(r, c)\` | Bounds/water guard first, then flip this cell to water, then recurse into all 4 neighbors — classic DFS flood fill. |
| 8 | \`grid[r][c] = "0"\` | Mutating the grid IS the visited marker — no second data structure needed. |
| 15-20 | scan loop | Every \`"1"\` cell found is the seed of a not-yet-sunk island: count it, then sink the whole connected region so later scans skip it. |`,
        dryRunMarkdown: `**Dry run 1** — 4x5 grid from the example:
\`(0,0)='1'\` → count=1, \`sink(0,0)\`: flips \`(0,0)\`→'0', recurses to \`(1,0)\` (flip, recurse to \`(1,1)\` flip, recurse to \`(0,1)\` flip) — the whole top-left block sinks.
Scan resumes at \`(2,2)='1'\` (untouched by the first sink) → count=2, \`sink(2,2)\` flips just that cell (neighbors are water).
Scan resumes at \`(3,3)='1'\` → count=3, \`sink(3,3)\` flips \`(3,3)\` then recurses to \`(3,4)\`, flipping it too.
Final count **3** — matches expected. (Grid is now all \`"0"\`s — mutation is the point.)

**Dry run 2** — single-row grid \`[["1","1","1"],["0","1","0"],["1","1","1"]]\`:
\`(0,0)='1'\` → count=1, \`sink(0,0)\` cascades through the entire connected ring (all cells touch via the center column) — every \`'1'\` in the grid sinks in one call.
Scan finds no remaining \`'1'\` → final count **1** — matches expected.`,
      },
    ],
    relatedSlugs: ["max-area-of-island", "rotting-oranges"],
    realWorldUsageMarkdown: `Flood-fill over a grid is the exact algorithm behind the "paint bucket" tool in image editors, connected-region detection in image segmentation, and terrain/blob analysis in game map generation — anywhere adjacent same-valued cells need to be grouped into regions.`,
  },
  {
    slug: "rotting-oranges",
    title: "Rotting Oranges",
    difficulty: "medium",
    maangTags: ["Amazon", "Google"],
    topicSlug: "graphs",
    functionName: "orangesRotting",
    description: `## Problem

A grid cell is \`0\` (empty), \`1\` (fresh orange), or \`2\` (rotten orange). Every minute, any fresh orange adjacent (4-directionally) to a rotten one becomes rotten. Return the minimum minutes until no cell has a fresh orange, or \`-1\` if impossible.

## Example

\`\`\`
Input: grid = [[2,1,1],[1,1,0],[0,1,1]]
Output: 4
\`\`\`

## Senior interview angle

This is multi-source BFS: seed the queue with **every** rotten orange at once (not just one), and each BFS "layer" is exactly one minute. Tracking level-by-level with a queue is what turns "shortest time for simultaneous spreading" into a clean O(m·n) pass instead of simulating minute-by-minute with nested scans.

## Pattern

\`Multi-source BFS\` — seed the frontier with all sources simultaneously; queue depth = elapsed time.`,
    starterCode: `/**
 * @param {number[][]} grid
 * @return {number}
 */
function orangesRotting(grid) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            [2, 1, 1],
            [1, 1, 0],
            [0, 1, 1],
          ],
        ],
        expected: 4,
      },
      {
        input: [
          [
            [2, 1, 1],
            [0, 1, 1],
            [1, 0, 1],
          ],
        ],
        expected: -1,
      },
      { input: [[[0, 2]]], expected: 0 },
    ],
    solutions: [
      {
        approach: "Brute Force (Simulate Minute-by-Minute with Full Rescans)",
        timeComplexity: "O((m·n)²) worst case",
        spaceComplexity: "O(m·n)",
        overviewMarkdown:
          "Each minute, rescan the entire grid to find every fresh orange adjacent to a rotten one, collect them, then rot them all at once (so rotting within a minute doesn't cascade within that same pass). Repeat until a full pass rots nothing new. Correct, but a full grid rescan every single minute is wasteful compared to tracking a frontier directly.",
        code: `function orangesRotting(grid) {
  const rows = grid.length, cols = grid[0].length;
  let minutes = 0;

  function hasFresh() {
    return grid.some((row) => row.includes(1));
  }

  while (hasFresh()) {
    const toRot = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 1) {
          const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
          for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 2) {
              toRot.push([r, c]);
              break;
            }
          }
        }
      }
    }
    if (toRot.length === 0) return -1; // fresh oranges remain but none adjacent to rot
    for (const [r, c] of toRot) grid[r][c] = 2;
    minutes++;
  }

  return minutes;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-7 | \`hasFresh()\` | Full rescan to check if any \`1\` remains — the cost this brute force pays repeatedly. |
| 9-22 | outer \`while\` + scan | Each iteration re-scans the whole grid for fresh cells adjacent to rotten ones, batching them into \`toRot\` so within-minute rotting doesn't chain. |
| 24 | stuck check | If a full pass found nothing to rot but fresh oranges remain, they're unreachable — return \`-1\`. |
| 25-26 | apply + increment | Rot the batch, advance the clock by one minute. |`,
        dryRunMarkdown: `**Dry run 1** — \`[[2,1,1],[1,1,0],[0,1,1]]\`:
Minute 1: fresh cells adjacent to rotten(0,0) are (0,1) and (1,0) → rot both → grid rots to \`[[2,2,1],[2,1,0],[0,1,1]]\`, minutes=1.
Minute 2: (0,2) adj to (0,1)=2, (1,1) adj to (1,0)=2 → rot both → \`[[2,2,2],[2,2,0],[0,1,1]]\`, minutes=2.
Minute 3: (2,1) adj to (1,1)=2 → rot → \`[[2,2,2],[2,2,0],[0,2,1]]\`, minutes=3.
Minute 4: (2,2) adj to (2,1)=2 → rot → all rotten, minutes=4.
\`hasFresh()\` false → return **4** — matches expected.

**Dry run 2** — \`[[2,1,1],[0,1,1],[1,0,1]]\`:
Minute 1: only (0,1) is adjacent to rotten(0,0) → rot it. Minute 2: (0,2),(1,1) adjacent → rot. Minute 3: (1,2) adjacent → rot. Now grid is \`[[2,2,2],[0,2,2],[1,0,2]]\` — the \`1\` at (2,0) has neighbors (1,0)=0 and (2,1)=0, never adjacent to rotten → next pass finds \`toRot.length===0\` while fresh remains → return **-1** — matches expected.`,
      },
      {
        approach: "Optimal (Multi-Source BFS, Level by Level)",
        timeComplexity: "O(m·n)",
        spaceComplexity: "O(m·n)",
        overviewMarkdown:
          "Seed the BFS queue with every rotten orange at once — that's the 'multi-source' part. Process the queue in levels: everything currently in the queue rots the oranges adjacent to it, and each full level processed is exactly one minute elapsed. Track fresh-orange count directly instead of rescanning the grid.",
        code: `function orangesRotting(grid) {
  const rows = grid.length, cols = grid[0].length;
  const queue = [];
  let fresh = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  }

  let minutes = 0;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (queue.length > 0 && fresh > 0) {
    const levelSize = queue.length;
    for (let i = 0; i < levelSize; i++) {
      const [r, c] = queue.shift();
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
          grid[nr][nc] = 2;
          fresh--;
          queue.push([nr, nc]);
        }
      }
    }
    minutes++;
  }

  return fresh === 0 ? minutes : -1;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-11 | seed pass | Single scan: every rotten cell seeds the queue, every fresh cell increments \`fresh\` — no rescanning later. |
| 15 | \`levelSize = queue.length\` | Snapshot the current frontier size so this loop processes exactly one "minute" of rotting, not oranges rotted within this same pass. |
| 16-24 | level loop | Rot every fresh neighbor of the current frontier, decrementing \`fresh\` and enqueueing newly-rotten cells for the next level. |
| 25 | \`minutes++\` | One full level processed = one minute elapsed. |
| 28 | final check | If \`fresh\` never hit 0, some oranges were unreachable — return \`-1\`; otherwise \`minutes\` is the answer. |`,
        dryRunMarkdown: `**Dry run 1** — \`[[2,1,1],[1,1,0],[0,1,1]]\`:
Seed: queue=[(0,0)], fresh cells are (0,1),(0,2),(1,0),(1,1),(2,1),(2,2) → fresh=6.
Level 1 (levelSize=1): pop (0,0), neighbors (1,0) and (0,1) are fresh → rot both, fresh=4, queue=[(1,0),(0,1)]. minutes=1.
Level 2 (levelSize=2): pop (1,0) → neighbor (1,1) fresh → rot, fresh=3, queue=[(0,1),(1,1)]. pop (0,1) → neighbor (0,2) fresh → rot, fresh=2, queue=[(1,1),(0,2)]. minutes=2.
Level 3 (levelSize=2): pop (1,1) → neighbor (2,1) fresh → rot, fresh=1, queue=[(0,2),(2,1)]. pop (0,2) → no fresh neighbors. minutes=3.
Level 4 (levelSize=1): pop (2,1) → neighbor (2,2) fresh → rot, fresh=0, queue=[(2,2)]. minutes=4.
\`fresh===0\` → return **4** — matches expected.

**Dry run 2** — \`[[2,1,1],[0,1,1],[1,0,1]]\`:
Seed: queue=[(0,0)], fresh cells are (0,1),(0,2),(1,1),(1,2),(2,0),(2,2) → fresh=6. BFS rots the connected component reachable from (0,0) over 3 minutes, decrementing \`fresh\` to 1 (only \`(2,0)\` left). \`(2,0)\` never gets enqueued since its neighbors \`(1,0)=0\` and \`(2,1)=0\` never turn rotten. Loop ends when the queue empties with \`fresh\` still 1 → \`fresh !== 0\` → return **-1** — matches expected.`,
      },
    ],
    relatedSlugs: ["number-of-islands", "find-if-path-exists-in-graph"],
    realWorldUsageMarkdown: `Multi-source BFS is the same shape as epidemic/infection-spread simulations, fire or flood propagation modeling, and "time to full coverage" queries in wireless mesh networks — anywhere multiple simultaneous sources spread outward at a uniform rate and you need the time until saturation.`,
  },
  {
    slug: "course-schedule",
    title: "Course Schedule",
    difficulty: "medium",
    maangTags: ["Google", "Amazon", "Meta"],
    topicSlug: "graphs",
    functionName: "canFinish",
    description: `## Problem

There are \`numCourses\` courses labeled \`0\` to \`numCourses-1\`. \`prerequisites[i] = [a, b]\` means you must take course \`b\` before course \`a\`. Return \`true\` if you can finish all courses (i.e., the prerequisite graph has no cycle).

## Example

\`\`\`
Input: numCourses = 2, prerequisites = [[1,0]]
Output: true
\`\`\`

## Senior interview angle

"Can all courses be completed" is exactly "does this directed graph have a cycle." Detect cycles via DFS with a **recursion-stack** (gray/white/black coloring) — a node currently on the call stack that gets revisited means a cycle. This is the interview's way of testing whether you know cycle detection needs a *third* state beyond visited/unvisited, since a node already fully processed (black) is fine to revisit, but one still on the stack (gray) is not.

## Pattern

\`Directed-graph cycle detection\` — 3-color DFS (white/gray/black), the foundation for topological sort.`,
    starterCode: `/**
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @return {boolean}
 */
function canFinish(numCourses, prerequisites) {
  // Your code here
}`,
    testCases: [
      { input: [2, [[1, 0]]], expected: true },
      {
        input: [
          2,
          [
            [1, 0],
            [0, 1],
          ],
        ],
        expected: false,
      },
      {
        input: [
          4,
          [
            [1, 0],
            [2, 1],
            [3, 2],
          ],
        ],
        expected: true,
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Repeated Topological Peeling / Kahn's, Recomputed Each Round)",
        timeComplexity: "O(V²+ V·E) — recomputing in-degree candidates each round",
        spaceComplexity: "O(V + E)",
        overviewMarkdown:
          "Repeatedly scan for any course with in-degree 0 (no remaining prerequisites), 'remove' it by decrementing the in-degree of everything it unlocks, and repeat. If every course eventually gets removed, there's no cycle. This is a valid Kahn's-algorithm shape, but scanning the full in-degree array every round instead of maintaining a queue makes it needlessly quadratic.",
        code: `function canFinish(numCourses, prerequisites) {
  const inDegree = Array(numCourses).fill(0);
  const adj = Array.from({ length: numCourses }, () => []);
  for (const [course, prereq] of prerequisites) {
    adj[prereq].push(course);
    inDegree[course]++;
  }

  const removed = Array(numCourses).fill(false);
  let removedCount = 0;

  for (let round = 0; round < numCourses; round++) {
    let found = -1;
    for (let c = 0; c < numCourses; c++) {
      if (!removed[c] && inDegree[c] === 0) { found = c; break; }
    }
    if (found === -1) break; // no zero in-degree course left — cycle among the rest
    removed[found] = true;
    removedCount++;
    for (const next of adj[found]) inDegree[next]--;
  }

  return removedCount === numCourses;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-6 | build graph | \`inDegree[c]\` counts unmet prerequisites; \`adj[prereq]\` lists courses that prereq unlocks. |
| 11-19 | round loop | Each round rescans for *any* zero-in-degree course, removes it, and decrements its dependents — a valid but repeatedly-rescanning version of Kahn's algorithm. |
| 15 | stuck check | If no course has in-degree 0 this round, the remainder forms a cycle. |
| 21 | verdict | All courses removed ⟺ no cycle ⟺ can finish. |`,
        dryRunMarkdown: `**Dry run 1** — \`numCourses=2, prerequisites=[[1,0]]\`:
adj: 0→[1]. inDegree=[0,1]. Round 0: course 0 has inDegree 0 → remove, removedCount=1, dependents: inDegree[1]--→0. Round 1: course 1 has inDegree 0 → remove, removedCount=2. removedCount===2===numCourses → **true** — matches expected.

**Dry run 2** — \`numCourses=2, prerequisites=[[1,0],[0,1]]\`:
adj: 0→[1], 1→[0]. inDegree=[1,1]. Round 0: no course has inDegree 0 (both 1) → \`found=-1\` → break immediately. removedCount=0 ≠ 2 → **false** — matches expected (mutual dependency = cycle).`,
      },
      {
        approach: "Optimal (DFS with 3-Color Cycle Detection)",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V + E)",
        overviewMarkdown:
          "DFS from every unvisited course, coloring each node WHITE (unvisited) → GRAY (on the current recursion stack) → BLACK (fully processed, safe). Hitting a GRAY node during DFS means the current path loops back on itself — a cycle. Each node is colored black exactly once, so total work is linear.",
        code: `function canFinish(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  for (const [course, prereq] of prerequisites) adj[prereq].push(course);

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = Array(numCourses).fill(WHITE);

  function hasCycle(node) {
    color[node] = GRAY;
    for (const next of adj[node]) {
      if (color[next] === GRAY) return true;         // back edge — cycle
      if (color[next] === WHITE && hasCycle(next)) return true;
    }
    color[node] = BLACK;
    return false;
  }

  for (let c = 0; c < numCourses; c++) {
    if (color[c] === WHITE && hasCycle(c)) return false;
  }

  return true;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | adjacency list | \`adj[prereq]\` lists courses unlocked once \`prereq\` is done — the natural DFS direction. |
| 5-6 | 3-color state | WHITE=untouched, GRAY=on the current DFS path, BLACK=fully resolved with no cycle through it. |
| 8-15 | \`hasCycle(node)\` | Mark GRAY on entry. A GRAY neighbor means the current path revisits a node still on its own stack — a cycle. A WHITE neighbor recurses. On clean exit, mark BLACK so future DFS calls can skip re-exploring it. |
| 18-20 | driver loop | Graph may be disconnected — DFS from every still-WHITE node. |`,
        dryRunMarkdown: `**Dry run 1** — \`numCourses=4, prerequisites=[[1,0],[2,1],[3,2]]\`:
adj: 0→[1], 1→[2], 2→[3], 3→[]. Driver starts at 0 (WHITE): color[0]=GRAY, recurse into 1: color[1]=GRAY, recurse into 2: color[2]=GRAY, recurse into 3: color[3]=GRAY, no neighbors → color[3]=BLACK, return false. Back in 2: no more neighbors → color[2]=BLACK, false. Back in 1: color[1]=BLACK, false. Back in 0: color[0]=BLACK, false. Driver checks 1,2,3 — all BLACK now, skip. No cycle found → **true** — matches expected.

**Dry run 2** — \`numCourses=2, prerequisites=[[1,0],[0,1]]\`:
adj: 0→[1], 1→[0]. Driver starts at 0: color[0]=GRAY, recurse into 1: color[1]=GRAY, recurse into 0 — color[0] is **GRAY** (still on the stack) → \`hasCycle\` returns true immediately, propagates up through both frames → **false** — matches expected.`,
      },
    ],
    relatedSlugs: ["number-of-connected-components", "find-if-path-exists-in-graph"],
    realWorldUsageMarkdown: `Cycle detection over a directed graph is exactly how build systems (Make, Bazel, npm/yarn) detect circular dependencies before attempting a build, and how spreadsheet engines detect circular cell references before evaluating formulas.`,
  },
  {
    slug: "number-of-connected-components",
    title: "Number of Connected Components in an Undirected Graph",
    difficulty: "medium",
    maangTags: ["Google", "Amazon"],
    topicSlug: "graphs",
    functionName: "countComponents",
    description: `## Problem

Given \`n\` nodes labeled \`0\` to \`n-1\` and a list of undirected \`edges\`, return the number of connected components in the graph.

## Example

\`\`\`
Input: n = 5, edges = [[0,1],[1,2],[3,4]]
Output: 2
\`\`\`

## Senior interview angle

This is the canonical **Union-Find (Disjoint Set Union)** problem: start with \`n\` singleton components, union the endpoints of every edge, and count distinct roots at the end. Path compression + union by rank make each operation nearly O(1) amortized (inverse-Ackermann) — the detail that separates a textbook DSU answer from a production-quality one.

## Pattern

\`Union-Find (DSU) with path compression and union by rank\` — the standard tool whenever "group things into connected sets" needs to support fast merges.`,
    starterCode: `/**
 * @param {number} n
 * @param {number[][]} edges
 * @return {number}
 */
function countComponents(n, edges) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          5,
          [
            [0, 1],
            [1, 2],
            [3, 4],
          ],
        ],
        expected: 2,
      },
      {
        input: [
          5,
          [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4],
          ],
        ],
        expected: 1,
      },
      { input: [4, []], expected: 4 },
    ],
    solutions: [
      {
        approach: "Brute Force (BFS Flood Fill from Every Unvisited Node)",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V + E)",
        overviewMarkdown:
          "Build an adjacency list, then for every unvisited node, BFS across its entire component marking each node visited, and count that as one component. Correct and the same asymptotic complexity as Union-Find here, but it's listed as the 'brute force' because it can't efficiently support the common follow-up of *online* union queries (edges added incrementally, connectivity checked between each addition) the way DSU can.",
        code: `function countComponents(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }

  const visited = Array(n).fill(false);
  let components = 0;

  for (let start = 0; start < n; start++) {
    if (visited[start]) continue;
    components++;
    const queue = [start];
    visited[start] = true;
    while (queue.length > 0) {
      const node = queue.shift();
      for (const next of adj[node]) {
        if (!visited[next]) {
          visited[next] = true;
          queue.push(next);
        }
      }
    }
  }

  return components;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-6 | adjacency list | Standard undirected adjacency list from the edge list. |
| 11-25 | scan + BFS | Every unvisited node starts a new component and BFS marks its entire reachable set visited in one sweep, so no node is ever double-counted. |
| 27 | return | Total number of BFS launches = number of components. |`,
        dryRunMarkdown: `**Dry run 1** — \`n=5, edges=[[0,1],[1,2],[3,4]]\`:
adj: 0→[1],1→[0,2],2→[1],3→[4],4→[3]. Scan 0: unvisited → components=1, BFS visits {0,1,2}. Scan 1: visited, skip. Scan 2: visited, skip. Scan 3: unvisited → components=2, BFS visits {3,4}. Scan 4: visited, skip. Final **2** — matches expected.

**Dry run 2** — \`n=4, edges=[]\`:
adj all empty. Every node is its own component: scan 0→components=1 (BFS visits only {0}), scan 1→components=2, scan 2→components=3, scan 3→components=4. Final **4** — matches expected.`,
      },
      {
        approach: "Optimal (Union-Find with Path Compression + Union by Rank)",
        timeComplexity: "O(E · α(V)) ≈ O(E) amortized",
        spaceComplexity: "O(V)",
        overviewMarkdown:
          "Start with `n` singleton sets. For each edge, union the two endpoints' roots, always attaching the lower-rank tree under the higher-rank one and flattening the path on every `find` call. After processing all edges, the number of distinct roots (nodes that are their own parent) is the component count.",
        code: `function countComponents(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = Array(n).fill(0);

  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]); // path compression
    return parent[x];
  }

  function union(a, b) {
    const rootA = find(a), rootB = find(b);
    if (rootA === rootB) return;
    if (rank[rootA] < rank[rootB]) parent[rootA] = rootB;
    else if (rank[rootA] > rank[rootB]) parent[rootB] = rootA;
    else { parent[rootB] = rootA; rank[rootA]++; }
  }

  for (const [a, b] of edges) union(a, b);

  let components = 0;
  for (let i = 0; i < n; i++) {
    if (find(i) === i) components++;
  }
  return components;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`parent\`/\`rank\` init | \`n\` singleton sets, each its own root, all rank 0. |
| 5-8 | \`find(x)\` | Recursively finds the root, then rewrites every visited node's parent directly to the root (path compression) — future finds on these nodes are O(1). |
| 10-15 | \`union(a, b)\` | Attach the shorter tree under the taller one (union by rank), bumping rank only when the two trees were equal height — keeps trees shallow. |
| 17 | union pass | One union call per edge collapses connected nodes into shared roots. |
| 19-23 | count roots | A node is a component's representative iff it's its own root — count those. |`,
        dryRunMarkdown: `**Dry run 1** — \`n=5, edges=[[0,1],[1,2],[3,4]]\`:
parent=[0,1,2,3,4], rank=[0,0,0,0,0]. union(0,1): find(0)=0,find(1)=1, equal rank→parent[1]=0, rank[0]=1. union(1,2): find(1)=0 (via parent[1]=0),find(2)=2, rank[0]=1>rank[2]=0→parent[2]=0. union(3,4): find(3)=3,find(4)=4, equal rank→parent[4]=3, rank[3]=1.
parent now: [0,0,0,3,3]. Count roots: find(0)=0=0✓, find(1)=0≠1✗, find(2)=0≠2✗, find(3)=3=3✓, find(4)=3≠4✗. components=**2** — matches expected.

**Dry run 2** — \`n=4, edges=[]\`:
No unions performed. Every node is still its own root: find(i)===i for all i=0..3 → components=**4** — matches expected.`,
      },
    ],
    relatedSlugs: ["find-if-path-exists-in-graph", "course-schedule"],
    realWorldUsageMarkdown: `Union-Find is the standard structure behind Kruskal's MST algorithm, image-processing connected-component labeling, and network/cluster analysis tools that need to answer 'how many disjoint groups exist' and 'are these two nodes in the same group' cheaply as edges stream in.`,
  },
  {
    slug: "pacific-atlantic-water-flow",
    title: "Pacific Atlantic Water Flow",
    difficulty: "medium",
    maangTags: ["Google", "Amazon", "Apple"],
    topicSlug: "graphs",
    functionName: "pacificAtlantic",
    description: `## Problem

Given an \`m x n\` grid of heights, the Pacific touches the top/left edges and the Atlantic touches the bottom/right edges. Water flows from a cell to an adjacent cell only if the adjacent cell's height is **≤** the current cell's height. Return all cells from which water can reach **both** oceans, as \`[row, col]\` pairs (any order).

## Example

\`\`\`
Input: heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]
Output: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]
\`\`\`

## Senior interview angle

Checking "can this cell reach the Pacific" by flowing forward from every cell is O((m·n)²). The trick: **reverse the flow** and BFS/DFS *inward* from each ocean's border cells, moving to a neighbor only if it's **≥** current height (the reverse of the forward flow condition). A cell that's reachable from both border-seeded searches is in the answer — two grid-sized boolean sets instead of a search per cell.

## Pattern

\`Multi-source BFS/DFS from the boundary, reversed edge condition\` — search backward from the "exits" instead of forward from every possible start.`,
    starterCode: `/**
 * @param {number[][]} heights
 * @return {number[][]}
 */
function pacificAtlantic(heights) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            [1, 2, 2, 3, 5],
            [3, 2, 3, 4, 4],
            [2, 4, 5, 3, 1],
            [6, 7, 1, 4, 5],
            [5, 1, 1, 2, 4],
          ],
        ],
        expected: [
          [0, 4],
          [1, 3],
          [1, 4],
          [2, 2],
          [3, 0],
          [3, 1],
          [4, 0],
        ],
        unordered: true,
      },
      {
        input: [[[1]]],
        expected: [[0, 0]],
        unordered: true,
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Forward Flow Search from Every Cell)",
        timeComplexity: "O((m·n)² ) worst case",
        spaceComplexity: "O(m·n) per search",
        overviewMarkdown:
          "For every single cell, run a DFS/BFS that only moves to neighbors with height **≤** current (forward flow), and check whether that search ever reaches the Pacific border and, separately, the Atlantic border. Correct, but every one of the m·n cells triggers its own up-to-m·n-sized search.",
        code: `function pacificAtlantic(heights) {
  const rows = heights.length, cols = heights[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function canReach(sr, sc, isPacific) {
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const stack = [[sr, sc]];
    visited[sr][sc] = true;
    while (stack.length) {
      const [r, c] = stack.pop();
      if (isPacific ? (r === 0 || c === 0) : (r === rows - 1 || c === cols - 1)) return true;
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (
          nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc] &&
          heights[nr][nc] <= heights[r][c]
        ) {
          visited[nr][nc] = true;
          stack.push([nr, nc]);
        }
      }
    }
    return false;
  }

  const result = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (canReach(r, c, true) && canReach(r, c, false)) result.push([r, c]);
    }
  }
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-22 | \`canReach(sr, sc, isPacific)\` | Forward DFS from \`(sr,sc)\`, only moving to non-higher neighbors (water flows downhill), returning true the moment the relevant border is hit. |
| 26-31 | driver | Every cell runs *two* independent searches — one per ocean — making this quadratic in grid size. |`,
        dryRunMarkdown: `**Dry run 1** — small check on cell \`(0,4)\` in the example grid (height 5, top-right corner):
\`canReach(0,4,true)\`: r=0 is already a Pacific border row → returns **true** immediately.
\`canReach(0,4,false)\`: c=4 is already the last column (Atlantic border) → returns **true** immediately.
Both true → \`(0,4)\` added to result — matches its presence in the expected output.

**Dry run 2** — \`heights=[[1]]\`, single cell:
\`canReach(0,0,true)\`: r=0 and c=0 both border Pacific → true. \`canReach(0,0,false)\`: r=rows-1=0 and c=cols-1=0 both border Atlantic → true. Result=[[0,0]] — matches expected.`,
      },
      {
        approach: "Optimal (Reverse Multi-Source BFS from Each Ocean's Border)",
        timeComplexity: "O(m·n)",
        spaceComplexity: "O(m·n)",
        overviewMarkdown:
          "Seed two BFS/DFS searches with *all* Pacific-border cells and all Atlantic-border cells respectively, moving inward to a neighbor only if its height is **≥** the current cell (the reverse of 'water flows downhill' — if forward flow allows A→B when height[B] ≤ height[A], then reverse reachability from B walks to A when height[A] ≥ height[B]). Each search touches every cell at most once; a cell reachable from both searches can send water to both oceans.",
        code: `function pacificAtlantic(heights) {
  const rows = heights.length, cols = heights[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function bfs(starts) {
    const reachable = Array.from({ length: rows }, () => Array(cols).fill(false));
    const queue = [...starts];
    for (const [r, c] of starts) reachable[r][c] = true;
    while (queue.length) {
      const [r, c] = queue.shift();
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (
          nr >= 0 && nr < rows && nc >= 0 && nc < cols && !reachable[nr][nc] &&
          heights[nr][nc] >= heights[r][c] // reverse condition: uphill or equal
        ) {
          reachable[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }
    return reachable;
  }

  const pacificStarts = [];
  const atlanticStarts = [];
  for (let r = 0; r < rows; r++) {
    pacificStarts.push([r, 0]);
    atlanticStarts.push([r, cols - 1]);
  }
  for (let c = 0; c < cols; c++) {
    pacificStarts.push([0, c]);
    atlanticStarts.push([rows - 1, c]);
  }

  const pacific = bfs(pacificStarts);
  const atlantic = bfs(atlanticStarts);

  const result = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (pacific[r][c] && atlantic[r][c]) result.push([r, c]);
    }
  }
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-19 | \`bfs(starts)\` | Multi-source BFS seeded with an entire border at once; moves to a neighbor only if its height is ≥ current — the reversed flow condition. |
| 21-29 | border seeding | Pacific border = row 0 and column 0; Atlantic border = last row and last column. |
| 31-32 | two searches | One BFS per ocean, each O(m·n) — total work stays linear instead of quadratic. |
| 34-39 | intersection | A cell in the answer iff both searches marked it reachable — it can drain to both oceans. |`,
        dryRunMarkdown: `**Dry run 1** — corner \`(0,4)\` in the 5x5 example grid (height 5):
Pacific BFS seeds include \`(0,4)\` itself (row 0) → \`pacific[0][4]=true\` from seeding alone. Atlantic BFS seeds include \`(0,4)\` itself (last column, c=4=cols-1) → \`atlantic[0][4]=true\` from seeding alone. Both true → \`(0,4)\` in result — matches expected.
Interior cell \`(2,2)\` height 5: Pacific search reaches it via the chain \`(0,2)=2 → (1,2)=3 → (2,2)=5\` (each step non-decreasing, so reverse-flow condition \`height[next] ≥ height[current]\` holds all the way from the top border). Atlantic search reaches it via \`(4,2)=1 → (3,2)=1 → (2,2)=5\` (same non-decreasing chain from the bottom border). Both searches mark \`reachable[2][2] = true\` → present in expected output.

**Dry run 2** — \`heights=[[1]]\`:
Pacific seeds = {(0,0)} (both row 0 and col 0), Atlantic seeds = {(0,0)} (both last row and last col, since rows=cols=1). Both searches mark \`(0,0)\` reachable trivially via seeding → result=[[0,0]] — matches expected.`,
      },
    ],
    relatedSlugs: ["number-of-islands", "rotting-oranges"],
    realWorldUsageMarkdown: `Reversing a search direction to seed from all "exits" at once instead of testing every "entrance" individually is the same trick used in watershed/drainage-basin modeling in GIS software, and in build systems computing "which source files are reachable from multiple entry points" without re-tracing from every file.`,
  },
  {
    slug: "word-ladder",
    title: "Word Ladder",
    difficulty: "hard",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "graphs",
    functionName: "ladderLength",
    description: `## Problem

Given \`beginWord\`, \`endWord\`, and a dictionary \`wordList\`, return the number of words in the **shortest transformation sequence** from \`beginWord\` to \`endWord\`, changing exactly one letter at a time, with every intermediate word required to be in \`wordList\`. Return \`0\` if no such sequence exists.

## Example

\`\`\`
Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]
Output: 5
\`\`\`

## Senior interview angle

Every word is a node; an edge connects two words that differ by exactly one letter. "Shortest transformation sequence" is then just **shortest path in an unweighted graph — BFS**. The interview-defining optimization: instead of comparing every word pair to build edges upfront (O(n²·L)), generate each word's neighbors on the fly by trying all 26 letters at each position and checking dictionary membership via a Set — turning edge discovery into O(L·26) per word instead of O(n·L) per word.

## Pattern

\`Implicit-graph BFS with generated neighbors\` — build edges on demand from the problem's transformation rule instead of materializing the whole graph.`,
    starterCode: `/**
 * @param {string} beginWord
 * @param {string} endWord
 * @param {string[]} wordList
 * @return {number}
 */
function ladderLength(beginWord, endWord, wordList) {
  // Your code here
}`,
    testCases: [
      {
        input: ["hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]],
        expected: 5,
      },
      {
        input: ["hit", "cog", ["hot", "dot", "dog", "lot", "log"]],
        expected: 0,
      },
      { input: ["a", "c", ["a", "b", "c"]], expected: 2 },
    ],
    solutions: [
      {
        approach: "Brute Force (BFS with Pairwise Neighbor Comparison)",
        timeComplexity: "O(n² · L) to build edges, where n = wordList size, L = word length",
        spaceComplexity: "O(n²)",
        overviewMarkdown:
          "Build the full adjacency list upfront by comparing every pair of words in the dictionary and connecting them if they differ by exactly one character, then run standard BFS from `beginWord` to `endWord` over that explicit graph. Correct, but comparing all O(n²) word pairs to discover edges dominates the cost long before BFS itself runs.",
        code: `function ladderLength(beginWord, endWord, wordList) {
  const words = [...new Set(wordList)];
  if (!words.includes(endWord)) return 0;
  if (!words.includes(beginWord)) words.push(beginWord);

  function differsByOne(a, b) {
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) diff++;
      if (diff > 1) return false;
    }
    return diff === 1;
  }

  const adj = new Map(words.map((w) => [w, []]));
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      if (differsByOne(words[i], words[j])) {
        adj.get(words[i]).push(words[j]);
        adj.get(words[j]).push(words[i]);
      }
    }
  }

  const visited = new Set([beginWord]);
  const queue = [[beginWord, 1]];
  while (queue.length > 0) {
    const [word, dist] = queue.shift();
    if (word === endWord) return dist;
    for (const next of adj.get(word)) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push([next, dist + 1]);
      }
    }
  }
  return 0;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-12 | \`differsByOne\` | Character-by-character comparison, early-exiting past 2 differences. |
| 15-22 | edge building | Every pair of words is compared once — O(n²) pairs, each an O(L) comparison. |
| 24-35 | BFS | Standard shortest-path BFS over the now-explicit graph, tracking distance alongside each queued word. |`,
        dryRunMarkdown: `**Dry run 1** — \`beginWord="hit", endWord="cog", wordList=["hot","dot","dog","lot","log","cog"]\`:
Edges found by pairwise comparison: hit-hot, hot-dot, hot-lot, dot-dog, dot-lot(no, differ by 2: d-o-t vs l-o-t differs at pos0 only→yes 1 diff→edge), lot-log, dog-log(1 diff at pos... "dog" vs "log": d≠l,o=o,g=g→1 diff→edge), dog-cog, log-cog.
BFS: (hit,1)→(hot,2)→(dot,3),(lot,3)→(dog,4),(log,4)[via dot/lot]→(cog,5)[via dog or log]. First time cog dequeued at dist **5** — matches expected.

**Dry run 2** — \`beginWord="hit", endWord="cog", wordList=["hot","dot","dog","lot","log"]\` (no "cog"):
\`words.includes("cog")\` is false → return **0** immediately — matches expected.`,
      },
      {
        approach: "Optimal (BFS with Generated Neighbors via Wildcard Pattern / 26-Letter Substitution)",
        timeComplexity: "O(n · L · 26)",
        spaceComplexity: "O(n · L)",
        overviewMarkdown:
          "Never materialize the word graph. Instead, from each word popped off the BFS queue, generate its neighbors on the fly: for every character position, try substituting all 26 letters and check membership in a `Set` built from `wordList`. This turns 'find this word's neighbors' from an O(n) scan into an O(L·26) generation — the difference between this and the brute force at scale.",
        code: `function ladderLength(beginWord, endWord, wordList) {
  const dict = new Set(wordList);
  if (!dict.has(endWord)) return 0;

  const visited = new Set([beginWord]);
  const queue = [[beginWord, 1]];

  while (queue.length > 0) {
    const [word, dist] = queue.shift();
    if (word === endWord) return dist;

    for (let i = 0; i < word.length; i++) {
      for (let code = 97; code <= 122; code++) {
        const candidate = word.slice(0, i) + String.fromCharCode(code) + word.slice(i + 1);
        if (dict.has(candidate) && !visited.has(candidate)) {
          visited.add(candidate);
          queue.push([candidate, dist + 1]);
        }
      }
    }
  }

  return 0;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`dict\`/early exit | O(1) membership checks; if \`endWord\` isn't even reachable in principle (not in the dictionary), bail immediately. |
| 8-9 | dequeue | Standard BFS pop, carrying the distance traveled so far alongside the word. |
| 12-19 | neighbor generation | For each of the \`L\` positions, try all 26 letters, forming a candidate word. A candidate that's in \`dict\` and unvisited is a genuine one-letter-transform neighbor — enqueue it at \`dist + 1\`. |
| 10 | goal check | Return the moment \`endWord\` is dequeued — BFS guarantees this is the shortest path since all edges have equal weight. |`,
        dryRunMarkdown: `**Dry run 1** — \`beginWord="hit", endWord="cog", wordList=["hot","dot","dog","lot","log","cog"]\`:
dict={hot,dot,dog,lot,log,cog}. queue=[(hit,1)]. Pop hit: generate all 1-letter changes of "hit" — only "hot" is in dict → visited={hit,hot}, queue=[(hot,2)].
Pop hot: changes include "dot" and "lot" (in dict) → queue=[(dot,3),(lot,3)], visited+={dot,lot}.
Pop dot: changes include "dog" (in dict, "cot" not in dict) → queue=[(lot,3),(dog,4)]. Pop lot: changes include "log" → queue=[(dog,4),(log,4)].
Pop dog: changes include "cog" → queue=[(log,4),(cog,5)]. Pop log: changes include "cog" but already visited → skip. Pop cog: word===endWord → return **5** — matches expected.

**Dry run 2** — \`beginWord="a", endWord="c", wordList=["a","b","c"]\`:
dict={a,b,c}. queue=[(a,1)]. Pop a: single-char substitutions of "a" include "b" and "c" (both length-1 words, all 26 letters tried at position 0) → both in dict → visited={a,b,c}, queue=[(b,2),(c,2)].
Pop b: word≠"c", generates "a"(visited),"c"(visited) → nothing new. Pop c: word===endWord → return **2** — matches expected.`,
      },
    ],
    relatedSlugs: ["number-of-islands", "course-schedule"],
    realWorldUsageMarkdown: `BFS with on-the-fly neighbor generation from an implicit graph is the same technique used in spell-checkers/autocorrect suggesting minimal-edit-distance words, and in genetic-sequence analysis finding the shortest chain of point mutations between two DNA/protein sequences within a known-valid sequence database.`,
  },
];

import type { Problem } from "../types";

export const advancedGraphProblems: Problem[] = [
  {
    slug: "reconstruct-itinerary",
    title: "Reconstruct Itinerary",
    difficulty: "hard",
    maangTags: ["Google", "Amazon"],
    topicSlug: "advanced-graphs",
    functionName: "findItinerary",
    description: `## Problem

Given a list of airline \`tickets\` (pairs \`[from, to]\`), reconstruct the itinerary starting from \`"JFK"\` that uses every ticket exactly once. If multiple valid itineraries exist, return the one with the smallest lexical order when read as a single string.

## Example

\`\`\`
Input: tickets = [["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]
Output: ["JFK","MUC","LHR","SFO","SJC"]
\`\`\`

## Constraints

- \`1 <= tickets.length <= 300\`
- All tickets form at least one valid itinerary starting at \`"JFK"\`.

## Senior interview angle

This is an Eulerian path problem in disguise — "use every edge exactly once" is the defining feature of an Eulerian path, not a simple shortest-path or reachability question. The naive fix (plain DFS greedily picking the lexically smallest unused destination) can dead-end with unused tickets remaining, so it needs backtracking to be correct at all. The interview signal is recognizing that Hierholzer's algorithm sidesteps backtracking entirely: DFS consuming edges until stuck, appending each node to the route in post-order, then reversing the whole route — it never needs to "undo" a choice, because the post-order-then-reverse construction guarantees a valid Eulerian path by itself.

## Pattern

\`Eulerian path via Hierholzer's algorithm\` — consume edges greedily by DFS, record nodes in post-order as dead ends are hit, then reverse the recorded order.`,
    starterCode: `/**
 * @param {string[][]} tickets
 * @return {string[]}
 */
function findItinerary(tickets) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            ["MUC", "LHR"],
            ["JFK", "MUC"],
            ["SFO", "SJC"],
            ["LHR", "SFO"],
          ],
        ],
        expected: ["JFK", "MUC", "LHR", "SFO", "SJC"],
      },
      {
        input: [
          [
            ["JFK", "SFO"],
            ["JFK", "ATL"],
            ["SFO", "ATL"],
            ["ATL", "JFK"],
            ["ATL", "SFO"],
          ],
        ],
        expected: ["JFK", "ATL", "JFK", "SFO", "ATL", "SFO"],
      },
      {
        input: [
          [
            ["JFK", "KUL"],
            ["JFK", "NRT"],
            ["NRT", "JFK"],
          ],
        ],
        expected: ["JFK", "NRT", "JFK", "KUL"],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Backtracking, Smallest Destination First)",
        timeComplexity: "O((E!)) worst case, where E is the number of tickets",
        spaceComplexity: "O(E)",
        overviewMarkdown:
          "Build an adjacency list from each airport to its sorted list of destinations. DFS from JFK, always trying the lexically smallest unused destination first; mark a destination used by nulling its slot instead of removing it, so it can be restored on backtrack. If a path uses all tickets, it's the answer, since destinations were always tried smallest-first. If a branch dead-ends before using every ticket, undo the last choice and try the next destination. Correct, but can backtrack through exponentially many partial itineraries before finding one that uses every ticket.",
        code: `function findItinerary(tickets) {
  const graph = new Map();
  for (const [from, to] of tickets) {
    if (!graph.has(from)) graph.set(from, []);
    graph.get(from).push(to);
  }
  for (const destinations of graph.values()) {
    destinations.sort();
  }

  const totalStops = tickets.length + 1;
  const itinerary = ["JFK"];

  function backtrack(current) {
    if (itinerary.length === totalStops) return true;

    const destinations = graph.get(current);
    if (!destinations) return false;

    for (let i = 0; i < destinations.length; i++) {
      const next = destinations[i];
      if (next === null) continue;

      destinations[i] = null;
      itinerary.push(next);

      if (backtrack(next)) return true;

      itinerary.pop();
      destinations[i] = next;
    }

    return false;
  }

  backtrack("JFK");
  return itinerary;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-8 | build \`graph\`, sort each destination list | Sorting up front means trying destinations in order always attempts the lexically smallest option first. |
| 15-16 | \`destinations[i] = null; itinerary.push(next);\` | Mark this ticket used and tentatively extend the itinerary. |
| 18 | \`if (backtrack(next)) return true;\` | Recurse; if this choice leads to a complete itinerary, propagate success up immediately. |
| 20-21 | \`itinerary.pop(); destinations[i] = next;\` | Undo the tentative choice if it didn't pan out, restoring the ticket for other branches. |`,
        dryRunMarkdown: `**Dry run 1 (tickets=[[MUC,LHR],[JFK,MUC],[SFO,SJC],[LHR,SFO]])**: graph: JFK→[MUC], MUC→[LHR], LHR→[SFO], SFO→[SJC]. Only one ticket available at every step, so the DFS walks straight through: JFK→MUC→LHR→SFO→SJC, using all 4 tickets on the first try (itinerary length 5 = tickets.length+1). Return **["JFK","MUC","LHR","SFO","SJC"]** — matches expected.

**Dry run 2 (tickets=[[JFK,KUL],[JFK,NRT],[NRT,JFK]])**: graph JFK→[KUL,NRT] (sorted), NRT→[JFK]. Try JFK→KUL first (smallest): itinerary=[JFK,KUL], but graph.get("KUL") is undefined → dead end, backtrack, restore KUL. Try JFK→NRT: itinerary=[JFK,NRT]. From NRT→JFK: itinerary=[JFK,NRT,JFK]. From JFK, KUL is still available (NRT is the one marked used on this path): itinerary=[JFK,NRT,JFK,KUL], length 4 = tickets.length(3)+1 → done. Return **["JFK","NRT","JFK","KUL"]** — matches expected.`,
      },
      {
        approach: "Optimal (Hierholzer's Algorithm)",
        timeComplexity: "O(E log E)",
        spaceComplexity: "O(E)",
        overviewMarkdown:
          "Build an adjacency list sorted in descending order per airport, so popping from the end of each list yields the lexically smallest unused destination. DFS from JFK, always popping (consuming) the next available destination; once an airport has no destinations left, append it to the route. This produces the route in reverse post-order, so reversing the final route gives the correct Eulerian path — with no backtracking needed at all, since consuming edges greedily and recording dead ends in post-order is guaranteed to reconstruct a valid Eulerian path.",
        code: `function findItinerary(tickets) {
  const graph = new Map();
  for (const [from, to] of tickets) {
    if (!graph.has(from)) graph.set(from, []);
    graph.get(from).push(to);
  }
  for (const destinations of graph.values()) {
    destinations.sort().reverse();
  }

  const route = [];

  function visit(airport) {
    const destinations = graph.get(airport);
    while (destinations && destinations.length > 0) {
      const next = destinations.pop();
      visit(next);
    }
    route.push(airport);
  }

  visit("JFK");
  return route.reverse();
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-8 | \`destinations.sort().reverse();\` | Descending order so \`.pop()\` (O(1), from the end) always yields the lexically smallest remaining destination. |
| 12-15 | \`while (destinations.length > 0) { const next = destinations.pop(); visit(next); }\` | Keep consuming edges out of the current airport, recursing into each destination before returning to try the next. |
| 16 | \`route.push(airport);\` | Record this airport only once it has no unconsumed destinations left — this is the post-order step. |
| 19 | \`return route.reverse();\` | The post-order-recorded route, reversed, is the correct Eulerian path. |`,
        dryRunMarkdown: `**Dry run 1 (tickets=[[MUC,LHR],[JFK,MUC],[SFO,SJC],[LHR,SFO]])**: Each airport has exactly one destination, so \`visit\` chains straight through: visit(JFK)→visit(MUC)→visit(LHR)→visit(SFO)→visit(SJC). SJC has no destinations, pushed first: route=[SJC]. Unwinding: route=[SJC,SFO,LHR,MUC,JFK]. Reversed: **["JFK","MUC","LHR","SFO","SJC"]** — matches expected.

**Dry run 2 (tickets=[[JFK,SFO],[JFK,ATL],[SFO,ATL],[ATL,JFK],[ATL,SFO]])**: graph JFK→[ATL,SFO] (desc order for pop-smallest-first: [SFO,ATL]), SFO→[ATL], ATL→[JFK,SFO] (desc: [SFO,JFK]). Consuming edges via smallest-first pops and recording post-order dead ends, then reversing, produces **["JFK","ATL","JFK","SFO","ATL","SFO"]** — matches expected.`,
      },
    ],
    relatedSlugs: ["cheapest-flights-within-k-stops", "alien-dictionary"],
    realWorldUsageMarkdown: `Hierholzer's algorithm for Eulerian paths is the standard technique behind DNA fragment reassembly (De Bruijn graph sequencing) and route-inspection ("Chinese Postman") problems, where every edge — every road segment or DNA read overlap — must be traversed or used exactly once.`,
  },
  {
    slug: "min-cost-to-connect-points",
    title: "Min Cost to Connect All Points",
    difficulty: "hard",
    maangTags: ["Amazon", "Google"],
    topicSlug: "advanced-graphs",
    functionName: "minCostConnectPoints",
    description: `## Problem

Given \`points\` on a 2D plane, connect all points such that there is exactly one path between any two points. The cost of connecting two points is their Manhattan distance. Return the minimum total cost to connect all points.

## Example

\`\`\`
Input: points = [[0,0],[2,2],[3,10],[5,2],[7,0]]
Output: 20
\`\`\`

## Constraints

- \`1 <= points.length <= 1000\`
- \`-10^6 <= xi, yi <= 10^6\`

## Senior interview angle

"Exactly one path between any two points" is the definition of a spanning tree, and "minimum total cost" makes this a Minimum Spanning Tree problem on a *complete* graph, since every pair of points has an implicit edge (their Manhattan distance). Kruskal's algorithm (sort all O(n²) edges, union-find greedily) works but pays an O(n² log n) sort over an edge set that's quadratic in size purely because the graph is dense. Prim's algorithm, grown one vertex at a time while tracking each unvisited point's current best distance to the tree, avoids materializing or sorting that edge list at all — for a dense graph like this one, that's the difference between needing O(n²) extra space for edges and needing only O(n).

## Pattern

\`Minimum Spanning Tree — Prim's algorithm\` — grow the tree one nearest point at a time, avoiding the need to enumerate and sort every pairwise edge up front.`,
    starterCode: `/**
 * @param {number[][]} points
 * @return {number}
 */
function minCostConnectPoints(points) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            [0, 0],
            [2, 2],
            [3, 10],
            [5, 2],
            [7, 0],
          ],
        ],
        expected: 20,
      },
      {
        input: [
          [
            [3, 12],
            [-2, 5],
            [-4, 1],
          ],
        ],
        expected: 18,
      },
      {
        input: [
          [
            [0, 0],
            [1, 1],
            [1, 0],
            [-1, 1],
          ],
        ],
        expected: 4,
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Kruskal's Algorithm, Sort All Edges)",
        timeComplexity: "O(n^2 log n)",
        spaceComplexity: "O(n^2)",
        overviewMarkdown:
          "Generate the Manhattan-distance edge between every pair of points, sort all of them ascending by cost, then use a union-find structure to greedily add the cheapest edge that connects two not-yet-connected components, stopping once n-1 edges have been added. Correct, but explicitly materializes and sorts an O(n^2)-size edge list, which is a lot of memory and sort time for a graph that's dense by construction.",
        code: `function minCostConnectPoints(points) {
  const n = points.length;
  const edges = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const cost = Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]);
      edges.push([cost, i, j]);
    }
  }
  edges.sort((a, b) => a[0] - b[0]);

  const parent = Array.from({ length: n }, (_, i) => i);
  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  let totalCost = 0;
  let edgesUsed = 0;

  for (const [cost, i, j] of edges) {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      parent[rootI] = rootJ;
      totalCost += cost;
      edgesUsed++;
      if (edgesUsed === n - 1) break;
    }
  }

  return totalCost;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4-9 | build \`edges\` for every pair \`(i, j)\` | Materializes all O(n^2) possible connections since the graph is complete. |
| 10 | \`edges.sort((a, b) => a[0] - b[0]);\` | Sort by cost ascending so the cheapest available edge is always considered next. |
| 12-18 | \`find(x)\` with path compression | Union-find lookup, used to detect whether two points are already connected. |
| 22-29 | greedily add the cheapest edge that connects two different components | Classic Kruskal's — stop once n-1 edges have joined all points into a single tree. |`,
        dryRunMarkdown: `**Dry run 1 (points=[[0,0],[2,2],[3,10],[5,2],[7,0]])**: Building and sorting all 10 pairwise edges, then greedily unioning the cheapest ones that connect new components (skipping any that would form a cycle) until 4 edges (n-1) have been added, accumulates a total cost of **20** — matches expected.

**Dry run 2 (points=[[0,0],[1,1],[1,0],[-1,1]])**: Pairwise costs include (0,0)-(1,0)=1, (1,0)-(1,1)=1, (1,1)-(-1,1)=2, among others. Kruskal's picks the three cheapest edges that connect all 4 points without a cycle: 1 + 1 + 2 = **4** — matches expected.`,
      },
      {
        approach: "Optimal (Prim's Algorithm, Array-Based)",
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Track each point's current minimum known distance to the growing tree, starting with point 0 in the tree and every other point at Infinity. Repeat n times: scan for the closest not-yet-included point, add it to the tree (accumulating its cost), then relax the distances of all remaining points using the newly added point. Because the graph is complete, this array-scan version of Prim's needs no heap and runs in O(n^2) — asymptotically better than Kruskal's O(n^2 log n) sort, and without ever building an explicit edge list.",
        code: `function minCostConnectPoints(points) {
  const n = points.length;
  const inMST = new Array(n).fill(false);
  const minDist = new Array(n).fill(Infinity);
  minDist[0] = 0;
  let totalCost = 0;

  for (let count = 0; count < n; count++) {
    let u = -1;
    for (let v = 0; v < n; v++) {
      if (!inMST[v] && (u === -1 || minDist[v] < minDist[u])) {
        u = v;
      }
    }

    inMST[u] = true;
    totalCost += minDist[u];

    for (let v = 0; v < n; v++) {
      if (!inMST[v]) {
        const cost = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]);
        if (cost < minDist[v]) {
          minDist[v] = cost;
        }
      }
    }
  }

  return totalCost;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-5 | \`inMST\`, \`minDist\` init, \`minDist[0] = 0\` | Start the tree at point 0 with distance 0; every other point starts unreachable. |
| 9-13 | scan for the closest \`u\` not yet in the tree | No heap needed — a dense graph makes an O(n) linear scan per iteration asymptotically fine. |
| 15-16 | \`inMST[u] = true; totalCost += minDist[u];\` | Commit the closest point to the tree and add its connection cost. |
| 18-23 | relax \`minDist[v]\` using the newly added point \`u\` | After adding u, some other point's cheapest known connection to the tree may now be through u. |`,
        dryRunMarkdown: `**Dry run 1 (points=[[0,0],[2,2],[3,10],[5,2],[7,0]])**: Start tree={0}, minDist=[0,4,13,7,7]. Pick point1 (dist4, cheapest). totalCost=4. Relax: minDist updates using point1's distances. Continue picking the next-cheapest unconnected point each round; after all 5 points are added the accumulated totalCost is **20** — matches expected.

**Dry run 2 (points=[[3,12],[-2,5],[-4,1]])**: minDist init from point0: dist to point1=|3-(-2)|+|12-5|=5+7=12, dist to point2=|3-(-4)|+|12-1|=7+11=18. Pick point1 (12). totalCost=12. Relax using point1: dist point0→point2 direct was 18, via point1: |-2-(-4)|+|5-1|=2+4=6, cheaper, so minDist[2]=6. Pick point2 (6). totalCost=12+6=**18** — matches expected.`,
      },
    ],
    relatedSlugs: ["network-delay-time", "swim-in-rising-water"],
    realWorldUsageMarkdown: `Minimum spanning tree algorithms (Prim's and Kruskal's) are the backbone of network design problems — laying minimum-cost cable/pipe/road networks that connect every location — and are used inside clustering algorithms (single-linkage clustering builds an MST and cuts its most expensive edges).`,
  },
  {
    slug: "network-delay-time",
    title: "Network Delay Time",
    difficulty: "medium",
    maangTags: ["Google", "Meta", "Amazon"],
    topicSlug: "advanced-graphs",
    functionName: "networkDelayTime",
    description: `## Problem

There are \`n\` network nodes labeled \`1\` to \`n\`. Given \`times[i] = [ui, vi, wi]\`, a directed edge from \`ui\` to \`vi\` with travel time \`wi\`, and a starting node \`k\`, return the minimum time for a signal sent from \`k\` to reach all \`n\` nodes. If it's impossible, return \`-1\`.

## Example

\`\`\`
Input: times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2
Output: 2
\`\`\`

## Constraints

- \`1 <= k <= n <= 100\`
- \`1 <= times.length <= 6000\`
- \`0 <= wi <= 100\`

## Senior interview angle

This is the textbook single-source shortest path problem, and the interview signal is picking the algorithm that matches the edge-weight guarantee: since all travel times are non-negative, Dijkstra's greedy nearest-node expansion is valid and strictly faster than Bellman-Ford's blind full-edge-relaxation. Bellman-Ford (relax every edge, n-1 times) works regardless of weight sign, which is exactly why it's the fallback and not the first choice here — using it when Dijkstra applies signals not recognizing which algorithm's precondition (non-negative weights) is actually satisfied.

## Pattern

\`Single-source shortest path — Dijkstra's algorithm\` — greedily finalize the nearest unvisited node's distance each round, exploiting non-negative edge weights for correctness.`,
    starterCode: `/**
 * @param {number[][]} times
 * @param {number} n
 * @param {number} k
 * @return {number}
 */
function networkDelayTime(times, n, k) {
  // Your code here
}`,
    testCases: [
      { input: [[[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2], expected: 2 },
      { input: [[[1, 2, 1]], 2, 1], expected: 1 },
      { input: [[[1, 2, 1]], 2, 2], expected: -1 },
    ],
    solutions: [
      {
        approach: "Brute Force (Bellman-Ford, Relax All Edges Repeatedly)",
        timeComplexity: "O(V * E)",
        spaceComplexity: "O(V)",
        overviewMarkdown:
          "Initialize distance to the source as 0 and all other nodes as Infinity. Relax every edge in the graph, up to n-1 times total (the longest possible shortest path in a graph with n nodes has at most n-1 edges). After all rounds, the farthest finalized distance among all nodes is the answer, or -1 if any node is still unreachable. Correct for any edge weights (including negative, though not needed here), but does needless repeated full-edge-list passes compared to Dijkstra's greedy approach, which exploits the non-negative-weight guarantee.",
        code: `function networkDelayTime(times, n, k) {
  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;

  for (let i = 0; i < n - 1; i++) {
    for (const [u, v, w] of times) {
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
      }
    }
  }

  let maxDist = 0;
  for (let node = 1; node <= n; node++) {
    if (dist[node] === Infinity) return -1;
    maxDist = Math.max(maxDist, dist[node]);
  }

  return maxDist;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`dist\` init, \`dist[k] = 0\` | Only the source starts reachable, at distance 0. |
| 5-9 | relax every edge, \`n - 1\` times | Repeating n-1 times guarantees every shortest path (which has at most n-1 edges) has been fully propagated. |
| 12-16 | find the max finalized distance, or -1 if any node unreachable | The signal reaches "all nodes" only when the slowest of them has received it. |`,
        dryRunMarkdown: `**Dry run 1 (times=[[2,1,1],[2,3,1],[3,4,1]], n=4, k=2)**: dist=[_,Inf,0,Inf,Inf] (index k=2 is 0). Round 1: edge(2,1,1): dist[1]=1. edge(2,3,1): dist[3]=1. edge(3,4,1): dist[4]=dist[3]+1=2. Round 2 (n-1=3 total rounds): no further improvements. Final dist for nodes1-4: [1,0,1,2]. Max=**2** — matches expected.

**Dry run 2 (times=[[1,2,1]], n=2, k=1)**: dist=[_,0,Inf]. Round: edge(1,2,1): dist[2]=1. Final dist nodes1-2: [0,1]. Max=**1** — matches expected.

**Dry run 3 (times=[[1,2,1]], n=2, k=2)**: dist=[_,Inf,0]. No edge starts from node2, so dist[1] stays Infinity. Return **-1** — matches expected.`,
      },
      {
        approach: "Optimal (Dijkstra's Algorithm, Array-Based)",
        timeComplexity: "O(V^2 + E)",
        spaceComplexity: "O(V + E)",
        overviewMarkdown:
          "Build an adjacency list, then repeatedly select the unvisited node with the smallest known distance (a linear scan, since no heap is needed for this node count), mark it visited, and relax its outgoing edges. Because edge weights are non-negative, once a node is selected as the closest unvisited node, its distance is guaranteed final — this greedy property is what lets Dijkstra skip the repeated full-edge-list passes Bellman-Ford needs.",
        code: `function networkDelayTime(times, n, k) {
  const graph = new Map();
  for (const [u, v, w] of times) {
    if (!graph.has(u)) graph.set(u, []);
    graph.get(u).push([v, w]);
  }

  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;
  const visited = new Array(n + 1).fill(false);

  for (let count = 0; count < n; count++) {
    let u = -1;
    for (let node = 1; node <= n; node++) {
      if (!visited[node] && (u === -1 || dist[node] < dist[u])) {
        u = node;
      }
    }

    if (u === -1 || dist[u] === Infinity) break;
    visited[u] = true;

    for (const [v, w] of graph.get(u) ?? []) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
      }
    }
  }

  let maxDist = 0;
  for (let node = 1; node <= n; node++) {
    if (dist[node] === Infinity) return -1;
    maxDist = Math.max(maxDist, dist[node]);
  }

  return maxDist;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-5 | build adjacency list \`graph\` | Lets outgoing edges of a node be found in O(degree) instead of scanning all edges. |
| 11-15 | scan for the closest unvisited node \`u\` | Greedy step — the closest unvisited node's distance is now guaranteed final. |
| 17-18 | \`if (u === -1 \|\| dist[u] === Infinity) break;\` | Stop early once no more nodes are reachable, rather than looping needlessly. |
| 21-23 | relax \`u\`'s outgoing edges | Only relax from a node once its own shortest distance is finalized. |`,
        dryRunMarkdown: `**Dry run 1 (times=[[2,1,1],[2,3,1],[3,4,1]], n=4, k=2)**: dist=[_,Inf,0,Inf,Inf]. Pick node2 (dist0, smallest). Relax: dist[1]=1, dist[3]=1. Pick node1 or node3 (both dist1) — say node1: no outgoing edges. Pick node3 (dist1): relax dist[4]=2. Pick node4 (dist2): no outgoing edges. Final dist nodes1-4: [1,0,1,2]. Max=**2** — matches expected.

**Dry run 2 (times=[[1,2,1]], n=2, k=2)**: dist=[_,Inf,0]. Pick node2 (dist0): no outgoing edges from node2. Pick node1: dist[1] still Infinity → loop breaks early. dist[1]=Infinity → return **-1** — matches expected.`,
      },
    ],
    relatedSlugs: ["min-cost-to-connect-points", "cheapest-flights-within-k-stops"],
    realWorldUsageMarkdown: `Dijkstra's algorithm is the routing engine behind GPS navigation (fastest/shortest route) and network routing protocols like OSPF, both of which are single-source shortest-path problems over non-negative edge weights (travel time, link cost) — exactly this problem's shape.`,
  },
  {
    slug: "swim-in-rising-water",
    title: "Swim in Rising Water",
    difficulty: "hard",
    maangTags: ["Google", "Amazon"],
    topicSlug: "advanced-graphs",
    functionName: "swimInWater",
    description: `## Problem

Given an \`n x n\` grid where \`grid[r][c]\` is the elevation at that cell, you start at the top-left at time \`0\`. At time \`t\`, you may move to an adjacent cell if and only if the elevation of both cells is at most \`t\` (water has risen to level \`t\` everywhere simultaneously). Return the minimum time at which you can reach the bottom-right cell.

## Example

\`\`\`
Input: grid = [[0,2],[1,3]]
Output: 3
\`\`\`

## Constraints

- \`n == grid.length == grid[i].length\`
- \`1 <= n <= 50\`
- \`0 <= grid[i][j] < n^2\`

## Senior interview angle

The quantity being minimized isn't a path's total cost — it's the *maximum single elevation* encountered along the path (a "minimax" path), which is a different objective from standard shortest-path, even though the general graph-search shape is identical. Binary search over the candidate answer, checking reachability with BFS/DFS at each guess, works because "can I reach the end using only cells ≤ t" is monotonic in t. The tighter observation is that a Dijkstra-style greedy expansion — always advancing into whichever frontier cell has the smallest *bottleneck* (the max elevation along the best path found to it so far) — computes the exact minimax distance to every cell in a single pass, without needing to guess-and-check at all.

## Pattern

\`Minimax path via Dijkstra-style expansion\` — track the minimum possible "worst elevation so far" to reach each cell, expanding the frontier's current cheapest-bottleneck cell each step.`,
    starterCode: `/**
 * @param {number[][]} grid
 * @return {number}
 */
function swimInWater(grid) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            [0, 2],
            [1, 3],
          ],
        ],
        expected: 3,
      },
      {
        input: [
          [
            [0, 1, 2, 3, 4],
            [24, 23, 22, 21, 5],
            [12, 13, 14, 15, 16],
            [11, 17, 18, 19, 20],
            [10, 9, 8, 7, 6],
          ],
        ],
        expected: 16,
      },
      { input: [[[0]]], expected: 0 },
    ],
    solutions: [
      {
        approach: "Brute Force (Binary Search on Answer + BFS Reachability)",
        timeComplexity: "O(n^2 log(n^2))",
        spaceComplexity: "O(n^2)",
        overviewMarkdown:
          "Binary search over candidate times t, from the grid's minimum to maximum elevation. For each candidate t, run a BFS from the top-left using only cells with elevation at most t, and check whether the bottom-right cell is reached. Since reachability is monotonic in t (anything reachable at time t is still reachable at any t' > t), binary search converges on the smallest valid t. Correct, but re-runs a full BFS from scratch for every candidate value tried.",
        code: `function swimInWater(grid) {
  const n = grid.length;
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  function canReach(t) {
    if (grid[0][0] > t) return false;
    const visited = Array.from({ length: n }, () => new Array(n).fill(false));
    const queue = [[0, 0]];
    visited[0][0] = true;

    while (queue.length > 0) {
      const [row, col] = queue.shift();
      if (row === n - 1 && col === n - 1) return true;

      for (const [dr, dc] of directions) {
        const nr = row + dr;
        const nc = col + dc;
        if (
          nr >= 0 &&
          nr < n &&
          nc >= 0 &&
          nc < n &&
          !visited[nr][nc] &&
          grid[nr][nc] <= t
        ) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }

    return false;
  }

  let maxElevation = 0;
  for (const row of grid) {
    for (const value of row) {
      maxElevation = Math.max(maxElevation, value);
    }
  }

  let low = 0;
  let high = maxElevation;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (canReach(mid)) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  return low;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-32 | \`canReach(t)\` | BFS from the top-left using only cells with elevation \`<= t\`, returning whether the bottom-right is reachable. |
| 41-49 | binary search \`low\`/\`high\` over candidate times | Reachability is monotonic in t, so binary search finds the minimum valid t in O(log(max elevation)) checks. |`,
        dryRunMarkdown: `**Dry run 1 (grid=[[0,2],[1,3]])**: maxElevation=3. Binary search: mid=1: canReach(1)? From (0,0)=0, neighbors (0,1)=2>1 blocked, (1,0)=1<=1 reachable, from (1,0) neighbor (1,1)=3>1 blocked. Can't reach (1,1) → false → low=2. mid=2: from (0,0), (1,0)=1 ok, (0,1)=2 ok, from either, (1,1)=3>2 blocked → false → low=3. low===high=3 → return **3** — matches expected.

**Dry run 2 (grid=[[0]])**: n=1, maxElevation=0, low=high=0 immediately (loop doesn't run since low<high is false). Return **0** — matches expected.`,
      },
      {
        approach: "Optimal (Dijkstra-Style Minimax Expansion)",
        timeComplexity: "O(n^4) with array-scan selection (O(n^2 log(n^2)) with a heap)",
        spaceComplexity: "O(n^2)",
        overviewMarkdown:
          "Track, for every cell, the minimum possible value of \"the largest elevation seen so far along the best path to it\" — starting at grid[0][0] for the start cell and Infinity elsewhere. Repeatedly pick the unvisited cell with the smallest such bottleneck value, mark it visited, and relax its neighbors: a neighbor's candidate bottleneck is the max of the current cell's bottleneck and the neighbor's own elevation. This computes the exact minimax path to every cell in one pass, with no guess-and-check binary search needed.",
        code: `function swimInWater(grid) {
  const n = grid.length;
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  const effort = Array.from({ length: n }, () => new Array(n).fill(Infinity));
  effort[0][0] = grid[0][0];
  const visited = Array.from({ length: n }, () => new Array(n).fill(false));

  for (let count = 0; count < n * n; count++) {
    let ur = -1;
    let uc = -1;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (!visited[r][c] && (ur === -1 || effort[r][c] < effort[ur][uc])) {
          ur = r;
          uc = c;
        }
      }
    }

    if (ur === n - 1 && uc === n - 1) return effort[ur][uc];
    visited[ur][uc] = true;

    for (const [dr, dc] of directions) {
      const nr = ur + dr;
      const nc = uc + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && !visited[nr][nc]) {
        const candidate = Math.max(effort[ur][uc], grid[nr][nc]);
        if (candidate < effort[nr][nc]) {
          effort[nr][nc] = candidate;
        }
      }
    }
  }

  return effort[n - 1][n - 1];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4-6 | \`effort\` init, \`effort[0][0] = grid[0][0]\` | The bottleneck to reach the start is just its own elevation. |
| 9-16 | scan for the unvisited cell with smallest \`effort\` | Greedy step — this cell's minimax value is now finalized. |
| 18 | \`if (ur === n - 1 && uc === n - 1) return effort[ur][uc];\` | Return as soon as the destination is finalized, no need to process the rest of the grid. |
| 22-28 | relax neighbors with \`Math.max(effort[ur][uc], grid[nr][nc])\` | A neighbor's bottleneck is the worse of the path so far and the neighbor's own elevation — not a sum. |`,
        dryRunMarkdown: `**Dry run 1 (grid=[[0,2],[1,3]])**: effort=[[0,Inf],[Inf,Inf]]. Pick (0,0)=0. Relax: (0,1) candidate=max(0,2)=2; (1,0) candidate=max(0,1)=1. effort=[[0,2],[1,Inf]]. Pick (1,0)=1 (smallest unvisited). Relax (1,1): candidate=max(1,3)=3 < Inf → effort[1][1]=3. Pick (0,1)=2 (next smallest unvisited): relax (1,1): candidate=max(2,3)=3, not < current 3, no change. Pick (1,1)=3 — it's the destination → return **3** — matches expected.

**Dry run 2 (grid=[[0]])**: n=1. effort=[[0]]. First (and only) iteration picks (0,0), which is already the destination (n-1,n-1)=(0,0) → return **0** — matches expected.`,
      },
    ],
    relatedSlugs: ["min-cost-to-connect-points", "path-with-minimum-effort"],
    realWorldUsageMarkdown: `Minimax-path search (minimizing the worst single step rather than the total cost) is the same technique used in network reliability routing, where you route traffic to minimize the weakest/most congested link on the path, not the sum of all link costs.`,
  },
  {
    slug: "alien-dictionary",
    title: "Alien Dictionary",
    difficulty: "hard",
    maangTags: ["Google", "Meta", "Amazon"],
    topicSlug: "advanced-graphs",
    functionName: "alienOrder",
    description: `## Problem

There is a new alien language that uses the English alphabet, but the order among the letters is unknown. You are given a list of \`words\` from the alien dictionary, sorted lexicographically by the rules of this new language. Derive the order of letters, returning it as a string. If no valid order exists, or the ordering is invalid (e.g., a longer word appears before its own prefix), return an empty string.

## Example

\`\`\`
Input: words = ["wrt","wrf","er","ett","rftt"]
Output: "wertf"
\`\`\`

## Constraints

- \`1 <= words.length <= 100\`
- Words consist of lowercase English letters.

## Senior interview angle

The core move is turning a list of *sorted strings* into a directed graph: for each pair of adjacent words, the first position where they differ tells you one letter comes before another — everything after that differing position is irrelevant and must not be compared. Only comparing **adjacent** words (not every pair) is enough, because sortedness is transitive: if word[i] < word[i+1] < word[i+2] letter-wise, the ordering constraint between word[i] and word[i+2] is already implied and doesn't need to be independently derived. Once the constraint graph is built, this is topological sort (Kahn's algorithm) with one extra correctness trap: detecting a cycle (invalid ordering) *and* detecting the invalid-prefix case (a longer word appearing before a shorter word that is its own prefix), which a plain topological sort alone won't catch.

## Pattern

\`Build order constraints, then topological sort\` — derive edges only from each pair of adjacent sorted words (sufficient by transitivity), then Kahn's algorithm detects both cycles and a missing valid order.`,
    starterCode: `/**
 * @param {string[]} words
 * @return {string}
 */
function alienOrder(words) {
  // Your code here
}`,
    testCases: [
      { input: [["wrt", "wrf", "er", "ett", "rftt"]], expected: "wertf" },
      { input: [["z", "x"]], expected: "zx" },
      { input: [["z", "x", "z"]], expected: "" },
    ],
    solutions: [
      {
        approach: "Brute Force (Compare Every Pair of Words)",
        timeComplexity: "O(n^2 * L) to build constraints, plus O(V + E) for topological sort",
        spaceComplexity: "O(V + E)",
        overviewMarkdown:
          "For every pair of words (i, j) with i < j — not just adjacent ones — find their first differing letter and record an ordering edge between those two letters. Then run Kahn's algorithm (repeatedly removing letters with no remaining unresolved predecessors) to produce a valid order, or detect that no valid order exists. Correct, since comparing more pairs than strictly necessary only adds ordering constraints that were already implied by adjacency and transitivity, but it does O(n^2) word-pair comparisons when only n-1 of them (the adjacent ones) are actually required.",
        code: `function alienOrder(words) {
  const graph = new Map();
  const indegree = new Map();

  for (const word of words) {
    for (const ch of word) {
      if (!graph.has(ch)) {
        graph.set(ch, new Set());
        indegree.set(ch, 0);
      }
    }
  }

  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      const w1 = words[i];
      const w2 = words[j];
      const minLen = Math.min(w1.length, w2.length);
      let found = false;

      for (let k = 0; k < minLen; k++) {
        if (w1[k] !== w2[k]) {
          if (!graph.get(w1[k]).has(w2[k])) {
            graph.get(w1[k]).add(w2[k]);
            indegree.set(w2[k], indegree.get(w2[k]) + 1);
          }
          found = true;
          break;
        }
      }

      if (!found && w1.length > w2.length) {
        return "";
      }
    }
  }

  const queue = [];
  for (const [ch, deg] of indegree) {
    if (deg === 0) queue.push(ch);
  }

  const order = [];
  while (queue.length > 0) {
    const ch = queue.shift();
    order.push(ch);
    for (const next of graph.get(ch)) {
      indegree.set(next, indegree.get(next) - 1);
      if (indegree.get(next) === 0) queue.push(next);
    }
  }

  return order.length === indegree.size ? order.join("") : "";
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 14-33 | double loop over every pair \`(i, j)\`, \`i < j\` | Compares every pair of words, not just adjacent ones, deriving the same or additional (redundant) edges. |
| 22-25 | \`if (!graph.get(w1[k]).has(w2[k])) { ...add edge...; indegree++ }\` | A \`Set\` for each node's outgoing edges avoids double-counting the same edge into indegree. |
| 29-31 | \`if (!found && w1.length > w2.length) return "";\` | Catches the invalid case where a longer word is claimed to come before its own prefix. |
| 42-49 | Kahn's algorithm: repeatedly dequeue a zero-indegree letter | Standard topological sort — produces a valid order if one exists. |
| 51 | \`order.length === indegree.size ? ... : ""\` | If not every letter was dequeued, the constraint graph had a cycle — no valid order exists. |`,
        dryRunMarkdown: `**Dry run 1 (words=["wrt","wrf","er","ett","rftt"])**: Comparing every pair (not just adjacent) derives edges t→f, w→e, r→t, e→r, plus the redundant-but-consistent w→r (from comparing "wrt" and "rftt" directly). Kahn's algorithm still produces the unique valid order **"wertf"** — matches expected, since the extra edge doesn't create a cycle.

**Dry run 2 (words=["z","x","z"])**: Comparing (z,x): edge z→x. Comparing (x,z) [words[1] vs words[2]]: edge x→z. Comparing (z,z) [words[0] vs words[2]]: identical, no edge, and w1.length === w2.length so no invalid-prefix return. Both z and x now have indegree 1 (from each other) — a 2-node cycle. Kahn's queue starts empty, order stays empty, order.length(0) !== indegree.size(2) → return **""** — matches expected.`,
      },
      {
        approach: "Optimal (Compare Only Adjacent Words)",
        timeComplexity: "O(n * L) to build constraints, plus O(V + E) for topological sort",
        spaceComplexity: "O(V + E)",
        overviewMarkdown:
          "Only compare each word to the very next word in the list. Sortedness is transitive, so any ordering constraint between two non-adjacent words is already implied by the chain of adjacent constraints between them — comparing them directly would only ever rediscover information already captured. Build the same letter-ordering graph from just these n-1 comparisons, then run the identical Kahn's-algorithm topological sort. This does asymptotically less constraint-building work for the same correct result.",
        code: `function alienOrder(words) {
  const graph = new Map();
  const indegree = new Map();

  for (const word of words) {
    for (const ch of word) {
      if (!graph.has(ch)) {
        graph.set(ch, new Set());
        indegree.set(ch, 0);
      }
    }
  }

  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];
    const minLen = Math.min(w1.length, w2.length);
    let found = false;

    for (let k = 0; k < minLen; k++) {
      if (w1[k] !== w2[k]) {
        if (!graph.get(w1[k]).has(w2[k])) {
          graph.get(w1[k]).add(w2[k]);
          indegree.set(w2[k], indegree.get(w2[k]) + 1);
        }
        found = true;
        break;
      }
    }

    if (!found && w1.length > w2.length) {
      return "";
    }
  }

  const queue = [];
  for (const [ch, deg] of indegree) {
    if (deg === 0) queue.push(ch);
  }

  const order = [];
  while (queue.length > 0) {
    const ch = queue.shift();
    order.push(ch);
    for (const next of graph.get(ch)) {
      indegree.set(next, indegree.get(next) - 1);
      if (indegree.get(next) === 0) queue.push(next);
    }
  }

  return order.length === indegree.size ? order.join("") : "";
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 12-31 | loop over only adjacent pairs \`words[i]\`, \`words[i+1]\` | n-1 comparisons instead of n(n-1)/2 — relies on transitivity of the sorted order to justify skipping non-adjacent pairs. |
| 20-23 | same \`Set\`-guarded edge insertion | Identical constraint-recording logic to the brute-force version, just invoked on fewer pairs. |
| 25-27 | invalid-prefix check | Still needed: a longer word directly preceding its own prefix is a local (adjacent) violation and is always caught here. |
| 36-49 | identical Kahn's-algorithm topological sort | The graph-construction step got cheaper; the sorting step is unchanged. |`,
        dryRunMarkdown: `**Dry run 1 (words=["wrt","wrf","er","ett","rftt"])**: Adjacent comparisons only: (wrt,wrf)→t before f; (wrf,er)→w before e; (er,ett)→r before t; (ett,rftt)→e before r. Edges: t→f, w→e, r→t, e→r — a single chain w→e→r→t→f. Kahn's dequeues w, then e, then r, then t, then f. Return **"wertf"** — matches expected.

**Dry run 2 (words=["z","x"]))**: Only one adjacent pair: (z,x) → z before x, edge z→x. indegree: z=0, x=1. Kahn's dequeues z, then x. Return **"zx"** — matches expected.`,
      },
    ],
    relatedSlugs: ["reconstruct-itinerary", "cheapest-flights-within-k-stops"],
    realWorldUsageMarkdown: `Topological sort over pairwise-derived ordering constraints is exactly how build systems (Make, Bazel) sequence compilation steps, and how package managers resolve installation order from a set of "depends-on" constraints between packages.`,
  },
  {
    slug: "cheapest-flights-within-k-stops",
    title: "Cheapest Flights Within K Stops",
    difficulty: "medium",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "advanced-graphs",
    functionName: "findCheapestPrice",
    description: `## Problem

There are \`n\` cities connected by \`flights[i] = [from, to, price]\`. Given \`src\`, \`dst\`, and \`k\`, return the cheapest price to travel from \`src\` to \`dst\` with at most \`k\` stops (i.e., at most \`k + 1\` flights). Return \`-1\` if no such route exists.

## Example

\`\`\`
Input: n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1
Output: 700
\`\`\`

## Constraints

- \`1 <= n <= 100\`
- \`0 <= flights.length <= (n * (n - 1) / 2)\`
- \`0 <= k <= n - 1\`

## Senior interview angle

Plain Dijkstra doesn't directly apply here, because the real constraint isn't just "shortest path" — it's "shortest path using at most k+1 edges," and a cheaper path that uses too many stops isn't a valid answer. This is exactly what Bellman-Ford naturally models: each of its relaxation rounds corresponds to allowing one more edge in the path, so running only k+1 rounds (rather than the usual n-1) directly enforces the stop limit as a side effect of the algorithm's structure. The subtle implementation detail is relaxing from a *snapshot* of the previous round's distances, not the array being updated in place — using in-place updates would let a single round silently chain multiple edges together, violating the stops-per-round guarantee.

## Pattern

\`Bellman-Ford, capped at k+1 rounds\` — each relaxation round allows exactly one more edge, so limiting the round count directly enforces a max-stops constraint; relax from a snapshot to prevent a round from chaining multiple edges.`,
    starterCode: `/**
 * @param {number} n
 * @param {number[][]} flights
 * @param {number} src
 * @param {number} dst
 * @param {number} k
 * @return {number}
 */
function findCheapestPrice(n, flights, src, dst, k) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          4,
          [
            [0, 1, 100],
            [1, 2, 100],
            [2, 0, 100],
            [1, 3, 600],
            [2, 3, 200],
          ],
          0,
          3,
          1,
        ],
        expected: 700,
      },
      {
        input: [
          3,
          [
            [0, 1, 100],
            [1, 2, 100],
            [0, 2, 500],
          ],
          0,
          2,
          1,
        ],
        expected: 200,
      },
      {
        input: [
          3,
          [
            [0, 1, 100],
            [1, 2, 100],
            [0, 2, 500],
          ],
          0,
          2,
          0,
        ],
        expected: 500,
      },
    ],
    solutions: [
      {
        approach: "Brute Force (DFS with Global Minimum Pruning)",
        timeComplexity: "O(E^k) worst case",
        spaceComplexity: "O(V + E)",
        overviewMarkdown:
          "Recursively explore every possible route from src, tracking the number of stops remaining and the cost accumulated so far, and updating a global minimum whenever dst is reached. Prune a branch as soon as its accumulated cost already meets or exceeds the best known full-route cost. Correct, but the number of distinct routes can grow exponentially with the number of allowed stops, since the same nodes can be revisited along different paths within the stop budget.",
        code: `function findCheapestPrice(n, flights, src, dst, k) {
  const graph = new Map();
  for (const [from, to, price] of flights) {
    if (!graph.has(from)) graph.set(from, []);
    graph.get(from).push([to, price]);
  }

  let minCost = Infinity;

  function dfs(node, stopsLeft, costSoFar) {
    if (costSoFar >= minCost) return;
    if (node === dst) {
      minCost = costSoFar;
      return;
    }
    if (stopsLeft < 0) return;

    for (const [next, price] of graph.get(node) ?? []) {
      dfs(next, stopsLeft - 1, costSoFar + price);
    }
  }

  dfs(src, k, 0);
  return minCost === Infinity ? -1 : minCost;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 9 | \`if (costSoFar >= minCost) return;\` | Prune any branch that can no longer possibly beat the best full route found so far. |
| 10-13 | \`if (node === dst) { minCost = costSoFar; return; }\` | Reaching the destination updates the running best answer (thanks to the pruning above, this is always an improvement). |
| 14 | \`if (stopsLeft < 0) return;\` | Stop exploring once the flight-count budget (k+1 flights, tracked as stops remaining) is exhausted. |
| 16-18 | recurse into every outgoing flight | Explores every route within budget — exponential in the worst case since nodes can be revisited. |`,
        dryRunMarkdown: `**Dry run 1 (n=4, flights=[[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src=0, dst=3, k=1)**: dfs(0,1,0)→dfs(1,0,100)→[dfs(2,-1,200) pruned by stopsLeft<0; dfs(3,-1,700)→node===dst, minCost=700]. Also dfs(0,1,0) has no other direct edge from 0 besides to 1. Final minCost=**700** — matches expected.

**Dry run 2 (n=3, flights=[[0,1,100],[1,2,100],[0,2,500]], src=0, dst=2, k=1)**: dfs(0,1,0)→ branch A: dfs(1,0,100)→dfs(2,-1,200): reaches dst with cost200, minCost=200. Branch B: dfs(2,0,500): cost500 >= minCost(200) already set from branch A order... trying both orders, the cheaper route (100+100=200) is found and kept as minCost=**200** — matches expected.`,
      },
      {
        approach: "Optimal (Bellman-Ford, Capped at k+1 Rounds)",
        timeComplexity: "O(k * E)",
        spaceComplexity: "O(V)",
        overviewMarkdown:
          "Initialize distance to src as 0 and all others as Infinity. For k+1 rounds, relax every flight edge using a snapshot of the *previous* round's distances (not the array currently being updated) — this ensures each round adds exactly one flight's worth of progress, directly modeling the at-most-(k+1)-flights constraint. After k+1 rounds, dst's distance is the answer, or -1 if still unreachable.",
        code: `function findCheapestPrice(n, flights, src, dst, k) {
  let dist = new Array(n).fill(Infinity);
  dist[src] = 0;

  for (let round = 0; round <= k; round++) {
    const prevDist = [...dist];
    for (const [from, to, price] of flights) {
      if (prevDist[from] !== Infinity && prevDist[from] + price < dist[to]) {
        dist[to] = prevDist[from] + price;
      }
    }
  }

  return dist[dst] === Infinity ? -1 : dist[dst];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`dist\` init, \`dist[src] = 0\` | Only the source starts reachable, with zero cost. |
| 5 | \`for (let round = 0; round <= k; round++)\` | Exactly k+1 rounds — each round permits exactly one more flight, directly enforcing the stop limit. |
| 6 | \`const prevDist = [...dist];\` | Snapshot before this round's relaxations, so a single round can't chain two flights together (which would silently exceed the stop budget). |
| 8-10 | relax using \`prevDist[from]\`, write into \`dist[to]\` | Reading from the previous round's distances and writing into the current round's array is what keeps rounds from bleeding into each other. |`,
        dryRunMarkdown: `**Dry run 1 (n=4, flights=[[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src=0, dst=3, k=1)**: dist=[0,Inf,Inf,Inf]. Round0: prevDist=[0,Inf,Inf,Inf]. Edge(0,1,100): dist[1]=100. Others use Infinity prevDist, no change. dist=[0,100,Inf,Inf]. Round1: prevDist=[0,100,Inf,Inf]. Edge(1,2,100): dist[2]=100+100=200. Edge(1,3,600): dist[3]=100+600=700. dist=[0,100,200,700]. dst=3 → **700** — matches expected.

**Dry run 2 (n=3, flights=[[0,1,100],[1,2,100],[0,2,500]], src=0, dst=2, k=0)**: Only round0 runs (k=0, loop \`round<=0\`). prevDist=[0,Inf,Inf]. Edge(0,1,100): dist[1]=100. Edge(1,2,100): prevDist[1]=Inf (snapshot from before this round) → skipped. Edge(0,2,500): dist[2]=500. dst=2 → **500** — matches expected (only the direct, single-flight route counts when k=0).`,
      },
    ],
    relatedSlugs: ["network-delay-time", "reconstruct-itinerary"],
    realWorldUsageMarkdown: `Bounded-hop-count shortest paths are exactly how flight-search engines apply a "max layovers" filter, and the capped-rounds Bellman-Ford technique generalizes to any resource-constrained routing problem — e.g., cheapest route using at most k toll roads, or fewest expensive links.`,
  },
  {
    slug: "path-with-minimum-effort",
    title: "Path With Minimum Effort",
    difficulty: "medium",
    maangTags: ["Google", "Amazon"],
    topicSlug: "advanced-graphs",
    functionName: "minimumEffortPath",
    description: `## Problem

Given a 2D \`heights\` grid, you start at the top-left and want to reach the bottom-right. The "effort" of a route is the maximum absolute difference in heights between two consecutive cells along that route. Return the minimum possible effort over all routes.

## Example

\`\`\`
Input: heights = [[1,2,2],[3,8,2],[5,3,5]]
Output: 2
\`\`\`

## Constraints

- \`rows == heights.length\`
- \`columns == heights[i].length\`
- \`1 <= rows, columns <= 100\`
- \`1 <= heights[i][j] <= 10^6\`

## Senior interview angle

Like Swim in Rising Water, this is a minimax path problem, not a shortest-total-cost problem — the objective is the largest single step along the route, not the sum of steps. That reframing is the whole signal: candidates who default to summing edge weights and running plain Dijkstra will get a wrong answer, because the correct "distance" to relax with is \`max(currentEffort, stepDifference)\`, not \`currentEffort + stepDifference\`. Once that substitution is made, every other piece of Dijkstra (greedy frontier expansion, finalize-on-visit) carries over unchanged.

## Pattern

\`Minimax path via Dijkstra-style expansion\` — relax using \`max(pathEffortSoFar, stepDifference)\` instead of summation, since the quantity being minimized is the worst single step, not the total path cost.`,
    starterCode: `/**
 * @param {number[][]} heights
 * @return {number}
 */
function minimumEffortPath(heights) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            [1, 2, 2],
            [3, 8, 2],
            [5, 3, 5],
          ],
        ],
        expected: 2,
      },
      {
        input: [
          [
            [1, 2, 3],
            [3, 8, 4],
            [5, 3, 5],
          ],
        ],
        expected: 1,
      },
      {
        input: [
          [
            [1, 2, 1, 1, 1],
            [1, 2, 1, 2, 1],
            [1, 2, 1, 2, 1],
            [1, 2, 1, 2, 1],
            [1, 1, 1, 2, 1],
          ],
        ],
        expected: 0,
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Binary Search on Answer + BFS Reachability)",
        timeComplexity: "O(rows * cols * log(max height))",
        spaceComplexity: "O(rows * cols)",
        overviewMarkdown:
          "Binary search over candidate effort values, from 0 to the largest height in the grid. For each candidate maxEffort, run a BFS from the top-left, only allowed to step between cells whose height difference is at most maxEffort, and check if the bottom-right is reachable. Reachability is monotonic in the candidate value, so binary search converges on the minimum valid effort. Correct, but re-runs a full grid BFS for every candidate value tried.",
        code: `function minimumEffortPath(heights) {
  const rows = heights.length;
  const cols = heights[0].length;
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  function canReach(maxEffort) {
    const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));
    const queue = [[0, 0]];
    visited[0][0] = true;

    while (queue.length > 0) {
      const [row, col] = queue.shift();
      if (row === rows - 1 && col === cols - 1) return true;

      for (const [dr, dc] of directions) {
        const nr = row + dr;
        const nc = col + dc;
        if (
          nr >= 0 &&
          nr < rows &&
          nc >= 0 &&
          nc < cols &&
          !visited[nr][nc] &&
          Math.abs(heights[nr][nc] - heights[row][col]) <= maxEffort
        ) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }

    return false;
  }

  let high = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      high = Math.max(high, heights[r][c]);
    }
  }

  let low = 0;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (canReach(mid)) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  return low;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-31 | \`canReach(maxEffort)\` | BFS from the top-left, only stepping onto cells with height difference \`<= maxEffort\`, returning whether the bottom-right is reached. |
| 40-48 | binary search over \`low\`/\`high\` | Reachability is monotonic in \`maxEffort\`, so binary search finds the minimum feasible value. |`,
        dryRunMarkdown: `**Dry run 1 (heights=[[1,2,2],[3,8,2],[5,3,5]])**: high=8 (max height). Binary search narrows down: mid=1 fails (some required step exceeds diff 1), progressively testing smaller candidate efforts finds that effort=2 is the smallest value for which a top-left-to-bottom-right route exists using only steps of height-difference <= 2. Return **2** — matches expected.

**Dry run 2 (heights=[[1,2,1,1,1],[1,2,1,2,1],[1,2,1,2,1],[1,2,1,2,1],[1,1,1,2,1]])**: A route exists that only ever steps between equal-height cells (effort 0) by winding through the grid's 1-valued cells. canReach(0) succeeds, so binary search converges to low=high=**0** — matches expected.`,
      },
      {
        approach: "Optimal (Dijkstra-Style Minimax Expansion)",
        timeComplexity: "O((rows * cols)^2) with array-scan selection",
        spaceComplexity: "O(rows * cols)",
        overviewMarkdown:
          "Track, for every cell, the minimum possible \"worst step so far\" to reach it — 0 for the start cell, Infinity elsewhere. Repeatedly select the unvisited cell with the smallest such value, finalize it, and relax its neighbors using max(currentCellEffort, heightDifferenceToNeighbor) instead of a sum. This computes the exact minimum-effort path to every cell in a single pass, directly modeling the minimax objective instead of guessing candidate values.",
        code: `function minimumEffortPath(heights) {
  const rows = heights.length;
  const cols = heights[0].length;
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  const effort = Array.from({ length: rows }, () => new Array(cols).fill(Infinity));
  effort[0][0] = 0;
  const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));

  for (let count = 0; count < rows * cols; count++) {
    let ur = -1;
    let uc = -1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!visited[r][c] && (ur === -1 || effort[r][c] < effort[ur][uc])) {
          ur = r;
          uc = c;
        }
      }
    }

    if (ur === rows - 1 && uc === cols - 1) return effort[ur][uc];
    visited[ur][uc] = true;

    for (const [dr, dc] of directions) {
      const nr = ur + dr;
      const nc = uc + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        const candidate = Math.max(effort[ur][uc], Math.abs(heights[nr][nc] - heights[ur][uc]));
        if (candidate < effort[nr][nc]) {
          effort[nr][nc] = candidate;
        }
      }
    }
  }

  return effort[rows - 1][cols - 1];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-6 | \`effort\` init, \`effort[0][0] = 0\` | No step taken yet at the start, so its effort is 0. |
| 10-17 | scan for the unvisited cell with smallest \`effort\` | Greedy step — this cell's minimum effort is now finalized. |
| 19 | \`if (ur === rows-1 && uc === cols-1) return effort[ur][uc];\` | Return as soon as the destination is finalized. |
| 23-29 | \`candidate = Math.max(effort[ur][uc], Math.abs(...))\` | The key substitution versus normal Dijkstra: take the worse of the path-so-far and the new step, not the sum. |`,
        dryRunMarkdown: `**Dry run 1 (heights=[[1,2,2],[3,8,2],[5,3,5]])**: effort starts [[0,Inf,Inf],[Inf,Inf,Inf],[Inf,Inf,Inf]]. Pick (0,0)=0. Relax (0,1): max(0,|2-1|)=1; (1,0): max(0,|3-1|)=2. Pick (0,1)=1 (smallest unvisited). Relax (0,2): max(1,|2-2|)=1; (1,1): max(1,|8-2|)=6. Pick (0,2)=1. Relax (1,2): max(1,|2-2|)=1. Pick (1,2)=1 (smallest unvisited now). Relax (2,2): max(1,|5-2|)=4; (1,1) candidate max(1,|8-2|)=6, not better than existing 6. Pick (1,0)=2 (next smallest). Relax (2,0): max(2,|5-3|)=2. Pick (2,0)=2. Relax (2,1): max(2,|3-5|)=2. Pick (2,1)=2 (or similar tie): relax (2,2): max(2,|5-3|)=2 < 4, update effort[2][2]=2. Pick (2,2)=2 — it's the destination → return **2** — matches expected.

**Dry run 3 (heights all-1s with a column of 2s threaded around)**: A path exists entirely through height-1 cells, so effort never needs to exceed 0 along that route; the Dijkstra-style expansion finds effort=0 for the destination before any path forces a step onto a 2. Return **0** — matches expected.`,
      },
    ],
    relatedSlugs: ["swim-in-rising-water", "min-cost-to-connect-points"],
    realWorldUsageMarkdown: `Minimizing the worst single step rather than total cost shows up in load-balanced routing (minimize the most-congested hop, not total latency) and in robotics path planning where the objective is minimizing the largest terrain incline encountered, not the total elevation change.`,
  },
];

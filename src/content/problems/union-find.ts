import type { Problem } from "../types";

export const unionFindProblems: Problem[] = [
  {
    slug: "number-of-provinces",
    title: "Number of Provinces",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta"],
    topicSlug: "union-find",
    functionName: "findCircleNum",
    description: `## Problem

There are \`n\` cities. \`isConnected[i][j] = 1\` if city \`i\` and city \`j\` are directly connected, \`0\` otherwise. A province is a group of directly or indirectly connected cities. Return the total number of provinces.

## Example

\`\`\`
Input: isConnected = [[1,1,0],[1,1,0],[0,0,1]]
Output: 2
\`\`\`

## Constraints

- \`1 <= n <= 200\`
- \`isConnected[i][i] == 1\`
- \`isConnected[i][j] == isConnected[j][i]\`

## Senior interview angle

This is the simplest possible "count connected components" problem, and it's the natural on-ramp to Union-Find: DFS/BFS answers it fine here since the whole adjacency matrix is handed over upfront, but the moment edges arrive one at a time (streaming, or a "connect these two cities" API call), Union-Find's incremental \`union\`/\`find\` model handles that naturally while DFS/BFS would need to be re-run from scratch on the whole graph. Recognizing *why* Union-Find is introduced here — not because it's asymptotically faster on a static matrix, but because it generalizes to dynamic connectivity — is the actual signal.

## Pattern

\`Union-Find (Disjoint Set Union)\` — union every directly-connected pair, then count the number of distinct roots remaining.`,
    starterCode: `/**
 * @param {number[][]} isConnected
 * @return {number}
 */
function findCircleNum(isConnected) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            [1, 1, 0],
            [1, 1, 0],
            [0, 0, 1],
          ],
        ],
        expected: 2,
      },
      {
        input: [
          [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
          ],
        ],
        expected: 3,
      },
      { input: [[[1]]], expected: 1 },
    ],
    solutions: [
      {
        approach: "Brute Force (DFS Over the Adjacency Matrix)",
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Treat isConnected as an adjacency matrix and DFS from every unvisited city, marking every city reachable from it as visited and counting that as one province. Correct and simple, but requires the full matrix in hand upfront and re-derives connectivity from scratch — it has no way to incrementally answer 'are these two cities now connected' without a full traversal.",
        code: `function findCircleNum(isConnected) {
  const n = isConnected.length;
  const visited = new Array(n).fill(false);
  let provinces = 0;

  function dfs(city) {
    visited[city] = true;
    for (let neighbor = 0; neighbor < n; neighbor++) {
      if (isConnected[city][neighbor] === 1 && !visited[neighbor]) {
        dfs(neighbor);
      }
    }
  }

  for (let city = 0; city < n; city++) {
    if (!visited[city]) {
      dfs(city);
      provinces++;
    }
  }

  return provinces;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-13 | \`dfs(city)\` | Marks every city reachable from \`city\` as visited, using the matrix row directly as the adjacency list. |
| 16-21 | \`for (city...) if (!visited[city]) { dfs(city); provinces++; }\` | Every time an unvisited city is found, it starts a brand-new province. |`,
        dryRunMarkdown: `**Dry run 1 (isConnected=[[1,1,0],[1,1,0],[0,0,1]])**: city0 unvisited → dfs(0) visits 0 and 1 (since isConnected[0][1]=1). provinces=1. city1 already visited, skip. city2 unvisited → dfs(2) visits just 2. provinces=2. Return **2** — matches expected.

**Dry run 2 (isConnected=[[1,0,0],[0,1,0],[0,0,1]])**: No city connects to any other (only the diagonal is 1). Each city starts its own province: provinces=3. Return **3** — matches expected.`,
      },
      {
        approach: "Optimal (Union-Find)",
        timeComplexity: "O(n^2 * α(n)) ≈ O(n^2)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Start with n separate components (every city its own province) and union every pair of directly-connected cities. Each successful union (joining two previously-separate components) decrements the province count by one. At the end, the running count is the answer — no final traversal needed.",
        code: `function findCircleNum(isConnected) {
  const n = isConnected.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  let provinces = n;

  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  function union(a, b) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) {
      parent[rootA] = rootB;
      provinces--;
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (isConnected[i][j] === 1) {
        union(i, j);
      }
    }
  }

  return provinces;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-4 | \`parent\` init, \`provinces = n\` | Every city starts as its own province. |
| 6-11 | \`find(x)\` with path compression | Flattens the parent chain as it walks up, keeping future lookups fast. |
| 13-19 | \`union(a, b)\` decrements \`provinces\` only on a real merge | If \`a\` and \`b\` are already in the same component, nothing changes — the province count only drops when two previously-separate groups actually merge. |`,
        dryRunMarkdown: `**Dry run 1 (isConnected=[[1,1,0],[1,1,0],[0,0,1]])**: parent=[0,1,2], provinces=3. isConnected[0][1]=1 → union(0,1): roots 0,1 differ → parent[0]=1, provinces=2. isConnected[0][2]=0, isConnected[1][2]=0 → no more unions. Return **2** — matches expected.

**Dry run 2 (isConnected=[[1,0,0],[0,1,0],[0,0,1]])**: provinces=3, no off-diagonal 1s at all → no unions ever happen. Return **3** — matches expected.`,
      },
    ],
    relatedSlugs: ["number-of-connected-components", "graph-valid-tree"],
    realWorldUsageMarkdown: `Union-Find's incremental connectivity tracking is exactly what network monitoring systems use to answer "are these two servers still on the same reachable segment" after individual link failures, without re-scanning the whole topology on every change.`,
  },
  {
    slug: "redundant-connection",
    title: "Redundant Connection",
    difficulty: "medium",
    maangTags: ["Google", "Amazon"],
    topicSlug: "union-find",
    functionName: "findRedundantConnection",
    description: `## Problem

A tree with \`n\` nodes had one extra edge added, turning it into a graph with exactly one cycle. Given \`edges\` (added in order to build the graph), return the edge that can be removed so the result is a tree again. If multiple edges could be removed, return the one that occurs last in the input.

## Example

\`\`\`
Input: edges = [[1,2],[1,3],[2,3]]
Output: [2,3]
\`\`\`

## Constraints

- \`n == edges.length\`
- \`3 <= n <= 1000\`

## Senior interview angle

"Return the one that occurs last" is the tell: process edges in input order, and the answer is the very first edge whose two endpoints are *already* connected by edges seen so far — that's the edge that closes the cycle. Checking "already connected" via a fresh reachability search (DFS/BFS) per edge works but is O(n) per check; Union-Find answers the same question in near-O(1) via \`find\`, and the redundant edge falls out naturally as the first \`union\` call that finds both endpoints already sharing a root.

## Pattern

\`Union-Find, first cycle-closing edge\` — process edges in order; the first edge whose endpoints already share a root is the redundant one.`,
    starterCode: `/**
 * @param {number[][]} edges
 * @return {number[]}
 */
function findRedundantConnection(edges) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            [1, 2],
            [1, 3],
            [2, 3],
          ],
        ],
        expected: [2, 3],
      },
      {
        input: [
          [
            [1, 2],
            [2, 3],
            [3, 4],
            [1, 4],
            [1, 5],
          ],
        ],
        expected: [1, 4],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (DFS Reachability Check Per Edge)",
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Process edges in order, building up an adjacency-list graph incrementally. Before adding each edge, check via DFS whether its two endpoints are already reachable from each other in the graph built so far. The first edge for which that's true is the redundant one — adding it would create a cycle, so it's returned without ever actually being added to the graph.",
        code: `function findRedundantConnection(edges) {
  const graph = new Map();

  function isConnected(a, b, visited) {
    if (a === b) return true;
    visited.add(a);
    for (const neighbor of graph.get(a) ?? []) {
      if (!visited.has(neighbor) && isConnected(neighbor, b, visited)) {
        return true;
      }
    }
    return false;
  }

  for (const [a, b] of edges) {
    if (graph.has(a) && graph.has(b) && isConnected(a, b, new Set())) {
      return [a, b];
    }
    if (!graph.has(a)) graph.set(a, []);
    if (!graph.has(b)) graph.set(b, []);
    graph.get(a).push(b);
    graph.get(b).push(a);
  }

  return [];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4-11 | \`isConnected(a, b, visited)\` | DFS reachability check within the graph built so far, before this edge is added. |
| 14-16 | \`if (graph.has(a) && graph.has(b) && isConnected(a, b, ...)) return [a, b];\` | If both endpoints already exist and are already reachable from each other, this edge would close a cycle — it's the answer. |
| 17-20 | otherwise add the edge to the graph | Only edges that don't create a cycle get added, keeping the graph a tree-in-progress. |`,
        dryRunMarkdown: `**Dry run 1 (edges=[[1,2],[1,3],[2,3]])**: Edge[1,2]: neither in graph yet → add. Edge[1,3]: 3 not in graph yet → add. Edge[2,3]: both 2 and 3 in graph, and 2 can reach 3 via 2→1→3 → cycle detected → return **[2,3]** — matches expected.

**Dry run 2 (edges=[[1,2],[2,3],[3,4],[1,4],[1,5]])**: Edges [1,2],[2,3],[3,4] all add cleanly (no cycle yet). Edge[1,4]: both in graph, and 1 can reach 4 via 1→2→3→4 → cycle detected → return **[1,4]** — matches expected (the later edge [1,5] is never reached).`,
      },
      {
        approach: "Optimal (Union-Find)",
        timeComplexity: "O(n * α(n)) ≈ O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Process edges in order, calling find on both endpoints. If they already share the same root, this edge connects two nodes already in the same component — it's the redundant edge, returned immediately. Otherwise, union the two components and continue. Path compression keeps every find call close to O(1) amortized, avoiding the brute force's repeated full reachability searches.",
        code: `function findRedundantConnection(edges) {
  const n = edges.length;
  const parent = Array.from({ length: n + 1 }, (_, i) => i);

  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  for (const [a, b] of edges) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) {
      return [a, b];
    }
    parent[rootA] = rootB;
  }

  return [];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`parent\` sized \`n + 1\` | A tree with n edges has n nodes (1-indexed in this problem), so n+1 slots covers indices 1..n. |
| 11-15 | \`if (rootA === rootB) return [a, b];\` | Both endpoints already in the same component means this edge is the one that closes the cycle. |
| 16 | \`parent[rootA] = rootB;\` | Otherwise, merge the two components and keep processing. |`,
        dryRunMarkdown: `**Dry run 1 (edges=[[1,2],[1,3],[2,3]])**: parent=[0,1,2,3]. Edge[1,2]: roots 1,2 differ → union, parent[1]=2. Edge[1,3]: find(1)→2 (via parent[1]=2), find(3)=3, differ → union, parent[2]=3. Edge[2,3]: find(2)=3 (parent[2]=3), find(3)=3 → same root → return **[2,3]** — matches expected.

**Dry run 2 (edges=[[1,2],[2,3],[3,4],[1,4],[1,5]])**: Unioning [1,2],[2,3],[3,4] chains 1→2→3→4 into one component. Edge[1,4]: find(1) and find(4) both resolve to the same root → return **[1,4]** — matches expected.`,
      },
    ],
    relatedSlugs: ["graph-valid-tree", "number-of-provinces"],
    realWorldUsageMarkdown: `Detecting the single edge that turns a tree into a cycle is exactly the check version-control merge tools and dependency resolvers use to flag a newly added dependency that creates a circular reference.`,
  },
  {
    slug: "accounts-merge",
    title: "Accounts Merge",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta", "Google"],
    topicSlug: "union-find",
    functionName: "accountsMerge",
    description: `## Problem

Given a list of \`accounts\`, where \`accounts[i] = [name, email1, email2, ...]\`, two accounts belong to the same person if they share at least one email. Merge all accounts belonging to the same person into one, and return each merged account as \`[name, ...sortedEmails]\`.

## Example

\`\`\`
Input: accounts = [["John","johnsmith@mail.com","john_newyork@mail.com"],["John","johnsmith@mail.com","john00@mail.com"],["Mary","mary@mail.com"],["John","johnny@mail.com"]]
Output: [["John","john00@mail.com","john_newyork@mail.com","johnsmith@mail.com"],["Mary","mary@mail.com"],["John","johnny@mail.com"]]
\`\`\`

## Constraints

- Two people can share the same name, but that alone doesn't mean they're the same person — only shared emails do.

## Senior interview angle

The subtlety that trips people up is what the graph's nodes actually are: it's tempting to build a graph over *emails*, but the thing being merged is *accounts* (indices), and emails are just the signal used to decide which account-indices belong together. Union-Find over account indices — union two indices whenever their accounts share an email — sidesteps building an explicit email-to-email graph entirely. The other subtlety is making the union deterministic: always attaching the larger-index root under the smaller-index root means \`find(i)\` for any account in a merged group returns that group's smallest original index, which then doubles as a stable place to read the (shared) name from.

## Pattern

\`Union-Find over indices, grouped by shared email\` — union account indices when they share an email; always keep the smaller index as root so the group's name can be read from a single canonical member.`,
    starterCode: `/**
 * @param {string[][]} accounts
 * @return {string[][]}
 */
function accountsMerge(accounts) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            ["John", "johnsmith@mail.com", "john_newyork@mail.com"],
            ["John", "johnsmith@mail.com", "john00@mail.com"],
            ["Mary", "mary@mail.com"],
            ["John", "johnny@mail.com"],
          ],
        ],
        expected: [
          ["John", "john00@mail.com", "john_newyork@mail.com", "johnsmith@mail.com"],
          ["Mary", "mary@mail.com"],
          ["John", "johnny@mail.com"],
        ],
      },
      {
        input: [
          [
            ["Gabe", "Gabe0@m.co", "Gabe3@m.co", "Gabe1@m.co"],
            ["Kevin", "Kevin3@m.co", "Kevin5@m.co", "Kevin0@m.co"],
            ["Ethan", "Ethan5@m.co", "Ethan4@m.co", "Ethan0@m.co"],
            ["Hanzo", "Hanzo3@m.co", "Hanzo1@m.co", "Hanzo0@m.co"],
            ["Fern", "Fern5@m.co", "Fern1@m.co", "Fern0@m.co"],
          ],
        ],
        expected: [
          ["Gabe", "Gabe0@m.co", "Gabe1@m.co", "Gabe3@m.co"],
          ["Kevin", "Kevin0@m.co", "Kevin3@m.co", "Kevin5@m.co"],
          ["Ethan", "Ethan0@m.co", "Ethan4@m.co", "Ethan5@m.co"],
          ["Hanzo", "Hanzo0@m.co", "Hanzo1@m.co", "Hanzo3@m.co"],
          ["Fern", "Fern0@m.co", "Fern1@m.co", "Fern5@m.co"],
        ],
      },
      { input: [[["A", "a@m.com"]]], expected: [["A", "a@m.com"]] },
    ],
    solutions: [
      {
        approach: "Brute Force (Build Index Graph via Shared Emails, DFS Groups)",
        timeComplexity: "O(n * m log(n * m)) where m is emails per account",
        spaceComplexity: "O(n * m)",
        overviewMarkdown:
          "For every email, record which account indices contain it. For any email shared by more than one account, connect all of those account indices together in an adjacency list. Then DFS from each unvisited index to collect its whole connected group, union all of that group's emails into a set, sort them, and pair them with the group's name. Correct, and produces the same grouping as Union-Find, just via an explicitly built graph and traversal instead of incremental unions.",
        code: `function accountsMerge(accounts) {
  const n = accounts.length;
  const emailToIndices = new Map();

  for (let i = 0; i < n; i++) {
    for (let j = 1; j < accounts[i].length; j++) {
      const email = accounts[i][j];
      if (!emailToIndices.has(email)) emailToIndices.set(email, []);
      emailToIndices.get(email).push(i);
    }
  }

  const graph = Array.from({ length: n }, () => []);
  for (const indices of emailToIndices.values()) {
    for (let k = 1; k < indices.length; k++) {
      graph[indices[0]].push(indices[k]);
      graph[indices[k]].push(indices[0]);
    }
  }

  const visited = new Array(n).fill(false);
  const result = [];

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;

    const stack = [i];
    visited[i] = true;
    const emails = new Set();

    while (stack.length > 0) {
      const curr = stack.pop();
      for (let j = 1; j < accounts[curr].length; j++) {
        emails.add(accounts[curr][j]);
      }
      for (const neighbor of graph[curr]) {
        if (!visited[neighbor]) {
          visited[neighbor] = true;
          stack.push(neighbor);
        }
      }
    }

    const sortedEmails = Array.from(emails).sort();
    result.push([accounts[i][0], ...sortedEmails]);
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-9 | \`emailToIndices\` | Records every account index that owns a given email. |
| 12-17 | build \`graph\` from shared emails | Any two indices sharing an email get connected directly in the adjacency list. |
| 24-38 | DFS each unvisited index, collect group's emails | Groups are discovered starting from the smallest unvisited index, so components naturally emerge in ascending order of their minimal index. |`,
        dryRunMarkdown: `**Dry run 1 (accounts with two "John" entries sharing "johnsmith@mail.com")**: emailToIndices links index0 and index1 via "johnsmith@mail.com". graph[0]=[1], graph[1]=[0]. Starting from index0 (unvisited): DFS visits 0 and 1, collecting emails {johnsmith@mail.com, john_newyork@mail.com, john00@mail.com}, sorted → [john00@mail.com, john_newyork@mail.com, johnsmith@mail.com]. Result entry: ["John", ...those]. Index2 ("Mary") and index3 (another "John") have no shared emails with anyone, so they each become their own group in order. Final result matches the expected 3-entry output — matches expected.

**Dry run 2 (five accounts, no shared emails at all)**: Every index is its own isolated component (no edges in \`graph\`). Each account's own emails get sorted and returned unchanged in relative order, one entry per original account — matches expected.`,
      },
      {
        approach: "Optimal (Union-Find Over Account Indices)",
        timeComplexity: "O(n * m log(n * m))",
        spaceComplexity: "O(n * m)",
        overviewMarkdown:
          "Track, for every email, the first account index seen owning it. Walk through every account's emails; whenever an email has already been seen under a different index, union the current index with that earlier index. Union always attaches the larger root under the smaller one, so every group's canonical root is its smallest original index. Afterward, group every index by its root, collect and sort each group's emails, and read the shared name off the root account.",
        code: `function accountsMerge(accounts) {
  const n = accounts.length;
  const parent = Array.from({ length: n }, (_, i) => i);

  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  function union(a, b) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) {
      parent[Math.max(rootA, rootB)] = Math.min(rootA, rootB);
    }
  }

  const emailToIndex = new Map();
  for (let i = 0; i < n; i++) {
    for (let j = 1; j < accounts[i].length; j++) {
      const email = accounts[i][j];
      if (emailToIndex.has(email)) {
        union(i, emailToIndex.get(email));
      } else {
        emailToIndex.set(email, i);
      }
    }
  }

  const rootToEmails = new Map();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    if (!rootToEmails.has(root)) rootToEmails.set(root, new Set());
    for (let j = 1; j < accounts[i].length; j++) {
      rootToEmails.get(root).add(accounts[i][j]);
    }
  }

  const result = [];
  for (const [root, emails] of rootToEmails) {
    const sortedEmails = Array.from(emails).sort();
    result.push([accounts[root][0], ...sortedEmails]);
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 13-18 | \`union(a, b)\` attaches \`max(rootA, rootB)\` under \`min(rootA, rootB)\` | Guarantees every group's root is its smallest member index, so the group's shared name can always be read from \`accounts[root][0]\`. |
| 21-30 | build \`emailToIndex\`, union on repeat sightings | Never builds an explicit email-to-email graph — only tracks which account index first claimed each email. |
| 32-39 | group indices by \`find(i)\`, collecting emails | \`rootToEmails\` (a \`Map\`) preserves insertion order, and since roots are always the minimal index, insertion order matches ascending root order. |`,
        dryRunMarkdown: `**Dry run 1 (accounts with two "John" entries sharing "johnsmith@mail.com")**: emailToIndex records "johnsmith@mail.com"→0 first. When index1 also lists "johnsmith@mail.com", union(1, 0) merges index1 under root 0. Final grouping: root0={0,1} (name "John", emails from both), root2={2} ("Mary"), root3={3} ("John"). Reading roots in ascending order (0, 2, 3) matches the expected output order exactly — matches expected.

**Dry run 3 (single account [["A","a@m.com"]])**: No repeated emails, so no unions happen; index0 is its own root. Result: **[["A","a@m.com"]]** — matches expected.`,
      },
    ],
    relatedSlugs: ["number-of-provinces", "smallest-string-with-swaps"],
    realWorldUsageMarkdown: `This exact "merge records that share a key" pattern (Union-Find over record indices, connected by shared identifiers) is how customer-data platforms deduplicate user profiles that were created under different emails, phone numbers, or device IDs but belong to the same real person.`,
  },
  {
    slug: "graph-valid-tree",
    title: "Graph Valid Tree",
    difficulty: "medium",
    maangTags: ["Google", "Meta"],
    topicSlug: "union-find",
    functionName: "validTree",
    description: `## Problem

Given \`n\` nodes labeled \`0\` to \`n - 1\` and a list of undirected \`edges\`, determine if these edges form a valid tree (connected, and with no cycles).

## Example

\`\`\`
Input: n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]
Output: true
\`\`\`

## Constraints

- \`0 <= edges.length <= 5000\`
- No self-loops or repeated edges.

## Senior interview angle

A valid tree has exactly two necessary-and-sufficient properties for n nodes: exactly n-1 edges, and full connectivity (equivalently, no cycles, since n-1 edges plus full connectivity forces acyclicity, and n-1 edges plus acyclicity forces full connectivity — either one, combined with the edge count, implies the other). The efficient check exploits this: reject immediately if the edge count isn't exactly n-1, then use Union-Find to confirm no cycle forms while processing edges — if no cycle forms and the edge count was already exactly n-1, connectivity is guaranteed for free, with no separate BFS/DFS reachability sweep needed.

## Pattern

\`Union-Find, cycle-free + correct edge count implies a tree\` — reject wrong edge counts immediately; otherwise a cycle-free union pass alone certifies a valid tree.`,
    starterCode: `/**
 * @param {number} n
 * @param {number[][]} edges
 * @return {boolean}
 */
function validTree(n, edges) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          5,
          [
            [0, 1],
            [0, 2],
            [0, 3],
            [1, 4],
          ],
        ],
        expected: true,
      },
      {
        input: [
          5,
          [
            [0, 1],
            [1, 2],
            [2, 3],
            [1, 3],
            [1, 4],
          ],
        ],
        expected: false,
      },
      { input: [1, []], expected: true },
    ],
    solutions: [
      {
        approach: "Brute Force (BFS Connectivity + Separate Edge Count Check)",
        timeComplexity: "O(n + e)",
        spaceComplexity: "O(n + e)",
        overviewMarkdown:
          "First check the edge count is exactly n-1 (a necessary condition for any tree). Then build an adjacency list and BFS from node 0, counting how many distinct nodes are reached. If every node was reached, the graph is fully connected, and combined with the correct edge count, it must be a valid tree (a graph with n-1 edges that's fully connected cannot contain a cycle). Correct, but runs a full BFS specifically to confirm connectivity, which Union-Find gets as a side effect of the union pass itself.",
        code: `function validTree(n, edges) {
  if (edges.length !== n - 1) return false;

  const graph = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    graph[a].push(b);
    graph[b].push(a);
  }

  const visited = new Array(n).fill(false);
  const queue = [0];
  visited[0] = true;
  let visitedCount = 1;

  while (queue.length > 0) {
    const node = queue.shift();
    for (const neighbor of graph[node]) {
      if (!visited[neighbor]) {
        visited[neighbor] = true;
        visitedCount++;
        queue.push(neighbor);
      }
    }
  }

  return visitedCount === n;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`if (edges.length !== n - 1) return false;\` | Fast rejection — no valid tree can have any other number of edges. |
| 9-22 | BFS from node 0, counting \`visitedCount\` | Confirms every node is reachable — the tree's second necessary property. |
| 24 | \`return visitedCount === n;\` | Both properties (edge count and full connectivity) together certify a valid tree. |`,
        dryRunMarkdown: `**Dry run 1 (n=5, edges=[[0,1],[0,2],[0,3],[1,4]])**: edges.length=4=n-1, passes. BFS from 0 reaches 1,2,3 directly, then 4 via 1. visitedCount=5=n → return **true** — matches expected.

**Dry run 2 (n=5, edges=[[0,1],[1,2],[2,3],[1,3],[1,4]])**: edges.length=5, n-1=4, 5≠4 → return **false** immediately — matches expected.`,
      },
      {
        approach: "Optimal (Union-Find, Cycle Detection Implies Connectivity)",
        timeComplexity: "O(n * α(n)) ≈ O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Reject immediately if the edge count isn't exactly n-1. Otherwise, process each edge with Union-Find: if an edge's two endpoints already share a root, a cycle exists — return false right away. If every edge unions two previously-separate components without ever finding a cycle, then (given the edge count was already exactly n-1) the graph must be fully connected — no separate reachability pass is needed.",
        code: `function validTree(n, edges) {
  if (edges.length !== n - 1) return false;

  const parent = Array.from({ length: n }, (_, i) => i);

  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  for (const [a, b] of edges) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) return false;
    parent[rootA] = rootB;
  }

  return true;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`if (edges.length !== n - 1) return false;\` | Same fast rejection as the brute force approach. |
| 13-17 | \`if (rootA === rootB) return false; parent[rootA] = rootB;\` | Detects a cycle the instant it would form; otherwise merges components. |
| 19 | \`return true;\` | No separate connectivity check needed — n-1 edges with zero cycles forces full connectivity. |`,
        dryRunMarkdown: `**Dry run 1 (n=5, edges=[[0,1],[0,2],[0,3],[1,4]])**: edges.length=4=n-1. Every edge unions two different roots (0-1, 0-2, 0-3, 1-4 all connect previously-separate components) — no cycle ever detected. Return **true** — matches expected.

**Dry run 2 (n=5, edges=[[0,1],[1,2],[2,3],[1,3],[1,4]])**: edges.length=5≠4=n-1 → return **false** immediately, matching the brute force's fast-rejection path — matches expected.`,
      },
    ],
    relatedSlugs: ["redundant-connection", "number-of-connected-components"],
    realWorldUsageMarkdown: `Validating "exactly one path between any two points, no redundant links" is the same check network topology validators run before deploying a spanning-tree protocol configuration, ensuring no accidental redundant (cycle-forming) link was left in the physical wiring plan.`,
  },
  {
    slug: "most-stones-removed-with-same-row-or-column",
    title: "Most Stones Removed with Same Row or Column",
    difficulty: "medium",
    maangTags: ["Google", "Amazon"],
    topicSlug: "union-find",
    functionName: "removeStones",
    description: `## Problem

\`stones[i] = [row_i, col_i]\` gives the position of the \`i\`-th stone. A stone can be removed if it shares a row or a column with at least one other *remaining* stone. Return the maximum number of stones that can be removed.

## Example

\`\`\`
Input: stones = [[0,0],[0,1],[1,0],[1,2],[2,1],[2,2]]
Output: 5
\`\`\`

## Constraints

- \`1 <= stones.length <= 1000\`
- No two stones share the exact same position.

## Senior interview angle

The reformulation is the whole problem: instead of simulating removals, notice that within any connected group of stones (connected transitively through shared rows/columns), every stone but one can eventually be removed — so the answer is just \`total stones - number of connected groups\`. The elegant Union-Find version doesn't even union stones directly; it unions *row-keys* and *column-keys* as if they were graph nodes, and every stone becomes an edge between its row-node and its column-node — collapsing an O(n²) pairwise-comparison graph into an O(n) hashed-key one.

## Pattern

\`Union-Find over row/column keys, not stone indices\` — union each stone's row-key with its column-key; the number of resulting groups tells you exactly how many stones must stay, so removable = total - groups.`,
    starterCode: `/**
 * @param {number[][]} stones
 * @return {number}
 */
function removeStones(stones) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 2],
            [2, 1],
            [2, 2],
          ],
        ],
        expected: 5,
      },
      {
        input: [
          [
            [0, 0],
            [0, 2],
            [1, 1],
            [2, 0],
            [2, 2],
          ],
        ],
        expected: 3,
      },
      { input: [[[0, 0]]], expected: 0 },
    ],
    solutions: [
      {
        approach: "Brute Force (Pairwise Union-Find Over Stone Indices)",
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Compare every pair of stones directly: if they share a row or a column, union their indices (using a naive find with no path compression). After all pairs are checked, count the number of distinct roots among all stones — that's the number of connected groups. The answer is total stones minus that count, since every group of size k needs only 1 stone left behind, meaning k-1 are removable.",
        code: `function removeStones(stones) {
  const n = stones.length;
  const parent = Array.from({ length: n }, (_, i) => i);

  function find(x) {
    while (parent[x] !== x) {
      x = parent[x];
    }
    return x;
  }

  function union(a, b) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootA] = rootB;
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (stones[i][0] === stones[j][0] || stones[i][1] === stones[j][1]) {
        union(i, j);
      }
    }
  }

  const components = new Set();
  for (let i = 0; i < n; i++) {
    components.add(find(i));
  }

  return n - components.size;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 16-20 | compare every pair of stones | O(n^2) — checks every pair directly for a shared row or column rather than hashing rows/columns as keys. |
| 23-25 | count distinct roots via \`find(i)\` for every stone | The number of distinct roots equals the number of connected groups among the stones. |
| 27 | \`return n - components.size;\` | Each group of size k contributes k-1 removable stones, so total removable = n - number of groups. |`,
        dryRunMarkdown: `**Dry run 1 (stones=[[0,0],[0,1],[1,0],[1,2],[2,1],[2,2]])**: Every stone ends up transitively connected through shared rows/columns into a single group of 6. components.size=1. Return 6-1=**5** — matches expected.

**Dry run 3 (stones=[[0,0]])**: A single stone — trivially its own group. components.size=1. Return 1-1=**0** — matches expected (nothing shares a row/column with it, so nothing can be removed).`,
      },
      {
        approach: "Optimal (Union-Find Over Row/Column Keys)",
        timeComplexity: "O(n * α(n)) ≈ O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Treat every distinct row value and every distinct column value as its own node in a Union-Find keyed by string (e.g. `r{row}` and `c{col}`), and union a stone's row-key with its column-key for every stone. This directly encodes 'these two stones are connected because they'd both connect to this same row (or column) node' without ever comparing stones to each other pairwise. The number of distinct roots among all the row-keys actually used equals the number of connected stone groups, giving the same `total - groups` answer in linear time.",
        code: `function removeStones(stones) {
  const parent = new Map();

  function find(x) {
    if (!parent.has(x)) parent.set(x, x);
    if (parent.get(x) !== x) {
      parent.set(x, find(parent.get(x)));
    }
    return parent.get(x);
  }

  function union(a, b) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent.set(rootA, rootB);
  }

  for (const [r, c] of stones) {
    union(\`r\${r}\`, \`c\${c}\`);
  }

  const roots = new Set();
  for (const [r, c] of stones) {
    roots.add(find(\`r\${r}\`));
  }

  return stones.length - roots.size;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 17-19 | \`union(\\\`r\${r}\\\`, \\\`c\${c}\\\`)\` for every stone | Each stone becomes an edge between its row-node and its column-node — no pairwise stone comparison needed. |
| 22-25 | count distinct roots via \`find(\\\`r\${r}\\\`)\` per stone | Every stone in the same connected group resolves to the same root, regardless of whether that root came from a row-key or a column-key. |
| 27 | \`return stones.length - roots.size;\` | Same total-minus-groups logic as the brute force, computed without ever comparing stones to each other directly. |`,
        dryRunMarkdown: `**Dry run 2 (stones=[[0,0],[0,2],[1,1],[2,0],[2,2]])**: Unioning row/col keys links r0-c0-r2-c2-c0(again)... — (0,0),(0,2),(2,0),(2,2) all end up sharing one root via row0/row2/col0/col2 chaining, while (1,1) (row1, col1) never touches any of those keys and stays its own isolated group. Two groups total. Return 5-2=**3** — matches expected.`,
      },
    ],
    relatedSlugs: ["number-of-provinces", "graph-valid-tree"],
    realWorldUsageMarkdown: `Unioning over shared attributes (row/column here) instead of over the records themselves is the same trick behind entity-resolution systems that group user accounts sharing a device fingerprint or IP address — you union the shared attribute nodes, not every pair of accounts directly, to avoid an O(n²) comparison sweep.`,
  },
  {
    slug: "smallest-string-with-swaps",
    title: "Smallest String With Swaps",
    difficulty: "medium",
    maangTags: ["Amazon", "Google"],
    topicSlug: "union-find",
    functionName: "smallestStringWithSwaps",
    description: `## Problem

Given a string \`s\` and an array of \`pairs\` where \`pairs[i] = [a, b]\` means the characters at indices \`a\` and \`b\` (1-indexed... actually 0-indexed) can be swapped any number of times, return the lexicographically smallest string that can be achieved.

## Example

\`\`\`
Input: s = "dcab", pairs = [[0,3],[1,2]]
Output: "bacd"
\`\`\`

## Constraints

- \`1 <= s.length <= 10^5\`
- \`0 <= pairs[i][0], pairs[i][1] < s.length\`

## Senior interview angle

The key realization: if index a can swap with b, and b can swap with c, then (through intermediate swaps) a can effectively be rearranged with c too — swappability is transitive, which means each connected group of indices (via the pairs, treated as a graph) can be freely permuted into *any* order among themselves. Once that's seen, the answer for each group is just "sort the characters at those indices and place them back into the indices in ascending index order" — greedy, since making the smallest available character occupy the smallest available index within a swappable group can never hurt any other group's independent optimization.

## Pattern

\`Union-Find groups + sort-and-reassign\` — group indices connected by swap pairs, then within each group place its characters back in sorted order at the group's indices (in ascending index order).`,
    starterCode: `/**
 * @param {string} s
 * @param {number[][]} pairs
 * @return {string}
 */
function smallestStringWithSwaps(s, pairs) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          "dcab",
          [
            [0, 3],
            [1, 2],
          ],
        ],
        expected: "bacd",
      },
      {
        input: [
          "dcab",
          [
            [0, 3],
            [1, 2],
            [0, 2],
          ],
        ],
        expected: "abcd",
      },
      {
        input: [
          "cba",
          [
            [0, 1],
            [1, 2],
          ],
        ],
        expected: "abc",
      },
    ],
    solutions: [
      {
        approach: "Brute Force (BFS Grouping Over an Adjacency List)",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Build an adjacency list from the swap pairs. BFS from every unvisited index to collect its full connected group of indices. Within each group, sort the group's indices ascending and the group's characters ascending, then reassign — the smallest character in the group goes to the group's smallest index, and so on. Correct, and produces the same swappable-groups structure as Union-Find, just via explicit graph traversal.",
        code: `function smallestStringWithSwaps(s, pairs) {
  const n = s.length;
  const graph = Array.from({ length: n }, () => []);
  for (const [a, b] of pairs) {
    graph[a].push(b);
    graph[b].push(a);
  }

  const visited = new Array(n).fill(false);
  const chars = s.split("");

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;

    const group = [];
    const queue = [i];
    visited[i] = true;
    while (queue.length > 0) {
      const node = queue.shift();
      group.push(node);
      for (const neighbor of graph[node]) {
        if (!visited[neighbor]) {
          visited[neighbor] = true;
          queue.push(neighbor);
        }
      }
    }

    const indices = [...group].sort((a, b) => a - b);
    const groupChars = indices.map((idx) => chars[idx]).sort();
    for (let k = 0; k < indices.length; k++) {
      chars[indices[k]] = groupChars[k];
    }
  }

  return chars.join("");
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-6 | build \`graph\` from swap \`pairs\` | Each pair becomes a bidirectional edge between two indices. |
| 12-24 | BFS collects each connected \`group\` of indices | Every index in a group can, through a chain of swaps, be freely rearranged with any other index in the same group. |
| 26-30 | sort indices ascending, sort chars ascending, reassign | Placing the smallest available character at the smallest available index within the group produces that group's lexicographically smallest arrangement. |`,
        dryRunMarkdown: `**Dry run 1 (s="dcab", pairs=[[0,3],[1,2]])**: Group {0,3} (chars 'd','b') sorted chars → ['b','d'], assigned to indices [0,3]: chars[0]='b', chars[3]='d'. Group {1,2} (chars 'c','a') sorted → ['a','c'], assigned to [1,2]: chars[1]='a', chars[2]='c'. Result: "bacd" — matches expected.

**Dry run 2 (s="dcab", pairs=[[0,3],[1,2],[0,2]])**: Pair [0,2] connects the two previously-separate groups into one: {0,1,2,3}. Sorted chars of "dcab" = ['a','b','c','d'], assigned to indices [0,1,2,3] in order. Result: "abcd" — matches expected.`,
      },
      {
        approach: "Optimal (Union-Find Grouping)",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Union every pair's two indices. Then group every index by its final root (a single pass using a Map). Within each group, sort the group's indices and characters ascending and reassign, exactly as in the brute force — the only difference is how the groups are discovered (incremental unions instead of an explicit graph plus BFS).",
        code: `function smallestStringWithSwaps(s, pairs) {
  const n = s.length;
  const parent = Array.from({ length: n }, (_, i) => i);

  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  function union(a, b) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootA] = rootB;
  }

  for (const [a, b] of pairs) {
    union(a, b);
  }

  const groups = new Map();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(i);
  }

  const chars = s.split("");
  for (const indices of groups.values()) {
    const groupChars = indices.map((idx) => chars[idx]).sort();
    for (let k = 0; k < indices.length; k++) {
      chars[indices[k]] = groupChars[k];
    }
  }

  return chars.join("");
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 17-19 | union every swap pair | Builds up the same connected-groups structure incrementally instead of via a graph traversal. |
| 21-26 | group indices by \`find(i)\` | Since indices are processed 0..n-1, each group's indices list comes out already ascending. |
| 28-33 | sort each group's characters and reassign | Identical reassignment step to the brute force, applied per Union-Find group. |`,
        dryRunMarkdown: `**Dry run 3 (s="cba", pairs=[[0,1],[1,2]])**: union(0,1) then union(1,2) merges all three indices into one component. Group {0,1,2}, chars ['c','b','a'] sorted → ['a','b','c'], assigned to indices [0,1,2]. Result: "abc" — matches expected.

**Dry run 1 (s="dcab", pairs=[[0,3],[1,2]])**: union(0,3) and union(1,2) create two separate groups: {0,3} and {1,2} (or {1,3},{2,0} depending on union direction, but grouped correctly regardless). Sorting and reassigning within each group produces "bacd" — matches expected.`,
      },
    ],
    relatedSlugs: ["accounts-merge", "evaluate-division"],
    realWorldUsageMarkdown: `Grouping elements that can be freely rearranged among themselves (via Union-Find) and then locally optimizing each group independently is the same technique used in task schedulers that can freely reorder jobs within an independent batch but must respect ordering constraints between batches.`,
  },
  {
    slug: "evaluate-division",
    title: "Evaluate Division",
    difficulty: "medium",
    maangTags: ["Google", "Meta", "Amazon"],
    topicSlug: "union-find",
    functionName: "calcEquation",
    description: `## Problem

Given equations like \`a / b = 2.0\` (as \`equations = [["a","b"]]\`, \`values = [2.0]\`) and a list of \`queries\`, evaluate each query \`a / b\` if the answer can be derived from the known equations, or return \`-1.0\` if it cannot (unknown variable, or no relation exists between them).

## Example

\`\`\`
Input: equations = [["a","b"],["b","c"]], values = [2.0,3.0], queries = [["a","c"],["b","a"],["a","e"],["a","a"],["x","x"]]
Output: [6.00000,0.50000,-1.00000,1.00000,-1.00000]
\`\`\`

## Constraints

- Variables are strings; there are no cycles with contradictory values in the input.

## Senior interview angle

Each equation \`a / b = k\` is really a weighted, directed edge pair (a→b with weight k, and b→a with weight 1/k) — this is a graph problem wearing an algebra costume. BFS/DFS per query (multiplying edge weights along the path) works, but the more interesting technique is *weighted* Union-Find, where each node stores its ratio to its parent, and \`find\` accumulates that ratio via path compression as it flattens the tree — turning "what's the ratio between any two variables in the same group" into a near-O(1) lookup instead of a fresh graph search per query.

## Pattern

\`Weighted Union-Find\` — each node stores its multiplicative ratio to its parent; path compression during find accumulates the ratio all the way to the root, answering ratio queries between any two nodes sharing a root in near-constant time.`,
    starterCode: `/**
 * @param {string[][]} equations
 * @param {number[]} values
 * @param {string[][]} queries
 * @return {number[]}
 */
function calcEquation(equations, values, queries) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            ["a", "b"],
            ["b", "c"],
          ],
          [2.0, 3.0],
          [
            ["a", "c"],
            ["b", "a"],
            ["a", "e"],
            ["a", "a"],
            ["x", "x"],
          ],
        ],
        expected: [6.0, 0.5, -1.0, 1.0, -1.0],
      },
      {
        input: [
          [
            ["a", "b"],
            ["b", "c"],
            ["bc", "cd"],
          ],
          [1.5, 2.5, 5.0],
          [
            ["a", "c"],
            ["c", "b"],
            ["bc", "cd"],
            ["cd", "bc"],
          ],
        ],
        expected: [3.75, 0.4, 5.0, 0.2],
      },
      {
        input: [[["a", "b"]], [0.5], [["a", "b"], ["b", "a"], ["a", "c"]]],
        expected: [0.5, 2.0, -1.0],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (BFS With Weighted Edges, Per Query)",
        timeComplexity: "O((E + Q) * E) — a BFS per query over a graph with E edges",
        spaceComplexity: "O(E + V)",
        overviewMarkdown:
          "Build a graph where each equation contributes both a forward edge (weight k) and a reverse edge (weight 1/k). For each query, if either variable is unknown, answer -1 immediately; if they're the same variable, answer 1; otherwise BFS from the start variable, multiplying edge weights along the way, until the end variable is reached (or the search exhausts without finding it, meaning -1). Correct, but re-runs a full graph search for every single query.",
        code: `function calcEquation(equations, values, queries) {
  const graph = new Map();

  for (let i = 0; i < equations.length; i++) {
    const [a, b] = equations[i];
    const val = values[i];
    if (!graph.has(a)) graph.set(a, []);
    if (!graph.has(b)) graph.set(b, []);
    graph.get(a).push([b, val]);
    graph.get(b).push([a, 1 / val]);
  }

  function query(start, end) {
    if (!graph.has(start) || !graph.has(end)) return -1.0;
    if (start === end) return 1.0;

    const visited = new Set([start]);
    const queue = [[start, 1.0]];

    while (queue.length > 0) {
      const [node, product] = queue.shift();
      if (node === end) return product;

      for (const [neighbor, weight] of graph.get(node)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([neighbor, product * weight]);
        }
      }
    }

    return -1.0;
  }

  return queries.map(([a, b]) => query(a, b));
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4-10 | build \`graph\` with both directions | Each equation \`a/b=k\` also implies \`b/a=1/k\`, so both directed edges are added. |
| 13-14 | unknown-variable / same-variable fast paths | If either variable was never seen, or they're identical, the answer is known without any search. |
| 20-29 | BFS accumulating \`product\` along the path | Each hop multiplies the running product by that edge's weight, so reaching \`end\` yields the full \`start/end\` ratio. |`,
        dryRunMarkdown: `**Dry run 1 (equations=[[a,b],[b,c]], values=[2.0,3.0], query a/c)**: graph has a→b(2.0), b→a(0.5), b→c(3.0), c→b(1/3). BFS from a: visit a(product1.0), then b(product1.0*2.0=2.0), then from b reach c(product2.0*3.0=6.0). Return **6.0** — matches expected first query.

**Dry run 2 (same graph, query a/e)**: "e" was never seen in any equation → \`graph.has("e")\` is false → return **-1.0** immediately — matches expected.`,
      },
      {
        approach: "Optimal (Weighted Union-Find)",
        timeComplexity: "O((E + Q) * α(E)) ≈ O(E + Q)",
        spaceComplexity: "O(V)",
        overviewMarkdown:
          "Maintain a parent map and a weight map, where weight[x] is x's ratio to parent[x]. find(x) recursively finds x's root, and while unwinding the recursion, updates weight[x] to be x's ratio directly to the root (path compression, accumulating ratios along the way) instead of just to its immediate parent. union(a, b, val) attaches a's root under b's root, computing the new root-to-root ratio algebraically from the known a/b ratio and each node's already-known ratio to its own root. Once all equations are processed, each query just needs two find calls and a division — no per-query graph search.",
        code: `function calcEquation(equations, values, queries) {
  const parent = new Map();
  const weight = new Map();

  function find(x) {
    if (!parent.has(x)) {
      parent.set(x, x);
      weight.set(x, 1.0);
    }
    if (parent.get(x) !== x) {
      const root = find(parent.get(x));
      weight.set(x, weight.get(x) * weight.get(parent.get(x)));
      parent.set(x, root);
    }
    return parent.get(x);
  }

  function union(a, b, val) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) return;
    parent.set(rootA, rootB);
    weight.set(rootA, (val * weight.get(b)) / weight.get(a));
  }

  for (let i = 0; i < equations.length; i++) {
    const [a, b] = equations[i];
    union(a, b, values[i]);
  }

  return queries.map(([a, b]) => {
    if (!parent.has(a) || !parent.has(b)) return -1.0;
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) return -1.0;
    return weight.get(a) / weight.get(b);
  });
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-8 | lazily register unseen variables in \`find\` | A variable becomes its own root with weight 1.0 the first time it's encountered. |
| 9-13 | path-compress and rescale \`weight[x]\` | While recursing up to the root, each node's weight is rewritten to be its ratio directly to the root, not just to its old parent. |
| 17-23 | \`union(a, b, val)\` computes the new root-to-root ratio | Algebraically derives \`rootA\`'s ratio to \`rootB\` from the known \`a/b = val\` and each node's already-known ratio to its own root. |
| 31-36 | each query is just two \`find\` calls and a division | No graph search needed per query — the ratio to each node's root was already resolved during the union phase (and further compressed on lookup). |`,
        dryRunMarkdown: `**Dry run 1 (equations=[[a,b],[b,c]], values=[2.0,3.0])**: union(a,b,2.0): both new, rootA=a,rootB=b, parent.set(a,b), weight.set(a, 2.0*1/1=2.0). union(b,c,3.0): rootA=b(root itself),rootB=c(new), parent.set(b,c), weight.set(b,3.0*1/1=3.0). Query a/c: find(a) recurses through b to c, compressing weight[a] to 2.0*3.0=6.0, parent[a]=c directly. rootA=rootB=c → return weight.get(a)/weight.get(c) = 6.0/1.0=**6.0** — matches expected.

**Dry run 3 (equations=[[a,b]], values=[0.5], query b/a)**: union(a,b,0.5): parent.set(a,b), weight.set(a,0.5). Query b/a: find(b)=b (root, weight 1.0), find(a)=b (weight.get(a)=0.5). rootA===rootB → return weight.get(b)/weight.get(a) = 1.0/0.5=**2.0** — matches expected.`,
      },
    ],
    relatedSlugs: ["smallest-string-with-swaps", "network-delay-time"],
    realWorldUsageMarkdown: `Weighted Union-Find is the standard technique behind currency-conversion graphs (deriving any pairwise exchange rate from a sparse set of known rates) and unit-conversion systems that need to answer "how many X equal one Y" for units only indirectly related through a chain of known conversions.`,
  },
];

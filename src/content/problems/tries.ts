import type { Problem } from "../types";

export const trieProblems: Problem[] = [
  {
    slug: "implement-trie-prefix-tree",
    title: "Implement Trie (Prefix Tree)",
    difficulty: "medium",
    maangTags: ["Google", "Amazon", "Netflix"],
    topicSlug: "tries",
    functionName: "Trie",
    description: `## Problem

Implement a trie with \`insert(word)\`, \`search(word)\` (exact match), and \`startsWith(prefix)\` (prefix match).

## Example

\`\`\`
Input:  ["Trie","insert","search","search","startsWith","insert","search"]
        [[],["apple"],["apple"],["app"],["app"],["app"],["app"]]
Output: [null,null,true,false,true,null,true]
\`\`\`

## Senior interview angle

A trie is a tree where **the path from root to node is the string itself** — every node has up to 26 children (one per letter) and a boolean flag marking "a word ends here." \`search\` needs that end flag; \`startsWith\` doesn't — that one-flag distinction is the whole reason \`search("app")\` is \`false\` while \`startsWith("app")\` is \`true\` even though both walk the identical path.

## Pattern

\`Trie (prefix tree) node traversal\` — the foundational structure every later problem in this topic (wildcard search, grid word search) builds on.`,
    starterCode: `class Trie {
  constructor() {
    // Your code here
  }

  /**
   * @param {string} word
   */
  insert(word) {
    // Your code here
  }

  /**
   * @param {string} word
   * @return {boolean}
   */
  search(word) {
    // Your code here
  }

  /**
   * @param {string} prefix
   * @return {boolean}
   */
  startsWith(prefix) {
    // Your code here
  }
}`,
    testCases: [
      {
        operations: ["Trie", "insert", "search", "search", "startsWith", "insert", "search"],
        args: [[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]],
        expected: [null, null, true, false, true, null, true],
      },
      {
        operations: ["Trie", "search", "startsWith", "insert", "search", "startsWith"],
        args: [[], ["a"], ["a"], ["a"], ["a"], ["a"]],
        expected: [null, false, false, null, true, true],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Flat Word List, Linear Scan)",
        timeComplexity: "O(n · L) per search/startsWith, n = words inserted, L = string length",
        spaceComplexity: "O(n · L)",
        overviewMarkdown:
          "Skip the tree structure entirely — keep every inserted word in a plain array. `search` does an exact-match scan across all stored words; `startsWith` scans and checks `word.startsWith(prefix)` on each. Correct, but every query re-scans the entire insertion history instead of following a direct path.",
        code: `class Trie {
  constructor() {
    this.words = [];
  }

  insert(word) {
    this.words.push(word);
  }

  search(word) {
    return this.words.includes(word);
  }

  startsWith(prefix) {
    return this.words.some((w) => w.startsWith(prefix));
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`constructor\` | Just a flat array — no tree, no shared structure between words with common prefixes. |
| 6-7 | \`insert\` | Append the word; O(1) but does no indexing work up front. |
| 10-11 | \`search\` | Full linear scan for an exact match — O(n) words × O(L) comparison each. |
| 14-15 | \`startsWith\` | Same linear scan, but with a prefix check per word instead of equality. |`,
        dryRunMarkdown: `**Dry run 1**:
\`insert("apple")\`: words=["apple"].
\`search("apple")\`: scan finds "apple" → **true**.
\`search("app")\`: scan finds no exact "app" → **false**.
\`startsWith("app")\`: "apple".startsWith("app") → **true**.
\`insert("app")\`: words=["apple","app"].
\`search("app")\`: scan finds "app" → **true**.
Results: [null,null,true,false,true,null,true] — matches expected.

**Dry run 2**:
\`search("a")\`: words=[] → no match → **false**.
\`startsWith("a")\`: words=[] → **false**.
\`insert("a")\`: words=["a"].
\`search("a")\`: found → **true**.
\`startsWith("a")\`: "a".startsWith("a") → **true**.
Results: [null,false,false,null,true,true] — matches expected.`,
      },
      {
        approach: "Optimal (Trie Node Traversal)",
        timeComplexity: "O(L) per insert/search/startsWith, L = string length",
        spaceComplexity: "O(total characters inserted, with shared prefixes stored once)",
        overviewMarkdown:
          "Each node holds a map of `character -> child node` plus an `isEnd` flag. `insert` walks/creates one node per character. `search` walks the exact path and additionally requires `isEnd === true` at the final node. `startsWith` walks the same way but doesn't check `isEnd` — reaching the last character at all is sufficient. Every operation costs O(L), independent of how many words are stored.",
        code: `class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch);
    }
    node.isEnd = true;
  }

  _walk(str) {
    let node = this.root;
    for (const ch of str) {
      if (!node.children.has(ch)) return null;
      node = node.children.get(ch);
    }
    return node;
  }

  search(word) {
    const node = this._walk(word);
    return node !== null && node.isEnd;
  }

  startsWith(prefix) {
    return this._walk(prefix) !== null;
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 1-5 | \`TrieNode\` | \`children\` maps the next character to its node; \`isEnd\` marks "a full inserted word ends exactly here." |
| 13-19 | \`insert\` | Walk the path one character at a time, creating a node whenever the path doesn't exist yet; mark \`isEnd\` at the final node. |
| 21-28 | \`_walk\` | Shared helper: follow a string's path through the trie, returning \`null\` the instant a character isn't present. |
| 30-33 | \`search\` | Walk the full word's path, then require \`isEnd\` — this is what makes \`search("app")\` false when only "apple" was inserted. |
| 35-37 | \`startsWith\` | Same walk, but no \`isEnd\` check — merely reaching the end of the prefix's path is enough. |`,
        dryRunMarkdown: `**Dry run 1**:
\`insert("apple")\`: root→a→p→p→l→e, mark e.isEnd=true.
\`search("apple")\`: walk a-p-p-l-e succeeds, node.isEnd=true → **true**.
\`search("app")\`: walk a-p-p succeeds, but that node's isEnd is still false (only the "apple" path's final 'e' node is marked) → **false**.
\`startsWith("app")\`: walk a-p-p succeeds, no isEnd check needed → **true**.
\`insert("app")\`: walk a-p-p (nodes already exist), mark that p node's isEnd=true.
\`search("app")\`: walk a-p-p succeeds, isEnd now true → **true**.
Results: [null,null,true,false,true,null,true] — matches expected.

**Dry run 2**:
\`search("a")\`: root has no child 'a' yet → \`_walk\` returns null → **false**.
\`startsWith("a")\`: same → null → **false**.
\`insert("a")\`: root→a, mark isEnd=true.
\`search("a")\`: walk succeeds, isEnd=true → **true**.
\`startsWith("a")\`: walk succeeds → **true**.
Results: [null,false,false,null,true,true] — matches expected.`,
      },
    ],
    relatedSlugs: ["design-add-and-search-words-data-structure", "word-search-ii"],
    realWorldUsageMarkdown: `Tries back autocomplete and search-as-you-type suggestions (every major search bar), IP routing tables (longest-prefix match), spell-checkers, and T9-style predictive text — anywhere "share storage across common prefixes and answer prefix queries fast" matters.`,
  },
  {
    slug: "design-add-and-search-words-data-structure",
    title: "Design Add and Search Words Data Structure",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta", "Google"],
    topicSlug: "tries",
    functionName: "WordDictionary",
    description: `## Problem

Design a data structure supporting \`addWord(word)\` and \`search(word)\`, where \`search\` may contain \`.\` characters that each match **any single letter**.

## Example

\`\`\`
Input:  ["WordDictionary","addWord","addWord","addWord","search","search","search","search"]
        [[],["bad"],["dad"],["mad"],["pad"],["bad"],[".ad"],["b.."]]
Output: [null,null,null,null,false,true,true,true]
\`\`\`

## Senior interview angle

A plain trie walk assumes exactly one child to follow per character. A \`.\` breaks that assumption — it must branch into **every** child at that node and succeed if *any* branch's remaining suffix matches. That turns \`search\` from an O(L) walk into a DFS whose worst case is O(26^(number of dots) · L), which is exactly the tradeoff worth naming out loud in an interview.

## Pattern

\`Trie with wildcard DFS\` — extends the plain trie walk from Implement Trie with backtracking-style branching whenever a wildcard is hit.`,
    starterCode: `class WordDictionary {
  constructor() {
    // Your code here
  }

  /**
   * @param {string} word
   */
  addWord(word) {
    // Your code here
  }

  /**
   * @param {string} word
   * @return {boolean}
   */
  search(word) {
    // Your code here
  }
}`,
    testCases: [
      {
        operations: [
          "WordDictionary",
          "addWord",
          "addWord",
          "addWord",
          "search",
          "search",
          "search",
          "search",
        ],
        args: [[], ["bad"], ["dad"], ["mad"], ["pad"], ["bad"], [".ad"], ["b.."]],
        expected: [null, null, null, null, false, true, true, true],
      },
      {
        operations: ["WordDictionary", "addWord", "search", "search", "search"],
        args: [[], ["a"], ["."], [".."], ["a."]],
        expected: [null, null, true, false, false],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Flat Word List, Per-Character Comparison)",
        timeComplexity: "O(n · L) per search, n = words stored, L = string length",
        spaceComplexity: "O(n · L)",
        overviewMarkdown:
          "Store every added word in a plain array. For `search`, first filter to words of the same length as the query (a wildcard still occupies exactly one position), then compare position-by-position, treating `.` as an automatic match at that index. No shared structure between words, so every query re-checks every stored word from scratch.",
        code: `class WordDictionary {
  constructor() {
    this.words = [];
  }

  addWord(word) {
    this.words.push(word);
  }

  search(word) {
    for (const stored of this.words) {
      if (stored.length !== word.length) continue;
      let matches = true;
      for (let i = 0; i < word.length; i++) {
        if (word[i] !== "." && word[i] !== stored[i]) {
          matches = false;
          break;
        }
      }
      if (matches) return true;
    }
    return false;
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-7 | \`addWord\` | Just append — no indexing. |
| 10-19 | \`search\` | For every stored word of matching length, compare character by character; a \`.\` in the query auto-matches whatever character is at that index. |
| 13-16 | mismatch check | Only a non-\`.\` character that differs from the stored word breaks the match. |`,
        dryRunMarkdown: `**Dry run 1**:
Add "bad","dad","mad" → words=["bad","dad","mad"].
\`search("pad")\`: compare vs "bad"(p≠b fail), "dad"(p≠d fail), "mad"(p≠m fail) → **false**.
\`search("bad")\`: compare vs "bad" → all chars equal → **true**.
\`search(".ad")\`: vs "bad": '.'→auto, a=a, d=d → match → **true**.
\`search("b..")\`: vs "bad": b=b, '.'→auto, '.'→auto → match → **true**.
Results: [null,null,null,null,false,true,true,true] — matches expected.

**Dry run 2**:
Add "a" → words=["a"].
\`search(".")\`: length matches (1), '.'→auto → **true**.
\`search("..")\`: length 2 ≠ length 1 of "a" → no candidates → **false**.
\`search("a.")\`: length 2 ≠ 1 → **false**.
Results: [null,true,false,false] — matches expected.`,
      },
      {
        approach: "Optimal (Trie with Wildcard DFS)",
        timeComplexity: "O(L) per search with no wildcards; O(26^(#dots) · L) worst case",
        spaceComplexity: "O(total characters inserted)",
        overviewMarkdown:
          "Same trie as Implement Trie for `addWord`. For `search`, DFS position-by-position: a plain character follows its single matching child (if any); a `.` fans out into **every** child at that node, recursing on each, and succeeds if any branch finds the rest of the word. Reaching the end of the word requires landing on a node with `isEnd === true`, exactly like the plain trie's `search`.",
        code: `class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEnd = false;
  }
}

class WordDictionary {
  constructor() {
    this.root = new TrieNode();
  }

  addWord(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch);
    }
    node.isEnd = true;
  }

  search(word) {
    function dfs(node, index) {
      if (index === word.length) return node.isEnd;
      const ch = word[index];

      if (ch !== ".") {
        const next = node.children.get(ch);
        return next !== undefined && dfs(next, index + 1);
      }

      for (const child of node.children.values()) {
        if (dfs(child, index + 1)) return true;
      }
      return false;
    }

    return dfs(this.root, 0);
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 12-19 | \`addWord\` | Identical trie insertion to the plain Trie problem. |
| 22-25 | base case | All characters consumed — success only if this exact node marks the end of an inserted word. |
| 27-30 | literal character | Follow the single matching child if it exists; otherwise this branch fails immediately (no fan-out needed). |
| 32-35 | wildcard branch | \`.\` tries **every** child at this node — the DFS fans out and returns \`true\` the moment any branch succeeds. |`,
        dryRunMarkdown: `**Dry run 1**:
Add "bad","dad","mad" builds three paths sharing no common prefix except the root.
\`search("pad")\`: root has no child 'p' → dfs fails immediately → **false**.
\`search("bad")\`: dfs follows b→a→d, index=3=length, isEnd=true → **true**.
\`search(".ad")\`: dfs at root, ch='.' → fan out to children b,d,m. Branch b: b→(index1)a: ch='a' literal → follow to a-node→(index2)d: literal → follow to d-node, index=3, isEnd=true → **true** (first successful branch short-circuits the rest).
\`search("b..")\`: dfs root ch='b' literal → follow to b's child. index1 ch='.' → fan out to b's single child 'a' → follow. index2 ch='.' → fan out to that node's child 'd' → follow, index=3, isEnd=true → **true**.
Results: [null,null,null,null,false,true,true,true] — matches expected.

**Dry run 2**:
Add "a" → root→a(isEnd=true).
\`search(".")\`: root ch='.' → fan out to child 'a', index=1=length, isEnd=true → **true**.
\`search("..")\`: root ch='.' → fan out to 'a', index1 ch='.' → fan out to a-node's children (none exist) → loop finds nothing → **false**.
\`search("a.")\`: root ch='a' literal → follow to a-node. index1 ch='.' → fan out to a-node's children (none) → **false**.
Results: [null,true,false,false] — matches expected.`,
      },
    ],
    relatedSlugs: ["implement-trie-prefix-tree", "word-search-ii"],
    realWorldUsageMarkdown: `Wildcard trie search is the same mechanism behind fuzzy autocomplete (partial or masked queries), pattern-based dictionary lookups in word games, and glob-style matching in file search tools where a single wildcard character must match any one segment.`,
  },
  {
    slug: "word-search-ii",
    title: "Word Search II",
    difficulty: "hard",
    maangTags: ["Google", "Amazon", "Netflix"],
    topicSlug: "tries",
    functionName: "findWords",
    description: `## Problem

Given an \`m x n\` \`board\` of characters and an array of strings \`words\`, return all words from \`words\` that can be formed by sequentially adjacent (horizontal/vertical) cells, without reusing a cell within a single word.

## Example

\`\`\`
Input: board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]]
       words = ["oath","pea","eat","rain"]
Output: ["eat","oath"]
\`\`\`

## Senior interview angle

Running Word Search's single-word DFS once per word costs O(w · m·n·4^L) — every word repeats the same grid exploration from scratch. Building **one trie from all words first**, then doing a single DFS pass over the board that walks the trie alongside the grid, means the board's cells are explored once total, with the trie telling the DFS which directions are even worth trying (only children that exist in the trie), and where a full word has been completed.

## Pattern

\`Trie-backed grid backtracking\` — the same mark/recurse/unmark grid DFS from Word Search, driven by trie structure instead of a single fixed target string.`,
    starterCode: `/**
 * @param {character[][]} board
 * @param {string[]} words
 * @return {string[]}
 */
function findWords(board, words) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            ["o", "a", "a", "n"],
            ["e", "t", "a", "e"],
            ["i", "h", "k", "r"],
            ["i", "f", "l", "v"],
          ],
          ["oath", "pea", "eat", "rain"],
        ],
        expected: ["eat", "oath"],
        unordered: true,
      },
      {
        input: [
          [
            ["a", "b"],
            ["c", "d"],
          ],
          ["abcb"],
        ],
        expected: [],
        unordered: true,
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Word Search DFS Repeated Per Word)",
        timeComplexity: "O(w · m·n·4^L), w = number of words, L = word length",
        spaceComplexity: "O(L) recursion depth per search",
        overviewMarkdown:
          "For each word independently, run the classic Word Search mark/recurse/unmark DFS from every board cell. Correct, but if two words share a prefix (like \"eat\" appearing inside a longer word), the shared prefix's grid exploration is redone from scratch for every word that needs it.",
        code: `function findWords(board, words) {
  const rows = board.length, cols = board[0].length;

  function existsFrom(word) {
    function dfs(r, c, index) {
      if (index === word.length) return true;
      if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== word[index]) return false;

      const original = board[r][c];
      board[r][c] = "#";
      const found =
        dfs(r + 1, c, index + 1) ||
        dfs(r - 1, c, index + 1) ||
        dfs(r, c + 1, index + 1) ||
        dfs(r, c - 1, index + 1);
      board[r][c] = original;
      return found;
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (dfs(r, c, 0)) return true;
      }
    }
    return false;
  }

  const result = [];
  for (const word of words) {
    if (existsFrom(word)) result.push(word);
  }
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4-24 | \`existsFrom(word)\` | Exactly the Word Search I solution — mark/recurse/unmark DFS from every starting cell, for one fixed target word. |
| 27-30 | driver loop | Runs the entire independent search once per word in \`words\`, with zero sharing of work between words. |`,
        dryRunMarkdown: `**Dry run 1** — \`words=["oath","pea","eat","rain"]\` on board rows \`[o,a,a,n]/[e,t,a,e]/[i,h,k,r]/[i,f,l,v]\`:
\`existsFrom("oath")\`: path o(0,0)→a(0,1)→t(1,1)→h(2,1) — each step adjacent, every character matches → **true** → pushed.
\`existsFrom("pea")\`: board has no \`'p'\` at all, so no starting cell exists → **false** → not pushed.
\`existsFrom("eat")\`: the \`'e'\` at (1,0) has neighbors o,i,t — no adjacent \`'a'\`, dead end. The \`'e'\` at (1,3) has neighbor (1,2)=\`'a'\`, whose neighbor (1,1)=\`'t'\` — path e(1,3)→a(1,2)→t(1,1) matches fully → **true** → pushed.
\`existsFrom("rain")\`: the only \`'r'\` at (2,3) has neighbors e,v,k — no adjacent \`'a'\` → **false** → not pushed.
Result: ["oath","eat"] — same 2 words as expected (checked unordered since array order follows \`words\` iteration order, not the expected list's order).

**Dry run 2** — \`words=["abcb"]\` on 2×2 board [[a,b],[c,d]]:
\`existsFrom("abcb")\`: start (0,0)='a'→(0,1)='b'✓→(1,1)='d'? need 'c' next, try (1,1) neighbor with 'c': (1,0)='c' is adjacent to (1,1)? board is 2x2: (0,0)a,(0,1)b,(1,0)c,(1,1)d. Path a(0,0)→b(0,1)→c? (0,1)'s neighbors are (0,0)[marked],(1,1)=d — no 'c' adjacent to (0,1). Dead end — no valid "abcb" path (would need to revisit 'b', impossible without reusing a cell) → **false** → not pushed.
Result: [] — matches expected.`,
      },
      {
        approach: "Optimal (Single Trie-Backed DFS Pass Over the Board)",
        timeComplexity: "O(m·n·4^L) total, shared across all words instead of repeated per word",
        spaceComplexity: "O(total characters in words) for the trie + O(L) recursion depth",
        overviewMarkdown:
          "Build one trie from every word in `words`, storing the complete word string at the node where it ends. Then run a single DFS pass starting from every board cell: at each step, only follow a direction if the corresponding character exists as a trie child at the current node (the trie prunes the search — no point exploring a grid path no word needs). Whenever a node's `word` field is set, that word has been found; record it and clear the field to avoid duplicate matches. All words that share a prefix reuse the same grid exploration up to where their paths diverge.",
        code: `class TrieNode {
  constructor() {
    this.children = new Map();
    this.word = null; // set to the full word string at the node where it ends
  }
}

function findWords(board, words) {
  const root = new TrieNode();
  for (const word of words) {
    let node = root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch);
    }
    node.word = word;
  }

  const rows = board.length, cols = board[0].length;
  const result = [];

  function dfs(r, c, node) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] === "#") return;
    const ch = board[r][c];
    const next = node.children.get(ch);
    if (!next) return;

    if (next.word !== null) {
      result.push(next.word);
      next.word = null; // avoid duplicate pushes if reached again
    }

    board[r][c] = "#";
    dfs(r + 1, c, next);
    dfs(r - 1, c, next);
    dfs(r, c + 1, next);
    dfs(r, c - 1, next);
    board[r][c] = ch;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dfs(r, c, root);
    }
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 8-15 | trie build | One shared trie for every word — shared prefixes share nodes, so the DFS below explores them once. |
| 21-24 | pruning check | \`node.children.get(ch)\` — if this character isn't a child of the current trie node, no word needs this path, so return immediately without recursing further. |
| 26-29 | word found | \`next.word !== null\` means this trie node is a word's endpoint; record it and null the field so a second path reaching the same node (impossible for distinct words, but defensive) never double-counts. |
| 31-36 | mark/recurse/unmark | Same in-place grid backtracking as Word Search, but branching is driven by \`next\` (the trie node), not a fixed string index. |`,
        dryRunMarkdown: `**Dry run 1** — \`words=["oath","pea","eat","rain"]\`:
Trie built with 4 root children: o→a→t→h(word="oath"), p→e→a(word="pea"), e→a→t(word="eat"), r→a→i→n(word="rain").
DFS from (0,0)='o': root has child 'o' → descend, mark (0,0)='#'. Path (0,0)→(0,1)→(1,1)→(2,1) spells o→a→t→h, each step's trie node has the needed child, final node's word="oath" → **pushed "oath"**, field cleared.
DFS from (1,0)='e': root has child 'e' → descend, mark (1,0). Its neighbors are (0,0)='#' (skipped), (2,0)='i' (e-node has no child 'i'), (1,1)='t' (e-node has no child 't') → dead end, no word found from this start.
DFS from (1,3)='e': root has child 'e' → descend, mark (1,3). Neighbor (1,2)='a' → e-node has child 'a', descend, mark (1,2). Neighbor (1,1)='t' → a-node has child 't', descend — that node's word="eat" → **pushed "eat"**, field cleared.
DFS from (2,0)='i', (3,0)='i': root has no child 'i' → immediate return, no wasted exploration.
No cell chain ever completes "pea" or "rain" on this board (root's p/r children get tried but no full adjacent path completes) → never pushed.
Result: ["oath","eat"] (order reflects board-scan discovery order) — same 2 words as expected (unordered match).

**Dry run 2** — \`words=["abcb"]\`, board=[[a,b],[c,d]]:
Trie: a→b→c→b(word="abcb").
DFS from (0,0)='a': root has child 'a' → descend, mark (0,0). Neighbor (0,1)='b': a-node has child 'b' → descend, mark (0,1). Neighbors of (0,1): (0,0) is '#' (skip, board[r][c]==='#' triggers early return), (1,1)='d': b-node has no child 'd' → return. No other unmarked neighbor holds 'c'. Dead end — "abcb" never completed (needs to revisit 'b', but that cell is marked). Unmark, backtrack fully.
Result: [] — matches expected.`,
      },
    ],
    relatedSlugs: ["word-search", "design-add-and-search-words-data-structure", "implement-trie-prefix-tree"],
    realWorldUsageMarkdown: `Trie-backed grid search is the production technique behind word-game solvers (Boggle solvers scan a board against an entire dictionary trie in one pass), OCR post-processing that validates detected letter grids against a lexicon, and any "find all dictionary matches in a 2D character layout" tool where checking words one at a time would be far too slow.`,
  },
];

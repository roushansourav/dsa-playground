import type { Problem } from "../types";

export const designProblems: Problem[] = [
  {
    slug: "lru-cache",
    title: "LRU Cache",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta", "Google", "Apple"],
    topicSlug: "design",
    functionName: "LRUCache",
    description: `## Problem

Design a Least Recently Used (LRU) cache with a fixed \`capacity\`. Implement:
- \`LRUCache(capacity)\` initializes the cache.
- \`get(key)\` returns the value if the key exists (marking it as most recently used), else \`-1\`.
- \`put(key, value)\` inserts or updates the value; if the cache is at capacity, evict the least recently used entry first.

Both operations must run in **O(1)** average time.

## Example

\`\`\`
Input:  ["LRUCache","put","put","get","put","get","put","get","get","get"]
        [[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]
Output: [null,null,null,1,null,-1,null,-1,3,4]
\`\`\`

## Constraints

- \`1 <= capacity <= 3000\`
- At most \`2 * 10^4\` calls to \`get\` and \`put\`.

## Senior interview angle

The O(1)-for-both-ops constraint is the entire problem: a plain array or object gets O(1) lookup but O(n) "move to most-recently-used position," and a plain linked list gets O(1) reordering but O(n) lookup. The combination — a hashmap for O(1) key lookup pointing directly at nodes in a doubly linked list for O(1) reordering/eviction — is the single most common "combine two structures to cancel out each one's weakness" interview pattern, and it recurs (LFU cache, browser history, undo/redo stacks).

## Pattern

\`Hashmap + doubly linked list\` — the hashmap gives O(1) access to any node; the linked list gives O(1) reordering to front (most recent) and O(1) eviction from the back (least recent).`,
    starterCode: `class LRUCache {
  /**
   * @param {number} capacity
   */
  constructor(capacity) {
    // Your code here
  }

  /**
   * @param {number} key
   * @return {number}
   */
  get(key) {
    // Your code here
  }

  /**
   * @param {number} key
   * @param {number} value
   * @return {void}
   */
  put(key, value) {
    // Your code here
  }
}`,
    testCases: [
      {
        operations: ["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"],
        args: [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]],
        expected: [null, null, null, 1, null, -1, null, -1, 3, 4],
      },
      {
        operations: ["LRUCache", "put", "get", "put", "get", "get"],
        args: [[1], [2, 1], [2], [3, 2], [2], [3]],
        expected: [null, null, 1, null, -1, 2],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Array of Pairs, Linear Scan)",
        timeComplexity: "O(n) get and put",
        spaceComplexity: "O(capacity)",
        overviewMarkdown:
          "Store entries as an array of [key, value] pairs ordered oldest-to-newest. Every get/put linearly scans for the key, splices it out, and pushes it to the back (marking it most recently used). Eviction removes index 0. Correct, but every access is O(n) — exactly the cost the real problem is designed to force you past.",
        code: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.entries = [];
  }

  _indexOf(key) {
    return this.entries.findIndex(([k]) => k === key);
  }

  get(key) {
    const idx = this._indexOf(key);
    if (idx === -1) return -1;
    const [, value] = this.entries[idx];
    this.entries.splice(idx, 1);
    this.entries.push([key, value]);
    return value;
  }

  put(key, value) {
    const idx = this._indexOf(key);
    if (idx !== -1) {
      this.entries.splice(idx, 1);
    } else if (this.entries.length >= this.capacity) {
      this.entries.shift();
    }
    this.entries.push([key, value]);
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 8-14 | \`get(key)\` splices the found pair out and pushes it to the back | Marks the key as most recently used, but \`_indexOf\` and \`splice\` are both O(n). |
| 16-23 | \`put(key, value)\` evicts index 0 (oldest) when at capacity | Correct LRU eviction order, at the cost of an O(n) scan per call. |`,
        dryRunMarkdown: `**Dry run (capacity=2)**: put(1,1)→entries=[[1,1]]. put(2,2)→entries=[[1,1],[2,2]]. get(1)→found at idx0, move to back→entries=[[2,2],[1,1]], return 1. put(3,3)→at capacity, evict front [2,2]→entries=[[1,1],[3,3]]. get(2)→not found→-1. put(4,4)→evict front [1,1]→entries=[[3,3],[4,4]]. get(1)→-1. get(3)→3. get(4)→4. Output matches **[null,null,null,1,null,-1,null,-1,3,4]** — matches expected.`,
      },
      {
        approach: "Optimal (Hashmap + Doubly Linked List)",
        timeComplexity: "O(1) get and put",
        spaceComplexity: "O(capacity)",
        overviewMarkdown:
          "Maintain a Map from key to linked-list node, plus a doubly linked list with dummy head/tail sentinels. Most-recently-used nodes live near the head; least-recently-used near the tail. get/put both remove the accessed node from its current position and re-insert it at the front in O(1) — no scanning needed. Eviction on a full cache removes the node just before the tail sentinel (the true LRU entry) in O(1).",
        code: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = { key: null, value: null, prev: null, next: null };
    this.tail = { key: null, value: null, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _addToFront(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this._remove(node);
    this._addToFront(node);
    return node.value;
  }

  put(key, value) {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.value = value;
      this._remove(node);
      this._addToFront(node);
      return;
    }
    if (this.map.size >= this.capacity) {
      const lru = this.tail.prev;
      this._remove(lru);
      this.map.delete(lru.key);
    }
    const node = { key, value, prev: null, next: null };
    this._addToFront(node);
    this.map.set(key, node);
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4-8 | dummy \`head\`/\`tail\` sentinels | Avoid special-casing empty-list edge cases when adding/removing nodes. |
| 21-26 | \`get(key)\` moves the node to the front | O(1): the Map gives direct node access, and linked-list splicing needs no traversal. |
| 28-44 | \`put(key, value)\` evicts \`this.tail.prev\` (the real LRU node) when full | The node just before the tail sentinel is always the least recently used, by construction. |`,
        dryRunMarkdown: `**Dry run (capacity=1)**: put(2,1)→list: head↔[2:1]↔tail, map={2→node}. get(2)→found, move to front (no-op, already only node), return 1. put(3,2)→map.size(1)>=capacity(1)→evict tail.prev=[2:1]→map={}, then add [3:2] to front→list: head↔[3:2]↔tail. get(2)→not in map→-1. get(3)→found→2. Output **[null,null,1,null,-1,2]** — matches expected.`,
      },
    ],
    relatedSlugs: ["lfu-cache", "time-based-key-value-store"],
    realWorldUsageMarkdown: `LRU eviction is the default policy in nearly every real cache layer — CPU caches, database buffer pools, CDN edge caches, and application-level caches like Redis's \`allkeys-lru\` — because "recently accessed data will likely be accessed again soon" holds well enough in practice to be the sane default, and O(1) get/put is what makes it viable at the throughput those systems need.`,
  },
  {
    slug: "lfu-cache",
    title: "LFU Cache",
    difficulty: "hard",
    maangTags: ["Amazon", "Google"],
    topicSlug: "design",
    functionName: "LFUCache",
    description: `## Problem

Design a Least Frequently Used (LFU) cache with a fixed \`capacity\`. Implement:
- \`LFUCache(capacity)\` initializes the cache.
- \`get(key)\` returns the value if present (incrementing its use frequency), else \`-1\`.
- \`put(key, value)\` inserts or updates the value (incrementing its use frequency). If the cache is full, evict the **least frequently used** entry; on a tie, evict the **least recently used** among those tied entries.

Both operations must run in **O(1)** average time.

## Example

\`\`\`
Input:  ["LFUCache","put","put","get","put","get","get","put","get","get","get"]
        [[2],[1,1],[2,2],[1],[3,3],[2],[3],[4,4],[1],[3],[4]]
Output: [null,null,null,1,null,-1,3,null,-1,3,4]
\`\`\`

## Constraints

- \`0 <= capacity <= 10^4\`
- At most \`2 * 10^5\` calls to \`get\` and \`put\`.

## Senior interview angle

This is LRU Cache's harder sibling and the standard follow-up: instead of one ordering (recency), it needs two, with a tie-break. The O(1) trick generalizes the hashmap-plus-linked-list idea one level further — group keys into buckets **by frequency**, where each bucket is itself an insertion-ordered structure (so within a frequency, the LRU tie-break falls out for free), and track only the single smallest frequency that currently has any keys in it, so eviction never has to scan for "which frequency is lowest."

## Pattern

\`Frequency buckets of LRU groups + a running min-frequency pointer\` — every frequency maps to an ordered set of keys; eviction always pulls from the min-frequency bucket's oldest entry, and the min-frequency pointer is maintained incrementally instead of recomputed.`,
    starterCode: `class LFUCache {
  /**
   * @param {number} capacity
   */
  constructor(capacity) {
    // Your code here
  }

  /**
   * @param {number} key
   * @return {number}
   */
  get(key) {
    // Your code here
  }

  /**
   * @param {number} key
   * @param {number} value
   * @return {void}
   */
  put(key, value) {
    // Your code here
  }
}`,
    testCases: [
      {
        operations: [
          "LFUCache",
          "put",
          "put",
          "get",
          "put",
          "get",
          "get",
          "put",
          "get",
          "get",
          "get",
        ],
        args: [[2], [1, 1], [2, 2], [1], [3, 3], [2], [3], [4, 4], [1], [3], [4]],
        expected: [null, null, null, 1, null, -1, 3, null, -1, 3, 4],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Map + Linear Scan for Eviction)",
        timeComplexity: "O(1) get, O(n) put (on eviction)",
        spaceComplexity: "O(capacity)",
        overviewMarkdown:
          "Store every entry as { value, freq, time } keyed by key in a Map, where time is a monotonically increasing logical clock updated on every access. get/put bump both freq and time. On eviction, linearly scan every entry to find the one with the smallest freq (breaking ties by smallest time). Correct, but that scan makes eviction O(n) instead of O(1).",
        code: `class LFUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.clock = 0;
  }

  _touch(entry) {
    entry.freq++;
    entry.time = this.clock++;
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const entry = this.map.get(key);
    this._touch(entry);
    return entry.value;
  }

  put(key, value) {
    if (this.capacity === 0) return;
    if (this.map.has(key)) {
      const entry = this.map.get(key);
      entry.value = value;
      this._touch(entry);
      return;
    }
    if (this.map.size >= this.capacity) {
      let evictKey = null;
      let evictEntry = null;
      for (const [k, entry] of this.map) {
        if (
          !evictEntry ||
          entry.freq < evictEntry.freq ||
          (entry.freq === evictEntry.freq && entry.time < evictEntry.time)
        ) {
          evictKey = k;
          evictEntry = entry;
        }
      }
      this.map.delete(evictKey);
    }
    this.map.set(key, { value, freq: 1, time: this.clock++ });
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 7-10 | \`_touch(entry)\` bumps frequency and logical time | Both \`get\` and \`put\` on an existing key count as a "use." |
| 24-35 | linear scan for the entry with smallest (freq, time) | Correctly implements the tie-break rule, but costs O(n) per eviction. |`,
        dryRunMarkdown: `**Dry run (capacity=2)**: put(1,1)→map={1:{v1,f1,t0}}. put(2,2)→map={1:{v1,f1,t0},2:{v2,f1,t1}}. get(1)→touch→{v1,f2,t2}, return 1. put(3,3)→full, scan: key1 freq2, key2 freq1(lower)→evict key2→map={1:{v1,f2,t2},3:{v3,f1,t3}}. get(2)→not found→-1. get(3)→touch→{v3,f2,t4}, return 3. put(4,4)→full, both key1 and key3 have freq2, key1 has smaller time(2)<key3's(4)→evict key1→map={3:...,4:{v4,f1,t5}}. get(1)→-1. get(3)→3. get(4)→4. Output **[null,null,null,1,null,-1,3,null,-1,3,4]** — matches expected.`,
      },
      {
        approach: "Optimal (Frequency Buckets + Min-Frequency Pointer)",
        timeComplexity: "O(1) get and put",
        spaceComplexity: "O(capacity)",
        overviewMarkdown:
          "Keep a keyMap (key → { value, freq }) and a freqMap (freq → Map of keys in insertion order, acting as an LRU ordering within that frequency). Track minFreq, the smallest frequency currently populated. On every touch, remove the key from its old frequency bucket (bumping minFreq if that bucket just emptied and was the minimum) and re-insert it into the new freq+1 bucket. On eviction, pull the first (oldest) key straight out of the minFreq bucket — no scanning required anywhere.",
        code: `class LFUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.keyMap = new Map();
    this.freqMap = new Map();
    this.minFreq = 0;
  }

  _touch(key) {
    const node = this.keyMap.get(key);
    const oldFreq = node.freq;
    this.freqMap.get(oldFreq).delete(key);
    if (this.freqMap.get(oldFreq).size === 0) {
      this.freqMap.delete(oldFreq);
      if (this.minFreq === oldFreq) this.minFreq++;
    }
    node.freq++;
    if (!this.freqMap.has(node.freq)) this.freqMap.set(node.freq, new Map());
    this.freqMap.get(node.freq).set(key, true);
  }

  get(key) {
    if (!this.keyMap.has(key)) return -1;
    const value = this.keyMap.get(key).value;
    this._touch(key);
    return value;
  }

  put(key, value) {
    if (this.capacity === 0) return;
    if (this.keyMap.has(key)) {
      this.keyMap.get(key).value = value;
      this._touch(key);
      return;
    }
    if (this.keyMap.size >= this.capacity) {
      const evictMap = this.freqMap.get(this.minFreq);
      const evictKey = evictMap.keys().next().value;
      evictMap.delete(evictKey);
      if (evictMap.size === 0) this.freqMap.delete(this.minFreq);
      this.keyMap.delete(evictKey);
    }
    this.keyMap.set(key, { value, freq: 1 });
    if (!this.freqMap.has(1)) this.freqMap.set(1, new Map());
    this.freqMap.get(1).set(key, true);
    this.minFreq = 1;
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 8-18 | \`_touch(key)\` moves a key between frequency buckets | Bumps \`minFreq\` only when the bucket it's leaving both empties out and was the current minimum. |
| 32-37 | eviction pulls \`evictMap.keys().next().value\` | \`Map\` preserves insertion order, so the first key in the \`minFreq\` bucket is the least-recently-touched among the least-frequently-used — exactly the tie-break rule, with zero scanning. |
| 43 | \`this.minFreq = 1;\` | Every newly inserted key starts at frequency 1, which is always the new minimum. |`,
        dryRunMarkdown: `**Dry run (capacity=2)**: put(1,1)→keyMap={1:{v1,f1}}, freqMap={1:{1}}, minFreq=1. put(2,2)→freqMap={1:{1,2}}. get(1)→touch: remove 1 from freq1(now {2}, not empty, minFreq stays 1), add to freq2→freqMap={1:{2},2:{1}}, return 1. put(3,3)→full, evict from freqMap.get(minFreq=1)→first key is 2→evict key2→freqMap={2:{1}}, keyMap={1:...}. Insert 3 at freq1→freqMap={1:{3},2:{1}}, minFreq=1. get(2)→not in keyMap→-1. get(3)→touch: freq1 bucket empties and was minFreq→minFreq becomes 2→freqMap={2:{1,3}}, return 3. put(4,4)→full, evict from freqMap.get(minFreq=2), first key is 1 (inserted into freq2 before 3 was)→evict key1→freqMap={2:{3}}. Insert 4 at freq1→minFreq=1. get(1)→-1. get(3)→3. get(4)→4. Output **[null,null,null,1,null,-1,3,null,-1,3,4]** — matches expected.`,
      },
    ],
    relatedSlugs: ["lru-cache", "insert-delete-getrandom-o1"],
    realWorldUsageMarkdown: `LFU eviction shows up wherever "popularity" matters more than "recency" — CDN caches deciding which assets to keep warm based on long-run request volume rather than just the last access, or database query-plan caches that want to keep the historically hottest queries compiled even if they weren't the very last one run.`,
  },
  {
    slug: "time-based-key-value-store",
    title: "Time Based Key-Value Store",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta"],
    topicSlug: "design",
    functionName: "TimeMap",
    description: `## Problem

Design a time-based key-value store. Implement:
- \`TimeMap()\` initializes the store.
- \`set(key, value, timestamp)\` stores the value for the given key at the given timestamp.
- \`get(key, timestamp)\` returns the value associated with \`key\` at the largest recorded timestamp that is \`<= timestamp\`, or \`""\` if none exists.

\`set\` calls for the same key are guaranteed to arrive with strictly increasing timestamps.

## Example

\`\`\`
Input:  ["TimeMap","set","get","get","set","get","get"]
        [[],["foo","bar",1],["foo",1],["foo",3],["foo","bar2",4],["foo",4],["foo",5]]
Output: [null,null,"bar","bar",null,"bar2","bar2"]
\`\`\`

## Constraints

- \`1 <= timestamp <= 10^7\`

## Senior interview angle

The constraint that timestamps arrive strictly increasing per key is the whole unlock: it means each key's history is already sorted the moment it's appended, with zero extra work. That turns "find the largest timestamp <= target" into a textbook binary search for the rightmost value satisfying a predicate — the same "search on a monotonic condition" shape as finding an insertion point, rather than a literal sorted-array lookup for an exact value.

## Pattern

\`Per-key sorted append log + binary search\` — since inserts arrive in increasing timestamp order, no sort step is ever needed; binary search directly finds the rightmost entry with timestamp <= target.`,
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
        operations: ["TimeMap", "set", "get"],
        args: [[], ["a", "hello", 1], ["a", 0]],
        expected: [null, null, ""],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Linear Scan Per Get)",
        timeComplexity: "O(1) set, O(n) get",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Append every [timestamp, value] pair to a per-key array on set. On get, scan from the front, keeping track of the last value seen with a timestamp <= the target, stopping as soon as a timestamp exceeds it. Correct — relies on the same guaranteed-increasing-timestamp property — but the scan is O(n) in the worst case instead of O(log n).",
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
| 6-9 | \`set\` appends to the key's array | Timestamps arrive strictly increasing, so no sort is ever needed. |
| 11-22 | \`get\` scans forward until a timestamp exceeds the target | Keeps the last value seen with \`ts <= timestamp\` as the running answer. |`,
        dryRunMarkdown: `**Dry run (set("foo","bar",1), get("foo",1), get("foo",3))**: entries for "foo" = [[1,"bar"]]. get(1): ts1<=1→result="bar", loop ends→return "bar". get(3): ts1<=3→result="bar", loop ends (no more entries)→return "bar". Matches expected first two outputs.`,
      },
      {
        approach: "Optimal (Binary Search on the Per-Key Timestamp Log)",
        timeComplexity: "O(1) set, O(log n) get",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Same per-key append-only array as the brute force, but get uses binary search to find the rightmost entry with timestamp <= target directly, instead of scanning linearly. Every set is still O(1) amortized (a simple push); only the lookup strategy changes.",
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

    let lo = 0;
    let hi = entries.length - 1;
    let result = "";

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (entries[mid][0] <= timestamp) {
        result = entries[mid][1];
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    return result;
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 13-22 | binary search for the rightmost \`timestamp <= target\` | Every time \`entries[mid][0] <= timestamp\` holds, that's a candidate answer, but there might be a later (larger) timestamp that's still \`<= target\` — so search continues rightward (\`lo = mid + 1\`) instead of stopping. |`,
        dryRunMarkdown: `**Dry run (set("foo","bar",1), set("foo","bar2",4), get("foo",4), get("foo",5))**: entries=[[1,"bar"],[4,"bar2"]]. get(4): lo=0,hi=1,mid=0: entries[0][0]=1<=4→result="bar",lo=1. mid=1: entries[1][0]=4<=4→result="bar2",lo=2>hi, stop→return "bar2". get(5): same log, mid=0→result="bar",lo=1; mid=1→4<=5→result="bar2",lo=2, stop→return "bar2". Output **[null,null,"bar","bar",null,"bar2","bar2"]** — matches expected.`,
      },
    ],
    relatedSlugs: ["lru-cache", "design-underground-system"],
    realWorldUsageMarkdown: `"Give me the value as of time T" is exactly what temporal/versioned databases (and Git's "show this file as of this commit") answer — an append-only, timestamp-ordered log per key with binary search for point-in-time lookups, rather than mutating a single current value in place.`,
  },
  {
    slug: "insert-delete-getrandom-o1",
    title: "Insert Delete GetRandom O(1)",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta", "Google"],
    topicSlug: "design",
    functionName: "RandomizedSet",
    description: `## Problem

Design a data structure that supports, all in **average O(1)** time:
- \`insert(val)\`: inserts \`val\` if not already present, returns whether it was inserted.
- \`remove(val)\`: removes \`val\` if present, returns whether it was removed.
- \`getRandom()\`: returns a uniformly random element from the currently present elements.

## Example

\`\`\`
Input:  ["RandomizedSet","insert","remove","insert","getRandom","remove","insert","getRandom"]
        [[],[1],[2],[2],[],[1],[2],[]]
Output: [null,true,false,true,2,true,false,2]
\`\`\`

## Constraints

- All values are integers.

## Senior interview angle

The tension is that a Set alone gives O(1) insert/remove/membership but no O(1) uniform-random-access (you can't index into a Set), while an array gives O(1) uniform-random-access (via a random index) but O(n) removal (splicing shifts everything after it). The resolution — an array for getRandom, paired with a Map from value to its array index for O(1) lookup — needs one more trick to keep removal O(1): instead of splicing (O(n)), swap the element to remove with the array's last element, then pop (O(1)), updating the swapped element's index in the Map.

## Pattern

\`Array + index map, swap-to-last-and-pop removal\` — the classic technique for O(1) removal from an unordered array-backed set without ever shifting elements.`,
    starterCode: `class RandomizedSet {
  constructor() {
    // Your code here
  }

  /**
   * @param {number} val
   * @return {boolean}
   */
  insert(val) {
    // Your code here
  }

  /**
   * @param {number} val
   * @return {boolean}
   */
  remove(val) {
    // Your code here
  }

  /**
   * @return {number}
   */
  getRandom() {
    // Your code here
  }
}`,
    testCases: [
      {
        operations: [
          "RandomizedSet",
          "insert",
          "remove",
          "insert",
          "getRandom",
          "remove",
          "insert",
          "getRandom",
        ],
        args: [[], [1], [2], [2], [], [1], [2], []],
        expected: [null, true, false, true, null, true, false, null],
        skipOutputCheck: [4, 7],
      },
      {
        operations: ["RandomizedSet", "insert", "insert", "remove", "insert"],
        args: [[], [0], [0], [0], [0]],
        expected: [null, true, false, true, true],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Array With indexOf Scans)",
        timeComplexity: "O(n) insert and remove, O(1) getRandom",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Keep all values in a plain array. insert checks membership via includes() (O(n)) before pushing; remove finds the index via indexOf() (O(n)) then splices it out (another O(n) shift). getRandom is already O(1) — just index into the array with a random integer. Correct, but insert/remove don't meet the O(1) requirement.",
        code: `class RandomizedSet {
  constructor() {
    this.values = [];
  }

  insert(val) {
    if (this.values.includes(val)) return false;
    this.values.push(val);
    return true;
  }

  remove(val) {
    const idx = this.values.indexOf(val);
    if (idx === -1) return false;
    this.values.splice(idx, 1);
    return true;
  }

  getRandom() {
    const idx = Math.floor(Math.random() * this.values.length);
    return this.values[idx];
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-8 | \`insert\` uses \`includes()\` | O(n) membership check before pushing. |
| 11-15 | \`remove\` uses \`indexOf()\` + \`splice()\` | Both O(n) — splice also shifts every subsequent element down by one. |`,
        dryRunMarkdown: `**Dry run**: insert(1)→not present→push→values=[1], true. remove(2)→indexOf(2)=-1→false. insert(2)→push→values=[1,2], true. getRandom()→random index into [1,2] (non-deterministic, not checked). remove(1)→indexOf(1)=0→splice→values=[2], true. insert(2)→includes(2)→false. getRandom()→only [2] left (non-deterministic, not checked). Deterministic outputs **[null,true,false,true,·,true,false,·]** match expected (getRandom slots skipped) — matches expected.`,
      },
      {
        approach: "Optimal (Array + Index Map, Swap-to-Last Removal)",
        timeComplexity: "O(1) insert, remove, and getRandom",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Keep the same backing array for getRandom, but add a Map from value to its current index in that array. insert is O(1): push, then record its index. remove is the key trick: instead of splicing (which shifts everything after the removed index), swap the target with the array's last element, update the swapped element's recorded index, then pop the array's last slot off — no shifting, so it's O(1).",
        code: `class RandomizedSet {
  constructor() {
    this.values = [];
    this.indexOf = new Map();
  }

  insert(val) {
    if (this.indexOf.has(val)) return false;
    this.indexOf.set(val, this.values.length);
    this.values.push(val);
    return true;
  }

  remove(val) {
    if (!this.indexOf.has(val)) return false;
    const idx = this.indexOf.get(val);
    const last = this.values[this.values.length - 1];
    this.values[idx] = last;
    this.indexOf.set(last, idx);
    this.values.pop();
    this.indexOf.delete(val);
    return true;
  }

  getRandom() {
    const idx = Math.floor(Math.random() * this.values.length);
    return this.values[idx];
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-10 | \`insert\` records the new value's index before pushing | \`this.values.length\` at push time is exactly the index the pushed value will land at. |
| 13-20 | \`remove\` swaps the target with the last element, then pops | Avoids ever shifting array elements; the swapped element's map entry is updated to its new (the removed) index. |`,
        dryRunMarkdown: `**Dry run**: insert(1)→values=[1], indexOf={1:0}, true. remove(2)→not in map→false. insert(2)→values=[1,2], indexOf={1:0,2:1}, true. getRandom()→(skipped). remove(1)→idx=0, last=2, values[0]=2→values=[2,2]→then pop→values=[2], indexOf={2:0}, true. insert(2)→already in map→false. getRandom()→(skipped). Deterministic outputs **[null,true,false,true,·,true,false,·]** — matches expected.`,
      },
    ],
    relatedSlugs: ["lfu-cache", "design-hashmap"],
    realWorldUsageMarkdown: `The swap-to-last-and-pop removal trick is used anywhere an unordered collection needs both O(1) membership/removal and O(1) uniform sampling — game engines removing a random enemy from an active-entities pool, or A/B testing frameworks sampling uniformly from a currently-eligible-users set that's constantly being inserted into and removed from.`,
  },
  {
    slug: "design-hashmap",
    title: "Design HashMap",
    difficulty: "easy",
    maangTags: ["Amazon", "Apple"],
    topicSlug: "design",
    functionName: "MyHashMap",
    description: `## Problem

Design a HashMap without using any built-in hash table library. Implement:
- \`MyHashMap()\` initializes the map.
- \`put(key, value)\` inserts or updates the value for \`key\`.
- \`get(key)\` returns the value for \`key\`, or \`-1\` if not present.
- \`remove(key)\` removes the mapping for \`key\` if it exists.

## Example

\`\`\`
Input:  ["MyHashMap","put","put","get","get","put","get","remove","get"]
        [[],[1,1],[2,2],[1],[3],[2,1],[2],[2],[2]]
Output: [null,null,null,1,-1,null,1,null,-1]
\`\`\`

## Constraints

- \`0 <= key, value <= 10^6\`
- At most \`10^4\` calls total.

## Senior interview angle

This is the rare problem where the "brute force" (direct addressing — a giant array indexed straight by key) is actually O(1), and the "optimal" solution is about something other than speed: real hashmaps can't afford to pre-allocate an array sized to the entire possible key space (imagine keys were 64-bit integers or arbitrary strings), so the point is demonstrating the actual mechanism — a hash function compressing an unbounded key space into a small fixed number of buckets, plus chaining to resolve the collisions that compression inevitably creates.

## Pattern

\`Hash function (modulo) + bucket chaining\` — compress a large or unbounded key space into a fixed number of buckets, and store colliding keys together (as a small list) within the same bucket.`,
    starterCode: `class MyHashMap {
  constructor() {
    // Your code here
  }

  /**
   * @param {number} key
   * @param {number} value
   * @return {void}
   */
  put(key, value) {
    // Your code here
  }

  /**
   * @param {number} key
   * @return {number}
   */
  get(key) {
    // Your code here
  }

  /**
   * @param {number} key
   * @return {void}
   */
  remove(key) {
    // Your code here
  }
}`,
    testCases: [
      {
        operations: ["MyHashMap", "put", "put", "get", "get", "put", "get", "remove", "get"],
        args: [[], [1, 1], [2, 2], [1], [3], [2, 1], [2], [2], [2]],
        expected: [null, null, null, 1, -1, null, 1, null, -1],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Direct-Address Array)",
        timeComplexity: "O(1) all operations",
        spaceComplexity: "O(max possible key) — allocates the full key range upfront",
        overviewMarkdown:
          "Since keys are bounded (0 to 10^6), allocate one giant array covering the entire possible key range and use the key itself as the index — no hashing at all. Every operation is genuinely O(1), but the structure only works because the key space happens to be small and dense; it wastes massive space the moment keys are sparse (e.g. only a few keys used out of a huge range) or the key type isn't a small bounded integer.",
        code: `class MyHashMap {
  constructor() {
    this.table = new Array(1000001).fill(-1);
  }

  put(key, value) {
    this.table[key] = value;
  }

  get(key) {
    return this.table[key];
  }

  remove(key) {
    this.table[key] = -1;
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`new Array(1000001).fill(-1)\` | Pre-allocates a slot for every possible key value in the stated constraints — direct addressing, no hash function needed. |
| 6-14 | \`put\`/\`get\`/\`remove\` index straight by key | O(1), but only because the key range is small enough to allocate in full. |`,
        dryRunMarkdown: `**Dry run**: put(1,1)→table[1]=1. put(2,2)→table[2]=2. get(1)→table[1]=1. get(3)→table[3]=-1 (never set). put(2,1)→table[2]=1 (overwrite). get(2)→1. remove(2)→table[2]=-1. get(2)→-1. Output **[null,null,null,1,-1,null,1,null,-1]** — matches expected.`,
      },
      {
        approach: "Optimal (Hash Function + Bucket Chaining)",
        timeComplexity: "O(1) average, O(n) worst case per bucket",
        spaceComplexity: "O(n) — proportional to keys actually stored, not the key range",
        overviewMarkdown:
          "Allocate a small, fixed number of buckets (e.g. 1000), each holding a list of [key, value] pairs. A hash function (key % numBuckets) maps any key — no matter how large the key space is — into one of those buckets. Within a bucket, a linear scan finds the matching key (collisions are resolved by chaining multiple keys in the same bucket). This is what makes hashmaps actually general-purpose: space scales with keys stored, not with the size of the possible key universe.",
        code: `class MyHashMap {
  constructor() {
    this.buckets = new Array(1000).fill(null).map(() => []);
  }

  _hash(key) {
    return key % this.buckets.length;
  }

  put(key, value) {
    const bucket = this.buckets[this._hash(key)];
    const pair = bucket.find((entry) => entry[0] === key);
    if (pair) {
      pair[1] = value;
    } else {
      bucket.push([key, value]);
    }
  }

  get(key) {
    const bucket = this.buckets[this._hash(key)];
    const pair = bucket.find((entry) => entry[0] === key);
    return pair ? pair[1] : -1;
  }

  remove(key) {
    const bucket = this.buckets[this._hash(key)];
    const index = bucket.findIndex((entry) => entry[0] === key);
    if (index !== -1) bucket.splice(index, 1);
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-8 | \`_hash(key)\` | Compresses any key (from an arbitrarily large key space) into one of a small fixed number of bucket indices. |
| 10-17 | \`put\` scans only the target bucket | Collisions land in the same bucket as a small list, scanned linearly — cheap as long as buckets stay small on average. |`,
        dryRunMarkdown: `**Dry run**: put(1,1)→hash(1)=1→buckets[1]=[[1,1]]. put(2,2)→hash(2)=2→buckets[2]=[[2,2]]. get(1)→buckets[1] has [1,1]→1. get(3)→hash(3)=3→buckets[3]=[]→-1. put(2,1)→buckets[2] find key2, update pair[1]=1. get(2)→1. remove(2)→buckets[2] becomes []. get(2)→-1. Output **[null,null,null,1,-1,null,1,null,-1]** — matches expected.`,
      },
    ],
    relatedSlugs: ["insert-delete-getrandom-o1", "lru-cache"],
    realWorldUsageMarkdown: `Every language's built-in dictionary/hashmap (JS's Map/Object, Python's dict, Java's HashMap) is this exact structure under the hood — a hash function compressing keys into a manageable bucket count, with chaining or open addressing to survive collisions, resized as the number of stored keys grows.`,
  },
  {
    slug: "design-circular-queue",
    title: "Design Circular Queue",
    difficulty: "medium",
    maangTags: ["Google", "Amazon"],
    topicSlug: "design",
    functionName: "MyCircularQueue",
    description: `## Problem

Design a circular queue (ring buffer) with a fixed size \`k\`. Implement:
- \`MyCircularQueue(k)\` initializes the queue with capacity \`k\`.
- \`enQueue(value)\`: inserts an element; returns whether it succeeded.
- \`deQueue()\`: removes the front element; returns whether it succeeded.
- \`Front()\`: returns the front element, or \`-1\` if empty.
- \`Rear()\`: returns the last element, or \`-1\` if empty.
- \`isEmpty()\` / \`isFull()\`: return the corresponding boolean.

## Example

\`\`\`
Input:  ["MyCircularQueue","enQueue","enQueue","enQueue","enQueue","Rear","isFull","deQueue","enQueue","Rear"]
        [[3],[1],[2],[3],[4],[],[],[],[4],[]]
Output: [null,true,true,true,false,3,true,true,true,4]
\`\`\`

## Constraints

- \`1 <= k <= 1000\`

## Senior interview angle

The naive fix-size queue implemented with a plain array and shift() for dequeue is functionally correct but shift() is O(n) — every remaining element gets re-indexed down by one. The ring-buffer trick avoids that entirely: use a fixed-size array plus a head index and a count (or head/tail indices), and "advance" head/tail with modulo arithmetic instead of ever physically moving elements — turning every operation into true O(1), which is the entire point of a circular buffer over a plain array queue.

## Pattern

\`Fixed-size array + modulo-wrapped head/tail pointers\` — never shift elements; move the logical start/end pointers around the array's fixed slots instead.`,
    starterCode: `class MyCircularQueue {
  /**
   * @param {number} k
   */
  constructor(k) {
    // Your code here
  }

  /**
   * @param {number} value
   * @return {boolean}
   */
  enQueue(value) {
    // Your code here
  }

  /**
   * @return {boolean}
   */
  deQueue() {
    // Your code here
  }

  /**
   * @return {number}
   */
  Front() {
    // Your code here
  }

  /**
   * @return {number}
   */
  Rear() {
    // Your code here
  }

  /**
   * @return {boolean}
   */
  isEmpty() {
    // Your code here
  }

  /**
   * @return {boolean}
   */
  isFull() {
    // Your code here
  }
}`,
    testCases: [
      {
        operations: [
          "MyCircularQueue",
          "enQueue",
          "enQueue",
          "enQueue",
          "enQueue",
          "Rear",
          "isFull",
          "deQueue",
          "enQueue",
          "Rear",
        ],
        args: [[3], [1], [2], [3], [4], [], [], [], [4], []],
        expected: [null, true, true, true, false, 3, true, true, true, 4],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Plain Array With shift())",
        timeComplexity: "O(1) enQueue, O(n) deQueue",
        spaceComplexity: "O(k)",
        overviewMarkdown:
          "Back the queue with a plain growable array. enQueue pushes (checking length against capacity first); deQueue calls shift(), which is correct but re-indexes every remaining element down by one position — O(n) instead of the O(1) the ring-buffer version achieves.",
        code: `class MyCircularQueue {
  constructor(k) {
    this.capacity = k;
    this.queue = [];
  }

  enQueue(value) {
    if (this.queue.length >= this.capacity) return false;
    this.queue.push(value);
    return true;
  }

  deQueue() {
    if (this.queue.length === 0) return false;
    this.queue.shift();
    return true;
  }

  Front() {
    return this.queue.length === 0 ? -1 : this.queue[0];
  }

  Rear() {
    return this.queue.length === 0 ? -1 : this.queue[this.queue.length - 1];
  }

  isEmpty() {
    return this.queue.length === 0;
  }

  isFull() {
    return this.queue.length === this.capacity;
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 12-16 | \`deQueue()\` uses \`shift()\` | Correct, but re-indexes every remaining element — O(n) per call. |
| 19-25 | \`Front()\`/\`Rear()\` read array ends directly | O(1), since the array is always kept dense (no gaps). |`,
        dryRunMarkdown: `**Dry run (k=3)**: enQueue(1)→[1],true. enQueue(2)→[1,2],true. enQueue(3)→[1,2,3],true (now full). enQueue(4)→length3>=3→false. Rear()→3. isFull()→true. deQueue()→shift→[2,3],true. enQueue(4)→[2,3,4],true. Rear()→4. Output **[null,true,true,true,false,3,true,true,true,4]** — matches expected.`,
      },
      {
        approach: "Optimal (Fixed-Size Ring Buffer)",
        timeComplexity: "O(1) all operations",
        spaceComplexity: "O(k)",
        overviewMarkdown:
          "Allocate a fixed-size array of exactly k slots up front, plus a head index and a running count. enQueue writes to (head + count) % capacity and increments count; deQueue advances head by 1 (mod capacity) and decrements count. Front/Rear compute their slot via head and (head + count - 1) % capacity. No element is ever physically shifted — the 'wraparound' is handled entirely by modulo arithmetic on the pointers.",
        code: `class MyCircularQueue {
  constructor(k) {
    this.capacity = k;
    this.data = new Array(k).fill(0);
    this.head = 0;
    this.count = 0;
  }

  enQueue(value) {
    if (this.count === this.capacity) return false;
    const tail = (this.head + this.count) % this.capacity;
    this.data[tail] = value;
    this.count++;
    return true;
  }

  deQueue() {
    if (this.count === 0) return false;
    this.head = (this.head + 1) % this.capacity;
    this.count--;
    return true;
  }

  Front() {
    return this.count === 0 ? -1 : this.data[this.head];
  }

  Rear() {
    if (this.count === 0) return -1;
    const tail = (this.head + this.count - 1) % this.capacity;
    return this.data[tail];
  }

  isEmpty() {
    return this.count === 0;
  }

  isFull() {
    return this.count === this.capacity;
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 9-14 | \`enQueue\` writes to \`(head + count) % capacity\` | Computes the next free slot by wrapping around the fixed array, with no shifting. |
| 16-20 | \`deQueue\` advances \`head\` by 1 (mod capacity) | The old front slot is simply forgotten (not cleared) — \`count\` tracks what's logically "in" the queue. |
| 27-30 | \`Rear()\` computes \`(head + count - 1) % capacity\` | The last occupied slot, wrapping around if it's before \`head\` in raw array order. |`,
        dryRunMarkdown: `**Dry run (k=3)**: data=[0,0,0], head=0, count=0. enQueue(1)→tail=(0+0)%3=0→data[0]=1, count=1, true. enQueue(2)→tail=1→data[1]=2, count=2, true. enQueue(3)→tail=2→data[2]=3, count=3 (full), true. enQueue(4)→count===capacity→false. Rear()→tail=(0+3-1)%3=2→data[2]=3. isFull()→count===3→true. deQueue()→head=(0+1)%3=1, count=2, true. enQueue(4)→tail=(1+2)%3=0→data[0]=4 (overwriting old 1, which is fine — it's logically gone), count=3, true. Rear()→tail=(1+3-1)%3=0→data[0]=4. Output **[null,true,true,true,false,3,true,true,true,4]** — matches expected.`,
      },
    ],
    relatedSlugs: ["lru-cache", "design-underground-system"],
    realWorldUsageMarkdown: `Ring buffers are the standard structure behind audio/video streaming buffers, producer-consumer task queues, and network packet buffers — anywhere data arrives and drains continuously and reallocating or shifting the backing storage on every operation would be too slow.`,
  },
  {
    slug: "design-underground-system",
    title: "Design Underground System",
    difficulty: "medium",
    maangTags: ["Amazon", "Google"],
    topicSlug: "design",
    functionName: "UndergroundSystem",
    description: `## Problem

Design a system to track customer travel times between stations. Implement:
- \`UndergroundSystem()\` initializes the system.
- \`checkIn(id, stationName, t)\`: a customer with card \`id\` checks in at \`stationName\` at time \`t\`.
- \`checkOut(id, stationName, t)\`: the same customer checks out at \`stationName\` at time \`t\`.
- \`getAverageTime(startStation, endStation)\`: returns the average travel time between the two stations, averaged over all completed trips between them so far.

## Example

\`\`\`
Input:  ["UndergroundSystem","checkIn","checkIn","checkIn","checkOut","checkOut","checkOut","getAverageTime","getAverageTime","checkIn","getAverageTime","checkOut","getAverageTime"]
        [[],[45,"Leyton",3],[32,"Paradise",8],[27,"Leyton",10],[45,"Waterloo",15],[27,"Waterloo",20],[32,"Cambridge",22],["Paradise","Cambridge"],["Leyton","Waterloo"],[10,"Leyton",24],["Leyton","Waterloo"],[10,"Waterloo",38],["Leyton","Waterloo"]]
Output: [null,null,null,null,null,null,null,14,11,null,11,null,12]
\`\`\`

## Constraints

- \`getAverageTime\` is only called for station pairs with at least one completed trip.

## Senior interview angle

The naive version stores every completed trip and recomputes the average by filtering and summing on every getAverageTime call — correct, but wasteful when the same route is queried repeatedly against a growing trip log. The fix is a classic "maintain a running aggregate incrementally instead of recomputing it" move: keep a (total, count) pair per route, updated once at checkOut time, so getAverageTime is a single O(1) division regardless of how many trips have accumulated.

## Pattern

\`Incremental running aggregate per key\` — update a (sum, count) pair for each route at the moment a trip completes, rather than re-scanning trip history on every average query.`,
    starterCode: `class UndergroundSystem {
  constructor() {
    // Your code here
  }

  /**
   * @param {number} id
   * @param {string} stationName
   * @param {number} t
   * @return {void}
   */
  checkIn(id, stationName, t) {
    // Your code here
  }

  /**
   * @param {number} id
   * @param {string} stationName
   * @param {number} t
   * @return {void}
   */
  checkOut(id, stationName, t) {
    // Your code here
  }

  /**
   * @param {string} startStation
   * @param {string} endStation
   * @return {number}
   */
  getAverageTime(startStation, endStation) {
    // Your code here
  }
}`,
    testCases: [
      {
        operations: [
          "UndergroundSystem",
          "checkIn",
          "checkIn",
          "checkIn",
          "checkOut",
          "checkOut",
          "checkOut",
          "getAverageTime",
          "getAverageTime",
          "checkIn",
          "getAverageTime",
          "checkOut",
          "getAverageTime",
        ],
        args: [
          [],
          [45, "Leyton", 3],
          [32, "Paradise", 8],
          [27, "Leyton", 10],
          [45, "Waterloo", 15],
          [27, "Waterloo", 20],
          [32, "Cambridge", 22],
          ["Paradise", "Cambridge"],
          ["Leyton", "Waterloo"],
          [10, "Leyton", 24],
          ["Leyton", "Waterloo"],
          [10, "Waterloo", 38],
          ["Leyton", "Waterloo"],
        ],
        expected: [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          14,
          11,
          null,
          11,
          null,
          12,
        ],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Full Trip Log, Filter + Sum Per Query)",
        timeComplexity: "O(1) checkIn/checkOut, O(n) getAverageTime",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Track open check-ins in a Map keyed by id. On checkOut, compute the trip's duration and append a full trip record { startStation, endStation, duration } to a growing list. getAverageTime filters that entire list down to matching (startStation, endStation) trips and averages their durations from scratch — correct, but the cost of every query grows with the total number of trips ever recorded, not just the ones for that route.",
        code: `class UndergroundSystem {
  constructor() {
    this.checkIns = new Map();
    this.trips = [];
  }

  checkIn(id, stationName, t) {
    this.checkIns.set(id, { station: stationName, time: t });
  }

  checkOut(id, stationName, t) {
    const { station, time } = this.checkIns.get(id);
    this.checkIns.delete(id);
    this.trips.push({ startStation: station, endStation: stationName, duration: t - time });
  }

  getAverageTime(startStation, endStation) {
    const matching = this.trips.filter(
      (trip) => trip.startStation === startStation && trip.endStation === endStation,
    );
    const total = matching.reduce((sum, trip) => sum + trip.duration, 0);
    return total / matching.length;
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 10-14 | \`checkOut\` records a full trip entry | Every completed trip is appended to one ever-growing list, regardless of route. |
| 16-21 | \`getAverageTime\` filters and sums the whole list | Cost scales with total trips recorded across every route, not just the queried one. |`,
        dryRunMarkdown: `**Dry run (partial)**: checkIn(45,"Leyton",3), checkIn(32,"Paradise",8), checkIn(27,"Leyton",10). checkOut(45,"Waterloo",15)→trip{Leyton→Waterloo, dur12}. checkOut(27,"Waterloo",20)→trip{Leyton→Waterloo, dur10}. checkOut(32,"Cambridge",22)→trip{Paradise→Cambridge, dur14}. getAverageTime("Paradise","Cambridge")→matching=[14]→14/1=14. getAverageTime("Leyton","Waterloo")→matching=[12,10]→22/2=11. Matches expected **14, 11** for the first two queries.`,
      },
      {
        approach: "Optimal (Running (Total, Count) Per Route)",
        timeComplexity: "O(1) checkIn, checkOut, and getAverageTime",
        spaceComplexity: "O(routes + open check-ins)",
        overviewMarkdown:
          "Same open-check-ins Map, but instead of logging every trip individually, maintain a routeStats Map keyed by \"start->end\" holding a running { total, count }. checkOut updates that one route's stats in O(1) — no per-trip list needed at all. getAverageTime is then a single lookup and division, independent of how many trips have ever been recorded.",
        code: `class UndergroundSystem {
  constructor() {
    this.checkIns = new Map();
    this.routeStats = new Map();
  }

  checkIn(id, stationName, t) {
    this.checkIns.set(id, { station: stationName, time: t });
  }

  checkOut(id, stationName, t) {
    const { station, time } = this.checkIns.get(id);
    this.checkIns.delete(id);
    const key = \`\${station}->\${stationName}\`;
    const stats = this.routeStats.get(key) ?? { total: 0, count: 0 };
    stats.total += t - time;
    stats.count += 1;
    this.routeStats.set(key, stats);
  }

  getAverageTime(startStation, endStation) {
    const stats = this.routeStats.get(\`\${startStation}->\${endStation}\`);
    return stats.total / stats.count;
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 12-16 | \`checkOut\` updates one route's running (total, count) | O(1) — no per-trip record kept, just an incrementally updated aggregate. |
| 19-22 | \`getAverageTime\` is one lookup and one division | Cost is independent of how many trips have ever been completed on any route. |`,
        dryRunMarkdown: `**Dry run (full sequence)**: after the three checkIns and checkOuts, routeStats = {"Leyton->Waterloo":{total:22,count:2}, "Paradise->Cambridge":{total:14,count:1}}. getAverageTime("Paradise","Cambridge")→14/1=14. getAverageTime("Leyton","Waterloo")→22/2=11. checkIn(10,"Leyton",24). getAverageTime("Leyton","Waterloo")→still 22/2=11 (trip 10 hasn't checked out yet). checkOut(10,"Waterloo",38)→duration=38-24=14→routeStats["Leyton->Waterloo"]={total:36,count:3}. getAverageTime("Leyton","Waterloo")→36/3=12. Output **[null,null,null,null,null,null,null,14,11,null,11,null,12]** — matches expected.`,
      },
    ],
    relatedSlugs: ["time-based-key-value-store", "design-circular-queue"],
    realWorldUsageMarkdown: `Maintaining a running (sum, count) per key instead of replaying a full event log on every query is exactly how production analytics dashboards keep metrics like "average response time per API endpoint" or "average ride duration per route" fast at scale — the aggregate is updated incrementally as events land, not recomputed from raw logs on every dashboard refresh.`,
  },
];

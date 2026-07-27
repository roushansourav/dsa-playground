import type { Problem } from "../types";

export const slidingWindowProblems: Problem[] = [
  {
    slug: "best-time-to-buy-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "easy",
    maangTags: ["Amazon", "Google", "Apple"],
    topicSlug: "sliding-window",
    functionName: "maxProfit",
    description: `## Problem

Given an array \`prices\` where \`prices[i]\` is the stock price on day \`i\`, return the **maximum profit** from one buy and one sell. You must buy before you sell.

## Example

\`\`\`
Input: prices = [7, 1, 5, 3, 6, 4]
Output: 5  (buy at 1, sell at 6)
\`\`\`

## Pattern: Sliding Window / Running Minimum

Track the minimum price seen so far; at each day compute \`price - minSoFar\`. O(n) one pass.

Also teachable as **Kadane's variant** — max subarray on price differences.`,
    starterCode: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
  // Your code here
}`,
    testCases: [
      { input: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { input: [[7, 6, 4, 3, 1]], expected: 0 },
      { input: [[2, 4, 1]], expected: 2 },
    ],
    solutions: [
      {
        approach: "Brute Force (Every Buy/Sell Pair)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Check every pair of days `(buy, sell)` with `sell > buy`, compute the profit, and track the max. Correct, but re-derives the best buy day for every possible sell day instead of remembering it.",
        code: `function maxProfit(prices) {
  let best = 0;
  for (let i = 0; i < prices.length; i++) {
    for (let j = i + 1; j < prices.length; j++) {
      best = Math.max(best, prices[j] - prices[i]);
    }
  }
  return best;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-4 | nested loops | Consider every buy day \`i\` and every later sell day \`j\`. |
| 5 | \`Math.max(best, prices[j] - prices[i])\` | Track the best profit found; \`best\` starts at 0 to cover "no profitable trade exists." |`,
        dryRunMarkdown: `**Dry run 1** — \`[2,4,1]\`:
Pairs: (0,1)=4-2=2, (0,2)=1-2=-1, (1,2)=1-4=-3. Max(0,2,-1,-3) = **2** — matches expected.

**Dry run 2** — \`[7,6,4,3,1]\`:
Every later price is lower than every earlier one, so every pair gives a negative profit. \`best\` never rises above its initial 0 → return **0** — matches expected.`,
      },
      {
        approach: "Optimal (Running Minimum, One Pass)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Walk the prices once, tracking the lowest price seen so far (`minSoFar`). At each day, the best possible profit if selling today is `price - minSoFar` — no need to remember which day the minimum happened on, just its value.",
        code: `function maxProfit(prices) {
  let minSoFar = Infinity;
  let best = 0;

  for (const price of prices) {
    minSoFar = Math.min(minSoFar, price);
    best = Math.max(best, price - minSoFar);
  }
  return best;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`minSoFar = Infinity\` | No price seen yet. |
| 6 | \`minSoFar = Math.min(minSoFar, price)\` | Update the cheapest buy price seen up to and including today. |
| 7 | \`best = Math.max(best, price - minSoFar)\` | If today were the sell day, this is the best possible profit — compare against the running best. |`,
        dryRunMarkdown: `**Dry run 1** — \`[2,4,1]\`:
price=2: minSoFar=2, profit=0, best=0
price=4: minSoFar=2, profit=2, best=2
price=1: minSoFar=1, profit=0, best stays 2
Return **2** — matches expected.

**Dry run 2** — \`[7,6,4,3,1]\`:
Each price is a new low, so \`profit = price - minSoFar\` is always 0 at the moment \`minSoFar\` updates to that same price. \`best\` never leaves 0.
Return **0** — matches expected.`,
      },
    ],
    relatedSlugs: ["longest-substring-without-repeating"],
    realWorldUsageMarkdown: `Tracking a running minimum (or maximum) while scanning once is the same shape behind monitoring baselines — e.g. remembering the lowest latency observed so far to size the magnitude of a current spike, or the cheapest historical price to flag a buying opportunity in a live feed, all without storing the full history.`,
  },
  {
    slug: "longest-substring-without-repeating",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "medium",
    maangTags: ["Google", "Amazon", "Meta"],
    topicSlug: "sliding-window",
    functionName: "lengthOfLongestSubstring",
    description: `## Problem

Given a string \`s\`, return the length of the **longest substring** without repeating characters.

## Example

\`\`\`
Input: s = "abcabcbb"
Output: 3  ("abc")
\`\`\`

## Pattern: Variable-Size Sliding Window + Hash Set/Map

Expand \`right\`, shrink \`left\` when duplicate found. Track last-seen index for O(n) with map.

One of the **top 5** most asked string problems at MAANG.`,
    starterCode: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Your code here
}`,
    testCases: [
      { input: ["abcabcbb"], expected: 3 },
      { input: ["bbbbb"], expected: 1 },
      { input: ["pwwkew"], expected: 3 },
      { input: [""], expected: 0 },
    ],
    solutions: [
      {
        approach: "Brute Force (Expand From Every Start)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "For every starting index, extend a substring rightward using a `Set` until a repeat is hit, tracking the longest run seen. Simple, but restarts the scan (and the set) from scratch at every start index instead of reusing earlier work.",
        code: `function lengthOfLongestSubstring(s) {
  let maxLen = 0;
  for (let i = 0; i < s.length; i++) {
    const seen = new Set();
    let j = i;
    while (j < s.length && !seen.has(s[j])) {
      seen.add(s[j]);
      j++;
    }
    maxLen = Math.max(maxLen, j - i);
  }
  return maxLen;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | outer loop over start index \`i\` | Try every possible substring start. |
| 4-8 | inner \`while\` | Extend \`j\` rightward while characters stay unique, tracking them in \`seen\`. |
| 9 | \`maxLen = Math.max(maxLen, j - i)\` | \`j - i\` is the length of the longest unique run starting at \`i\`. |`,
        dryRunMarkdown: `**Dry run 1** — \`"bbbbb"\`:
i=0: seen={}, j=0 'b' not seen→add, j=1 'b' seen→stop. len=1-0=1. maxLen=1.
i=1..4: same pattern, each gives len=1. maxLen stays **1** — matches expected.

**Dry run 2** — \`"pwwkew"\`:
i=0: 'p','w' unique, then 'w' repeats at j=2 → len=2.
i=1: 'w','w' repeats immediately at j=2 → len=1.
i=2: 'w','k','e' unique, then 'w' repeats at j=5 → len=3.
i=3: 'k','e','w' unique, reaches end → len=3.
i=4: 'e','w' unique, reaches end → len=2.
i=5: 'w' → len=1.
Max = **3** — matches expected.`,
      },
      {
        approach: "Optimal (Sliding Window with Last-Seen Index)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(min(n, alphabet size))",
        overviewMarkdown:
          "Slide a window `[left, right]` across the string using a map of each character's last-seen index. When `right` lands on a character already in the window, jump `left` directly past its previous occurrence instead of incrementing one step at a time — this is what turns the brute force's restart-from-scratch into a single forward pass.",
        code: `function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (lastSeen.has(c) && lastSeen.get(c) >= left) {
      left = lastSeen.get(c) + 1;
    }
    lastSeen.set(c, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`lastSeen\` map | Character → most recent index it appeared at. |
| 7-9 | \`if (lastSeen.has(c) && lastSeen.get(c) >= left)\` | Only jump \`left\` if the previous occurrence is still inside the current window — a stale (already-passed) occurrence doesn't matter. |
| 10 | \`lastSeen.set(c, right)\` | Record this occurrence as the newest. |
| 11 | \`maxLen = Math.max(maxLen, right - left + 1)\` | Current window size is a candidate for the answer. |`,
        dryRunMarkdown: `**Dry run 1** — \`"pwwkew"\`:
right0'p': not seen → lastSeen{p:0}. maxLen=1.
right1'w': not seen → lastSeen{p:0,w:1}. maxLen=2.
right2'w': seen at 1 ≥ left(0) → left=2. lastSeen{p:0,w:2}. maxLen=max(2,1)=2.
right3'k': not seen → lastSeen{...,k:3}. maxLen=max(2,3-2+1=2)=2.
right4'e': not seen → lastSeen{...,e:4}. maxLen=max(2,4-2+1=3)=3.
right5'w': seen at 2, but 2 < left(2)? equal, so \`>= left\` → left=3. lastSeen{...,w:5}. maxLen=max(3,5-3+1=3)=3.
Return **3** — matches expected.

**Dry run 2** — \`"bbbbb"\`:
right0'b': lastSeen{b:0}. maxLen=1.
right1'b': seen at 0 ≥ left(0) → left=1. lastSeen{b:1}. maxLen=max(1,1)=1.
right2'b': seen at1≥left(1)→left=2. maxLen stays 1. ... pattern repeats.
Return **1** — matches expected.`,
      },
    ],
    relatedSlugs: ["longest-repeating-character-replacement", "minimum-window-substring"],
    realWorldUsageMarkdown: `The jump-left-past-the-duplicate technique is used in log deduplication and rate limiting — e.g. "reject this event if its token appeared anywhere in the last N-event window" — and in unique-session windowing for streaming analytics, where the window must always represent a currently-unique set without rescanning from scratch on every new event.`,
  },
  {
    slug: "longest-repeating-character-replacement",
    title: "Longest Repeating Character Replacement",
    difficulty: "medium",
    maangTags: ["Google", "Meta"],
    topicSlug: "sliding-window",
    functionName: "characterReplacement",
    description: `## Problem

Given a string \`s\` and integer \`k\`, return the length of the longest substring containing the **same letter** after performing at most \`k\` character replacements.

## Example

\`\`\`
Input: s = "AABABBA", k = 1
Output: 4  ("AABA" or "ABBA")
\`\`\`

## Pattern: Sliding Window with Frequency Map

Window is valid when \`windowSize - maxFrequency <= k\`. Shrink when invalid.

Senior tip: you don't need the exact max freq on shrink — a stale max still gives correct answer.`,
    starterCode: `/**
 * @param {string} s
 * @param {number} k
 * @return {number}
 */
function characterReplacement(s, k) {
  // Your code here
}`,
    testCases: [
      { input: ["AABABBA", 1], expected: 4 },
      { input: ["ABAB", 2], expected: 4 },
      { input: ["AAAA", 2], expected: 4 },
    ],
    solutions: [
      {
        approach: "Brute Force (Per-Start Expansion with Early Break)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1) (fixed 26-letter frequency map)",
        overviewMarkdown:
          "For every starting index, extend a window rightward, maintaining a frequency count and the max-frequency character seen. Since window size grows by 1 and the max frequency can grow by at most 1 each step, once the window becomes invalid (`size - maxFreq > k`) it stays invalid for that start — so the inner loop can break early.",
        code: `function characterReplacement(s, k) {
  let maxLen = 0;
  for (let i = 0; i < s.length; i++) {
    const freq = {};
    let maxFreq = 0;
    for (let j = i; j < s.length; j++) {
      freq[s[j]] = (freq[s[j]] || 0) + 1;
      maxFreq = Math.max(maxFreq, freq[s[j]]);
      const windowSize = j - i + 1;
      if (windowSize - maxFreq > k) break;
      maxLen = Math.max(maxLen, windowSize);
    }
  }
  return maxLen;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | outer loop over start \`i\` | Try every possible window start. |
| 6-9 | inner loop, frequency tracking | Extend \`j\`, updating the count of the most frequent character in \`[i, j]\`. |
| 10-11 | \`if (windowSize - maxFreq > k) break\` | Non-majority characters exceed the allowed \`k\` replacements — this window (and every longer one from the same start) is invalid, so stop extending. |
| 12 | \`maxLen = Math.max(...)\` | A valid window is a candidate answer. |`,
        dryRunMarkdown: `**Dry run 1** — \`"ABAB", k=2\`:
i=0: j=0'A'(freq A:1,maxFreq1,size1,1-1=0≤2,maxLen1); j=1'B'(freq A:1,B:1,maxFreq1,size2,2-1=1≤2,maxLen2); j=2'A'(freq A:2,B:1,maxFreq2,size3,3-2=1≤2,maxLen3); j=3'B'(freq A:2,B:2,maxFreq2,size4,4-2=2≤2,maxLen4).
i=1,2,3: shorter remaining string, can't beat 4.
Return **4** — matches expected.

**Dry run 2** — \`"AAAA", k=2\`:
i=0: every character is 'A', so \`maxFreq\` always equals \`windowSize\` → \`windowSize - maxFreq = 0 ≤ k\` the whole way → maxLen reaches 4.
Return **4** — matches expected.`,
      },
      {
        approach: "Optimal (Sliding Window, Non-Shrinking)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) (fixed 26-letter frequency map)",
        overviewMarkdown:
          "Slide `right` across the string, always expanding. If the window becomes invalid, slide `left` forward by exactly one instead of re-validating — the window's *size* never needs to shrink below the best length already found, because a smaller invalid window can't beat the current best anyway. `maxFreq` is allowed to go stale (never decreased) — it can only ever be an overestimate for a past position, and an overestimate only makes the algorithm slightly more conservative about when to slide, never wrong about the final answer.",
        code: `function characterReplacement(s, k) {
  const freq = {};
  let left = 0;
  let maxFreq = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    freq[s[right]] = (freq[s[right]] || 0) + 1;
    maxFreq = Math.max(maxFreq, freq[s[right]]);

    if (right - left + 1 - maxFreq > k) {
      freq[s[left]]--;
      left++;
    }
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-4 | \`freq\`, \`left\`, \`maxFreq\` | Track character counts in the current window and the best (possibly stale) max frequency seen. |
| 8-9 | update \`freq\`/\`maxFreq\` for the new right character | Standard window expansion. |
| 11-14 | \`if (... > k)\` | Window invalid — slide (not shrink) by moving \`left\` forward one step; net window size stays the same. |
| 15 | \`maxLen = Math.max(...)\` | Track the best window size seen. |`,
        dryRunMarkdown: `**Dry run 1** — \`"AABABBA", k=1\`:
right0'A': freq{A:1}, maxFreq1, size1, 1-1=0≤1, maxLen1.
right1'A': freq{A:2}, maxFreq2, size2, 2-2=0≤1, maxLen2.
right2'B': freq{A:2,B:1}, maxFreq2, size3, 3-2=1≤1, maxLen3.
right3'A': freq{A:3,B:1}, maxFreq3, size4, 4-3=1≤1, maxLen4.
right4'B': freq{A:3,B:2}, maxFreq stays3(stale, real max is3), size(right-left+1)=4-0+1=5, 5-3=2>1 → slide: freq[s[0]='A']-- → freq{A:2,B:2}, left=1. maxLen=max(4, 4-1+1=4)=4.
right5'B': freq{A:2,B:3}, maxFreq=max(3,3)=3, size=5-1+1=5, 5-3=2>1 → slide: freq[s[1]='A']-- → freq{A:1,B:3}, left=2. maxLen=max(4,5-2+1=4)=4.
right6'A': freq{A:2,B:3}, maxFreq=3, size=6-2+1=5, 5-3=2>1 → slide: freq[s[2]='B']-- → freq{A:2,B:2}, left=3. maxLen=max(4,6-3+1=4)=4.
Return **4** — matches expected.

**Dry run 2** — \`"AAAA", k=2\`:
Every character is 'A'; \`maxFreq\` tracks the growing count exactly, so \`size - maxFreq\` stays 0 the whole way and \`left\` never moves. Final window is the whole string.
Return **4** — matches expected.`,
      },
    ],
    relatedSlugs: ["longest-substring-without-repeating", "sliding-window-maximum"],
    realWorldUsageMarkdown: `The "windowSize - maxFrequency ≤ k" validity check generalizes to noisy-signal analysis — e.g. finding the longest run of a dominant sensor reading while tolerating up to k corrupted samples, or burst-tolerant stream analysis in error-correction contexts where a bounded number of outliers shouldn't break a run.`,
  },
  {
    slug: "minimum-window-substring",
    title: "Minimum Window Substring",
    difficulty: "hard",
    maangTags: ["Google", "Meta", "Amazon"],
    topicSlug: "sliding-window",
    functionName: "minWindow",
    description: `## Problem

Given strings \`s\` and \`t\`, return the **minimum window substring** of \`s\` such that every character in \`t\` (including duplicates) is included. Return \`""\` if none exists.

## Example

\`\`\`
Input: s = "ADOBECODEBANC", t = "ABC"
Output: "BANC"
\`\`\`

## Pattern: Sliding Window + Frequency Map

Expand until valid, shrink to minimize. Track \`formed\` vs \`required\` character counts.

**Hard-tier staple** — tests map management under pressure.`,
    starterCode: `/**
 * @param {string} s
 * @param {string} t
 * @return {string}
 */
function minWindow(s, t) {
  // Your code here
}`,
    testCases: [
      { input: ["ADOBECODEBANC", "ABC"], expected: "BANC" },
      { input: ["a", "a"], expected: "a" },
      { input: ["a", "aa"], expected: "" },
    ],
    solutions: [
      {
        approach: "Brute Force (Every Substring, Verify Containment)",
        timeComplexity: "O(n³)",
        spaceComplexity: "O(m)",
        overviewMarkdown:
          "Check every substring `s[i..j]`, and for each one build a frequency count to verify it contains every character of `t` at least as many times. Track the shortest valid one. Straightforward, but rebuilds a frequency count from scratch for every single substring.",
        code: `function minWindow(s, t) {
  const need = {};
  for (const c of t) need[c] = (need[c] || 0) + 1;

  const containsAll = (sub) => {
    const have = {};
    for (const c of sub) have[c] = (have[c] || 0) + 1;
    return Object.keys(need).every((c) => (have[c] || 0) >= need[c]);
  };

  let best = "";
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      const sub = s.slice(i, j + 1);
      if (sub.length >= t.length && containsAll(sub)) {
        if (best === "" || sub.length < best.length) best = sub;
        break; // no need to extend this start further once valid
      }
    }
  }
  return best;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`need\` | Required character counts from \`t\`. |
| 5-9 | \`containsAll\` | Checks whether a candidate substring has at least the required count of every needed character. |
| 12-13 | nested loops | Every substring \`s[i..j]\`. |
| 14-17 | check and record | Once a start \`i\` yields a valid window, it's the shortest for that start (extending further only grows it), so \`break\` and move to the next \`i\`. |`,
        dryRunMarkdown: `**Dry run 1** — \`s="a", t="a"\`:
i=0,j=0: sub="a", contains {a:1}≥{a:1} → valid, best="a", break.
Return **"a"** — matches expected.

**Dry run 2** — \`s="a", t="aa"\`:
Only possible substring is "a" (length1 < t.length 2, and even checking it: have{a:1} ≥ need{a:2}? no) → never valid.
Return **""** — matches expected.`,
      },
      {
        approach: "Optimal (Sliding Window with Formed/Required Counts)",
        timeComplexity: "O(n + m)",
        spaceComplexity: "O(m)",
        overviewMarkdown:
          "Expand `right` across `s`, tracking how many *distinct required characters* currently have enough copies in the window (`formed`) versus how many are needed (`required`). Whenever `formed === required` the window is valid — shrink `left` as far as possible while it stays valid, recording the shortest window found along the way.",
        code: `function minWindow(s, t) {
  if (t.length > s.length) return "";
  const need = {};
  for (const c of t) need[c] = (need[c] || 0) + 1;
  const required = Object.keys(need).length;

  const windowCounts = {};
  let formed = 0;
  let left = 0;
  let resLen = Infinity;
  let resLeft = 0;

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    windowCounts[c] = (windowCounts[c] || 0) + 1;
    if (need[c] && windowCounts[c] === need[c]) formed++;

    while (formed === required) {
      if (right - left + 1 < resLen) {
        resLen = right - left + 1;
        resLeft = left;
      }
      const lc = s[left];
      windowCounts[lc]--;
      if (need[lc] && windowCounts[lc] < need[lc]) formed--;
      left++;
    }
  }
  return resLen === Infinity ? "" : s.slice(resLeft, resLeft + resLen);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4-5 | \`need\`, \`required\` | Required counts per character, and how many distinct required characters exist. |
| 15-16 | \`if (need[c] && windowCounts[c] === need[c]) formed++\` | This character just reached exactly the required count — one more distinct requirement is now satisfied. |
| 18-25 | \`while (formed === required)\` | Window is fully valid — record it if it's the shortest so far, then try shrinking from the left. |
| 22-23 | \`if (need[lc] && windowCounts[lc] < need[lc]) formed--\` | Shrinking dropped a required character below its needed count — the window is no longer valid, so the while loop will stop after this iteration. |`,
        dryRunMarkdown: `**Dry run 1** — \`s="a", t="a"\`:
need={a:1}, required=1.
right0'a': windowCounts{a:1}, need[a]&&1===1→formed=1. While(formed===1): window="a"(len1)<Infinity→resLen=1,resLeft=0. Shrink: windowCounts[a]=0, 0<1→formed=0, left=1. Exit while.
Return **"a"** — matches expected.

**Dry run 2** — \`s="a", t="aa"\`:
need={a:2}, required=1.
right0'a': windowCounts{a:1}. need[a]=2, 1===2? no → formed stays 0. Loop ends (s exhausted).
resLen never updated (stays Infinity) → return **""** — matches expected.

**Dry run 3** — \`s="ADOBECODEBANC", t="ABC"\`:
need={A:1,B:1,C:1}, required=3. Expanding right, \`formed\` reaches 3 for the first time at right=5 (window "ADOBEC", length 6) — shrinking from there drops \`formed\` back to 2. Expanding again, \`formed\` reaches 3 a second time at right=10 (window "DOBECODEBA" onward); shrinking this time walks left all the way from index 1 to index 9, passing through valid windows of length 10, 9, 8, 7, 6 (tied, not shorter), then finding new shortest windows "EBANC" (length 5, left=8) and finally "BANC" (length 4, left=9) before invalidity breaks the shrink at left=10.
Final shortest window: \`s.slice(9, 13)\` = **"BANC"** — matches expected.`,
      },
    ],
    relatedSlugs: ["longest-substring-without-repeating", "sliding-window-maximum"],
    realWorldUsageMarkdown: `The formed/required frequency-matching window models exact multi-criteria search — e.g. finding the shortest log excerpt that contains every required event code, or the shortest DNA segment containing all bases of a target motif in bioinformatics — anywhere "shrink while still satisfying every requirement" applies.`,
  },
  {
    slug: "sliding-window-maximum",
    title: "Sliding Window Maximum",
    difficulty: "hard",
    maangTags: ["Google", "Amazon", "Netflix"],
    topicSlug: "sliding-window",
    functionName: "maxSlidingWindow",
    description: `## Problem

Given an array \`nums\` and window size \`k\`, return the maximum value in each sliding window.

## Example

\`\`\`
Input: nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3
Output: [3, 3, 5, 5, 6, 7]
\`\`\`

## Pattern: Monotonic Deque inside Sliding Window

Maintain a deque of **indices** with decreasing values. Front is always the window max.

O(n) — each element pushed/popped once. Classic **hard** that separates L5 candidates.`,
    starterCode: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
function maxSlidingWindow(nums, k) {
  // Your code here
}`,
    testCases: [
      {
        input: [[1, 3, -1, -3, 5, 3, 6, 7], 3],
        expected: [3, 3, 5, 5, 6, 7],
      },
      { input: [[1], 1], expected: [1] },
      { input: [[1, -1], 1], expected: [1, -1] },
    ],
    solutions: [
      {
        approach: "Brute Force (Scan Each Window)",
        timeComplexity: "O(n·k)",
        spaceComplexity: "O(1) extra (excluding output)",
        overviewMarkdown:
          "For each window position, scan its `k` elements to find the max. Simple and correct, but rescans overlapping elements in every window instead of reusing prior work.",
        code: `function maxSlidingWindow(nums, k) {
  const result = [];
  for (let i = 0; i + k <= nums.length; i++) {
    let windowMax = -Infinity;
    for (let j = i; j < i + k; j++) {
      windowMax = Math.max(windowMax, nums[j]);
    }
    result.push(windowMax);
  }
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`for (let i = 0; i + k <= nums.length; i++)\` | Every valid window start position. |
| 4-7 | inner scan | Find the max within \`[i, i+k)\` from scratch. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[1], k=1\`:
Window [0,0]: max=1 → result=[1] — matches expected.

**Dry run 2** — \`nums=[1,-1], k=1\`:
Window [0,0]: max=1. Window [1,1]: max=-1 → result=[1,-1] — matches expected.`,
      },
      {
        approach: "Optimal (Monotonic Deque of Indices)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(k)",
        overviewMarkdown:
          "Maintain a deque of indices whose corresponding values are in strictly decreasing order — the front is always the max of the current window. On each step: pop from the back any indices whose values are ≤ the new value (they can never be the max again, since the new element is both later and at least as large), push the new index, then drop the front index if it has slid out of the window. Each index is pushed and popped at most once, giving O(n) total.",
        code: `function maxSlidingWindow(nums, k) {
  const deque = []; // stores indices, values decreasing left to right
  const result = [];

  for (let i = 0; i < nums.length; i++) {
    while (deque.length && nums[deque[deque.length - 1]] <= nums[i]) {
      deque.pop();
    }
    deque.push(i);

    if (deque[0] <= i - k) deque.shift();

    if (i >= k - 1) result.push(nums[deque[0]]);
  }
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-8 | pop smaller trailing values | Any index whose value is ≤ the new one is useless — the new one outlives and outsizes it. |
| 9 | \`deque.push(i)\` | Add the current index; the deque stays value-decreasing. |
| 11 | \`if (deque[0] <= i - k) deque.shift()\` | Drop the front index once it's outside the current window. |
| 13 | \`if (i >= k - 1) result.push(nums[deque[0]])\` | Once the first full window is reached, the front of the deque is always this window's max. |`,
        dryRunMarkdown: `**Dry run 1** — \`nums=[1,3,-1,-3,5,3,6,7], k=3\`:
i0(1): deque=[0].
i1(3): nums[0]=1≤3→pop. deque=[1].
i2(-1): nums[1]=3≤-1? no→push. deque=[1,2]. front1>i-k=-1, keep. i≥2→result=[3].
i3(-3): nums[2]=-1≤-3? no→push. deque=[1,2,3]. front1>0, keep. result=[3,3].
i4(5): nums[3]=-3≤5→pop→[1,2]; nums[2]=-1≤5→pop→[1]; nums[1]=3≤5→pop→[]. push4→[4]. front4>1,keep. result=[3,3,5].
i5(3): nums[4]=5≤3? no→push. deque=[4,5]. front4>2,keep. result=[3,3,5,5].
i6(6): nums[5]=3≤6→pop→[4]; nums[4]=5≤6→pop→[]. push6→[6]. front6>3,keep. result=[3,3,5,5,6].
i7(7): nums[6]=6≤7→pop→[]. push7→[7]. front7>4,keep. result=[3,3,5,5,6,7].
Return **[3,3,5,5,6,7]** — matches expected.

**Dry run 2** — \`nums=[1,-1], k=1\`:
i0(1): deque=[0]. front0>i-k=-1,keep. i≥0→result=[1].
i1(-1): nums[0]=1≤-1? no→push. deque=[0,1]. front0≤i-k=0→shift. deque=[1]. result=[1,-1].
Return **[1,-1]** — matches expected.`,
      },
    ],
    relatedSlugs: ["minimum-window-substring", "longest-repeating-character-replacement"],
    realWorldUsageMarkdown: `The monotonic deque is the standard technique behind streaming rolling-max/min analytics — e.g. tracking the maximum stock price or sensor reading over a trailing time window in real time — where O(1) amortized updates per new data point matter at high throughput.`,
  },
];

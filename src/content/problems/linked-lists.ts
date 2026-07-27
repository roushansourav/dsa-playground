import type { Problem } from "../types";

const listNodeDefinition = `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *   this.val = (val === undefined ? 0 : val)
 *   this.next = (next === undefined ? null : next)
 * }
 */
`;

export const linkedListProblems: Problem[] = [
  {
    slug: "reverse-linked-list",
    title: "Reverse Linked List",
    difficulty: "easy",
    maangTags: ["Google", "Amazon", "Meta"],
    topicSlug: "linked-lists",
    functionName: "reverseList",
    description: `## Problem

Given the \`head\` of a singly linked list, reverse the list and return the new head.

## Example

\`\`\`
Input: head = [1, 2, 3, 4, 5]
Output: [5, 4, 3, 2, 1]
\`\`\`

## Constraints

- \`0 <= list length <= 5000\`

## Senior interview angle

The bar is **O(1) extra space, iterative, three-pointer walk** (\`prev\`, \`curr\`, \`next\`). Mention the recursive version too — it's O(n) space on the call stack, which matters if the list is long.

## Pattern

\`In-place pointer reversal\` — the base case every later "reverse a sub-range" or "reverse in groups of k" problem builds on.`,
    starterCode: `${listNodeDefinition}
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
  // Your code here
}`,
    testCases: [
      { input: [{ __listNode: [1, 2, 3, 4, 5] }], expected: [5, 4, 3, 2, 1], resultType: "list" },
      { input: [{ __listNode: [1, 2] }], expected: [2, 1], resultType: "list" },
      { input: [{ __listNode: [] }], expected: [], resultType: "list" },
    ],
    solutions: [
      {
        approach: "Recursive",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n) — call stack depth",
        overviewMarkdown:
          "Recurse to the end of the list first, then, as each call unwinds, point the *next* node's `next` back at the current node. The base case (empty list or single node) is already 'reversed'. Elegant, but every node adds a stack frame — risky for very long lists.",
        code: `function reverseList(head) {
  if (!head || !head.next) return head;
  const newHead = reverseList(head.next);
  head.next.next = head;
  head.next = null;
  return newHead;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`if (!head || !head.next) return head\` | Base case: an empty list or a single node is its own reversal. |
| 3 | \`const newHead = reverseList(head.next)\` | Recurse first — \`newHead\` ends up being the original list's tail, which becomes the new head. |
| 4 | \`head.next.next = head\` | The node right after \`head\` should now point back at \`head\`. |
| 5 | \`head.next = null\` | \`head\` becomes the new tail, so its forward pointer must be cleared. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,3,4,5]\`:
\`reverseList(1)\` → calls \`reverseList(2)\` → calls \`reverseList(3)\` → calls \`reverseList(4)\` → calls \`reverseList(5)\`: node5.next is null → base case → returns node5.
Unwinding \`reverseList(4)\`: node5.next=node4; node4.next=null. Returns newHead=node5.
Unwinding \`reverseList(3)\`: node4.next=node3; node3.next=null. Returns node5.
Unwinding \`reverseList(2)\`: node3.next=node2; node2.next=null. Returns node5.
Unwinding \`reverseList(1)\`: node2.next=node1; node1.next=null. Returns node5.
Final chain: 5→4→3→2→1→null = **[5,4,3,2,1]** — matches expected.

**Dry run 2** — \`[]\`:
\`head\` is \`null\` → base case \`!head\` is true → return \`null\` → **[]** — matches expected.`,
      },
      {
        approach: "Optimal (Iterative Three-Pointer Walk)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Walk the list once with three pointers: `prev` (the reversed portion built so far), `curr` (the node being relinked), and `next` (saved before it's overwritten, so the walk doesn't lose the rest of the list). This is the expected senior-level answer — no extra space, no recursion risk.",
        code: `function reverseList(head) {
  let prev = null;
  let curr = head;

  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`prev = null\`, \`curr = head\` | Nothing reversed yet; start walking from the original head. |
| 6 | \`const next = curr.next\` | Save the rest of the list before the pointer below overwrites it. |
| 7 | \`curr.next = prev\` | Point the current node backward, into the reversed portion. |
| 8-9 | \`prev = curr; curr = next\` | Advance both pointers one step. |
| 11 | \`return prev\` | When \`curr\` becomes \`null\`, \`prev\` is sitting on the new head (the original list's last node). |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,3,4,5]\`:
prev=null, curr=1. next=2, node1.next=null, prev=1, curr=2 → chain so far: 1→null
next=3, node2.next=1, prev=2, curr=3 → chain: 2→1→null
next=4, node3.next=2, prev=3, curr=4 → chain: 3→2→1→null
next=5, node4.next=3, prev=4, curr=5 → chain: 4→3→2→1→null
next=null, node5.next=4, prev=5, curr=null → chain: 5→4→3→2→1→null
Loop ends (curr is null). Return prev=5 → **[5,4,3,2,1]** — matches expected.

**Dry run 2** — \`[]\`:
curr=head=null → \`while (curr)\` is false immediately → return prev=null → **[]** — matches expected.`,
      },
    ],
    relatedSlugs: ["merge-two-sorted-lists"],
    realWorldUsageMarkdown: `In-place pointer reversal is the base building block for undo/redo history reversal, reversing browser back-navigation stacks, and any "reverse a sub-range" or "reverse in groups of k" variant used in text-processing and low-level buffer manipulation.`,
  },
  {
    slug: "merge-two-sorted-lists",
    title: "Merge Two Sorted Lists",
    difficulty: "easy",
    maangTags: ["Amazon", "Meta", "Apple"],
    topicSlug: "linked-lists",
    functionName: "mergeTwoLists",
    description: `## Problem

Merge two sorted linked lists \`list1\` and \`list2\` and return the head of the merged, still-sorted list.

## Example

\`\`\`
Input: list1 = [1, 2, 4], list2 = [1, 3, 4]
Output: [1, 1, 2, 3, 4, 4]
\`\`\`

## Senior interview angle

The **dummy head node** trick removes all the special-casing around "what's the first node of the result". Use it here and reuse it for every future merge/partition list problem.

## Pattern

\`Dummy node + two-pointer merge\` — O(n + m) time, O(1) extra space (splicing existing nodes, not copying values).`,
    starterCode: `${listNodeDefinition}
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
function mergeTwoLists(list1, list2) {
  // Your code here
}`,
    testCases: [
      {
        input: [{ __listNode: [1, 2, 4] }, { __listNode: [1, 3, 4] }],
        expected: [1, 1, 2, 3, 4, 4],
        resultType: "list",
      },
      { input: [{ __listNode: [] }, { __listNode: [] }], expected: [], resultType: "list" },
      { input: [{ __listNode: [] }, { __listNode: [0] }], expected: [0], resultType: "list" },
    ],
    solutions: [
      {
        approach: "Brute Force (Collect, Sort, Rebuild)",
        timeComplexity: "O((n+m) log(n+m))",
        spaceComplexity: "O(n+m)",
        overviewMarkdown:
          "Walk both lists into a single array of values, sort it, then build a brand new list from the sorted array. Correct and easy to reason about, but throws away the fact that both inputs are already sorted, and allocates entirely new nodes.",
        code: `function mergeTwoLists(list1, list2) {
  const values = [];
  for (let curr = list1; curr; curr = curr.next) values.push(curr.val);
  for (let curr = list2; curr; curr = curr.next) values.push(curr.val);
  values.sort((a, b) => a - b);

  const dummy = { val: 0, next: null };
  let tail = dummy;
  for (const v of values) {
    tail.next = { val: v, next: null };
    tail = tail.next;
  }
  return dummy.next;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-4 | collect values | Walk both lists into one flat array, ignoring their existing order. |
| 5 | \`values.sort((a, b) => a - b)\` | Numeric sort, since default \`.sort()\` is lexicographic. |
| 7-11 | rebuild | Construct fresh nodes for every value in sorted order. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,4]\`, \`[1,3,4]\`:
values=[1,2,4,1,3,4] → sorted=[1,1,2,3,4,4] → rebuild → **[1,1,2,3,4,4]** — matches expected.

**Dry run 2** — \`[]\`, \`[0]\`:
values=[0] → sorted=[0] → rebuild → **[0]** — matches expected.`,
      },
      {
        approach: "Optimal (Dummy Node + Two-Pointer Splice)",
        timeComplexity: "O(n+m)",
        spaceComplexity: "O(1) extra — splices existing nodes, never allocates new ones",
        overviewMarkdown:
          "Walk both lists simultaneously with a `dummy` head to avoid special-casing the first node of the result. At each step, splice whichever current node has the smaller value onto the result's tail and advance that list's pointer. When one list runs out, the remainder of the other is already sorted, so it can be spliced on wholesale.",
        code: `function mergeTwoLists(list1, list2) {
  const dummy = { val: 0, next: null };
  let tail = dummy;
  let a = list1;
  let b = list2;

  while (a && b) {
    if (a.val <= b.val) {
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a || b;
  return dummy.next;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`dummy\`, \`tail\` | \`dummy.next\` will end up as the real head — no special-casing needed for "what's the first node." |
| 7-13 | \`while (a && b)\` | Splice the smaller of the two current nodes onto the tail; splicing (relinking \`.next\`) reuses existing nodes instead of copying values. |
| 15 | \`tail.next = a \|\| b\` | Whichever list still has nodes left is already sorted — attach it directly, no further comparison needed. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,4]\`, \`[1,3,4]\`:
a=1(list1),b=1(list2): 1≤1 → splice a → tail=a-node(1). a=2.
a=2,b=1: 2≤1? no → splice b → tail=b-node(1). b=3.
a=2,b=3: 2≤3 → splice a → tail=a-node(2). a=4.
a=4,b=3: 4≤3? no → splice b → tail=b-node(3). b=4.
a=4,b=4: 4≤4 → splice a → tail=a-node(4). a=null.
Loop ends (a is null). \`tail.next = a || b\` = b-node(4).
Result: 1(list1)→1(list2)→2→3→4(list1)→4(list2) = **[1,1,2,3,4,4]** — matches expected.

**Dry run 2** — \`[]\`, \`[0]\`:
a=null, b=0-node. \`while (a && b)\` is false immediately (a is falsy). \`tail.next = a || b\` = b(0-node).
Result: **[0]** — matches expected.`,
      },
    ],
    relatedSlugs: ["merge-k-sorted-lists", "reverse-linked-list"],
    realWorldUsageMarkdown: `The dummy-head splice-merge is the literal merge step inside external merge sort — merging two already-sorted runs of data too large to fit in memory — and the same pattern merges two sorted event streams (e.g. combining timestamped logs from two sources into one ordered feed) without copying any records.`,
  },
  {
    slug: "linked-list-cycle",
    title: "Linked List Cycle",
    difficulty: "easy",
    maangTags: ["Amazon", "Google"],
    topicSlug: "linked-lists",
    functionName: "hasCycle",
    description: `## Problem

Given the \`head\` of a linked list, return \`true\` if the list has a cycle, \`false\` otherwise.

## Example

\`\`\`
Input: head = [3, 2, 0, -4], the tail connects back to index 1
Output: true
\`\`\`

## Senior interview angle

**Floyd's cycle detection** (fast/slow pointers) is the expected O(1)-space answer — the hash-set-of-visited-nodes approach is O(n) space and interviewers will ask you to improve on it immediately.

## Pattern

\`Fast & slow pointers\` — the same technique later finds the cycle's start node, the middle of a list, and duplicate numbers in an array.`,
    starterCode: `${listNodeDefinition}
/**
 * @param {ListNode} head
 * @return {boolean}
 */
function hasCycle(head) {
  // Your code here
}`,
    testCases: [
      { input: [{ __cycleList: { values: [3, 2, 0, -4], pos: 1 } }], expected: true },
      { input: [{ __cycleList: { values: [1, 2], pos: 0 } }], expected: true },
      { input: [{ __cycleList: { values: [1], pos: -1 } }], expected: false },
    ],
    solutions: [
      {
        approach: "Brute Force (Hash Set of Visited Nodes)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Walk the list, remembering every node object visited in a `Set`. If the walk ever revisits a node already in the set, there's a cycle; if it reaches `null`, there isn't. Correct and simple, but uses O(n) extra memory — an interviewer will immediately ask for the O(1)-space version.",
        code: `function hasCycle(head) {
  const seen = new Set();
  let curr = head;
  while (curr) {
    if (seen.has(curr)) return true;
    seen.add(curr);
    curr = curr.next;
  }
  return false;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`seen\` | Tracks node object identity, not values — two different nodes can share a value. |
| 5 | \`if (seen.has(curr)) return true\` | Revisiting a node object is only possible if a cycle loops back to it. |
| 6-7 | \`seen.add(curr); curr = curr.next\` | Mark this node visited and advance. |`,
        dryRunMarkdown: `**Dry run 1** — \`values=[1], pos=-1\` (no cycle, single node whose \`next\` is \`null\`):
curr=node1: not in seen → add. curr=node1.next=null. Loop ends (curr is null) → return **false** — matches expected.

**Dry run 2** — \`values=[1,2], pos=0\` (node2.next points back to node1):
curr=node1: not seen → add {node1}. curr=node2.
curr=node2: not seen → add {node1,node2}. curr=node2.next=node1 (the cycle).
curr=node1: \`seen.has(node1)\` → true → return **true** — matches expected.`,
      },
      {
        approach: "Optimal (Floyd's Fast & Slow Pointers)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Move `slow` one step and `fast` two steps at a time. If there's no cycle, `fast` reaches the end first. If there is a cycle, `fast` eventually laps `slow` inside the loop and they land on the same node — no extra memory needed to detect it.",
        code: `function hasCycle(head) {
  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`slow = fast = head\` | Both pointers start at the same place. |
| 5 | \`while (fast && fast.next)\` | Stop safely if \`fast\` (the faster pointer) runs off the end — that means no cycle. |
| 6-7 | \`slow = slow.next; fast = fast.next.next\` | \`fast\` gains one extra step of distance on \`slow\` every iteration. |
| 8 | \`if (slow === fast) return true\` | Inside a cycle, the gap between them shrinks by 1 each iteration and must eventually hit 0 — they meet. |`,
        dryRunMarkdown: `**Dry run 1** — \`values=[1], pos=-1\` (node1.next = null):
slow=node1, fast=node1. \`while (fast && fast.next)\`: fast.next is \`null\` → condition false immediately → return **false** — matches expected.

**Dry run 2** — \`values=[1,2], pos=0\` (node1→node2→node1→…):
slow=node1, fast=node1.
Iteration: fast(node1) && fast.next(node2) → true. slow=slow.next=node2. fast=fast.next.next=node1.next.next=node2.next=node1. slow(node2)===fast(node1)? no.
Iteration: fast(node1) && fast.next(node2) → true. slow=slow.next=node2.next=node1. fast=fast.next.next=node1.next.next=node2.next=node1. slow(node1)===fast(node1)? **yes** → return **true** — matches expected.`,
      },
    ],
    relatedSlugs: ["remove-nth-node-from-end-of-list"],
    realWorldUsageMarkdown: `Floyd's fast/slow technique detects infinite loops in any linked structure — state-machine transition graphs, circular configuration references, or resolving symlink loops — in O(1) space, and the same two-speed-pointer idea is reused to find a cycle's entry point and to find the middle of a list in one pass.`,
  },
  {
    slug: "remove-nth-node-from-end-of-list",
    title: "Remove Nth Node From End of List",
    difficulty: "medium",
    maangTags: ["Meta", "Amazon"],
    topicSlug: "linked-lists",
    functionName: "removeNthFromEnd",
    description: `## Problem

Given the \`head\` of a linked list, remove the \`n\`th node from the end of the list and return its head.

## Example

\`\`\`
Input: head = [1, 2, 3, 4, 5], n = 2
Output: [1, 2, 3, 5]
\`\`\`

## Senior interview angle

The one-pass answer: advance a lead pointer \`n\` steps ahead, then move both pointers together until lead hits the end — the trailing pointer now sits right before the node to remove. Use a **dummy head** so removing the actual first node needs no special case.

## Pattern

\`Two-pointer gap\` — fixed-gap pointer pairs solve this and "find the middle" family of problems in one pass instead of two.`,
    starterCode: `${listNodeDefinition}
/**
 * @param {ListNode} head
 * @param {number} n
 * @return {ListNode}
 */
function removeNthFromEnd(head, n) {
  // Your code here
}`,
    testCases: [
      { input: [{ __listNode: [1, 2, 3, 4, 5] }, 2], expected: [1, 2, 3, 5], resultType: "list" },
      { input: [{ __listNode: [1] }, 1], expected: [], resultType: "list" },
      { input: [{ __listNode: [1, 2] }, 1], expected: [1], resultType: "list" },
    ],
    solutions: [
      {
        approach: "Brute Force (Two Pass — Count, Then Remove)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "First pass counts the list's length. Second pass walks to the node just before the target (`length - n` steps from a dummy head) and unlinks it. Correct and still linear time, but requires seeing the whole list before starting the second walk — the one-pass version needs no length lookup at all.",
        code: `function removeNthFromEnd(head, n) {
  let length = 0;
  for (let curr = head; curr; curr = curr.next) length++;

  const dummy = { val: 0, next: head };
  let curr = dummy;
  for (let i = 0; i < length - n; i++) {
    curr = curr.next;
  }
  curr.next = curr.next.next;
  return dummy.next;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | first pass | Count total nodes. |
| 5-6 | \`dummy\` | Lets removing the actual first node work with the same code path as removing any other node. |
| 7-9 | second pass | Walk \`length - n\` steps from \`dummy\` to land on the node just before the target. |
| 10 | \`curr.next = curr.next.next\` | Unlink the target node. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,3,4,5], n=2\`:
length=5. dummy→1→2→3→4→5. Walk \`length-n=3\` steps from dummy: dummy→node1→node2→node3. curr=node3(val3).
\`curr.next = curr.next.next\` → node3.next = node5 (skips node4).
Result: 1→2→3→5 = **[1,2,3,5]** — matches expected.

**Dry run 2** — \`[1], n=1\`:
length=1. dummy→1. Walk \`length-n=0\` steps → curr=dummy.
\`curr.next = curr.next.next\` → dummy.next = node1.next = null.
Result: **[]** — matches expected.`,
      },
      {
        approach: "Optimal (One-Pass, Fixed-Gap Two Pointers)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Advance a `lead` pointer `n` steps ahead of `trail` first, then move both together until `lead` falls off the end. When that happens, `trail` is sitting exactly one node before the target — no length lookup needed, and the whole list is walked only once.",
        code: `function removeNthFromEnd(head, n) {
  const dummy = { val: 0, next: head };
  let lead = dummy;
  let trail = dummy;

  for (let i = 0; i < n; i++) lead = lead.next;

  while (lead.next) {
    lead = lead.next;
    trail = trail.next;
  }
  trail.next = trail.next.next;
  return dummy.next;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-4 | \`dummy\`, \`lead\`, \`trail\` | Both pointers start at \`dummy\`; the gap between them will be established next. |
| 6 | \`for (let i = 0; i < n; i++) lead = lead.next\` | Open up an \`n\`-node gap between \`lead\` and \`trail\`. |
| 8-11 | \`while (lead.next)\` | Advance both together; the fixed gap means \`trail\` reaches "one before the target" exactly when \`lead\` reaches the last node. |
| 12 | \`trail.next = trail.next.next\` | Unlink the target node. |`,
        dryRunMarkdown: `**Dry run 1** — \`[1,2,3,4,5], n=2\`:
dummy→1→2→3→4→5. lead=trail=dummy.
Advance lead 2 steps: lead=node1→node2.
While lead.next: lead.next=node3 → lead=node3, trail=node1. lead.next=node4 → lead=node4, trail=node2. lead.next=node5 → lead=node5, trail=node3. lead.next=null → stop.
trail=node3. \`trail.next = trail.next.next\` → node3.next=node5 (skips node4).
Result: 1→2→3→5 = **[1,2,3,5]** — matches expected.

**Dry run 2** — \`[1,2], n=1\`:
dummy→1→2. lead=trail=dummy. Advance lead 1 step: lead=node1.
While lead.next: lead.next=node2 → lead=node2, trail=node1. lead.next=null → stop.
trail=node1. \`trail.next = trail.next.next\` → node1.next=node2.next=null.
Result: **[1]** — matches expected.`,
      },
    ],
    relatedSlugs: ["linked-list-cycle", "merge-two-sorted-lists"],
    realWorldUsageMarkdown: `The fixed-gap two-pointer technique processes a "trailing window" over data whose total length isn't known upfront — e.g. computing a streaming median-of-last-N over a live feed, or enforcing a sliding rate-limit counter over an append-only log — all without a first pass to count elements.`,
  },
  {
    slug: "merge-k-sorted-lists",
    title: "Merge K Sorted Lists",
    difficulty: "hard",
    maangTags: ["Google", "Amazon", "Meta"],
    topicSlug: "linked-lists",
    functionName: "mergeKLists",
    description: `## Problem

You are given an array \`lists\` of \`k\` sorted linked lists. Merge all the lists into one sorted list and return its head.

## Example

\`\`\`
Input: lists = [[1, 4, 5], [1, 3, 4], [2, 6]]
Output: [1, 1, 2, 3, 4, 4, 5, 6]
\`\`\`

## Senior interview angle

Naive pairwise merge is O(kN) where N is total nodes. The bar-raiser answer is a **min-heap of the k current head nodes**, giving O(N log k) — or **divide-and-conquer pairwise merging**, also O(N log k), which needs no heap. Know both; explain the log k factor either way.

## Pattern

\`Heap / divide-and-conquer merge\` — generalizes "Merge Two Sorted Lists" to k inputs; the same heap idea reappears in "K closest points" and "top k frequent elements".`,
    starterCode: `${listNodeDefinition}
/**
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
function mergeKLists(lists) {
  // Your code here
}`,
    testCases: [
      {
        input: [[{ __listNode: [1, 4, 5] }, { __listNode: [1, 3, 4] }, { __listNode: [2, 6] }]],
        expected: [1, 1, 2, 3, 4, 4, 5, 6],
        resultType: "list",
      },
      { input: [[]], expected: [], resultType: "list" },
      { input: [[{ __listNode: [] }]], expected: [], resultType: "list" },
    ],
    solutions: [
      {
        approach: "Brute Force (Collect All, Sort, Rebuild)",
        timeComplexity: "O(N log N) where N is the total number of nodes",
        spaceComplexity: "O(N)",
        overviewMarkdown:
          "Flatten every list into one array of values, sort it, then build a fresh list from the sorted array. Ignores that each input list already arrives sorted — the k-way merge below exploits that instead.",
        code: `function mergeKLists(lists) {
  const values = [];
  for (const list of lists) {
    for (let curr = list; curr; curr = curr.next) values.push(curr.val);
  }
  values.sort((a, b) => a - b);

  const dummy = { val: 0, next: null };
  let tail = dummy;
  for (const v of values) {
    tail.next = { val: v, next: null };
    tail = tail.next;
  }
  return dummy.next;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-5 | flatten | Walk every list in \`lists\`, collecting every value into one array. |
| 6 | \`values.sort((a, b) => a - b)\` | Numeric sort across the combined set. |
| 8-12 | rebuild | Build a new list from the sorted values. |`,
        dryRunMarkdown: `**Dry run 1** — \`[[1,4,5],[1,3,4],[2,6]]\`:
values=[1,4,5,1,3,4,2,6] → sorted=[1,1,2,3,4,4,5,6] → rebuild → **[1,1,2,3,4,4,5,6]** — matches expected.

**Dry run 2** — \`[]\` (empty array of lists):
The outer \`for\` loop never runs → values=[] → sorted=[] → \`dummy.next\` stays \`null\` → **[]** — matches expected.`,
      },
      {
        approach: "Optimal (Min-Heap of the k Current Heads)",
        timeComplexity: "O(N log k) where N is the total number of nodes and k is the number of lists",
        spaceComplexity: "O(k) for the heap",
        overviewMarkdown:
          "Push the head node of every non-empty list into a min-heap keyed by `.val`. Repeatedly pop the smallest, splice it onto the result, and push its successor (if any) back into the heap. The heap only ever holds at most one node per list (`k` at a time), so each of the `N` total pops/pushes costs `O(log k)` instead of the brute force's `O(log N)` per comparison across everything at once.",
        code: `class MinHeap {
  constructor() {
    this.data = [];
  }
  size() {
    return this.data.length;
  }
  push(node) {
    this.data.push(node);
    let i = this.data.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.data[parent].val <= this.data[i].val) break;
      [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
      i = parent;
    }
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last;
      let i = 0;
      while (true) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let smallest = i;
        if (left < this.data.length && this.data[left].val < this.data[smallest].val) smallest = left;
        if (right < this.data.length && this.data[right].val < this.data[smallest].val) smallest = right;
        if (smallest === i) break;
        [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
        i = smallest;
      }
    }
    return top;
  }
}

function mergeKLists(lists) {
  const heap = new MinHeap();
  for (const node of lists) {
    if (node) heap.push(node);
  }

  const dummy = { val: 0, next: null };
  let tail = dummy;
  while (heap.size() > 0) {
    const node = heap.pop();
    tail.next = node;
    tail = tail.next;
    if (node.next) heap.push(node.next);
  }
  return dummy.next;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 1-38 | \`MinHeap\` | Standard array-backed binary min-heap, ordered by \`.val\`, with \`push\` (sift up) and \`pop\` (sift down). |
| 41-43 | seed the heap | Push each list's head node — skip \`null\` heads (empty input lists). |
| 47-52 | main loop | Pop the globally-smallest current head, splice it onto the result, and if that node has a successor, push it in as the new candidate from its list. |`,
        dryRunMarkdown: `**Dry run 1** — \`[[1,4,5],[1,3,4],[2,6]]\`:
Seed heap with heads: 1 (list0), 1 (list1), 2 (list2).
Each pop removes the current minimum and immediately pushes that list's next node (if any); the sequence of popped values in order is: 1(list0)→push 4(list0); 1(list1)→push 3(list1); 2(list2)→push 6(list2); 3(list1)→push 4(list1); 4(list0)→push 5(list0); 4(list1)→list1 exhausted, no push; 5(list0)→list0 exhausted, no push; 6(list2)→list2 exhausted, no push. Heap empties after that.
Spliced in pop order: **[1,1,2,3,4,4,5,6]** — matches expected.

**Dry run 2** — \`[]\` (empty array of lists):
The seeding loop never runs (no lists to iterate) → heap stays empty → \`while (heap.size() > 0)\` never executes → \`dummy.next\` stays \`null\` → **[]** — matches expected.`,
      },
    ],
    relatedSlugs: ["merge-two-sorted-lists", "kth-largest-element-in-array"],
    realWorldUsageMarkdown: `The min-heap k-way merge is exactly how external merge sort combines k already-sorted runs read from disk when the full dataset doesn't fit in memory, and it's the same technique log-aggregation systems use to merge k timestamp-sorted shards into one globally ordered event stream.`,
  },
];

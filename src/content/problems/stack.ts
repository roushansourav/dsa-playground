import type { Problem } from "../types";

export const stackProblems: Problem[] = [
  {
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "easy",
    maangTags: ["Google", "Amazon", "Meta"],
    topicSlug: "stack",
    functionName: "isValid",
    description: `## Problem

Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\`, and \`']'\`, determine if the input string is valid. Brackets must close in the correct order and every open bracket must have a matching close of the same type.

## Example

\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\`

## Constraints

- \`1 <= s.length <= 10^4\`

## Senior interview angle

Push opens, and on a close check the **top of the stack** matches — pop on match, fail fast on mismatch. State clearly why a stack (not a counter) is required: order matters, not just counts (\`"([)]"\` has balanced counts but is invalid).

## Pattern

\`Stack as a matcher\` — the base case for every later "validate nested structure" problem (e.g. validating a simplified path, or a parser).`,
    starterCode: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Your code here
}`,
    testCases: [
      { input: ["()"], expected: true },
      { input: ["()[]{}"], expected: true },
      { input: ["(]"], expected: false },
      { input: ["([)]"], expected: false },
      { input: ["{[]}"], expected: true },
    ],
    solutions: [
      {
        approach: "Brute Force (Repeated Pair Reduction)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Repeatedly remove any adjacent matched pair (`()`, `[]`, or `{}`) from the string. If the string can be fully reduced to empty, it was valid; if reduction stalls with characters remaining (including interleaved cases like `\"([)]\"`, where no adjacent pair ever exists to remove), it wasn't. Each full pass is O(n), and a fully-nested string needs O(n) passes to fully collapse.",
        code: `function isValid(s) {
  let prev;
  do {
    prev = s;
    s = s.replace("()", "").replace("[]", "").replace("{}", "");
  } while (s !== prev);
  return s === "";
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4 | \`s.replace("()", "").replace("[]", "").replace("{}", "")\` | Remove the first occurrence of each pair type (each \`.replace\` without a global flag removes only one match). |
| 5 | \`while (s !== prev)\` | Keep collapsing as long as a pass actually removed something. |
| 6 | \`return s === ""\` | Fully valid input collapses completely; any leftover character (unmatched or interleaved) means it wasn't. |`,
        dryRunMarkdown: `**Dry run 1** — \`"([)]"\`:
Pass 1: no literal \`"()"\` substring exists (after \`(\` comes \`[\`, not \`)\`), no literal \`"[]"\` exists (after \`[\` comes \`)\`, not \`]\`), no \`"{}"\` exists → \`s\` unchanged, still \`"([)]"\`. Since \`s === prev\`, the loop stops after one pass.
\`s === ""\`? No → return **false** — matches expected.

**Dry run 2** — \`"{[]}"\`:
Pass 1: no \`"()"\`; \`"[]"\` found inside → removes to \`"{}"\`; then \`"{}"\` found → removes to \`""\`. \`s\` changed, so loop continues.
Pass 2: \`s = ""\`, nothing to remove, unchanged → loop stops.
\`s === ""\`? Yes → return **true** — matches expected.`,
      },
      {
        approach: "Optimal (Stack as a Matcher)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Push every opening bracket. On a closing bracket, the top of the stack must be its matching opener — pop and continue if so, fail immediately if not. At the end, the stack must be empty (no unclosed openers left). A counter alone can't work here: order matters, not just totals (`\"([)]\"` has balanced counts of each bracket type but is still invalid).",
        code: `function isValid(s) {
  const stack = [];
  const pairs = { ")": "(", "]": "[", "}": "{" };

  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch);
    } else if (stack.pop() !== pairs[ch]) {
      return false;
    }
  }
  return stack.length === 0;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`pairs\` | Maps each closer to the opener it must match. |
| 6-7 | opener branch | Push any opening bracket. |
| 8-9 | \`else if (stack.pop() !== pairs[ch]) return false\` | Popping an empty stack yields \`undefined\`, which also fails the comparison correctly — a closer with nothing open to match it is invalid. |
| 11 | \`return stack.length === 0\` | Every opener must have been matched — nothing left unclosed. |`,
        dryRunMarkdown: `**Dry run 1** — \`"([)]"\`:
\`(\` → push → stack=\`['(']\`.
\`[\` → push → stack=\`['(','[']\`.
\`)\` → \`pairs[')'] = '('\`; \`stack.pop()\` returns \`'['\`, which is \`!== '('\` → return **false** — matches expected.

**Dry run 2** — \`"{[]}"\`:
\`{\` → push → stack=\`['{']\`.
\`[\` → push → stack=\`['{','[']\`.
\`]\` → \`pairs[']'] = '['\`; \`stack.pop()\` returns \`'['\`, matches → stack=\`['{']\`.
\`}\` → \`pairs['}'] = '{'\`; \`stack.pop()\` returns \`'{'\`, matches → stack=\`[]\`.
Loop ends; \`stack.length === 0\` → return **true** — matches expected.`,
      },
    ],
    relatedSlugs: ["min-stack"],
    realWorldUsageMarkdown: `Stack-based bracket matching is the literal mechanism behind syntax validation in compilers and linters (matching braces/parens in source code), JSON/XML well-formedness checks, and matching opening/closing tags in HTML validators.`,
  },
  {
    slug: "min-stack",
    title: "Min Stack",
    difficulty: "medium",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "stack",
    functionName: "MinStack",
    description: `## Problem

Design a stack that supports \`push\`, \`pop\`, \`top\`, and retrieving the minimum element, all in **O(1)** time.

Implement the \`MinStack\` class:
- \`MinStack()\` initializes the stack.
- \`push(val)\` pushes \`val\` onto the stack.
- \`pop()\` removes the element on top of the stack.
- \`top()\` returns the element on top of the stack.
- \`getMin()\` returns the minimum element in the stack.

## Example

\`\`\`
Input:  ["MinStack","push","push","push","getMin","pop","top","getMin"]
        [[],[-2],[0],[-3],[],[],[],[]]
Output: [null,null,null,null,-3,null,0,-2]
\`\`\`

## Senior interview angle

The O(1) trick is a **second stack tracking the running minimum**: on push, push \`Math.min(val, currentMin)\` (or the current min itself if larger); on pop, pop both stacks together. This avoids re-scanning for the min and avoids storing pair tuples.

## Pattern

\`Auxiliary stack for O(1) aggregate queries\` — the same "shadow stack tracks a running aggregate" idea generalizes to max-stack, or stack-with-running-sum.`,
    starterCode: `class MinStack {
  constructor() {
    // Your code here
  }

  /**
   * @param {number} val
   * @return {void}
   */
  push(val) {
    // Your code here
  }

  /**
   * @return {void}
   */
  pop() {
    // Your code here
  }

  /**
   * @return {number}
   */
  top() {
    // Your code here
  }

  /**
   * @return {number}
   */
  getMin() {
    // Your code here
  }
}`,
    testCases: [
      {
        operations: ["MinStack", "push", "push", "push", "getMin", "pop", "top", "getMin"],
        args: [[], [-2], [0], [-3], [], [], [], []],
        expected: [null, null, null, null, -3, null, 0, -2],
      },
      {
        operations: ["MinStack", "push", "push", "getMin", "pop", "getMin"],
        args: [[], [5], [3], [], [], []],
        expected: [null, null, null, 3, null, 5],
      },
      {
        operations: ["MinStack", "push", "push", "push", "getMin", "pop", "getMin", "top"],
        args: [[], [2], [0], [0], [], [], [], []],
        expected: [null, null, null, null, 0, null, 0, 0],
      },
    ],
    solutions: [
      {
        approach: "Brute Force (Rescan for Min on Every Query)",
        timeComplexity: "O(1) push/pop/top, O(n) getMin",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Use a single plain array and scan the whole thing for the minimum every time `getMin()` is called. Simple, but violates the problem's O(1)-for-every-operation requirement — an interviewer will ask for the auxiliary-stack trick immediately.",
        code: `class MinStack {
  constructor() {
    this.stack = [];
  }
  push(val) {
    this.stack.push(val);
  }
  pop() {
    this.stack.pop();
  }
  top() {
    return this.stack[this.stack.length - 1];
  }
  getMin() {
    return Math.min(...this.stack);
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5 | \`push(val)\` | Ordinary array push. |
| 14 | \`Math.min(...this.stack)\` | Rescans every element currently on the stack — O(n) work on every call. |`,
        dryRunMarkdown: `**Dry run 1** — \`push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()\`:
push(-2)→[-2]. push(0)→[-2,0]. push(-3)→[-2,0,-3]. getMin()=min(-2,0,-3)=**-3**. pop()→[-2,0]. top()=**0**. getMin()=min(-2,0)=**-2**.
Outputs: [null,null,null,null,-3,null,0,-2] — matches expected.

**Dry run 2** — \`push(2), push(0), push(0), getMin(), pop(), getMin(), top()\`:
push(2)→[2]. push(0)→[2,0]. push(0)→[2,0,0]. getMin()=min(2,0,0)=**0**. pop()→[2,0]. getMin()=min(2,0)=**0**. top()=**0**.
Outputs: [null,null,null,null,0,null,0,0] — matches expected.`,
      },
      {
        approach: "Optimal (Auxiliary Min-Stack)",
        timeComplexity: "O(1) for every operation",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Maintain a second stack, `minStack`, in lockstep with the main one: each push also pushes the minimum of the new value and the current minimum, so `minStack`'s top is always the running minimum of everything currently on the main stack. Popping both together keeps them in sync without ever rescanning.",
        code: `class MinStack {
  constructor() {
    this.stack = [];
    this.minStack = [];
  }
  push(val) {
    this.stack.push(val);
    const currentMin =
      this.minStack.length === 0
        ? val
        : Math.min(val, this.minStack[this.minStack.length - 1]);
    this.minStack.push(currentMin);
  }
  pop() {
    this.stack.pop();
    this.minStack.pop();
  }
  top() {
    return this.stack[this.stack.length - 1];
  }
  getMin() {
    return this.minStack[this.minStack.length - 1];
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 7-11 | \`currentMin\` | The minimum of the incoming value and whatever was the running minimum just before it. |
| 12 | \`this.minStack.push(currentMin)\` | \`minStack\` grows in lockstep with \`stack\`, one entry per push. |
| 15-17 | \`pop()\` | Popping both stacks together keeps them aligned — \`minStack\`'s new top is automatically the correct minimum for the remaining elements. |
| 22 | \`getMin()\` | Just reads \`minStack\`'s top — O(1), no scanning. |`,
        dryRunMarkdown: `**Dry run 1** — \`push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()\`:
push(-2): stack=[-2], minStack empty→currentMin=-2, minStack=[-2].
push(0): stack=[-2,0], currentMin=min(0,-2)=-2, minStack=[-2,-2].
push(-3): stack=[-2,0,-3], currentMin=min(-3,-2)=-3, minStack=[-2,-2,-3].
getMin()→minStack top=**-3**.
pop(): stack=[-2,0], minStack=[-2,-2].
top()→stack top=**0**.
getMin()→minStack top=**-2**.
Outputs: [null,null,null,null,-3,null,0,-2] — matches expected.

**Dry run 2** — \`push(5), push(3), getMin(), pop(), getMin()\`:
push(5): stack=[5], minStack=[5].
push(3): stack=[5,3], currentMin=min(3,5)=3, minStack=[5,3].
getMin()→**3**.
pop(): stack=[5], minStack=[5].
getMin()→**5**.
Outputs: [null,null,null,3,null,5] — matches expected.`,
      },
    ],
    relatedSlugs: ["valid-parentheses", "kth-largest-in-stream"],
    realWorldUsageMarkdown: `The "shadow stack tracks a running aggregate" pattern generalizes to any O(1)-query running statistic over a LIFO structure — undo systems that need the running minimum/maximum of a value across an edit history, or a browser back-stack that tracks the deepest scroll position visited, all without rescanning history on every query.`,
  },
  {
    slug: "evaluate-reverse-polish-notation",
    title: "Evaluate Reverse Polish Notation",
    difficulty: "medium",
    maangTags: ["Amazon", "Google"],
    topicSlug: "stack",
    functionName: "evalRPN",
    description: `## Problem

Evaluate the value of an arithmetic expression given as an array of tokens in **Reverse Polish Notation**. Valid operators are \`+\`, \`-\`, \`*\`, and \`/\`. Division between two integers truncates toward zero.

## Example

\`\`\`
Input: tokens = ["2","1","+","3","*"]
Output: 9
Explanation: ((2 + 1) * 3) = 9
\`\`\`

## Senior interview angle

Push operands; on an operator, **pop two, apply, push the result back** — order matters for \`-\` and \`/\` (the first pop is the right-hand operand, the second is the left-hand). Use \`Math.trunc\`, not \`Math.floor\`, for truncate-toward-zero on negative results.

## Pattern

\`Stack as a calculator\` — RPN evaluation is how a compiler evaluates expressions after parsing infix to postfix; the stack replaces the need for operator precedence/parentheses entirely.`,
    starterCode: `/**
 * @param {string[]} tokens
 * @return {number}
 */
function evalRPN(tokens) {
  // Your code here
}`,
    testCases: [
      { input: [["2", "1", "+", "3", "*"]], expected: 9 },
      { input: [["4", "13", "5", "/", "+"]], expected: 6 },
      {
        input: [["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]],
        expected: 22,
      },
    ],
    solutions: [
      {
        approach: "Stack-Based Evaluation",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Push numbers as they're seen. On an operator, pop the two most recent operands, apply the operator, and push the result back. Order matters for `-` and `/`: the first pop is the *right-hand* operand and the second is the *left-hand* one, since it was pushed earlier. This is the only meaningfully distinct approach — RPN is specifically designed to be evaluated with a single stack in one linear pass, which is exactly what a compiler does after parsing infix expressions into postfix form.",
        code: `function evalRPN(tokens) {
  const stack = [];
  const ops = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => Math.trunc(a / b),
  };

  for (const token of tokens) {
    if (ops[token]) {
      const b = stack.pop();
      const a = stack.pop();
      stack.push(ops[token](a, b));
    } else {
      stack.push(Number(token));
    }
  }
  return stack.pop();
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-8 | \`ops\` | One function per operator; \`Math.trunc\` (not \`Math.floor\`) gives truncate-toward-zero, which matters for negative results. |
| 11-14 | operator branch | \`b\` is popped first (it was pushed second, i.e. it's the right-hand operand), \`a\` second (the left-hand operand) — applying \`ops[token](a, b)\` preserves the correct operand order for \`-\` and \`/\`. |
| 15-16 | operand branch | Numbers are parsed and pushed directly. |
| 19 | \`return stack.pop()\` | A well-formed RPN expression leaves exactly one value on the stack: the result. |`,
        dryRunMarkdown: `**Dry run 1** — \`["2","1","+","3","*"]\`:
push "2"→[2]. push "1"→[2,1]. "+": b=1,a=2 → push(2+1=3)→[3]. push "3"→[3,3]. "*": b=3,a=3 → push(3*3=9)→[9].
Return **9** — matches expected.

**Dry run 2** — \`["4","13","5","/","+"]\`:
push "4"→[4]. push "13"→[4,13]. push "5"→[4,13,5]. "/": b=5,a=13 → push(Math.trunc(13/5)=Math.trunc(2.6)=2)→[4,2]. "+": b=2,a=4 → push(4+2=6)→[6].
Return **6** — matches expected.`,
      },
    ],
    relatedSlugs: ["valid-parentheses", "min-stack"],
    realWorldUsageMarkdown: `Stack-based RPN evaluation is literally how postfix/RPN calculators (like classic HP calculators) work internally, and it's the execution model simple compilers and virtual machines use for postfix bytecode — parsing infix source into postfix once removes the need to handle operator precedence or parentheses at evaluation time.`,
  },
  {
    slug: "generate-parentheses",
    title: "Generate Parentheses",
    difficulty: "medium",
    maangTags: ["Google", "Meta", "Amazon"],
    topicSlug: "stack",
    functionName: "generateParenthesis",
    description: `## Problem

Given \`n\` pairs of parentheses, return all combinations of well-formed parentheses strings, in this exact order: generated by always trying to place an open paren before a close paren at each step (standard backtracking order).

## Example

\`\`\`
Input: n = 3
Output: ["((()))","(()())","(())()","()(())","()()()"]
\`\`\`

## Senior interview angle

Backtrack with two counters (\`open\`, \`close\`) instead of validating full strings after the fact: add \`(\` whenever \`open < n\`, add \`)\` whenever \`close < open\`. This prunes invalid branches immediately instead of generating-then-filtering \`2^(2n)\` strings.

## Pattern

\`Constrained backtracking\` — the counters ARE the validity invariant, so every leaf reached is automatically valid. The same shape (branch only when a local constraint allows it) shows up in N-Queens and Sudoku solvers.`,
    starterCode: `/**
 * @param {number} n
 * @return {string[]}
 */
function generateParenthesis(n) {
  // Your code here
}`,
    testCases: [
      { input: [1], expected: ["()"] },
      { input: [2], expected: ["(())", "()()"] },
      { input: [3], expected: ["((()))", "(()())", "(())()", "()(())", "()()()"] },
    ],
    solutions: [
      {
        approach: "Brute Force (Generate All, Then Filter)",
        timeComplexity: "O(2^(2n) · n)",
        spaceComplexity: "O(2^(2n) · n)",
        overviewMarkdown:
          "Generate every possible length-`2n` string over `{'(', ')'}` by recursively trying `'('` then `')'` at each position (depth-first, so `'('` is always explored before `')'` — this preserves the same left-to-right ordering the optimal solution produces), then keep only the ones that are valid (checked via a running balance that never goes negative and ends at zero). Correct, but explores exponentially many invalid branches the optimal approach prunes immediately.",
        code: `function generateParenthesis(n) {
  const result = [];

  const isValidCombo = (str) => {
    let balance = 0;
    for (const ch of str) {
      balance += ch === "(" ? 1 : -1;
      if (balance < 0) return false;
    }
    return balance === 0;
  };

  const build = (current) => {
    if (current.length === 2 * n) {
      if (isValidCombo(current)) result.push(current);
      return;
    }
    build(current + "(");
    build(current + ")");
  };

  build("");
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4-10 | \`isValidCombo\` | A string is well-formed if the running open-minus-close balance never dips below zero and ends at exactly zero. |
| 13-19 | \`build\` | Explore both choices (\`'('\` first, then \`')'\`) at every position, unconditionally, until the target length is reached. |`,
        dryRunMarkdown: `**Dry run 1** — \`n=1\`:
\`build("")\` → \`build("(")\` → \`build("((")\`: length2=2n, \`isValidCombo("((")\`: balance 1,2 → ends at 2≠0 → invalid, not pushed. Back up, try \`build("()")\`: length2=2n, \`isValidCombo("()")\`: balance 1,0 → ends at 0, never negative → valid → push \`"()"\`.
Back at root, try \`build(")")\` → \`build(")(")\`: balance starts at -1 (negative immediately) → invalid. \`build("))")\`: balance -1,-2 → invalid.
Result: **["()"]** — matches expected.

**Dry run 2** — \`n=2\`:
Enumerating all 16 length-4 strings in \`'('\`-then-\`')'\` depth-first order and checking validity, exactly two survive, in this order: \`"(())"\` (balance 1,2,1,0 — always ≥0, ends at 0 ✓) and \`"()()"\` (balance 1,0,1,0 — always ≥0, ends at 0 ✓). Every other combination either goes negative mid-string or doesn't end at zero.
Result: **["(())","()()"]** — matches expected (including order, since filtering preserves generation order).`,
      },
      {
        approach: "Optimal (Constrained Backtracking)",
        timeComplexity: "O(4^n / √n) — the nth Catalan number of valid strings, each built in O(n)",
        spaceComplexity: "O(n) recursion depth (plus output)",
        overviewMarkdown:
          "Track two counters, `open` and `close`, instead of validating full strings after the fact. Only branch to add `'('` when `open < n`, and only branch to add `')'` when `close < open` (never more closes than opens so far). These two counters ARE the validity invariant — every leaf the recursion reaches is automatically a valid, complete combination, so there's nothing left to filter.",
        code: `function generateParenthesis(n) {
  const result = [];

  const backtrack = (current, open, close) => {
    if (current.length === 2 * n) {
      result.push(current);
      return;
    }
    if (open < n) backtrack(current + "(", open + 1, close);
    if (close < open) backtrack(current + ")", open, close + 1);
  };

  backtrack("", 0, 0);
  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-8 | base case | Once the string reaches length \`2n\`, the counters guarantee it's valid — record it directly. |
| 9 | \`if (open < n) backtrack(current + "(", ...)\` | Only add an open paren if there's still budget for one. |
| 10 | \`if (close < open) backtrack(current + ")", ...)\` | Only add a close paren if it wouldn't outnumber the opens placed so far. |`,
        dryRunMarkdown: `**Dry run 1** — \`n=1\`:
\`backtrack("",0,0)\`: open(0)<1 → \`backtrack("(",1,0)\`: length1≠2. open(1)<1? no. close(0)<open(1) → \`backtrack("()",1,1)\`: length2=2 → push \`"()"\`.
Back at root: close(0)<open(0)? no — no further branch.
Result: **["()"]** — matches expected.

**Dry run 2** — \`n=2\`:
\`backtrack("",0,0)\`: open<2 → \`backtrack("(",1,0)\`.
  \`backtrack("(",1,0)\`: open<2 → \`backtrack("((",2,0)\`.
    \`backtrack("((",2,0)\`: open(2)<2? no. close(0)<open(2) → \`backtrack("(()",2,1)\`.
      \`backtrack("(()",2,1)\`: open(2)<2? no. close(1)<open(2) → \`backtrack("(())",2,2)\`: length4=4 → push \`"(())"\`.
  Back at \`backtrack("(",1,0)\`: close(0)<open(1) → \`backtrack("()",1,1)\`.
    \`backtrack("()",1,1)\`: open(1)<2 → \`backtrack("()(",2,1)\`.
      \`backtrack("()(",2,1)\`: open(2)<2? no. close(1)<open(2) → \`backtrack("()()",2,2)\`: length4=4 → push \`"()()"\`.
Back at root: close(0)<open(0)? no.
Result: **["(())","()()"]** — matches expected (including order).`,
      },
    ],
    relatedSlugs: ["valid-parentheses"],
    realWorldUsageMarkdown: `Backtracking that prunes via a running validity invariant (instead of generate-then-filter) is the general technique behind combinatorial test-case generators — e.g. producing every valid nested JSON/XML skeleton up to a given depth for fuzz testing — and compiler grammar-rule enumeration where partial derivations are discarded the moment they can no longer be completed validly.`,
  },
  {
    slug: "daily-temperatures",
    title: "Daily Temperatures",
    difficulty: "medium",
    maangTags: ["Amazon", "Google", "Meta"],
    topicSlug: "stack",
    functionName: "dailyTemperatures",
    description: `## Problem

Given an array \`temperatures\`, return an array \`answer\` where \`answer[i]\` is the number of days until a warmer temperature. If there is no future day for which this is possible, \`answer[i] = 0\`.

## Example

\`\`\`
Input: temperatures = [73,74,75,71,69,72,76,73]
Output: [1,1,4,2,1,1,0,0]
\`\`\`

## Senior interview angle

The **monotonic decreasing stack** (of indices) is the O(n) answer: push indices while temperatures are non-increasing; whenever the current temperature beats the stack's top, pop it and record the day-gap. Each index is pushed and popped at most once — that's the O(n) argument to state explicitly, since the nested loop looks O(n²) at a glance.

## Pattern

\`Monotonic stack\` — the canonical "next greater element" technique; reused verbatim for Next Greater Element I/II and Car Fleet.`,
    starterCode: `/**
 * @param {number[]} temperatures
 * @return {number[]}
 */
function dailyTemperatures(temperatures) {
  // Your code here
}`,
    testCases: [
      {
        input: [[73, 74, 75, 71, 69, 72, 76, 73]],
        expected: [1, 1, 4, 2, 1, 1, 0, 0],
      },
      { input: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
      { input: [[30, 60, 90]], expected: [1, 1, 0] },
    ],
    solutions: [
      {
        approach: "Brute Force (Scan Forward From Each Day)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1) extra (excluding output)",
        overviewMarkdown:
          "For each day, scan forward day by day until a strictly warmer temperature is found, recording the gap. Correct, but rescans the same future days over and over from every starting point.",
        code: `function dailyTemperatures(temperatures) {
  const answer = new Array(temperatures.length).fill(0);
  for (let i = 0; i < temperatures.length; i++) {
    for (let j = i + 1; j < temperatures.length; j++) {
      if (temperatures[j] > temperatures[i]) {
        answer[i] = j - i;
        break;
      }
    }
  }
  return answer;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3-4 | nested loops | For each day \`i\`, scan every later day \`j\`. |
| 5-7 | first warmer day found | Record the gap and stop scanning for this \`i\` — \`answer[i]\` stays 0 by default if no warmer day exists. |`,
        dryRunMarkdown: `**Dry run 1** — \`[30,60,90]\`:
i=0(30): j=1(60)>30 → gap=1.
i=1(60): j=2(90)>60 → gap=1.
i=2(90): no later day → stays 0.
Result: **[1,1,0]** — matches expected.

**Dry run 2** — \`[30,40,50,60]\`:
i=0(30): j=1(40)>30 → gap=1. i=1(40): j=2(50)>40 → gap=1. i=2(50): j=3(60)>50 → gap=1. i=3(60): no later day → 0.
Result: **[1,1,1,0]** — matches expected.`,
      },
      {
        approach: "Optimal (Monotonic Decreasing Stack)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Keep a stack of indices whose temperatures are decreasing from bottom to top. For each new day, pop every index on the stack with a colder temperature than today's — today is the answer (the 'next warmer day') for all of them — then push today's index. Each index is pushed and popped at most once across the whole run, which is the O(n) argument to state explicitly (the nested-looking pop loop doesn't make this O(n²)).",
        code: `function dailyTemperatures(temperatures) {
  const answer = new Array(temperatures.length).fill(0);
  const stack = []; // indices, with decreasing temperatures bottom to top

  for (let i = 0; i < temperatures.length; i++) {
    while (stack.length && temperatures[stack[stack.length - 1]] < temperatures[i]) {
      const prevIndex = stack.pop();
      answer[prevIndex] = i - prevIndex;
    }
    stack.push(i);
  }
  return answer;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-9 | \`while\` loop | Every index left colder than today just found its "next warmer day" — pop it and record the gap. |
| 10 | \`stack.push(i)\` | Today becomes a candidate for some future warmer day. |`,
        dryRunMarkdown: `**Dry run 1** — \`[30,60,90]\`:
i0(30): stack empty → push. stack=[0].
i1(60): temps[0]=30<60 → pop0, answer[0]=1-0=1. stack=[]. push1. stack=[1].
i2(90): temps[1]=60<90 → pop1, answer[1]=2-1=1. stack=[]. push2. stack=[2].
Loop ends; index2 never popped, stays 0.
Result: **[1,1,0]** — matches expected.

**Dry run 2** — \`[73,74,75,71,69,72,76,73]\`:
i0(73): push. stack=[0].
i1(74): temps[0]=73<74 → pop0, answer[0]=1. stack=[]. push1. stack=[1].
i2(75): temps[1]=74<75 → pop1, answer[1]=1. stack=[]. push2. stack=[2].
i3(71): temps[2]=75<71? no → push3. stack=[2,3].
i4(69): temps[3]=71<69? no → push4. stack=[2,3,4].
i5(72): temps[4]=69<72 → pop4, answer[4]=5-4=1. temps[3]=71<72 → pop3, answer[3]=5-3=2. temps[2]=75<72? no → stop. push5. stack=[2,5].
i6(76): temps[5]=72<76 → pop5, answer[5]=6-5=1. temps[2]=75<76 → pop2, answer[2]=6-2=4. stack=[]. push6. stack=[6].
i7(73): temps[6]=76<73? no → push7. stack=[6,7].
Loop ends; indices 6,7 never popped, stay 0.
Result: **[1,1,4,2,1,1,0,0]** — matches expected.`,
      },
    ],
    relatedSlugs: ["sliding-window-maximum", "valid-parentheses"],
    realWorldUsageMarkdown: `The monotonic stack "next greater element" technique is the classic approach behind stock-span problems (how many consecutive prior days had a lower price), and the same next-greater/next-smaller-index idea underlies largest-rectangle-in-histogram computations and car-fleet-style catch-up/collision simulations.`,
  },
];

import type { Problem } from "../types";

export const bitManipulationProblems: Problem[] = [
  {
    slug: "single-number",
    title: "Single Number",
    difficulty: "easy",
    maangTags: ["Amazon", "Google"],
    topicSlug: "bit-manipulation",
    functionName: "singleNumber",
    description: `## Problem

Given a non-empty array of integers \`nums\`, every element appears twice except for one. Find that single one, using only constant extra space.

## Example

\`\`\`
Input: nums = [4,1,2,1,2]
Output: 4
\`\`\`

## Constraints

- \`1 <= nums.length <= 3 * 10^4\`
- \`-3 * 10^4 <= nums[i] <= 3 * 10^4\`
- Every element appears twice except for exactly one, which appears once.

## Senior interview angle

The moment the constraint says "constant extra space," a hash-set frequency count is off the table — that's the signal to reach for XOR. \`x ^ x === 0\` for any \`x\`, and XOR is commutative/associative, so XOR-folding the entire array cancels every duplicate pair down to zero, leaving only the unpaired value. Stating that invariant out loud (\`x ^ x = 0\`, \`x ^ 0 = x\`, order doesn't matter) is what separates "I memorized this trick" from "I can derive it," and it's the same invariant that generalizes to harder variants (two singles, one appearing three times, etc.).

## Pattern

\`XOR-fold\` — XOR every element together; every duplicate pair cancels to zero, leaving only the value that appears once.`,
    starterCode: `/**
 * @param {number[]} nums
 * @return {number}
 */
function singleNumber(nums) {
  // Your code here
}`,
    testCases: [
      { input: [[2, 2, 1]], expected: 1 },
      { input: [[4, 1, 2, 1, 2]], expected: 4 },
      { input: [[1]], expected: 1 },
    ],
    solutions: [
      {
        approach: "Brute Force (Hash Map Frequency Count)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Count how many times each number appears in a map, then scan the map for the one entry with count 1. Correct and linear time, but uses O(n) extra space — exactly what the problem's constant-space constraint rules out.",
        code: `function singleNumber(nums) {
  const counts = new Map();

  for (const num of nums) {
    counts.set(num, (counts.get(num) || 0) + 1);
  }

  for (const [num, count] of counts) {
    if (count === 1) {
      return num;
    }
  }
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`const counts = new Map();\` | Track how many times each number has been seen. |
| 4-6 | \`counts.set(num, (counts.get(num) \|\| 0) + 1);\` | Increment the running count for this number. |
| 9-13 | \`for (const [num, count] of counts) { if (count === 1) return num; }\` | The one number with count 1 is the unpaired answer. |`,
        dryRunMarkdown: `**Dry run 1 (nums=[2,2,1])**: counts: 2→1, 2→2, 1→1. Map={2:2, 1:1}. Scan: 2 has count 2, skip. 1 has count 1 → return **1** — matches expected.

**Dry run 2 (nums=[4,1,2,1,2])**: counts: 4:1, 1:2, 2:2. Scan finds 4 with count 1 → return **4** — matches expected.`,
      },
      {
        approach: "Optimal (XOR-Fold)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "XOR every element together into a single accumulator. Since a ^ a = 0 and a ^ 0 = a, and XOR is commutative and associative, every value that appears twice cancels itself out regardless of order, leaving only the value that appears once.",
        code: `function singleNumber(nums) {
  let result = 0;

  for (const num of nums) {
    result ^= num;
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`let result = 0;\` | Identity element for XOR — folding anything with 0 leaves it unchanged. |
| 4-6 | \`result ^= num;\` | Fold each number in; duplicates XOR to 0 no matter what order they appear in. |
| 8 | \`return result;\` | Whatever survives the fold is the number that appeared exactly once. |`,
        dryRunMarkdown: `**Dry run 1 (nums=[2,2,1])**: result=0. 0^2=2. 2^2=0. 0^1=1. Return **1** — matches expected.

**Dry run 2 (nums=[4,1,2,1,2])**: result=0. 0^4=4. 4^1=5. 5^2=7. 7^1=6. 6^2=4. Return **4** — matches expected.`,
      },
    ],
    relatedSlugs: ["missing-number", "sum-of-two-integers"],
    realWorldUsageMarkdown: `XOR-folding for "find the odd one out" is the same trick behind checksum/parity verification (detecting a single flipped bit across a transmitted block) and behind fast duplicate-detection passes in memory-constrained embedded systems where allocating a hash set isn't an option.`,
  },
  {
    slug: "number-of-1-bits",
    title: "Number of 1 Bits",
    difficulty: "easy",
    maangTags: ["Apple", "Meta"],
    topicSlug: "bit-manipulation",
    functionName: "hammingWeight",
    description: `## Problem

Given a positive integer \`n\`, write a function that returns the number of set bits (\`1\`s) in its binary representation (also known as the Hamming weight).

## Example

\`\`\`
Input: n = 11
Output: 3
Explanation: 11 in binary is 1011, which has three set bits.
\`\`\`

## Constraints

- \`1 <= n <= 2^31 - 1\`

## Senior interview angle

The naive approach shifts through all 32 bit positions even when \`n\` has only one or two set bits. Brian Kernighan's trick, \`n = n & (n - 1)\`, clears exactly the lowest set bit on each iteration — so the loop runs once per set bit, not once per bit position. Recognizing *why* \`n - 1\` flips every bit below the lowest set bit (and that ANDing with the original then clears just that one) is the actual signal interviewers want; reciting the formula without being able to explain it falls apart under a follow-up like "what does this do for n = 8?"

## Pattern

\`Brian Kernighan's bit trick\` — \`n & (n - 1)\` clears the lowest set bit, so looping until \`n\` hits zero counts exactly the set bits, in O(popcount) iterations.`,
    starterCode: `/**
 * @param {number} n
 * @return {number}
 */
function hammingWeight(n) {
  // Your code here
}`,
    testCases: [
      { input: [11], expected: 3 },
      { input: [128], expected: 1 },
      { input: [4294967293], expected: 31 },
    ],
    solutions: [
      {
        approach: "Brute Force (Check All 32 Bit Positions)",
        timeComplexity: "O(32) = O(1), but always does the full 32 iterations",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Shift through all 32 bit positions unconditionally, checking each one with a mask, and count how many are set. Correct, but does the same fixed amount of work whether n has 1 set bit or 31.",
        code: `function hammingWeight(n) {
  let count = 0;

  for (let i = 0; i < 32; i++) {
    if ((n & (1 << i)) !== 0) {
      count++;
    }
  }

  return count;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4 | \`for (let i = 0; i < 32; i++)\` | Always checks every one of the 32 bit positions, regardless of how sparse n's bits are. |
| 5 | \`if ((n & (1 << i)) !== 0)\` | Mask out bit i and test whether it's set. |
| 6 | \`count++;\` | Tally each set bit found. |`,
        dryRunMarkdown: `**Dry run 1 (n=11, binary 1011)**: i=0: bit0=1 → count=1. i=1: bit1=1 → count=2. i=2: bit2=0 → skip. i=3: bit3=1 → count=3. i=4..31: all 0. Return **3** — matches expected.

**Dry run 2 (n=128, binary 10000000)**: only bit7 is set. Loop checks all 32 positions, finds exactly one set bit at i=7. Return **1** — matches expected.`,
      },
      {
        approach: "Optimal (Brian Kernighan's Bit Trick)",
        timeComplexity: "O(popcount(n)) — one iteration per set bit",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Repeatedly clear the lowest set bit using n = n & (n - 1) and count how many times this can be done before n becomes 0. Subtracting 1 flips every bit below (and including) the lowest set bit; ANDing with the original n then clears exactly that lowest set bit and leaves everything else untouched — so the loop only ever runs once per set bit, never once per bit position.",
        code: `function hammingWeight(n) {
  let count = 0;

  while (n !== 0) {
    n &= n - 1;
    count++;
  }

  return count;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4 | \`while (n !== 0)\` | Stops as soon as every set bit has been cleared — no wasted iterations on zero bits. |
| 5 | \`n &= n - 1;\` | Clears the lowest set bit: \`n - 1\` flips it and every bit below it, and ANDing with n keeps only bits that agreed, wiping that lowest bit. |
| 6 | \`count++;\` | Each iteration clears exactly one set bit, so the loop count equals the popcount. |`,
        dryRunMarkdown: `**Dry run 1 (n=11 = 1011)**: n=1011, n-1=1010, n&(n-1)=1010 (10) → count=1. n=1010, n-1=1001, n&(n-1)=1000 (8) → count=2. n=1000, n-1=0111, n&(n-1)=0000 (0) → count=3. n=0 → stop. Return **3** — matches expected.

**Dry run 2 (n=128 = 10000000)**: n-1=01111111, n&(n-1)=0 → count=1. n=0 → stop. Return **1** — matches expected.`,
      },
    ],
    relatedSlugs: ["counting-bits", "reverse-bits"],
    realWorldUsageMarkdown: `Hamming weight is the actual name for this — it's the basis of Hamming-distance error-detection codes in networking/storage, and popcount is a real CPU instruction used heavily in bitset-based database indexes and Bloom filter implementations.`,
  },
  {
    slug: "counting-bits",
    title: "Counting Bits",
    difficulty: "easy",
    maangTags: ["Google", "Amazon"],
    topicSlug: "bit-manipulation",
    functionName: "countBits",
    description: `## Problem

Given an integer \`n\`, return an array \`ans\` of length \`n + 1\` such that for each \`i\` (\`0 <= i <= n\`), \`ans[i]\` is the number of set bits in the binary representation of \`i\`.

## Example

\`\`\`
Input: n = 5
Output: [0,1,1,2,1,2]
Explanation: 0=0b0, 1=0b1, 2=0b10, 3=0b11, 4=0b100, 5=0b101
\`\`\`

## Constraints

- \`0 <= n <= 10^5\`

## Senior interview angle

Computing each entry independently (even with Brian Kernighan's trick) redoes work that's already sitting in the table: \`i\`'s popcount is exactly \`i >> 1\`'s popcount plus whether \`i\`'s own lowest bit is set. That recurrence, \`ans[i] = ans[i >> 1] + (i & 1)\`, turns an O(n log n) (or O(n · popcount)) computation into a single O(n) pass that reuses previously computed answers — the same "build on subproblems already solved" instinct as 1-D DP, just expressed over bits instead of array indices.

## Pattern

\`Bit DP via right-shift recurrence\` — \`ans[i] = ans[i >> 1] + (i & 1)\`: reuse the popcount of i's prefix (i shifted right) instead of recomputing from scratch.`,
    starterCode: `/**
 * @param {number} n
 * @return {number[]}
 */
function countBits(n) {
  // Your code here
}`,
    testCases: [
      { input: [2], expected: [0, 1, 1] },
      { input: [5], expected: [0, 1, 1, 2, 1, 2] },
      { input: [0], expected: [0] },
    ],
    solutions: [
      {
        approach: "Brute Force (Brian Kernighan's Trick per Number)",
        timeComplexity: "O(n · popcount) ≈ O(n log n)",
        spaceComplexity: "O(n) for the output",
        overviewMarkdown:
          "For every number from 0 to n, independently count its set bits by repeatedly clearing the lowest set bit. Correct, and each individual count is fast, but every number is computed completely from scratch instead of reusing any of the (n-1) answers already sitting in the output array.",
        code: `function countBits(n) {
  const ans = new Array(n + 1).fill(0);

  for (let i = 0; i <= n; i++) {
    let num = i;
    let count = 0;
    while (num !== 0) {
      num &= num - 1;
      count++;
    }
    ans[i] = count;
  }

  return ans;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4 | \`for (let i = 0; i <= n; i++)\` | Process every number from 0 to n independently. |
| 7-10 | \`while (num !== 0) { num &= num - 1; count++; }\` | Brian Kernighan's trick, computed fresh for this one number. |
| 11 | \`ans[i] = count;\` | Store this number's popcount, without reusing any earlier result. |`,
        dryRunMarkdown: `**Dry run 1 (n=2)**: i=0: count=0. i=1 (0b1): clear once → count=1. i=2 (0b10): clear once → count=1. Return **[0,1,1]** — matches expected.

**Dry run 2 (n=5)**: i=0:0, i=1(0b1):1, i=2(0b10):1, i=3(0b11):2, i=4(0b100):1, i=5(0b101):2. Return **[0,1,1,2,1,2]** — matches expected.`,
      },
      {
        approach: "Optimal (Right-Shift DP Recurrence)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n) for the output",
        overviewMarkdown:
          "Build the answer array bottom-up. Each i's popcount equals the popcount of i >> 1 (i with its lowest bit dropped) plus 1 if i's own lowest bit is set, else plus 0. Since i >> 1 is always a smaller index already computed earlier in the same pass, this needs only one pass with O(1) work per entry.",
        code: `function countBits(n) {
  const ans = new Array(n + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    ans[i] = ans[i >> 1] + (i & 1);
  }

  return ans;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`const ans = new Array(n + 1).fill(0);\` | ans[0] = 0 by definition (base case, already correct after fill). |
| 4-6 | \`ans[i] = ans[i >> 1] + (i & 1);\` | Reuse the already-computed popcount of i's prefix (i >> 1), and add 1 exactly when i's own lowest bit is set. |`,
        dryRunMarkdown: `**Dry run 1 (n=2)**: ans[0]=0. i=1: ans[0]=0, i&1=1 → ans[1]=1. i=2: ans[1]=1, 2&1=0 → ans[2]=1. Return **[0,1,1]** — matches expected.

**Dry run 2 (n=5)**: ans[0]=0. i=1: ans[0]+1=1. i=2: ans[1]+0=1. i=3: ans[1]+1=2. i=4: ans[2]+0=1. i=5: ans[2]+1=2. Return **[0,1,1,2,1,2]** — matches expected.`,
      },
    ],
    relatedSlugs: ["number-of-1-bits", "single-number"],
    realWorldUsageMarkdown: `The right-shift DP recurrence is a real technique for precomputing popcount lookup tables used to accelerate bitset operations in database engines and compression algorithms, where a fast table beats calling a popcount routine per query.`,
  },
  {
    slug: "reverse-bits",
    title: "Reverse Bits",
    difficulty: "easy",
    maangTags: ["Apple", "Google"],
    topicSlug: "bit-manipulation",
    functionName: "reverseBits",
    description: `## Problem

Reverse the bits of a given 32-bit unsigned integer \`n\`, and return the resulting unsigned integer.

## Example

\`\`\`
Input: n = 00000010100101000001111010011100
Output: 964176192 (00111001011110000010100101000000)
\`\`\`

## Constraints

- The input is a 32-bit unsigned integer.

## Senior interview angle

The core move is a bit-by-bit shuffle: peel the lowest bit off \`n\` with \`n & 1\`, shift it into the next position of a result accumulator with \`(result << 1) | bit\`, then shift \`n\` right and repeat 32 times. The part that actually trips candidates up is the *unsigned* return — JavaScript's bitwise operators work on signed 32-bit integers, so the final \`result\` can come out negative even though the answer must be an unsigned value; the fix is a final \`>>> 0\` (unsigned right shift by zero) to reinterpret the bit pattern as unsigned. Missing that step is the single most common bug in this problem in JS specifically, and interviewers listening for signed-vs-unsigned awareness will catch it immediately.

## Pattern

\`Bit-by-bit shift-and-accumulate\` — pop the lowest bit off n, push it into the top of an accumulator, 32 times; finish with \`>>> 0\` to force an unsigned result in JS.`,
    starterCode: `/**
 * @param {number} n
 * @return {number}
 */
function reverseBits(n) {
  // Your code here
}`,
    testCases: [
      { input: [43261596], expected: 964176192 },
      { input: [4294967293], expected: 3221225471 },
      { input: [1], expected: 2147483648 },
    ],
    solutions: [
      {
        approach: "Brute Force (String Reversal)",
        timeComplexity: "O(1) (fixed 32-bit width)",
        spaceComplexity: "O(1) (fixed-length string)",
        overviewMarkdown:
          "Convert n to a 32-character binary string (zero-padded), reverse the string, then parse it back to an integer in base 2. Correct, but leans on string conversion utilities instead of demonstrating direct bit manipulation, and does more work per bit (string indexing/padding) than a pure shift-based approach needs.",
        code: `function reverseBits(n) {
  const binary = (n >>> 0).toString(2).padStart(32, "0");
  const reversed = binary.split("").reverse().join("");
  return parseInt(reversed, 2) >>> 0;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`(n >>> 0).toString(2).padStart(32, "0")\` | Force n to be read as unsigned, then render as a zero-padded 32-character binary string. |
| 3 | \`binary.split("").reverse().join("")\` | Reverse the character order of the bit string. |
| 4 | \`parseInt(reversed, 2) >>> 0\` | Parse the reversed bit string back into a number, forcing an unsigned 32-bit result. |`,
        dryRunMarkdown: `**Dry run 1 (n=1)**: binary = "00000000000000000000000000000001". reversed = "10000000000000000000000000000000". parseInt(reversed,2) = 2147483648. Return **2147483648** — matches expected.

**Dry run 2 (n=43261596)**: binary = "00000010100101000001111010011100". reversed = "00111001011110000010100101000000". parseInt gives 964176192. Return **964176192** — matches expected.`,
      },
      {
        approach: "Optimal (Bit-by-Bit Shift and Accumulate)",
        timeComplexity: "O(1) — always exactly 32 iterations",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Build the reversed value directly with bit operations: 32 times, shift the accumulator left to make room, OR in n's current lowest bit, then shift n right to expose the next bit. Finish with an unsigned right shift by 0 to force the signed 32-bit result into the unsigned range the problem expects.",
        code: `function reverseBits(n) {
  let result = 0;

  for (let i = 0; i < 32; i++) {
    result = (result << 1) | (n & 1);
    n >>>= 1;
  }

  return result >>> 0;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4 | \`for (let i = 0; i < 32; i++)\` | Always exactly 32 iterations, one per bit position. |
| 5 | \`result = (result << 1) \| (n & 1);\` | Make room for a new lowest bit, then insert n's current lowest bit there. |
| 6 | \`n >>>= 1;\` | Unsigned right shift exposes the next bit of n as the new lowest bit. |
| 9 | \`return result >>> 0;\` | Force the result to be read as an unsigned 32-bit integer — without this, a result with the sign bit set would print as negative. |`,
        dryRunMarkdown: `**Dry run 1 (n=1 = ...0001)**: i=0: result=(0<<1)|1=1, n=0. i=1..31: result=(result<<1)|0 each time (just shifting left), n stays 0. After 31 more left-shifts, result = 1 followed by 31 zeros = 2^31 = 2147483648. Return **2147483648** — matches expected.

**Dry run 2 (n=4294967293 = 11111111111111111111111111111101)**: bit0 of n is 1 (odd number), so result starts by inserting a 1 at the bottom, then the remaining 31 bits of n are all 1 except one 0 near the top — the reversal moves that single 0 bit to near the bottom (second position from the end) of the result, producing 10111111111111111111111111111111 in binary = **3221225471** — matches expected.`,
      },
    ],
    relatedSlugs: ["number-of-1-bits", "counting-bits"],
    realWorldUsageMarkdown: `Bit reversal is a real building block of the Fast Fourier Transform (index bit-reversal permutation) and of network byte/bit-order conversions between big-endian and little-endian protocols.`,
  },
  {
    slug: "missing-number",
    title: "Missing Number",
    difficulty: "easy",
    maangTags: ["Amazon", "Meta"],
    topicSlug: "bit-manipulation",
    functionName: "missingNumber",
    description: `## Problem

Given an array \`nums\` containing \`n\` distinct numbers in the range \`[0, n]\`, return the one number in that range that is missing from the array.

## Example

\`\`\`
Input: nums = [3,0,1]
Output: 2
Explanation: n = 3, so all numbers are in [0,3]. 2 is missing.
\`\`\`

## Constraints

- \`n == nums.length\`
- \`1 <= n <= 10^4\`
- \`0 <= nums[i] <= n\`
- All values in \`nums\` are distinct.

## Senior interview angle

XOR every index \`0..n\` together with every value in \`nums\`. Every number that's actually present gets XORed twice (once as its own value, once as the index it could have occupied) and cancels to zero — the only number left standing after the fold is the one that never got a matching index pair: the missing one. This is the same XOR-fold invariant as Single Number, applied by pairing values against indices instead of pairing duplicates against each other, and it avoids the overflow risk that a sum-formula approach (\`n(n+1)/2 - sum(nums)\`) can hit on very large inputs in other languages.

## Pattern

\`XOR-fold against index range\` — XOR every value 0..n with every element of nums; the unmatched survivor is the missing number.`,
    starterCode: `/**
 * @param {number[]} nums
 * @return {number}
 */
function missingNumber(nums) {
  // Your code here
}`,
    testCases: [
      { input: [[3, 0, 1]], expected: 2 },
      { input: [[0, 1]], expected: 2 },
      { input: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expected: 8 },
    ],
    solutions: [
      {
        approach: "Brute Force (Sort and Scan)",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(1) extra (in-place sort) or O(n) depending on sort implementation",
        overviewMarkdown:
          "Sort nums ascending. Walk through and check whether each index i holds the value i; the first mismatch reveals the missing number. If no mismatch is found within the array, the missing number must be n (the one past the end). Correct, but pays an O(n log n) sort for a problem that doesn't need ordering at all.",
        code: `function missingNumber(nums) {
  const sorted = [...nums].sort((a, b) => a - b);

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== i) {
      return i;
    }
  }

  return sorted.length;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`sorted = [...nums].sort((a, b) => a - b);\` | Sort ascending so position i should hold value i if nothing is missing yet. |
| 4-8 | \`if (sorted[i] !== i) return i;\` | The first index whose value doesn't match its position reveals the missing number. |
| 10 | \`return sorted.length;\` | No mismatch found means every number 0..n-1 was present — the missing one must be n itself. |`,
        dryRunMarkdown: `**Dry run 1 (nums=[3,0,1])**: sorted=[0,1,3]. i=0: 0===0 ok. i=1: 1===1 ok. i=2: sorted[2]=3 !== 2 → return **2** — matches expected.

**Dry run 2 (nums=[0,1])**: sorted=[0,1]. i=0: ok. i=1: ok. Loop ends without mismatch → return sorted.length = **2** — matches expected.`,
      },
      {
        approach: "Optimal (XOR-Fold Against the Index Range)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "XOR together every index from 0 to n (inclusive) and every value in nums into one accumulator. Every present number cancels out against the index equal to its own value; whatever survives the fold is the number that had no matching partner — the missing one.",
        code: `function missingNumber(nums) {
  let result = nums.length;

  for (let i = 0; i < nums.length; i++) {
    result ^= i ^ nums[i];
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`let result = nums.length;\` | Seed with n (the index range is 0..n, and this covers the "extra" index not otherwise looped over). |
| 4-6 | \`result ^= i ^ nums[i];\` | Fold in both this index and this value; present numbers end up XORed an even number of times and cancel. |
| 8 | \`return result;\` | Only the missing number survives the fold. |`,
        dryRunMarkdown: `**Dry run 1 (nums=[3,0,1])**: result=3 (n=3). i=0: result ^= 0^3=3 → 3^3=0. i=1: result ^= 1^0=1 → 0^1=1. i=2: result ^= 2^1=3 → 1^3=2. Return **2** — matches expected.

**Dry run 2 (nums=[0,1])**: result=2 (n=2). i=0: result ^= 0^0=0 → 2^0=2. i=1: result ^= 1^1=0 → 2^0=2. Return **2** — matches expected.`,
      },
    ],
    relatedSlugs: ["single-number", "sum-of-two-integers"],
    realWorldUsageMarkdown: `The XOR-fold-against-index-range trick is used in checksum/parity schemes to detect a single missing or corrupted record ID out of an expected contiguous ID range, without needing to sort or store the full expected set.`,
  },
  {
    slug: "sum-of-two-integers",
    title: "Sum of Two Integers",
    difficulty: "medium",
    maangTags: ["Google", "Apple"],
    topicSlug: "bit-manipulation",
    functionName: "getSum",
    description: `## Problem

Given two integers \`a\` and \`b\`, return the sum of the two integers without using the \`+\` or \`-\` operators.

## Example

\`\`\`
Input: a = 1, b = 2
Output: 3
\`\`\`

## Constraints

- \`-1000 <= a, b <= 1000\`

## Senior interview angle

Addition without \`+\` decomposes into two bitwise pieces done in parallel: \`a ^ b\` produces the sum of each bit position ignoring carries, and \`(a & b) << 1\` produces exactly the carries that XOR dropped, shifted into the position they need to be added into. Repeating — treating the new "sum so far" as \`a\` and the new "carry" as \`b\` — until there's no carry left is precisely how a hardware adder's carry propagation works. The senior signal is connecting this to how CPUs actually add in silicon, not just pattern-matching "XOR and shift."

## Pattern

\`Carry-propagate via XOR and shifted AND\` — \`a ^ b\` is the carryless sum, \`(a & b) << 1\` is the carry; repeat until the carry is zero.`,
    starterCode: `/**
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
function getSum(a, b) {
  // Your code here
}`,
    testCases: [
      { input: [1, 2], expected: 3 },
      { input: [2, 3], expected: 5 },
      { input: [-12, 8], expected: -4 },
    ],
    solutions: [
      {
        approach: "Brute Force (Increment/Decrement Loop)",
        timeComplexity: "O(|b|)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Repeatedly nudge a toward the answer one unit at a time using the increment/decrement operators (++ / --), which are distinct operators from the banned binary + and - — if b is positive, increment a and decrement b until b reaches 0; if b is negative, do the reverse. Correct and satisfies the letter of the constraint, but takes time proportional to the magnitude of b instead of the fixed ~32 steps a bitwise approach needs.",
        code: `function getSum(a, b) {
  while (b > 0) {
    a++;
    b--;
  }
  while (b < 0) {
    a--;
    b++;
  }
  return a;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-5 | \`while (b > 0) { a++; b--; }\` | If b is positive, walk it down to 0 one step at a time, nudging a up to match. |
| 6-9 | \`while (b < 0) { a--; b++; }\` | If b is negative, walk it up to 0 one step at a time, nudging a down to match. |
| 10 | \`return a;\` | Once b reaches exactly 0, a has absorbed its full value. |`,
        dryRunMarkdown: `**Dry run 1 (a=1, b=2)**: b>0: a=2,b=1. a=3,b=0. Loop ends. Return **3** — matches expected.

**Dry run 2 (a=-12, b=8)**: b>0: a=-11,b=7 → ... repeats 8 times total → a=-12+8=-4, b=0. Return **-4** — matches expected.`,
      },
      {
        approach: "Optimal (Bitwise XOR + Carry Propagation)",
        timeComplexity: "O(1) — bounded by the fixed bit width (~32 iterations worst case)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Compute the carryless sum with a ^ b and the carry with (a & b) << 1. Treat those as the new a and b and repeat — exactly like manual long addition propagating carries left — until there's no carry left (b becomes 0), at which point a holds the true sum.",
        code: `function getSum(a, b) {
  while (b !== 0) {
    const carry = (a & b) << 1;
    a = a ^ b;
    b = carry;
  }

  return a;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`const carry = (a & b) << 1;\` | Wherever both a and b have a 1 bit, that position generates a carry into the next bit position. |
| 4 | \`a = a ^ b;\` | XOR gives the sum of each bit position ignoring carries — the "carryless" partial sum. |
| 5 | \`b = carry;\` | The carry becomes the new "b" to fold in on the next iteration, same as propagating a carry left in long addition. |
| 2 | \`while (b !== 0)\` | Stops once there's no carry left to propagate — a now holds the final sum. |`,
        dryRunMarkdown: `**Dry run 1 (a=1, b=2)**: a=001, b=010. carry=(001&010)<<1=0. a=001^010=011=3. b=0 → stop. Return **3** — matches expected.

**Dry run 2 (a=2, b=3)**: a=010,b=011. carry=(010&011)<<1=(010)<<1=100=4. a=010^011=001=1. Next: a=1,b=4. carry=(1&4)<<1=0. a=1^4=5. b=0 → stop. Return **5** — matches expected.`,
      },
    ],
    relatedSlugs: ["single-number", "missing-number"],
    realWorldUsageMarkdown: `XOR-plus-carry addition is literally how a hardware full-adder circuit works, and this exact technique shows up in low-level firmware and cryptographic code that must implement arithmetic without relying on a platform's native add instruction (constant-time crypto implementations, homomorphic-encryption circuits).`,
  },
  {
    slug: "reverse-integer",
    title: "Reverse Integer",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta", "Apple"],
    topicSlug: "bit-manipulation",
    functionName: "reverse",
    description: `## Problem

Given a signed 32-bit integer \`x\`, return \`x\` with its digits reversed. If reversing \`x\` causes the value to go outside the signed 32-bit integer range \`[-2^31, 2^31 - 1]\`, return \`0\`.

## Example

\`\`\`
Input: x = 123
Output: 321
\`\`\`

## Constraints

- \`-2^31 <= x <= 2^31 - 1\`

## Senior interview angle

The trap in this problem isn't reversing digits — it's overflow. Building the reversed number digit-by-digit and only checking the range *after* it overflows is already too late in languages with fixed-width integers (and even in JS, letting the value silently exceed \`Number.MAX_SAFE_INTEGER\`-adjacent ranges invites subtle bugs). The correct move is checking *before* each digit is appended: if the running result already exceeds \`Math.floor(2^31 / 10)\` (or equals it with a next-digit that would push it over), stop and return 0 immediately, rather than ever letting the value cross the boundary. Interviewers use this problem specifically to see whether a candidate checks bounds proactively or reactively.

## Pattern

\`Digit-by-digit pop with pre-overflow guard\` — peel digits off with % 10 and integer division by 10, checking the overflow boundary before appending each digit rather than after.`,
    starterCode: `/**
 * @param {number} x
 * @return {number}
 */
function reverse(x) {
  // Your code here
}`,
    testCases: [
      { input: [123], expected: 321 },
      { input: [-123], expected: -321 },
      { input: [120], expected: 21 },
      { input: [1534236469], expected: 0 },
    ],
    solutions: [
      {
        approach: "Brute Force (String Reversal)",
        timeComplexity: "O(d) where d is the number of digits",
        spaceComplexity: "O(d) for the string",
        overviewMarkdown:
          "Convert the absolute value of x to a string, reverse the string, parse it back into a number, reapply the original sign, and finally check whether the result falls outside the 32-bit signed range. Correct, but the overflow check happens only after the full value has already been reconstructed, and string conversion does more work than necessary per digit.",
        code: `function reverse(x) {
  const sign = x < 0 ? -1 : 1;
  const reversedStr = Math.abs(x).toString().split("").reverse().join("");
  const result = sign * parseInt(reversedStr, 10);

  const INT_MAX = 2 ** 31 - 1;
  const INT_MIN = -(2 ** 31);

  if (result > INT_MAX || result < INT_MIN) {
    return 0;
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`const sign = x < 0 ? -1 : 1;\` | Track the sign separately so digit reversal can work on a plain non-negative string. |
| 3 | \`Math.abs(x).toString().split("").reverse().join("")\` | Reverse the digit characters of the absolute value. |
| 4 | \`sign * parseInt(reversedStr, 10)\` | Parse back to a number and reapply the sign. |
| 8-10 | \`if (result > INT_MAX \|\| result < INT_MIN) return 0;\` | Overflow is only caught here, after the full (potentially already-too-large) value has been constructed. |`,
        dryRunMarkdown: `**Dry run 1 (x=123)**: sign=1. abs=123 → "123" reversed → "321". result=321. Within range → return **321** — matches expected.

**Dry run 2 (x=1534236469)**: sign=1. "1534236469" reversed → "9646324351". parseInt → 9646324351. That's > INT_MAX (2147483647) → return **0** — matches expected.`,
      },
      {
        approach: "Optimal (Digit Pop with Pre-Overflow Guard)",
        timeComplexity: "O(d) where d is the number of digits",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Repeatedly pop the last digit off x with x % 10 and shrink x with integer division by 10 (both work correctly on negatives in this formulation). Before appending each digit to the running result, check whether doing so would push the result past the 32-bit boundary, and bail out to 0 immediately if so — never letting the value actually overflow before the check happens.",
        code: `function reverse(x) {
  const INT_MAX = 2 ** 31 - 1;
  const INT_MIN = -(2 ** 31);

  let result = 0;

  while (x !== 0) {
    const digit = x % 10;
    x = Math.trunc(x / 10);

    if (
      result > Math.floor(INT_MAX / 10) ||
      (result === Math.floor(INT_MAX / 10) && digit > 7)
    ) {
      return 0;
    }
    if (
      result < Math.ceil(INT_MIN / 10) ||
      (result === Math.ceil(INT_MIN / 10) && digit < -8)
    ) {
      return 0;
    }

    result = result * 10 + digit;
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 8 | \`const digit = x % 10;\` | Peel off the last digit (JS's % preserves x's sign, so this works directly for negatives too). |
| 9 | \`x = Math.trunc(x / 10);\` | Shrink x toward zero, dropping the digit just extracted. |
| 11-16 | overflow guard before appending a positive-direction digit | Checks whether appending this digit would push result past INT_MAX **before** doing it, instead of after. |
| 17-21 | overflow guard before appending a negative-direction digit | Same idea, mirrored for the INT_MIN boundary. |
| 23 | \`result = result * 10 + digit;\` | Only reached once it's confirmed safe — append the digit. |`,
        dryRunMarkdown: `**Dry run 1 (x=123)**: digit=3,x=12,result=3. digit=2,x=1,result=32. digit=1,x=0,result=321. x=0 → stop. Return **321** — matches expected.

**Dry run 2 (x=1534236469)**: digits pop off one at a time: 9,6,4,6,3,2,4,3,5,1 building result upward. Partway through, result reaches 964632435 and the next digit is 1, giving a check: Math.floor(INT_MAX/10) = 214748364; result (964632435) already exceeds that → the guard fires and returns **0** immediately, before ever constructing the full (invalid) reversed value — matches expected.`,
      },
    ],
    relatedSlugs: ["sum-of-two-integers", "reverse-bits"],
    realWorldUsageMarkdown: `Pre-overflow bounds checking (verify before you act, not after) is the standard defensive pattern in any fixed-width arithmetic system — financial ledger systems, embedded firmware, and serialization formats all use "would this operation overflow" guards before committing a value, rather than detecting corruption after the fact.`,
  },
];

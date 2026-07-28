import type { Problem } from "../types";

export const mathGeometryProblems: Problem[] = [
  {
    slug: "rotate-image",
    title: "Rotate Image",
    difficulty: "medium",
    maangTags: ["Amazon", "Apple", "Google"],
    topicSlug: "math-geometry",
    functionName: "rotate",
    description: `## Problem

Given an \`n x n\` 2D matrix representing an image, rotate the image by 90 degrees clockwise, in place, and return it.

## Example

\`\`\`
Input: matrix = [[1,2,3],[4,5,6],[7,8,9]]
Output: [[7,4,1],[8,5,2],[9,6,3]]
\`\`\`

## Constraints

- \`n == matrix.length == matrix[i].length\`
- \`1 <= n <= 20\`

## Senior interview angle

"In place" is the whole point of this problem — building a new rotated matrix and copying it back is easy but throws away the O(1)-extra-space constraint the interviewer is actually testing. The in-place trick decomposes a 90-degree rotation into two simpler, well-known in-place operations: transpose (swap \`matrix[i][j]\` with \`matrix[j][i]\` across the diagonal) followed by reversing each row. Being able to justify *why* transpose-then-reverse-rows equals a clockwise rotation (versus reverse-then-transpose, which gives a counter-clockwise rotation) is the actual signal — it shows the candidate reasoned about the transformation geometrically rather than memorizing a formula.

## Pattern

\`Transpose + reverse rows\` — decompose a 90° clockwise rotation into two simpler in-place operations instead of allocating a second matrix.`,
    starterCode: `/**
 * @param {number[][]} matrix
 * @return {number[][]}
 */
function rotate(matrix) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
          ],
        ],
        expected: [
          [7, 4, 1],
          [8, 5, 2],
          [9, 6, 3],
        ],
      },
      {
        input: [
          [
            [5, 1, 9, 11],
            [2, 4, 8, 10],
            [13, 3, 6, 7],
            [15, 14, 12, 16],
          ],
        ],
        expected: [
          [15, 13, 2, 5],
          [14, 3, 4, 1],
          [12, 6, 8, 9],
          [16, 7, 10, 11],
        ],
      },
      { input: [[[1]]], expected: [[1]] },
    ],
    solutions: [
      {
        approach: "Brute Force (Build a New Rotated Matrix)",
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(n^2)",
        overviewMarkdown:
          "Allocate a brand-new n x n matrix. For every cell (i, j) in the original, its value belongs at (j, n-1-i) in the rotated result. Fill the new matrix using that mapping, then copy its values back into the original matrix reference. Correct, but uses O(n^2) extra space when the problem asks for in-place rotation.",
        code: `function rotate(matrix) {
  const n = matrix.length;
  const result = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      result[j][n - 1 - i] = matrix[i][j];
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      matrix[i][j] = result[i][j];
    }
  }

  return matrix;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 3 | \`Array.from({ length: n }, () => new Array(n).fill(0))\` | Allocate a full second matrix — the extra space the in-place constraint disallows. |
| 6-8 | \`result[j][n - 1 - i] = matrix[i][j];\` | Map each original cell directly to its rotated position. |
| 11-15 | copy \`result\` back into \`matrix\` | Needed because the function must mutate/return the original matrix reference. |`,
        dryRunMarkdown: `**Dry run 1 ([[1,2,3],[4,5,6],[7,8,9]])**: n=3. i=0: (0,0)=1→result[0][2]=1; (0,1)=2→result[1][2]=2; (0,2)=3→result[2][2]=3. i=1: (1,0)=4→result[0][1]=4; (1,1)=5→result[1][1]=5; (1,2)=6→result[2][1]=6. i=2: (2,0)=7→result[0][0]=7; (2,1)=8→result[1][0]=8; (2,2)=9→result[2][0]=9. result=[[7,4,1],[8,5,2],[9,6,3]]. Copy back. Return **[[7,4,1],[8,5,2],[9,6,3]]** — matches expected.

**Dry run 2 ([[1]])**: n=1. result[0][0]=matrix[0][0]=1. Return **[[1]]** — matches expected.`,
      },
      {
        approach: "Optimal (Transpose + Reverse Rows, In Place)",
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "First transpose the matrix in place by swapping matrix[i][j] with matrix[j][i] for every pair above the diagonal. Then reverse each row in place. Transposing flips the matrix across its main diagonal, and reversing each row then completes the clockwise rotation — together they achieve the full rotation using no extra matrix.",
        code: `function rotate(matrix) {
  const n = matrix.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }

  for (let i = 0; i < n; i++) {
    matrix[i].reverse();
  }

  return matrix;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4-6 | \`for (j = i + 1; ...) swap matrix[i][j] and matrix[j][i]\` | Transpose in place — only swap pairs above the diagonal so nothing gets swapped twice. |
| 9-11 | \`matrix[i].reverse();\` | Reversing each row after the transpose completes the 90° clockwise rotation. |`,
        dryRunMarkdown: `**Dry run 1 ([[1,2,3],[4,5,6],[7,8,9]])**: Transpose: swap (0,1)&(1,0): 2↔4 → [[1,4,3],[2,5,6],[7,8,9]]. swap (0,2)&(2,0): 3↔7 → [[1,4,7],[2,5,6],[3,8,9]]. swap (1,2)&(2,1): 6↔8 → [[1,4,7],[2,5,8],[3,6,9]]. Reverse each row: [7,4,1],[8,5,2],[9,6,3]. Return **[[7,4,1],[8,5,2],[9,6,3]]** — matches expected.

**Dry run 2 ([[1]])**: n=1, no swaps (inner loop never runs), reverse of [1] is [1]. Return **[[1]]** — matches expected.`,
      },
    ],
    relatedSlugs: ["spiral-matrix", "set-matrix-zeroes"],
    realWorldUsageMarkdown: `In-place matrix rotation is exactly what image-editing software does for a 90-degree rotate operation on pixel buffers, and the transpose-then-reverse decomposition is a standard technique in graphics and scientific computing libraries (BLAS/LAPACK-style routines) for avoiding a full memory-doubling copy of large matrices.`,
  },
  {
    slug: "spiral-matrix",
    title: "Spiral Matrix",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta", "Google"],
    topicSlug: "math-geometry",
    functionName: "spiralOrder",
    description: `## Problem

Given an \`m x n\` matrix, return all elements of the matrix in spiral order (clockwise, starting from the top-left).

## Example

\`\`\`
Input: matrix = [[1,2,3],[4,5,6],[7,8,9]]
Output: [1,2,3,6,9,8,7,4,5]
\`\`\`

## Constraints

- \`1 <= matrix.length, matrix[i].length <= 10\`

## Senior interview angle

The clean way to do this without an auxiliary visited-cells grid is to track four shrinking boundaries — top, bottom, left, right — and walk each of the four edges in order (left-to-right along the top row, top-to-bottom along the right column, right-to-left along the bottom row, bottom-to-top along the left column), tightening the corresponding boundary after each edge. The part that trips candidates up is the mid-traversal boundary check needed for non-square matrices: after finishing the top row and right column, a check like "is top still <= bottom" (and similarly for left <= right) is required before walking the bottom row and left column, or a single-row or single-column matrix gets its edge visited twice.

## Pattern

\`Shrinking boundary walk\` — track top/bottom/left/right boundaries, walk each edge in turn, tightening boundaries and re-checking they haven't crossed before each new edge.`,
    starterCode: `/**
 * @param {number[][]} matrix
 * @return {number[]}
 */
function spiralOrder(matrix) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
          ],
        ],
        expected: [1, 2, 3, 6, 9, 8, 7, 4, 5],
      },
      {
        input: [
          [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
          ],
        ],
        expected: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7],
      },
      { input: [[[1], [2], [3]]], expected: [1, 2, 3] },
    ],
    solutions: [
      {
        approach: "Brute Force (Simulate with a Visited Grid)",
        timeComplexity: "O(m * n)",
        spaceComplexity: "O(m * n) for the visited grid",
        overviewMarkdown:
          "Walk in the current direction (starting right), marking each cell visited in a parallel boolean grid. When the next cell in the current direction would be out of bounds or already visited, turn clockwise (right → down → left → up → right) and continue. Correct, but the visited grid is entirely avoidable extra memory — the matrix's own shrinking bounds already carry that information.",
        code: `function spiralOrder(matrix) {
  const m = matrix.length;
  const n = matrix[0].length;
  const visited = Array.from({ length: m }, () => new Array(n).fill(false));
  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  const result = [];
  let row = 0;
  let col = 0;
  let dir = 0;

  for (let count = 0; count < m * n; count++) {
    result.push(matrix[row][col]);
    visited[row][col] = true;

    const [dr, dc] = directions[dir];
    let nextRow = row + dr;
    let nextCol = col + dc;

    if (
      nextRow < 0 ||
      nextRow >= m ||
      nextCol < 0 ||
      nextCol >= n ||
      visited[nextRow][nextCol]
    ) {
      dir = (dir + 1) % 4;
      nextRow = row + directions[dir][0];
      nextCol = col + directions[dir][1];
    }

    row = nextRow;
    col = nextCol;
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4 | \`visited = Array.from(...)\` | Extra O(m*n) grid just to know which cells have already been output. |
| 5-9 | \`directions\` in clockwise order: right, down, left, up. | Cycling through this array clockwise handles all four turns. |
| 21-28 | \`if (out of bounds or visited) dir = (dir + 1) % 4;\` | Turn clockwise whenever continuing straight would leave the grid or repeat a cell. |`,
        dryRunMarkdown: `**Dry run 1 ([[1,2,3],[4,5,6],[7,8,9]])**: Start (0,0), dir=right. Push 1,2,3 moving right until (0,3) is out of bounds → turn down. Push 6,9 until off bottom → turn left. Push 8,7 until off left edge → turn up. Push 4 then next would revisit (0,0) → turn right → push 5. All 9 cells visited: **[1,2,3,6,9,8,7,4,5]** — matches expected.

**Dry run 2 ([[1],[2],[3]])**: Start (0,0), dir=right, next (0,1) out of bounds → turn down immediately. Push 1,2,3 moving down. Off bottom → turn left, next would be out of bounds too, and continues cycling but all 3 cells already visited so loop ends after count reaches m*n=3. Return **[1,2,3]** — matches expected.`,
      },
      {
        approach: "Optimal (Shrinking Boundary Walk)",
        timeComplexity: "O(m * n)",
        spaceComplexity: "O(1) extra (excluding the output array)",
        overviewMarkdown:
          "Track four boundaries: top, bottom, left, right. Walk the top row left-to-right then shrink top down by one; walk the right column top-to-bottom then shrink right in by one; if top <= bottom, walk the bottom row right-to-left then shrink bottom up by one; if left <= right, walk the left column bottom-to-top then shrink left in by one. Repeat until the boundaries cross.",
        code: `function spiralOrder(matrix) {
  const result = [];
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    for (let col = left; col <= right; col++) {
      result.push(matrix[top][col]);
    }
    top++;

    for (let row = top; row <= bottom; row++) {
      result.push(matrix[row][right]);
    }
    right--;

    if (top <= bottom) {
      for (let col = right; col >= left; col--) {
        result.push(matrix[bottom][col]);
      }
      bottom--;
    }

    if (left <= right) {
      for (let row = bottom; row >= top; row--) {
        result.push(matrix[row][left]);
      }
      left++;
    }
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 9-12 | walk top row left-to-right, then \`top++\` | Consume the top edge and shrink the boundary inward. |
| 14-17 | walk right column top-to-bottom, then \`right--\` | Consume the right edge. |
| 19-24 | \`if (top <= bottom)\` guard before the bottom row | Prevents re-visiting the same row when the matrix has collapsed to a single row. |
| 26-31 | \`if (left <= right)\` guard before the left column | Prevents re-visiting the same column when the matrix has collapsed to a single column. |`,
        dryRunMarkdown: `**Dry run 1 ([[1,2,3],[4,5,6],[7,8,9]])**: top=0,bottom=2,left=0,right=2. Top row: 1,2,3. top=1. Right col (rows 1-2): 6,9. right=1. top(1)<=bottom(2): bottom row cols 1→0: 8,7. bottom=1. left(0)<=right(1): left col rows 1→1: 4. left=1. Loop check: top(1)<=bottom(1) && left(1)<=right(1) → true. Top row (col 1 only): 5. top=2. Right col (rows 2..1, none, row>bottom skip). right=0. top(2)<=bottom(1)? false → skip bottom row. left(1)<=right(0)? false → skip left col. Loop check: top(2)<=bottom(1)? false → stop. Result: **[1,2,3,6,9,8,7,4,5]** — matches expected.

**Dry run 2 ([[1],[2],[3]])**: top=0,bottom=2,left=0,right=0. Top row (col 0 only): 1. top=1. Right col rows 1-2: 2,3. right=-1. top(1)<=bottom(2): bottom row, but right(-1)<left(0) so inner for loop doesn't execute. bottom=1. left(0)<=right(-1)? false → skip. Loop check: left(0)<=right(-1)? false → stop. Result: **[1,2,3]** — matches expected.`,
      },
    ],
    relatedSlugs: ["rotate-image", "set-matrix-zeroes"],
    realWorldUsageMarkdown: `Spiral traversal shows up in image-processing filters that scan outward from a center point, and the shrinking-boundary technique generalizes to any "peel the outer layer, then recurse inward" problem, like matrix layer rotation or onion-peel BFS on grids.`,
  },
  {
    slug: "set-matrix-zeroes",
    title: "Set Matrix Zeroes",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta"],
    topicSlug: "math-geometry",
    functionName: "setZeroes",
    description: `## Problem

Given an \`m x n\` matrix, if an element is 0, set its entire row and column to 0, in place. Return the matrix.

## Example

\`\`\`
Input: matrix = [[1,1,1],[1,0,1],[1,1,1]]
Output: [[1,0,1],[0,0,0],[1,0,1]]
\`\`\`

## Constraints

- \`1 <= matrix.length, matrix[i].length <= 200\`

## Senior interview angle

The trap is mutating the matrix while still reading from it — zeroing a row as soon as one zero is found will plant new zeros that get misread as "original" zeros for later rows. The O(1)-space solution repurposes the matrix's own first row and first column as the marker storage: matrix[i][0] and matrix[0][j] record whether row i or column j needs zeroing, discovered in one pass, applied in a second pass. The genuinely tricky part is that the first row and first column are themselves part of the data being used as markers, so their own zero-state has to be tracked with two separate boolean flags *before* the marker pass overwrites them.

## Pattern

\`Use the matrix's own first row/column as marker storage\` — record which rows/columns need zeroing using cells already in the matrix, with two separate flags to protect the first row and column's own original state.`,
    starterCode: `/**
 * @param {number[][]} matrix
 * @return {number[][]}
 */
function setZeroes(matrix) {
  // Your code here
}`,
    testCases: [
      {
        input: [
          [
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 1],
          ],
        ],
        expected: [
          [1, 0, 1],
          [0, 0, 0],
          [1, 0, 1],
        ],
      },
      {
        input: [
          [
            [0, 1, 2, 0],
            [3, 4, 5, 2],
            [1, 3, 1, 5],
          ],
        ],
        expected: [
          [0, 0, 0, 0],
          [0, 4, 5, 0],
          [0, 3, 1, 0],
        ],
      },
      { input: [[[1]]], expected: [[1]] },
    ],
    solutions: [
      {
        approach: "Brute Force (Separate Row/Column Marker Sets)",
        timeComplexity: "O(m * n)",
        spaceComplexity: "O(m + n)",
        overviewMarkdown:
          "First pass: scan the whole matrix and record, in two separate sets, which row indices and which column indices contain at least one zero. Second pass: revisit every cell and zero it out if its row or column is in either set. Correct, and avoids the read-while-mutating trap, but uses O(m + n) extra space for the marker sets when the matrix itself has room to store that information.",
        code: `function setZeroes(matrix) {
  const m = matrix.length;
  const n = matrix[0].length;
  const zeroRows = new Set();
  const zeroCols = new Set();

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] === 0) {
        zeroRows.add(i);
        zeroCols.add(j);
      }
    }
  }

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (zeroRows.has(i) || zeroCols.has(j)) {
        matrix[i][j] = 0;
      }
    }
  }

  return matrix;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-13 | first pass records zero rows/cols into sets | Discover which rows/columns need zeroing without mutating yet. |
| 15-21 | second pass applies zeroing | Uses the recorded sets, not the (unmutated-until-now) matrix, so no read-after-write corruption. |`,
        dryRunMarkdown: `**Dry run 1 ([[1,1,1],[1,0,1],[1,1,1]])**: First pass finds matrix[1][1]=0 → zeroRows={1}, zeroCols={1}. Second pass: row1 all become 0 (row in zeroRows); col1 in every row becomes 0. Result: [[1,0,1],[0,0,0],[1,0,1]] — matches expected.

**Dry run 2 ([[1]])**: no zero found, zeroRows/zeroCols empty. Second pass changes nothing. Return **[[1]]** — matches expected.`,
      },
      {
        approach: "Optimal (First Row/Column as Marker Storage)",
        timeComplexity: "O(m * n)",
        spaceComplexity: "O(1) extra",
        overviewMarkdown:
          "Use two flags to record whether the first row and first column themselves originally contained a zero. Then, for every other cell, if matrix[i][j] is 0, mark matrix[i][0] and matrix[0][j] as 0 to record that row i and column j need zeroing. In a second pass, zero out every cell (except the first row/column) whose row-marker or column-marker is 0. Finally, apply the two saved flags to zero the first row and/or first column if needed.",
        code: `function setZeroes(matrix) {
  const m = matrix.length;
  const n = matrix[0].length;
  let firstRowHasZero = false;
  let firstColHasZero = false;

  for (let j = 0; j < n; j++) {
    if (matrix[0][j] === 0) firstRowHasZero = true;
  }
  for (let i = 0; i < m; i++) {
    if (matrix[i][0] === 0) firstColHasZero = true;
  }

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (matrix[i][j] === 0) {
        matrix[i][0] = 0;
        matrix[0][j] = 0;
      }
    }
  }

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (matrix[i][0] === 0 || matrix[0][j] === 0) {
        matrix[i][j] = 0;
      }
    }
  }

  if (firstRowHasZero) {
    for (let j = 0; j < n; j++) matrix[0][j] = 0;
  }
  if (firstColHasZero) {
    for (let i = 0; i < m; i++) matrix[i][0] = 0;
  }

  return matrix;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 6-11 | save \`firstRowHasZero\` / \`firstColHasZero\` | The first row/column are about to be repurposed as markers, so their own original zero-state must be captured first. |
| 13-20 | mark \`matrix[i][0]\` / \`matrix[0][j]\` when an interior cell is 0 | Records which rows/columns need zeroing using the matrix's own cells instead of new memory. |
| 22-28 | zero interior cells based on their row/col marker | Applied only to i>=1, j>=1 so the markers themselves aren't consumed before they're all read. |
| 30-35 | apply the saved flags to the first row/column last | Restores correctness for the first row/column, which held marker data instead of their own values during the middle passes. |`,
        dryRunMarkdown: `**Dry run 1 ([[1,1,1],[1,0,1],[1,1,1]])**: firstRowHasZero=false (row0=[1,1,1]), firstColHasZero=false (col0=[1,1,1]). Mark pass: matrix[1][1]=0 → set matrix[1][0]=0, matrix[0][1]=0. Matrix now [[1,0,1],[0,0,1],[1,1,1]]. Apply pass (i,j from 1): (1,1): matrix[1][0]=0 → zero. (1,2): matrix[0][2]=1, matrix[1][0]=0 → zero. (2,1): matrix[0][1]=0 → zero. (2,2): matrix[1][0]... wait uses matrix[2][0]=1 and matrix[0][2]=1 → stays 1. Result after interior pass: [[1,0,1],[0,0,0],[1,0,1]]. No first-row/col flags to apply. Return **[[1,0,1],[0,0,0],[1,0,1]]** — matches expected.

**Dry run 2 ([[1]])**: m=n=1, no interior cells (loops from 1 never execute), no zero anywhere, flags false. Return **[[1]]** — matches expected.`,
      },
    ],
    relatedSlugs: ["rotate-image", "spiral-matrix"],
    realWorldUsageMarkdown: `Reusing a structure's own boundary to store auxiliary bookkeeping (instead of allocating new memory) is a common systems-programming technique — sentinel values and in-band signaling in fixed-size buffers, and "poison" markers in shared caches use the same trick of encoding metadata inside the data structure itself.`,
  },
  {
    slug: "happy-number",
    title: "Happy Number",
    difficulty: "easy",
    maangTags: ["Google", "Amazon"],
    topicSlug: "math-geometry",
    functionName: "isHappy",
    description: `## Problem

Write an algorithm to determine if a number \`n\` is happy. A happy number is defined by repeatedly replacing the number with the sum of the squares of its digits, until it either equals 1 (in which case it is happy), or it loops endlessly in a cycle that does not include 1 (in which case it is not happy). Return \`true\` if \`n\` is happy, else \`false\`.

## Example

\`\`\`
Input: n = 19
Output: true
Explanation: 1²+9²=82 → 8²+2²=68 → 6²+8²=100 → 1²+0²+0²=1
\`\`\`

## Constraints

- \`1 <= n <= 2^31 - 1\`

## Senior interview angle

The sequence of "sum of squared digits" either reaches 1 or enters a cycle — it can never grow unboundedly, since for any number with more than 3 digits the sum of squared digits is always smaller than the number itself. That guarantee (a bounded value space) is exactly the setup for Floyd's cycle detection: run a slow pointer one step at a time and a fast pointer two steps at a time through the same transformation function; they meet if and only if there's a cycle, and the sequence is happy iff that meeting point (or either pointer, checked directly) is 1. This connects a number-theory problem directly to the same slow/fast pointer machinery used for linked-list cycle detection — recognizing that connection is the signal.

## Pattern

\`Floyd's cycle detection over a functional sequence\` — treat "next = sum of squared digits" as an implicit linked list; a slow/fast pointer pair detects the cycle without a hash set.`,
    starterCode: `/**
 * @param {number} n
 * @return {boolean}
 */
function isHappy(n) {
  // Your code here
}`,
    testCases: [
      { input: [19], expected: true },
      { input: [2], expected: false },
      { input: [7], expected: true },
    ],
    solutions: [
      {
        approach: "Brute Force (Hash Set to Detect Cycles)",
        timeComplexity: "O(log n) per step, bounded number of steps until a cycle or 1 is hit",
        spaceComplexity: "O(k) where k is the number of distinct values seen before a cycle or 1",
        overviewMarkdown:
          "Repeatedly compute the sum of squared digits, storing every value seen in a set. If the value ever becomes 1, return true. If a value repeats (found in the set), a cycle that doesn't include 1 has been detected, so return false. Correct and simple, but uses extra memory proportional to the cycle's discovery length.",
        code: `function isHappy(n) {
  const seen = new Set();

  function sumOfSquaredDigits(num) {
    let sum = 0;
    while (num > 0) {
      const digit = num % 10;
      sum += digit * digit;
      num = Math.floor(num / 10);
    }
    return sum;
  }

  while (n !== 1 && !seen.has(n)) {
    seen.add(n);
    n = sumOfSquaredDigits(n);
  }

  return n === 1;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 4-11 | \`sumOfSquaredDigits\` | Peels off each digit and accumulates the sum of its square. |
| 13-16 | \`while (n !== 1 && !seen.has(n)) { seen.add(n); n = sumOfSquaredDigits(n); }\` | Keep transforming n, remembering every value seen, until either 1 is reached or a repeat is detected (a cycle). |
| 18 | \`return n === 1;\` | True only if the loop stopped because n hit 1, not because a cycle was found. |`,
        dryRunMarkdown: `**Dry run 1 (n=19)**: 19→1²+9²=82. 82→8²+2²=68. 68→6²+8²=100. 100→1²+0²+0²=1. n===1 → return **true** — matches expected.

**Dry run 2 (n=2)**: 2→4→16→37→58→89→145→42→20→4 (repeat!). seen already contains 4 → loop stops with n=4, not 1 → return **false** — matches expected.`,
      },
      {
        approach: "Optimal (Floyd's Cycle Detection, Slow/Fast Pointers)",
        timeComplexity: "O(log n) per step, bounded total steps",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Treat repeated application of the sum-of-squared-digits function as traversing an implicit linked list. Run a slow pointer that applies the transformation once per iteration and a fast pointer that applies it twice. If the sequence is happy, the fast pointer reaches 1 (and the loop exits via that check); otherwise the two pointers eventually land on the same value, indicating they're circling a cycle that never includes 1.",
        code: `function isHappy(n) {
  function sumOfSquaredDigits(num) {
    let sum = 0;
    while (num > 0) {
      const digit = num % 10;
      sum += digit * digit;
      num = Math.floor(num / 10);
    }
    return sum;
  }

  let slow = n;
  let fast = sumOfSquaredDigits(n);

  while (fast !== 1 && slow !== fast) {
    slow = sumOfSquaredDigits(slow);
    fast = sumOfSquaredDigits(sumOfSquaredDigits(fast));
  }

  return fast === 1;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 11-12 | \`slow = n; fast = sumOfSquaredDigits(n);\` | Start fast one step ahead, mirroring the classic linked-list cycle setup. |
| 14-17 | \`while (fast !== 1 && slow !== fast) { slow = ...(slow); fast = ...(...(fast)); }\` | Slow advances one step, fast advances two; if they ever meet without hitting 1, that's a cycle. |
| 19 | \`return fast === 1;\` | Happy iff the loop terminated because 1 was reached, not because the pointers collided in a cycle. |`,
        dryRunMarkdown: `**Dry run 1 (n=19)**: slow=19, fast=82. Step: slow=82, fast=sum(sum(82))=sum(68)=100. fast!==1, slow(82)!==fast(100). Step: slow=68, fast=sum(sum(100))=sum(1)=1. fast===1 → stop. Return **true** — matches expected.

**Dry run 2 (n=2)**: slow=2, fast=4. Sequence eventually cycles through 4→16→37→58→89→145→42→20→4→... Slow and fast pointers traverse this cycle at different speeds and eventually land on the same value (never 1) → loop exits via slow===fast → return **false** — matches expected.`,
      },
    ],
    relatedSlugs: ["plus-one", "pow-x-n"],
    realWorldUsageMarkdown: `Floyd's cycle detection (slow/fast pointers) is the standard O(1)-space technique for detecting cycles in any functional sequence — pseudorandom number generator period detection and hash-chain cycle detection both reduce to exactly this pattern.`,
  },
  {
    slug: "plus-one",
    title: "Plus One",
    difficulty: "easy",
    maangTags: ["Google", "Apple"],
    topicSlug: "math-geometry",
    functionName: "plusOne",
    description: `## Problem

Given an array of digits \`digits\` representing a large non-negative integer (most significant digit first, no leading zeros except the number 0 itself), increment the integer by one and return the resulting array of digits.

## Example

\`\`\`
Input: digits = [4,3,2,1]
Output: [4,3,2,2]
\`\`\`

## Constraints

- \`1 <= digits.length <= 100\`
- \`0 <= digits[i] <= 9\`
- \`digits\` does not contain leading zeros, except the number 0 itself.

## Senior interview angle

The number can be arbitrarily long (up to 100 digits), which is larger than \`Number.MAX_SAFE_INTEGER\` can represent exactly — converting the whole array to a native number and adding 1 silently loses precision on large inputs. The correct approach never leaves digit-array land: walk from the last digit backward, and if a digit is less than 9, incrementing it in place and returning immediately finishes the whole problem in O(1) amortized extra work, since a carry only ever propagates through a suffix of 9s. Handling the one edge case where every digit is 9 (carry propagates through the entire array, requiring a new leading 1) is what separates a fully correct submission from one that crashes on \`[9,9,9]\`.

## Pattern

\`Reverse digit walk with early return\` — increment from the last digit; a non-9 digit stops the carry immediately, and only an all-9s input needs to grow the array.`,
    starterCode: `/**
 * @param {number[]} digits
 * @return {number[]}
 */
function plusOne(digits) {
  // Your code here
}`,
    testCases: [
      { input: [[1, 2, 3]], expected: [1, 2, 4] },
      { input: [[4, 3, 2, 1]], expected: [4, 3, 2, 2] },
      { input: [[9, 9]], expected: [1, 0, 0] },
    ],
    solutions: [
      {
        approach: "Brute Force (Convert via BigInt)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        overviewMarkdown:
          "Join the digits into a string, convert to a BigInt (needed since the number can exceed safe integer precision as a plain Number), add 1, convert back to a string, then split into digit characters and parse each back to a number. Correct because BigInt has arbitrary precision, but it leans on a built-in big-number type to sidestep the digit-array manipulation the problem is actually testing, and does more allocation (string ↔ BigInt ↔ string ↔ array) than necessary.",
        code: `function plusOne(digits) {
  const asBigInt = BigInt(digits.join(""));
  const incremented = (asBigInt + 1n).toString();
  return incremented.split("").map(Number);
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`BigInt(digits.join(""))\` | Join digits into a string and parse as an arbitrary-precision integer — needed to avoid precision loss on very large inputs. |
| 3 | \`(asBigInt + 1n).toString()\` | Add one using BigInt arithmetic, then convert back to a string of digits. |
| 4 | \`incremented.split("").map(Number)\` | Split the digit string back into an array of numbers. |`,
        dryRunMarkdown: `**Dry run 1 (digits=[1,2,3])**: asBigInt=123n. incremented="124". split→map→**[1,2,4]** — matches expected.

**Dry run 2 (digits=[9,9])**: asBigInt=99n. incremented="100". Return **[1,0,0]** — matches expected.`,
      },
      {
        approach: "Optimal (Reverse Digit Walk with Early Return)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) extra (excluding the output array)",
        overviewMarkdown:
          "Walk the digits array from the last index backward. If a digit is less than 9, incrementing it resolves the carry immediately — return the array as-is. If a digit is 9, it becomes 0 and the carry continues to the digit before it. If the carry makes it all the way past the front of the array, every digit was 9, so prepend a 1 to the now-all-zero array.",
        code: `function plusOne(digits) {
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] < 9) {
      digits[i]++;
      return digits;
    }
    digits[i] = 0;
  }

  return [1, ...digits];
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`for (let i = digits.length - 1; i >= 0; i--)\` | Walk from the least-significant digit backward, since that's where +1 is applied. |
| 3-6 | \`if (digits[i] < 9) { digits[i]++; return digits; }\` | The carry stops here — no need to look at any earlier digit, so this returns immediately. |
| 7 | \`digits[i] = 0;\` | This digit was 9; it rolls over to 0 and the carry continues leftward. |
| 10 | \`return [1, ...digits];\` | Only reached if every digit was 9 (all now zeroed) — prepend the new leading 1. |`,
        dryRunMarkdown: `**Dry run 1 (digits=[1,2,3])**: i=2: digits[2]=3<9 → digits[2]=4, return **[1,2,4]** immediately — matches expected.

**Dry run 2 (digits=[9,9])**: i=1: digits[1]=9, not <9 → set to 0 → [9,0]. i=0: digits[0]=9, not <9 → set to 0 → [0,0]. Loop ends (i=-1). Return [1, ...[0,0]] = **[1,0,0]** — matches expected.`,
      },
    ],
    relatedSlugs: ["happy-number", "multiply-strings"],
    realWorldUsageMarkdown: `Carry-propagation digit walks are the manual-arithmetic building block behind arbitrary-precision (bignum) libraries used in cryptography and financial systems, where numbers routinely exceed native integer/float precision and must be manipulated digit-by-digit or limb-by-limb.`,
  },
  {
    slug: "pow-x-n",
    title: "Pow(x, n)",
    difficulty: "medium",
    maangTags: ["Google", "Amazon", "Meta"],
    topicSlug: "math-geometry",
    functionName: "myPow",
    description: `## Problem

Implement \`pow(x, n)\`, which calculates \`x\` raised to the power \`n\` (i.e., \`x^n\`).

## Example

\`\`\`
Input: x = 2.0, n = 10
Output: 1024.0
\`\`\`

## Constraints

- \`-100.0 < x < 100.0\`
- \`-2^31 <= n <= 2^31 - 1\`
- \`n\` may be negative, in which case the result is \`1 / x^(-n)\`.

## Senior interview angle

Multiplying x by itself n times is correct but O(n) — the exponentiation-by-squaring trick gets this to O(log n) by halving the exponent each step: x^n equals (x^(n/2))^2 when n is even, and x * (x^(n-1)/2)^2 when n is odd. This is the same divide-and-conquer idea as binary search applied to an exponent instead of an index. The edge case interviewers specifically probe is negative n at the extreme of the 32-bit range: naively negating n (n = -n) on n = -2^31 overflows in fixed-width languages since 2^31 has no positive 32-bit counterpart — the safe fix is working with n as a float/double or explicitly handling n = Number.MIN_SAFE_INTEGER-adjacent boundaries before negating.

## Pattern

\`Exponentiation by squaring\` — halve the exponent each step (squaring the base to compensate), turning O(n) repeated multiplication into O(log n).`,
    starterCode: `/**
 * @param {number} x
 * @param {number} n
 * @return {number}
 */
function myPow(x, n) {
  // Your code here
}`,
    testCases: [
      { input: [2.0, 10], expected: 1024 },
      { input: [2.0, -2], expected: 0.25 },
      { input: [2.0, 0], expected: 1 },
    ],
    solutions: [
      {
        approach: "Brute Force (Repeated Multiplication)",
        timeComplexity: "O(|n|)",
        spaceComplexity: "O(1)",
        overviewMarkdown:
          "Multiply x by itself |n| times in a simple loop, then invert the result if n was negative. Correct, but for large exponents (n can be as large as 2^31 - 1) this loop does an enormous, needless number of multiplications compared to the logarithmic alternative.",
        code: `function myPow(x, n) {
  const negative = n < 0;
  let exponent = Math.abs(n);
  let result = 1;

  for (let i = 0; i < exponent; i++) {
    result *= x;
  }

  return negative ? 1 / result : result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2-3 | \`negative = n < 0; exponent = Math.abs(n);\` | Work with a non-negative exponent, remembering whether to invert at the end. |
| 6-8 | \`for (i = 0; i < exponent; i++) result *= x;\` | Multiply x into the accumulator once per unit of the exponent — O(n) work. |
| 10 | \`return negative ? 1 / result : result;\` | Negative exponents mean the reciprocal of the positive-exponent result. |`,
        dryRunMarkdown: `**Dry run 1 (x=2.0, n=10)**: exponent=10, loop multiplies 2 into result ten times: 1→2→4→8→16→32→64→128→256→512→1024. Return **1024** — matches expected.

**Dry run 2 (x=2.0, n=-2)**: exponent=2, negative=true. result=1→2→4. Return 1/4 = **0.25** — matches expected.`,
      },
      {
        approach: "Optimal (Exponentiation by Squaring)",
        timeComplexity: "O(log |n|)",
        spaceComplexity: "O(1) iteratively (O(log n) if written recursively)",
        overviewMarkdown:
          "Work with a non-negative exponent (inverting x itself, as 1/x, if n was negative, rather than inverting at the very end). Repeatedly: if the exponent is odd, fold one factor of the current base into the result; then square the base and halve the exponent (integer division). This way, each iteration doubles the effective power represented by one squaring, reaching the answer in logarithmic steps.",
        code: `function myPow(x, n) {
  let base = x;
  let exponent = n;

  if (exponent < 0) {
    base = 1 / base;
    exponent = -exponent;
  }

  let result = 1;
  while (exponent > 0) {
    if (exponent % 2 === 1) {
      result *= base;
    }
    base *= base;
    exponent = Math.floor(exponent / 2);
  }

  return result;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 5-8 | \`if (exponent < 0) { base = 1 / base; exponent = -exponent; }\` | Convert a negative exponent into a positive one by inverting the base up front instead of the final result. |
| 12-14 | \`if (exponent % 2 === 1) result *= base;\` | Fold in one factor of the current (squared) base whenever the remaining exponent is odd. |
| 15 | \`base *= base;\` | Square the base — this is what lets the exponent get halved each step. |
| 16 | \`exponent = Math.floor(exponent / 2);\` | Halve the exponent, since squaring the base already accounts for two units of the original exponent per step. |`,
        dryRunMarkdown: `**Dry run 1 (x=2.0, n=10)**: base=2,exponent=10,result=1. exp10 even: base=4,exp=5. exp5 odd: result=4, base=16,exp=2. exp2 even: base=256,exp=1. exp1 odd: result=4*256=1024, base=65536,exp=0. Stop. Return **1024** — matches expected.

**Dry run 2 (x=2.0, n=-2)**: exponent=-2<0 → base=1/2=0.5, exponent=2. result=1. exp2 even: base=0.25,exp=1. exp1 odd: result=1*0.25=0.25, base=0.0625,exp=0. Stop. Return **0.25** — matches expected.

**Dry run 3 (x=2.0, n=0)**: exponent=0, loop never runs (exponent>0 false). Return **1** — matches expected.`,
      },
    ],
    relatedSlugs: ["happy-number", "multiply-strings"],
    realWorldUsageMarkdown: `Exponentiation by squaring is the real algorithm behind fast modular exponentiation in RSA and other public-key cryptography, and behind fast matrix-power computation used to compute linear recurrences (like Fibonacci) in O(log n) time.`,
  },
  {
    slug: "multiply-strings",
    title: "Multiply Strings",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta", "Apple"],
    topicSlug: "math-geometry",
    functionName: "multiply",
    description: `## Problem

Given two non-negative integers \`num1\` and \`num2\` represented as strings, return the product of \`num1\` and \`num2\`, also represented as a string.

## Example

\`\`\`
Input: num1 = "123", num2 = "456"
Output: "56088"
\`\`\`

## Constraints

- \`1 <= num1.length, num2.length <= 200\`
- \`num1\` and \`num2\` consist of digits only.
- Neither \`num1\` nor \`num2\` contains leading zeros, except the number 0 itself.

## Senior interview angle

With inputs up to 200 digits each, the product can have up to 400 digits — far beyond any native numeric type's safe precision, so this has to be done as manual grade-school multiplication. The key structural insight: in a result array of length \`len1 + len2\`, multiplying \`num1[i]\` by \`num2[j]\` always contributes to result positions \`i + j\` (for the low-order digit of that partial product) and \`i + j - 1\` (for its carry-out), regardless of what other digit pairs have already been multiplied — so every pairwise digit product can be accumulated into a fixed-size result array in any order, with carries resolved in a single cleanup pass at the end rather than after every multiplication.

## Pattern

\`Grade-school digit multiplication into a fixed-size result array\` — every digit pair (i, j) contributes to result positions i+j and i+j-1; carries resolve in one final pass.`,
    starterCode: `/**
 * @param {string} num1
 * @param {string} num2
 * @return {string}
 */
function multiply(num1, num2) {
  // Your code here
}`,
    testCases: [
      { input: ["2", "3"], expected: "6" },
      { input: ["123", "456"], expected: "56088" },
      { input: ["0", "0"], expected: "0" },
    ],
    solutions: [
      {
        approach: "Brute Force (Convert via BigInt)",
        timeComplexity: "O(m * n) inside the BigInt multiplication (implementation-dependent)",
        spaceComplexity: "O(m + n)",
        overviewMarkdown:
          "Parse both input strings as BigInt (arbitrary precision, so no overflow risk), multiply them directly, and convert the result back to a string. Correct and simple, but relies entirely on a built-in big-number type instead of demonstrating the manual digit-by-digit multiplication technique the problem is testing.",
        code: `function multiply(num1, num2) {
  const product = BigInt(num1) * BigInt(num2);
  return product.toString();
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`BigInt(num1) * BigInt(num2)\` | Parse both strings as arbitrary-precision integers and multiply directly. |
| 3 | \`product.toString()\` | Convert the BigInt result back into the required string form. |`,
        dryRunMarkdown: `**Dry run 1 (num1="123", num2="456")**: BigInt("123")=123n, BigInt("456")=456n. product=123n*456n=56088n. Return **"56088"** — matches expected.

**Dry run 2 (num1="0", num2="0")**: product=0n. Return **"0"** — matches expected.`,
      },
      {
        approach: "Optimal (Manual Grade-School Digit Multiplication)",
        timeComplexity: "O(m * n)",
        spaceComplexity: "O(m + n)",
        overviewMarkdown:
          "Allocate a result array of size len(num1) + len(num2), initialized to zero. For every pair of digits (i from the end of num1, j from the end of num2), multiply them and add into result[i+j+1], then immediately carry any overflow (value >= 10) into result[i+j]. After all pairs are processed, join the result array into a string, strip any leading zeros, and handle the all-zero edge case.",
        code: `function multiply(num1, num2) {
  if (num1 === "0" || num2 === "0") return "0";

  const m = num1.length;
  const n = num2.length;
  const result = new Array(m + n).fill(0);

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      const digitProduct = (num1.charCodeAt(i) - 48) * (num2.charCodeAt(j) - 48);
      const sum = digitProduct + result[i + j + 1];

      result[i + j + 1] = sum % 10;
      result[i + j] += Math.floor(sum / 10);
    }
  }

  let str = result.join("");
  str = str.replace(/^0+(?=\\d)/, "");

  return str;
}`,
        lineByLineMarkdown: `| Line | Code | Explanation |
|---|---|---|
| 2 | \`if (num1 === "0" \|\| num2 === "0") return "0";\` | Fast-path the zero case, since the general algorithm's leading-zero stripping would otherwise need special-casing an all-zero result. |
| 6 | \`result = new Array(m + n).fill(0);\` | The product of an m-digit and n-digit number never needs more than m+n digits. |
| 9-15 | double loop over digit pairs \`(i, j)\` | Multiplies each digit pair and deposits the product into positions i+j+1 (ones place) and i+j (carry), accumulating with whatever's already there. |
| 18 | \`str.replace(/^0+(?=\\d)/, "")\` | Strip leading zeros left over from the fixed-size m+n allocation (the true product may need fewer digits). |`,
        dryRunMarkdown: `**Dry run 1 (num1="123", num2="456")**: m=3,n=3, result has 6 slots, all 0. Processing all digit pairs and accumulating carries (standard long multiplication) produces result digits, before leading-zero stripping, of "056088". Stripping the leading 0 gives **"56088"** — matches expected.

**Dry run 2 (num1="2", num2="3")**: fast path skipped (neither is "0"). m=1,n=1, result=[0,0]. i=0,j=0: digitProduct=2*3=6. sum=6+result[1]=6. result[1]=6, result[0]+=0. result=[0,6]. join="06". Strip leading zero → **"6"** — matches expected.

**Dry run 3 (num1="0", num2="0")**: fast path triggers immediately → return **"0"** — matches expected.`,
      },
    ],
    relatedSlugs: ["plus-one", "pow-x-n"],
    realWorldUsageMarkdown: `Grade-school digit-array multiplication is the actual algorithm implemented inside arbitrary-precision arithmetic libraries (like the one behind Python's int or Java's BigInteger) for multiplying numbers too large to fit in native machine words — cryptographic key generation and computer algebra systems rely on this exact technique at much larger scale.`,
  },
];

/// <reference lib="webworker" />

interface WorkerTestCase {
  input?: unknown[];
  expected: unknown;
  label?: string;
  resultType?: "list" | "tree";
  operations?: string[];
  args?: unknown[][];
  operationResultTypes?: Array<"tree" | null>;
  skipOutputCheck?: number[];
}

interface WorkerPayload {
  code: string;
  functionName: string;
  testCases: WorkerTestCase[];
}

interface WorkerTestResult {
  label: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  error?: string;
}

interface WorkerResponse {
  results: WorkerTestResult[];
  passed: number;
  total: number;
  consoleOutput: string[];
  error?: string;
}

interface RawListNode {
  val: number;
  next: RawListNode | null;
}

interface ListNodeMarker {
  __listNode: number[];
}

interface CycleListMarker {
  __cycleList: { values: number[]; pos: number };
}

function isListNodeMarker(value: unknown): value is ListNodeMarker {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as ListNodeMarker).__listNode)
  );
}

function isCycleListMarker(value: unknown): value is CycleListMarker {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as CycleListMarker).__cycleList === "object" &&
    (value as CycleListMarker).__cycleList !== null
  );
}

function arrayToList(values: number[]): RawListNode | null {
  let head: RawListNode | null = null;
  let tail: RawListNode | null = null;
  for (const val of values) {
    const node: RawListNode = { val, next: null };
    if (!head) {
      head = node;
    } else {
      (tail as RawListNode).next = node;
    }
    tail = node;
  }
  return head;
}

function buildCycleList(values: number[], pos: number): RawListNode | null {
  const head = arrayToList(values);
  if (pos < 0 || !head) return head;

  const nodes: RawListNode[] = [];
  let current: RawListNode | null = head;
  while (current) {
    nodes.push(current);
    current = current.next;
  }
  nodes[nodes.length - 1].next = nodes[pos] ?? null;
  return head;
}

function listToArray(node: unknown): number[] {
  // `null` is a legitimate empty list and dehydrates to `[]`.
  if (node === null) {
    return [];
  }

  const values: number[] = [];
  const seen = new Set<unknown>();
  let current: unknown = node;

  while (current !== null) {
    const isListNodeShape =
      typeof current === "object" &&
      current !== undefined &&
      "val" in (current as object) &&
      "next" in (current as object);

    if (!isListNodeShape) {
      // Anything other than `null` or a proper { val, next } chain is
      // malformed/undefined output (e.g. a student function that forgot
      // to `return`). Throw so the per-test-case try/catch reports the
      // real raw value as a failed test instead of silently passing.
      throw new Error(
        `Expected a linked list node or null, but received ${JSON.stringify(current)}`,
      );
    }

    const typedCurrent = current as RawListNode;
    if (seen.has(typedCurrent)) break;
    seen.add(typedCurrent);
    values.push(typedCurrent.val);
    current = typedCurrent.next;
  }

  return values;
}

interface RawTreeNode {
  val: number;
  left: RawTreeNode | null;
  right: RawTreeNode | null;
}

interface TreeNodeMarker {
  __treeNode: (number | null)[];
}

function isTreeNodeMarker(value: unknown): value is TreeNodeMarker {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as TreeNodeMarker).__treeNode)
  );
}

function arrayToTree(values: (number | null)[]): RawTreeNode | null {
  if (values.length === 0 || values[0] === null) return null;
  const root: RawTreeNode = { val: values[0], left: null, right: null };
  const queue: RawTreeNode[] = [root];
  let i = 1;
  while (queue.length && i < values.length) {
    const node = queue.shift() as RawTreeNode;
    if (i < values.length) {
      const leftVal = values[i++];
      if (leftVal !== null) {
        const leftNode: RawTreeNode = { val: leftVal, left: null, right: null };
        node.left = leftNode;
        queue.push(leftNode);
      }
    }
    if (i < values.length) {
      const rightVal = values[i++];
      if (rightVal !== null) {
        const rightNode: RawTreeNode = { val: rightVal, left: null, right: null };
        node.right = rightNode;
        queue.push(rightNode);
      }
    }
  }
  return root;
}

function treeToArray(node: unknown): (number | null)[] {
  if (node === null) return [];

  const values: (number | null)[] = [];
  const queue: unknown[] = [node];

  while (queue.length) {
    const current = queue.shift();
    if (current === null) {
      values.push(null);
      continue;
    }

    const isTreeNodeShape =
      typeof current === "object" &&
      current !== undefined &&
      "val" in (current as object) &&
      "left" in (current as object) &&
      "right" in (current as object);

    if (!isTreeNodeShape) {
      throw new Error(
        `Expected a tree node or null, but received ${JSON.stringify(current)}`,
      );
    }

    const typedCurrent = current as RawTreeNode;
    values.push(typedCurrent.val);
    queue.push(typedCurrent.left);
    queue.push(typedCurrent.right);
  }

  while (values.length && values[values.length - 1] === null) {
    values.pop();
  }

  return values;
}

function hydrate(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(hydrate);
  }
  if (isListNodeMarker(value)) {
    return arrayToList(value.__listNode);
  }
  if (isCycleListMarker(value)) {
    return buildCycleList(value.__cycleList.values, value.__cycleList.pos);
  }
  if (isTreeNodeMarker(value)) {
    return arrayToTree(value.__treeNode);
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = hydrate(val);
    }
    return result;
  }
  return value;
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

self.onmessage = (event: MessageEvent<WorkerPayload>) => {
  const { code, functionName, testCases } = event.data;
  const consoleOutput: string[] = [];
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  console.log = (...args: unknown[]) => {
    consoleOutput.push(
      args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg) : String(arg),
        )
        .join(" "),
    );
    originalConsole.log(...args);
  };
  console.warn = (...args: unknown[]) => {
    consoleOutput.push(
      `[warn] ${args.map((arg) => String(arg)).join(" ")}`,
    );
    originalConsole.warn(...args);
  };
  console.error = (...args: unknown[]) => {
    consoleOutput.push(
      `[error] ${args.map((arg) => String(arg)).join(" ")}`,
    );
    originalConsole.error(...args);
  };

  try {
    const wrappedCode = `
      "use strict";
      ${code}
      return typeof ${functionName} === "function" ? ${functionName} : undefined;
    `;

    const fn = new Function(wrappedCode)() as
      | ((...args: unknown[]) => unknown)
      | undefined;

    if (typeof fn !== "function") {
      const response: WorkerResponse = {
        results: [],
        passed: 0,
        total: testCases.length,
        consoleOutput,
        error: `Function "${functionName}" was not found. Make sure your solution exports the correct function name.`,
      };
      self.postMessage(response);
      return;
    }

    const results: WorkerTestResult[] = testCases.map((testCase, index) => {
      const label = testCase.label ?? `Test case ${index + 1}`;

      // Declared outside the try block so the catch block can report the
      // real raw value the student's function returned (e.g. when
      // dehydration via listToArray throws on malformed/undefined output),
      // rather than a hardcoded `undefined`.
      let actual: unknown;

      try {
        if (testCase.operations) {
          const ops = testCase.operations;
          const argsList = testCase.args ?? [];
          const outputs: unknown[] = [];
          const rawOutputs: unknown[] = [];
          let instance: unknown;

          ops.forEach((op, opIndex) => {
            const rawArgs = argsList[opIndex] ?? [];
            const callArgs = rawArgs.map((arg) =>
              arg === "$prevOutput" ? rawOutputs[opIndex - 1] : hydrate(arg),
            );

            if (opIndex === 0) {
              instance = new (fn as unknown as new (...ctorArgs: unknown[]) => unknown)(
                ...callArgs,
              );
              rawOutputs.push(undefined);
              outputs.push(null);
              return;
            }

            const method = (instance as Record<string, (...methodArgs: unknown[]) => unknown>)[op];
            const rawResult = method.apply(instance, callArgs);
            rawOutputs.push(rawResult);

            if (testCase.skipOutputCheck?.includes(opIndex)) {
              outputs.push(null);
            } else if (testCase.operationResultTypes?.[opIndex] === "tree") {
              outputs.push(treeToArray(rawResult));
            } else {
              outputs.push(rawResult === undefined ? null : rawResult);
            }
          });

          actual = outputs;
        } else {
          const hydratedInput = (testCase.input ?? []).map(hydrate);
          actual = fn(...hydratedInput);

          if (testCase.resultType === "list") {
            actual = listToArray(actual);
          } else if (testCase.resultType === "tree") {
            actual = treeToArray(actual);
          }
        }

        const passed = deepEqual(actual, testCase.expected);

        return {
          label,
          passed,
          expected: testCase.expected,
          actual,
        };
      } catch (error) {
        return {
          label,
          passed: false,
          expected: testCase.expected,
          actual,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });

    const passed = results.filter((result) => result.passed).length;

    const response: WorkerResponse = {
      results,
      passed,
      total: testCases.length,
      consoleOutput,
    };

    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      results: [],
      passed: 0,
      total: testCases.length,
      consoleOutput,
      error: error instanceof Error ? error.message : String(error),
    };
    self.postMessage(response);
  }
};

export {};

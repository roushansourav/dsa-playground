/// <reference lib="webworker" />

interface WorkerTestCase {
  input: unknown[];
  expected: unknown;
  label?: string;
  resultType?: "list";
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
  // `null` is the documented convention for an empty list and must dehydrate
  // to []. `undefined` (e.g. a student's function falling off the end
  // without a `return`) is not a valid list and must NOT be silently
  // coerced to [] — that would make a buggy solution falsely pass any test
  // case whose expected result is an empty list. Throw instead so the
  // caller's try/catch reports this as a failure with the real return value.
  if (node === undefined) {
    throw new Error(
      "Expected a linked list or null for an empty list, but got undefined.",
    );
  }

  const values: number[] = [];
  const seen = new Set<unknown>();
  let current = node as RawListNode | null;
  while (current != null) {
    if (typeof current !== "object" || !("val" in current)) {
      throw new Error(
        `Expected a linked list node ({ val, next }), but got ${JSON.stringify(current)}.`,
      );
    }
    if (seen.has(current)) break;
    seen.add(current);
    values.push(current.val);
    current = current.next;
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
      let rawActual: unknown;

      try {
        const hydratedInput = testCase.input.map(hydrate);
        rawActual = fn(...hydratedInput);
        let actual: unknown = rawActual;

        if (testCase.resultType === "list") {
          actual = listToArray(actual);
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
          actual: rawActual,
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

import type { RunResult } from "@/content/types";

const RUN_TIMEOUT_MS = 3000;

export async function runCodeInWorker(
  code: string,
  functionName: string,
  testCases: { input: unknown[]; expected: unknown; label?: string }[],
): Promise<RunResult> {
  return new Promise((resolve) => {
    const worker = new Worker(
      new URL("../workers/code-runner.worker.ts", import.meta.url),
    );

    const timeoutId = window.setTimeout(() => {
      worker.terminate();
      resolve({
        results: [],
        passed: 0,
        total: testCases.length,
        consoleOutput: [],
        error: "Time Limit Exceeded (3s). Check for infinite loops.",
      });
    }, RUN_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent<RunResult>) => {
      window.clearTimeout(timeoutId);
      worker.terminate();
      resolve(event.data);
    };

    worker.onerror = (event) => {
      window.clearTimeout(timeoutId);
      worker.terminate();
      resolve({
        results: [],
        passed: 0,
        total: testCases.length,
        consoleOutput: [],
        error: event.message || "Worker execution failed.",
      });
    };

    worker.postMessage({ code, functionName, testCases });
  });
}

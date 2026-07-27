export type Difficulty = "easy" | "medium" | "hard";
export type Track = "foundation" | "pattern";
export type ProgressStatus = "unsolved" | "attempted" | "solved";
export type MaangTag = "Google" | "Amazon" | "Apple" | "Netflix" | "Meta";

export interface TestCase {
  input?: unknown[];
  expected: unknown;
  label?: string;
  resultType?: "list" | "tree";
  operations?: string[];
  args?: unknown[][];
  operationResultTypes?: Array<"tree" | null>;
  skipOutputCheck?: number[];
}

export interface Problem {
  slug: string;
  title: string;
  difficulty: Difficulty;
  maangTags: MaangTag[];
  topicSlug: string;
  description: string;
  starterCode: string;
  functionName: string;
  testCases: TestCase[];
}

export interface Topic {
  slug: string;
  title: string;
  track: Track;
  description: string;
  whyItMatters: string;
  order: number;
  problemSlugs: string[];
}

export interface TestResult {
  label: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  error?: string;
}

export interface RunResult {
  results: TestResult[];
  passed: number;
  total: number;
  consoleOutput: string[];
  error?: string;
}

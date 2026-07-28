import { backendSystemDesignQuestions } from "./backend";
import { frontendSystemDesignQuestions } from "./frontend";
import type { SystemDesignQuestion } from "../types";

export { backendSystemDesignQuestions } from "./backend";
export { frontendSystemDesignQuestions } from "./frontend";

const allSystemDesignQuestions: SystemDesignQuestion[] = [
  ...frontendSystemDesignQuestions,
  ...backendSystemDesignQuestions,
];

const systemDesignQuestionMap = new Map(
  allSystemDesignQuestions.map((question) => [question.slug, question]),
);

export function getAllSystemDesignQuestions(): SystemDesignQuestion[] {
  return allSystemDesignQuestions;
}

export function getSystemDesignQuestionBySlug(
  slug: string,
): SystemDesignQuestion | undefined {
  return systemDesignQuestionMap.get(slug);
}

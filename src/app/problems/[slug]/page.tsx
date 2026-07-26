import { notFound } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { ProblemWorkspace } from "@/components/ProblemWorkspace";
import {
  getAdjacentProblems,
  getAllProblems,
  getProblemBySlug,
  getTopicForProblem,
} from "@/content";
import { auth } from "@/lib/auth";
import { getProblemProgress } from "@/lib/progress";

interface ProblemPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { slug } = await params;
  const problem = getProblemBySlug(slug);
  const topic = getTopicForProblem(slug);

  if (!problem || !topic) {
    notFound();
  }

  const session = await auth();
  let initialCode = problem.starterCode;
  let initialStatus: "unsolved" | "attempted" | "solved" | undefined;

  if (session?.user?.githubId) {
    try {
      const row = await getProblemProgress(session.user.githubId, slug);
      if (row) {
        initialCode = row.lastCode ?? problem.starterCode;
        initialStatus = row.status;
      }
    } catch {
      // Ignore DB errors locally and fall back to starter code.
    }
  }

  const { prev, next } = getAdjacentProblems(slug);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ProblemWorkspace
          problem={problem}
          topicTitle={topic.title}
          topicSlug={topic.slug}
          initialCode={initialCode}
          initialStatus={initialStatus}
          prevSlug={prev?.slug}
          nextSlug={next?.slug}
        />
      </main>
    </>
  );
}

export async function generateStaticParams() {
  return getAllProblems().map((problem) => ({ slug: problem.slug }));
}

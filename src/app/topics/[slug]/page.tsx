import { notFound } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { TopicProblemList } from "@/components/TopicProblemList";
import type { ProgressStatus } from "@/content/types";
import { getProblemsForTopic, getTopicBySlug, topics } from "@/content";
import { auth } from "@/lib/auth";
import { buildProgressMap, getUserProgress } from "@/lib/progress";

interface TopicPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  const problems = getProblemsForTopic(slug);
  const session = await auth();
  let progressByProblem = new Map<string, { status: ProgressStatus }>();

  if (session?.user?.githubId) {
    try {
      const rows = await getUserProgress(session.user.githubId);
      progressByProblem = new Map(
        buildProgressMap(rows).entries(),
      );
    } catch {
      progressByProblem = new Map();
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <TopicProblemList
          topic={topic}
          problems={problems}
          progressByProblem={progressByProblem}
        />
      </main>
    </>
  );
}

export async function generateStaticParams() {
  return topics.map((topic) => ({ slug: topic.slug }));
}

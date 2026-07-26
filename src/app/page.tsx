import { Navbar } from "@/components/Navbar";
import { Dashboard } from "@/components/Dashboard";
import type { ProgressStatus } from "@/content/types";
import { auth } from "@/lib/auth";
import { buildProgressMap, getUserProgress } from "@/lib/progress";

export default async function HomePage() {
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
        <Dashboard progressByProblem={progressByProblem} />
      </main>
    </>
  );
}

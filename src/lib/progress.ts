import { and, eq } from "drizzle-orm";

import type { ProgressStatus } from "@/content/types";

import { db, isDatabaseConfigured } from "./db";
import { progress, type ProgressRow } from "./schema";

export async function getUserProgress(
  githubId: string,
): Promise<ProgressRow[]> {
  if (!isDatabaseConfigured()) return [];

  return db
    .select()
    .from(progress)
    .where(eq(progress.githubId, githubId));
}

export async function getProblemProgress(
  githubId: string,
  problemSlug: string,
): Promise<ProgressRow | undefined> {
  if (!isDatabaseConfigured()) return undefined;

  const rows = await db
    .select()
    .from(progress)
    .where(
      and(
        eq(progress.githubId, githubId),
        eq(progress.problemSlug, problemSlug),
      ),
    )
    .limit(1);

  return rows[0];
}

export async function upsertProgress(input: {
  githubId: string;
  problemSlug: string;
  status: ProgressStatus;
  lastCode?: string;
  notes?: string;
}): Promise<ProgressRow | null> {
  if (!isDatabaseConfigured()) return null;

  const existing = await getProblemProgress(input.githubId, input.problemSlug);

  if (existing) {
    const [row] = await db
      .update(progress)
      .set({
        status: input.status,
        lastCode: input.lastCode ?? existing.lastCode,
        notes: input.notes ?? existing.notes,
        attempts: existing.attempts + 1,
        updatedAt: new Date(),
      })
      .where(eq(progress.id, existing.id))
      .returning();

    return row;
  }

  const [row] = await db
    .insert(progress)
    .values({
      githubId: input.githubId,
      problemSlug: input.problemSlug,
      status: input.status,
      lastCode: input.lastCode,
      notes: input.notes,
      attempts: 1,
    })
    .returning();

  return row;
}

export function buildProgressMap(rows: ProgressRow[]) {
  return new Map(rows.map((row) => [row.problemSlug, row]));
}

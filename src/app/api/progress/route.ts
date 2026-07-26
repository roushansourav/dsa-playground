import { NextResponse } from "next/server";

import type { ProgressStatus } from "@/content/types";
import { auth } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";
import {
  buildProgressMap,
  getUserProgress,
  upsertProgress,
} from "@/lib/progress";

export async function GET() {
  const session = await auth();

  if (!session?.user?.githubId) {
    return NextResponse.json({ progress: {} });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      progress: {},
      warning: "Database not configured. Set POSTGRES_URL to enable progress sync.",
    });
  }

  try {
    const rows = await getUserProgress(session.user.githubId);
    const progress = Object.fromEntries(
      buildProgressMap(rows).entries(),
    );

    return NextResponse.json({ progress });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load progress." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.githubId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Database not configured. Add Vercel Postgres and set POSTGRES_URL.",
      },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as {
      problemSlug?: string;
      status?: ProgressStatus;
      lastCode?: string;
      notes?: string;
    };

    if (!body.problemSlug || !body.status) {
      return NextResponse.json(
        { error: "problemSlug and status are required." },
        { status: 400 },
      );
    }

    const row = await upsertProgress({
      githubId: session.user.githubId,
      problemSlug: body.problemSlug,
      status: body.status,
      lastCode: body.lastCode,
      notes: body.notes,
    });

    return NextResponse.json({ progress: row });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save progress." },
      { status: 500 },
    );
  }
}

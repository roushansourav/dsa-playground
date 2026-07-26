import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const progress = pgTable(
  "progress",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    githubId: text("github_id").notNull(),
    problemSlug: text("problem_slug").notNull(),
    status: text("status").notNull().$type<"unsolved" | "attempted" | "solved">(),
    lastCode: text("last_code"),
    attempts: integer("attempts").notNull().default(0),
    notes: text("notes"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("progress_github_problem_idx").on(
      table.githubId,
      table.problemSlug,
    ),
  ],
);

export type ProgressRow = typeof progress.$inferSelect;
export type NewProgressRow = typeof progress.$inferInsert;

# DSA Playground Design Spec

**Date:** 2026-07-26  
**Status:** Approved  
**Author:** Roushan + Cursor Agent

## Goal

Build a deployable web playground to learn DSA from basics to advanced for MAANG senior developer interviews, using JavaScript, with interactive coding and progress tracking.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 App Router + TypeScript |
| Styling | Tailwind CSS v4 + Typography plugin |
| Editor | Monaco (`@monaco-editor/react`) |
| Execution | Web Worker sandbox, 3s timeout |
| Auth | Auth.js v5, GitHub OAuth, JWT sessions |
| Database | Vercel Postgres (Neon) + Drizzle ORM |
| Hosting | Vercel |

## Content model

Static TypeScript files under `src/content/` — not stored in DB.

- **Topics** have `track`: `foundation` | `pattern`
- **Problems** include markdown description, starter code, `functionName`, declarative `testCases`
- v1 seed: 3 topics × 5 problems (15 total)

## Database schema

Single `progress` table:

- `github_id` + `problem_slug` (unique)
- `status`: unsolved | attempted | solved
- `last_code`, `attempts`, `notes`, `updated_at`

No users table — GitHub numeric ID from JWT is the key.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Dashboard with foundation + pattern tracks |
| `/topics/[slug]` | Problem list for a topic |
| `/problems/[slug]` | Split view: description + Monaco + tests |
| `/api/auth/[...nextauth]` | GitHub OAuth |
| `/api/progress` | GET/POST user progress |

## Execution flow

1. User writes JS in Monaco, clicks Run Tests
2. Main thread spawns Web Worker with code + test cases
3. Worker uses `new Function()` to invoke named function per case
4. Results compared via JSON deep equality
5. 3s timeout terminates worker (TLE)
6. All pass + signed in → upsert `solved`; partial → `attempted`

## Out of scope (v1)

- App test suite (manual verification)
- Multi-provider auth
- Admin UI for content
- Full curriculum (future batches)

## Deployment requirements

- GitHub OAuth App with callback `/api/auth/callback/github`
- `AUTH_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`
- Vercel Postgres linked → `POSTGRES_URL`
- `npm run db:push` after first deploy

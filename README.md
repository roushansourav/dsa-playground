# DSA Playground

Interactive DSA interview prep for senior MAANG candidates — JavaScript solutions, Monaco editor, sandboxed test runner, and cloud progress sync.

## What's included (v1)

- **Foundation track:** Arrays & Hashing (5 problems)
- **Pattern tracks:** Two Pointers (5), Sliding Window (5)
- Theory notes + MAANG tags + difficulty per problem
- Monaco code editor with Run Tests (Web Worker, 3s timeout)
- GitHub OAuth + Vercel Postgres progress tracking

## Quick start (local)

```bash
cd ~/projects/dsa-playground
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You can solve problems **without auth** — progress just won't persist until GitHub + DB are configured.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | Random secret for Auth.js (`openssl rand -base64 32`) |
| `AUTH_URL` | App URL (`http://localhost:3000` locally) |
| `GITHUB_ID` | GitHub OAuth App client ID |
| `GITHUB_SECRET` | GitHub OAuth App client secret |
| `POSTGRES_URL` | Vercel Postgres / Neon connection string |

## GitHub OAuth setup

1. Go to [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. **New OAuth App**
   - Application name: `DSA Playground`
   - Homepage URL: `http://localhost:3000` (update after deploy)
   - Callback URL: `http://localhost:3000/api/auth/callback/github`
3. Copy Client ID and generate Client Secret into `.env.local`

After Vercel deploy, update Homepage + Callback URLs to your production domain.

## Database setup

1. In Vercel project → **Storage** → create **Postgres** (Neon)
2. Link it to the project — `POSTGRES_URL` is injected automatically
3. Push schema:

```bash
npm run db:push
```

## Deploy to Vercel

```bash
npx vercel
```

Or connect the GitHub repo in the Vercel dashboard. Set the same env vars (`AUTH_SECRET`, `GITHUB_*`) in project settings.

## Project structure

```
src/
  content/          # Topics + problems (git-versioned curriculum)
  components/       # UI (Dashboard, Monaco workspace, etc.)
  workers/          # Sandboxed JS test runner
  lib/              # Auth, DB, progress helpers
  app/              # Next.js App Router pages + API routes
```

## Adding problems

1. Add a `Problem` object in `src/content/problems/<topic>.ts`
2. Add its slug to the topic in `src/content/topics.ts`
3. Problem fields: `slug`, `title`, `difficulty`, `maangTags`, `description` (markdown), `starterCode`, `functionName`, `testCases`

## Learning path (roadmap)

v1 seeds 15 problems across 3 modules. Planned expansions:

- Linked Lists, Trees, Graphs (foundation)
- DP, Greedy, Backtracking, Heaps (patterns)
- System design tie-ins per pattern

## Tech stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Monaco Editor + Web Worker sandbox
- Auth.js v5 (GitHub OAuth)
- Drizzle ORM + Vercel Postgres

import Link from "next/link";

import { auth, signIn, signOut } from "@/lib/auth";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm text-white">
            DS
          </span>
          <span>DSA Playground</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/"
            className="text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Dashboard
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-zinc-500 sm:inline dark:text-zinc-400">
                {session.user.name ?? session.user.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("github");
              }}
            >
              <button
                type="submit"
                className="rounded-lg bg-violet-600 px-3 py-1.5 font-medium text-white transition hover:bg-violet-500"
              >
                Sign in with GitHub
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}

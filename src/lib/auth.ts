import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      githubId?: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    githubId?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, profile }) {
      if (profile && "id" in profile && profile.id) {
        token.githubId = String(profile.id);
      }
      return token;
    },
    session({ session, token }) {
      if (token.githubId) {
        session.user.githubId = token.githubId;
      }
      return session;
    },
  },
});

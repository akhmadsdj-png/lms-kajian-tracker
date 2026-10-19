import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { isSuperAdmin } from "./admin-emails";

// How often a signed-in session re-reads role/blocked status from the database.
// Keeps auth() cookie-only on most requests while a block still takes effect within minutes.
const RECHECK_MS = 5 * 60 * 1000;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // JWT sessions: auth() reads the cookie instead of querying the DB on every request
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email || isSuperAdmin(user.email)) return true;
      const existing = await prisma.user.findUnique({
        where: { email: user.email },
        select: { blockedAt: true },
      });
      return existing?.blockedAt ? "/diblokir" : true;
    },
    async jwt({ token, user }) {
      const now = Date.now();
      if (user || !token.checkedAt || now - token.checkedAt > RECHECK_MS) {
        if (!token.sub) return token;
        const row = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, blockedAt: true },
        });
        // Deleted or blocked accounts lose their session at the next re-check
        if (!row || (row.blockedAt && !isSuperAdmin(token.email))) return null;
        token.role = row.role;
        token.checkedAt = now;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.isAdmin = token.role === "admin" || isSuperAdmin(session.user.email);
      }
      return session;
    },
  },
});

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { z } from "zod";

import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import {
  isFirebaseAdminConfigured,
  verifyFirebaseIdToken,
} from "@/lib/firebase-admin";
import { findOrCreateUser } from "@/lib/firebase-users";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // Credentials sign-in is only supported with the JWT strategy. The adapter
  // still owns users, accounts and OAuth links; only the session itself is
  // a signed token, which is also what works on Vercel without sticky
  // sessions.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await db.query.users.findFirst({
          where: (u, { eq }) => eq(u.email, email.toLowerCase()),
        });
        if (!user?.passwordHash) return null;

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),

    // Google, brokered by Firebase.
    //
    // The browser signs in with Firebase, Firebase returns an ID token, and
    // this provider verifies that token against the Firebase project with the
    // Admin SDK before a session is created. Nothing is trusted from the
    // browser: a token from another project, or one that has expired or been
    // revoked, is refused here rather than at the edge.
    ...(isFirebaseAdminConfigured()
      ? [
          Credentials({
            id: "firebase",
            name: "Google",
            credentials: {
              idToken: { label: "Firebase ID token", type: "text" },
            },
            async authorize(credentials) {
              const idToken =
                typeof credentials?.idToken === "string"
                  ? credentials.idToken
                  : "";
              if (!idToken) return null;

              const identity = await verifyFirebaseIdToken(idToken);
              if (!identity?.email) return null;

              const user = await findOrCreateUser(identity);
              if (!user) return null;

              return {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                role: user.role,
              };
            },
          }),
        ]
      : []),

    ...(process.env.AUTH_GOOGLE_ID
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role =
          (user as { role?: "student" | "instructor" | "admin" }).role ??
          "student";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "";
        session.user.role =
          (token.role as "student" | "instructor" | "admin" | undefined) ??
          "student";
      }
      return session;
    },
  },
});

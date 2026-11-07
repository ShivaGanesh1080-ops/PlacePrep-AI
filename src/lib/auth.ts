import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// Ensure NEXTAUTH_SECRET and NEXTAUTH_URL are always available even if omitted in host env
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET =
    "placeprep-ai-production-super-secret-key-32chars-fallback-secure-2026";
}

if (!process.env.NEXTAUTH_URL) {
  if (process.env.RENDER_EXTERNAL_URL) {
    process.env.NEXTAUTH_URL = process.env.RENDER_EXTERNAL_URL;
  } else {
    process.env.NEXTAUTH_URL = "https://placeprep-ai-r9xo.onrender.com";
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase().trim() },
          });

          if (!user) {
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorize error in NextAuth:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        let currentUserId = (token.id as string) || "";
        let currentUserRole = ((token.role as string) || "STUDENT");

        // Bulletproof sync: Always ensure session user ID matches live database user ID
        if (session.user.email) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: session.user.email.toLowerCase().trim() },
              select: { id: true, role: true },
            });
            if (dbUser) {
              currentUserId = dbUser.id;
              currentUserRole = dbUser.role;
            }
          } catch (err) {
            console.warn("Session user sync warning:", err);
          }
        }

        (session.user as { id: string; role: string }).id = currentUserId;
        (session.user as { id: string; role: string }).role = currentUserRole;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

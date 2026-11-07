import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Ensure NEXTAUTH_SECRET and NEXTAUTH_URL are initialized at the earliest runtime boundary
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET =
    "placeprep-ai-production-super-secret-key-32chars-fallback-secure-2026";
}

if (
  !process.env.NEXTAUTH_URL ||
  (process.env.NODE_ENV === "production" &&
    process.env.NEXTAUTH_URL.includes("localhost"))
) {
  process.env.NEXTAUTH_URL =
    process.env.RENDER_EXTERNAL_URL || "https://placeprep-ai-r9xo.onrender.com";
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };


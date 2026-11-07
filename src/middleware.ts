import { withAuth } from "next-auth/middleware";

export default withAuth({
  secret:
    process.env.NEXTAUTH_SECRET ||
    "placeprep-ai-production-super-secret-key-32chars-fallback-secure-2026",
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/copilot/:path*",
    "/career/:path*",
    "/tests/:path*",
    "/interview/:path*",
    "/resume/:path*",
    "/companies/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};


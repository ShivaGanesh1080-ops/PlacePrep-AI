import { withAuth } from "next-auth/middleware";

export default withAuth({
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

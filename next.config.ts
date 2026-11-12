import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/auth/register",
        destination: "/api/auth/register",
      },
      {
        source: "/auth/login",
        destination: "/api/auth/login",
      },
      {
        source: "/register",
        destination: "/signup",
      },
    ];
  },
};

export default nextConfig;

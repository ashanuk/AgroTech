import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL('https://res.cloudinary.com/**')],
  },
  // Disable ESLint errors from failing the build
  eslint: {
    // Warning will still be shown in the console but won't fail the build
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors from failing the build
  typescript: {
    // TS errors will still be shown in the console but won't fail the build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

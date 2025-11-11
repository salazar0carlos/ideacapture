import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
};

// NOTE: PWA temporarily disabled due to next-pwa@5.6.0 incompatibility with Next.js 16
// Will re-enable once upgraded to @ducanh2912/next-pwa (Next.js 16 compatible)
export default nextConfig;

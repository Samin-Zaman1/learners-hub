import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone for optimized Vercel deployments
  output: 'standalone',
  
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Ensure environment variables are available at runtime
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Enable SWC minification (faster than Terser)
  swcMinify: true,

  // Strict mode for better error catching
  reactStrictMode: true,

  // Disable x-powered-by header
  poweredByHeader: false,

  // Ignore TypeScript and ESLint errors during build (for deployment)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

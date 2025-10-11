import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    unoptimized: true, // Disable default image optimization
  },
  // assetPrefix: '/simple-invoice-generator',
  // basePath: '/simple-invoice-generator',
  output: 'export',
};

export default nextConfig;

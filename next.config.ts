import type { NextConfig } from "next";
// const withNextIntl = createNextIntlPlugin()
const nextConfig: NextConfig = {
  
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default  nextConfig;

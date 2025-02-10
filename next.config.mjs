/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [{hostname: "images.pexels.com"}]
    },
    typescript: {
      ignoreBuildErrors: true,
    }
  };
  
  export default nextConfig;
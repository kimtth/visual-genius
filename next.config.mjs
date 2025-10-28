/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.bing.com",
        pathname: "**"
      },
      {
        protocol: "https",
        hostname: "**.bing.net",
        pathname: "**"
      }
    ]
  }
};

export default nextConfig;

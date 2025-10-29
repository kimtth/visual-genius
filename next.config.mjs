/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Enable standalone output for Docker deployment
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "**.bing.com",
        pathname: "**"
      },
      {
        protocol: "https",
        hostname: "**.bing.net",
        pathname: "**"
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "**"
      }
    ]
  }
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/api/v1/uploads/**",
      },
      {
        protocol: "https",
        hostname: "theholymatrimony.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "www.theholymatrimony.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;


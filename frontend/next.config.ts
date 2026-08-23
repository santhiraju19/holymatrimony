import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      /*
       * Local backend static uploads.
       */
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8080",
        pathname: "/uploads/**",
      },

      /*
       * Historical local API-prefixed upload URLs.
       */
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/api/v1/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8080",
        pathname: "/api/v1/uploads/**",
      },

      /*
       * Production uploads.
       */
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

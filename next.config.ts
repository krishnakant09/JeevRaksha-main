import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: [
    "192.168.29.160",
    "localhost",
    "127.0.0.1"
  ],
};

export default nextConfig;

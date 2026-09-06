import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  env: {
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
};

export default nextConfig;

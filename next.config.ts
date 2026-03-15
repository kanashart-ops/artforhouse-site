import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "/api/admin/upload": [
      "./public/**/*",
      "./.git/**/*",
      "./.next/cache/**/*",
      "./node_modules/typescript/**/*",
      "./node_modules/eslint/**/*",
      "./node_modules/@typescript-eslint/**/*",
    ],
  },
};

export default nextConfig;

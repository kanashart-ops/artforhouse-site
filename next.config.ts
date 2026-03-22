import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function createNextConfig(phase: string): NextConfig {
  const isDevServer = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    // Next 15 writes dev and build artifacts into the same directory by default.
    // Keeping them separate avoids corrupting the dev client manifest when build
    // runs while `next dev` is active.
    distDir: isDevServer ? ".next-dev" : ".next",
    outputFileTracingExcludes: {
      "/api/admin/upload": [
        "./public/**/*",
        "./.git/**/*",
        "./.next/cache/**/*",
        "./.next-dev/cache/**/*",
        "./node_modules/typescript/**/*",
        "./node_modules/eslint/**/*",
        "./node_modules/@typescript-eslint/**/*",
      ],
    },
  };
}

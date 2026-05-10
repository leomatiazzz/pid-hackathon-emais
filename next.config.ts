import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @arcgis/core is a pure-ESM package — transpile it so Next.js can bundle it.
  // The actual map component is loaded with dynamic(ssr:false), so it never runs
  // on the server. Turbopack rejects having the same package in both
  // transpilePackages and serverExternalPackages simultaneously.
  transpilePackages: ["@arcgis/core"],
};

export default nextConfig;

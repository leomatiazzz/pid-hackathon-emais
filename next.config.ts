import type { NextConfig } from "next";

// @arcgis/core é um pacote pure-ESM e só é usado no cliente (dynamic ssr:false).
// Em DEV (Turbopack): precisa estar em transpilePackages — Turbopack rejeita
//   ter o mesmo pacote em transpilePackages + serverExternalPackages.
// Em PRODUÇÃO (Webpack/Vercel/Netlify): usar serverExternalPackages evita
//   que o webpack tente compilar o SDK inteiro no server bundle (~100k módulos),
//   reduzindo o tempo de build de >30min para ~5min.
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  ...(isProd
    ? { serverExternalPackages: ["@arcgis/core"] }
    : { transpilePackages: ["@arcgis/core"] }),
};

export default nextConfig;

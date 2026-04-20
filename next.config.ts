import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const publicDataPages = [
  "/",
  "/about",
  "/benchmarks",
  "/benchmarks/:path*",
  "/datasets",
  "/datasets/:path*",
  "/docs",
  "/leaderboards",
  "/methodology",
  "/organizations",
  "/organizations/:path*",
  "/sources",
  "/sources/:path*",
  "/submit",
  "/systems",
  "/systems/:path*",
  "/tasks",
  "/tasks/:path*",
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/adapter-d1", "@prisma/client"],
  async headers() {
    return publicDataPages.map((source) => ({
      source,
      headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, s-maxage=300, stale-while-revalidate=1800",
          },
          { key: "X-OrganoidBench-Cache-Profile", value: "medium" },
          { key: "X-OrganoidBench-Data-Source", value: "d1" },
      ],
    }));
  },
};

initOpenNextCloudflareForDev();

export default nextConfig;

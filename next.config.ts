import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/adapter-d1", "@prisma/client"],
};

initOpenNextCloudflareForDev();

export default nextConfig;

import { prisma } from "@/lib/db";
import { cachedJson } from "@/lib/http-cache";

export async function GET() {
  const tracks = await prisma.benchmarkTrack.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      metrics: { select: { slug: true, name: true, unit: true, direction: true, description: true } },
      tasks: { select: { slug: true, name: true } },
      _count: { select: { runs: true } },
    },
  });
  return cachedJson({ count: tracks.length, tracks }, { profile: "long" });
}

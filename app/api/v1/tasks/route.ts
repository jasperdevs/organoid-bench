import { prisma } from "@/lib/db";
import { cachedJson } from "@/lib/http-cache";

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { name: "asc" },
    include: {
      track: { select: { slug: true, name: true } },
      _count: { select: { runs: true, systems: true } },
    },
  });
  return cachedJson({ count: tasks.length, tasks }, { profile: "long" });
}

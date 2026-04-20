import { prisma } from "@/lib/db";
import { cachedJson } from "@/lib/http-cache";

export async function GET() {
  const organizations = await prisma.organization.findMany({
    include: {
      _count: { select: { datasets: true, systems: true, sources: true } },
    },
    orderBy: { name: "asc" },
  });
  return cachedJson({ count: organizations.length, organizations }, { profile: "medium" });
}

import { prisma } from "@/lib/db";
import { cachedJson, noStoreJson } from "@/lib/http-cache";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const system = await prisma.system.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: { id: true },
  });
  if (!system) return noStoreJson({ error: "not_found", id }, { status: 404 });
  const runs = await prisma.benchmarkRun.findMany({
    where: { systemId: system.id },
    include: {
      track: { select: { slug: true, name: true } },
      task: { select: { slug: true, name: true } },
      methodologyVersion: { select: { version: true } },
      scoreCalculations: true,
    },
    orderBy: { runDate: "desc" },
  });
  return cachedJson({ systemId: system.id, count: runs.length, runs }, { profile: "medium" });
}

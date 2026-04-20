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
  const values = await prisma.metricValue.findMany({
    where: { benchmarkRun: { systemId: system.id } },
    include: {
      metric: { include: { track: { select: { slug: true, name: true } } } },
      source: { select: { id: true, title: true, doi: true } },
      benchmarkRun: { select: { id: true, runStatus: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return cachedJson({ systemId: system.id, count: values.length, metrics: values }, { profile: "medium" });
}

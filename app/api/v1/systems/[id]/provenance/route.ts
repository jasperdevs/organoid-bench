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
  const events = await prisma.provenanceEvent.findMany({
    where: { systemId: system.id },
    orderBy: { createdAt: "desc" },
  });
  return cachedJson({ systemId: system.id, count: events.length, events }, { profile: "medium" });
}

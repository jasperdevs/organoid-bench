import { prisma } from "@/lib/db";
import { cachedJson, noStoreJson } from "@/lib/http-cache";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const system = await prisma.system.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      organization: true,
      dataset: true,
      source: true,
      organoidPreparation: true,
      recordingSetup: true,
      stimulationProtocol: true,
      task: { include: { track: true } },
      runs: {
        include: {
          track: { select: { slug: true, name: true } },
          task: { select: { slug: true, name: true } },
          methodologyVersion: { select: { version: true } },
          scoreCalculations: true,
          runControls: { include: { control: true } },
          metricValues: { include: { metric: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
      provenanceEvents: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!system) {
    return noStoreJson(
      { error: "not_found", id },
      { status: 404 },
    );
  }
  return cachedJson({ system }, { profile: "medium" });
}

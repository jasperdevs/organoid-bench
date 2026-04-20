import { prisma } from "@/lib/db";
import { cachedJson, noStoreJson } from "@/lib/http-cache";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const dataset = await prisma.dataset.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      organization: true,
      source: true,
      files: true,
      systems: { select: { id: true, slug: true, name: true, verificationStatus: true } },
      provenanceEvents: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!dataset) return noStoreJson({ error: "not_found", id }, { status: 404 });
  const payload = {
    ...dataset,
    sizeBytes: dataset.sizeBytes?.toString() ?? null,
    files: dataset.files.map((f) => ({ ...f, sizeBytes: f.sizeBytes?.toString() ?? null })),
  };
  return cachedJson({ dataset: payload }, { profile: "medium" });
}

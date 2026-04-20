import { prisma } from "@/lib/db";
import { cachedJson, noStoreJson } from "@/lib/http-cache";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const track = await prisma.benchmarkTrack.findUnique({
    where: { slug },
    include: {
      metrics: true,
      tasks: true,
      _count: { select: { runs: true } },
    },
  });
  if (!track) return noStoreJson({ error: "not_found", slug }, { status: 404 });
  return cachedJson({ track }, { profile: "long" });
}

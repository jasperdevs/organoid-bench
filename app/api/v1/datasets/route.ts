import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { cachedJson } from "@/lib/http-cache";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const limit = sp.get("limit") ? Math.min(Math.max(Number(sp.get("limit")), 1), 500) : 100;
  const modality = sp.get("modality") ?? undefined;
  const access = sp.get("access") ?? undefined;
  const datasets = await prisma.dataset.findMany({
    where: {
      modality,
      accessStatus: access,
    },
    include: {
      organization: { select: { id: true, name: true } },
      source: { select: { id: true, title: true, doi: true, url: true, kind: true } },
      _count: { select: { systems: true, files: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
  const payload = datasets.map((d) => ({ ...d, sizeBytes: d.sizeBytes?.toString() ?? null }));
  return cachedJson({ count: payload.length, datasets: payload }, { profile: "medium" });
}

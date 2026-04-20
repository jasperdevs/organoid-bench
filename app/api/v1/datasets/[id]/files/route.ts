import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const dataset = await prisma.dataset.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: { id: true },
  });
  if (!dataset) return NextResponse.json({ error: "not_found", id }, { status: 404 });
  const files = await prisma.datasetFile.findMany({
    where: { datasetId: dataset.id },
    orderBy: { path: "asc" },
  });
  return NextResponse.json({
    datasetId: dataset.id,
    count: files.length,
    files: files.map((f) => ({ ...f, sizeBytes: f.sizeBytes?.toString() ?? null })),
  });
}

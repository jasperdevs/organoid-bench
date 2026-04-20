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
  const systems = await prisma.system.findMany({
    where: { datasetId: dataset.id },
    include: {
      organization: { select: { id: true, name: true } },
      task: { select: { slug: true, name: true } },
    },
  });
  return NextResponse.json({ datasetId: dataset.id, count: systems.length, systems });
}

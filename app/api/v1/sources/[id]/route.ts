import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const source = await prisma.source.findFirst({
    where: { OR: [{ id }, { doi: id }] },
    include: {
      organization: true,
      datasets: { select: { id: true, slug: true, name: true, verificationStatus: true } },
      systems: { select: { id: true, slug: true, name: true, verificationStatus: true } },
      provenanceEvents: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!source) return NextResponse.json({ error: "not_found", id }, { status: 404 });
  return NextResponse.json({ source });
}

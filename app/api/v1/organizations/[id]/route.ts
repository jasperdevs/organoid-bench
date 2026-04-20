import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const organization = await prisma.organization.findFirst({
    where: { OR: [{ id }, { name: id }] },
    include: {
      datasets: { select: { id: true, slug: true, name: true, verificationStatus: true } },
      systems: { select: { id: true, slug: true, name: true, verificationStatus: true } },
      sources: { select: { id: true, title: true, kind: true, url: true, doi: true } },
    },
  });
  if (!organization) return NextResponse.json({ error: "not_found", id }, { status: 404 });
  return NextResponse.json({ organization });
}

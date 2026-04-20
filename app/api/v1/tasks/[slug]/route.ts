import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const task = await prisma.task.findUnique({
    where: { slug },
    include: {
      track: true,
      systems: { select: { id: true, slug: true, name: true, verificationStatus: true } },
      runs: {
        include: {
          system: { select: { id: true, slug: true, name: true } },
          scoreCalculations: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 50,
      },
    },
  });
  if (!task) return NextResponse.json({ error: "not_found", slug }, { status: 404 });
  return NextResponse.json({ task });
}

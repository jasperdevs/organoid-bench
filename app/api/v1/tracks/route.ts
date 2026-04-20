import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const tracks = await prisma.benchmarkTrack.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      metrics: { select: { slug: true, name: true, unit: true, direction: true, description: true } },
      tasks: { select: { slug: true, name: true } },
      _count: { select: { runs: true } },
    },
  });
  return NextResponse.json({ count: tracks.length, tracks });
}

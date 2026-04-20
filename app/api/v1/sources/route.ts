import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const kind = sp.get("kind") ?? undefined;
  const limit = sp.get("limit") ? Math.min(Math.max(Number(sp.get("limit")), 1), 500) : 100;
  const sources = await prisma.source.findMany({
    where: { kind },
    include: {
      organization: { select: { id: true, name: true } },
      _count: { select: { datasets: true, systems: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
  return NextResponse.json({ count: sources.length, sources });
}

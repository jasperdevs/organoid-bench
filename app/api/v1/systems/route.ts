import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const limit = sp.get("limit") ? Math.min(Math.max(Number(sp.get("limit")), 1), 500) : 100;
  const status = sp.get("status") ?? undefined;
  const systems = await prisma.system.findMany({
    where: status ? { verificationStatus: status } : undefined,
    include: {
      organization: { select: { id: true, name: true } },
      dataset: { select: { id: true, slug: true, name: true } },
      source: { select: { id: true, title: true, doi: true, url: true } },
      task: { select: { slug: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
  return NextResponse.json({ count: systems.length, systems });
}

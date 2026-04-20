import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const organizations = await prisma.organization.findMany({
    include: {
      _count: { select: { datasets: true, systems: true, sources: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ count: organizations.length, organizations });
}

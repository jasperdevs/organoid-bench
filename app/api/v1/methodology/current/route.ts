import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const methodology = await prisma.methodologyVersion.findFirst({
    where: { isCurrent: true },
    orderBy: { releasedAt: "desc" },
  });
  if (!methodology) {
    return NextResponse.json({ error: "no_current_methodology" }, { status: 404 });
  }
  return NextResponse.json({ methodology });
}

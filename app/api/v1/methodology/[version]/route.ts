import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ version: string }> },
) {
  const { version } = await params;
  const methodology = await prisma.methodologyVersion.findUnique({ where: { version } });
  if (!methodology) {
    return NextResponse.json({ error: "not_found", version }, { status: 404 });
  }
  return NextResponse.json({ methodology });
}

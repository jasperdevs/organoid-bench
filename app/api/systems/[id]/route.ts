import { NextResponse } from "next/server";
import { SYSTEMS, systemById } from "@/lib/data";

export const dynamic = "force-static";

export function generateStaticParams() {
  return SYSTEMS.map((s) => ({ id: s.id }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const system = systemById(id);
  if (!system) {
    return NextResponse.json({ error: "not_found", id }, { status: 404 });
  }
  return NextResponse.json(system);
}

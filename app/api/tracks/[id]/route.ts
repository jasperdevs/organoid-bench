import { NextResponse } from "next/server";
import { TRACKS, SYSTEMS, trackById } from "@/lib/data";

export const dynamic = "force-static";

export function generateStaticParams() {
  return TRACKS.map((t) => ({ id: t.id }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const t = TRACKS.find((x) => x.id === id);
  if (!t) {
    return NextResponse.json({ error: "not_found", id }, { status: 404 });
  }
  const systems = [...SYSTEMS]
    .filter((s) => s.track === t.id)
    .sort((a, b) => b.metrics.composite - a.metrics.composite);
  return NextResponse.json({
    ...trackById(t.id),
    systemCount: systems.length,
    systems,
  });
}

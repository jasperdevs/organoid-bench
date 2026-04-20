import { NextResponse } from "next/server";
import { TRACKS, SYSTEMS } from "@/lib/data";

export const dynamic = "force-static";

export function GET() {
  const tracks = TRACKS.map((t) => ({
    ...t,
    systemCount: SYSTEMS.filter((s) => s.track === t.id).length,
  }));
  return NextResponse.json({ count: tracks.length, tracks });
}

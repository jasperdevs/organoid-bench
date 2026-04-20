import { NextResponse } from "next/server";
import { STATUS_COUNTS, CHANGELOG, TRACKS, RECENT_UPDATES } from "@/lib/data";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    ...STATUS_COUNTS,
    tracks: TRACKS.map((t) => ({ id: t.id, name: t.name })),
    changelog: CHANGELOG,
    recentUpdates: RECENT_UPDATES,
  });
}

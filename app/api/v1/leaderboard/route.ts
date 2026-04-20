import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getLeaderboardEntries } from "@/lib/leaderboard";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const entries = await getLeaderboardEntries({
    trackSlug: sp.get("track") ?? undefined,
    organizationId: sp.get("organization") ?? undefined,
    verificationStatus: sp.get("status") ?? undefined,
    runStatus: sp.get("runStatus") ?? undefined,
    limit: sp.get("limit") ? Math.min(Math.max(Number(sp.get("limit")), 1), 500) : undefined,
  });
  return NextResponse.json({
    count: entries.length,
    entries,
    generatedAt: new Date().toISOString(),
  });
}

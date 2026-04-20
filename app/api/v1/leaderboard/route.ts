import type { NextRequest } from "next/server";
import { getLeaderboardEntries } from "@/lib/leaderboard";
import { cachedJson } from "@/lib/http-cache";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const entries = await getLeaderboardEntries({
    trackSlug: sp.get("track") ?? undefined,
    organizationId: sp.get("organization") ?? undefined,
    verificationStatus: sp.get("status") ?? undefined,
    runStatus: sp.get("runStatus") ?? undefined,
    limit: sp.get("limit") ? Math.min(Math.max(Number(sp.get("limit")), 1), 500) : undefined,
  });
  return cachedJson({
    count: entries.length,
    entries,
    generatedAt: new Date().toISOString(),
  }, { profile: "short" });
}

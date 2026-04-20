import { getLeaderboardFacets } from "@/lib/leaderboard";
import { cachedJson } from "@/lib/http-cache";

export async function GET() {
  return cachedJson(await getLeaderboardFacets(), { profile: "short" });
}

import { getLeaderboardEntries } from "@/lib/leaderboard";
import { cachedJson } from "@/lib/http-cache";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const entries = await getLeaderboardEntries({ trackSlug: slug, limit: 500 });
  return cachedJson({
    trackSlug: slug,
    count: entries.length,
    entries,
    generatedAt: new Date().toISOString(),
  }, { profile: "short" });
}

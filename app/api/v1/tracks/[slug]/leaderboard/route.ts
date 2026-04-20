import { NextResponse } from "next/server";
import { getLeaderboardEntries } from "@/lib/leaderboard";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const entries = await getLeaderboardEntries({ trackSlug: slug, limit: 500 });
  return NextResponse.json({
    trackSlug: slug,
    count: entries.length,
    entries,
    generatedAt: new Date().toISOString(),
  });
}

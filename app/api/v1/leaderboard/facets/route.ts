import { NextResponse } from "next/server";
import { getLeaderboardFacets } from "@/lib/leaderboard";

export async function GET() {
  return NextResponse.json(await getLeaderboardFacets());
}

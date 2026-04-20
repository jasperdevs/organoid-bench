import { getLeaderboardEntries } from "@/lib/leaderboard";
import { cacheHeaders } from "@/lib/http-cache";

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const entries = await getLeaderboardEntries({ limit: 500 });
  const cols: (keyof typeof entries[number])[] = [
    "systemId",
    "systemName",
    "organizationName",
    "trackSlug",
    "taskSlug",
    "datasetName",
    "sourceTitle",
    "sourceDoi",
    "peerReviewStatus",
    "rawDataAvailable",
    "processedDataAvailable",
    "codeAvailable",
    "nOrganoids",
    "nSessions",
    "nBatches",
    "nLabs",
    "controlsPassedCount",
    "controlsTotalCount",
    "signalScore",
    "responseScore",
    "plasticityScore",
    "learningScore",
    "retentionScore",
    "reproducibilityScore",
    "trackScore",
    "compositeScore",
    "confidenceGrade",
    "verificationStatus",
    "runStatus",
    "methodologyVersion",
    "lastUpdated",
  ];

  const lines = [
    cols.join(","),
    ...entries.map((e) => cols.map((c) => csvEscape(e[c])).join(",")),
  ];

  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="organoidbench-leaderboard.csv"',
      ...Object.fromEntries(cacheHeaders({ profile: "short" })),
    },
  });
}

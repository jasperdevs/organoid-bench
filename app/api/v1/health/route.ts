import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [trackCount, systemCount, datasetCount, sourceCount, runCount, methodology] =
      await Promise.all([
        prisma.benchmarkTrack.count(),
        prisma.system.count(),
        prisma.dataset.count(),
        prisma.source.count(),
        prisma.benchmarkRun.count(),
        prisma.methodologyVersion.findFirst({ where: { isCurrent: true } }),
      ]);
    return NextResponse.json({
      status: "ok",
      generatedAt: new Date().toISOString(),
      database: "connected",
      counts: {
        tracks: trackCount,
        systems: systemCount,
        datasets: datasetCount,
        sources: sourceCount,
        benchmarkRuns: runCount,
      },
      methodology: methodology
        ? { version: methodology.version, releasedAt: methodology.releasedAt }
        : null,
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        database: "unreachable",
        error: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 },
    );
  }
}

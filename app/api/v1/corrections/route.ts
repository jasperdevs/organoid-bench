import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { CorrectionSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = CorrectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }
  const input = parsed.data;

  const event = await prisma.provenanceEvent.create({
    data: {
      eventType: "corrected",
      message: `Correction proposed by ${input.submitterEmail} on ${input.targetType} ${input.targetId}: ${input.field}`,
      actor: `submitter:${input.submitterEmail}`,
      payloadJson: JSON.stringify(input),
      systemId: input.targetType === "system" ? input.targetId : undefined,
      datasetId: input.targetType === "dataset" ? input.targetId : undefined,
      sourceId: input.targetType === "source" ? input.targetId : undefined,
      benchmarkRunId: input.targetType === "benchmark_run" ? input.targetId : undefined,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      correctionEventId: event.id,
      message: "Correction recorded as a provenance event and queued for curator review.",
    },
    { status: 201 },
  );
}

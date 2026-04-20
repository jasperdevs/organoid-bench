import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { parseSubmissionInput } from "@/lib/submissions";
import { noStoreJson } from "@/lib/http-cache";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noStoreJson({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = parseSubmissionInput(body);
  if (!parsed.success) {
    return noStoreJson(
      { error: "validation_failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }
  const input = parsed.data;

  const submission = await prisma.submission.create({
    data: {
      submitterEmail: input.submitterEmail,
      submitterName: input.submitterName,
      organizationId: undefined,
      proposedSystemName: input.proposedSystemName,
      proposedTrackSlug: input.proposedTrackSlug,
      proposedTaskSlug: input.proposedTaskSlug,
      sourceUrl: input.sourceUrl,
      datasetUrl: input.datasetUrl,
      codeUrl: input.codeUrl,
      payloadJson: JSON.stringify(input),
      reviewStatus: "received",
    },
  });

  await prisma.provenanceEvent.create({
    data: {
      eventType: "imported",
      message: `Submission received: ${input.proposedSystemName}`,
      actor: `submitter:${input.submitterEmail}`,
      payloadJson: JSON.stringify({ submissionId: submission.id }),
    },
  });

  return noStoreJson(
    {
      ok: true,
      submissionId: submission.id,
      reviewStatus: submission.reviewStatus,
      message:
        "Submission recorded. A curator will review for source verification before anything appears on the leaderboard.",
    },
    { status: 201 },
  );
}

export async function GET() {
  return noStoreJson(
    { error: "method_not_allowed", allow: ["POST"] },
    { status: 405, headers: { Allow: "POST" } },
  );
}

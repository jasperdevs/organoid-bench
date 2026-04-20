import {
  applyRemoteSql,
  buildDatasetUpsertSql,
  buildOrganizationUpsertSql,
  buildProvenanceSql,
  buildSourceUpsertSql,
  optArg,
  parseIngestOptions,
  prisma,
  slugify,
  sqlDate,
  sqlString,
  stableId,
} from "./_ingest-common";

type SubmissionPayload = {
  submitterEmail?: string;
  affiliation?: string;
  organizationName?: string;
  title?: string;
  proposedSystemName?: string;
  proposedTrackSlug?: string;
  proposedTaskSlug?: string;
  benchmarkTrack?: string;
  task?: string;
  sourceUrl?: string;
  paperUrl?: string;
  datasetUrl?: string;
  codeUrl?: string;
  notes?: string;
  limitations?: string;
};

function parsePayload(payloadJson: string): SubmissionPayload {
  try {
    return JSON.parse(payloadJson) as SubmissionPayload;
  } catch {
    return {};
  }
}

function systemSql(input: {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  sourceId?: string | null;
  datasetId?: string | null;
  organizationId?: string | null;
  taskSlug?: string | null;
  verificationStatus: string;
  limitations?: string | null;
  submissionId: string;
}) {
  const now = sqlDate();
  return `INSERT INTO "System" ("id","slug","name","description","sourceId","datasetId","organizationId","taskId","verificationStatus","limitations","submissionId","createdAt","updatedAt")
VALUES (${sqlString(input.id)},${sqlString(input.slug)},${sqlString(input.name)},${sqlString(input.description ?? null)},${sqlString(input.sourceId ?? null)},${sqlString(input.datasetId ?? null)},${sqlString(input.organizationId ?? null)},(SELECT "id" FROM "Task" WHERE "slug"=${sqlString(input.taskSlug ?? "")}),${sqlString(input.verificationStatus)},${sqlString(input.limitations ?? null)},${sqlString(input.submissionId)},${now},${now})
ON CONFLICT("slug") DO UPDATE SET "description"=excluded."description","sourceId"=excluded."sourceId","datasetId"=excluded."datasetId","organizationId"=excluded."organizationId","taskId"=excluded."taskId","verificationStatus"=excluded."verificationStatus","limitations"=excluded."limitations","updatedAt"=excluded."updatedAt";`;
}

function benchmarkRunSql(input: {
  id: string;
  systemId: string;
  trackSlug: string;
  taskSlug?: string | null;
  methodologyVersion: string;
}) {
  const now = sqlDate();
  return `INSERT INTO "BenchmarkRun" ("id","systemId","trackId","taskId","methodologyVersionId","runStatus","createdAt","updatedAt")
VALUES (${sqlString(input.id)},${sqlString(input.systemId)},(SELECT "id" FROM "BenchmarkTrack" WHERE "slug"=${sqlString(input.trackSlug)}),(SELECT "id" FROM "Task" WHERE "slug"=${sqlString(input.taskSlug ?? "")}),(SELECT "id" FROM "MethodologyVersion" WHERE "version"=${sqlString(input.methodologyVersion)}),'draft',${now},${now});`;
}

async function main() {
  const argv = process.argv.slice(2);
  const options = parseIngestOptions(argv);
  const id = optArg(argv, "--id");
  if (!id) {
    console.error("Missing required --id <submissionId>.");
    process.exit(2);
  }

  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission) {
    console.error(`Submission not found: ${id}`);
    process.exit(1);
  }

  const payload = parsePayload(submission.payloadJson);
  const orgName = payload.organizationName ?? payload.affiliation ?? null;
  const sourceUrl = payload.sourceUrl ?? payload.paperUrl ?? submission.sourceUrl;
  const datasetUrl = payload.datasetUrl ?? submission.datasetUrl;
  const systemName = payload.proposedSystemName ?? submission.proposedSystemName;
  const trackSlug = payload.proposedTrackSlug ?? payload.benchmarkTrack ?? submission.proposedTrackSlug;
  const taskSlug = payload.proposedTaskSlug ?? payload.task ?? submission.proposedTaskSlug;

  if (!sourceUrl) {
    console.error("Submission has no sourceUrl or paperUrl. Curator promotion requires a source-backed record.");
    process.exit(1);
  }

  const orgId = orgName ? stableId("org", orgName) : null;
  const sourceId = stableId("source", `submission:${submission.id}:${sourceUrl}`);
  const datasetId = datasetUrl ? stableId("dataset", `submission:${submission.id}:${datasetUrl}`) : null;
  const systemId = stableId("system", `submission:${submission.id}:${systemName}`);
  const systemSlug = slugify(systemName);
  const runId = trackSlug && taskSlug ? stableId("run", `submission:${submission.id}:${trackSlug}:${taskSlug}`) : null;

  const sql = [
    "BEGIN;",
    orgName && orgId ? buildOrganizationUpsertSql(orgId, orgName) : null,
    buildSourceUpsertSql({
      id: sourceId,
      kind: "lab_submission",
      doi: `submission-source:${submission.id}`,
      title: payload.title ?? systemName,
      url: sourceUrl,
      organizationId: orgId,
      reviewStatus: "none",
      metadataJson: JSON.stringify({ submissionId: submission.id, sourceUrl, codeUrl: payload.codeUrl ?? submission.codeUrl }),
    }),
    datasetUrl && datasetId
      ? buildDatasetUpsertSql({
          id: datasetId,
          sourceId,
          organizationId: orgId,
          name: payload.title ?? systemName,
          slug: slugify(`${systemName}-${submission.id}`),
          accessStatus: "unknown",
          rawDataAvailable: false,
          metadataAvailable: false,
          dataUrl: datasetUrl,
          verificationStatus: "source_verified",
        })
      : null,
    systemSql({
      id: systemId,
      slug: systemSlug,
      name: systemName,
      description: payload.notes ?? null,
      sourceId,
      datasetId,
      organizationId: orgId,
      taskSlug,
      verificationStatus: "source_verified",
      limitations: payload.limitations ?? null,
      submissionId: submission.id,
    }),
    runId && trackSlug && taskSlug
      ? benchmarkRunSql({
          id: runId,
          systemId,
          trackSlug,
          taskSlug,
          methodologyVersion: "1.0.0",
        })
      : null,
    buildProvenanceSql({
      id: stableId("prov", `curate-source-${submission.id}`),
      eventType: "validated",
      message: `Promoted submission ${submission.id} to source-backed registry skeleton`,
      actor: "curator:cli",
      sourceId,
      datasetId,
      systemId,
      benchmarkRunId: runId,
      payloadJson: JSON.stringify({ submissionId: submission.id }),
    }),
    `UPDATE "Submission" SET "reviewStatus"='triaged',"updatedAt"=${sqlDate()} WHERE "id"=${sqlString(submission.id)};`,
    "COMMIT;",
  ].filter(Boolean).join("\n");

  if (options.dryRun) {
    if (options.target === "remote") {
      applyRemoteSql(sql, "curate-submission", options);
      return;
    }
    console.log(sql);
    return;
  }

  if (options.target === "remote") {
    applyRemoteSql(sql, "curate-submission", options);
    return;
  }

  const organization = orgName
    ? await prisma.organization.upsert({ where: { name: orgName }, update: {}, create: { name: orgName } })
    : null;
  const source = await prisma.source.upsert({
    where: { doi: `submission-source:${submission.id}` },
    update: {
      title: payload.title ?? systemName,
      url: sourceUrl,
      organizationId: organization?.id ?? null,
      kind: "lab_submission",
      lastCheckedAt: new Date(),
      metadataJson: JSON.stringify({ submissionId: submission.id, sourceUrl, codeUrl: payload.codeUrl ?? submission.codeUrl }),
    },
    create: {
      kind: "lab_submission",
      title: payload.title ?? systemName,
      url: sourceUrl,
      doi: `submission-source:${submission.id}`,
      organizationId: organization?.id ?? null,
      lastCheckedAt: new Date(),
      metadataJson: JSON.stringify({ submissionId: submission.id, sourceUrl, codeUrl: payload.codeUrl ?? submission.codeUrl }),
    },
  });
  const dataset = datasetUrl
    ? await prisma.dataset.upsert({
        where: { slug: slugify(`${systemName}-${submission.id}`) },
        update: {
          sourceId: source.id,
          organizationId: organization?.id ?? null,
          dataUrl: datasetUrl,
          verificationStatus: "source_verified",
        },
        create: {
          sourceId: source.id,
          organizationId: organization?.id ?? null,
          name: payload.title ?? systemName,
          slug: slugify(`${systemName}-${submission.id}`),
          accessStatus: "unknown",
          dataUrl: datasetUrl,
          verificationStatus: "source_verified",
        },
      })
    : null;
  const task = taskSlug ? await prisma.task.findUnique({ where: { slug: taskSlug } }) : null;
  const track = trackSlug ? await prisma.benchmarkTrack.findUnique({ where: { slug: trackSlug } }) : null;
  const methodology = await prisma.methodologyVersion.findFirst({ where: { isCurrent: true } });
  const system = await prisma.system.upsert({
    where: { slug: systemSlug },
    update: {
      sourceId: source.id,
      datasetId: dataset?.id ?? null,
      organizationId: organization?.id ?? null,
      taskId: task?.id ?? null,
      verificationStatus: "source_verified",
      limitations: payload.limitations ?? null,
    },
    create: {
      slug: systemSlug,
      name: systemName,
      description: payload.notes ?? null,
      sourceId: source.id,
      datasetId: dataset?.id ?? null,
      organizationId: organization?.id ?? null,
      taskId: task?.id ?? null,
      verificationStatus: "source_verified",
      limitations: payload.limitations ?? null,
      submissionId: submission.id,
    },
  });
  const run =
    track && task && methodology
      ? await prisma.benchmarkRun.create({
          data: {
            systemId: system.id,
            trackId: track.id,
            taskId: task.id,
            methodologyVersionId: methodology.id,
            runStatus: "draft",
          },
        })
      : null;
  await prisma.provenanceEvent.create({
    data: {
      eventType: "validated",
      message: `Promoted submission ${submission.id} to source-backed registry skeleton`,
      actor: "curator:cli",
      sourceId: source.id,
      datasetId: dataset?.id ?? null,
      systemId: system.id,
      benchmarkRunId: run?.id ?? null,
      payloadJson: JSON.stringify({ submissionId: submission.id }),
    },
  });
  await prisma.submission.update({ where: { id: submission.id }, data: { reviewStatus: "triaged" } });
  console.log(JSON.stringify({ sourceId: source.id, datasetId: dataset?.id ?? null, systemId: system.id, benchmarkRunId: run?.id ?? null }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Ingest a Zenodo record by ID.
// Usage: npm run ingest:zenodo -- --record 1234567 [--org "Lab Name"]
import {
  applyRemoteSql,
  buildDatasetFileReplaceSql,
  buildDatasetUpsertSql,
  buildOrganizationUpsertSql,
  buildProvenanceSql,
  buildSourceUpsertSql,
  fetchJson,
  jsonStringify,
  optArg,
  parseBytes,
  parseChecksum,
  parseIngestOptions,
  prisma,
  requireArg,
  slugify,
  stableId,
  uniqueSlug,
} from "./_ingest-common";

type ZenodoCreator = { name?: string; affiliation?: string };
type ZenodoFile = {
  key?: string;
  filename?: string;
  size?: number;
  checksum?: string;
  type?: string;
  links?: { self?: string; download?: string };
};
type ZenodoRecord = {
  id: number;
  doi?: string;
  conceptdoi?: string;
  title: string;
  metadata: {
    title: string;
    doi?: string;
    publication_date?: string;
    description?: string;
    creators?: ZenodoCreator[];
    license?: { id?: string };
    resource_type?: { type?: string; subtype?: string };
    journal?: { title?: string };
    meeting?: { title?: string };
  };
  files?: ZenodoFile[];
  links?: { self_html?: string; doi?: string; self?: string };
};

async function main() {
  const argv = process.argv.slice(2);
  const options = parseIngestOptions(argv);
  const recordArg = optArg(argv, "--record") ?? optArg(argv, "--url") ?? requireArg(argv, "--record");
  const recordId = recordArg.match(/records\/(\d+)/)?.[1] ?? recordArg;
  const orgName = optArg(argv, "--org");

  console.log(`Fetching Zenodo record ${recordId}...`);
  const rec = await fetchJson<ZenodoRecord>(`https://zenodo.org/api/records/${recordId}`);

  const year = rec.metadata.publication_date
    ? Number(rec.metadata.publication_date.slice(0, 4))
    : null;
  const authors = (rec.metadata.creators ?? []).map((c) => c.name).filter(Boolean);
  const license = rec.metadata.license?.id ?? null;
  const sourceUrl = rec.links?.self_html ?? `https://zenodo.org/records/${recordId}`;

  const organizationId = orgName ? stableId("org", orgName) : null;
  const organization = orgName && options.target === "local" && !options.dryRun
    ? await prisma.organization.upsert({
        where: { name: orgName },
        update: {},
        create: { name: orgName },
      })
    : null;

  const sourceId = stableId("source", rec.metadata.doi ?? `zenodo:${recordId}`);
  const sourceInput = {
    id: sourceId,
    kind: "zenodo",
    doi: rec.metadata.doi ?? `zenodo:${recordId}`,
    title: rec.metadata.title,
    url: sourceUrl,
    year: year ?? null,
    authors: authors.length ? JSON.stringify(authors) : null,
    licenseName: license,
    repositoryType: "zenodo",
    reviewStatus: "none",
    organizationId: organization?.id ?? organizationId,
    metadataJson: JSON.stringify(rec).slice(0, 200_000),
  };

  if (options.dryRun || options.target === "remote") {
    const titleSlug = slugify(rec.metadata.title).slice(0, 60).replace(/-+$/g, "");
    const baseSlug = `${titleSlug}-zenodo-${recordId}`;
    const datasetId = stableId("dataset", baseSlug);
    const files = rec.files ?? [];
    const totalBytes = files.reduce((acc, f) => acc + (typeof f.size === "number" ? f.size : 0), 0);
    const datasetInput = {
      id: datasetId,
      sourceId,
      organizationId: organization?.id ?? organizationId,
      name: rec.metadata.title,
      slug: baseSlug,
      description: rec.metadata.description?.slice(0, 4000) ?? null,
      licenseName: license,
      accessStatus: "open",
      rawDataAvailable: files.length > 0,
      metadataAvailable: true,
      dataUrl: sourceUrl,
      externalId: String(recordId),
      sizeBytes: parseBytes(totalBytes),
      verificationStatus: "source_verified",
    };
    const fileInputs = files.map((f, i) => ({
      ...parseChecksum(f.checksum),
      id: stableId("file", `${datasetId}-${f.key ?? f.filename ?? i}`),
      path: f.key ?? f.filename ?? "unknown",
      format: (f.type ?? f.key?.split(".").pop() ?? null)?.slice(0, 32) ?? null,
      sizeBytes: parseBytes(f.size),
      url: f.links?.self ?? f.links?.download ?? null,
    }));
    console.log(jsonStringify({ target: options.target, dryRun: options.dryRun, source: sourceInput, dataset: datasetInput, files: fileInputs.length }));
    if (options.target === "remote") {
      const sql = [
        "BEGIN;",
        orgName && organizationId ? buildOrganizationUpsertSql(organizationId, orgName) : null,
        buildSourceUpsertSql(sourceInput),
        buildDatasetUpsertSql(datasetInput),
        buildDatasetFileReplaceSql(datasetId, fileInputs),
        buildProvenanceSql({
          id: stableId("prov", `zenodo-${recordId}-${Date.now()}`),
          eventType: "imported",
          message: `Imported Zenodo record ${recordId}`,
          actor: "system:ingest-zenodo",
          sourceId,
          datasetId,
          payloadJson: JSON.stringify({ recordId, files: files.length, bytes: totalBytes }),
        }),
        "COMMIT;",
      ].filter(Boolean).join("\n");
      applyRemoteSql(sql, "ingest-zenodo", options);
    }
    return;
  }

  const source = await prisma.source.upsert({
    where: { doi: rec.metadata.doi ?? `zenodo:${recordId}` },
    update: {
      title: rec.metadata.title,
      url: sourceUrl,
      year: year ?? null,
      authors: authors.length ? JSON.stringify(authors) : null,
      licenseName: license,
      repositoryType: "zenodo",
      reviewStatus: "none",
      lastCheckedAt: new Date(),
      organizationId: organization?.id ?? null,
      metadataJson: JSON.stringify(rec).slice(0, 200_000),
    },
    create: {
      kind: "zenodo",
      doi: rec.metadata.doi ?? `zenodo:${recordId}`,
      title: rec.metadata.title,
      url: sourceUrl,
      year: year ?? null,
      authors: authors.length ? JSON.stringify(authors) : null,
      licenseName: license,
      repositoryType: "zenodo",
      reviewStatus: "none",
      lastCheckedAt: new Date(),
      organizationId: organization?.id ?? null,
      metadataJson: JSON.stringify(rec).slice(0, 200_000),
    },
  });

  const titleSlug = slugify(rec.metadata.title).slice(0, 60).replace(/-+$/g, "");
  const baseSlug = `${titleSlug}-zenodo-${recordId}`;
  const slug = await uniqueSlug(baseSlug, async (s) => !!(await prisma.dataset.findUnique({ where: { slug: s } })));

  const files = rec.files ?? [];
  const totalBytes = files.reduce((acc, f) => acc + (typeof f.size === "number" ? f.size : 0), 0);

  const dataset = await prisma.dataset.upsert({
    where: { slug },
    update: {
      sourceId: source.id,
      name: rec.metadata.title,
      description: rec.metadata.description?.slice(0, 4000) ?? null,
      licenseName: license,
      accessStatus: "open",
      rawDataAvailable: files.length > 0,
      metadataAvailable: true,
      dataUrl: sourceUrl,
      externalId: String(recordId),
      sizeBytes: parseBytes(totalBytes),
      nRecordings: null,
      lastCheckedAt: new Date(),
      verificationStatus: "source_verified",
      organizationId: organization?.id ?? null,
    },
    create: {
      sourceId: source.id,
      name: rec.metadata.title,
      slug,
      description: rec.metadata.description?.slice(0, 4000) ?? null,
      licenseName: license,
      accessStatus: "open",
      rawDataAvailable: files.length > 0,
      metadataAvailable: true,
      dataUrl: sourceUrl,
      externalId: String(recordId),
      sizeBytes: parseBytes(totalBytes),
      verificationStatus: "source_verified",
      organizationId: organization?.id ?? null,
    },
  });

  await prisma.datasetFile.deleteMany({ where: { datasetId: dataset.id } });
  if (files.length > 0) {
    await prisma.datasetFile.createMany({
      data: files.map((f) => ({
        datasetId: dataset.id,
        path: f.key ?? f.filename ?? "unknown",
        format: (f.type ?? f.key?.split(".").pop() ?? null)?.slice(0, 32) ?? null,
        sizeBytes: parseBytes(f.size),
        ...parseChecksum(f.checksum),
        url: f.links?.self ?? f.links?.download ?? null,
        storageStatus: "remote_only",
      })),
    });
  }

  await prisma.provenanceEvent.create({
    data: {
      eventType: "imported",
      message: `Imported Zenodo record ${recordId}`,
      actor: "system:ingest-zenodo",
      sourceId: source.id,
      datasetId: dataset.id,
      payloadJson: JSON.stringify({ recordId, files: files.length, bytes: totalBytes }),
    },
  });

  console.log(`OK source=${source.id} dataset=${dataset.id} files=${files.length}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

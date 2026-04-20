// Ingest a paper or preprint by DOI. Tries Crossref, then DataCite.
// Usage: npm run ingest:source -- --doi 10.1038/s41586-022-00000-0 [--org "Lab Name"]
import {
  applyRemoteSql,
  buildOrganizationUpsertSql,
  buildProvenanceSql,
  buildSourceUpsertSql,
  fetchJson,
  jsonStringify,
  optArg,
  parseIngestOptions,
  prisma,
  requireArg,
  stableId,
} from "./_ingest-common";

type CrossrefMessage = {
  DOI: string;
  title?: string[];
  subtitle?: string[];
  author?: Array<{ given?: string; family?: string; name?: string }>;
  issued?: { "date-parts"?: number[][] };
  published?: { "date-parts"?: number[][] };
  "container-title"?: string[];
  URL?: string;
  type?: string;
  abstract?: string;
  license?: Array<{ URL?: string; "content-version"?: string }>;
};

type CrossrefResponse = { status: string; message: CrossrefMessage };

type DataCiteAttributes = {
  doi: string;
  titles?: Array<{ title: string }>;
  creators?: Array<{ name?: string; givenName?: string; familyName?: string }>;
  publisher?: string;
  publicationYear?: number;
  types?: { resourceTypeGeneral?: string; resourceType?: string };
  url?: string;
  descriptions?: Array<{ description: string; descriptionType?: string }>;
  rightsList?: Array<{ rights?: string; rightsUri?: string }>;
};
type DataCiteResponse = { data: { id: string; attributes: DataCiteAttributes } };

function firstDatePartYear(dp?: { "date-parts"?: number[][] }): number | null {
  const y = dp?.["date-parts"]?.[0]?.[0];
  return typeof y === "number" ? y : null;
}

function classifyKind(type: string | undefined): string {
  if (!type) return "other";
  const t = type.toLowerCase();
  if (t.includes("journal")) return "paper";
  if (t.includes("preprint") || t.includes("posted-content")) return "preprint";
  if (t.includes("dataset")) return "other";
  return "paper";
}

async function tryCrossref(doi: string): Promise<CrossrefMessage | null> {
  try {
    const r = await fetchJson<CrossrefResponse>(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      "User-Agent": "OrganoidBench-Ingester/1.0 (mailto:jasper.mceligott@gmail.com)",
    });
    return r.status === "ok" ? r.message : null;
  } catch {
    return null;
  }
}

async function tryDataCite(doi: string): Promise<DataCiteAttributes | null> {
  try {
    const r = await fetchJson<DataCiteResponse>(`https://api.datacite.org/dois/${encodeURIComponent(doi)}`);
    return r.data?.attributes ?? null;
  } catch {
    return null;
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const options = parseIngestOptions(argv);
  const doi = (optArg(argv, "--doi") ?? optArg(argv, "--url") ?? requireArg(argv, "--doi"))
    .replace(/^https:\/\/doi\.org\//i, "")
    .replace(/^doi:/i, "")
    .trim();
  const orgName = optArg(argv, "--org");

  const organizationId = orgName ? stableId("org", orgName) : null;
  const organization =
    orgName && options.target === "local" && !options.dryRun
      ? await prisma.organization.upsert({ where: { name: orgName }, update: {}, create: { name: orgName } })
      : null;

  console.log(`Resolving DOI ${doi} via Crossref...`);
  const cross = await tryCrossref(doi);
  let title: string | null = null;
  let year: number | null = null;
  let authors: string[] = [];
  let venue: string | null = null;
  let sourceUrl: string | null = null;
  let kind = "other";
  let license: string | null = null;
  let abstractText: string | null = null;
  let raw: object | null = null;

  if (cross) {
    title = cross.title?.[0] ?? null;
    year = firstDatePartYear(cross.issued) ?? firstDatePartYear(cross.published);
    authors = (cross.author ?? [])
      .map((a) => a.name ?? [a.given, a.family].filter(Boolean).join(" "))
      .filter(Boolean);
    venue = cross["container-title"]?.[0] ?? null;
    sourceUrl = cross.URL ?? `https://doi.org/${doi}`;
    kind = classifyKind(cross.type);
    license = cross.license?.[0]?.URL ?? null;
    abstractText = cross.abstract ?? null;
    raw = cross;
  } else {
    console.log("Crossref miss, trying DataCite...");
    const dc = await tryDataCite(doi);
    if (!dc) {
      console.error(`Could not resolve DOI ${doi} via Crossref or DataCite.`);
      process.exit(1);
    }
    title = dc.titles?.[0]?.title ?? null;
    year = dc.publicationYear ?? null;
    authors = (dc.creators ?? [])
      .map((c) => c.name ?? [c.givenName, c.familyName].filter(Boolean).join(" "))
      .filter(Boolean);
    venue = dc.publisher ?? null;
    sourceUrl = dc.url ?? `https://doi.org/${doi}`;
    kind = classifyKind(dc.types?.resourceTypeGeneral);
    license = dc.rightsList?.[0]?.rights ?? null;
    abstractText = dc.descriptions?.find((d) => d.descriptionType === "Abstract")?.description
      ?? dc.descriptions?.[0]?.description
      ?? null;
    raw = dc;
  }

  if (!title) {
    console.error(`Resolved DOI ${doi} but no title present.`);
    process.exit(1);
  }

  const sourceInput = {
    id: stableId("source", doi),
    kind,
    doi,
    title,
    url: sourceUrl ?? null,
    year: year ?? null,
    venue,
    authors: authors.length ? JSON.stringify(authors) : null,
    licenseName: license,
    reviewStatus: kind === "preprint" ? "preprint" : "none",
    organizationId: organization?.id ?? organizationId,
    abstractText: abstractText?.slice(0, 8000) ?? null,
    metadataJson: JSON.stringify(raw).slice(0, 200_000),
  };

  if (options.dryRun) {
    console.log(jsonStringify({ target: options.target, dryRun: true, source: sourceInput }));
    if (options.target === "remote") {
      const sql = [
        "BEGIN;",
        orgName && organizationId ? buildOrganizationUpsertSql(organizationId, orgName) : null,
        buildSourceUpsertSql(sourceInput),
        buildProvenanceSql({
          id: stableId("prov", `source-${doi}-${Date.now()}`),
          eventType: "imported",
          message: `Imported source for DOI ${doi}`,
          actor: "system:ingest-source",
          sourceId: sourceInput.id,
          payloadJson: JSON.stringify({ doi, kind, year, authors: authors.length }),
        }),
        "COMMIT;",
      ].filter(Boolean).join("\n");
      applyRemoteSql(sql, "ingest-source", options);
    }
    return;
  }

  if (options.target === "remote") {
    const sql = [
      "BEGIN;",
      orgName && organizationId ? buildOrganizationUpsertSql(organizationId, orgName) : null,
      buildSourceUpsertSql(sourceInput),
      buildProvenanceSql({
        id: stableId("prov", `source-${doi}-${Date.now()}`),
        eventType: "imported",
        message: `Imported source for DOI ${doi}`,
        actor: "system:ingest-source",
        sourceId: sourceInput.id,
        payloadJson: JSON.stringify({ doi, kind, year, authors: authors.length }),
      }),
      "COMMIT;",
    ].filter(Boolean).join("\n");
    applyRemoteSql(sql, "ingest-source", options);
    return;
  }

  const source = await prisma.source.upsert({
    where: { doi },
    update: {
      title,
      url: sourceUrl ?? undefined,
      year: year ?? null,
      venue,
      authors: authors.length ? JSON.stringify(authors) : null,
      licenseName: license,
      reviewStatus: kind === "preprint" ? "preprint" : "none",
      lastCheckedAt: new Date(),
      organizationId: organization?.id ?? null,
      abstractText: abstractText?.slice(0, 8000) ?? null,
      metadataJson: JSON.stringify(raw).slice(0, 200_000),
    },
    create: {
      kind,
      doi,
      title,
      url: sourceUrl ?? null,
      year: year ?? null,
      venue,
      authors: authors.length ? JSON.stringify(authors) : null,
      licenseName: license,
      reviewStatus: kind === "preprint" ? "preprint" : "none",
      lastCheckedAt: new Date(),
      organizationId: organization?.id ?? null,
      abstractText: abstractText?.slice(0, 8000) ?? null,
      metadataJson: JSON.stringify(raw).slice(0, 200_000),
    },
  });

  await prisma.provenanceEvent.create({
    data: {
      eventType: "imported",
      message: `Imported source for DOI ${doi}`,
      actor: "system:ingest-source",
      sourceId: source.id,
      payloadJson: JSON.stringify({ doi, kind, year, authors: authors.length }),
    },
  });

  console.log(`OK source=${source.id} kind=${kind} year=${year ?? "?"} authors=${authors.length}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

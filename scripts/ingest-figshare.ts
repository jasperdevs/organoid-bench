// Ingest a Figshare article by ID.
// Usage: npm run ingest:figshare -- --article 12345678 [--org "Lab Name"]
import { prisma, fetchJson, slugify, uniqueSlug, requireArg, optArg, parseBytes } from "./_ingest-common";

type FigshareAuthor = { full_name?: string; orcid_id?: string };
type FigshareFile = {
  id?: number;
  name?: string;
  download_url?: string;
  size?: number;
  computed_md5?: string;
  mimetype?: string;
};
type FigshareLicense = { name?: string; url?: string };
type FigshareArticle = {
  id: number;
  doi?: string;
  title: string;
  description?: string;
  published_date?: string;
  authors?: FigshareAuthor[];
  license?: FigshareLicense;
  url_public_html?: string;
  files?: FigshareFile[];
  defined_type_name?: string;
};

async function main() {
  const argv = process.argv.slice(2);
  const articleId = requireArg(argv, "--article");
  const orgName = optArg(argv, "--org");

  console.log(`Fetching Figshare article ${articleId}...`);
  const rec = await fetchJson<FigshareArticle>(`https://api.figshare.com/v2/articles/${articleId}`);

  const year = rec.published_date ? Number(rec.published_date.slice(0, 4)) : null;
  const authors = (rec.authors ?? []).map((a) => a.full_name).filter(Boolean);
  const license = rec.license?.name ?? null;
  const sourceUrl = rec.url_public_html ?? `https://figshare.com/articles/${articleId}`;

  const organization = orgName
    ? await prisma.organization.upsert({ where: { name: orgName }, update: {}, create: { name: orgName } })
    : null;

  const source = await prisma.source.upsert({
    where: { doi: rec.doi ?? `figshare:${articleId}` },
    update: {
      title: rec.title,
      url: sourceUrl,
      year,
      authors: authors.length ? JSON.stringify(authors) : null,
      licenseName: license,
      licenseUrl: rec.license?.url ?? null,
      repositoryType: "figshare",
      reviewStatus: "none",
      lastCheckedAt: new Date(),
      organizationId: organization?.id ?? null,
      metadataJson: JSON.stringify(rec).slice(0, 200_000),
    },
    create: {
      kind: "figshare",
      doi: rec.doi ?? `figshare:${articleId}`,
      title: rec.title,
      url: sourceUrl,
      year,
      authors: authors.length ? JSON.stringify(authors) : null,
      licenseName: license,
      licenseUrl: rec.license?.url ?? null,
      repositoryType: "figshare",
      reviewStatus: "none",
      lastCheckedAt: new Date(),
      organizationId: organization?.id ?? null,
      metadataJson: JSON.stringify(rec).slice(0, 200_000),
    },
  });

  const baseSlug = slugify(`${rec.title}-figshare-${articleId}`);
  const slug = await uniqueSlug(baseSlug, async (s) => !!(await prisma.dataset.findUnique({ where: { slug: s } })));

  const files = rec.files ?? [];
  const totalBytes = files.reduce((acc, f) => acc + (typeof f.size === "number" ? f.size : 0), 0);

  const dataset = await prisma.dataset.upsert({
    where: { slug },
    update: {
      sourceId: source.id,
      name: rec.title,
      description: rec.description?.slice(0, 4000) ?? null,
      licenseName: license,
      accessStatus: "open",
      rawDataAvailable: files.length > 0,
      metadataAvailable: true,
      dataUrl: sourceUrl,
      externalId: String(articleId),
      sizeBytes: parseBytes(totalBytes),
      lastCheckedAt: new Date(),
      verificationStatus: "source_verified",
      organizationId: organization?.id ?? null,
    },
    create: {
      sourceId: source.id,
      name: rec.title,
      slug,
      description: rec.description?.slice(0, 4000) ?? null,
      licenseName: license,
      accessStatus: "open",
      rawDataAvailable: files.length > 0,
      metadataAvailable: true,
      dataUrl: sourceUrl,
      externalId: String(articleId),
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
        path: f.name ?? `file-${f.id ?? "unknown"}`,
        format: (f.mimetype ?? f.name?.split(".").pop() ?? null)?.slice(0, 32) ?? null,
        sizeBytes: parseBytes(f.size),
        checksumSha256: null,
        url: f.download_url ?? null,
      })),
    });
  }

  await prisma.provenanceEvent.create({
    data: {
      eventType: "imported",
      message: `Imported Figshare article ${articleId}`,
      actor: "system:ingest-figshare",
      sourceId: source.id,
      datasetId: dataset.id,
      payloadJson: JSON.stringify({ articleId, files: files.length, bytes: totalBytes }),
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

// Ingest a GitHub repository as a Source (code repo).
// Usage: npm run ingest:github -- --repo owner/name [--org "Lab Name"]
import { prisma, fetchJson, requireArg, optArg } from "./_ingest-common";

type GhRepo = {
  id: number;
  name: string;
  full_name: string;
  description?: string | null;
  html_url: string;
  homepage?: string | null;
  license?: { name?: string; spdx_id?: string; url?: string | null } | null;
  pushed_at?: string;
  updated_at?: string;
  stargazers_count?: number;
  forks_count?: number;
  size?: number;
  default_branch?: string;
  topics?: string[];
  archived?: boolean;
};

async function main() {
  const argv = process.argv.slice(2);
  const repo = requireArg(argv, "--repo");
  const orgName = optArg(argv, "--org");

  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    console.error(`--repo must look like owner/name, got ${repo}`);
    process.exit(2);
  }

  const headers: Record<string, string> = process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {};

  console.log(`Fetching GitHub repo ${repo}...`);
  const gh = await fetchJson<GhRepo>(`https://api.github.com/repos/${repo}`, headers);

  const organization = orgName
    ? await prisma.organization.upsert({ where: { name: orgName }, update: {}, create: { name: orgName } })
    : null;

  const doiLike = `github:${gh.full_name}`;
  const source = await prisma.source.upsert({
    where: { doi: doiLike },
    update: {
      title: gh.full_name,
      url: gh.html_url,
      authors: null,
      year: gh.pushed_at ? Number(gh.pushed_at.slice(0, 4)) : null,
      licenseName: gh.license?.name ?? gh.license?.spdx_id ?? null,
      licenseUrl: gh.license?.url ?? null,
      repositoryType: "git",
      reviewStatus: "none",
      lastCheckedAt: new Date(),
      organizationId: organization?.id ?? null,
      abstractText: gh.description ?? null,
      metadataJson: JSON.stringify(gh).slice(0, 200_000),
    },
    create: {
      kind: "github",
      doi: doiLike,
      title: gh.full_name,
      url: gh.html_url,
      year: gh.pushed_at ? Number(gh.pushed_at.slice(0, 4)) : null,
      licenseName: gh.license?.name ?? gh.license?.spdx_id ?? null,
      licenseUrl: gh.license?.url ?? null,
      repositoryType: "git",
      reviewStatus: "none",
      lastCheckedAt: new Date(),
      organizationId: organization?.id ?? null,
      abstractText: gh.description ?? null,
      metadataJson: JSON.stringify(gh).slice(0, 200_000),
    },
  });

  await prisma.provenanceEvent.create({
    data: {
      eventType: "imported",
      message: `Imported GitHub repository ${gh.full_name}`,
      actor: "system:ingest-github",
      sourceId: source.id,
      payloadJson: JSON.stringify({
        repo: gh.full_name,
        stars: gh.stargazers_count,
        forks: gh.forks_count,
        archived: gh.archived,
      }),
    },
  });

  console.log(`OK source=${source.id}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

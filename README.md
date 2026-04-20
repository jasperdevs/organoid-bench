# OrganoidBench

Benchmark site for brain organoid systems. Compares organoids with source-backed data and provisional track scores.

Live: https://organoidbench.com

## Stack

- Next.js (App Router) on Cloudflare Workers via OpenNext
- Prisma + Cloudflare D1
- Tailwind v4

## Develop

```
npm install
npm run dev
```

Runs on http://localhost:3000.

## Deploy

```
npm run cf:deploy
```

## Data source of truth

- Production: the remote Cloudflare D1 database bound as `DB`.
- Local `dev.db` and Miniflare state are for development only.
- Public pages and API routes read from the database only, no mock scores or placeholder rows.
- GitHub Issues are an intake queue. Accepted submissions are curated into D1 before appearing publicly.
- D1 stores metadata, provenance, and source links. Raw external data files are not stored in D1.
- Ingestion commands must say whether they target `local` or `remote`.

## Contact

jasper.mceligott@gmail.com

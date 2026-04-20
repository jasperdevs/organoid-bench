# organoid-bench

Benchmark site for brain organoids.

## Data Source of Truth

- Production source of truth: the remote Cloudflare D1 database bound as `DB`.
- Local development databases (`dev.db` and local D1/Miniflare state) are for development only.
- Public pages and API routes must read from database/API data only.
- GitHub Issues are an intake and review queue, not the production source of truth.
- Accepted issues must be curated into D1 before appearing in public registry data.
- Public pages must not use mock scientific data, placeholder benchmark rows, invented scores, or generated chart points.
- Ingestion commands must explicitly say whether they target `local` or `remote`.
- Raw external data files are not stored in D1. D1 stores metadata, provenance, source links, and remote file references only.

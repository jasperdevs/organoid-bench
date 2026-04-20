# Remote Promotion Candidate Report

Generated from local-only ingestion. Do not run remote commands until explicitly approved.

## Current Local Counts

- sources: 6
- datasets: 6
- datasetFiles: 71
- provenanceEvents: 6
- systems: 0
- benchmarkRuns: 0
- metricValues: 0
- scoreCalculations: 0

## Candidate Sources

| Source | DOI | Platform | License | Files | Bytes | Status | Provenance | Suggested status |
|---|---:|---|---|---:|---:|---|---|---|
| Goal-Directed Learning in Cortical Organoids - Experimental Data and Code | 10.5281/zenodo.17684862 | Zenodo | cc-by-4.0 | 13 | 83,466,822 | source_verified | imported | source_verified |
| Human forebrain organoids spontaneous activities spike data | 10.5281/zenodo.18298694 | Zenodo | cc-by-4.0 | 3 | 216,074,918 | source_verified | imported | source_verified |
| KCL well average data and metadata (1 of 4) | 10.18742/30394168.v1 | Figshare | CC0 | 7 | 2,132,711 | source_verified | imported | source_verified |
| KCL raw MEA data (2 of 4) | 10.18742/28669838.v1 | Figshare | CC0 | 28 | 80,637,856,785 | source_verified | imported | source_verified |
| KCL raw MEA data (3 of 4) | 10.18742/30383891.v1 | Figshare | CC0 | 18 | 51,840,166,754 | source_verified | imported | source_verified |
| KCL raw MEA data (4 of 4) | 10.18742/30393461.v1 | Figshare | CC0 | 2 | 5,760,018,502 | source_verified | imported | source_verified |

## Curator Notes

- Availability flags need review. Current ingestion sets `rawDataAvailable=true` and `metadataAvailable=true` when files exist, but leaves `processedDataAvailable=false` and `codeAvailable=false`.
- Goal-directed learning record includes Python files and source text describing processed data. A curator should review whether `codeAvailable` and `processedDataAvailable` should be set true.
- Human forebrain record includes `analysis_scripts.zip`; a curator should verify before setting `codeAvailable=true`.
- KCL Figshare articles include explicit collection-method metadata: Axion Maestro / Axis Navigator, 12.5 kHz sampling, 200-3000 Hz band-pass, `.raw` files. Do not create `RecordingSetup` until a curator maps those fields into the schema.
- KCL records describe dissociated neural/cerebral organoids, MEA recordings, and chemical LTP treatment. Do not create `OrganoidPreparation` or `StimulationProtocol` until curated.
- Organization fields are intentionally null. Creator affiliations/funders should not be converted to organizations without review.
- All imported files have `storageStatus=remote_only`.
- Generic checksums are preserved: Zenodo/Figshare MD5 values are stored as `checksumAlgorithm=md5` and `checksumValue=<value>`. `checksumSha256` remains null unless SHA-256 is available.

## Promotion Decision

- Zenodo 17684862: ready to promote as source/dataset/files/provenance only. Blocker for scoring: no curated task/run/metric mapping.
- Zenodo 18298694: ready to promote as source/dataset/files/provenance only. Blocker for structured metadata: organization/preparation/setup require curator mapping.
- Figshare 30394168: ready to promote as source/dataset/files/provenance only. It is the metadata/well-average article and should be linked conceptually with the raw articles during curation.
- Figshare 28669838: ready to promote as source/dataset/files/provenance only. Large raw files are remote-only.
- Figshare 30383891: ready to promote as source/dataset/files/provenance only. Large raw files are remote-only.
- Figshare 30393461: ready to promote as source/dataset/files/provenance only. Large raw files are remote-only.

No candidate is ready for `BenchmarkRun`, `MetricValue`, or `ScoreCalculation`.

## Do Not Run Yet: Remote Dry-Run Commands

```bash
pnpm ingest:zenodo -- --url https://zenodo.org/records/17684862 --target=remote --dry-run
pnpm ingest:zenodo -- --url https://zenodo.org/records/18298694 --target=remote --dry-run
pnpm ingest:figshare -- --article 30394168 --target=remote --dry-run
pnpm ingest:figshare -- --article 28669838 --target=remote --dry-run
pnpm ingest:figshare -- --article 30383891 --target=remote --dry-run
pnpm ingest:figshare -- --article 30393461 --target=remote --dry-run
```

## Do Not Run Yet: Remote Apply Commands

```bash
pnpm ingest:zenodo -- --url https://zenodo.org/records/17684862 --target=remote
pnpm ingest:zenodo -- --url https://zenodo.org/records/18298694 --target=remote
pnpm ingest:figshare -- --article 30394168 --target=remote
pnpm ingest:figshare -- --article 28669838 --target=remote
pnpm ingest:figshare -- --article 30383891 --target=remote
pnpm ingest:figshare -- --article 30393461 --target=remote
```

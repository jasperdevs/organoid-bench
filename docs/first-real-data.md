# First Real Data Ingestion Plan

OrganoidBench production data comes from the remote Cloudflare D1 database. The entries below are the first planned source-backed records to inspect and ingest. Do not score these records during ingestion.

Use dry-run first:

```bash
pnpm ingest:zenodo -- --url https://zenodo.org/records/17684862 --target=local --dry-run
pnpm ingest:zenodo -- --url https://zenodo.org/records/18298694 --target=local --dry-run
pnpm ingest:figshare -- --url https://kcl.figshare.com/collections/Electrophysiological_development_and_functional_plasticity_in_dissociated_human_cerebral_organoids_across_multiple_cell_lines/8097928 --target=local --dry-run
```

If Figshare collection ingestion is not supported by the current ingester, first resolve the collection into child article records, then run:

```bash
pnpm ingest:figshare -- --article <figshare-article-id> --target=local --dry-run
```

## 1. Goal-Directed Learning in Cortical Organoids

- Source type: dataset record / paper-linked dataset
- URL: https://zenodo.org/records/17684862
- Initial registry status: `source_verified` after source metadata resolves; `data_ingested` only after file metadata is listed.
- Use for: `Source`, `Dataset`, `DatasetFile`, possible `System` skeleton after curator review.
- Do not score yet.

Expected inserts:
- `Source`: Zenodo record metadata, DOI or Zenodo fallback identifier, title, URL, authors if present, license if present, `lastCheckedAt`.
- `Dataset`: linked to `Source`, access/license/availability fields from the record, `dataUrl`, external record ID.
- `DatasetFile`: one row per remote file with filename/path, remote URL, format, size/checksum when available, `storageStatus = remote_only`.
- `Organization`: only if the source metadata clearly identifies one.
- `OrganoidPreparation`: only if the source metadata explicitly states preparation details.
- `RecordingSetup`: only if platform/channel/rate/sorter metadata is explicit.
- `StimulationProtocol`: only if applicable and explicitly described.
- `ProvenanceEvent`: import event linking the source and dataset.

Fields that may remain null:
- organization, modality, organoid preparation, recording setup, stimulation protocol, sample counts, task, run metadata, metrics.

Do not infer:
- benchmark scores, metric values, sample counts, lab identity, controls, preparation details, recording setup, or task mapping unless source metadata explicitly supports them.

## 2. KCL Electrophysiological Development and Functional Plasticity Collection

- Source type: Figshare collection / dataset records
- Collection URL: https://kcl.figshare.com/collections/Electrophysiological_development_and_functional_plasticity_in_dissociated_human_cerebral_organoids_across_multiple_cell_lines/8097928
- Initial registry status: `source_verified` after source metadata resolves; `data_ingested` only after child record file metadata is listed.
- Use for: `Source`, `Dataset`, `DatasetFile`, organoid preparation metadata, recording setup metadata if available.
- Do not score yet.

Expected inserts:
- `Source`: Figshare collection or child article metadata, URL, DOI when available, authors if present, license if present, `lastCheckedAt`.
- `Dataset`: one dataset per collection or child article, depending on how Figshare exposes records.
- `DatasetFile`: remote file metadata only, with `storageStatus = remote_only`.
- `Organization`: only if clearly identified in metadata.
- `OrganoidPreparation`: only for explicit cell line, organoid type, region, age, or protocol fields.
- `RecordingSetup`: only for explicit platform/channel/rate/sorter fields.
- `StimulationProtocol`: only if explicitly applicable.
- `ProvenanceEvent`: import event for each source/dataset.

Current limitation:
- The current `ingest:figshare` command is designed for article records. Collection URL support must be confirmed. If the collection API does not return child files in the same shape, resolve child article IDs first and ingest those individually.

Fields that may remain null:
- sample counts, controls, benchmark task, benchmark run, metric values, scores, stimulation protocol.

Do not infer:
- whether plasticity metrics pass, whether controls are sufficient, score values, or cross-lab reproducibility.

## 3. Human Forebrain Organoids Spontaneous Activities Spike Data

- Source type: Zenodo dataset
- URL: https://zenodo.org/records/18298694
- Initial registry status: `source_verified` after source metadata resolves; `data_ingested` only after file metadata is listed.
- Use for: `Source`, `Dataset`, `DatasetFile`, recording setup metadata if available.
- Do not score yet.

Expected inserts:
- `Source`: Zenodo record metadata, DOI or Zenodo fallback identifier, title, URL, authors if present, license if present, `lastCheckedAt`.
- `Dataset`: linked to `Source`, external record ID, availability fields from record metadata.
- `DatasetFile`: remote file metadata only, with `storageStatus = remote_only`.
- `Organization`: only if clearly identified.
- `RecordingSetup`: only if metadata explicitly states recording platform, channel count, sampling rate, or sorter.
- `OrganoidPreparation`: only if preparation metadata is explicit.
- `StimulationProtocol`: likely null unless source metadata states stimulation.
- `ProvenanceEvent`: import event linking source and dataset.

Fields that may remain null:
- task, benchmark run, sample counts, controls, metric values, score calculations.

Do not infer:
- system identity, benchmark run status, controls, metrics, or scores from dataset title alone.

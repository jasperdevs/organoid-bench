# Source and Score Refresh

Remote source records can change. Refresh is intentionally separate from scoring.

## Source refresh

Planned command:

```bash
pnpm sources:refresh -- --target=local --dry-run
```

Behavior:

- Re-check source metadata from Zenodo/Figshare.
- Compare modified time, file count, file sizes, and checksums.
- If unchanged, do nothing.
- If changed, record a provenance event and mark affected scores for recompute.

## Score refresh

Planned command:

```bash
pnpm scores:refresh -- --target=local --dry-run
```

Behavior:

- Recompute only when explicitly invoked.
- Do not silently overwrite existing scores.
- Refuse to compute when required files are missing or checksums fail.


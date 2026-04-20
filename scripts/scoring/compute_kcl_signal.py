import json
import pandas as pd

from common import db, parse_args, now, stable_id, ensure_methodology, get_track, ensure_task, get_metric, source_dataset, dataset_file, download_file, file_payload, bootstrap_ci

args = parse_args()
conn = db()
source_id, dataset_id = source_dataset(conn, "10.18742/30394168.v1")
csv_row = dataset_file(conn, "30394168", "Well_averages_developmenttimecourse_withNAP.csv")
csv_path = download_file(csv_row)
df = pd.read_csv(csv_path)
ratios = df["percent_active_electrodes"].dropna().to_numpy(dtype=float) / 100.0
ratio = float(ratios.mean())
ratio_ci = bootstrap_ci(ratios)
payload = {
    "activeChannelRatioMean": ratio,
    "activeChannelRatioMedian": float(pd.Series(ratios).median()),
    "activeChannelRatioStd": float(pd.Series(ratios).std()),
    "activeChannelRatioCi95": ratio_ci,
    "meanFiringRateHz": float(df["Mean Firing Rate (Hz)"].mean()),
    "meanNetworkBurstFrequency": float(df["Network Burst Frequency"].dropna().mean()),
    "nWells": int(len(df)),
    "nCellLines": int(df["cell_line"].nunique()),
    "nBatches": int(df["batch"].nunique()),
    "cellLineSummary": df.groupby("cell_line")["percent_active_electrodes"].mean().div(100).to_dict(),
    "batchSummary": df.groupby("batch")["percent_active_electrodes"].mean().div(100).to_dict(),
    "inputFiles": [file_payload(csv_row, csv_path)],
    "scriptName": "scripts/scoring/compute_kcl_signal.py",
    "methodologyVersion": "0.1",
    "caveat": "Active electrode coverage only; not a broad biological quality score.",
}
print(json.dumps(payload, indent=2))
if args.dry_run:
    raise SystemExit(0)

ts = now()
method_id = ensure_methodology(conn)
track_id = get_track(conn, "signal-quality")
task_id = ensure_task(conn, "mea-development-recording", "MEA development recording", track_id, "Longitudinal MEA recording summary.")
system_id = stable_id("system", "kcl-dissociated-cerebral-organoid-mea")
run_id = stable_id("run", "kcl-dissociated-cerebral-organoid-mea-signal-v0.1")
metric_id = get_metric(conn, "active_channel_ratio")
mv_id = stable_id("metric", run_id + ":active_channel_ratio")
sc_id = stable_id("score", run_id + ":signal:v0.1")
prov_id = stable_id("prov", run_id + ":compute-kcl-signal")
score = max(0.0, min(100.0, ratio * 100.0))
with conn:
    conn.execute("INSERT OR IGNORE INTO System (id, slug, name, sourceId, datasetId, verificationStatus, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 'source_verified', ?, ?)", (system_id, "kcl-dissociated-cerebral-organoid-mea", "KCL dissociated cerebral organoid MEA system", source_id, dataset_id, ts, ts))
    conn.execute("INSERT OR REPLACE INTO BenchmarkRun (id, systemId, trackId, taskId, methodologyVersionId, nBatches, runStatus, dataCompletenessScore, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 'provisional', ?, ?, ?, ?)", (run_id, system_id, track_id, task_id, method_id, payload["nBatches"], 1.0, "Computed locally from Figshare 30394168 well-average data", ts, ts))
    conn.execute("INSERT OR REPLACE INTO MetricValue (id, benchmarkRunId, metricId, value, ciLow, ciHigh, ciMethod, derivationMethod, sourceId, codeVersion, derivationNotes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 'bootstrap', 'computed', ?, 'scripts/scoring/compute_kcl_signal.py', ?, ?, ?)", (mv_id, run_id, metric_id, ratio, ratio_ci["low"], ratio_ci["high"], source_id, json.dumps(payload), ts, ts))
    conn.execute("INSERT OR REPLACE INTO ScoreCalculation (id, benchmarkRunId, methodologyVersionId, scoreType, score, confidenceGrade, calculationJson, createdAt, updatedAt) VALUES (?, ?, ?, 'signal', ?, 'C', ?, ?, ?)", (sc_id, run_id, method_id, score, json.dumps(payload), ts, ts))
    conn.execute("INSERT OR REPLACE INTO ProvenanceEvent (id, eventType, message, actor, sourceId, systemId, datasetId, benchmarkRunId, payloadJson, createdAt) VALUES (?, 'scored', 'Computed active electrode coverage from public dataset', 'system:compute-kcl-signal', ?, ?, ?, ?, ?, ?)", (prov_id, source_id, system_id, dataset_id, run_id, json.dumps({**payload, "computedAt": ts, "dryRun": False}), ts))

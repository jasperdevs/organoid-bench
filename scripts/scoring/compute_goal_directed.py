import json
import pickle
import pandas as pd
import numpy as np

from common import db, parse_args, now, stable_id, ensure_methodology, get_track, ensure_task, get_metric, source_dataset, dataset_file, download_file, file_payload, bootstrap_ci

args = parse_args()
conn = db()
source_id, dataset_id = source_dataset(conn, "10.5281/zenodo.17684862")
pkl_row = dataset_file(conn, "17684862", "aggregated_experiment_data.pkl")
pkl = download_file(pkl_row)
with pkl.open("rb") as fh:
    data = pickle.load(fh)
rows = []
for exp_id, exp in data.items():
    meta = exp.get("metadata", {})
    for run in exp.get("cartpole", {}).get("runs", []) or []:
        if run.get("top_decile") is not None:
            rows.append({"exp_id": exp_id, "organoid": meta.get("organoid"), "batch": meta.get("batch"), "exp_type": run.get("exp_type"), "top_decile": float(run.get("top_decile"))})
df = pd.DataFrame(rows)
pivot = df.pivot_table(index="exp_id", columns="exp_type", values="top_decile", aggfunc="mean")
valid = pivot[pivot["rl"].notna() & (pivot.get("random").notna() | pivot.get("none").notna())].copy()
valid["best_control"] = valid[["random", "none"]].max(axis=1)
valid["gain"] = valid["rl"] - valid["best_control"]
mean_rl = float(valid["rl"].mean())
mean_control = float(valid["best_control"].mean())
gain = float(valid["gain"].mean())
score = max(0.0, min(100.0, 100.0 * gain / max(mean_rl, 1e-9)))
gain_ci = bootstrap_ci(valid["gain"].to_numpy())
score_ci = bootstrap_ci(valid["gain"].to_numpy(), stat_fn=lambda x: max(0.0, min(100.0, 100.0 * float(np.mean(x)) / max(mean_rl, 1e-9))))
input_file = file_payload(pkl_row, pkl)
payload = {
    "meanRlTopDecile": mean_rl,
    "meanBestControlTopDecile": mean_control,
    "meanGain": gain,
    "gainCi95": gain_ci,
    "score": score,
    "scoreCi95": score_ci,
    "nExperiments": len(valid),
    "nRuns": len(df),
    "nOrganoids": int(df["organoid"].nunique()),
    "inputFiles": [input_file],
    "scriptName": "scripts/scoring/compute_goal_directed.py",
    "methodologyVersion": "0.1",
}
print(json.dumps(payload, indent=2))
if args.dry_run:
    raise SystemExit(0)

ts = now()
method_id = ensure_methodology(conn)
track_id = get_track(conn, "closed-loop-learning")
task_id = ensure_task(conn, "closed-loop-cartpole", "Closed-loop cart-pole", track_id, "Cart-pole control task with closed-loop stimulation.")
system_id = stable_id("system", "robbins-cortical-organoid-cartpole")
run_id = stable_id("run", "robbins-cortical-organoid-cartpole-v0.1")
metric_id = get_metric(conn, "terminal_performance_delta")
mv_id = stable_id("metric", run_id + ":terminal_performance_delta")
sc_id = stable_id("score", run_id + ":learning:v0.1")
prov_id = stable_id("prov", run_id + ":compute-goal-directed")
with conn:
    conn.execute("INSERT OR IGNORE INTO System (id, slug, name, sourceId, datasetId, verificationStatus, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 'source_verified', ?, ?)", (system_id, "robbins-cortical-organoid-cartpole", "Robbins et al. cortical organoid cart-pole closed-loop system", source_id, dataset_id, ts, ts))
    conn.execute("INSERT OR REPLACE INTO BenchmarkRun (id, systemId, trackId, taskId, methodologyVersionId, nOrganoids, nSessions, runStatus, dataCompletenessScore, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, 'provisional', ?, ?, ?, ?)", (run_id, system_id, track_id, task_id, method_id, payload["nOrganoids"], payload["nRuns"], 1.0, "Computed locally from Zenodo 17684862 aggregated_experiment_data.pkl", ts, ts))
    conn.execute("INSERT OR REPLACE INTO MetricValue (id, benchmarkRunId, metricId, value, ciLow, ciHigh, ciMethod, derivationMethod, sourceId, codeVersion, derivationNotes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 'bootstrap', 'computed', ?, 'scripts/scoring/compute_goal_directed.py', ?, ?, ?)", (mv_id, run_id, metric_id, gain, gain_ci["low"], gain_ci["high"], source_id, json.dumps(payload), ts, ts))
    conn.execute("INSERT OR REPLACE INTO ScoreCalculation (id, benchmarkRunId, methodologyVersionId, scoreType, score, confidenceGrade, calculationJson, createdAt, updatedAt) VALUES (?, ?, ?, 'learning', ?, 'B', ?, ?, ?)", (sc_id, run_id, method_id, score, json.dumps(payload), ts, ts))
    conn.execute("INSERT OR REPLACE INTO ProvenanceEvent (id, eventType, message, actor, sourceId, systemId, datasetId, benchmarkRunId, payloadJson, createdAt) VALUES (?, 'scored', 'Computed provisional closed-loop learning score from public dataset', 'system:compute-goal-directed', ?, ?, ?, ?, ?, ?)", (prov_id, source_id, system_id, dataset_id, run_id, json.dumps({**payload, "computedAt": ts, "dryRun": False}), ts))

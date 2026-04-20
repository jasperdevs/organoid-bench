import json
import pickle
import pandas as pd

from common import ROOT, db, dataset_file, download_file

OUT = ROOT / "docs" / "scoring-inspections"
OUT.mkdir(parents=True, exist_ok=True)

conn = db()
files = {
    "aggregated_experiment_data.pkl": download_file(dataset_file(conn, "17684862", "aggregated_experiment_data.pkl")),
    "README_data_structure.md": download_file(dataset_file(conn, "17684862", "README_data_structure.md")),
    "data_access_example.py": download_file(dataset_file(conn, "17684862", "data_access_example.py")),
}

with files["aggregated_experiment_data.pkl"].open("rb") as fh:
    data = pickle.load(fh)

rows = []
for exp_id, exp in data.items():
    meta = exp.get("metadata", {})
    for run in exp.get("cartpole", {}).get("runs", []) or []:
        if run.get("top_decile") is not None:
            rows.append(
                {
                    "exp_id": exp_id,
                    "organoid": meta.get("organoid"),
                    "batch": meta.get("batch"),
                    "paradigm": meta.get("paradigm"),
                    "exp_type": run.get("exp_type"),
                    "top_decile": float(run.get("top_decile")),
                }
            )

df = pd.DataFrame(rows)
pivot = df.pivot_table(index="exp_id", columns="exp_type", values="top_decile", aggfunc="mean")
valid = pivot[pivot["rl"].notna() & (pivot.get("random").notna() | pivot.get("none").notna())].copy()
valid["best_control"] = valid[["random", "none"]].max(axis=1)
valid["gain"] = valid["rl"] - valid["best_control"]

summary = {
    "files": {k: str(v.relative_to(ROOT)) for k, v in files.items()},
    "experiments": len(data),
    "cartpoleRuns": len(df),
    "organoids": int(df["organoid"].nunique()),
    "expTypes": sorted(df["exp_type"].dropna().unique().tolist()),
    "pairedRlControlExperiments": len(valid),
    "meanTopDecileByType": df.groupby("exp_type")["top_decile"].mean().to_dict(),
    "meanRlMinusBestControl": float(valid["gain"].mean()),
    "medianRlMinusBestControl": float(valid["gain"].median()),
}

(OUT / "zenodo-17684862.md").write_text(
    "# Zenodo 17684862 Inspection\n\n"
    "Files inspected: `aggregated_experiment_data.pkl`, `README_data_structure.md`, `data_access_example.py`.\n\n"
    f"```json\n{json.dumps(summary, indent=2)}\n```\n\n"
    "Scorable: closed-loop learning using cartpole `top_decile` for `rl`, `random`, and `none` runs.\n\n"
    "Not scored here: retention and biological quality. Retention is not explicit in this inspection output.\n",
    encoding="utf-8",
)
print(json.dumps(summary, indent=2))


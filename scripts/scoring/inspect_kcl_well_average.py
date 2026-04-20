import json
import pandas as pd

from common import ROOT, db, dataset_file, download_file

OUT = ROOT / "docs" / "scoring-inspections"
OUT.mkdir(parents=True, exist_ok=True)

conn = db()
needed = [
    "metadata.csv",
    "Well_averages_developmenttimecourse_withNAP.csv",
    "Well_averages_chLTP.csv",
    "Well_averages_chLTP_withNAP.csv",
]
files = {name: download_file(dataset_file(conn, "30394168", name)) for name in needed}

summaries = {}
for name, path in files.items():
    df = pd.read_csv(path)
    summaries[name] = {
        "rows": len(df),
        "columns": list(df.columns),
        "cellLines": sorted(df["cell_line"].dropna().unique().tolist()) if "cell_line" in df.columns else [],
        "batches": sorted([int(x) for x in df["batch"].dropna().unique().tolist()]) if "batch" in df.columns else [],
    }

dev = pd.read_csv(files["Well_averages_developmenttimecourse_withNAP.csv"])
metrics = {
    "meanFiringRateHz": float(dev["Mean Firing Rate (Hz)"].mean()),
    "meanActiveElectrodes": float(dev["Number of Active Electrodes"].mean()),
    "meanPercentActiveElectrodes": float(dev["percent_active_electrodes"].mean()),
    "meanNetworkBurstFrequency": float(dev["Network Burst Frequency"].dropna().mean()),
    "rows": len(dev),
    "cellLines": int(dev["cell_line"].nunique()),
    "batches": int(dev["batch"].nunique()),
}

summary = {"files": {k: str(v.relative_to(ROOT)) for k, v in files.items()}, "tables": summaries, "signalMetrics": metrics}
(OUT / "figshare-30394168.md").write_text(
    "# Figshare 30394168 Inspection\n\n"
    "Files inspected: metadata and well-average CSVs. Raw MEA files were not downloaded.\n\n"
    f"```json\n{json.dumps(summary, indent=2)}\n```\n\n"
    "Scorable: provisional signal-quality metrics from well-average tables.\n\n"
    "Potentially scorable after review: plasticity from chLTP pre/post tables.\n",
    encoding="utf-8",
)
print(json.dumps(summary, indent=2))


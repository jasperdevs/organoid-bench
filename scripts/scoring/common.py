import argparse
import datetime as dt
import hashlib
import json
import pathlib
import sqlite3
import urllib.request
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parents[2]
CACHE = ROOT / ".data-cache"
DB = ROOT / "dev.db"


def now():
    return dt.datetime.now(dt.UTC).isoformat()


def stable_id(prefix, value):
    digest = hashlib.sha1(value.encode("utf-8")).hexdigest()[:12]
    safe = "".join(ch.lower() if ch.isalnum() else "_" for ch in value)[:60].strip("_")
    return f"{prefix}_{safe}_{digest}"


def db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--target", default="local", choices=["local"])
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def download_file(row):
    dataset_dir = CACHE / str(row["externalId"])
    dataset_dir.mkdir(parents=True, exist_ok=True)
    out = dataset_dir / row["path"].replace("/", "_").replace("\\", "_")
    if not out.exists() or out.stat().st_size != row["sizeBytes"]:
        urllib.request.urlretrieve(row["url"], out)
    if row["checksumAlgorithm"] and row["checksumValue"]:
        h = hashlib.new(row["checksumAlgorithm"])
        with out.open("rb") as fh:
            for chunk in iter(lambda: fh.read(1024 * 1024), b""):
                h.update(chunk)
        if h.hexdigest().lower() != row["checksumValue"].lower():
            raise RuntimeError(f"Checksum mismatch for {out}")
    return out


def file_payload(row, path):
    return {
        "datasetFileId": row["id"],
        "name": row["path"],
        "path": str(path.relative_to(ROOT)),
        "sizeBytes": row["sizeBytes"],
        "checksumAlgorithm": row["checksumAlgorithm"],
        "checksumValue": row["checksumValue"],
        "storageStatus": row["storageStatus"],
    }


def bootstrap_ci(values, stat_fn=None, iterations=5000, seed=12345):
    arr = np.asarray(values, dtype=float)
    arr = arr[np.isfinite(arr)]
    if arr.size < 2:
        return None
    rng = np.random.default_rng(seed)
    stat_fn = stat_fn or (lambda x: float(np.mean(x)))
    stats = np.empty(iterations)
    for i in range(iterations):
        sample = rng.choice(arr, size=arr.size, replace=True)
        stats[i] = stat_fn(sample)
    return {
        "low": float(np.percentile(stats, 2.5)),
        "high": float(np.percentile(stats, 97.5)),
        "iterations": iterations,
        "n": int(arr.size),
    }


def dataset_file(conn, external_id, path):
    row = conn.execute(
        """
        SELECT Dataset.id datasetId, Dataset.externalId, Dataset.sourceId, DatasetFile.*
        FROM Dataset
        JOIN DatasetFile ON DatasetFile.datasetId = Dataset.id
        WHERE Dataset.externalId = ? AND DatasetFile.path = ?
        """,
        (external_id, path),
    ).fetchone()
    if not row:
        raise RuntimeError(f"Missing file {external_id}/{path}")
    return row


def ensure_methodology(conn):
    row = conn.execute("SELECT id FROM MethodologyVersion WHERE version='0.1'").fetchone()
    if row:
        return row["id"]
    mid = stable_id("methodology", "0.1")
    ts = now()
    conn.execute(
        """
        INSERT INTO MethodologyVersion
        (id, version, releasedAt, summary, changelog, formulaJson, isCurrent, createdAt, updatedAt)
        VALUES (?, '0.1', ?, ?, ?, ?, 0, ?, ?)
        """,
        (
            mid,
            ts,
            "Initial provisional scoring methodology for source-backed local computation.",
            "Adds local provisional scoring for closed-loop learning and signal-quality metrics.",
            json.dumps({"composite": {"enabled": False}}),
            ts,
            ts,
        ),
    )
    return mid


def get_track(conn, slug):
    row = conn.execute("SELECT id FROM BenchmarkTrack WHERE slug=?", (slug,)).fetchone()
    if not row:
        raise RuntimeError(f"Missing track {slug}")
    return row["id"]


def ensure_task(conn, slug, name, track_id, description):
    row = conn.execute("SELECT id FROM Task WHERE slug=?", (slug,)).fetchone()
    if row:
        return row["id"]
    tid = stable_id("task", slug)
    ts = now()
    conn.execute(
        "INSERT INTO Task (id, slug, name, description, trackId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (tid, slug, name, description, track_id, ts, ts),
    )
    return tid


def get_metric(conn, slug):
    row = conn.execute("SELECT id FROM Metric WHERE slug=?", (slug,)).fetchone()
    if not row:
        raise RuntimeError(f"Missing metric {slug}")
    return row["id"]


def source_dataset(conn, doi):
    row = conn.execute(
        """
        SELECT Source.id sourceId, Dataset.id datasetId
        FROM Source JOIN Dataset ON Dataset.sourceId = Source.id
        WHERE Source.doi = ?
        ORDER BY Dataset.updatedAt DESC
        LIMIT 1
        """,
        (doi,),
    ).fetchone()
    if not row:
        raise RuntimeError(f"Missing source/dataset for {doi}")
    return row["sourceId"], row["datasetId"]

import Link from "next/link";
import { PageHeader, Section } from "@/components/ui/section";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const toc = [
  { id: "getting-started", label: "1. getting started" },
  { id: "data-schema", label: "2. data schema" },
  { id: "submission-format", label: "3. submission format" },
  { id: "metric-calculation", label: "4. metric calculation" },
  { id: "api", label: "5. api" },
  { id: "csv", label: "6. csv export" },
  { id: "python", label: "7. python scoring package" },
  { id: "example", label: "8. example submission" },
  { id: "validation", label: "9. validation rules" },
  { id: "changelog", label: "10. changelog" },
];

const schemaExample = `{
  "system_name": "",
  "source": "",
  "benchmark_track": "",
  "task": "",
  "organoid": {
    "type": "",
    "species_or_source": "",
    "age_days": null,
    "cell_line": "",
    "batch_id": ""
  },
  "recording": {
    "modality": "",
    "platform": "",
    "electrode_count": null,
    "sampling_rate_hz": null,
    "duration_seconds": null
  },
  "stimulation": {
    "method": "",
    "parameters": "",
    "protocol": ""
  },
  "closed_loop": {
    "decoder": "",
    "controller": "",
    "task_environment": "",
    "feedback_type": ""
  },
  "sample_size": {
    "n_organoids": null,
    "n_sessions": null,
    "n_batches": null,
    "n_labs": null
  },
  "controls": {
    "random_feedback": false,
    "sham_stimulation": false,
    "null_stimulation": false,
    "frozen_decoder": false,
    "decoder_only": false,
    "replication": false
  },
  "data": {
    "raw_data_url": "",
    "processed_data_url": "",
    "code_url": "",
    "paper_url": "",
    "license": ""
  },
  "metrics": {
    "signal_score": null,
    "response_score": null,
    "plasticity_score": null,
    "learning_score": null,
    "retention_score": null,
    "reproducibility_confidence": null
  }
}`;

export default function DocsPage() {
  return (
    <>
      <PageHeader
        eyebrow="docs"
        title="developer & lab documentation"
        description="Everything needed to submit, reproduce, and consume OrganoidBench data programmatically."
        right={
          <div className="flex gap-2">
            <Button href="#api" size="sm" variant="outline">api</Button>
            <Button href="#submission-format" size="sm" variant="primary">json schema</Button>
          </div>
        }
      />

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-2">
              contents
            </div>
            <ul className="space-y-1 text-sm">
              {toc.map((t) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    className="text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
                  >
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <div className="space-y-10">
            <section id="getting-started">
              <h2 className="text-xl font-semibold mb-3">1. getting started</h2>
              <Card>
                <ol className="list-decimal pl-5 space-y-2 text-sm">
                  <li>
                    Read the <Link href="/methodology" className="underline underline-offset-2">methodology</Link> for scoring principles and required controls.
                  </li>
                  <li>
                    Export your data in the <Link href="#submission-format" className="underline underline-offset-2">submission format</Link>.
                  </li>
                  <li>
                    Validate locally with the{" "}
                    <Link href="#python" className="underline underline-offset-2">
                      python scoring package
                    </Link>
                    .
                  </li>
                  <li>
                    <Link href="/submit" className="underline underline-offset-2">submit</Link> the entry for review.
                  </li>
                </ol>
              </Card>
            </section>

            <section id="data-schema">
              <h2 className="text-xl font-semibold mb-3">2. data schema</h2>
              <p className="text-sm text-[color:var(--foreground-muted)] mb-3">
                OrganoidBench does not mandate a specific raw-data format, but requires a canonical metadata schema. Prefer NWB for raw traces and parquet for processed events.
              </p>
              <Card padded={false}>
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-[color:var(--foreground-muted)] bg-[color:var(--surface-alt)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">artifact</th>
                      <th className="px-4 py-3 font-medium">preferred format</th>
                      <th className="px-4 py-3 font-medium">required fields</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--border)]">
                    <Row a="raw traces" f=".nwb" r="sampling_rate_hz, electrode_layout, channel_ids" />
                    <Row a="spike events" f=".parquet" r="channel_id, timestamp, amplitude" />
                    <Row a="task trajectories" f=".parquet" r="session_id, trial_id, t, state, action, reward" />
                    <Row a="session metadata" f=".json" r="schema_version, organoid_id, batch_id, protocol_version" />
                  </tbody>
                </table>
              </Card>
            </section>

            <section id="submission-format">
              <h2 className="text-xl font-semibold mb-3">3. submission format</h2>
              <p className="text-sm text-[color:var(--foreground-muted)] mb-3">
                Canonical JSON schema for a benchmark entry. All fields are
                required unless marked nullable. Missing fields yield Unscored.
              </p>
              <Card>
                <pre className="font-mono text-xs whitespace-pre bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)] overflow-x-auto">
{schemaExample}
                </pre>
              </Card>
            </section>

            <section id="metric-calculation">
              <h2 className="text-xl font-semibold mb-3">4. metric calculation</h2>
              <Card>
                <p className="text-sm">
                  Metrics are computed from processed events plus task
                  trajectories. The reference implementation is the open Python
                  package:
                </p>
                <pre className="mt-3 font-mono text-xs bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)]">
{`pip install organoidbench

from organoidbench import score

result = score.from_nwb("session.nwb", track="closed-loop-learning")
print(result.learning_gain, result.reproducibility_confidence)`}
                </pre>
              </Card>
            </section>

            <section id="api">
              <h2 className="text-xl font-semibold mb-3">5. api</h2>
              <Card>
                <p className="text-sm text-[color:var(--foreground-muted)]">
                  Public read-only JSON API. Rate-limited and cached. Write
                  access is only via the submission flow.
                </p>
                <pre className="mt-3 font-mono text-xs bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)]">
{`GET  /api/v1/systems
GET  /api/v1/systems/{id}
GET  /api/v1/datasets
GET  /api/v1/datasets/{id}
GET  /api/v1/leaderboard?track={track}
GET  /api/v1/tracks/{id}
GET  /api/v1/tasks/{id}
GET  /api/v1/labs/{id}

# all endpoints support:
#   ?version=v1.3.0   (methodology pin)
#   ?format=json|csv
#   ?since=YYYY-MM-DD`}
                </pre>
              </Card>
            </section>

            <section id="csv">
              <h2 className="text-xl font-semibold mb-3">6. csv export</h2>
              <Card>
                <p className="text-sm">
                  The full leaderboard can be downloaded as CSV. Column names
                  match the JSON schema; confidence grades are exported as a
                  separate column.
                </p>
                <pre className="mt-3 font-mono text-xs bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)]">
{`GET /api/v1/leaderboard.csv?track=all&version=v1.3.0`}
                </pre>
              </Card>
            </section>

            <section id="python">
              <h2 className="text-xl font-semibold mb-3">7. python scoring package</h2>
              <Card>
                <pre className="font-mono text-xs bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)]">
{`from organoidbench import submit

entry = submit.load("my_entry.json")
report = submit.validate(entry)

if report.ok:
    submit.dryrun(entry)  # compute metrics locally
    submit.push(entry, token="...")
else:
    for issue in report.issues:
        print(issue.field, issue.message)`}
                </pre>
              </Card>
            </section>

            <section id="example">
              <h2 className="text-xl font-semibold mb-3">8. example submission</h2>
              <Card>
                <pre className="font-mono text-xs whitespace-pre bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)] overflow-x-auto">
{`{
  "system_name": "DishBrain v2.1 — Pong",
  "source": "kagan-lab",
  "benchmark_track": "closed-loop-learning",
  "task": "pong-style",
  "organoid": { "type": "cortical", "species_or_source": "human",
                "age_days": 92, "cell_line": "H1", "batch_id": "B-2024-07" },
  "sample_size": { "n_organoids": 38, "n_sessions": 176,
                   "n_batches": 6, "n_labs": 2 },
  "controls": { "random_feedback": true, "sham_stimulation": true,
                "null_stimulation": true, "frozen_decoder": true,
                "decoder_only": true, "replication": true },
  "data": { "raw_data_url": "https://example/raw",
            "processed_data_url": "https://example/proc",
            "code_url": "https://github.com/example/dishbrain",
            "paper_url": "https://doi.org/example",
            "license": "CC-BY-4.0" }
}`}
                </pre>
              </Card>
            </section>

            <section id="validation">
              <h2 className="text-xl font-semibold mb-3">9. validation rules</h2>
              <Card>
                <ul className="text-sm space-y-2 list-disc pl-5">
                  <li>missing <code className="font-mono">sampling_rate_hz</code> → Unscored</li>
                  <li>missing <code className="font-mono">n_organoids</code> or <code className="font-mono">n_sessions</code> → Unscored</li>
                  <li>for closed-loop tracks, missing <code className="font-mono">random_feedback</code> control → grade capped at C</li>
                  <li>entries without a limitations statement are rejected at submit</li>
                  <li>entries with <code className="font-mono">peer_reviewed</code> claim must include doi</li>
                </ul>
              </Card>
            </section>

            <section id="changelog">
              <h2 className="text-xl font-semibold mb-3">10. changelog</h2>
              <Card padded={false}>
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-[color:var(--foreground-muted)] bg-[color:var(--surface-alt)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">version</th>
                      <th className="px-4 py-3 font-medium">date</th>
                      <th className="px-4 py-3 font-medium">change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--border)]">
                    <DocRow v="api v1.4" d="2026-04-10" c="adds /api/v1/leaderboard.csv export" />
                    <DocRow v="schema v1.3" d="2026-03-20" c="adds decoder_only field to controls" />
                    <DocRow v="api v1.3" d="2025-11-02" c="adds confidence grade field in responses" />
                    <DocRow v="schema v1.0" d="2025-01-10" c="initial public schema" />
                  </tbody>
                </table>
              </Card>
            </section>
          </div>
        </div>
      </Section>
    </>
  );
}

function Row({ a, f, r }: { a: string; f: string; r: string }) {
  return (
    <tr>
      <td className="px-4 py-3">{a}</td>
      <td className="px-4 py-3 font-mono text-xs">{f}</td>
      <td className="px-4 py-3 font-mono text-xs text-[color:var(--foreground-muted)]">{r}</td>
    </tr>
  );
}

function DocRow({ v, d, c }: { v: string; d: string; c: string }) {
  return (
    <tr>
      <td className="px-4 py-3 font-mono text-xs">{v}</td>
      <td className="px-4 py-3 font-mono text-xs text-[color:var(--foreground-muted)]">{d}</td>
      <td className="px-4 py-3 text-sm">{c}</td>
    </tr>
  );
}

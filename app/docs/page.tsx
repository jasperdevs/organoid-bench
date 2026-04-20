import Link from "next/link";
import { Container, PageHeader, Section } from "@/components/ui/section";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const ENDPOINTS: Array<{ method: string; path: string; note: string }> = [
  { method: "GET", path: "/api/v1/health", note: "Registry counts and current methodology version." },
  { method: "GET", path: "/api/v1/leaderboard", note: "Flattened leaderboard rows. Query: track, organization, status, runStatus, limit." },
  { method: "GET", path: "/api/v1/leaderboard/facets", note: "Facet values for filters (tracks, tasks, orgs, modalities, access, review statuses)." },
  { method: "GET", path: "/api/v1/leaderboard/export.csv", note: "Same rows as /leaderboard, returned as CSV." },
  { method: "GET", path: "/api/v1/systems", note: "All registered systems." },
  { method: "GET", path: "/api/v1/systems/{id_or_slug}", note: "One system with source, dataset, setup, and runs." },
  { method: "GET", path: "/api/v1/systems/{id}/runs", note: "Benchmark runs for a system." },
  { method: "GET", path: "/api/v1/systems/{id}/metrics", note: "Per-run metric values, derivations, and citations." },
  { method: "GET", path: "/api/v1/systems/{id}/provenance", note: "Provenance event log for a system." },
  { method: "GET", path: "/api/v1/datasets", note: "All ingested datasets." },
  { method: "GET", path: "/api/v1/datasets/{id_or_slug}", note: "One dataset with files, license, and source." },
  { method: "GET", path: "/api/v1/datasets/{id}/files", note: "File listing for a dataset." },
  { method: "GET", path: "/api/v1/datasets/{id}/linked-systems", note: "Systems that reference this dataset." },
  { method: "GET", path: "/api/v1/sources", note: "All ingested sources (papers, preprints, data records)." },
  { method: "GET", path: "/api/v1/sources/{id_or_doi}", note: "One source with linked datasets and systems." },
  { method: "GET", path: "/api/v1/organizations", note: "Labs and consortia with artifact counts." },
  { method: "GET", path: "/api/v1/organizations/{id}", note: "One organization with full artifact list." },
  { method: "GET", path: "/api/v1/tracks", note: "Benchmark tracks with metric definitions." },
  { method: "GET", path: "/api/v1/tracks/{slug}", note: "One track with metrics, tasks, and scoring formula." },
  { method: "GET", path: "/api/v1/tracks/{slug}/leaderboard", note: "Leaderboard filtered to one track." },
  { method: "GET", path: "/api/v1/tasks", note: "All tasks across all tracks." },
  { method: "GET", path: "/api/v1/tasks/{slug}", note: "One task with its registered systems and runs." },
  { method: "GET", path: "/api/v1/methodology/current", note: "Current scoring methodology version." },
  { method: "GET", path: "/api/v1/methodology/{version}", note: "A specific methodology version." },
  { method: "POST", path: "/api/v1/submissions", note: "Submit a system, dataset, or result for review." },
  { method: "POST", path: "/api/v1/corrections", note: "File a correction or dispute against an existing record." },
];

const SYSTEM_SHAPE = `{
  "id": "",
  "slug": "",
  "name": "",
  "source_id": "",
  "dataset_id": "",
  "organization_id": "",
  "task_id": "",
  "verification_status": "unscored",
  "organoid_preparation_id": null,
  "recording_setup_id": null,
  "stimulation_protocol_id": null,
  "limitations": null,
  "runs": [],
  "provenance": [],
  "created_at": "",
  "updated_at": ""
}`;

const RUN_SHAPE = `{
  "id": "",
  "system_id": "",
  "track_id": "",
  "task_id": "",
  "methodology_version_id": "",
  "run_status": "unscored",
  "n_organoids": null,
  "n_sessions": null,
  "n_batches": null,
  "n_labs": null,
  "data_completeness_score": null,
  "metric_values": [],
  "run_controls": [],
  "score_calculations": [
    {
      "score_type": "composite",
      "score": null,
      "confidence_grade": null
    }
  ],
  "run_date": null
}`;

const METRIC_VALUE_SHAPE = `{
  "id": "",
  "benchmark_run_id": "",
  "metric_id": "",
  "value": 0,
  "normalized_value": null,
  "ci_low": null,
  "ci_high": null,
  "ci_method": null,
  "derivation_method": "extracted_from_paper | computed_from_data | submitted | curator_calculated",
  "derivation_notes": null,
  "source_id": null,
  "code_version": null
}`;

const SUBMISSION_SHAPE = `{
  "submitter_email": "",
  "submitter_name": "",
  "proposed_system_name": "",
  "proposed_track_slug": "",
  "proposed_task_slug": "",
  "source_url": "",
  "dataset_url": "",
  "code_url": null,
  "organization_name": null,
  "organoid_preparation": {
    "cell_line": null,
    "brain_region": null,
    "div_range": null,
    "protocol_reference": null
  },
  "recording_setup": {
    "platform": null,
    "channel_count": null,
    "sampling_rate_hz": null,
    "spike_sorter": null
  },
  "stimulation_protocol": null,
  "metrics": [],
  "controls": [],
  "limitations": null
}`;

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "endpoints", label: "Endpoints" },
  { id: "shapes", label: "Response shapes" },
  { id: "submit", label: "Submit" },
  { id: "status", label: "Status vocabulary" },
];

export default async function DocsPage() {
  const methodology = await prisma.methodologyVersion.findFirst({
    where: { isCurrent: true },
    orderBy: { releasedAt: "desc" },
  });

  return (
    <>
      <PageHeader
        eyebrow="API"
        title="OrganoidBench API"
        description="Every page on this site reads the same JSON. Responses are schema-shaped. When a field is unknown, the API returns null, not a placeholder value."
      />

      <Container>
        <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-10">
          <aside className="hidden md:block">
            <div className="sticky top-24">
              <div className="text-xs text-[color:var(--foreground-muted)] mb-3">On this page</div>
              <nav className="flex flex-col gap-1.5 text-sm">
                {SECTIONS.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className="inline-flex items-center gap-2 text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]">
                    <span className="h-1.5 w-1.5 rounded-[2px] bg-[color:var(--border-strong)]" />
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="flex flex-col gap-14 max-w-[820px]">
            <section id="overview" className="scroll-mt-24">
              <h2 className="font-serif text-2xl leading-tight mb-3">Overview</h2>
              <div className="text-[14px] leading-relaxed text-[color:var(--foreground-muted)] space-y-3">
                <p>
                  The API is read-only except for <code className="font-mono text-xs">POST /api/v1/submissions</code> and <code className="font-mono text-xs">POST /api/v1/corrections</code>. All read endpoints are unauthenticated and JSON.
                </p>
                <p>
                  Every field that is unverified or unmeasured returns <code className="font-mono text-xs">null</code>. A run with <code className="font-mono text-xs">run_status: "unscored"</code> has no composite score. Fabricated values are never written to fill a schema.
                </p>
                {methodology && (
                  <p>
                    Current methodology: <code className="font-mono text-xs">{methodology.version}</code> (released {methodology.releasedAt.toISOString().slice(0, 10)}).
                  </p>
                )}
              </div>
            </section>

            <section id="endpoints" className="scroll-mt-24">
              <h2 className="font-serif text-2xl leading-tight mb-3">Endpoints</h2>
              <div className="rounded-[12px] border border-[color:var(--border)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[color:var(--surface-alt)] text-left">
                    <tr>
                      <th className="px-3 py-2 font-medium text-xs w-16">Method</th>
                      <th className="px-3 py-2 font-medium text-xs">Path</th>
                      <th className="px-3 py-2 font-medium text-xs">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ENDPOINTS.map((e) => (
                      <tr key={`${e.method} ${e.path}`} className="border-t border-[color:var(--border)]">
                        <td className="px-3 py-2 font-mono text-xs">{e.method}</td>
                        <td className="px-3 py-2 font-mono text-xs">{e.path}</td>
                        <td className="px-3 py-2 text-[color:var(--foreground-muted)] text-xs">{e.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="shapes" className="scroll-mt-24">
              <h2 className="font-serif text-2xl leading-tight mb-3">Response shapes</h2>
              <p className="text-[14px] leading-relaxed text-[color:var(--foreground-muted)] mb-5">
                Examples are schema-shaped, not real records. Fields that would require a measurement are null. Intentional: an empty shape is more honest than a fake record dressed up as science.
              </p>

              <ShapeBlock title="System" path="GET /api/v1/systems/{id_or_slug}" body={SYSTEM_SHAPE} />
              <ShapeBlock title="Benchmark run" path="embedded in system.runs[]" body={RUN_SHAPE} />
              <ShapeBlock title="Metric value" path="embedded in run.metric_values[]" body={METRIC_VALUE_SHAPE} />
            </section>

            <section id="submit" className="scroll-mt-24">
              <h2 className="font-serif text-2xl leading-tight mb-3">Submitting a result</h2>
              <p className="text-[14px] leading-relaxed text-[color:var(--foreground-muted)] mb-3">
                POST to <code className="font-mono text-xs">/api/v1/submissions</code> with a JSON body matching the shape below. The submission is queued for review and surfaces in the submissions log. Nothing is auto-published.
              </p>
              <ShapeBlock title="Submission body" path="POST /api/v1/submissions" body={SUBMISSION_SHAPE} />
              <p className="text-[14px] leading-relaxed text-[color:var(--foreground-muted)] mt-3">
                For email-based submissions see <Link href="/submit" className="underline">/submit</Link>.
              </p>
            </section>

            <section id="status" className="scroll-mt-24">
              <h2 className="font-serif text-2xl leading-tight mb-3">Status vocabulary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <StatusList
                  title="Verification status (systems, datasets)"
                  items={[
                    ["draft", "Created, nothing reviewed."],
                    ["source_verified", "Source URL resolves, DOI recorded."],
                    ["data_ingested", "Data files enumerated."],
                    ["unscored", "Reviewed, but no run has a published composite."],
                    ["provisional", "Scored once, awaiting independent replication."],
                    ["scored", "Composite published under current methodology."],
                    ["curator_reviewed", "Reviewed manually after ingestion."],
                    ["published", "Passed full review and is cited in the leaderboard."],
                    ["disputed", "Flagged by a correction."],
                    ["deprecated", "Superseded or retracted."],
                  ]}
                />
                <StatusList
                  title="Derivation method (metric values)"
                  items={[
                    ["extracted_from_paper", "Reported in a source paper."],
                    ["computed_from_data", "Recomputed from ingested files."],
                    ["submitted", "Submitter provided the value."],
                    ["curator_calculated", "Manually computed from the source."],
                  ]}
                />
              </div>
            </section>
          </div>
        </div>
      </Container>
      <div className="h-16" />
    </>
  );
}

function ShapeBlock({ title, path, body }: { title: string; path: string; body: string }) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-xs font-mono text-[color:var(--foreground-muted)] mb-1">
        <span>{title}</span>
        <span>{path}</span>
      </div>
      <pre className="font-mono text-xs whitespace-pre bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)] overflow-x-auto">
        {body}
      </pre>
    </div>
  );
}

function StatusList({ title, items }: { title: string; items: Array<[string, string]> }) {
  return (
    <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
      <div className="text-sm font-semibold mb-2">{title}</div>
      <ul className="text-sm space-y-1">
        {items.map(([k, v]) => (
          <li key={k} className="grid grid-cols-[130px_1fr] gap-2">
            <code className="font-mono text-xs text-[color:var(--foreground)]">{k}</code>
            <span className="text-xs text-[color:var(--foreground-muted)]">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/section";
import { STATUS_COUNTS, TRACKS, SYSTEMS } from "@/lib/data";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "methodology", label: "Methodology" },
  { id: "confidence", label: "Confidence grades" },
  { id: "controls", label: "Required controls" },
  { id: "governance", label: "Governance" },
  { id: "changelog", label: "Changelog" },
  { id: "api", label: "API access" },
  { id: "schema", label: "Data schema" },
  { id: "sources", label: "Sources" },
  { id: "citation", label: "Citation" },
  { id: "contact", label: "Contact" },
];

const GRADES = [
  { g: "A", title: "Grade A — high confidence", body: "All required controls passed. Independent replication available. Raw data, processed data, and analysis code are public. Peer-reviewed." },
  { g: "B", title: "Grade B — moderate confidence", body: "Most required controls passed. At least partial replication across batches. Public data or public code. May be preprint." },
  { g: "C", title: "Grade C — provisional", body: "Some controls missing. Single-batch or single-lab. Limited public artifacts. Treat effect sizes as provisional." },
  { g: "D", title: "Grade D — low confidence", body: "Key controls missing or failing. No independent replication. Private data. Scored for completeness, not endorsed." },
  { g: "U", title: "Unscored", body: "Metadata too sparse to score under v1.3.0. Entry retained for visibility but excluded from rankings." },
];

const CONTROLS = [
  { name: "Random feedback", why: "Separates learning from feedback contingency from chance improvement." },
  { name: "Sham stimulation", why: "Confirms that measured change is stimulation-driven, not from handling or culture time." },
  { name: "Frozen decoder", why: "Isolates organoid learning from decoder adaptation in closed-loop tasks." },
  { name: "Decoder-only baseline", why: "Quantifies how much of the improvement is carried by the decoder alone." },
  { name: "Null stimulation", why: "Excludes artifactual responses driven by stimulation artifact rather than neural activity." },
  { name: "Independent replication", why: "Separates one-off results from reproducible phenomena across batches or labs." },
];

const CHANGELOG = [
  { v: "v1.3.0", date: "2026-04-02", notes: "Decoder-only control now required for closed-loop. Reproducibility weight increased. Dataset openness separated from code openness." },
  { v: "v1.2.0", date: "2026-01-15", notes: "Retention track split from plasticity. Matched re-test session required for retention claims." },
  { v: "v1.1.0", date: "2025-10-08", notes: "Responsiveness track added. Stimulus specificity added as a sub-metric." },
  { v: "v1.0.0", date: "2025-06-01", notes: "Initial release. Five tracks. Four-grade confidence scale." },
];

const SOURCES = Array.from(new Set(SYSTEMS.map((s) => s.source))).sort();

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="OrganoidBench benchmarking methodology"
        description={`A public, versioned benchmark for brain organoid electrophysiology, plasticity, and closed-loop learning systems. Methodology ${STATUS_COUNTS.methodologyVersion}, last updated ${STATUS_COUNTS.lastUpdated}.`}
      />

      <Container>
        <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-12">
          <aside className="hidden md:block">
            <div className="sticky top-24">
              <div className="text-xs text-[color:var(--foreground-muted)] mb-3">On this page</div>
              <nav className="flex flex-col gap-2 text-sm">
                {SECTIONS.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className="inline-flex items-center gap-2 text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]">
                    <span className="h-1.5 w-1.5 rounded-[2px] bg-[color:var(--border-strong)]" />
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="flex flex-col gap-16 max-w-[760px]">
            <section id="overview" className="scroll-mt-24">
              <h2 className="font-serif text-3xl leading-tight mb-4">Overview</h2>
              <p className="text-[15px] leading-relaxed text-[color:var(--foreground-muted)]">
                OrganoidBench is a curated, versioned index of published and preprint work that measures electrical activity, stimulus response, plasticity, retention, and closed-loop task performance in brain organoids, cortical spheroids, assembloids, and related cortical cell systems. Every entry pairs a dataset, a paper, and an experimental setup with standardised, reproducible metrics, re-scored under a single methodology.
              </p>
              <p className="text-[15px] leading-relaxed text-[color:var(--foreground-muted)] mt-3">
                We do not generate new data. We score, compare, and flag existing data. We are a benchmark, not a journal and not a replication service. We do not measure consciousness, sentience, or subjective experience, and we do not endorse commercial wetware platforms.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                {[
                  { k: "Systems indexed", v: STATUS_COUNTS.systems },
                  { k: "Organoids covered", v: STATUS_COUNTS.organoids },
                  { k: "Datasets linked", v: STATUS_COUNTS.datasets },
                  { k: "Sources represented", v: STATUS_COUNTS.labs },
                  { k: "Methodology", v: STATUS_COUNTS.methodologyVersion },
                  { k: "Last updated", v: STATUS_COUNTS.lastUpdated },
                ].map((r) => (
                  <div key={r.k} className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface-soft)] p-4">
                    <div className="text-xs text-[color:var(--foreground-muted)]">{r.k}</div>
                    <div className="font-mono text-xl mt-1">{r.v}</div>
                  </div>
                ))}
              </div>
            </section>

            <section id="methodology" className="scroll-mt-24">
              <h2 className="font-serif text-3xl leading-tight mb-4">Methodology</h2>
              <p className="text-[15px] leading-relaxed text-[color:var(--foreground-muted)]">
                Six tracks, each with its own required inputs, required controls, and scoring formula. Every system is scored on every track where its setup supports it; tracks that do not apply are marked not-applicable rather than penalised. A composite score weights tracks by coverage.
              </p>
              <div className="mt-5 rounded-[12px] border border-[color:var(--border)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[color:var(--surface-alt)] text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Track</th>
                      <th className="px-4 py-3 font-medium">What it measures</th>
                      <th className="px-4 py-3 font-medium text-right">Systems</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TRACKS.map((t) => (
                      <tr key={t.id} className="border-t border-[color:var(--border)]">
                        <td className="px-4 py-3 font-medium">{t.name}</td>
                        <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{t.short}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{SYSTEMS.filter((s) => s.track === t.id).length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <pre className="mt-5 font-mono text-xs whitespace-pre bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)] overflow-x-auto">
{`composite = 0.20 * signal
          + 0.15 * response
          + 0.15 * plasticity
          + 0.20 * learning
          + 0.10 * retention
          + 0.20 * reproducibility

Missing required control  -> track capped at 0.60
Private raw data          -> reproducibility capped at 0.75
No independent replication -> reproducibility capped at 0.70
Missing sampling metadata -> Unscored`}
              </pre>
            </section>

            <section id="confidence" className="scroll-mt-24">
              <h2 className="font-serif text-3xl leading-tight mb-4">Confidence grades</h2>
              <p className="text-[15px] leading-relaxed text-[color:var(--foreground-muted)] mb-5">
                Each entry carries a confidence grade on top of its numeric score. Grades capture sample size, controls, openness, peer review, and independent replication.
              </p>
              <div className="flex flex-col gap-3">
                {GRADES.map((g) => (
                  <div key={g.g} className="flex gap-4 rounded-[12px] border border-[color:var(--border)] p-4">
                    <div className="h-9 w-9 shrink-0 rounded-full border border-[color:var(--border-strong)] font-mono text-sm grid place-items-center">
                      {g.g}
                    </div>
                    <div>
                      <div className="font-medium">{g.title}</div>
                      <div className="text-sm text-[color:var(--foreground-muted)] mt-1">{g.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="controls" className="scroll-mt-24">
              <h2 className="font-serif text-3xl leading-tight mb-4">Required controls</h2>
              <p className="text-[15px] leading-relaxed text-[color:var(--foreground-muted)] mb-5">
                For closed-loop learning and plasticity claims, these controls are either required or explicitly marked not-applicable. Missing required controls cap the score.
              </p>
              <ul className="flex flex-col gap-3">
                {CONTROLS.map((c) => (
                  <li key={c.name} className="flex gap-3 rounded-[12px] border border-[color:var(--border)] p-4">
                    <span className="h-5 w-5 shrink-0 rounded-full border border-[color:var(--border-strong)] grid place-items-center text-xs mt-0.5">
                      <svg viewBox="0 0 12 12" className="h-3 w-3"><path d="M2.5 6.5 L5 9 L9.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm text-[color:var(--foreground-muted)] mt-1">{c.why}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section id="governance" className="scroll-mt-24">
              <h2 className="font-serif text-3xl leading-tight mb-4">Governance</h2>
              <p className="text-[15px] leading-relaxed text-[color:var(--foreground-muted)]">
                OrganoidBench is maintained by a small editorial group with rotating reviewers drawn from the community. Submissions are reviewed against the current methodology. Scoring disputes are resolved by re-running the published pipeline on the submitted data; if that is not possible, the dispute and response are published alongside the entry.
              </p>
              <p className="text-[15px] leading-relaxed text-[color:var(--foreground-muted)] mt-3">
                We do not accept sponsored placement. Commercial platforms are scored on the same scale as academic work, with the same availability and replication requirements. Authors may request corrections at any time through the corrections address.
              </p>
            </section>

            <section id="changelog" className="scroll-mt-24">
              <h2 className="font-serif text-3xl leading-tight mb-4">Changelog</h2>
              <div className="rounded-[12px] border border-[color:var(--border)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[color:var(--surface-alt)] text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium w-24">Version</th>
                      <th className="px-4 py-3 font-medium w-32">Date</th>
                      <th className="px-4 py-3 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CHANGELOG.map((c) => (
                      <tr key={c.v} className="border-t border-[color:var(--border)] align-top">
                        <td className="px-4 py-3 font-mono text-xs">{c.v}</td>
                        <td className="px-4 py-3 font-mono text-xs text-[color:var(--foreground-muted)]">{c.date}</td>
                        <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{c.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="api" className="scroll-mt-24">
              <h2 className="font-serif text-3xl leading-tight mb-4">API access</h2>
              <p className="text-[15px] leading-relaxed text-[color:var(--foreground-muted)] mb-4">
                The full index is available as JSON. Use it for research, mirrors, or integrations. Endpoints are read-only and cached; there is no authentication.
              </p>
              <pre className="font-mono text-xs whitespace-pre bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)] overflow-x-auto">
{`GET /api/v1/systems                 # all systems
GET /api/v1/systems/{id}             # single system
GET /api/v1/datasets                 # all datasets
GET /api/v1/datasets/{id}            # single dataset
GET /api/v1/tracks/{track}           # systems on a track
GET /api/v1/methodology              # current methodology version
GET /api/v1/methodology/{version}    # historical methodology`}
              </pre>
            </section>

            <section id="schema" className="scroll-mt-24">
              <h2 className="font-serif text-3xl leading-tight mb-4">Data schema</h2>
              <p className="text-[15px] leading-relaxed text-[color:var(--foreground-muted)] mb-4">
                Minimal shape of a system record. Full TypeScript types are published with the site source.
              </p>
              <pre className="font-mono text-xs whitespace-pre bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)] overflow-x-auto">
{`{
  "id": "ob-sys-0001",
  "name": "DishBrain v2.1 — Pong",
  "source": "Kagan Lab",
  "track": "closed-loop-learning",
  "metrics": {
    "signal": 0.78, "response": 0.82, "plasticity": 0.68,
    "learning": 0.74, "retention": 0.51, "repro": 0.66,
    "composite": 0.70
  },
  "grade": "A",
  "availability": {
    "raw": true, "processed": true, "code": true,
    "peerReviewed": true, "openDataset": true
  }
}`}
              </pre>
            </section>

            <section id="sources" className="scroll-mt-24">
              <h2 className="font-serif text-3xl leading-tight mb-4">Sources represented</h2>
              <p className="text-[15px] leading-relaxed text-[color:var(--foreground-muted)] mb-5">
                {SOURCES.length} distinct labs, consortia, and commercial groups are represented in the current index.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SOURCES.map((src) => (
                  <div key={src} className="rounded-[8px] border border-[color:var(--border)] px-3 py-2 text-sm">
                    {src}
                  </div>
                ))}
              </div>
            </section>

            <section id="citation" className="scroll-mt-24">
              <h2 className="font-serif text-3xl leading-tight mb-4">Citation</h2>
              <p className="text-[15px] leading-relaxed text-[color:var(--foreground-muted)] mb-4">
                When citing OrganoidBench in a publication, cite both the specific entry id and the methodology version.
              </p>
              <pre className="font-mono text-xs whitespace-pre bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)] overflow-x-auto">
{`@misc{organoidbench_${STATUS_COUNTS.methodologyVersion.replace(/\./g, "_")},
  title   = {OrganoidBench: a benchmark for brain organoid
             electrophysiology and closed-loop learning systems},
  url     = {https://organoidbench.org},
  version = {${STATUS_COUNTS.methodologyVersion}},
  year    = {2026},
  note    = {accessed ${STATUS_COUNTS.lastUpdated}}
}`}
              </pre>
            </section>

            <section id="contact" className="scroll-mt-24">
              <h2 className="font-serif text-3xl leading-tight mb-4">Contact</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { k: "General", v: "hello@organoidbench.org" },
                  { k: "Submissions", v: "submit@organoidbench.org" },
                  { k: "Corrections", v: "corrections@organoidbench.org" },
                  { k: "Press", v: "press@organoidbench.org" },
                ].map((c) => (
                  <div key={c.k} className="rounded-[12px] border border-[color:var(--border)] p-4">
                    <div className="text-xs text-[color:var(--foreground-muted)]">{c.k}</div>
                    <div className="font-mono text-sm mt-1">{c.v}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-5">
                <Link href="/submit" className="inline-flex items-center rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] px-4 py-2 text-sm font-medium hover:opacity-90">
                  Submit an entry
                </Link>
                <a href="https://github.com/jasperdevs/organoid-bench" className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]">
                  GitHub
                </a>
              </div>
            </section>
          </div>
        </div>
      </Container>
      <div className="h-16" />
    </>
  );
}

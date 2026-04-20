import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/section";
import { STATUS_COUNTS, TRACKS, SYSTEMS, CHANGELOG, LAB_SOURCES, labColor } from "@/lib/data";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "methodology", label: "Methodology" },
  { id: "confidence", label: "Confidence grades" },
  { id: "controls", label: "Required controls" },
  { id: "governance", label: "Governance" },
  { id: "changelog", label: "Changelog" },
  { id: "api", label: "API" },
  { id: "schema", label: "Schema" },
  { id: "sources", label: "Sources" },
  { id: "citation", label: "Citation" },
  { id: "contact", label: "Contact" },
];

const GRADES = [
  { g: "A", title: "High confidence", body: "All required controls passed. Independent replication. Raw + processed + code public. Peer-reviewed." },
  { g: "B", title: "Moderate", body: "Most controls passed. Partial replication. Public data or code. May be preprint." },
  { g: "C", title: "Provisional", body: "Some controls missing. Single batch or lab. Limited artifacts. Effect sizes are provisional." },
  { g: "D", title: "Low", body: "Key controls missing or failed. No replication. Private data. Retained for visibility." },
  { g: "U", title: "Unscored", body: "Metadata too sparse to score under current methodology. Excluded from rankings." },
];

const CONTROLS = [
  { name: "Random feedback", why: "Separates learning from contingency from chance improvement." },
  { name: "Sham stimulation", why: "Confirms change is stimulus-driven, not handling or culture time." },
  { name: "Frozen decoder", why: "Isolates organoid learning from decoder adaptation." },
  { name: "Decoder-only baseline", why: "Quantifies how much improvement the decoder alone produces." },
  { name: "Null stimulation", why: "Excludes artifactual responses driven by stim artifact." },
  { name: "Independent replication", why: "Separates one-off results from reproducible phenomena." },
];

const SOURCES = Array.from(new Set(SYSTEMS.map((s) => s.source))).sort();

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Docs"
        title="Methodology and reference"
        description={`Methodology ${STATUS_COUNTS.methodologyVersion}, last updated ${STATUS_COUNTS.lastUpdated}.`}
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

          <div className="flex flex-col gap-14 max-w-[780px]">
            <Section id="overview" title="Overview">
              <p>
                OrganoidBench is a versioned index of published and preprint work that measures electrical activity, stimulus response, plasticity, retention, and closed-loop task performance in brain organoids, cortical spheroids, and assembloids.
              </p>
              <p className="mt-3">
                Every entry pairs a dataset, a paper, and an experimental setup with reproducible metrics under a single methodology. We score and flag. We do not generate new data, we do not replicate experiments, and we do not measure consciousness or sentience.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
                {[
                  { k: "Systems", v: STATUS_COUNTS.systems },
                  { k: "Datasets", v: STATUS_COUNTS.datasets },
                  { k: "Sources", v: STATUS_COUNTS.labs },
                  { k: "Organoids", v: STATUS_COUNTS.organoids },
                  { k: "Methodology", v: STATUS_COUNTS.methodologyVersion },
                  { k: "Updated", v: STATUS_COUNTS.lastUpdated },
                ].map((r) => (
                  <div key={r.k} className="rounded-[10px] border border-[color:var(--border)] bg-[color:var(--surface-soft)] p-3">
                    <div className="text-[11px] text-[color:var(--foreground-muted)]">{r.k}</div>
                    <div className="font-mono text-lg mt-0.5">{r.v}</div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="methodology" title="Methodology">
              <p>
                Six tracks, each with its own required inputs, required controls, and scoring formula. Every system is scored on every track where its setup supports it. Tracks that do not apply are marked n/a, not penalised.
              </p>
              <div className="mt-4 rounded-[12px] border border-[color:var(--border)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[color:var(--surface-alt)] text-left">
                    <tr>
                      <th className="px-3 py-2 font-medium text-xs">Track</th>
                      <th className="px-3 py-2 font-medium text-xs">Measures</th>
                      <th className="px-3 py-2 font-medium text-xs text-right">Systems</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TRACKS.map((t) => (
                      <tr key={t.id} className="border-t border-[color:var(--border)]">
                        <td className="px-3 py-2 font-medium">{t.name}</td>
                        <td className="px-3 py-2 text-[color:var(--foreground-muted)] text-xs">{t.short}</td>
                        <td className="px-3 py-2 text-right font-mono text-xs">{SYSTEMS.filter((s) => s.track === t.id).length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <pre className="mt-4 font-mono text-xs whitespace-pre bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)] overflow-x-auto">
{`composite = 0.20 * signal
          + 0.15 * response
          + 0.15 * plasticity
          + 0.20 * learning
          + 0.10 * retention
          + 0.20 * reproducibility

Missing required control   -> track capped at 0.60
Private raw data           -> reproducibility capped at 0.75
No independent replication -> reproducibility capped at 0.70
Missing sampling metadata  -> Unscored`}
              </pre>
            </Section>

            <Section id="confidence" title="Confidence grades">
              <p>
                Each entry carries a confidence grade on top of its numeric score, capturing sample size, controls, openness, peer review, and independent replication.
              </p>
              <div className="flex flex-col gap-2 mt-4">
                {GRADES.map((g) => (
                  <div key={g.g} className="flex gap-3 items-start rounded-[10px] border border-[color:var(--border)] p-3">
                    <div className="h-7 w-7 shrink-0 rounded-full border border-[color:var(--border-strong)] font-mono text-xs grid place-items-center">
                      {g.g}
                    </div>
                    <div>
                      <div className="font-medium text-sm">Grade {g.g}, {g.title}</div>
                      <div className="text-sm text-[color:var(--foreground-muted)] mt-0.5">{g.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="controls" title="Required controls">
              <p>
                For closed-loop learning and plasticity claims, these controls are either required or explicitly marked n/a. Missing required controls cap the score.
              </p>
              <ul className="flex flex-col gap-2 mt-4">
                {CONTROLS.map((c) => (
                  <li key={c.name} className="flex gap-3 items-start rounded-[10px] border border-[color:var(--border)] p-3">
                    <span className="h-5 w-5 shrink-0 rounded-full border border-[color:var(--border-strong)] grid place-items-center text-xs mt-0.5">
                      <svg viewBox="0 0 12 12" className="h-3 w-3"><path d="M2.5 6.5 L5 9 L9.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    <div>
                      <div className="font-medium text-sm">{c.name}</div>
                      <div className="text-sm text-[color:var(--foreground-muted)] mt-0.5">{c.why}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="governance" title="Governance">
              <p>
                Maintained by a small editorial group with rotating community reviewers. Scoring disputes are resolved by re-running the published pipeline on the submitted data, or, if that is not possible, by publishing the dispute and response alongside the entry.
              </p>
              <p className="mt-3">
                No sponsored placement. Commercial platforms are scored on the same scale as academic work, with identical availability and replication requirements.
              </p>
            </Section>

            <Section id="changelog" title="Changelog">
              <p>Every methodology change is versioned. Scores are re-computed for affected entries.</p>
              <div className="mt-4 rounded-[12px] border border-[color:var(--border)] overflow-hidden">
                <div className="max-h-[360px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[color:var(--surface-alt)] text-left">
                      <tr>
                        <th className="px-3 py-2 font-medium text-xs w-20">Version</th>
                        <th className="px-3 py-2 font-medium text-xs w-24">Date</th>
                        <th className="px-3 py-2 font-medium text-xs">Changes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CHANGELOG.map((c) => (
                        <tr key={c.version} className="border-t border-[color:var(--border)] align-top">
                          <td className="px-3 py-2 font-mono text-xs">{c.version}</td>
                          <td className="px-3 py-2 font-mono text-xs text-[color:var(--foreground-muted)]">{c.date}</td>
                          <td className="px-3 py-2 text-sm">
                            <ul className="list-disc pl-4 space-y-0.5 text-[color:var(--foreground-muted)]">
                              {c.changes.map((ch, i) => <li key={i}>{ch}</li>)}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Section>

            <Section id="api" title="API">
              <p>The full index is available as JSON. Endpoints are read-only, cached, and unauthenticated.</p>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { path: "/api/systems", note: "All systems" },
                  { path: "/api/systems/{id}", note: "Single system, e.g. /api/systems/ob-sys-0001" },
                  { path: "/api/datasets", note: "All datasets" },
                  { path: "/api/datasets/{id}", note: "Single dataset" },
                  { path: "/api/tracks", note: "All tracks" },
                  { path: "/api/tracks/{id}", note: "One track with its ranked systems" },
                  { path: "/api/meta", note: "Methodology version, counts, changelog" },
                ].map((e) => (
                  <div key={e.path} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-[10px] border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2">
                    <code className="font-mono text-xs">GET {e.path}</code>
                    <span className="text-xs text-[color:var(--foreground-muted)]">{e.note}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-[color:var(--foreground-muted)]">
                Example: <a className="underline" href="/api/systems">/api/systems</a>. All responses are JSON.
              </p>
            </Section>

            <Section id="schema" title="Schema">
              <p>Minimal shape of a system record. Full TypeScript types are in the site source.</p>
              <pre className="mt-4 font-mono text-xs whitespace-pre bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)] overflow-x-auto">
{`{
  "id": "ob-sys-0001",
  "name": "DishBrain v2.1: Pong",
  "source": "Kagan Lab",
  "track": "closed-loop-learning",
  "task": "Pong-style goal reaching",
  "metrics": {
    "signal": 0.78, "response": 0.82, "plasticity": 0.68,
    "learning": 0.74, "retention": 0.51, "repro": 0.66,
    "composite": 0.70
  },
  "grade": "A",
  "availability": {
    "raw": true, "processed": true, "code": true,
    "peerReviewed": true, "openDataset": true
  },
  "paper": { "title": "...", "year": 2022, "doi": "10.1016/j.neuron.2022.09.001" }
}`}
              </pre>
            </Section>

            <Section id="sources" title="Sources">
              <p>{SOURCES.length} distinct labs, consortia, and commercial groups in the current index.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                {SOURCES.map((src) => {
                  const lab = LAB_SOURCES[src];
                  return (
                    <div key={src} className="flex items-start gap-3 rounded-[10px] border border-[color:var(--border)] p-3">
                      <span className="h-3 w-3 rounded-[3px] mt-1 shrink-0" style={{ background: labColor(src) }} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{src}</div>
                        {lab && (
                          <div className="text-xs text-[color:var(--foreground-muted)] truncate">
                            {lab.institution} · PI {lab.pi}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>

            <Section id="citation" title="Citation">
              <p>Cite the specific entry id and the methodology version.</p>
              <pre className="mt-4 font-mono text-xs whitespace-pre bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)] overflow-x-auto">
{`@misc{organoidbench_${STATUS_COUNTS.methodologyVersion.replace(/\./g, "_")},
  title   = {OrganoidBench: a benchmark for brain organoid
             electrophysiology and closed-loop learning systems},
  url     = {https://organoidbench.org},
  version = {${STATUS_COUNTS.methodologyVersion}},
  year    = {2026},
  note    = {accessed ${STATUS_COUNTS.lastUpdated}}
}`}
              </pre>
            </Section>

            <Section id="contact" title="Contact">
              <p>One address for everything: submissions, corrections, press, and questions.</p>
              <div className="mt-4 rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 flex flex-wrap items-center justify-between gap-3">
                <a href="mailto:jasper.mceligott@gmail.com" className="font-mono text-sm underline underline-offset-4">
                  jasper.mceligott@gmail.com
                </a>
                <div className="flex gap-2">
                  <Link href="/submit" className="inline-flex items-center rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] px-4 py-2 text-sm font-medium hover:opacity-90">
                    Open submission guide
                  </Link>
                  <a href="https://github.com/jasperdevs/organoid-bench" className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]">
                    GitHub
                  </a>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </Container>
      <div className="h-16" />
    </>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-serif text-2xl leading-tight mb-3">{title}</h2>
      <div className="text-[14px] leading-relaxed text-[color:var(--foreground-muted)]">
        {children}
      </div>
    </section>
  );
}

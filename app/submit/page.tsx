import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/section";
import { Input, Select, Label } from "@/components/ui/input";
import { TRACKS, SYSTEMS } from "@/lib/data";

const SOURCES = Array.from(new Set(SYSTEMS.map((s) => s.source))).sort();

const minRequirements = [
  "System name and short description",
  "Lab or source with contact",
  "Benchmark track and task",
  "Organoid type, species, and age range",
  "Recording platform, sampling rate, and electrode count",
  "Stimulation protocol if applicable",
  "Decoder or controller description (closed-loop only)",
  "N organoids, N sessions, N batches",
  "Control conditions run and their status",
  "Dataset link (public, request-access, or private)",
  "Code link (or 'not released')",
  "Paper or preprint link (or 'not peer-reviewed')",
  "License for shared artifacts",
  "Limitations statement",
];

export default function SubmitPage() {
  return (
    <>
      <PageHeader
        eyebrow="Submit"
        title="Submit a result, dataset, or correction"
        description="Submissions go through automated validation and manual review. Provisional entries appear with a clear flag until reviewed."
        right={
          <Link
            href="/about#methodology"
            className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]"
          >
            Methodology
          </Link>
        }
      />

      <Container>
        <div className="flex flex-col gap-12">
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <TypeCard
                tag="Benchmark result"
                title="Submit a benchmark result"
                body="Full system entry with controls and dataset link."
                href="#benchmark-result"
              />
              <TypeCard
                tag="Dataset"
                title="Submit a dataset"
                body="Register a dataset for one or more benchmark tracks."
                href="#dataset"
              />
              <TypeCard
                tag="Correction"
                title="Submit a correction"
                body="Flag a scoring or metadata issue on an existing entry."
                href="#correction"
              />
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl mb-4">Minimum submission requirements</h2>
            <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {minRequirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-[2px] h-4 w-4 rounded-[4px] border border-[color:var(--border-strong)] shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="benchmark-result" className="scroll-mt-24">
            <h2 className="font-serif text-2xl mb-2">Submit a benchmark result</h2>
            <p className="text-sm text-[color:var(--foreground-muted)] mb-5">
              Fill in what is available. You can save a draft and return to it; validation runs at submit time.
            </p>
            <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Submitter name">
                  <Input placeholder="Full name" />
                </Field>
                <Field label="Affiliation">
                  <Input placeholder="Institution or organization" />
                </Field>
                <Field label="Contact email">
                  <Input placeholder="you@example.org" />
                </Field>
                <Field label="Lab / source">
                  <Select>
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="new">Other / new source</option>
                  </Select>
                </Field>

                <Field label="System name" colSpan>
                  <Input placeholder="e.g. DishBrain v2.1 — Pong" />
                </Field>

                <Field label="Benchmark track">
                  <Select>
                    {TRACKS.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Task">
                  <Input placeholder="e.g. Pong-style goal reaching" />
                </Field>

                <Field label="Organoid type">
                  <Input placeholder="e.g. Cortical organoid" />
                </Field>
                <Field label="Species / cell line">
                  <Input placeholder="e.g. Human iPSC, H9" />
                </Field>
                <Field label="Culture age (days)">
                  <Input type="number" placeholder="90" />
                </Field>
                <Field label="Recording platform">
                  <Input placeholder="e.g. MaxWell MaxOne HD-MEA" />
                </Field>
                <Field label="Stimulation method">
                  <Input placeholder="Biphasic current, sparse cluster" />
                </Field>
                <Field label="Decoder / controller">
                  <Input placeholder="Linear readout, frozen during evaluation" />
                </Field>

                <Field label="N organoids">
                  <Input type="number" placeholder="18" />
                </Field>
                <Field label="N sessions">
                  <Input type="number" placeholder="44" />
                </Field>
                <Field label="N batches">
                  <Input type="number" placeholder="3" />
                </Field>
                <Field label="N labs">
                  <Input type="number" placeholder="1" />
                </Field>

                <Field label="Paper or preprint link" colSpan>
                  <Input placeholder="https://doi.org/…" />
                </Field>
                <Field label="Dataset link" colSpan>
                  <Input placeholder="https://dandi.example.org/…" />
                </Field>
                <Field label="Code link" colSpan>
                  <Input placeholder="https://github.com/…" />
                </Field>

                <Field label="Control conditions run" colSpan>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {[
                      "Random feedback",
                      "Sham stimulation",
                      "Null stimulation",
                      "Frozen decoder",
                      "Decoder-only baseline",
                      "Batch replication",
                      "Independent replication",
                    ].map((c) => (
                      <label key={c} className="flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1.5">
                        <input type="checkbox" />
                        {c}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="Raw data availability">
                  <Select>
                    <option>Public</option>
                    <option>Request access</option>
                    <option>Private</option>
                  </Select>
                </Field>
                <Field label="Processed data availability">
                  <Select>
                    <option>Public</option>
                    <option>Request access</option>
                    <option>Private</option>
                  </Select>
                </Field>
                <Field label="License" colSpan>
                  <Select>
                    <option>CC0</option>
                    <option>CC-BY-4.0</option>
                    <option>CC-BY-NC-4.0</option>
                    <option>Request access</option>
                    <option>Private</option>
                  </Select>
                </Field>

                <Field label="Notes" colSpan>
                  <textarea
                    placeholder="Anything reviewers should know about this submission"
                    className="min-h-[80px] w-full rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--foreground)]"
                  />
                </Field>
                <Field label="Known limitations (required)" colSpan>
                  <textarea
                    placeholder="e.g. single-lab, small N, decoder not strictly frozen in sessions 12–14"
                    className="min-h-[80px] w-full rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--foreground)]"
                  />
                </Field>

                <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2 border-t border-[color:var(--border)]">
                  <p className="text-xs text-[color:var(--foreground-muted)]">
                    By submitting you confirm the above is accurate and agree to the{" "}
                    <Link href="/about#governance" className="underline underline-offset-2">
                      conflict-of-interest policy
                    </Link>.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]"
                    >
                      Save draft
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] px-4 py-2 text-sm font-medium hover:opacity-90"
                    >
                      Submit for review
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl mb-2">Submission flow</h2>
            <p className="text-sm text-[color:var(--foreground-muted)] mb-5">
              Every entry moves through the same five states.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                { n: 1, t: "Draft submitted", d: "Submitter has saved the entry." },
                { n: 2, t: "Automated validation", d: "Schema, metadata, and required-field checks." },
                { n: 3, t: "Manual review", d: "Independent reviewer assesses controls and methodology fit." },
                { n: 4, t: "Provisional listing", d: "Listed with a provisional flag and visible limitations." },
                { n: 5, t: "Scored listing", d: "Graded A–D and included in the main leaderboard." },
              ].map((s) => (
                <div key={s.n} className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                  <div className="text-xs text-[color:var(--foreground-muted)]">Step {s.n}</div>
                  <div className="mt-1 font-medium">{s.t}</div>
                  <div className="text-sm text-[color:var(--foreground-muted)] mt-1">{s.d}</div>
                </div>
              ))}
            </div>
          </section>

          <section id="dataset" className="scroll-mt-24">
            <h2 className="font-serif text-2xl mb-4">Other submission types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Panel title="Submit a dataset" body="Register a dataset independently of any benchmark entry." />
              <Panel title="Submit a correction" body="Flag a scoring issue, metadata error, or disputed claim on an existing entry." anchor="correction" />
              <Panel title="Request a new task" body="Propose a new standardized assay for an existing track, or argue for a new track." />
              <Panel title="Become a benchmark partner" body="Labs and platforms with multiple systems over time can request partner status for streamlined review." />
            </div>
          </section>
        </div>
      </Container>
      <div className="h-16" />
    </>
  );
}

function Field({
  label,
  children,
  colSpan,
}: {
  label: string;
  children: React.ReactNode;
  colSpan?: boolean;
}) {
  return (
    <div className={colSpan ? "md:col-span-2" : ""}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function TypeCard({ tag, title, body, href }: { tag: string; title: string; body: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 hover:border-[color:var(--foreground)] transition"
    >
      <span className="inline-flex items-center rounded-full border border-[color:var(--border)] px-2.5 py-0.5 text-xs">{tag}</span>
      <div className="mt-3 font-semibold">{title}</div>
      <p className="text-sm text-[color:var(--foreground-muted)] mt-1">{body}</p>
    </Link>
  );
}

function Panel({ title, body, anchor }: { title: string; body: string; anchor?: string }) {
  return (
    <div id={anchor} className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 scroll-mt-24">
      <div className="font-semibold">{title}</div>
      <p className="text-sm text-[color:var(--foreground-muted)] mt-1">{body}</p>
      <button
        type="button"
        className="mt-4 inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]"
      >
        Open form
      </button>
    </div>
  );
}

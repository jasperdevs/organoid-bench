import Link from "next/link";
import { PageHeader, Section } from "@/components/ui/section";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Select, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TRACKS, TASKS, LABS } from "@/lib/data";

const minRequirements = [
  "system name and short description",
  "lab / source with contact",
  "benchmark track and task id",
  "organoid type, species, and age range",
  "recording platform, sampling rate, and electrode count",
  "stimulation protocol if applicable",
  "decoder / controller description (closed-loop only)",
  "N organoids, N sessions, N batches",
  "control conditions run and their status",
  "dataset link (public, request-access, or private)",
  "code link (or 'not released')",
  "paper / preprint link (or 'not peer-reviewed')",
  "license for shared artifacts",
  "limitations statement",
];

export default function SubmitPage() {
  return (
    <>
      <PageHeader
        eyebrow="submit"
        title="submit a result, dataset, or correction"
        description="Submissions go through automated validation and manual review. Provisional entries appear with a clear flag until reviewed."
        right={
          <div className="flex gap-2">
            <Button href="/methodology" size="sm" variant="outline">
              methodology
            </Button>
            <Button href="/docs#submission-format" size="sm" variant="ghost">
              json schema
            </Button>
          </div>
        }
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <Link href="#benchmark-result">
            <Card className="h-full hover:border-[color:var(--foreground)]">
              <Badge tone="outline">benchmark result</Badge>
              <div className="mt-3 font-semibold">submit a benchmark result</div>
              <p className="text-sm text-[color:var(--foreground-muted)] mt-1">
                full system entry with controls and dataset link.
              </p>
            </Card>
          </Link>
          <Link href="#dataset">
            <Card className="h-full hover:border-[color:var(--foreground)]">
              <Badge tone="outline">dataset</Badge>
              <div className="mt-3 font-semibold">submit a dataset</div>
              <p className="text-sm text-[color:var(--foreground-muted)] mt-1">
                register a dataset for one or more benchmark tracks.
              </p>
            </Card>
          </Link>
          <Link href="#correction">
            <Card className="h-full hover:border-[color:var(--foreground)]">
              <Badge tone="outline">correction</Badge>
              <div className="mt-3 font-semibold">submit a correction</div>
              <p className="text-sm text-[color:var(--foreground-muted)] mt-1">
                flag a scoring or metadata issue on an existing entry.
              </p>
            </Card>
          </Link>
          <Link href="#task">
            <Card className="h-full hover:border-[color:var(--foreground)]">
              <Badge tone="outline">new task</Badge>
              <div className="mt-3 font-semibold">request a new task</div>
              <p className="text-sm text-[color:var(--foreground-muted)] mt-1">
                propose a new standardized assay for a track.
              </p>
            </Card>
          </Link>
          <Link href="#partner">
            <Card className="h-full hover:border-[color:var(--foreground)]">
              <Badge tone="outline">partner</Badge>
              <div className="mt-3 font-semibold">become a partner</div>
              <p className="text-sm text-[color:var(--foreground-muted)] mt-1">
                labs and platforms with multiple systems over time.
              </p>
            </Card>
          </Link>
        </div>
      </Section>

      <Section
        title="minimum submission requirements"
        description="Submissions missing any of these items are returned for revision before entering review."
      >
        <Card>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {minRequirements.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-[2px] h-4 w-4 rounded-[4px] border border-[color:var(--border)] shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section
        title="submit a benchmark result"
        description="Fill in what is available. You can save a draft and return to it; validation runs at submit time."
      >
        <div id="benchmark-result" />
        <Card>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="submitter name">
              <Input placeholder="full name" />
            </Field>
            <Field label="affiliation">
              <Input placeholder="institution or organization" />
            </Field>
            <Field label="contact email">
              <Input placeholder="you@example.org" />
            </Field>
            <Field label="lab / source">
              <Select>
                {LABS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
                <option value="new">other / new source</option>
              </Select>
            </Field>

            <Field label="system name" colSpan>
              <Input placeholder="e.g. DishBrain v2.1 — Pong" />
            </Field>

            <Field label="benchmark track">
              <Select>
                {TRACKS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="task">
              <Select>
                {TASKS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="organoid type">
              <Select>
                <option>cortical</option>
                <option>cerebral</option>
                <option>regionalized forebrain</option>
                <option>other</option>
              </Select>
            </Field>
            <Field label="species / source line">
              <Input placeholder="e.g. human, H1 cell line" />
            </Field>
            <Field label="culture age (days)">
              <Input type="number" placeholder="90" />
            </Field>
            <Field label="recording platform">
              <Input placeholder="e.g. MaxWell MaxOne HD-MEA" />
            </Field>
            <Field label="stimulation method">
              <Input placeholder="biphasic current, sparse cluster" />
            </Field>
            <Field label="decoder / controller">
              <Input placeholder="linear readout, frozen during evaluation" />
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

            <Field label="paper / preprint link" colSpan>
              <Input placeholder="https://doi.org/…" />
            </Field>
            <Field label="dataset link" colSpan>
              <Input placeholder="https://dandi.example.org/…" />
            </Field>
            <Field label="code link" colSpan>
              <Input placeholder="https://github.com/…" />
            </Field>

            <Field label="control conditions" colSpan>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {[
                  "random feedback",
                  "sham stimulation",
                  "null stimulation",
                  "frozen decoder",
                  "decoder-only baseline",
                  "repeated-run validation",
                  "batch replication",
                  "independent replication",
                ].map((c) => (
                  <label key={c} className="flex items-center gap-2 rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2">
                    <input type="checkbox" />
                    {c}
                  </label>
                ))}
              </div>
            </Field>

            <Field label="raw data availability">
              <Select>
                <option>public</option>
                <option>request access</option>
                <option>private</option>
              </Select>
            </Field>
            <Field label="processed data availability">
              <Select>
                <option>public</option>
                <option>request access</option>
                <option>private</option>
              </Select>
            </Field>
            <Field label="license">
              <Select>
                <option>CC0</option>
                <option>CC-BY-4.0</option>
                <option>CC-BY-NC-4.0</option>
                <option>request access</option>
                <option>private</option>
              </Select>
            </Field>

            <Field label="notes" colSpan>
              <textarea
                placeholder="anything reviewers should know about this submission"
                className="min-h-[80px] w-full rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--foreground)]"
              />
            </Field>
            <Field label="known limitations (required)" colSpan>
              <textarea
                placeholder="e.g. single-lab, small N, decoder not strictly frozen in sessions 12–14"
                className="min-h-[80px] w-full rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--foreground)]"
              />
            </Field>

            <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2 border-t border-[color:var(--border)]">
              <p className="text-xs text-[color:var(--foreground-muted)]">
                By submitting you confirm the above is accurate and agree to the{" "}
                <Link href="/governance#coi" className="underline underline-offset-2">
                  conflict-of-interest policy
                </Link>
                .
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">save draft</Button>
                <Button variant="primary" size="sm">submit for review</Button>
              </div>
            </div>
          </form>
        </Card>
      </Section>

      <Section
        title="submission flow"
        description="Every entry moves through the same five states."
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { n: 1, t: "draft submitted", d: "submitter has saved the entry." },
            { n: 2, t: "automated validation", d: "schema, metadata, and required-field checks." },
            { n: 3, t: "manual review", d: "independent reviewer assesses controls and methodology fit." },
            { n: 4, t: "provisional listing", d: "listed with a 'provisional' flag and visible limitations." },
            { n: 5, t: "scored listing", d: "graded A–D and included in the main leaderboard." },
          ].map((s) => (
            <Card key={s.n}>
              <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)]">
                step {s.n}
              </div>
              <div className="mt-1 font-medium">{s.t}</div>
              <div className="text-sm text-[color:var(--foreground-muted)] mt-0.5">
                {s.d}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="other submission types">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <div id="dataset" />
            <CardHeader
              title="submit a dataset"
              description="Register a dataset independently of any benchmark entry."
            />
            <Button size="sm" variant="outline">open dataset form</Button>
          </Card>
          <Card>
            <div id="correction" />
            <CardHeader
              title="submit a correction"
              description="Flag a scoring issue, metadata error, or disputed claim on an existing entry."
            />
            <Button size="sm" variant="outline">open correction form</Button>
          </Card>
          <Card>
            <div id="task" />
            <CardHeader
              title="request a new task"
              description="Propose a new standardized assay for an existing track, or argue for a new track."
            />
            <Button size="sm" variant="outline">open task proposal</Button>
          </Card>
          <Card>
            <div id="partner" />
            <CardHeader
              title="become a benchmark partner"
              description="Labs and platforms with multiple systems submitted over time can request partner status for streamlined review."
            />
            <Button size="sm" variant="outline">contact review committee</Button>
          </Card>
        </div>
      </Section>
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

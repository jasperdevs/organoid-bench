import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/section";

const required = [
  "System name and one-sentence description",
  "Lab, institution, and PI",
  "Benchmark track and task slug",
  "Source (paper URL, preprint, or data record DOI)",
  "Dataset link (Zenodo, Figshare, DANDI, S3, or similar)",
  "Code link (GitHub, GitLab, OSF, or similar)",
  "Organoid preparation: cell line, region, DIV range, protocol reference",
  "Recording setup: platform, channel count, sampling rate, sorter",
  "Stimulation protocol (or n/a with reason)",
  "N organoids, sessions, batches, labs",
  "Controls run, each with pass/fail",
  "License and known limitations",
];

const PREFILL = [
  "System name:",
  "Lab / institution / PI:",
  "Track (signal-quality | responsiveness | plasticity | closed-loop-learning | retention | reproducibility):",
  "Task slug:",
  "Source URL or DOI:",
  "Dataset URL:",
  "Code URL:",
  "Organoid prep (cell line, region, DIV, protocol):",
  "Recording setup (platform, channels, rate, sorter):",
  "Stimulation protocol:",
  "N organoids / sessions / batches / labs:",
  "Controls run:",
  "License:",
  "Known limitations:",
].join("%0A");

const MAILTO = `mailto:jasper.mceligott@gmail.com?subject=${encodeURIComponent(
  "OrganoidBench submission",
)}&body=${PREFILL}`;

const JSON_EXAMPLE = `{
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

export default function SubmitPage() {
  return (
    <>
      <PageHeader
        eyebrow="Submit"
        title="Submit a system, dataset, or correction"
        description="Two paths. Send an email, or POST JSON to the submissions endpoint. Every submission is reviewed before any composite score is published."
      />

      <Container>
        <div className="flex flex-col gap-8 max-w-3xl">
          <section className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
            <div className="text-sm text-[color:var(--foreground-muted)]">Email</div>
            <a
              href={MAILTO}
              className="font-mono text-lg mt-1 block underline underline-offset-4"
            >
              jasper.mceligott@gmail.com
            </a>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={MAILTO}
                className="inline-flex items-center rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] px-4 py-2 text-sm font-medium hover:opacity-90"
              >
                Open prefilled email
              </a>
              <Link
                href="/methodology"
                className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]"
              >
                Methodology
              </Link>
              <Link
                href="/docs#submit"
                className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]"
              >
                API submission
              </Link>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Include in your email</h2>
            <ul className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] divide-y divide-[color:var(--border)]">
              {required.map((r, i) => (
                <li key={i} className="flex items-start gap-3 px-4 py-2.5 text-sm">
                  <span className="mt-0.5 font-mono text-xs text-[color:var(--foreground-muted)] w-6">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {r}
                </li>
              ))}
            </ul>
            <p className="text-xs text-[color:var(--foreground-muted)] mt-3">
              If a field is not applicable, write "n/a" with a short reason. Entries with missing required fields are listed as unscored, not rejected.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Submit by API</h2>
            <p className="text-sm text-[color:var(--foreground-muted)] mb-3">
              POST JSON to <code className="font-mono text-xs">/api/v1/submissions</code>. The example below is schema-shaped with null fields, not a fake record. Fill in what you have; leave the rest null.
            </p>
            <pre className="font-mono text-xs whitespace-pre bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)] overflow-x-auto">
              {JSON_EXAMPLE}
            </pre>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">What happens next</h2>
            <ol className="space-y-2 text-sm list-decimal pl-5">
              <li>Schema check. Required fields present, source URL resolves, license stated.</li>
              <li>Manual review. Controls, sample size, and methodology fit.</li>
              <li>Provisional listing. Visible limitations, flagged status, no composite score.</li>
              <li>Scoring. Once metrics are computed, the run moves from unscored to scored under the current methodology version.</li>
            </ol>
          </section>
        </div>
      </Container>
      <div className="h-16" />
    </>
  );
}

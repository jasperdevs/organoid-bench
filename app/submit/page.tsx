import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/section";

const required = [
  "System name and one-sentence description",
  "Lab or source and PI",
  "Benchmark track and task",
  "Organoid type, species, culture age",
  "Recording platform, sampling rate, electrode count",
  "Stimulation protocol, if applicable",
  "Decoder or controller, for closed-loop",
  "N organoids, sessions, batches, labs",
  "Control conditions run and status",
  "Dataset link, code link, paper link",
  "License and known limitations",
];

const PREFILL = [
  "System name:",
  "Lab / PI:",
  "Track (signal-quality / responsiveness / plasticity / closed-loop-learning / retention / reproducibility):",
  "Task:",
  "Organoid type, species, age:",
  "Platform + sampling rate + electrodes:",
  "Stimulation protocol:",
  "Decoder:",
  "N organoids / sessions / batches / labs:",
  "Controls run:",
  "Dataset link:",
  "Code link:",
  "Paper or preprint link:",
  "License:",
  "Known limitations:",
].join("%0A");

const MAILTO = `mailto:jasper.mceligott@gmail.com?subject=${encodeURIComponent(
  "OrganoidBench submission",
)}&body=${PREFILL}`;

export default function SubmitPage() {
  return (
    <>
      <PageHeader
        eyebrow="Submit"
        title="Submit a result, dataset, or correction"
        description="Send one email. Submissions are reviewed and listed provisionally until manually scored."
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
                href="/about#methodology"
                className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]"
              >
                Methodology
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
              If a field is not applicable, write "n/a" with a short reason. Entries with missing required fields are listed as Unscored.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">What happens next</h2>
            <ol className="space-y-2 text-sm list-decimal pl-5">
              <li>Automated schema check, usually within 24 hours.</li>
              <li>Manual review of controls, sample size, and methodology fit.</li>
              <li>Entry is listed provisionally with an explicit flag and visible limitations.</li>
              <li>Once a reviewer scores it, the provisional flag is removed and the entry is graded A to D.</li>
            </ol>
          </section>
        </div>
      </Container>
      <div className="h-16" />
    </>
  );
}

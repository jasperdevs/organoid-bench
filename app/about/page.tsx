import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/section";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [counts, methodology] = await Promise.all([
    Promise.all([
      prisma.benchmarkTrack.count(),
      prisma.system.count(),
      prisma.dataset.count(),
      prisma.source.count(),
      prisma.organization.count(),
      prisma.benchmarkRun.count({ where: { runStatus: { in: ["published", "scored", "provisional"] } } }),
    ]),
    prisma.methodologyVersion.findFirst({ where: { isCurrent: true } }),
  ]);
  const [tracks, systems, datasets, sources, organizations, runs] = counts;

  return (
    <>
      <PageHeader
        eyebrow="About"
        title="What OrganoidBench is, and is not"
        description={
          methodology
            ? `Methodology ${methodology.version}, released ${methodology.releasedAt.toISOString().slice(0, 10)}.`
            : "Methodology not yet seeded."
        }
      />

      <Container>
        <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-10 max-w-4xl">
          <aside className="hidden md:block">
            <div className="sticky top-24 text-xs text-[color:var(--foreground-muted)] space-y-3">
              <div>
                <div>Registry size</div>
                <div className="mt-1 grid grid-cols-2 gap-1 font-mono text-[color:var(--foreground)]">
                  <span>tracks</span><span className="text-right">{tracks}</span>
                  <span>systems</span><span className="text-right">{systems}</span>
                  <span>datasets</span><span className="text-right">{datasets}</span>
                  <span>sources</span><span className="text-right">{sources}</span>
                  <span>labs</span><span className="text-right">{organizations}</span>
                  <span>runs</span><span className="text-right">{runs}</span>
                </div>
              </div>
              <div>
                <div>See also</div>
                <div className="mt-1 flex flex-col gap-1">
                  <Link href="/methodology" className="hover:underline">Methodology</Link>
                  <Link href="/docs" className="hover:underline">API</Link>
                  <Link href="/submit" className="hover:underline">Submit</Link>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex flex-col gap-10 text-[14px] leading-relaxed">
            <Section title="What it is">
              <p>
                OrganoidBench is a source-backed registry of electrophysiology experiments in brain organoids, cortical spheroids, and assembloids. Every entry points to a real paper or data record. Every metric carries a derivation method. Every composite score is tied to a versioned methodology.
              </p>
              <p className="mt-3 text-[color:var(--foreground-muted)]">
                The database is the only source of truth. Pages render what is in the database. When a field is unknown, the site says so, rather than inventing a value.
              </p>
            </Section>

            <Section title="What it is not">
              <ul className="list-disc pl-5 space-y-1 text-[color:var(--foreground-muted)]">
                <li>Not a data-generation pipeline. OrganoidBench does not run experiments.</li>
                <li>Not a consciousness or sentience benchmark. Only electrophysiological signals and closed-loop task behavior are tracked.</li>
                <li>Not hand-curated into a fake-pretty table. Listings stay empty until real sources are ingested.</li>
              </ul>
            </Section>

            <Section title="How entries are added">
              <ol className="list-decimal pl-5 space-y-1 text-[color:var(--foreground-muted)]">
                <li>Ingestion scripts fetch source metadata from Zenodo, Figshare, DANDI, or GitHub.</li>
                <li>Submissions via <Link href="/submit" className="underline">email</Link> or <code className="font-mono text-xs">POST /api/v1/submissions</code>.</li>
                <li>Review: source URLs must resolve, controls must be stated, sample sizes must be recorded.</li>
                <li>Scoring: runs move from <code className="font-mono text-xs">unscored</code> to <code className="font-mono text-xs">scored</code> only after metrics are computed under the current methodology.</li>
              </ol>
            </Section>

            <Section title="Contact">
              <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 flex flex-wrap items-center justify-between gap-3">
                <a href="mailto:jasper.mceligott@gmail.com" className="font-mono text-sm underline underline-offset-4">
                  jasper.mceligott@gmail.com
                </a>
                <div className="flex gap-2">
                  <Link href="/submit" className="inline-flex items-center rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] px-4 py-2 text-sm font-medium hover:opacity-90">
                    Submit
                  </Link>
                  <Link href="/docs" className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]">
                    API docs
                  </Link>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-2xl leading-tight mb-3">{title}</h2>
      <div className="text-[14px] leading-relaxed">{children}</div>
    </section>
  );
}

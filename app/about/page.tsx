import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/section";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const counts = await Promise.all([
    prisma.benchmarkTrack.count(),
    prisma.system.count(),
    prisma.dataset.count(),
    prisma.source.count(),
    prisma.organization.count(),
    prisma.benchmarkRun.count({ where: { runStatus: { in: ["published", "scored", "provisional"] } } }),
  ]);
  const [tracks, systems, datasets, sources, organizations, runs] = counts;

  return (
    <>
      <PageHeader
        eyebrow="About"
        title="About OrganoidBench"
        description="A benchmark registry for brain organoid systems."
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
                  <Link href="/submit" className="hover:underline">Submit</Link>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex flex-col gap-10 text-[14px] leading-relaxed">
            <Section title="Scope">
              <p>
                OrganoidBench tracks datasets, systems, and benchmark results for brain organoid experiments.
              </p>
              <p className="mt-3 text-[color:var(--foreground-muted)]">
                Entries are linked to public sources and data records.
              </p>
            </Section>

            <Section title="Boundaries">
              <ul className="list-disc pl-5 space-y-1 text-[color:var(--foreground-muted)]">
                <li>OrganoidBench does not run experiments.</li>
                <li>OrganoidBench does not make claims about consciousness or sentience.</li>
              </ul>
            </Section>

            <Section title="How entries are added">
              <ol className="list-decimal pl-5 space-y-1 text-[color:var(--foreground-muted)]">
                <li>Sources and datasets are imported from public records.</li>
                <li>Submissions are reviewed on GitHub.</li>
                <li>Scores are added only after curator review.</li>
              </ol>
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

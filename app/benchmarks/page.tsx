import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/section";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BenchmarksIndex() {
  const tracks = await prisma.benchmarkTrack.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      metrics: { select: { slug: true, name: true } },
      tasks: { select: { slug: true, name: true } },
      _count: { select: { runs: true } },
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Benchmarks"
        title="Tracks"
        description="Each track covers a different part of organoid electrophysiology or closed-loop behavior."
      />
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.map((t, i) => (
            <Link
              key={t.slug}
              href={`/benchmarks/${t.slug}`}
              className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 hover:border-[color:var(--foreground)] transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-mono text-[color:var(--foreground-muted)]">
                    Track {String(i + 1).padStart(2, "0")}
                  </div>
                  <h2 className="mt-1 font-serif text-2xl leading-tight">{t.name}</h2>
                  <p className="mt-2 text-sm text-[color:var(--foreground-muted)] max-w-sm">{t.description}</p>
                </div>
                <span className="inline-flex items-center rounded-full border border-[color:var(--border)] px-2.5 py-0.5 text-xs font-mono whitespace-nowrap">
                  {t._count.runs} runs
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-[color:var(--foreground-muted)] mb-1">Metrics</div>
                  <ul className="text-sm space-y-0.5">
                    {t.metrics.slice(0, 4).map((m) => (
                      <li key={m.slug}>{m.name}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs text-[color:var(--foreground-muted)] mb-1">Tasks</div>
                  <ul className="text-sm space-y-0.5 text-[color:var(--foreground-muted)]">
                    {t.tasks.map((task) => (
                      <li key={task.slug}>{task.name}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {t.rationale && (
                <div className="mt-5 rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface-alt)] p-3 text-xs text-[color:var(--foreground-muted)]">
                  {t.rationale}
                </div>
              )}
            </Link>
          ))}
        </div>
      </Container>
      <div className="h-16" />
    </>
  );
}

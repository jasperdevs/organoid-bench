import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/section";
import { TRACKS, SYSTEMS } from "@/lib/data";

export default function BenchmarksIndex() {
  return (
    <>
      <PageHeader
        eyebrow="Benchmark tracks"
        title="Six standardized tracks"
        description="Every system is evaluated on one or more tracks. Tracks are scored independently so strong results on one dimension cannot mask weak controls on another."
      />
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRACKS.map((t, i) => {
            const systemsInTrack = SYSTEMS.filter((s) => s.track === t.id);
            const top = [...systemsInTrack].sort((a, b) => b.metrics.composite - a.metrics.composite)[0];
            return (
              <Link
                key={t.id}
                href={`/benchmarks/${t.id}`}
                className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 hover:border-[color:var(--foreground)] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono text-[color:var(--foreground-muted)]">
                      Track {String(i + 1).padStart(2, "0")}
                    </div>
                    <h2 className="mt-1 font-serif text-2xl leading-tight">{t.name}</h2>
                    <p className="mt-2 text-sm text-[color:var(--foreground-muted)] max-w-sm">
                      {t.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-[color:var(--border)] px-2.5 py-0.5 text-xs whitespace-nowrap">
                    {systemsInTrack.length} systems
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-[color:var(--foreground-muted)] mb-1">Measures</div>
                    <ul className="text-sm space-y-0.5">
                      {t.measures.slice(0, 4).map((m) => (
                        <li key={m}>· {m}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs text-[color:var(--foreground-muted)] mb-1">Does not measure</div>
                    <ul className="text-sm space-y-0.5 text-[color:var(--foreground-muted)]">
                      {t.excludes.slice(0, 4).map((m) => (
                        <li key={m}>· {m}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {top && (
                  <div className="mt-5 rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface-alt)] p-3">
                    <div className="text-xs text-[color:var(--foreground-muted)]">Current top</div>
                    <div className="mt-0.5 font-medium truncate">{top.name}</div>
                    <div className="text-xs font-mono text-[color:var(--foreground-muted)]">
                      Composite {top.metrics.composite.toFixed(2)} · Grade {top.grade}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </Container>
      <div className="h-16" />
    </>
  );
}

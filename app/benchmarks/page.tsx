import Link from "next/link";
import { PageHeader, Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TRACKS, SYSTEMS } from "@/lib/data";

export default function BenchmarksIndex() {
  return (
    <>
      <PageHeader
        eyebrow="benchmark tracks"
        title="six standardized tracks"
        description="Every system is evaluated on one or more tracks. Tracks are scored independently so that strong results on one dimension cannot mask weak controls on another."
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRACKS.map((t, i) => {
            const systemsInTrack = SYSTEMS.filter((s) => s.track === t.id);
            const top = [...systemsInTrack].sort(
              (a, b) => b.metrics.composite - a.metrics.composite,
            )[0];
            return (
              <Card key={t.id} className="flex flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)]">
                      track {String(i + 1).padStart(2, "0")}
                    </div>
                    <h2 className="mt-1 text-2xl font-semibold">{t.name}</h2>
                    <p className="mt-1 text-sm text-[color:var(--foreground-muted)] max-w-sm">
                      {t.description}
                    </p>
                  </div>
                  <Badge tone="outline">{systemsInTrack.length} systems</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-1">
                      measures
                    </div>
                    <ul className="text-sm space-y-0.5">
                      {t.measures.slice(0, 5).map((m) => (
                        <li key={m}>· {m}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-1">
                      does not measure
                    </div>
                    <ul className="text-sm space-y-0.5 text-[color:var(--foreground-muted)]">
                      {t.excludes.map((m) => (
                        <li key={m}>· {m}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {top && (
                  <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface-alt)] p-3">
                    <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)]">
                      current top
                    </div>
                    <Link
                      href={`/systems/${top.id}`}
                      className="mt-0.5 block font-medium hover:underline"
                    >
                      {top.name}
                    </Link>
                    <div className="text-xs font-mono text-[color:var(--foreground-muted)]">
                      composite {top.metrics.composite.toFixed(2)} · grade {top.grade}
                    </div>
                  </div>
                )}

                <Link
                  href={`/benchmarks/${t.id}`}
                  className="mt-auto text-sm underline underline-offset-4"
                >
                  open track →
                </Link>
              </Card>
            );
          })}
        </div>
      </Section>
    </>
  );
}

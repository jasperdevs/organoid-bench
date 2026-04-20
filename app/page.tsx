import Link from "next/link";
import { Container } from "@/components/ui/section";
import { BarChart } from "@/components/bar-chart";
import { ScatterChart } from "@/components/scatter-chart";
import { LineChart } from "@/components/line-chart";
import {
  SYSTEMS,
  RECENT_UPDATES,
  STATUS_COUNTS,
  TRACKS,
  labColor,
} from "@/lib/data";

export default function Home() {
  const topByLearning = [...SYSTEMS]
    .filter((s) => s.metrics.learning > 0)
    .sort((a, b) => b.metrics.learning - a.metrics.learning)
    .slice(0, 8)
    .map((s) => ({
      label: s.name.split(":")[0].trim().slice(0, 22),
      sublabel: s.source,
      value: Math.round(s.metrics.learning * 100),
      color: labColor(s.source),
    }));

  const topBySignal = [...SYSTEMS]
    .sort((a, b) => b.metrics.signal - a.metrics.signal)
    .slice(0, 8)
    .map((s) => ({
      label: s.name.split(":")[0].trim().slice(0, 22),
      sublabel: s.source,
      value: Math.round(s.metrics.signal * 100),
      color: labColor(s.source),
    }));

  const topByPlasticity = [...SYSTEMS]
    .filter((s) => s.metrics.plasticity > 0)
    .sort((a, b) => b.metrics.plasticity - a.metrics.plasticity)
    .slice(0, 8)
    .map((s) => ({
      label: s.name.split(":")[0].trim().slice(0, 22),
      sublabel: s.source,
      value: Math.round(s.metrics.plasticity * 100),
      color: labColor(s.source),
    }));

  const scatterPoints = SYSTEMS.map((s) => ({
    id: s.id,
    x: s.metrics.repro * 100,
    y: s.metrics.learning || s.metrics.plasticity || s.metrics.response,
    label: s.name,
    color: labColor(s.source),
    group: s.source,
  }));

  const byYear: Record<number, Record<string, number>> = {};
  for (const s of SYSTEMS) {
    const y = s.paper.year;
    if (!byYear[y]) byYear[y] = {};
    if (!byYear[y][s.source] || byYear[y][s.source] < s.metrics.composite) {
      byYear[y][s.source] = s.metrics.composite;
    }
  }
  const years = Object.keys(byYear).map(Number).sort((a, b) => a - b);
  const allLabs = Array.from(new Set(SYSTEMS.map((s) => s.source)));
  const series = allLabs.map((lab) => {
    const points: { x: number; y: number }[] = [];
    let best = 0;
    years.forEach((y, i) => {
      const v = byYear[y][lab];
      if (v !== undefined) best = Math.max(best, v);
      if (best > 0) points.push({ x: i, y: best });
    });
    return {
      id: lab,
      label: lab,
      color: labColor(lab),
      points,
    };
  }).filter((s) => s.points.length > 0);

  return (
    <>
      <div className="pt-14 md:pt-20 pb-12">
        <Container>
          <div className="max-w-3xl">
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.02] tracking-tight">
              Independent<br />analysis of<br />brain organoids
            </h1>
            <p className="mt-6 text-base md:text-lg text-[color:var(--foreground-muted)] max-w-xl">
              Compare organoid systems across six standardized benchmark tracks. Every score ties to a paper, dataset, and reproducibility check.
            </p>
            <div className="mt-8 flex flex-wrap gap-6 text-sm">
              <Stat label="Systems" value={STATUS_COUNTS.systems} />
              <Stat label="Labs" value={STATUS_COUNTS.labs} />
              <Stat label="Datasets" value={STATUS_COUNTS.datasets} />
              <Stat label="Organoids" value={STATUS_COUNTS.organoids} />
              <Stat label="Methodology" value={STATUS_COUNTS.methodologyVersion} />
              <Stat label="Updated" value={STATUS_COUNTS.lastUpdated} />
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="border-b border-[color:var(--border)] pb-3 mb-5">
          <h2 className="text-base font-semibold">Highlights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HighlightCard
            title="Closed-loop learning"
            subtitle="Task improvement under contingent feedback (0 to 100)."
          >
            <BarChart bars={topByLearning} />
          </HighlightCard>
          <HighlightCard
            title="Signal quality"
            subtitle="Active channels, stability, SNR (0 to 100)."
          >
            <BarChart bars={topBySignal} />
          </HighlightCard>
          <HighlightCard
            title="Plasticity"
            subtitle="Induction effect size, paired vs unpaired (0 to 100)."
          >
            <BarChart bars={topByPlasticity} />
          </HighlightCard>
        </div>
      </Container>

      <Container>
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-5">
          <div className="flex flex-col gap-3">
            <FeatureCard
              title="Compare systems across 6 benchmark tracks"
              subtitle="Signal, response, plasticity, learning, retention, reproducibility. Each scored independently."
              href="/benchmarks"
            />
            <FeatureCard
              title="Ranked leaderboard with controls and replication grades"
              subtitle="Every entry scored on public metrics with open data availability flags."
              href="/leaderboards"
            />
            <FeatureCard
              title="How are scores calculated?"
              subtitle="Read the methodology, confidence grades, and versioning in full."
              href="/about#methodology"
            />
          </div>
          <div className="bg-[color:var(--surface-alt)] rounded-[16px] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Recent updates</h3>
              <Link
                href="/about#changelog"
                className="h-7 w-7 rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] grid place-items-center"
                aria-label="Open changelog"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 9L9 3M9 3H4M9 3v5" stroke="currentColor" strokeWidth="1.5" /></svg>
              </Link>
            </div>
            <ul className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
              {RECENT_UPDATES.map((u, i) => (
                <li key={i} className="flex gap-3">
                  <div className="mt-1.5 shrink-0 h-2 w-2 rounded-full bg-[color:var(--foreground)]" />
                  <div className="min-w-0">
                    <div className="text-xs text-[color:var(--foreground-muted)]">
                      {u.type} · {new Date(u.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                    <Link href={u.href || "#"} className="text-sm font-medium hover:underline">
                      {u.text}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <Container>
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="text-sm text-[color:var(--foreground-muted)] mb-3">On this page</div>
            <ul className="space-y-2 text-sm">
              <li><a className="font-medium" href="#leaderboards">Leaderboards</a></li>
              <li><a className="text-[color:var(--foreground-muted)]" href="#over-time">Frontier over time</a></li>
              <li><a className="text-[color:var(--foreground-muted)]" href="#tradeoff">Reproducibility vs effect</a></li>
              <li><a className="text-[color:var(--foreground-muted)]" href="#tracks">Benchmark tracks</a></li>
            </ul>
          </aside>
          <div className="min-w-0 space-y-10">
            <section id="leaderboards">
              <h2 className="font-serif text-3xl mb-2">Leaderboards</h2>
              <p className="text-sm text-[color:var(--foreground-muted)] mb-6 max-w-xl">
                Top 12 systems by composite score. Methodology {STATUS_COUNTS.methodologyVersion}, last refreshed {STATUS_COUNTS.lastUpdated}.
              </p>
              <div className="border border-[color:var(--border)] rounded-[16px] p-5 bg-[color:var(--surface)]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm font-semibold">Composite score</div>
                    <div className="text-xs text-[color:var(--foreground-muted)]">0 to 100, higher is better. Bar color indicates the originating lab.</div>
                  </div>
                  <Link href="/leaderboards" className="text-sm underline underline-offset-4">
                    Open full leaderboard
                  </Link>
                </div>
                <BarChart
                  bars={[...SYSTEMS]
                    .sort((a, b) => b.metrics.composite - a.metrics.composite)
                    .slice(0, 12)
                    .map((s) => ({
                      label: s.name.split(":")[0].trim().slice(0, 22),
                      sublabel: s.source,
                      value: Math.round(s.metrics.composite * 100),
                      color: labColor(s.source),
                    }))}
                  height={340}
                />
              </div>
            </section>

            <section id="over-time">
              <h2 className="font-serif text-3xl mb-2">Frontier over time</h2>
              <p className="text-sm text-[color:var(--foreground-muted)] mb-6 max-w-xl">
                Best composite score reached by each source over publication year. Cumulative maximum.
              </p>
              <div className="border border-[color:var(--border)] rounded-[16px] p-5 bg-[color:var(--surface)]">
                <LineChart
                  series={series}
                  xLabels={years.map(String)}
                  yLabel="Composite"
                  yMax={1}
                  height={320}
                />
              </div>
            </section>

            <section id="tradeoff">
              <h2 className="font-serif text-3xl mb-2">Reproducibility vs effect</h2>
              <p className="text-sm text-[color:var(--foreground-muted)] mb-6 max-w-xl">
                Highlighted quadrant: high reproducibility and meaningful learning or plasticity effect.
              </p>
              <div className="border border-[color:var(--border)] rounded-[16px] p-5 bg-[color:var(--surface)]">
                <ScatterChart
                  points={scatterPoints}
                  xLabel="Reproducibility (0 to 100)"
                  yLabel="Learning or plasticity"
                  xMin={0}
                  xMax={100}
                  yMin={0}
                  yMax={1}
                  height={380}
                />
              </div>
            </section>

            <section id="tracks">
              <h2 className="font-serif text-3xl mb-2">Benchmark tracks</h2>
              <p className="text-sm text-[color:var(--foreground-muted)] mb-6 max-w-xl">
                Six tracks cover the full stack, from recording quality to reproducibility.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {TRACKS.map((t) => {
                  const top = [...SYSTEMS]
                    .filter((s) => s.track === t.id)
                    .sort((a, b) => b.metrics.composite - a.metrics.composite)[0];
                  return (
                    <Link
                      key={t.id}
                      href={`/benchmarks/${t.id}`}
                      className="border border-[color:var(--border)] rounded-[16px] p-4 bg-[color:var(--surface)] hover:border-[color:var(--border-strong)]"
                    >
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-[color:var(--foreground-muted)] mt-1">
                        {t.short}.
                      </div>
                      {top && (
                        <div className="mt-3 text-xs">
                          <span className="text-[color:var(--foreground-muted)]">Top</span>{" "}
                          <span className="font-medium">{top.name}</span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </Container>

      <div className="h-16" />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xs text-[color:var(--foreground-muted)]">{label}</div>
      <div className="font-mono font-semibold text-base">{value}</div>
    </div>
  );
}

function HighlightCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[color:var(--border)] rounded-[16px] p-4 bg-[color:var(--surface)]">
      <div>
        <div className="font-semibold text-base">{title}</div>
        <div className="text-xs text-[color:var(--foreground-muted)] mt-1">{subtitle}</div>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function FeatureCard({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[16px] p-5 relative group block bg-[color:var(--surface-alt)] border border-[color:var(--border)] hover:border-[color:var(--border-strong)]"
    >
      <span className="absolute top-5 right-5 h-8 w-8 rounded-[8px] bg-[color:var(--foreground)] text-[color:var(--background)] grid place-items-center">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 11L11 3M11 3H5M11 3v6" stroke="currentColor" strokeWidth="1.5" /></svg>
      </span>
      <div className="font-medium text-[color:var(--foreground)] max-w-md pr-10">{title}</div>
      <div className="text-sm text-[color:var(--foreground-muted)] mt-1 max-w-md">{subtitle}</div>
    </Link>
  );
}

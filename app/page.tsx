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
  trackById,
} from "@/lib/data";

const chartColors = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)",
  "var(--chart-5)", "var(--chart-6)", "var(--chart-7)", "var(--chart-8)",
];

export default function Home() {
  const topByLearning = [...SYSTEMS]
    .filter((s) => s.metrics.learning > 0)
    .sort((a, b) => b.metrics.learning - a.metrics.learning)
    .slice(0, 10)
    .map((s, i) => ({ label: s.name.split("—")[0].trim().slice(0, 22), value: Math.round(s.metrics.learning * 100), color: chartColors[i % 8] }));

  const topBySignal = [...SYSTEMS]
    .sort((a, b) => b.metrics.signal - a.metrics.signal)
    .slice(0, 10)
    .map((s, i) => ({ label: s.name.split("—")[0].trim().slice(0, 22), value: Math.round(s.metrics.signal * 100), color: chartColors[i % 8] }));

  const topByPlasticity = [...SYSTEMS]
    .filter((s) => s.metrics.plasticity > 0)
    .sort((a, b) => b.metrics.plasticity - a.metrics.plasticity)
    .slice(0, 10)
    .map((s, i) => ({ label: s.name.split("—")[0].trim().slice(0, 22), value: Math.round(s.metrics.plasticity * 100), color: chartColors[i % 8] }));

  const scatterPoints = SYSTEMS.map((s, i) => ({
    id: s.id,
    x: s.metrics.repro * 100,
    y: s.metrics.learning || s.metrics.plasticity || s.metrics.response,
    label: s.name,
    color: chartColors[i % 8],
  }));

  const byYear: Record<number, { labs: Set<string>; max: Record<string, number> }> = {};
  for (const s of SYSTEMS) {
    const y = s.paper.year;
    if (!byYear[y]) byYear[y] = { labs: new Set(), max: {} };
    byYear[y].labs.add(s.source);
    if (!byYear[y].max[s.source] || byYear[y].max[s.source] < s.metrics.composite) {
      byYear[y].max[s.source] = s.metrics.composite;
    }
  }
  const years = Object.keys(byYear).map(Number).sort((a, b) => a - b);
  const labColors: Record<string, string> = {};
  const allLabs = Array.from(new Set(SYSTEMS.map((s) => s.source)));
  allLabs.forEach((l, i) => (labColors[l] = chartColors[i % 8]));
  const series = allLabs.slice(0, 8).map((lab) => {
    const points: { x: number; y: number }[] = [];
    let best = 0;
    years.forEach((y, i) => {
      const v = byYear[y].max[lab];
      if (v !== undefined) best = Math.max(best, v);
      points.push({ x: i, y: best });
    });
    return {
      id: lab,
      label: lab,
      color: labColors[lab],
      points: points.filter((p) => p.y > 0),
    };
  }).filter((s) => s.points.length > 0);

  return (
    <>
      <div className="pt-14 md:pt-20 pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
            <div>
              <h1 className="font-serif text-5xl md:text-7xl leading-[1.02] tracking-tight">
                Independent<br />analysis of<br />brain organoids
              </h1>
              <p className="mt-6 text-base md:text-lg text-[color:var(--foreground-muted)] max-w-lg">
                Understand the organoid systems landscape to choose the best platform, protocol, and dataset for your work.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Announcement
                tag="Announcement"
                title="A new look for OrganoidBench"
                subtitle="Same mission, refreshed design and expanded dataset coverage."
              />
              <Announcement
                tag="Now live"
                title="Cross-lab plasticity panel"
                subtitle="58 organoids, 10 batches, 4 labs — harmonised induction protocols."
                href="/systems/ob-sys-0018"
              />
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="border-b border-[color:var(--border)] pb-3 mb-5">
          <h2 className="text-base font-semibold">Highlights</h2>
        </div>
      </Container>

      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HighlightCard
            title="Learning"
            subtitle="Closed-loop learning score (0–100, higher is better)"
            swatch="var(--chart-5)"
          >
            <BarChart bars={topByLearning} unit="score" />
          </HighlightCard>
          <HighlightCard
            title="Signal"
            subtitle="Signal quality score (0–100, higher is better)"
            swatch="var(--chart-6)"
          >
            <BarChart bars={topBySignal} unit="score" />
          </HighlightCard>
          <HighlightCard
            title="Plasticity"
            subtitle="Induction effect score (0–100, higher is better)"
            swatch="var(--chart-1)"
          >
            <BarChart bars={topByPlasticity} unit="score" />
          </HighlightCard>
        </div>
      </Container>

      <Container>
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-5">
          <div className="flex flex-col gap-3">
            <FeatureCard
              bg="#F4EEFC"
              swatch="#B583D0"
              title="Compare systems across 6 benchmark tracks"
              subtitle="Explore signal quality, responsiveness, plasticity, closed-loop learning, retention, and reproducibility."
              href="/benchmarks"
            />
            <FeatureCard
              bg="#EDE6FA"
              swatch="#8A5CD6"
              title="Ranked leaderboard with controls and replication grades"
              subtitle="Every entry is scored on public metrics with open data availability flags."
              href="/leaderboards"
            />
            <FeatureCard
              bg="#E1D1F5"
              swatch="#6E3BCF"
              title="How are scores calculated?"
              subtitle="Methodology, confidence grades, and versioning."
              href="/about#methodology"
            />
          </div>
          <div className="bg-[color:var(--surface-alt)] rounded-[16px] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Changelog</h3>
              <Link
                href="/about#changelog"
                className="h-7 w-7 rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] grid place-items-center"
                aria-label="Open changelog"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 9L9 3M9 3H4M9 3v5" stroke="currentColor" strokeWidth="1.5" /></svg>
              </Link>
            </div>
            <ul className="space-y-4">
              {RECENT_UPDATES.slice(0, 5).map((u, i) => (
                <li key={i} className="flex gap-3">
                  <div className="mt-1.5 shrink-0 h-2 w-2 rounded-full bg-[color:var(--foreground)]" />
                  <div className="min-w-0">
                    <div className="text-xs text-[color:var(--foreground-muted)]">
                      {u.type} · {new Date(u.date).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
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
            <div className="text-sm text-[color:var(--foreground-muted)] mb-3">
              On this page
            </div>
            <ul className="space-y-2 text-sm">
              <li><a className="font-medium" href="#leaderboards">Leaderboards</a></li>
              <li><a className="text-[color:var(--foreground-muted)]" href="#over-time">Performance over time</a></li>
              <li><a className="text-[color:var(--foreground-muted)]" href="#tradeoff">Replication vs learning</a></li>
              <li><a className="text-[color:var(--foreground-muted)]" href="#tracks">Benchmark tracks</a></li>
            </ul>
          </aside>
          <div className="min-w-0 space-y-10">
            <section id="leaderboards">
              <h2 className="font-serif text-3xl mb-2">Leaderboards</h2>
              <p className="text-sm text-[color:var(--foreground-muted)] mb-6 max-w-xl">
                Top 10 organoid systems by composite score. Based on methodology {STATUS_COUNTS.methodologyVersion}.
              </p>
              <div className="border border-[color:var(--border)] rounded-[16px] p-5 bg-[color:var(--surface)]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm font-semibold">Composite score</div>
                    <div className="text-xs text-[color:var(--foreground-muted)]">0–100 · higher is better</div>
                  </div>
                  <Link href="/leaderboards" className="text-sm underline underline-offset-4">
                    Open full leaderboard
                  </Link>
                </div>
                <BarChart
                  bars={[...SYSTEMS]
                    .sort((a, b) => b.metrics.composite - a.metrics.composite)
                    .slice(0, 12)
                    .map((s, i) => ({
                      label: s.name.split("—")[0].trim().slice(0, 22),
                      value: Math.round(s.metrics.composite * 100),
                      color: chartColors[i % 8],
                    }))}
                  height={340}
                  unit="score"
                />
              </div>
            </section>

            <section id="over-time">
              <h2 className="font-serif text-3xl mb-2">Frontier over time</h2>
              <p className="text-sm text-[color:var(--foreground-muted)] mb-6 max-w-xl">
                Best composite score reached by each source over publication year.
              </p>
              <div className="border border-[color:var(--border)] rounded-[16px] p-5 bg-[color:var(--surface)]">
                <LineChart
                  series={series}
                  xLabels={years.map(String)}
                  yLabel="composite"
                  yMax={1}
                  height={320}
                />
              </div>
            </section>

            <section id="tradeoff">
              <h2 className="font-serif text-3xl mb-2">Replication vs learning</h2>
              <p className="text-sm text-[color:var(--foreground-muted)] mb-6 max-w-xl">
                Highlighted quadrant: high reproducibility plus meaningful learning effect.
              </p>
              <div className="border border-[color:var(--border)] rounded-[16px] p-5 bg-[color:var(--surface)]">
                <ScatterChart
                  points={scatterPoints}
                  xLabel="Reproducibility (0–100)"
                  yLabel="Learning / effect"
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

function Announcement({
  tag,
  title,
  subtitle,
  href,
}: {
  tag: string;
  title: string;
  subtitle: string;
  href?: string;
}) {
  const Content = (
    <div className="border border-[color:var(--border)] rounded-[16px] p-4 bg-[color:var(--surface)] relative group">
      <div className="inline-flex items-center rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] text-[11px] px-2.5 py-1">
        {tag}
      </div>
      <div className="mt-3 font-semibold">{title}</div>
      <div className="text-sm text-[color:var(--foreground-muted)] mt-1">{subtitle}</div>
      <div className="absolute top-4 right-4 text-[color:var(--foreground-muted)] group-hover:text-[color:var(--foreground)]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 11L11 3M11 3H5M11 3v6" stroke="currentColor" strokeWidth="1.5" /></svg>
      </div>
    </div>
  );
  return href ? <Link href={href}>{Content}</Link> : Content;
}

function HighlightCard({
  title,
  subtitle,
  swatch,
  children,
}: {
  title: string;
  subtitle: string;
  swatch: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[color:var(--border)] rounded-[16px] p-4 bg-[color:var(--surface)]">
      <div className="flex items-start gap-2 mb-1">
        <span className="mt-1.5 h-3 w-3 rounded-[2px]" style={{ background: swatch }} />
        <div>
          <div className="font-semibold text-base">{title}</div>
          <div className="text-xs text-[color:var(--foreground-muted)]">{subtitle}</div>
        </div>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function FeatureCard({
  bg,
  swatch,
  title,
  subtitle,
  href,
}: {
  bg: string;
  swatch: string;
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[16px] p-5 relative group block"
      style={{ background: bg }}
    >
      <span className="absolute top-5 right-5 h-8 w-8 rounded-[8px] bg-[color:var(--foreground)] text-[color:var(--background)] grid place-items-center">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 11L11 3M11 3H5M11 3v6" stroke="currentColor" strokeWidth="1.5" /></svg>
      </span>
      <span className="inline-block h-3 w-3 rounded-[2px]" style={{ background: swatch }} />
      <div className="mt-3 font-medium text-[color:#1a0845] max-w-md">{title}</div>
      <div className="text-sm text-[color:#5a3c8a] mt-1 max-w-md">{subtitle}</div>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { BarChart } from "@/components/bar-chart";
import { ScatterChart } from "@/components/scatter-chart";
import { LineChart } from "@/components/line-chart";
import { SYSTEMS, TRACKS, trackById, labColor, type Track } from "@/lib/data";

const sections = [
  { id: "composite-index", label: "Composite Index" },
  { id: "by-track", label: "By Track" },
  { id: "frontier", label: "Frontier Over Time" },
  { id: "tradeoffs", label: "Trade-offs" },
  { id: "availability", label: "Data Availability" },
  { id: "table", label: "Full Table" },
];

const metricTabs: { id: keyof typeof metricLabels; label: string }[] = [
  { id: "composite", label: "Composite" },
  { id: "learning", label: "Learning" },
  { id: "signal", label: "Signal" },
  { id: "response", label: "Response" },
  { id: "plasticity", label: "Plasticity" },
  { id: "retention", label: "Retention" },
  { id: "repro", label: "Reproducibility" },
];

const metricLabels = {
  composite: "Composite score",
  signal: "Signal quality",
  response: "Responsiveness",
  plasticity: "Plasticity",
  learning: "Closed-loop learning",
  retention: "Retention",
  repro: "Reproducibility",
};

type MetricKey = keyof typeof metricLabels;

export function LeaderboardView() {
  const [metric, setMetric] = useState<MetricKey>("composite");
  const [trackFilter, setTrackFilter] = useState<Track | "all">("all");
  const [tradeoffX, setTradeoffX] = useState<MetricKey>("repro");
  const [tradeoffY, setTradeoffY] = useState<MetricKey>("learning");

  const filtered = useMemo(() => {
    return trackFilter === "all" ? SYSTEMS : SYSTEMS.filter((s) => s.track === trackFilter);
  }, [trackFilter]);

  const sorted = useMemo(() => {
    return [...filtered]
      .filter((s) => s.metrics[metric] > 0)
      .sort((a, b) => b.metrics[metric] - a.metrics[metric]);
  }, [filtered, metric]);

  const topBars = sorted.slice(0, 25).map((s) => ({
    label: s.name.split(":")[0].trim().slice(0, 22),
    sublabel: s.source,
    value: Math.round(s.metrics[metric] * 100),
    color: labColor(s.source),
  }));

  const scatterPoints = SYSTEMS.filter(
    (s) => s.metrics[tradeoffX] > 0 && s.metrics[tradeoffY] > 0,
  ).map((s) => ({
    id: s.id,
    x: s.metrics[tradeoffX] * 100,
    y: s.metrics[tradeoffY],
    label: s.name,
    color: labColor(s.source),
    group: s.source,
  }));

  const allSources = Array.from(new Set(SYSTEMS.map((s) => s.source)));
  const byYear: Record<number, Record<string, number>> = {};
  for (const s of SYSTEMS) {
    const y = s.paper.year;
    if (!byYear[y]) byYear[y] = {};
    if (!byYear[y][s.source] || byYear[y][s.source] < s.metrics.composite) {
      byYear[y][s.source] = s.metrics.composite;
    }
  }
  const years = Object.keys(byYear).map(Number).sort((a, b) => a - b);
  const series = allSources.map((lab) => {
    const pts: { x: number; y: number }[] = [];
    let best = 0;
    years.forEach((y, i) => {
      if (byYear[y][lab] !== undefined) best = Math.max(best, byYear[y][lab]);
      if (best > 0) pts.push({ x: i, y: best });
    });
    return { id: lab, label: lab, color: labColor(lab), points: pts };
  }).filter((s) => s.points.length > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 mt-2">
      <aside className="lg:sticky lg:top-24 self-start">
        <div className="text-sm text-[color:var(--foreground-muted)] mb-3">On this page</div>
        <ul className="space-y-2 text-sm">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="flex items-center gap-2 text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]">
                <span className="h-1.5 w-1.5 rounded-[2px] bg-[color:var(--border-strong)]" />
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </aside>

      <div className="min-w-0 space-y-12">
        <section id="composite-index">
          <h2 className="font-serif text-3xl mb-2">{metricLabels[metric]}</h2>
          <p className="text-sm text-[color:var(--foreground-muted)] mb-5 max-w-xl">
            Top organoid systems by selected metric. Scores are normalised 0 to 100.
          </p>
          <div className="flex items-center bg-[color:var(--surface-alt)] rounded-full p-1 gap-0.5 mb-4 overflow-x-auto">
            {metricTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setMetric(t.id)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                  metric === t.id
                    ? "bg-[color:var(--foreground)] text-[color:var(--background)]"
                    : "text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="border border-[color:var(--border)] rounded-[16px] p-5 bg-[color:var(--surface)]">
            <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
              <div>
                <div className="font-semibold">{metricLabels[metric]}</div>
                <div className="text-xs text-[color:var(--foreground-muted)]">
                  {sorted.length} of {filtered.length} systems shown
                </div>
              </div>
              <select
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value as Track | "all")}
                className="h-9 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm"
              >
                <option value="all">All tracks</option>
                {TRACKS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <BarChart bars={topBars} height={360} />
          </div>
        </section>

        <section id="by-track">
          <h2 className="font-serif text-3xl mb-2">By track</h2>
          <p className="text-sm text-[color:var(--foreground-muted)] mb-5 max-w-xl">
            Top system in each of the six benchmark tracks.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {TRACKS.map((t) => {
              const list = [...SYSTEMS]
                .filter((s) => s.track === t.id)
                .sort((a, b) => b.metrics.composite - a.metrics.composite);
              const top = list[0];
              if (!top) return null;
              return (
                <div key={t.id} className="border border-[color:var(--border)] rounded-[16px] p-4 bg-[color:var(--surface)]">
                  <div className="text-xs text-[color:var(--foreground-muted)]">{t.name}</div>
                  <Link href={`/systems/${top.id}`} className="block mt-1 font-medium hover:underline">
                    {top.name}
                  </Link>
                  <div className="text-xs text-[color:var(--foreground-muted)] mt-0.5">
                    {top.source} · grade {top.grade}
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-mono text-2xl">{Math.round(top.metrics.composite * 100)}</span>
                    <span className="text-xs text-[color:var(--foreground-muted)]">composite</span>
                  </div>
                  <Link href={`/benchmarks/${t.id}`} className="mt-3 inline-block text-xs underline underline-offset-4">
                    Open track
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        <section id="frontier">
          <h2 className="font-serif text-3xl mb-2">Frontier over time</h2>
          <p className="text-sm text-[color:var(--foreground-muted)] mb-5 max-w-xl">
            Best composite score reached by each source, as of the paper&apos;s year.
          </p>
          <div className="border border-[color:var(--border)] rounded-[16px] p-5 bg-[color:var(--surface)]">
            <LineChart series={series} xLabels={years.map(String)} yLabel="composite" yMax={1} height={340} />
          </div>
        </section>

        <section id="tradeoffs">
          <h2 className="font-serif text-3xl mb-2">Trade-offs</h2>
          <p className="text-sm text-[color:var(--foreground-muted)] mb-5 max-w-xl">
            How metrics trade off against each other. Highlighted quadrant is the ideal region.
          </p>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[color:var(--foreground-muted)]">X:</span>
              <select
                value={tradeoffX}
                onChange={(e) => setTradeoffX(e.target.value as MetricKey)}
                className="h-9 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm"
              >
                {metricTabs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[color:var(--foreground-muted)]">Y:</span>
              <select
                value={tradeoffY}
                onChange={(e) => setTradeoffY(e.target.value as MetricKey)}
                className="h-9 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm"
              >
                {metricTabs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="border border-[color:var(--border)] rounded-[16px] p-5 bg-[color:var(--surface)]">
            <ScatterChart
              points={scatterPoints}
              xLabel={metricLabels[tradeoffX]}
              yLabel={metricLabels[tradeoffY]}
              xMin={0}
              xMax={100}
              yMin={0}
              yMax={1}
              height={380}
            />
          </div>
        </section>

        <section id="availability">
          <h2 className="font-serif text-3xl mb-2">Data availability</h2>
          <p className="text-sm text-[color:var(--foreground-muted)] mb-5 max-w-xl">
            Share of entries with each artifact type publicly available.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(
              [
                ["Raw traces", "raw"],
                ["Processed data", "processed"],
                ["Code", "code"],
                ["Peer reviewed", "peerReviewed"],
                ["Open dataset", "openDataset"],
              ] as const
            ).map(([label, key]) => {
              const n = SYSTEMS.filter((s) => s.availability[key]).length;
              const pct = Math.round((n / SYSTEMS.length) * 100);
              return (
                <div key={key} className="border border-[color:var(--border)] rounded-[16px] p-4 bg-[color:var(--surface)]">
                  <div className="text-xs text-[color:var(--foreground-muted)]">{label}</div>
                  <div className="mt-2 font-mono text-2xl">{pct}%</div>
                  <div className="text-xs text-[color:var(--foreground-muted)] mt-1">
                    {n} of {SYSTEMS.length}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="table">
          <h2 className="font-serif text-3xl mb-2">Full table</h2>
          <p className="text-sm text-[color:var(--foreground-muted)] mb-5 max-w-xl">
            All {SYSTEMS.length} ranked systems. Click an ID to open the system detail page.
          </p>
          <div className="border border-[color:var(--border)] rounded-[16px] bg-[color:var(--surface)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[color:var(--surface-alt)] text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium text-xs">#</th>
                    <th className="px-4 py-3 font-medium text-xs">System</th>
                    <th className="px-4 py-3 font-medium text-xs">Source</th>
                    <th className="px-4 py-3 font-medium text-xs">Track</th>
                    <th className="px-4 py-3 font-medium text-xs text-right">Composite</th>
                    <th className="px-4 py-3 font-medium text-xs text-right">Learn</th>
                    <th className="px-4 py-3 font-medium text-xs text-right">Signal</th>
                    <th className="px-4 py-3 font-medium text-xs text-right">Plast.</th>
                    <th className="px-4 py-3 font-medium text-xs text-right">Repro</th>
                    <th className="px-4 py-3 font-medium text-xs text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--border)]">
                  {[...SYSTEMS]
                    .sort((a, b) => b.metrics.composite - a.metrics.composite)
                    .map((s, i) => (
                      <tr key={s.id} className="hover:bg-[color:var(--surface-soft)]">
                        <td className="px-4 py-3 font-mono text-xs text-[color:var(--foreground-muted)]">{i + 1}</td>
                        <td className="px-4 py-3">
                          <Link href={`/systems/${s.id}`} className="font-medium hover:underline">
                            {s.name}
                          </Link>
                          <div className="text-xs font-mono text-[color:var(--foreground-muted)]">{s.id}</div>
                        </td>
                        <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{s.source}</td>
                        <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{trackById(s.track).name}</td>
                        <td className="px-4 py-3 font-mono text-right">{(s.metrics.composite * 100).toFixed(0)}</td>
                        <td className="px-4 py-3 font-mono text-right text-[color:var(--foreground-muted)]">
                          {s.metrics.learning ? (s.metrics.learning * 100).toFixed(0) : "-"}
                        </td>
                        <td className="px-4 py-3 font-mono text-right text-[color:var(--foreground-muted)]">
                          {(s.metrics.signal * 100).toFixed(0)}
                        </td>
                        <td className="px-4 py-3 font-mono text-right text-[color:var(--foreground-muted)]">
                          {s.metrics.plasticity ? (s.metrics.plasticity * 100).toFixed(0) : "-"}
                        </td>
                        <td className="px-4 py-3 font-mono text-right text-[color:var(--foreground-muted)]">
                          {(s.metrics.repro * 100).toFixed(0)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center rounded-full w-6 h-6 text-xs font-semibold bg-[color:var(--surface-alt)]">
                            {s.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

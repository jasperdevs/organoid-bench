"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BarChart, type Bar } from "@/components/bar-chart";
import { ScatterChart, type ScatterPoint } from "@/components/scatter-chart";

type ScoreRow = {
  runId: string;
  systemSlug: string;
  systemName: string;
  organizationName: string | null;
  trackSlug: string;
  trackName: string;
  runStatus: string;
  score: number | null;
  confidenceGrade: string | null;
  controlsPassed: number;
  controlsTotal: number;
  nOrganoids: number | null;
  nSessions: number | null;
  nLabs: number | null;
  lastUpdated: string;
};

type AvailabilityRow = { label: string; value: number };
type SourcePlatformRow = { label: string; value: number };
type FileInventoryRow = {
  label: string;
  slug: string;
  fileCount: number;
  totalBytes: number;
};
type TrackRow = {
  slug: string;
  name: string;
  taskCount: number;
  provisionalRunCount: number;
  statusCounts: {
    published: number;
    provisional: number;
    scored: number;
    other: number;
  };
};
type SourceRow = {
  id: string;
  title: string;
  url: string | null;
  doi: string | null;
  repositoryType: string | null;
  datasetCount: number;
  updatedAt: string;
};
type DatasetRow = {
  slug: string;
  name: string;
  updatedAt: string;
  fileCount: number;
};
type Summary = { datasetCount: number; sourceCount: number; runCount: number };

const TRACK_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
];

const SECTIONS = [
  { id: "highlights", label: "Highlights" },
  { id: "changelog", label: "Changelog" },
  { id: "evaluations", label: "Evaluations" },
  { id: "distribution", label: "Score distribution" },
  { id: "coverage", label: "Data coverage" },
  { id: "tracks", label: "Tracks" },
  { id: "datasets", label: "Dataset files" },
  { id: "sources", label: "Sources" },
];

export function HomeDashboard({
  scores,
  availability,
  sourcePlatforms,
  fileInventory,
  tracks,
  sources,
  datasets,
  summary,
}: {
  scores: ScoreRow[];
  availability: AvailabilityRow[];
  sourcePlatforms: SourcePlatformRow[];
  fileInventory: FileInventoryRow[];
  tracks: TrackRow[];
  sources: SourceRow[];
  datasets: DatasetRow[];
  summary: Summary;
}) {
  const trackColorMap = useMemo(() => {
    const map = new Map<string, string>();
    tracks.forEach((t, i) => map.set(t.slug, TRACK_COLORS[i % TRACK_COLORS.length]));
    return map;
  }, [tracks]);

  const scoredRows = useMemo(
    () => scores.filter((row) => row.score != null),
    [scores],
  );

  const trackGroups = useMemo(() => {
    const map = new Map<string, { slug: string; name: string; rows: ScoreRow[] }>();
    for (const row of scoredRows) {
      let entry = map.get(row.trackSlug);
      if (!entry) {
        entry = { slug: row.trackSlug, name: row.trackName, rows: [] };
        map.set(row.trackSlug, entry);
      }
      entry.rows.push(row);
    }
    for (const entry of map.values()) {
      entry.rows.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }
    return Array.from(map.values()).sort((a, b) => b.rows.length - a.rows.length);
  }, [scoredRows]);

  const featuredTracks = trackGroups.slice(0, 3);

  const availabilityBars: Bar[] = availability.map((row, i) => ({
    label: row.label,
    value: row.value,
    color: ["var(--chart-2)", "var(--chart-4)", "var(--chart-5)", "var(--chart-8)"][i] ?? "var(--chart-3)",
  }));

  const platformBars: Bar[] = sourcePlatforms.map((row, i) => ({
    label: titleCase(row.label),
    value: row.value,
    color: ["var(--chart-3)", "var(--chart-5)", "var(--chart-2)", "var(--chart-8)"][i] ?? "var(--chart-4)",
  }));

  const fileBars: Bar[] = fileInventory.slice(0, 10).map((row, i) => ({
    label: row.label,
    value: row.fileCount,
    color: TRACK_COLORS[i % TRACK_COLORS.length],
    sublabel: formatBytes(row.totalBytes),
  }));

  const scatterPoints: ScatterPoint[] = scoredRows
    .filter((r) => (r.nOrganoids ?? 0) > 0 && r.score != null)
    .map((r) => ({
      id: r.runId,
      x: r.nOrganoids ?? 0,
      y: r.score ?? 0,
      label: `${r.systemName} · ${r.trackName}`,
      color: trackColorMap.get(r.trackSlug) ?? "var(--chart-3)",
      group: r.trackSlug,
    }));

  const trackLegend = useMemo(() => {
    const seen = new Set<string>();
    const list: { slug: string; name: string; color: string }[] = [];
    for (const r of scoredRows) {
      if (!seen.has(r.trackSlug)) {
        seen.add(r.trackSlug);
        list.push({
          slug: r.trackSlug,
          name: r.trackName,
          color: trackColorMap.get(r.trackSlug) ?? "var(--chart-3)",
        });
      }
    }
    return list;
  }, [scoredRows, trackColorMap]);

  const changelogItems = useMemo(() => {
    type Item = {
      kind: "source" | "dataset";
      title: string;
      href: string;
      date: string;
      sublabel: string;
    };
    const items: Item[] = [];
    for (const s of sources.slice(0, 6)) {
      items.push({
        kind: "source",
        title: s.title,
        href: s.url ?? `/sources/${s.id}`,
        date: s.updatedAt,
        sublabel: `New source · ${titleCase(s.repositoryType ?? "source")}`,
      });
    }
    for (const d of datasets.slice(0, 6)) {
      items.push({
        kind: "dataset",
        title: d.name,
        href: `/datasets/${d.slug}`,
        date: d.updatedAt,
        sublabel: `Dataset update · ${d.fileCount} file${d.fileCount === 1 ? "" : "s"}`,
      });
    }
    return items.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8);
  }, [sources, datasets]);

  const activeId = useScrollSpy(SECTIONS.map((s) => s.id));

  return (
    <div className="pb-20 pt-2">
      <div className="flex gap-8 lg:gap-10">
        <aside className="hidden lg:block w-[208px] shrink-0">
          <nav className="sticky top-6 flex flex-col">
            <div className="mb-3 text-[11px] uppercase tracking-[0.16em] text-[color:var(--foreground-muted)]">
              On this page
            </div>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`flex items-center gap-2.5 px-3 py-1.5 text-sm ${
                  activeId === s.id
                    ? "font-medium text-[color:var(--foreground)]"
                    : "text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
                }`}
              >
                <span
                  aria-hidden
                  className={`inline-block h-2 w-2 ${activeId === s.id ? "bg-[color:var(--foreground)]" : "bg-[color:var(--border-strong)]"}`}
                />
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-14">
          <section id="highlights" className="scroll-mt-24">
            <SectionHeader
              title="Highlights"
              description="Provisional top-scored systems in the most-run tracks. Higher is better."
              right={
                <Link
                  href="/leaderboards"
                  className="text-sm font-medium underline underline-offset-4"
                >
                  Leaderboard {"\u2192"}
                </Link>
              }
            />
            {featuredTracks.length === 0 ? (
              <EmptyHighlights />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {featuredTracks.map((track, i) => (
                  <HighlightCard
                    key={track.slug}
                    color={TRACK_COLORS[i]}
                    title={track.name}
                    description="Top scored systems"
                    href={`/leaderboards?track=${track.slug}`}
                    bars={track.rows.slice(0, 6).map((row) => ({
                      label: row.systemName,
                      value: row.score ?? 0,
                      color: TRACK_COLORS[i],
                      sublabel: row.organizationName ?? row.confidenceGrade ?? undefined,
                    }))}
                  />
                ))}
              </div>
            )}
          </section>

          <section id="changelog" className="scroll-mt-24">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-4">
              <div className="flex flex-col gap-4">
                <CtaCard
                  kicker="Submit"
                  title="Add a system, dataset, or source"
                  description="Every submission must cite an openly accessible dataset or preprint."
                  href="/submit"
                  ctaLabel="Open submission form"
                />
                <CtaCard
                  kicker="Methodology"
                  title="How scores and confidence grades are calculated"
                  description="Track definitions, scoring inputs, provisional vs reviewed runs."
                  href="/methodology"
                  ctaLabel="Read the methodology"
                  variant="light"
                />
              </div>
              <ChangelogCard items={changelogItems} />
            </div>
          </section>

          <section id="evaluations" className="scroll-mt-24">
            <SectionHeader
              title="Evaluations by track"
              description="Score distribution within each benchmark track for currently indexed systems."
              right={
                <span className="text-xs text-[color:var(--foreground-muted)]">
                  {trackGroups.length} of {tracks.length} tracks with scored runs
                </span>
              }
            />
            {trackGroups.length === 0 ? (
              <EmptyBlock message="No track evaluations yet." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trackGroups.map((track) => (
                  <EvaluationCard
                    key={track.slug}
                    color={trackColorMap.get(track.slug) ?? "var(--chart-3)"}
                    title={track.name}
                    href={`/benchmarks/${track.slug}`}
                    bars={track.rows.slice(0, 12).map((r) => ({
                      label: r.systemName,
                      value: r.score ?? 0,
                      color: trackColorMap.get(track.slug) ?? "var(--chart-3)",
                      sublabel: r.organizationName ?? undefined,
                    }))}
                  />
                ))}
              </div>
            )}
          </section>

          <section id="distribution" className="scroll-mt-24">
            <SectionHeader
              title="Score vs organoid sample size"
              description="Sample size (x) vs provisional track score (y). Top-right quadrant indicates well-scored systems with larger samples."
              right={
                <span className="text-xs text-[color:var(--foreground-muted)]">
                  {scatterPoints.length} runs plotted
                </span>
              }
            />
            {scatterPoints.length === 0 ? (
              <EmptyBlock message="No plottable runs yet (need scored runs with organoid counts)." />
            ) : (
              <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3 pl-2 text-xs">
                  {trackLegend.map((l) => (
                    <span key={l.slug} className="inline-flex items-center gap-1.5 text-[color:var(--foreground-muted)]">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                      {l.name}
                    </span>
                  ))}
                </div>
                <ScatterChart
                  points={scatterPoints}
                  xLabel="Organoids (N)"
                  yLabel="Track score"
                  yMin={0}
                  yMax={100}
                />
              </div>
            )}
          </section>

          <section id="coverage" className="scroll-mt-24">
            <SectionHeader
              title="Data coverage"
              description="Index totals, artifact availability across datasets, and source-platform mix."
              right={
                <Link href="/datasets" className="text-sm font-medium underline underline-offset-4">
                  Datasets {"\u2192"}
                </Link>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 flex flex-col gap-4">
                <div className="overflow-hidden rounded-[8px] border border-[color:var(--border)] divide-y divide-[color:var(--border)]">
                  <MiniStat label="Datasets" value={summary.datasetCount} />
                  <MiniStat label="Sources" value={summary.sourceCount} />
                  <MiniStat label="Runs" value={summary.runCount} />
                </div>
                <p className="text-xs leading-relaxed text-[color:var(--foreground-muted)]">
                  Numbers include every record in the index, including provisional entries awaiting review.
                </p>
              </div>

              <ChartCard
                color="var(--chart-2)"
                title="Artifact availability"
                description="Datasets with each artifact publicly available."
                href="/datasets"
                hrefLabel="Datasets"
                bars={availabilityBars}
                valueFormat={(v) => String(Math.round(v))}
                minLabelWidth={80}
              />

              <ChartCard
                color="var(--chart-5)"
                title="Sources by platform"
                description="Preprint and repository platforms backing the index."
                href="/sources"
                hrefLabel="Sources"
                bars={platformBars}
                valueFormat={(v) => String(Math.round(v))}
                minLabelWidth={90}
              />
            </div>
          </section>

          <section id="tracks" className="scroll-mt-24">
            <SectionHeader
              title="Tracks"
              description="Run pipeline state across benchmark tracks."
              right={
                <Link href="/benchmarks" className="text-sm font-medium underline underline-offset-4">
                  All benchmarks {"\u2192"}
                </Link>
              }
            />
            <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden">
              <TrackStatusLegend />
              <div className="divide-y divide-[color:var(--border)]">
                {tracks.map((track, i) => (
                  <TrackRowItem
                    key={track.slug}
                    track={track}
                    color={TRACK_COLORS[i % TRACK_COLORS.length]}
                  />
                ))}
              </div>
            </div>
          </section>

          <section id="datasets" className="scroll-mt-24">
            <SectionHeader
              title="Dataset files"
              description="Remote files indexed from public records, sorted by file count."
              right={
                <Link href="/datasets" className="text-sm font-medium underline underline-offset-4">
                  Datasets {"\u2192"}
                </Link>
              }
            />
            {fileBars.length === 0 ? (
              <EmptyBlock message="No indexed dataset files yet." />
            ) : (
              <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                <BarChart
                  bars={fileBars}
                  height={300}
                  minLabelWidth={82}
                  valueFormat={(v) => String(Math.round(v))}
                />
              </div>
            )}
          </section>

          <section id="sources" className="scroll-mt-24">
            <SectionHeader
              title="Recent sources"
              description="Latest preprints, repositories, and archives added to the index."
              right={
                <Link href="/sources" className="text-sm font-medium underline underline-offset-4">
                  All sources {"\u2192"}
                </Link>
              }
            />
            {sources.length === 0 ? (
              <EmptyBlock message="No sources indexed yet." />
            ) : (
              <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[color:var(--border)]">
                  {sources.slice(0, 6).map((source) => (
                    <a
                      key={source.id}
                      href={source.url ?? `/sources/${source.id}`}
                      className="min-h-[128px] px-5 py-4 hover:bg-[color:var(--surface-alt)] flex flex-col"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.12em] text-[color:var(--foreground-muted)]">
                        <span>{titleCase(source.repositoryType ?? "source")}</span>
                        <span className="normal-case tracking-normal">{formatDate(source.updatedAt)}</span>
                      </div>
                      <div className="mt-2 line-clamp-2 text-sm font-medium leading-snug">{source.title}</div>
                      <div className="mt-auto pt-2 text-xs text-[color:var(--foreground-muted)]">
                        {source.datasetCount} linked dataset{source.datasetCount === 1 ? "" : "s"}
                        {source.doi && <span className="ml-2">· DOI</span>}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState<string>(ids[0] ?? "");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      const threshold = 140;
      let current = ids[0] ?? "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - threshold <= 0) current = id;
      }
      setActive((prev) => (prev === current ? prev : current));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids]);
  return active;
}

function SectionHeader({
  title,
  description,
  right,
}: {
  title: string;
  description?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 flex-wrap border-b border-[color:var(--border)] pb-3">
      <div className="min-w-0">
        <h2 className="flex items-center gap-3 font-serif text-2xl md:text-[28px] leading-tight">
          <span
            aria-hidden
            className="inline-block h-3 w-3 bg-[color:var(--foreground)]"
          />
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 text-sm text-[color:var(--foreground-muted)] max-w-[640px]">
            {description}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}

function HighlightCard({
  color,
  title,
  description,
  href,
  bars,
}: {
  color: string;
  title: string;
  description: string;
  href: string;
  bars: Bar[];
}) {
  return (
    <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span aria-hidden className="inline-block h-3 w-3 rounded-sm" style={{ background: color }} />
          <h3 className="font-serif text-xl leading-tight">{title}</h3>
        </div>
        <p className="mt-1 text-xs text-[color:var(--foreground-muted)]">{description}</p>
      </div>
      <div className="px-2 pb-2 flex-1">
        {bars.length === 0 ? (
          <div className="mx-3 mb-3 rounded-[8px] border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface-alt)] px-4 py-8 text-center text-xs text-[color:var(--foreground-muted)]">
            No scored runs yet.
          </div>
        ) : (
          <BarChart
            bars={bars}
            height={260}
            minLabelWidth={64}
            valueFormat={(v) => (v < 10 ? v.toFixed(1) : Math.round(v).toString())}
          />
        )}
      </div>
      <div className="border-t border-[color:var(--border)] px-5 py-2.5">
        <Link href={href} className="text-xs font-medium underline underline-offset-4">
          View track leaderboard {"\u2192"}
        </Link>
      </div>
    </div>
  );
}

function EvaluationCard({
  color,
  title,
  href,
  bars,
}: {
  color: string;
  title: string;
  href: string;
  bars: Bar[];
}) {
  return (
    <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
          <h3 className="font-serif text-lg leading-tight truncate">{title}</h3>
          <span className="text-[11px] text-[color:var(--foreground-muted)] shrink-0">
            {bars.length} system{bars.length === 1 ? "" : "s"}
          </span>
        </div>
        <Link href={href} className="text-xs font-medium underline underline-offset-4 shrink-0">
          Track {"\u2192"}
        </Link>
      </div>
      <div className="p-2 flex-1">
        {bars.length === 0 ? (
          <div className="mx-3 my-3 rounded-[8px] border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface-alt)] px-4 py-6 text-center text-xs text-[color:var(--foreground-muted)]">
            No scored runs yet.
          </div>
        ) : (
          <BarChart
            bars={bars}
            height={230}
            minLabelWidth={58}
            valueFormat={(v) => (v < 10 ? v.toFixed(1) : Math.round(v).toString())}
          />
        )}
      </div>
    </div>
  );
}

function ChartCard({
  color,
  title,
  description,
  href,
  hrefLabel,
  bars,
  valueFormat,
  minLabelWidth,
}: {
  color: string;
  title: string;
  description: string;
  href: string;
  hrefLabel: string;
  bars: Bar[];
  valueFormat?: (v: number) => string;
  minLabelWidth?: number;
}) {
  return (
    <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span aria-hidden className="inline-block h-3 w-3 rounded-sm" style={{ background: color }} />
          <h3 className="font-serif text-xl leading-tight">{title}</h3>
        </div>
        <p className="mt-1 text-xs text-[color:var(--foreground-muted)]">{description}</p>
      </div>
      <div className="px-2 pb-2 flex-1">
        {bars.length === 0 ? (
          <div className="mx-3 mb-3 rounded-[8px] border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface-alt)] px-4 py-8 text-center text-xs text-[color:var(--foreground-muted)]">
            Nothing to chart yet.
          </div>
        ) : (
          <BarChart
            bars={bars}
            height={220}
            minLabelWidth={minLabelWidth ?? 80}
            valueFormat={valueFormat}
          />
        )}
      </div>
      <div className="border-t border-[color:var(--border)] px-5 py-2.5">
        <Link href={href} className="text-xs font-medium underline underline-offset-4">
          {hrefLabel} {"\u2192"}
        </Link>
      </div>
    </div>
  );
}

function CtaCard({
  kicker,
  title,
  description,
  href,
  ctaLabel,
  variant = "dark",
}: {
  kicker: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  variant?: "dark" | "light";
}) {
  const dark = variant === "dark";
  return (
    <Link
      href={href}
      className={`group relative block rounded-[12px] border overflow-hidden min-h-[170px] p-6 flex flex-col justify-between transition-colors ${
        dark
          ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)] hover:bg-[#111]"
          : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-alt)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`text-[11px] uppercase tracking-[0.16em] ${dark ? "opacity-70" : "text-[color:var(--foreground-muted)]"}`}>
          {kicker}
        </div>
        <div
          aria-hidden
          className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
            dark ? "border-white/20" : "border-[color:var(--border-strong)]"
          }`}
        >
          {"\u2197"}
        </div>
      </div>
      <div>
        <div className="font-serif text-2xl md:text-[26px] leading-tight">{title}</div>
        <p className={`mt-2 max-w-[460px] text-sm ${dark ? "opacity-80" : "text-[color:var(--foreground-muted)]"}`}>
          {description}
        </p>
        <div className="mt-4 text-xs font-medium underline underline-offset-4">
          {ctaLabel}
        </div>
      </div>
    </Link>
  );
}

function ChangelogCard({
  items,
}: {
  items: {
    kind: "source" | "dataset";
    title: string;
    href: string;
    date: string;
    sublabel: string;
  }[];
}) {
  return (
    <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface-alt)] p-5 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="font-serif text-xl leading-tight">Changelog</h3>
        <span className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--foreground-muted)]">
          Recent
        </span>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-[color:var(--foreground-muted)]">
          No recent activity.
        </div>
      ) : (
        <ol className="relative ml-2 border-l border-[color:var(--border-strong)] pl-5 space-y-4">
          {items.map((item, idx) => (
            <li key={idx} className="relative">
              <span
                aria-hidden
                className={`absolute -left-[27px] top-1.5 inline-block h-2.5 w-2.5 rounded-full border border-[color:var(--border-strong)] ${
                  item.kind === "source" ? "bg-[color:var(--chart-4)]" : "bg-[color:var(--chart-2)]"
                }`}
              />
              <div className="text-[11px] uppercase tracking-[0.12em] text-[color:var(--foreground-muted)]">
                {item.sublabel} · {formatDate(item.date)}
              </div>
              {item.href.startsWith("http") ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 block text-sm font-medium leading-snug hover:underline"
                >
                  {item.title}
                </a>
              ) : (
                <Link href={item.href} className="mt-0.5 block text-sm font-medium leading-snug hover:underline">
                  {item.title}
                </Link>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  published: "var(--chart-2)",
  provisional: "var(--chart-4)",
  scored: "var(--chart-5)",
  other: "var(--chart-8)",
};

function TrackStatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[color:var(--border)] bg-[color:var(--surface-alt)] px-5 py-2 text-[11px] text-[color:var(--foreground-muted)]">
      {(["published", "provisional", "scored", "other"] as const).map((k) => (
        <span key={k} className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ background: STATUS_COLORS[k] }} />
          {titleCase(k)}
        </span>
      ))}
    </div>
  );
}

function TrackRowItem({ track, color }: { track: TrackRow; color: string }) {
  const total =
    track.statusCounts.published +
    track.statusCounts.provisional +
    track.statusCounts.scored +
    track.statusCounts.other;
  return (
    <Link
      href={`/benchmarks/${track.slug}`}
      className="grid grid-cols-[auto_1fr_200px_auto_auto] items-center gap-4 px-5 py-3.5 hover:bg-[color:var(--surface-alt)]"
    >
      <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: color }} />
      <div className="min-w-0">
        <div className="text-sm font-medium">{track.name}</div>
        <div className="mt-0.5 text-xs text-[color:var(--foreground-muted)]">
          {track.taskCount} task{track.taskCount === 1 ? "" : "s"}
        </div>
      </div>
      <div className="h-2 w-full rounded-full overflow-hidden flex bg-[color:var(--surface-alt)]">
        {total === 0 ? null : (
          <>
            <div style={{ width: `${(track.statusCounts.published / total) * 100}%`, background: STATUS_COLORS.published }} />
            <div style={{ width: `${(track.statusCounts.provisional / total) * 100}%`, background: STATUS_COLORS.provisional }} />
            <div style={{ width: `${(track.statusCounts.scored / total) * 100}%`, background: STATUS_COLORS.scored }} />
            <div style={{ width: `${(track.statusCounts.other / total) * 100}%`, background: STATUS_COLORS.other }} />
          </>
        )}
      </div>
      <div className="text-right">
        <div className="font-mono text-base tabular-nums">{total}</div>
        <div className="text-[11px] text-[color:var(--foreground-muted)]">runs</div>
      </div>
      <span aria-hidden className="text-[color:var(--foreground-subtle)]">
        {"\u2192"}
      </span>
    </Link>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[color:var(--surface)] px-4 py-3 flex items-baseline justify-between">
      <div className="text-xs text-[color:var(--foreground-muted)]">{label}</div>
      <div className="font-mono text-lg tabular-nums">{value}</div>
    </div>
  );
}

function EmptyHighlights() {
  return (
    <div className="rounded-[12px] border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface)] px-6 py-10 text-center">
      <div className="font-serif text-xl">No scored runs yet.</div>
      <p className="mt-2 text-sm text-[color:var(--foreground-muted)]">
        Per-track highlights appear once scored submissions are indexed.
      </p>
    </div>
  );
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="rounded-[12px] border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface)] px-6 py-10 text-center text-sm text-[color:var(--foreground-muted)]">
      {message}
    </div>
  );
}

function titleCase(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "Size unavailable";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size >= 10 ? size.toFixed(0) : size.toFixed(1)} ${units[unit]}`;
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
  } catch {
    return "";
  }
}

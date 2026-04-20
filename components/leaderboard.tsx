"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input, Select, Checkbox } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { MiniLearningCurve } from "@/components/ui/sparkline";
import {
  SYSTEMS,
  TRACKS,
  TASKS,
  LABS,
  labById,
  trackById,
  type System,
} from "@/lib/data";
import { formatDate } from "@/lib/utils";

type SortKey =
  | "rank"
  | "signal"
  | "response"
  | "plasticity"
  | "learning"
  | "retention"
  | "reproducibility"
  | "composite"
  | "n"
  | "updated";

type LeaderboardProps = {
  initialTrack?: string;
  compact?: boolean;
  expandable?: boolean;
  showAdvancedFilters?: boolean;
  systems?: System[];
};

export function Leaderboard({
  initialTrack = "all",
  compact = false,
  expandable = true,
  showAdvancedFilters = true,
  systems = SYSTEMS,
}: LeaderboardProps) {
  const [track, setTrack] = useState(initialTrack);
  const [task, setTask] = useState("all");
  const [lab, setLab] = useState("all");
  const [query, setQuery] = useState("");
  const [onlyPublic, setOnlyPublic] = useState(false);
  const [onlyPeer, setOnlyPeer] = useState(false);
  const [onlyRaw, setOnlyRaw] = useState(false);
  const [onlyPassControls, setOnlyPassControls] = useState(false);
  const [minN, setMinN] = useState(0);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "composite",
    dir: "desc",
  });
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = systems;
    if (track !== "all") list = list.filter((s) => s.track === track);
    if (task !== "all") list = list.filter((s) => s.taskId === task);
    if (lab !== "all") list = list.filter((s) => s.labId === lab);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          labById(s.labId)?.name.toLowerCase().includes(q) ||
          s.taskId.toLowerCase().includes(q),
      );
    }
    if (onlyPublic) list = list.filter((s) => s.availability.openDataset);
    if (onlyPeer) list = list.filter((s) => s.availability.peerReviewed);
    if (onlyRaw) list = list.filter((s) => s.availability.raw);
    if (onlyPassControls)
      list = list.filter((s) =>
        Object.values(s.controls).filter((v) => v === "pass").length >= 5,
      );
    if (minN > 0) list = list.filter((s) => s.nOrganoids >= minN);
    return list;
  }, [systems, track, task, lab, query, onlyPublic, onlyPeer, onlyRaw, onlyPassControls, minN]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      const sk = sort.key;
      const av =
        sk === "n"
          ? a.nOrganoids
          : sk === "updated"
            ? new Date(a.lastUpdated).getTime()
            : sk === "rank"
              ? 0
              : a.metrics[sk as keyof System["metrics"]];
      const bv =
        sk === "n"
          ? b.nOrganoids
          : sk === "updated"
            ? new Date(b.lastUpdated).getTime()
            : sk === "rank"
              ? 0
              : b.metrics[sk as keyof System["metrics"]];
      return av === bv ? 0 : av < bv ? -dir : dir;
    });
    return list;
  }, [filtered, sort]);

  function setSortKey(k: SortKey) {
    setSort((s) => ({ key: k, dir: s.key === k && s.dir === "desc" ? "asc" : "desc" }));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-1">
              search
            </div>
            <Input
              placeholder="system, task, lab…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-1">
              track
            </div>
            <Select value={track} onChange={(e) => setTrack(e.target.value)}>
              <option value="all">all tracks</option>
              {TRACKS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-1">
              task
            </div>
            <Select value={task} onChange={(e) => setTask(e.target.value)}>
              <option value="all">all tasks</option>
              {TASKS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-1">
              lab / source
            </div>
            <Select value={lab} onChange={(e) => setLab(e.target.value)}>
              <option value="all">all labs</option>
              {LABS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {showAdvancedFilters && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pt-4 border-t border-[color:var(--border)]">
            <Checkbox
              label="public dataset"
              checked={onlyPublic}
              onChange={(e) => setOnlyPublic(e.target.checked)}
            />
            <Checkbox
              label="peer reviewed"
              checked={onlyPeer}
              onChange={(e) => setOnlyPeer(e.target.checked)}
            />
            <Checkbox
              label="raw data available"
              checked={onlyRaw}
              onChange={(e) => setOnlyRaw(e.target.checked)}
            />
            <Checkbox
              label="passed ≥5 controls"
              checked={onlyPassControls}
              onChange={(e) => setOnlyPassControls(e.target.checked)}
            />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[color:var(--foreground-muted)]">min N organoids</span>
              <input
                type="number"
                value={minN}
                min={0}
                onChange={(e) => setMinN(Number(e.target.value))}
                className="h-8 w-20 rounded-[8px] border border-[color:var(--border)] bg-[color:var(--surface)] px-2 text-sm"
              />
            </div>
            <div className="ml-auto text-xs font-mono text-[color:var(--foreground-muted)]">
              {sorted.length} / {systems.length} entries
            </div>
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto rounded-[16px] border border-[color:var(--border)] bg-[color:var(--surface)]">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-[color:var(--foreground-muted)] bg-[color:var(--surface-alt)] sticky top-0">
            <tr>
              <HeadCell label="#" onClick={() => setSortKey("rank")} sort={sort} k="rank" />
              <HeadCell label="system" />
              <HeadCell label="track" />
              <HeadCell label="task" />
              <HeadCell label="signal" onClick={() => setSortKey("signal")} sort={sort} k="signal" />
              <HeadCell label="response" onClick={() => setSortKey("response")} sort={sort} k="response" />
              <HeadCell label="plasticity" onClick={() => setSortKey("plasticity")} sort={sort} k="plasticity" />
              <HeadCell label="learning" onClick={() => setSortKey("learning")} sort={sort} k="learning" />
              <HeadCell label="retention" onClick={() => setSortKey("retention")} sort={sort} k="retention" />
              <HeadCell
                label="repro"
                onClick={() => setSortKey("reproducibility")}
                sort={sort}
                k="reproducibility"
              />
              <HeadCell label="composite" onClick={() => setSortKey("composite")} sort={sort} k="composite" />
              <HeadCell label="N" onClick={() => setSortKey("n")} sort={sort} k="n" />
              <HeadCell label="data" />
              <HeadCell label="grade" />
              {!compact && (
                <HeadCell label="updated" onClick={() => setSortKey("updated")} sort={sort} k="updated" />
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border)]">
            {sorted.map((s, i) => {
              const lab = labById(s.labId);
              const trackDef = trackById(s.track);
              const open = expanded === s.id;
              return (
                <Fragment key={s.id}>
                  <tr
                    className={cn(
                      "hover:bg-[color:var(--surface-alt)] cursor-pointer",
                      open && "bg-[color:var(--surface-alt)]",
                    )}
                    onClick={() => expandable && setExpanded(open ? null : s.id)}
                  >
                    <td className="px-4 py-3 font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/systems/${s.id}`}
                        className="font-medium hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {s.name}
                      </Link>
                      <div className="text-xs text-[color:var(--foreground-muted)]">
                        {lab?.name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone="outline">{trackDef.name}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{s.taskId}</td>
                    <MetricCell v={s.metrics.signal} />
                    <MetricCell v={s.metrics.response} />
                    <MetricCell v={s.metrics.plasticity} />
                    <MetricCell v={s.metrics.learning} />
                    <MetricCell v={s.metrics.retention} />
                    <MetricCell v={s.metrics.reproducibility} />
                    <MetricCell v={s.metrics.composite} strong />
                    <td className="px-4 py-3 font-mono text-xs">{s.nOrganoids}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {s.availability.raw && <Dot label="raw" />}
                        {s.availability.code && <Dot label="code" />}
                        {s.availability.peerReviewed && <Dot label="peer" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ConfidenceBadge grade={s.grade} compact />
                    </td>
                    {!compact && (
                      <td className="px-4 py-3 font-mono text-xs text-[color:var(--foreground-muted)]">
                        {formatDate(s.lastUpdated)}
                      </td>
                    )}
                  </tr>
                  {expandable && open && (
                    <tr className="bg-[color:var(--surface-alt)]">
                      <td colSpan={compact ? 14 : 15} className="px-6 py-5">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-1">
                              learning curve
                            </div>
                            <div className="text-[color:var(--foreground)]">
                              <MiniLearningCurve values={s.learningCurve} baseline={s.learningCurve[0]} />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-1">
                              controls
                            </div>
                            <ul className="text-xs font-mono space-y-0.5">
                              {Object.entries(s.controls).map(([k, v]) => (
                                <li key={k} className="flex justify-between gap-4">
                                  <span>{k.replace(/_/g, " ")}</span>
                                  <span
                                    className={cn(
                                      v === "pass" && "text-[color:var(--success)]",
                                      v === "partial" && "text-[color:var(--warning)]",
                                      v === "missing" && "text-[color:var(--foreground-muted)]",
                                      v === "fail" && "text-[color:var(--destructive)]",
                                    )}
                                  >
                                    {v}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-1">
                              limitations
                            </div>
                            <ul className="text-xs space-y-1 list-disc pl-4 text-[color:var(--foreground-muted)]">
                              {s.limitations.map((l, idx) => (
                                <li key={idx}>{l}</li>
                              ))}
                            </ul>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono">
                              <Link
                                href={`/systems/${s.id}`}
                                className="underline underline-offset-2"
                              >
                                open system →
                              </Link>
                              <Link
                                href={`/datasets/${s.datasetId}`}
                                className="underline underline-offset-2"
                              >
                                dataset
                              </Link>
                              <Link
                                href={`/papers/${s.paperId}`}
                                className="underline underline-offset-2"
                              >
                                paper
                              </Link>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={15} className="px-4 py-8 text-center text-sm text-[color:var(--foreground-muted)]">
                  no entries match these filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HeadCell({
  label,
  onClick,
  sort,
  k,
}: {
  label: string;
  onClick?: () => void;
  sort?: { key: string; dir: "asc" | "desc" };
  k?: string;
}) {
  const active = sort?.key === k;
  return (
    <th
      onClick={onClick}
      className={cn(
        "font-medium px-4 py-3 whitespace-nowrap",
        onClick && "cursor-pointer hover:text-[color:var(--foreground)]",
      )}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && (
          <span className="font-mono text-[10px]">{sort?.dir === "desc" ? "↓" : "↑"}</span>
        )}
      </span>
    </th>
  );
}

function MetricCell({ v, strong = false }: { v: number; strong?: boolean }) {
  if (v === 0) {
    return (
      <td className="px-4 py-3 font-mono text-xs text-[color:var(--foreground-muted)]">—</td>
    );
  }
  return (
    <td className={cn("px-4 py-3 font-mono text-xs", strong && "font-semibold text-[color:var(--foreground)]")}>
      {v.toFixed(2)}
    </td>
  );
}

function Dot({ label }: { label: string }) {
  return (
    <span
      title={label}
      className="h-2 w-2 rounded-full bg-[color:var(--foreground)]"
      aria-label={label}
    />
  );
}

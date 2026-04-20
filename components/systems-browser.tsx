"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Input, Select } from "@/components/ui/input";
import { SYSTEMS, TRACKS, trackById } from "@/lib/data";

const SOURCES = Array.from(new Set(SYSTEMS.map((s) => s.source))).sort();
const PLATFORMS = Array.from(new Set(SYSTEMS.map((s) => s.platform))).sort();
const ORGANOID_TYPES = Array.from(new Set(SYSTEMS.map((s) => s.organoidType))).sort();

export function SystemsBrowser() {
  const [q, setQ] = useState("");
  const [track, setTrack] = useState("all");
  const [source, setSource] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [organoid, setOrganoid] = useState("all");
  const [view, setView] = useState<"cards" | "table">("cards");

  const list = useMemo(() => {
    return SYSTEMS.filter((s) => {
      if (track !== "all" && s.track !== track) return false;
      if (source !== "all" && s.source !== source) return false;
      if (platform !== "all" && s.platform !== platform) return false;
      if (organoid !== "all" && s.organoidType !== organoid) return false;
      if (q) {
        const needle = q.toLowerCase();
        return (
          s.name.toLowerCase().includes(needle) ||
          s.source.toLowerCase().includes(needle) ||
          s.task.toLowerCase().includes(needle) ||
          s.platform.toLowerCase().includes(needle)
        );
      }
      return true;
    });
  }, [q, track, source, platform, organoid]);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input
            placeholder="Search systems"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select value={track} onChange={(e) => setTrack(e.target.value)}>
            <option value="all">All tracks</option>
            {TRACKS.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
          <Select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="all">All sources</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="all">All platforms</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
          <Select value={organoid} onChange={(e) => setOrganoid(e.target.value)}>
            <option value="all">All organoid types</option>
            {ORGANOID_TYPES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[color:var(--border)] text-sm">
          <span className="text-[color:var(--foreground-muted)] font-mono text-xs">
            {list.length} / {SYSTEMS.length} systems
          </span>
          <div className="flex items-center gap-1 rounded-full bg-[color:var(--surface-alt)] p-1">
            {(["cards", "table"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 h-7 text-xs rounded-full ${view === v ? "bg-[color:var(--foreground)] text-[color:var(--background)]" : "text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"}`}
              >
                {v[0].toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((s) => {
            const t = trackById(s.track);
            return (
              <Link key={s.id} href={`/systems/${s.id}`}>
                <div className="h-full rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 hover:border-[color:var(--foreground)] transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-[color:var(--foreground-muted)]">{s.id}</div>
                      <h3 className="mt-0.5 text-base font-medium truncate">{s.name}</h3>
                      <div className="text-sm text-[color:var(--foreground-muted)]">{s.source}</div>
                    </div>
                    <div className="h-7 w-7 shrink-0 rounded-full border border-[color:var(--border-strong)] font-mono text-xs grid place-items-center">
                      {s.grade}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center rounded-full border border-[color:var(--border)] px-2 py-0.5 text-xs">{t.name}</span>
                    <span className="inline-flex items-center rounded-full border border-[color:var(--border)] px-2 py-0.5 text-xs">{s.organoidType}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <Metric label="Learning" v={s.metrics.learning} />
                    <Metric label="Plasticity" v={s.metrics.plasticity} />
                    <Metric label="Repro" v={s.metrics.repro} />
                  </div>
                  <div className="mt-3 text-xs text-[color:var(--foreground-muted)]">
                    {s.nOrganoids} organoids · {s.platform}
                  </div>
                </div>
              </Link>
            );
          })}
          {list.length === 0 && (
            <div className="col-span-full text-sm text-[color:var(--foreground-muted)] text-center py-8">
              No systems match these filters.
            </div>
          )}
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)]">
          <table className="w-full text-sm">
            <thead className="text-left bg-[color:var(--surface-alt)]">
              <tr>
                <th className="px-4 py-3 font-medium">System</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Track</th>
                <th className="px-4 py-3 font-medium">Organoid</th>
                <th className="px-4 py-3 font-medium">Platform</th>
                <th className="px-4 py-3 font-medium text-right">N</th>
                <th className="px-4 py-3 font-medium">Grade</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="border-t border-[color:var(--border)] hover:bg-[color:var(--surface-alt)]">
                  <td className="px-4 py-3">
                    <Link href={`/systems/${s.id}`} className="font-medium hover:underline">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{s.source}</td>
                  <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{trackById(s.track).name}</td>
                  <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{s.organoidType}</td>
                  <td className="px-4 py-3 text-[color:var(--foreground-muted)] font-mono text-xs">{s.platform}</td>
                  <td className="px-4 py-3 font-mono text-xs text-right">{s.nOrganoids}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--border-strong)] font-mono text-xs">
                      {s.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Metric({ label, v }: { label: string; v: number }) {
  return (
    <div>
      <div className="text-[10px] text-[color:var(--foreground-muted)]">{label}</div>
      <div className="font-mono">{v ? v.toFixed(2) : "—"}</div>
    </div>
  );
}

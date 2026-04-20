"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { Card } from "@/components/ui/card";
import { SYSTEMS, LABS, TASKS, TRACKS, labById, trackById } from "@/lib/data";

export function SystemsBrowser() {
  const [q, setQ] = useState("");
  const [track, setTrack] = useState("all");
  const [task, setTask] = useState("all");
  const [lab, setLab] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [organoid, setOrganoid] = useState("all");
  const [view, setView] = useState<"cards" | "table">("cards");

  const platforms = Array.from(new Set(SYSTEMS.map((s) => s.recordingPlatform)));
  const organoidTypes = Array.from(new Set(SYSTEMS.map((s) => s.organoidType)));

  const list = useMemo(() => {
    return SYSTEMS.filter((s) => {
      if (track !== "all" && s.track !== track) return false;
      if (task !== "all" && s.taskId !== task) return false;
      if (lab !== "all" && s.labId !== lab) return false;
      if (platform !== "all" && s.recordingPlatform !== platform) return false;
      if (organoid !== "all" && s.organoidType !== organoid) return false;
      if (q) {
        const needle = q.toLowerCase();
        return (
          s.name.toLowerCase().includes(needle) ||
          labById(s.labId)?.name.toLowerCase().includes(needle) ||
          s.taskId.includes(needle) ||
          s.recordingPlatform.toLowerCase().includes(needle)
        );
      }
      return true;
    });
  }, [q, track, task, lab, platform, organoid]);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <Input
            placeholder="search systems…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select value={track} onChange={(e) => setTrack(e.target.value)}>
            <option value="all">all tracks</option>
            {TRACKS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
          <Select value={task} onChange={(e) => setTask(e.target.value)}>
            <option value="all">all tasks</option>
            {TASKS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
          <Select value={lab} onChange={(e) => setLab(e.target.value)}>
            <option value="all">all labs</option>
            {LABS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
          <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="all">all platforms</option>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
          <Select value={organoid} onChange={(e) => setOrganoid(e.target.value)}>
            <option value="all">all organoid types</option>
            {organoidTypes.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[color:var(--border)] text-sm">
          <span className="text-[color:var(--foreground-muted)] font-mono text-xs">
            {list.length} / {SYSTEMS.length} systems
          </span>
          <div className="flex items-center gap-1 rounded-[9999px] border border-[color:var(--border)] p-0.5">
            {(["cards", "table"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 h-7 text-xs rounded-[9999px] ${view === v ? "bg-[color:var(--foreground)] text-[color:var(--background)]" : "text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {view === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((s) => {
            const lab = labById(s.labId);
            const t = trackById(s.track);
            return (
              <Link key={s.id} href={`/systems/${s.id}`}>
                <Card className="h-full hover:border-[color:var(--foreground)] transition">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-mono text-[color:var(--foreground-muted)]">
                        {s.id}
                      </div>
                      <h3 className="mt-0.5 text-base font-semibold">{s.name}</h3>
                      <div className="text-sm text-[color:var(--foreground-muted)]">
                        {lab?.name}
                      </div>
                    </div>
                    <ConfidenceBadge grade={s.grade} compact />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge tone="outline">{t.name.toLowerCase()}</Badge>
                    <Badge tone="outline">{s.organoidType}</Badge>
                    <Badge tone="outline">{s.taskId}</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-mono">
                    <div>
                      <div className="text-[10px] uppercase text-[color:var(--foreground-muted)]">
                        learning
                      </div>
                      <div>{s.metrics.learning ? s.metrics.learning.toFixed(2) : "—"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-[color:var(--foreground-muted)]">
                        plasticity
                      </div>
                      <div>{s.metrics.plasticity ? s.metrics.plasticity.toFixed(2) : "—"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-[color:var(--foreground-muted)]">
                        repro
                      </div>
                      <div>{s.metrics.reproducibility.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-[color:var(--foreground-muted)]">
                    {s.nOrganoids} organoids · {s.recordingPlatform}
                  </div>
                </Card>
              </Link>
            );
          })}
          {list.length === 0 && (
            <div className="col-span-full text-sm text-[color:var(--foreground-muted)] text-center py-8">
              no systems match these filters
            </div>
          )}
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-[16px] border border-[color:var(--border)] bg-[color:var(--surface)]">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-[color:var(--foreground-muted)] bg-[color:var(--surface-alt)]">
              <tr>
                <th className="px-4 py-3 font-medium">system</th>
                <th className="px-4 py-3 font-medium">lab</th>
                <th className="px-4 py-3 font-medium">track</th>
                <th className="px-4 py-3 font-medium">organoid</th>
                <th className="px-4 py-3 font-medium">platform</th>
                <th className="px-4 py-3 font-medium">task</th>
                <th className="px-4 py-3 font-medium">N</th>
                <th className="px-4 py-3 font-medium">grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {list.map((s) => (
                <tr key={s.id} className="hover:bg-[color:var(--surface-alt)]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/systems/${s.id}`}
                      className="font-medium hover:underline"
                    >
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{labById(s.labId)?.name}</td>
                  <td className="px-4 py-3">
                    <Badge tone="outline">{trackById(s.track).name.toLowerCase()}</Badge>
                  </td>
                  <td className="px-4 py-3 text-[color:var(--foreground-muted)]">
                    {s.organoidType}
                  </td>
                  <td className="px-4 py-3 text-[color:var(--foreground-muted)] font-mono text-xs">
                    {s.recordingPlatform}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{s.taskId}</td>
                  <td className="px-4 py-3 font-mono text-xs">{s.nOrganoids}</td>
                  <td className="px-4 py-3">
                    <ConfidenceBadge grade={s.grade} compact />
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

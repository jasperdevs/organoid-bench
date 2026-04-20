"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Select } from "@/components/ui/input";
import type { System } from "@/lib/data";
import { SYSTEMS, TRACKS, labById } from "@/lib/data";

type Axis = keyof System["metrics"];

const AXIS_LABEL: Record<Axis, string> = {
  signal: "signal quality",
  response: "responsiveness",
  plasticity: "plasticity",
  learning: "learning gain",
  retention: "retention",
  reproducibility: "reproducibility confidence",
  composite: "composite",
};

const trackColor: Record<string, string> = {
  "signal-quality": "var(--foreground)",
  responsiveness: "var(--info)",
  plasticity: "var(--success)",
  "closed-loop-learning": "var(--foreground)",
  retention: "var(--warning)",
  reproducibility: "var(--foreground-muted)",
};

type Props = {
  systems?: System[];
  defaultX?: Axis;
  defaultY?: Axis;
  height?: number;
  showControls?: boolean;
  trackFilter?: string;
};

export function BenchmarkChart({
  systems = SYSTEMS,
  defaultX = "learning",
  defaultY = "reproducibility",
  height = 380,
  showControls = true,
  trackFilter,
}: Props) {
  const [x, setX] = useState<Axis>(defaultX);
  const [y, setY] = useState<Axis>(defaultY);
  const [track, setTrack] = useState<string>(trackFilter ?? "all");
  const [hover, setHover] = useState<System | null>(null);

  const filtered = useMemo(
    () => (track === "all" ? systems : systems.filter((s) => s.track === track)),
    [systems, track],
  );

  const maxN = Math.max(...filtered.map((s) => s.nOrganoids));

  return (
    <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--surface)]">
      {showControls && (
        <div className="flex flex-wrap gap-3 p-4 border-b border-[color:var(--border)]">
          <div className="min-w-[180px]">
            <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-1">
              x axis
            </div>
            <Select value={x} onChange={(e) => setX(e.target.value as Axis)}>
              {Object.entries(AXIS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div className="min-w-[180px]">
            <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-1">
              y axis
            </div>
            <Select value={y} onChange={(e) => setY(e.target.value as Axis)}>
              {Object.entries(AXIS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div className="min-w-[220px]">
            <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-1">
              benchmark track
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
        </div>
      )}

      <div className="p-4 grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
        <div className="relative">
          <ChartSvg
            systems={filtered}
            x={x}
            y={y}
            height={height}
            maxN={maxN}
            onHover={setHover}
            hoverId={hover?.id}
          />
          <div className="mt-2 flex items-center justify-between text-xs text-[color:var(--foreground-muted)]">
            <div>
              x: <span className="text-[color:var(--foreground)]">{AXIS_LABEL[x]}</span>
            </div>
            <div>
              y: <span className="text-[color:var(--foreground)]">{AXIS_LABEL[y]}</span>
            </div>
            <div>
              bubble size: <span className="text-[color:var(--foreground)]">N organoids</span>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-2">
            {hover ? "hovered" : "track legend"}
          </div>
          {!hover && (
            <ul className="space-y-1.5 text-sm">
              {TRACKS.map((t) => (
                <li key={t.id} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-[color:var(--border)]"
                    style={{ background: trackColor[t.id] }}
                  />
                  <span>{t.name}</span>
                </li>
              ))}
            </ul>
          )}
          {hover && <HoverCard sys={hover} />}
        </div>
      </div>
    </div>
  );
}

function ChartSvg({
  systems,
  x,
  y,
  height,
  maxN,
  onHover,
  hoverId,
}: {
  systems: System[];
  x: Axis;
  y: Axis;
  height: number;
  maxN: number;
  onHover: (s: System | null) => void;
  hoverId?: string;
}) {
  const w = 640;
  const h = height;
  const pad = { l: 40, r: 16, t: 16, b: 32 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;

  const gridX = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-auto"
      role="img"
      aria-label="benchmark scatter"
    >
      <rect x={0} y={0} width={w} height={h} fill="var(--surface-alt)" rx={12} />
      {/* grid */}
      {gridX.map((g) => (
        <g key={`gx-${g}`}>
          <line
            x1={pad.l + g * iw}
            x2={pad.l + g * iw}
            y1={pad.t}
            y2={pad.t + ih}
            stroke="var(--border)"
            strokeWidth={1}
          />
          <text
            x={pad.l + g * iw}
            y={h - 10}
            fontSize={10}
            textAnchor="middle"
            fill="var(--foreground-muted)"
            fontFamily="var(--font-jetbrains)"
          >
            {g.toFixed(2)}
          </text>
        </g>
      ))}
      {gridX.map((g) => (
        <g key={`gy-${g}`}>
          <line
            x1={pad.l}
            x2={pad.l + iw}
            y1={pad.t + (1 - g) * ih}
            y2={pad.t + (1 - g) * ih}
            stroke="var(--border)"
            strokeWidth={1}
          />
          <text
            x={pad.l - 8}
            y={pad.t + (1 - g) * ih + 3}
            fontSize={10}
            textAnchor="end"
            fill="var(--foreground-muted)"
            fontFamily="var(--font-jetbrains)"
          >
            {g.toFixed(2)}
          </text>
        </g>
      ))}

      {systems.map((s) => {
        const xv = s.metrics[x];
        const yv = s.metrics[y];
        const cx = pad.l + xv * iw;
        const cy = pad.t + (1 - yv) * ih;
        const r = 4 + (s.nOrganoids / maxN) * 10;
        const isHover = hoverId === s.id;
        return (
          <g
            key={s.id}
            onMouseEnter={() => onHover(s)}
            onMouseLeave={() => onHover(null)}
            style={{ cursor: "pointer" }}
          >
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill={trackColor[s.track]}
              fillOpacity={isHover ? 0.9 : 0.55}
              stroke="var(--surface)"
              strokeWidth={1.5}
            />
            {isHover && (
              <circle
                cx={cx}
                cy={cy}
                r={r + 4}
                fill="none"
                stroke={trackColor[s.track]}
                strokeOpacity={0.7}
                strokeWidth={1}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function HoverCard({ sys }: { sys: System }) {
  const lab = labById(sys.labId);
  return (
    <Link
      href={`/systems/${sys.id}`}
      className="block rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-3 hover:bg-[color:var(--surface-alt)]"
    >
      <div className="text-sm font-medium truncate">{sys.name}</div>
      <div className="text-xs text-[color:var(--foreground-muted)] truncate">
        {lab?.name}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-y-1 text-xs font-mono">
        <div className="text-[color:var(--foreground-muted)]">task</div>
        <div className="truncate">{sys.taskId}</div>
        <div className="text-[color:var(--foreground-muted)]">learning</div>
        <div>{sys.metrics.learning.toFixed(2)}</div>
        <div className="text-[color:var(--foreground-muted)]">plasticity</div>
        <div>{sys.metrics.plasticity.toFixed(2)}</div>
        <div className="text-[color:var(--foreground-muted)]">repro conf</div>
        <div>{sys.metrics.reproducibility.toFixed(2)}</div>
        <div className="text-[color:var(--foreground-muted)]">N organoids</div>
        <div>{sys.nOrganoids}</div>
      </div>
      <div className="mt-2 text-xs text-[color:var(--foreground)] underline underline-offset-2">
        open system →
      </div>
    </Link>
  );
}

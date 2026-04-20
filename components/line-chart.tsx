"use client";

import * as React from "react";
import { useState } from "react";

export type LineSeries = {
  id: string;
  label: string;
  color: string;
  points: { x: number; y: number }[];
};

export function LineChart({
  series,
  xLabels,
  yLabel,
  height = 360,
  yMin = 0,
  yMax = 1,
}: {
  series: LineSeries[];
  xLabels: string[];
  yLabel: string;
  height?: number;
  yMin?: number;
  yMax?: number;
}) {
  const [hover, setHover] = useState<{ seriesId: string; x: number; y: number; label: string; xLabel: string } | null>(null);
  const width = 820;
  const pad = { top: 22, right: 20, bottom: 52, left: 44 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const n = xLabels.length;

  const toX = (i: number) => pad.left + (i / Math.max(n - 1, 1)) * plotW;
  const toY = (v: number) => pad.top + (1 - (v - yMin) / (yMax - yMin || 1)) * plotH;

  return (
    <div className="w-full overflow-x-auto relative">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((f) => {
          const y = pad.top + plotH * (1 - f);
          const val = yMin + (yMax - yMin) * f;
          return (
            <g key={f}>
              <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="var(--border)" strokeDasharray={f === 0 ? "" : "2 3"} />
              <text x={pad.left - 8} y={y + 3} fontSize="10" fill="var(--foreground-muted)" textAnchor="end">
                {val.toFixed(2)}
              </text>
            </g>
          );
        })}
        {xLabels.map((xl, i) => {
          if (i % Math.ceil(n / 8) !== 0 && i !== n - 1) return null;
          return (
            <text key={i} x={toX(i)} y={height - pad.bottom + 14} fontSize="10" fill="var(--foreground-muted)" textAnchor="middle">
              {xl}
            </text>
          );
        })}

        {series.map((s) => {
          const d = s.points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.x)} ${toY(p.y)}`)
            .join(" ");
          const isActive = hover?.seriesId === s.id;
          return (
            <g key={s.id}>
              <path d={d} stroke={s.color} strokeWidth={isActive ? 2.5 : 1.6} fill="none" opacity={hover && !isActive ? 0.35 : 1} />
              {s.points.map((p, i) => (
                <g
                  key={i}
                  onMouseEnter={() =>
                    setHover({
                      seriesId: s.id,
                      x: toX(p.x),
                      y: toY(p.y),
                      label: s.label,
                      xLabel: xLabels[p.x] ?? String(p.x),
                    })
                  }
                  onMouseLeave={() => setHover(null)}
                >
                  <circle cx={toX(p.x)} cy={toY(p.y)} r={8} fill="transparent" />
                  <circle cx={toX(p.x)} cy={toY(p.y)} r={isActive ? 4 : 2.5} fill={s.color} />
                </g>
              ))}
            </g>
          );
        })}

        <text x={10} y={pad.top - 6} fontSize="11" fill="var(--foreground-muted)">
          {yLabel}
        </text>
      </svg>
      {hover && (
        <div
          className="absolute pointer-events-none bg-[color:var(--foreground)] text-[color:var(--background)] rounded-[8px] px-3 py-2 text-xs shadow-sm"
          style={{
            left: Math.min(hover.x + 10, width - 220),
            top: Math.max(hover.y - 40, 0),
          }}
        >
          <div className="font-medium">{hover.label}</div>
          <div className="opacity-70 mt-0.5 font-mono">{hover.xLabel}</div>
        </div>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[color:var(--foreground-muted)]">
        {series.map((s) => (
          <span
            key={s.id}
            className="inline-flex items-center gap-1.5 cursor-pointer"
            onMouseEnter={() => {
              const last = s.points[s.points.length - 1];
              if (last) {
                setHover({
                  seriesId: s.id,
                  x: toX(last.x),
                  y: toY(last.y),
                  label: s.label,
                  xLabel: xLabels[last.x] ?? String(last.x),
                });
              }
            }}
            onMouseLeave={() => setHover(null)}
          >
            <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

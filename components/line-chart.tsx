"use client";

import * as React from "react";

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
  const width = 820;
  const pad = { top: 18, right: 20, bottom: 50, left: 40 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const n = xLabels.length;

  const toX = (i: number) => pad.left + (i / Math.max(n - 1, 1)) * plotW;
  const toY = (v: number) => pad.top + (1 - (v - yMin) / (yMax - yMin || 1)) * plotH;

  return (
    <div className="w-full overflow-x-auto">
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
          return (
            <g key={s.id}>
              <path d={d} stroke={s.color} strokeWidth={1.8} fill="none" />
              {s.points.map((p, i) => (
                <rect
                  key={i}
                  x={toX(p.x) - 2}
                  y={toY(p.y) - 2}
                  width={4}
                  height={4}
                  fill={s.color}
                />
              ))}
            </g>
          );
        })}

        <text x={10} y={pad.top - 4} fontSize="11" fill="var(--foreground-muted)">
          {yLabel}
        </text>
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[color:var(--foreground-muted)]">
        {series.map((s) => (
          <span key={s.id} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

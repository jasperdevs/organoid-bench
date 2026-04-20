"use client";

import * as React from "react";

export type Bar = {
  label: string;
  value: number;
  color?: string;
  iconLetter?: string;
};

export function BarChart({
  bars,
  height = 280,
  unit,
  maxOverride,
  minLabelWidth = 60,
}: {
  bars: Bar[];
  height?: number;
  unit?: string;
  maxOverride?: number;
  minLabelWidth?: number;
}) {
  const max = maxOverride ?? Math.max(...bars.map((b) => b.value));
  const n = bars.length;
  const chartW = Math.max(n * minLabelWidth, 300);
  const pad = { top: 20, right: 10, bottom: 70, left: 32 };
  const plotH = height - pad.top - pad.bottom;
  const barW = (chartW - pad.left - pad.right) / n;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width={chartW}
        height={height}
        viewBox={`0 0 ${chartW} ${height}`}
        className="block"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = pad.top + plotH * (1 - frac);
          return (
            <line
              key={frac}
              x1={pad.left}
              x2={chartW - pad.right}
              y1={y}
              y2={y}
              stroke="var(--border)"
              strokeDasharray={frac === 0 ? "" : "2 3"}
            />
          );
        })}
        {bars.map((b, i) => {
          const h = (b.value / max) * plotH;
          const x = pad.left + i * barW + barW * 0.15;
          const w = barW * 0.7;
          const y = pad.top + (plotH - h);
          const color = b.color ?? "var(--chart-3)";
          return (
            <g key={b.label}>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={color}
                rx={2}
              />
              <text
                x={x + w / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="11"
                fill="var(--foreground)"
                fontWeight={600}
              >
                {b.value.toFixed(b.value < 10 ? 2 : 0)}
              </text>
              <text
                x={x + w / 2}
                y={height - pad.bottom + 14}
                textAnchor="middle"
                fontSize="10"
                fill="var(--foreground-muted)"
                transform={`rotate(-35, ${x + w / 2}, ${height - pad.bottom + 14})`}
              >
                {b.label}
              </text>
            </g>
          );
        })}
        {unit && (
          <text
            x={pad.left}
            y={pad.top - 6}
            fontSize="10"
            fill="var(--foreground-muted)"
          >
            {unit}
          </text>
        )}
      </svg>
    </div>
  );
}

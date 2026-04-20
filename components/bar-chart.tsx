"use client";

import * as React from "react";
import { useState } from "react";

export type Bar = {
  label: string;
  value: number;
  color?: string;
  source?: string;
  sublabel?: string;
};

export function BarChart({
  bars,
  height = 280,
  maxOverride,
  minLabelWidth = 68,
  valueFormat,
}: {
  bars: Bar[];
  height?: number;
  maxOverride?: number;
  minLabelWidth?: number;
  valueFormat?: (v: number) => string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  if (bars.length === 0) {
    return <EmptyChartState height={height} />;
  }
  const max = maxOverride ?? Math.max(...bars.map((b) => b.value)) * 1.05;
  const n = bars.length;
  const chartW = Math.max(n * minLabelWidth, 320);
  const pad = { top: 24, right: 12, bottom: 78, left: 24 };
  const plotH = height - pad.top - pad.bottom;
  const slot = (chartW - pad.left - pad.right) / n;
  const barW = Math.min(40, slot * 0.62);

  const fmt = valueFormat ?? ((v: number) => (v < 10 ? v.toFixed(2) : v.toFixed(0)));

  return (
    <div className="w-full overflow-x-auto relative">
      <svg
        width={chartW}
        height={height}
        viewBox={`0 0 ${chartW} ${height}`}
        className="block"
        onMouseLeave={() => setHoverIdx(null)}
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
          const slotX = pad.left + i * slot;
          const x = slotX + (slot - barW) / 2;
          const y = pad.top + (plotH - h);
          const color = b.color ?? "var(--chart-3)";
          const active = hoverIdx === i;
          return (
            <g key={i} onMouseEnter={() => setHoverIdx(i)}>
              <rect
                x={slotX}
                y={pad.top}
                width={slot}
                height={plotH}
                fill="transparent"
              />
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                fill={color}
                rx={3}
                opacity={hoverIdx === null || active ? 1 : 0.45}
              />
              <text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="11"
                fill="var(--foreground)"
                fontWeight={600}
              >
                {fmt(b.value)}
              </text>
              <text
                x={x + barW / 2}
                y={height - pad.bottom + 14}
                textAnchor="end"
                fontSize="10"
                fill="var(--foreground-muted)"
                transform={`rotate(-35, ${x + barW / 2}, ${height - pad.bottom + 14})`}
              >
                {b.label.length > 18 ? b.label.slice(0, 16) + "." : b.label}
              </text>
            </g>
          );
        })}
      </svg>
      {hoverIdx !== null && bars[hoverIdx] && (
        <div
          className="absolute pointer-events-none bg-[color:var(--foreground)] text-[color:var(--background)] rounded-[8px] px-3 py-2 text-xs shadow-sm"
          style={{
            left: Math.min(
              pad.left + hoverIdx * slot + slot / 2 + 8,
              chartW - 220,
            ),
            top: pad.top,
          }}
        >
          <div className="font-medium">{bars[hoverIdx].label}</div>
          {bars[hoverIdx].sublabel && (
            <div className="opacity-70 mt-0.5">{bars[hoverIdx].sublabel}</div>
          )}
          <div className="font-mono mt-0.5">{fmt(bars[hoverIdx].value)}</div>
        </div>
      )}
    </div>
  );
}

function EmptyChartState({ height }: { height: number }) {
  return (
    <div
      className="w-full rounded-[12px] border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface)] flex items-center justify-center text-sm text-[color:var(--foreground-muted)]"
      style={{ minHeight: height }}
    >
      No chart data available.
    </div>
  );
}

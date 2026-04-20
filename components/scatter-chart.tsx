"use client";

import * as React from "react";
import { useState } from "react";

export type ScatterPoint = {
  id: string;
  x: number;
  y: number;
  label: string;
  color?: string;
  group?: string;
};

export function ScatterChart({
  points,
  xLabel,
  yLabel,
  xMin,
  xMax,
  yMin = 0,
  yMax = 1,
  height = 420,
  highlightQuadrant = true,
  onPointClick,
}: {
  points: ScatterPoint[];
  xLabel: string;
  yLabel: string;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  height?: number;
  highlightQuadrant?: boolean;
  onPointClick?: (p: ScatterPoint) => void;
}) {
  const [hover, setHover] = useState<ScatterPoint | null>(null);
  if (points.length === 0) {
    return <EmptyChartState height={height} />;
  }
  const xs = points.map((p) => p.x);
  const _xMin = xMin ?? Math.min(...xs);
  const _xMax = xMax ?? Math.max(...xs);
  const width = 680;
  const pad = { top: 20, right: 24, bottom: 44, left: 44 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const toX = (v: number) => pad.left + ((v - _xMin) / (_xMax - _xMin || 1)) * plotW;
  const toY = (v: number) => pad.top + (1 - (v - yMin) / (yMax - yMin || 1)) * plotH;

  return (
    <div className="w-full overflow-x-auto relative">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {highlightQuadrant && (
          <rect
            x={pad.left}
            y={pad.top}
            width={plotW / 2}
            height={plotH / 2}
            fill="var(--chart-2)"
            opacity="0.12"
          />
        )}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = pad.top + plotH * (1 - f);
          const val = yMin + (yMax - yMin) * f;
          return (
            <g key={f}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeDasharray={f === 0 ? "" : "2 3"}
              />
              <text x={pad.left - 8} y={y + 3} fontSize="10" fill="var(--foreground-muted)" textAnchor="end">
                {val.toFixed(2)}
              </text>
            </g>
          );
        })}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const x = pad.left + plotW * f;
          const val = _xMin + (_xMax - _xMin) * f;
          return (
            <text key={f} x={x} y={height - pad.bottom + 14} fontSize="10" fill="var(--foreground-muted)" textAnchor="middle">
              {val.toFixed(0)}
            </text>
          );
        })}

        {points.map((p) => (
          <g
            key={p.id}
            style={{ cursor: onPointClick ? "pointer" : "default" }}
            onMouseEnter={() => setHover(p)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onPointClick?.(p)}
          >
            <circle cx={toX(p.x)} cy={toY(p.y)} r={6} fill={p.color ?? "var(--chart-1)"} stroke="var(--surface)" strokeWidth={1.5} />
          </g>
        ))}

        <text x={width / 2} y={height - 6} fontSize="11" fill="var(--foreground-muted)" textAnchor="middle">
          {xLabel}
        </text>
        <text x={10} y={pad.top - 6} fontSize="11" fill="var(--foreground-muted)">
          {yLabel}
        </text>
      </svg>

      {hover && (
        <div
          className="absolute pointer-events-none bg-[color:var(--surface)] border border-[color:var(--border)] rounded-[8px] px-3 py-2 text-xs shadow-sm"
          style={{
            left: Math.min(toX(hover.x) + 10, width - 220),
            top: Math.max(toY(hover.y) - 10, 0),
          }}
        >
          <div className="font-medium">{hover.label}</div>
          <div className="text-[color:var(--foreground-muted)] mt-0.5">
            {xLabel}: {hover.x.toFixed(2)} · {yLabel}: {hover.y.toFixed(2)}
          </div>
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

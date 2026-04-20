import { cn } from "@/lib/utils";

export function Sparkline({
  values,
  width = 120,
  height = 32,
  className,
  stroke = "currentColor",
}: {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
  stroke?: string;
}) {
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1 || 1);
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("block", className)}
      style={{ width, height }}
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth={1.25}
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MiniLearningCurve({
  values,
  baseline,
  width = 280,
  height = 80,
}: {
  values: number[];
  baseline?: number;
  width?: number;
  height?: number;
}) {
  const min = Math.min(...values, baseline ?? Infinity) * 0.95;
  const max = Math.max(...values, baseline ?? -Infinity) * 1.05;
  const range = max - min || 1;
  const step = width / (values.length - 1 || 1);
  const points = values
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(" ");
  const base = baseline !== undefined ? height - ((baseline - min) / range) * height : null;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="block w-full h-auto text-[color:var(--foreground)]"
      preserveAspectRatio="none"
    >
      <rect x={0} y={0} width={width} height={height} fill="var(--surface-alt)" />
      {base !== null && (
        <line
          x1={0}
          x2={width}
          y1={base}
          y2={base}
          stroke="var(--foreground-muted)"
          strokeDasharray="4 4"
          strokeWidth={1}
        />
      )}
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

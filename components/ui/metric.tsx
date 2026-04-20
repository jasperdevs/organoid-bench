import * as React from "react";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  sub,
  mono = true,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[16px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 flex flex-col",
        className,
      )}
    >
      <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)]">
        {label}
      </div>
      <div className={cn("mt-2 text-2xl font-semibold tracking-tight", mono && "font-mono")}>
        {value}
      </div>
      {sub && (
        <div className="mt-1 text-xs text-[color:var(--foreground-muted)]">{sub}</div>
      )}
    </div>
  );
}

export function StatRow({
  items,
  className,
}: {
  items: { label: string; value: React.ReactNode }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-px rounded-[16px] overflow-hidden border border-[color:var(--border)] bg-[color:var(--border)]",
        className,
      )}
    >
      {items.map((i, idx) => (
        <div key={idx} className="bg-[color:var(--surface)] p-4">
          <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)]">
            {i.label}
          </div>
          <div className="mt-1 text-lg font-mono font-semibold tracking-tight">
            {i.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export function KV({
  k,
  v,
  mono,
}: {
  k: string;
  v: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-[color:var(--border)] last:border-0">
      <div className="text-sm text-[color:var(--foreground-muted)]">{k}</div>
      <div className={cn("text-sm text-right", mono && "font-mono text-xs")}>{v}</div>
    </div>
  );
}

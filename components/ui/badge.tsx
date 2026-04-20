import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "muted" | "success" | "warning" | "destructive" | "info" | "outline";

const tones: Record<Tone, string> = {
  default: "bg-[color:var(--foreground)] text-[color:var(--background)] border-transparent",
  muted: "bg-[color:var(--surface-alt)] text-[color:var(--foreground)] border-transparent",
  outline: "border border-[color:var(--border)] text-[color:var(--foreground)] bg-transparent",
  success: "bg-[color:var(--surface-alt)] text-[color:var(--success)] border-transparent",
  warning: "bg-[color:var(--surface-alt)] text-[color:var(--warning)] border-transparent",
  destructive: "bg-[color:var(--surface-alt)] text-[color:var(--destructive)] border-transparent",
  info: "bg-[color:var(--surface-alt)] text-[color:var(--info)] border-transparent",
};

export function Badge({
  children,
  tone = "muted",
  className,
  mono = false,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  mono?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs border",
        mono && "font-mono",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

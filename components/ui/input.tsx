import * as React from "react";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm",
        "placeholder:text-[color:var(--foreground-muted)]",
        "focus:outline-none focus:border-[color:var(--foreground)]",
        props.className,
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-10 w-full rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm",
        "focus:outline-none focus:border-[color:var(--foreground)]",
        "appearance-none bg-no-repeat bg-right pr-8",
        props.className,
      )}
      style={{
        backgroundImage:
          'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236B6B6B\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'/></svg>")',
        backgroundPosition: "right 10px center",
      }}
    />
  );
}

export function Label({
  children,
  className,
  htmlFor,
}: {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("block text-sm font-medium mb-1.5", className)}
    >
      {children}
    </label>
  );
}

export function Checkbox({
  label,
  ...props
}: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
      <input type="checkbox" {...props} className="h-4 w-4 rounded border-[color:var(--border)]" />
      {label && <span>{label}</span>}
    </label>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-[16px] border border-[color:var(--border)] bg-[color:var(--surface)]", className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="text-left text-xs uppercase tracking-wide text-[color:var(--foreground-muted)] bg-[color:var(--surface-alt)]">
      {children}
    </thead>
  );
}

export function TH({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("font-medium px-4 py-3 whitespace-nowrap", className)}>
      {children}
    </th>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-[color:var(--border)]">{children}</tbody>;
}

export function TR({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <tr className={cn(hover && "hover:bg-[color:var(--surface-alt)]", className)}>
      {children}
    </tr>
  );
}

export function TD({
  children,
  className,
  mono = false,
}: {
  children?: React.ReactNode;
  className?: string;
  mono?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle whitespace-nowrap",
        mono && "font-mono text-xs",
        className,
      )}
    >
      {children}
    </td>
  );
}

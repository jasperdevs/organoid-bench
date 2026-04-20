import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "default";

const base =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap rounded-[12px] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)] " +
  "disabled:opacity-50 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-[color:var(--foreground)] text-[color:var(--background)] hover:opacity-90",
  secondary:
    "bg-[color:var(--surface-alt)] text-[color:var(--foreground)] hover:bg-[color:var(--border)]",
  ghost:
    "text-[color:var(--foreground)] hover:bg-[color:var(--surface-alt)]",
  outline:
    "border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-alt)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  default: "h-10 px-4 text-sm",
};

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size">;

export function Button({
  variant = "primary",
  size = "default",
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

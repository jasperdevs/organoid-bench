import * as React from "react";
import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1200px] px-4 md:px-6", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  right,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-[color:var(--border)] bg-[color:var(--surface)]">
      <Container className="py-8 md:py-10">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="min-w-0 max-w-[720px]">
            {eyebrow && (
              <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-2">
                {eyebrow}
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
            {description && (
              <p className="mt-3 text-base text-[color:var(--foreground-muted)]">
                {description}
              </p>
            )}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </div>
        {children}
      </Container>
    </div>
  );
}

export function Section({
  title,
  description,
  right,
  children,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("py-8 md:py-12", className)}>
      <Container>
        {(title || description || right) && (
          <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
            <div className="min-w-0">
              {title && (
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-[color:var(--foreground-muted)] max-w-[640px]">
                  {description}
                </p>
              )}
            </div>
            {right}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}

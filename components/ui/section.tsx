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
    <div className={cn("mx-auto w-full max-w-[1280px] px-4 md:px-8", className)}>
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
    <div className="bg-[color:var(--background)]">
      <Container className="pt-14 md:pt-20 pb-10">
        <div className="flex items-start justify-between gap-10 flex-wrap">
          <div className="min-w-0 max-w-[720px]">
            {eyebrow && (
              <div className="text-sm text-[color:var(--foreground-muted)] mb-3">
                {eyebrow}
              </div>
            )}
            <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] text-[color:var(--foreground)]">
              {title}
            </h1>
            {description && (
              <p className="mt-5 text-base text-[color:var(--foreground-muted)] max-w-[560px]">
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
  id,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-8 md:py-10", className)}>
      <Container>
        {(title || description || right) && (
          <div className="flex items-end justify-between gap-4 mb-5 flex-wrap border-b border-[color:var(--border)] pb-3">
            <div className="min-w-0">
              {title && (
                <h2 className="text-base font-semibold text-[color:var(--foreground)]">
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

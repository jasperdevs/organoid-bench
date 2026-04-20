import Link from "next/link";
import { Container } from "@/components/ui/section";

const nav = [
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/systems", label: "Systems" },
  { href: "/datasets", label: "Datasets" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[color:var(--background)] border-b border-[color:var(--border)]">
      <Container>
        <div className="h-16 flex items-center gap-4">
          <Link
            href="/"
            className="shrink-0 inline-flex items-center gap-2 bg-[color:var(--foreground)] text-[color:var(--background)] rounded-full pl-3 pr-4 py-1.5"
          >
            <LogoMark />
            <span className="text-sm font-semibold tracking-tight">
              OrganoidBench
            </span>
          </Link>

          <nav className="hidden lg:flex items-center bg-[color:var(--surface-alt)] rounded-full p-1 gap-0.5">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="px-3.5 py-1.5 rounded-full text-sm text-[color:var(--foreground)] hover:bg-[color:var(--surface)] font-medium"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/submit"
              className="hidden sm:inline-flex items-center rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Submit entry
            </Link>
          </div>
        </div>

        <div className="lg:hidden pb-3 -mt-1 overflow-x-auto">
          <nav className="inline-flex items-center bg-[color:var(--surface-alt)] rounded-full p-1 gap-0.5">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="px-3.5 py-1.5 rounded-full text-sm text-[color:var(--foreground)] hover:bg-[color:var(--surface)] font-medium whitespace-nowrap"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </header>
  );
}

function LogoMark() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="5" cy="8" r="2.5" fill="currentColor" />
      <circle cx="11" cy="5" r="1.5" fill="currentColor" />
      <circle cx="11" cy="11" r="1.5" fill="currentColor" />
      <path
        d="M7 8h2.5M9.5 6.5l1.5-1M9.5 9.5l1.5 1"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

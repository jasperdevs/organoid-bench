import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { GlobalSearch } from "@/components/global-search";

const nav = [
  { href: "/leaderboard", label: "leaderboard" },
  { href: "/benchmarks", label: "benchmarks" },
  { href: "/systems", label: "systems" },
  { href: "/datasets", label: "datasets" },
  { href: "/labs", label: "labs" },
  { href: "/methodology", label: "methodology" },
  { href: "/submit", label: "submit" },
  { href: "/docs", label: "docs" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--surface)]/90 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--surface)]/80">
      <Container>
        <div className="h-14 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="h-6 w-6 rounded-[8px] bg-[color:var(--foreground)] text-[color:var(--background)] grid place-items-center text-[10px] font-semibold">
              OB
            </span>
            <span className="font-logo text-xl leading-none">organoidbench</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 text-sm">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="px-3 py-1.5 rounded-[12px] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--surface-alt)]"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:block w-56">
              <GlobalSearch />
            </div>
            <Button href="/submit" size="sm" variant="primary">
              submit result
            </Button>
          </div>
        </div>

        <div className="lg:hidden pb-2 overflow-x-auto">
          <nav className="flex items-center gap-1 text-sm">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="px-3 py-1.5 rounded-[12px] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--surface-alt)] whitespace-nowrap"
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

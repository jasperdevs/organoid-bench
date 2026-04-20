import Link from "next/link";
import { Container } from "@/components/ui/section";
import { GitHubIcon, XIcon } from "@/components/brand-icons";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/leaderboards", label: "Leaderboard" },
      { href: "/benchmarks", label: "Tracks" },
      { href: "/datasets", label: "Data" },
      { href: "/submit", label: "Submit" },
    ],
  },
  {
    title: "Registry",
    links: [
      { href: "/systems", label: "Systems" },
      { href: "/sources", label: "Sources" },
      { href: "/organizations", label: "Labs" },
      { href: "/methodology", label: "Methodology" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "Overview" },
      { href: "/docs", label: "API" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)]">
      <Container className="py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.5fr_0.8fr] gap-12">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <svg width="54" height="54" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="5" cy="8" r="2.5" fill="currentColor" />
                <circle cx="11" cy="5" r="1.5" fill="currentColor" />
                <circle cx="11" cy="11" r="1.5" fill="currentColor" />
              </svg>
              <span className="font-serif text-4xl leading-none">Organoid<br />Bench</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {columns.map((col) => (
              <div key={col.title}>
                <div className="text-sm font-semibold mb-4 opacity-70">{col.title}</div>
                <ul className="space-y-2 text-sm">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="opacity-80 hover:opacity-100"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex lg:justify-end gap-3">
            <a
              href="https://github.com/jasperdevs/organoid-bench"
              className="inline-flex h-9 w-9 items-center justify-center border border-[rgba(255,255,255,0.35)] hover:bg-[color:var(--background)] hover:text-[color:var(--foreground)]"
              aria-label="GitHub"
            >
              <GitHubIcon className="h-4 w-4" />
            </a>
            <a
              href="https://x.com/jasperdevs"
              className="inline-flex h-9 w-9 items-center justify-center border border-[rgba(255,255,255,0.35)] hover:bg-[color:var(--background)] hover:text-[color:var(--foreground)]"
              aria-label="X"
            >
              <XIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(255,255,255,0.2)] pt-6 text-xs opacity-70">
          <div>© 2026 OrganoidBench</div>
          <div className="flex gap-6">
            <Link href="/about" className="hover:opacity-100">About</Link>
            <Link href="/methodology" className="hover:opacity-100">Methodology</Link>
            <Link href="/submit" className="hover:opacity-100">Submit</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

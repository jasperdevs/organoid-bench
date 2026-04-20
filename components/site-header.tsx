"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/section";
import { getGithubRepo } from "@/lib/github-config";
import { GitHubIcon } from "@/components/brand-icons";

const nav = [
  { href: "/leaderboards", label: "Leaderboard" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/datasets", label: "Data" },
  { href: "/about", label: "About" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const githubRepo = getGithubRepo();
  const submitHref = `https://github.com/${githubRepo}/issues/new/choose`;
  return (
    <header className="sticky top-0 z-40 bg-[color:var(--background)] border-b border-[color:var(--border)]">
      <Container>
        <div className="h-16 flex items-center gap-4">
          <Link
            href="/"
            className="shrink-0 inline-flex items-center gap-2 bg-[color:var(--foreground)] text-[color:var(--background)] rounded-full pl-2.5 pr-4 py-1.5"
          >
            <LogoMark />
            <span className="font-serif text-xl leading-none">
              OrganoidBench
            </span>
          </Link>

          <nav className="hidden lg:flex items-center bg-[color:var(--surface-alt)] rounded-full p-1 gap-0.5">
            {nav.map((n) => {
              const active = isActive(pathname, n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium ${
                    active
                      ? "bg-[color:var(--foreground)] text-[color:var(--background)]"
                      : "text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <a
              href={submitHref}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              <GitHubIcon className="h-4 w-4" />
              Submit entry
            </a>
          </div>
        </div>

        <div className="lg:hidden pb-3 -mt-1 overflow-x-auto">
          <nav className="inline-flex items-center bg-[color:var(--surface-alt)] rounded-full p-1 gap-0.5">
            {nav.map((n) => {
              const active = isActive(pathname, n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                    active
                      ? "bg-[color:var(--foreground)] text-[color:var(--background)]"
                      : "text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </Container>
    </header>
  );
}

function LogoMark() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="9" cy="10" r="1.6" fill="currentColor" />
      <circle cx="15" cy="10" r="1.2" fill="currentColor" />
      <circle cx="10.5" cy="14.5" r="1.2" fill="currentColor" />
      <circle cx="14.5" cy="14.5" r="1.4" fill="currentColor" />
      <path d="M9 10 L15 10 M10.5 14.5 L14.5 14.5 M9 10 L10.5 14.5 M15 10 L14.5 14.5" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}

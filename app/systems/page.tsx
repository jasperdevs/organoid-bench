import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/section";
import { SystemsBrowser } from "@/components/systems-browser";

export default function SystemsIndex() {
  return (
    <>
      <PageHeader
        eyebrow="Systems"
        title="All benchmarked systems"
        description="A system is the full experimental setup: organoid, culture protocol, recording hardware, stimulation method, decoder, task, controls, dataset, and source."
        right={
          <Link
            href="/submit"
            className="inline-flex items-center rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Submit a system
          </Link>
        }
      />
      <Container>
        <SystemsBrowser />
      </Container>
      <div className="h-16" />
    </>
  );
}

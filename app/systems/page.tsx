import { Container, PageHeader } from "@/components/ui/section";
import { SystemsBrowser } from "@/components/systems-browser";

export default function SystemsIndex() {
  return (
    <>
      <PageHeader
        eyebrow="Systems"
        title="All benchmarked systems"
        description="A system is the full experimental setup: organoid, culture protocol, recording hardware, stimulation method, decoder, task, controls, dataset, and source."
      />
      <Container>
        <SystemsBrowser />
      </Container>
      <div className="h-16" />
    </>
  );
}

import { PageHeader, Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { SystemsBrowser } from "@/components/systems-browser";

export default function SystemsIndex() {
  return (
    <>
      <PageHeader
        eyebrow="systems"
        title="all benchmarked systems"
        description="A system is the full experimental setup: organoid + culture protocol + recording hardware + stimulation method + decoder/controller + task + controls + dataset + lab."
        right={
          <Button href="/submit" size="sm" variant="primary">
            submit a system
          </Button>
        }
      />
      <Section>
        <SystemsBrowser />
      </Section>
    </>
  );
}

import { PageHeader, Section } from "@/components/ui/section";
import { PapersBrowser } from "@/components/papers-browser";

export default function PapersPage() {
  return (
    <>
      <PageHeader
        eyebrow="papers & sources"
        title="published and preprint sources"
        description="Every OrganoidBench entry links to at least one source. Preprints are listed but flagged clearly — peer-reviewed sources increase confidence grade."
      />
      <Section>
        <PapersBrowser />
      </Section>
    </>
  );
}

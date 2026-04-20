import { PageHeader, Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { DatasetsBrowser } from "@/components/datasets-browser";

export default function DatasetsIndex() {
  return (
    <>
      <PageHeader
        eyebrow="datasets"
        title="benchmark-linked datasets"
        description="Every dataset is indexed with its modality, license, and the benchmark tracks it can support. Prefer datasets with public raw data and open code."
        right={
          <Button href="/submit#dataset" size="sm" variant="primary">
            submit a dataset
          </Button>
        }
      />
      <Section>
        <DatasetsBrowser />
      </Section>
    </>
  );
}

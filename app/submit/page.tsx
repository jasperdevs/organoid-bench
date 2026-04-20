import { PageHeader, Container } from "@/components/ui/section";
import { GitHubIntake } from "./github-intake";
import { getGithubRepo } from "@/lib/github-config";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const repo = getGithubRepo();

  return (
    <>
      <PageHeader
        eyebrow="Submit"
        title="Submit through GitHub Issues"
        description="Choose the relevant issue template. Accepted submissions are curated into the registry before they appear on the site."
      />
      <Container>
        <GitHubIntake repo={repo} />
      </Container>
      <div className="h-16" />
    </>
  );
}

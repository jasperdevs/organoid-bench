import Link from "next/link";
import { PageHeader, Section } from "@/components/ui/section";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KV } from "@/components/ui/metric";
import { STATUS_COUNTS } from "@/lib/data";

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="about"
        title="about OrganoidBench"
        description="A public, versioned benchmark for brain organoid electrophysiology, plasticity, and closed-loop learning systems."
      />

      <Section title="what it is">
        <Card>
          <p className="text-sm max-w-prose">
            OrganoidBench is a curated index of published and preprint work that
            measures electrical activity, stimulus response, plasticity, and
            closed-loop task performance in brain organoids, cortical spheroids,
            and related cortical cell systems. Every entry pairs a dataset,
            paper, and experimental setup with a set of standardised,
            reproducible metrics.
          </p>
          <p className="text-sm max-w-prose mt-3 text-[color:var(--foreground-muted)]">
            We are a benchmark, not a journal and not a replication service. We
            do not generate new data — we score, compare, and flag existing
            data under a single methodology.
          </p>
        </Card>
      </Section>

      <Section title="why it exists">
        <Card>
          <ul className="list-disc pl-5 text-sm space-y-2 max-w-prose">
            <li>
              Results in organoid ephys and closed-loop learning are scattered
              across preprints, journals, and lab websites, with incompatible
              metrics.
            </li>
            <li>
              Claims about "learning" or "intelligence" in organoid systems are
              easy to make and hard to compare. A shared scoring protocol makes
              the comparison explicit.
            </li>
            <li>
              Reviewers, funders, and journalists need a neutral place to check
              what has actually been demonstrated — separate from lab press
              releases.
            </li>
          </ul>
        </Card>
      </Section>

      <Section title="what problem it solves">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader title="comparability" />
            <p className="text-sm text-[color:var(--foreground-muted)]">
              Different labs report different numbers for the same phenomenon.
              OrganoidBench re-scores results under a single versioned
              methodology so they can be lined up.
            </p>
          </Card>
          <Card>
            <CardHeader title="reproducibility signal" />
            <p className="text-sm text-[color:var(--foreground-muted)]">
              A confidence grade captures sample size, controls, open data, and
              independent replication — so a reader can tell a one-off result
              from a repeatedly-confirmed one.
            </p>
          </Card>
          <Card>
            <CardHeader title="honest scope" />
            <p className="text-sm text-[color:var(--foreground-muted)]">
              By naming what the benchmark does <em>not</em> measure
              (consciousness, sentience, subjective experience) we keep the
              scoreboard about what can actually be quantified.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="who it is for">
        <Card>
          <ul className="list-disc pl-5 text-sm space-y-1.5 max-w-prose">
            <li>organoid labs preparing a submission or tracking the field</li>
            <li>electrophysiology researchers comparing MEA / patch / imaging setups</li>
            <li>closed-loop learning and BMI researchers evaluating decoders</li>
            <li>wetware computing groups looking for credible baselines</li>
            <li>funders and program officers evaluating proposals</li>
            <li>reviewers checking claims against prior work</li>
            <li>journalists and science communicators wanting a neutral reference</li>
          </ul>
        </Card>
      </Section>

      <Section title="what it is not">
        <Card className="bg-[color:var(--surface-alt)]">
          <ul className="list-disc pl-5 text-sm space-y-2 max-w-prose">
            <li>not a measure of consciousness, sentience, or subjective experience</li>
            <li>not a measure of general intelligence or biological IQ</li>
            <li>not an endorsement of any commercial wetware platform</li>
            <li>not a replacement for peer review or independent replication</li>
            <li>not a clinical or diagnostic tool</li>
          </ul>
        </Card>
      </Section>

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="snapshot" description="current state of the index" />
            <KV k="systems indexed" v={STATUS_COUNTS.systems} mono />
            <KV k="organoids covered" v={STATUS_COUNTS.organoids} mono />
            <KV k="datasets linked" v={STATUS_COUNTS.datasets} mono />
            <KV k="labs represented" v={STATUS_COUNTS.labs} mono />
            <KV k="methodology version" v={STATUS_COUNTS.methodologyVersion} mono />
            <KV k="last updated" v={STATUS_COUNTS.lastUpdated} mono />
          </Card>

          <Card>
            <CardHeader title="contact" />
            <KV k="general" v="hello@organoidbench.org" mono />
            <KV k="submissions" v="submit@organoidbench.org" mono />
            <KV k="corrections" v="corrections@organoidbench.org" mono />
            <KV k="press" v="press@organoidbench.org" mono />
            <div className="mt-4 flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" href="https://github.com/organoidbench">
                github
              </Button>
              <Button size="sm" variant="outline" href="/submit">
                submit an entry
              </Button>
              <Button size="sm" variant="ghost" href="/governance">
                governance
              </Button>
            </div>
          </Card>
        </div>
      </Section>

      <Section title="citation">
        <Card>
          <p className="text-sm text-[color:var(--foreground-muted)] mb-3">
            When citing OrganoidBench in a publication, cite both the specific
            entry id and the methodology version.
          </p>
          <pre className="font-mono text-xs whitespace-pre bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)] overflow-x-auto">
{`@misc{organoidbench_${STATUS_COUNTS.methodologyVersion.replace(/\./g, "_")},
  title        = {OrganoidBench: a benchmark for brain organoid electrophysiology
                  and closed-loop learning systems},
  howpublished = {https://organoidbench.org},
  version      = {${STATUS_COUNTS.methodologyVersion}},
  year         = {2026},
  note         = {accessed ${STATUS_COUNTS.lastUpdated}}
}`}
          </pre>
          <div className="mt-4 flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" href="#">copy citation</Button>
            <Button size="sm" variant="ghost" href="/methodology#versioning">
              methodology versions
            </Button>
          </div>
        </Card>
      </Section>

      <Section title="acknowledgements">
        <Card>
          <p className="text-sm text-[color:var(--foreground-muted)] max-w-prose">
            OrganoidBench exists because individual labs have made their data,
            protocols, and code public. The benchmark is only as good as those
            open artifacts. Corrections, additions, and disputes are welcome
            through the{" "}
            <Link href="/submit" className="underline underline-offset-2">
              submission flow
            </Link>{" "}
            or directly through{" "}
            <Link href="/governance#corrections" className="underline underline-offset-2">
              the corrections process
            </Link>
            .
          </p>
        </Card>
      </Section>
    </>
  );
}

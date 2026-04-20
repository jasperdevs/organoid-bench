/**
 * Canonical seed for OrganoidBench.
 *
 * Only loads:
 *   - 6 benchmark tracks
 *   - their metric definitions
 *   - canonical tasks per track
 *   - methodology version 1.0.0
 *   - control checklist items
 *
 * Does NOT load any systems, datasets, sources, organizations, runs,
 * metric values, or scores. Those only enter through ingestion or
 * the submission workflow, never through seed data.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

type TrackSeed = {
  slug: string;
  name: string;
  description: string;
  rationale: string;
  scoringFormula: string;
  sortOrder: number;
  metrics: {
    slug: string;
    name: string;
    description: string;
    unit: string | null;
    direction: "higher_better" | "lower_better";
  }[];
  tasks: { slug: string; name: string; description: string }[];
};

const TRACKS: TrackSeed[] = [
  {
    slug: "signal-quality",
    name: "Signal Quality",
    sortOrder: 10,
    description:
      "Electrophysiological recording fidelity from the preparation: SNR, channel yield, spike sortability.",
    rationale:
      "A closed-loop system cannot score above its recording floor. Signal quality is the baseline precondition for every downstream claim.",
    scoringFormula:
      "Composite of normalized SNR, active-channel ratio, and spike-sorting unit yield. Equal weights per sub-metric, clipped to [0, 1].",
    metrics: [
      { slug: "snr_db", name: "Spike SNR", description: "Median spike signal-to-noise ratio across active channels.", unit: "dB", direction: "higher_better" },
      { slug: "active_channel_ratio", name: "Active channel ratio", description: "Fraction of electrodes with at least one detected unit.", unit: "ratio", direction: "higher_better" },
      { slug: "units_per_array", name: "Sorted units per array", description: "Number of well-isolated single units after spike sorting.", unit: "units", direction: "higher_better" },
      { slug: "isi_violation_rate", name: "ISI violation rate", description: "Fraction of inter-spike intervals below the refractory threshold.", unit: "ratio", direction: "lower_better" },
    ],
    tasks: [
      { slug: "baseline-recording", name: "Baseline recording", description: "Spontaneous activity recording with no stimulation." },
      { slug: "stimulated-recording", name: "Stimulated recording", description: "Recording during controlled stimulation protocol." },
    ],
  },
  {
    slug: "responsiveness",
    name: "Responsiveness",
    sortOrder: 20,
    description:
      "Does input change output? Evoked response magnitude, latency, and selectivity under matched controls.",
    rationale:
      "Responsiveness separates preparations that merely produce spontaneous activity from those whose activity is contingent on input.",
    scoringFormula:
      "Weighted mean of evoked-vs-sham effect size (z-scored), response latency (inverted), and input-pattern selectivity (d-prime).",
    metrics: [
      { slug: "evoked_effect_size", name: "Evoked response effect size", description: "Cohen's d between evoked and sham-matched spike counts.", unit: "d", direction: "higher_better" },
      { slug: "response_latency_ms", name: "Response latency", description: "Median first-spike latency after stimulus onset.", unit: "ms", direction: "lower_better" },
      { slug: "pattern_selectivity_dprime", name: "Pattern selectivity", description: "d-prime between responses to different stimulus patterns.", unit: "d'", direction: "higher_better" },
    ],
    tasks: [
      { slug: "evoked-vs-sham", name: "Evoked vs sham", description: "Paired evoked and sham stimulation sessions." },
      { slug: "pattern-discrimination", name: "Pattern discrimination", description: "Multiple stimulus patterns, discrimination scored by decoder or d-prime." },
    ],
  },
  {
    slug: "plasticity",
    name: "Plasticity",
    sortOrder: 30,
    description:
      "Does repeated input durably change the input-to-output mapping? Open-loop plasticity with matched controls.",
    rationale:
      "Plasticity is the mechanistic substrate any learning claim depends on. Without paired/unpaired controls, drift and adaptation look identical.",
    scoringFormula:
      "Post-minus-pre response change normalized by sham-matched change. Requires paired-vs-unpaired control to score.",
    metrics: [
      { slug: "paired_unpaired_delta", name: "Paired vs unpaired delta", description: "Response change in paired condition minus unpaired control.", unit: "delta", direction: "higher_better" },
      { slug: "induction_half_life_min", name: "Induction half-life", description: "Time for paired-minus-unpaired effect to reach half maximum.", unit: "min", direction: "lower_better" },
    ],
    tasks: [
      { slug: "paired-induction", name: "Paired induction", description: "Paired pre/post stimulation protocol with unpaired control." },
    ],
  },
  {
    slug: "closed-loop-learning",
    name: "Closed-Loop Learning",
    sortOrder: 40,
    description:
      "Task performance under stimulus-contingent feedback, versus matched no-feedback control.",
    rationale:
      "Closed-loop performance improvement (vs control) is the field's operational definition of stimulus-contingent adaptation at the task level. Not a claim about internal cognition.",
    scoringFormula:
      "Performance improvement over training (feedback minus no-feedback), z-scored against a batch-level null distribution.",
    metrics: [
      { slug: "terminal_performance_delta", name: "Terminal performance delta", description: "Final block performance in feedback condition minus no-feedback control.", unit: "delta", direction: "higher_better" },
      { slug: "learning_curve_auc", name: "Learning curve AUC", description: "Area under the performance-over-time curve, feedback minus control.", unit: "auc", direction: "higher_better" },
    ],
    tasks: [
      { slug: "closed-loop-pong", name: "Closed-loop Pong-like task", description: "Paddle control task with stimulus-contingent feedback." },
      { slug: "closed-loop-2afc", name: "Closed-loop 2AFC", description: "Two-alternative forced choice with feedback-gated reward signal." },
    ],
  },
  {
    slug: "retention",
    name: "Retention",
    sortOrder: 50,
    description:
      "Does an induced change persist? Re-test at fixed delays against matched pre-induction baseline.",
    rationale:
      "Retention is how a plasticity or learning claim transitions from 'change' to 'memory'. Requires specified delays and no intervening exposure.",
    scoringFormula:
      "Retained effect at 1h/24h/7d expressed as fraction of immediate post-induction effect. Score is weighted mean across delays.",
    metrics: [
      { slug: "retention_1h", name: "Retention at 1h", description: "Effect retained after 1 hour, as fraction of immediate post.", unit: "ratio", direction: "higher_better" },
      { slug: "retention_24h", name: "Retention at 24h", description: "Effect retained after 24 hours, as fraction of immediate post.", unit: "ratio", direction: "higher_better" },
      { slug: "retention_7d", name: "Retention at 7d", description: "Effect retained after 7 days, as fraction of immediate post.", unit: "ratio", direction: "higher_better" },
    ],
    tasks: [
      { slug: "delayed-retest", name: "Delayed retest", description: "Re-test at one or more fixed delays after induction." },
    ],
  },
  {
    slug: "reproducibility",
    name: "Reproducibility",
    sortOrder: 60,
    description:
      "Are results stable across batches and labs? Within-lab and cross-lab coefficient of variation on headline metric.",
    rationale:
      "Per-track scores without reproducibility data hide cross-batch variance. This track is a first-class citizen, not a footnote.",
    scoringFormula:
      "1 minus normalized coefficient of variation across batches (within-lab) and across labs (cross-lab). Both must be reported for a full score.",
    metrics: [
      { slug: "within_lab_cv", name: "Within-lab CV", description: "Coefficient of variation across batches within a single lab.", unit: "cv", direction: "lower_better" },
      { slug: "cross_lab_cv", name: "Cross-lab CV", description: "Coefficient of variation across labs running the same protocol.", unit: "cv", direction: "lower_better" },
      { slug: "n_replications", name: "Independent replications", description: "Number of independent labs that have replicated the result.", unit: "count", direction: "higher_better" },
    ],
    tasks: [
      { slug: "replication-panel", name: "Replication panel", description: "Same protocol, multiple batches, reported across labs when available." },
    ],
  },
];

const CONTROLS = [
  { slug: "sham-matched", name: "Sham-matched stimulation", category: "stimulation", description: "Active condition paired with sham (open-loop scrambled) stimulation at matched rate." },
  { slug: "blinded-scoring", name: "Blinded scoring", category: "analysis", description: "Performance scored by analyst blinded to condition identity." },
  { slug: "batch-null-distribution", name: "Batch-level null", category: "statistical", description: "Effect compared against a null distribution built from within-batch permutations." },
  { slug: "media-only-control", name: "Media-only control", category: "biological", description: "Preparation recorded with media changes only, no stimulation." },
  { slug: "dead-organoid-control", name: "Inactive preparation control", category: "biological", description: "Recording from fixed or inactive preparation to rule out setup artifacts." },
  { slug: "unpaired-stimulation", name: "Unpaired stimulation", category: "stimulation", description: "Input and feedback signals delivered independently at matched rates." },
  { slug: "drift-correction", name: "Drift correction", category: "analysis", description: "Baseline drift modeled and subtracted before effect estimation." },
  { slug: "protocol-preregistration", name: "Protocol preregistration", category: "statistical", description: "Analysis protocol registered before data collection." },
];

async function main() {
  console.log("Seeding canonical tracks, metrics, tasks, methodology, controls");

  // Methodology v1
  await prisma.methodologyVersion.upsert({
    where: { version: "1.0.0" },
    update: { isCurrent: true },
    create: {
      version: "1.0.0",
      releasedAt: new Date(),
      summary: "Initial public methodology. Per-track scores are raw; composite is not yet computed until cross-lab replication data is available.",
      changelog: "Initial release. Tracks, metrics, tasks, and control vocabulary established.",
      formulaJson: JSON.stringify({
        composite: {
          note: "Composite is suppressed until a run has at least one published metric in every track.",
          weights: {
            "signal-quality": 0.15,
            "responsiveness": 0.15,
            "plasticity": 0.2,
            "closed-loop-learning": 0.2,
            "retention": 0.15,
            "reproducibility": 0.15,
          },
        },
      }),
      isCurrent: true,
    },
  });

  for (const t of TRACKS) {
    const track = await prisma.benchmarkTrack.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        description: t.description,
        rationale: t.rationale,
        scoringFormula: t.scoringFormula,
        sortOrder: t.sortOrder,
      },
      create: {
        slug: t.slug,
        name: t.name,
        description: t.description,
        rationale: t.rationale,
        scoringFormula: t.scoringFormula,
        sortOrder: t.sortOrder,
      },
    });

    for (const m of t.metrics) {
      await prisma.metric.upsert({
        where: { slug: m.slug },
        update: {
          name: m.name,
          description: m.description,
          unit: m.unit,
          direction: m.direction,
          trackId: track.id,
        },
        create: {
          slug: m.slug,
          name: m.name,
          description: m.description,
          unit: m.unit,
          direction: m.direction,
          trackId: track.id,
        },
      });
    }

    for (const task of t.tasks) {
      await prisma.task.upsert({
        where: { slug: task.slug },
        update: {
          name: task.name,
          description: task.description,
          trackId: track.id,
        },
        create: {
          slug: task.slug,
          name: task.name,
          description: task.description,
          trackId: track.id,
        },
      });
    }
  }

  for (const c of CONTROLS) {
    await prisma.control.upsert({
      where: { slug: c.slug },
      update: { name: c.name, category: c.category, description: c.description },
      create: c,
    });
  }

  const trackCount = await prisma.benchmarkTrack.count();
  const metricCount = await prisma.metric.count();
  const taskCount = await prisma.task.count();
  const controlCount = await prisma.control.count();

  console.log(`Seeded ${trackCount} tracks, ${metricCount} metrics, ${taskCount} tasks, ${controlCount} controls. No systems, datasets, or scores written.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

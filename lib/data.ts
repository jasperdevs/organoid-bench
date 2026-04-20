import type { Grade } from "@/components/ui/confidence-badge";
import type { Controls } from "@/components/ui/controls-checklist";

export type Track =
  | "signal-quality"
  | "responsiveness"
  | "plasticity"
  | "closed-loop-learning"
  | "retention"
  | "reproducibility";

export const TRACKS: {
  id: Track;
  name: string;
  short: string;
  description: string;
  measures: string[];
  excludes: string[];
  metrics: { name: string; description: string; unit?: string }[];
  requiredInputs: string[];
  requiredControls: string[];
  scoringFormula: string;
  failureModes: string[];
  exampleDatasets: string[];
}[] = [
  {
    id: "signal-quality",
    name: "Signal Quality",
    short: "is the recording stable, active, and usable",
    description:
      "Measures whether the organoid recording is stable, active, and usable as a substrate for downstream benchmarking.",
    measures: [
      "active channel count",
      "mean firing rate",
      "burst rate",
      "signal-to-noise ratio",
      "recording stability",
      "artifact rate",
      "session duration",
    ],
    excludes: ["task performance", "learning", "plasticity claims"],
    metrics: [
      { name: "active channels", description: "channels with stable spiking above threshold", unit: "#" },
      { name: "mean firing rate", description: "spikes per active channel per second", unit: "hz" },
      { name: "burst rate", description: "network bursts per minute", unit: "bpm" },
      { name: "snr", description: "peak spike amplitude / rms baseline", unit: "ratio" },
      { name: "stability", description: "drift-adjusted firing rate stability across session", unit: "0–1" },
      { name: "artifact rate", description: "fraction of rejected samples", unit: "0–1" },
      { name: "duration", description: "usable continuous recording window", unit: "min" },
    ],
    requiredInputs: [
      "raw or filtered traces (per channel)",
      "sampling rate",
      "electrode count & layout",
      "recording duration",
      "spike detection method",
    ],
    requiredControls: [
      "artifact exclusion protocol",
      "baseline activity window",
      "sham-electrode / empty-well reference when available",
    ],
    scoringFormula:
      "normalized min-max across metrics, penalized by missing metadata. Missing sampling rate → Unscored.",
    failureModes: [
      "reporting spike rate without artifact rejection",
      "single short session used to claim stability",
      "mixing spontaneous and evoked windows",
    ],
    exampleDatasets: ["ob-ds-0001", "ob-ds-0004"],
  },
  {
    id: "responsiveness",
    name: "Responsiveness",
    short: "does activity change reliably after stimulation",
    description:
      "Measures whether neural activity changes reliably and with the expected structure after defined stimulation.",
    measures: [
      "evoked response reliability",
      "response latency",
      "response amplitude",
      "response spread",
      "fatigue / decay",
      "repeatability",
    ],
    excludes: ["plasticity", "task performance"],
    metrics: [
      { name: "reliability", description: "trial-to-trial evoked response consistency", unit: "0–1" },
      { name: "latency", description: "ms from stimulation onset to evoked peak", unit: "ms" },
      { name: "amplitude", description: "evoked response amplitude vs baseline", unit: "ratio" },
      { name: "spread", description: "fraction of active channels responding", unit: "0–1" },
      { name: "fatigue", description: "amplitude decay over repeated stimulation", unit: "0–1" },
    ],
    requiredInputs: [
      "stimulation protocol and timing",
      "pre- and post-stim windows",
      "per-channel response data",
    ],
    requiredControls: ["null-stimulation control", "sham electrode if available"],
    scoringFormula:
      "weighted combination of reliability, amplitude, and spread, penalized by fatigue.",
    failureModes: [
      "reporting single-pulse responses without repeatability",
      "using large stimulation to force a signal",
      "no time-locked null-stim control",
    ],
    exampleDatasets: ["ob-ds-0002"],
  },
  {
    id: "plasticity",
    name: "Plasticity",
    short: "do persistent neural changes follow structured stimulation",
    description:
      "Measures persistent neural change after structured stimulation or training, adjusted for sham and drift.",
    measures: [
      "plasticity index",
      "pre/post activity change",
      "connectivity change",
      "burst structure change",
      "duration of effect",
      "sham-adjusted effect size",
    ],
    excludes: ["closed-loop learning", "behavior on a task"],
    metrics: [
      { name: "plasticity index", description: "standardized pre/post change across channels", unit: "0–1" },
      { name: "connectivity Δ", description: "change in functional connectivity graph", unit: "Δ" },
      { name: "burst Δ", description: "change in network burst structure", unit: "Δ" },
      { name: "duration", description: "persistence of effect after induction", unit: "min" },
      { name: "sham-adjusted effect", description: "effect size minus sham group effect", unit: "Cohen's d" },
    ],
    requiredInputs: ["pre/post recording sessions", "induction protocol", "sham condition"],
    requiredControls: ["sham stimulation", "null stimulation", "repeated-run validation"],
    scoringFormula:
      "sham-adjusted effect size, weighted by duration and connectivity change.",
    failureModes: [
      "single pre/post comparison without sham",
      "drift interpreted as plasticity",
      "too-short observation window",
    ],
    exampleDatasets: ["ob-ds-0003"],
  },
  {
    id: "closed-loop-learning",
    name: "Closed-Loop Learning",
    short: "does the system improve on a task via closed-loop feedback",
    description:
      "Measures task improvement in a closed-loop system where organoid activity influences an environment or output.",
    measures: [
      "learning gain",
      "task success rate",
      "area under learning curve",
      "trials to threshold",
      "baseline-adjusted improvement",
      "random-feedback-adjusted improvement",
    ],
    excludes: ["general intelligence", "consciousness", "cross-task transfer"],
    metrics: [
      { name: "learning gain", description: "end-vs-start performance, baseline-adjusted", unit: "0–1" },
      { name: "success rate", description: "fraction of trials meeting task threshold", unit: "0–1" },
      { name: "AUC", description: "area under the learning curve vs random-feedback", unit: "0–1" },
      { name: "trials to threshold", description: "trials until the task threshold is reached", unit: "#" },
      { name: "sham-adjusted Δ", description: "improvement minus sham-feedback improvement", unit: "Δ" },
    ],
    requiredInputs: [
      "per-trial performance trace",
      "decoder and controller specification",
      "task environment specification",
      "feedback mapping",
    ],
    requiredControls: [
      "random feedback",
      "sham feedback",
      "frozen decoder",
      "decoder-only baseline",
      "null stimulation",
      "retention assay when available",
    ],
    scoringFormula:
      "baseline-adjusted AUC + sham-adjusted learning gain, penalized by missing controls.",
    failureModes: [
      "reward reshaping interpreted as learning",
      "no random-feedback baseline",
      "decoder adapts while organoid does not",
    ],
    exampleDatasets: ["ob-ds-0005", "ob-ds-0006"],
  },
  {
    id: "retention",
    name: "Retention",
    short: "do changes persist after rest or delay",
    description:
      "Measures whether adaptive changes persist after rest or delay, and how quickly relearning occurs.",
    measures: [
      "retention after short delay",
      "retention after long delay",
      "post-training recovery",
      "score decay",
      "relearning speed",
    ],
    excludes: ["novel-task generalization"],
    metrics: [
      { name: "short delay retention", description: "performance after ≤1h rest", unit: "0–1" },
      { name: "long delay retention", description: "performance after ≥24h rest", unit: "0–1" },
      { name: "decay rate", description: "score decay per hour since training", unit: "0–1" },
      { name: "relearning speed", description: "trials to recover original threshold", unit: "#" },
    ],
    requiredInputs: ["post-rest sessions", "matched pre-rest performance window"],
    requiredControls: ["sham-rest control", "frozen-decoder control"],
    scoringFormula: "weighted average of retention at multiple delays, normalized to pre-rest performance.",
    failureModes: [
      "retention confounded with recording drift",
      "reporting retention without delay specification",
    ],
    exampleDatasets: ["ob-ds-0007"],
  },
  {
    id: "reproducibility",
    name: "Reproducibility",
    short: "does the result generalize across organoids, batches, and labs",
    description:
      "Measures confidence that the result generalizes across organoids, batches, cell lines, labs, and runs.",
    measures: [
      "N organoids",
      "N runs",
      "N batches",
      "N labs",
      "confidence interval width",
      "replication status",
      "protocol completeness",
      "data completeness",
    ],
    excludes: ["single-metric performance"],
    metrics: [
      { name: "N organoids", description: "distinct organoids evaluated", unit: "#" },
      { name: "N runs", description: "independent run repetitions", unit: "#" },
      { name: "N batches", description: "independent culture batches", unit: "#" },
      { name: "N labs", description: "independent labs replicating", unit: "#" },
      { name: "CI width", description: "bootstrap confidence interval on main metric", unit: "Δ" },
    ],
    requiredInputs: ["per-organoid and per-run data", "batch IDs", "protocol version"],
    requiredControls: ["repeated-run validation", "batch replication", "independent-lab replication when possible"],
    scoringFormula:
      "composite of N-organoids, N-batches, N-labs, CI-width, and protocol completeness. Determines Confidence Grade (A–D).",
    failureModes: [
      "large N replicates of the same batch",
      "results pooled across unrelated protocols",
    ],
    exampleDatasets: ["ob-ds-0001", "ob-ds-0003", "ob-ds-0005"],
  },
];

export type System = {
  id: string;
  name: string;
  labId: string;
  organoidType: string;
  species: "human" | "mouse" | "rat" | "non-human-primate";
  ageDays: number;
  recordingPlatform: string;
  stimulation: string;
  decoder: string;
  taskId: string;
  track: Track;
  metrics: {
    signal: number;
    response: number;
    plasticity: number;
    learning: number;
    retention: number;
    reproducibility: number;
    composite: number;
  };
  nOrganoids: number;
  nSessions: number;
  nBatches: number;
  nLabs: number;
  controls: Controls;
  grade: Grade;
  availability: {
    raw: boolean;
    processed: boolean;
    code: boolean;
    peerReviewed: boolean;
    openDataset: boolean;
  };
  lastUpdated: string;
  learningCurve: number[];
  paperId: string;
  datasetId: string;
  limitations: string[];
  culture: string;
  preprocessing: string;
};

export type Lab = {
  id: string;
  name: string;
  institution: string;
  location: string;
  systems: number;
  datasets: number;
  totalOrganoids: number;
  verified: boolean;
  website: string;
  tracks: Track[];
  description: string;
};

export const LABS: Lab[] = [
  {
    id: "kagan-lab",
    name: "Cortical Labs — Kagan Group",
    institution: "Cortical Labs",
    location: "Melbourne, AU",
    systems: 3,
    datasets: 2,
    totalOrganoids: 142,
    verified: true,
    website: "https://example.org/cortical",
    tracks: ["closed-loop-learning", "plasticity", "responsiveness"],
    description:
      "Closed-loop BMI platform work. Focus on stimulus-response association and pong-style control.",
  },
  {
    id: "muotri",
    name: "Muotri Lab",
    institution: "UC San Diego",
    location: "San Diego, US",
    systems: 2,
    datasets: 2,
    totalOrganoids: 96,
    verified: true,
    website: "https://example.org/muotri",
    tracks: ["signal-quality", "plasticity", "reproducibility"],
    description:
      "Cortical organoid maturation and long-duration HD-MEA recordings.",
  },
  {
    id: "lancaster",
    name: "Lancaster Lab",
    institution: "MRC LMB",
    location: "Cambridge, UK",
    systems: 2,
    datasets: 1,
    totalOrganoids: 61,
    verified: true,
    website: "https://example.org/lancaster",
    tracks: ["signal-quality", "responsiveness"],
    description: "Cerebral organoid protocol development and characterization.",
  },
  {
    id: "finkbeiner",
    name: "Finkbeiner Lab",
    institution: "Gladstone Institutes",
    location: "San Francisco, US",
    systems: 1,
    datasets: 1,
    totalOrganoids: 34,
    verified: true,
    website: "https://example.org/finkbeiner",
    tracks: ["signal-quality", "reproducibility"],
    description: "High-throughput imaging and electrophysiology of patient-derived organoids.",
  },
  {
    id: "knoblich",
    name: "Knoblich Lab",
    institution: "IMBA Vienna",
    location: "Vienna, AT",
    systems: 1,
    datasets: 1,
    totalOrganoids: 40,
    verified: true,
    website: "https://example.org/knoblich",
    tracks: ["signal-quality", "responsiveness"],
    description: "Regionalized brain organoid models.",
  },
  {
    id: "final-spark",
    name: "FinalSpark",
    institution: "FinalSpark",
    location: "Vevey, CH",
    systems: 2,
    datasets: 1,
    totalOrganoids: 52,
    verified: true,
    website: "https://example.org/finalspark",
    tracks: ["closed-loop-learning", "responsiveness", "retention"],
    description:
      "Wetware-compute platform with long-lived cultures and programmable stimulation.",
  },
  {
    id: "brainxell",
    name: "BrainXell Consortium",
    institution: "multi-site",
    location: "multi-site",
    systems: 2,
    datasets: 1,
    totalOrganoids: 78,
    verified: true,
    website: "https://example.org/brainxell",
    tracks: ["reproducibility", "plasticity"],
    description:
      "Cross-lab replication consortium for standardized plasticity assays.",
  },
  {
    id: "independent-001",
    name: "Independent Replication — OB-IR-001",
    institution: "community",
    location: "distributed",
    systems: 1,
    datasets: 0,
    totalOrganoids: 18,
    verified: false,
    website: "https://example.org/ob-ir-001",
    tracks: ["reproducibility", "closed-loop-learning"],
    description:
      "Community-run replication of a closed-loop learning result using open protocols and open hardware.",
  },
];

export type Dataset = {
  id: string;
  name: string;
  labId: string;
  modality: "electrophysiology" | "calcium-imaging" | "multimodal" | "closed-loop" | "morphology" | "transcriptomics";
  platform: string;
  organoidType: string;
  species: "human" | "mouse" | "rat";
  nOrganoids: number;
  nSessions: number;
  sizeGb: number;
  license: "CC0" | "CC-BY-4.0" | "CC-BY-NC-4.0" | "request-access" | "private";
  access: "public" | "request-access" | "private";
  tasks: string[];
  tracks: Track[];
  supports: Track[];
  rawAvailable: boolean;
  processedAvailable: boolean;
  codeAvailable: boolean;
  year: number;
};

export const DATASETS: Dataset[] = [
  {
    id: "ob-ds-0001",
    name: "Cortical HD-MEA Long-Duration Baseline",
    labId: "muotri",
    modality: "electrophysiology",
    platform: "MaxWell MaxOne HD-MEA",
    organoidType: "cortical",
    species: "human",
    nOrganoids: 48,
    nSessions: 612,
    sizeGb: 820,
    license: "CC-BY-4.0",
    access: "public",
    tasks: ["spontaneous-activity", "morphology-qc"],
    tracks: ["signal-quality", "reproducibility"],
    supports: ["signal-quality", "reproducibility"],
    rawAvailable: true,
    processedAvailable: true,
    codeAvailable: true,
    year: 2024,
  },
  {
    id: "ob-ds-0002",
    name: "Evoked Response Assay — Knoblich 2023",
    labId: "knoblich",
    modality: "electrophysiology",
    platform: "Multichannel Systems MEA2100",
    organoidType: "regionalized forebrain",
    species: "human",
    nOrganoids: 28,
    nSessions: 142,
    sizeGb: 96,
    license: "CC-BY-4.0",
    access: "public",
    tasks: ["evoked-response"],
    tracks: ["responsiveness"],
    supports: ["responsiveness", "signal-quality"],
    rawAvailable: true,
    processedAvailable: true,
    codeAvailable: false,
    year: 2023,
  },
  {
    id: "ob-ds-0003",
    name: "Plasticity Induction — Cross-Lab",
    labId: "brainxell",
    modality: "electrophysiology",
    platform: "3Brain BioCAM X",
    organoidType: "cortical",
    species: "human",
    nOrganoids: 78,
    nSessions: 234,
    sizeGb: 410,
    license: "CC-BY-4.0",
    access: "public",
    tasks: ["plasticity-induction"],
    tracks: ["plasticity", "reproducibility"],
    supports: ["plasticity", "reproducibility"],
    rawAvailable: true,
    processedAvailable: true,
    codeAvailable: true,
    year: 2025,
  },
  {
    id: "ob-ds-0004",
    name: "Cerebral Organoid Characterization",
    labId: "lancaster",
    modality: "multimodal",
    platform: "calcium imaging + MEA",
    organoidType: "cerebral",
    species: "human",
    nOrganoids: 34,
    nSessions: 84,
    sizeGb: 1200,
    license: "CC-BY-NC-4.0",
    access: "public",
    tasks: ["spontaneous-activity", "morphology-qc"],
    tracks: ["signal-quality"],
    supports: ["signal-quality"],
    rawAvailable: false,
    processedAvailable: true,
    codeAvailable: true,
    year: 2024,
  },
  {
    id: "ob-ds-0005",
    name: "DishBrain Pong — Closed-Loop",
    labId: "kagan-lab",
    modality: "closed-loop",
    platform: "MaxWell MaxOne + custom controller",
    organoidType: "cortical",
    species: "human",
    nOrganoids: 38,
    nSessions: 176,
    sizeGb: 180,
    license: "CC-BY-4.0",
    access: "public",
    tasks: ["pong-style", "stimulus-response"],
    tracks: ["closed-loop-learning", "responsiveness"],
    supports: ["closed-loop-learning", "responsiveness"],
    rawAvailable: true,
    processedAvailable: true,
    codeAvailable: true,
    year: 2024,
  },
  {
    id: "ob-ds-0006",
    name: "FinalSpark Target-State Control",
    labId: "final-spark",
    modality: "closed-loop",
    platform: "Neurocore Mk2",
    organoidType: "cortical",
    species: "human",
    nOrganoids: 24,
    nSessions: 110,
    sizeGb: 60,
    license: "request-access",
    access: "request-access",
    tasks: ["target-state", "stimulus-response"],
    tracks: ["closed-loop-learning"],
    supports: ["closed-loop-learning"],
    rawAvailable: false,
    processedAvailable: true,
    codeAvailable: false,
    year: 2025,
  },
  {
    id: "ob-ds-0007",
    name: "Retention After 24h Delay",
    labId: "kagan-lab",
    modality: "closed-loop",
    platform: "MaxWell MaxOne",
    organoidType: "cortical",
    species: "human",
    nOrganoids: 22,
    nSessions: 88,
    sizeGb: 54,
    license: "CC-BY-4.0",
    access: "public",
    tasks: ["retention"],
    tracks: ["retention", "closed-loop-learning"],
    supports: ["retention"],
    rawAvailable: true,
    processedAvailable: true,
    codeAvailable: true,
    year: 2025,
  },
  {
    id: "ob-ds-0008",
    name: "Imaging Morphology QC",
    labId: "finkbeiner",
    modality: "morphology",
    platform: "automated lightsheet",
    organoidType: "cortical",
    species: "human",
    nOrganoids: 120,
    nSessions: 120,
    sizeGb: 2200,
    license: "CC-BY-4.0",
    access: "public",
    tasks: ["morphology-qc"],
    tracks: ["signal-quality"],
    supports: ["signal-quality"],
    rawAvailable: false,
    processedAvailable: true,
    codeAvailable: true,
    year: 2024,
  },
];

export type TaskDef = {
  id: string;
  name: string;
  objective: string;
  inputProtocol: string;
  output: string;
  metrics: string[];
  requiredControls: string[];
  confounds: string[];
  variants: string[];
  track: Track;
};

export const TASKS: TaskDef[] = [
  {
    id: "spontaneous-activity",
    name: "Spontaneous Activity Characterization",
    objective: "Characterize resting-state network activity.",
    inputProtocol: "No stimulation. Record ≥20 min of resting activity per session.",
    output: "Per-channel spike trains and network bursts.",
    metrics: ["mean firing rate", "burst rate", "snr", "stability"],
    requiredControls: ["artifact rejection", "empty-well reference"],
    confounds: ["media exchange", "temperature drift"],
    variants: ["short (≥5 min)", "standard (≥20 min)", "long (≥60 min)"],
    track: "signal-quality",
  },
  {
    id: "evoked-response",
    name: "Evoked Response Assay",
    objective: "Measure structured evoked responses to defined stimulation.",
    inputProtocol:
      "Biphasic current pulses (≥50 trials) at fixed amplitude, randomized electrode.",
    output: "Per-trial evoked response vectors.",
    metrics: ["reliability", "latency", "amplitude", "spread", "fatigue"],
    requiredControls: ["null-stimulation", "sham electrode"],
    confounds: ["electrical crosstalk", "baseline drift"],
    variants: ["single-site", "multi-site", "parameterized amplitude sweep"],
    track: "responsiveness",
  },
  {
    id: "plasticity-induction",
    name: "Plasticity Induction Assay",
    objective: "Induce and measure persistent neural change.",
    inputProtocol:
      "Pre-window baseline, induction protocol (theta-burst or paired stim), post-window.",
    output: "Pre/post firing, connectivity, and burst statistics.",
    metrics: ["plasticity index", "connectivity Δ", "duration"],
    requiredControls: ["sham stimulation", "null stimulation", "repeated-run"],
    confounds: ["recording drift", "order effects"],
    variants: ["theta-burst", "paired-stim", "high-frequency"],
    track: "plasticity",
  },
  {
    id: "pong-style",
    name: "Pong-style Closed-Loop Control",
    objective:
      "Closed-loop control task where stimulation encodes environment state and activity influences output.",
    inputProtocol: "Continuous closed-loop sessions with defined feedback mapping.",
    output: "Per-trial success, hit rate, and rally length.",
    metrics: ["learning gain", "success rate", "AUC", "trials to threshold"],
    requiredControls: ["random feedback", "sham feedback", "frozen decoder"],
    confounds: ["decoder adaptation", "reward reshaping"],
    variants: ["standard", "varying paddle speed", "distractor"],
    track: "closed-loop-learning",
  },
  {
    id: "target-state",
    name: "Target-State Control",
    objective: "Drive network activity toward a target state via closed-loop feedback.",
    inputProtocol: "Define target population vector. Stimulate to minimize distance.",
    output: "Distance-to-target over time.",
    metrics: ["target-distance decay", "sham-adjusted improvement"],
    requiredControls: ["random feedback", "frozen decoder", "null stimulation"],
    confounds: ["over-specified target achievable without learning"],
    variants: ["static target", "moving target"],
    track: "closed-loop-learning",
  },
  {
    id: "stimulus-response",
    name: "Stimulus–Response Association",
    objective: "Learn to associate a stimulus pattern with a contingent outcome.",
    inputProtocol: "Paired stimulation with outcome-contingent feedback.",
    output: "Discrimination performance across sessions.",
    metrics: ["discrimination d′", "learning gain"],
    requiredControls: ["sham feedback", "random feedback"],
    confounds: ["generalization across stimuli", "response bias"],
    variants: ["2-alternative", "3-alternative"],
    track: "closed-loop-learning",
  },
  {
    id: "cart-pole",
    name: "Cart-Pole Control",
    objective: "Balance a simulated pole via closed-loop stimulation feedback.",
    inputProtocol: "Pole angle encoded as stimulation pattern. Spike-derived signal → cart force.",
    output: "Pole balance duration.",
    metrics: ["balance duration", "learning gain", "success rate"],
    requiredControls: ["random feedback", "frozen decoder", "decoder-only baseline"],
    confounds: ["decoder-only solves the task"],
    variants: ["standard", "perturbation"],
    track: "closed-loop-learning",
  },
  {
    id: "retention",
    name: "Retention Assay",
    objective: "Test whether post-training performance persists after delay.",
    inputProtocol: "Train to threshold, rest for delay D, test without further training.",
    output: "Post-rest performance curve.",
    metrics: ["retention@1h", "retention@24h", "relearning speed"],
    requiredControls: ["frozen decoder during test", "sham-rest control"],
    confounds: ["decoder drift during rest"],
    variants: ["1h", "6h", "24h"],
    track: "retention",
  },
  {
    id: "morphology-qc",
    name: "Morphology QC",
    objective: "Quality-score organoid morphology as a prerequisite for functional benchmarks.",
    inputProtocol: "Automated imaging with standardized protocol.",
    output: "Morphology quality score and rosettes count.",
    metrics: ["morphology score", "rosette density"],
    requiredControls: ["blinded scoring", "inter-rater reliability"],
    confounds: ["staining variability"],
    variants: ["brightfield", "lightsheet"],
    track: "signal-quality",
  },
];

function mkCurve(start: number, end: number, n = 20, noise = 0.05): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const base = start + (end - start) * (1 - Math.pow(1 - t, 1.8));
    const jitter = (Math.sin(i * 1.7) * 0.5 + Math.cos(i * 2.3) * 0.5) * noise;
    out.push(Math.max(0, Math.min(1, base + jitter)));
  }
  return out;
}

export const SYSTEMS: System[] = [
  {
    id: "ob-sys-0001",
    name: "DishBrain v2.1 — Pong",
    labId: "kagan-lab",
    organoidType: "cortical",
    species: "human",
    ageDays: 92,
    recordingPlatform: "MaxWell MaxOne HD-MEA",
    stimulation: "biphasic current, sparse 8-electrode cluster",
    decoder: "linear readout, frozen during evaluation",
    taskId: "pong-style",
    track: "closed-loop-learning",
    metrics: {
      signal: 0.82,
      response: 0.74,
      plasticity: 0.61,
      learning: 0.68,
      retention: 0.41,
      reproducibility: 0.73,
      composite: 0.67,
    },
    nOrganoids: 38,
    nSessions: 176,
    nBatches: 6,
    nLabs: 2,
    controls: {
      random_feedback: "pass",
      sham_stimulation: "pass",
      null_stimulation: "pass",
      frozen_decoder: "pass",
      decoder_only: "pass",
      repeated_runs: "pass",
      batch_replication: "pass",
      independent_replication: "partial",
    },
    grade: "A",
    availability: { raw: true, processed: true, code: true, peerReviewed: true, openDataset: true },
    lastUpdated: "2026-03-18",
    learningCurve: mkCurve(0.25, 0.68),
    paperId: "ob-p-0001",
    datasetId: "ob-ds-0005",
    limitations: [
      "retention beyond 1h not measured in this entry",
      "independent replication only partial",
    ],
    culture: "Lancaster-style cortical organoids, day 90 at recording start.",
    preprocessing: "bandpass 300–6000hz, common-average reference, threshold-based spike detection at 5σ.",
  },
  {
    id: "ob-sys-0002",
    name: "FinalSpark Neurocore — Target-State",
    labId: "final-spark",
    organoidType: "cortical",
    species: "human",
    ageDays: 210,
    recordingPlatform: "Neurocore Mk2",
    stimulation: "parameterized pulse trains",
    decoder: "kalman filter on population rate",
    taskId: "target-state",
    track: "closed-loop-learning",
    metrics: {
      signal: 0.71,
      response: 0.66,
      plasticity: 0.52,
      learning: 0.59,
      retention: 0.44,
      reproducibility: 0.58,
      composite: 0.58,
    },
    nOrganoids: 24,
    nSessions: 110,
    nBatches: 4,
    nLabs: 1,
    controls: {
      random_feedback: "pass",
      sham_stimulation: "pass",
      null_stimulation: "partial",
      frozen_decoder: "pass",
      decoder_only: "pass",
      repeated_runs: "pass",
      batch_replication: "pass",
      independent_replication: "missing",
    },
    grade: "B",
    availability: { raw: false, processed: true, code: false, peerReviewed: false, openDataset: false },
    lastUpdated: "2026-02-22",
    learningCurve: mkCurve(0.32, 0.59),
    paperId: "ob-p-0002",
    datasetId: "ob-ds-0006",
    limitations: [
      "raw data not publicly available",
      "no independent-lab replication",
    ],
    culture: "long-lived cortical organoids maintained >200 days.",
    preprocessing: "proprietary preprocessing pipeline, release version reported.",
  },
  {
    id: "ob-sys-0003",
    name: "Muotri HD-MEA Baseline",
    labId: "muotri",
    organoidType: "cortical",
    species: "human",
    ageDays: 184,
    recordingPlatform: "MaxWell MaxOne HD-MEA",
    stimulation: "none (spontaneous)",
    decoder: "—",
    taskId: "spontaneous-activity",
    track: "signal-quality",
    metrics: {
      signal: 0.91,
      response: 0.0,
      plasticity: 0.0,
      learning: 0.0,
      retention: 0.0,
      reproducibility: 0.86,
      composite: 0.89,
    },
    nOrganoids: 48,
    nSessions: 612,
    nBatches: 9,
    nLabs: 1,
    controls: {
      random_feedback: "missing",
      sham_stimulation: "missing",
      null_stimulation: "pass",
      frozen_decoder: "missing",
      decoder_only: "missing",
      repeated_runs: "pass",
      batch_replication: "pass",
      independent_replication: "missing",
    },
    grade: "A",
    availability: { raw: true, processed: true, code: true, peerReviewed: true, openDataset: true },
    lastUpdated: "2026-03-02",
    learningCurve: mkCurve(0.88, 0.91, 20, 0.02),
    paperId: "ob-p-0003",
    datasetId: "ob-ds-0001",
    limitations: ["spontaneous-only; does not test responsiveness or plasticity"],
    culture: "Muotri-style cortical organoids, long-term maturation.",
    preprocessing: "standard open preprocessing pipeline v0.4.",
  },
  {
    id: "ob-sys-0004",
    name: "BrainXell Plasticity Assay",
    labId: "brainxell",
    organoidType: "cortical",
    species: "human",
    ageDays: 140,
    recordingPlatform: "3Brain BioCAM X",
    stimulation: "theta-burst induction",
    decoder: "—",
    taskId: "plasticity-induction",
    track: "plasticity",
    metrics: {
      signal: 0.76,
      response: 0.68,
      plasticity: 0.72,
      learning: 0.0,
      retention: 0.48,
      reproducibility: 0.81,
      composite: 0.69,
    },
    nOrganoids: 78,
    nSessions: 234,
    nBatches: 8,
    nLabs: 3,
    controls: {
      random_feedback: "missing",
      sham_stimulation: "pass",
      null_stimulation: "pass",
      frozen_decoder: "missing",
      decoder_only: "missing",
      repeated_runs: "pass",
      batch_replication: "pass",
      independent_replication: "pass",
    },
    grade: "A",
    availability: { raw: true, processed: true, code: true, peerReviewed: true, openDataset: true },
    lastUpdated: "2026-01-28",
    learningCurve: mkCurve(0.3, 0.72),
    paperId: "ob-p-0004",
    datasetId: "ob-ds-0003",
    limitations: ["retention beyond 2h not measured"],
    culture: "cross-lab standardized protocol, H1 and H9 cell lines.",
    preprocessing: "shared cross-lab preprocessing container.",
  },
  {
    id: "ob-sys-0005",
    name: "Knoblich Evoked Response",
    labId: "knoblich",
    organoidType: "regionalized forebrain",
    species: "human",
    ageDays: 120,
    recordingPlatform: "MEA2100",
    stimulation: "biphasic current, single-site",
    decoder: "—",
    taskId: "evoked-response",
    track: "responsiveness",
    metrics: {
      signal: 0.78,
      response: 0.83,
      plasticity: 0.0,
      learning: 0.0,
      retention: 0.0,
      reproducibility: 0.66,
      composite: 0.76,
    },
    nOrganoids: 28,
    nSessions: 142,
    nBatches: 5,
    nLabs: 1,
    controls: {
      random_feedback: "missing",
      sham_stimulation: "pass",
      null_stimulation: "pass",
      frozen_decoder: "missing",
      decoder_only: "missing",
      repeated_runs: "pass",
      batch_replication: "pass",
      independent_replication: "missing",
    },
    grade: "B",
    availability: { raw: true, processed: true, code: false, peerReviewed: true, openDataset: true },
    lastUpdated: "2025-12-14",
    learningCurve: mkCurve(0.79, 0.83, 20, 0.03),
    paperId: "ob-p-0005",
    datasetId: "ob-ds-0002",
    limitations: ["code not released", "single-lab only"],
    culture: "regionalized forebrain protocol; dorsal/ventral identity validated.",
    preprocessing: "custom scripts (not released).",
  },
  {
    id: "ob-sys-0006",
    name: "FinalSpark Retention@24h",
    labId: "final-spark",
    organoidType: "cortical",
    species: "human",
    ageDays: 245,
    recordingPlatform: "Neurocore Mk2",
    stimulation: "parameterized pulse trains",
    decoder: "frozen at test",
    taskId: "retention",
    track: "retention",
    metrics: {
      signal: 0.7,
      response: 0.62,
      plasticity: 0.44,
      learning: 0.5,
      retention: 0.52,
      reproducibility: 0.55,
      composite: 0.56,
    },
    nOrganoids: 22,
    nSessions: 88,
    nBatches: 3,
    nLabs: 1,
    controls: {
      random_feedback: "partial",
      sham_stimulation: "pass",
      null_stimulation: "pass",
      frozen_decoder: "pass",
      decoder_only: "pass",
      repeated_runs: "pass",
      batch_replication: "partial",
      independent_replication: "missing",
    },
    grade: "B",
    availability: { raw: true, processed: true, code: true, peerReviewed: false, openDataset: true },
    lastUpdated: "2026-02-05",
    learningCurve: mkCurve(0.3, 0.5),
    paperId: "ob-p-0006",
    datasetId: "ob-ds-0007",
    limitations: ["no independent replication", "batch replication partial"],
    culture: "same line as sys-0002 at greater age.",
    preprocessing: "Neurocore pipeline v2.1.",
  },
  {
    id: "ob-sys-0007",
    name: "Lancaster Cerebral Baseline",
    labId: "lancaster",
    organoidType: "cerebral",
    species: "human",
    ageDays: 90,
    recordingPlatform: "calcium imaging + MEA",
    stimulation: "none (spontaneous)",
    decoder: "—",
    taskId: "spontaneous-activity",
    track: "signal-quality",
    metrics: {
      signal: 0.74,
      response: 0.0,
      plasticity: 0.0,
      learning: 0.0,
      retention: 0.0,
      reproducibility: 0.62,
      composite: 0.72,
    },
    nOrganoids: 34,
    nSessions: 84,
    nBatches: 4,
    nLabs: 1,
    controls: {
      random_feedback: "missing",
      sham_stimulation: "missing",
      null_stimulation: "pass",
      frozen_decoder: "missing",
      decoder_only: "missing",
      repeated_runs: "pass",
      batch_replication: "pass",
      independent_replication: "missing",
    },
    grade: "B",
    availability: { raw: false, processed: true, code: true, peerReviewed: true, openDataset: true },
    lastUpdated: "2025-11-10",
    learningCurve: mkCurve(0.7, 0.75, 20, 0.03),
    paperId: "ob-p-0007",
    datasetId: "ob-ds-0004",
    limitations: ["raw electrophysiology not released"],
    culture: "cerebral organoids.",
    preprocessing: "open pipeline v0.3.",
  },
  {
    id: "ob-sys-0008",
    name: "DishBrain Cart-Pole (preview)",
    labId: "kagan-lab",
    organoidType: "cortical",
    species: "human",
    ageDays: 110,
    recordingPlatform: "MaxWell MaxOne HD-MEA",
    stimulation: "biphasic, sparse cluster",
    decoder: "linear readout",
    taskId: "cart-pole",
    track: "closed-loop-learning",
    metrics: {
      signal: 0.79,
      response: 0.7,
      plasticity: 0.5,
      learning: 0.55,
      retention: 0.3,
      reproducibility: 0.48,
      composite: 0.55,
    },
    nOrganoids: 14,
    nSessions: 62,
    nBatches: 3,
    nLabs: 1,
    controls: {
      random_feedback: "pass",
      sham_stimulation: "partial",
      null_stimulation: "pass",
      frozen_decoder: "pass",
      decoder_only: "pass",
      repeated_runs: "pass",
      batch_replication: "partial",
      independent_replication: "missing",
    },
    grade: "C",
    availability: { raw: true, processed: true, code: true, peerReviewed: false, openDataset: false },
    lastUpdated: "2026-03-30",
    learningCurve: mkCurve(0.2, 0.55),
    paperId: "ob-p-0008",
    datasetId: "ob-ds-0005",
    limitations: ["preview entry; preprint only, batch replication partial"],
    culture: "cortical organoids at day ~110.",
    preprocessing: "shared DishBrain preprocessing container.",
  },
  {
    id: "ob-sys-0009",
    name: "Finkbeiner Imaging Morphology QC",
    labId: "finkbeiner",
    organoidType: "cortical",
    species: "human",
    ageDays: 60,
    recordingPlatform: "automated lightsheet",
    stimulation: "—",
    decoder: "—",
    taskId: "morphology-qc",
    track: "signal-quality",
    metrics: {
      signal: 0.83,
      response: 0.0,
      plasticity: 0.0,
      learning: 0.0,
      retention: 0.0,
      reproducibility: 0.78,
      composite: 0.81,
    },
    nOrganoids: 120,
    nSessions: 120,
    nBatches: 6,
    nLabs: 1,
    controls: {
      random_feedback: "missing",
      sham_stimulation: "missing",
      null_stimulation: "missing",
      frozen_decoder: "missing",
      decoder_only: "missing",
      repeated_runs: "pass",
      batch_replication: "pass",
      independent_replication: "missing",
    },
    grade: "B",
    availability: { raw: false, processed: true, code: true, peerReviewed: true, openDataset: true },
    lastUpdated: "2025-10-21",
    learningCurve: mkCurve(0.8, 0.84, 20, 0.02),
    paperId: "ob-p-0009",
    datasetId: "ob-ds-0008",
    limitations: ["morphology QC only; non-functional"],
    culture: "patient-derived cortical organoids.",
    preprocessing: "Finkbeiner imaging pipeline.",
  },
  {
    id: "ob-sys-0010",
    name: "OB-IR-001 Independent Replication",
    labId: "independent-001",
    organoidType: "cortical",
    species: "human",
    ageDays: 95,
    recordingPlatform: "open-hardware MEA",
    stimulation: "biphasic, sparse cluster",
    decoder: "linear readout, frozen",
    taskId: "pong-style",
    track: "closed-loop-learning",
    metrics: {
      signal: 0.66,
      response: 0.6,
      plasticity: 0.4,
      learning: 0.42,
      retention: 0.28,
      reproducibility: 0.62,
      composite: 0.5,
    },
    nOrganoids: 18,
    nSessions: 44,
    nBatches: 3,
    nLabs: 1,
    controls: {
      random_feedback: "pass",
      sham_stimulation: "pass",
      null_stimulation: "pass",
      frozen_decoder: "pass",
      decoder_only: "pass",
      repeated_runs: "pass",
      batch_replication: "partial",
      independent_replication: "pass",
    },
    grade: "B",
    availability: { raw: true, processed: true, code: true, peerReviewed: false, openDataset: true },
    lastUpdated: "2026-04-05",
    learningCurve: mkCurve(0.24, 0.42),
    paperId: "ob-p-0010",
    datasetId: "ob-ds-0005",
    limitations: ["smaller N than original", "not yet peer reviewed"],
    culture: "open-protocol cortical organoids.",
    preprocessing: "open-source pipeline v0.2.",
  },
  {
    id: "ob-sys-0011",
    name: "Muotri Long-Term Plasticity",
    labId: "muotri",
    organoidType: "cortical",
    species: "human",
    ageDays: 240,
    recordingPlatform: "MaxWell MaxOne HD-MEA",
    stimulation: "paired-pulse induction",
    decoder: "—",
    taskId: "plasticity-induction",
    track: "plasticity",
    metrics: {
      signal: 0.85,
      response: 0.72,
      plasticity: 0.64,
      learning: 0.0,
      retention: 0.42,
      reproducibility: 0.71,
      composite: 0.67,
    },
    nOrganoids: 48,
    nSessions: 190,
    nBatches: 7,
    nLabs: 1,
    controls: {
      random_feedback: "missing",
      sham_stimulation: "pass",
      null_stimulation: "pass",
      frozen_decoder: "missing",
      decoder_only: "missing",
      repeated_runs: "pass",
      batch_replication: "pass",
      independent_replication: "partial",
    },
    grade: "A",
    availability: { raw: true, processed: true, code: true, peerReviewed: true, openDataset: true },
    lastUpdated: "2026-02-14",
    learningCurve: mkCurve(0.3, 0.64),
    paperId: "ob-p-0011",
    datasetId: "ob-ds-0001",
    limitations: ["independent replication partial"],
    culture: "long-term cortical organoids, day 240.",
    preprocessing: "open pipeline v0.4.",
  },
  {
    id: "ob-sys-0012",
    name: "Kagan Stimulus-Response",
    labId: "kagan-lab",
    organoidType: "cortical",
    species: "human",
    ageDays: 98,
    recordingPlatform: "MaxWell MaxOne HD-MEA",
    stimulation: "biphasic current",
    decoder: "linear readout",
    taskId: "stimulus-response",
    track: "closed-loop-learning",
    metrics: {
      signal: 0.81,
      response: 0.76,
      plasticity: 0.58,
      learning: 0.63,
      retention: 0.36,
      reproducibility: 0.64,
      composite: 0.63,
    },
    nOrganoids: 26,
    nSessions: 108,
    nBatches: 4,
    nLabs: 1,
    controls: {
      random_feedback: "pass",
      sham_stimulation: "pass",
      null_stimulation: "pass",
      frozen_decoder: "pass",
      decoder_only: "pass",
      repeated_runs: "pass",
      batch_replication: "pass",
      independent_replication: "missing",
    },
    grade: "B",
    availability: { raw: true, processed: true, code: true, peerReviewed: true, openDataset: true },
    lastUpdated: "2025-12-01",
    learningCurve: mkCurve(0.3, 0.63),
    paperId: "ob-p-0012",
    datasetId: "ob-ds-0005",
    limitations: ["single-lab"],
    culture: "standard cortical protocol.",
    preprocessing: "shared DishBrain preprocessing.",
  },
];

export type Paper = {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  peerReviewed: boolean;
  doi?: string;
  summary: string;
  tracks: Track[];
  hasDataset: boolean;
  hasCode: boolean;
  limitations: string[];
  labId: string;
  linkedSystems: string[];
  linkedDatasets: string[];
};

export const PAPERS: Paper[] = [
  {
    id: "ob-p-0001",
    title: "In vitro neurons learn and exhibit sentience-adjacent feedback sensitivity in a closed-loop task",
    authors: ["Kagan, B.", "et al."],
    year: 2022,
    venue: "Neuron",
    peerReviewed: true,
    doi: "10.1016/example.0001",
    summary:
      "Demonstrated closed-loop feedback learning in cortical cultures. OrganoidBench scores this work under the closed-loop learning track, with strong feedback controls and partial independent replication.",
    tracks: ["closed-loop-learning", "responsiveness"],
    hasDataset: true,
    hasCode: true,
    limitations: [
      "retention beyond 1h not characterized",
      "learning gain partly confounded by decoder tuning when not frozen",
    ],
    labId: "kagan-lab",
    linkedSystems: ["ob-sys-0001", "ob-sys-0008", "ob-sys-0012"],
    linkedDatasets: ["ob-ds-0005"],
  },
  {
    id: "ob-p-0002",
    title: "Long-lived cortical cultures for target-state closed-loop control",
    authors: ["FinalSpark Team"],
    year: 2025,
    venue: "preprint",
    peerReviewed: false,
    summary:
      "Preprint describing target-state control in long-lived cortical organoids on the Neurocore platform.",
    tracks: ["closed-loop-learning"],
    hasDataset: false,
    hasCode: false,
    limitations: ["raw data not publicly available", "no independent replication"],
    labId: "final-spark",
    linkedSystems: ["ob-sys-0002", "ob-sys-0006"],
    linkedDatasets: ["ob-ds-0006"],
  },
  {
    id: "ob-p-0003",
    title: "Long-duration HD-MEA recordings from cortical organoids",
    authors: ["Muotri, A. R.", "et al."],
    year: 2024,
    venue: "Cell Reports",
    peerReviewed: true,
    summary:
      "Baseline electrophysiological characterization of long-lived cortical organoids across multiple cell lines.",
    tracks: ["signal-quality", "reproducibility"],
    hasDataset: true,
    hasCode: true,
    limitations: ["no evoked or closed-loop measurements"],
    labId: "muotri",
    linkedSystems: ["ob-sys-0003", "ob-sys-0011"],
    linkedDatasets: ["ob-ds-0001"],
  },
  {
    id: "ob-p-0004",
    title: "Cross-laboratory replication of theta-burst plasticity in cortical organoids",
    authors: ["BrainXell Consortium"],
    year: 2025,
    venue: "eLife",
    peerReviewed: true,
    summary:
      "Three-lab replication of theta-burst-induced plasticity in standardized cortical organoids.",
    tracks: ["plasticity", "reproducibility"],
    hasDataset: true,
    hasCode: true,
    limitations: ["retention beyond 2h not measured"],
    labId: "brainxell",
    linkedSystems: ["ob-sys-0004"],
    linkedDatasets: ["ob-ds-0003"],
  },
  {
    id: "ob-p-0005",
    title: "Evoked responses in regionalized forebrain organoids",
    authors: ["Knoblich, J. A.", "et al."],
    year: 2023,
    venue: "Nature Neuroscience",
    peerReviewed: true,
    summary:
      "Characterization of evoked responses in regionalized forebrain organoids under controlled stimulation.",
    tracks: ["responsiveness"],
    hasDataset: true,
    hasCode: false,
    limitations: ["analysis code not released"],
    labId: "knoblich",
    linkedSystems: ["ob-sys-0005"],
    linkedDatasets: ["ob-ds-0002"],
  },
  {
    id: "ob-p-0006",
    title: "Retention of closed-loop adaptation across 24h rest",
    authors: ["Kagan, B.", "FinalSpark Team"],
    year: 2026,
    venue: "preprint",
    peerReviewed: false,
    summary:
      "Tests whether closed-loop task improvements persist after a 24h rest delay. Partial batch replication.",
    tracks: ["retention", "closed-loop-learning"],
    hasDataset: true,
    hasCode: true,
    limitations: ["no independent replication yet"],
    labId: "final-spark",
    linkedSystems: ["ob-sys-0006"],
    linkedDatasets: ["ob-ds-0007"],
  },
  {
    id: "ob-p-0007",
    title: "Cerebral organoid characterization pipeline",
    authors: ["Lancaster, M.", "et al."],
    year: 2024,
    venue: "Nature Protocols",
    peerReviewed: true,
    summary:
      "Standardized characterization pipeline for cerebral organoids, with open processed data.",
    tracks: ["signal-quality"],
    hasDataset: true,
    hasCode: true,
    limitations: ["raw electrophysiology not released"],
    labId: "lancaster",
    linkedSystems: ["ob-sys-0007"],
    linkedDatasets: ["ob-ds-0004"],
  },
  {
    id: "ob-p-0008",
    title: "DishBrain cart-pole (preview)",
    authors: ["Kagan, B.", "et al."],
    year: 2026,
    venue: "preprint",
    peerReviewed: false,
    summary:
      "Preview of cart-pole closed-loop control using DishBrain. Treated as a provisional entry pending peer review.",
    tracks: ["closed-loop-learning"],
    hasDataset: false,
    hasCode: true,
    limitations: ["preprint only", "smaller N than prior DishBrain results"],
    labId: "kagan-lab",
    linkedSystems: ["ob-sys-0008"],
    linkedDatasets: [],
  },
  {
    id: "ob-p-0009",
    title: "Automated morphology scoring for cortical organoids",
    authors: ["Finkbeiner, S.", "et al."],
    year: 2024,
    venue: "Cell Systems",
    peerReviewed: true,
    summary:
      "Automated morphology QC pipeline used as a prerequisite for downstream functional benchmarks.",
    tracks: ["signal-quality"],
    hasDataset: true,
    hasCode: true,
    limitations: ["non-functional measurement; does not score activity"],
    labId: "finkbeiner",
    linkedSystems: ["ob-sys-0009"],
    linkedDatasets: ["ob-ds-0008"],
  },
  {
    id: "ob-p-0010",
    title: "Open-hardware replication of a closed-loop organoid learning result",
    authors: ["OB-IR-001 Community"],
    year: 2026,
    venue: "preprint",
    peerReviewed: false,
    summary:
      "Independent, community-run replication of a closed-loop learning entry using open protocols and hardware.",
    tracks: ["reproducibility", "closed-loop-learning"],
    hasDataset: true,
    hasCode: true,
    limitations: ["smaller N than original", "pre-peer-review"],
    labId: "independent-001",
    linkedSystems: ["ob-sys-0010"],
    linkedDatasets: ["ob-ds-0005"],
  },
  {
    id: "ob-p-0011",
    title: "Long-term plasticity in cortical organoids",
    authors: ["Muotri, A. R.", "et al."],
    year: 2025,
    venue: "Nature Communications",
    peerReviewed: true,
    summary:
      "Paired-pulse plasticity in long-term cortical organoids across multiple batches.",
    tracks: ["plasticity"],
    hasDataset: true,
    hasCode: true,
    limitations: ["independent replication partial"],
    labId: "muotri",
    linkedSystems: ["ob-sys-0011"],
    linkedDatasets: ["ob-ds-0001"],
  },
  {
    id: "ob-p-0012",
    title: "Stimulus-response association in cortical cultures",
    authors: ["Kagan, B.", "et al."],
    year: 2025,
    venue: "Journal of Neural Engineering",
    peerReviewed: true,
    summary:
      "Closed-loop stimulus-response learning with strong control conditions.",
    tracks: ["closed-loop-learning"],
    hasDataset: true,
    hasCode: true,
    limitations: ["single-lab"],
    labId: "kagan-lab",
    linkedSystems: ["ob-sys-0012"],
    linkedDatasets: ["ob-ds-0005"],
  },
];

export const RECENT_UPDATES: {
  kind: "score" | "dataset" | "methodology" | "submission";
  title: string;
  detail: string;
  date: string;
  href: string;
}[] = [
  {
    kind: "score",
    title: "ob-sys-0008 downgraded C → provisional",
    detail: "Cart-pole preview re-scored after re-analysis of sham condition.",
    date: "2026-04-18",
    href: "/systems/ob-sys-0008",
  },
  {
    kind: "dataset",
    title: "ob-ds-0007 added",
    detail: "Retention after 24h delay, 22 organoids, raw traces public.",
    date: "2026-04-11",
    href: "/datasets/ob-ds-0007",
  },
  {
    kind: "submission",
    title: "Independent replication ob-sys-0010 provisional",
    detail: "OB-IR-001 community replication passes automated validation.",
    date: "2026-04-05",
    href: "/systems/ob-sys-0010",
  },
  {
    kind: "methodology",
    title: "methodology v1.3.0 released",
    detail: "Adds decoder-only baseline requirement to closed-loop learning.",
    date: "2026-03-20",
    href: "/methodology#versioning",
  },
  {
    kind: "score",
    title: "ob-sys-0001 learning score updated 0.65 → 0.68",
    detail: "Recomputed under methodology v1.3.0 with decoder-only baseline.",
    date: "2026-03-18",
    href: "/systems/ob-sys-0001",
  },
];

export const STATUS_COUNTS = {
  systems: SYSTEMS.length,
  organoids: SYSTEMS.reduce((acc, s) => acc + s.nOrganoids, 0),
  datasets: DATASETS.length,
  labs: LABS.length,
  lastUpdated: "2026-04-18",
  methodologyVersion: "v1.3.0",
};

export function trackById(id: Track) {
  return TRACKS.find((t) => t.id === id)!;
}

export function systemById(id: string) {
  return SYSTEMS.find((s) => s.id === id);
}

export function labById(id: string) {
  return LABS.find((l) => l.id === id);
}

export function datasetById(id: string) {
  return DATASETS.find((d) => d.id === id);
}

export function taskById(id: string) {
  return TASKS.find((t) => t.id === id);
}

export function paperById(id: string) {
  return PAPERS.find((p) => p.id === id);
}

export function systemsForTrack(track: Track) {
  return SYSTEMS.filter((s) => s.track === track || (track === "reproducibility" && s.metrics.reproducibility > 0));
}

export function systemsForTask(taskId: string) {
  return SYSTEMS.filter((s) => s.taskId === taskId);
}

export function systemsForLab(labId: string) {
  return SYSTEMS.filter((s) => s.labId === labId);
}

export function datasetsForLab(labId: string) {
  return DATASETS.filter((d) => d.labId === labId);
}

export function papersForLab(labId: string) {
  return PAPERS.filter((p) => p.labId === labId);
}

export const searchIndex: {
  type: string;
  title: string;
  subtitle?: string;
  href: string;
}[] = [
  ...SYSTEMS.map((s) => ({
    type: "system",
    title: s.name,
    subtitle: `${labById(s.labId)?.name ?? ""} · ${s.taskId}`,
    href: `/systems/${s.id}`,
  })),
  ...DATASETS.map((d) => ({
    type: "dataset",
    title: d.name,
    subtitle: `${d.modality} · ${d.nOrganoids} organoids`,
    href: `/datasets/${d.id}`,
  })),
  ...LABS.map((l) => ({
    type: "lab",
    title: l.name,
    subtitle: l.institution,
    href: `/labs/${l.id}`,
  })),
  ...TRACKS.map((t) => ({
    type: "track",
    title: t.name,
    subtitle: t.short,
    href: `/benchmarks/${t.id}`,
  })),
  ...TASKS.map((t) => ({
    type: "task",
    title: t.name,
    subtitle: t.objective,
    href: `/tasks/${t.id}`,
  })),
  ...PAPERS.map((p) => ({
    type: "paper",
    title: p.title,
    subtitle: `${p.authors[0]} · ${p.year} · ${p.venue}`,
    href: `/papers/${p.id}`,
  })),
  { type: "docs", title: "API", subtitle: "OrganoidBench API reference", href: "/docs#api" },
  { type: "docs", title: "Submission Format", subtitle: "JSON schema for entries", href: "/docs#submission-format" },
  { type: "docs", title: "Methodology", subtitle: "How scoring works", href: "/methodology" },
];

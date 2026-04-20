# Scoring Methodology v0.1

This methodology is provisional and local-only until reviewed.

## Closed-loop learning

Initial source: Zenodo 17684862.

Native metric: cart-pole `top_decile` reward.

Formula:

```text
gain = mean(rl_top_decile - best_control_top_decile)
score = 100 * clamp(gain / mean(rl_top_decile), 0, 1)
```

Controls use the best available non-RL condition per experiment: `random` or `none`.

Sensitivity analysis kept this as the default because the direction is stable across median, random-only, no-stimulation-only, and organoid-first variants. The score magnitude changes by aggregation choice, so reported rows remain provisional.

## Signal quality

Initial source: Figshare 30394168.

Native metric: `percent_active_electrodes` from well-average MEA tables.

Formula:

```text
active_channel_ratio = mean(percent_active_electrodes) / 100
score = 100 * active_channel_ratio
```

This is a functional recording-quality score, not a biological quality score.

Sensitivity analysis includes well-level mean, well-level median, batch-first mean, and cell-line-first mean. The default remains well-level mean because it directly reflects the table rows used for the first provisional score, but batch and cell-line nesting should be reviewed before publication.

## Cross-track comparison

Scores should be compared within a track. Do not compare closed-loop learning and signal coverage as if they were the same quantity.

## Not scored in v0.1

- Composite rankings.
- Intelligence.
- Consciousness or sentience.
- Retention, unless explicit retention fields are identified.
- Raw KCL MEA files above the automatic download threshold.

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

## Signal quality

Initial source: Figshare 30394168.

Native metric: `percent_active_electrodes` from well-average MEA tables.

Formula:

```text
active_channel_ratio = mean(percent_active_electrodes) / 100
score = 100 * active_channel_ratio
```

This is a functional recording-quality score, not a biological quality score.

## Not scored in v0.1

- Composite rankings.
- Intelligence.
- Consciousness or sentience.
- Retention, unless explicit retention fields are identified.
- Raw KCL MEA files above the automatic download threshold.


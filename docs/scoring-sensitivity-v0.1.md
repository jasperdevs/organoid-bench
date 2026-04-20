# Scoring Sensitivity v0.1

## Robbins cart-pole

```json
{
  "current_best_control_mean": {
    "trained": 50.723361904761916,
    "control": 38.72979047619048,
    "delta": 11.993571428571427,
    "score": 23.645064085244453,
    "ci": [
      4.335012380952382,
      21.3247294047619
    ],
    "nExperiments": 25,
    "nOrganoids": 16,
    "nRuns": 426
  },
  "median_instead_of_mean": {
    "trained": 49.62400000000002,
    "control": 38.37000000000001,
    "delta": 11.253999999999998,
    "score": 22.678542640657735,
    "ci": [
      4.1942999999999975,
      20.250099999999996
    ],
    "nExperiments": 25
  },
  "organoid_first": {
    "trained": 48.65328201599821,
    "control": 36.281421957671974,
    "delta": 12.371860058326254,
    "score": 25.428623816699826,
    "ci": [
      3.9849358008889246,
      21.243434183184476
    ],
    "nOrganoids": 12
  },
  "rl_vs_random_only": {
    "trained": 48.65134672619048,
    "control": 36.70092261904763,
    "delta": 11.950424107142855,
    "score": 24.5633983667498,
    "ci": [
      5.030784970238092,
      21.0293167782738
    ],
    "nExperiments": 16
  },
  "rl_vs_none_only": {
    "trained": 50.723361904761916,
    "control": 32.27800476190476,
    "delta": 18.445357142857148,
    "score": 36.364618688899434,
    "ci": [
      10.574439166666671,
      27.675354047619052
    ],
    "nExperiments": 25
  }
}
```

All variants preserve a positive RL-control direction, but magnitude changes by aggregation choice. Organoid-first aggregation is the most conservative reviewed variant.

## KCL active electrode coverage

```json
{
  "mean_well": {
    "value": 0.1608016304347826,
    "score": 16.08016304347826,
    "ci": [
      0.14932065217391305,
      0.17303158967391302
    ]
  },
  "median_well": {
    "value": 0.125,
    "score": 12.5,
    "ci": [
      0.0625,
      0.125
    ]
  },
  "batch_first": {
    "value": 0.16138515063216854,
    "score": 16.138515063216854,
    "nBatches": 3
  },
  "cell_line_first": {
    "value": 0.14761394261566235,
    "score": 14.761394261566236,
    "nCellLines": 6
  },
  "nWells": 920
}
```

Well-level independence is a limitation. Batch-first and cell-line-first summaries are included for review.

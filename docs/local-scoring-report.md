# Local Scoring Report

## Counts

```json
{
  "sources": 6,
  "datasets": 6,
  "systems": 2,
  "benchmarkRuns": 2,
  "metricValues": 2,
  "scoreCalculations": 2,
  "provenanceEvents": 8
}
```

## Provisional Local Scores

### KCL dissociated cerebral organoid MEA system

- Track: Signal Quality
- Task: MEA development recording
- Status: provisional
- Methodology: 0.1
- Score type: signal
- Score: 16.08016304347826
- Confidence: C
- Metric: Active channel ratio
- Metric value: 0.16080163043478263
- Source: Electrophysiological development and functional plasticity in dissociated human cerebral organoids across multiple cell lines - Well average data and metadata (1 of 4)
- Calculation: `{"activeChannelRatioMean": 0.16080163043478263, "meanFiringRateHz": 0.12415465652173913, "meanNetworkBurstFrequency": 0.023502809322033896, "nWells": 920, "nCellLines": 6, "nBatches": 3}`

### Robbins et al. cortical organoid cart-pole closed-loop system

- Track: Closed-Loop Learning
- Task: Closed-loop cart-pole
- Status: provisional
- Methodology: 0.1
- Score type: learning
- Score: 23.645064085244453
- Confidence: B
- Metric: Terminal performance delta
- Metric value: 11.993571428571427
- Source: Goal-Directed Learning in Cortical Organoids - Experimental Data and Code
- Calculation: `{"meanRlTopDecile": 50.723361904761916, "meanBestControlTopDecile": 38.72979047619048, "meanGain": 11.993571428571427, "score": 23.645064085244453, "nExperiments": 25, "nRuns": 426, "nOrganoids": 16}`

## Remote

No remote D1 writes were performed.

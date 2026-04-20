# Remote Scoring Promotion Review

Do not run these commands until the formulas and local outputs have been reviewed.

## Local scores

### Robbins et al. cortical organoid cart-pole closed-loop system

- Source: Zenodo 17684862
- Dataset file: `aggregated_experiment_data.pkl`
- Track: Closed-Loop Learning
- Task: Closed-loop cart-pole
- Methodology: 0.1
- Status: provisional
- Metric: Terminal performance delta
- Metric value: 11.993571428571427
- 95% bootstrap CI: 4.616606904761904 to 21.62441357142857
- Score type: learning
- Score: 23.645064085244453
- Score 95% bootstrap CI: 9.101539668111975 to 42.63205899488785
- Confidence: B

Ready for remote scoring promotion: not yet. Review the closed-loop learning formula and confirm `top_decile` should be the v0.1 terminal performance metric.

### KCL dissociated cerebral organoid MEA system

- Source: Figshare 30394168
- Dataset file: `Well_averages_developmenttimecourse_withNAP.csv`
- Track: Signal Quality
- Task: MEA development recording
- Methodology: 0.1
- Status: provisional
- Metric: Active channel ratio
- Metric value: 0.16080163043478263
- 95% bootstrap CI: 0.1487075407608696 to 0.17323539402173913
- Score type: signal
- Score: 16.08016304347826
- Confidence: C

Ready for remote scoring promotion: not yet. The score reflects active electrode coverage only and should be reviewed before being shown as a signal-quality score.

## Do not run yet

Remote dry-run commands to prepare later:

```bash
pnpm ingest:zenodo -- --url https://zenodo.org/records/17684862 --target=remote --dry-run
pnpm ingest:figshare -- --article 30394168 --target=remote --dry-run
```

Remote scoring promotion should be generated only after:

- methodology v0.1 is reviewed;
- score confidence rules are reviewed;
- system skeleton names are approved;
- local preview rows are checked by a curator.

No remote scoring SQL is approved in this pass.

# Scoring Research v0

## Zenodo 17684862

Inspected:
- `aggregated_experiment_data.pkl`
- `README_data_structure.md`
- `data_access_example.py`

Findings:
- The pickle contains 38 experiment records.
- Cart-pole runs include `exp_type` values: `rl`, `random`, `none`.
- The native performance field is `top_decile`.
- 426 cart-pole runs were found.
- 25 experiments have RL plus at least one control condition.

Scorable now:
- Closed-loop learning gain from `top_decile`.

Not scored now:
- Retention. No explicit retention field was confirmed.
- Composite ranking.

## Zenodo 18298694

Inspected file list:
- `analysis_scripts.zip`
- `Indiv_organoids.zip`
- `population_results.zip`

Current status:
- No score has been computed yet.
- The record is suitable for future signal/spike analysis after inspecting `population_results.zip` and the analysis scripts.

## Figshare 30394168

Inspected:
- `metadata.csv`
- `Well_averages_developmenttimecourse_withNAP.csv`
- `Well_averages_chLTP.csv`
- `Well_averages_chLTP_withNAP.csv`

Findings:
- The well-average files include firing-rate, active-electrode, burst, network-burst, cross-correlation, and graph/network columns.
- `Well_averages_developmenttimecourse_withNAP.csv` includes `percent_active_electrodes`.
- Six cell lines and three batches are present in the inspected development table.

Scorable now:
- Provisional signal quality from active electrode coverage.

Potentially scorable after review:
- Plasticity effects from chLTP pre/post and vehicle/treatment tables.

Not downloaded:
- Large raw KCL `.raw` files.


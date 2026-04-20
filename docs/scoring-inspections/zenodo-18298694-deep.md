# Zenodo 18298694 Deep Inspection

```json
{
  "analysis_scripts.zip": {
    "size": 43723,
    "entries": 12,
    "firstEntries": [
      "comprehensive_analysis_pipeline_v6.m",
      "compute_all_channel_statistics.m",
      "compute_criticality_metrics.m",
      "compute_mutual_information.m",
      "compute_network_metrics.m",
      "compute_permutation_entropy.m",
      "compute_sample_entropy.m",
      "compute_sttc_matrix.m",
      "compute_sttc_with_significance.m",
      "compute_transfer_entropy.m",
      "detect_avalanches.m",
      "detect_population_bursts.m"
    ],
    "matInspection": []
  },
  "Indiv_organoids.zip": {
    "size": 7606972,
    "entries": 45,
    "firstEntries": [
      "fs363-org0.mat",
      "fs363-org1.mat",
      "fs363-org2.mat",
      "fs363-org3.mat",
      "fs367-org0.mat",
      "fs367-org1.mat",
      "fs367-org2.mat",
      "fs367-org3.mat",
      "fs371-org0.mat",
      "fs371-org1.mat",
      "fs371-org2.mat",
      "fs371-org3.mat",
      "fs373-org0.mat",
      "fs373-org1.mat",
      "fs373-org2.mat",
      "fs373-org3.mat",
      "fs375-org1.mat",
      "fs375-org2.mat",
      "fs375-org3.mat",
      "fs379-org0.mat",
      "fs379-org1.mat",
      "fs379-org2.mat",
      "fs379-org3.mat",
      "fs380-org0.mat",
      "fs380-org1.mat",
      "fs380-org2.mat",
      "fs396-org0.mat",
      "fs396-org1.mat",
      "fs396-org2.mat",
      "fs406-org0.mat",
      "fs406-org2.mat",
      "fs406-org3.mat",
      "fs417-org0.mat",
      "fs417-org1.mat",
      "fs417-org2.mat",
      "fs419-org0.mat",
      "fs419-org1.mat",
      "fs419-org2.mat",
      "fs426-org0.mat",
      "fs426-org1.mat",
      "fs426-org2.mat",
      "fs433-org0.mat",
      "fs509-org3.mat",
      "fs524-org3.mat",
      "fs535-org2.mat"
    ],
    "matInspection": [
      {
        "file": "fs363-org0.mat",
        "error": "Please use HDF reader for matlab v7.3 files, e.g. h5py"
      },
      {
        "file": "fs363-org1.mat",
        "error": "Please use HDF reader for matlab v7.3 files, e.g. h5py"
      },
      {
        "file": "fs363-org2.mat",
        "error": "Please use HDF reader for matlab v7.3 files, e.g. h5py"
      },
      {
        "file": "fs363-org3.mat",
        "error": "Please use HDF reader for matlab v7.3 files, e.g. h5py"
      },
      {
        "file": "fs367-org0.mat",
        "error": "Please use HDF reader for matlab v7.3 files, e.g. h5py"
      }
    ]
  },
  "population_results.zip": {
    "size": 208424223,
    "entries": 1,
    "firstEntries": [
      "population_results.mat"
    ],
    "matInspection": [
      {
        "file": "population_results.mat",
        "error": "Please use HDF reader for matlab v7.3 files, e.g. h5py"
      }
    ]
  }
}
```

No score was created. Population and organoid-level `.mat` structures need a dedicated parser before computing firing-rate, burst, or active-channel metrics.

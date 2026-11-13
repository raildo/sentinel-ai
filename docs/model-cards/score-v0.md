# Model Card: score-model v0 (simulated)

> **This model is simulated.** There is no trained model in this repository. Numbers, datasets and metrics are mock data used to demonstrate the product design. Do not use any figure here as evidence of real performance.

## Overview

| Field | Value |
|-------|-------|
| Name | score-model |
| Version | v0 (label shown in UI: "score-model v0.3, logistic + isotonic") |
| Type | Logistic regression followed by isotonic calibration |
| Output | Confidence Score 0 to 100, band, top-3 MITRE ATT&CK techniques with probability |
| Owner | ML lead |
| Related | ADR-005 |

## Intended use

Rank and prioritize alerts in the Triage queue, and give the analyst a calibrated estimate that the recommended technique and severity are correct. The LLM does not produce the score.

## Out of scope

Automatic containment (ADR-009), per-analyst evaluation, any decision without a human.

## Inputs (planned features)

Alert severity, OCSF class, source, asset criticality, count and type of evidence, CISA KEV membership of referenced CVEs, rule hit history. Untrusted free text is not a feature.

## Bands

Proposed: low below 40, medium 40 to 69, high 70 to 84, very high 85 and above. 85 is also the minimum for any future automation preview (ADR-009).

## Evaluation (simulated golden dataset)

Metrics are computed on a simulated golden dataset and shown in the governance panel with that label.

| Metric | Target | Notes |
|--------|--------|-------|
| ECE | < 0.05 | Reliability diagram per band |
| Top-3 technique accuracy | > 85% | Correct technique in top 3 |
| Severity accuracy | tracked | Per class |
| Rapid accept rate | < 10% | Human factor, not model quality |

## Limits and risks

- Calibration holds only for the distribution it was fit on; drift breaks it (risk 11).
- A high score can encourage over-trust (risk 16). The UI mitigates with evidence before score, divergence flow and rapid accept marker.
- Not validated across tenants; per-tenant recalibration may be needed.
- Not tested for fairness, because inputs are not about people; user attributes are not features.

- The audit trail check (ADR-006) does not detect truncation of the end of the chain without an externally anchored head hash; calibration records that feed ECE review rely on that trail.

## Monitoring and reversal

Monthly ECE and accuracy review on a labeled sample. Reverse to the previous version if ECE exceeds 0.10 twice in a row (ADR-005). Aggregated metrics only.

## Changelog

- v0: initial simulated card for the Phase 4 prototype.

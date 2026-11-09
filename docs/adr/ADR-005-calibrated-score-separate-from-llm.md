# ADR-005: Calibrated score separated from the LLM; the LLM only explains

Status: Accepted

## Context

An earlier prototype showed one "AI confidence" number that mixed the model's opinion with its prose. A language model's self-reported confidence is not calibrated, can be steered by text inside the alert (prompt injection), and cannot be audited as a statistic. Analysts read the number as probability, which feeds automation bias (see risk 16 in `docs/riscos.md`).

## Decision

- The Confidence Score comes from a dedicated, versioned scoring model (logistic regression on structured features, followed by isotonic calibration). See `docs/model-cards/score-v0.md`.
- The LLM never produces or modifies the score. It receives the score, band and evidence and produces only the explanation (ADR-007).
- `Analysis` stores `score`, `band`, `scoreModelVersion`, `promptVersion`, so both parts are traceable independently.
- In the UI the score and the explanation are separate blocks with separate version labels. The score stays dimmed until the analyst opens at least one evidence item.
- If the validator drops an LLM claim (for example one injected through a username field), the score is unchanged.
- Calibration quality is tracked as ECE on the governance panel, always aggregated.

## Discarded alternative

Ask the LLM to return a probability in its JSON output. Rejected: not calibrated, not reproducible, injectable, and impossible to evaluate with ECE in a meaningful way.

## Reversal criterion

Revisit if ECE stays above 0.10 for two consecutive monthly reviews on real data, or if a candidate model beats the logistic baseline by at least 5 points of top-3 technique accuracy with equal or better ECE. A replacement must still be a separate, versioned, calibrated component.

## Consequences

Two components to version and evaluate. Score changes do not require a prompt change and vice versa. All current numbers are simulated (golden dataset is simulated).

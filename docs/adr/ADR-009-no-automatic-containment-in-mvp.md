# ADR-009: No automatic containment in the MVP

Status: Accepted

## Context

Containment (isolating a host, disabling an account) is an action with business impact. OWASP LLM06 (Excessive Agency) applies when a model or a score can trigger it. The prototype's old Action Center had a script editor and "Tier 3 credentials", which is the pattern to avoid.

## Decision

- In the MVP the human decides and the product hands the case off: send to SOAR or ITSM through a signed CloudEvents webhook (simulated) and export.
- Containment appears only in a tab "Preview: Automation phase". It is a preview with no real effect.
- Future automation is limited to a catalog of reversible actions (for example isolate host, disable account, block IP with TTL). No free-form scripts, no stored privileged credentials in the product.
- Every action requires: score at or above 85 (threshold), an analyst approval recorded with the `DecisionRecord` ID, and a defined rollback.
- The Containment Executor refuses the action if score is below 85 or if there is no approval (red team scenario 6). Refusals are logged.
- The executor uses a separate identity with the least privilege per action, and its credentials never reach the LLM.

## Discarded alternative

Auto-contain above a high score without a human step. Rejected: automation bias (risk 16), calibration is only simulated, and a wrong containment on a critical host costs more than the minutes saved.

## Reversal criterion

Revisit only when on real data: ECE is under 0.05, top-3 accuracy and precision at the 85 band are validated for at least 3 months, the divergence rate is stable, and the risk owner signs the change. Even then, only the reversible catalog.

## Consequences

MTTR gains come from triage, not from containment, in the MVP. The preview doubles as a test bed for the refusal rules.

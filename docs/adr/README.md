# Architecture Decision Records

Structural decisions for SecureAI Analyst. Each ADR has context, decision, discarded alternative and a reversal criterion. Status values: `Accepted`, `Proposed` (needs team review), `Superseded`.

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-002](ADR-002-ingestion-sentinel-splunk-ocsf.md) | Ingestion from Sentinel and Splunk normalized to OCSF (revised) | Proposed |
| [ADR-005](ADR-005-calibrated-score-separate-from-llm.md) | Calibrated score separated from the LLM; the LLM only explains | Accepted |
| [ADR-006](ADR-006-hash-chain-audit-trail-s3-object-lock.md) | Audit trail with hash chain and S3 Object Lock anchor | Accepted |
| [ADR-007](ADR-007-llm-gateway-claims-with-evidence.md) | LLM behind a gateway, explanation as claims with evidence | Accepted |
| [ADR-008](ADR-008-pseudonymization-before-llm.md) | Pseudonymization before any LLM call | Proposed |
| [ADR-009](ADR-009-no-automatic-containment-in-mvp.md) | No automatic containment in the MVP | Accepted |
| [ADR-010](ADR-010-multi-tenancy-tenant-id.md) | Multi-tenancy by `tenantId` with enforced isolation | Proposed |

ADR-001, ADR-003 and ADR-004 are not part of this set (not written yet). ADR-002 is a revision of the original ingestion decision.

## Rule

Any structural decision (data model, trust boundary, external dependency, model usage) needs an ADR before merge. See the Definition of Done in [CONTRIBUTING.md](../../CONTRIBUTING.md).

Template: Context, Decision, Discarded alternative, Reversal criterion, Consequences.

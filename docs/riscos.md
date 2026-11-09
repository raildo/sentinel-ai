# Risk Register

Scale: P (probability) and I (impact) from 1 to 5. Level = P x I: 1 to 6 low, 8 to 12 medium, 15 to 25 high. Owners are roles. All values are initial estimates for the prototype and need review with real data.

| # | Risk | P | I | Level | Owner | Main mitigation |
|---|------|---|---|-------|-------|-----------------|
| 1 | Prompt injection through alert fields (username, URL, command line) | 4 | 4 | 16 high | AppSec lead | Untrusted fields as quoted data, claim validator, score independent of LLM (ADR-005, ADR-007) |
| 2 | PII leak to the LLM (private IP, email, CPF) | 3 | 5 | 15 high | DPO | Pseudonymization and egress check (ADR-008) |
| 3 | Tampering with the audit trail | 2 | 5 | 10 medium | Platform lead | Hash chain, S3 Object Lock anchor, verify chain (ADR-006) |
| 4 | Cross-tenant data exposure | 2 | 5 | 10 medium | Platform lead | `tenantId` from token, data-layer isolation, CI tests (ADR-010) |
| 5 | Miscalibrated score (overconfident) | 3 | 4 | 12 medium | ML lead | Isotonic calibration, ECE monitoring (ADR-005) |
| 6 | Hallucinated or unsupported claim shown to analyst | 3 | 4 | 12 medium | ML lead | Claims must cite evidence, groundedness KRI (ADR-007) |
| 7 | LLM06 Excessive agency (action without human decision) | 2 | 5 | 10 medium | Product owner | No auto containment; catalog of reversible actions, 85 threshold, approval, rollback (ADR-009) |
| 8 | LLM or gateway outage | 3 | 3 | 9 medium | SRE lead | Degraded mode with score and evidence only |
| 9 | Normalization loses fields (OCSF mapping) | 3 | 3 | 9 medium | Data engineer | Mapping tests, dead-letter queue (ADR-002) |
| 10 | Cost per incident above budget | 3 | 3 | 9 medium | Engineering manager | Gateway metering, token limits |
| 11 | Dataset drift reduces top-3 accuracy | 3 | 3 | 9 medium | ML lead | Monthly golden dataset evaluation |
| 12 | Secrets exposed in prompts or logs | 2 | 4 | 8 medium | AppSec lead | Secret scanning, log redaction |
| 13 | Replay or forgery of SOAR/ITSM webhook | 2 | 4 | 8 medium | Platform lead | Signed CloudEvents, timestamp and nonce check |
| 14 | Per-analyst performance monitoring (misuse of metrics) | 2 | 4 | 8 medium | Engineering manager | Aggregated metrics only, no per-analyst view |
| 15 | Vendor lock-in to a model provider | 3 | 2 | 6 low | Architect | Gateway abstraction (ADR-007) |
| 16 | Automation bias: analyst accepts the recommendation without checking evidence | 4 | 4 | 16 high | Product owner | Evidence before score, justification on divergence, "rapid accept" mark, divergence and rapid accept KRIs |

## Key risk indicators (KRIs)

Always aggregated per tenant, never per analyst. Thresholds are proposals.

| KRI | Related risk | Green | Red |
|-----|--------------|-------|-----|
| Rapid accept rate (accept under 30 s, no evidence opened) | 16 | < 10% | > 25% |
| Divergence rate | 16, 5 | 5% to 30% | < 2% or > 40% |
| ECE | 5 | < 0.05 | > 0.10 |
| Groundedness (claims with valid evidence) | 6 | > 95% | < 90% |
| Claims dropped by validator | 1 | tracked | spike over 3x baseline |
| Egress check blocks per 1000 calls | 2 | 0 | > 0 unexplained |
| Verify chain failures | 3 | 0 | any |
| Anchor lag | 3 | < 10 min | > 60 min |
| Degraded mode rate | 8 | < 2% | > 10% |
| Containment refusals (score < 85 or no approval) | 7 | tracked | any execution without approval |
| Cost per incident | 10 | within budget | > 150% of budget |

## Risk appetite

- Zero tolerance: automated containment without recorded human approval, PII in LLM payloads, undetected audit trail tampering, cross-tenant exposure.
- Low tolerance: unsupported claims shown without a warning, score without a version label.
- Moderate tolerance: degraded mode, cost overruns, slower triage during provider outages.

## Review

Reviewed at each release and after any incident involving the product. A high risk open without a mitigation owner blocks release (see Definition of Done in CONTRIBUTING.md). Everything here is based on a simulated golden dataset.

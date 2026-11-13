# ADR-008: Pseudonymization before any LLM call

Status: Proposed. Needs privacy review.

## Context

Alerts contain private IPs, hostnames, emails, usernames and national IDs (CPF). Sending these to an external model is a PII leak risk and a LGPD concern (LINDDUN, see `docs/threat-model/`). The analyst still needs real values.

## Decision

- A pseudonymization step runs inside the tenant boundary before the gateway call. It replaces values with stable per-case tokens such as `<IP_INT_02>`, `<HOST_7f3a>`, `<USER_01>`, `<EMAIL_01>`, `<CPF_01>`.
- The token map stays server side, encrypted, scoped to the case and tenant, and is never sent to the LLM.
- The analyst sees real values. A panel "what the LLM received" shows the exact tokenized payload.
- A final egress check blocks the call if the payload still matches private IP ranges, email or CPF patterns. A blocked call puts the case in degraded mode and raises an event.
- Public IOCs (public IPs, file hashes, CVE IDs) are not tokenized because they carry the analytic value.
- The LLM output is de-tokenized only in the UI layer, after the validator.

## Discarded alternative

Rely on the provider's contractual no-retention and send raw data. Rejected: contract is not a technical control, and an incident at the provider would expose customer data.

## Reversal criterion

Revisit if tokenization lowers groundedness by more than 5 points against the raw baseline on the golden dataset, in which case test a self-hosted model inside the tenant boundary instead of relaxing tokenization.

## Consequences

The egress check needs its own tests and a false-negative KRI. Token stability within a case is required so claims remain consistent.

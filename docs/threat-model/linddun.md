# LINDDUN

## Flow A: explanation

| Cat | Threat | Control | Status |
|-----|--------|---------|--------|
| Linking | Tokens reused across cases let the provider link a person | Tokens are per case, not global | designed |
| Identifying | LLM payload still allows reidentification (rare hostnames, free text) | Egress check, tokenization of free-text entities, no free text from users beyond evidence | designed |
| Non-repudiation | Audit trail makes the analyst undeniably tied to a decision | Intended and documented; metrics are aggregated, never per analyst | simulated |
| Detecting | Presence of a case reveals a user was investigated | Tenant isolation, access logs | designed |
| Data disclosure | PII in logs, exports or prompts | Redaction in logs, tokenized payloads, export limited to the tenant | simulated |
| Unawareness | Employees do not know security data is processed by an LLM | Notice in tenant contract and internal policy, DPO review | proposed |
| Non-compliance | Retention beyond policy, missing legal basis (LGPD) | Retention per tenant, DPIA before production | proposed |

## Flow B: Containment Executor

| Cat | Threat | Control | Status |
|-----|--------|---------|--------|
| Linking | Action logs link account disablement to a person | Logs held under the tenant key, access-controlled | designed |
| Identifying | Action target contains personal identifiers in SOAR tickets | Minimum fields in webhook payload | designed |
| Data disclosure | Webhook sent to the wrong endpoint | Allowlisted endpoints per tenant, signed payload | designed |
| Non-compliance | Automated decision affecting a person without human review (LGPD art. 20) | Human approval required for every action (ADR-009) | simulated |

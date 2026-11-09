# Threat Model

Scope: two flows.

1. Explanation flow: alert ingestion, pseudonymization, scoring, LLM gateway, claim validator, UI, decision record.
2. Containment Executor (future automation phase, preview only in the MVP, ADR-009).

Methods: STRIDE for security, LINDDUN for privacy. Status of controls: `designed` means in an ADR, `simulated` means shown in the prototype only.

- [STRIDE](stride.md)
- [LINDDUN](linddun.md)

Trust boundaries: (a) SIEM to ingestion, (b) tenant boundary to LLM gateway, (c) analyst browser to API, (d) executor to SOAR/target systems.

Untrusted data: every alert field. Treated as quoted data in all prompts.

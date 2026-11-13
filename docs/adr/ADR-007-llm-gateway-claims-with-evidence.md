# ADR-007: LLM behind a gateway, explanation as claims with evidence

Status: Accepted

## Context

The explanation must be checkable by the analyst and must not tie the product (or its UI) to a commercial model name. Free prose cannot be validated. The prompt is a versioned artifact (`prompts/explainer/v1.md`).

## Decision

- All model calls go through an internal LLM gateway. The UI and records show "LLM via gateway" and the prompt version, never a commercial model name. The gateway holds provider routing, timeouts, rate limits, cost metering and the no-retention setting.
- The explanation is a list of claims. Each claim carries the IDs of the evidence that support it. A validator rejects claims without evidence IDs, with IDs that do not exist in the case, or with content that comes from untrusted fields rather than from evidence.
- Clicking a claim highlights its evidence in the mapper. A section "expected evidence not found" lists what the technique would normally leave behind but is absent.
- Untrusted fields (username, URL, command line) are passed as quoted data, never as instructions. A claim that follows an injected instruction is discarded and the score does not change.
- If the gateway is down or the validator rejects everything, the case runs in degraded mode: score and evidence only, with a visible warning.

## Discarded alternative

Call a commercial provider SDK directly from the app and show model name and free-text rationale. Rejected: provider lock-in, no central control of data egress and cost, and no machine-checkable link between statement and evidence.

## Reversal criterion

Revisit if groundedness (share of claims with valid evidence) stays below 90% after two prompt versions, or if gateway latency makes p95 time to first explanation exceed the target. Fallback is degraded mode as the default, not unvalidated prose.

## Consequences

Provider can change without UI change. Every explanation is tied to prompt version and score model version in the trail.

# ADR-002: Ingestion from Sentinel and Splunk normalized to OCSF (revised)

Status: Proposed (revision). Needs team review.

## Context

Alerts reach the product from Microsoft Sentinel and Splunk. Each has its own schema, severity vocabulary and entity model. The Triage screen, the score model and the explanation all need one stable shape. The `Incident` type carries `source` (`Sentinel | Splunk`), `tenantId` and an OCSF class. The original decision (a single vendor connector with a custom schema) does not fit two sources.

## Decision

- One connector per source, running in the ingestion tier, pulling or receiving alerts and emitting a CloudEvents `AlertaRecebido` event (see `docs/contracts/asyncapi.yaml`).
- A normalizer maps each vendor payload to an OCSF class (Detection Finding 2004 as default; Authentication 3002 and Network Activity 4001 for supporting events). The OCSF object is stored next to the raw payload, which stays immutable.
- `severity` is the vendor-neutral severity from the normalizer; `workflowStatus` is the product's own state (new, in review, decided, handed off). They are separate fields.
- Normalization failures go to a dead-letter queue with the tenant and source, never dropped silently.

## Discarded alternative

Keep the raw vendor schema end to end and branch in the UI and scoring code per source. Rejected: every new source multiplies code in score features, prompts and screens, and evidence IDs would not be comparable across sources.

## Reversal criterion

Revisit if more than 15% of alerts in the golden dataset lose a field needed by score features during OCSF mapping, or if a third source needs a class OCSF cannot represent. In that case, keep OCSF as the core and add a typed extension block per source.

## Consequences

Adding a source means one connector plus one mapping test suite. The mapping is a sensitive contract and is versioned.

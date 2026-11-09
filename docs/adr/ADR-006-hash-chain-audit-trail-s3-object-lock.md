# ADR-006: Audit trail with hash chain and S3 Object Lock anchor

Status: Accepted

## Context

The audit trail is the evidence that a human decided, with what the AI recommended at that moment. A mutable table does not prove that. Tampering by an insider or a compromised service account is a named threat (STRIDE Tampering, see `docs/threat-model/`).

## Decision

- Each `DecisionRecord` stores recommendation and decision side by side, `scoreModelVersion`, `promptVersion`, evidence open timestamps, `hash` and `prevHash`.
- `hash = SHA-256(canonical JSON of the record without hash, plus prevHash)`. The prototype computes it with Web Crypto; the backend uses the same canonicalization.
- The chain head is anchored periodically (every N records or 5 minutes) as a signed object in an S3 bucket with Object Lock in compliance mode. The prototype only simulates the anchor status.
- "Verify chain" recomputes every hash and reports the first broken record. A demo control tampers with one record to show detection.
- The chain is per tenant (ADR-010). Fast accepts (under 30 s with no evidence opened) are marked "rapid accept" in the record.
- Export is JSON, including hashes, so a third party can verify offline.

## Discarded alternative

A managed ledger database (for example QLDB-style) as the only store. Rejected: added vendor dependency, and a hash chain plus WORM object storage gives an independent proof with common tooling.

## Reversal criterion

Revisit if anchor writes cost more than the budget in the risk appetite, or if a regulator requires a specific ledger or timestamping authority. The record format and the verification algorithm should survive the change.

## Known limitation

`verifyChain` recomputes hashes and links, so it detects edited, reordered or removed records in the middle of the chain. It does not detect truncation of the end of the chain: if the last N records are dropped, the remaining prefix is still a valid chain. Detecting that needs the head hash anchored outside the system being verified (the S3 Object Lock anchor above) and compared during verification. The prototype only simulates the anchor, so this is a known limit of the prototype, not covered by "Verify chain".

## Consequences

Records are append-only; corrections are new records that reference the old one. Anchor lag is a KRI.

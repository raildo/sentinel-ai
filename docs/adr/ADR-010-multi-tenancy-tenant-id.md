# ADR-010: Multi-tenancy by `tenantId` with enforced isolation

Status: Proposed. Needs team review.

## Context

The product serves several customers (tenants). A cross-tenant read of incidents, evidence or the audit trail would be a severe breach. `Incident`, `Analysis` and `DecisionRecord` all carry `tenantId`.

## Decision

- Pool model: shared services, `tenantId` on every record and on every event (CloudEvents extension attribute `tenantid`).
- Tenant comes from the verified token claim, never from a request body or path parameter alone. The API rejects mismatches.
- Isolation enforced in the data layer (row-level security or per-tenant key prefix), not only in application code.
- Separate encryption key per tenant for stored evidence and token maps (ADR-008).
- One hash chain and one S3 Object Lock prefix per tenant (ADR-006).
- Governance metrics are aggregated per tenant and never per analyst.
- Automated cross-tenant tests run in CI against the API.

## Discarded alternative

One deployment (silo) per tenant. Rejected for the MVP: operational cost grows linearly with customers.

## Reversal criterion

Move a tenant to a silo if a contract requires data residency or dedicated infrastructure, or if a cross-tenant test fails and cannot be fixed at the data layer. The `tenantId` contract stays the same.

## Consequences

Noisy neighbor limits are needed per tenant (rate limits, LLM budget). Tenant ID is a required field in all contracts.

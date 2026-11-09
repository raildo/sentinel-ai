# STRIDE

## Flow A: explanation

| Cat | Threat | Control | Status |
|-----|--------|---------|--------|
| S | Forged alert from a fake source | Per-source auth on connector, signed CloudEvents | designed |
| S | Analyst impersonation in the decision | SSO, token claim as identity, identity stored in record | designed |
| T | Prompt injection in username or URL changes the explanation | Quoted data, claim validator drops unsupported claims, score unchanged (red team scenario 1) | simulated |
| T | Tampering with a stored decision | Hash chain, S3 Object Lock anchor, verify chain | simulated |
| R | Analyst denies a decision, or the AI recommendation is disputed | Record stores recommendation and decision side by side with versions | simulated |
| I | PII reaches the LLM | Pseudonymization, egress check, "what the LLM received" panel | simulated |
| I | Cross-tenant read of evidence | `tenantId` from token, data-layer isolation | designed |
| I | Model name or prompt leaked in UI | UI shows "LLM via gateway" and prompt version only | simulated |
| D | LLM or gateway outage, or flooding of alerts | Rate limits, degraded mode with score and evidence | simulated |
| E | Gateway credentials used from the UI tier | Credentials only in gateway; UI has no model access | designed |

## Flow B: Containment Executor

| Cat | Threat | Control | Status |
|-----|--------|---------|--------|
| S | Forged approval or forged execution request | Approval bound to `DecisionRecord` ID, signed request, mTLS to executor | designed |
| T | Action parameters altered after approval | Parameters hashed in the approved record, executor compares | designed |
| R | No proof of who approved the action | Approval ID written to the hash chain | designed |
| I | Executor credentials exposed to LLM or UI | Separate identity per action, secrets only in executor | designed |
| D | Mass containment by a bug or loop | Rate limit per tenant, per-action TTL, kill switch | designed |
| E | Free-form script or broader privilege than needed (LLM06) | Reversible action catalog only, least privilege, no script editor, no stored Tier 3 credentials | simulated (preview refuses) |
| E | Action with low score | Refuse if score < 85 or no approval (red team scenario 6) | simulated |

## Open findings

None rated high open for the prototype scope. Items marked `designed` are not implemented yet and must be implemented before any real data is used.

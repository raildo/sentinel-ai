import type { EvidenceOpen } from '../types';

export const FAST_ACCEPT_THRESHOLD_MS = 30000;

/**
 * True when the analyst decided in under 30 s without opening any evidence.
 * Only meaningful for "accept" decisions; callers apply it to accepts only.
 */
export function isFastAccept(openedEvidence: readonly EvidenceOpen[], timeToDecisionMs: number): boolean {
  return openedEvidence.length === 0 && timeToDecisionMs < FAST_ACCEPT_THRESHOLD_MS;
}

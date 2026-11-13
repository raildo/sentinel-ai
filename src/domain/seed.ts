import type { DecisionRecord } from '../types';
import { SEED_DECISION_DRAFTS, ANCHOR_BUCKET } from '../constants';
import { appendRecord } from './hash';

/** Builds the seed trail with a valid hash chain. The first records are already anchored. */
export async function buildSeedChain(): Promise<DecisionRecord[]> {
  const chain: DecisionRecord[] = [];
  for (const draft of SEED_DECISION_DRAFTS) {
    const rec = await appendRecord(chain, draft);
    chain.push(rec);
  }
  // Records from the previous day were already anchored by the nightly job (simulated).
  return chain.map((r) =>
    Date.parse(r.decidedAt) < Date.parse('2026-04-17T00:00:00Z')
      ? { ...r, anchorStatus: 'anchored' as const, anchorRef: `${ANCHOR_BUCKET}/2026-04-16/${r.hash.slice(0, 12)}` }
      : r,
  );
}

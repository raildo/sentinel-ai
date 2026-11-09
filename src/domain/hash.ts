import type { ChainVerification, DecisionDraft, DecisionRecord } from '../types';

export const GENESIS_HASH = '0'.repeat(64);

/** Deterministic JSON: sorted keys, undefined omitted. */
export function canonicalize(value: unknown): string {
  if (value === undefined) return 'null';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((v) => canonicalize(v)).join(',')}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj)
    .filter((k) => obj[k] !== undefined)
    .sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize(obj[k])}`).join(',')}}`;
}

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Hash covers everything except the hash itself and the simulated anchor fields. */
export function computeRecordHash(record: Omit<DecisionRecord, 'hash' | 'anchorStatus' | 'anchorRef'>): Promise<string> {
  const rest: Record<string, unknown> = { ...record };
  delete rest.hash;
  delete rest.anchorStatus;
  delete rest.anchorRef;
  return sha256Hex(canonicalize(rest));
}

/** Builds the next record of the chain (does not mutate it). */
export async function appendRecord(chain: readonly DecisionRecord[], draft: DecisionDraft): Promise<DecisionRecord> {
  const index = chain.length;
  const prevHash = index === 0 ? GENESIS_HASH : chain[index - 1].hash;
  const base = {
    ...draft,
    id: `DEC-${String(index + 1).padStart(4, '0')}`,
    index,
    prevHash,
  };
  const hash = await computeRecordHash(base);
  return { ...base, hash, anchorStatus: 'pending' };
}

/** Recomputes every hash and link. Reports the first broken record. */
export async function verifyChain(chain: readonly DecisionRecord[]): Promise<ChainVerification> {
  let expectedPrev = GENESIS_HASH;
  for (let i = 0; i < chain.length; i++) {
    const rec = chain[i];
    if (rec.prevHash !== expectedPrev) {
      return { valid: false, brokenAtIndex: i, reason: 'prev_hash_mismatch' };
    }
    const recomputed = await computeRecordHash(rec);
    if (recomputed !== rec.hash) {
      return { valid: false, brokenAtIndex: i, reason: 'hash_mismatch' };
    }
    expectedPrev = rec.hash;
  }
  return { valid: true, brokenAtIndex: null };
}

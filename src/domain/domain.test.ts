import { describe, expect, it } from 'vitest';
import {
  GENESIS_HASH,
  appendRecord,
  buildSeedChain,
  computeGovernanceMetrics,
  evaluateAutomation,
  findApprovalDecision,
  isFastAccept,
  scanForPII,
  sortQueue,
  verifyChain,
} from '.';
import {
  AUTOMATION_CATALOG,
  GOLDEN_DATASET,
  MOCK_ANALYSES,
  MOCK_INCIDENTS,
  SEED_DECISION_DRAFTS,
  SCENARIO_IDS,
} from '../constants';
import type { DecisionRecord, EvidenceOpen } from '../types';

const OPEN: EvidenceOpen[] = [{ evidenceId: 'ev-1', openedAt: '2026-04-17T12:30:00Z' }];
const action = AUTOMATION_CATALOG[0];

describe('hash chain', () => {
  it('validates a correct chain', async () => {
    const chain = await buildSeedChain();
    expect(chain[0].prevHash).toBe(GENESIS_HASH);
    expect(await verifyChain(chain)).toEqual({ valid: true, brokenAtIndex: null });
  });

  it('validates an empty chain', async () => {
    expect((await verifyChain([])).valid).toBe(true);
  });

  it('flags a tampered record at the right index', async () => {
    const chain = await buildSeedChain();
    const idx = 2;
    const tampered = chain.map((r, i) => (i === idx ? { ...r, justification: 'edited' } : r));
    expect(await verifyChain(tampered)).toEqual({ valid: false, brokenAtIndex: idx, reason: 'hash_mismatch' });
  });

  it('flags a broken link when a record is removed', async () => {
    const chain = await buildSeedChain();
    const result = await verifyChain([chain[0], chain[2], chain[3]]);
    expect(result).toMatchObject({ valid: false, brokenAtIndex: 1, reason: 'prev_hash_mismatch' });
  });

  it('appendRecord links to the previous hash', async () => {
    const chain = await buildSeedChain();
    const next = await appendRecord(chain, SEED_DECISION_DRAFTS[0]);
    expect(next.prevHash).toBe(chain[chain.length - 1].hash);
    expect(await verifyChain([...chain, next])).toMatchObject({ valid: true });
  });
});

describe('isFastAccept', () => {
  it('is true under 30 s without evidence', () => {
    expect(isFastAccept([], 29999)).toBe(true);
  });
  it('is false at exactly 30 s', () => {
    expect(isFastAccept([], 30000)).toBe(false);
  });
  it('is false under 30 s when evidence was opened', () => {
    expect(isFastAccept(OPEN, 1000)).toBe(false);
  });
  it('is false after 30 s with evidence', () => {
    expect(isFastAccept(OPEN, 60000)).toBe(false);
  });
});

describe('evaluateAutomation', () => {
  const INC = 'INC-2026-0417-03';
  const mk = (id: string, incidentId: string, analystDecision: DecisionRecord['analystDecision']): DecisionRecord =>
    ({ id, incidentId, analystDecision }) as DecisionRecord;
  const accepted = [mk('DEC-0001', INC, 'accept')];

  it('refuses a score below 85', () => {
    const r = evaluateAutomation({ score: 84, incidentId: INC, approvalDecisionId: 'DEC-0001', action, decisions: accepted });
    expect(r).toMatchObject({ allowed: false, code: 'score_below_threshold' });
  });
  it('refuses a NaN score', () => {
    const r = evaluateAutomation({ score: Number.NaN, incidentId: INC, approvalDecisionId: 'DEC-0001', action, decisions: accepted });
    expect(r).toMatchObject({ allowed: false, code: 'score_below_threshold' });
  });
  it('refuses without approval', () => {
    const r = evaluateAutomation({ score: 95, incidentId: INC, approvalDecisionId: null, action, decisions: accepted });
    expect(r).toMatchObject({ allowed: false, code: 'no_approval' });
  });
  it('refuses when there are no decisions at all', () => {
    const r = evaluateAutomation({ score: 95, incidentId: INC, approvalDecisionId: 'DEC-0001', action, decisions: [] });
    expect(r).toMatchObject({ allowed: false, code: 'approval_not_found' });
  });
  it('accepts with score >= 85 and a current accept for the incident', () => {
    const r = evaluateAutomation({ score: 85, incidentId: INC, approvalDecisionId: 'DEC-0001', action, decisions: accepted });
    expect(r.allowed).toBe(true);
  });
  it('refuses an action outside the catalog', () => {
    const r = evaluateAutomation({
      score: 99,
      incidentId: INC,
      approvalDecisionId: 'DEC-0001',
      action: { ...action, id: 'wipe_disk' },
      decisions: accepted,
    });
    expect(r).toMatchObject({ allowed: false, code: 'unknown_action' });
  });
  it('refuses an approval that is not an accept in the trail', async () => {
    const chain = await buildSeedChain();
    const diverge = chain.find((d) => d.analystDecision === 'diverge')!;
    const r = evaluateAutomation({
      score: 95,
      incidentId: diverge.incidentId,
      approvalDecisionId: diverge.id,
      action,
      decisions: chain,
    });
    expect(r).toMatchObject({ allowed: false, code: 'approval_not_accept' });
  });
  it('refuses an approval that belongs to another incident', () => {
    const r = evaluateAutomation({
      score: 95,
      incidentId: 'INC-2026-0417-01',
      approvalDecisionId: 'DEC-0001',
      action,
      decisions: accepted,
    });
    expect(r).toMatchObject({ allowed: false, code: 'approval_wrong_incident' });
  });
  it('refuses an approval revoked by a later diverge', () => {
    const trail = [mk('DEC-0001', INC, 'accept'), mk('DEC-0002', INC, 'diverge')];
    const r = evaluateAutomation({ score: 95, incidentId: INC, approvalDecisionId: 'DEC-0001', action, decisions: trail });
    expect(r).toMatchObject({ allowed: false, code: 'approval_superseded' });
  });
});

describe('findApprovalDecision', () => {
  const INC = 'INC-X';
  const mk = (id: string, incidentId: string, analystDecision: DecisionRecord['analystDecision']): DecisionRecord =>
    ({ id, incidentId, analystDecision }) as DecisionRecord;

  it('returns the latest decision when it is an accept', () => {
    const trail = [mk('DEC-1', INC, 'diverge'), mk('DEC-2', INC, 'accept')];
    expect(findApprovalDecision(trail, INC)?.id).toBe('DEC-2');
  });
  it('returns nothing when a later diverge or mark_wrong revoked the accept', () => {
    expect(findApprovalDecision([mk('DEC-1', INC, 'accept'), mk('DEC-2', INC, 'diverge')], INC)).toBeUndefined();
    expect(findApprovalDecision([mk('DEC-1', INC, 'accept'), mk('DEC-2', INC, 'mark_wrong')], INC)).toBeUndefined();
  });
  it('ignores decisions of other incidents', () => {
    const trail = [mk('DEC-1', INC, 'accept'), mk('DEC-2', 'INC-Y', 'mark_wrong')];
    expect(findApprovalDecision(trail, INC)?.id).toBe('DEC-1');
    expect(findApprovalDecision(trail, 'INC-Z')).toBeUndefined();
  });
});

describe('scanForPII', () => {
  it('detects CPF, e-mail and private IP', () => {
    const types = scanForPII('cpf 529.982.247-25 mail joao@empresa.com.br host 10.0.1.45').map((f) => f.type);
    expect(types).toEqual(expect.arrayContaining(['cpf', 'email', 'private_ip']));
  });
  it('passes a tokenized payload', () => {
    expect(scanForPII('User <USER_1> logged on from <IP_INT_1> to <HOST_1>, public 8.8.8.8')).toEqual([]);
  });
});

describe('PII fitness function', () => {
  it('no mock llmReceivedPayload contains PII', () => {
    const payloads = MOCK_ANALYSES.filter((a) => a.llmReceivedPayload !== null);
    expect(payloads.length).toBeGreaterThan(0);
    for (const a of payloads) {
      expect(scanForPII(a.llmReceivedPayload as string), `incident ${a.incidentId}`).toEqual([]);
    }
  });
});

describe('queue order', () => {
  it('moves the KEV incident above higher severity or score', () => {
    const sorted = sortQueue(MOCK_INCIDENTS, MOCK_ANALYSES);
    const kev = MOCK_INCIDENTS.filter((i) => i.cve?.inKev);
    expect(kev.length).toBeGreaterThan(0);
    expect(sorted[0].id).toBe(SCENARIO_IDS.KEV);
    const firstNonKev = sorted.findIndex((i) => !i.cve?.inKev);
    expect(sorted.slice(firstNonKev).some((i) => i.cve?.inKev)).toBe(false);
  });
});

describe('governance metrics', () => {
  it('aggregates without any per-analyst key', async () => {
    const decisions = await buildSeedChain();
    const m = computeGovernanceMetrics({ decisions, analyses: MOCK_ANALYSES, golden: GOLDEN_DATASET });
    expect(m.decisionCount).toBe(decisions.length);
    expect(Object.keys(m).some((k) => /analyst/i.test(k))).toBe(false);
    expect(JSON.stringify(m)).not.toMatch(/Ana Silva/);
  });
});

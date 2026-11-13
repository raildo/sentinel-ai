// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MOCK_ANALYSES, MOCK_INCIDENTS, getIncident } from '../constants';
import type { Claim } from '../types';

type SchemaProp = { type?: string; pattern?: string; minLength?: number; maxLength?: number; maxItems?: number; minItems?: number };
type Schema = {
  properties: { claims: { maxItems: number; items: { required: string[]; properties: Record<string, SchemaProp> } } };
};

const schema = JSON.parse(
  readFileSync(new URL('../../prompts/explainer/schema.json', import.meta.url), 'utf8'),
) as Schema;
const claimSchema = schema.properties.claims.items;

describe('real values never reach the LLM payload', () => {
  for (const incident of MOCK_INCIDENTS) {
    const analysis = MOCK_ANALYSES.find((a) => a.incidentId === incident.id);
    it(`${incident.id}: host and user are absent from llmReceivedPayload`, () => {
      expect(analysis).toBeDefined();
      const payload = analysis?.llmReceivedPayload;
      if (payload === null || payload === undefined) return; // degraded: no LLM call
      expect(payload).not.toContain(incident.host);
      if (incident.user) expect(payload).not.toContain(incident.user);
    });
  }
});

describe('MOCK_ANALYSES claims follow prompts/explainer/schema.json', () => {
  const idPattern = new RegExp(claimSchema.properties.id.pattern as string);
  const maxText = claimSchema.properties.text.maxLength as number;
  const maxClaims = schema.properties.claims.maxItems;

  for (const analysis of MOCK_ANALYSES) {
    it(`${analysis.incidentId}: claims are schema-valid`, () => {
      const incident = getIncident(analysis.incidentId);
      expect(incident).toBeDefined();
      const evidenceIds = new Set(incident?.evidence.map((e) => e.id));
      expect(analysis.claims.length).toBeLessThanOrEqual(maxClaims);
      const ids = analysis.claims.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const claim of analysis.claims) {
        expect(claim.id, 'claim id pattern').toMatch(idPattern);
        expect(claim.text.length).toBeGreaterThanOrEqual(1);
        expect(claim.text.length).toBeLessThanOrEqual(maxText);
        expect(claim.evidenceIds.length).toBeGreaterThanOrEqual(1);
        expect(new Set(claim.evidenceIds).size).toBe(claim.evidenceIds.length);
        for (const evId of claim.evidenceIds) {
          expect(evidenceIds.has(evId), `${claim.id} cites unknown evidence ${evId}`).toBe(true);
        }
      }
    });
  }

  it('schema claim keys match the Claim type, except validator-only fields', () => {
    // Fields that exist only on the TS type: set by the output validator, never by the LLM.
    const typeOnly = ['discarded', 'discardReason'];
    // Compile-time guard: if Claim gains or loses a key this record stops type-checking.
    const claimKeys: Record<keyof Claim, true> = { id: true, text: true, evidenceIds: true, discarded: true, discardReason: true };
    const typeKeys = Object.keys(claimKeys).sort();
    const schemaKeys = Object.keys(claimSchema.properties).sort();
    expect(typeKeys.filter((k) => !typeOnly.includes(k))).toEqual(schemaKeys);
    expect(claimSchema.required.every((k) => schemaKeys.includes(k))).toBe(true);
    for (const k of typeOnly) expect(schemaKeys).not.toContain(k);
  });
});

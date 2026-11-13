import type { Analysis, DecisionRecord, Incident } from '../../types';
import { canonicalize, sha256Hex } from '../../domain/hash';

export type CloudEvent = {
  specversion: '1.0';
  id: string;
  source: string;
  type: string;
  time: string;
  datacontenttype: 'application/json';
  subject: string;
  data: Record<string, unknown>;
};

export type SignedCloudEvent = {
  event: CloudEvent;
  /** Simulated signature: SHA-256 of the canonical event. Not a real HMAC or key-based signature. */
  signature: { alg: 'sha256-simulated'; value: string };
};

/** Builds the case payload. Real host and account names are intentionally left out. */
export function buildCloudEvent(
  incident: Incident,
  analysis: Analysis | undefined,
  decision: DecisionRecord | undefined,
  nowIso: string,
): CloudEvent {
  return {
    specversion: '1.0',
    id: `evt-${incident.id}-${decision?.id ?? 'no-decision'}`,
    source: `/secureai/${incident.tenantId}`,
    type: 'ai.secureai.case.handoff.v1',
    time: nowIso,
    datacontenttype: 'application/json',
    subject: incident.id,
    data: {
      tenantId: incident.tenantId,
      incidentId: incident.id,
      title: incident.title,
      severity: decision?.finalSeverity ?? incident.severity,
      ocsfClass: incident.ocsfClass,
      score: analysis?.score ?? null,
      band: analysis?.band ?? null,
      techniqueId: decision?.finalTechniqueId ?? analysis?.techniquesTop3[0]?.technique.id ?? null,
      evidenceIds: analysis?.evidenceIds ?? incident.evidence.map((e) => e.id),
      decision: decision
        ? {
            id: decision.id,
            outcome: decision.analystDecision,
            decidedAt: decision.decidedAt,
            recordHash: decision.hash,
          }
        : null,
      degraded: analysis?.degraded ?? false,
    },
  };
}

export async function signEvent(event: CloudEvent): Promise<SignedCloudEvent> {
  const value = await sha256Hex(canonicalize(event));
  return { event, signature: { alg: 'sha256-simulated', value } };
}

export function downloadJson(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

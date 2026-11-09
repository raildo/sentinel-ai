import type { Incident } from '../types';
import { scanForPII, scrubPII } from './pii';

/** Replaces real values by tokens (longest value first), then scrubs anything left. */
export function pseudonymize(text: string, tokenMap: Record<string, string>): string {
  let out = text;
  const entries = Object.entries(tokenMap).sort((a, b) => b[1].length - a[1].length);
  for (const [token, real] of entries) {
    if (real) out = out.split(real).join(token);
  }
  return scrubPII(out);
}

/**
 * Builds the exact payload sent to the LLM gateway. Throws if PII survives pseudonymization.
 */
export function buildLlmPayload(
  incident: Incident,
  tokenMap: Record<string, string>,
  promptVersion: string,
): string {
  const untrustedFields = Array.from(
    new Set(incident.evidence.map((e) => e.untrustedField).filter((f): f is string => !!f)),
  );
  const payload = {
    prompt_version: promptVersion,
    incident: {
      ocsf_class: incident.ocsfClass.name,
      severity: incident.severity,
      source: incident.source,
      host: pseudonymize(incident.host, tokenMap),
      account: incident.user ? pseudonymize(incident.user, tokenMap) : undefined,
      cve: incident.cve?.id,
    },
    evidence: incident.evidence.map((e) => ({
      id: e.id,
      source: e.source,
      event: pseudonymize(e.event, tokenMap),
      details: pseudonymize(e.details, tokenMap),
      untrusted: e.untrustedField ? true : undefined,
    })),
    untrusted_fields: untrustedFields.length ? untrustedFields : undefined,
  };
  const text = JSON.stringify(payload, null, 2);
  const leaks = scanForPII(text);
  if (leaks.length > 0) {
    throw new Error(`PII leaked into LLM payload: ${leaks.map((l) => l.type).join(', ')}`);
  }
  return text;
}

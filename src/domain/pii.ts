// Pure PII detection used to guard the payload sent to the LLM gateway.

export type PIIType = 'cpf' | 'email' | 'private_ip';

export type PIIFinding = {
  type: PIIType;
  match: string;
  index: number;
};

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;
const IPV4_RE = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const CPF_RE = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;

export function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) return false;
  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  );
}

export function isValidCpf(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(digits[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9) === Number(digits[9]) && calc(10) === Number(digits[10]);
}

/** Detects CPF, e-mail and private IPv4 addresses in a text payload. */
export function scanForPII(payload: string): PIIFinding[] {
  const findings: PIIFinding[] = [];
  for (const m of payload.matchAll(EMAIL_RE)) {
    findings.push({ type: 'email', match: m[0], index: m.index ?? 0 });
  }
  for (const m of payload.matchAll(IPV4_RE)) {
    if (isPrivateIPv4(m[0])) findings.push({ type: 'private_ip', match: m[0], index: m.index ?? 0 });
  }
  for (const m of payload.matchAll(CPF_RE)) {
    if (isValidCpf(m[0])) findings.push({ type: 'cpf', match: m[0], index: m.index ?? 0 });
  }
  return findings.sort((a, b) => a.index - b.index);
}

/** Last line of defence: replaces any leftover PII with a generic redaction token. */
export function scrubPII(text: string): string {
  let out = text.replace(EMAIL_RE, '<EMAIL_REDACTED>');
  out = out.replace(IPV4_RE, (ip) => (isPrivateIPv4(ip) ? '<IP_INT_REDACTED>' : ip));
  out = out.replace(CPF_RE, (v) => (isValidCpf(v) ? '<CPF_REDACTED>' : v));
  return out;
}

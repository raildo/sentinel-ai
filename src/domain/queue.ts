import type { Analysis, DecisionRecord, Incident, Severity, WorkflowStatus } from '../types';

export const SEVERITY_RANK: Record<Severity, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };

export function isKev(incident: Incident): boolean {
  return incident.cve?.inKev === true;
}

/** Priority: CISA KEV first, then severity, then score, then most recent. */
export function sortQueue(incidents: readonly Incident[], analyses: readonly Analysis[]): Incident[] {
  const score = new Map(analyses.map((a) => [a.incidentId, a.score]));
  return [...incidents].sort((a, b) => {
    const kev = Number(isKev(b)) - Number(isKev(a));
    if (kev !== 0) return kev;
    const sev = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    if (sev !== 0) return sev;
    const sc = (score.get(b.id) ?? 0) - (score.get(a.id) ?? 0);
    if (sc !== 0) return sc;
    return Date.parse(b.timestamp) - Date.parse(a.timestamp);
  });
}

export function effectiveWorkflowStatus(
  incident: Incident,
  decisions: readonly DecisionRecord[],
  handedOffIds: readonly string[] = [],
): WorkflowStatus {
  if (handedOffIds.includes(incident.id)) return 'handed_off';
  if (decisions.some((d) => d.incidentId === incident.id)) return 'decided';
  return incident.workflowStatus;
}

export type QueueCounts = {
  total: number;
  /** not decided and not handed off */
  open: number;
  bySeverity: Record<Severity, number>;
  byStatus: Record<WorkflowStatus, number>;
  kevOpen: number;
  degradedOpen: number;
};

export function queueCounts(
  incidents: readonly Incident[],
  decisions: readonly DecisionRecord[],
  handedOffIds: readonly string[] = [],
  analyses: readonly Analysis[] = [],
): QueueCounts {
  const bySeverity: Record<Severity, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  const byStatus: Record<WorkflowStatus, number> = { new: 0, in_review: 0, decided: 0, handed_off: 0 };
  const degradedIds = new Set(analyses.filter((a) => a.degraded).map((a) => a.incidentId));
  let open = 0;
  let kevOpen = 0;
  let degradedOpen = 0;
  for (const inc of incidents) {
    const status = effectiveWorkflowStatus(inc, decisions, handedOffIds);
    byStatus[status] += 1;
    if (status === 'new' || status === 'in_review') {
      open += 1;
      bySeverity[inc.severity] += 1;
      if (isKev(inc)) kevOpen += 1;
      if (degradedIds.has(inc.id)) degradedOpen += 1;
    }
  }
  return { total: incidents.length, open, bySeverity, byStatus, kevOpen, degradedOpen };
}

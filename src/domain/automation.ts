import type { AutomationAction, AutomationEvaluation, DecisionRecord } from '../types';
import { AUTOMATION_CATALOG, AUTOMATION_THRESHOLD } from '../constants';

export type EvaluateAutomationInput = {
  score: number;
  incidentId: string;
  approvalDecisionId: string | null | undefined;
  action: AutomationAction;
  /** The audit trail. The approval must exist here, belong to the incident and be its current accept. */
  decisions: readonly DecisionRecord[];
};

/** Most recent decision for the incident (the trail is oldest first). */
function latestDecision(decisions: readonly DecisionRecord[], incidentId: string): DecisionRecord | undefined {
  for (let i = decisions.length - 1; i >= 0; i--) {
    if (decisions[i].incidentId === incidentId) return decisions[i];
  }
  return undefined;
}

/** Preview-phase gate (ADR-009, LLM06): refuses unless score >= threshold and the current decision accepts it. */
export function evaluateAutomation(input: EvaluateAutomationInput): AutomationEvaluation {
  const { score, incidentId, approvalDecisionId, action, decisions } = input;
  const inCatalog = AUTOMATION_CATALOG.some((a) => a.id === action.id && a.reversible);
  if (!inCatalog) {
    return { allowed: false, code: 'unknown_action', reason: 'Action is not in the catalog of reversible actions.' };
  }
  const threshold = Math.max(action.threshold, AUTOMATION_THRESHOLD);
  // Negated comparison so that NaN is refused too.
  if (!(Number.isFinite(score) && score >= threshold)) {
    return {
      allowed: false,
      code: 'score_below_threshold',
      reason: Number.isFinite(score)
        ? `Refused: score ${score} is below the ${threshold} threshold.`
        : `Refused: score is not a valid number (threshold ${threshold}).`,
    };
  }
  if (!approvalDecisionId) {
    return { allowed: false, code: 'no_approval', reason: 'Refused: no analyst approval recorded for this case.' };
  }
  const decision = decisions.find((d) => d.id === approvalDecisionId);
  if (!decision) {
    return { allowed: false, code: 'approval_not_found', reason: `Refused: decision ${approvalDecisionId} not found in the trail.` };
  }
  if (decision.incidentId !== incidentId) {
    return {
      allowed: false,
      code: 'approval_wrong_incident',
      reason: `Refused: decision ${approvalDecisionId} belongs to another incident.`,
    };
  }
  if (decision.analystDecision !== 'accept') {
    return { allowed: false, code: 'approval_not_accept', reason: `Refused: decision ${approvalDecisionId} did not accept the recommendation.` };
  }
  if (latestDecision(decisions, incidentId)?.id !== decision.id) {
    return {
      allowed: false,
      code: 'approval_superseded',
      reason: `Refused: decision ${approvalDecisionId} was superseded by a later decision on this case.`,
    };
  }
  return {
    allowed: true,
    reason: `Preview allowed: score ${score} >= ${threshold}, approved by ${approvalDecisionId}. Rollback: ${action.rollback}`,
  };
}

/** Current approval for the incident: its most recent decision, only if that decision is an accept. */
export function findApprovalDecision(decisions: readonly DecisionRecord[], incidentId: string): DecisionRecord | undefined {
  const latest = latestDecision(decisions, incidentId);
  return latest?.analystDecision === 'accept' ? latest : undefined;
}

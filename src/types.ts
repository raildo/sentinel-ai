// Pure domain types. No React imports here.

// ---------------------------------------------------------------------------
// MITRE ATT&CK
// ---------------------------------------------------------------------------

export type MITRETactic =
  | 'Initial Access'
  | 'Execution'
  | 'Persistence'
  | 'Privilege Escalation'
  | 'Defense Evasion'
  | 'Credential Access'
  | 'Discovery'
  | 'Lateral Movement'
  | 'Collection'
  | 'Command and Control'
  | 'Exfiltration'
  | 'Impact';

export type MITRETechnique = {
  id: string;
  name: string;
  tactic: MITRETactic;
};

export type RankedTechnique = {
  technique: MITRETechnique;
  /** 0..1 */
  probability: number;
};

// ---------------------------------------------------------------------------
// Incident (what the SIEM raised)
// ---------------------------------------------------------------------------

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type IncidentSource = 'Sentinel' | 'Splunk';
/** Base status of the case. "decided" and "handed_off" are derived at runtime, see effectiveWorkflowStatus. */
export type WorkflowStatus = 'new' | 'in_review' | 'decided' | 'handed_off';

export type OcsfClass = {
  uid: number;
  name: string;
};

export type Evidence = {
  /** Stable id, referenced by claims (e.g. "ev-1"). */
  id: string;
  /** HH:mm:ss display time */
  timestamp: string;
  source: string;
  event: string;
  /** 0-100 */
  relevance: number;
  /** Real value as the analyst sees it. Never sent to the LLM as is. */
  details: string;
  /** Name of an attacker-controlled field present in this evidence (e.g. "username"). */
  untrustedField?: string;
};

export type CveInfo = {
  id: string;
  inKev: boolean;
  /** ISO date the CVE was added to the CISA KEV catalog */
  kevDateAdded?: string;
};

export type Incident = {
  id: string;
  tenantId: string;
  /** ISO detection time */
  timestamp: string;
  title: string;
  /** Formerly called "status" */
  severity: Severity;
  workflowStatus: WorkflowStatus;
  source: IncidentSource;
  ocsfClass: OcsfClass;
  /** Real host name (analyst view only) */
  host: string;
  /** Real account involved, if any (analyst view only) */
  user?: string;
  summary: string;
  evidence: Evidence[];
  cve?: CveInfo;
};

// ---------------------------------------------------------------------------
// Analysis (what the platform computed). Mirrors prompts/explainer/schema.json for claims.
// ---------------------------------------------------------------------------

export type Claim = {
  id: string;
  text: string;
  /** Evidence ids that support the claim. Must exist in the incident. */
  evidenceIds: string[];
  /** Set by the output validator, never by the LLM. */
  discarded?: boolean;
  discardReason?: string;
};

export type ScoreBand = {
  low: number;
  high: number;
};

export type ValidationSummary = {
  discardedClaims: number;
  injectionSuspected: boolean;
  scoreBefore: number;
  scoreAfter: number;
};

export type Analysis = {
  incidentId: string;
  /** 0-100, calibrated, produced by the score model (never by the LLM) */
  score: number;
  band: ScoreBand;
  /** e.g. "score-model v0.3" */
  scoreModelVersion: string;
  /** e.g. "explainer-v1". null when no LLM call happened (degraded). */
  promptVersion: string | null;
  techniquesTop3: RankedTechnique[];
  evidenceIds: string[];
  claims: Claim[];
  /** Evidence the technique would normally produce but was not found */
  expectedEvidenceMissing: string[];
  degraded: boolean;
  degradedReason?: string;
  validation: ValidationSummary;
  /** Suggested next step shown as the AI recommendation */
  recommendedAction: string;
  /** Exact text sent to the LLM gateway (pseudonymized). null when no call happened. */
  llmReceivedPayload: string | null;
  /** token -> real value. Analyst view only, never sent to the LLM. */
  tokenMap: Record<string, string>;
  /** LLM cost for this incident in USD */
  llmCostUsd: number;
};

// ---------------------------------------------------------------------------
// Decision trail
// ---------------------------------------------------------------------------

export type AnalystDecision = 'accept' | 'diverge' | 'mark_wrong';

export type EvidenceOpen = {
  evidenceId: string;
  /** ISO timestamp (demo clock) */
  openedAt: string;
};

export type DecisionFeedback = {
  /** null means not answered */
  techniqueCorrect: boolean | null;
  severityCorrect: boolean | null;
};

export type Recommendation = {
  topTechniqueId: string;
  severity: Severity;
  score: number;
  band: ScoreBand;
  suggestedAction: string;
};

export type AnchorStatus = 'anchored' | 'pending';

export type DecisionRecord = {
  /** e.g. "DEC-0003". Used as approval id by the automation preview. */
  id: string;
  index: number;
  tenantId: string;
  incidentId: string;
  incidentTitle: string;
  analyst: string;
  detectedAt: string;
  decidedAt: string;
  recommendation: Recommendation;
  analystDecision: AnalystDecision;
  finalTechniqueId?: string;
  finalSeverity?: Severity;
  /** Mandatory for diverge and mark_wrong */
  justification?: string;
  feedback: DecisionFeedback;
  evidenceOpened: EvidenceOpen[];
  /** From opening the case to deciding */
  timeToDecisionMs: number;
  /** accept in under 30 s with no evidence opened */
  fastAccept: boolean;
  versions: { scoreModel: string; prompt: string | null };
  degraded: boolean;
  prevHash: string;
  hash: string;
  /** Simulated S3 Object Lock anchor. Not part of the hash. */
  anchorStatus: AnchorStatus;
  anchorRef?: string;
};

export type DecisionDraft = Omit<
  DecisionRecord,
  'id' | 'index' | 'prevHash' | 'hash' | 'anchorStatus' | 'anchorRef'
>;

export type ChainVerification = {
  valid: boolean;
  /** Index of the first broken record, null when valid */
  brokenAtIndex: number | null;
  reason?: 'hash_mismatch' | 'prev_hash_mismatch';
};

// ---------------------------------------------------------------------------
// Automation (preview phase, ADR-009)
// ---------------------------------------------------------------------------

export type AutomationAction = {
  id: string;
  name: string;
  description: string;
  reversible: true;
  rollback: string;
  /** Minimum score (0-100) to even preview the action */
  threshold: number;
};

export type AutomationRefusalCode =
  | 'unknown_action'
  | 'score_below_threshold'
  | 'no_approval'
  | 'approval_not_found'
  | 'approval_not_accept'
  | 'approval_wrong_incident'
  | 'approval_superseded';

export type AutomationEvaluation = {
  allowed: boolean;
  code?: AutomationRefusalCode;
  reason: string;
};

// ---------------------------------------------------------------------------
// Governance metrics (section 3.3). Always aggregated, never per analyst.
// ---------------------------------------------------------------------------

export type GoldenSample = {
  id: string;
  /** Predicted score 0-100 */
  score: number;
  /** 1 if the case was truly malicious according to the golden label */
  outcome: 0 | 1;
  /** Whether the true technique was in the predicted top-3 */
  truthInTop3: boolean;
  claimsTotal: number;
  claimsSupported: number;
};

export type GovernanceMetrics = {
  /** Mean time from detection to analyst decision, in minutes. null without decisions */
  mttrMinutes: number | null;
  acceptanceRate: number | null;
  divergenceRate: number | null;
  markedWrongRate: number | null;
  /** fast accepts / accepts */
  fastAcceptRate: number | null;
  /** Expected calibration error, 0..1 (lower is better) */
  ece: number | null;
  top3Accuracy: number | null;
  groundedness: number | null;
  degradedRate: number | null;
  costPerIncidentUsd: number | null;
  decisionCount: number;
  goldenSampleSize: number;
  datasetLabel: string;
};

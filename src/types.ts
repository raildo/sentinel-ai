
export type MITRETechnique = {
  id: string;
  name: string;
  tactic: 'Initial Access' | 'Execution' | 'Persistence' | 'Privilege Escalation' | 'Defense Evasion' | 'Credential Access' | 'Discovery' | 'Lateral Movement' | 'Collection' | 'Command and Control' | 'Exfiltration' | 'Impact';
};

export type Evidence = {
  id: string;
  timestamp: string;
  source: string;
  event: string;
  relevance: number; // 0-100
  details: string;
};

export type Incident = {
  id: string;
  timestamp: string;
  title: string;
  status: 'Critical' | 'High' | 'Medium' | 'Low';
  confidenceScore: number;
  techniques: MITRETechnique[];
  summary: string;
  reasoning: string;
  evidence: Evidence[];
  assignedTo?: string;
};

export type AuditLog = {
  id: string;
  timestamp: string;
  analyst: string;
  action: string;
  incidentId: string;
  logic: string;
  status: 'Validated' | 'Pending' | 'Flagged';
};

export type Metric = {
  label: string;
  value: string | number;
  trend: number; // percentage
};

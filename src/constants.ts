import { Incident, MITRETechnique, AuditLog, Evidence } from './types';

export const TECHNIQUES: Record<string, MITRETechnique> = {
  T1059: { id: 'T1059', name: 'Command and Scripting Interpreter', tactic: 'Execution' },
  T1071: { id: 'T1071', name: 'Application Layer Protocol', tactic: 'Command and Control' },
  T1021: { id: 'T1021', name: 'Remote Services', tactic: 'Lateral Movement' },
  T1003: { id: 'T1003', name: 'OS Credential Dumping', tactic: 'Credential Access' },
};

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-0417-01',
    timestamp: '2026-04-17T11:45:00Z',
    title: 'Suspicious PowerShell Execution via WMI',
    status: 'Critical',
    confidenceScore: 88,
    techniques: [TECHNIQUES.T1059, TECHNIQUES.T1021],
    summary: 'Detected anomalous WMI activity spawning base64 encoded PowerShell commands on DC-01.',
    reasoning: 'The combination of WMI invocation from a non-standard service account followed by an obfuscated PowerShell execution is high-probability evidence of lateral movement attempts.',
    evidence: [
      { id: 'ev-1', timestamp: '11:45:01', source: 'Sysmon', event: 'Process Creation (ID 1)', relevance: 95, details: 'powershell.exe -enc JABzAD0ATg...' },
      { id: 'ev-2', timestamp: '11:44:58', source: 'Windows Security', event: 'Logon (ID 4624)', relevance: 70, details: 'Source Network Address: 10.0.1.45' },
      { id: 'ev-3', timestamp: '11:44:50', source: 'EDR-Agent', event: 'WMI Query', relevance: 85, details: 'Target: Win32_Process via Remote Registry' },
    ],
  },
  {
    id: 'INC-2026-0417-02',
    timestamp: '2026-04-17T10:30:00Z',
    title: 'Outbound DNS Tunneling Attempt',
    status: 'High',
    confidenceScore: 72,
    techniques: [TECHNIQUES.T1071],
    summary: 'High volume of sub-domain queries matching DGA patterns detected on workstation WS-512.',
    reasoning: 'Entropy of sub-domains exceeds threshold 4.5. Queries are being sent to a newly registered TLD in Russia.',
    evidence: [
      { id: 'ev-4', timestamp: '10:30:05', source: 'DNS Logs', event: 'Query Rate Threshold Exceeded', relevance: 90, details: '500 queries/sec to .ru domains' },
      { id: 'ev-5', timestamp: '10:29:55', source: 'Network Proxy', event: 'Non-Standard Port detected', relevance: 40, details: 'UDP Port 53 outbound bypass' },
    ],
  },
  {
    id: 'INC-2026-0417-03',
    timestamp: '2026-04-17T09:15:00Z',
    title: 'LSASS Memory Dump Detected',
    status: 'Critical',
    confidenceScore: 94,
    techniques: [TECHNIQUES.T1003],
    summary: 'A process mimicking svchost.exe attempted to read LSASS.exe memory.',
    reasoning: 'lsass.exe memory access from an unsigned binary in AppData/Local is a textbook credential dumping indicator.',
    evidence: [
      { id: 'ev-6', timestamp: '09:15:02', source: 'Windows Defender', event: 'Threat Blocked', relevance: 100, details: 'HackTool:Win32/Mimikatz.A' },
      { id: 'ev-7', timestamp: '09:15:00', source: 'Sysmon', event: 'Process Access (ID 10)', relevance: 95, details: 'Source: temp_svchost.exe, Target: lsass.exe' },
    ],
  },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-001',
    timestamp: '2026-04-17T11:50:00Z',
    analyst: 'Ana Silva',
    action: 'Host Isolated: DC-01',
    incidentId: 'INC-2026-0417-01',
    logic: 'Verified WMI persistence, isolation required to stop propogation.',
    status: 'Validated',
  },
  {
    id: 'AUD-002',
    timestamp: '2026-04-17T12:00:00Z',
    analyst: 'Ana Silva',
    action: 'Blocked IP: 185.122.45.10',
    incidentId: 'INC-2026-0417-02',
    logic: 'Confirmed C2 infrastructure based on DGA patterns.',
    status: 'Pending',
  },
];

import React, { useMemo, useState } from 'react';
import { Search, Filter, ShieldAlert } from 'lucide-react';
import { Card, Badge, Button, type BadgeVariant } from './UI';
import { MOCK_INCIDENTS, MOCK_ANALYSES } from '../constants';
import { motion } from 'motion/react';
import { useDecisionStore } from '../state/DecisionStore';
import { sortQueue, queueCounts, effectiveWorkflowStatus, isKev } from '../domain/queue';
import { computeGovernanceMetrics } from '../domain/metrics';
import { cn } from '../lib/utils';
import type { Analysis, Incident, Severity, WorkflowStatus } from '../types';

const SEVERITY_BADGE: Record<Severity, BadgeVariant> = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
  Low: 'low',
};

const STATUS_LABEL: Record<WorkflowStatus, string> = {
  new: 'New',
  in_review: 'In review',
  decided: 'Decided',
  handed_off: 'Handed off',
};

const SEVERITIES: Severity[] = ['Critical', 'High', 'Medium', 'Low'];

function formatMinutes(minutes: number | null): string {
  if (minutes === null) return '--';
  const totalSeconds = Math.round(minutes * 60);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

const analysisFor = (analyses: readonly Analysis[], id: string): Analysis | undefined =>
  analyses.find((a) => a.incidentId === id);

export const TriageInbox = ({ onSelectIncident }: { onSelectIncident: (id: string) => void }) => {
  const { decisions, handedOffIds } = useDecisionStore();
  const [query, setQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const sorted = useMemo(() => sortQueue(MOCK_INCIDENTS, MOCK_ANALYSES), []);
  const counts = useMemo(
    () => queueCounts(MOCK_INCIDENTS, decisions, handedOffIds, MOCK_ANALYSES),
    [decisions, handedOffIds],
  );
  const metrics = useMemo(
    () => computeGovernanceMetrics({ decisions, analyses: MOCK_ANALYSES, golden: [] }),
    [decisions],
  );

  const openAnalyses = useMemo(
    () =>
      MOCK_INCIDENTS.filter((i) => {
        const st = effectiveWorkflowStatus(i, decisions, handedOffIds);
        return st === 'new' || st === 'in_review';
      })
        .map((i) => analysisFor(MOCK_ANALYSES, i.id))
        .filter((a): a is Analysis => a !== undefined),
    [decisions, handedOffIds],
  );
  const avgScore = openAnalyses.length
    ? Math.round(openAnalyses.reduce((acc, a) => acc + a.score, 0) / openAnalyses.length)
    : null;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((inc: Incident) => {
      if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
      if (!q) return true;
      const techniques = analysisFor(MOCK_ANALYSES, inc.id)?.techniquesTop3 ?? [];
      const haystack = [
        inc.id,
        inc.title,
        inc.host,
        inc.user ?? '',
        inc.source,
        inc.cve?.id ?? '',
        ...techniques.flatMap((t) => [t.technique.id, t.technique.name]),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [sorted, query, severityFilter]);

  const criticalOpen = counts.bySeverity.Critical;

  return (
    <div className="flex-1 overflow-y-auto bg-bg p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Triage Inbox</h1>
          <p className="text-text-secondary mt-1 text-sm">
            You have <span className="text-danger font-medium">{criticalOpen} critical</span> open{' '}
            {criticalOpen === 1 ? 'incident' : 'incidents'} requiring attention.
          </p>
        </div>
        <div className="flex gap-3 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search id, host, CVE, technique..."
              aria-label="Search incidents"
              className="bg-surface border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent transition-all w-64"
            />
          </div>
          <Button
            variant="secondary"
            className={cn('px-3 h-8', severityFilter !== 'all' && 'border-accent text-accent')}
            aria-label="Filter by severity"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen((o) => !o)}
          >
            <Filter size={14} />
            {severityFilter !== 'all' && <span className="text-xs">{severityFilter}</span>}
          </Button>
          {filterOpen && (
            <div className="absolute right-0 top-10 z-10 w-40 rounded-lg border border-border bg-surface shadow-lg py-1">
              {(['all', ...SEVERITIES] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSeverityFilter(s);
                    setFilterOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-1.5 text-xs hover:bg-bg',
                    severityFilter === s ? 'text-accent' : 'text-text-primary',
                  )}
                >
                  {s === 'all' ? 'All severities' : s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <Card className="bg-surface border-border">
          <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase mb-2">Critical Open</p>
          <p className="text-3xl font-extrabold text-danger tracking-tighter">{String(criticalOpen).padStart(2, '0')}</p>
        </Card>
        <Card className="bg-surface border-border">
          <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase mb-2">Avg MTTR</p>
          <p className="text-3xl font-extrabold text-text-primary tracking-tighter">{formatMinutes(metrics.mttrMinutes)}</p>
          <p className="text-[10px] text-text-secondary mt-1">{metrics.decisionCount} decisions</p>
        </Card>
        <Card className="bg-surface border-border">
          <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase mb-2">Avg Score (open)</p>
          <p className="text-3xl font-extrabold text-text-primary tracking-tighter">{avgScore === null ? '--' : `${avgScore}%`}</p>
        </Card>
        <Card className="bg-surface border-border">
          <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase mb-2">Pending Review</p>
          <p className="text-3xl font-extrabold text-text-primary tracking-tighter">{counts.open}</p>
          {counts.kevOpen > 0 && <p className="text-[10px] text-danger mt-1">{counts.kevOpen} in CISA KEV</p>}
        </Card>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-bg/50">
              <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-text-secondary">Incident</th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-text-secondary">Severity</th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-text-secondary">Source</th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-text-secondary">MITRE Top 3</th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-text-secondary text-center">Score</th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-text-secondary">Status</th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-text-secondary">Detected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-text-secondary">
                  No incidents match the current search or filter.
                </td>
              </tr>
            )}
            {visible.map((incident) => {
              const analysis = analysisFor(MOCK_ANALYSES, incident.id);
              const status = effectiveWorkflowStatus(incident, decisions, handedOffIds);
              return (
                <motion.tr
                  key={incident.id}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                  className="group cursor-pointer transition-colors"
                  onClick={() => onSelectIncident(incident.id)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-accent font-bold tracking-tighter">{incident.id}</span>
                      {isKev(incident) && (
                        <Badge variant="critical" title={`${incident.cve?.id ?? 'CVE'} is in the CISA KEV catalog`}>
                          <ShieldAlert size={10} className="inline mr-1 -mt-0.5" />
                          KEV
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-text-primary mt-1 group-hover:text-accent transition-colors">{incident.title}</p>
                  </td>
                  <td className="p-4">
                    <Badge variant={SEVERITY_BADGE[incident.severity]}>{incident.severity}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant="default">{incident.source}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {(analysis?.techniquesTop3 ?? []).slice(0, 3).map((t) => (
                        <div key={t.technique.id} className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-text-secondary/5 border border-text-secondary/10 text-[10px] font-mono text-text-secondary">
                            {t.technique.id}
                          </span>
                          <span className="text-xs text-text-primary">{t.technique.name}</span>
                          <span className="text-[10px] font-mono text-text-secondary">{Math.round(t.probability * 100)}%</span>
                        </div>
                      ))}
                      {!analysis && <span className="text-xs text-text-secondary">No analysis</span>}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-sm font-bold text-text-primary">{analysis ? analysis.score : '--'}</span>
                    {analysis?.degraded && <p className="text-[9px] text-warning font-mono uppercase">degraded</p>}
                  </td>
                  <td className="p-4">
                    <Badge variant={status === 'decided' || status === 'handed_off' ? 'success' : 'default'}>
                      {STATUS_LABEL[status]}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-text-secondary font-mono">
                      {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

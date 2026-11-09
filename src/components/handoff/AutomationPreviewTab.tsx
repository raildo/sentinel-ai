import { useState } from 'react';
import { RefreshCcw, ShieldCheck, ShieldX } from 'lucide-react';
import { Card, Badge, Button } from '../UI';
import { AUTOMATION_CATALOG, AUTOMATION_THRESHOLD, getAnalysis } from '../../constants';
import { evaluateAutomation, findApprovalDecision } from '../../domain/automation';
import { useDecisionStore } from '../../state';
import type { AutomationEvaluation } from '../../types';

export const AutomationPreviewTab = ({ incidentId }: { incidentId: string }) => {
  const { decisions } = useDecisionStore();
  const analysis = getAnalysis(incidentId);
  const score = analysis?.score ?? 0;
  const approval = findApprovalDecision(decisions, incidentId);
  const [results, setResults] = useState<Record<string, AutomationEvaluation>>({});

  const simulate = (actionId: string) => {
    const action = AUTOMATION_CATALOG.find((a) => a.id === actionId);
    if (!action) return;
    const result = evaluateAutomation({
      score,
      incidentId,
      approvalDecisionId: approval?.id ?? null,
      action,
      decisions,
    });
    setResults((prev) => ({ ...prev, [actionId]: result }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="medium">Preview / simulation</Badge>
          <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary">Automation phase</h3>
        </div>
        <p className="text-sm text-text-secondary mt-2">
          Nothing is executed. Each action is gated by a score of at least {AUTOMATION_THRESHOLD}% and an analyst approval
          recorded in the audit trail. Only reversible actions are listed (ADR-009).
        </p>
        <dl className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <dt className="text-text-secondary text-xs uppercase tracking-widest">Case score</dt>
            <dd className="font-mono">{analysis ? `${score}%` : 'n/a'}</dd>
          </div>
          <div>
            <dt className="text-text-secondary text-xs uppercase tracking-widest">Approval (decision ID)</dt>
            <dd className="font-mono">{approval?.id ?? 'none'}</dd>
          </div>
        </dl>
      </Card>

      <ul className="space-y-3" aria-label="Reversible automation actions">
        {AUTOMATION_CATALOG.map((action) => {
          const result = results[action.id];
          return (
            <li key={action.id}>
              <Card>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold">{action.name}</h4>
                      <Badge>Reversible</Badge>
                      <Badge>Threshold {action.threshold}%</Badge>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{action.description}</p>
                    <p className="text-xs text-text-secondary mt-2 flex items-start gap-1.5">
                      <RefreshCcw size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                      <span>
                        <span className="font-bold">Rollback:</span> {action.rollback}
                      </span>
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    aria-label={`Simulate ${action.name}`}
                    onClick={() => simulate(action.id)}
                  >
                    Simulate
                  </Button>
                </div>
                {result && (
                  <div
                    role="status"
                    className={`mt-3 flex items-start gap-2 rounded-lg border p-3 text-sm ${
                      result.allowed ? 'border-success/30 text-success' : 'border-danger/30 text-danger'
                    }`}
                  >
                    {result.allowed ? (
                      <ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <ShieldX size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    )}
                    <span>
                      <span className="font-bold">{result.allowed ? 'Allowed (simulation only). ' : 'Refused. '}</span>
                      {result.reason}
                    </span>
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

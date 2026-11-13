import { useEffect, useState } from 'react';
import { ArrowLeft, Cpu, Info } from 'lucide-react';
import type { DecisionRecord } from '../types';
import { getAnalysis, getIncident } from '../constants';
import { useDecisionStore } from '../state/DecisionStore';
import { EvidenceList } from './detail/EvidenceList';
import { ScorePanel } from './detail/ScorePanel';
import { ClaimsPanel } from './detail/ClaimsPanel';
import { DecisionPanel } from './detail/DecisionPanel';
import { LlmPayloadPanel } from './detail/LlmPayloadPanel';

export function IncidentDetail({ incidentId, onBack }: { incidentId: string; onBack: () => void }) {
  const store = useDecisionStore();
  const { startReview, recordEvidenceOpened, getOpenedEvidence } = store;
  const incident = getIncident(incidentId);
  const analysis = getAnalysis(incidentId);

  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState<string[]>([]);

  // Snapshot of the review at the moment of the decision: the store restarts the review, the screen keeps the receipt.
  const [receipt, setReceipt] = useState<DecisionRecord | null>(null);

  useEffect(() => {
    setReceipt(null);
    startReview(incidentId);
  }, [incidentId, startReview]);

  if (!incident || !analysis) {
    return (
      <div className="flex-1 p-8 bg-bg">
        <button type="button" onClick={onBack} className="text-accent text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
          Back to inbox
        </button>
        <p role="alert" className="mt-4 text-text-primary">Incident {incidentId} was not found.</p>
      </div>
    );
  }

  const decided = receipt !== null && receipt.incidentId === incidentId;
  const openedIds = (decided ? receipt.evidenceOpened : getOpenedEvidence(incidentId)).map((o) => o.evidenceId);
  const revealed = openedIds.length > 0;

  const onSelectClaim = (claimId: string | null, evidenceIds: string[]) => {
    setSelectedClaimId(claimId);
    setHighlighted(evidenceIds);
    if (evidenceIds[0]) {
      document.getElementById(`evidence-${evidenceIds[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-bg">
      <div className="p-4 border-b border-border flex items-center gap-4 bg-surface/50">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to inbox"
          className="p-2 -ml-2 rounded text-text-secondary hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <div className="h-4 w-px bg-border" />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-accent font-bold uppercase tracking-tighter">{incident.id}</span>
            <h2 className="text-text-primary font-bold tracking-tight truncate">{incident.title}</h2>
          </div>
          <span className="text-[10px] text-text-secondary font-mono uppercase tracking-widest">
            Severity: {incident.severity} · {incident.ocsfClass.name} · {incident.source}
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/3 border-r border-border p-6 overflow-y-auto bg-surface/20">
          <EvidenceList
            evidence={incident.evidence}
            highlightedIds={highlighted}
            openedIds={openedIds}
            onOpen={(evId) => {
              if (!decided) recordEvidenceOpened(incidentId, evId);
            }}
          />
        </div>

        <div className="flex-1 flex flex-col p-8 gap-6 overflow-y-auto bg-bg">
          <ScorePanel incident={incident} analysis={analysis} revealed={revealed} />

          <section aria-labelledby="top3-heading" className="w-full max-w-md mx-auto">
            <h4 id="top3-heading" className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">
              Top 3 ATT&CK techniques
            </h4>
            <ol className="space-y-2">
              {analysis.techniquesTop3.map((r) => {
                const pct = Math.round(r.probability * 100);
                return (
                  <li key={r.technique.id} className="p-3 rounded-lg border border-border bg-surface">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">{r.technique.tactic}</div>
                        <div className="text-xs text-text-primary font-bold mt-0.5">{r.technique.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-accent font-mono font-bold">{r.technique.id}</div>
                        <div className="text-xs text-text-primary font-mono tabular-nums">{pct}%</div>
                      </div>
                    </div>
                    <div className="mt-2 h-1 bg-border rounded-full overflow-hidden" aria-hidden="true">
                      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <div className="w-full max-w-md mx-auto">
            <DecisionPanel
              incident={incident}
              topTechniqueId={analysis.techniquesTop3[0]?.technique.id ?? ''}
              onRecorded={setReceipt}
            />
          </div>
        </div>

        <div className="w-[30%] border-l border-border bg-surface/10 p-6 overflow-y-auto space-y-8">
          <h3 className="text-text-secondary text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Cpu size={14} className="text-accent" aria-hidden="true" />
            AI Intelligence
          </h3>

          <section>
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Incident Summary</h4>
            <p className="text-sm text-text-primary leading-relaxed">{incident.summary}</p>
            <p className="mt-2 text-xs text-text-secondary">
              Suggested action: <span className="text-text-primary">{analysis.recommendedAction}</span>
            </p>
          </section>

          <section aria-labelledby="explanation-meta" className="rounded-xl border border-accent/10 bg-accent/5 p-4 space-y-4">
            <ClaimsPanel analysis={analysis} selectedClaimId={selectedClaimId} onSelectClaim={onSelectClaim} scoreRevealed={revealed} />
            <div className="pt-3 border-t border-accent/10 flex items-center justify-between">
              <span id="explanation-meta" className="text-[9px] text-accent font-bold uppercase tracking-widest">
                {analysis.promptVersion ? `Prompt ${analysis.promptVersion} · LLM via gateway` : 'No LLM call'}
              </span>
              <Info size={12} className="text-accent/40" aria-hidden="true" />
            </div>
          </section>

          <LlmPayloadPanel analysis={analysis} />
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { CheckCircle2, Gavel } from 'lucide-react';
import type { AnalystDecision, DecisionRecord, Incident, Severity } from '../../types';
import { TECHNIQUES } from '../../constants';
import { useDecisionStore } from '../../state/DecisionStore';

type Props = { incident: Incident; topTechniqueId: string };

const SEVERITIES: Severity[] = ['Critical', 'High', 'Medium', 'Low'];
type Tri = boolean | null;

function TriChoice({ legend, value, onChange }: { legend: string; value: Tri; onChange: (v: Tri) => void }) {
  const opts: { label: string; v: boolean }[] = [
    { label: 'Yes', v: true },
    { label: 'No', v: false },
  ];
  return (
    <fieldset className="flex items-center justify-between gap-2">
      <legend className="sr-only">{legend}</legend>
      <span className="text-xs text-text-primary" aria-hidden="true">{legend}</span>
      <div className="flex gap-1">
        {opts.map((o) => (
          <button
            key={o.label}
            type="button"
            aria-pressed={value === o.v}
            aria-label={`${legend} ${o.label}`}
            onClick={() => onChange(value === o.v ? null : o.v)}
            className={`px-2.5 py-1 rounded border text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              value === o.v ? 'bg-accent text-white border-accent' : 'border-border text-text-secondary hover:border-accent/40'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function DecisionPanel({ incident, topTechniqueId }: Props) {
  const store = useDecisionStore();
  const [mode, setMode] = useState<AnalystDecision>('accept');
  const [justification, setJustification] = useState('');
  const [techniqueCorrect, setTechniqueCorrect] = useState<Tri>(null);
  const [severityCorrect, setSeverityCorrect] = useState<Tri>(null);
  const [finalTechniqueId, setFinalTechniqueId] = useState(topTechniqueId);
  const [finalSeverity, setFinalSeverity] = useState<Severity>(incident.severity);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [record, setRecord] = useState<DecisionRecord | null>(null);

  const needsJustification = mode !== 'accept';
  const missingJustification = needsJustification && justification.trim().length === 0;

  // Diverging means changing something: same technique and severity is just an accept.
  const divergeUnchanged = mode === 'diverge' && finalTechniqueId === topTechniqueId && finalSeverity === incident.severity;

  const submit = async () => {
    if (missingJustification) {
      setError('Justification is required to diverge or mark the analysis as wrong.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const rec = await store.submitDecision({
        incidentId: incident.id,
        decision: mode,
        justification: needsJustification ? justification : undefined,
        feedback: { techniqueCorrect, severityCorrect },
        finalTechniqueId: mode === 'diverge' ? finalTechniqueId : undefined,
        finalSeverity: mode === 'diverge' ? finalSeverity : undefined,
      });
      setRecord(rec);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not record the decision.');
    } finally {
      setBusy(false);
    }
  };

  if (record) {
    const label = { accept: 'Recommendation accepted', diverge: 'Divergence recorded', mark_wrong: 'Analysis marked as wrong' }[
      record.analystDecision
    ];
    return (
      <section aria-labelledby="decision-heading" role="status" className="rounded-xl border border-success/40 bg-success/10 p-4 space-y-1">
        <h4 id="decision-heading" className="text-sm font-bold text-success flex items-center gap-2">
          <CheckCircle2 size={16} aria-hidden="true" />
          {label}
        </h4>
        <p className="text-xs text-text-primary">
          Decision <span className="font-mono">{record.id}</span> added to the audit trail.
        </p>
        {record.fastAccept && (
          <p className="text-xs text-warning">Flagged as fast accept: decided in under 30 s with no evidence opened.</p>
        )}
        <p className="text-[10px] text-text-secondary font-mono break-all">hash {record.hash.slice(0, 16)}...</p>
      </section>
    );
  }

  const modes: { id: AnalystDecision; label: string }[] = [
    { id: 'accept', label: 'Accept recommendation' },
    { id: 'diverge', label: 'Diverge' },
    { id: 'mark_wrong', label: 'Mark analysis as wrong' },
  ];

  return (
    <section aria-labelledby="decision-heading" className="rounded-xl border border-border bg-surface p-4 space-y-4">
      <h4 id="decision-heading" className="text-[11px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
        <Gavel size={14} className="text-accent" aria-hidden="true" />
        Your decision
      </h4>

      <div role="group" aria-label="Decision" className="flex flex-col gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={mode === m.id}
            onClick={() => {
              setMode(m.id);
              setError(null);
            }}
            className={`text-left px-3 py-2 rounded-lg border text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              mode === m.id ? 'border-accent bg-accent/10 text-text-primary' : 'border-border text-text-secondary hover:border-accent/40'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'diverge' && (
        <div className="grid grid-cols-1 gap-2">
          <label className="text-xs text-text-secondary flex flex-col gap-1">
            Final technique
            <select
              value={finalTechniqueId}
              onChange={(e) => setFinalTechniqueId(e.target.value)}
              className="bg-bg border border-border rounded px-2 py-1.5 text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {Object.values(TECHNIQUES).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-text-secondary flex flex-col gap-1">
            Final severity
            <select
              value={finalSeverity}
              onChange={(e) => setFinalSeverity(e.target.value as Severity)}
              className="bg-bg border border-border rounded px-2 py-1.5 text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {divergeUnchanged && (
        <p className="text-xs text-text-secondary">Change the final technique or severity to diverge.</p>
      )}

      {needsJustification && (
        <label className="text-xs text-text-secondary flex flex-col gap-1">
          Justification (required)
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            rows={3}
            required
            aria-required="true"
            aria-invalid={missingJustification && error !== null}
            className="bg-bg border border-border rounded px-2 py-1.5 text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </label>
      )}

      <div className="space-y-2 border-t border-border pt-3">
        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Feedback (optional)</p>
        <TriChoice legend="Technique correct?" value={techniqueCorrect} onChange={setTechniqueCorrect} />
        <TriChoice legend="Severity correct?" value={severityCorrect} onChange={setSeverityCorrect} />
      </div>

      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => void submit()}
        disabled={busy || !store.ready || divergeUnchanged}
        className="w-full px-3 py-2 rounded-lg bg-accent text-white text-xs font-bold disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {busy ? 'Recording...' : 'Submit decision'}
      </button>
    </section>
  );
}

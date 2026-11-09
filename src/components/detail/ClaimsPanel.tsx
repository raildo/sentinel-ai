import { ShieldAlert, ShieldCheck, Ban, SearchX } from 'lucide-react';
import type { Analysis } from '../../types';

type Props = {
  analysis: Analysis;
  selectedClaimId: string | null;
  onSelectClaim: (claimId: string | null, evidenceIds: string[]) => void;
  /** The score stays out of the text until the analyst has opened evidence. */
  scoreRevealed: boolean;
};

export function ClaimsPanel({ analysis, selectedClaimId, onSelectClaim, scoreRevealed }: Props) {
  const kept = analysis.claims.filter((c) => !c.discarded);
  const discarded = analysis.claims.filter((c) => c.discarded);
  const { validation } = analysis;

  return (
    <section aria-labelledby="claims-heading" className="space-y-3">
      <h4 id="claims-heading" className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
        <ShieldCheck size={12} className="text-accent" aria-hidden="true" />
        Explanation
      </h4>

      {analysis.degraded && (
        <div role="alert" className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-text-primary">
          <strong className="text-warning">Degraded mode.</strong>{' '}
          {analysis.degradedReason ?? 'The LLM explanation is unavailable.'} The score and techniques below come from the
          score model only.
        </div>
      )}

      {validation.injectionSuspected && (
        <div role="alert" className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-xs text-text-primary flex gap-2">
          <ShieldAlert size={14} className="text-danger shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Possible prompt injection detected in attacker-controlled data. {validation.discardedClaims} claim(s)
            discarded by the validator.{' '}
            {scoreRevealed
              ? `Score unchanged at ${validation.scoreBefore}% (before) and ${validation.scoreAfter}% (after).`
              : 'Score unchanged by the discarded claim. Open an evidence item to see it.'}
          </span>
        </div>
      )}

      {kept.length === 0 && !analysis.degraded && (
        <p className="text-xs text-text-secondary">No supported claims.</p>
      )}

      <ul className="space-y-2">
        {kept.map((c) => {
          const selected = selectedClaimId === c.id;
          return (
            <li key={c.id}>
              <button
                type="button"
                aria-pressed={selected}
                aria-label={`Claim: ${c.text}. Highlight supporting evidence ${c.evidenceIds.join(', ')}`}
                onClick={() => onSelectClaim(selected ? null : c.id, selected ? [] : c.evidenceIds)}
                className={`w-full text-left rounded-lg border p-3 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  selected ? 'border-accent bg-accent/10' : 'border-border bg-surface hover:border-accent/40'
                }`}
              >
                <p className="text-text-primary leading-relaxed">{c.text}</p>
                <p className="mt-1.5 text-[10px] text-text-secondary font-mono">Evidence: {c.evidenceIds.join(', ')}</p>
              </button>
            </li>
          );
        })}
      </ul>

      {discarded.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
            <Ban size={12} className="text-danger" aria-hidden="true" />
            Discarded claims
          </h5>
          <ul className="space-y-2">
            {discarded.map((c) => (
              <li key={c.id} className="rounded-lg border border-dashed border-danger/40 p-3 text-xs">
                <p className="text-text-secondary line-through leading-relaxed">{c.text}</p>
                <p className="mt-1.5 text-[10px] text-danger">Reason: {c.discardReason ?? 'Failed validation'}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h5 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2 mb-1">
          <SearchX size={12} aria-hidden="true" />
          Expected evidence not found
        </h5>
        {analysis.expectedEvidenceMissing.length === 0 ? (
          <p className="text-xs text-text-secondary">None. All expected evidence is present.</p>
        ) : (
          <ul className="list-disc pl-4 space-y-1 text-xs text-text-primary">
            {analysis.expectedEvidenceMissing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

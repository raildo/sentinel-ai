import { useMemo, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import type { Analysis } from '../../types';

export function LlmPayloadPanel({ analysis }: { analysis: Analysis }) {
  const [showReal, setShowReal] = useState(false);
  const entries = Object.entries(analysis.tokenMap);

  const text = useMemo(() => {
    if (analysis.llmReceivedPayload === null) return null;
    if (!showReal) return analysis.llmReceivedPayload;
    let out = analysis.llmReceivedPayload;
    for (const [token, real] of entries) out = out.split(token).join(real);
    return out;
  }, [analysis.llmReceivedPayload, entries, showReal]);

  return (
    <section aria-labelledby="llm-received-heading" className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 id="llm-received-heading" className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
          <Lock size={12} className="text-accent" aria-hidden="true" />
          What the LLM received
        </h4>
        {text !== null && (
          <button
            type="button"
            onClick={() => setShowReal((v) => !v)}
            aria-pressed={showReal}
            className="text-[10px] text-accent flex items-center gap-1 rounded px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {showReal ? <EyeOff size={12} aria-hidden="true" /> : <Eye size={12} aria-hidden="true" />}
            {showReal ? 'Show tokens' : 'Show real values'}
          </button>
        )}
      </div>
      {text === null ? (
        <p className="text-xs text-text-secondary">No LLM call was made for this incident.</p>
      ) : (
        <>
          <p className="text-[10px] text-text-secondary">
            {showReal
              ? 'Analyst view only. The LLM never sees these real values.'
              : 'Pseudonymized payload sent through the gateway.'}
          </p>
          <pre
            role="region"
            tabIndex={0}
            aria-label="LLM payload"
            className="max-h-64 overflow-auto rounded-lg border border-border bg-bg/50 p-3 text-[10px] font-mono text-text-secondary whitespace-pre-wrap break-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {text}
          </pre>
          {showReal && entries.length > 0 && (
            <table className="w-full text-[10px] font-mono">
              <caption className="sr-only">Token to real value mapping</caption>
              <thead>
                <tr className="text-text-secondary text-left">
                  <th scope="col" className="font-bold pb-1">Token</th>
                  <th scope="col" className="font-bold pb-1">Real value</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(([token, real]) => (
                  <tr key={token} className="border-t border-border/50">
                    <td className="py-1 text-accent break-all">{token}</td>
                    <td className="py-1 text-text-primary break-all">{real}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </section>
  );
}

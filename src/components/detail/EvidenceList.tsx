import { useState } from 'react';
import { Map, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import type { Evidence } from '../../types';

type Props = {
  evidence: Evidence[];
  highlightedIds: readonly string[];
  openedIds: readonly string[];
  onOpen: (evidenceId: string) => void;
};

export function EvidenceList({ evidence, highlightedIds, openedIds, onOpen }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    const next = !expanded[id];
    setExpanded((prev) => ({ ...prev, [id]: next }));
    if (next) onOpen(id);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-text-secondary text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
        <Map size={14} className="text-accent" aria-hidden="true" />
        Evidence Navigator
        <span className="ml-auto font-mono text-[10px] normal-case tracking-normal">
          {openedIds.length}/{evidence.length} opened
        </span>
      </h3>
      <ul className="space-y-3">
        {evidence.map((ev) => {
          const isOpen = !!expanded[ev.id];
          const highlighted = highlightedIds.includes(ev.id);
          return (
            <li
              key={ev.id}
              id={`evidence-${ev.id}`}
              data-highlighted={highlighted}
              className={`rounded-xl border bg-surface transition-all ${
                highlighted ? 'border-accent ring-2 ring-accent/50' : 'border-border'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(ev.id)}
                aria-expanded={isOpen}
                aria-controls={`evidence-body-${ev.id}`}
                aria-label={`${isOpen ? 'Collapse' : 'Open'} evidence ${ev.id}: ${ev.event}`}
                className="w-full text-left p-4 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="flex justify-between items-start mb-2 gap-2">
                  <span className="text-[10px] text-accent font-mono font-bold uppercase tracking-tighter">
                    {ev.id} · {ev.source}
                  </span>
                  <span className="text-[10px] text-text-secondary font-mono flex items-center gap-1">
                    {ev.timestamp}
                    {isOpen ? <ChevronDown size={12} aria-hidden="true" /> : <ChevronRight size={12} aria-hidden="true" />}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-text-primary mb-2">{ev.event}</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${ev.relevance}%` }} />
                  </div>
                  <span className="text-[10px] text-text-secondary font-mono font-bold">{ev.relevance}%</span>
                </div>
              </button>
              {isOpen && (
                <div id={`evidence-body-${ev.id}`} className="px-4 pb-4">
                  <div className="bg-bg/50 border border-border/50 rounded p-2">
                    <code className="text-[10px] text-text-secondary break-all font-mono leading-relaxed">{ev.details}</code>
                  </div>
                  {ev.untrustedField && (
                    <p className="mt-2 text-[10px] text-warning flex items-center gap-1">
                      <AlertTriangle size={12} aria-hidden="true" />
                      Attacker-controlled field: <span className="font-mono">{ev.untrustedField}</span>
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

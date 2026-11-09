import { useRef, useState, type KeyboardEvent } from 'react';
import { NoIncidentState } from './NoIncidentState';
import { getIncident } from '../constants';
import { HandoffTab } from './handoff/HandoffTab';
import { AutomationPreviewTab } from './handoff/AutomationPreviewTab';

type TabId = 'handoff' | 'preview';

const TABS: { id: TabId; label: string }[] = [
  { id: 'handoff', label: 'Handoff' },
  { id: 'preview', label: 'Preview: Automation phase' },
];

export const Handoff = ({ incidentId, onGoToTriage }: { incidentId: string | null; onGoToTriage?: () => void }) => {
  const [active, setActive] = useState<TabId>('handoff');
  const refs = useRef<Record<TabId, HTMLButtonElement | null>>({ handoff: null, preview: null });
  const incident = incidentId ? getIncident(incidentId) : undefined;

  if (!incident) {
    return (
      <NoIncidentState
        description="Pick an incident in the Triage Inbox to hand it off or preview automation."
        onGoToTriage={onGoToTriage}
      />
    );
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = active === 'handoff' ? 'preview' : 'handoff';
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Handoff</h2>
        <p className="text-sm text-text-secondary">
          {incident.id} · {incident.title}
        </p>
      </div>

      <div role="tablist" aria-label="Handoff sections" className="flex gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[t.id] = el;
            }}
            role="tab"
            id={`ac-tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`ac-panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => setActive(t.id)}
            onKeyDown={onKeyDown}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              active === t.id ? 'border-accent text-text-primary' : 'border-transparent text-text-secondary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`ac-panel-${active}`} aria-labelledby={`ac-tab-${active}`}>
        {active === 'handoff' ? (
          <HandoffTab incidentId={incident.id} />
        ) : (
          <AutomationPreviewTab incidentId={incident.id} />
        )}
      </div>
    </div>
  );
};

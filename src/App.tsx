import React, { Suspense, lazy, useState } from 'react';
import { Sidebar, type ScreenType } from './components/Sidebar';
import { DecisionStoreProvider } from './state/DecisionStore';
import { NoIncidentState } from './components/NoIncidentState';

const TriageInbox = lazy(() => import('./components/TriageInbox').then((m) => ({ default: m.TriageInbox })));
const IncidentDetail = lazy(() => import('./components/IncidentDetail').then((m) => ({ default: m.IncidentDetail })));
const Handoff = lazy(() => import('./components/Handoff').then((m) => ({ default: m.Handoff })));
const AuditTrail = lazy(() => import('./components/AuditTrail').then((m) => ({ default: m.AuditTrail })));
const Team = lazy(() => import('./components/Team').then((m) => ({ default: m.Team })));

const ScreenFallback = () => (
  <div className="flex-1 flex items-center justify-center text-text-secondary text-sm font-mono" role="status">
    Loading...
  </div>
);

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('triage');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    setCurrentScreen('detail');
  };

  const goToTriage = () => setCurrentScreen('triage');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'detail':
        return selectedIncidentId ? (
          <IncidentDetail incidentId={selectedIncidentId} onBack={goToTriage} />
        ) : (
          <NoIncidentState
            description="Pick an incident in the Triage Inbox to see its evidence map."
            onGoToTriage={goToTriage}
          />
        );
      case 'handoff':
        return <Handoff incidentId={selectedIncidentId} onGoToTriage={goToTriage} />;
      case 'audit':
        return <AuditTrail />;
      case 'team':
        return <Team />;
      case 'triage':
      default:
        return <TriageInbox onSelectIncident={handleSelectIncident} />;
    }
  };

  return (
    <DecisionStoreProvider>
      <div className="flex h-screen w-full bg-[#0d0e11] text-zinc-300 font-sans overflow-hidden">
        <Sidebar currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
        <main className="flex-1 flex flex-col min-w-0">
          <Suspense fallback={<ScreenFallback />}>{renderScreen()}</Suspense>
        </main>
      </div>
    </DecisionStoreProvider>
  );
}

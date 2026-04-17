import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TriageInbox } from './components/TriageInbox';
import { IncidentDetail } from './components/IncidentDetail';
import { ActionCenter } from './components/ActionCenter';
import { AuditTrail } from './components/AuditTrail';
import { Team } from './components/Team';
import { MOCK_INCIDENTS } from './constants';

type ScreenType = 'triage' | 'detail' | 'containment' | 'audit' | 'team';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('triage');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const selectedIncident = MOCK_INCIDENTS.find(inc => inc.id === selectedIncidentId) || MOCK_INCIDENTS[0];

  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    setCurrentScreen('detail');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'triage':
        return <TriageInbox onSelectIncident={handleSelectIncident} />;
      case 'detail':
        return (
          <IncidentDetail
            incident={selectedIncident}
            onBack={() => setCurrentScreen('triage')}
          />
        );
      case 'containment':
        return <ActionCenter />;
      case 'audit':
        return <AuditTrail />;
      case 'team':
        return <Team />;
      default:
        return <TriageInbox onSelectIncident={handleSelectIncident} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0d0e11] text-zinc-300 font-sans overflow-hidden">
      <Sidebar
        currentScreen={currentScreen}
        onScreenChange={(screen) => setCurrentScreen(screen)}
      />
      <main className="flex-1 flex flex-col min-w-0">
        {renderScreen()}
      </main>
    </div>
  );
}

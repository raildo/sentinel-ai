import { Map } from 'lucide-react';
import { Button } from './UI';

type Props = { description: string; onGoToTriage?: () => void };

export const NoIncidentState = ({ description, onGoToTriage }: Props) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-bg text-center p-8">
    <Map size={32} className="text-text-secondary opacity-60" aria-hidden="true" />
    <div>
      <h1 className="text-xl font-bold text-text-primary tracking-tight">No incident selected</h1>
      <p className="text-text-secondary mt-1 text-sm">{description}</p>
    </div>
    {onGoToTriage && (
      <Button variant="secondary" onClick={onGoToTriage}>
        Go to Triage Inbox
      </Button>
    )}
  </div>
);

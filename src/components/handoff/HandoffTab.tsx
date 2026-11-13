import { useEffect, useState } from 'react';
import { Download, Send } from 'lucide-react';
import { Card, Badge, Button } from '../UI';
import { getAnalysis, getIncident } from '../../constants';
import { useDecisionStore } from '../../state';
import { buildCloudEvent, downloadJson, signEvent, type SignedCloudEvent } from './cloudevent';

export const HandoffTab = ({ incidentId }: { incidentId: string }) => {
  const store = useDecisionStore();
  const { nowIso } = store;
  const incident = getIncident(incidentId);
  const analysis = getAnalysis(incidentId);
  const decision = store.latestDecisionFor(incidentId);
  const handedOff = store.isHandedOff(incidentId);
  // A decision was sent before, but the case has a newer decision that was not sent yet.
  const staleSend = !handedOff && store.handedOffDecisionId(incidentId) !== undefined;
  const [signed, setSigned] = useState<SignedCloudEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!incident) return;
    let cancelled = false;
    setSigned(null);
    setError(null);
    signEvent(buildCloudEvent(incident, analysis, decision, nowIso()))
      .then((s) => {
        if (!cancelled) setSigned(s);
      })
      .catch(() => {
        if (!cancelled) setError('Could not compute the payload signature.');
      });
    return () => {
      cancelled = true;
    };
  }, [incident, analysis, decision, nowIso]);

  if (!incident) return null;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary">Case handoff to SOAR / ITSM</h3>
            <p className="text-sm text-text-secondary mt-1">
              The platform recommends. Your SOAR runs playbooks. This sends the case, it does not execute any containment.
            </p>
          </div>
          {handedOff ? <Badge variant="success">Handed off</Badge> : <Badge>Not sent</Badge>}
        </div>

        {staleSend && (
          <p role="status" className="mt-4 text-sm text-warning">
            A newer decision ({decision?.id}) was recorded after the last handoff and has not been sent yet. Send the case
            again to share the current decision.
          </p>
        )}

        {!decision && (
          <p role="status" className="mt-4 text-sm text-warning">
            No analyst decision recorded for this case yet. Record a decision in the case view before handing off.
          </p>
        )}

        <div className="flex gap-3 mt-4 flex-wrap">
          <Button
            aria-label="Send case to SOAR and ITSM"
            disabled={!decision || !signed || handedOff}
            onClick={() => decision && store.markHandedOff(incidentId, decision.id)}
          >
            <Send size={16} aria-hidden="true" /> {handedOff ? 'Sent (simulated)' : 'Send to SOAR / ITSM'}
          </Button>
          <Button
            variant="secondary"
            aria-label="Export case as JSON file"
            disabled={!signed}
            onClick={() => signed && downloadJson(`${incident.id}.json`, signed)}
          >
            <Download size={16} aria-hidden="true" /> Export JSON
          </Button>
        </div>
        <p className="text-xs text-text-secondary mt-3">Simulated: nothing leaves the browser.</p>
      </Card>

      <Card>
        <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">CloudEvents payload</h4>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        {signed && (
          <>
            <pre
              role="region"
              tabIndex={0}
              aria-label="CloudEvents payload"
              className="text-xs font-mono bg-black/30 rounded-lg p-4 overflow-auto max-h-80"
            >
              {JSON.stringify(signed.event, null, 2)}
            </pre>
            <div className="mt-3 text-xs font-mono break-all">
              <span className="text-text-secondary">Signature ({signed.signature.alg}): </span>
              {signed.signature.value}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

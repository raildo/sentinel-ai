import { useEffect, useRef, useState } from 'react';
import { Download, ShieldCheck, ShieldAlert, FlaskConical } from 'lucide-react';
import { Button } from './UI';
import { useDecisionStore } from '../state/DecisionStore';
import type { ChainVerification } from '../types';
import { AuditTable } from './audit/AuditTable';
import { GovernancePanel } from './audit/GovernancePanel';

export const AuditTrail = () => {
  const { ready, decisions, tamperedIndex, verify, tamperRecord, reset } = useDecisionStore();
  const [verification, setVerification] = useState<ChainVerification | null>(null);
  const [busy, setBusy] = useState(false);

  // Always points at the trail currently on screen, so a slow verification can tell it is stale.
  const decisionsRef = useRef(decisions);

  // Any change to the trail invalidates the previous verification result.
  useEffect(() => {
    decisionsRef.current = decisions;
    setVerification(null);
  }, [decisions]);

  const onVerify = async () => {
    const verifiedTrail = decisionsRef.current;
    setBusy(true);
    try {
      const result = await verify();
      // Discard the result if the trail changed (new decision, tamper, reset) while hashing.
      if (decisionsRef.current === verifiedTrail) setVerification(result);
    } finally {
      setBusy(false);
    }
  };

  const onTamper = () => {
    if (decisions.length === 0) return;
    // Demo: edit a record in the middle of the trail without recomputing its hash.
    tamperRecord(Math.min(decisions.length - 1, Math.floor(decisions.length / 2)));
  };

  const onExport = () => {
    const blob = new Blob([JSON.stringify(decisions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sentinel-audit-trail.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-bg p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Security Decision Audit</h1>
          <p className="text-text-secondary mt-1 text-sm">
            Hash-chained trail of AI recommendations and analyst decisions.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="h-8 px-3 text-xs" onClick={onTamper} disabled={!ready || decisions.length === 0}>
            <FlaskConical size={14} /> Tamper record (demo)
          </Button>
          <Button variant="secondary" className="h-8 px-3 text-xs" onClick={() => void reset()} disabled={!ready}>
            Reset trail
          </Button>
          <Button variant="secondary" className="h-8 px-3 text-xs" onClick={onExport} disabled={decisions.length === 0}>
            <Download size={14} /> Export JSON
          </Button>
          <Button className="h-8 px-4 text-xs" onClick={() => void onVerify()} disabled={!ready || busy}>
            <ShieldCheck size={14} /> Verify chain
          </Button>
        </div>
      </div>

      {verification && (
        <div
          role="status"
          className={
            verification.valid
              ? 'flex items-center gap-2 rounded-lg border border-success/20 bg-success/10 p-3 text-xs text-success'
              : 'flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/10 p-3 text-xs text-danger'
          }
        >
          {verification.valid ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
          {verification.valid
            ? `Chain valid: ${decisions.length} records verified.`
            : `Chain broken at record index ${verification.brokenAtIndex} (${decisions[verification.brokenAtIndex ?? 0]?.id}): ${
                verification.reason === 'prev_hash_mismatch' ? 'previous hash does not match' : 'content does not match its hash'
              }.`}
        </div>
      )}

      <GovernancePanel decisions={decisions} />

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-bg/20">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest">Decision trail</h3>
          <span className="text-[11px] text-text-secondary font-mono">{decisions.length} records</span>
        </div>
        {!ready ? (
          <p className="p-6 text-xs text-text-secondary">Hashing trail...</p>
        ) : decisions.length === 0 ? (
          <p className="p-6 text-xs text-text-secondary">No decisions recorded yet.</p>
        ) : (
          <AuditTable decisions={decisions} tamperedIndex={tamperedIndex} verification={verification} />
        )}
      </div>
    </div>
  );
};

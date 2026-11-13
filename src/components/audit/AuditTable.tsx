import { Badge } from '../UI';
import { TECHNIQUES } from '../../constants';
import type { ChainVerification, DecisionRecord } from '../../types';
import { DECISION_LABEL, formatTime, shortHash } from './format';

type Props = {
  decisions: readonly DecisionRecord[];
  tamperedIndex: number | null;
  verification: ChainVerification | null;
};

const TH = 'p-3 text-[11px] font-bold text-text-secondary uppercase tracking-widest';

export function AuditTable({ decisions, tamperedIndex, verification }: Props) {
  const brokenAt = verification && !verification.valid ? verification.brokenAtIndex : null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-bg/50 border-b border-border">
            <th className={TH}>Case</th>
            <th className={TH}>AI recommendation</th>
            <th className={TH}>Analyst decision</th>
            <th className={TH}>Versions</th>
            <th className={TH}>Hash / prev</th>
            <th className={TH}>S3 anchor</th>
            <th className={TH}>Decided</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {decisions.map((d) => {
            const broken = brokenAt === d.index;
            const tech = TECHNIQUES[d.recommendation.topTechniqueId];
            const finalTech = d.finalTechniqueId ? TECHNIQUES[d.finalTechniqueId] : undefined;
            return (
              <tr key={d.id} className={broken ? 'bg-danger/10' : 'hover:bg-white/5 transition-colors'}>
                <td className="p-3 align-top">
                  <span className="text-xs font-bold text-text-primary block">{d.id}</span>
                  <span className="text-[10px] text-text-secondary block max-w-[200px] truncate" title={d.incidentTitle}>
                    {d.incidentId} {d.incidentTitle}
                  </span>
                  {tamperedIndex === d.index && <Badge variant="medium" className="mt-1 inline-block">edited (demo)</Badge>}
                  {broken && <Badge variant="critical" className="mt-1 inline-block">tampered</Badge>}
                </td>
                <td className="p-3 align-top text-xs text-text-secondary">
                  <span className="block text-text-primary font-mono">
                    {d.recommendation.topTechniqueId} {tech ? `(${tech.name})` : ''}
                  </span>
                  <span className="block">Score {d.recommendation.score} (range {d.recommendation.band.low}-{d.recommendation.band.high}), {d.recommendation.severity}</span>
                  <span className="block italic">{d.recommendation.suggestedAction}</span>
                </td>
                <td className="p-3 align-top text-xs text-text-secondary">
                  <span className="flex items-center gap-2 flex-wrap">
                    <Badge variant={d.analystDecision === 'accept' ? 'success' : d.analystDecision === 'diverge' ? 'medium' : 'critical'}>
                      {DECISION_LABEL[d.analystDecision] ?? d.analystDecision}
                    </Badge>
                    {d.fastAccept && <Badge variant="medium">fast accept</Badge>}
                  </span>
                  {(d.finalTechniqueId || d.finalSeverity) && (
                    <span className="block font-mono mt-1">
                      {d.finalTechniqueId} {finalTech ? `(${finalTech.name})` : ''} {d.finalSeverity}
                    </span>
                  )}
                  {d.justification && <span className="block italic mt-1 max-w-[220px]">"{d.justification}"</span>}
                  <span className="block mt-1">{d.analyst}, {(d.timeToDecisionMs / 1000).toFixed(0)}s, {d.evidenceOpened.length} evidence opened</span>
                </td>
                <td className="p-3 align-top text-[11px] font-mono text-text-secondary">
                  <span className="block">{d.versions.scoreModel}</span>
                  <span className="block">{d.versions.prompt ?? 'no prompt (degraded)'}</span>
                </td>
                <td className="p-3 align-top text-[11px] font-mono text-text-secondary">
                  <span className="block" title={d.hash}>{shortHash(d.hash)}</span>
                  <span className="block opacity-60" title={d.prevHash}>prev {shortHash(d.prevHash)}</span>
                </td>
                <td className="p-3 align-top">
                  <Badge variant={d.anchorStatus === 'anchored' ? 'success' : 'default'}>
                    {d.anchorStatus === 'anchored' ? 'anchored' : 'pending'}
                  </Badge>
                  <span className="block text-[10px] text-text-secondary mt-1">Object Lock (simulated)</span>
                  {d.anchorRef && <span className="block text-[10px] font-mono text-text-secondary truncate max-w-[140px]" title={d.anchorRef}>{d.anchorRef}</span>}
                </td>
                <td className="p-3 align-top whitespace-nowrap text-xs text-text-secondary font-mono">{formatTime(d.decidedAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

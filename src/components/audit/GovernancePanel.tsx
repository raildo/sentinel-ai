import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../UI';
import { GOLDEN_DATASET, MOCK_ANALYSES } from '../../constants';
import { computeGovernanceMetrics } from '../../domain/metrics';
import type { DecisionRecord } from '../../types';
import { pct } from './format';

const BINS = 5;

type Tile = { label: string; value: string; hint: string };

function TileGrid({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {tiles.map((t) => (
        <Card key={t.label} className="p-4">
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{t.label}</p>
          <p className="text-2xl font-extrabold text-text-primary mt-1 tracking-tighter">{t.value}</p>
          <p className="text-[10px] text-text-secondary mt-1">{t.hint}</p>
        </Card>
      ))}
    </div>
  );
}

function calibrationBins() {
  return Array.from({ length: BINS }, (_, b) => {
    const lo = b / BINS;
    const hi = (b + 1) / BINS;
    const inBin = GOLDEN_DATASET.filter((s) => {
      const c = s.score / 100;
      return c >= lo && (c < hi || (b === BINS - 1 && c <= hi));
    });
    const n = inBin.length;
    return {
      bin: `${Math.round(lo * 100)}-${Math.round(hi * 100)}`,
      confidence: n ? Math.round((inBin.reduce((a, s) => a + s.score, 0) / n)) : 0,
      observed: n ? Math.round((inBin.reduce((a, s) => a + s.outcome, 0) / n) * 100) : 0,
    };
  });
}

export function GovernancePanel({ decisions }: { decisions: readonly DecisionRecord[] }) {
  const m = useMemo(
    () => computeGovernanceMetrics({ decisions, analyses: MOCK_ANALYSES, golden: GOLDEN_DATASET }),
    [decisions],
  );
  const bins = useMemo(calibrationBins, []);

  const operationalTiles: Tile[] = [
    { label: 'MTTR', value: m.mttrMinutes === null ? 'n/a' : `${m.mttrMinutes.toFixed(1)} min`, hint: 'detection to decision' },
    { label: 'Acceptance rate', value: pct(m.acceptanceRate), hint: `${m.decisionCount} decisions` },
    { label: 'Divergence rate', value: pct(m.divergenceRate), hint: `marked wrong ${pct(m.markedWrongRate)}` },
    { label: 'Fast accept rate', value: pct(m.fastAcceptRate), hint: 'accepts in <30s, no evidence opened' },
    { label: 'Degraded mode', value: pct(m.degradedRate), hint: 'analyses without LLM' },
    { label: 'Cost per incident', value: m.costPerIncidentUsd === null ? 'n/a' : `$${m.costPerIncidentUsd.toFixed(4)}`, hint: 'LLM spend' },
  ];
  const qualityTiles: Tile[] = [
    { label: 'ECE', value: m.ece === null ? 'n/a' : m.ece.toFixed(3), hint: 'lower is better' },
    { label: 'Top-3 accuracy', value: pct(m.top3Accuracy), hint: 'technique in top 3' },
    { label: 'Groundedness', value: pct(m.groundedness), hint: 'claims backed by evidence' },
  ];

  return (
    <section aria-label="Governance metrics" className="space-y-4">
      <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest">Governance (aggregated, never per analyst)</h2>
      <section aria-labelledby="gov-operational" className="space-y-3">
        <h3 id="gov-operational" className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
          Operational (from decisions and seed)
        </h3>
        <TileGrid tiles={operationalTiles} />
      </section>
      <section aria-labelledby="gov-quality" className="space-y-3">
        <h3 id="gov-quality" className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
          Model quality ({m.datasetLabel}, n={m.goldenSampleSize})
        </h3>
        <TileGrid tiles={qualityTiles} />
      </section>
      <Card className="p-4">
        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">
          Calibration by score bin ({m.datasetLabel})
        </p>
        <div className="h-48 min-w-[240px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={240} minHeight={192} initialDimension={{ width: 480, height: 192 }}>
            <BarChart data={bins}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="bin" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="confidence" name="Mean score" fill="var(--color-text-secondary)" />
              <Bar dataKey="observed" name="Observed malicious rate" fill="var(--color-accent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </section>
  );
}

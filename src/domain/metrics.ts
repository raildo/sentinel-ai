import type { Analysis, DecisionRecord, GoldenSample, GovernanceMetrics } from '../types';

export const GOLDEN_DATASET_LABEL = 'simulated golden dataset';

const rate = (num: number, den: number): number | null => (den === 0 ? null : num / den);

/** Expected calibration error with equal-width bins over confidence = score / 100. */
export function expectedCalibrationError(samples: readonly GoldenSample[], bins = 5): number | null {
  if (samples.length === 0) return null;
  let ece = 0;
  for (let b = 0; b < bins; b++) {
    const lo = b / bins;
    const hi = (b + 1) / bins;
    const inBin = samples.filter((s) => {
      const c = s.score / 100;
      return c >= lo && (c < hi || (b === bins - 1 && c <= hi));
    });
    if (inBin.length === 0) continue;
    const conf = inBin.reduce((acc, s) => acc + s.score / 100, 0) / inBin.length;
    const acc = inBin.reduce((a, s) => a + s.outcome, 0) / inBin.length;
    ece += (inBin.length / samples.length) * Math.abs(acc - conf);
  }
  return ece;
}

/**
 * Aggregated governance metrics (section 3.3). Deliberately takes no analyst
 * dimension: results are never broken down per analyst.
 */
export function computeGovernanceMetrics(input: {
  decisions: readonly DecisionRecord[];
  analyses: readonly Analysis[];
  golden: readonly GoldenSample[];
}): GovernanceMetrics {
  const { decisions, analyses, golden } = input;
  const n = decisions.length;
  const accepts = decisions.filter((d) => d.analystDecision === 'accept');
  const mttrMs = n
    ? decisions.reduce((acc, d) => acc + (Date.parse(d.decidedAt) - Date.parse(d.detectedAt)), 0) / n
    : null;
  const claimsTotal = golden.reduce((a, s) => a + s.claimsTotal, 0);
  const claimsSupported = golden.reduce((a, s) => a + s.claimsSupported, 0);
  return {
    mttrMinutes: mttrMs === null ? null : mttrMs / 60000,
    acceptanceRate: rate(accepts.length, n),
    divergenceRate: rate(decisions.filter((d) => d.analystDecision === 'diverge').length, n),
    markedWrongRate: rate(decisions.filter((d) => d.analystDecision === 'mark_wrong').length, n),
    fastAcceptRate: rate(accepts.filter((d) => d.fastAccept).length, accepts.length),
    ece: expectedCalibrationError(golden),
    top3Accuracy: rate(golden.filter((s) => s.truthInTop3).length, golden.length),
    groundedness: rate(claimsSupported, claimsTotal),
    degradedRate: rate(analyses.filter((a) => a.degraded).length, analyses.length),
    costPerIncidentUsd: analyses.length ? analyses.reduce((a, x) => a + x.llmCostUsd, 0) / analyses.length : null,
    decisionCount: n,
    goldenSampleSize: golden.length,
    datasetLabel: GOLDEN_DATASET_LABEL,
  };
}

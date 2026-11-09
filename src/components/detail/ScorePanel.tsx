import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { Fingerprint, User } from 'lucide-react';
import type { Analysis, Incident } from '../../types';
import { SCORE_MODEL_DESCRIPTION } from '../../constants';

type Props = { incident: Incident; analysis: Analysis; revealed: boolean };

export function ScorePanel({ incident, analysis, revealed }: Props) {
  const fill = analysis.score > 80 ? '#10b981' : '#3B82F6';
  const data = [{ name: 'Confidence Score', value: analysis.score, fill }];

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className={`relative w-64 h-64 transition-opacity duration-500 ${revealed ? 'opacity-100' : 'opacity-25'}`}
        role="img"
        aria-label={
          revealed
            ? `Confidence Score ${analysis.score} percent, range ${analysis.band.low} to ${analysis.band.high}`
            : 'Confidence Score hidden until an evidence item is opened'
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="85%" outerRadius="100%" data={data} startAngle={225} endAngle={-45}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background dataKey="value" cornerRadius={30} fill={fill} isAnimationActive={false} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {/* Hidden from assistive tech until revealed, so the number is not read before the evidence. */}
          <div aria-hidden={!revealed} className="flex flex-col items-center">
            <span className="text-6xl font-black text-text-primary tracking-tighter tabular-nums">{analysis.score}%</span>
            <span className="text-text-secondary font-mono uppercase text-[10px] tracking-widest mt-1">Confidence Score</span>
            <span className="text-text-secondary font-mono text-[11px] mt-1">
              range {analysis.band.low}% to {analysis.band.high}%
            </span>
          </div>
        </div>
      </div>
      {/* Outside the role="img" box, whose children are presentational. */}
      {!revealed && <span className="sr-only">Open an evidence item to reveal the score</span>}
      {!revealed && (
        <p role="status" className="mt-3 text-xs text-warning text-center max-w-xs">
          Open at least one evidence item to give the score its full weight before deciding.
        </p>
      )}
      <p className="mt-3 text-[11px] text-text-secondary font-mono text-center">
        {analysis.scoreModelVersion}, {SCORE_MODEL_DESCRIPTION}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-sm">
        <div className="p-3 rounded-xl border border-border bg-surface flex items-center gap-3">
          <Fingerprint className="text-accent shrink-0" size={18} aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[9px] text-text-secondary uppercase tracking-widest font-bold">Target Host</p>
            <p className="text-sm font-bold text-text-primary tracking-tight truncate">{incident.host}</p>
          </div>
        </div>
        <div className="p-3 rounded-xl border border-border bg-surface flex items-center gap-3">
          <User className="text-accent shrink-0" size={18} aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[9px] text-text-secondary uppercase tracking-widest font-bold">Account</p>
            <p className="text-sm font-bold text-text-primary tracking-tight truncate">{incident.user ?? 'n/a'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

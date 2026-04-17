import React from 'react';
import { 
  ArrowLeft, 
  Map, 
  Search, 
  ShieldCheck, 
  Info,
  ChevronRight,
  Database,
  Cpu,
  Fingerprint
} from 'lucide-react';
import { Card, Badge, Button } from './UI';
import { Incident } from '../types';
import { motion } from 'motion/react';
import { 
  RadialBarChart, 
  RadialBar, 
  ResponsiveContainer, 
  PolarAngleAxis 
} from 'recharts';

export const IncidentDetail = ({ incident, onBack }: { incident: Incident, onBack: () => void }) => {
  const chartData = [
    { name: 'Confidence', value: incident.confidenceScore, fill: incident.confidenceScore > 80 ? '#10b981' : '#3B82F6' }
  ];

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-bg animate-in slide-in-from-right duration-500">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-surface/50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2 -ml-2 hover:bg-bg">
            <ArrowLeft size={18} />
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-accent font-bold uppercase tracking-tighter">{incident.id.split('-').pop()}</span>
              <h2 className="text-text-primary font-bold tracking-tight">{incident.title}</h2>
            </div>
            <span className="text-[10px] text-text-secondary font-mono uppercase tracking-widest">AI Analysis Priority: {incident.status}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="text-xs h-8">Export Data</Button>
          <Button className="text-xs h-8">Resolve Incident</Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Evidence Mapper */}
        <div className="w-1/3 border-r border-border flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar bg-surface/20">
          <div className="flex items-center justify-between">
            <h3 className="text-text-secondary text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Map size={14} className="text-accent" />
              Evidence Navigator
            </h3>
            <Badge variant="default">{incident.evidence.length} Indicators</Badge>
          </div>

          <div className="space-y-4">
            {incident.evidence.map((ev, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={ev.id}
                className="group relative"
              >
                <div className="absolute left-[-24px] top-1/2 w-4 h-px bg-border group-hover:bg-accent transition-colors" />
                <Card className="bg-surface border-border hover:border-accent/40 transition-all cursor-pointer p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-accent font-mono font-bold uppercase tracking-tighter">{ev.source}</span>
                    <span className="text-[10px] text-text-secondary font-mono">{ev.timestamp}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-text-primary mb-1">{ev.event}</h4>
                  <div className="bg-bg/50 border border-border/50 rounded p-2 mb-2">
                    <code className="text-[10px] text-text-secondary break-all font-mono leading-relaxed">
                      {ev.details}
                    </code>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${ev.relevance}%` }} />
                    </div>
                    <span className="text-[10px] text-text-secondary font-mono font-bold">{ev.relevance}%</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Center: Analysis Stage */}
        <div className="flex-1 flex flex-col p-8 items-center justify-center bg-bg relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-accent rounded-full animate-pulse" />
          </div>

          <div className="relative w-72 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                innerRadius="85%" 
                outerRadius="100%" 
                data={chartData} 
                startAngle={225} 
                endAngle={-45}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={30} fill={chartData[0].fill} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-6xl font-black text-text-primary tracking-tighter tabular-nums drop-shadow-sm">
                {incident.confidenceScore}%
              </span>
              <span className="text-text-secondary font-mono uppercase text-[10px] tracking-widest mt-1">
                AI CONFIDENCE
              </span>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] text-success font-bold uppercase tracking-widest">Live Thread Analysis</span>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-sm">
            <Card className="p-4 bg-surface border-border flex items-center gap-3">
              <Fingerprint className="text-accent" size={18} />
              <div>
                <p className="text-[9px] text-text-secondary uppercase tracking-widest font-bold">Target Host</p>
                <p className="text-sm font-bold text-text-primary tracking-tight">DC-01.AD.LOC</p>
              </div>
            </Card>
            <Card className="p-4 bg-surface border-border flex items-center gap-3">
              <Database className="text-accent" size={18} />
              <div>
                <p className="text-[9px] text-text-secondary uppercase tracking-widest font-bold">Analysis Rate</p>
                <p className="text-sm font-bold text-text-primary tracking-tight">1.2 GB/S</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Right: Insights */}
        <div className="w-1/4 border-l border-border flex flex-col bg-surface/10 p-6 overflow-y-auto">
          <h3 className="text-text-secondary text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 mb-6">
            <Cpu size={14} className="text-accent" />
            AI Intelligence
          </h3>

          <div className="space-y-8">
            <section>
              <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">Incident Summary</h4>
              <p className="text-sm text-text-primary leading-relaxed font-medium">
                {incident.summary}
              </p>
            </section>

            <section>
              <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">Model Reasoning</h4>
              <div className="bg-accent/5 border border-accent/10 rounded-xl p-5">
                <p className="text-sm text-text-primary/90 leading-relaxed italic">
                  "{incident.reasoning}"
                </p>
                <div className="mt-4 pt-4 border-t border-accent/10 flex items-center justify-between">
                  <span className="text-[9px] text-accent font-bold uppercase tracking-widest">Ref: GPT-4o-Turbo</span>
                  <div className="flex gap-1">
                    <ShieldCheck size={12} className="text-accent" />
                    <Info size={12} className="text-accent/40" />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">ATT&CK Mapping</h4>
              <div className="space-y-2">
                {incident.techniques.map(t => (
                  <div key={t.id} className="p-3 rounded-lg border border-border bg-surface hover:border-accent/40 transition-all flex items-center justify-between group cursor-default">
                    <div>
                      <div className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">{t.tactic}</div>
                      <div className="text-xs text-text-primary font-bold mt-0.5">{t.name}</div>
                    </div>
                    <span className="text-[10px] text-accent font-mono font-bold">{t.id}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

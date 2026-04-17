import React from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Card, Badge, Button } from './UI';
import { MOCK_INCIDENTS } from '../constants';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const TriageInbox = ({ onSelectIncident }: { onSelectIncident: (id: string) => void }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-bg p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Triage Inbox</h1>
          <p className="text-text-secondary mt-1 text-sm">You have <span className="text-danger font-medium">3 critical</span> incidents requiring attention.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-surface border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent transition-all w-48"
            />
          </div>
          <Button variant="secondary" className="px-3 h-8"><Filter size={14} /></Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-5">
        <Card className="bg-surface border-border">
          <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase mb-2">Critical Alerts</p>
          <p className="text-3xl font-extrabold text-danger tracking-tighter">08</p>
        </Card>
        <Card className="bg-surface border-border">
          <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase mb-2">Avg MTTR</p>
          <p className="text-3xl font-extrabold text-text-primary tracking-tighter">14m 22s</p>
        </Card>
        <Card className="bg-surface border-border">
          <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase mb-2">AI Confidence</p>
          <p className="text-3xl font-extrabold text-text-primary tracking-tighter">82%</p>
        </Card>
        <Card className="bg-surface border-border">
          <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase mb-2">Pending Review</p>
          <p className="text-3xl font-extrabold text-text-primary tracking-tighter">12</p>
        </Card>
      </div>

      {/* Incident Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-bg/50">
              <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-text-secondary">Incident ID</th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-text-secondary">Status</th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-text-secondary">MITRE Technique</th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-text-secondary text-center">Confidence</th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-text-secondary">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_INCIDENTS.map((incident) => (
              <motion.tr 
                key={incident.id}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                className="group cursor-pointer transition-colors"
                onClick={() => onSelectIncident(incident.id)}
              >
                <td className="p-4 font-mono text-xs text-accent font-bold uppercase tracking-tighter">{incident.id.split('-').pop()}</td>
                <td className="p-4">
                  <Badge variant={incident.status.toLowerCase() as any}>
                    {incident.status}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-text-secondary/5 border border-text-secondary/10 text-[10px] font-mono text-text-secondary">
                      {incident.techniques[0].id}
                    </span>
                    <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">{incident.techniques[0].name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-border relative flex items-center justify-center">
                      <div 
                        className="absolute inset-[-2px] rounded-full border-2 border-accent" 
                        style={{ clipPath: `inset(0 0 0 0)`, maskImage: `conic-gradient(black ${incident.confidenceScore}%, transparent 0)` }} 
                      />
                      <span className="text-[8px] font-bold text-text-primary">{incident.confidenceScore}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-xs text-text-secondary font-mono">
                    {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Activity = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

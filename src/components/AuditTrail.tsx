import React from 'react';
import { 
  History, 
  User, 
  Search, 
  FileText, 
  CheckCircle, 
  Loader2,
  TrendingUp,
  BarChart2,
  Calendar,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, Badge, Button } from './UI';
import { MOCK_AUDIT_LOGS } from '../constants';
import { cn } from '../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const chartData = [
  { name: '08:00', value: 400 },
  { name: '10:00', value: 300 },
  { name: '12:00', value: 600 },
  { name: '14:00', value: 800 },
  { name: '16:00', value: 500 },
  { name: '18:00', value: 900 },
];

export const AuditTrail = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-bg p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Security Decision Audit</h1>
          <p className="text-text-secondary mt-1 text-sm">Accountability dashboard for analyst-driven mitigations.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="px-3 h-8 text-xs">
            <Calendar size={14} className="mr-2" />
            Last 24 Hours
          </Button>
          <Button className="h-8 px-4 text-xs">
            Generate Compliance Report
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: 'Avg MTTR', value: '42m', trend: -12, color: 'text-success' },
          { label: 'Decision Accuracy', value: '98.4%', trend: 2, color: 'text-accent' },
          { label: 'False Positives', value: '0.2%', trend: -5, color: 'text-success' },
        ].map((metric, i) => (
          <Card key={i} className="bg-surface border-border p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{metric.label}</p>
                <p className="text-2xl font-extrabold text-text-primary mt-1 tracking-tighter">{metric.value}</p>
              </div>
              <div className="p-2 rounded-lg bg-bg/50">
                <BarChart2 className={metric.color} size={20} />
              </div>
            </div>
            <div className="flex items-center gap-2">
               <div className={cn("flex items-center text-xs font-bold font-mono", metric.trend < 0 ? "text-success" : "text-accent")}>
                {metric.trend < 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                {Math.abs(metric.trend)}%
              </div>
              <span className="text-text-secondary text-[10px] uppercase font-medium">period delta</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Audit Table */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-bg/20">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest">Historical Log</h3>
            <Badge variant="default" className="bg-border text-text-secondary">782 Actions</Badge>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
              <input 
                type="text" 
                placeholder="Search logs..." 
                className="bg-bg border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent transition-all w-48"
              />
            </div>
          </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg/50 border-b border-border">
              <th className="p-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">Analyst</th>
              <th className="p-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">Action</th>
              <th className="p-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">Logic Sync</th>
              <th className="p-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">Validation</th>
              <th className="p-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_AUDIT_LOGS.map((log) => (
              <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-border flex items-center justify-center">
                      <User size={14} className="text-text-primary" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-text-primary block">{log.analyst}</span>
                      <span className="text-[10px] text-text-secondary font-mono tracking-tighter">Tier 3 Responder</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded border border-accent/20 bg-accent/10 text-accent text-[10px] font-bold font-mono">
                    {log.action}
                  </span>
                </td>
                <td className="p-4">
                  <div className="max-w-xs">
                    <p className="text-xs text-text-secondary line-clamp-1 italic">
                      "{log.logic}"
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {log.status === 'Validated' ? (
                      <CheckCircle className="text-success" size={14} />
                    ) : (
                      <Loader2 className="text-accent animate-spin" size={14} />
                    )}
                    <span className={cn(
                      "text-sm font-bold",
                      log.status === 'Validated' ? "text-success" : "text-accent"
                    )}>
                      {log.status}
                    </span>
                  </div>
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className="text-xs text-text-secondary font-mono">{new Date(log.timestamp).toLocaleDateString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

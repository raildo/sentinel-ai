import React, { useState } from 'react';
import { 
  Play, 
  Terminal, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  ShieldOff,
  Globe,
  Lock,
  RefreshCcw,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Card, Badge, Button } from './UI';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const ActionCenter = () => {
  const [checklist, setChecklist] = useState([
    { id: 1, label: 'Isolate Host (DC-01)', completed: false, description: 'Quarantines the machine from the internal network.' },
    { id: 2, label: 'Block C2 IP Address', completed: true, description: 'Adds 185.122.45.10 to the edge firewall blacklist.' },
    { id: 3, label: 'Force Password Reset', completed: false, description: 'Triggers a globally forced password reset for compromised accounts.' },
    { id: 4, label: 'Revoke API Tokens', completed: false, description: 'Invalidates all active OAuth tokens for the service account.' },
  ]);

  const [activeTab, setActiveTab] = useState<'python' | 'powershell' | 'bash'>('python');
  const [executing, setExecuting] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const toggleCheck = (id: number) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const scripts = {
    python: `import sentinel_sdk

def contain_incident(incident_id):
    # Initialize Sentinel Agent
    agent = sentinel_sdk.connect("DC-01.local")
    
    print(f"[*] Starting isolation for {incident_id}")
    
    # 1. Isolate network interface
    agent.isolate_network()
    print("[+] Network isolation successful")
    
    # 2. Block processes
    suspicious_procs = agent.list_unsigned_processes()
    for proc in suspicious_procs:
        if "pwsh" in proc.name:
            agent.kill_process(proc.pid)
            print(f"[!] Terminated malicious process: {proc.pid}")

contain_incident("INC-2026-0417-01")`,
    powershell: `# PowerShell Containment Script
$IncidentID = "INC-2026-0417-01"
Write-Host "[*] Executing Incident Response for $IncidentID"

# Disable User Account
Disable-ADAccount -Identity "svc_remotemgmt"
Write-Host "[+] Service Account Disabled"

# Firewall Block
New-NetFirewallRule -DisplayName "Sentinel Block" -Direction Outbound -Action Block -RemoteAddress 185.122.45.10`,
    bash: `# Linux Containment Script
iptables -A OUTPUT -d 185.122.45.10 -j DROP
echo "[+] Blocked C2 IP on local firewall"

service ssh stop
echo "[!] SSH service suspended to prevent persistence"`
  };

  const handleExecute = () => {
    setExecuting(true);
    setLog(["Initializing Sentinel Bridge...", "Connecting to DC-01...", "Authenticating via Tier 3 credentials..."]);
    
    setTimeout(() => {
      setLog(prev => [...prev, "Check: Network Isolation... OK", "Action: Killing PowerShell PID 8412... OK", "Reporting: Mitigation complete."]);
      setExecuting(false);
    }, 2000);
  };

  return (
    <div className="flex-1 p-8 bg-bg flex flex-col gap-8 animate-in fade-in duration-500 overflow-y-auto">
      <div className="flex justify-between items-start border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-3">
            <ShieldAlert size={24} className="text-accent" />
            Action Center
          </h1>
          <p className="text-text-secondary mt-1 uppercase text-[10px] font-mono tracking-widest">Active Containment: INC-417-01</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="critical">High Risk</Badge>
          <Badge variant="success">Threat Neutralizable</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Containment Checklist */}
        <section className="space-y-4">
          <h3 className="text-text-secondary text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 size={14} className="text-success" />
            Mitigation Checklist
          </h3>
          <div className="space-y-3">
            {checklist.map(item => (
              <Card 
                key={item.id} 
                onClick={() => toggleCheck(item.id)}
                className={cn(
                  "p-4 flex items-center gap-4 cursor-pointer hover:border-accent/40 transition-all group",
                  item.completed ? "bg-success/5 border-success/20 shadow-none" : "bg-surface"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center transition-all",
                  item.completed ? "bg-success border-success text-white" : "border-border bg-bg text-transparent"
                )}>
                  <CheckCircle2 size={12} />
                </div>
                <div className="flex-1">
                  <p className={cn("text-sm font-bold transition-all", item.completed ? "text-success opacity-70" : "text-text-primary")}>
                    {item.label}
                  </p>
                  <p className="text-[11px] text-text-secondary mt-0.5 leading-tight">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="pt-4 space-y-3">
             <h3 className="text-text-secondary text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
              <RefreshCcw size={14} className="text-accent" />
              Rapid Response
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button className="p-3 rounded-xl bg-surface border border-border flex flex-col items-center gap-2 hover:border-accent/40 transition-colors group">
                <ShieldOff size={20} className="text-text-secondary group-hover:text-accent" />
                <span className="text-[9px] text-text-secondary uppercase font-bold tracking-tight">Revoke Sessions</span>
              </button>
              <button className="p-3 rounded-xl bg-surface border border-border flex flex-col items-center gap-2 hover:border-accent/40 transition-colors group">
                <Globe size={20} className="text-text-secondary group-hover:text-accent" />
                <span className="text-[9px] text-text-secondary uppercase font-bold tracking-tight">DNS Sinkhole</span>
              </button>
              <button className="p-3 rounded-xl bg-surface border border-border flex flex-col items-center gap-2 hover:border-accent/40 transition-colors group">
                <Lock size={20} className="text-text-secondary group-hover:text-accent" />
                <span className="text-[9px] text-text-secondary uppercase font-bold tracking-tight">Freeze Assets</span>
              </button>
            </div>
          </div>
        </section>

        {/* Script Execution */}
        <section className="space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-text-secondary text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Terminal size={14} className="text-accent" />
              Payload Configuration
            </h3>
            <div className="flex rounded-md overflow-hidden border border-border bg-surface">
              {(['python', 'powershell', 'bash'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-3 py-1 text-[10px] font-mono uppercase tracking-widest transition-all border-r border-border last:border-0",
                    activeTab === tab ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-surface border border-border rounded-xl overflow-hidden flex flex-col shadow-sm">
            <div className="p-2 border-b border-border flex items-center gap-2 bg-bg/50">
              <div className="flex gap-1.5 ml-1">
                <div className="w-2.5 h-2.5 rounded-full bg-danger/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-warning/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-success/50" />
              </div>
              <span className="text-[10px] text-text-secondary font-mono flex items-center gap-2 ml-4">
                containment_agent.{activeTab === 'python' ? 'py' : activeTab === 'powershell' ? 'ps1' : 'sh'}
              </span>
            </div>
            <div className="flex-1 p-5 bg-bg font-mono text-[11px] leading-relaxed overflow-y-auto min-h-[300px] text-accent/80 scrollbar-hide">
              <pre className="whitespace-pre-wrap">
                {scripts[activeTab]}
              </pre>
            </div>
            <div className="p-4 bg-surface border-t border-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", executing ? "bg-accent animate-pulse" : "bg-border")} />
                <span className="text-[10px] text-text-secondary font-mono tracking-widest uppercase">{executing ? "Deploying Trigger..." : "Awaiting Command"}</span>
              </div>
              <Button onClick={handleExecute} disabled={executing} className="h-8 px-6 font-bold uppercase tracking-widest text-[10px]">
                {executing ? <RefreshCcw className="animate-spin" size={14} /> : <Play size={14} fill="currentColor" />}
                Run Mitigation
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {log.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl border border-border bg-bg/50 font-mono text-[10px] space-y-1 h-32 overflow-y-auto"
              >
                {log.map((line, i) => (
                  <div key={i} className={cn(
                    "flex items-start gap-2",
                    line.includes('[+]') ? "text-success" : line.includes('[!]') ? "text-danger" : "text-text-secondary"
                  )}>
                    <span className="opacity-40">{new Date().toLocaleTimeString([], { hour12: false })}</span>
                    {line}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
};

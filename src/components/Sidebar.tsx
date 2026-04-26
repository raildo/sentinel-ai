import React from 'react';
import {
  Inbox,
  Map,
  ShieldAlert,
  History,
  Terminal,
  Activity,
  ChevronRight,
  Users,
} from 'lucide-react';
import { cn } from '../lib/utils';

type ScreenType = 'triage' | 'detail' | 'containment' | 'audit' | 'team';

interface SidebarProps {
  currentScreen: ScreenType;
  onScreenChange: (screen: ScreenType) => void;
}

export const Sidebar = ({ currentScreen, onScreenChange }: SidebarProps) => {
  const navItems = [
    { id: 'triage', label: 'Triage Inbox', icon: Inbox, persona: 'Ana' },
    { id: 'detail', label: 'Evidence Mapper', icon: Map, persona: 'AI Analysis' },
    { id: 'containment', label: 'Action Center', icon: ShieldAlert, persona: 'Responder' },
    { id: 'audit', label: 'Audit Dashboard', icon: History, persona: 'Carlos' },
    { id: 'team', label: 'Team', icon: Users, persona: 'GRUPO 12' },
  ];

  return (
    <aside className="w-[240px] border-r border-border flex flex-col h-screen bg-surface text-text-secondary">
      <div className="p-6 pb-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white shadow-sm">
          <ShieldAlert size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-text-primary font-bold leading-none tracking-tight">SecureAI Analyst</span>
          <span className="text-[10px] text-accent font-mono tracking-widest uppercase mt-1">AI Division</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onScreenChange(item.id as ScreenType)}
            className={cn(
              "w-full flex items-center justify-between px-6 py-3 transition-all group",
              currentScreen === item.id 
                ? "text-text-primary bg-accent/10 border-r-2 border-accent" 
                : "hover:bg-bg hover:text-text-primary"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} className={currentScreen === item.id ? "text-accent" : "opacity-60"} />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-[9px] opacity-60 font-mono tracking-wider">{item.persona}</span>
              </div>
            </div>
            {currentScreen === item.id && <ChevronRight size={14} className="text-accent" />}
          </button>
        ))}
        
        <div className="pt-8 px-6 pb-2 mb-2 text-[10px] uppercase font-bold tracking-widest text-zinc-600">
          Operations
        </div>
        <button className="w-full flex items-center gap-3 px-6 py-3 hover:bg-bg hover:text-text-primary transition-colors">
          <Terminal size={18} className="opacity-60" />
          <span className="text-sm font-medium">Console</span>
        </button>
        <button className="w-full flex items-center gap-3 px-6 py-3 hover:bg-bg hover:text-text-primary transition-colors">
          <Activity size={18} className="opacity-60" />
          <span className="text-sm font-medium">Threat Intel</span>
        </button>
      </nav>

      <div className="p-6 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-border" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-primary">Ana Silva</span>
            <span className="text-xs text-text-secondary">Tier 3 Analyst</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

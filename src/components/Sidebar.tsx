import React from 'react';
import {
  Inbox,
  Map,
  ShieldAlert,
  History,
  ChevronRight,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';

export type ScreenType = 'triage' | 'detail' | 'handoff' | 'audit' | 'team';

interface SidebarProps {
  currentScreen: ScreenType;
  onScreenChange: (screen: ScreenType) => void;
}

export const Sidebar = ({ currentScreen, onScreenChange }: SidebarProps) => {
  const navItems: { id: ScreenType; label: string; icon: LucideIcon; persona: string }[] = [
    { id: 'triage', label: 'Triage Inbox', icon: Inbox, persona: 'Queue' },
    { id: 'detail', label: 'Evidence Mapper', icon: Map, persona: 'Evidence' },
    { id: 'handoff', label: 'Handoff', icon: ShieldAlert, persona: 'SOAR / ITSM' },
    { id: 'audit', label: 'Audit Dashboard', icon: History, persona: 'Decision trail' },
    { id: 'team', label: 'Team', icon: Users, persona: 'Group 12' },
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
            onClick={() => onScreenChange(item.id)}
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

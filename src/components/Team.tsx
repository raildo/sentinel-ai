import React from 'react';
import { Users, ExternalLink } from 'lucide-react';

const TEAM_MEMBERS = [
  { name: 'Felipe Lima Santos', linkedin: 'https://linkedin.com/in/felipe-lima-santos' },
  { name: 'Gabriela Gopfert', linkedin: 'https://linkedin.com/in/gabrielagopfert' },
  { name: 'Guilherme Zuliani', linkedin: 'https://linkedin.com/in/guilherme-zuliani' },
  { name: 'Rafael Massarollo', linkedin: 'https://linkedin.com/in/rafael-massarollo' },
  { name: 'Raildo Mascena', linkedin: 'https://linkedin.com/in/raildomascena' },
];

export const Team = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-bg p-8 space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Team</h1>
        <p className="text-text-secondary mt-1 text-sm">GRUPO 12 — FIAP Pós Tech Management</p>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-lg">
        {TEAM_MEMBERS.map((member) => (
          <a
            key={member.name}
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border hover:border-accent/50 hover:bg-accent/5 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-border flex items-center justify-center">
                <Users size={18} className="text-text-secondary group-hover:text-accent transition-colors" />
              </div>
              <span className="text-sm font-medium text-text-primary">{member.name}</span>
            </div>
            <ExternalLink size={14} className="text-text-secondary group-hover:text-accent transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
};

# Vercel Deployment & Contributor Readiness — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare Sentinel AI for Vercel deployment by removing dead dependencies, adding Vercel config, updating the README, and adding a Team screen + contributor files.

**Architecture:** Pure static React SPA (Vite build → `dist/`). No backend. All changes are file edits — no new infrastructure. The Team screen follows the existing pattern: new component + `ScreenType` union update in both `App.tsx` and `Sidebar.tsx`.

**Tech Stack:** React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide React

---

## File Map

| Action | File |
|--------|------|
| Modify | `package.json` |
| Modify | `vite.config.ts` |
| Create | `vercel.json` |
| Modify | `README.md` |
| Create | `.env.example` |
| Create | `CONTRIBUTING.md` |
| Create | `src/components/Team.tsx` |
| Modify | `src/App.tsx` |
| Modify | `src/components/Sidebar.tsx` |

---

### Task 1: Remove unused dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Edit `package.json`**

Replace the `dependencies` and `devDependencies` blocks with:

```json
{
  "name": "sentinel-ai",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port=3000 --host=0.0.0.0",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "clsx": "^2.1.1",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "recharts": "^3.8.1",
    "tailwind-merge": "^3.5.0",
    "vite": "^6.2.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "autoprefixer": "^10.4.21",
    "tailwindcss": "^4.1.14",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}
```

- [ ] **Step 2: Reinstall dependencies**

```bash
npm install
```

Expected: lock file updated, no errors.

- [ ] **Step 3: Verify build still works**

```bash
npm run build
```

Expected: `dist/` folder created, no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove unused dependencies (express, dotenv, genai)"
```

---

### Task 2: Simplify vite.config.ts

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Replace the full file content**

```ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 2: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts at http://localhost:3000, no errors in terminal.

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts
git commit -m "chore: simplify vite config, remove AI Studio artifacts"
```

---

### Task 3: Add Vercel configuration

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create `vercel.json` at the repo root**

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 2: Verify build output is compatible**

```bash
npm run build && ls dist/
```

Expected: `dist/index.html` exists alongside JS/CSS assets.

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git commit -m "chore: add vercel.json for SPA routing"
```

---

### Task 4: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the full content of `README.md`**

```markdown
# Sentinel AI — Cyber Incident Responder

An AI-powered cybersecurity incident triage and response demo built for FIAP Pós Tech Management.

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4
- Recharts, Framer Motion, Lucide React

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Import this repository on [vercel.com](https://vercel.com)
2. Click **Deploy** — no environment variables required
3. Vercel auto-detects Vite and builds from `dist/`

## Project Structure

```
src/
├── components/     # All UI screens and reusable components
├── constants.ts    # Mock data: incidents, techniques, audit logs
├── types.ts        # TypeScript type definitions
└── lib/utils.ts    # Utility helpers (cn for class merging)
```

## Team

**GRUPO 12 — FIAP Pós Tech Management**

| Name | LinkedIn |
|------|----------|
| Felipe Lima Santos | [linkedin.com/in/felipe-lima-santos](https://linkedin.com/in/felipe-lima-santos) |
| Gabriela Gopfert | [linkedin.com/in/gabrielagopfert](https://linkedin.com/in/gabrielagopfert) |
| Guilherme Zuliani | [linkedin.com/in/guilherme-zuliani](https://linkedin.com/in/guilherme-zuliani) |
| Rafael Massarollo | [linkedin.com/in/rafael-massarollo](https://linkedin.com/in/rafael-massarollo) |
| Raildo Mascena | [linkedin.com/in/raildomascena](https://linkedin.com/in/raildomascena) |
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README for public contributors"
```

---

### Task 5: Add contributor files

**Files:**
- Create: `.env.example`
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: Create `.env.example`**

Create an empty file at the repo root:

```bash
touch .env.example
```

- [ ] **Step 2: Create `CONTRIBUTING.md`**

```markdown
# Contributing to Sentinel AI

## Prerequisites

- Node.js 18+
- npm

## Local Setup

```bash
npm install
npm run dev   # runs on http://localhost:3000
```

To build for production:

```bash
npm run build
npm run preview
```

## Codebase Overview

| Path | Purpose |
|------|---------|
| `src/components/` | All UI screens and shared components |
| `src/constants.ts` | Single source of truth for all mock data |
| `src/types.ts` | TypeScript interfaces for all data models |
| `src/lib/utils.ts` | `cn()` utility for merging Tailwind classes |

## Mock Data

All incidents, MITRE techniques, and audit logs live in `src/constants.ts`. To add a new incident:

1. Add a new entry to the `MOCK_INCIDENTS` array following the `Incident` type in `src/types.ts`
2. Reference existing technique IDs from `TECHNIQUES` or add new ones

## Adding a New UI Component

1. Create the component in `src/components/MyComponent.tsx`
2. Import and use `Card`, `Badge`, `Button` from `./UI` for consistent styling
3. Use `cn()` from `../lib/utils` for conditional class merging
4. All screens receive the same dark theme — use `bg-bg`, `bg-surface`, `text-text-primary`, `text-text-secondary`, `border-border`, `text-accent` Tailwind tokens

## Adding a New Screen

1. Add a new value to `ScreenType` in both `src/App.tsx` and `src/components/Sidebar.tsx`
2. Add a `case` to the `renderScreen()` switch in `App.tsx`
3. Add a nav item to the `navItems` array in `Sidebar.tsx`

## Code Style

- TypeScript strict mode — no `any`
- Tailwind for all styling — no inline styles
- No external state management — React `useState` only
```

- [ ] **Step 3: Commit**

```bash
git add .env.example CONTRIBUTING.md
git commit -m "docs: add CONTRIBUTING.md and .env.example"
```

---

### Task 6: Create Team screen component

**Files:**
- Create: `src/components/Team.tsx`

- [ ] **Step 1: Create `src/components/Team.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Team.tsx
git commit -m "feat: add Team screen component"
```

---

### Task 7: Wire Team screen into App and Sidebar

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Sidebar.tsx`

- [ ] **Step 1: Update `src/App.tsx`**

Replace the full file content:

```tsx
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TriageInbox } from './components/TriageInbox';
import { IncidentDetail } from './components/IncidentDetail';
import { ActionCenter } from './components/ActionCenter';
import { AuditTrail } from './components/AuditTrail';
import { Team } from './components/Team';
import { MOCK_INCIDENTS } from './constants';

type ScreenType = 'triage' | 'detail' | 'containment' | 'audit' | 'team';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('triage');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const selectedIncident = MOCK_INCIDENTS.find(inc => inc.id === selectedIncidentId) || MOCK_INCIDENTS[0];

  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    setCurrentScreen('detail');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'triage':
        return <TriageInbox onSelectIncident={handleSelectIncident} />;
      case 'detail':
        return (
          <IncidentDetail
            incident={selectedIncident}
            onBack={() => setCurrentScreen('triage')}
          />
        );
      case 'containment':
        return <ActionCenter />;
      case 'audit':
        return <AuditTrail />;
      case 'team':
        return <Team />;
      default:
        return <TriageInbox onSelectIncident={handleSelectIncident} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0d0e11] text-zinc-300 font-sans overflow-hidden">
      <Sidebar
        currentScreen={currentScreen}
        onScreenChange={(screen) => setCurrentScreen(screen)}
      />
      <main className="flex-1 flex flex-col min-w-0">
        {renderScreen()}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Update `src/components/Sidebar.tsx`**

Replace the full file content:

```tsx
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
          <span className="text-text-primary font-bold leading-none tracking-tight">Sentinel Cyber</span>
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
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000. Check:
- "Team" entry appears in the sidebar
- Clicking it renders the Team screen with all 5 member cards
- Each card links to the correct LinkedIn URL (hover to confirm in browser status bar)
- All other sidebar items still navigate correctly

- [ ] **Step 4: Final build check**

```bash
npm run build
```

Expected: no TypeScript errors, `dist/` produced successfully.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/Sidebar.tsx
git commit -m "feat: wire Team screen into app navigation"
```

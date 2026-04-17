# Vercel Deployment & Contributor Readiness — Design Spec

**Date:** 2026-04-17  
**Project:** Sentinel AI (cybersecurity incident response demo)  
**Goal:** Prepare the repo for Vercel deployment and make it clean and welcoming for future contributors.

---

## 1. Dependency Cleanup

Remove dead dependencies that were scaffolded for a server-side use case that never materialized.

**Remove from `dependencies`:**
- `express` — no server in this app
- `dotenv` — Vite handles env vars natively
- `@google/genai` — Gemini API not used; app runs on mock data

**Remove from `devDependencies`:**
- `@types/express` — types for the removed Express
- `tsx` — only needed to run TypeScript server files

**Simplify `vite.config.ts`:**
- Remove `loadEnv` import and usage
- Remove the `define` block (`process.env.GEMINI_API_KEY`)
- Remove the HMR comment block (AI Studio artifact, irrelevant to contributors)
- Keep: React plugin, Tailwind plugin, `@` path alias

---

## 2. Vercel Configuration

Add `vercel.json` at the repo root with a single rewrite rule routing all paths to `index.html`. This enables client-side routing to work correctly when users refresh or deep-link.

Vercel auto-detects Vite projects and uses `dist/` as the output directory — no further config needed.

---

## 3. README Update

Replace the current README (which references AI Studio and a personal app URL) with a clean, contributor-friendly document:

- **Project description:** What Sentinel AI is — a cybersecurity incident triage and response demo UI
- **Tech stack:** React 19, TypeScript, Vite 6, Tailwind CSS v4, Recharts, Framer Motion, Lucide React
- **Local dev:** `npm install` → `npm run dev` (runs on port 3000)
- **Vercel deployment:** Import repo on Vercel, click Deploy — no env vars required for the demo
- **Project structure:** Brief overview of `src/components/`, `src/types.ts`, `src/constants.ts`, `src/lib/`

---

## 4. Contributor Files

**`.env.example`** — empty file; serves as a placeholder pattern for contributors who extend the app with real API integrations in the future. No keys or references included.

**`CONTRIBUTING.md`** — covers:
- Prerequisites and local dev setup
- Codebase overview: components, types, constants, lib utilities
- How mock data works (`src/constants.ts` is the single source of truth for incidents, techniques, and audit logs)
- Guide for adding a new incident or UI component
- Code style notes: TypeScript strict mode, Tailwind for all styling, no external state management library

---

## 5. Team Page & README Credits

**Team data:**
- GRUPO 12 — FIAP Pós Tech Management
- Felipe Lima Santos — linkedin.com/in/felipe-lima-santos
- Gabriela Gopfert — linkedin.com/in/gabrielagopfert
- Guilherme Zuliani — linkedin.com/in/guilherme-zuliani
- Rafael Massarollo — linkedin.com/in/rafael-massarollo
- Raildo Mascena — linkedin.com/in/raildomascena

**README:** Add a "Team" section at the bottom with the group name and each member's name linked to their LinkedIn profile.

**Demo — new "Team" screen:**
- Add a new `ScreenType` value (`'team'`) to `App.tsx`
- Create `src/components/Team.tsx` — displays the group name, course, and a card for each member with their name and a LinkedIn link
- Add a "Team" entry to the `Sidebar` component so users can navigate to the screen
- Style consistent with the existing dark theme (`bg-[#0d0e11]`, zinc palette)

---

## Out of Scope

- Adding real API calls (Gemini or otherwise)
- Authentication or backend infrastructure
- CI/CD pipeline setup
- Testing infrastructure

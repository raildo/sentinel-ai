# Contributing to SecureAI Analyst

## Prerequisites

- Node.js 22 (see `.nvmrc`)
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

## Definition of Done

A change is done only when all of these hold:

- Threat model: if the change touches the explanation flow, the audit trail, pseudonymization, tenancy or the Containment Executor, update `docs/threat-model/` (STRIDE and LINDDUN) in the same PR.
- No open high finding: no high-level item open in `docs/riscos.md` or in the threat model without a named owner and a mitigation, and no high or critical finding from `npm audit` or code review.
- ADR for structural decisions: data model, trust boundary, external dependency or model usage changes need a new or updated ADR in `docs/adr/` (context, decision, discarded alternative, reversal criterion).
- Contracts: API or event changes update `docs/contracts/openapi.yaml` or `asyncapi.yaml`.
- Prompts: changes to the explainer prompt create a new version under `prompts/explainer/`, never edit a released one.
- `npm run typecheck` and `npm run build` pass.
- Metrics shown in the UI stay aggregated (never per analyst) and simulated data stays labeled as simulated.

## CI: DAST job

The `dast` job (ZAP baseline) scans a deployed preview. It reads the repository variable `PREVIEW_URL` (Settings > Secrets and variables > Actions > Variables). Without it the job prints a notice and is skipped, so a green pipeline does not prove a DAST scan ran. Set `PREVIEW_URL` to the preview deployment URL to enable it.

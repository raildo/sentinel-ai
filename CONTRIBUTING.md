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

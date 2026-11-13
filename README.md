# SecureAI Analyst

[![CI](https://github.com/raildo/sentinel-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/raildo/sentinel-ai/actions/workflows/ci.yml)

> The repository is named `sentinel-ai`; the product is SecureAI Analyst.

An AI-powered cybersecurity incident triage and response demo built for FIAP Pós Tech Management.

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4
- Recharts, Framer Motion, Lucide React

## Run Locally

**Prerequisites:** Node.js 22 (see `.nvmrc`; `nvm use`)

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
├── components/     # UI screens and reusable components
├── constants.ts    # Mock data: incidents, techniques, audit records
├── types.ts        # Incident, Analysis and DecisionRecord types
└── lib/            # Utilities (class merging, hashing helpers)
prompts/
└── explainer/v1.md # Versioned explainer prompt (LLM only explains)
docs/
├── adr/            # Architecture decision records
├── riscos.md       # Risk register, KRIs and appetite
├── threat-model/   # STRIDE and LINDDUN
├── model-cards/    # Score model card (simulated)
└── contracts/      # OpenAPI /v1 and AsyncAPI (CloudEvents)
```

## Documentation and Evidence

The Phase 4 plan was applied to this prototype: calibrated score separated from the explanation, analyst decision panel, hash-chained audit trail, pseudonymization view, aggregated governance metrics and a handoff instead of automatic containment. All metrics are from a simulated golden dataset.

- [Phase 4 document](https://docs.google.com/document/d/1IlFgb6ZyW5DVhsV1yj1GIOsVeQP_hjTwVTGgSHUOZ-g/edit?usp=sharing)
- ADRs: [docs/adr](docs/adr/README.md)
- Risks, KRIs and appetite: [docs/riscos.md](docs/riscos.md)
- Threat model: [docs/threat-model](docs/threat-model/README.md)
- Model card (simulated): [docs/model-cards/score-v0.md](docs/model-cards/score-v0.md)
- Contracts: [OpenAPI](docs/contracts/openapi.yaml), [AsyncAPI](docs/contracts/asyncapi.yaml)
- Versioned prompt: [prompts/explainer/v1.md](prompts/explainer/v1.md)

## Team

**GRUPO 12 — FIAP Pós Tech Management**

| Name | LinkedIn |
|------|----------|
| Felipe Lima Santos | [linkedin.com/in/felipe-lima-santos](https://linkedin.com/in/felipe-lima-santos) |
| Gabriela Gopfert | [linkedin.com/in/gabrielagopfert](https://linkedin.com/in/gabrielagopfert) |
| Guilherme Zuliani | [linkedin.com/in/guilherme-zuliani](https://linkedin.com/in/guilherme-zuliani) |
| Rafael Massarollo | [linkedin.com/in/rafael-massarollo](https://linkedin.com/in/rafael-massarollo) |
| Raildo Mascena | [linkedin.com/in/raildomascena](https://linkedin.com/in/raildomascena) |

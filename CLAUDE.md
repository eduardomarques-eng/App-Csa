# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CSA CalcPro** is a Brazilian structural engineering calculator for dimensioning aluminum profiles and glass in windows (janelas), doors (portas), railings (guarda-corpos), and curtain walls (pele de vidro), in compliance with:
- **NBR 6123** – Wind loads on buildings
- **NBR 7199** – Glass in civil construction
- **NBR 10821** – External window frames

The app is a single-page React application with an embedded Express backend serving as dev proxy and auth API.

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start development server (Express + Vite on port 3000)
npm run build     # Production build (Vite only)
npm run lint      # TypeScript type check (tsc --noEmit)
npm run preview   # Preview production build
```

There is no test suite. Type checking (`npm run lint`) is the only automated code quality check.

Copy `.env.example` to `.env` before running. Required env vars: `JWT_SECRET`, `REFRESH_SECRET`, `GEMINI_API_KEY`. `DATABASE_URL` is referenced but SQLite is used in practice (`esquadrias.db` created at runtime).

## Architecture

### Dev Server (`server.ts`)

The entry point starts an Express server that:
1. Mounts `/api/auth` routes (login/register)
2. In development, embeds Vite as middleware (HMR, hot reload)
3. In production, serves the `dist/` static build

This means `npm run dev` runs both the API and the frontend from a single process on port 3000.

### Frontend State: `src/store/ConfiguratorContext.tsx`

All user inputs live in a single `ConfigState` object managed by `useReducer`. The context exposes `{ state, dispatch }` to all components. Dispatching actions like `SET_GEOMETRY`, `SET_WIND`, `SET_CATEGORY`, etc. mutates the state and triggers the calculation pipeline via `useEffect` in `App.tsx`.

`ConfigState` allows empty strings (`number | ""`) for numeric fields to support controlled inputs. The `ValidatedConfig` type (in `src/core/types.ts`) is a narrowed version where all numerics are guaranteed to be `number` — always work with `ValidatedConfig` inside engines and services.

### Calculation Pipeline

The main `useEffect` in `App.tsx` watches `state` and (with 300ms debounce):

1. Calls `getValidatedConfig(state)` (`src/logic/validation.ts`) — returns `null` if required fields are missing, or a `ValidatedConfig` if all required fields are present.
2. Calls `runStructuralEngine(validatedConfig, profiles, glasses, typology)` (`src/engines/structuralEngine.ts`), which:
   - Calls `calculateWindPressure()` → produces `CalculationMetrics`
   - Iterates over every profile × glass combination, calling:
     - `calculateElu()` — Ultimate Limit State (moment and shear)
     - `calculateEls()` — Serviceability Limit State (deflection)
     - `calculateGlass()` — glass stress check (NBR 7199)
   - Calls `rankSolutions()` to sort and classify viable solutions
3. Results (`{ metrics, solutions }`) are set into component state and rendered immediately.

### Structural Systems

The `structuralSystem` string drives the moment/deflection coefficients in `eluEngine` and `elsEngine`:

| System | Moment coeff (km) | Deflection coeff (kf) |
|---|---|---|
| Biapoiado | 8 | 5/384 |
| Engastado | 12 | 1/384 |
| Consola | 2 | 1/8 |
| Contínuo | 10 | 2/384 |
| Engastado-Apoiado | 8 | 1/185 |

### Catalogs and Constants

**Important:** There are two constants files:
- `src/core/constants.ts` — the **active** catalog used by the main application (imported by `App.tsx`, `catalogService.ts`, `comparisonService.ts`)
- `src/logic/constants.ts` — a legacy/alternate version with different supplier IDs and profile data; not imported by the main app

When adding or modifying profiles, typologies, suppliers, or glass options, edit `src/core/constants.ts`.

### Backend (`src/server/`)

Follows a layered Clean Architecture structure that is currently partially implemented:

- `interfaces/routes/` — Express route definitions
- `interfaces/controllers/` — Request/response handling
- `interfaces/middlewares/` — `authMiddleware.ts`, `errorHandler.ts`
- `application/services/CatalogAIService.ts` — Calls Google Gemini to extract aluminum profile data from technical text (structured JSON output)
- `infrastructure/auth/AuthService.ts` — JWT (15min access / 7d refresh) + bcrypt password hashing
- `infrastructure/database/sqlite.ts` — Better-SQLite3 instance; creates `users` and `catalogs` tables on first run

Currently only auth routes are wired: `POST /api/auth/login` and `POST /api/auth/register`.

### Path Aliases

The `@` alias (in both `tsconfig.json` and `vite.config.ts`) resolves to the **repository root** (`.`), not `src/`. So `@/src/core/types` maps to `./src/core/types`.

## Key Domain Types (`src/core/types.ts`)

- `ItemCategory` — `"janela" | "porta" | "guarda-corpo" | "pele-de-vidro"`
- `SupportCondition` — `"pinned" | "fixed" | "free"`
- `Solution` — the output of one profile+glass calculation pass; includes `elu`, `els`, `glassResult`, `rank`, `efficiencyClass`
- `StatusClassificacao` — `"APROVADO_CONFORTO"` (≤70%), `"APROVADO_LIMITE"` (70–95%), `"CRITICO"` (95–100%), `"REPROVADO"` (>100%)
- `VerificationResult` — produced by `verificationService.generateVerificationResult()`; drives the status badges in the UI

## PDF Export

`src/logic/pdfGenerator.ts` uses `jsPDF` + `jspdf-autotable` to produce the calculation report ("Memorial de Cálculo"). It is triggered from `App.tsx:handleExportPDF()` and requires results to be present and the report preview to be visible first.

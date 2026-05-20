# Vigilant UI

The frontend dashboard for [Vigilant MLOps](https://github.com/VigilantMLOps/legacy-vigilant-mlops) — a platform for monitoring ML model health, evaluations, and feature drift.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — dev server and bundler
- **Tailwind CSS** — styling
- **React Router v7** — client-side routing
- **TanStack Query** — data fetching and caching
- **Recharts** — charts and sparklines
- **Axios** — HTTP client
- **Supabase** — auth and real-time data

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Overview | High-level model health summary and stats |
| `/evaluation` | Evaluation | Model evaluation results and metrics |
| `/feature-drift` | Feature Drift | Feature distribution drift monitoring |

## Getting Started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` and connects to the backend at `https://vigilant-mlops.onrender.com`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type check (no emit) |

## Project Structure

```
src/
├── api/          # Axios client, API functions, and types
├── components/   # Shared UI components (StatCard, Sparkline)
├── context/      # React context (FiltersContext)
├── layout/       # Shell, Header, Sidebar
└── pages/        # Route-level page components
```
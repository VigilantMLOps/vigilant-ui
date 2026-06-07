# Vigilant UI

The frontend dashboard for [vigilant-api](https://github.com/VigilantMLOps/vigilant-api) — a dashboard for ML model evaluations, incidents, and feature drift.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — dev server and bundler
- **Tailwind CSS** — styling
- **React Router v7** — client-side routing
- **TanStack Query** — data fetching and caching
- **Recharts** — charts
- **Axios** — HTTP client

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Overview | Live incidents, latest model metrics, time-window filter |
| `/evaluation` | Evaluation | Pre-prod metrics, ROC curve, confusion matrix, per-feature stats |
| `/feature-drift` | Feature Drift | PSI / KS / Chi² drift detection against the production baseline |

## Getting Started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` and connects to the deployed backend at `https://vigilant-api.duckdns.org` by default.

To point it elsewhere, edit [`public/env.js`](public/env.js) — its `window.__env__.API_URL` is loaded by `index.html` before the bundle and takes precedence over the build-time default. (You can also set `VITE_API_URL` at build time, but the runtime override is what the Docker image uses.)

## Docker

```bash
docker build -t vigilant-ui .
docker run -p 8080:80 -e API_URL=https://your-backend.example.com vigilant-ui
```

| Variable | Default | Description |
|---|---|---|
| `API_URL` | `https://vigilant-api.duckdns.org` | Backend API base URL |

The entrypoint rewrites `env.js` with the value of `$API_URL` at container startup, so the same image can be promoted across environments without rebuilding.

The image ships an nginx config (`nginx.conf`) with an SPA `try_files` fallback so deep links and refreshes resolve to `index.html`. `env.js` is served `no-store` so a deploy that changes `API_URL` takes effect on the next page load; hashed assets under `/assets/` get a 1-year immutable cache.

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
public/
└── env.js        # Runtime config (window.__env__.API_URL) — overwritten by Docker entrypoint
src/
├── api/          # Axios client, API functions, and types
├── components/   # Shared UI components (StatCard, Sparkline)
├── context/      # React context (filters)
├── layout/       # Shell, Header, Sidebar
└── pages/        # Route-level page components (Overview, Evaluation, FeatureDrift)
Dockerfile        # Multi-stage build → nginx:alpine
nginx.conf        # SPA fallback + cache headers
docker-entrypoint.sh  # Injects API_URL into env.js at startup
```

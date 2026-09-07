# Dispatch Dashboard

Responsive delivery-operations dashboard built with React, TypeScript, Vite, Recharts, and
Lucide icons.

## Run locally

```bash
npm install
npm run dev
```

The dashboard runs at `http://localhost:5173` and proxies `/api` requests to the backend at
`http://localhost:4000`.

## Views

- Overview with KPIs, performance charts, live operations, activity, and recent orders
- Searchable and filterable order management
- Live delivery routes and active-driver monitoring
- Driver network and performance cards
- Customer directory and account metrics
- Business analytics and smart operational insights
- Workspace, dispatch, and notification settings

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |

Current dashboard data is intentionally centralized in `src/data/mockData.ts`. Replace that data
source with typed API clients as backend authentication and operational endpoints are introduced.

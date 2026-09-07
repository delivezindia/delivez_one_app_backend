# Delivery App Backend

A production-oriented Node.js backend starter built with TypeScript, Express, PostgreSQL,
Prisma, Zod, Pino, and Vitest.

The repository also contains a separate, responsive React operations dashboard in
[`dashboard/`](dashboard/README.md).

## Included

- Feature-based modules and versioned REST routes
- Runtime environment and request validation
- PostgreSQL schema and tracked migrations
- Structured JSON logs with request IDs and secret redaction
- Security headers, CORS allowlist, request size limits, and rate limiting
- Consistent error envelopes and graceful process shutdown
- Liveness and database readiness probes
- Strict TypeScript, ESLint, Prettier, Vitest, and coverage
- GitHub Actions verification for formatting, types, lint, tests, audit, and build
- Multi-stage production Docker image and local Docker Compose stack
- Example Orders API with cursor pagination and status-transition rules

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- PostgreSQL 16, or Docker Desktop

## Local setup

```bash
npm install
cp .env.example .env
docker compose up -d postgres
npm run db:generate
npm run db:deploy
npm run dev
```

On Windows PowerShell, replace the copy command with:

```powershell
Copy-Item .env.example .env
```

This backend uses its own PostgreSQL database. Configure the dedicated database
in `.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/delivery_app_backend?schema=public
```

This keeps all delivery data and migration history separate from other
applications. For a clean server deployment, run:

```bash
npm run deploy:setup
```

That command performs a locked dependency install, applies every tracked
migration, generates Prisma Client, and builds the production application.

The API starts on `http://localhost:4000` by default.

## Dashboard

Run the dashboard independently in a second terminal:

```bash
cd dashboard
npm install
npm run dev
```

It starts at `http://localhost:5173`. The dashboard includes Overview, Orders, Live Deliveries,
Drivers, Customers, Analytics, and Settings views. Its sample operational data is isolated in
`dashboard/src/data/mockData.ts` so it can be replaced with authenticated API clients later.

To run PostgreSQL, the API, and the production dashboard together:

```bash
docker compose up --build
```

The containerized dashboard is served at `http://localhost:3000`.

## Useful commands

| Command                 | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Run with reload during development       |
| `npm run build`         | Compile the production bundle            |
| `npm start`             | Run the compiled application             |
| `npm test`              | Run the test suite once                  |
| `npm run test:coverage` | Run tests with coverage                  |
| `npm run typecheck`     | Check TypeScript without emitting files  |
| `npm run lint`          | Run static analysis                      |
| `npm run format`        | Apply repository formatting              |
| `npm run db:migrate`    | Create and apply a development migration |
| `npm run db:deploy`     | Apply tracked migrations in deployment   |
| `npm run db:status`     | Check whether migrations are up to date  |
| `npm run db:studio`     | Open Prisma Studio                       |
| `npm run deploy:setup`  | Install, migrate, generate, and build     |

## HTTP endpoints

| Method  | Path                             | Description                        |
| ------- | -------------------------------- | ---------------------------------- |
| `GET`   | `/health/live`                   | Process liveness probe             |
| `GET`   | `/health/ready`                  | Database readiness probe           |
| `GET`   | `/api/v1`                        | API metadata                       |
| `POST`  | `/api/v1/orders`                 | Create an order                    |
| `GET`   | `/api/v1/orders`                 | List orders with cursor pagination |
| `GET`   | `/api/v1/orders/:orderId`        | Get an order                       |
| `PATCH` | `/api/v1/orders/:orderId/status` | Advance order status               |

Example order request:

```json
{
  "customerId": "4f249f77-8bd1-4faa-8e44-17d9e29a7d61",
  "pickupAddress": "12 Market Street, Bengaluru",
  "deliveryAddress": "82 Residency Road, Bengaluru",
  "deliveryFee": 49,
  "notes": "Call on arrival",
  "items": [{ "name": "Package", "quantity": 1, "unitPrice": 500 }]
}
```

The referenced customer must already exist. Authentication and user onboarding should be the
next domain module; the schema deliberately never accepts a client-supplied password hash.

## Architecture

```text
src/
├── config/          # Validated runtime configuration
├── lib/             # Database, logging, and domain-neutral primitives
├── middleware/      # HTTP cross-cutting concerns
├── modules/         # Feature slices (routes, schemas, controllers, services)
├── types/           # Type augmentation
├── app.ts           # Express composition (safe to import in tests)
├── routes.ts        # API version routing
└── server.ts        # Network listener and process lifecycle
```

Keep business logic in feature services, validation at the HTTP boundary, and database access
behind Prisma. Add authentication and authorization before exposing order routes publicly.

## Deployment notes

- Store `DATABASE_URL` and future auth keys in a secret manager, never in source control.
- Run `npm run db:deploy` once as a release task before rolling out application instances.
- Put the API behind TLS and set `TRUST_PROXY=true` only when requests come through a trusted proxy.
- Use separate databases and credentials for development, test, staging, and production.
- Add authentication, authorization, audit events, observability export, and backups according to
  the production environment and compliance requirements.

# Production configuration

All Delevez One App deployment values come from environment variables. Keep
production `.env` files and credentials out of source control. The module can
reuse the root `DATABASE_URL` and automatically selects the `delevez_one_app`
schema. Set `DELEVEZ_DATABASE_URL` only when an explicit module override is
required.

```text
DELEVEZ_NODE_ENV=production
DELEVEZ_DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/inventory_management?schema=delevez_one_app
DELEVEZ_JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
DELEVEZ_CORS_ORIGIN=https://www.your-domain.com,https://admin.your-domain.com
DELEVEZ_PUBLIC_API_BASE_URL=https://api.your-domain.com/api/v1
```

`DELEVEZ_PUBLIC_API_BASE_URL` is used when the API returns absolute service
image URLs. It must be the deployed HTTPS API base, including `/api/v1`.

Website, Flutter, and other clients should keep their own configurable base URL
and call endpoints relative to it. For example:

```text
API_BASE_URL=https://api.your-domain.com/api/v1
POST {API_BASE_URL}/auth/login
GET  {API_BASE_URL}/services
```

The module refuses to start in production when its JWT secret or CORS allowlist
is unsafe, or when its public API URL does not use HTTPS.

Personal Courier deployment, idempotency, routing, and payment requirements are
documented in `PERSONAL_COURIER_API.md`. Online card payment remains disabled
until a PCI-compliant provider and signed webhook handling are configured.

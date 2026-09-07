# Personal Courier API

Personal Courier is served by the main EZ Logistics process under
`/api/v1`. All prices are calculated again by the server; clients must never
submit or trust a payable total.

## Base URL and authentication

Development base URL:

```text
http://localhost:3001/api/v1
```

Use the deployed HTTPS base URL in production. Except for the options endpoint,
send the user JWT from OTP verification:

```text
Authorization: Bearer <accessToken>
```

## Endpoints

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| GET | `/personal-courier/options` | Public | Service, parcel, packaging, content, insurance, payment, and limit options |
| POST | `/personal-courier/quote` | User JWT | Validate details and calculate a server quote |
| POST | `/personal-courier/bookings` | User JWT | Create a booking; requires `Idempotency-Key` |
| GET | `/personal-courier/bookings?page=1&limit=10` | User JWT | List the signed-in user's bookings |
| GET | `/personal-courier/bookings/:id` | User JWT | Get one owned booking |
| POST | `/personal-courier/bookings/:id/cancel` | User JWT | Cancel a booking before pickup |
| GET | `/addresses` | User JWT | List saved addresses |
| POST | `/addresses` | User JWT | Save an address |
| PUT | `/addresses/:id` | User JWT | Replace an owned saved address |
| DELETE | `/addresses/:id` | User JWT | Delete an owned saved address |

Booking and address queries are always scoped to the authenticated user. An
administrator JWT cannot use customer endpoints.

## Quote and booking body

Use this same body for `POST /personal-courier/quote` and
`POST /personal-courier/bookings`:

```json
{
  "pickup": {
    "label": "Home",
    "contactName": "Ravi Kumar",
    "countryCode": "+91",
    "phoneNumber": "9876543210",
    "addressLine1": "B-1204, Lodha Park",
    "addressLine2": "Near Shreyas Cinema",
    "landmark": null,
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400077",
    "country": "India",
    "latitude": 19.076,
    "longitude": 72.8777
  },
  "dropoff": {
    "label": "Office",
    "contactName": "Jane Smith",
    "countryCode": "+91",
    "phoneNumber": "9876543211",
    "addressLine1": "DLF Cyber City, Tower A, 6th Floor",
    "addressLine2": null,
    "landmark": null,
    "city": "Gurugram",
    "state": "Haryana",
    "postalCode": "122002",
    "country": "India",
    "latitude": 28.4949,
    "longitude": 77.0895
  },
  "serviceType": "SURFACE_EXPRESS",
  "pickupSchedule": {
    "type": "ASAP",
    "scheduledAt": null
  },
  "package": {
    "parcelSize": "MEDIUM",
    "actualWeightKg": 5,
    "lengthCm": 30,
    "widthCm": 20,
    "heightCm": 15,
    "needsBox": true,
    "packagingType": "EXTRA_SECURE",
    "specialHandling": false,
    "fragile": false,
    "secureHandling": true,
    "contentCategory": "DOCUMENTS",
    "contentDescription": "Signed documents",
    "declaredValue": 25000,
    "insuranceType": "FULL"
  },
  "paymentMethod": "PAY_ON_DELIVERY"
}
```

For a scheduled pickup, use `type: "SCHEDULED"` and send an ISO-8601 time
between 15 minutes and 90 days in the future. Latitude and longitude are
optional but must be sent together. When coordinates are absent, the quote
clearly notes that distance charges will be finalized after routing data is
available.

For booking creation, also send a unique header such as:

```text
Idempotency-Key: web-7e8610de-447b-46d3-a519-3df9afbb94dc
```

Retrying the exact request with the same key returns the original booking and
does not create a duplicate. Reusing the key with changed details returns HTTP
`409`.

## Supported values

- Service: `BIKE_PRIORITY`, `SAME_DAY`, `SURFACE_EXPRESS`, `NEXT_DAY`.
  `HYBRID_DRONE` is exposed as unavailable until eligibility infrastructure is
  configured.
- Parcel: `SMALL`, `MEDIUM`, `LARGE`, `CUSTOM`.
- Packaging: `STANDARD`, `EXTRA_SECURE`, `WOODEN_CRATE`, `OWN_PACKAGING`.
- Insurance: `FULL`, `BASIC`, `NONE`.
- Content categories come from `/personal-courier/options`; clients should not
  hard-code them.

## Saved-address body

The address fields match the pickup/drop-off objects. Add:

```json
{ "isDefault": true }
```

The first saved address automatically becomes the default. Deleting the
default promotes the most recently updated remaining address.

## Payment boundary

`PAY_ON_DELIVERY` is the enabled method and creates a `CONFIRMED` booking.
`ONLINE` is advertised as unavailable and returns HTTP `503`. Card data is not
accepted or stored. Enable online payment only after integrating a
PCI-compliant provider with server-side order creation, signed webhook
verification, and idempotent payment reconciliation.

## Production checklist

1. Run `npm run db:deploy` from `delevez-one-app` during deployment.
2. Start only the main repository server with `npm start`.
3. Set the website's `VITE_API_BASE_URL` to the deployed HTTPS `/api/v1` URL.
4. Configure the exact website origins in `DELEVEZ_CORS_ORIGIN`.
5. Replace the development OTP response with a real SMS provider before
   production; development OTP values are automatically omitted when
   `NODE_ENV=production`.
6. Add a route/geocoding provider before promising final distance-based prices
   for text-only addresses.
7. Add a PCI-compliant payment provider before enabling `ONLINE`.

## Local test sequence

1. Run the main server from the repository root with `npm start`.
2. Register or log in and verify the development OTP using the authentication
   endpoints in `AUTH_API.md`.
3. Copy `data.accessToken` into Postman Bearer Token authorization.
4. Call `GET /personal-courier/options`.
5. Call `POST /personal-courier/quote` with the body above.
6. Call `POST /personal-courier/bookings` with the same body and a fresh
   `Idempotency-Key` header.
7. Call `GET /personal-courier/bookings` to verify the persisted PostgreSQL
   record.

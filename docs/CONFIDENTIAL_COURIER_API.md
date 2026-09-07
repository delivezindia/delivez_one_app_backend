# Confidential Courier API

Base URL: `http://localhost:3001/api/v1/confidential-courier`

The module stores operational booking metadata only. It does not accept document uploads, document text, government-ID images, or government-ID numbers.

## Endpoints

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| GET | `/options` | Public | Document, envelope, security, handover, speed, and payment options |
| POST | `/quote` | Customer bearer token | Validate details and return server-calculated pricing |
| POST | `/bookings` | Customer bearer token | Create an idempotent secure booking |
| GET | `/bookings?page=1&limit=10` | Customer bearer token | List the signed-in customer's bookings |
| GET | `/bookings/:id` | Customer bearer token | Read one owned booking |
| POST | `/bookings/:id/cancel` | Customer bearer token | Cancel an eligible owned booking |
| POST | `/bookings/:id/payments/sandbox` | Customer bearer token | Simulate sandbox payment success or failure |

`POST /bookings` requires an `Idempotency-Key` header containing 8–100 letters, numbers, dots, underscores, colons, or hyphens.

## Quote and booking body

```json
{
  "pickup": {
    "label": "Office",
    "contactName": "Authorized Sender",
    "countryCode": "+91",
    "phoneNumber": "9876543210",
    "addressLine1": "12 Business Park",
    "addressLine2": null,
    "landmark": null,
    "city": "New Delhi",
    "state": "Delhi",
    "postalCode": "110001",
    "country": "India",
    "latitude": null,
    "longitude": null
  },
  "dropoff": {
    "label": "Recipient",
    "contactName": "Authorized Recipient",
    "countryCode": "+91",
    "phoneNumber": "9876543211",
    "addressLine1": "44 Legal Chambers",
    "addressLine2": null,
    "landmark": null,
    "city": "New Delhi",
    "state": "Delhi",
    "postalCode": "110002",
    "country": "India",
    "latitude": null,
    "longitude": null
  },
  "document": {
    "type": "LEGAL",
    "envelopeSize": "A4",
    "pageCount": 20,
    "description": "Sealed legal agreement envelope",
    "containsOriginals": true,
    "requiresReturn": false,
    "declaredValue": 25000,
    "complianceAccepted": true
  },
  "security": {
    "level": "TAMPER_EVIDENT",
    "handoverMethod": "OTP_AND_SIGNATURE",
    "recipientIdRequired": true,
    "pickupProofRequired": true
  },
  "schedule": {
    "type": "ASAP",
    "scheduledAt": null
  },
  "deliverySpeed": "PRIORITY",
  "paymentMethod": "PAY_ON_DELIVERY"
}
```

Call `GET /options` rather than hard-coding enum choices or rates. `ONLINE` uses the clearly labelled `DELIVEZ_SANDBOX` test gateway; it does not perform a real payment or collect financial credentials.

## Deployment

From `delevez-one-app`:

```powershell
npm run db:generate
npm run db:deploy
npm test
```

The migration is `20260825110000_add_confidential_courier_booking`.

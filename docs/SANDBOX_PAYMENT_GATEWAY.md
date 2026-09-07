# Delivez Sandbox Payment Gateway

This gateway is for development and demonstrations only. It never charges money and never accepts card numbers, CVVs, UPI IDs, bank credentials, or wallet credentials.

## Supported booking modules

- Personal Courier: `POST /api/v1/personal-courier/bookings/:id/payments/sandbox`
- Confidential Courier: `POST /api/v1/confidential-courier/bookings/:id/payments/sandbox`

Both endpoints require a customer bearer token, ownership of the booking, and a booking created with `paymentMethod: "ONLINE"`.

```json
{
  "method": "UPI",
  "outcome": "SUCCESS"
}
```

Supported methods are `UPI`, `CARD`, `WALLET`, and `NET_BANKING`. Supported outcomes are `SUCCESS` and `FAILURE`.

- `SUCCESS` changes the payment to `PAID` and the booking to `CONFIRMED`.
- `FAILURE` changes the payment to `FAILED` while leaving the booking in `PAYMENT_PENDING`, allowing another attempt.
- Replaying payment after success is idempotent.
- The amount always comes from the stored server-calculated booking total; the endpoint does not accept an amount.
- References start with `DUMMY-PAY-` or `DUMMY-FAIL-` and the provider is always `DELIVEZ_SANDBOX`.

`GET /api/v1/personal-courier/options` and `GET /api/v1/confidential-courier/options` expose the gateway notice and supported methods in `data.sandboxGateway`.

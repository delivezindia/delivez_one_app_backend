# User Authentication API

The user authentication flow works with the website, Flutter, Postman, and
other JSON clients. The Delevez module is served by the main EZ Logistics
process, so start only the main backend from the repository root:

```powershell
npm start
```

## Base URLs

- Website or iOS simulator: `http://localhost:3001/api/v1`
- Android emulator: `http://10.0.2.2:3001/api/v1`
- Physical phone: `http://<your-computer-LAN-IP>:3001/api/v1`

## Authentication flow

Registration and login use two steps:

1. Submit registration or login details to generate an OTP challenge.
2. Submit the challenge ID and six-digit OTP to receive the Bearer JWT.

OTP hashes and expiry information are stored in PostgreSQL. The default expiry
is five minutes and each challenge permits five incorrect attempts. Generating
a new challenge invalidates the user's previous unused challenge.

While `NODE_ENV=development`, responses contain `developmentOtp`, and the
website displays it on the OTP screen. Production responses never contain the
OTP. Connect an SMS provider before using this flow in production.

## Register

```text
POST /auth/register
```

```json
{
  "fullName": "Ravi Kumar",
  "countryCode": "+91",
  "mobileNumber": "9876543210",
  "email": "ravi@example.com",
  "password": "Password123",
  "confirmPassword": "Password123",
  "acceptedTerms": true
}
```

`email` is optional. Passwords must contain uppercase, lowercase, and numeric
characters and be 8–72 characters long. A successful development response is:

```json
{
  "status": "success",
  "message": "Registration successful. Verify the OTP to continue.",
  "data": {
    "otpRequired": true,
    "challengeId": "00000000-0000-4000-8000-000000000000",
    "expiresAt": "2026-08-24T10:05:00.000Z",
    "destination": "+91 ******3210",
    "developmentOtp": "123456",
    "developmentOnly": true
  }
}
```

## Login

```text
POST /auth/login
```

```json
{
  "countryCode": "+91",
  "mobileNumber": "9876543210",
  "rememberMe": true
}
```

The registered mobile number returns an OTP challenge in the same format as
registration. User login does not require a password; administrator login
remains password protected.
`rememberMe` is retained by the challenge and determines the JWT lifetime after
verification.

## Verify OTP

```text
POST /auth/verify-otp
```

```json
{
  "challengeId": "COPY_FROM_REGISTER_OR_LOGIN_RESPONSE",
  "otp": "COPY_DEVELOPMENT_OTP"
}
```

A valid OTP returns the user and JWT:

```json
{
  "status": "success",
  "message": "OTP verified successfully.",
  "data": {
    "user": {
      "id": "USER_ID",
      "fullName": "Ravi Kumar",
      "countryCode": "+91",
      "mobileNumber": "9876543210",
      "email": "ravi@example.com",
      "role": "USER"
    },
    "accessToken": "JWT_TOKEN",
    "tokenType": "Bearer",
    "expiresIn": "30d"
  }
}
```

## Resend OTP

```text
POST /auth/resend-otp
```

```json
{
  "challengeId": "COPY_FROM_REGISTER_OR_LOGIN_RESPONSE"
}
```

The previous unused challenge is invalidated and a new challenge is returned.
Use the new `challengeId` and OTP for verification. This route shares the
authentication rate limit.

## Current user

```text
GET /auth/me
Authorization: Bearer <accessToken>
```

Missing, invalid, or expired tokens return HTTP `401`.

## Check login status

```text
GET /auth/check
Authorization: Bearer <accessToken>
```

This endpoint always returns HTTP `200`. `data.isLoggedIn` is `true` only when
the Bearer token is valid and its user still exists.

## Test with Postman

1. Start PostgreSQL and run `npm start` from the backend repository root.
2. Send `POST http://localhost:3001/api/v1/auth/register` with **Body → raw → JSON**.
3. Copy `data.challengeId` and `data.developmentOtp` from the response. To test
   resending, submit the challenge ID to `POST /auth/resend-otp` and use the new
   challenge returned by that request.
4. Send the active challenge and OTP to
   `POST http://localhost:3001/api/v1/auth/verify-otp`.
5. Copy `data.accessToken` from the verification response.
6. Send `GET http://localhost:3001/api/v1/auth/me` with **Authorization → Bearer Token**.
7. To test login, send the registered mobile number to `POST /auth/login`, then
   verify its newly generated OTP.

Use a new mobile number and email when repeating registration.

## Website flow

Run `Delivery_app_web` with `npm run dev`, open `http://localhost:5173`, and
select **Login / Signup**. The responsive form uses the same mobile fields as
the Flutter design. Login asks only for the mobile number. In development it
shows the generated OTP with a
**Use this OTP** button. Successful OTP verification redirects to:

```text
http://localhost:5173/user/dashboard
```

The route verifies the JWT with `/auth/me` before showing the dashboard.

## Flutter request sequence

```dart
final login = await dio.post('/auth/login', data: {
  'countryCode': '+91',
  'mobileNumber': '9876543210',
  'rememberMe': true,
});

final challenge = login.data['data'];
final verified = await dio.post('/auth/verify-otp', data: {
  'challengeId': challenge['challengeId'],
  'otp': enteredOtp,
});

final token = verified.data['data']['accessToken'];
dio.options.headers['Authorization'] = 'Bearer $token';
final profile = await dio.get('/auth/me');
```

Use secure storage for mobile JWTs and HTTPS in production.

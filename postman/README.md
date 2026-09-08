# Passwordless authentication in Postman

## Deploy the backend changes first

On your backend server, check DATABASE_URL targets the intended database, then run:

```sh
npm ci
npm run db:deploy
npm run db:generate
npm run build
```

Restart your backend service. The migration makes password_hash optional, adds an optional device ID to OTP challenges, and creates user_devices. Existing accounts/passwords are preserved. These workspace changes have not been deployed or applied to the production database.

## Set up Postman

1. Import Delivery_App_Backend_Auth.postman_collection.json again.
2. Click the collection → Variables. Set fullName, countryCode, mobileNumber and email. No password is needed.
3. baseUrl is http://40.81.244.167:3012/api/v1. For local testing use http://localhost:4000/api/v1.
4. Select No environment to avoid overriding the collection variables.
5. Send Health → Readiness. Expect HTTP 200 with database connected.

## Register

Send **1. Register**, POST {{baseUrl}}/auth/register:

```json
{
  "fullName": "Test User",
  "countryCode": "+91",
  "mobileNumber": "9876543210",
  "email": "test@example.com",
  "acceptedTerms": true
}
```

No password or confirmPassword. Email is optional. Full name must have 2–100 characters, mobile number 7–15 digits, and acceptedTerms must be true. Duplicate phone/email returns 409. Expect 201 with a challengeId and OTP, automatically saved by Postman.

Send **2. Verify OTP**, POST {{baseUrl}}/auth/verify-otp:

```json
{ "challengeId": "{{challengeId}}", "otp": "{{otp}}" }
```

Expect 200 with data.accessToken and data.user. Postman saves the token.

## Login: mobile number, then OTP

Send **Login with OTP**, POST {{baseUrl}}/auth/login:

```json
{ "mobileNumber": "9876543210" }
```

Neither password nor deviceId is required. countryCode defaults to +91; supply it for other countries. Optional rememberMe=true selects the longer token expiry.

Expect 200 with a challengeId. Send **Verify Login OTP** next with challengeId and otp, just like registration verification. Expect 200 with an access token. Unknown phone returns 404.

For a new code, send **Resend OTP** before verification with { "challengeId": "{{challengeId}}" }. Postman saves the replacement challenge and code. Codes currently expire in five minutes, allow five incorrect attempts, and can be used only once.

## Optional device storage

If your app has a stable installation identifier, optionally include it during OTP verification:

```json
{
  "challengeId": "{{challengeId}}",
  "otp": "{{otp}}",
  "deviceId": "android-installation-001"
}
```

deviceId accepts 1–255 letters, numbers, dots, underscores, colons or hyphens. Registration also accepts an optional deviceId, retained on its challenge and through resend. Verification may supply the current device ID. The device is associated with the user only after successful verification, in the same database transaction. Repeated verification from the same user/device updates lastLoginAt instead of creating duplicates. Without a device ID, verification still succeeds and no device record is created.

Send **Get My Devices**, GET {{baseUrl}}/auth/devices. The collection supplies Authorization: Bearer {{accessToken}}. The response contains data.devices, with id, deviceId, createdAt and lastLoginAt for only the authenticated user, most recent first. This is device history, not active sessions or proof of device ownership.

## Profile and logout

Send Get Current User to see your profile. Logout - Clear Local Token clears the collection token and checks /auth/check without authentication. There is no server-side revocation; copied JWTs remain valid until expiry and device records are retained.

## Current limitations

Existing password accounts and administrator password login still work. New passwordless accounts use OTP login. OTPs are currently returned in API responses even in production; SMS delivery is not implemented. Integrate delivery and remove production OTP response fields before using this as real phone verification. JWT expiry defaults to 7 days, or 30 days with rememberMe=true. Example responses are illustrative, not live captures.

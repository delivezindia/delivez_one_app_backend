# Administrator API

Administrator accounts are not created by the public registration endpoint.
Public registration always creates role `USER`, even if a client includes a
different role in its JSON body. An administrator is provisioned from trusted
server environment variables with this command from the repository root:

```powershell
npm run db:seed-admin
```

Configure these values in `.env` before running the command:

```text
ADMIN_FULL_NAME=System Admin
ADMIN_COUNTRY_CODE=+91
ADMIN_MOBILE_NUMBER=9999999999
ADMIN_EMAIL=admin@delevez.com
ADMIN_PASSWORD=Admin@123456
```

Running the seed repeatedly is safe: it updates the configured account and
ensures its role remains `ADMIN`.

## Administrator login

**Endpoints supported:**
- `POST http://localhost:4000/api/v1/admin/login`
- `POST http://localhost:4000/api/v1/admin/auth/login`

### Option 1: Login via Email

```json
{
  "email": "admin@delevez.com",
  "password": "Admin@123456",
  "rememberMe": false
}
```

### Option 2: Login via Mobile Number

```json
{
  "countryCode": "+91",
  "mobileNumber": "9999999999",
  "password": "Admin@123456",
  "rememberMe": false
}
```

### Option 3: Login via Username / Identifier

```json
{
  "identifier": "admin@delevez.com",
  "password": "Admin@123456"
}
```

Copy `data.accessToken` from the successful response. A normal user's
credentials are rejected by this endpoint, and administrator credentials are
rejected by the normal `/api/v1/auth/login` endpoint.

## Administrator profile

**Endpoints supported:**
- `GET http://localhost:4000/api/v1/admin/me`
- `GET http://localhost:4000/api/v1/admin/auth/me`

Header: `Authorization: Bearer <accessToken>`

## List users

`GET http://localhost:4000/api/v1/admin/users?page=1&limit=20&search=`

Header: `Authorization: Bearer <accessToken>`

The user listing is paginated, accepts an optional name/email/mobile `search`,
limits each page to 100 records, and never returns password hashes.

# Services API

The catalog initially contains these six database-backed services:

1. Personal Courier
2. Confidential Courier
3. Airport Luggage
4. Forgot Something
5. Gift & Surprise
6. Personal Return Pickup

Seed or safely refresh them from the repository root with:

```powershell
npm --prefix delevez-one-app run db:seed-services
```

The seed updates catalog text/order without deleting or replacing uploaded
images.

## Public service listing

No token is required:

```text
GET http://localhost:3001/api/v1/services
GET http://localhost:3001/api/v1/services/personal-courier
```

Only active services are returned, ordered by `displayOrder`. Each item contains
an absolute `imageUrl` when an image has been uploaded, otherwise `imageUrl` is
`null`.

## List all services as admin

```text
GET http://localhost:3001/api/v1/admin/services
```

Select **Authorization → Bearer Token** in Postman and use the token returned by
`POST /api/v1/admin/auth/login`. This listing includes active and inactive
services and provides the IDs needed for updates.

## Upload or replace a service image

```text
PATCH http://localhost:3001/api/v1/admin/services/<SERVICE_ID>
```

In Postman:

1. Select **Authorization → Bearer Token** and paste the admin token.
2. Select **Body → form-data**.
3. Add key `image`, change its type from **Text** to **File**, and select the
   JPG, PNG, or WEBP file.
4. Optionally add any text fields from the table below.
5. Send the request. Do not manually set `Content-Type`; Postman creates the
   multipart boundary automatically.

| Key | Type | Notes |
| --- | --- | --- |
| `image` | File | One JPG, PNG, or WEBP; maximum 5 MB |
| `name` | Text | 2–100 characters |
| `slug` | Text | Lowercase letters, numbers, and hyphens |
| `shortDescription` | Text | Maximum 250 characters |
| `description` | Text | Optional full description |
| `displayOrder` | Text | Non-negative integer |
| `isActive` | Text | `true` or `false` |

Uploaded image bytes, MIME type, and original filename are stored directly in
the PostgreSQL `services` table. Images are not written to the server's upload
directory. The API streams the database image through the returned URL, for
example:

```text
http://localhost:3001/api/v1/services/personal-courier/image
```

Uploading a replacement updates the database image columns atomically. File
content is checked against its JPG, PNG, or WEBP signature before storage.
The `Delivery_app_web` administrator dashboard uses these endpoints directly:
open `/dashboard`, go to **Services**, and use **Upload image**, **Change image**,
or **Remove** on any service card. The dashboard reloads images from PostgreSQL
instead of retaining temporary browser previews.

## Create a service

```text
POST http://localhost:3001/api/v1/admin/services
```

Use the same **form-data** fields. `name` is required; `slug` is generated from
the name when omitted. The image is optional.

## Remove an image

```text
DELETE http://localhost:3001/api/v1/admin/services/<SERVICE_ID>/image
```

The service remains in the catalog and its `imageUrl` becomes `null`.

## 📦 Mobile Application Collections & Environments

| Collection File | Environment / Scope | Base URL (`{{baseUrl}}`) |
|---|---|---|
| **`Delivez-Mobile-App-Production.postman_collection.json`** | **Mobile Production (Ready-to-Run)** | `http://40.81.244.167:3012/api/v1` |
| **`Delivez-Mobile-App-Local.postman_collection.json`** | **Mobile Localhost (Port 4000 / Emulator)** | `http://localhost:4000/api/v1` |
| **`Delivez-Mobile-App.postman_collection.json`** | **Mobile Generic (Environment Driven)** | `{{baseUrl}}` |

### 🌍 Mobile Dedicated Environments

| Environment File | Environment | Base URL |
|---|---|---|
| **`Delivez.Mobile.Production.postman_environment.json`** | **Production Live Server** | `http://40.81.244.167:3012/api/v1` |
| **`Delivez.Mobile.Local.postman_environment.json`** | **Localhost Development** | `http://localhost:4000/api/v1` |

---

## 📦 Core 4 Services Postman Collection (Web & Backend Full Suite)

| Collection File | Description |
|---|---|
| **`Delivez-Four-Services.postman_collection.json`** | Comprehensive Postman collection covering all 4 core services: **Personal Courier Delivery**, **Luggage Delivery**, **Confidential Delivery (Vault)**, and **Forgot Something (Item Retrieval)**, plus Admin Operations & Live Audit Stream. |

---

## 📥 Quick Import Guide (Postman)

1. Open **Postman**.
2. Click **Import** (top-left button or `Ctrl + O` / `Cmd + O`).
3. Drag & drop:
   - `Delivez-Four-Services.postman_collection.json`
   - `Delivez.Local.postman_environment.json`
   - `Delivez.Production.postman_environment.json`
4. In the top-right environment selector in Postman, select:
   - **Delivez - Local Environment** (for local testing on port 4000) or
   - **Delivez - Production Environment** (for production staging/live)
5. **Run Request 1 (Authentication):**
   - Run `1. Authentication -> User Login` to automatically set `{{accessToken}}`.
   - Run `1. Authentication -> Admin Login` to automatically set `{{adminAccessToken}}`.
6. Now you can run any of the 4 service requests in sequence!

---

## 📂 4 Services Folder Structure & Endpoints

### 1. Authentication
* `POST {{baseUrl}}/auth/login` — Customer login (sets `{{accessToken}}` automatically via test script).
* `POST {{baseUrl}}/admin/auth/login` — Administrator login (sets `{{adminAccessToken}}` automatically via test script).
* `GET {{baseUrl}}/auth/me` — Authenticated profile verification.

### 2. Personal Courier Delivery (`/courier`)
* `GET {{baseUrl}}/courier/options` — Service options, vehicle classes, weight tiers, and addon protections.
* `POST {{baseUrl}}/courier/quote` — Price calculator for doorstep parcel and document transit.
* `POST {{baseUrl}}/courier/bookings` — Create a new courier booking (auto-stores `{{courierBookingId}}`).
* `GET {{baseUrl}}/courier/bookings` — List user's courier bookings with pagination.
* `GET {{baseUrl}}/courier/bookings/{{courierBookingId}}` — Retrieve single courier booking details.
* `GET {{baseUrl}}/courier/bookings/{{courierBookingId}}/track` — Real-time milestones & timeline.
* `GET {{baseUrl}}/courier/bookings/{{courierBookingId}}/pod` — Proof of Delivery signature, recipient, timestamp.
* `PATCH {{baseUrl}}/courier/bookings/{{courierBookingId}}` — Update delivery instructions.
* `POST {{baseUrl}}/courier/bookings/{{courierBookingId}}/payments/sandbox` — Simulate sandbox payment completion.
* `POST {{baseUrl}}/courier/bookings/{{courierBookingId}}/cancel` — Cancel courier booking.

### 3. Luggage Delivery (`/luggage-delivery`)
* `GET {{baseUrl}}/luggage-delivery/options` — Airport terminals, belt collection choices, and bag size options.
* `POST {{baseUrl}}/luggage-delivery/quote` — Calculate luggage transit quote (airport fee, bag count breakdown).
* `POST {{baseUrl}}/luggage-delivery/bookings` — Book airport arrival / hotel front desk luggage delivery (auto-stores `{{luggageBookingId}}`).
* `GET {{baseUrl}}/luggage-delivery/bookings` — List luggage delivery bookings.
* `GET {{baseUrl}}/luggage-delivery/bookings/{{luggageBookingId}}` — Retrieve flight number, belt number, and luggage status.
* `POST {{baseUrl}}/luggage-delivery/bookings/{{luggageBookingId}}/payments/sandbox` — Complete luggage sandbox payment.
* `POST {{baseUrl}}/luggage-delivery/bookings/{{luggageBookingId}}/cancel` — Cancel luggage delivery booking.

### 4. Confidential Delivery (Vault) (`/confidential-delivery`)
* `GET {{baseUrl}}/confidential-delivery/options` — Security levels (Standard, Enhanced, Maximum Security) and tamper-proof pouches.
* `POST {{baseUrl}}/confidential-delivery/quote` — Calculate security handling, escort fee, and tamper protection.
* `POST {{baseUrl}}/confidential-delivery/bookings` — Create a confidential vault delivery (auto-stores `{{confidentialBookingId}}` & `{{vaultId}}`).
* `GET {{baseUrl}}/confidential-delivery/bookings` — List confidential vault shipments.
* `GET {{baseUrl}}/confidential-delivery/bookings/{{confidentialBookingId}}` — Retrieve confidential booking & tamper status.
* `GET {{baseUrl}}/confidential-delivery/track/{{vaultId}}` — Public / secured tracking page for vault transit.
* `POST {{baseUrl}}/confidential-delivery/track/{{confidentialBookingId}}/verify-otp` — Verify delivery handover OTP.
* `POST {{baseUrl}}/confidential-delivery/bookings/{{confidentialBookingId}}/payments/sandbox` — Complete sandbox payment.
* `PATCH {{baseUrl}}/confidential-delivery/admin/bookings/{{confidentialBookingId}}/status` — Admin update chain of custody & status.
* `POST {{baseUrl}}/confidential-delivery/bookings/{{confidentialBookingId}}/cancel` — Cancel confidential shipment.

### 5. Forgot Something (Item Retrieval) (`/forgot-something`)
* `GET {{baseUrl}}/forgot-something/options` — Item categories (Keys, Laptop, Phone, Documents, Wallet, etc.) & location types.
* `POST {{baseUrl}}/forgot-something/quote` — Calculate retrieval fee, distance fee, and secure packaging.
* `POST {{baseUrl}}/forgot-something/bookings` — Book forgotten item retrieval from office/hotel/home (auto-stores `{{forgotBookingId}}`).
* `GET {{baseUrl}}/forgot-something/bookings` — List item retrieval bookings.
* `GET {{baseUrl}}/forgot-something/bookings/{{forgotBookingId}}` — Retrieve handover person & runner details.
* `GET {{baseUrl}}/forgot-something/track/{{forgotBookingId}}` — Track retrieval in real-time.
* `POST {{baseUrl}}/forgot-something/track/{{forgotBookingId}}/verify-otp` — Verify pickup or delivery OTP.
* `PATCH {{baseUrl}}/forgot-something/track/{{forgotBookingId}}/status` — Simulate / update retrieval lifecycle status.
* `POST {{baseUrl}}/forgot-something/bookings/{{forgotBookingId}}/payments/sandbox` — Complete sandbox payment.
* `POST {{baseUrl}}/forgot-something/bookings/{{forgotBookingId}}/cancel` — Cancel retrieval booking.

### 6. Live Audit & Unified Operations
* `GET {{baseUrl}}/track/{{courierBookingId}}` — Universal shipment tracking across all service types.
* `GET {{baseUrl}}/admin/orders/unified` — Admin unified orders stream.
* `GET {{baseUrl}}/admin/audit-logs` — Live compliance audit trail recording all executed mutations.

---

## ⚡ Environment Variables Reference

| Variable | Description | Default (Local) | Default (Production) |
|---|---|---|---|
| `baseUrl` | API base endpoint | `http://localhost:4000/api/v1` | `https://api.delivez.com/api/v1` |
| `userMobile` | Customer phone number | `9876543210` | `9876543210` |
| `userPassword` | Customer password | `Password123!` | (Enter your password) |
| `adminEmail` | Administrator email | `admin@delevez.com` | `admin@delivez.com` |
| `adminPassword` | Administrator password | `Password123!` | (Enter your password) |
| `accessToken` | Customer JWT Bearer Token | *Auto-populated on login* | *Auto-populated on login* |
| `adminAccessToken` | Admin JWT Bearer Token | *Auto-populated on login* | *Auto-populated on login* |
| `courierBookingId` | Active courier booking ID | *Auto-populated on booking* | *Auto-populated on booking* |
| `luggageBookingId` | Active luggage booking ID | *Auto-populated on booking* | *Auto-populated on booking* |
| `confidentialBookingId` | Active vault booking ID | *Auto-populated on booking* | *Auto-populated on booking* |
| `vaultId` | Public vault tracking code | *Auto-populated on booking* | *Auto-populated on booking* |
| `forgotBookingId` | Active forgot item booking ID | *Auto-populated on booking* | *Auto-populated on booking* |

# Delivez - Confidential Delivery (Delivez Vault) Postman Suite

This folder contains the complete, production-grade Postman collection and environments for the **Delivez Confidential Delivery (Delivez Vault)** module, matching 100% of the Flutter/Dart functional specification.

---

## 📁 Files Included

| File Name | Type | Description |
|---|---|---|
| **`Delivez-Confidential-Delivery-Local.postman_collection.json`** | **Standalone Collection (Local)** | **Recommended for local testing.** Pre-configured for `http://localhost:4000/api/v1` with pre-filled JWT tokens. Run immediately with zero setup. |
| **`Delivez-Confidential-Delivery-Production.postman_collection.json`** | **Standalone Collection (Production)** | **Recommended for production/staging testing.** Pre-configured for `http://40.81.244.167:3012/api/v1` (or `https://api.delivez.com/api/v1`). |
| **`Delivez-Confidential-Delivery.postman_collection.json`** | **Unified Collection** | Environment-agnostic collection using parameterized variables. |
| **`Delivez-Confidential-Delivery-Local.postman_environment.json`** | **Environment (Local)** | Local environment variables (`baseUrl: http://localhost:4000/api/v1`, pre-loaded tokens). |
| **`Delivez-Confidential-Delivery-Production.postman_environment.json`** | **Environment (Production)** | Production environment variables (`baseUrl: http://40.81.244.167:3012/api/v1`). |

---

## 🚀 Quick Start Guide

### Option 1: Standalone Import (Fastest — No Environment Selection Needed)
1. Open **Postman**.
2. Click **Import** (top left).
3. Drag and drop:
   - `Delivez-Confidential-Delivery-Local.postman_collection.json` (for local development on port 4000)
   - OR `Delivez-Confidential-Delivery-Production.postman_collection.json` (for production server)
4. Everything is pre-configured! You do NOT need to select any environment dropdown in Postman.
5. In Postman, open the collection and start executing requests.

---

### Option 2: Unified Collection + Environment (Standard Team Workflow)
1. Open **Postman** -> **Import**.
2. Drag and drop:
   - `Delivez-Confidential-Delivery.postman_collection.json` (the collection)
   - `Delivez-Confidential-Delivery-Local.postman_environment.json`
   - `Delivez-Confidential-Delivery-Production.postman_environment.json`
3. In the top-right environment selector in Postman, choose **"Delivez - Confidential Delivery - Local"** or **"Delivez - Confidential Delivery - Production"**.
4. Run requests.

---

## 📑 Collection Structure (5 Folders)

### 1. Authentication
- **1.1 Customer User Login** (`POST {{baseUrl}}/auth/login`): Automatically saves `{{token}}` and `{{accessToken}}` to variables.
- **1.2 Admin Login** (`POST {{baseUrl}}/admin/auth/login`): Automatically saves `{{adminAccessToken}}` and `{{adminToken}}` to variables.
- **1.3 Get Current User Profile** (`GET {{baseUrl}}/auth/profile`): Checks authentication validity.

### 2. Discovery & Pricing
- **Get Confidential Delivery Options** (`GET {{baseUrl}}/confidential-delivery/options`): Returns all 9 service types, 4 security levels, 5 packaging types, 6 item types, 6 verification methods, 4 handling options, and 5 access requirements.
- **Calculate Vault Quote** (`POST {{baseUrl}}/confidential-delivery/quote`): Calculates breakdown (base, security, handling, packaging, platform fee, GST, total).

### 3. Bookings (All 9 Flutter Service Types & Lifecycles)
- **Create Booking - Vault Secure** (Standard secure delivery)
- **Create Booking - Vault Direct** (Direct delivery with seals & bypass hubs)
- **Create Booking - Vault Precise** (Precise delivery with time slot, security switches & handling options)
- **Create Booking - Vault Hand Carry** (Hand carry with 11 Flutter security toggles & authorized person)
- **Create Booking - Vault Return** (Reverse custody with return reason, window, and inspection)
- **Create Booking - Vault Exchange** (Item exchange with swap at delivery)
- **Create Booking - Vault Critical** (Critical delivery with temperature & tilt sensors)
- **Create Booking - Vault MultiPoint** (Multi-drop delivery with sequential stops)
- *Every booking creation automatically saves `{{bookingId}}` and `{{vaultId}}`.*
- **Get My Vault Bookings** (`GET {{baseUrl}}/confidential-delivery/my-bookings`)
- **Get Vault Booking by ID** (`GET {{baseUrl}}/confidential-delivery/bookings/{{bookingId}}`)
- **Complete Sandbox Payment** (`POST {{baseUrl}}/confidential-delivery/bookings/{{bookingId}}/sandbox-payment`)
- **Cancel Vault Booking** (`POST {{baseUrl}}/confidential-delivery/bookings/{{bookingId}}/cancel`)

### 4. Live Tracking & Milestones (4 Tabs & OTP Verification)
- **Track Vault Shipment** (`GET {{baseUrl}}/confidential-delivery/track/{{bookingId}}`):
  - **Timeline Tab**: Exact 6 Flutter milestones (`Booking Initiated`, `Booking Confirmed`, `Vault Created`, `Picked Up`, `In Transit - Secure`, `Shipment Delivered`).
  - **Details Tab**: Service type, packaging, handling, access, recipient, pickup.
  - **Security Tab**: Security level, verification method, seal numbers, GPS tracking status, security switches.
  - **Documents Tab**: Receipt URL, audit log URL, POD URL, custody certificate URL.
- **Verify Delivery OTP** (`POST {{baseUrl}}/confidential-delivery/bookings/{{bookingId}}/verify-otp`): Submits 6-digit delivery OTP.

### 5. Admin Operations
- **Admin List All Vault Bookings** (`GET {{baseUrl}}/confidential-delivery/admin/bookings`)
- **Admin Update Vault Status** (`PATCH {{baseUrl}}/confidential-delivery/admin/bookings/{{bookingId}}/status`): Updates milestone status, custom location, and audit notes.

---

## 🔑 Default Credentials & Base URLs

| Environment | Base URL | User Mobile / Password | Admin Email / Password |
|---|---|---|---|
| **Local** | `http://localhost:4000/api/v1` | `9876543210` / `Customer@1234` | `admin@delevez.com` / `Admin@1234` |
| **Production** | `http://40.81.244.167:3012/api/v1` | `9876543210` / `Customer@1234` | `admin@delevez.com` / `Admin@1234` |

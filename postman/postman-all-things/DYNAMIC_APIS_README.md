# Delivez One — Dynamic Home & Operations APIs (Postman Collection)

This Postman collection provides complete coverage for all new dynamic endpoints:
- **Location Bar & Real-time Location Detection** (Auto-detected via User IP/Connection, or GPS coordinates)
- **Dynamic Hero Section & AI Prompt Bar** (with dynamic side image / mascot serving)
- **4 Quick Action Cards** (Ship Now, Track Shipment, Find Pincode, Help & Support)
- **Pincode Serviceability Availability Check**
- **Universal Live Shipment Tracking**
- **24/7 Help & Support & Customer Inquiry Form**
- **Services Catalog** (with *Know More* as the 6th service)
- **Admin Management Operations** (Hero texts, Image uploads, Quick Actions, Pincodes, Banner, Chips, Location config)

---

## 🚀 Postman Files

| File | Environment | Base URL |
|---|---|---|
| `Delivez_One_Production_Dynamic_APIs.postman_collection.json` | **Production** | `http://40.81.244.167:3012/api/v1` |
| `Delivez_One_Local_Dynamic_APIs.postman_collection.json` | **Localhost** | `http://localhost:4000/api/v1` |

---

## 📥 How to Import into Postman

1. Open **Postman**.
2. Click **Import** (top left).
3. Drag and drop `Delivez_One_Production_Dynamic_APIs.postman_collection.json` (or the Local version).
4. In Postman, select the collection:
   - Click the **Variables** tab to review or modify:
     - `baseUrl`: `http://40.81.244.167:3012/api/v1` (Production)
     - `adminMobile`: `9999999999`
     - `adminPassword`: `Admin@123456`
     - `adminToken`: *Auto-filled when you run "1. Admin Login"*

---

## 📂 Collection Folder Structure & Endpoints

### 1. Location Bar & Geolocation
* `GET {{baseUrl}}/location/current`: Auto-detects real user location via connection IP and reverse geocoding.
* `GET {{baseUrl}}/location/current?lat={{latitude}}&lng={{longitude}}`: Detects location using exact device GPS coordinates.
* `GET {{baseUrl}}/location/detect?lat={{latitude}}&lng={{longitude}}`: Reverse-geocodes coordinates with serviceability check.
* `POST {{baseUrl}}/location/detect`: Send `{ "latitude": ..., "longitude": ... }`.
* `GET {{baseUrl}}/location/presets`: Returns delivery hubs (Bengaluru, Mumbai, Delhi, Hyderabad, etc.).

### 2. Dynamic Home & Hero Section
* `GET {{baseUrl}}/home/all`: Master endpoint returning Location, Hero, Quick Actions, Banner, Chips, and Support in one call.
* `GET {{baseUrl}}/home/hero`: Returns headline, highlightWord (`delivered`), subtitle, greeting, and sideImageUrl.
* `GET {{baseUrl}}/home/hero/image`: Serves the robot mascot SVG or uploaded custom image.
* `GET {{baseUrl}}/home/banner`: Returns promo banner (*Priority. Protection. Performance.*).
* `GET {{baseUrl}}/home/chips`: Returns secondary quick action chips (*Price Calculator, Schedule Pickup, etc.*).

### 3. Quick Action Cards
* `GET {{baseUrl}}/home/quick-actions`: Returns the 4 quick action cards (*Ship Now, Track Shipment, Find Pincode, Help & Support*).
* `GET {{baseUrl}}/home/quick-actions/:id/image`: Serves custom uploaded image/icon for a card.

### 4. Find Pincode Serviceability
* `GET {{baseUrl}}/pincode/560001`: Direct pincode check by parameter.
* `GET {{baseUrl}}/pincode/check?pincode=226004`: Pincode check by query.
* `GET {{baseUrl}}/pincode/check?pincode=110001`: Checks Delhi NCR coverage.

### 5. Live Shipment Tracking
* `GET {{baseUrl}}/track/{{trackingId}}`: Universal shipment tracking across Courier, Confidential Vault, Forgot Something, and Return Pickup.

### 6. 24/7 Help & Support
* `GET {{baseUrl}}/support/config`: Toll-free helpline, WhatsApp support link, email, operating hours, and FAQs.
* `POST {{baseUrl}}/support/inquiry`: Submit customer support inquiry.

### 7. Services Catalog
* `GET {{baseUrl}}/services`: Returns 6 services: Courier Delivery, Luggage Delivery, Confidential Delivery, Forgot Something?, Return Pickup, and **Know More** as the 6th service.

### 8. Admin Management (Protected)
* `POST {{baseUrl}}/admin/auth/login`: Administrator login. Automatically extracts and stores `{{adminToken}}`.
* `GET {{baseUrl}}/admin/home/hero`: View hero configuration.
* `PUT {{baseUrl}}/admin/home/hero`: Update headline, highlightWord, subtitle, greeting, and prompt text.
* `POST {{baseUrl}}/admin/home/hero/image`: Upload custom hero side image (multipart form-data).
* `DELETE {{baseUrl}}/admin/home/hero/image`: Reset custom hero image to default robot mascot.
* `GET {{baseUrl}}/admin/home/quick-actions`: List all quick action cards.
* `POST {{baseUrl}}/admin/home/quick-actions`: Create a new quick action card.
* `PUT {{baseUrl}}/admin/home/quick-actions/:id`: Update card details, badge, route, or order.
* `POST {{baseUrl}}/admin/home/quick-actions/:id/image`: Upload custom card image/icon.
* `GET {{baseUrl}}/admin/home/pincodes`: List all serviceable delivery zones.
* `POST {{baseUrl}}/admin/home/pincodes`: Add a new serviceable pincode.
* `PUT {{baseUrl}}/admin/home/banner`: Update yellow promo banner text, button, and colors.
* `PUT {{baseUrl}}/admin/home/support`: Update helpline numbers, WhatsApp, and operating hours.
* `PUT {{baseUrl}}/admin/home/location`: Update default fallback platform hub.

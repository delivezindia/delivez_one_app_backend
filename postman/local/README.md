# Delivez API - Local Postman Environment & Collections

This folder contains all Postman collections and environment configuration configured for **Local Development** (`http://localhost:4000/api/v1`).

---

## 📁 Files in this Folder

1. **`Delivez.Local.postman_environment.json`**
   - Active environment with `baseUrl: http://localhost:4000/api/v1`
   - Pre-populated with fresh 30-day development JWT tokens (`accessToken`, `userToken`, `authToken`, `adminToken`)
   - Pre-configured test credentials (`9876543210` / `Customer@1234`, `admin@delevez.com` / `Admin@1234`)

2. **`Delivez-Mobile-App-Local.postman_collection.json`**
   - Master collection covering all 13 mobile app screens and workflows:
     - **Screen 0**: Splash & Startup Config
     - **Screen 1**: Mobile Auth (OTP Send & Verification with automatic token persistence)
     - **Screen 2**: Home Feed, Sliders & Categories
     - **Screen 3**: Saved Addresses & Geolocation
     - **Screen Flow 4**: Personal Courier Delivery
     - **Screen Flow 5**: Luggage Delivery (Airport & Hotel)
     - **Screen Flow 6**: Confidential Vault Delivery
     - **Screen Flow 7**: Forgot Something (Item Retrieval with 5 categories & 3 return types)
     - **Screen Flow**: Return Pickup (E-Commerce, Store & Service Center returns with label upload)
     - **Screen Flow 8**: Universal Tracking & Active Bookings History
     - **Screen Flow 9**: Help & Support
     - **Screen Component 11**: Know More Cards & Service Guides
     - **Screen Component 12**: More Services & Ecosystem Apps

3. **`Delivez-Four-Services-Local.postman_collection.json`**
   - Focused collection for the 4 core booking workflows + Return Pickup

4. **`Delivez-Sliders-And-Know-More-Local.postman_collection.json`**
   - Admin & Client collection for managing dynamic banners, sliders, and know-more info cards

5. **`Delivery-App-Auth-Local.postman_collection.json`**
   - Dedicated authentication test suite (OTP challenge, verification, user profile, logout)

---

## 🚀 How to Use in Postman

1. Open Postman.
2. Click **Import** (top left).
3. Drag & drop the files from this folder (or import `delivez_local_postman.zip`).
4. In the top-right environment selector dropdown, select **`Delivez (Local)`**.
5. Start testing! The environment already has active, valid access tokens pre-configured.

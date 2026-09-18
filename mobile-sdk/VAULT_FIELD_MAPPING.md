# Confidential Courier (Vault) Canonical Field Mapping Reference

This document provides the authoritative end-to-end mapping across the entire stack:
**Flutter Dart Model Field → Canonical JSON Field → Backend Controller/DTO Field → PostgreSQL / Prisma Database Field**.

---

## 1. Primary Booking Record

| Flutter Dart Field (`VaultBooking`) | Canonical JSON Field (`POST /courier-delivery/bookings`) | Backend Field (`VaultCourierBookingDTO`) | PostgreSQL / Prisma Column (`courier_vault_bookings`) | Notes |
|---|---|---|---|---|
| `bookingId` | `booking_id` | `bookingNumber` | `booking_number` (VARCHAR, UNIQUE) | Formatted as `CV-YYMMDD-XXXX` |
| `id` | `id` | `id` | `id` (UUID, PK) | Internal UUID |
| `serviceType` | `service_type` | `serviceType` | `service_type` (VARCHAR) | Exactly one of 9 Canonical Services |
| `status` | `status` | `status` | `status` (VARCHAR) | `pending_payment`, `confirmed`, `in_transit`, `completed`, `cancelled` |
| `paymentStatus` | `payment_status` | `paymentStatus` | `payment_status` (VARCHAR) | `pending`, `paid`, `refunded` |
| `receiptStatus` | `receipt_status` | `receiptStatus` | `receipt_status` (VARCHAR) | `pending`, `issued` |
| `pricing.currency` | `pricing.currency` | `currency` | `currency` (VARCHAR) | Defaults to `INR` |
| `pricing.baseFare` | `pricing.base_fare` | `basePrice` | `base_price` (DECIMAL(12,2)) | Authoritative base fare |
| `pricing.additionalCharges` | `pricing.additional_charges` | `additionalCharges` | `additional_charges` (DECIMAL(12,2)) | Security, packaging, stops |
| `pricing.totalFare` | `pricing.total_fare` | `totalAmount` | `total_amount` (DECIMAL(12,2)) | Inclusive of 18% GST |
| `step7.agreeTerms` | `step_7_review_and_confirmation.agree_terms` | `agreeTerms` | `agree_terms` (BOOLEAN) | Terms agreement flag |
| `rawPayload` | Entire Request Body | `rawPayload` | `raw_payload` (JSONB) | Full JSON snapshot ensuring 0% data loss |

---

## 2. Step 1: Pickup Location & Sender

| Flutter Dart Field (`Step1PickupLocation` / `PickupLocationData`) | Canonical JSON Field (`addresses.pickup` / `step_1_pickup_location`) | Backend Field | PostgreSQL / Prisma Column (`courier_booking_pickups`) | Notes |
|---|---|---|---|---|
| `pickupType` | `pickup_type` | `pickupType` | `pickup_type` (VARCHAR) | Business / Home |
| `contactName` | `contact_name` / `contacts.sender.full_name` | `contactName` | `contact_name` (VARCHAR) | Primary sender name |
| `mobileNumber` | `mobile_number` / `contacts.sender.phone` | `mobileNumber` | `mobile_number` (VARCHAR) | Primary sender mobile |
| `companyOrganization` | `company_organization` / `contacts.sender.company_name` | `companyOrganization` | `company_organization` (VARCHAR) | Corporate client name |
| `gstin` | `gstin` | `gstin` | `gstin` (VARCHAR) | Optional GSTIN |
| `completePickupAddress` | `complete_pickup_address` / `address_line1` | `completePickupAddress` | `complete_pickup_address` (TEXT) | Full street address |
| `city` | `city` | `city` | `city` (VARCHAR) | City name |
| `state` | `state` | `state` | `state` (VARCHAR) | State / Province |
| `pinCode` | `pin_code` / `postal_code` | `pinCode` | `pin_code` (VARCHAR) | Postal Code |
| `useMyLocation` | `use_my_location` | `useMyLocation` | `use_my_location` (BOOLEAN) | GPS geolocation trigger |
| `accessRequirements.securityCheck` | `security_check` | `securityCheck` | `security_check` (BOOLEAN) | Gate security pass |
| `accessRequirements.visitorPass` | `visitor_pass` | `visitorPass` | `visitor_pass` (BOOLEAN) | Building badge |
| `accessRequirements.liftAccess` | `lift_access` | `liftAccess` | `lift_access` (BOOLEAN) | Freight elevator |
| `accessRequirements.idProof` | `id_proof` | `idProof` | `id_proof` (BOOLEAN) | Physical ID presentation |
| `accessRequirements.parking` | `parking` | `parking` | `parking` (BOOLEAN) | Dedicated parking |
| `specialInstructions` | `pickup_special_instructions` / `access_notes` | `specialInstructions` | `special_instructions` (TEXT) | Special gate or lobby notes |

---

## 3. Step 2: Delivery Location & Recipient

| Flutter Dart Field (`Step2RecipientAndDelivery` / `DeliveryLocationData`) | Canonical JSON Field (`addresses.delivery` / `step_2_recipient_and_delivery`) | Backend Field | PostgreSQL / Prisma Column (`courier_booking_deliveries`) | Notes |
|---|---|---|---|---|
| `deliveryType` | `delivery_type` | `deliveryType` | `delivery_type` (VARCHAR) | Business / Home |
| `contactName` | `contact_name` / `contacts.recipient.full_name` | `contactName` | `contact_name` (VARCHAR) | Primary recipient name |
| `mobileNumber` | `mobile_number` / `contacts.recipient.phone` | `mobileNumber` | `mobile_number` (VARCHAR) | Primary recipient mobile |
| `companyOrganization` | `company_organization` / `contacts.recipient.company_name` | `companyOrganization` | `company_organization` (VARCHAR) | Recipient company name |
| `gstin` | `gstin` | `gstin` | `gstin` (VARCHAR) | Optional GSTIN |
| `completeDeliveryAddress` | `complete_delivery_address` / `address_line1` | `completeDeliveryAddress` | `complete_delivery_address` (TEXT) | Destination street address |
| `city` | `city` | `city` | `city` (VARCHAR) | Destination city |
| `state` | `state` | `state` | `state` (VARCHAR) | Destination state |
| `pinCode` | `pin_code` / `postal_code` | `pinCode` | `pin_code` (VARCHAR) | Destination postal code |
| `useMyLocation` | `use_my_location` | `useMyLocation` | `use_my_location` (BOOLEAN) | Dropoff GPS trigger |
| `accessRequirements.*` | `delivery_access_requirements.*` | `*` | Corresponding BOOLEAN columns | Verification flags |
| `specialInstructions` | `delivery_special_instructions` | `specialInstructions` | `special_instructions` (TEXT) | Delivery instruction notes |

---

## 4. Normalized Contacts & Timings

| Flutter Dart Field | Canonical JSON Field | Backend Entity | PostgreSQL / Prisma Table & Columns | Notes |
|---|---|---|---|---|
| `pickupContactPerson` | `pickup_contact_person` / `contacts.sender` | `CourierBookingContact` | `courier_booking_contacts` (`contact_role = 'PICKUP'`) | `contact_person`, `designation`, `alternate_mobile`, `email` |
| `deliveryContactPerson` | `delivery_contact_person` / `contacts.recipient` | `CourierBookingContact` | `courier_booking_contacts` (`contact_role = 'DELIVERY'`) | `contact_person`, `designation`, `alternate_mobile`, `email` |
| `pickupTiming` | `pickup_timing` / `timing.pickup_window` | `CourierBookingTiming` | `courier_booking_timings` (`timing_role = 'PICKUP'`) | `schedule_date`, `time_window`, `preferred_time` |
| `deliveryTiming` | `delivery_timing` / `timing.delivery_window` | `CourierBookingTiming` | `courier_booking_timings` (`timing_role = 'DELIVERY'`) | `schedule_date`, `time_window`, `customer_available` |

---

## 5. Step 3 & 4: Item Information & Packaging

| Flutter Dart Field | Canonical JSON Field | Backend Entity | PostgreSQL / Prisma Table & Columns | Notes |
|---|---|---|---|---|
| `selectedTopItemType` | `selected_top_item_type` | `CourierBookingItem` | `courier_booking_items.selected_top_item_type` | Quick select document type |
| `itemNameDescription` | `item_name_description` / `items[0].item_name` | `CourierBookingItem` | `courier_booking_items.item_name_description` | Manifest description |
| `itemCategory` | `item_category` / `items[0].category` | `CourierBookingItem` | `courier_booking_items.item_category` | Category classification |
| `itemType` | `item_type` | `CourierBookingItem` | `courier_booking_items.item_type` | Document / Parcel / Other |
| `numberOfPieces` | `number_of_pieces` / `items[0].quantity` | `CourierBookingItem` | `courier_booking_items.number_of_pieces` | Aggregated pieces count |
| `weightActual` | `weight_actual` / `items[0].weight.value` | `CourierBookingItem` | `courier_booking_items.weight_actual` | Net weight string |
| `dimensions` | `dimensions` (`length`, `width`, `height`, `unit`) | `CourierBookingItem` | `courier_booking_items.length`, `width`, `height`, `dimension_unit` | Dimensions in cm/in |
| `declaredValue` | `declared_value` / `items[0].declared_value` | `CourierBookingItem` | `courier_booking_items.declared_value` | Declared monetary value |
| `itemHandling.*` | `item_handling.*` (`fragile`, `keep_dry`, etc.) | `CourierBookingItem` | `courier_booking_items.fragile`, `keep_dry`, etc. | Handling warning flags |
| `selectedPackage` | `selected_package` / `packaging.packaging_type` | `CourierBookingPackaging` | `courier_booking_packaging.selected_package` | Tamper Proof Pouch, Heavy Duty Crate, etc. |
| `addonProtection.*` | `add_on_protection.*` | `CourierBookingPackaging` | `courier_booking_packaging.extra_bubble_wrap`, `corner_guard`, etc. | Physical protection add-ons |

---

## 6. Step 5 & 6: Security & Verification

| Flutter Dart Field | Canonical JSON Field | Backend Entity | PostgreSQL / Prisma Table & Columns | Notes |
|---|---|---|---|---|
| `selectedSecurityLevel` | `selected_security_level` / `security.level` | `CourierBookingSecurity` | `courier_booking_security.selected_security_level` | Standard, Enhanced, Maximum, Ultra-High |
| `securityFeatures.realTimeGps` | `real_time_gps_tracking` | `CourierBookingSecurity` | `courier_booking_security.real_time_gps_tracking` | Continuous GPS tracking |
| `securityFeatures.armedEscort` | `armed_escort` | `CourierBookingSecurity` | `courier_booking_security.armed_escort` | Armed personnel assignment |
| `securityFeatures.secureStorage` | `secure_storage_at_hubs` | `CourierBookingSecurity` | `courier_booking_security.secure_storage_at_hubs` | Vault hub custody |
| `selectedVerification` | `selected_verification` | `CourierBookingVerification` | `courier_booking_verification.selected_verification` | OTP, ID Proof, Signature, Biometric |
| `capturePhotoRecipient` | `capture_photo_of_recipient` | `CourierBookingVerification` | `courier_booking_verification.capture_photo_of_recipient` | Photographic custody proof |
| `capturePhotoIdProof` | `capture_photo_of_id_proof` | `CourierBookingVerification` | `courier_booking_verification.capture_photo_of_id_proof` | Government ID capture proof |

---

## 7. Service-Specific Configuration & MultiPoint Stops

| Service Name | Flutter Config Model | Canonical JSON Field (`service_specific`) | PostgreSQL Table | Stored Structure |
|---|---|---|---|---|
| **Vault Direct** | `DirectDeliverySetup` | `service_specific` or `step_2...service_specific_setup['Vault Direct']` | `courier_booking_service_details` | `delivery_type`, `single_point_handling`, `avoid_hubs`, `deviation_alert` |
| **Vault Precise** | `PreciseDeliverySetup` | `service_specific` or `step_2...service_specific_setup['Vault Precise']` | `courier_booking_service_details` | `delivery_date`, `time_window`, `hard_cutoff`, `no_early_delivery` |
| **Vault Hand Carry** | `HandCarrySetup` | `service_specific` or `step_2...service_specific_setup['Vault Hand Carry']` | `courier_booking_service_details` | `executive_level`, `flight_number`, `cabin_luggage`, `handover_protocol` |
| **Vault Return** | `ReturnSetup` | `service_specific` or `step_2...service_specific_setup['Vault Return']` | `courier_booking_service_details` | `return_type`, `return_reason`, `rma_number`, `return_address` |
| **Vault Exchange** | `ExchangeSetup` | `service_specific` or `step_2...service_specific_setup['Vault Exchange']` | `courier_booking_service_details` | `exchangeType`, `outgoingItem`, `incomingItem`, `swapTimeWindow` |
| **Vault Critical** | `CriticalSetup` | `service_specific` or `step_2...service_specific_setup['Vault Critical']` | `courier_booking_service_details` | `criticality_level`, `dual_courier`, `sla_commitment`, `abort_protocol` |
| **Vault MultiPoint** | `MultiPointSetup` + `List<MultiPointStop>` | `service_specific.stops` or `delivery_points` | `courier_booking_multipoint_stops` | 1 row per stop: `stop_number`, `stop_name`, `address`, `contact_person`, `eta`, `time_window` |

---

## 8. Payments & Receipts

| Flutter Dart Field | Canonical JSON Field | Backend Entity | PostgreSQL / Prisma Table & Columns | Notes |
|---|---|---|---|---|
| `paymentId` | `payment_id` | `CourierBookingPayment` | `courier_booking_payments.payment_id` | `PAY-YYMMDD-XXXX` |
| `amount` | `amount` | `CourierBookingPayment` | `courier_booking_payments.amount` | Authoritative payment amount |
| `status` | `status` | `CourierBookingPayment` | `courier_booking_payments.status` | `pending`, `paid`, `refunded` |
| `gateway` | `gateway` | `CourierBookingPayment` | `courier_booking_payments.gateway` | Payment gateway provider |
| `gatewayPaymentId` | `gateway_payment_id` | `CourierBookingPayment` | `courier_booking_payments.gateway_payment_id` | Provider transaction ID |
| `receiptId` | `receipt_id` / `receipt_number` | `CourierBookingReceipt` | `courier_booking_receipts.receipt_id` | `RCP-YYMMDD-XXXX` (Idempotent) |
| `receiptData` | `receipt_data` | `CourierBookingReceipt` | `courier_booking_receipts.receipt_data` (JSONB) | Full immutable invoice snapshot |

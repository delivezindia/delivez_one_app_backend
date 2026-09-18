import { randomBytes } from 'node:crypto';
import type { RequestHandler } from 'express';
import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  CANONICAL_SERVICES,
  type CanonicalServiceType,
  validateCanonicalBookingPayload,
} from './vault-courier.validation.js';
import { calculateAuthoritativePrice } from './vault-courier.pricing.js';

let bookingCounter = 1;

export const makeVaultBookingId = (): string => {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = randomBytes(2).toString('hex').toUpperCase();
  return `CV-${yy}${mm}${dd}-${rand}`;
};


export const defaultAvailableServices = [
  {
    service_type: 'Vault Secure',
    description: 'Standard secure delivery with full verification and chain of custody.',
    estimated_time: '1-2 Days',
    tag: 'Recommended',
  },
  {
    service_type: 'Vault Priority',
    description: 'Faster delivery with priority handling and dedicated partners.',
    estimated_time: 'Same / Next Day',
    tag: 'Fastest',
  },
  {
    service_type: 'Vault Direct',
    description: 'Point-to-point delivery with no stops in between. Maximum confidentiality.',
    estimated_time: '1-2 Days',
    tag: '',
  },
  {
    service_type: 'Vault Precise',
    description: 'Deliver at a specific date and time window of your choice.',
    estimated_time: 'Scheduled',
    tag: '',
  },
  {
    service_type: 'Vault Hand Carry',
    description: 'Dedicated hand carry by authorized executive for highest priority items.',
    estimated_time: '1-2 Days',
    tag: '',
  },
  {
    service_type: 'Vault Return',
    description: 'Deliver and collect signed or processed documents and return to sender.',
    estimated_time: '1-3 Days',
    tag: '',
  },
  {
    service_type: 'Vault Exchange',
    description: 'Two-way document or item exchange in a single trip.',
    estimated_time: '',
    tag: '',
  },
  {
    service_type: 'Vault Critical',
    description: 'Highest security with armed escort and real-time monitoring.',
    estimated_time: '',
    tag: '',
  },
  {
    service_type: 'Vault MultiPoint',
    description: 'Multiple secure stops in a single journey with optimized routing.',
    estimated_time: '',
    tag: '',
  },
];

export const DEFAULT_SERVICE_API_MAPPING = {
  'Vault Secure': {
    step_0: true,
    step_1: true,
    step_2: true,
    step_3: true,
    step_4: true,
    step_5: true,
    step_6: true,
    step_7: true,
    service_specific_step: null,
  },
  'Vault Priority': {
    step_0: true,
    step_1: true,
    step_2: true,
    step_3: true,
    step_4: true,
    step_5: true,
    step_6: true,
    step_7: true,
    service_specific_step: null,
  },
  'Vault Direct': {
    step_0: true,
    step_1: true,
    step_2: true,
    step_3: true,
    step_4: true,
    step_5: true,
    step_6: true,
    step_7: true,
    service_specific_step: 'step_2.service_specific_setup.Vault Direct',
  },
  'Vault Precise': {
    step_0: true,
    step_1: true,
    step_2: true,
    step_3: true,
    step_4: true,
    step_5: true,
    step_6: true,
    step_7: true,
    service_specific_step: 'step_2.service_specific_setup.Vault Precise',
  },
  'Vault Hand Carry': {
    step_0: true,
    step_1: true,
    step_2: true,
    step_3: true,
    step_4: true,
    step_5: true,
    step_6: true,
    step_7: true,
    service_specific_step: 'step_2.service_specific_setup.Vault Hand Carry',
  },
  'Vault Return': {
    step_0: true,
    step_1: true,
    step_2: true,
    step_3: true,
    step_4: true,
    step_5: true,
    step_6: true,
    step_7: true,
    service_specific_step: 'step_2.service_specific_setup.Vault Return',
  },
  'Vault Exchange': {
    step_0: true,
    step_1: true,
    step_2: true,
    step_3: true,
    step_4: true,
    step_5: true,
    step_6: true,
    step_7: true,
    service_specific_step: 'step_2.service_specific_setup.Vault Exchange',
    source_fields_available: false,
  },
  'Vault Critical': {
    step_0: true,
    step_1: true,
    step_2: true,
    step_3: true,
    step_4: true,
    step_5: true,
    step_6: true,
    step_7: true,
    service_specific_step: 'step_2.service_specific_setup.Vault Critical',
  },
  'Vault MultiPoint': {
    step_0: true,
    step_1: true,
    step_2: true,
    step_3: true,
    step_4: true,
    step_5: true,
    step_6: true,
    step_7: true,
    service_specific_step: 'step_2.service_specific_setup.Vault MultiPoint',
  },
};

export const CANONICAL_BOOKING_TEMPLATE = {
  service_type: 'Vault Secure',

  step_0_service_type: {
    selected_service: 'Vault Secure',
    available_services: defaultAvailableServices,
  },

  step_1_pickup_location: {
    pickup_location: {
      pickup_type: 'Business',
      pickup_type_options: [
        'Business',
        'Home',
      ],
      contact_name: '',
      mobile_number: '',
      company_organization: '',
      gstin: '',
      complete_pickup_address: '',
      city: '',
      state: '',
      pin_code: '',
      use_my_location: false,
    },
    pickup_contact_person: {
      contact_person: '',
      designation: '',
      alternate_mobile: '',
      email: '',
    },
    pickup_timing: {
      pickup_date: '',
      pickup_time_window: '',
      preferred_time: '',
    },
    pickup_special_instructions: '',
    pickup_access_requirements: {
      security_check: false,
      visitor_pass: false,
      lift_access: false,
      id_proof: false,
      parking: false,
    },
  },

  step_2_recipient_and_delivery: {
    delivery_location: {
      delivery_type: 'Business',
      delivery_type_options: [
        'Business',
        'Home',
      ],
      contact_name: '',
      mobile_number: '',
      company_organization: '',
      gstin: '',
      complete_delivery_address: '',
      city: '',
      state: '',
      pin_code: '',
      use_my_location: false,
    },
    delivery_contact_person: {
      contact_person: '',
      designation: '',
      alternate_mobile: '',
      email: '',
    },
    delivery_timing: {
      preferred_delivery_date: '',
      preferred_time_window: '',
      customer_available: '',
    },
    delivery_special_instructions: '',
    delivery_access_requirements: {
      security_check: false,
      visitor_pass: false,
      lift_access: false,
      id_proof: false,
      parking: false,
    },
    service_specific_setup: {
      'Vault Secure': {
        setup_present_in_source: false,
        uses_common_booking_steps: true,
      },
      'Vault Priority': {
        setup_present_in_source: false,
        uses_common_booking_steps: true,
      },
      'Vault Direct': {
        delivery_type: 'Direct Delivery',
        delivery_type_options: [
          'Direct Delivery',
          'Direct Express',
          'Same Day Direct',
        ],
        pickup_location: {
          pickup_address: '',
          use_current_location: false,
        },
        delivery_location: {
          delivery_address: '',
          use_current_location: false,
        },
        delivery_preferences: {
          preferred_delivery_date: '',
          preferred_time_window: '',
          timezone: 'IST (GMT +05:30)',
          special_instructions: '',
        },
        handling_options: {
          single_point_handling: true,
          avoid_hubs_sorting: true,
          sealed_secure: true,
          delivery_alerts: true,
        },
        contact_and_verification: {
          recipient_contact: '',
          verification_method: '',
          alternate_contact: '',
        },
      },
      'Vault Precise': {
        delivery_precision: {
          delivery_date: '',
          preferred_time_window: '',
          timezone: 'IST (GMT +05:30)',
          delivery_deadline_hard_cutoff: '',
          early_delivery_not_allowed: true,
        },
        delivery_location: {
          delivery_address: '',
          edit_address: false,
          delivery_instructions: '',
          landmark: '',
        },
        recipient_and_verification: {
          recipient_name: '',
          recipient_contact: '',
          verification_method: '',
          recipient_must_be_available_within_time_window: true,
          alternate_contact: '',
        },
        handling_and_service_options: {
          handling_option: 'Precise Delivery',
          handling_option_options: [
            'Precise Delivery',
            'Precise + Priority',
            'Precise + Signature',
            'Photo Proof',
          ],
        },
        special_instructions: '',
      },
      'Vault Hand Carry': {
        hand_carry_details: {
          hand_carry_type: 'Confidential Documents',
          hand_carry_type_options: [
            'Confidential Documents',
            'High Value Item',
            'Priority Delivery',
          ],
          executive_level: 'Verified Executive',
          declared_value: '',
          preferred_handover_slot: '',
        },
        executive_and_handover_instructions: {
          dedicated_executive: true,
          id_check_on_pickup: true,
          id_check_on_delivery: true,
          signature_at_handover: true,
          no_unattended_delivery: true,
          recipient_must_be_present: false,
        },
        monitoring_and_security: {
          real_time_tracking_and_alerts: true,
          chain_of_custody: true,
          photo_proof_at_delivery: true,
          confidential_handling: true,
          escalation_contact_required: true,
        },
        special_instructions: '',
      },
      'Vault Return': {
        return_details: {
          return_type: 'Return to Sender',
          return_type_options: [
            'Return to Sender',
            'Return to Another Location',
          ],
          return_reason: '',
          rma_reference_number: '',
          return_instruction: '',
          expected_return_date: '',
        },
        return_address: {
          address_mode: 'Same as Pickup Address',
          address_mode_options: [
            'Same as Pickup Address',
            'Use Different Address',
          ],
          return_address_preview: '',
          edit_address: false,
        },
        return_collection_preference: {
          collection_date_preference: '',
          collection_time_window: '',
          pickup_instructions_for_return: '',
        },
      },
      'Vault Exchange': {
        setup_present_in_source: false,
        source_component_referenced: 'ExchangeSetupScreen',
        source_component_implementation_found: false,
        fields: {},
      },
      'Vault Critical': {
        critical_details: {
          critical_shipment_type: 'High Value',
          critical_shipment_type_options: [
            'High Value',
            'Time Critical',
            'Confidential',
          ],
          critical_level: 'Level 1 - Highest',
          declared_value: '',
          sla_delivery_commitment: 'Select SLA',
        },
        security_and_handling_instructions: {
          tamper_proof_sealing: true,
          single_point_of_contact: true,
          secure_storage_at_hubs: true,
          armed_escort_if_available: false,
          no_unattended_delivery: true,
          photo_proof_at_every_stage: true,
        },
        priority_and_monitoring: {
          priority_handling: 'Highest Priority',
          real_time_tracking_and_alerts: true,
          delay_alert_threshold: '15 minutes',
        },
        special_instructions: '',
      },
      'Vault MultiPoint': {
        route_summary: {
          total_stops: 0,
          estimated_distance: '',
          estimated_time: '',
          service_type: 'Multi Point Delivery',
        },
        delivery_points: [
          {
            stop_number: 1,
            stop_name: '',
            subtitle: '',
            address: '',
            contact_person: '',
            eta: '',
          },
        ],
        delivery_point_actions: {
          add_stop: true,
          edit_stop: true,
          delete_stop: true,
          reorder_stops: true,
          optimize_route: false,
        },
        additional_options: {
          time_window_for_each_stop: false,
          notify_recipients: true,
          collect_pod_at_each_stop: false,
          return_to_origin_if_undelivered: false,
        },
        special_instructions: '',
      },
    },
  },

  step_3_item_type_and_information: {
    selected_top_item_type: '',
    top_item_type_options: [
      'Confidential Documents',
      'Legal Documents',
      'Contracts / Agreements',
      'Financial Documents',
      'Official Documents',
      'Original Certificates',
      'Sealed Envelope',
      'Sensitive Records',
      'Secure Package',
    ],
    other_item_type: '',
    item_information: {
      item_name_description: '',
      item_category: '',
      item_type: 'Document',
      item_type_options: [
        'Document',
        'Parcel',
        'Other',
      ],
      number_of_pieces: 1,
      weight_actual: '',
      weight_unit: 'kg',
      dimensions: {
        length: '',
        width: '',
        height: '',
        unit: 'cm',
      },
      declared_value: '',
      content_type: '',
      item_contents_description: '',
    },
    attachments: [],
    item_handling: {
      fragile: false,
      handle_with_care: false,
      this_side_up: false,
      keep_dry: false,
      do_not_stack: false,
      high_value: false,
    },
  },

  step_4_packaging_options: {
    selected_package: 'Standard Box',
    package_type_options: [
      'Standard Box',
      'Padded Envelope',
      'Tamper Proof Pouch',
      'Bubble Wrap',
      'Heavy Duty Crate',
      'Document Sleeve',
      'My Own Package',
    ],
    add_on_protection: {
      extra_bubble_wrap: false,
      corner_guard: false,
      waterproof_cover: false,
      fragile_sticker: false,
      seal_and_security_tape: false,
    },
    packaging_instructions: '',
    packaging_preview: {
      selected_packaging: '',
      protection_level: '',
      suitable_for: '',
    },
  },

  step_5_security_level: {
    selected_security_level: 'Standard Security',
    security_level_options: [
      'Standard Security',
      'Enhanced Security',
      'Maximum Security',
    ],
    security_features: {
      real_time_gps_tracking: true,
      delivery_alerts_and_notifications: true,
      armed_escort: false,
      secure_storage_at_hubs: true,
      restricted_access: true,
    },
    additional_instructions: '',
  },

  step_6_verification: {
    selected_verification: 'OTP Verification',
    verification_method_options: [
      'OTP Verification',
      'ID Proof Verification',
      'Signature Verification',
      'Face Verification',
      'Authorized Person Verification',
      'PIN Verification',
    ],
    capture_photo_of_recipient: true,
    capture_photo_of_id_proof: false,
  },

  step_7_review_and_confirmation: {
    shipment_summary: {
      item_type: '',
      security_level: '',
      packaging: '',
    },
    pickup_and_delivery_summary: {
      pickup_date: '',
      pickup_time: '',
      delivery_date: '',
      delivery_time: '',
      pickup_details: '',
      delivery_details: '',
    },
    recipient_summary: {
      recipient_name: '',
      recipient_contact: '',
      delivery_address: '',
    },
    additional_services: {},
    price_details: {
      base_price: '',
      additional_charges: '',
      total_amount: '',
    },
    agree_terms: true,
  },

  service_api_mapping: DEFAULT_SERVICE_API_MAPPING,
};



export function serializeCanonicalBooking(b: any): any {
  const pickup = b.pickup || {};
  const delivery = b.delivery || {};
  const contacts = Array.isArray(b.contacts) ? b.contacts : [];
  const pickupContact = contacts.find((c: any) => c.contactRole === 'PICKUP') || {};
  const deliveryContact = contacts.find((c: any) => c.contactRole === 'DELIVERY') || {};

  const timings = Array.isArray(b.timings) ? b.timings : [];
  const pickupTiming = timings.find((t: any) => t.timingRole === 'PICKUP') || {};
  const deliveryTiming = timings.find((t: any) => t.timingRole === 'DELIVERY') || {};

  const item = b.item || {};
  const packaging = b.packaging || {};
  const security = b.security || {};
  const verification = b.verification || {};
  const serviceDetails = b.serviceDetails?.configuration || {};
  const multipointStops = Array.isArray(b.multipointStops)
    ? b.multipointStops.map((s: any) => ({
        stop_number: s.stopNumber,
        stop_name: s.stopName,
        subtitle: s.subtitle || '',
        address: s.address,
        contact_person: s.contactPerson,
        eta: s.eta || '',
        time_window: s.timeWindow || '',
      }))
    : [];

  const attachments = Array.isArray(b.attachments)
    ? b.attachments.map((a: any) => ({
        id: a.id,
        attachment_id: a.id,
        file_name: a.fileName,
        file_path: a.filePath || '',
        file_url: a.fileUrl || '',
        url: a.fileUrl || '',
        mime_type: a.mimeType || '',
        file_size_bytes: a.fileSize || 0,
        file_size: a.fileSize || 0,
        attachment_type: a.documentType || 'DOCUMENT',
        document_type: a.documentType || 'DOCUMENT',
        created_at: a.createdAt,
      }))
    : [];

  // Service specific setup template
  const defaultServiceSetups: Record<string, any> = {
    'Vault Secure': {
      setup_present_in_source: false,
      uses_common_booking_steps: true,
    },
    'Vault Priority': {
      setup_present_in_source: false,
      uses_common_booking_steps: true,
    },
    'Vault Direct': {
      delivery_type: 'Direct Delivery',
      delivery_type_options: ['Direct Delivery', 'Direct Express', 'Same Day Direct'],
      pickup_location: {
        pickup_address: pickup.completePickupAddress || '',
        use_current_location: pickup.useMyLocation || false,
      },
      delivery_location: {
        delivery_address: delivery.completeDeliveryAddress || '',
        use_current_location: delivery.useMyLocation || false,
      },
      delivery_preferences: {
        preferred_delivery_date: deliveryTiming.scheduleDate || '',
        preferred_time_window: deliveryTiming.timeWindow || '',
        timezone: 'IST (GMT +05:30)',
        special_instructions: delivery.specialInstructions || '',
      },
      handling_options: {
        single_point_handling: true,
        avoid_hubs_sorting: true,
        sealed_secure: true,
        delivery_alerts: true,
      },
      contact_and_verification: {
        recipient_contact: delivery.mobileNumber || '',
        verification_method: verification.selectedVerification || 'OTP Verification',
        alternate_contact: deliveryContact.alternateMobile || '',
      },
    },
    'Vault Precise': {
      delivery_precision: {
        delivery_date: deliveryTiming.scheduleDate || '',
        preferred_time_window: deliveryTiming.timeWindow || '',
        timezone: 'IST (GMT +05:30)',
        delivery_deadline_hard_cutoff: '',
        early_delivery_not_allowed: true,
      },
      delivery_location: {
        delivery_address: delivery.completeDeliveryAddress || '',
        edit_address: false,
        delivery_instructions: delivery.specialInstructions || '',
        landmark: '',
      },
      recipient_and_verification: {
        recipient_name: delivery.contactName || '',
        recipient_contact: delivery.mobileNumber || '',
        verification_method: verification.selectedVerification || 'OTP Verification',
        recipient_must_be_available_within_time_window: true,
        alternate_contact: deliveryContact.alternateMobile || '',
      },
      handling_and_service_options: {
        handling_option: 'Precise Delivery',
        handling_option_options: [
          'Precise Delivery',
          'Precise + Priority',
          'Precise + Signature',
          'Photo Proof',
        ],
      },
      special_instructions: delivery.specialInstructions || '',
    },
    'Vault Hand Carry': {
      hand_carry_details: {
        hand_carry_type: 'Confidential Documents',
        hand_carry_type_options: [
          'Confidential Documents',
          'High Value Item',
          'Priority Delivery',
        ],
        executive_level: 'Verified Executive',
        declared_value: item.declaredValue ? String(item.declaredValue) : '',
        preferred_handover_slot: pickupTiming.timeWindow || '',
      },
      executive_and_handover_instructions: {
        dedicated_executive: true,
        id_check_on_pickup: true,
        id_check_on_delivery: true,
        signature_at_handover: true,
        no_unattended_delivery: true,
        recipient_must_be_present: false,
      },
      monitoring_and_security: {
        real_time_tracking_and_alerts: true,
        chain_of_custody: true,
        photo_proof_at_delivery: true,
        confidential_handling: true,
        escalation_contact_required: true,
      },
      special_instructions: '',
    },
    'Vault Return': {
      return_details: {
        return_type: 'Return to Sender',
        return_type_options: ['Return to Sender', 'Return to Another Location'],
        return_reason: '',
        rma_reference_number: '',
        return_instruction: '',
        expected_return_date: '',
      },
      return_address: {
        address_mode: 'Same as Pickup Address',
        address_mode_options: ['Same as Pickup Address', 'Use Different Address'],
        return_address_preview: pickup.completePickupAddress || '',
        edit_address: false,
      },
      return_collection_preference: {
        collection_date_preference: '',
        collection_time_window: '',
        pickup_instructions_for_return: '',
      },
    },
    'Vault Exchange': {
      setup_present_in_source: false,
      source_component_referenced: 'ExchangeSetupScreen',
      source_component_implementation_found: false,
      fields: (serviceDetails && Object.keys(serviceDetails).length > 0)
        ? (serviceDetails.fields || serviceDetails)
        : {},
    },
    'Vault Critical': {
      critical_details: {
        critical_shipment_type: 'High Value',
        critical_shipment_type_options: ['High Value', 'Time Critical', 'Confidential'],
        critical_level: 'Level 1 - Highest',
        declared_value: item.declaredValue ? String(item.declaredValue) : '',
        sla_delivery_commitment: 'Select SLA',
      },
      security_and_handling_instructions: {
        tamper_proof_sealing: true,
        single_point_of_contact: true,
        secure_storage_at_hubs: true,
        armed_escort_if_available: false,
        no_unattended_delivery: true,
        photo_proof_at_every_stage: true,
      },
      priority_and_monitoring: {
        priority_handling: 'Highest Priority',
        real_time_tracking_and_alerts: true,
        delay_alert_threshold: '15 minutes',
      },
      special_instructions: '',
    },
    'Vault MultiPoint': {
      route_summary: {
        total_stops: multipointStops.length,
        estimated_distance: '',
        estimated_time: '',
        service_type: 'Multi Point Delivery',
      },
      delivery_points: multipointStops.length > 0 ? multipointStops : [
        {
          stop_number: 1,
          stop_name: '',
          subtitle: '',
          address: '',
          contact_person: '',
          eta: '',
        },
      ],
      delivery_point_actions: {
        add_stop: true,
        edit_stop: true,
        delete_stop: true,
        reorder_stops: true,
        optimize_route: false,
      },
      additional_options: {
        time_window_for_each_stop: false,
        notify_recipients: true,
        collect_pod_at_each_stop: false,
        return_to_origin_if_undelivered: false,
      },
      special_instructions: '',
    },
  };

  // Merge any persisted custom configuration into the active service setup
  if (b.serviceType && serviceDetails) {
    defaultServiceSetups[b.serviceType] = {
      ...defaultServiceSetups[b.serviceType],
      ...serviceDetails,
    };
  }

  // Common items array for both payload representations
  const rawItems = (b.rawPayload as any)?.package_details?.items;
  const itemsArray = Array.isArray(rawItems) && rawItems.length > 0
    ? rawItems
    : [
        {
          item_id: item.id || 'ITEM-001',
          item_name: item.itemNameDescription || 'Confidential Shipment',
          category: item.itemCategory || 'DOCUMENT',
          quantity: item.numberOfPieces || 1,
          declared_value: Number(item.declaredValue || 0),
          currency: b.currency || 'INR',
          dimensions: {
            length: Number(item.length || 0),
            width: Number(item.width || 0),
            height: Number(item.height || 0),
            unit: item.dimensionUnit || 'cm',
          },
          weight: {
            value: Number(item.weightActual || 0),
            unit: item.weightUnit || 'kg',
          },
          is_fragile: item.fragile || false,
          is_hazardous: false,
          special_instructions: item.itemContentsDescription || '',
        },
      ];

  const basePriceNum = Number(b.basePrice || 0);
  const additionalChargesNum = Number(b.additionalCharges || 0);
  const totalAmountNum = Number(b.totalAmount || 0);
  const gstAmountNum = Math.max(0, Math.round((totalAmountNum - basePriceNum - additionalChargesNum) * 100) / 100);

  // Reconstructed MultiPoint stops in detailed structure if available
  const stopsDetailed = multipointStops.map((s: any, idx: number) => ({
    stop_sequence: s.stop_number || idx + 1,
    stop_type: s.subtitle || 'DROPOFF',
    address: {
      address_line1: s.address,
      city: 'Bengaluru',
      postal_code: '560001',
    },
    contact: {
      full_name: s.contact_person,
      phone: '',
    },
    package_actions: [],
    verification_requirements: ['SIGNATURE'],
  }));

  const activeServiceSpecific = {
    ...defaultServiceSetups[b.serviceType],
    ...(serviceDetails || {}),
    ...(b.serviceType === 'Vault MultiPoint' ? { stops: stopsDetailed.length > 0 ? stopsDetailed : multipointStops } : {}),
  };

  const rawAddresses = (b.rawPayload as any)?.addresses || {};
  const rawPickup = rawAddresses.pickup || {};
  const rawDelivery = rawAddresses.delivery || {};
  const rawContacts = (b.rawPayload as any)?.contacts || {};
  const rawTiming = (b.rawPayload as any)?.timing || {};

  return {
    booking_id: b.bookingNumber,
    id: b.id,
    service_type: b.serviceType,
    status: b.status,
    payment_status: b.paymentStatus,
    receipt_status: b.receiptStatus,
    created_at: b.createdAt,
    updated_at: b.updatedAt,
    special_instructions: pickup.specialInstructions || delivery.specialInstructions || '',

    // Top-Level Canonical Aliases (for direct access & SDK tests)
    service_selection: {
      service_type: b.serviceType,
      service_name: b.serviceType,
      speed_tier: 'EXPRESS',
      vehicle_type: 'FOUR_WHEELER',
      description: defaultAvailableServices.find(s => s.service_type === b.serviceType)?.description || '',
    },
    addresses: {
      pickup: {
        address_line1: pickup.completePickupAddress || rawPickup.address_line1 || '',
        city: pickup.city || rawPickup.city || 'Bengaluru',
        state: pickup.state || rawPickup.state || 'Karnataka',
        postal_code: pickup.pinCode || rawPickup.postal_code || '560001',
        country: rawPickup.country || 'India',
        latitude: rawPickup.latitude || 13.0,
        longitude: rawPickup.longitude || 77.5,
        landmark: rawPickup.landmark || pickup.companyOrganization || '',
        floor_number: rawPickup.floor_number || '',
        building_name: rawPickup.building_name || '',
        gate_code: rawPickup.gate_code || '',
        access_notes: rawPickup.access_notes || pickup.specialInstructions || '',
      },
      delivery: {
        address_line1: delivery.completeDeliveryAddress || rawDelivery.address_line1 || '',
        city: delivery.city || rawDelivery.city || 'Bengaluru',
        state: delivery.state || rawDelivery.state || 'Karnataka',
        postal_code: delivery.pinCode || rawDelivery.postal_code || '560001',
        country: rawDelivery.country || 'India',
        latitude: rawDelivery.latitude || 12.9,
        longitude: rawDelivery.longitude || 77.6,
        landmark: rawDelivery.landmark || delivery.companyOrganization || 'Opposite New Horizon College',
        floor_number: rawDelivery.floor_number || '',
        building_name: rawDelivery.building_name || '',
        gate_code: rawDelivery.gate_code || '',
        access_notes: rawDelivery.access_notes || delivery.specialInstructions || '',
      },
    },
    contacts: {
      sender: {
        full_name: pickup.contactName || rawContacts.sender?.full_name || pickupContact.contactPerson || '',
        phone: pickup.mobileNumber || rawContacts.sender?.phone || pickupContact.alternateMobile || '',
        alternate_phone: rawContacts.sender?.alternate_phone || pickupContact.alternateMobile || '',
        email: rawContacts.sender?.email || pickupContact.email || '',
        company_name: rawContacts.sender?.company_name || pickup.companyOrganization || '',
        department: rawContacts.sender?.department || pickupContact.designation || '',
      },
      recipient: {
        full_name: delivery.contactName || rawContacts.recipient?.full_name || deliveryContact.contactPerson || '',
        phone: delivery.mobileNumber || rawContacts.recipient?.phone || deliveryContact.alternateMobile || '',
        alternate_phone: rawContacts.recipient?.alternate_phone || deliveryContact.alternateMobile || '',
        email: rawContacts.recipient?.email || deliveryContact.email || '',
        company_name: rawContacts.recipient?.company_name || delivery.companyOrganization || '',
        department: rawContacts.recipient?.department || deliveryContact.designation || '',
      },
      emergency: rawContacts.emergency || {
        full_name: 'Support Desk',
        phone: '+919800000000',
        relationship: 'Customer Support',
      },
    },
    timing: {
      pickup_window: rawTiming.pickup_window || {
        scheduled_date: pickupTiming.scheduleDate || '',
        start_time: pickupTiming.timeWindow || '10:00:00',
        end_time: '12:00:00',
        timezone: 'Asia/Kolkata',
      },
      delivery_window: rawTiming.delivery_window || {
        scheduled_date: deliveryTiming.scheduleDate || '',
        start_time: deliveryTiming.timeWindow || '14:00:00',
        end_time: '16:00:00',
        timezone: 'Asia/Kolkata',
      },
      is_asap: rawTiming.is_asap !== undefined ? rawTiming.is_asap : false,
      grace_period_minutes: rawTiming.grace_period_minutes || 15,
      special_timing_notes: pickup.specialInstructions || rawTiming.special_timing_notes || delivery.specialInstructions || 'Standard handover',
    },
    package_details: {
      items: itemsArray,
      attachments,
      packaging: {
        packaging_type: packaging.selectedPackage || 'TAMPER_EVIDENT_ENVELOPE',
        custom_packaging_requested: true,
        packaging_instructions: packaging.packagingInstructions || '',
        requires_temperature_control: false,
        requires_shock_indicator: packaging.extraBubbleWrap || false,
      },
    },
    security: {
      level: security.selectedSecurityLevel || 'ULTRA_HIGH',
      chain_of_custody: true,
      digital_seal: security.sealAndSecurityTape || true,
      tamper_evident: true,
      two_person_verification: false,
      armed_escort: security.armedEscort || false,
      gps_tracking_level: 'CONTINUOUS',
      geo_fencing_enabled: true,
      allow_subcontractor: false,
      security_officer_assigned: 'SO-VAULT-01',
    },
    verification: {
      pickup: {
        id_verification: true,
        signature_required: true,
        otp_required: true,
        photo_proof: true,
        tamper_seal_scan: true,
      },
      delivery: {
        id_verification: true,
        signature_required: true,
        otp_required: true,
        photo_proof: verification.capturePhotoOfRecipient !== false,
        tamper_seal_scan: true,
        thumbprint_required: false,
      },
      audit_trail: {
        log_all_events: true,
        gps_breadcrumbs: true,
        tamper_alert_notifications: true,
      },
      custody_signatures: [],
    },
    service_specific: activeServiceSpecific,
    pricing: {
      currency: b.currency || 'INR',
      base_fare: basePriceNum,
      base_price: basePriceNum,
      additional_charges: additionalChargesNum,
      tax_amount: gstAmountNum,
      gst_amount: gstAmountNum,
      total_fare: totalAmountNum,
      total_amount: totalAmountNum,
    },

    // Steps 0 to 7 (Canonical nested representations)
    step_0_service_type: {
      selected_service: b.serviceType,
      available_services: defaultAvailableServices,
    },
    step_1_pickup_location: {
      pickup_location: {
        pickup_type: pickup.pickupType || 'Business',
        pickup_type_options: ['Business', 'Home'],
        contact_name: pickup.contactName || '',
        mobile_number: pickup.mobileNumber || '',
        company_organization: pickup.companyOrganization || '',
        gstin: pickup.gstin || '',
        complete_pickup_address: pickup.completePickupAddress || '',
        city: pickup.city || '',
        state: pickup.state || '',
        pin_code: pickup.pinCode || '',
        use_my_location: pickup.useMyLocation || false,
      },
      pickup_contact_person: {
        contact_person: pickupContact.contactPerson || '',
        designation: pickupContact.designation || '',
        alternate_mobile: pickupContact.alternateMobile || '',
        email: pickupContact.email || '',
      },
      pickup_timing: {
        pickup_date: pickupTiming.scheduleDate || '',
        pickup_time_window: pickupTiming.timeWindow || '',
        preferred_time: pickupTiming.preferredTime || '',
      },
      pickup_special_instructions: pickup.specialInstructions || '',
      pickup_access_requirements: {
        security_check: pickup.securityCheck || false,
        visitor_pass: pickup.visitorPass || false,
        lift_access: pickup.liftAccess || false,
        id_proof: pickup.idProof || false,
        parking: pickup.parking || false,
      },
    },
    step_2_recipient_and_delivery: {
      delivery_location: {
        delivery_type: delivery.deliveryType || 'Business',
        delivery_type_options: ['Business', 'Home'],
        contact_name: delivery.contactName || '',
        mobile_number: delivery.mobileNumber || '',
        company_organization: delivery.companyOrganization || '',
        gstin: delivery.gstin || '',
        complete_delivery_address: delivery.completeDeliveryAddress || '',
        city: delivery.city || '',
        state: delivery.state || '',
        pin_code: delivery.pinCode || '',
        use_my_location: delivery.useMyLocation || false,
      },
      delivery_contact_person: {
        contact_person: deliveryContact.contactPerson || '',
        designation: deliveryContact.designation || '',
        alternate_mobile: deliveryContact.alternateMobile || '',
        email: deliveryContact.email || '',
      },
      delivery_timing: {
        preferred_delivery_date: deliveryTiming.scheduleDate || '',
        preferred_time_window: deliveryTiming.timeWindow || '',
        customer_available: deliveryTiming.customerAvailable || '',
      },
      delivery_special_instructions: delivery.specialInstructions || '',
      delivery_access_requirements: {
        security_check: delivery.securityCheck || false,
        visitor_pass: delivery.visitorPass || false,
        lift_access: delivery.liftAccess || false,
        id_proof: delivery.idProof || false,
        parking: delivery.parking || false,
      },
      service_specific_setup: defaultServiceSetups,
    },
    step_3_item_type_and_information: {
      selected_top_item_type: item.selectedTopItemType || '',
      top_item_type_options: [
        'Confidential Documents',
        'Legal Documents',
        'Contracts / Agreements',
        'Financial Documents',
        'Official Documents',
        'Original Certificates',
        'Sealed Envelope',
        'Sensitive Records',
        'Secure Package',
      ],
      other_item_type: item.otherItemType || '',
      item_information: {
        item_name_description: item.itemNameDescription || '',
        item_category: item.itemCategory || '',
        item_type: item.itemType || 'Document',
        item_type_options: ['Document', 'Parcel', 'Other'],
        number_of_pieces: item.numberOfPieces || 1,
        weight_actual: item.weightActual || '',
        weight_unit: item.weightUnit || 'kg',
        dimensions: {
          length: item.length || '',
          width: item.width || '',
          height: item.height || '',
          unit: item.dimensionUnit || 'cm',
        },
        declared_value: item.declaredValue ? String(item.declaredValue) : '',
        content_type: item.contentType || '',
        item_contents_description: item.itemContentsDescription || '',
      },
      item_handling: {
        fragile: item.fragile || false,
        handle_with_care: item.handleWithCare || false,
        this_side_up: item.thisSideUp || false,
        keep_dry: item.keepDry || false,
        do_not_stack: item.doNotStack || false,
        high_value: item.highValue || false,
      },
      attachments,
    },
    step_4_packaging_options: {
      selected_package: packaging.selectedPackage || 'Standard Box',
      package_type_options: [
        'Standard Box',
        'Padded Envelope',
        'Tamper Proof Pouch',
        'Bubble Wrap',
        'Heavy Duty Crate',
        'Document Sleeve',
        'My Own Package',
      ],
      add_on_protection: {
        extra_bubble_wrap: packaging.extraBubbleWrap || false,
        corner_guard: packaging.cornerGuard || false,
        waterproof_cover: packaging.waterproofCover || false,
        fragile_sticker: packaging.fragileSticker || false,
        seal_and_security_tape: packaging.sealAndSecurityTape || false,
      },
      packaging_instructions: packaging.packagingInstructions || '',
      packaging_preview: packaging.packagingPreview || {
        selected_packaging: packaging.selectedPackage || '',
        protection_level: '',
        suitable_for: '',
      },
    },
    step_5_security_level: {
      selected_security_level: security.selectedSecurityLevel || 'Standard Security',
      security_level_options: [
        'Standard Security',
        'Enhanced Security',
        'Maximum Security',
      ],
      security_features: {
        real_time_gps_tracking: security.realTimeGpsTracking !== false,
        delivery_alerts_and_notifications: security.deliveryAlertsAndNotifications !== false,
        armed_escort: security.armedEscort || false,
        secure_storage_at_hubs: security.secureStorageAtHubs !== false,
        restricted_access: security.restrictedAccess !== false,
      },
      additional_instructions: security.additionalInstructions || '',
    },
    step_6_verification: {
      selected_verification: verification.selectedVerification || 'OTP Verification',
      verification_method_options: [
        'OTP Verification',
        'ID Proof Verification',
        'Signature Verification',
        'Face Verification',
        'Authorized Person Verification',
        'PIN Verification',
      ],
      capture_photo_of_recipient: verification.capturePhotoOfRecipient !== false,
      capture_photo_of_id_proof: verification.capturePhotoOfIdProof || false,
    },
    step_7_review_and_confirmation: {
      shipment_summary: {
        item_type: item.itemType || 'Document',
        security_level: security.selectedSecurityLevel || 'Standard Security',
        packaging: packaging.selectedPackage || 'Standard Box',
      },
      pickup_and_delivery_summary: {
        pickup_date: pickupTiming.scheduleDate || '',
        pickup_time: pickupTiming.timeWindow || '',
        delivery_date: deliveryTiming.scheduleDate || '',
        delivery_time: deliveryTiming.timeWindow || '',
        pickup_details: pickup.completePickupAddress || '',
        delivery_details: delivery.completeDeliveryAddress || '',
      },
      recipient_summary: {
        recipient_name: delivery.contactName || '',
        recipient_contact: delivery.mobileNumber || '',
        delivery_address: delivery.completeDeliveryAddress || '',
      },
      additional_services: {},
      price_details: {
        base_price: String(basePriceNum),
        additional_charges: String(additionalChargesNum),
        total_amount: String(totalAmountNum),
      },
      agree_terms: b.agreeTerms !== false,
    },
    service_api_mapping: DEFAULT_SERVICE_API_MAPPING,
  };
}

export const createVaultBookingHandler: RequestHandler = async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new AppError({
      message: 'Authentication required.',
      statusCode: 401,
      code: 'UNAUTHORIZED',
    });
  }

  const payload = req.body ?? {};

  // 1. Validation
  const { serviceType, errors } = validateCanonicalBookingPayload(payload);
  if (Object.keys(errors).length > 0) {
    res.status(422).json({
      status: 'error',
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  // 2. Authoritative Pricing Calculation
  const pricing = calculateAuthoritativePrice(payload);
  const bookingNumber = makeVaultBookingId();

  // Extract canonical fields with fallback between step objects and aliases
  const step1 = payload.step_1_pickup_location || payload.step1 || {};
  const pickupLoc = step1.pickup_location || payload.addresses?.pickup || payload.pickup || {};
  const pickupContact = step1.pickup_contact_person || payload.contacts?.sender || {};
  const pickupTiming = step1.pickup_timing || payload.timing?.pickup_window || payload.timing || {};
  const pickupAccess = step1.pickup_access_requirements || {};

  const step2 = payload.step_2_recipient_and_delivery || payload.step2 || {};
  const deliveryLoc = step2.delivery_location || payload.addresses?.delivery || payload.delivery || payload.dropoff || {};
  const deliveryContact = step2.delivery_contact_person || payload.contacts?.recipient || {};
  const deliveryTiming = step2.delivery_timing || payload.timing?.delivery_window || payload.timing || {};
  const deliveryAccess = step2.delivery_access_requirements || {};
  const serviceSetups = step2.service_specific_setup || {};
  const currentServiceSetup =
    serviceSetups[serviceType] ||
    payload.service_specific ||
    payload.serviceConfiguration ||
    {};

  const step3 = payload.step_3_item_type_and_information || payload.step3 || {};
  const itemsList = Array.isArray(payload.package_details?.items) ? payload.package_details.items : [];
  const itemInfo = step3.item_information || itemsList[0] || payload.item || {};
  const itemHandling = step3.item_handling || {};
  const rawAttachments = Array.isArray(step3.attachments)
    ? step3.attachments
    : (Array.isArray(payload.package_details?.attachments) ? payload.package_details.attachments : []);

  const step4 = payload.step_4_packaging_options || payload.package_details?.packaging || payload.packaging || {};
  const addonProtection = step4.add_on_protection || {};

  const step5 = payload.step_5_security_level || payload.security || {};
  const secFeatures = step5.security_features || {};

  const step6 = payload.step_6_verification || payload.verification || {};
  const step7 = payload.step_7_review_and_confirmation || {};

  const specialTimingNotes = payload.timing?.special_timing_notes || step1.pickup_special_instructions || null;

  // 3. Database Transaction
  const createdBooking = await prisma.$transaction(async (tx) => {
    // 3.1 Primary Booking Record
    const booking = await tx.vaultCourierBooking.create({
      data: {
        bookingNumber,
        userId: user.id,
        serviceType,
        status: 'pending_payment',
        paymentStatus: 'pending',
        receiptStatus: 'pending',
        currency: pricing.currency,
        basePrice: pricing.basePrice,
        additionalCharges: pricing.additionalCharges,
        totalAmount: pricing.totalAmount,
        agreeTerms: step7.agree_terms !== false,
        rawPayload: payload,
      },
    });

    // 3.2 Pickup Data
    await tx.courierBookingPickup.create({
      data: {
        bookingId: booking.id,
        pickupType: pickupLoc.pickup_type || 'Business',
        contactName: pickupLoc.contact_name || pickupContact.full_name || user.fullName || 'Sender',
        mobileNumber: pickupLoc.mobile_number || pickupContact.phone || user.mobileNumber,
        companyOrganization: pickupLoc.company_organization || pickupContact.company_name || null,
        gstin: pickupLoc.gstin || null,
        completePickupAddress: pickupLoc.complete_pickup_address || pickupLoc.address_line1 || pickupLoc.address || '',
        city: pickupLoc.city || 'Bengaluru',
        state: pickupLoc.state || 'Karnataka',
        pinCode: String(pickupLoc.pin_code || pickupLoc.postal_code || pickupLoc.postalCode || '560001'),
        useMyLocation: Boolean(pickupLoc.use_my_location),
        securityCheck: Boolean(pickupAccess.security_check),
        visitorPass: Boolean(pickupAccess.visitor_pass),
        liftAccess: Boolean(pickupAccess.lift_access),
        idProof: Boolean(pickupAccess.id_proof),
        parking: Boolean(pickupAccess.parking),
        specialInstructions: specialTimingNotes || step1.pickup_special_instructions || null,
      },
    });

    // 3.3 Delivery Data
    await tx.courierBookingDelivery.create({
      data: {
        bookingId: booking.id,
        deliveryType: deliveryLoc.delivery_type || 'Business',
        contactName: deliveryLoc.contact_name || deliveryContact.full_name || 'Recipient',
        mobileNumber: deliveryLoc.mobile_number || deliveryContact.phone || '',
        companyOrganization: deliveryLoc.company_organization || deliveryContact.company_name || null,
        gstin: deliveryLoc.gstin || null,
        completeDeliveryAddress: deliveryLoc.complete_delivery_address || deliveryLoc.address_line1 || deliveryLoc.address || '',
        city: deliveryLoc.city || 'Bengaluru',
        state: deliveryLoc.state || 'Karnataka',
        pinCode: String(deliveryLoc.pin_code || deliveryLoc.postal_code || deliveryLoc.postalCode || '560001'),
        useMyLocation: Boolean(deliveryLoc.use_my_location),
        securityCheck: Boolean(deliveryAccess.security_check),
        visitorPass: Boolean(deliveryAccess.visitor_pass),
        liftAccess: Boolean(deliveryAccess.lift_access),
        idProof: Boolean(deliveryAccess.id_proof),
        parking: Boolean(deliveryAccess.parking),
        specialInstructions: step2.delivery_special_instructions || null,
      },
    });

    // 3.4 Contact Data
    await tx.courierBookingContact.createMany({
      data: [
        {
          bookingId: booking.id,
          contactRole: 'PICKUP',
          contactPerson: pickupContact.contact_person || pickupContact.full_name || pickupLoc.contact_name || user.fullName || 'Sender',
          designation: pickupContact.designation || pickupContact.department || null,
          alternateMobile: pickupContact.alternate_mobile || pickupContact.alternate_phone || null,
          email: pickupContact.email || null,
        },
        {
          bookingId: booking.id,
          contactRole: 'DELIVERY',
          contactPerson: deliveryContact.contact_person || deliveryContact.full_name || deliveryLoc.contact_name || 'Recipient',
          designation: deliveryContact.designation || deliveryContact.department || null,
          alternateMobile: deliveryContact.alternate_mobile || deliveryContact.alternate_phone || null,
          email: deliveryContact.email || null,
        },
      ],
    });

    // 3.5 Timing Data
    await tx.courierBookingTiming.createMany({
      data: [
        {
          bookingId: booking.id,
          timingRole: 'PICKUP',
          scheduleDate: pickupTiming.pickup_date || pickupTiming.scheduled_date || null,
          timeWindow: pickupTiming.pickup_time_window || pickupTiming.start_time || null,
          preferredTime: pickupTiming.preferred_time || null,
          customerAvailable: null,
        },
        {
          bookingId: booking.id,
          timingRole: 'DELIVERY',
          scheduleDate: deliveryTiming.preferred_delivery_date || deliveryTiming.scheduled_date || null,
          timeWindow: deliveryTiming.preferred_time_window || deliveryTiming.start_time || null,
          preferredTime: null,
          customerAvailable: deliveryTiming.customer_available || null,
        },
      ],
    });

    // 3.6 Item Data (Primary item record)
    const primaryItem = itemsList.length > 0 ? itemsList[0] : itemInfo;
    const totalPieces = itemsList.length > 0
      ? itemsList.reduce((acc: number, it: any) => acc + (Number(it.quantity) || 1), 0)
      : (Number(itemInfo.number_of_pieces) || 1);
    const totalDeclaredVal = itemsList.length > 0
      ? itemsList.reduce((acc: number, it: any) => acc + (Number(it.declared_value) || 0), 0)
      : (itemInfo.declared_value ? Number(itemInfo.declared_value) : null);

    await tx.courierBookingItem.create({
      data: {
        bookingId: booking.id,
        selectedTopItemType: step3.selected_top_item_type || null,
        otherItemType: step3.other_item_type || null,
        itemNameDescription:
          primaryItem.item_name_description ||
          primaryItem.item_name ||
          step3.selected_top_item_type ||
          'Confidential Shipment',
        itemCategory: primaryItem.category || primaryItem.item_category || null,
        itemType: primaryItem.item_type || 'Document',
        numberOfPieces: totalPieces,
        weightActual: primaryItem.weight?.value ? String(primaryItem.weight.value) : (primaryItem.weight_actual ? String(primaryItem.weight_actual) : null),
        weightUnit: primaryItem.weight?.unit || primaryItem.weight_unit || 'kg',
        length: primaryItem.dimensions?.length ? String(primaryItem.dimensions.length) : null,
        width: primaryItem.dimensions?.width ? String(primaryItem.dimensions.width) : null,
        height: primaryItem.dimensions?.height ? String(primaryItem.dimensions.height) : null,
        dimensionUnit: primaryItem.dimensions?.unit || primaryItem.dimension_unit || 'cm',
        declaredValue: totalDeclaredVal,
        contentType: primaryItem.content_type || null,
        itemContentsDescription: primaryItem.special_instructions || primaryItem.item_contents_description || null,
        fragile: Boolean(primaryItem.is_fragile || itemHandling.fragile),
        handleWithCare: Boolean(itemHandling.handle_with_care),
        thisSideUp: Boolean(itemHandling.this_side_up),
        keepDry: Boolean(itemHandling.keep_dry),
        doNotStack: Boolean(itemHandling.do_not_stack),
        highValue: Boolean(itemHandling.high_value || (totalDeclaredVal && totalDeclaredVal > 50000)),
      },
    });

    // 3.7 Attachments Data
    if (rawAttachments.length > 0) {
      await tx.courierBookingAttachment.createMany({
        data: rawAttachments.map((att: any) => ({
          bookingId: booking.id,
          fileName: att.file_name || att.name || 'document.pdf',
          filePath: att.file_path || null,
          fileUrl: att.file_url || att.url || null,
          mimeType: att.mime_type || 'application/pdf',
          fileSize: Number(att.file_size_bytes || att.file_size || 0),
          documentType: att.attachment_type || att.document_type || 'CONFIDENTIAL_DOC',
        })),
      });
    }

    // 3.8 Packaging Data
    await tx.courierBookingPackaging.create({
      data: {
        bookingId: booking.id,
        selectedPackage: step4.packaging_type || step4.selected_package || 'Standard Box',
        extraBubbleWrap: Boolean(addonProtection.extra_bubble_wrap || step4.requires_shock_indicator),
        cornerGuard: Boolean(addonProtection.corner_guard),
        waterproofCover: Boolean(addonProtection.waterproof_cover),
        fragileSticker: Boolean(addonProtection.fragile_sticker),
        sealAndSecurityTape: Boolean(addonProtection.seal_and_security_tape),
        packagingInstructions: step4.packaging_instructions || null,
        packagingPreview: step4.packaging_preview || null,
      },
    });

    // 3.9 Security Data
    await tx.courierBookingSecurity.create({
      data: {
        bookingId: booking.id,
        selectedSecurityLevel: step5.level || step5.selected_security_level || 'Standard Security',
        realTimeGpsTracking: secFeatures.real_time_gps_tracking !== false,
        deliveryAlertsAndNotifications: secFeatures.delivery_alerts_and_notifications !== false,
        armedEscort: Boolean(step5.armed_escort || secFeatures.armed_escort),
        secureStorageAtHubs: secFeatures.secure_storage_at_hubs !== false,
        restrictedAccess: secFeatures.restricted_access !== false,
        additionalInstructions: step5.additional_instructions || null,
      },
    });

    // 3.10 Verification Data
    await tx.courierBookingVerification.create({
      data: {
        bookingId: booking.id,
        selectedVerification: step6.selected_verification || 'OTP Verification',
        capturePhotoOfRecipient: step6.capture_photo_of_recipient !== false,
        capturePhotoOfIdProof: Boolean(step6.capture_photo_of_id_proof),
      },
    });

    // 3.11 Service Specific Setup Data
    await tx.courierBookingServiceDetails.create({
      data: {
        bookingId: booking.id,
        serviceType,
        configuration: currentServiceSetup,
      },
    });

    // 3.12 MultiPoint Stops Data (supports unlimited stops)
    if (serviceType === 'Vault MultiPoint') {
      const multiPoint = currentServiceSetup || serviceSetups['Vault MultiPoint'] || {};
      const points = multiPoint.delivery_points || multiPoint.stops || payload.service_specific?.stops || [];
      if (Array.isArray(points) && points.length > 0) {
        await tx.courierBookingMultipointStop.createMany({
          data: points.map((p: any, idx: number) => {
            const stopAddr = typeof p.address === 'string' ? p.address : (p.address?.address_line1 || JSON.stringify(p.address));
            const stopContact = typeof p.contact === 'string' ? p.contact : (p.contact?.full_name || p.contact_person || '');
            return {
              bookingId: booking.id,
              stopNumber: Number(p.stop_sequence || p.stop_number || idx + 1),
              stopName: String(p.stop_name || `Stop ${idx + 1}`),
              subtitle: p.subtitle || p.stop_type || null,
              address: stopAddr,
              contactPerson: stopContact,
              eta: p.eta ? String(p.eta) : null,
              timeWindow: p.time_window ? String(p.time_window) : null,
            };
          }),
        });
      }
    }

    // 3.13 Sync legacy ConfidentialCourierBooking for backwards compatibility with Admin/Tracking views
    try {
      await tx.confidentialCourierBooking.create({
        data: {
          bookingNumber,
          userId: user.id,
          idempotencyKey: bookingNumber,
          requestFingerprint: bookingNumber,
          status: 'PAYMENT_PENDING',
          documentType: 'OTHER',
          envelopeSize: 'LARGE',
          pageCount: 1,
          documentDescription: itemInfo.item_name_description || itemInfo.item_name || serviceType,
          complianceAcceptedAt: new Date(),
          securityLevel: 'SECURE_SEAL',
          handoverMethod: 'OTP_AND_SIGNATURE',
          deliverySpeed: 'PRIORITY',
          pricingVersion: 'v2-canonical',
          currency: 'INR',
          baseCharge: pricing.basePrice,
          totalAmount: pricing.totalAmount,
          taxAmount: pricing.taxAmount,
          paymentMethod: 'ONLINE',
          paymentStatus: 'PENDING',
          addresses: {
            create: [
              {
                kind: 'PICKUP',
                label: 'Pickup',
                contactName: pickupLoc.contact_name || pickupContact.full_name || user.fullName || 'Sender',
                phoneNumber: pickupLoc.mobile_number || pickupContact.phone || user.mobileNumber,
                addressLine1: pickupLoc.complete_pickup_address || pickupLoc.address_line1 || '',
                city: pickupLoc.city || 'Bengaluru',
                state: pickupLoc.state || 'Karnataka',
                postalCode: String(pickupLoc.pin_code || pickupLoc.postal_code || '560001'),
              },
              {
                kind: 'DROPOFF',
                label: 'Delivery',
                contactName: deliveryLoc.contact_name || deliveryContact.full_name || 'Recipient',
                phoneNumber: deliveryLoc.mobile_number || deliveryContact.phone || '',
                addressLine1: deliveryLoc.complete_delivery_address || deliveryLoc.address_line1 || '',
                city: deliveryLoc.city || 'Bengaluru',
                state: deliveryLoc.state || 'Karnataka',
                postalCode: String(deliveryLoc.pin_code || deliveryLoc.postal_code || '560001'),
              },
            ],
          },
        },
      });
    } catch (legacyErr) {
      console.warn('Non-fatal: Could not sync legacy booking row:', legacyErr);
    }

    // Re-fetch fully joined booking for serialization
    return tx.vaultCourierBooking.findUnique({
      where: { id: booking.id },
      include: {
        pickup: true,
        delivery: true,
        contacts: true,
        timings: true,
        item: true,
        attachments: true,
        packaging: true,
        security: true,
        verification: true,
        serviceDetails: true,
        multipointStops: { orderBy: { stopNumber: 'asc' } },
        payments: true,
        receipts: true,
      },
    });
  });

  const serialized = serializeCanonicalBooking(createdBooking);

  res.status(201).json({
    status: 'success',
    success: true,
    message: 'Booking created successfully',
    data: {
      ...serialized,
      booking: serialized,
    },
  });
};

export const getVaultBookingsHandler: RequestHandler = async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new AppError({ message: 'Authentication required.', statusCode: 401, code: 'UNAUTHORIZED' });
  }

  const { service_type, status } = req.query;
  const where: any = {};
  if (user.role !== 'ADMIN') {
    where.userId = user.id;
  }
  if (service_type && typeof service_type === 'string') {
    where.serviceType = service_type;
  }
  if (status && typeof status === 'string') {
    where.status = status;
  }

  const bookings = await prisma.vaultCourierBooking.findMany({
    where,
    include: {
      pickup: true,
      delivery: true,
      contacts: true,
      timings: true,
      item: true,
      attachments: true,
      packaging: true,
      security: true,
      verification: true,
      serviceDetails: true,
      multipointStops: { orderBy: { stopNumber: 'asc' } },
      payments: true,
      receipts: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const serializedList = bookings.map(serializeCanonicalBooking);

  res.status(200).json({
    status: 'success',
    success: true,
    data: serializedList,
    bookings: serializedList,
    count: bookings.length,
  });
};

export const getVaultBookingByIdHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id ?? '');
  const user = req.user;

  const booking = await prisma.vaultCourierBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
    include: {
      pickup: true,
      delivery: true,
      contacts: true,
      timings: true,
      item: true,
      attachments: true,
      packaging: true,
      security: true,
      verification: true,
      serviceDetails: true,
      multipointStops: { orderBy: { stopNumber: 'asc' } },
      payments: true,
      receipts: true,
    },
  });

  if (!booking) {
    throw new AppError({
      message: `Vault booking "${id}" not found.`,
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  }

  if (user && user.role !== 'ADMIN' && booking.userId !== user.id) {
    throw new AppError({
      message: 'You are not authorized to view this booking.',
      statusCode: 403,
      code: 'FORBIDDEN',
    });
  }

  const serialized = serializeCanonicalBooking(booking);

  res.status(200).json({
    status: 'success',
    success: true,
    data: {
      ...serialized,
      booking: serialized,
    },
    booking: serialized,
  });
};

export const updateVaultBookingHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id ?? '');
  const user = req.user;
  const payload = req.body ?? {};

  const existing = await prisma.vaultCourierBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
    include: { pickup: true, delivery: true, item: true, packaging: true, security: true, verification: true },
  });

  if (!existing) {
    throw new AppError({
      message: `Vault booking "${id}" not found.`,
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  }

  if (user && user.role !== 'ADMIN' && existing.userId !== user.id) {
    throw new AppError({
      message: 'You are not authorized to update this booking.',
      statusCode: 403,
      code: 'FORBIDDEN',
    });
  }

  const updatedTimingNotes = payload.timing?.special_timing_notes;
  if (updatedTimingNotes && existing.pickup) {
    await prisma.courierBookingPickup.update({
      where: { id: existing.pickup.id },
      data: { specialInstructions: updatedTimingNotes },
    });
  }

  const existingRaw = existing.rawPayload ? (existing.rawPayload as any) : {};
  const newRawPayload = {
    ...existingRaw,
    ...payload,
    timing: {
      ...(existingRaw.timing || {}),
      ...(payload.timing || {}),
    },
  };
  await prisma.vaultCourierBooking.update({
    where: { id: existing.id },
    data: { rawPayload: newRawPayload },
  });

  const updated = await prisma.vaultCourierBooking.findUnique({
    where: { id: existing.id },
    include: {
      pickup: true,
      delivery: true,
      contacts: true,
      timings: true,
      item: true,
      attachments: true,
      packaging: true,
      security: true,
      verification: true,
      serviceDetails: true,
      multipointStops: { orderBy: { stopNumber: 'asc' } },
      payments: true,
      receipts: true,
    },
  });

  const serialized = serializeCanonicalBooking(updated);

  res.status(200).json({
    status: 'success',
    success: true,
    message: 'Booking updated successfully',
    data: {
      ...serialized,
      booking: serialized,
    },
  });
};

export const patchVaultBookingHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id ?? '');
  const user = req.user;
  const patch = req.body ?? {};

  const existing = await prisma.vaultCourierBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
    include: { pickup: true, delivery: true },
  });

  if (!existing) {
    throw new AppError({
      message: `Vault booking "${id}" not found.`,
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  }

  if (user && user.role !== 'ADMIN' && existing.userId !== user.id) {
    throw new AppError({
      message: 'You are not authorized to patch this booking.',
      statusCode: 403,
      code: 'FORBIDDEN',
    });
  }

  const dataToUpdate: any = {};
  if (patch.status) dataToUpdate.status = patch.status;
  if (patch.payment_status) dataToUpdate.paymentStatus = patch.payment_status;
  if (patch.receipt_status) dataToUpdate.receiptStatus = patch.receipt_status;

  if (Object.keys(dataToUpdate).length > 0) {
    await prisma.vaultCourierBooking.update({
      where: { id: existing.id },
      data: dataToUpdate,
    });
  }

  if (patch.special_instructions && existing.pickup) {
    await prisma.courierBookingPickup.update({
      where: { id: existing.pickup.id },
      data: { specialInstructions: patch.special_instructions },
    });
  }

  const updated = await prisma.vaultCourierBooking.findUnique({
    where: { id: existing.id },
    include: {
      pickup: true,
      delivery: true,
      contacts: true,
      timings: true,
      item: true,
      attachments: true,
      packaging: true,
      security: true,
      verification: true,
      serviceDetails: true,
      multipointStops: { orderBy: { stopNumber: 'asc' } },
      payments: true,
      receipts: true,
    },
  });

  const serialized = serializeCanonicalBooking(updated);

  res.status(200).json({
    status: 'success',
    success: true,
    message: 'Booking patched successfully',
    data: {
      ...serialized,
      booking: serialized,
    },
  });
};

export const deleteVaultBookingHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id ?? '');
  const user = req.user;

  const existing = await prisma.vaultCourierBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });

  if (!existing) {
    throw new AppError({
      message: `Vault booking "${id}" not found.`,
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  }

  if (user && user.role !== 'ADMIN' && existing.userId !== user.id) {
    throw new AppError({
      message: 'You are not authorized to cancel this booking.',
      statusCode: 403,
      code: 'FORBIDDEN',
    });
  }

  await prisma.vaultCourierBooking.update({
    where: { id: existing.id },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: req.body?.reason || 'Cancelled by user',
    },
  });

  res.status(200).json({
    status: 'success',
    success: true,
    message: 'Booking cancelled successfully',
  });
};


export const getCanonicalTemplateHandler: RequestHandler = (req, res) => {
  const isRaw = req.query.raw === 'true';
  if (isRaw) {
    res.status(200).json(CANONICAL_BOOKING_TEMPLATE);
    return;
  }
  res.status(200).json({
    status: 'success',
    success: true,
    data: CANONICAL_BOOKING_TEMPLATE,
    ...CANONICAL_BOOKING_TEMPLATE,
  });
};

export const getCanonicalServicesHandler: RequestHandler = (req, res) => {
  res.status(200).json({
    status: 'success',
    success: true,
    data: {
      services: defaultAvailableServices,
      template: CANONICAL_BOOKING_TEMPLATE,
      service_api_mapping: DEFAULT_SERVICE_API_MAPPING,
    },
  });
};

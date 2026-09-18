import 'dart:convert';

/// Delivez Vault / Confidential Courier Strongly-Typed Models
/// Follows the Canonical Booking Data Structure (Steps 0 to 7)

// ==========================================
// 1. STEP 0: SERVICE TYPE
// ==========================================
class VaultServiceOption {
  final String serviceType;
  final String description;
  final String estimatedTime;
  final String tag;

  VaultServiceOption({
    required this.serviceType,
    required this.description,
    required this.estimatedTime,
    required this.tag,
  });

  factory VaultServiceOption.fromJson(Map<String, dynamic> json) {
    return VaultServiceOption(
      serviceType: json['service_type'] ?? '',
      description: json['description'] ?? '',
      estimatedTime: json['estimated_time'] ?? '',
      tag: json['tag'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'service_type': serviceType,
    'description': description,
    'estimated_time': estimatedTime,
    'tag': tag,
  };
}

class Step0ServiceType {
  final String selectedService;
  final List<VaultServiceOption> availableServices;

  Step0ServiceType({
    required this.selectedService,
    required this.availableServices,
  });

  factory Step0ServiceType.fromJson(Map<String, dynamic> json) {
    return Step0ServiceType(
      selectedService: json['selected_service'] ?? 'Vault Secure',
      availableServices: (json['available_services'] as List<dynamic>?)
              ?.map((e) => VaultServiceOption.fromJson(e))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
    'selected_service': selectedService,
    'available_services': availableServices.map((e) => e.toJson()).toList(),
  };
}

// ==========================================
// 2. STEP 1: PICKUP LOCATION
// ==========================================
class AccessRequirements {
  final bool securityCheck;
  final bool visitorPass;
  final bool liftAccess;
  final bool idProof;
  final bool parking;

  AccessRequirements({
    this.securityCheck = false,
    this.visitorPass = false,
    this.liftAccess = false,
    this.idProof = false,
    this.parking = false,
  });

  factory AccessRequirements.fromJson(Map<String, dynamic> json) {
    return AccessRequirements(
      securityCheck: json['security_check'] ?? false,
      visitorPass: json['visitor_pass'] ?? false,
      liftAccess: json['lift_access'] ?? false,
      idProof: json['id_proof'] ?? false,
      parking: json['parking'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'security_check': securityCheck,
    'visitor_pass': visitorPass,
    'lift_access': liftAccess,
    'id_proof': idProof,
    'parking': parking,
  };
}

class PickupLocation {
  final String pickupType;
  final List<String> pickupTypeOptions;
  final String contactName;
  final String mobileNumber;
  final String companyOrganization;
  final String gstin;
  final String completePickupAddress;
  final String city;
  final String state;
  final String pinCode;
  final bool useMyLocation;

  PickupLocation({
    this.pickupType = 'Business',
    this.pickupTypeOptions = const ['Business', 'Home'],
    this.contactName = '',
    this.mobileNumber = '',
    this.companyOrganization = '',
    this.gstin = '',
    this.completePickupAddress = '',
    this.city = '',
    this.state = '',
    this.pinCode = '',
    this.useMyLocation = false,
  });

  factory PickupLocation.fromJson(Map<String, dynamic> json) {
    return PickupLocation(
      pickupType: json['pickup_type'] ?? 'Business',
      pickupTypeOptions: (json['pickup_type_options'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          ['Business', 'Home'],
      contactName: json['contact_name'] ?? '',
      mobileNumber: json['mobile_number'] ?? '',
      companyOrganization: json['company_organization'] ?? '',
      gstin: json['gstin'] ?? '',
      completePickupAddress: json['complete_pickup_address'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      pinCode: json['pin_code'] ?? '',
      useMyLocation: json['use_my_location'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'pickup_type': pickupType,
    'pickup_type_options': pickupTypeOptions,
    'contact_name': contactName,
    'mobile_number': mobileNumber,
    'company_organization': companyOrganization,
    'gstin': gstin,
    'complete_pickup_address': completePickupAddress,
    'city': city,
    'state': state,
    'pin_code': pinCode,
    'use_my_location': useMyLocation,
  };
}

class PickupContactPerson {
  final String contactPerson;
  final String designation;
  final String alternateMobile;
  final String email;

  PickupContactPerson({
    this.contactPerson = '',
    this.designation = '',
    this.alternateMobile = '',
    this.email = '',
  });

  factory PickupContactPerson.fromJson(Map<String, dynamic> json) {
    return PickupContactPerson(
      contactPerson: json['contact_person'] ?? '',
      designation: json['designation'] ?? '',
      alternateMobile: json['alternate_mobile'] ?? '',
      email: json['email'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'contact_person': contactPerson,
    'designation': designation,
    'alternate_mobile': alternateMobile,
    'email': email,
  };
}

class PickupTiming {
  final String pickupDate;
  final String pickupTimeWindow;
  final String preferredTime;

  PickupTiming({
    this.pickupDate = '',
    this.pickupTimeWindow = '',
    this.preferredTime = '',
  });

  factory PickupTiming.fromJson(Map<String, dynamic> json) {
    return PickupTiming(
      pickupDate: json['pickup_date'] ?? '',
      pickupTimeWindow: json['pickup_time_window'] ?? '',
      preferredTime: json['preferred_time'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'pickup_date': pickupDate,
    'pickup_time_window': pickupTimeWindow,
    'preferred_time': preferredTime,
  };
}

class Step1PickupLocation {
  final PickupLocation pickupLocation;
  final PickupContactPerson pickupContactPerson;
  final PickupTiming pickupTiming;
  final String pickupSpecialInstructions;
  final AccessRequirements pickupAccessRequirements;

  Step1PickupLocation({
    required this.pickupLocation,
    required this.pickupContactPerson,
    required this.pickupTiming,
    this.pickupSpecialInstructions = '',
    required this.pickupAccessRequirements,
  });

  factory Step1PickupLocation.fromJson(Map<String, dynamic> json) {
    return Step1PickupLocation(
      pickupLocation: PickupLocation.fromJson(json['pickup_location'] ?? {}),
      pickupContactPerson:
          PickupContactPerson.fromJson(json['pickup_contact_person'] ?? {}),
      pickupTiming: PickupTiming.fromJson(json['pickup_timing'] ?? {}),
      pickupSpecialInstructions: json['pickup_special_instructions'] ?? '',
      pickupAccessRequirements: AccessRequirements.fromJson(
          json['pickup_access_requirements'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() => {
    'pickup_location': pickupLocation.toJson(),
    'pickup_contact_person': pickupContactPerson.toJson(),
    'pickup_timing': pickupTiming.toJson(),
    'pickup_special_instructions': pickupSpecialInstructions,
    'pickup_access_requirements': pickupAccessRequirements.toJson(),
  };
}

// ==========================================
// 3. STEP 2: RECIPIENT & DELIVERY
// ==========================================
class DeliveryLocation {
  final String deliveryType;
  final List<String> deliveryTypeOptions;
  final String contactName;
  final String mobileNumber;
  final String companyOrganization;
  final String gstin;
  final String completeDeliveryAddress;
  final String city;
  final String state;
  final String pinCode;
  final bool useMyLocation;

  DeliveryLocation({
    this.deliveryType = 'Business',
    this.deliveryTypeOptions = const ['Business', 'Home'],
    this.contactName = '',
    this.mobileNumber = '',
    this.companyOrganization = '',
    this.gstin = '',
    this.completeDeliveryAddress = '',
    this.city = '',
    this.state = '',
    this.pinCode = '',
    this.useMyLocation = false,
  });

  factory DeliveryLocation.fromJson(Map<String, dynamic> json) {
    return DeliveryLocation(
      deliveryType: json['delivery_type'] ?? 'Business',
      deliveryTypeOptions: (json['delivery_type_options'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          ['Business', 'Home'],
      contactName: json['contact_name'] ?? '',
      mobileNumber: json['mobile_number'] ?? '',
      companyOrganization: json['company_organization'] ?? '',
      gstin: json['gstin'] ?? '',
      completeDeliveryAddress: json['complete_delivery_address'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      pinCode: json['pin_code'] ?? '',
      useMyLocation: json['use_my_location'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'delivery_type': deliveryType,
    'delivery_type_options': deliveryTypeOptions,
    'contact_name': contactName,
    'mobile_number': mobileNumber,
    'company_organization': companyOrganization,
    'gstin': gstin,
    'complete_delivery_address': completeDeliveryAddress,
    'city': city,
    'state': state,
    'pin_code': pinCode,
    'use_my_location': useMyLocation,
  };
}

class DeliveryContactPerson {
  final String contactPerson;
  final String designation;
  final String alternateMobile;
  final String email;

  DeliveryContactPerson({
    this.contactPerson = '',
    this.designation = '',
    this.alternateMobile = '',
    this.email = '',
  });

  factory DeliveryContactPerson.fromJson(Map<String, dynamic> json) {
    return DeliveryContactPerson(
      contactPerson: json['contact_person'] ?? '',
      designation: json['designation'] ?? '',
      alternateMobile: json['alternate_mobile'] ?? '',
      email: json['email'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'contact_person': contactPerson,
    'designation': designation,
    'alternate_mobile': alternateMobile,
    'email': email,
  };
}

class DeliveryTiming {
  final String preferredDeliveryDate;
  final String preferredTimeWindow;
  final String customerAvailable;

  DeliveryTiming({
    this.preferredDeliveryDate = '',
    this.preferredTimeWindow = '',
    this.customerAvailable = '',
  });

  factory DeliveryTiming.fromJson(Map<String, dynamic> json) {
    return DeliveryTiming(
      preferredDeliveryDate: json['preferred_delivery_date'] ?? '',
      preferredTimeWindow: json['preferred_time_window'] ?? '',
      customerAvailable: json['customer_available'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'preferred_delivery_date': preferredDeliveryDate,
    'preferred_time_window': preferredTimeWindow,
    'customer_available': customerAvailable,
  };
}

// ==========================================
// SERVICE-SPECIFIC CONFIGURATIONS
// ==========================================
class DirectDeliverySetup {
  final String deliveryType;
  final List<String> deliveryTypeOptions;
  final String pickupAddress;
  final bool useCurrentPickupLocation;
  final String deliveryAddress;
  final bool useCurrentDeliveryLocation;
  final String preferredDeliveryDate;
  final String preferredTimeWindow;
  final String timezone;
  final String specialInstructions;
  final bool singlePointHandling;
  final bool avoidHubsSorting;
  final bool sealedSecure;
  final bool deliveryAlerts;
  final String recipientContact;
  final String verificationMethod;
  final String alternateContact;

  DirectDeliverySetup({
    this.deliveryType = 'Direct Delivery',
    this.deliveryTypeOptions = const [
      'Direct Delivery',
      'Direct Express',
      'Same Day Direct'
    ],
    this.pickupAddress = '',
    this.useCurrentPickupLocation = false,
    this.deliveryAddress = '',
    this.useCurrentDeliveryLocation = false,
    this.preferredDeliveryDate = '',
    this.preferredTimeWindow = '',
    this.timezone = 'IST (GMT +05:30)',
    this.specialInstructions = '',
    this.singlePointHandling = true,
    this.avoidHubsSorting = true,
    this.sealedSecure = true,
    this.deliveryAlerts = true,
    this.recipientContact = '',
    this.verificationMethod = '',
    this.alternateContact = '',
  });

  factory DirectDeliverySetup.fromJson(Map<String, dynamic> json) {
    final prefs = json['delivery_preferences'] ?? {};
    final handling = json['handling_options'] ?? {};
    final contact = json['contact_and_verification'] ?? {};
    final pLoc = json['pickup_location'] ?? {};
    final dLoc = json['delivery_location'] ?? {};

    return DirectDeliverySetup(
      deliveryType: json['delivery_type'] ?? 'Direct Delivery',
      pickupAddress: pLoc['pickup_address'] ?? '',
      useCurrentPickupLocation: pLoc['use_current_location'] ?? false,
      deliveryAddress: dLoc['delivery_address'] ?? '',
      useCurrentDeliveryLocation: dLoc['use_current_location'] ?? false,
      preferredDeliveryDate: prefs['preferred_delivery_date'] ?? '',
      preferredTimeWindow: prefs['preferred_time_window'] ?? '',
      timezone: prefs['timezone'] ?? 'IST (GMT +05:30)',
      specialInstructions: prefs['special_instructions'] ?? '',
      singlePointHandling: handling['single_point_handling'] ?? true,
      avoidHubsSorting: handling['avoid_hubs_sorting'] ?? true,
      sealedSecure: handling['sealed_secure'] ?? true,
      deliveryAlerts: handling['delivery_alerts'] ?? true,
      recipientContact: contact['recipient_contact'] ?? '',
      verificationMethod: contact['verification_method'] ?? '',
      alternateContact: contact['alternate_contact'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'delivery_type': deliveryType,
    'delivery_type_options': deliveryTypeOptions,
    'pickup_location': {
      'pickup_address': pickupAddress,
      'use_current_location': useCurrentPickupLocation,
    },
    'delivery_location': {
      'delivery_address': deliveryAddress,
      'use_current_location': useCurrentDeliveryLocation,
    },
    'delivery_preferences': {
      'preferred_delivery_date': preferredDeliveryDate,
      'preferred_time_window': preferredTimeWindow,
      'timezone': timezone,
      'special_instructions': specialInstructions,
    },
    'handling_options': {
      'single_point_handling': singlePointHandling,
      'avoid_hubs_sorting': avoidHubsSorting,
      'sealed_secure': sealedSecure,
      'delivery_alerts': deliveryAlerts,
    },
    'contact_and_verification': {
      'recipient_contact': recipientContact,
      'verification_method': verificationMethod,
      'alternate_contact': alternateContact,
    },
  };
}

class PreciseDeliverySetup {
  final String deliveryDate;
  final String preferredTimeWindow;
  final String timezone;
  final String deliveryDeadlineHardCutoff;
  final bool earlyDeliveryNotAllowed;
  final String deliveryAddress;
  final bool editAddress;
  final String deliveryInstructions;
  final String landmark;
  final String recipientName;
  final String recipientContact;
  final String verificationMethod;
  final bool recipientMustBeAvailable;
  final String alternateContact;
  final String handlingOption;
  final String specialInstructions;

  PreciseDeliverySetup({
    this.deliveryDate = '',
    this.preferredTimeWindow = '',
    this.timezone = 'IST (GMT +05:30)',
    this.deliveryDeadlineHardCutoff = '',
    this.earlyDeliveryNotAllowed = true,
    this.deliveryAddress = '',
    this.editAddress = false,
    this.deliveryInstructions = '',
    this.landmark = '',
    this.recipientName = '',
    this.recipientContact = '',
    this.verificationMethod = '',
    this.recipientMustBeAvailable = true,
    this.alternateContact = '',
    this.handlingOption = 'Precise Delivery',
    this.specialInstructions = '',
  });

  factory PreciseDeliverySetup.fromJson(Map<String, dynamic> json) {
    final prec = json['delivery_precision'] ?? {};
    final loc = json['delivery_location'] ?? {};
    final rec = json['recipient_and_verification'] ?? {};
    final hand = json['handling_and_service_options'] ?? {};

    return PreciseDeliverySetup(
      deliveryDate: prec['delivery_date'] ?? '',
      preferredTimeWindow: prec['preferred_time_window'] ?? '',
      timezone: prec['timezone'] ?? 'IST (GMT +05:30)',
      deliveryDeadlineHardCutoff: prec['delivery_deadline_hard_cutoff'] ?? '',
      earlyDeliveryNotAllowed: prec['early_delivery_not_allowed'] ?? true,
      deliveryAddress: loc['delivery_address'] ?? '',
      editAddress: loc['edit_address'] ?? false,
      deliveryInstructions: loc['delivery_instructions'] ?? '',
      landmark: loc['landmark'] ?? '',
      recipientName: rec['recipient_name'] ?? '',
      recipientContact: rec['recipient_contact'] ?? '',
      verificationMethod: rec['verification_method'] ?? '',
      recipientMustBeAvailable:
          rec['recipient_must_be_available_within_time_window'] ?? true,
      alternateContact: rec['alternate_contact'] ?? '',
      handlingOption: hand['handling_option'] ?? 'Precise Delivery',
      specialInstructions: json['special_instructions'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'delivery_precision': {
      'delivery_date': deliveryDate,
      'preferred_time_window': preferredTimeWindow,
      'timezone': timezone,
      'delivery_deadline_hard_cutoff': deliveryDeadlineHardCutoff,
      'early_delivery_not_allowed': earlyDeliveryNotAllowed,
    },
    'delivery_location': {
      'delivery_address': deliveryAddress,
      'edit_address': editAddress,
      'delivery_instructions': deliveryInstructions,
      'landmark': landmark,
    },
    'recipient_and_verification': {
      'recipient_name': recipientName,
      'recipient_contact': recipientContact,
      'verification_method': verificationMethod,
      'recipient_must_be_available_within_time_window':
          recipientMustBeAvailable,
      'alternate_contact': alternateContact,
    },
    'handling_and_service_options': {
      'handling_option': handlingOption,
      'handling_option_options': [
        'Precise Delivery',
        'Precise + Priority',
        'Precise + Signature',
        'Photo Proof',
      ],
    },
    'special_instructions': specialInstructions,
  };
}

class HandCarrySetup {
  final String handCarryType;
  final String executiveLevel;
  final String declaredValue;
  final String preferredHandoverSlot;
  final bool dedicatedExecutive;
  final bool idCheckOnPickup;
  final bool idCheckOnDelivery;
  final bool signatureAtHandover;
  final bool noUnattendedDelivery;
  final bool recipientMustBePresent;
  final bool realTimeTrackingAndAlerts;
  final bool chainOfCustody;
  final bool photoProofAtDelivery;
  final bool confidentialHandling;
  final bool escalationContactRequired;
  final String specialInstructions;

  HandCarrySetup({
    this.handCarryType = 'Confidential Documents',
    this.executiveLevel = 'Verified Executive',
    this.declaredValue = '',
    this.preferredHandoverSlot = '',
    this.dedicatedExecutive = true,
    this.idCheckOnPickup = true,
    this.idCheckOnDelivery = true,
    this.signatureAtHandover = true,
    this.noUnattendedDelivery = true,
    this.recipientMustBePresent = false,
    this.realTimeTrackingAndAlerts = true,
    this.chainOfCustody = true,
    this.photoProofAtDelivery = true,
    this.confidentialHandling = true,
    this.escalationContactRequired = true,
    this.specialInstructions = '',
  });

  factory HandCarrySetup.fromJson(Map<String, dynamic> json) {
    final det = json['hand_carry_details'] ?? {};
    final exec = json['executive_and_handover_instructions'] ?? {};
    final mon = json['monitoring_and_security'] ?? {};

    return HandCarrySetup(
      handCarryType: det['hand_carry_type'] ?? 'Confidential Documents',
      executiveLevel: det['executive_level'] ?? 'Verified Executive',
      declaredValue: det['declared_value'] ?? '',
      preferredHandoverSlot: det['preferred_handover_slot'] ?? '',
      dedicatedExecutive: exec['dedicated_executive'] ?? true,
      idCheckOnPickup: exec['id_check_on_pickup'] ?? true,
      idCheckOnDelivery: exec['id_check_on_delivery'] ?? true,
      signatureAtHandover: exec['signature_at_handover'] ?? true,
      noUnattendedDelivery: exec['no_unattended_delivery'] ?? true,
      recipientMustBePresent: exec['recipient_must_be_present'] ?? false,
      realTimeTrackingAndAlerts: mon['real_time_tracking_and_alerts'] ?? true,
      chainOfCustody: mon['chain_of_custody'] ?? true,
      photoProofAtDelivery: mon['photo_proof_at_delivery'] ?? true,
      confidentialHandling: mon['confidential_handling'] ?? true,
      escalationContactRequired: mon['escalation_contact_required'] ?? true,
      specialInstructions: json['special_instructions'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'hand_carry_details': {
      'hand_carry_type': handCarryType,
      'hand_carry_type_options': [
        'Confidential Documents',
        'High Value Item',
        'Priority Delivery',
      ],
      'executive_level': executiveLevel,
      'declared_value': declaredValue,
      'preferred_handover_slot': preferredHandoverSlot,
    },
    'executive_and_handover_instructions': {
      'dedicated_executive': dedicatedExecutive,
      'id_check_on_pickup': idCheckOnPickup,
      'id_check_on_delivery': idCheckOnDelivery,
      'signature_at_handover': signatureAtHandover,
      'no_unattended_delivery': noUnattendedDelivery,
      'recipient_must_be_present': recipientMustBePresent,
    },
    'monitoring_and_security': {
      'real_time_tracking_and_alerts': realTimeTrackingAndAlerts,
      'chain_of_custody': chainOfCustody,
      'photo_proof_at_delivery': photoProofAtDelivery,
      'confidential_handling': confidentialHandling,
      'escalation_contact_required': escalationContactRequired,
    },
    'special_instructions': specialInstructions,
  };
}

class ReturnSetup {
  final String returnType;
  final String returnReason;
  final String rmaReferenceNumber;
  final String returnInstruction;
  final String expectedReturnDate;
  final String addressMode;
  final String returnAddressPreview;
  final bool editAddress;
  final String collectionDatePreference;
  final String collectionTimeWindow;
  final String pickupInstructionsForReturn;

  ReturnSetup({
    this.returnType = 'Return to Sender',
    this.returnReason = '',
    this.rmaReferenceNumber = '',
    this.returnInstruction = '',
    this.expectedReturnDate = '',
    this.addressMode = 'Same as Pickup Address',
    this.returnAddressPreview = '',
    this.editAddress = false,
    this.collectionDatePreference = '',
    this.collectionTimeWindow = '',
    this.pickupInstructionsForReturn = '',
  });

  factory ReturnSetup.fromJson(Map<String, dynamic> json) {
    final ret = json['return_details'] ?? {};
    final addr = json['return_address'] ?? {};
    final col = json['return_collection_preference'] ?? {};

    return ReturnSetup(
      returnType: ret['return_type'] ?? 'Return to Sender',
      returnReason: ret['return_reason'] ?? '',
      rmaReferenceNumber: ret['rma_reference_number'] ?? '',
      returnInstruction: ret['return_instruction'] ?? '',
      expectedReturnDate: ret['expected_return_date'] ?? '',
      addressMode: addr['address_mode'] ?? 'Same as Pickup Address',
      returnAddressPreview: addr['return_address_preview'] ?? '',
      editAddress: addr['edit_address'] ?? false,
      collectionDatePreference: col['collection_date_preference'] ?? '',
      collectionTimeWindow: col['collection_time_window'] ?? '',
      pickupInstructionsForReturn:
          col['pickup_instructions_for_return'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'return_details': {
      'return_type': returnType,
      'return_type_options': [
        'Return to Sender',
        'Return to Another Location',
      ],
      'return_reason': returnReason,
      'rma_reference_number': rmaReferenceNumber,
      'return_instruction': returnInstruction,
      'expected_return_date': expectedReturnDate,
    },
    'return_address': {
      'address_mode': addressMode,
      'address_mode_options': [
        'Same as Pickup Address',
        'Use Different Address',
      ],
      'return_address_preview': returnAddressPreview,
      'edit_address': editAddress,
    },
    'return_collection_preference': {
      'collection_date_preference': collectionDatePreference,
      'collection_time_window': collectionTimeWindow,
      'pickup_instructions_for_return': pickupInstructionsForReturn,
    },
  };
}

class CriticalSetup {
  final String criticalShipmentType;
  final String criticalLevel;
  final String declaredValue;
  final String slaDeliveryCommitment;
  final bool tamperProofSealing;
  final bool singlePointOfContact;
  final bool secureStorageAtHubs;
  final bool armedEscortIfAvailable;
  final bool noUnattendedDelivery;
  final bool photoProofAtEveryStage;
  final String priorityHandling;
  final bool realTimeTrackingAndAlerts;
  final String delayAlertThreshold;
  final String specialInstructions;

  CriticalSetup({
    this.criticalShipmentType = 'High Value',
    this.criticalLevel = 'Level 1 - Highest',
    this.declaredValue = '',
    this.slaDeliveryCommitment = 'Select SLA',
    this.tamperProofSealing = true,
    this.singlePointOfContact = true,
    this.secureStorageAtHubs = true,
    this.armedEscortIfAvailable = false,
    this.noUnattendedDelivery = true,
    this.photoProofAtEveryStage = true,
    this.priorityHandling = 'Highest Priority',
    this.realTimeTrackingAndAlerts = true,
    this.delayAlertThreshold = '15 minutes',
    this.specialInstructions = '',
  });

  factory CriticalSetup.fromJson(Map<String, dynamic> json) {
    final det = json['critical_details'] ?? {};
    final sec = json['security_and_handling_instructions'] ?? {};
    final prio = json['priority_and_monitoring'] ?? {};

    return CriticalSetup(
      criticalShipmentType: det['critical_shipment_type'] ?? 'High Value',
      criticalLevel: det['critical_level'] ?? 'Level 1 - Highest',
      declaredValue: det['declared_value'] ?? '',
      slaDeliveryCommitment: det['sla_delivery_commitment'] ?? 'Select SLA',
      tamperProofSealing: sec['tamper_proof_sealing'] ?? true,
      singlePointOfContact: sec['single_point_of_contact'] ?? true,
      secureStorageAtHubs: sec['secure_storage_at_hubs'] ?? true,
      armedEscortIfAvailable: sec['armed_escort_if_available'] ?? false,
      noUnattendedDelivery: sec['no_unattended_delivery'] ?? true,
      photoProofAtEveryStage: sec['photo_proof_at_every_stage'] ?? true,
      priorityHandling: prio['priority_handling'] ?? 'Highest Priority',
      realTimeTrackingAndAlerts: prio['real_time_tracking_and_alerts'] ?? true,
      delayAlertThreshold: prio['delay_alert_threshold'] ?? '15 minutes',
      specialInstructions: json['special_instructions'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'critical_details': {
      'critical_shipment_type': criticalShipmentType,
      'critical_shipment_type_options': [
        'High Value',
        'Time Critical',
        'Confidential',
      ],
      'critical_level': criticalLevel,
      'declared_value': declaredValue,
      'sla_delivery_commitment': slaDeliveryCommitment,
    },
    'security_and_handling_instructions': {
      'tamper_proof_sealing': tamperProofSealing,
      'single_point_of_contact': singlePointOfContact,
      'secure_storage_at_hubs': secureStorageAtHubs,
      'armed_escort_if_available': armedEscortIfAvailable,
      'no_unattended_delivery': noUnattendedDelivery,
      'photo_proof_at_every_stage': photoProofAtEveryStage,
    },
    'priority_and_monitoring': {
      'priority_handling': priorityHandling,
      'real_time_tracking_and_alerts': realTimeTrackingAndAlerts,
      'delay_alert_threshold': delayAlertThreshold,
    },
    'special_instructions': specialInstructions,
  };
}

class MultiPointStop {
  final int stopNumber;
  final String stopName;
  final String subtitle;
  final String address;
  final String contactPerson;
  final String eta;

  MultiPointStop({
    required this.stopNumber,
    required this.stopName,
    this.subtitle = '',
    required this.address,
    required this.contactPerson,
    this.eta = '',
  });

  factory MultiPointStop.fromJson(Map<String, dynamic> json) {
    return MultiPointStop(
      stopNumber: json['stop_number'] ?? 1,
      stopName: json['stop_name'] ?? '',
      subtitle: json['subtitle'] ?? '',
      address: json['address'] ?? '',
      contactPerson: json['contact_person'] ?? '',
      eta: json['eta'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'stop_number': stopNumber,
    'stop_name': stopName,
    'subtitle': subtitle,
    'address': address,
    'contact_person': contactPerson,
    'eta': eta,
  };
}

class MultiPointSetup {
  final int totalStops;
  final String estimatedDistance;
  final String estimatedTime;
  final String serviceType;
  final List<MultiPointStop> deliveryPoints;
  final bool timeWindowForEachStop;
  final bool notifyRecipients;
  final bool collectPodAtEachStop;
  final bool returnToOriginIfUndelivered;
  final String specialInstructions;

  MultiPointSetup({
    this.totalStops = 1,
    this.estimatedDistance = '',
    this.estimatedTime = '',
    this.serviceType = 'Multi Point Delivery',
    required this.deliveryPoints,
    this.timeWindowForEachStop = false,
    this.notifyRecipients = true,
    this.collectPodAtEachStop = false,
    this.returnToOriginIfUndelivered = false,
    this.specialInstructions = '',
  });

  factory MultiPointSetup.fromJson(Map<String, dynamic> json) {
    final summ = json['route_summary'] ?? {};
    final opt = json['additional_options'] ?? {};
    final pts = (json['delivery_points'] as List<dynamic>?)
            ?.map((e) => MultiPointStop.fromJson(e))
            .toList() ??
        [];

    return MultiPointSetup(
      totalStops: summ['total_stops'] ?? pts.length,
      estimatedDistance: summ['estimated_distance'] ?? '',
      estimatedTime: summ['estimated_time'] ?? '',
      serviceType: summ['service_type'] ?? 'Multi Point Delivery',
      deliveryPoints: pts,
      timeWindowForEachStop: opt['time_window_for_each_stop'] ?? false,
      notifyRecipients: opt['notify_recipients'] ?? true,
      collectPodAtEachStop: opt['collect_pod_at_each_stop'] ?? false,
      returnToOriginIfUndelivered:
          opt['return_to_origin_if_undelivered'] ?? false,
      specialInstructions: json['special_instructions'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'route_summary': {
      'total_stops': totalStops,
      'estimated_distance': estimatedDistance,
      'estimated_time': estimatedTime,
      'service_type': serviceType,
    },
    'delivery_points': deliveryPoints.map((e) => e.toJson()).toList(),
    'delivery_point_actions': {
      'add_stop': true,
      'edit_stop': true,
      'delete_stop': true,
      'reorder_stops': true,
      'optimize_route': false,
    },
    'additional_options': {
      'time_window_for_each_stop': timeWindowForEachStop,
      'notify_recipients': notifyRecipients,
      'collect_pod_at_each_stop': collectPodAtEachStop,
      'return_to_origin_if_undelivered': returnToOriginIfUndelivered,
    },
    'special_instructions': specialInstructions,
  };
}

class Step2RecipientAndDelivery {
  final DeliveryLocation deliveryLocation;
  final DeliveryContactPerson deliveryContactPerson;
  final DeliveryTiming deliveryTiming;
  final String deliverySpecialInstructions;
  final AccessRequirements deliveryAccessRequirements;
  final Map<String, dynamic> serviceSpecificSetup;

  Step2RecipientAndDelivery({
    required this.deliveryLocation,
    required this.deliveryContactPerson,
    required this.deliveryTiming,
    this.deliverySpecialInstructions = '',
    required this.deliveryAccessRequirements,
    required this.serviceSpecificSetup,
  });

  factory Step2RecipientAndDelivery.fromJson(Map<String, dynamic> json) {
    return Step2RecipientAndDelivery(
      deliveryLocation:
          DeliveryLocation.fromJson(json['delivery_location'] ?? {}),
      deliveryContactPerson: DeliveryContactPerson.fromJson(
          json['delivery_contact_person'] ?? {}),
      deliveryTiming: DeliveryTiming.fromJson(json['delivery_timing'] ?? {}),
      deliverySpecialInstructions:
          json['delivery_special_instructions'] ?? '',
      deliveryAccessRequirements: AccessRequirements.fromJson(
          json['delivery_access_requirements'] ?? {}),
      serviceSpecificSetup: json['service_specific_setup'] ?? {},
    );
  }

  Map<String, dynamic> toJson() => {
    'delivery_location': deliveryLocation.toJson(),
    'delivery_contact_person': deliveryContactPerson.toJson(),
    'delivery_timing': deliveryTiming.toJson(),
    'delivery_special_instructions': deliverySpecialInstructions,
    'delivery_access_requirements': deliveryAccessRequirements.toJson(),
    'service_specific_setup': serviceSpecificSetup,
  };
}

// ==========================================
// 4. STEP 3: ITEM TYPE & INFORMATION
// ==========================================
class ItemDimensions {
  final String length;
  final String width;
  final String height;
  final String unit;

  ItemDimensions({
    this.length = '',
    this.width = '',
    this.height = '',
    this.unit = 'cm',
  });

  factory ItemDimensions.fromJson(Map<String, dynamic> json) {
    return ItemDimensions(
      length: json['length'] ?? '',
      width: json['width'] ?? '',
      height: json['height'] ?? '',
      unit: json['unit'] ?? 'cm',
    );
  }

  Map<String, dynamic> toJson() => {
    'length': length,
    'width': width,
    'height': height,
    'unit': unit,
  };
}

class ItemHandling {
  final bool fragile;
  final bool handleWithCare;
  final bool thisSideUp;
  final bool keepDry;
  final bool doNotStack;
  final bool highValue;

  ItemHandling({
    this.fragile = false,
    this.handleWithCare = false,
    this.thisSideUp = false,
    this.keepDry = false,
    this.doNotStack = false,
    this.highValue = false,
  });

  factory ItemHandling.fromJson(Map<String, dynamic> json) {
    return ItemHandling(
      fragile: json['fragile'] ?? false,
      handleWithCare: json['handle_with_care'] ?? false,
      thisSideUp: json['this_side_up'] ?? false,
      keepDry: json['keep_dry'] ?? false,
      doNotStack: json['do_not_stack'] ?? false,
      highValue: json['high_value'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'fragile': fragile,
    'handle_with_care': handleWithCare,
    'this_side_up': thisSideUp,
    'keep_dry': keepDry,
    'do_not_stack': doNotStack,
    'high_value': highValue,
  };
}

class ItemInformation {
  final String itemNameDescription;
  final String itemCategory;
  final String itemType;
  final List<String> itemTypeOptions;
  final int numberOfPieces;
  final String weightActual;
  final String weightUnit;
  final ItemDimensions dimensions;
  final String declaredValue;
  final String contentType;
  final String itemContentsDescription;

  ItemInformation({
    this.itemNameDescription = '',
    this.itemCategory = '',
    this.itemType = 'Document',
    this.itemTypeOptions = const ['Document', 'Parcel', 'Other'],
    this.numberOfPieces = 1,
    this.weightActual = '',
    this.weightUnit = 'kg',
    required this.dimensions,
    this.declaredValue = '',
    this.contentType = '',
    this.itemContentsDescription = '',
  });

  factory ItemInformation.fromJson(Map<String, dynamic> json) {
    return ItemInformation(
      itemNameDescription: json['item_name_description'] ?? '',
      itemCategory: json['item_category'] ?? '',
      itemType: json['item_type'] ?? 'Document',
      itemTypeOptions: (json['item_type_options'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          ['Document', 'Parcel', 'Other'],
      numberOfPieces: json['number_of_pieces'] ?? 1,
      weightActual: json['weight_actual'] ?? '',
      weightUnit: json['weight_unit'] ?? 'kg',
      dimensions: ItemDimensions.fromJson(json['dimensions'] ?? {}),
      declaredValue: json['declared_value'] ?? '',
      contentType: json['content_type'] ?? '',
      itemContentsDescription: json['item_contents_description'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'item_name_description': itemNameDescription,
    'item_category': itemCategory,
    'item_type': itemType,
    'item_type_options': itemTypeOptions,
    'number_of_pieces': numberOfPieces,
    'weight_actual': weightActual,
    'weight_unit': weightUnit,
    'dimensions': dimensions.toJson(),
    'declared_value': declaredValue,
    'content_type': contentType,
    'item_contents_description': itemContentsDescription,
  };
}

class Step3ItemTypeAndInformation {
  final String selectedTopItemType;
  final List<String> topItemTypeOptions;
  final String otherItemType;
  final ItemInformation itemInformation;
  final List<dynamic> attachments;
  final ItemHandling itemHandling;

  Step3ItemTypeAndInformation({
    this.selectedTopItemType = '',
    this.topItemTypeOptions = const [
      'Confidential Documents',
      'Legal Documents',
      'Contracts / Agreements',
      'Financial Documents',
      'Official Documents',
      'Original Certificates',
      'Sealed Envelope',
      'Sensitive Records',
      'Secure Package'
    ],
    this.otherItemType = '',
    required this.itemInformation,
    this.attachments = const [],
    required this.itemHandling,
  });

  factory Step3ItemTypeAndInformation.fromJson(Map<String, dynamic> json) {
    return Step3ItemTypeAndInformation(
      selectedTopItemType: json['selected_top_item_type'] ?? '',
      topItemTypeOptions: (json['top_item_type_options'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [
            'Confidential Documents',
            'Legal Documents',
            'Contracts / Agreements',
            'Financial Documents',
            'Official Documents',
            'Original Certificates',
            'Sealed Envelope',
            'Sensitive Records',
            'Secure Package'
          ],
      otherItemType: json['other_item_type'] ?? '',
      itemInformation:
          ItemInformation.fromJson(json['item_information'] ?? {}),
      attachments: json['attachments'] ?? [],
      itemHandling: ItemHandling.fromJson(json['item_handling'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() => {
    'selected_top_item_type': selectedTopItemType,
    'top_item_type_options': topItemTypeOptions,
    'other_item_type': otherItemType,
    'item_information': itemInformation.toJson(),
    'attachments': attachments,
    'item_handling': itemHandling.toJson(),
  };
}

// ==========================================
// 5. STEP 4: PACKAGING OPTIONS
// ==========================================
class AddOnProtection {
  final bool extraBubbleWrap;
  final bool cornerGuard;
  final bool waterproofCover;
  final bool fragileSticker;
  final bool sealAndSecurityTape;

  AddOnProtection({
    this.extraBubbleWrap = false,
    this.cornerGuard = false,
    this.waterproofCover = false,
    this.fragileSticker = false,
    this.sealAndSecurityTape = false,
  });

  factory AddOnProtection.fromJson(Map<String, dynamic> json) {
    return AddOnProtection(
      extraBubbleWrap: json['extra_bubble_wrap'] ?? false,
      cornerGuard: json['corner_guard'] ?? false,
      waterproofCover: json['waterproof_cover'] ?? false,
      fragileSticker: json['fragile_sticker'] ?? false,
      sealAndSecurityTape: json['seal_and_security_tape'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'extra_bubble_wrap': extraBubbleWrap,
    'corner_guard': cornerGuard,
    'waterproof_cover': waterproofCover,
    'fragile_sticker': fragileSticker,
    'seal_and_security_tape': sealAndSecurityTape,
  };
}

class PackagingPreview {
  final String selectedPackaging;
  final String protectionLevel;
  final String suitableFor;

  PackagingPreview({
    this.selectedPackaging = '',
    this.protectionLevel = '',
    this.suitableFor = '',
  });

  factory PackagingPreview.fromJson(Map<String, dynamic> json) {
    return PackagingPreview(
      selectedPackaging: json['selected_packaging'] ?? '',
      protectionLevel: json['protection_level'] ?? '',
      suitableFor: json['suitable_for'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'selected_packaging': selectedPackaging,
    'protection_level': protectionLevel,
    'suitable_for': suitableFor,
  };
}

class Step4PackagingOptions {
  final String selectedPackage;
  final List<String> packageTypeOptions;
  final AddOnProtection addOnProtection;
  final String packagingInstructions;
  final PackagingPreview packagingPreview;

  Step4PackagingOptions({
    this.selectedPackage = 'Standard Box',
    this.packageTypeOptions = const [
      'Standard Box',
      'Padded Envelope',
      'Tamper Proof Pouch',
      'Bubble Wrap',
      'Heavy Duty Crate',
      'Document Sleeve',
      'My Own Package'
    ],
    required this.addOnProtection,
    this.packagingInstructions = '',
    required this.packagingPreview,
  });

  factory Step4PackagingOptions.fromJson(Map<String, dynamic> json) {
    return Step4PackagingOptions(
      selectedPackage: json['selected_package'] ?? 'Standard Box',
      packageTypeOptions: (json['package_type_options'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [
            'Standard Box',
            'Padded Envelope',
            'Tamper Proof Pouch',
            'Bubble Wrap',
            'Heavy Duty Crate',
            'Document Sleeve',
            'My Own Package'
          ],
      addOnProtection:
          AddOnProtection.fromJson(json['add_on_protection'] ?? {}),
      packagingInstructions: json['packaging_instructions'] ?? '',
      packagingPreview:
          PackagingPreview.fromJson(json['packaging_preview'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() => {
    'selected_package': selectedPackage,
    'package_type_options': packageTypeOptions,
    'add_on_protection': addOnProtection.toJson(),
    'packaging_instructions': packagingInstructions,
    'packaging_preview': packagingPreview.toJson(),
  };
}

// ==========================================
// 6. STEP 5: SECURITY LEVEL
// ==========================================
class SecurityFeatures {
  final bool realTimeGpsTracking;
  final bool deliveryAlertsAndNotifications;
  final bool armedEscort;
  final bool secureStorageAtHubs;
  final bool restrictedAccess;

  SecurityFeatures({
    this.realTimeGpsTracking = true,
    this.deliveryAlertsAndNotifications = true,
    this.armedEscort = false,
    this.secureStorageAtHubs = true,
    this.restrictedAccess = true,
  });

  factory SecurityFeatures.fromJson(Map<String, dynamic> json) {
    return SecurityFeatures(
      realTimeGpsTracking: json['real_time_gps_tracking'] ?? true,
      deliveryAlertsAndNotifications:
          json['delivery_alerts_and_notifications'] ?? true,
      armedEscort: json['armed_escort'] ?? false,
      secureStorageAtHubs: json['secure_storage_at_hubs'] ?? true,
      restrictedAccess: json['restricted_access'] ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
    'real_time_gps_tracking': realTimeGpsTracking,
    'delivery_alerts_and_notifications': deliveryAlertsAndNotifications,
    'armed_escort': armedEscort,
    'secure_storage_at_hubs': secureStorageAtHubs,
    'restricted_access': restrictedAccess,
  };
}

class Step5SecurityLevel {
  final String selectedSecurityLevel;
  final List<String> securityLevelOptions;
  final SecurityFeatures securityFeatures;
  final String additionalInstructions;

  Step5SecurityLevel({
    this.selectedSecurityLevel = 'Standard Security',
    this.securityLevelOptions = const [
      'Standard Security',
      'Enhanced Security',
      'Maximum Security'
    ],
    required this.securityFeatures,
    this.additionalInstructions = '',
  });

  factory Step5SecurityLevel.fromJson(Map<String, dynamic> json) {
    return Step5SecurityLevel(
      selectedSecurityLevel:
          json['selected_security_level'] ?? 'Standard Security',
      securityLevelOptions: (json['security_level_options'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [
            'Standard Security',
            'Enhanced Security',
            'Maximum Security'
          ],
      securityFeatures:
          SecurityFeatures.fromJson(json['security_features'] ?? {}),
      additionalInstructions: json['additional_instructions'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'selected_security_level': selectedSecurityLevel,
    'security_level_options': securityLevelOptions,
    'security_features': securityFeatures.toJson(),
    'additional_instructions': additionalInstructions,
  };
}

// ==========================================
// 7. STEP 6: VERIFICATION
// ==========================================
class Step6Verification {
  final String selectedVerification;
  final List<String> verificationMethodOptions;
  final bool capturePhotoOfRecipient;
  final bool capturePhotoOfIdProof;

  Step6Verification({
    this.selectedVerification = 'OTP Verification',
    this.verificationMethodOptions = const [
      'OTP Verification',
      'ID Proof Verification',
      'Signature Verification',
      'Face Verification',
      'Authorized Person Verification',
      'PIN Verification'
    ],
    this.capturePhotoOfRecipient = true,
    this.capturePhotoOfIdProof = false,
  });

  factory Step6Verification.fromJson(Map<String, dynamic> json) {
    return Step6Verification(
      selectedVerification:
          json['selected_verification'] ?? 'OTP Verification',
      verificationMethodOptions:
          (json['verification_method_options'] as List<dynamic>?)
                  ?.map((e) => e.toString())
                  .toList() ??
              const [
                'OTP Verification',
                'ID Proof Verification',
                'Signature Verification',
                'Face Verification',
                'Authorized Person Verification',
                'PIN Verification'
              ],
      capturePhotoOfRecipient: json['capture_photo_of_recipient'] ?? true,
      capturePhotoOfIdProof: json['capture_photo_of_id_proof'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'selected_verification': selectedVerification,
    'verification_method_options': verificationMethodOptions,
    'capture_photo_of_recipient': capturePhotoOfRecipient,
    'capture_photo_of_id_proof': capturePhotoOfIdProof,
  };
}

// ==========================================
// 8. STEP 7: REVIEW & CONFIRMATION
// ==========================================
class PriceDetails {
  final String basePrice;
  final String additionalCharges;
  final String totalAmount;

  PriceDetails({
    this.basePrice = '',
    this.additionalCharges = '',
    this.totalAmount = '',
  });

  factory PriceDetails.fromJson(Map<String, dynamic> json) {
    return PriceDetails(
      basePrice: json['base_price']?.toString() ?? '',
      additionalCharges: json['additional_charges']?.toString() ?? '',
      totalAmount: json['total_amount']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'base_price': basePrice,
    'additional_charges': additionalCharges,
    'total_amount': totalAmount,
  };
}

class Step7ReviewAndConfirmation {
  final Map<String, dynamic> shipmentSummary;
  final Map<String, dynamic> pickupAndDeliverySummary;
  final Map<String, dynamic> recipientSummary;
  final Map<String, dynamic> additionalServices;
  final PriceDetails priceDetails;
  final bool agreeTerms;

  Step7ReviewAndConfirmation({
    this.shipmentSummary = const {},
    this.pickupAndDeliverySummary = const {},
    this.recipientSummary = const {},
    this.additionalServices = const {},
    required this.priceDetails,
    this.agreeTerms = true,
  });

  factory Step7ReviewAndConfirmation.fromJson(Map<String, dynamic> json) {
    return Step7ReviewAndConfirmation(
      shipmentSummary: json['shipment_summary'] ?? {},
      pickupAndDeliverySummary: json['pickup_and_delivery_summary'] ?? {},
      recipientSummary: json['recipient_summary'] ?? {},
      additionalServices: json['additional_services'] ?? {},
      priceDetails: PriceDetails.fromJson(json['price_details'] ?? {}),
      agreeTerms: json['agree_terms'] ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
    'shipment_summary': shipmentSummary,
    'pickup_and_delivery_summary': pickupAndDeliverySummary,
    'recipient_summary': recipientSummary,
    'additional_services': additionalServices,
    'price_details': priceDetails.toJson(),
    'agree_terms': agreeTerms,
  };
}

// ==========================================
// ROOT BOOKING MODEL
// ==========================================
class VaultBooking {
  final String? id;
  final String? bookingId;
  final String serviceType;
  final String? status;
  final String? paymentStatus;
  final String? receiptStatus;
  final Step0ServiceType step0ServiceType;
  final Step1PickupLocation step1PickupLocation;
  final Step2RecipientAndDelivery step2RecipientAndDelivery;
  final Step3ItemTypeAndInformation step3ItemTypeAndInformation;
  final Step4PackagingOptions step4PackagingOptions;
  final Step5SecurityLevel step5SecurityLevel;
  final Step6Verification step6Verification;
  final Step7ReviewAndConfirmation step7ReviewAndConfirmation;

  VaultBooking({
    this.id,
    this.bookingId,
    required this.serviceType,
    this.status,
    this.paymentStatus,
    this.receiptStatus,
    required this.step0ServiceType,
    required this.step1PickupLocation,
    required this.step2RecipientAndDelivery,
    required this.step3ItemTypeAndInformation,
    required this.step4PackagingOptions,
    required this.step5SecurityLevel,
    required this.step6Verification,
    required this.step7ReviewAndConfirmation,
  });

  factory VaultBooking.fromJson(Map<String, dynamic> json) {
    return VaultBooking(
      id: json['id'],
      bookingId: json['booking_id'],
      serviceType: json['service_type'] ?? 'Vault Secure',
      status: json['status'],
      paymentStatus: json['payment_status'],
      receiptStatus: json['receipt_status'],
      step0ServiceType:
          Step0ServiceType.fromJson(json['step_0_service_type'] ?? {}),
      step1PickupLocation:
          Step1PickupLocation.fromJson(json['step_1_pickup_location'] ?? {}),
      step2RecipientAndDelivery: Step2RecipientAndDelivery.fromJson(
          json['step_2_recipient_and_delivery'] ?? {}),
      step3ItemTypeAndInformation: Step3ItemTypeAndInformation.fromJson(
          json['step_3_item_type_and_information'] ?? {}),
      step4PackagingOptions: Step4PackagingOptions.fromJson(
          json['step_4_packaging_options'] ?? {}),
      step5SecurityLevel:
          Step5SecurityLevel.fromJson(json['step_5_security_level'] ?? {}),
      step6Verification:
          Step6Verification.fromJson(json['step_6_verification'] ?? {}),
      step7ReviewAndConfirmation: Step7ReviewAndConfirmation.fromJson(
          json['step_7_review_and_confirmation'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() => {
    'service_type': serviceType,
    'step_0_service_type': step0ServiceType.toJson(),
    'step_1_pickup_location': step1PickupLocation.toJson(),
    'step_2_recipient_and_delivery': step2RecipientAndDelivery.toJson(),
    'step_3_item_type_and_information': step3ItemTypeAndInformation.toJson(),
    'step_4_packaging_options': step4PackagingOptions.toJson(),
    'step_5_security_level': step5SecurityLevel.toJson(),
    'step_6_verification': step6Verification.toJson(),
    'step_7_review_and_confirmation': step7ReviewAndConfirmation.toJson(),
  };
}

// ==========================================
// PAYMENT & RECEIPT MODELS
// ==========================================
class VaultPayment {
  final String paymentId;
  final String? id;
  final String bookingId;
  final double amount;
  final String currency;
  final String status;
  final String paymentMethod;
  final String? gateway;
  final String? gatewayOrderId;
  final String? gatewayPaymentId;
  final String? paidAt;
  final String? createdAt;

  VaultPayment({
    required this.paymentId,
    this.id,
    required this.bookingId,
    required this.amount,
    this.currency = 'INR',
    required this.status,
    this.paymentMethod = 'ONLINE',
    this.gateway,
    this.gatewayOrderId,
    this.gatewayPaymentId,
    this.paidAt,
    this.createdAt,
  });

  factory VaultPayment.fromJson(Map<String, dynamic> json) {
    return VaultPayment(
      paymentId: json['payment_id'] ?? '',
      id: json['id'],
      bookingId: json['booking_id'] ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] ?? 'INR',
      status: json['status'] ?? 'pending',
      paymentMethod: json['payment_method'] ?? 'ONLINE',
      gateway: json['gateway'],
      gatewayOrderId: json['gateway_order_id'],
      gatewayPaymentId: json['gateway_payment_id'],
      paidAt: json['paid_at'],
      createdAt: json['created_at'],
    );
  }

  Map<String, dynamic> toJson() => {
    'payment_id': paymentId,
    'id': id,
    'booking_id': bookingId,
    'amount': amount,
    'currency': currency,
    'status': status,
    'payment_method': paymentMethod,
    'gateway': gateway,
    'gateway_order_id': gatewayOrderId,
    'gateway_payment_id': gatewayPaymentId,
    'paid_at': paidAt,
    'created_at': createdAt,
  };
}

class VaultReceipt {
  final String receiptId;
  final String? id;
  final String bookingId;
  final String? paymentId;
  final String serviceType;
  final double amount;
  final String currency;
  final String paymentStatus;
  final String? issuedAt;
  final Map<String, dynamic>? receiptData;

  VaultReceipt({
    required this.receiptId,
    this.id,
    required this.bookingId,
    this.paymentId,
    required this.serviceType,
    required this.amount,
    this.currency = 'INR',
    this.paymentStatus = 'paid',
    this.issuedAt,
    this.receiptData,
  });

  factory VaultReceipt.fromJson(Map<String, dynamic> json) {
    return VaultReceipt(
      receiptId: json['receipt_id'] ?? '',
      id: json['id'],
      bookingId: json['booking_id'] ?? '',
      paymentId: json['payment_id'],
      serviceType: json['service_type'] ?? 'Vault Secure',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] ?? 'INR',
      paymentStatus: json['payment_status'] ?? 'paid',
      issuedAt: json['issued_at'],
      receiptData: json['receipt_data'],
    );
  }

  Map<String, dynamic> toJson() => {
    'receipt_id': receiptId,
    'id': id,
    'booking_id': bookingId,
    'payment_id': paymentId,
    'service_type': serviceType,
    'amount': amount,
    'currency': currency,
    'payment_status': paymentStatus,
    'issued_at': issuedAt,
    'receipt_data': receiptData,
  };
}

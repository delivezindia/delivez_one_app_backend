export interface PickupAddress {
  id?: string;
  type: string;        // "Home" | "Work" | "Other"
  addressLine: string; // "12, Green Park Street, Anna Nagar"
  city: string;        // "Chennai"
  postalCode: string;  // "600040"
  fullAddress: string; // "12, Green Park Street, Anna Nagar, Chennai - 600040"
}

export interface PickupDateOption {
  id: string;
  label: string;      // "Today" | "Thu" | "Fri" | "Sat"
  dateFormatted: string; // "10 Sep"
  display: string;    // "Today 10 Sep"
  isToday: boolean;
}

export interface PackageDetails {
  noOfPackages: number;       // e.g. 1
  approxWeightKg: number;     // e.g. 1.5
  packageSize?: string;       // "Small (Upto 5 kg)" | "Medium (5 - 15 kg)" | "Large (Above 15 kg)"
}

export interface CreateScheduledPickupInput {
  pickupAddress: PickupAddress;
  pickupDate: string;         // e.g. "Today 10 Sep"
  pickupTimeSlot: string;     // e.g. "9:00 AM - 12:00 PM"
  noOfPackages: number;       // e.g. 1
  approxWeightKg: number;     // e.g. 1.5
  packageSize?: string;       // e.g. "Small (Upto 5 kg)"
  specialInstructions?: string; // max 200 chars
}

export interface ScheduledPickupRecord {
  id: string;
  pickupNumber: string;
  status: 'SCHEDULED' | 'ASSIGNED' | 'PICKED_UP' | 'CANCELLED';
  pickupAddress: PickupAddress;
  pickupDate: string;
  pickupTimeSlot: string;
  packageDetails: PackageDetails;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchedulePickupConfig {
  header: {
    title: string;
    subtitle: string;
  };
  savedAddresses: PickupAddress[];
  defaultAddress: PickupAddress;
  availableDates: PickupDateOption[];
  timeSlots: string[];
  packageSizes: string[];
  defaultValues: {
    noOfPackages: number;
    approxWeightKg: number;
    packageSize: string;
    specialInstructionsPlaceholder: string;
    maxSpecialInstructionsChars: number;
  };
}

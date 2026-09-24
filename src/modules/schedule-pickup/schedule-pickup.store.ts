import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type {
  PickupAddress,
  PickupDateOption,
  SchedulePickupConfig,
  ScheduledPickupRecord,
  CreateScheduledPickupInput,
} from './schedule-pickup.types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'scheduled-pickups.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function getDaysList(): PickupDateOption[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const list: PickupDateOption[] = [];

  for (let i = 0; i < 4; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayName = days[d.getDay()] || 'Day';
    const monthName = months[d.getMonth()] || 'Sep';
    const dateFormatted = `${d.getDate()} ${monthName}`;
    const label: string = i === 0 ? 'Today' : dayName;
    list.push({
      id: `date-${i}`,
      label,
      dateFormatted,
      display: `${label} ${dateFormatted}`,
      isToday: i === 0,
    });
  }
  return list;
}

const DEFAULT_SAVED_ADDRESSES: PickupAddress[] = [
  {
    id: 'ADDR-HOME-01',
    type: 'Home',
    addressLine: '12, Green Park Street, Anna Nagar',
    city: 'Chennai',
    postalCode: '600040',
    fullAddress: '12, Green Park Street, Anna Nagar, Chennai - 600040',
  },
  {
    id: 'ADDR-WORK-02',
    type: 'Work',
    addressLine: 'Block C, Tech Park, OMR',
    city: 'Chennai',
    postalCode: '600096',
    fullAddress: 'Block C, Tech Park, OMR, Chennai - 600096',
  },
];

export const SCHEDULE_PICKUP_CONFIG: SchedulePickupConfig = {
  header: {
    title: 'Schedule Pickup',
    subtitle: 'Choose the most convenient time for us to pick up your shipment.',
  },
  savedAddresses: DEFAULT_SAVED_ADDRESSES,
  defaultAddress: DEFAULT_SAVED_ADDRESSES[0]!,
  availableDates: getDaysList(),
  timeSlots: [
    '9:00 AM - 12:00 PM',
    '12:00 PM - 3:00 PM',
    '3:00 PM - 6:00 PM',
    '6:00 PM - 9:00 PM',
  ],
  packageSizes: [
    'Small (Upto 5 kg)',
    'Medium (5 - 15 kg)',
    'Large (Above 15 kg)',
  ],
  defaultValues: {
    noOfPackages: 1,
    approxWeightKg: 1.5,
    packageSize: 'Small (Upto 5 kg)',
    specialInstructionsPlaceholder: 'e.g. Ring the bell, Call before pickup, Security instructions, etc.',
    maxSpecialInstructionsChars: 200,
  },
};

let inMemoryPickups: ScheduledPickupRecord[] = [];

function loadPickups(): ScheduledPickupRecord[] {
  if (inMemoryPickups.length > 0) return inMemoryPickups;
  if (fs.existsSync(STORE_FILE)) {
    try {
      const data = fs.readFileSync(STORE_FILE, 'utf8');
      inMemoryPickups = JSON.parse(data);
      return inMemoryPickups;
    } catch {}
  }
  const defaultDate = SCHEDULE_PICKUP_CONFIG.availableDates[0]?.display || 'Today 10 Sep';
  // Initialize with Screen 6 sample
  inMemoryPickups = [
    {
      id: 'PKP-101',
      pickupNumber: 'PKP-CHENNAI-101',
      status: 'SCHEDULED',
      pickupAddress: DEFAULT_SAVED_ADDRESSES[0]!,
      pickupDate: defaultDate,
      pickupTimeSlot: '9:00 AM - 12:00 PM',
      packageDetails: {
        noOfPackages: 1,
        approxWeightKg: 1.5,
        packageSize: 'Small (Upto 5 kg)',
      },
      specialInstructions: 'Ring the bell twice, call before pickup',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  savePickups();
  return inMemoryPickups;
}

function savePickups() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(inMemoryPickups, null, 2), 'utf8');
  } catch {}
}

export function getAllPickups(): ScheduledPickupRecord[] {
  return loadPickups();
}

export function getPickupById(id: string): ScheduledPickupRecord | undefined {
  const all = loadPickups();
  return all.find(p => p.id === id || p.pickupNumber === id);
}

export function createScheduledPickup(input: CreateScheduledPickupInput): ScheduledPickupRecord {
  const all = loadPickups();
  const id = 'PKP-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  const pickupNumber = 'PKP-' + Math.floor(100000 + Math.random() * 900000);

  const address: PickupAddress = input.pickupAddress || SCHEDULE_PICKUP_CONFIG.defaultAddress;
  if (!address.fullAddress && address.addressLine) {
    address.fullAddress = `${address.addressLine}, ${address.city} - ${address.postalCode}`;
  }

  const fallbackDate = SCHEDULE_PICKUP_CONFIG.availableDates[0]?.display || 'Today 10 Sep';

  const newPickup: ScheduledPickupRecord = {
    id,
    pickupNumber,
    status: 'SCHEDULED',
    pickupAddress: address,
    pickupDate: input.pickupDate || fallbackDate,
    pickupTimeSlot: input.pickupTimeSlot || '9:00 AM - 12:00 PM',
    packageDetails: {
      noOfPackages: Math.max(1, Number(input.noOfPackages) || 1),
      approxWeightKg: Math.max(0.1, Number(input.approxWeightKg) || 1.5),
      packageSize: input.packageSize || 'Small (Upto 5 kg)',
    },
    specialInstructions: input.specialInstructions ? input.specialInstructions.slice(0, 200) : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  all.unshift(newPickup);
  savePickups();
  return newPickup;
}

export function cancelScheduledPickup(id: string): ScheduledPickupRecord | null {
  const pickup = getPickupById(id);
  if (!pickup) return null;
  pickup.status = 'CANCELLED';
  pickup.updatedAt = new Date().toISOString();
  savePickups();
  return pickup;
}

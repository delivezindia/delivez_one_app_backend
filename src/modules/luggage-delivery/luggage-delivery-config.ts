// luggage-delivery-config.ts
// Single source of truth config matching the 21 Flutter/Dart source files

export interface LuggageServiceItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  startingPrice: string;
  baseFare: number;
  highlights: string[];
  steps: Array<{ step: string; title: string; description: string }>;
  infoTable: Array<{ key: string; value: string }>;
}

export interface LuggageRouteOption {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  multiplier: number;
}

export interface LuggageSizeOption {
  id: string;
  title: string;
  description: string;
  fee: number;
}

export interface LuggageTypeOption {
  id: string;
  title: string;
}

export interface LuggageAddonItem {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
}

export interface LuggageProtectionItem {
  id: string;
  title: string;
  price: number;
  description: string;
  features: string[];
}

export interface AirportAssistanceItem {
  id: string;
  title: string;
  price: number;
  description: string;
  features: string[];
}

export interface TimelineMilestoneConfig {
  step: number;
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

// 7 Services from choose_your_service.dart
export const luggageServices: LuggageServiceItem[] = [
  {
    id: 'home_airport',
    title: 'Home to Airport',
    description: 'Doorstep pickup from your home and delivered directly to the airport terminal.',
    tag: 'Doorstep Pickup',
    startingPrice: '₹499',
    baseFare: 499,
    highlights: [
      'Doorstep luggage pickup at scheduled time',
      'Tamper-evident sealing with photo proof',
      'Real-time GPS tracking all the way to terminal',
      'Handover at departure gate / pillar of choice',
      'Free 2-hour complimentary airport buffer storage',
    ],
    steps: [
      { step: '1', title: 'Schedule Pickup', description: 'Enter home address, flight details, and desired pickup time slot.' },
      { step: '2', title: 'Doorstep Verification & Seal', description: 'Agent inspects bags, affixes barcode tamper-proof seals, and captures photos.' },
      { step: '3', title: 'Transit to Airport', description: 'Luggage travels in GPS-monitored secured transport to the airport terminal.' },
      { step: '4', title: 'Terminal Handover', description: 'Receive your bags at your departure gate/pillar with OTP verification.' },
    ],
    infoTable: [
      { key: 'Pickup Window', value: '3 to 6 hours before flight' },
      { key: 'Handover Location', value: 'Departure Terminal Gate / Pillar' },
      { key: 'Luggage Allowance', value: 'Up to 23 kg per check-in bag' },
      { key: 'Security Seal', value: 'Barcoded tamper-evident seal included' },
      { key: 'Insurance Coverage', value: 'Transit insurance up to ₹25,000' },
      { key: 'Cancellation', value: 'Free cancellation up to 2 hrs before pickup' },
      { key: 'Support', value: '24/7 dedicated luggage concierge' },
    ],
  },
  {
    id: 'airport_home',
    title: 'Airport to Home',
    description: 'Collect luggage upon arrival and get it safely delivered right to your home doorstep.',
    tag: 'Doorstep Delivery',
    startingPrice: '₹499',
    baseFare: 499,
    highlights: [
      'Baggage pickup directly from arrival terminal gate',
      'Skip the taxi baggage hassle and travel light',
      'Tamper-evident safety tags & live GPS tracking',
      'Scheduled doorstep delivery at your convenience',
      'Contactless or OTP-verified secure handover',
    ],
    steps: [
      { step: '1', title: 'Book Before / On Arrival', description: 'Provide flight number, terminal, and home delivery address.' },
      { step: '2', title: 'Arrival Handover', description: 'Hand over bags to verified Delivez agent outside arrival pillar.' },
      { step: '3', title: 'Secured Transport', description: 'Bags are scanned, sealed, and dispatched towards your residence.' },
      { step: '4', title: 'Doorstep Delivery', description: 'Luggage arrives safely at your home with OTP & digital signature.' },
    ],
    infoTable: [
      { key: 'Pickup Location', value: 'Arrival Terminal Exit Pillar' },
      { key: 'Delivery Window', value: 'Within 3-5 hours of landing' },
      { key: 'Luggage Allowance', value: 'Up to 23 kg standard per bag' },
      { key: 'Security Seal', value: 'Serialized anti-tamper security tag' },
      { key: 'Insurance Coverage', value: 'Transit insurance up to ₹25,000' },
      { key: 'Cancellation', value: 'Free cancellation before flight arrival' },
      { key: 'Support', value: '24/7 arrival flight tracking team' },
    ],
  },
  {
    id: 'hotel_airport',
    title: 'Hotel to Airport',
    description: 'Luggage collected directly from hotel reception/room and delivered to the airport terminal.',
    tag: 'Doorstep Pickup',
    startingPrice: '₹549',
    baseFare: 549,
    highlights: [
      'Front desk / concierge pickup coordination',
      'Leave luggage with hotel and enjoy full sightseeing',
      'Delivered directly to airport departure terminal',
      'Verified handoff with hotel luggage tag match',
      'Real-time transit notifications and alerts',
    ],
    steps: [
      { step: '1', title: 'Book Hotel Pickup', description: 'Specify hotel name, room/booking number, and flight schedule.' },
      { step: '2', title: 'Concierge Handover', description: 'Leave bags with hotel desk or meet our agent in lobby.' },
      { step: '3', title: 'Fleet Transit', description: 'Monitored secure transport directly to your airport terminal.' },
      { step: '4', title: 'Terminal Meet & Deliver', description: 'Agent meets you at your departure gate for instant handoff.' },
    ],
    infoTable: [
      { key: 'Pickup Window', value: '4 to 6 hours before flight' },
      { key: 'Hotel Coordination', value: 'Direct front-desk liaison included' },
      { key: 'Airport Handover', value: 'Terminal departure gate / pillar' },
      { key: 'Security Seal', value: 'Barcoded tamper-evident seal included' },
      { key: 'Insurance Coverage', value: 'Transit insurance up to ₹25,000' },
      { key: 'Cancellation', value: 'Free cancellation up to 2 hrs before pickup' },
      { key: 'Support', value: '24/7 dedicated hotel transfer desk' },
    ],
  },
  {
    id: 'airport_hotel',
    title: 'Airport to Hotel',
    description: 'Pick up luggage from airport arrival area and deliver it directly to your hotel.',
    tag: 'Doorstep Delivery',
    startingPrice: '₹549',
    baseFare: 549,
    highlights: [
      'Airport arrival pickup directly to hotel front desk',
      'Head straight to meetings or sightseeing without bags',
      'Check into hotel later with luggage already safely waiting',
      'Hotel reception confirmation and room storage proof',
      'GPS tracking with timestamped delivery proof',
    ],
    steps: [
      { step: '1', title: 'Enter Hotel & Flight', description: 'Enter flight arrival details and destination hotel details.' },
      { step: '2', title: 'Airport Handover', description: 'Meet agent at designated arrival pillar upon landing.' },
      { step: '3', title: 'Direct Hotel Transit', description: 'Luggage transferred directly to hotel under GPS surveillance.' },
      { step: '4', title: 'Hotel Desk Handover', description: 'Handed to hotel concierge under your reservation name.' },
    ],
    infoTable: [
      { key: 'Pickup Location', value: 'Arrival Terminal Exit Gate / Pillar' },
      { key: 'Delivery Time', value: 'Within 3 to 4 hours of pickup' },
      { key: 'Hotel Reception', value: 'Handed to front desk under booking name' },
      { key: 'Security Seal', value: 'Tamper-evident seal with photo verification' },
      { key: 'Insurance Coverage', value: 'Transit insurance up to ₹25,000' },
      { key: 'Cancellation', value: 'Free cancellation before flight touches down' },
      { key: 'Support', value: '24/7 luggage transfer operations' },
    ],
  },
  {
    id: 'hotel_home',
    title: 'Hotel to Home',
    description: 'Travel back home hands-free while your luggage is transferred directly from hotel to home.',
    tag: 'Doorstep Delivery',
    startingPrice: '₹449',
    baseFare: 449,
    highlights: [
      'Checkout from hotel without dragging multiple heavy bags',
      'Travel by metro, cab, or intermediate meetings hassle-free',
      'Scheduled doorstep delivery at your home address',
      'Tamper-proof seal with photo verification',
      'Affordable citywide intra-city luggage courier',
    ],
    steps: [
      { step: '1', title: 'Enter Details', description: 'Enter hotel name/address and home drop-off location.' },
      { step: '2', title: 'Hotel Pickup', description: 'Agent collects bags from front desk or room.' },
      { step: '3', title: 'City Transit', description: 'Secured movement with live map tracking.' },
      { step: '4', title: 'Home Doorstep', description: 'Delivered safely at home with OTP verification.' },
    ],
    infoTable: [
      { key: 'Pickup Window', value: 'Flexible checkout slot (9 AM - 8 PM)' },
      { key: 'Delivery Window', value: 'Same-day within 4-6 hours' },
      { key: 'Luggage Allowance', value: 'Standard suitcases, duffels, boxes' },
      { key: 'Security Seal', value: 'Barcoded tamper-evident seal included' },
      { key: 'Insurance Coverage', value: 'Transit insurance up to ₹20,000' },
      { key: 'Cancellation', value: 'Free cancellation up to 2 hrs before pickup' },
      { key: 'Support', value: '24/7 city courier helpline' },
    ],
  },
  {
    id: 'home_hotel',
    title: 'Home to Hotel',
    description: 'Seamless luggage transfer directly from your home to your destination hotel.',
    tag: 'Doorstep Pickup',
    startingPrice: '₹449',
    baseFare: 449,
    highlights: [
      'Send luggage ahead before weekend getaway or staycation',
      'Arrive at hotel leisurely with bags already placed at desk',
      'Doorstep pickup from your home at your chosen time',
      'Hotel concierge coordination with guest booking id',
      'Full transit insurance and security tagging',
    ],
    steps: [
      { step: '1', title: 'Schedule Transfer', description: 'Provide home address and destination hotel booking details.' },
      { step: '2', title: 'Home Pickup', description: 'Executive collects and seals bags at your residence.' },
      { step: '3', title: 'Direct Transit', description: 'Dispatched directly to destination hotel.' },
      { step: '4', title: 'Hotel Front Desk Check-in', description: 'Stored safely at concierge under your reservation.' },
    ],
    infoTable: [
      { key: 'Pickup Window', value: 'Morning or afternoon slot of your choice' },
      { key: 'Delivery Window', value: 'Delivered before hotel check-in time' },
      { key: 'Luggage Allowance', value: 'Standard suitcases, duffels, boxes' },
      { key: 'Security Seal', value: 'Barcoded tamper-evident seal included' },
      { key: 'Insurance Coverage', value: 'Transit insurance up to ₹20,000' },
      { key: 'Cancellation', value: 'Free cancellation up to 2 hrs before pickup' },
      { key: 'Support', value: '24/7 hospitality courier support' },
    ],
  },
  {
    id: 'multi_stop',
    title: 'Multi-Stop Luggage Transfer',
    description: 'Transfer luggage across multiple city stops, hotels, or transit points in a single customized booking.',
    tag: 'Custom Route',
    startingPrice: '₹799',
    baseFare: 799,
    highlights: [
      'Up to 5 customizable intermediate city stops',
      'Drop bags at hotel, office, and transit hub in sequence',
      'Dedicated courier vehicle for complex itineraries',
      'Separate seal & verification code for each stop',
      'Priority end-to-end customer support line',
    ],
    steps: [
      { step: '1', title: 'Build Multi-Stop Route', description: 'Add origin, intermediate waypoints, and final destination.' },
      { step: '2', title: 'First Point Pickup', description: 'Agent inspects and assigns individual bag tags per stop.' },
      { step: '3', title: 'Sequential Transfers', description: 'Fleet executes scheduled handoffs across your waypoint route.' },
      { step: '4', title: 'Final Destination Completion', description: 'Final drop completed with multi-signature POD.' },
    ],
    infoTable: [
      { key: 'Waypoints', value: 'Up to 5 stops supported' },
      { key: 'Service Type', value: 'Dedicated route transfer' },
      { key: 'Luggage Allowance', value: 'Multiple bags across stops' },
      { key: 'Security Seal', value: 'Individual multi-tag barcode seals' },
      { key: 'Insurance Coverage', value: 'Transit insurance up to ₹50,000' },
      { key: 'Cancellation', value: 'Free cancellation up to 3 hrs before route' },
      { key: 'Support', value: 'Dedicated route operations manager' },
    ],
  },
];

// 3 Route options from rout_selection.dart
export const luggageRoutes: LuggageRouteOption[] = [
  { id: 'single_trip', title: 'Single Trip', subtitle: 'One-way luggage transfer', tag: 'Most Popular', multiplier: 1.0 },
  { id: 'round_trip', title: 'Round Trip', subtitle: 'Both onward and return luggage transfer', tag: 'Save 15%', multiplier: 1.85 },
  { id: 'multi_stop', title: 'Multi-Stop Transfer', subtitle: 'Up to 5 custom stops across city & transit hubs', tag: 'Flexible Route', multiplier: 1.5 },
];

// Luggage sizes from luggage_detail.dart
export const luggageSizes: LuggageSizeOption[] = [
  { id: 'small', title: 'Small', description: 'Cabin size - up to 55 cm (approx. 7–10 kg)', fee: 0 },
  { id: 'medium', title: 'Medium', description: 'Check-in - 56 to 75 cm (approx. 15–23 kg)', fee: 50 },
  { id: 'large', title: 'Large', description: 'Oversized - above 75 cm (approx. 23–32 kg)', fee: 100 },
];

// Luggage types from luggage_detail.dart
export const luggageTypes: LuggageTypeOption[] = [
  { id: 'SUITCASE_TROLLEY', title: 'Suitcase / Trolley' },
  { id: 'BACKPACK_DUFFEL', title: 'Backpack / Duffel Bag' },
  { id: 'BOX_CARTON', title: 'Box / Carton' },
  { id: 'SPORTS_EQUIPMENT', title: 'Sports Equipment' },
  { id: 'OTHER', title: 'Other' },
];

// 16 Add-ons from add_ons.dart
export const luggageAddOns: LuggageAddonItem[] = [
  { id: 'tag', title: 'Secure luggage tag', price: 29, description: 'Durable serialized barcode tag attached to handle', category: 'Security' },
  { id: 'seal', title: 'Tamper-proof seal', price: 29, description: 'Numbered zip-tie tamper seal preventing zipper opening', category: 'Security' },
  { id: 'wrapping', title: 'Wrapping / protective cover', price: 49, description: 'Protective shrink-wrap film guarding against scuffs and moisture', category: 'Packaging' },
  { id: 'priority', title: 'Priority delivery', price: 99, description: 'First-in-line vehicle dispatch with dedicated priority routing', category: 'Speed' },
  { id: 'airport_express', title: 'Airport express handling', price: 79, description: 'Express terminal gate ramp-side handover coordination', category: 'Transit' },
  { id: 'hotel_concierge', title: 'Hotel concierge coordination', price: 79, description: 'Direct liaison with hotel reception & bell desk management', category: 'Hospitality' },
  { id: 'waiting_time', title: 'Extra waiting time', price: 49, description: 'Up to 45 mins executive grace waiting buffer at location', category: 'Convenience' },
  { id: 'fragile', title: 'Fragile handling', price: 59, description: 'Specialized padded stowage with high-priority handling stickers', category: 'Care' },
  { id: 'insurance', title: 'Insurance coverage', price: 129, description: 'Comprehensive loss & accidental damage cover up to ₹50,000', category: 'Protection' },
  { id: 'photo_pickup', title: 'Photo proof of pickup', price: 39, description: 'High-res photos of bags & affixed seals sent upon collection', category: 'Verification' },
  { id: 'photo_delivery', title: 'Photo proof of delivery', price: 39, description: 'Timestamped photo proof of luggage handover at destination', category: 'Verification' },
  { id: 'otp_verification', title: 'OTP verification at handover', price: 29, description: 'Secure two-factor 6-digit OTP confirmation before release', category: 'Verification' },
  { id: 'signature_capture', title: 'Signature capture', price: 29, description: 'Digital biometric/e-pen signature captured on courier device', category: 'Verification' },
  { id: 'video_proof', title: 'Video proof (premium)', price: 99, description: '30-second 360-degree video scan during pickup and handover', category: 'Verification' },
  { id: 'traveler_assist', title: 'Premium traveler assistance', price: 149, description: 'Dedicated traveler concierge phone line on WhatsApp/Call', category: 'Support' },
  { id: 'porter', title: 'Porter assistance add-on', price: 69, description: 'Luggage porter assistance from vehicle to check-in/room', category: 'Assistance' },
];

// 5 Luggage Protections from luggage_protection.dart
export const luggageProtections: LuggageProtectionItem[] = [
  {
    id: 'tamper_tag',
    title: 'Tamper-proof Tag',
    price: 99,
    description: 'Serialized tamper-evident barcoded seal that breaks visibly if opened.',
    features: ['Unique serial barcode', 'Tamper-evident adhesive seal', 'Instant breach alert'],
  },
  {
    id: 'secure_strap',
    title: 'Secure Lock Strap',
    price: 149,
    description: 'Heavy-duty TSA-compatible locking luggage strap reinforced around bag.',
    features: ['TSA combination lock', 'Heavy-duty nylon strap', 'Prevents accidental bag burst'],
  },
  {
    id: 'waterproof_wrap',
    title: 'Waterproof Wrap',
    price: 129,
    description: 'Multi-layer weather-resistant stretch film wrap protecting from rain and dust.',
    features: ['100% waterproof protection', 'Scratch & dirt barrier', 'Industrial grade shrink film'],
  },
  {
    id: 'premium_fragile',
    title: 'Premium Fragile Handling',
    price: 199,
    description: 'Padded edge guards and top-tier priority transit for delicate items.',
    features: ['Shock-absorbent edge guards', 'Special upright carriage', 'Senior executive handling'],
  },
  {
    id: 'rfid_tag',
    title: 'RFID Baggage Tag',
    price: 249,
    description: 'Smart RFID geo-tag for real-time proximity alerts and automated gate scans.',
    features: ['Proximity scan at hubs', 'Zero-misplacement guarantee', 'Automated checkpoint alerts'],
  },
];

// 5 Airport Assistance Services from airport_assitance.dart
export const airportAssistanceServices: AirportAssistanceItem[] = [
  {
    id: 'meet_assist',
    title: 'Meet & Assist',
    price: 499,
    description: 'Dedicated airport concierge greets you at entry gate or terminal curbside.',
    features: ['Curbside personal greeting', 'Baggage trolley assistance', 'Flight information guidance'],
  },
  {
    id: 'queue_support',
    title: 'Queue Support',
    price: 399,
    description: 'Priority check-in line and security transit navigation assistance.',
    features: ['Line positioning guidance', 'Documentation ready check', 'Fast-track terminal movement'],
  },
  {
    id: 'porter_help',
    title: 'Porter Help',
    price: 349,
    description: 'Dedicated porter to manage heavy trolley luggage all the way to airline check-in counter.',
    features: ['Heavy trolley management', 'Lifting & loading onto scales', 'Multiple bags handled'],
  },
  {
    id: 'fast_track_buggy',
    title: 'Fast Track Buggy',
    price: 399,
    description: 'Electric buggy transfer inside airport terminal concourses.',
    features: ['Electric cart ride', 'Ideal for seniors & families', 'Direct gate drop-off'],
  },
  {
    id: 'checkin_support',
    title: 'Check-in Support Coordination',
    price: 499,
    description: 'End-to-end airline counter baggage drop-off and boarding pass assistance.',
    features: ['Airline counter coordination', 'Boarding pass verification', 'Excess baggage guidance'],
  },
];

// 10 Timeline Milestones from jurney_timeline.dart
export const luggageTimelineMilestones: TimelineMilestoneConfig[] = [
  { step: 1, id: 'pickup_scheduled', title: 'Pickup Scheduled', subtitle: 'Booking confirmed and pickup executive assigned', icon: 'Calendar' },
  { step: 2, id: 'agent_reached_source', title: 'Agent Reached Source', subtitle: 'Executive arrived at pickup doorstep/terminal', icon: 'MapPin' },
  { step: 3, id: 'luggage_verified', title: 'Luggage Verified', subtitle: 'Baggage count, weight, and condition inspected', icon: 'CheckSquare' },
  { step: 4, id: 'sealed_and_tagged', title: 'Sealed and Tagged', subtitle: 'Tamper-proof security seals and tags affixed', icon: 'ShieldCheck' },
  { step: 5, id: 'pickup_complete', title: 'Pickup Complete', subtitle: 'Luggage securely handed over and loaded into vehicle', icon: 'PackageCheck' },
  { step: 6, id: 'en_route', title: 'En Route', subtitle: 'Luggage in transit under GPS-monitored fleet', icon: 'Truck' },
  { step: 7, id: 'arrived_at_destination', title: 'Arrived at Destination', subtitle: 'Courier reached drop-off destination point', icon: 'Navigation' },
  { step: 8, id: 'handover_initiated', title: 'Handover Initiated', subtitle: 'Recipient contact initiated for handover', icon: 'UserCheck' },
  { step: 9, id: 'otp_verified', title: 'OTP Verified / Signature Captured', subtitle: 'Identity validated via OTP and digital signature', icon: 'Key' },
  { step: 10, id: 'delivered', title: 'Delivered', subtitle: 'Luggage delivered successfully with digital POD', icon: 'Award' },
];

export function getLuggageOptions() {
  return {
    services: luggageServices,
    routes: luggageRoutes,
    sizes: luggageSizes,
    types: luggageTypes,
    addOns: luggageAddOns,
    protections: luggageProtections,
    airportAssistance: airportAssistanceServices,
    timelineMilestones: luggageTimelineMilestones,
    paymentMethods: [
      { id: 'wallet', name: 'Delivez Wallet', description: 'Fast, one-click checkout with wallet balance' },
      { id: 'upi', name: 'UPI (GPay / PhonePe / Paytm / QR)', description: 'Instant UPI payment via apps or QR scan' },
      { id: 'card', name: 'Credit / Debit Cards', description: 'Visa, Mastercard, RuPay, Amex accepted' },
      { id: 'netbanking', name: 'Net Banking', description: 'All major Indian banks supported' },
      { id: 'cash_on_delivery', name: 'Pay on Handover / Delivery', description: 'Pay via cash or UPI at the time of delivery' },
    ],
  };
}

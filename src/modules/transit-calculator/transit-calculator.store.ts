import crypto from 'crypto';
import type {
  TransitCalculatorInput,
  TransitCalculatorResult,
  TransitCalculatorConfig,
  DeliveryOption,
  TransitMilestone,
} from './transit-calculator.types.js';

// In-memory calculations store
const calculationsCache = new Map<string, TransitCalculatorResult>();

export const TRANSIT_CALCULATOR_CONFIG: TransitCalculatorConfig = {
  shipmentTypes: [
    { id: 'PARCEL', label: 'Parcel', icon: 'package' },
    { id: 'DOCUMENT', label: 'Document', icon: 'file-text' },
    { id: 'COMMERCIAL_CARGO', label: 'Commercial Cargo', icon: 'truck' },
  ],
  serviceTypes: [
    { id: 'SURFACE_EXPRESS', label: 'Surface Express', icon: 'truck', defaultBadge: 'Door Delivery' },
    { id: 'AIR_EXPRESS', label: 'Air Express', icon: 'plane', defaultBadge: 'Door Delivery' },
    { id: 'SURFACE_ECONOMY', label: 'Surface Economy', icon: 'truck', defaultBadge: 'Door Delivery' },
  ],
  defaultValues: {
    from: 'Mumbai, Maharashtra',
    fromPincode: '400001',
    to: 'Bengaluru, Karnataka',
    toPincode: '560001',
    shipmentType: 'Parcel',
    serviceType: 'Surface Express',
    weight: 25,
    dimensions: { length: 40, width: 30, height: 25 },
    noOfPackages: 1,
    valueOfGoods: 15000,
  },
  features: [
    { title: 'Real-time Transit Estimation', icon: 'clock' },
    { title: 'All Costs Inclusive', icon: 'indian-rupee' },
    { title: 'Safe & Secure Deliveries', icon: 'shield-check' },
    { title: '24/7 Support', icon: 'headset' },
  ],
  proBanner: {
    title: 'Save more with Delivez Pro!',
    subtitle: 'Get exclusive discounts, priority support & more benefits.',
    actionText: 'Explore Pro',
  },
  insuranceDetails: {
    title: 'Safe & Secure Delivery',
    description: 'Your shipment is insured up to ₹25,000 at no extra cost.',
    coverageLimit: 25000,
  },
};

function formatDisplayDate(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayName = days[d.getDay()] || 'Tue';
  const monthName = months[d.getMonth()] || 'Aug';
  return `${dayName}, ${d.getDate()} ${monthName} ${d.getFullYear()}`;
}

function formatShortDate(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[d.getMonth()] || 'Aug';
  return `${d.getDate()} ${monthName} ${d.getFullYear()}`;
}

function extractPincode(location: string, fallback: string): string {
  const m = location.match(/\b\d{6}\b/);
  return m ? m[0] : fallback;
}

export function computeTransitCalculation(input: TransitCalculatorInput, baseUrl: string = 'http://localhost:4000/api/v1'): TransitCalculatorResult {
  const weight = Math.max(0.5, Number(input.weight) || 25);
  const pkgs = Math.max(1, Number(input.noOfPackages) || 1);
  const dims = input.dimensions || { length: 40, width: 30, height: 25 };
  const volumetricWeight = (dims.length * dims.width * dims.height) / 5000;
  const billableWeight = Math.max(weight, volumetricWeight);
  const fromCity = (input.from || '').split(',')[0]?.trim() || 'Mumbai';
  const toCity = (input.to || '').split(',')[0]?.trim() || 'Bengaluru';
  const fromPincode = input.fromPincode || extractPincode(input.from || '', '400001');
  const toPincode = input.toPincode || extractPincode(input.to || '', '560001');

  // Multiplier relative to 25kg standard baseline
  const factor = Math.max(0.6, Math.min(3.5, billableWeight / 25));

  // 1. Surface Express
  const seBase = Math.round(400 * factor);
  const seFuel = Math.round(60 * factor);
  const seHandling = Math.round(30 * pkgs);
  const seOther = 0;
  const seSub = seBase + seFuel + seHandling + seOther;
  const seGst = Math.round(seSub * 0.05); // ~₹30 on ₹490
  const seTotal = seSub + seGst;

  // 2. Air Express
  const aeBase = Math.round(1020 * factor);
  const aeFuel = Math.round(130 * factor);
  const aeHandling = Math.round(50 * pkgs);
  const aeOther = 10;
  const aeSub = aeBase + aeFuel + aeHandling + aeOther;
  const aeGst = Math.round(aeSub * 0.05);
  const aeTotal = aeSub + aeGst;

  // 3. Surface Economy
  const ecoBase = Math.round(280 * factor);
  const ecoFuel = Math.round(40 * factor);
  const ecoHandling = Math.round(20 * pkgs);
  const ecoOther = 10;
  const ecoSub = ecoBase + ecoFuel + ecoHandling + ecoOther;
  const ecoGst = Math.round(ecoSub * 0.08); // ~₹30
  const ecoTotal = ecoSub + ecoGst;
  const ecoSavings = Math.max(0, seTotal - ecoTotal);
  const ecoSavingsPercent = Math.round((ecoSavings / seTotal) * 100);
  const origin = baseUrl.replace(/\/api\/v1\/?$/, '');

  const deliveryOptions: DeliveryOption[] = [
    {
      id: 'surface_express',
      name: 'Surface Express',
      badge: 'Door Delivery',
      tag: 'RECOMMENDED',
      deliveryTime: '2 - 3 Days',
      deliveryDate: `By ${formatDisplayDate(3)}`,
      estimatedCost: seTotal,
      reliability: '99%',
      icon: `${origin}/public/icons/courier/truck_delivery.png`,
      costBreakup: {
        baseFreight: seBase,
        fuelSurcharge: seFuel,
        handlingCharges: seHandling,
        otherCharges: seOther,
        gst: seGst,
        total: seTotal,
        savings: 0,
        savingsPercent: 0,
        comparedWith: 'Standard Baseline',
      },
      isSelected: !input.serviceType || input.serviceType.toLowerCase().includes('surface express'),
    },
    {
      id: 'air_express',
      name: 'Air Express',
      badge: 'Door Delivery',
      tag: 'FASTEST',
      deliveryTime: '1 - 2 Days',
      deliveryDate: `By ${formatDisplayDate(2)}`,
      estimatedCost: aeTotal,
      reliability: '98%',
      icon: `${origin}/public/icons/courier/express_delivery.png`,
      costBreakup: {
        baseFreight: aeBase,
        fuelSurcharge: aeFuel,
        handlingCharges: aeHandling,
        otherCharges: aeOther,
        gst: aeGst,
        total: aeTotal,
        savings: 0,
        savingsPercent: 0,
        comparedWith: 'Surface Express',
      },
      isSelected: Boolean(input.serviceType && input.serviceType.toLowerCase().includes('air')),
    },
    {
      id: 'surface_economy',
      name: 'Surface Economy',
      badge: 'Door Delivery',
      tag: 'Most Economical',
      deliveryTime: '3 - 5 Days',
      deliveryDate: `By ${formatDisplayDate(5)}`,
      estimatedCost: ecoTotal,
      reliability: '97%',
      icon: `${origin}/public/icons/courier/standard_delivery.png`,
      costBreakup: {
        baseFreight: ecoBase,
        fuelSurcharge: ecoFuel,
        handlingCharges: ecoHandling,
        otherCharges: ecoOther,
        gst: ecoGst,
        total: ecoTotal,
        savings: ecoSavings,
        savingsPercent: ecoSavingsPercent,
        comparedWith: `Surface Express (₹ ${seTotal.toFixed(2)})`,
      },
      isSelected: Boolean(input.serviceType && input.serviceType.toLowerCase().includes('economy')),
    },
  ];

  const selected: DeliveryOption = deliveryOptions.find(o => o.isSelected) || deliveryOptions[0]!;

  const fromState = (input.from || '').split(',')[1]?.trim() || 'Maharashtra';
  const toState = (input.to || '').split(',')[1]?.trim() || 'Karnataka';

  const milestones: TransitMilestone[] = [
    {
      day: 'Day 0',
      date: formatShortDate(0),
      location: `${fromCity} Hub`,
      state: fromState,
      status: 'Pickup & Processing',
      stage: 'pickup',
      color: 'green',
    },
    {
      day: 'Day 1',
      date: formatShortDate(1),
      location: 'Pune Hub',
      state: 'Maharashtra',
      status: 'In Transit',
      stage: 'hub_transit',
      color: 'yellow',
    },
    {
      day: 'Day 2',
      date: formatShortDate(2),
      location: `${toCity} Hub`,
      state: toState,
      status: 'In Transit',
      stage: 'hub_to_hub',
      color: 'yellow',
    },
    {
      day: 'Day 3',
      date: formatShortDate(3),
      location: `${toCity} Hub`,
      state: toState,
      status: 'Out for Delivery',
      stage: 'out_for_delivery',
      color: 'orange',
    },
    {
      day: 'Day 3 - 5',
      date: formatShortDate(4),
      location: toCity,
      state: toState,
      status: 'Delivery',
      stage: 'delivered',
      color: 'red',
    },
  ];

  const calcId = 'TC-' + crypto.randomBytes(4).toString('hex').toUpperCase();

  const valGoods = input.valueOfGoods ? `₹ ${Number(input.valueOfGoods).toLocaleString('en-IN')}` : '₹ 15,000';

  const result: TransitCalculatorResult = {
    id: calcId,
    summary: {
      from: input.from || 'Mumbai, Maharashtra',
      fromPincode,
      to: input.to || 'Bengaluru, Karnataka',
      toPincode,
      shipmentType: input.shipmentType || 'Parcel',
      weight: `${weight} kg`,
      dimensions: `${dims.length} × ${dims.width} × ${dims.height} cm`,
      noOfPackages: `${pkgs} ${pkgs === 1 ? 'Package' : 'Packages'}`,
      valueOfGoods: valGoods,
      serviceType: input.serviceType || 'Surface Express',
    },
    optionsCount: {
      all: deliveryOptions.length,
      fastest: 1,
      mostEconomical: 1,
    },
    deliveryOptions,
    selectedOption: selected,
    transitJourney: {
      milestones,
      notice: 'Transit time is an estimate and may vary due to weather, traffic, or operational delays.',
    },
    features: {
      realTimeTransit: 'Real-time Transit Estimation',
      allCostsInclusive: 'All Costs Inclusive',
      safeSecure: 'Safe & Secure Deliveries',
      support: '24/7 Support',
    },
    tip: 'Tip: Choose Air Express for faster delivery or Eco Surface for a more economical option.',
    proBanner: TRANSIT_CALCULATOR_CONFIG.proBanner,
    insuranceDetails: TRANSIT_CALCULATOR_CONFIG.insuranceDetails,
    createdAt: new Date().toISOString(),
  };

  calculationsCache.set(calcId, result);
  return result;
}

export function getCalculationById(id: string): TransitCalculatorResult | undefined {
  return calculationsCache.get(id);
}

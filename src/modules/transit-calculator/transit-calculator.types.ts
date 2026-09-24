export interface ShipmentDimensions {
  length: number;
  width: number;
  height: number;
}

export interface TransitCalculatorInput {
  from: string;
  fromPincode?: string;
  to: string;
  toPincode?: string;
  shipmentType?: string; // "Parcel" | "Document" | "Commercial Cargo"
  serviceType?: string;  // "Surface Express" | "Air Express" | "Surface Economy"
  weight: number;       // in kg, e.g. 25
  dimensions?: ShipmentDimensions; // in cm, e.g. 40 x 30 x 25
  noOfPackages?: number; // e.g. 1
  valueOfGoods?: number; // optional, e.g. 15000
}

export interface CostBreakup {
  baseFreight: number;
  fuelSurcharge: number;
  handlingCharges: number;
  otherCharges: number;
  gst: number;
  total: number;
  savings?: number;
  savingsPercent?: number;
  comparedWith?: string;
}

export interface DeliveryOption {
  id: string;
  name: string;
  badge: string; // "Door Delivery"
  tag?: string;  // "RECOMMENDED" | "FASTEST" | "Most Economical"
  deliveryTime: string; // e.g. "2 - 3 Days"
  deliveryDate: string; // e.g. "By Tue, 13 Aug 2025"
  estimatedCost: number;
  reliability: string; // e.g. "99%"
  icon: string;
  costBreakup: CostBreakup;
  isSelected?: boolean;
}

export interface TransitMilestone {
  day: string;          // e.g. "Day 0"
  date: string;         // e.g. "10 Aug 2025"
  location: string;     // e.g. "Mumbai Hub"
  state?: string;       // e.g. "Maharashtra"
  status: string;       // e.g. "Pickup & Processing" | "In Transit" | "Out for Delivery" | "Delivery"
  stage: 'pickup' | 'hub_transit' | 'hub_to_hub' | 'out_for_delivery' | 'delivered';
  color: 'green' | 'yellow' | 'orange' | 'red';
}

export interface TransitCalculatorResult {
  id: string;
  summary: {
    from: string;
    fromPincode: string;
    to: string;
    toPincode: string;
    shipmentType: string;
    weight: string;
    dimensions: string;
    noOfPackages: string;
    valueOfGoods: string;
    serviceType: string;
  };
  optionsCount: {
    all: number;
    fastest: number;
    mostEconomical: number;
  };
  deliveryOptions: DeliveryOption[];
  selectedOption: DeliveryOption;
  transitJourney: {
    milestones: TransitMilestone[];
    notice: string;
  };
  features: {
    realTimeTransit: string;
    allCostsInclusive: string;
    safeSecure: string;
    support: string;
  };
  tip: string;
  proBanner: {
    title: string;
    subtitle: string;
    actionText: string;
  };
  insuranceDetails: {
    title: string;
    description: string;
    coverageLimit: number;
  };
  createdAt: string;
}

export interface TransitCalculatorConfig {
  shipmentTypes: Array<{ id: string; label: string; icon: string }>;
  serviceTypes: Array<{ id: string; label: string; icon: string; defaultBadge: string }>;
  defaultValues: {
    from: string;
    fromPincode: string;
    to: string;
    toPincode: string;
    shipmentType: string;
    serviceType: string;
    weight: number;
    dimensions: ShipmentDimensions;
    noOfPackages: number;
    valueOfGoods: number;
  };
  features: Array<{ title: string; icon: string }>;
  proBanner: {
    title: string;
    subtitle: string;
    actionText: string;
  };
  insuranceDetails: {
    title: string;
    description: string;
    coverageLimit: number;
  };
}

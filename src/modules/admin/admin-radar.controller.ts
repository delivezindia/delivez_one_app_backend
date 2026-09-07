import type { RequestHandler } from 'express';

export interface RadarHub {
  id: string;
  name: string;
  city: string;
  x: number; // 0-100% SVG grid positioning
  y: number;
  activeRidersCount: number;
  ordersInQueue: number;
}

export interface RadarCourier {
  id: string;
  name: string;
  vehicle: string;
  batteryPercent: number;
  speedKmh: number;
  status: 'AVAILABLE' | 'IN_TRANSIT' | 'ARMORED_TRANSIT';
  city: string;
  x: number;
  y: number;
  headingDeg: number;
  currentTrip?: {
    orderNumber: string;
    service: string;
    etaMins: number;
    destination: string;
  };
}

export interface RadarVector {
  id: string;
  orderNumber: string;
  service: string;
  fromHub: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progressPercent: number;
  courierName: string;
  status: string;
}

export const getRadarTelemetry: RequestHandler = (req, res) => {
  const cityFilter = typeof req.query.city === 'string' ? req.query.city.toUpperCase() : 'ALL';

  const hubs: RadarHub[] = [
    { id: 'hub-blr-1', name: 'Indiranagar Central Hub', city: 'BENGALURU', x: 28, y: 34, activeRidersCount: 18, ordersInQueue: 12 },
    { id: 'hub-blr-2', name: 'Koramangala Express Point', city: 'BENGALURU', x: 35, y: 52, activeRidersCount: 14, ordersInQueue: 8 },
    { id: 'hub-del-1', name: 'Connaught Place Station', city: 'DELHI_NCR', x: 62, y: 22, activeRidersCount: 22, ordersInQueue: 16 },
    { id: 'hub-del-2', name: 'Cyber City Secure Vault', city: 'DELHI_NCR', x: 74, y: 38, activeRidersCount: 12, ordersInQueue: 6 },
    { id: 'hub-mum-1', name: 'Bandra BKC Terminal', city: 'MUMBAI', x: 44, y: 72, activeRidersCount: 20, ordersInQueue: 15 },
    { id: 'hub-hyd-1', name: 'Hitec City Logistic Base', city: 'HYDERABAD', x: 58, y: 60, activeRidersCount: 16, ordersInQueue: 9 },
    { id: 'hub-pun-1', name: 'Kothrud Express Depot', city: 'PUNE', x: 48, y: 84, activeRidersCount: 10, ordersInQueue: 5 },
  ];

  const couriers: RadarCourier[] = [
    {
      id: 'rdr-1',
      name: 'Rajesh Sharma',
      vehicle: 'Ather 450X (EV)',
      batteryPercent: 82,
      speedKmh: 34,
      status: 'IN_TRANSIT',
      city: 'BENGALURU',
      x: 31,
      y: 41,
      headingDeg: 145,
      currentTrip: { orderNumber: 'GFT-2026-984', service: 'Gift Delivery', etaMins: 12, destination: 'Indiranagar 100ft Rd' },
    },
    {
      id: 'rdr-2',
      name: 'Aman Verma',
      vehicle: 'Ola S1 Pro (EV)',
      batteryPercent: 91,
      speedKmh: 42,
      status: 'IN_TRANSIT',
      city: 'BENGALURU',
      x: 38,
      y: 48,
      headingDeg: 80,
      currentTrip: { orderNumber: 'DLV-29840', service: 'Personal Courier', etaMins: 22, destination: 'Koramangala 4th Block' },
    },
    {
      id: 'rdr-3',
      name: 'Vikram Mehta',
      vehicle: 'Armored Vault Escort Van',
      batteryPercent: 74,
      speedKmh: 28,
      status: 'ARMORED_TRANSIT',
      city: 'DELHI_NCR',
      x: 68,
      y: 28,
      headingDeg: 210,
      currentTrip: { orderNumber: 'DLV-29812', service: 'Confidential Cargo', etaMins: 35, destination: 'Cyber City, Gurugram' },
    },
    {
      id: 'rdr-4',
      name: 'Deepak Kumar',
      vehicle: 'Honda Activa 6G',
      batteryPercent: 65,
      speedKmh: 0,
      status: 'AVAILABLE',
      city: 'HYDERABAD',
      x: 58,
      y: 62,
      headingDeg: 0,
    },
    {
      id: 'rdr-5',
      name: 'Suresh Raina',
      vehicle: 'TVS iQube (EV)',
      batteryPercent: 88,
      speedKmh: 38,
      status: 'IN_TRANSIT',
      city: 'MUMBAI',
      x: 46,
      y: 76,
      headingDeg: 315,
      currentTrip: { orderNumber: 'RET-55421', service: 'Return Pickup', etaMins: 16, destination: 'BKC Retail Center' },
    },
    {
      id: 'rdr-6',
      name: 'Kunal Patil',
      vehicle: 'Hero Electric Optima',
      batteryPercent: 79,
      speedKmh: 0,
      status: 'AVAILABLE',
      city: 'PUNE',
      x: 49,
      y: 83,
      headingDeg: 0,
    },
  ];

  const activeVectors: RadarVector[] = [
    {
      id: 'vec-1',
      orderNumber: 'GFT-2026-984',
      service: 'Gift & Celebration',
      fromHub: 'Indiranagar Central Hub',
      startX: 28,
      startY: 34,
      endX: 35,
      endY: 52,
      progressPercent: 64,
      courierName: 'Rajesh Sharma',
      status: 'Out for Delivery',
    },
    {
      id: 'vec-2',
      orderNumber: 'DLV-29812',
      service: 'Confidential Cargo',
      fromHub: 'Connaught Place Station',
      startX: 62,
      startY: 22,
      endX: 74,
      endY: 38,
      progressPercent: 48,
      courierName: 'Vikram Mehta',
      status: 'Biometric Escort Active',
    },
    {
      id: 'vec-3',
      orderNumber: 'RET-55421',
      service: 'Return Pickup',
      fromHub: 'Bandra BKC Terminal',
      startX: 44,
      startY: 72,
      endX: 47,
      endY: 79,
      progressPercent: 80,
      courierName: 'Suresh Raina',
      status: 'Enroute to Vendor',
    },
  ];

  const filteredHubs = cityFilter === 'ALL' ? hubs : hubs.filter(h => h.city === cityFilter);
  const filteredCouriers = cityFilter === 'ALL' ? couriers : couriers.filter(c => c.city === cityFilter);

  res.status(200).json({
    status: 'success',
    data: {
      hubs: filteredHubs,
      couriers: filteredCouriers,
      activeVectors,
      summary: {
        totalOnlineRiders: couriers.length,
        inTransitCount: couriers.filter(c => c.status !== 'AVAILABLE').length,
        availableCount: couriers.filter(c => c.status === 'AVAILABLE').length,
        avgFleetBatteryPercent: Math.round(couriers.reduce((acc, c) => acc + c.batteryPercent, 0) / couriers.length),
        activeMetroZones: ['BENGALURU', 'DELHI_NCR', 'MUMBAI', 'HYDERABAD', 'PUNE'],
      },
    },
  });
};

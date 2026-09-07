export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Picked up'
  | 'In transit'
  | 'Delivered'
  | 'Cancelled';

export type DeliveryPriority = 'Standard' | 'Express' | 'Same day';

export interface Order {
  id: string;
  customer: string;
  customerInitials: string;
  pickup: string;
  destination: string;
  placedAt: string;
  amount: number;
  status: OrderStatus;
  priority: DeliveryPriority;
  driver?: string;
}

export interface Driver {
  id: string;
  name: string;
  initials: string;
  phone: string;
  area: string;
  status: 'Active' | 'On delivery' | 'Offline';
  rating: number;
  deliveries: number;
  successRate: number;
  vehicle: string;
  accent: string;
}

export interface Customer {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  joined: string;
  status: 'Active' | 'Inactive';
}

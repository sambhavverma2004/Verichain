// Simulated Motoko data structures
export interface Product {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  minTemperature: number;
  maxTemperature: number;
  logisticsPartner: string;
  registeredAt: number;
}

export interface ShipmentEvent {
  id: string;
  timestamp: number;
  location: string;
  temperature: number;
  verifiedTemperature: number; // From weather API
  reporter: string;
  eventType: 'pickup' | 'transit' | 'delivery';
  isTemperatureValid: boolean;
}

export interface Shipment {
  id: string;
  productId: string;
  product: Product;
  manufacturer: string;
  logisticsPartner: string;
  consumer: string;
  status: 'pending' | 'in_transit' | 'compromised' | 'delivered' | 'confirmed';
  escrowAmount: number;
  escrowReleased: boolean;
  events: ShipmentEvent[];
  createdAt: number;
  deliveredAt?: number;
  confirmedAt?: number;
}

export type UserRole = 'manufacturer' | 'logistics' | 'consumer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  address: string;
}
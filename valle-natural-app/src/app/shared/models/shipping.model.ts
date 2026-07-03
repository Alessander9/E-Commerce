export interface ShippingRate {
  price: number;
}

export interface Shipment {
  id: number;
  orderId: number;
  zoneId: number;
  courier: string;
  trackingCode?: string;
  shippingCost: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingZone {
  id: number;
  name: string;
  basePrice: number;
  pricePerKg: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderSummary {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

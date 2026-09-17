export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  subdomain?: string;
  description?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  status: string;
  active: boolean;
  settings?: {
    currency: string;
    timezone: string;
    locale: string;
    supportEmail?: string;
    supportPhone?: string;
    address?: string;
  };
  _count?: {
    products: number;
    orders: number;
    userTenants: number;
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  currentRole?: string;
  currentTenant?: {
    id: string;
    name?: string;
    slug?: string;
  };
  memberships?: Array<{
    tenantId: string;
    tenantName: string;
    tenantSlug: string;
    role: string;
  }>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  _count?: {
    productCategories: number;
  };
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  prices: Array<{
    id: string;
    price: string | number;
    compareAtPrice?: string | number;
    currency: string;
  }>;
  inventory?: {
    availableStock: number;
    reservedStock: number;
  };
  variantValues?: Array<{
    optionValue: {
      id: string;
      value: string;
      label: string;
      colorHex?: string;
    };
  }>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  baseSku?: string;
  description?: string;
  shortDescription?: string;
  brand?: string;
  hasVariants: boolean;
  featured: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  images: Array<{
    id: string;
    url: string;
    altText?: string;
    isPrimary: boolean;
  }>;
  productCategories: Array<{
    category: Category;
  }>;
  variants: ProductVariant[];
}

export interface CartItem {
  variantId: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  unitPrice: number;
}

export interface ShippingZone {
  id: string;
  name: string;
  rates: Array<{
    id: string;
    weightMin: number;
    weightMax: number;
    price: string | number;
    currency: string;
  }>;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string | number;
  shippingCost: string | number;
  discountAmount: string | number;
  total: string | number;
  currency: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    productSku: string;
    variantName?: string;
    unitPrice: string | number;
    quantity: number;
    subtotal: string | number;
  }>;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    department: string;
    province: string;
    district: string;
    addressLine: string;
    reference?: string;
    city?: string;
  };
  shipment?: {
    courier?: string;
    trackingCode?: string;
    status: string;
    tracking?: Array<{
      status: string;
      description?: string;
      createdAt: string;
    }>;
  };
}

export interface Coupon {
  id: string;
  tenantId: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number | string;
  maxDiscountAmount?: number | string;
  minOrderAmount?: number | string;
  maxUses?: number;
  usedCount: number;
  perUserLimit?: number;
  startDate: string;
  endDate: string;
  active: boolean;
}


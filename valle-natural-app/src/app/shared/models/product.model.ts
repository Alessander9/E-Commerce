export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  primaryImageUrl: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  sku: string;
  weight: number;
  height: number;
  width: number;
  length: number;
  active: boolean;
  price: number;
  availableStock: number;
  imageUrls: string[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  active: boolean;
}

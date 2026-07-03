export interface CartItem {
  productId: number;
  productName: string;
  productSlug?: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}

export interface WishlistItem {
  productId: number;
  productName: string;
  productSlug: string;
  price: number;
  imageUrl?: string;
}

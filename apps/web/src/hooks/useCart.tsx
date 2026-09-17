import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product, ProductVariant } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  discountAmount: number;
  setDiscountAmount: (discount: number) => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cleo_cart';
const COUPON_STORAGE_KEY = 'cleo_cart_coupon';
const DISCOUNT_STORAGE_KEY = 'cleo_cart_discount';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial cart items from localStorage
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY) || localStorage.getItem('perucat_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading cart from localStorage:', e);
    }
    return [];
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Load initial coupon code
  const [couponCode, setCouponCodeState] = useState<string>(() => {
    try {
      return localStorage.getItem(COUPON_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  // Load initial discount amount
  const [discountAmount, setDiscountAmountState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(DISCOUNT_STORAGE_KEY);
      return saved ? Number(saved) || 0 : 0;
    } catch {
      return 0;
    }
  });

  // Persist items whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      localStorage.setItem('perucat_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Error saving cart to localStorage:', e);
    }
  }, [items]);

  // Persist coupon code
  const setCouponCode = useCallback((code: string) => {
    setCouponCodeState(code);
    try {
      if (code) {
        localStorage.setItem(COUPON_STORAGE_KEY, code);
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Error saving coupon to localStorage:', e);
    }
  }, []);

  // Persist discount amount
  const setDiscountAmount = useCallback((discount: number) => {
    setDiscountAmountState(discount);
    try {
      if (discount > 0) {
        localStorage.setItem(DISCOUNT_STORAGE_KEY, String(discount));
      } else {
        localStorage.removeItem(DISCOUNT_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Error saving discount to localStorage:', e);
    }
  }, []);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY || e.key === 'perucat_cart') {
        try {
          if (e.newValue) {
            const parsed = JSON.parse(e.newValue);
            if (Array.isArray(parsed)) setItems(parsed);
          } else {
            setItems([]);
          }
        } catch { }
      }
      if (e.key === COUPON_STORAGE_KEY) {
        setCouponCodeState(e.newValue || '');
      }
      if (e.key === DISCOUNT_STORAGE_KEY) {
        setDiscountAmountState(e.newValue ? Number(e.newValue) || 0 : 0);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addToCart = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    // Resolve variant with fallback if not explicitly provided
    const resolvedVariant: ProductVariant = variant || (product.variants && product.variants[0]) || {
      id: `var-${product.id}`,
      sku: product.baseSku || `SKU-${product.id}`,
      name: 'Estándar',
      prices: [{ id: 'p1', price: 0, currency: 'PEN' }],
    };

    const priceObj = resolvedVariant.prices && resolvedVariant.prices[0];
    const unitPrice = priceObj ? Number(priceObj.price) : 0;
    const variantId = resolvedVariant.id || `var-${product.id}`;

    setItems((prev) => {
      const existing = prev.find((item) => item.variantId === variantId);
      if (existing) {
        return prev.map((item) =>
          item.variantId === variantId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { variantId, product, variant: resolvedVariant, quantity, unitPrice }];
    });

    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (variantId: string) => {
    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.variantId === variantId ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => {
    setItems([]);
    setDiscountAmount(0);
    setCouponCode('');
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem('perucat_cart');
      localStorage.removeItem(COUPON_STORAGE_KEY);
      localStorage.removeItem(DISCOUNT_STORAGE_KEY);
    } catch { }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = Math.max(0, subtotal - discountAmount);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        couponCode,
        setCouponCode,
        discountAmount,
        setDiscountAmount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, ProductVariant } from '../types';

export interface WishlistItem {
  variantId: string;
  product: Product;
  variant: ProductVariant;
  addedAt: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (product: Product, variant?: ProductVariant) => void;
  removeFromWishlist: (identifier: string) => void;
  isInWishlist: (identifier: string) => boolean;
  clearWishlist: () => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'cleo_wishlist';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial wishlist from localStorage with safety fallback
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY) || localStorage.getItem('perucat_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading wishlist from localStorage:', e);
    }
    return [];
  });

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
      localStorage.setItem('perucat_wishlist', JSON.stringify(items));
    } catch (e) {
      console.warn('Error saving wishlist to localStorage:', e);
    }
  }, [items]);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === WISHLIST_STORAGE_KEY || e.key === 'perucat_wishlist') {
        try {
          if (e.newValue) {
            const parsed = JSON.parse(e.newValue);
            if (Array.isArray(parsed)) setItems(parsed);
          } else {
            setItems([]);
          }
        } catch { }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addToWishlist = useCallback((product: Product, variant?: ProductVariant) => {
    const resolvedVariant: ProductVariant = variant || (product.variants && product.variants[0]) || {
      id: `var-${product.id}`,
      sku: product.baseSku || `SKU-${product.id}`,
      name: 'Estándar',
      prices: [{ id: 'p1', price: 0, currency: 'PEN' }],
    };

    const variantId = resolvedVariant.id || `var-${product.id}`;

    setItems((prev) => {
      const exists = prev.some(
        (item) =>
          item.variantId === variantId ||
          item.product?.id === product.id ||
          (product.slug && item.product?.slug === product.slug),
      );
      if (exists) return prev;
      return [
        ...prev,
        {
          variantId,
          product,
          variant: resolvedVariant,
          addedAt: new Date().toISOString(),
        },
      ];
    });
  }, []);

  const removeFromWishlist = useCallback((identifier: string) => {
    if (!identifier) return;
    setItems((prev) =>
      prev.filter(
        (item) =>
          item.variantId !== identifier &&
          item.product?.id !== identifier &&
          item.product?.slug !== identifier,
      ),
    );
  }, []);

  const isInWishlist = useCallback(
    (identifier: string) => {
      if (!identifier) return false;
      return items.some(
        (item) =>
          item.variantId === identifier ||
          item.product?.id === identifier ||
          item.product?.slug === identifier,
      );
    },
    [items],
  );

  const clearWishlist = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
      localStorage.removeItem('perucat_wishlist');
    } catch { }
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        totalItems: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant } from '../types';

interface WishlistItem {
  variantId: string;
  product: Product;
  variant: ProductVariant;
  addedAt: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (product: Product, variant: ProductVariant) => void;
  removeFromWishlist: (variantId: string) => void;
  isInWishlist: (variantId: string) => boolean;
  clearWishlist: () => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    const saved = localStorage.getItem('cleo_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cleo_wishlist', JSON.stringify(items));
  }, [items]);

  const addToWishlist = (product: Product, variant: ProductVariant) => {
    setItems((prev) => {
      const exists = prev.find((item) => item.variantId === variant.id);
      if (exists) return prev;
      return [...prev, { variantId: variant.id, product, variant, addedAt: new Date().toISOString() }];
    });
  };

  const removeFromWishlist = (variantId: string) => {
    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const isInWishlist = (variantId: string) => {
    return items.some((item) => item.variantId === variantId);
  };

  const clearWishlist = () => {
    setItems([]);
  };

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

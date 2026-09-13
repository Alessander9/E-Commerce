import React from 'react';
import { useCart } from '../../hooks/useCart';
import { useTenant } from '../../hooks/useTenant';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatMoney } from '../../utils/format';

export const CartDrawer: React.FC = () => {
  const { isCartDrawerOpen, setIsCartDrawerOpen, items, removeFromCart, updateQuantity, subtotal } = useCart();
  const { currentTenant } = useTenant();
  const navigate = useNavigate();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0D1B3D]/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#F7F8FC]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-navy text-lg">Tu Carrito de Compras</h3>
                <p className="text-xs text-muted-foreground">{items.length} productos agregados</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 rounded-xl text-gray-400 hover:text-navy hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-300 mx-auto mb-4">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h4 className="font-semibold text-navy text-base mb-1">Tu carrito está vacío</h4>
                <p className="text-sm text-muted-foreground mb-6">Explora nuestro catálogo y descubre productos increíbles.</p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('/productos');
                  }}
                  className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shadow-glow-primary"
                >
                  Ver Catálogo
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-4 p-3.5 rounded-2xl border border-gray-100 hover:border-primary/20 bg-white hover:shadow-sm transition-all"
                >
                  <img
                    src={item.product.images[0]?.url || '/logo-tienda.png'}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-xl object-cover bg-gray-50 flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm text-navy truncate pr-2">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-gray-300 hover:text-danger p-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-primary font-medium mt-0.5">
                        {item.variant.name || item.variant.sku}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-navy">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="font-bold text-sm text-navy">
                        {formatMoney(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-[#F7F8FC] space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Envío estimado</span>
                  <span className="text-accent font-medium">Calculado en checkout</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-navy pt-2 border-t border-gray-200/60">
                  <span>Total</span>
                  <span className="text-primary font-black">{formatMoney(subtotal)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  navigate('/checkout');
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-grad-primary text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-glow-primary"
              >
                <span>Proceder al Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

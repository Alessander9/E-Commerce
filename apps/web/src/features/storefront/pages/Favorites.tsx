import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../../hooks/useWishlist';
import { useCart } from '../../../hooks/useCart';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Package } from 'lucide-react';
import { formatMoney, parseSafeNumber } from '../../../utils/format';

export const Favorites: React.FC = () => {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleMoveToCart = (item: any) => {
    addToCart(item.product, item.variant, 1);
    removeFromWishlist(item.variantId);
  };

  const getStock = (variant: any) => {
    const inventory = variant.inventory;
    return inventory ? parseSafeNumber(inventory.availableStock) : 0;
  };

  const getPrice = (variant: any) => {
    const priceObj = variant.prices?.[0];
    return priceObj ? parseSafeNumber(priceObj.price) : 0;
  };

  const getComparePrice = (variant: any) => {
    const priceObj = variant.prices?.[0];
    return priceObj?.compareAtPrice ? parseSafeNumber(priceObj.compareAtPrice) : null;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <Heart className="w-12 h-12 text-gray-300" />
        </div>
        <h2 className="text-2xl font-black text-navy mb-2">Tu lista de favoritos está vacía</h2>
        <p className="text-gray-500 mb-6 max-w-sm">
          Explora nuestro catálogo y guarda los productos que más te gusten haciendo clic en el ícono de corazón.
        </p>
        <button
          onClick={() => navigate('/productos')}
          className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-colors"
        >
          Explorar Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-navy">Mis Favoritos</h1>
            <p className="text-sm text-gray-500">{items.length} producto(s) guardado(s)</p>
          </div>
        </div>

        <button
          onClick={clearWishlist}
          className="px-4 py-2 rounded-2xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
        >
          Limpiar Todo
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => {
          const price = getPrice(item.variant);
          const comparePrice = getComparePrice(item.variant);
          const stock = getStock(item.variant);
          const inStock = stock > 0;
          const image = item.product.images?.[0]?.url;

          return (
            <div
              key={item.variantId}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                {image ? (
                  <img
                    src={image}
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-300" />
                  </div>
                )}

                {/* Remove button */}
                <button
                  onClick={() => removeFromWishlist(item.variantId)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Stock badge */}
                {!inStock && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    Agotado
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    {item.variant.name || item.variant.sku}
                  </p>
                  <h3 className="text-sm font-bold text-navy line-clamp-2 mt-0.5">
                    {item.product.name}
                  </h3>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-primary">
                    {formatMoney(price)}
                  </span>
                  {comparePrice && comparePrice > price && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatMoney(comparePrice)}
                    </span>
                  )}
                </div>

                {/* Move to Cart */}
                <button
                  onClick={() => handleMoveToCart(item)}
                  disabled={!inStock}
                  className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    inStock
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {inStock ? 'Mover al Carrito' : 'No disponible'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

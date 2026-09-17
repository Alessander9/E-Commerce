import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWishlist } from '../../../hooks/useWishlist';
import { useCart } from '../../../hooks/useCart';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Package, Sparkles } from 'lucide-react';
import { formatMoney, parseSafeNumber } from '../../../utils/format';

export const Favorites: React.FC = () => {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, setIsCartDrawerOpen } = useCart();
  const navigate = useNavigate();

  const handleMoveToCart = (item: any) => {
    addToCart(item.product, item.variant, 1);
    removeFromWishlist(item.variantId);
    setIsCartDrawerOpen(true);
  };

  const getStock = (variant: any) => {
    const inventory = variant?.inventory;
    return inventory ? parseSafeNumber(inventory.availableStock) : 10;
  };

  const getPrice = (variant: any) => {
    const priceObj = variant?.prices?.[0];
    return priceObj ? parseSafeNumber(priceObj.price) : 0;
  };

  const getComparePrice = (variant: any) => {
    const priceObj = variant?.prices?.[0];
    return priceObj?.compareAtPrice ? parseSafeNumber(priceObj.compareAtPrice) : null;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center mb-4 text-rose-500 shadow-2xs">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Tu lista de deseos está vacía</h2>
        <p className="text-xs text-slate-500 mb-6 max-w-sm font-medium">
          Guarda los productos y arenas sanitarias favoritas de tus gatitos haciendo clic en el corazón para comprarlos cuando quieras.
        </p>
        <Link
          to="/productos"
          className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-2xl font-black text-xs shadow-md transition-all flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Explorar Catálogo PeruCat</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100/80 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">Lista de Deseos</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black border border-rose-100">
                {items.length} {items.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Tus productos favoritos guardados en este dispositivo</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <Link
            to="/productos"
            className="px-4 py-2 rounded-2xl bg-[#EEF2FF] hover:bg-indigo-100 text-[#4F46E5] text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Seguir Comprando</span>
          </Link>

          <button
            onClick={clearWishlist}
            className="px-4 py-2 rounded-2xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Limpiar Lista
          </button>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {items.map((item) => {
          const price = getPrice(item.variant);
          const comparePrice = getComparePrice(item.variant);
          const stock = getStock(item.variant);
          const inStock = stock > 0;
          const image = item.product.images?.[0]?.url || '/IMG/perucat-clasica-hd.jpg';

          return (
            <div
              key={item.variantId}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Image */}
              <div className="relative aspect-square bg-slate-50 overflow-hidden">
                <img
                  src={image}
                  alt={item.product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Remove button */}
                <button
                  onClick={() => removeFromWishlist(item.variantId)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer"
                  title="Eliminar de favoritos"
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
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-mono font-medium">
                    {item.variant.name || item.variant.sku}
                  </p>
                  <h3 className="text-xs font-black text-slate-900 line-clamp-2 leading-tight">
                    {item.product.name}
                  </h3>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-base font-black text-[#4F46E5]">
                    {formatMoney(price)}
                  </span>
                  {comparePrice && comparePrice > price && (
                    <span className="text-[11px] text-slate-400 line-through">
                      {formatMoney(comparePrice)}
                    </span>
                  )}
                </div>

                {/* Move to Cart Button */}
                <button
                  onClick={() => handleMoveToCart(item)}
                  disabled={!inStock}
                  className={`w-full py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
                    inStock
                      ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-md hover:shadow-lg'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{inStock ? 'Mover al Carrito' : 'Agotado Temporalmente'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

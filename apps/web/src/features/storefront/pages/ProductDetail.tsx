import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTenant } from '../../../hooks/useTenant';
import { useCart } from '../../../hooks/useCart';
import { Product, ProductVariant } from '../../../types';
import { apiRequest } from '../../../services/api';
import { formatMoney, parseSafeNumber } from '../../../utils/format';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowLeft,
  Plus,
  Minus,
  CheckCircle,
  Heart,
} from 'lucide-react';
import { useWishlist } from '../../../hooks/useWishlist';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { tenantSlug } = useTenant();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiRequest<Product>(`/api/store/products/${slug}`, {}, tenantSlug)
      .then((data) => {
        setProduct(data);
        if (data) {
          document.title = `${data.name} | PeruCat Oficial Perú`;
        }
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0].url);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [slug, tenantSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-navy">Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-navy">Producto no encontrado</h2>
        <p className="text-sm text-muted-foreground">El producto solicitado no existe en esta tienda.</p>
        <Link to="/productos" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold text-sm">
          <ArrowLeft className="w-4 h-4" /> Volver al Catálogo
        </Link>
      </div>
    );
  }

  const activePriceObj = selectedVariant?.prices[0];
  const price = activePriceObj ? parseSafeNumber(activePriceObj.price) : 0;
  const compareAtPrice = activePriceObj?.compareAtPrice ? parseSafeNumber(activePriceObj.compareAtPrice) : null;
  const availableStock = selectedVariant?.inventory?.availableStock || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
        <span>/</span>
        <Link to="/productos" className="hover:text-primary transition-colors">Catálogo</Link>
        <span>/</span>
        <span className="text-navy font-semibold truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm">
        {/* Left Images Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 h-96 flex items-center justify-center">
            <img
              src={selectedImage || product.images[0]?.url || '/logo-tienda.png'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {compareAtPrice && compareAtPrice > price && (
              <span className="absolute top-4 left-4 bg-grad-secondary text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                OFERTA ESPECIAL
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === img.url ? 'border-primary shadow-glow-primary' : 'border-gray-200 opacity-70'
                  }`}
                >
                  <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info & Actions */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-primary-light text-primary font-bold text-xs uppercase tracking-wider">
                {product.brand || 'PeruCat'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">
                  SKU: {selectedVariant?.sku || product.baseSku}
                </span>
                <button
                  onClick={() => {
                    if (selectedVariant) {
                      isInWishlist(selectedVariant.id)
                        ? removeFromWishlist(selectedVariant.id)
                        : addToWishlist(product, selectedVariant);
                    }
                  }}
                  className="w-10 h-10 rounded-2xl border border-gray-200 flex items-center justify-center hover:border-rose-300 hover:bg-rose-50 transition-all"
                  title={isInWishlist(selectedVariant?.id || '') ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isInWishlist(selectedVariant?.id || '')
                        ? 'fill-rose-500 text-rose-500'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-navy leading-tight">
              {product.name}
            </h1>

            {/* Price section */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-navy">
                {formatMoney(price)}
              </span>
              {compareAtPrice && compareAtPrice > price && (
                <span className="text-base text-muted-foreground line-through">
                  {formatMoney(compareAtPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description || product.shortDescription}
            </p>

            {/* Cat Litter Highlights */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-navy/[0.02] border border-gray-100 rounded-2xl text-xs">
              <div className="flex items-center gap-2 text-navy font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Aglomeración en 3 seg</span>
              </div>
              <div className="flex items-center gap-2 text-navy font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span>Control de olor 24/7</span>
              </div>
              <div className="flex items-center gap-2 text-navy font-semibold">
                <span className="w-2 h-2 rounded-full bg-accent"></span>
                <span>99.5% Libre de polvo</span>
              </div>
              <div className="flex items-center gap-2 text-navy font-semibold">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span>Fácil de retirar con pala</span>
              </div>
            </div>

            {/* Variant Selector (250g, 500g, 1kg etc.) */}
            {product.variants && product.variants.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">
                  Presentación / Peso
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-grad-primary text-white border-transparent shadow-glow-primary'
                            : 'bg-white text-navy border-gray-200 hover:border-primary/40'
                        }`}
                      >
                        {variant.name || variant.sku}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock Indicator */}
            <div className="flex items-center gap-2 pt-2">
              {availableStock > 0 ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  <span>Stock disponible: {availableStock} unidades en almacén</span>
                </div>
              ) : (
                <div className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full">
                  Agotado temporalmente
                </div>
              )}
            </div>
          </div>

          {/* Add to Cart Stepper & CTA */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <div className="flex flex-wrap sm:flex-nowrap gap-4">
              {/* Stepper */}
              <div className="flex items-center border border-gray-200 rounded-2xl bg-[#F7F8FC] p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-gray-100 flex items-center justify-center text-navy shadow-sm transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-sm text-navy">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-gray-100 flex items-center justify-center text-navy shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add Button */}
              <button
                disabled={availableStock <= 0}
                onClick={() => selectedVariant && addToCart(product, selectedVariant, quantity)}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-grad-primary text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-glow-primary disabled:opacity-50"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Agregar al Carrito ({formatMoney(price * quantity)})</span>
              </button>
            </div>

            {/* Quick Guarantees */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Fórmula 100% segura para gatos</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-accent" />
                <span>Envíos a todo Lima & provincias</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

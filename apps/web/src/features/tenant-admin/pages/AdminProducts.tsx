import React, { useEffect, useState } from 'react';
import { useTenant } from '../../../hooks/useTenant';
import { useAuth } from '../../../hooks/useAuth';
import { Product } from '../../../types';
import { apiRequest } from '../../../services/api';
import { formatMoney, parseSafeNumber } from '../../../utils/format';
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Tag,
  DollarSign,
  Layers,
  Image as ImageIcon,
  ArrowUpDown,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  Boxes,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { currentTenant, tenantSlug } = useTenant();
  const { isTenantAdmin, isTenantManager } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);

  // Modal Create Product
  const [showModal, setShowModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdSlug, setNewProdSlug] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(29.9);
  const [newProdStock, setNewProdStock] = useState(50);
  const [newProdBrand, setNewProdBrand] = useState('PeruCat');
  const [newProdImageUrl, setNewProdImageUrl] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    apiRequest<Product[]>('/api/admin/products', {}, tenantSlug)
      .then((prods) => setProducts(prods))
      .catch((err) => console.error('Error fetching admin products:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [tenantSlug]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest(
        '/api/admin/products',
        {
          method: 'POST',
          body: JSON.stringify({
            name: newProdName,
            slug: newProdSlug || newProdName.toLowerCase().replace(/\s+/g, '-'),
            price: Number(newProdPrice),
            stock: Number(newProdStock),
            brand: newProdBrand,
            description: newProdDesc,
            images: newProdImageUrl ? [{ url: newProdImageUrl, isPrimary: true }] : [],
            baseSku: newProdSku || `SKU-${Date.now().toString().slice(-6)}`,
          }),
        },
        tenantSlug
      );

      setShowModal(false);
      setNewProdName('');
      setNewProdSlug('');
      setNewProdDesc('');
      setNewProdImageUrl('');
      setNewProdSku('');
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Error al crear producto');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick stock replenishment handler
  const handleQuickStockAdjust = async (productId: string, variantId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    setUpdatingStockId(productId);
    try {
      // Update local state optimistically
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            return {
              ...p,
              variants: p.variants.map((v) => {
                if (v.id === variantId) {
                  return {
                    ...v,
                    inventory: {
                      ...v.inventory,
                      availableStock: newStock,
                    } as any,
                  };
                }
                return v;
              }),
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error('Error adjusting stock:', err);
    } finally {
      setUpdatingStockId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
      (p.baseSku && p.baseSku.toLowerCase().includes(search.toLowerCase()));

    const stock = p.variants[0]?.inventory?.availableStock ?? 0;
    if (stockFilter === 'IN_STOCK') return matchesSearch && stock > 10;
    if (stockFilter === 'LOW_STOCK') return matchesSearch && stock > 0 && stock <= 10;
    if (stockFilter === 'OUT_OF_STOCK') return matchesSearch && stock === 0;

    return matchesSearch;
  });

  const totalCatalogStock = products.reduce(
    (acc, p) => acc + (p.variants[0]?.inventory?.availableStock || 0),
    0
  );
  const lowStockCount = products.filter(
    (p) => (p.variants[0]?.inventory?.availableStock || 0) <= 10
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Header & Role Workflow Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10">
              <Sparkles className="w-3.5 h-3.5" /> {currentTenant?.name || 'PeruCat - Tienda Oficial'}
            </span>
            <span className="text-xs font-bold text-navy px-3 py-1 rounded-full bg-gray-100 flex items-center gap-1">
              <Boxes className="w-3.5 h-3.5 text-primary" /> Modo: {isTenantManager ? 'Gestión Operativa' : 'Control Total'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy">
            Catálogo & Control de Inventario
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isTenantManager
              ? 'Supervisa existencias, repón stock de forma ágil y asegura disponibilidad para despacho.'
              : 'Administra catálogo maestro, precios de venta, variantes de stock y disponibilidad en tienda.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-navy font-bold transition-all"
            title="Refrescar catálogo"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3.5 rounded-2xl bg-grad-primary hover:bg-grad-primary-hover text-white font-extrabold text-xs flex items-center gap-2 shadow-glow-primary hover:shadow-glow-secondary transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Stock Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Total Artículos
            </span>
            <span className="text-3xl font-black text-navy mt-1 block">{products.length}</span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> En catálogo activo
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Unidades en Stock
            </span>
            <span className="text-3xl font-black text-navy mt-1 block">{totalCatalogStock}</span>
            <span className="text-[11px] text-primary font-semibold flex items-center gap-1 mt-1">
              <Layers className="w-3.5 h-3.5" /> En inventario central
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Alertas de Reposición
            </span>
            <span className={`text-3xl font-black mt-1 block ${lowStockCount > 0 ? 'text-amber-500' : 'text-navy'}`}>
              {lowStockCount}
            </span>
            <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5" /> ≤ 10 unidades restantes
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs text-navy focus:outline-none focus:border-primary transition-all font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setStockFilter('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              stockFilter === 'ALL'
                ? 'bg-navy text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos ({products.length})
          </button>
          <button
            onClick={() => setStockFilter('IN_STOCK')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              stockFilter === 'IN_STOCK'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Stock Óptimo
          </button>
          <button
            onClick={() => setStockFilter('LOW_STOCK')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              stockFilter === 'LOW_STOCK'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Stock Crítico ({lowStockCount})
          </button>
        </div>
      </div>

      {/* 4. Products Table with Inline Stock Replenishment Controls */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FC] border-b border-gray-100 text-muted-foreground font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Producto & Marca</th>
                  <th className="py-4 px-6">SKU Maestro</th>
                  <th className="py-4 px-6">Precio Unitario</th>
                  <th className="py-4 px-6 text-center">Nivel de Stock</th>
                  <th className="py-4 px-6 text-center">Reposición Rápida</th>
                  <th className="py-4 px-6 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground space-y-2">
                      <Package className="w-10 h-10 mx-auto text-gray-300" />
                      <p className="font-bold text-navy">No se encontraron productos coincidentes</p>
                      <p className="text-xs">Prueba ajustando los filtros o registra un nuevo artículo.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const defaultVar = p.variants[0];
                    const price = defaultVar?.prices[0]?.price || 0;
                    const stock = defaultVar?.inventory?.availableStock || 0;
                    const isLow = stock <= 10;
                    const isOut = stock === 0;

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/70 transition-colors group">
                        <td className="py-4 px-6 font-bold text-navy flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                            <img
                              src={p.images[0]?.url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=150&auto=format&fit=crop&q=60'}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div>
                            <p className="text-sm text-navy font-black">{p.name}</p>
                            <span className="text-[11px] text-muted-foreground font-normal flex items-center gap-1.5 mt-0.5">
                              <span className="font-bold text-primary">{p.brand || 'Cleo'}</span>
                              <span>•</span>
                              <span>{defaultVar?.name || 'Presentación Estándar'}</span>
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-mono text-gray-500 font-bold">
                          <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-[11px]">
                            {defaultVar?.sku || p.baseSku || 'SKU-0000'}
                          </span>
                        </td>

                        <td className="py-4 px-6 font-black text-navy text-sm">
                          {formatMoney(price)}
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              isOut
                                ? 'bg-rose-100 text-rose-800'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isOut ? (
                              'Agotado (0)'
                            ) : (
                              <>
                                <span className={`w-1.5 h-1.5 rounded-full ${isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                {stock} u.
                              </>
                            )}
                          </span>
                        </td>

                        {/* Inline Stock Replenishment Quick Actions */}
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-gray-50 p-1 rounded-2xl border border-gray-200/80">
                            <button
                              type="button"
                              onClick={() => handleQuickStockAdjust(p.id, defaultVar?.id || '', stock, -5)}
                              disabled={stock < 5}
                              className="w-7 h-7 rounded-xl bg-white text-gray-600 hover:bg-rose-50 hover:text-rose-600 font-bold flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-white"
                              title="Restar 5 unidades"
                            >
                              -5
                            </button>
                            <span className="text-xs font-mono font-black text-navy px-1.5 min-w-[28px]">
                              {stock}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickStockAdjust(p.id, defaultVar?.id || '', stock, +5)}
                              className="w-7 h-7 rounded-xl bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 font-bold flex items-center justify-center transition-all"
                              title="Sumar 5 unidades (reposición)"
                            >
                              +5
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickStockAdjust(p.id, defaultVar?.id || '', stock, +20)}
                              className="px-2 h-7 rounded-xl bg-primary-light text-primary hover:bg-primary hover:text-white font-extrabold text-[10px] flex items-center justify-center transition-all"
                              title="Lote de reposición (+20 unidades)"
                            >
                              +20
                            </button>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-xl">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Modal: Create Product in 2 Columns with Realtime Preview */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Catálogo Comercial
                </span>
                <h3 className="text-xl font-bold text-navy">Registrar Nuevo Producto</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-navy hover:bg-gray-100 transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              {/* Row 1: Name & Brand (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-navy block mb-1.5">Nombre Comercial del Producto *</label>
                  <div className="relative">
                    <Package className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ej. Café Gourmet Orgánico 500g"
                      value={newProdName}
                      onChange={(e) => {
                        setNewProdName(e.target.value);
                        setNewProdSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                      }}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-navy block mb-1.5">Marca / Fabricante</label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ej. PeruCat"
                      value={newProdBrand}
                      onChange={(e) => setNewProdBrand(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Price & Stock (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-navy block mb-1.5">Precio de Venta (PEN) *</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      placeholder="29.90"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-bold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-navy block mb-1.5">Stock Inicial Disponible *</label>
                  <div className="relative">
                    <Layers className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="0"
                      placeholder="100"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-bold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: SKU & Slug (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-navy block mb-1.5">Código SKU Principal</label>
                  <input
                    type="text"
                    placeholder="Ej. SKU-PROD-001"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value.toUpperCase())}
                    className="w-full p-3 rounded-2xl border border-gray-200 text-navy font-mono font-bold text-xs focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-navy block mb-1.5">Slug (Identificador URL) *</label>
                  <input
                    type="text"
                    placeholder="cafe-gourmet-organico-500g"
                    value={newProdSlug}
                    onChange={(e) => setNewProdSlug(e.target.value.toLowerCase())}
                    className="w-full p-3 rounded-2xl border border-gray-200 text-navy font-mono text-xs focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Row 4: Image URL with Live Thumbnail Preview */}
              <div>
                <label className="font-bold text-navy block mb-1.5">URL de la Imagen Principal</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newProdImageUrl}
                      onChange={(e) => setNewProdImageUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-medium text-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                  {newProdImageUrl && (
                    <div className="w-11 h-11 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                      <img
                        src={newProdImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Row 5: Description */}
              <div>
                <label className="font-bold text-navy block mb-1.5">Descripción & Especificaciones</label>
                <textarea
                  placeholder="Detalla las características, notas de cata o modo de uso del producto..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-gray-200 text-navy font-medium focus:border-primary focus:outline-none h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-2xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-2xl bg-grad-primary hover:bg-grad-primary-hover text-white font-extrabold shadow-glow-primary transition-all disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


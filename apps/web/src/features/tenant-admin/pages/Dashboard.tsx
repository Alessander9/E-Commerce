import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTenant } from '../../../hooks/useTenant';
import { useAuth } from '../../../hooks/useAuth';
import { Product, Order, Coupon } from '../../../types';
import { apiRequest } from '../../../services/api';
import { parseSafeNumber, formatMoney } from '../../../utils/format';
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  Plus,
  CheckCircle2,
  TrendingUp,
  Tag,
  Truck,
  ShieldCheck,
  Layers,
  ArrowRight,
  Clock,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
  Boxes,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentTenant, tenantSlug } = useTenant();
  const { isTenantAdmin, isTenantManager, currentRole, roleLevel, canAccessCoupons } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // New Product Modal State
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

  useEffect(() => {
    setLoading(true);
    const requests: Promise<any>[] = [
      apiRequest<Product[]>('/api/admin/products', {}, tenantSlug),
      apiRequest<Order[]>('/api/admin/orders', {}, tenantSlug),
    ];

    if (canAccessCoupons) {
      requests.push(apiRequest<Coupon[]>('/api/admin/coupons', {}, tenantSlug).catch(() => []));
    }

    Promise.all(requests)
      .then(([prods, ords, coups]) => {
        setProducts(prods || []);
        setOrders(ords || []);
        if (coups) setCoupons(coups);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [tenantSlug, canAccessCoupons]);

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
        tenantSlug,
      );

      setShowModal(false);
      // Reset form
      setNewProdName('');
      setNewProdSlug('');
      setNewProdDesc('');
      setNewProdImageUrl('');
      setNewProdSku('');
      // Reload products
      const prods = await apiRequest<Product[]>('/api/admin/products', {}, tenantSlug);
      setProducts(prods || []);
    } catch (err: any) {
      alert(err.message || 'Error al crear producto');
    } finally {
      setSubmitting(false);
    }
  };

  const totalSales = orders.reduce((sum, ord) => sum + parseSafeNumber(ord.total), 0);
  const averageTicket = orders.length > 0 ? totalSales / orders.length : 0;
  const pendingOrders = orders.filter((o) => o.fulfillmentStatus === 'UNFULFILLED' || o.status === 'PROCESSING');
  const lowStockItems = products.filter((p) => {
    const stock = p.variants[0]?.inventory?.availableStock || 0;
    return stock < 10;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header with Role Hierarchy Context */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10">
              <Sparkles className="w-3.5 h-3.5" /> {currentTenant?.name || 'PeruCat - Tienda Oficial'}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isTenantAdmin
                  ? 'bg-blue-100 text-secondary'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isTenantAdmin
                ? 'Administrador (Nivel 3 - Máximo)'
                : 'Gestor Operativo (Nivel 2)'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy mt-1">
            {isTenantManager ? 'Panel Operativo de Tienda' : 'Dashboard de Tienda & Métricas'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isTenantManager
              ? 'Control de inventario, stock y seguimiento de despachos para el tenant actual.'
              : 'Supervisión integral de ventas, pedidos, catálogo y promociones del tenant.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canAccessCoupons && (
            <Link
              to="/admin/cupones"
              className="px-4 py-2.5 rounded-2xl bg-secondary/10 hover:bg-secondary/20 text-secondary font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Tag className="w-4 h-4" />
              <span>Ver Cupones ({coupons.length})</span>
            </Link>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-grad-primary text-white font-bold text-xs flex items-center gap-2 shadow-glow-primary hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Role-Adaptive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isTenantManager ? (
          /* Level 2: Manager Operational KPIs */
          <>
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">Por Despachar</span>
                <p className="text-2xl font-black text-amber-600">{pendingOrders.length}</p>
                <span className="text-[11px] text-gray-400">Pedidos pendientes</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Truck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">Total Pedidos</span>
                <p className="text-2xl font-black text-navy">{orders.length}</p>
                <span className="text-[11px] text-emerald-600 font-bold">Registrados en tienda</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-secondary-light flex items-center justify-center text-secondary">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">Productos en Inventario</span>
                <p className="text-2xl font-black text-navy">{products.length}</p>
                <span className="text-[11px] text-gray-400">Variantes gestionadas</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-accent-soft flex items-center justify-center text-accent">
                <Package className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">Quiebres de Stock</span>
                <p className="text-2xl font-black text-rose-500">{lowStockItems.length}</p>
                <span className="text-[11px] text-rose-600 font-bold">Menos de 10 unidades</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </>
        ) : (
          /* Level 3 & 4: Admin Full Business KPIs */
          <>
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">Ventas Totales</span>
                <p className="text-2xl font-black text-navy">{formatMoney(totalSales)}</p>
                <span className="text-[11px] text-emerald-600 font-bold">Volumen facturado</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">Total Pedidos</span>
                <p className="text-2xl font-black text-navy">{orders.length}</p>
                <span className="text-[11px] text-muted-foreground">Ticket prom: {formatMoney(averageTicket)}</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-secondary-light flex items-center justify-center text-secondary">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">Catálogo Activo</span>
                <p className="text-2xl font-black text-navy">{products.length}</p>
                <span className="text-[11px] text-accent font-bold">Productos listados</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-accent-soft flex items-center justify-center text-accent">
                <Package className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">Alertas de Stock</span>
                <p className="text-2xl font-black text-amber-500">{lowStockItems.length}</p>
                <span className="text-[11px] text-amber-600 font-bold">Inventario bajo</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content: Recent Orders + Inventory Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Products & Inventory Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-navy">Inventario & Catálogo ({products.length})</h3>
              <p className="text-xs text-muted-foreground">Productos activos en la tienda</p>
            </div>
            <Link
              to="/admin/productos"
              className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1"
            >
              Ver Todo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3">Producto</th>
                    <th className="pb-3">SKU</th>
                    <th className="pb-3">Precio</th>
                    <th className="pb-3">Stock</th>
                    <th className="pb-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {products.slice(0, 6).map((p) => {
                    const defaultVar = p.variants[0];
                    const price = defaultVar?.prices[0]?.price || 0;
                    const stock = defaultVar?.inventory?.availableStock || 0;

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 font-bold text-navy flex items-center gap-3">
                          <img
                            src={p.images[0]?.url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100&auto=format&fit=crop&q=60'}
                            alt={p.name}
                            className="w-9 h-9 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <p className="text-xs font-bold text-navy">{p.name}</p>
                            <span className="text-[10px] text-muted-foreground">{p.brand}</span>
                          </div>
                        </td>
                        <td className="py-3 font-mono text-[11px] text-gray-500">{defaultVar?.sku || p.baseSku}</td>
                        <td className="py-3 font-black text-navy text-xs">{formatMoney(price)}</td>
                        <td className="py-3">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                              stock > 10
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {stock} und
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Recent Orders & Direct Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Orders Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-navy">Últimos Pedidos</h3>
                <p className="text-xs text-muted-foreground">Ventas y solicitudes recientes</p>
              </div>
              <Link
                to="/admin/pedidos"
                className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
              >
                Ver Pedidos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">
                  No hay pedidos registrados en este tenant aún.
                </p>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="p-3.5 rounded-2xl bg-[#F7F8FC] border border-gray-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-navy">{order.orderNumber}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {order.items.length} productos • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-navy text-sm block">
                        {formatMoney(order.total)}
                      </span>
                      <span className="text-[10px] font-bold text-secondary uppercase">
                        {order.fulfillmentStatus}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create Product (2-column layout with icons & live image preview) */}
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


import React, { useEffect, useState } from 'react';
import { useTenant } from '../../../hooks/useTenant';
import { useAuth } from '../../../hooks/useAuth';
import { Order } from '../../../types';
import { apiRequest } from '../../../services/api';
import { formatMoney, parseSafeNumber } from '../../../utils/format';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  Sparkles,
  User,
  AlertCircle,
  Eye,
  MapPin,
  Tag,
  ArrowRight,
  ShieldCheck,
  Send,
  X,
  FileText,
  Package,
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { currentTenant, tenantSlug } = useTenant();
  const { isTenantManager, isTenantAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Order for Detail / Fulfillment Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [courier, setCourier] = useState('Olva Courier');
  const [trackingCode, setTrackingCode] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    apiRequest<Order[]>('/api/admin/orders', {}, tenantSlug)
      .then((ords) => setOrders(ords || []))
      .catch((err) => console.error('Error fetching admin orders:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [tenantSlug]);

  const handleOpenModal = (ord: Order) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setCourier(ord.shipment?.courier || 'Olva Courier');
    setTrackingCode(ord.shipment?.trackingCode || `TRK-${Date.now().toString().slice(-6)}`);
    setStatusNote('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdatingStatus(true);

    try {
      await apiRequest(
        `/api/admin/orders/${selectedOrder.id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: newStatus,
            note: statusNote || `Actualizado por ${isTenantManager ? 'Gestor' : 'Admin'} de tienda`,
            courier: newStatus === 'SHIPPED' ? courier : undefined,
            trackingCode: newStatus === 'SHIPPED' ? trackingCode : undefined,
          }),
        },
        tenantSlug,
      );

      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar estado del pedido');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      Boolean(ord.shippingAddress?.addressLine?.toLowerCase().includes(search.toLowerCase()));

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'UNFULFILLED') return matchesSearch && (ord.fulfillmentStatus === 'UNFULFILLED' || ord.status === 'PROCESSING');
    if (statusFilter === 'SHIPPED') return matchesSearch && ord.status === 'SHIPPED';
    if (statusFilter === 'DELIVERED') return matchesSearch && ord.status === 'DELIVERED';
    return matchesSearch && ord.status === statusFilter;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> {currentTenant?.name || 'PeruCat - Tienda Oficial'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-secondary text-[10px] font-black uppercase">
              {isTenantManager ? 'Módulo de Operaciones & Logística' : 'Gestión Comercial & Despachos'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy mt-1">
            {isTenantManager ? 'Centro de Despachos & Logística' : 'Pedidos & Despachos de la Tienda'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isTenantManager
              ? 'Control de paquetes por preparar, asignación de courier y confirmación de entregas.'
              : 'Revisión de órdenes de compra, validación de pagos y seguimiento logístico integral.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-navy font-bold text-xs transition-colors"
          >
            Refrescar ({orders.length})
          </button>
        </div>
      </div>

      {/* Filters Bar with Quick Status Tabs */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3">
          {[
            { key: 'ALL', label: 'Todos los Pedidos' },
            { key: 'UNFULFILLED', label: 'Por Despachar (Pendientes)' },
            { key: 'SHIPPED', label: 'En Tránsito (Courier)' },
            { key: 'DELIVERED', label: 'Entregados' },
            { key: 'CANCELLED', label: 'Cancelados' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === tab.key
                  ? 'bg-grad-primary text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por # de orden o dirección..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs text-navy focus:outline-none focus:border-primary font-medium"
            />
          </div>

          <span className="text-xs font-semibold text-muted-foreground ml-auto">
            Mostrando {filteredOrders.length} de {orders.length} pedidos
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FC] border-b border-gray-100 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Nº de Orden</th>
                  <th className="py-4 px-6">Destino & Dirección</th>
                  <th className="py-4 px-6 text-center">Items</th>
                  <th className="py-4 px-6">Total</th>
                  <th className="py-4 px-6 text-center">Estado Pago</th>
                  <th className="py-4 px-6 text-center">Fulfillment</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="font-bold text-navy">No se registran pedidos en este filtro</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-4 px-6 font-bold text-navy font-mono">
                        #{ord.orderNumber}
                        <span className="block text-[10px] text-gray-400 font-normal">
                          {new Date(ord.createdAt).toLocaleDateString('es-PE')}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-navy truncate max-w-[200px]">
                            {ord.shippingAddress?.addressLine || 'Dirección Principal'}
                          </p>
                          <span className="text-gray-400 text-[11px]">
                            {ord.shippingAddress?.district || 'Lima'}, {ord.shippingAddress?.department || 'Perú'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-gray-100 text-navy font-bold text-[11px]">
                          {ord.items?.length || 1} productos
                        </span>
                      </td>

                      <td className="py-4 px-6 font-black text-navy text-sm">
                        {formatMoney(ord.total)}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.paymentStatus || 'PENDING'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                            ord.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'SHIPPED'
                              ? 'bg-blue-100 text-secondary'
                              : ord.status === 'PROCESSING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Truck className="w-3 h-3" />
                          <span>{ord.status}</span>
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenModal(ord)}
                          className="px-3 py-1.5 rounded-xl bg-grad-primary text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Gestionar</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Order Detail & Fast Fulfillment Workflow (2 Columns with Themed Icons) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-gray-100 overflow-hidden space-y-6">
            {/* Modal Header */}
            <div className="p-6 bg-navy text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-accent">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Pedido #{selectedOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-gray-300">
                    Fecha: {new Date(selectedOrder.createdAt).toLocaleDateString('es-PE')} • Estado actual: <strong className="text-accent">{selectedOrder.status}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 2 Columns */}
            <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
              {/* Left Column: Items & Shipping Address (7 Cols) */}
              <div className="md:col-span-7 space-y-4">
                <span className="font-bold text-navy text-xs uppercase tracking-wider block">
                  1. Detalle de Productos
                </span>

                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between bg-gray-50/50">
                      <div>
                        <p className="font-bold text-navy">{item.productName}</p>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {item.quantity} und • SKU: {item.productSku}
                        </span>
                      </div>
                      <span className="font-black text-navy">
                        {formatMoney(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="p-3.5 rounded-2xl bg-[#F7F8FC] border border-gray-100 space-y-1.5">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>{formatMoney(selectedOrder.subtotal)}</span>
                  </div>
                  {parseSafeNumber(selectedOrder.discountAmount) > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Descuento Aplicado:</span>
                      <span>- {formatMoney(selectedOrder.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Envío:</span>
                    <span>{formatMoney(selectedOrder.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-navy font-black text-sm pt-1 border-t border-gray-200">
                    <span>Total de la Orden:</span>
                    <span className="text-primary">{formatMoney(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Destination */}
                {selectedOrder.shippingAddress && (
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-navy">{selectedOrder.shippingAddress.addressLine}</p>
                      <p className="text-muted-foreground text-[11px]">
                        {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.province}, {selectedOrder.shippingAddress.department}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Status & Courier Workflow (5 Cols) */}
              <div className="md:col-span-5 bg-[#F7F8FC] p-4 rounded-2xl border border-gray-100 space-y-4">
                <span className="font-bold text-navy text-xs uppercase tracking-wider block">
                  2. Flujo de Despacho & Courier
                </span>

                <form onSubmit={handleUpdateStatus} className="space-y-3">
                  <div>
                    <label className="font-bold text-navy block mb-1">
                      Nuevo Estado de Orden
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-bold text-navy text-xs focus:border-primary focus:outline-none"
                    >
                      <option value="PENDING_PAYMENT">PENDING_PAYMENT (Pendiente Pago)</option>
                      <option value="PAID">PAID (Pagado)</option>
                      <option value="PROCESSING">PROCESSING (En Preparación)</option>
                      <option value="SHIPPED">SHIPPED (En Tránsito / Courier)</option>
                      <option value="DELIVERED">DELIVERED (Entregado)</option>
                      <option value="CANCELLED">CANCELLED (Cancelado)</option>
                    </select>
                  </div>

                  {newStatus === 'SHIPPED' && (
                    <>
                      <div>
                        <label className="font-bold text-navy block mb-1">Empresa Courier</label>
                        <select
                          value={courier}
                          onChange={(e) => setCourier(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-medium text-navy text-xs focus:border-primary focus:outline-none"
                        >
                          <option value="Olva Courier">Olva Courier Express</option>
                          <option value="Shalom">Shalom Logística</option>
                          <option value="Chazki">Chazki Same-Day</option>
                          <option value="Motorizado Propio">Motorizado Propio de Tienda</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-navy block mb-1">Código de Tracking</label>
                        <input
                          type="text"
                          value={trackingCode}
                          onChange={(e) => setTrackingCode(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-mono text-xs focus:border-primary focus:outline-none"
                          required
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="font-bold text-navy block mb-1">Nota Interna de Despacho</label>
                    <textarea
                      placeholder="Observaciones de empaquetado o entrega..."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-xs focus:border-primary focus:outline-none h-16"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updatingStatus}
                    className="w-full py-3 rounded-xl bg-grad-primary text-white font-extrabold text-xs shadow-glow-primary hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{updatingStatus ? 'Guardando...' : 'Actualizar Estado'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


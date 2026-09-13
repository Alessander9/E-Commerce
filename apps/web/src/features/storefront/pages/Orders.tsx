import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTenant } from '../../../hooks/useTenant';
import { useAuth } from '../../../hooks/useAuth';
import { Order } from '../../../types';
import { apiRequest } from '../../../services/api';
import { formatMoney, parseSafeNumber } from '../../../utils/format';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShoppingBag,
  CreditCard,
  Sparkles,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const Orders: React.FC = () => {
  const { tenantSlug, currentTenant } = useTenant();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    apiRequest<Order[]>('/api/store/orders', {}, tenantSlug)
      .then((data) => setOrders(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [tenantSlug, isAuthenticated]);

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(code);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-navy">Inicia sesión para ver tu portal de cliente</h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Accede a tus compras, facturación electrónica y seguimiento en tiempo real de tus envíos.
        </p>
        <Link to="/login" className="inline-block px-8 py-3.5 rounded-full bg-grad-primary text-white font-bold text-xs shadow-glow-primary hover:shadow-glow-secondary transition-all">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, ord) => sum + Number(ord.total), 0);
  const totalItemsPurchased = orders.reduce((sum, ord) => sum + ord.items.reduce((s, i) => s + i.quantity, 0), 0);
  const activeOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');

  const getStepStatus = (orderStatus: string, stepIndex: number) => {
    // 0: PENDING/CONFIRMED, 1: PROCESSING, 2: SHIPPED, 3: DELIVERED
    const normalizedStatus = orderStatus === 'PENDING_PAYMENT' ? 'PENDING' : orderStatus;
    const stages = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIdx = stages.indexOf(normalizedStatus);
    if (currentIdx >= stepIndex) return 'completed';
    if (currentIdx === stepIndex - 1) return 'active';
    return 'pending';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal del Cliente • {currentTenant?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy">
            Mis Pedidos & Compras
          </h1>
          <p className="text-xs text-muted-foreground">
            Bienvenido, <strong className="text-navy">{user?.firstName} {user?.lastName}</strong>. Aquí puedes monitorear tus envíos y revisar tus comprobantes.
          </p>
        </div>

        <Link
          to="/productos"
          className="px-6 py-3.5 rounded-2xl bg-grad-primary text-white font-extrabold text-xs flex items-center gap-2 shadow-glow-primary hover:shadow-glow-secondary transition-all transform hover:-translate-y-0.5 self-start md:self-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Explorar Catálogo</span>
        </Link>
      </div>

      {/* 2. Customer Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Pedidos Realizados</span>
            <p className="text-3xl font-black text-navy">{orders.length}</p>
            <span className="text-[11px] text-primary font-bold">{totalItemsPurchased} artículos adquiridos</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Total Invertido</span>
            <p className="text-3xl font-black text-navy">{formatMoney(totalSpent)}</p>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Pagos verificados
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Envíos en Tránsito</span>
            <p className="text-3xl font-black text-secondary">{activeOrders.length}</p>
            <span className="text-[11px] text-secondary font-bold flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> Despacho en camino
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-secondary-light flex items-center justify-center text-secondary">
            <Truck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-52 bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto text-gray-400">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-navy">No tienes compras registradas aún</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Explora nuestros productos orgánicos, superfoods y miel seleccionada con envíos a todo el país.
          </p>
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-grad-primary text-white font-bold text-xs shadow-glow-primary hover:opacity-95 transition-all"
          >
            <span>Ir a la Tienda</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isDelivered = order.status === 'DELIVERED';
            const isShipped = order.status === 'SHIPPED';
            const isProcessing = order.status === 'PROCESSING' || order.status === 'CONFIRMED';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm hover:shadow-card-hover transition-all space-y-6"
              >
                {/* Top Order Details */}
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-navy">#{order.orderNumber}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.paymentStatus === 'PAID' ? 'PAGADO' : 'PENDIENTE'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-secondary text-[10px] font-black uppercase">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Fecha: {new Date(order.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block font-semibold">Total de la Orden</span>
                    <p className="text-2xl font-black text-primary">{formatMoney(order.total)}</p>
                  </div>
                </div>

                {/* Interactive Shipping Stepper Timeline */}
                <div className="py-2">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    {/* Step 1: Confirmed */}
                    <div className="space-y-1.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center mx-auto shadow-sm">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-navy block text-[11px]">Confirmado</span>
                      <span className="text-[10px] text-muted-foreground block">Pago verificado</span>
                    </div>

                    {/* Step 2: Preparing */}
                    <div className="space-y-1.5">
                      <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center mx-auto shadow-sm ${
                        isProcessing || isShipped || isDelivered ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isProcessing || isShipped || isDelivered ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <span className="font-bold text-navy block text-[11px]">Empaque</span>
                      <span className="text-[10px] text-muted-foreground block">En almacén</span>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="space-y-1.5">
                      <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center mx-auto shadow-sm ${
                        isShipped || isDelivered ? 'bg-emerald-500 text-white' : isProcessing ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isShipped || isDelivered ? <Check className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                      </div>
                      <span className="font-bold text-navy block text-[11px]">En Camino</span>
                      <span className="text-[10px] text-muted-foreground block">Courier asignado</span>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="space-y-1.5">
                      <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center mx-auto shadow-sm ${
                        isDelivered ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isDelivered ? <Check className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <span className="font-bold text-navy block text-[11px]">Entregado</span>
                      <span className="text-[10px] text-muted-foreground block">Recepción final</span>
                    </div>
                  </div>
                </div>

                {/* Order Items Table */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Productos incluidos:
                  </span>
                  <div className="divide-y divide-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
                    {order.items.map((item) => (
                      <div key={item.id} className="p-3.5 flex items-center justify-between bg-gray-50/50 hover:bg-gray-50 text-xs transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-primary-light text-primary font-black text-xs flex items-center justify-center flex-shrink-0">
                            {item.quantity}x
                          </div>
                          <div>
                            <p className="font-bold text-navy">{item.productName}</p>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              SKU: {item.productSku} {item.variantName ? `• ${item.variantName}` : ''}
                            </span>
                          </div>
                        </div>
                        <div className="text-right font-black text-navy">
                          {formatMoney(item.subtotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Delivery Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {order.shippingAddress && (
                    <div className="p-4 rounded-2xl bg-[#F7F8FC] border border-gray-100 flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-xs space-y-0.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Dirección de Envío
                        </span>
                        <p className="font-bold text-navy">{order.shippingAddress.addressLine}</p>
                        <p className="text-muted-foreground text-[11px]">
                          {order.shippingAddress.district}, {order.shippingAddress.province}, {order.shippingAddress.department}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-[#F7F8FC] border border-gray-100 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <div className="text-xs space-y-0.5">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
                          Courier & Trazabilidad
                        </span>
                        <p className="font-bold text-navy">
                          {order.shipment?.courier || 'Olva Courier Express'}
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                          {order.shipment?.trackingCode ? (
                            <span className="font-mono font-bold text-navy">Guía: {order.shipment.trackingCode}</span>
                          ) : (
                            'Generando guía de remisión...'
                          )}
                        </p>
                      </div>
                    </div>

                    {order.shipment?.trackingCode && (
                      <button
                        type="button"
                        onClick={() => handleCopyTracking(order.shipment?.trackingCode || '')}
                        className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-navy font-bold text-[11px] flex items-center gap-1 shadow-sm hover:bg-gray-50 transition-colors"
                        title="Copiar número de guía"
                      >
                        {copiedTracking === order.shipment?.trackingCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};



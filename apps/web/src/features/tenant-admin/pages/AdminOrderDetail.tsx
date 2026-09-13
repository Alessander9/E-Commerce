import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  variant: {
    name: string;
    sku: string;
    product: { name: string; slug: string };
  };
}

interface OrderStatusHistory {
  id: string;
  status: string;
  notes?: string;
  createdAt: string;
}

interface Shipment {
  id: string;
  courierCode?: string;
  trackingCode?: string;
  status: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user: { name: string; email: string; phone?: string };
  items: OrderItem[];
  shipments: Shipment[];
  statusHistory: OrderStatusHistory[];
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CONFIRMED', label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
  { value: 'PROCESSING', label: 'Procesando', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'SHIPPED', label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  { value: 'DELIVERED', label: 'Entregado', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  { value: 'REFUNDED', label: 'Reembolsado', color: 'bg-gray-100 text-gray-800' },
];

const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

export const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    if (id) fetchOrder(id);
  }, [id]);

  const fetchOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setSelectedStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!order || selectedStatus === order.status) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: selectedStatus, notes: statusNotes || undefined }),
      });
      if (res.ok) {
        setShowStatusModal(false);
        setStatusNotes('');
        fetchOrder(order.id);
      } else {
        const err = await res.json();
        alert(err.message || 'Error al actualizar estado');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) =>
    STATUS_OPTIONS.find((s) => s.value === status)?.color || 'bg-gray-100 text-gray-800';

  const getLabel = (status: string) =>
    STATUS_OPTIONS.find((s) => s.value === status)?.label || status;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Pedido no encontrado</p>
        <button onClick={() => navigate('/admin/pedidos')} className="mt-4 text-blue-600 hover:underline">
          Volver a pedidos
        </button>
      </div>
    );
  }

  const allowedStatuses = STATUS_TRANSITIONS[order.status] || [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => navigate('/admin/pedidos')} className="text-sm text-gray-500 hover:text-gray-700 mb-2">
            ← Volver a pedidos
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Pedido #{order.orderNumber}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(order.createdAt).toLocaleString('es-PE')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {getLabel(order.status)}
          </span>
          {allowedStatuses.length > 0 && (
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Cambiar Estado
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Cliente</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-medium">{order.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{order.user.email}</p>
              </div>
              {order.user.phone && (
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{order.user.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Productos ({order.items.length})</h2>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 flex justify-between items-start">
                  <div>
                    <p className="font-medium">{item.variant.product.name}</p>
                    <p className="text-sm text-gray-500">{item.variant.name} — {item.variant.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">x{item.quantity}</p>
                    <p className="font-medium">S/ {item.subtotal.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          {order.shipments.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Envío</h2>
              {order.shipments.map((s) => (
                <div key={s.id} className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(s.status)}`}>
                    {getLabel(s.status)}
                  </span>
                  {s.courierCode && <span className="text-sm">{s.courierCode}</span>}
                  {s.trackingCode && <span className="text-sm font-mono">{s.trackingCode}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Summary & History */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Resumen</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>S/ {order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Descuento</span>
                <span className="text-red-600">-S/ {order.discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Envío</span>
                <span>S/ {order.shippingAmount.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>S/ {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Historial de Estados</h2>
            <div className="space-y-3">
              {order.statusHistory.map((h) => (
                <div key={h.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(h.status).split(' ')[0]}`} />
                  <div>
                    <p className="text-sm font-medium">{getLabel(h.status)}</p>
                    {h.notes && <p className="text-xs text-gray-500">{h.notes}</p>}
                    <p className="text-xs text-gray-400">
                      {new Date(h.createdAt).toLocaleString('es-PE')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Cambiar Estado del Pedido</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo Estado</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value={order.status}>{getLabel(order.status)} (actual)</option>
                  {allowedStatuses.map((s) => (
                    <option key={s} value={s}>{getLabel(s)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Ej: Cliente confirmó recepción..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={updating || selectedStatus === order.status}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

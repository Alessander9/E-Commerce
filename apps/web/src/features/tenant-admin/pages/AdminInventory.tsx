import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';

interface InventoryItem {
  id: string;
  quantity: number;
  reserved: number;
  minimumStock: number;
  product: { name: string; slug: string };
  variant: { name: string; sku: string };
}

interface Movement {
  id: string;
  type: string;
  quantity: number;
  reference?: string;
  notes?: string;
  createdAt: string;
  variant: { name: string; sku: string };
}

const MOVEMENT_TYPES = [
  { value: 'PURCHASE', label: 'Compra' },
  { value: 'RETURN', label: 'Devolución' },
  { value: 'ADJUSTMENT', label: 'Ajuste' },
  { value: 'MERMAS', label: 'Merma' },
];

export const AdminInventory: React.FC = () => {
  const { token } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'stock' | 'movements'>('stock');
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementForm, setMovementForm] = useState({
    variantId: '',
    type: 'PURCHASE',
    quantity: 1,
    reference: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [lowStockOnly, search]);

  useEffect(() => {
    if (tab === 'movements') fetchMovements();
  }, [tab]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (lowStockOnly) params.set('lowStock', 'true');
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/inventory?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInventory(data.items || data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const res = await fetch('/api/admin/inventory/movements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMovements(data.items || data);
      }
    } catch (error) {
      console.error('Failed to fetch movements:', error);
    }
  };

  const handleCreateMovement = async () => {
    if (!movementForm.variantId || movementForm.quantity <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/inventory/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          variantId: movementForm.variantId,
          type: movementForm.type,
          quantity: movementForm.quantity,
          reference: movementForm.reference || undefined,
          notes: movementForm.notes || undefined,
        }),
      });
      if (res.ok) {
        setShowMovementModal(false);
        setMovementForm({ variantId: '', type: 'PURCHASE', quantity: 1, reference: '', notes: '' });
        fetchInventory();
        if (tab === 'movements') fetchMovements();
      } else {
        const err = await res.json();
        alert(err.message || 'Error al registrar movimiento');
      }
    } catch (error) {
      console.error('Failed to create movement:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
        <button
          onClick={() => setShowMovementModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          + Registrar Movimiento
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        <button
          onClick={() => setTab('stock')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition ${
            tab === 'stock' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Niveles de Stock
        </button>
        <button
          onClick={() => setTab('movements')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition ${
            tab === 'movements' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Historial de Movimientos
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por SKU o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 max-w-md"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="rounded"
          />
          Solo bajo stock
        </label>
      </div>

      {/* Stock Levels Tab */}
      {tab === 'stock' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variante / SKU</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Disponible</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Reservado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Mínimo</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No se encontró inventario
                  </td>
                </tr>
              ) : (
                inventory.map((item) => {
                  const available = item.quantity - item.reserved;
                  const isLow = available <= item.minimumStock;
                  return (
                    <tr key={item.id} className={isLow ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.variant.name} <span className="text-gray-400">({item.variant.sku})</span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-medium">{available}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">{item.reserved}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">{item.minimumStock}</td>
                      <td className="px-6 py-4 text-center">
                        {isLow ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            Bajo Stock
                          </span>
                        ) : available === 0 ? (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                            Agotado
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Movements Tab */}
      {tab === 'movements' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referencia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No hay movimientos registrados
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id}>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(m.createdAt).toLocaleString('es-PE')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {m.variant.name} <span className="text-gray-400">({m.variant.sku})</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {MOVEMENT_TYPES.find((t) => t.value === m.type)?.label || m.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium">
                      <span className={m.type === 'PURCHASE' || m.type === 'RETURN' ? 'text-green-600' : 'text-red-600'}>
                        {m.type === 'PURCHASE' || m.type === 'RETURN' ? '+' : '-'}{m.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{m.reference || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{m.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Movement Modal */}
      {showMovementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Registrar Movimiento de Inventario</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID de Variante</label>
                <input
                  type="text"
                  value={movementForm.variantId}
                  onChange={(e) => setMovementForm({ ...movementForm, variantId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Pega el ID de la variante"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={movementForm.type}
                  onChange={(e) => setMovementForm({ ...movementForm, type: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {MOVEMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={movementForm.quantity}
                  onChange={(e) => setMovementForm({ ...movementForm, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
                <input
                  type="text"
                  value={movementForm.reference}
                  onChange={(e) => setMovementForm({ ...movementForm, reference: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Ej: #OC-001, proveedor X..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={movementForm.notes}
                  onChange={(e) => setMovementForm({ ...movementForm, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                  placeholder="Observaciones..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowMovementModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateMovement}
                  disabled={submitting || !movementForm.variantId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTenant } from '../../../hooks/useTenant';
import { useAuth } from '../../../hooks/useAuth';
import { apiRequest } from '../../../services/api';
import { formatMoney } from '../../../utils/format';
import { ImageUploadPicker } from '../../../components/common/ImageUploadPicker';
import {
  Boxes,
  Layers,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  User as UserIcon,
  FileText,
  DollarSign,
  Package,
  RefreshCw,
  Sparkles,
  Check,
  Zap,
  Info,
  Edit2,
  Tag,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Download,
  ArrowLeftRight,
  SlidersHorizontal,
  LayoutGrid,
  List,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  History,
  Truck,
  Building2,
  X,
  Filter,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Store,
  Upload,
  Globe,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  variantId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    brand?: string;
    weight?: number | null;
    description?: string | null;
    imageUrl?: string | null;
    category?: string;
  };
  sku: string;
  variantName: string;
  price: number;
  availableStock: number;
  reservedStock: number;
  totalStock: number;
  minimumStock: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  updatedAt: string;
  supplier?: string;
}

interface InventorySummary {
  totalVariants: number;
  totalStock: number;
  totalAvailable: number;
  totalReserved: number;
  lowStockCount: number;
  outOfStockCount: number;
}

interface Movement {
  id: string;
  variantId: string;
  product: {
    id?: string;
    name: string;
    slug?: string;
    brand?: string;
    imageUrl?: string | null;
  };
  sku: string;
  variantName: string;
  movementType: 'PURCHASE' | 'RETURN' | 'ADJUSTMENT' | 'MERMAS' | string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  createdBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

const MOVEMENT_TYPES_CONFIG: Record<string, { label: string; icon: string; color: string; sign: string; isPositive: boolean | null }> = {
  PURCHASE: {
    label: 'Compra / Ingreso',
    icon: '📥',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    sign: '+',
    isPositive: true,
  },
  RETURN: {
    label: 'Devolución Cliente',
    icon: '↩️',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    sign: '+',
    isPositive: true,
  },
  ADJUSTMENT: {
    label: 'Ajuste Manual',
    icon: '⚡',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    sign: '',
    isPositive: null,
  },
  MERMAS: {
    label: 'Merma / Baja',
    icon: '⚠️',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    sign: '-',
    isPositive: false,
  },
};

export const AdminInventory: React.FC = () => {
  const { currentTenant, tenantSlug } = useTenant();
  const { isTenantAdmin } = useAuth();

  // Primary Data State
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary>({
    totalVariants: 0,
    totalStock: 0,
    totalAvailable: 0,
    totalReserved: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [movementsLoading, setMovementsLoading] = useState(false);

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'stock' | 'movements' | 'alerts' | 'categories' | 'suppliers'>('stock');

  // View Mode: List vs Grid
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [stockLevelFilter, setStockLevelFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW' | 'OUT'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [brandFilter, setBrandFilter] = useState<string>('ALL');
  const [supplierFilter, setSupplierFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('ALL');

  // Columns visibility
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    sku: true,
    category: true,
    price: true,
    stock: true,
    quickAdjust: true,
    minStock: true,
    status: true,
    actions: true,
  });

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Floating Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Active 3-dots Dropdown item ID
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // --- MODALS ---
  // 1. Single Movement Modal
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [movementType, setMovementType] = useState<'PURCHASE' | 'RETURN' | 'ADJUSTMENT' | 'MERMAS'>('PURCHASE');
  const [movementQuantity, setMovementQuantity] = useState<number>(10);
  const [movementReference, setMovementReference] = useState('');
  const [movementNotes, setMovementNotes] = useState('');
  const [submittingMovement, setSubmittingMovement] = useState(false);

  // 2. Mass Movement Modal
  const [showMassMovementModal, setShowMassMovementModal] = useState(false);
  const [massDelta, setMassDelta] = useState<number>(10);
  const [massType, setMassType] = useState<'PURCHASE' | 'MERMAS' | 'ADJUSTMENT'>('PURCHASE');
  const [massReason, setMassReason] = useState('');
  const [submittingMass, setSubmittingMass] = useState(false);

  // 3. Edit Minimum Stock Modal & Inline
  const [editingMinStockItem, setEditingMinStockItem] = useState<InventoryItem | null>(null);
  const [newMinStockValue, setNewMinStockValue] = useState<number>(5);
  const [savingMinStock, setSavingMinStock] = useState(false);

  // 4. Product Detail Modal
  const [viewDetailItem, setViewDetailItem] = useState<InventoryItem | null>(null);

  // 5. Quick Create Product Modal
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdSlug, setNewProdSlug] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number | string>(35.0);
  const [newProdStock, setNewProdStock] = useState<number | string>(50);
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Accesorios');
  const [newProdImageUrl, setNewProdImageUrl] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [submittingNewProd, setSubmittingNewProd] = useState(false);

  // Fetch Inventory from DB
  useEffect(() => {
    fetchInventory();
  }, [tenantSlug]);

  // Fetch Movements when tab is active
  useEffect(() => {
    if (activeTab === 'movements') {
      fetchMovements();
    }
  }, [activeTab, tenantSlug]);

  // Close 3-dots menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenActionMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ items: InventoryItem[]; summary: InventorySummary }>(
        '/api/admin/inventory',
        {},
        tenantSlug,
      );
      if (data) {
        setInventory(data.items || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err: any) {
      console.error('Failed to fetch inventory:', err);
      showToast(err.message || 'Error al cargar inventario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    setMovementsLoading(true);
    try {
      const data = await apiRequest<Movement[]>(
        '/api/admin/inventory/movements?limit=100',
        {},
        tenantSlug,
      );
      setMovements(data || []);
    } catch (err: any) {
      console.error('Failed to fetch movements:', err);
      showToast(err.message || 'Error al cargar historial de movimientos', 'error');
    } finally {
      setMovementsLoading(false);
    }
  };

  // Quick Stock Adjustment (-5, +5, +20)
  const handleQuickStockAdjust = async (item: InventoryItem, delta: number) => {
    const currentStock = item.availableStock;
    const newStock = Math.max(0, currentStock + delta);

    // Optimistic UI update
    setInventory((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              availableStock: newStock,
              totalStock: newStock + i.reservedStock,
              isLowStock: newStock > 0 && newStock <= i.minimumStock,
              isOutOfStock: newStock === 0,
            }
          : i,
      ),
    );

    try {
      await apiRequest(
        '/api/admin/inventory/movements',
        {
          method: 'POST',
          body: JSON.stringify({
            variantId: item.variantId,
            movementType: 'ADJUSTMENT',
            quantity: delta,
            note: `Reposición rápida inventario (${delta > 0 ? '+' : ''}${delta})`,
          }),
        },
        tenantSlug,
      );
      showToast(`Stock de ${item.sku} actualizado a ${newStock} u.`);
      if (activeTab === 'movements') fetchMovements();
    } catch (err: any) {
      showToast(err.message || 'Error al ajustar stock', 'error');
      fetchInventory();
    }
  };

  // Open Movement Modal
  const openMovementModalWithVariant = (variantId?: string) => {
    if (variantId) {
      setSelectedVariantId(variantId);
    } else if (inventory.length > 0) {
      setSelectedVariantId(inventory[0].variantId);
    }
    setMovementType('PURCHASE');
    setMovementQuantity(10);
    setMovementReference('');
    setMovementNotes('');
    setShowMovementModal(true);
  };

  // Submit Single Movement
  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariantId || movementQuantity === 0) return;

    setSubmittingMovement(true);
    try {
      const payloadQuantity =
        movementType === 'MERMAS' ? -Math.abs(movementQuantity) : movementQuantity;

      await apiRequest(
        '/api/admin/inventory/movements',
        {
          method: 'POST',
          body: JSON.stringify({
            variantId: selectedVariantId,
            movementType,
            quantity: payloadQuantity,
            note: movementNotes
              ? `${movementReference ? `[Ref: ${movementReference}] ` : ''}${movementNotes}`
              : movementReference
              ? `Ref: ${movementReference}`
              : `Movimiento manual: ${movementType}`,
          }),
        },
        tenantSlug,
      );

      setShowMovementModal(false);
      showToast('Movimiento registrado en kárdex con éxito');
      fetchInventory();
      if (activeTab === 'movements') fetchMovements();
    } catch (err: any) {
      showToast(err.message || 'Error al registrar movimiento', 'error');
    } finally {
      setSubmittingMovement(false);
    }
  };

  // Submit Mass Movement
  const handleMassMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;

    setSubmittingMass(true);
    try {
      const selectedItems = inventory.filter((i) => selectedIds.includes(i.id));
      const delta = massType === 'MERMAS' ? -Math.abs(massDelta) : massDelta;

      // Execute batch updates
      const promises = selectedItems.map((item) =>
        apiRequest(
          '/api/admin/inventory/movements',
          {
            method: 'POST',
            body: JSON.stringify({
              variantId: item.variantId,
              movementType: massType,
              quantity: delta,
              note: `Movimiento masivo (${selectedItems.length} items): ${massReason || massType}`,
            }),
          },
          tenantSlug,
        ),
      );

      await Promise.all(promises);
      showToast(`Movimiento masivo aplicado a ${selectedItems.length} productos con éxito`);
      setShowMassMovementModal(false);
      setSelectedIds([]);
      fetchInventory();
      if (activeTab === 'movements') fetchMovements();
    } catch (err: any) {
      showToast(err.message || 'Error en movimiento masivo', 'error');
      fetchInventory();
    } finally {
      setSubmittingMass(false);
    }
  };

  // Save Minimum Stock
  const handleSaveMinStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMinStockItem) return;

    setSavingMinStock(true);
    try {
      await apiRequest(
        `/api/admin/inventory/variants/${editingMinStockItem.variantId}/minimum-stock`,
        {
          method: 'PATCH',
          body: JSON.stringify({ minimumStock: Number(newMinStockValue) }),
        },
        tenantSlug,
      );

      setInventory((prev) =>
        prev.map((i) =>
          i.id === editingMinStockItem.id
            ? {
                ...i,
                minimumStock: Number(newMinStockValue),
                isLowStock: i.availableStock > 0 && i.availableStock <= Number(newMinStockValue),
              }
            : i,
        ),
      );

      setEditingMinStockItem(null);
      showToast(`Stock mínimo actualizado a ${newMinStockValue} unidades`);
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar stock mínimo', 'error');
    } finally {
      setSavingMinStock(false);
    }
  };

  // Create Product Handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingNewProd(true);
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
            brand: newProdBrand || currentTenant?.name || 'PeruCat',
            category: newProdCategory,
            description: newProdDesc,
            imageUrl: newProdImageUrl,
            images: newProdImageUrl ? [{ url: newProdImageUrl, isPrimary: true }] : [],
            baseSku: newProdSku || `PC-${Date.now().toString().slice(-5)}`,
          }),
        },
        tenantSlug,
      );

      setShowCreateProductModal(false);
      setNewProdName('');
      setNewProdSlug('');
      setNewProdDesc('');
      setNewProdImageUrl('');
      setNewProdSku('');
      showToast('Nuevo producto registrado e inventario sincronizado');
      fetchInventory();
    } catch (err: any) {
      showToast(err.message || 'Error al crear producto', 'error');
    } finally {
      setSubmittingNewProd(false);
    }
  };

  // Export to CSV Function
  const exportToCSV = () => {
    const itemsToExport = selectedIds.length > 0
      ? inventory.filter((i) => selectedIds.includes(i.id))
      : inventory;

    const headers = ['SKU', 'Producto', 'Marca', 'Categoria', 'Precio_PEN', 'Stock_Disponible', 'Stock_Minimo', 'Estado'];
    const rows = itemsToExport.map((i) => [
      i.sku,
      `"${i.product.name.replace(/"/g, '""')}"`,
      `"${(i.product.brand || '').replace(/"/g, '""')}"`,
      `"${(i.product.category || '').replace(/"/g, '""')}"`,
      i.price.toFixed(2),
      i.availableStock,
      i.minimumStock,
      i.isOutOfStock ? 'Sin stock' : i.isLowStock ? 'Stock bajo' : 'En stock',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventario_${tenantSlug || 'perucat'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Inventario exportado (${itemsToExport.length} registros)`);
  };

  // Distinct Filter Options
  const categoriesList = useMemo(() => {
    const cats = new Set<string>();
    inventory.forEach((i) => {
      if (i.product.category) cats.add(i.product.category);
    });
    return Array.from(cats);
  }, [inventory]);

  const brandsList = useMemo(() => {
    const brands = new Set<string>();
    inventory.forEach((i) => {
      if (i.product.brand) brands.add(i.product.brand);
    });
    return Array.from(brands);
  }, [inventory]);

  // Filtered Inventory calculation
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      // 1. Search Query
      const searchLower = search.toLowerCase();
      const matchesSearch =
        search === '' ||
        item.product.name.toLowerCase().includes(searchLower) ||
        (item.product.brand && item.product.brand.toLowerCase().includes(searchLower)) ||
        item.sku.toLowerCase().includes(searchLower) ||
        (item.product.category && item.product.category.toLowerCase().includes(searchLower));

      // 2. Stock Level dropdown
      const matchesStockLevel =
        stockLevelFilter === 'ALL' ||
        (stockLevelFilter === 'IN_STOCK' && item.availableStock > item.minimumStock) ||
        (stockLevelFilter === 'LOW' && item.isLowStock) ||
        (stockLevelFilter === 'OUT' && item.isOutOfStock);

      // 3. Category Filter
      const matchesCategory =
        categoryFilter === 'ALL' ||
        item.product.category === categoryFilter;

      // 4. Brand Filter
      const matchesBrand =
        brandFilter === 'ALL' ||
        item.product.brand === brandFilter;

      // 5. Status Filter
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'IN_STOCK' && !item.isLowStock && !item.isOutOfStock) ||
        (statusFilter === 'LOW' && item.isLowStock) ||
        (statusFilter === 'OUT' && item.isOutOfStock);

      return matchesSearch && matchesStockLevel && matchesCategory && matchesBrand && matchesStatus;
    });
  }, [inventory, search, stockLevelFilter, categoryFilter, brandFilter, statusFilter]);

  // Alertas Filter (only low or out of stock)
  const alertItems = useMemo(() => {
    return inventory.filter((i) => i.isLowStock || i.isOutOfStock);
  }, [inventory]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage) || 1;
  const paginatedInventory = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInventory.slice(start, start + itemsPerPage);
  }, [filteredInventory, currentPage, itemsPerPage]);

  // Selection helpers
  const isAllSelected = paginatedInventory.length > 0 && paginatedInventory.every((i) => selectedIds.includes(i.id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedInventory.some((item) => item.id === id)));
    } else {
      const pageIds = paginatedInventory.map((i) => i.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearch('');
    setStockLevelFilter('ALL');
    setCategoryFilter('ALL');
    setBrandFilter('ALL');
    setSupplierFilter('ALL');
    setStatusFilter('ALL');
    setCurrentPage(1);
    showToast('Filtros restablecidos', 'info');
  };

  // Selected Variant item for modal
  const selectedVariantItem = inventory.find((i) => i.variantId === selectedVariantId);
  const previewResultStock =
    selectedVariantItem
      ? movementType === 'MERMAS'
        ? Math.max(0, selectedVariantItem.availableStock - Math.abs(movementQuantity))
        : selectedVariantItem.availableStock + movementQuantity
      : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* FLOATING ACTION TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold text-white ${
              toastMessage.type === 'error'
                ? 'bg-rose-600 border-rose-500'
                : toastMessage.type === 'info'
                ? 'bg-blue-600 border-blue-500'
                : 'bg-emerald-600 border-emerald-500'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-white" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-white" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* 1. HEADER SECTION */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Left: Icon & Titles */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shadow-xs flex-shrink-0">
            <Boxes className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Inventario & Stock
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Gestiona tus productos, controla el stock y mantén tu tienda siempre operativa.
            </p>
          </div>
        </div>

        {/* Right: Primary Action Buttons */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end flex-wrap">
          {/* Movimiento Masivo Button */}
          <button
            onClick={() => {
              if (selectedIds.length === 0) {
                showToast('Selecciona al menos 1 producto con los checkboxes para movimiento masivo', 'info');
                return;
              }
              setShowMassMovementModal(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
            <span>Movimiento Masivo {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</span>
          </button>

          {/* Exportar Button */}
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar</span>
          </button>

          {/* + Nuevo Producto Button */}
          <button
            onClick={() => {
              setNewProdBrand(currentTenant?.name || 'PeruCat');
              setShowCreateProductModal(true);
            }}
            className="px-5 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* 2. FOUR KPI CARDS (Matching Reference Image) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Total de Productos */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="w-13 h-13 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-500 block">Total de Productos</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {summary.totalVariants || inventory.length}
              </span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669]">
                <TrendingUp className="w-3 h-3" />
                +12%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
              Productos en catálogo
            </span>
          </div>
        </div>

        {/* Card 2: Stock Disponible */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="w-13 h-13 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center flex-shrink-0">
            <Boxes className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-500 block">Stock Disponible</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {summary.totalAvailable} <span className="text-sm font-bold text-slate-400">u.</span>
              </span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669]">
                <TrendingUp className="w-3 h-3" />
                5%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
              Unidades en almacén
            </span>
          </div>
        </div>

        {/* Card 3: Stock Bajo */}
        <div
          onClick={() => setActiveTab('alerts')}
          className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center justify-between gap-4 group hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-13 h-13 rounded-2xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-500 block">Stock Bajo</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {summary.lowStockCount}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Requieren reposición
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </div>

        {/* Card 4: Sin Stock */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="w-13 h-13 rounded-2xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center flex-shrink-0">
            <XCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-500 block">Sin Stock</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {summary.outOfStockCount}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
              Productos agotados
            </span>
          </div>
        </div>

      </div>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-5 sm:p-6 space-y-5">
        
        {/* Top Controls Row: Tabs & Search + Stock dropdown */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          
          {/* Main Tabs (SaaS Pills) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full lg:w-auto pb-1 lg:pb-0">
            
            {/* Tab 1: Niveles de Stock */}
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'stock'
                  ? 'bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Niveles de Stock ({inventory.length})</span>
            </button>

            {/* Tab 2: Kárdex & Movimientos */}
            <button
              onClick={() => setActiveTab('movements')}
              className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'movements'
                  ? 'bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Kárdex & Movimientos</span>
            </button>

            {/* Tab 3: Alertas */}
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Alertas ({summary.lowStockCount + summary.outOfStockCount})</span>
            </button>

            {/* Tab 4: Categorías */}
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Categorías</span>
            </button>

            {/* Tab 5: Proveedores */}
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'suppliers'
                  ? 'bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Proveedores</span>
            </button>

          </div>

          {/* Search & Stock Filter Right Controls */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            
            {/* Search Input */}
            <div className="relative flex-1 lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar producto, SKU o marca..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all font-medium"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Stock Level Selector */}
            <select
              value={stockLevelFilter}
              onChange={(e: any) => {
                setStockLevelFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 px-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:border-[#4F46E5] cursor-pointer"
            >
              <option value="ALL">Todo el Stock</option>
              <option value="IN_STOCK">Stock Saludable</option>
              <option value="LOW">Stock Bajo (&lt; mín)</option>
              <option value="OUT">Sin Stock (0)</option>
            </select>

          </div>

        </div>

        {/* Second Filter Bar (Advanced Filters & Table View Options) */}
        {activeTab === 'stock' && (
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
            
            {/* 4 Category / Brand / Supplier / Status Dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1 max-w-3xl">
              
              {/* Category */}
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">Todas las categorías</option>
                {categoriesList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Brand */}
              <select
                value={brandFilter}
                onChange={(e) => {
                  setBrandFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">Todas las marcas</option>
                {brandsList.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              {/* Supplier */}
              <select
                value={supplierFilter}
                onChange={(e) => {
                  setSupplierFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">Todos los proveedores</option>
                <option value="PeruCat">PeruCat Oficial</option>
                <option value="DistribuidoraPet">Distribuidora Pet</option>
                <option value="AndesVital">Andes Vital</option>
              </select>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">Todos los estados</option>
                <option value="IN_STOCK">En stock</option>
                <option value="LOW">Stock bajo</option>
                <option value="OUT">Sin stock</option>
              </select>

            </div>

            {/* Right: Clear Filters, Columns Selector & View Switcher */}
            <div className="flex items-center gap-2 justify-end">
              
              {/* Limpiar Filtros */}
              <button
                onClick={handleClearFilters}
                className="px-3.5 py-2 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Limpiar filtros</span>
              </button>

              {/* Column Selector Popover */}
              <div className="relative">
                <button
                  onClick={() => setShowColumnsMenu(!showColumnsMenu)}
                  className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Columnas</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showColumnsMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95 space-y-2 text-xs">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Columnas Visibles
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.sku}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, sku: e.target.checked })}
                        className="rounded text-[#4F46E5]"
                      />
                      <span>SKU Maestro</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.category}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, category: e.target.checked })}
                        className="rounded text-[#4F46E5]"
                      />
                      <span>Categoría</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.price}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, price: e.target.checked })}
                        className="rounded text-[#4F46E5]"
                      />
                      <span>Precio Unitario</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.quickAdjust}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, quickAdjust: e.target.checked })}
                        className="rounded text-[#4F46E5]"
                      />
                      <span>Reposición Rápida</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.minStock}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, minStock: e.target.checked })}
                        className="rounded text-[#4F46E5]"
                      />
                      <span>Stock Mínimo</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.status}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, status: e.target.checked })}
                        className="rounded text-[#4F46E5]"
                      />
                      <span>Estado</span>
                    </label>
                  </div>
                )}
              </div>

              {/* View Switcher: List vs Grid */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 px-2 hidden sm:inline">Vista</span>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-[#4F46E5] shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Vista de Lista"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#4F46E5] shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Vista de Cuadrícula"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* FLOATING MASS ACTION BAR (When checkboxes are selected) */}
        {selectedIds.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-[#1E1B4B] text-white flex flex-wrap items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center text-xs font-black">
                {selectedIds.length}
              </span>
              <span className="text-xs font-bold">
                {selectedIds.length} producto{selectedIds.length > 1 ? 's' : ''} seleccionado{selectedIds.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowMassMovementModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Ajustar Stock</span>
              </button>

              <button
                onClick={() => {
                  setMassType('PURCHASE');
                  setShowMassMovementModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>+ Registrar Entrada</span>
              </button>

              <button
                onClick={() => {
                  setMassType('MERMAS');
                  setShowMassMovementModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>- Registrar Salida</span>
              </button>

              <button
                onClick={exportToCSV}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar</span>
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                ✕ Deseleccionar
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: NIVELES DE STOCK (TABLE / GRID VIEW) */}
        {/* ========================================================================= */}
        {activeTab === 'stock' && (
          <div>
            {loading ? (
              <div className="space-y-3 py-8">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="py-14 text-center flex flex-col items-center justify-center space-y-2">
                <div className="w-14 h-14 rounded-3xl bg-slate-50 text-slate-300 flex items-center justify-center text-3xl shadow-inner">
                  📦
                </div>
                <h4 className="text-sm font-extrabold text-slate-800">
                  No se encontraron productos en el inventario
                </h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Prueba cambiando los términos de búsqueda o limpiando los filtros avanzados.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Limpiar Filtros
                </button>
              </div>
            ) : viewMode === 'list' ? (
              <>
                {/* ── 1. MOBILE INVENTORY CARD LIST (block md:hidden) ── */}
                <div className="block md:hidden space-y-3.5">
                  {paginatedInventory.map((item) => {
                    const brandName = item.product.brand || currentTenant?.name || 'PeruCat';
                    const categoryName = item.product.category || 'Accesorios';
                    const stock = item.availableStock;
                    const isLow = item.isLowStock;
                    const isOut = item.isOutOfStock;
                    const isChecked = selectedIds.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-3xl p-4 border transition-all shadow-xs space-y-3 ${
                          isChecked ? 'border-indigo-300 bg-indigo-50/20' : 'border-slate-100'
                        }`}
                      >
                        {/* Top: Checkbox, Product Image, Name, Brand & Status */}
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectRow(item.id)}
                            className="mt-1 rounded text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                          />

                          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-100 overflow-hidden flex-shrink-0 shadow-2xs flex items-center justify-center">
                            {item.product.imageUrl ? (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <Package className="w-6 h-6 text-slate-300" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-black text-slate-900 leading-snug line-clamp-2">
                              {item.product.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="text-[11px] font-bold text-slate-500">{brandName}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {categoryName}
                              </span>
                            </div>
                          </div>

                          <div>
                            {isOut ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200">
                                Sin stock
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                                Stock bajo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                En stock
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle: Stock Level & Quick Adjust Bar */}
                        <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between gap-2 flex-wrap bg-slate-50/70 p-2.5 rounded-2xl">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                              Disponible
                            </span>
                            <span className="text-base font-black text-slate-900">
                              {stock} <span className="text-xs text-slate-500 font-medium">unidades</span>
                            </span>
                          </div>

                          {/* Quick Adjust Buttons */}
                          <div className="inline-flex items-center bg-white border border-slate-200 rounded-xl p-0.5 gap-1 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleQuickStockAdjust(item, -5)}
                              disabled={stock <= 0}
                              className="px-2 py-1 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                              title="Reducir 5"
                            >
                              -5
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickStockAdjust(item, 5)}
                              className="px-2 py-1 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
                              title="Aumentar 5"
                            >
                              +5
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickStockAdjust(item, 20)}
                              className="px-2.5 py-1 rounded-lg text-xs font-black text-[#4F46E5] bg-indigo-50 hover:bg-indigo-100"
                              title="Aumentar 20"
                            >
                              +20
                            </button>
                          </div>
                        </div>

                        {/* Bottom Row: SKU, Price & Actions */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 font-mono text-[10px] font-bold text-slate-600">
                              {item.sku}
                            </span>
                            <span className="text-xs font-black text-slate-900">
                              {formatMoney(item.price)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMinStockItem(item);
                                setNewMinStockValue(item.minimumStock);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-1"
                              title="Editar stock mínimo"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Mín: {item.minimumStock}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSearch(item.sku);
                                setActiveTab('movements');
                              }}
                              className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] cursor-pointer"
                              title="Ver historial Kardex"
                            >
                              <History className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── 2. DESKTOP INVENTORY TABLE (hidden md:block) ── */}
                <div className="hidden md:block overflow-x-auto custom-scrollbar -mx-5 sm:-mx-6 px-5 sm:px-6 pb-2">
                  <table className="w-full text-left border-collapse min-w-[1050px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-3 w-10">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={toggleSelectAll}
                            className="rounded text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                          />
                        </th>
                        <th className="py-3 px-3 font-extrabold">PRODUCTO & MARCA</th>
                        {visibleColumns.sku && <th className="py-3 px-3 font-extrabold">SKU</th>}
                        {visibleColumns.category && <th className="py-3 px-3 font-extrabold">CATEGORÍA</th>}
                        {visibleColumns.price && <th className="py-3 px-3 font-extrabold">PRECIO UNITARIO</th>}
                        {visibleColumns.stock && <th className="py-3 px-3 font-extrabold">STOCK DISPONIBLE</th>}
                        {visibleColumns.quickAdjust && <th className="py-3 px-3 font-extrabold text-center">REPOSICIÓN RÁPIDA</th>}
                        {visibleColumns.minStock && <th className="py-3 px-3 font-extrabold text-center">STOCK MÍNIMO</th>}
                        {visibleColumns.status && <th className="py-3 px-3 font-extrabold">ESTADO</th>}
                        {visibleColumns.actions && <th className="py-3 px-3 font-extrabold text-right">ACCIONES</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {paginatedInventory.map((item) => {
                        const brandName = item.product.brand || currentTenant?.name || 'PeruCat';
                        const categoryName = item.product.category || 'Accesorios';
                        const stock = item.availableStock;
                        const isLow = item.isLowStock;
                        const isOut = item.isOutOfStock;
                        const isChecked = selectedIds.includes(item.id);

                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-slate-50/70 transition-colors group ${
                              isChecked ? 'bg-indigo-50/30' : ''
                            }`}
                          >
                            {/* 0. Checkbox */}
                            <td className="py-3.5 px-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectRow(item.id)}
                                className="rounded text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                              />
                            </td>

                            {/* 1. PRODUCTO & MARCA */}
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-100 overflow-hidden flex-shrink-0 shadow-2xs flex items-center justify-center">
                                  {item.product.imageUrl ? (
                                    <img
                                      src={item.product.imageUrl}
                                      alt={item.product.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <Package className="w-5 h-5 text-slate-300" />
                                  )}
                                </div>

                                <div className="min-w-0 max-w-[190px] sm:max-w-[220px]">
                                  <p className="text-xs font-black text-slate-900 line-clamp-2 break-words leading-snug" title={item.product.name}>
                                    {item.product.name}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[11px] font-medium text-slate-500 truncate">
                                      {brandName}
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-[11px] font-medium text-slate-400 truncate">
                                      {item.variantName || 'Estándar'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* 2. SKU */}
                            {visibleColumns.sku && (
                              <td className="py-3.5 px-3">
                                <span className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200/90 font-mono text-[11px] font-bold text-slate-600 shadow-2xs">
                                  {item.sku}
                                </span>
                              </td>
                            )}

                            {/* 3. CATEGORÍA */}
                            {visibleColumns.category && (
                              <td className="py-3.5 px-3">
                                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                                  {categoryName}
                                </span>
                              </td>
                            )}

                            {/* 4. PRECIO UNITARIO */}
                            {visibleColumns.price && (
                              <td className="py-3.5 px-3">
                                <span className="font-black text-slate-900 text-xs sm:text-sm">
                                  {formatMoney(item.price)}
                                </span>
                              </td>
                            )}

                            {/* 5. STOCK DISPONIBLE */}
                            {visibleColumns.stock && (
                              <td className="py-3.5 px-3">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      isOut
                                        ? 'bg-[#EF4444]'
                                        : isLow
                                        ? 'bg-[#F59E0B]'
                                        : 'bg-[#10B981]'
                                    }`}
                                  ></span>
                                  <span className={isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-800'}>
                                    {stock} u.
                                  </span>
                                </span>
                              </td>
                            )}

                            {/* 6. REPOSICIÓN RÁPIDA ([-5] [Stock] [+5] [+20]) */}
                            {visibleColumns.quickAdjust && (
                              <td className="py-3.5 px-3 text-center">
                                <div className="inline-flex items-center bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-0.5 gap-1 shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStockAdjust(item, -5)}
                                    disabled={stock <= 0}
                                    title="Disminuir 5 unidades"
                                    className="px-2 py-0.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    -5
                                  </button>

                                  <span className="px-2 text-xs font-extrabold text-slate-800 font-mono min-w-[28px] text-center">
                                    {stock}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => handleQuickStockAdjust(item, 5)}
                                    title="Añadir 5 unidades"
                                    className="px-2 py-0.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                                  >
                                    +5
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleQuickStockAdjust(item, 20)}
                                    title="Añadir 20 unidades"
                                    className="px-2.5 py-0.5 rounded-xl text-xs font-extrabold text-[#4F46E5] bg-[#EEF2FF] hover:bg-[#E0E7FF] transition-colors cursor-pointer"
                                  >
                                    +20
                                  </button>
                                </div>
                              </td>
                            )}

                            {/* 7. STOCK MÍNIMO */}
                            {visibleColumns.minStock && (
                              <td className="py-3.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingMinStockItem(item);
                                    setNewMinStockValue(item.minimumStock);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                                  title="Editar stock mínimo"
                                >
                                  <span>{item.minimumStock} u.</span>
                                  <Pencil className="w-3 h-3 text-slate-400" />
                                </button>
                              </td>
                            )}

                            {/* 8. ESTADO */}
                            {visibleColumns.status && (
                              <td className="py-3.5 px-3">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                    isOut
                                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                      : isLow
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                  />
                                  <span>{isOut ? 'Agotado' : isLow ? 'Stock Bajo' : 'Disponible'}</span>
                                </span>
                              </td>
                            )}

                            {/* 9. ACCIONES */}
                            {visibleColumns.actions && (
                              <td className="py-3.5 px-3 text-right">
                                <div className="flex items-center gap-1.5 justify-end relative">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSearch(item.sku);
                                      setActiveTab('movements');
                                    }}
                                    className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] transition-colors cursor-pointer"
                                    title="Ver historial Kardex"
                                  >
                                    <History className="w-4 h-4" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(openActionMenuId === item.id ? null : item.id);
                                    }}
                                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>

                                  {openActionMenuId === item.id && (
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 text-xs text-left animate-in fade-in zoom-in-95 duration-100">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingMinStockItem(item);
                                          setNewMinStockValue(item.minimumStock);
                                          setOpenActionMenuId(null);
                                        }}
                                        className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                                      >
                                        <Pencil className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Editar stock mínimo</span>
                                      </button>

                                      <div className="border-t border-slate-100 my-1"></div>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          showToast(`Producto ${item.sku} archivado/desactivado`);
                                          setOpenActionMenuId(null);
                                        }}
                                        className="w-full px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                        <span>Desactivar producto</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            )}

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              /* GRID VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
                {paginatedInventory.map((item) => {
                  const stock = item.availableStock;
                  const isLow = item.isLowStock;
                  const isOut = item.isOutOfStock;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="w-full aspect-square rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center relative">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-12 h-12 text-slate-300" />
                          )}
                          <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs font-mono">
                            {item.sku}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-[#4F46E5] uppercase tracking-wider block">
                            {item.product.brand || 'PeruCat'}
                          </span>
                          <h4 className="text-xs font-extrabold text-slate-900 line-clamp-2 break-words leading-snug" title={item.product.name}>
                            {item.product.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Categoría: <strong className="text-slate-600">{item.product.category || 'Accesorios'}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-50 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900">
                            {formatMoney(item.price)}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              isOut
                                ? 'bg-rose-50 text-rose-600'
                                : isLow
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            <span>●</span> {stock} u.
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-1 pt-1">
                          <button
                            onClick={() => handleQuickStockAdjust(item, -5)}
                            className="flex-1 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-600 cursor-pointer"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleQuickStockAdjust(item, 5)}
                            className="flex-1 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-600 cursor-pointer"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleQuickStockAdjust(item, 20)}
                            className="flex-1 py-1 rounded-xl bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[11px] font-extrabold text-[#4F46E5] cursor-pointer"
                          >
                            +20
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PAGINATION FOOTER (Pixel-perfect matching reference image) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100 text-xs">
              
              {/* Left: Total shown */}
              <div className="text-slate-500 font-medium">
                Mostrando {filteredInventory.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{' '}
                {Math.min(currentPage * itemsPerPage, filteredInventory.length)} de {filteredInventory.length} productos
              </div>

              {/* Right: Rows per page & Page numbers */}
              <div className="flex items-center gap-4">
                
                {/* Filas por página dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Filas por página</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="py-1 px-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 cursor-pointer focus:outline-none"
                  >
                    <option value="8">8</option>
                    <option value="12">12</option>
                    <option value="24">24</option>
                    <option value="50">50</option>
                  </select>
                </div>

                {/* Page Navigation Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: KÁRDEX & MOVIMIENTOS */}
        {/* ========================================================================= */}
        {activeTab === 'movements' && (
          <div className="space-y-4">
            
            {/* Movements Search & Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Filtrar por tipo:</span>
                <select
                  value={movementTypeFilter}
                  onChange={(e) => setMovementTypeFilter(e.target.value)}
                  className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Todos los tipos</option>
                  <option value="PURCHASE">📥 Compras / Ingresos</option>
                  <option value="RETURN">↩️ Devoluciones</option>
                  <option value="ADJUSTMENT">⚡ Ajustes Manuales</option>
                  <option value="MERMAS">⚠️ Mermas / Bajas</option>
                </select>
              </div>

              <button
                onClick={fetchMovements}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${movementsLoading ? 'animate-spin' : ''}`} />
                <span>Refrescar Kárdex</span>
              </button>
            </div>

            {movementsLoading ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="h-14 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : movements.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
                <div className="w-14 h-14 rounded-3xl bg-slate-50 text-slate-300 flex items-center justify-center text-3xl shadow-inner">
                  📄
                </div>
                <h4 className="text-sm font-extrabold text-slate-800">
                  No hay movimientos registrados en el Kárdex
                </h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Cada entrada, salida o ajuste manual quedará registrado aquí con auditoría completa.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-3 font-extrabold">FECHA & HORA</th>
                      <th className="py-3 px-3 font-extrabold">PRODUCTO & SKU</th>
                      <th className="py-3 px-3 font-extrabold">TIPO DE MOVIMIENTO</th>
                      <th className="py-3 px-3 font-extrabold text-center">CANTIDAD</th>
                      <th className="py-3 px-3 font-extrabold text-center">BALANCE (ANTES → DESPUÉS)</th>
                      <th className="py-3 px-3 font-extrabold">RESPONSABLE</th>
                      <th className="py-3 px-3 font-extrabold">MOTIVO / NOTA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {movements
                      .filter((m) => movementTypeFilter === 'ALL' || m.movementType === movementTypeFilter)
                      .map((m) => {
                        const config = MOVEMENT_TYPES_CONFIG[m.movementType] || {
                          label: m.movementType,
                          icon: '📦',
                          color: 'bg-slate-100 text-slate-700 border-slate-200',
                          sign: '',
                        };

                        return (
                          <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* 1. Fecha */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className="font-mono text-slate-700 font-bold block">
                                {new Date(m.createdAt).toLocaleDateString('es-PE', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(m.createdAt).toLocaleTimeString('es-PE', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </td>

                            {/* 2. Producto */}
                            <td className="py-3 px-3">
                              <p className="font-extrabold text-slate-900 line-clamp-2 break-words leading-snug max-w-[190px]" title={m.product.name}>
                                {m.product.name}
                              </p>
                              <span className="font-mono text-[10px] font-bold text-[#4F46E5]">
                                {m.sku}
                              </span>
                            </td>

                            {/* 3. Tipo */}
                            <td className="py-3 px-3">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${config.color}`}
                              >
                                <span>{config.icon}</span>
                                <span>{config.label}</span>
                              </span>
                            </td>

                            {/* 4. Cantidad */}
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`font-black text-xs ${
                                  m.quantity > 0
                                    ? 'text-emerald-600'
                                    : m.quantity < 0
                                    ? 'text-rose-600'
                                    : 'text-slate-800'
                                }`}
                              >
                                {m.quantity > 0 ? `+${m.quantity}` : m.quantity} u.
                              </span>
                            </td>

                            {/* 5. Balance */}
                            <td className="py-3 px-3 text-center font-mono">
                              <span className="text-slate-400">{m.stockBefore} u.</span>
                              <span className="text-slate-300 mx-1.5">→</span>
                              <span className="font-black text-slate-900">{m.stockAfter} u.</span>
                            </td>

                            {/* 6. Responsable */}
                            <td className="py-3 px-3">
                              {m.createdBy ? (
                                <span className="font-bold text-slate-700">
                                  {m.createdBy.firstName} {m.createdBy.lastName}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic font-medium">Sistema Automático</span>
                              )}
                            </td>

                            {/* 7. Nota */}
                            <td className="py-3 px-3 max-w-[220px]">
                              <p className="text-[11px] text-slate-600 truncate" title={m.note || ''}>
                                {m.note || 'Sin nota'}
                              </p>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ALERTAS DE REPOSICIÓN */}
        {/* ========================================================================= */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-amber-900">
                    Centro de Alertas de Stock ({alertItems.length} productos)
                  </h4>
                  <p className="text-[11px] text-amber-700">
                    Productos que han alcanzado o están por debajo de su umbral de stock mínimo.
                  </p>
                </div>
              </div>
            </div>

            {alertItems.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
                <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-3xl shadow-inner">
                  🎉
                </div>
                <h4 className="text-sm font-extrabold text-slate-800">
                  ¡Excelente! No hay alertas de stock bajo ni agotado
                </h4>
                <p className="text-xs text-slate-400">
                  Todos tus productos cuentan con existencias por encima de sus límites de seguridad.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alertItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] font-bold text-[#4F46E5] block">{item.sku}</span>
                        <h4 className="text-xs font-black text-slate-900 line-clamp-2 break-words leading-snug" title={item.product.name}>{item.product.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                          <span className="text-slate-500">Actual: <strong className={item.availableStock === 0 ? 'text-rose-600' : 'text-amber-600'}>{item.availableStock} u.</strong></span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">Mínimo: <strong className="text-slate-800">{item.minimumStock} u.</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleQuickStockAdjust(item, 10)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors cursor-pointer"
                        title="Añadir 10 unidades"
                      >
                        +10 u.
                      </button>
                      <button
                        onClick={() => handleQuickStockAdjust(item, 25)}
                        className="px-3 py-1.5 rounded-xl bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] font-extrabold text-xs transition-colors cursor-pointer"
                        title="Añadir 25 unidades"
                      >
                        +25 u.
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CATEGORÍAS */}
        {/* ========================================================================= */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categoriesList.map((category) => {
              const catItems = inventory.filter((i) => i.product.category === category);
              const catStock = catItems.reduce((s, i) => s + i.availableStock, 0);
              const catValuation = catItems.reduce((s, i) => s + i.availableStock * i.price, 0);

              return (
                <div key={category} className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-white text-[#4F46E5] flex items-center justify-center shadow-xs font-black">
                      <Tag className="w-5 h-5" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white text-slate-700 text-xs font-extrabold border border-slate-100">
                      {catItems.length} productos
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900">{category}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Categoría comercial de tienda</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Stock Total</span>
                      <strong className="text-slate-800 font-black">{catStock} u.</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Valorización</span>
                      <strong className="text-emerald-600 font-black">{formatMoney(catValuation)}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCategoryFilter(category);
                      setActiveTab('stock');
                    }}
                    className="w-full py-2 rounded-xl bg-white hover:bg-indigo-50 hover:text-[#4F46E5] border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Ver Productos en Stock
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PROVEEDORES */}
        {/* ========================================================================= */}
        {activeTab === 'suppliers' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { name: 'PeruCat Oficial', contact: 'operaciones@perucat.pe', lead: '24 - 48 hrs', status: 'Activo' },
              { name: 'Distribuidora Pet Sur', contact: 'ventas@petsur.pe', lead: '3 a 5 días', status: 'Activo' },
              { name: 'Andes Vital Alimentos', contact: 'contacto@andesvital.pe', lead: '48 hrs', status: 'Activo' },
            ].map((sup) => (
              <div key={sup.name} className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-xs">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    {sup.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900">{sup.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{sup.contact}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Tiempo de reposición:</span>
                  <span className="font-bold text-slate-800">{sup.lead}</span>
                </div>

                <button
                  onClick={() => openMovementModalWithVariant()}
                  className="w-full py-2 rounded-xl bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Registrar Orden de Compra
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTRAR MOVIMIENTO DE STOCK */}
      {/* ========================================================================= */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 border border-slate-100">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold shadow-2xs">
                  <ArrowLeftRight className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-[#4F46E5] uppercase tracking-wider">
                    Kárdex & Movimientos
                  </span>
                  <h3 className="text-lg font-black text-slate-900">Registrar Movimiento</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMovementModal(false)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMovement} className="space-y-4 text-xs">
              
              {/* Product Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Producto & Variante *</label>
                <div className="relative">
                  <Package className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-[#4F46E5] cursor-pointer shadow-2xs"
                    required
                  >
                    {inventory.map((i) => (
                      <option key={i.variantId} value={i.variantId}>
                        {i.product.name} ({i.sku}) — Stock actual: {i.availableStock} u.
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Movement Type */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Tipo de Movimiento *</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setMovementType('PURCHASE')}
                    className={`p-3 rounded-2xl font-bold text-left flex items-center gap-2 border cursor-pointer transition-all ${
                      movementType === 'PURCHASE'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">📥</span>
                    <span>Compra / Ingreso</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMovementType('RETURN')}
                    className={`p-3 rounded-2xl font-bold text-left flex items-center gap-2 border cursor-pointer transition-all ${
                      movementType === 'RETURN'
                        ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">↩️</span>
                    <span>Devolución</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMovementType('ADJUSTMENT')}
                    className={`p-3 rounded-2xl font-bold text-left flex items-center gap-2 border cursor-pointer transition-all ${
                      movementType === 'ADJUSTMENT'
                        ? 'bg-purple-50 border-purple-300 text-purple-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">⚡</span>
                    <span>Ajuste Manual</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMovementType('MERMAS')}
                    className={`p-3 rounded-2xl font-bold text-left flex items-center gap-2 border cursor-pointer transition-all ${
                      movementType === 'MERMAS'
                        ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">⚠️</span>
                    <span>Merma / Baja</span>
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Cantidad de Unidades *</label>
                <div className="relative">
                  <Boxes className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    value={movementQuantity}
                    onChange={(e) => setMovementQuantity(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-black text-slate-900 text-sm focus:outline-none focus:border-[#4F46E5] shadow-2xs"
                    required
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              {selectedVariantItem && (
                <div className="p-3.5 rounded-2xl bg-[#EEF2FF]/60 border border-[#C7D2FE]/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-[#4F46E5] uppercase block">Impacto en Almacén</span>
                    <span className="font-bold text-slate-700">Stock Actual: {selectedVariantItem.availableStock} u.</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#4F46E5] uppercase block">Stock Resultante</span>
                    <span className="font-black text-[#4F46E5] text-base">{previewResultStock} u.</span>
                  </div>
                </div>
              )}

              {/* Reference & Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Referencia o Motivo del Ajuste</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ej. Factura F001-4522 o Conteo físico fin de mes"
                    value={movementReference}
                    onChange={(e) => setMovementReference(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:border-[#4F46E5] shadow-2xs"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingMovement}
                  className="px-6 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {submittingMovement ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Registrar en Kárdex</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MOVIMIENTO MASIVO */}
      {/* ========================================================================= */}
      {showMassMovementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 border border-slate-100">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-[#4F46E5] uppercase tracking-wider">
                    Operación Masiva
                  </span>
                  <h3 className="text-lg font-black text-slate-900">Movimiento Masivo</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMassMovementModal(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Aplicando cambios a <strong className="text-slate-800">{selectedIds.length} productos seleccionados</strong> en lote.
            </p>

            <form onSubmit={handleMassMovementSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Tipo de Operación *</label>
                <div className="relative">
                  <ArrowLeftRight className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={massType}
                    onChange={(e: any) => setMassType(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-bold text-slate-800 cursor-pointer shadow-2xs focus:outline-none focus:border-[#4F46E5]"
                  >
                    <option value="PURCHASE">📥 Entrada / Compra Masiva (+)</option>
                    <option value="MERMAS">⚠️ Salida / Merma Masiva (-)</option>
                    <option value="ADJUSTMENT">⚡ Ajuste de Unidades (+/-)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Cantidad por Producto *</label>
                <div className="relative">
                  <Boxes className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    value={massDelta}
                    onChange={(e) => setMassDelta(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-black text-slate-900 text-sm shadow-2xs focus:outline-none focus:border-[#4F46E5]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Motivo o Referencia</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ej. Ingreso lote importación"
                    value={massReason}
                    onChange={(e) => setMassReason(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-medium shadow-2xs focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMassMovementModal(false)}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingMass}
                  className="px-6 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {submittingMass ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Aplicando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Aplicar a {selectedIds.length} Items</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDITAR STOCK MÍNIMO */}
      {/* ========================================================================= */}
      {editingMinStockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-100">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900">Editar Stock Mínimo</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMinStockItem(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <p className="font-bold text-slate-900 truncate">{editingMinStockItem.product.name}</p>
              <p className="font-mono text-[11px] text-slate-400 mt-0.5">SKU: {editingMinStockItem.sku}</p>
            </div>

            <form onSubmit={handleSaveMinStock} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Umbral de Alerta (Unidades Mínimas) *
                </label>
                <div className="relative">
                  <Boxes className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    value={newMinStockValue}
                    onChange={(e) => setNewMinStockValue(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-black text-slate-900 text-sm focus:border-[#4F46E5] focus:outline-none shadow-2xs"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  El sistema emitirá una alerta si el stock baja de esta cantidad.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMinStockItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingMinStock}
                  className="px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black shadow-md cursor-pointer"
                >
                  {savingMinStock ? 'Guardando...' : 'Guardar Umbral'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: VER DETALLE DEL PRODUCTO */}
      {/* ========================================================================= */}
      {viewDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Eye className="w-5 h-5 text-[#4F46E5]" />
                <h3 className="text-lg font-black text-slate-900">Ficha de Inventario</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewDetailItem(null)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 text-xs">
              
              <div className="sm:col-span-5 space-y-2">
                <div className="w-full aspect-square rounded-2xl bg-slate-100 border border-slate-100 overflow-hidden flex items-center justify-center">
                  {viewDetailItem.product.imageUrl ? (
                    <img src={viewDetailItem.product.imageUrl} alt={viewDetailItem.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-16 h-16 text-slate-300" />
                  )}
                </div>
              </div>

              <div className="sm:col-span-7 space-y-3">
                <div>
                  <span className="text-[10px] font-extrabold text-[#4F46E5] uppercase tracking-wider block">
                    {viewDetailItem.product.brand || 'PeruCat'}
                  </span>
                  <h2 className="text-base font-black text-slate-900">{viewDetailItem.product.name}</h2>
                  <p className="font-mono text-slate-500 font-bold text-xs mt-0.5">SKU: {viewDetailItem.sku}</p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Precio Unitario</span>
                    <span className="text-base font-black text-emerald-700">{formatMoney(viewDetailItem.price)}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-800 uppercase block">Stock Disponible</span>
                    <span className="text-base font-black text-blue-700">{viewDetailItem.availableStock} u.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Categoría:</span>
                    <span className="font-bold text-slate-800">{viewDetailItem.product.category || 'Accesorios'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Stock Mínimo de Alerta:</span>
                    <span className="font-bold text-slate-800">{viewDetailItem.minimumStock} u.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Stock Reservado:</span>
                    <span className="font-bold text-slate-800">{viewDetailItem.reservedStock} u.</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewDetailItem(null)}
                className="px-6 py-2 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: REGISTRAR NUEVO PRODUCTO */}
      {/* ========================================================================= */}
      {showCreateProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 border border-slate-100 max-h-[92vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold shadow-2xs">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-[#4F46E5] uppercase tracking-wider">
                    Catálogo & Almacén
                  </span>
                  <h3 className="text-lg font-black text-slate-900">Registrar Nuevo Producto</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateProductModal(false)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Nombre del Producto *</label>
                  <div className="relative">
                    <Package className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ej. Maca Negra Andina en Polvo"
                      value={newProdName}
                      onChange={(e) => {
                        setNewProdName(e.target.value);
                        setNewProdSlug(e.target.value.toLowerCase().trim().replace(/[\s\W-]+/g, '-'));
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-[#4F46E5] shadow-2xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Marca / Fabricante</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={currentTenant?.name || 'Marca'}
                      value={newProdBrand}
                      onChange={(e) => setNewProdBrand(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-[#4F46E5] shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Categoría</label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-bold focus:outline-none focus:border-[#4F46E5] shadow-2xs cursor-pointer"
                    >
                      <option value="Accesorios">Accesorios</option>
                      <option value="Higiene">Higiene & Arenas</option>
                      <option value="Alimentación">Alimentación</option>
                      <option value="Frutos Secos">Frutos Secos</option>
                      <option value="Superalimentos">Superalimentos</option>
                      <option value="Endulzantes">Endulzantes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Código SKU Maestro</label>
                  <div className="relative">
                    <Boxes className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="PC-SKU-001"
                      value={newProdSku}
                      onChange={(e) => setNewProdSku(e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-mono font-bold focus:outline-none focus:border-[#4F46E5] shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Precio Unitario (PEN S/) *</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      placeholder="35.00"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-black focus:outline-none focus:border-[#4F46E5] shadow-2xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Stock Inicial *</label>
                  <div className="relative">
                    <Boxes className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="0"
                      placeholder="50"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-bold focus:outline-none focus:border-[#4F46E5] shadow-2xs"
                      required
                    />
                  </div>
                </div>

              </div>

              <ImageUploadPicker
                value={newProdImageUrl}
                onChange={setNewProdImageUrl}
                label="Imagen Principal del Producto"
                placeholder="https://... o sube un archivo local"
              />

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Descripción</label>
                <div className="relative">
                  <textarea
                    placeholder="Detalles del producto..."
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none h-20 shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateProductModal(false)}
                  className="px-6 py-2.5 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingNewProd}
                  className="px-7 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black shadow-md cursor-pointer flex items-center gap-2"
                >
                  {submittingNewProd ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Guardar Producto</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

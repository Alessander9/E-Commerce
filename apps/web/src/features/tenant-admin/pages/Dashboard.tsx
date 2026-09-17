import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTenant } from '../../../hooks/useTenant';
import { useAuth } from '../../../hooks/useAuth';
import { Product, Order, Coupon } from '../../../types';
import { apiRequest } from '../../../services/api';
import { parseSafeNumber, formatMoney } from '../../../utils/format';
import { ImageUploadPicker } from '../../../components/common/ImageUploadPicker';
import {
  ShoppingBag,
  Package,
  AlertTriangle,
  Plus,
  Tag,
  ArrowRight,
  Boxes,
  Calendar,
  ChevronDown,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  BarChart2,
  Zap,
  Layers,
  ChevronRight,
  Image as ImageIcon,
  Sparkles,
  DollarSign,
  Globe,
  Star,
  Check,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  Power,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentTenant, tenantSlug } = useTenant();
  const { isTenantAdmin, canAccessCoupons } = useAuth();
  const navigate = useNavigate();

  // Pure Database State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Table filters & search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');

  // Dynamic Date Range Picker
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRangeLabel, setDateRangeLabel] = useState(
    `01 Ene ${currentYear} - 31 Dic ${currentYear}`
  );
  const [customStartDate, setCustomStartDate] = useState(`${currentYear}-01-01`);
  const [customEndDate, setCustomEndDate] = useState(`${currentYear}-12-31`);

  const datePresets = [
    { label: 'Hoy', range: currentDate.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) },
    { label: 'Últimos 30 días', range: `Últimos 30 días (${currentYear})` },
    { label: 'Mes Actual', range: currentDate.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' }) },
    { label: `Año ${currentYear} Completo`, range: `01 Ene ${currentYear} - 31 Dic ${currentYear}` },
  ];

  // Action Notification Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // --- MODAL 1: New Product Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdSlug, setNewProdSlug] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number | string>(29.9);
  const [newProdStock, setNewProdStock] = useState<number | string>(50);
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Accesorios');
  const [newProdImageUrl, setNewProdImageUrl] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdFeatured, setNewProdFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- MODAL 2: View Product Detail Modal State ---
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);

  // --- MODAL 3: Edit Product Modal State ---
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdSlug, setEditProdSlug] = useState('');
  const [editProdPrice, setEditProdPrice] = useState<number | string>('');
  const [editProdStock, setEditProdStock] = useState<number | string>('');
  const [editProdBrand, setEditProdBrand] = useState('');
  const [editProdCategory, setEditProdCategory] = useState('');
  const [editProdImageUrl, setEditProdImageUrl] = useState('');
  const [editProdSku, setEditProdSku] = useState('');
  const [editProdDesc, setEditProdDesc] = useState('');
  const [editProdActive, setEditProdActive] = useState(true);
  const [editProdFeatured, setEditProdFeatured] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // --- MODAL 4: Delete Confirmation Modal State ---
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [tenantSlug, canAccessCoupons]);

  const fetchDashboardData = () => {
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
  };

  const generateAutoSku = (brandName?: string) => {
    const brand = brandName || newProdBrand || currentTenant?.name || 'PC';
    const prefix = brand.trim() ? brand.trim().slice(0, 3).toUpperCase() : 'PC';
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
  };

  // 1. Create Product Handler
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
            brand: newProdBrand || currentTenant?.name,
            category: newProdCategory,
            description: newProdDesc,
            featured: newProdFeatured,
            imageUrl: newProdImageUrl,
            images: newProdImageUrl ? [{ url: newProdImageUrl, isPrimary: true }] : [],
            baseSku: newProdSku || `PC-${Date.now().toString().slice(-5)}`,
          }),
        },
        tenantSlug,
      );

      setShowModal(false);
      setNewProdName('');
      setNewProdSlug('');
      setNewProdDesc('');
      setNewProdImageUrl('');
      setNewProdSku('');
      showToast('Producto registrado en la base de datos');
      fetchDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Error al crear producto', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Open Edit Product Modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditProdName(product.name);
    setEditProdSlug(product.slug);
    setEditProdBrand(product.brand || currentTenant?.name || '');
    setEditProdCategory(product.productCategories?.[0]?.category?.name || 'Accesorios');
    setEditProdSku(product.variants[0]?.sku || product.baseSku || '');
    setEditProdPrice(Number(product.variants[0]?.prices[0]?.price || 0));
    setEditProdStock(product.variants[0]?.inventory?.availableStock || 0);
    setEditProdImageUrl(product.images[0]?.url || '');
    setEditProdDesc(product.description || '');
    setEditProdActive(product.active !== false);
    setEditProdFeatured(!!product.featured);
  };

  // 3. Save Edited Product
  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingEdit(true);
    try {
      await apiRequest(
        `/api/admin/products/${editingProduct.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            name: editProdName,
            slug: editProdSlug,
            brand: editProdBrand,
            baseSku: editProdSku,
            price: Number(editProdPrice),
            stock: Number(editProdStock),
            imageUrl: editProdImageUrl,
            description: editProdDesc,
            active: editProdActive,
            featured: editProdFeatured,
          }),
        },
        tenantSlug,
      );

      setEditingProduct(null);
      showToast('Producto actualizado en la base de datos');
      fetchDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar producto', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // 4. Toggle Product Status (Inactivar / Activar)
  const handleToggleProductStatus = async (product: Product) => {
    const newStatus = product.active === false ? true : false;
    
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, active: newStatus } : p))
    );

    try {
      await apiRequest(
        `/api/admin/products/${product.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ active: newStatus }),
        },
        tenantSlug,
      );
      showToast(newStatus ? 'Producto activado en tienda' : 'Producto inactivado');
    } catch (err: any) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, active: !newStatus } : p))
      );
      showToast(err.message || 'Error al cambiar estado', 'error');
    }
  };

  // 5. Quick Stock Adjustment (-5, +5, +20)
  const handleQuickStockAdjust = async (product: Product, delta: number) => {
    const currentStock = product.variants[0]?.inventory?.availableStock || 0;
    const newStock = Math.max(0, currentStock + delta);
    const variantId = product.variants[0]?.id;

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === product.id && p.variants[0]) {
          const updatedVariants = [...p.variants];
          updatedVariants[0] = {
            ...updatedVariants[0],
            inventory: {
              ...(updatedVariants[0].inventory || { reservedStock: 0 }),
              availableStock: newStock,
            },
          };
          return { ...p, variants: updatedVariants };
        }
        return p;
      })
    );

    try {
      if (variantId) {
        await apiRequest(
          '/api/admin/inventory/movements',
          {
            method: 'POST',
            body: JSON.stringify({
              variantId,
              movementType: 'ADJUSTMENT',
              quantity: delta,
              note: `Reposición rápida dashboard (${delta > 0 ? '+' : ''}${delta})`,
            }),
          },
          tenantSlug,
        );
      } else {
        await apiRequest(
          `/api/admin/products/${product.id}`,
          {
            method: 'PUT',
            body: JSON.stringify({ stock: newStock }),
          },
          tenantSlug,
        );
      }
      showToast(`Stock de ${product.name} actualizado a ${newStock} u.`);
    } catch (err: any) {
      showToast('Error al actualizar inventario', 'error');
      fetchDashboardData();
    }
  };

  // 6. Delete Product Handler
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await apiRequest(
        `/api/admin/products/${productToDelete.id}`,
        {
          method: 'DELETE',
        },
        tenantSlug,
      );

      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
      showToast('Producto eliminado de la base de datos');
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar producto', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Real Database Aggregations
  const totalSales = orders.reduce((sum, ord) => sum + parseSafeNumber(ord.total), 0);
  const averageTicket = orders.length > 0 ? totalSales / orders.length : 0;
  const lowStockItems = products.filter((p) => {
    const stock = p.variants[0]?.inventory?.availableStock || 0;
    return stock < 10;
  });

  // Filtered products list for table
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const defaultVar = p.variants[0];
      const stock = defaultVar?.inventory?.availableStock || 0;
      const isActive = p.active !== false;

      // 1. Search term
      const matchesSearch =
        searchTerm === '' ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.baseSku && p.baseSku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (defaultVar?.sku && defaultVar?.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));

      // 2. Category filter
      const categoryName = p.productCategories?.[0]?.category?.name || p.brand || '';
      const matchesCategory =
        categoryFilter === 'ALL' ||
        categoryName.toLowerCase().includes(categoryFilter.toLowerCase());

      // 3. Status filter
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && isActive) ||
        (statusFilter === 'INACTIVE' && !isActive);

      // 4. Stock filter
      const matchesStock =
        stockFilter === 'ALL' ||
        (stockFilter === 'LOW' && stock < 10) ||
        (stockFilter === 'OUT' && stock === 0) ||
        (stockFilter === 'IN_STOCK' && stock > 0);

      return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });
  }, [products, searchTerm, categoryFilter, statusFilter, stockFilter]);

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

      {/* 1. TOP HEADER & HERO SECTION */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5">
        
        {/* Left: Breadcrumb, Title & Badges */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Admin</span>
            <span>/</span>
            <span className="text-slate-600 font-bold">Dashboard</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard de Tienda & Métricas
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Supervisión integral de ventas, pedidos, catálogo y promociones del tenant en tiempo real.
          </p>

          <div className="flex items-center gap-2.5 pt-1">
            <span className="px-3 py-1 rounded-full bg-[#6A2CFF] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <span>🐾</span> {currentTenant?.name || 'TENANT'}
            </span>

            <span className="px-3 py-1 rounded-full bg-[#EBF3FF] text-[#1976FF] text-[10px] font-black uppercase tracking-wider border border-[#D5E5FF]">
              {isTenantAdmin ? 'ADMINISTRADOR (NIVEL 3 - MÁXIMO)' : 'GESTOR OPERATIVO (NIVEL 2)'}
            </span>
          </div>
        </div>

        {/* Right: Interactive Date Range Picker, Coupons & New Product Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
          
          {/* Interactive Date Range Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full sm:w-auto min-w-[210px] px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-slate-700 text-xs font-bold flex items-center justify-between gap-2 shadow-xs hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{dateRangeLabel}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
            </button>

            {/* Date Range Popover Panel */}
            {showDatePicker && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="pb-2.5 border-b border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Período de Análisis
                  </span>
                  <p className="text-xs font-bold text-slate-900">Filtro de métricas y ventas</p>
                </div>

                {/* Preset List */}
                <div className="py-2 space-y-1">
                  {datePresets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setDateRangeLabel(preset.range);
                        setShowDatePicker(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        dateRangeLabel === preset.range
                          ? 'bg-blue-50 text-blue-600 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{preset.label}</span>
                      {dateRangeLabel === preset.range && (
                        <Check className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Range Inputs */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 block">Rango personalizado</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="p-1.5 rounded-lg border border-slate-200 text-[11px] font-mono"
                    />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="p-1.5 rounded-lg border border-slate-200 text-[11px] font-mono"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setDateRangeLabel(`${customStartDate} - ${customEndDate}`);
                      setShowDatePicker(false);
                    }}
                    className="w-full py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Aplicar Rango
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Coupons Button */}
          {canAccessCoupons && (
            <Link
              to="/admin/cupones"
              className="px-4 py-2.5 rounded-2xl bg-[#EFF6FF] text-[#1976FF] border border-[#DBEAFE] hover:bg-[#DBEAFE] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs whitespace-nowrap"
            >
              <Tag className="w-4 h-4" />
              <span>Ver Cupones ({coupons.length})</span>
            </Link>
          )}

          {/* New Product Button */}
          <button
            onClick={() => {
              setNewProdBrand(currentTenant?.name || '');
              setShowModal(true);
            }}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#1976FF] to-[#6A2CFF] hover:opacity-95 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Hero Growth Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#F2EDFF] via-[#E8F0FE] to-[#F5F3FF] border border-purple-100 p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#6A2CFF]/10 text-[#6A2CFF] flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
            🛍️
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
              Gestiona, vende y haz crecer tu negocio
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Todo en un solo lugar: catálogo en tiempo real, control de stock y pasarela integrada.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-end gap-1 h-7 px-3 py-1 bg-white/60 backdrop-blur-xs rounded-xl border border-white/80">
            <span className="w-1.5 bg-[#6A2CFF] rounded-t-sm h-3"></span>
            <span className="w-1.5 bg-[#6A2CFF] rounded-t-sm h-5"></span>
            <span className="w-1.5 bg-[#1976FF] rounded-t-sm h-4"></span>
            <span className="w-1.5 bg-[#1976FF] rounded-t-sm h-6"></span>
          </div>
          <Link
            to="/"
            target="_blank"
            className="text-xs font-bold text-[#6A2CFF] hover:underline flex items-center gap-1"
          >
            Ver Storefront <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. FOUR KPI CARDS (Real Database Values) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        
        {/* Card 1: Ventas Totales */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF5FF] text-[#6A2CFF] font-black text-lg flex items-center justify-center shadow-xs">
                S/
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400">Ventas Totales</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {formatMoney(totalSales)}
                </h3>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 mt-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">
                {orders.length} pedidos
              </span>
              <span className="text-[10px] text-slate-400 font-medium">registrados</span>
            </div>
          </div>

          {/* Bottom Pill */}
          <div className="pt-3 mt-4 border-t border-slate-50 flex items-center gap-1.5 text-xs font-bold text-[#6A2CFF]">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Facturación en BD</span>
          </div>
        </div>

        {/* Card 2: Total Pedidos */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#1976FF] flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400">Total Pedidos</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {orders.length}
                </h3>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 mt-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100">
                Ticket prom: {formatMoney(averageTicket)}
              </span>
            </div>
          </div>

          {/* Bottom Pill */}
          <div className="pt-3 mt-4 border-t border-slate-50 flex items-center gap-1.5 text-xs font-bold text-[#1976FF]">
            <FileText className="w-3.5 h-3.5" />
            <span>Órdenes en tienda</span>
          </div>
        </div>

        {/* Card 3: Catálogo Activo */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#E6FAFC] text-[#00B8C9] flex items-center justify-center shadow-xs">
                <Package className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400">Catálogo Activo</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {products.length}
                </h3>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 mt-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">
                {products.filter(p => p.active !== false).length} activos
              </span>
            </div>
          </div>

          {/* Bottom Pill */}
          <div className="pt-3 mt-4 border-t border-slate-50 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <Tag className="w-3.5 h-3.5" />
            <span>Productos en catálogo</span>
          </div>
        </div>

        {/* Card 4: Alertas de Stock */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] text-amber-500 flex items-center justify-center shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400">Alertas de Stock</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {lowStockItems.length}
                </h3>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 mt-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                &lt; 10 unidades
              </span>
            </div>
          </div>

          {/* Bottom Pill */}
          <div className="pt-3 mt-4 border-t border-slate-50 flex items-center gap-1.5 text-xs font-bold text-amber-600">
            <Boxes className="w-3.5 h-3.5" />
            <span>Inventario bajo</span>
          </div>
        </div>

      </div>

      {/* 3. QUICK SUMMARY ROW: RECENT ORDERS (6 COLS) & QUICK ACTIONS (6 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Card 1: Últimos Pedidos */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#EFF6FF] text-[#1976FF] flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Últimos Pedidos ({orders.length})
                </h3>
                <p className="text-[11px] text-slate-400">Ventas y solicitudes registradas</p>
              </div>
            </div>

            <Link
              to="/admin/pedidos"
              className="text-xs font-bold text-[#1976FF] hover:underline flex items-center gap-1"
            >
              <span>Ver Pedidos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Orders Body */}
          {orders.length === 0 ? (
            <div className="py-6 text-center flex flex-col items-center justify-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl shadow-inner">
                📦
              </div>
              <h4 className="text-xs font-bold text-slate-700">
                No hay pedidos registrados en este tenant aún.
              </h4>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Cuando tus clientes compren en la tienda, aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {orders.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs hover:bg-slate-100/70 transition-colors"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-900 block">{order.orderNumber}</span>
                    <span className="text-[10px] text-slate-400">{order.items?.length || 1} productos</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 block">{formatMoney(order.total)}</span>
                    <span className="text-[9px] font-bold text-emerald-600 uppercase">{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 2: Acciones Rápidas */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Acciones Rápidas
              </h3>
              <p className="text-[11px] text-slate-400">Accede directamente a los módulos clave</p>
            </div>
          </div>

          {/* 4 Action Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            
            {/* Tile 1: Nuevo Producto */}
            <button
              onClick={() => {
                setNewProdBrand(currentTenant?.name || '');
                setShowModal(true);
              }}
              className="p-3 rounded-2xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-100/80 text-left flex items-center justify-between transition-all group shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-2xs">
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Nuevo Producto</span>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Tile 2: Ver Pedidos */}
            <Link
              to="/admin/pedidos"
              className="p-3 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-100/80 text-left flex items-center justify-between transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white text-indigo-600 flex items-center justify-center shadow-2xs">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Ver Pedidos</span>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Tile 3: Gestionar Stock */}
            <Link
              to="/admin/inventario"
              className="p-3 rounded-2xl bg-teal-50/70 hover:bg-teal-100/70 border border-teal-100/80 text-left flex items-center justify-between transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white text-teal-600 flex items-center justify-center shadow-2xs">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Gestionar Stock</span>
              </div>
              <ChevronRight className="w-4 h-4 text-teal-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Tile 4: Crear Cupón */}
            <Link
              to="/admin/cupones"
              className="p-3 rounded-2xl bg-purple-50/70 hover:bg-purple-100/70 border border-purple-100/80 text-left flex items-center justify-between transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white text-purple-600 flex items-center justify-center shadow-2xs">
                  <Tag className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Crear Cupón</span>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>

          </div>
        </div>

      </div>

      {/* 4. MAIN ENHANCED PRODUCT LISTING TABLE & CATALOG MANAGEMENT */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-6">
        
        {/* Table Header with Title & Action Shortcuts */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FAF5FF] text-[#6A2CFF] flex items-center justify-center flex-shrink-0 shadow-xs">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-slate-900">
                  Inventario & Catálogo de Productos
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF5FF] text-[#6A2CFF] font-extrabold text-xs">
                  {filteredProducts.length} de {products.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Visualiza, edita, actualiza stock en 1-click o gestiona el ciclo de vida del producto en tiempo real.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                setNewProdBrand(currentTenant?.name || '');
                setShowModal(true);
              }}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#1976FF] to-[#6A2CFF] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>

            <Link
              to="/admin/productos"
              className="px-3.5 py-2 rounded-2xl bg-[#EFF6FF] text-[#1976FF] hover:bg-[#DBEAFE] font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Ver Catálogo Completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU, marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-medium focus:bg-white focus:outline-none cursor-pointer shadow-2xs"
            >
              <option value="ALL">Todas las categorías</option>
              <option value="Accesorios">Accesorios</option>
              <option value="Higiene">Higiene & Arenas</option>
              <option value="Alimentación">Alimentación</option>
              <option value="Areneros">Areneros</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-medium focus:bg-white focus:outline-none cursor-pointer shadow-2xs"
            >
              <option value="ALL">Todos los estados</option>
              <option value="ACTIVE">Solo Activos</option>
              <option value="INACTIVE">Solo Inactivos</option>
            </select>
          </div>

          {/* Stock Level Filter */}
          <div className="sm:col-span-2">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-medium focus:bg-white focus:outline-none cursor-pointer shadow-2xs"
            >
              <option value="ALL">Todo el Stock</option>
              <option value="LOW">⚠️ Stock Bajo (&lt;10)</option>
              <option value="IN_STOCK">✓ Con Stock</option>
              <option value="OUT">✕ Agotados (0)</option>
            </select>
          </div>

        </div>

        {/* Table Component */}
        {loading ? (
          <div className="space-y-3 py-8">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 text-slate-300 flex items-center justify-center text-3xl shadow-inner">
              🔍
            </div>
            <h4 className="text-sm font-extrabold text-slate-800">
              No se encontraron productos con los filtros aplicados
            </h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Intenta cambiar el término de búsqueda o registra nuevos productos en el catálogo.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('ALL');
                setStatusFilter('ALL');
                setStockFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div>
            {/* ── 1. MOBILE PRODUCT CARDS (Phones: block md:hidden) ── */}
            <div className="block md:hidden divide-y divide-slate-100 -mx-4 sm:-mx-6">
              {filteredProducts.map((p) => {
                const defaultVar = p.variants[0];
                const price = defaultVar?.prices[0]?.price || 0;
                const stock = defaultVar?.inventory?.availableStock || 0;
                const categoryName = p.productCategories?.[0]?.category?.name || 'Estándar';
                const brandName = p.brand || currentTenant?.name || 'PeruCat';
                const isActive = p.active !== false;
                const sku = defaultVar?.sku || p.baseSku || 'PC-SKU-001';

                return (
                  <div key={p.id} className="p-4 bg-white hover:bg-slate-50/60 transition-colors">
                    <div className="flex gap-3 items-start">
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {p.images[0]?.url ? (
                          <img
                            src={p.images[0].url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Package className="w-6 h-6 text-slate-300" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
                            {p.name}
                          </h4>
                          {isActive ? (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Activo
                            </span>
                          ) : (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              Inactivo
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-xs font-bold text-[#6A2CFF] truncate">
                            {brandName}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] font-medium text-slate-500 truncate">
                            {categoryName}
                          </span>
                        </div>

                        {/* SKU + Price */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono text-[10px] font-bold text-slate-600">
                            {sku}
                          </span>
                          <span className="font-black text-slate-900 text-sm">
                            {formatMoney(price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stock & Quick Adjustment Bar */}
                    <div className="mt-3 p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-500">Stock:</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                            stock > 20
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : stock > 5
                              ? 'bg-[#FEF3C7] text-[#B45309]'
                              : 'bg-[#FFE4E6] text-[#BE123C]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              stock > 20 ? 'bg-[#16A34A]' : stock > 5 ? 'bg-[#D97706]' : 'bg-[#E11D48]'
                            }`}
                          />
                          {stock} u.
                        </span>
                      </div>

                      {/* Touch-Friendly Stock Adjust */}
                      <div className="inline-flex items-center bg-white border border-slate-200/80 rounded-lg p-0.5 gap-1 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleQuickStockAdjust(p, -5)}
                          disabled={stock <= 0}
                          title="Disminuir 5 unidades"
                          className="px-2 py-1 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickStockAdjust(p, 5)}
                          title="Añadir 5 unidades"
                          className="px-2 py-1 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickStockAdjust(p, 20)}
                          title="Añadir 20 unidades"
                          className="px-2 py-1 rounded-md text-xs font-extrabold text-[#6A2CFF] bg-purple-50 hover:bg-purple-100 cursor-pointer"
                        >
                          +20
                        </button>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="mt-2.5 pt-2 flex items-center gap-1.5 justify-between">
                      <button
                        type="button"
                        onClick={() => setSelectedProductDetail(p)}
                        className="flex-1 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Detalle</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="flex-1 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleProductStatus(p)}
                        className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                          isActive
                            ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={isActive ? 'Inactivar Producto' : 'Activar Producto'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setProductToDelete(p)}
                        className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
                        title="Eliminar Producto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── 2. DESKTOP DATA TABLE (Tablets & Desktops: hidden md:block) ── */}
            <div className="hidden md:block overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3 font-extrabold">PRODUCTO & MARCA</th>
                  <th className="py-3 px-3 font-extrabold">SKU MAESTRO</th>
                  <th className="py-3 px-3 font-extrabold">PRECIO UNITARIO</th>
                  <th className="py-3 px-3 font-extrabold">NIVEL DE STOCK</th>
                  <th className="py-3 px-3 font-extrabold text-center">REPOSICIÓN RÁPIDA</th>
                  <th className="py-3 px-3 font-extrabold">ESTADO</th>
                  <th className="py-3 px-3 font-extrabold text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {filteredProducts.map((p) => {
                  const defaultVar = p.variants[0];
                  const price = defaultVar?.prices[0]?.price || 0;
                  const stock = defaultVar?.inventory?.availableStock || 0;
                  const categoryName = p.productCategories?.[0]?.category?.name || 'Estándar';
                  const brandName = p.brand || currentTenant?.name || 'PeruCat';
                  const isActive = p.active !== false;
                  const sku = defaultVar?.sku || p.baseSku || 'PC-SKU-001';

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* 1. PRODUCTO & MARCA */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-100 overflow-hidden flex-shrink-0 shadow-2xs flex items-center justify-center">
                            {p.images[0]?.url ? (
                              <img
                                src={p.images[0].url}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <Package className="w-6 h-6 text-slate-300" />
                            )}
                          </div>

                          <div className="min-w-0 max-w-[190px] sm:max-w-[220px]">
                            <p className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-2 break-words leading-snug" title={p.name}>
                              {p.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs font-bold text-[#6A2CFF] truncate">
                                {brandName}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[11px] font-medium text-slate-400 truncate">
                                {categoryName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. SKU MAESTRO */}
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200/90 font-mono text-[11px] font-bold text-slate-600 shadow-2xs">
                          {sku}
                        </span>
                      </td>

                      {/* 3. PRECIO UNITARIO */}
                      <td className="py-3.5 px-3">
                        <span className="font-black text-slate-900 text-sm">
                          {formatMoney(price)}
                        </span>
                      </td>

                      {/* 4. NIVEL DE STOCK */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs ${
                            stock > 20
                              ? 'bg-[#DCFCE7]/70 text-[#15803D] border border-[#BBF7D0]'
                              : stock > 5
                              ? 'bg-[#FEF3C7]/80 text-[#B45309] border border-[#FDE68A]'
                              : 'bg-[#FFE4E6]/80 text-[#BE123C] border border-[#FECDD3]'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              stock > 20
                                ? 'bg-[#16A34A]'
                                : stock > 5
                                ? 'bg-[#D97706]'
                                : 'bg-[#E11D48]'
                            }`}
                          ></span>
                          <span>{stock} u.</span>
                        </span>
                      </td>

                      {/* 5. REPOSICIÓN RÁPIDA (-5, [Stock], +5, +20) */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center bg-slate-50/90 border border-slate-200/70 rounded-full p-0.5 gap-1 shadow-2xs">
                          {/* -5 button */}
                          <button
                            type="button"
                            onClick={() => handleQuickStockAdjust(p, -5)}
                            disabled={stock <= 0}
                            title="Disminuir 5 unidades"
                            className="px-2 py-0.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            -5
                          </button>

                          {/* Current stock display */}
                          <span className="px-1.5 text-xs font-extrabold text-slate-800 font-mono min-w-[24px] text-center">
                            {stock}
                          </span>

                          {/* +5 button */}
                          <button
                            type="button"
                            onClick={() => handleQuickStockAdjust(p, 5)}
                            title="Añadir 5 unidades"
                            className="px-2 py-0.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            +5
                          </button>

                          {/* +20 button */}
                          <button
                            type="button"
                            onClick={() => handleQuickStockAdjust(p, 20)}
                            title="Añadir 20 unidades"
                            className="px-2 py-0.5 rounded-full text-xs font-extrabold text-[#6A2CFF] bg-[#FAF5FF] hover:bg-purple-100 transition-colors cursor-pointer"
                          >
                            +20
                          </button>
                        </div>
                      </td>

                      {/* 6. ESTADO */}
                      <td className="py-3.5 px-3">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/70 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Activo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 shadow-2xs">
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Inactivo</span>
                          </span>
                        )}
                      </td>

                      {/* 7. ACCIONES (Detalle, Editar, Inactivar/Activar, Eliminar) */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          
                          {/* Action 1: Ver Detalle */}
                          <button
                            type="button"
                            onClick={() => setSelectedProductDetail(p)}
                            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Ver Detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Action 2: Editar */}
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Editar Producto"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Action 3: Inactivar / Activar */}
                          <button
                            type="button"
                            onClick={() => handleToggleProductStatus(p)}
                            className={`p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer ${
                              isActive
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={isActive ? 'Inactivar Producto' : 'Activar Producto'}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          {/* Action 4: Eliminar */}
                          <button
                            type="button"
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Eliminar Producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTRAR NUEVO PRODUCTO */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto no-scrollbar border border-slate-100">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1976FF] to-[#6A2CFF] text-white flex items-center justify-center shadow-glow-primary flex-shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-[#6A2CFF] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Catálogo Comercial & Inventario
                  </span>
                  <h3 className="text-xl font-black text-slate-900">Registrar Nuevo Producto</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateProduct} className="space-y-6 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Column 1: Info */}
                <div className="space-y-4 bg-slate-50/60 p-5 rounded-3xl border border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                    1. Información Principal
                  </span>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-blue-600" />
                      Nombre Comercial del Producto *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Pala Sanitaria Ergonómica PeruCat"
                      value={newProdName}
                      onChange={(e) => {
                        setNewProdName(e.target.value);
                        setNewProdSlug(e.target.value.toLowerCase().trim().replace(/[\s\W-]+/g, '-'));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white text-slate-900 font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        Marca / Fabricante
                      </label>
                      <input
                        type="text"
                        placeholder={currentTenant?.name || 'Marca'}
                        value={newProdBrand}
                        onChange={(e) => setNewProdBrand(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200/90 bg-white text-slate-900 font-medium focus:border-blue-500 focus:outline-none shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-teal-600" />
                        Categoría
                      </label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200/90 bg-white text-slate-900 font-medium focus:border-blue-500 focus:outline-none shadow-2xs cursor-pointer"
                      >
                        <option value="Accesorios">Accesorios</option>
                        <option value="Higiene">Higiene & Arenas</option>
                        <option value="Alimentación">Alimentación</option>
                        <option value="Areneros">Areneros</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-indigo-600" />
                        Código SKU Maestro
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewProdSku(generateAutoSku(newProdBrand))}
                        className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-3 h-3 text-amber-500" /> Auto Generar
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="PC-PALA-STD"
                      value={newProdSku}
                      onChange={(e) => setNewProdSku(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white text-slate-900 font-mono font-bold focus:border-blue-500 focus:outline-none shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                      Slug Identificador URL *
                    </label>
                    <input
                      type="text"
                      placeholder="pala-sanitaria-ergonomica"
                      value={newProdSlug}
                      onChange={(e) => setNewProdSlug(e.target.value.toLowerCase().replace(/[\s\W-]+/g, '-'))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white text-slate-900 font-mono text-xs focus:border-blue-500 focus:outline-none shadow-2xs"
                      required
                    />
                  </div>
                </div>

                {/* Column 2: Price & Stock */}
                <div className="space-y-4 bg-slate-50/60 p-5 rounded-3xl border border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                    2. Precios, Inventario & Foto
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        Precio Unitario (PEN S/) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">S/</span>
                        <input
                          type="number"
                          step="0.10"
                          min="0"
                          placeholder="29.90"
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value)}
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200/90 bg-white text-slate-900 font-black focus:border-blue-500 focus:outline-none shadow-2xs"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-amber-500" />
                        Stock Inicial *
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="50"
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white text-slate-900 font-bold focus:border-blue-500 focus:outline-none shadow-2xs"
                        required
                      />
                    </div>
                  </div>

                  <ImageUploadPicker
                    value={newProdImageUrl}
                    onChange={setNewProdImageUrl}
                    label="Imagen Principal del Producto"
                    placeholder="https://images.unsplash.com/... o sube un archivo"
                  />

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={newProdFeatured}
                      onChange={(e) => setNewProdFeatured(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      Destacar en portada del Storefront
                    </span>
                  </label>
                </div>

              </div>

              {/* Bottom: Description */}
              <div className="bg-slate-50/60 p-4 rounded-3xl border border-slate-100">
                <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  Descripción & Especificaciones
                </label>
                <textarea
                  placeholder="Detalla las características del producto, materiales o recomendaciones de uso..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200/90 bg-white text-slate-900 font-medium focus:border-blue-500 focus:outline-none h-20 shadow-2xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-7 py-2.5 rounded-2xl bg-gradient-to-r from-[#1976FF] to-[#6A2CFF] hover:opacity-95 text-white font-black shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
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

      {/* ========================================================================= */}
      {/* MODAL 2: VER DETALLE DEL PRODUCTO */}
      {/* ========================================================================= */}
      {selectedProductDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar border border-slate-100">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">
                    Ficha Técnica Comercial
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    Detalle del Producto
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProductDetail(null)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
              
              {/* Image Column */}
              <div className="sm:col-span-5 space-y-3">
                <div className="w-full aspect-square rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shadow-inner">
                  {selectedProductDetail.images[0]?.url ? (
                    <img
                      src={selectedProductDetail.images[0].url}
                      alt={selectedProductDetail.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-slate-300" />
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      selectedProductDetail.active !== false
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedProductDetail.active !== false ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    ></span>
                    {selectedProductDetail.active !== false ? 'Producto Activo' : 'Producto Inactivo'}
                  </span>

                  {selectedProductDetail.featured && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> Destacado
                    </span>
                  )}
                </div>
              </div>

              {/* Info Column */}
              <div className="sm:col-span-7 space-y-4">
                <div>
                  <span className="text-xs font-bold text-[#6A2CFF] uppercase tracking-wider block">
                    {selectedProductDetail.brand || currentTenant?.name || 'Marca'}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-0.5 leading-snug">
                    {selectedProductDetail.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Slug: <code className="font-mono text-slate-600 font-bold">{selectedProductDetail.slug}</code>
                  </p>
                </div>

                {/* 2 Stat Cards */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] space-y-1">
                    <span className="text-[10px] font-extrabold text-[#15803D] uppercase tracking-wider block">
                      Precio de Venta
                    </span>
                    <p className="text-xl font-black text-[#15803D]">
                      {formatMoney(selectedProductDetail.variants[0]?.prices[0]?.price || 0)}
                    </p>
                    <span className="text-[10px] text-[#16A34A] font-medium block">Moneda: PEN (S/)</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] space-y-1">
                    <span className="text-[10px] font-extrabold text-[#1E40AF] uppercase tracking-wider block">
                      Stock Disponible
                    </span>
                    <p className="text-xl font-black text-[#1E40AF]">
                      {selectedProductDetail.variants[0]?.inventory?.availableStock || 0} <span className="text-xs font-bold">unidades</span>
                    </p>
                    <span className="text-[10px] text-[#2563EB] font-medium block">SKU: {selectedProductDetail.variants[0]?.sku || selectedProductDetail.baseSku || 'PC-DEF'}</span>
                  </div>
                </div>

                {/* Additional Specs */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Categoría Principal:</span>
                    <span className="font-bold text-slate-800">
                      {selectedProductDetail.productCategories?.[0]?.category?.name || 'General / Accesorios'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">SKU Maestro:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedProductDetail.variants[0]?.sku || selectedProductDetail.baseSku || 'PC-SKU-001'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500 font-medium">Variantes registradas:</span>
                    <span className="font-bold text-slate-800">
                      {selectedProductDetail.variants?.length || 1} variante(s)
                    </span>
                  </div>
                </div>

                {/* Description */}
                {selectedProductDetail.description && (
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                      Descripción
                    </span>
                    <p className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 leading-relaxed">
                      {selectedProductDetail.description}
                    </p>
                  </div>
                )}

              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const prod = selectedProductDetail;
                  setSelectedProductDetail(null);
                  openEditModal(prod);
                }}
                className="px-5 py-2.5 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
                <span>Editar este Producto</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProductDetail(null)}
                className="px-6 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDITAR PRODUCTO */}
      {/* ========================================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto no-scrollbar border border-slate-100">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                    Edición de Catálogo & Stock
                  </span>
                  <h3 className="text-xl font-black text-slate-900">Editar Producto</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditProduct} className="space-y-6 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Column 1 */}
                <div className="space-y-4 bg-slate-50/60 p-5 rounded-3xl border border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                    1. Información Principal
                  </span>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-blue-600" />
                      Nombre Comercial del Producto *
                    </label>
                    <input
                      type="text"
                      value={editProdName}
                      onChange={(e) => setEditProdName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white text-slate-900 font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        Marca / Fabricante
                      </label>
                      <input
                        type="text"
                        value={editProdBrand}
                        onChange={(e) => setEditProdBrand(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200/90 bg-white text-slate-900 font-medium focus:border-blue-500 focus:outline-none shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-teal-600" />
                        Categoría
                      </label>
                      <select
                        value={editProdCategory}
                        onChange={(e) => setEditProdCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200/90 bg-white text-slate-900 font-medium focus:border-blue-500 focus:outline-none shadow-2xs cursor-pointer"
                      >
                        <option value="Accesorios">Accesorios</option>
                        <option value="Higiene">Higiene & Arenas</option>
                        <option value="Alimentación">Alimentación</option>
                        <option value="Areneros">Areneros</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-600" />
                      Código SKU Maestro
                    </label>
                    <input
                      type="text"
                      value={editProdSku}
                      onChange={(e) => setEditProdSku(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white text-slate-900 font-mono font-bold focus:border-blue-500 focus:outline-none shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                      Slug URL *
                    </label>
                    <input
                      type="text"
                      value={editProdSlug}
                      onChange={(e) => setEditProdSlug(e.target.value.toLowerCase().replace(/[\s\W-]+/g, '-'))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white text-slate-900 font-mono text-xs focus:border-blue-500 focus:outline-none shadow-2xs"
                      required
                    />
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4 bg-slate-50/60 p-5 rounded-3xl border border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                    2. Precios, Inventario & Foto
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        Precio Unitario (PEN S/) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">S/</span>
                        <input
                          type="number"
                          step="0.10"
                          min="0"
                          value={editProdPrice}
                          onChange={(e) => setEditProdPrice(e.target.value)}
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200/90 bg-white text-slate-900 font-black focus:border-blue-500 focus:outline-none shadow-2xs"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-amber-500" />
                        Stock Disponible *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editProdStock}
                        onChange={(e) => setEditProdStock(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white text-slate-900 font-bold focus:border-blue-500 focus:outline-none shadow-2xs"
                        required
                      />
                    </div>
                  </div>

                  <ImageUploadPicker
                    value={editProdImageUrl}
                    onChange={setEditProdImageUrl}
                    label="Imagen Principal del Producto"
                    placeholder="https://images.unsplash.com/... o sube un archivo"
                  />

                  {/* Active & Featured */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 cursor-pointer hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={editProdActive}
                        onChange={(e) => setEditProdActive(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        ✓ Producto Activo
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 cursor-pointer hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={editProdFeatured}
                        onChange={(e) => setEditProdFeatured(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                      />
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Destacado
                      </span>
                    </label>
                  </div>

                </div>

              </div>

              {/* Bottom: Description */}
              <div className="bg-slate-50/60 p-4 rounded-3xl border border-slate-100">
                <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  Descripción & Especificaciones
                </label>
                <textarea
                  value={editProdDesc}
                  onChange={(e) => setEditProdDesc(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200/90 bg-white text-slate-900 font-medium focus:border-blue-500 focus:outline-none h-20 shadow-2xs"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-6 py-2.5 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-7 py-2.5 rounded-2xl bg-gradient-to-r from-[#1976FF] to-[#6A2CFF] hover:opacity-95 text-white font-black shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {savingEdit ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Guardando Cambios...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CONFIRMACIÓN DE ELIMINACIÓN */}
      {/* ========================================================================= */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100 animate-in zoom-in-95">
            
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl shadow-inner mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                ¿Eliminar este producto?
              </h3>
              <p className="text-xs text-slate-500">
                Estás a punto de dar de baja a <strong className="text-slate-800">{productToDelete.name}</strong> de la base de datos del catálogo.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center gap-2.5 text-[11px] text-rose-700 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>El producto dejará de estar visible en el Storefront y se archivará de forma segura.</span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-5 py-2.5 rounded-2xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteProduct}
                className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sí, Eliminar</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

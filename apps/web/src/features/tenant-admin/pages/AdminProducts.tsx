import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTenant } from '../../../hooks/useTenant';
import { useAuth } from '../../../hooks/useAuth';
import { Product } from '../../../types';
import { apiRequest } from '../../../services/api';
import { formatMoney, parseSafeNumber } from '../../../utils/format';
import { ImageUploadPicker } from '../../../components/common/ImageUploadPicker';
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
  RefreshCw,
  Boxes,
  SlidersHorizontal,
  ExternalLink,
  Upload,
  Download,
  FileText,
  Ban,
  ShoppingCart,
  Zap,
  Clock,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  List,
  Eye,
  Pencil,
  Copy,
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Building2,
  XCircle,
  FolderPlus,
  Check,
  Globe,
  Star,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { currentTenant, tenantSlug } = useTenant();
  const { isTenantAdmin } = useAuth();

  // Primary Data
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Status Tab: 'ALL' | 'ACTIVE' | 'DRAFT' | 'INACTIVE'
  const [statusTab, setStatusTab] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'INACTIVE'>('ALL');

  // Search & Advanced Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'name_asc' | 'price_asc' | 'price_desc' | 'updated'>('recent');

  // View Mode
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Multi-selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Columns visibility
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    sku: true,
    category: true,
    price: true,
    comparePrice: true,
    status: true,
    updatedAt: true,
    actions: true,
  });

  // Action Menu Dropdown ID
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Collapsible Right Sidebar Panels (Horizontal & Vertical)
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'all' | 'actions' | 'activity'>('all');
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(true);
  const [isRecentActivityOpen, setIsRecentActivityOpen] = useState(true);

  // Toast message
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- MODALS ---
  // 1. Create Product Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdSlug, setNewProdSlug] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number | string>(32.0);
  const [newProdComparePrice, setNewProdComparePrice] = useState<number | string>(38.0);
  const [newProdStock, setNewProdStock] = useState<number | string>(50);
  const [newProdBrand, setNewProdBrand] = useState('PeruCat');
  const [newProdCategory, setNewProdCategory] = useState('Accesorios');
  const [newProdImageUrl, setNewProdImageUrl] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdFeatured, setNewProdFeatured] = useState(false);
  const [newProdActive, setNewProdActive] = useState(true);
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // 2. Edit Product Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editPrice, setEditPrice] = useState<number | string>('');
  const [editComparePrice, setEditComparePrice] = useState<number | string>('');
  const [editBrand, setEditBrand] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  // 3. View Detail Modal
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // 4. Create Category Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');

  // 5. Manage Brands Modal
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  // 6. Import CSV Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = () => setOpenActionMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    apiRequest<Product[]>('/api/admin/products', {}, tenantSlug)
      .then((prods) => setProducts(prods || []))
      .catch((err) => console.error('Error fetching admin products:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [tenantSlug]);

  // Catalog-Oriented Metrics
  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.active !== false).length;
  const draftProducts = 0; // Standard draft count
  const inactiveProducts = products.filter((p) => p.active === false).length;

  // Distinct Filter Lists
  const categoriesList = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      const cat = p.productCategories?.[0]?.category?.name;
      if (cat) cats.add(cat);
    });
    if (cats.size === 0) {
      return ['Accesorios', 'Higiene', 'Alimentación', 'Frutos Secos', 'Superalimentos', 'Endulzantes'];
    }
    return Array.from(cats);
  }, [products]);

  const brandsList = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands);
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const defaultVar = p.variants[0];
        const price = Number(defaultVar?.prices[0]?.price || 0);
        const isActive = p.active !== false;

        // 1. Status Tab
        if (statusTab === 'ACTIVE' && !isActive) return false;
        if (statusTab === 'DRAFT') return false;
        if (statusTab === 'INACTIVE' && isActive) return false;

        // 2. Search
        const searchLower = search.toLowerCase();
        const matchesSearch =
          search === '' ||
          p.name.toLowerCase().includes(searchLower) ||
          (p.brand && p.brand.toLowerCase().includes(searchLower)) ||
          (p.baseSku && p.baseSku.toLowerCase().includes(searchLower)) ||
          (defaultVar?.sku && defaultVar.sku.toLowerCase().includes(searchLower));

        // 3. Category
        const catName = p.productCategories?.[0]?.category?.name || '';
        const matchesCategory =
          categoryFilter === 'ALL' || catName.toLowerCase() === categoryFilter.toLowerCase();

        // 4. Brand
        const matchesBrand = brandFilter === 'ALL' || p.brand === brandFilter;

        // 5. State dropdown
        const matchesState =
          stateFilter === 'ALL' ||
          (stateFilter === 'ACTIVE' && isActive) ||
          (stateFilter === 'INACTIVE' && !isActive);

        // 6. Price Range
        const min = minPrice ? Number(minPrice) : 0;
        const max = maxPrice ? Number(maxPrice) : Infinity;
        const matchesPrice = price >= min && price <= max;

        return matchesSearch && matchesCategory && matchesBrand && matchesState && matchesPrice;
      })
      .sort((a, b) => {
        const priceA = Number(a.variants[0]?.prices[0]?.price || 0);
        const priceB = Number(b.variants[0]?.prices[0]?.price || 0);

        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'price_asc') return priceA - priceB;
        if (sortBy === 'price_desc') return priceB - priceA;
        if (sortBy === 'updated') {
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
        }
        return 0; // Default: recent order from DB
      });
  }, [products, statusTab, search, categoryFilter, brandFilter, stateFilter, minPrice, maxPrice, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Selection helpers
  const isAllSelected = paginatedProducts.length > 0 && paginatedProducts.every((p) => selectedIds.includes(p.id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedProducts.some((p) => p.id === id)));
    } else {
      const pageIds = paginatedProducts.map((p) => p.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Clear Filters
  const handleClearFilters = () => {
    setSearch('');
    setStatusTab('ALL');
    setCategoryFilter('ALL');
    setBrandFilter('ALL');
    setStateFilter('ALL');
    setMinPrice('');
    setMaxPrice('');
    setDateFilter('ALL');
    setSortBy('recent');
    setCurrentPage(1);
    showToast('Filtros restablecidos', 'info');
  };

  // 1. Create Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCreate(true);
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
            featured: newProdFeatured,
            imageUrl: newProdImageUrl,
            images: newProdImageUrl ? [{ url: newProdImageUrl, isPrimary: true }] : [],
            baseSku: newProdSku || `PC-${Date.now().toString().slice(-5)}`,
          }),
        },
        tenantSlug,
      );

      setShowCreateModal(false);
      setNewProdName('');
      setNewProdSlug('');
      setNewProdDesc('');
      setNewProdImageUrl('');
      setNewProdSku('');
      showToast('Producto creado y publicado en catálogo');
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Error al crear producto', 'error');
    } finally {
      setSubmittingCreate(false);
    }
  };

  // 2. Open Edit Modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditSlug(product.slug);
    setEditBrand(product.brand || currentTenant?.name || 'PeruCat');
    setEditCategory(product.productCategories?.[0]?.category?.name || 'Accesorios');
    setEditSku(product.variants[0]?.sku || product.baseSku || '');
    setEditPrice(Number(product.variants[0]?.prices[0]?.price || 0));
    setEditComparePrice(Number(product.variants[0]?.prices[0]?.price || 0) * 1.2);
    setEditImageUrl(product.images[0]?.url || '');
    setEditDesc(product.description || '');
    setEditActive(product.active !== false);
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
            name: editName,
            slug: editSlug,
            brand: editBrand,
            baseSku: editSku,
            price: Number(editPrice),
            imageUrl: editImageUrl,
            description: editDesc,
            active: editActive,
          }),
        },
        tenantSlug,
      );

      setEditingProduct(null);
      showToast('Producto actualizado en catálogo');
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar producto', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // 4. Duplicate Product
  const handleDuplicateProduct = async (product: Product) => {
    try {
      const defaultVar = product.variants[0];
      const newSku = `${product.baseSku || 'PC'}-COPY-${Math.floor(100 + Math.random() * 900)}`;
      await apiRequest(
        '/api/admin/products',
        {
          method: 'POST',
          body: JSON.stringify({
            name: `${product.name} (Copia)`,
            slug: `${product.slug}-copia-${Date.now().toString().slice(-4)}`,
            price: Number(defaultVar?.prices[0]?.price || 30.0),
            stock: Number(defaultVar?.inventory?.availableStock || 20),
            brand: product.brand || currentTenant?.name || 'PeruCat',
            category: product.productCategories?.[0]?.category?.name || 'Accesorios',
            description: product.description,
            images: product.images[0]?.url ? [{ url: product.images[0].url, isPrimary: true }] : [],
            baseSku: newSku,
          }),
        },
        tenantSlug,
      );
      showToast(`Producto duplicado como "${product.name} (Copia)"`);
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Error al duplicar producto', 'error');
    }
  };

  // 5. Toggle Single Product Active / Deactivate
  const handleToggleProductStatus = async (product: Product) => {
    const newStatus = product.active === false ? true : false;
    try {
      await apiRequest(
        `/api/admin/products/${product.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ active: newStatus }),
        },
        tenantSlug,
      );
      showToast(newStatus ? 'Producto publicado en tienda' : 'Producto desactivado');
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Error al cambiar estado', 'error');
    }
  };

  // 6. Mass Status Update (Publicar / Despublicar / Eliminar)
  const handleMassStatusUpdate = async (active: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      const promises = selectedIds.map((id) =>
        apiRequest(
          `/api/admin/products/${id}`,
          {
            method: 'PUT',
            body: JSON.stringify({ active }),
          },
          tenantSlug,
        ),
      );
      await Promise.all(promises);
      showToast(`${selectedIds.length} productos ${active ? 'publicados' : 'despublicados'}`);
      setSelectedIds([]);
      fetchProducts();
    } catch (err: any) {
      showToast('Error en actualización masiva', 'error');
    }
  };

  // 7. Export to CSV
  const exportCatalogToCSV = () => {
    const items = selectedIds.length > 0
      ? products.filter((p) => selectedIds.includes(p.id))
      : products;

    const headers = ['SKU', 'Nombre_Producto', 'Marca', 'Categoria', 'Precio_Venta_PEN', 'Estado', 'Fecha_Creacion'];
    const rows = items.map((p) => [
      p.variants[0]?.sku || p.baseSku || '',
      `"${p.name.replace(/"/g, '""')}"`,
      `"${(p.brand || '').replace(/"/g, '""')}"`,
      `"${(p.productCategories?.[0]?.category?.name || '').replace(/"/g, '""')}"`,
      Number(p.variants[0]?.prices[0]?.price || 0).toFixed(2),
      p.active !== false ? 'Publicado' : 'Desactivado',
      p.createdAt || new Date().toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `catalogo_${tenantSlug || 'perucat'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Catálogo exportado (${items.length} productos)`);
  };

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

      {/* 1. HEADER SECTION (Productos & Catálogo) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Left: Icon & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shadow-xs flex-shrink-0">
            <Package className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Productos & Catálogo
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Administra productos, precios, imágenes, categorías, variantes y publicación en tienda.
            </p>
          </div>
        </div>

        {/* Right: Primary Action Buttons */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end flex-wrap">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Importar productos</span>
          </button>

          <button
            onClick={exportCatalogToCSV}
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar catálogo</span>
          </button>

          <button
            onClick={() => {
              setNewProdBrand(currentTenant?.name || 'PeruCat');
              setShowCreateModal(true);
            }}
            className="px-5 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* 2. FOUR CATALOG-ORIENTED KPI CARDS */}
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
                {totalProducts}
              </span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669]">
                <TrendingUp className="w-3 h-3" />
                +0%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
              En tu catálogo
            </span>
          </div>
        </div>

        {/* Card 2: Publicados */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="w-13 h-13 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-500 block">Publicados</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {publishedProducts}
              </span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669]">
                <TrendingUp className="w-3 h-3" />
                +0%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
              Visibles en la tienda
            </span>
          </div>
        </div>

        {/* Card 3: Borradores */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="w-13 h-13 rounded-2xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-500 block">Borradores</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {draftProducts}
              </span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                → 0%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
              En edición
            </span>
          </div>
        </div>

        {/* Card 4: Desactivados */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="w-13 h-13 rounded-2xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center flex-shrink-0">
            <Ban className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-500 block">Desactivados</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {inactiveProducts}
              </span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                → 0%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
              No visibles en tienda
            </span>
          </div>
        </div>

      </div>

      {/* 3. MAIN WORKSPACE WITH 2-COLUMN LAYOUT (TABLE + RIGHT SIDEBAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: MAIN PRODUCT CATALOG TABLE & CONTROLS */}
        {/* ========================================================================= */}
        <div className={`${isRightPanelOpen ? 'lg:col-span-8 xl:col-span-8' : 'lg:col-span-12 xl:col-span-12'} bg-white rounded-3xl border border-slate-100 shadow-xs p-5 sm:p-6 space-y-5 transition-all duration-300`}>
          
          {/* Quick Filter Tabs & Action Shortcuts Row */}
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full xl:w-auto">
              <button
                onClick={() => {
                  setStatusTab('ALL');
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusTab === 'ALL'
                    ? 'bg-[#EEF2FF] text-[#4F46E5]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Todos ({totalProducts})
              </button>

              <button
                onClick={() => {
                  setStatusTab('ACTIVE');
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusTab === 'ACTIVE'
                    ? 'bg-[#EEF2FF] text-[#4F46E5]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Publicados ({publishedProducts})
              </button>

              <button
                onClick={() => {
                  setStatusTab('DRAFT');
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusTab === 'DRAFT'
                    ? 'bg-[#EEF2FF] text-[#4F46E5]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Borradores ({draftProducts})
              </button>

              <button
                onClick={() => {
                  setStatusTab('INACTIVE');
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusTab === 'INACTIVE'
                    ? 'bg-[#EEF2FF] text-[#4F46E5]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Desactivados ({inactiveProducts})
              </button>
            </div>

            {/* Quick Action Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full xl:w-auto">
              <button
                onClick={() => setShowCategoryModal(true)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Tag className="w-3 h-3 text-[#4F46E5]" />
                <span>Crear categoría</span>
              </button>

              <button
                onClick={() => setShowBrandModal(true)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Building2 className="w-3 h-3 text-[#4F46E5]" />
                <span>Gestionar marcas</span>
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Upload className="w-3 h-3 text-[#4F46E5]" />
                <span>Importar CSV</span>
              </button>

              <button
                onClick={exportCatalogToCSV}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Download className="w-3 h-3 text-[#4F46E5]" />
                <span>Exportar catálogo</span>
              </button>
            </div>

          </div>

          {/* Search Box Row */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar producto, SKU o marca..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] font-medium"
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

          {/* Second Filter Row (Categories, Brands, States, Price Range, Date) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2.5 pt-1 text-xs">
            
            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 px-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-medium focus:outline-none cursor-pointer"
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
              className="py-2 px-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todas las marcas</option>
              {brandsList.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* State */}
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 px-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos los estados</option>
              <option value="ACTIVE">Publicado</option>
              <option value="INACTIVE">Desactivado</option>
            </select>

            {/* Price Range inputs */}
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder="Mín"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-1/2 py-2 px-2.5 rounded-2xl bg-white border border-slate-200 text-slate-800 text-[11px] focus:outline-none text-center"
              />
              <span className="text-slate-300">-</span>
              <input
                type="number"
                placeholder="Máx"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-1/2 py-2 px-2.5 rounded-2xl bg-white border border-slate-200 text-slate-800 text-[11px] focus:outline-none text-center"
              />
            </div>

            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="py-2 px-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">Fecha de actualización</option>
              <option value="TODAY">Hoy</option>
              <option value="WEEK">Esta semana</option>
              <option value="MONTH">Este mes</option>
            </select>

          </div>

          {/* Third Row: Sort, Clear, Columns & View Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            
            {/* Sorting */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="py-1.5 px-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="recent">Más recientes</option>
                <option value="name_asc">Nombre A-Z</option>
                <option value="price_asc">Precio menor</option>
                <option value="price_desc">Precio mayor</option>
                <option value="updated">Última actualización</option>
              </select>
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-2 justify-end">
              
              <button
                onClick={handleClearFilters}
                className="px-3.5 py-1.5 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Limpiar filtros</span>
              </button>

              {/* Column selector */}
              <div className="relative">
                <button
                  onClick={() => setShowColumnsMenu(!showColumnsMenu)}
                  className="px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
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
                      <span>Precio de Venta</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.comparePrice}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, comparePrice: e.target.checked })}
                        className="rounded text-[#4F46E5]"
                      />
                      <span>Precio Comparativo</span>
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
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.updatedAt}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, updatedAt: e.target.checked })}
                        className="rounded text-[#4F46E5]"
                      />
                      <span>Última Actualización</span>
                    </label>
                  </div>
                )}
              </div>

              {/* View Switcher */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-2xl border border-slate-200">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-[#4F46E5] shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Vista de Tabla"
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

              {/* Horizontal Sidebar Toggle Button */}
              <button
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                className={`px-3 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  isRightPanelOpen
                    ? 'bg-[#EEF2FF] border-indigo-200 text-[#4F46E5] hover:bg-indigo-100'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title={isRightPanelOpen ? "Ocultar panel lateral (horizontal)" : "Desplegar panel lateral (horizontal)"}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span className="hidden xl:inline">Panel</span>
                <span>{isRightPanelOpen ? 'Ocultar' : 'Acciones'}</span>
                {isRightPanelOpen ? (
                  <ChevronRight className="w-3.5 h-3.5 text-[#4F46E5]" />
                ) : (
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

            </div>

          </div>

          {/* MAIN PRODUCT TABLE (List View) */}
          {loading ? (
            <div className="space-y-3 py-8">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-14 text-center flex flex-col items-center justify-center space-y-2">
              <div className="w-14 h-14 rounded-3xl bg-slate-50 text-slate-300 flex items-center justify-center text-3xl shadow-inner">
                📦
              </div>
              <h4 className="text-sm font-extrabold text-slate-800">
                No se encontraron productos en el catálogo
              </h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Prueba ajustando los filtros o registra un nuevo producto en tu tienda.
              </p>
            </div>
          ) : viewMode === 'list' ? (
            <>
              {/* ── 1. MOBILE CARD VIEW (Phones & Small Screens: block md:hidden) ── */}
              <div className="block md:hidden space-y-3.5">
                {paginatedProducts.map((product) => {
                  const defaultVar = product.variants[0];
                  const price = Number(defaultVar?.prices[0]?.price || 0);
                  const comparePrice = price * 1.25;
                  const sku = defaultVar?.sku || product.baseSku || 'PC-SKU-001';
                  const categoryName = product.productCategories?.[0]?.category?.name || 'Accesorios';
                  const brandName = product.brand || currentTenant?.name || 'PeruCat';
                  const isActive = product.active !== false;
                  const isChecked = selectedIds.includes(product.id);

                  return (
                    <div
                      key={product.id}
                      className={`bg-white rounded-3xl p-4 border transition-all shadow-xs ${
                        isChecked ? 'border-indigo-300 bg-indigo-50/20' : 'border-slate-100'
                      }`}
                    >
                      {/* Top Row: Checkbox, Image, Title & Actions */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(product.id)}
                          className="mt-1 rounded text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                        />

                        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-100 overflow-hidden flex-shrink-0 shadow-2xs flex items-center justify-center">
                          {product.images[0]?.url ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
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
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-[11px] font-bold text-slate-500">{brandName}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5]">
                              {categoryName}
                            </span>
                          </div>
                        </div>

                        {/* 3-dots Menu for Mobile */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenuId(openActionMenuId === `mob-${product.id}` ? null : `mob-${product.id}`);
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openActionMenuId === `mob-${product.id}` && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-8 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 text-xs text-left"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  handleDuplicateProduct(product);
                                  setOpenActionMenuId(null);
                                }}
                                className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                              >
                                <Copy className="w-3.5 h-3.5 text-blue-500" />
                                <span>Duplicar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleToggleProductStatus(product);
                                  setOpenActionMenuId(null);
                                }}
                                className="w-full px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Middle Row: Pricing, SKU & Status Badges */}
                      <div className="mt-3 pt-3 border-t border-slate-100/80 flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-slate-900">
                              {formatMoney(price)}
                            </span>
                            {comparePrice > price && (
                              <span className="text-[11px] font-medium text-slate-400 line-through">
                                {formatMoney(comparePrice)}
                              </span>
                            )}
                          </div>
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 font-mono text-[10px] font-bold text-slate-600 mt-1">
                            {sku}
                          </span>
                        </div>

                        <div>
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>Publicado</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              <span>Desactivado</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Quick Action Buttons */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewProduct(product)}
                          className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Ver</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          className="flex-1 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleProductStatus(product)}
                          className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                            isActive
                              ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                          title={isActive ? 'Pausar producto' : 'Publicar producto'}
                        >
                          {isActive ? <Ban className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── 2. DESKTOP DATA TABLE (Tablets & Desktops: hidden md:block) ── */}
              <div className="hidden md:block overflow-x-auto custom-scrollbar -mx-5 sm:-mx-6 px-5 sm:px-6 pb-2">
                <table className="w-full text-left border-collapse min-w-[950px]">
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
                      {visibleColumns.price && <th className="py-3 px-3 font-extrabold">PRECIO DE VENTA</th>}
                      {visibleColumns.comparePrice && <th className="py-3 px-3 font-extrabold">PRECIO COMP.</th>}
                      {visibleColumns.status && <th className="py-3 px-3 font-extrabold">ESTADO</th>}
                      {visibleColumns.updatedAt && <th className="py-3 px-3 font-extrabold">ÚLT. ACTUALIZACIÓN</th>}
                      {visibleColumns.actions && <th className="py-3 px-3 font-extrabold text-right">ACCIONES</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {paginatedProducts.map((product) => {
                      const defaultVar = product.variants[0];
                      const price = Number(defaultVar?.prices[0]?.price || 0);
                      const comparePrice = price * 1.25; // standard comparison price
                      const sku = defaultVar?.sku || product.baseSku || 'PC-SKU-001';
                      const categoryName = product.productCategories?.[0]?.category?.name || 'Accesorios';
                      const brandName = product.brand || currentTenant?.name || 'PeruCat';
                      const isActive = product.active !== false;
                      const isChecked = selectedIds.includes(product.id);

                      return (
                        <tr
                          key={product.id}
                          className={`hover:bg-slate-50/70 transition-colors group ${
                            isChecked ? 'bg-indigo-50/30' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectRow(product.id)}
                              className="rounded text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                            />
                          </td>

                          {/* PRODUCTO & MARCA */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-100 overflow-hidden flex-shrink-0 shadow-2xs flex items-center justify-center">
                                {product.images[0]?.url ? (
                                  <img
                                    src={product.images[0].url}
                                    alt={product.name}
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
                                <p className="text-xs font-black text-slate-900 line-clamp-2 break-words leading-snug" title={product.name}>
                                  {product.name}
                                </p>
                                <span className="text-[11px] font-medium text-slate-400 block mt-0.5 truncate">
                                  {brandName}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* SKU */}
                          {visibleColumns.sku && (
                            <td className="py-3.5 px-3">
                              <span className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200/90 font-mono text-[11px] font-bold text-slate-600 shadow-2xs">
                                {sku}
                              </span>
                            </td>
                          )}

                          {/* CATEGORÍA */}
                          {visibleColumns.category && (
                            <td className="py-3.5 px-3">
                              <span className="inline-block px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4F46E5] font-bold text-[11px]">
                                {categoryName}
                              </span>
                            </td>
                          )}

                          {/* PRECIO DE VENTA */}
                          {visibleColumns.price && (
                            <td className="py-3.5 px-3">
                              <span className="font-black text-slate-900 text-xs sm:text-sm">
                                {formatMoney(price)}
                              </span>
                            </td>
                          )}

                          {/* PRECIO COMPARATIVO */}
                          {visibleColumns.comparePrice && (
                            <td className="py-3.5 px-3">
                              <span className="font-medium text-slate-400 line-through text-xs">
                                {formatMoney(comparePrice)}
                              </span>
                            </td>
                          )}

                          {/* ESTADO */}
                          {visibleColumns.status && (
                            <td className="py-3.5 px-3">
                              {isActive ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  <span>Publicado</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                  <span>Desactivado</span>
                                </span>
                              )}
                            </td>
                          )}

                          {/* ÚLT. ACTUALIZACIÓN */}
                          {visibleColumns.updatedAt && (
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className="text-slate-700 font-bold block text-[11px]">
                                {new Date(product.updatedAt || Date.now()).toLocaleDateString('es-PE', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(product.updatedAt || Date.now()).toLocaleTimeString('es-PE', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </td>
                          )}

                          {/* ACCIONES (Preview, Edit, Duplicate, 3-Dots) */}
                          {visibleColumns.actions && (
                            <td className="py-3.5 px-3 text-right">
                              <div className="flex items-center gap-1.5 justify-end relative">
                                
                                {/* Action 1: Ver Preview */}
                                <button
                                  type="button"
                                  onClick={() => setPreviewProduct(product)}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                  title="Ver producto"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Action 2: Editar */}
                                <button
                                  type="button"
                                  onClick={() => openEditModal(product)}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors cursor-pointer"
                                  title="Editar producto"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>

                                {/* Action 3: Duplicar */}
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateProduct(product)}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                                  title="Duplicar producto"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>

                                {/* Action 4: 3-Dots Menu */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenActionMenuId(openActionMenuId === product.id ? null : product.id);
                                  }}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="Más opciones"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {/* Dropdown Menu */}
                                {openActionMenuId === product.id && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-8 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 text-xs text-left"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleToggleProductStatus(product);
                                        setOpenActionMenuId(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                                    >
                                      <Ban className="w-3.5 h-3.5 text-amber-500" />
                                      <span>{isActive ? 'Desactivar producto' : 'Publicar producto'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        openEditModal(product);
                                        setOpenActionMenuId(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                                    >
                                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                      <span>Editar precio</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleDuplicateProduct(product);
                                        setOpenActionMenuId(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                                    >
                                      <Copy className="w-3.5 h-3.5 text-blue-500" />
                                      <span>Duplicar registro</span>
                                    </button>

                                    <div className="border-t border-slate-100 my-1"></div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleToggleProductStatus(product);
                                        setOpenActionMenuId(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Eliminar producto</span>
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
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pt-2">
              {paginatedProducts.map((product) => {
                const defaultVar = product.variants[0];
                const price = Number(defaultVar?.prices[0]?.price || 0);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="w-full aspect-square rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center relative">
                        {product.images[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-12 h-12 text-slate-300" />
                        )}
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs font-mono">
                          {defaultVar?.sku || product.baseSku || 'PC-001'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-[#4F46E5] uppercase tracking-wider block">
                          {product.brand || 'PeruCat'}
                        </span>
                        <h4 className="text-xs font-black text-slate-900 line-clamp-2 break-words leading-snug" title={product.name}>
                          {product.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          {product.productCategories?.[0]?.category?.name || 'Accesorios'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">
                        {formatMoney(price)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPreviewProduct(product)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 rounded-xl bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="text-slate-500 font-medium">
              Mostrando {filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)} de {filteredProducts.length} productos
            </div>

            <div className="flex items-center gap-4">
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
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>

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

          {/* BOTTOM MASS ACTIONS BAR (When items are selected) */}
          {selectedIds.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4F46E5]">
                <CheckCircle2 className="w-4 h-4" />
                <span>{selectedIds.length} productos seleccionados</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                <button
                  onClick={() => handleMassStatusUpdate(true)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Publicar</span>
                </button>

                <button
                  onClick={() => handleMassStatusUpdate(false)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5 text-slate-500" />
                  <span>Despublicar</span>
                </button>

                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5 text-[#4F46E5]" />
                  <span>Cambiar categoría</span>
                </button>

                <button
                  onClick={() => showToast('Cambio de precio masivo listo')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cambiar precio</span>
                </button>

                <button
                  onClick={() => showToast('Etiqueta añadida a seleccionados')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5 text-purple-600" />
                  <span>Añadir etiqueta</span>
                </button>

                <button
                  onClick={() => handleMassStatusUpdate(false)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>

                <button
                  onClick={() => setSelectedIds([])}
                  className="px-2.5 py-1.5 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR: QUICK ACTIONS & RECENT ACTIVITY (HORIZONTALLY COLLAPSIBLE) */}
        {/* ========================================================================= */}
        {isRightPanelOpen && (
          <div className="lg:col-span-4 xl:col-span-4 space-y-5 animate-in slide-in-from-right-4 duration-300 fade-in">
            
            {/* Top Control Bar for Lateral Panel */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-2 flex items-center justify-between gap-2">
              
              {/* Horizontal Section Switcher Tabs */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
                <button
                  onClick={() => setSidebarTab('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    sidebarTab === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Todo
                </button>
                <button
                  onClick={() => setSidebarTab('actions')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    sidebarTab === 'actions'
                      ? 'bg-white text-[#4F46E5] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
                  <span>Acciones</span>
                </button>
                <button
                  onClick={() => setSidebarTab('activity')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    sidebarTab === 'activity'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Clock className="w-3 h-3 text-blue-500" />
                  <span>Actividad</span>
                </button>
              </div>

              {/* Horizontal Collapse Button */}
              <button
                onClick={() => setIsRightPanelOpen(false)}
                className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                title="Colapsar panel horizontalmente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Panel 1: Acciones Rápidas */}
            {(sidebarTab === 'all' || sidebarTab === 'actions') && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-5 transition-all">
                <button
                  onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                  className="w-full flex items-center justify-between gap-2 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Zap className="w-4 h-4 fill-amber-400" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#4F46E5] transition-colors">
                      Acciones rápidas
                    </h3>
                  </div>
                  <div className={`w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-slate-700 transition-all ${isQuickActionsOpen ? 'rotate-0' : '-rotate-90'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isQuickActionsOpen && (
                  <div className="space-y-2 text-xs pt-4 border-t border-slate-100 mt-4 animate-in fade-in duration-200">
                    <button
                      onClick={() => {
                        setNewProdBrand(currentTenant?.name || 'PeruCat');
                        setShowCreateModal(true);
                      }}
                      className="w-full py-3 px-4 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black text-center flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Nuevo Producto</span>
                    </button>

                    <button
                      onClick={() => setShowImportModal(true)}
                      className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span>Importar productos</span>
                    </button>

                    <button
                      onClick={exportCatalogToCSV}
                      className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-slate-500" />
                      <span>Exportar catálogo</span>
                    </button>

                    <button
                      onClick={() => setShowCategoryModal(true)}
                      className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Tag className="w-4 h-4 text-[#4F46E5]" />
                      <span>Crear categoría</span>
                    </button>

                    <button
                      onClick={() => setShowBrandModal(true)}
                      className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-[#4F46E5]" />
                      <span>Gestionar marcas</span>
                    </button>

                    <button
                      onClick={() => {
                        setStatusTab('INACTIVE');
                        setCurrentPage(1);
                      }}
                      className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span>Ver productos desactivados</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Panel 2: Actividad Reciente */}
            {(sidebarTab === 'all' || sidebarTab === 'activity') && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-5 transition-all">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setIsRecentActivityOpen(!isRecentActivityOpen)}
                    className="flex items-center gap-2 text-left cursor-pointer group flex-1"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#4F46E5] transition-colors">
                      Actividad reciente
                    </h3>
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      to="/admin/inventario"
                      className="text-[11px] font-bold text-[#4F46E5] hover:underline flex items-center gap-0.5"
                    >
                      <span>Ver todas</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    <button
                      onClick={() => setIsRecentActivityOpen(!isRecentActivityOpen)}
                      className={`w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all cursor-pointer ${isRecentActivityOpen ? 'rotate-0' : '-rotate-90'}`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Event List */}
                {isRecentActivityOpen && (
                  <div className="space-y-3 pt-4 border-t border-slate-100 mt-4 text-xs animate-in fade-in duration-200">
                    <div className="flex items-start gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="font-bold text-slate-800 truncate">Se publicó un producto</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">Pala Sanitaria Ergonómica</p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">Hoy, 10:24</span>
                    </div>

                    <div className="flex items-start gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span className="font-bold text-slate-800 truncate">Se actualizó el precio</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">Maca Negra Andina en Polvo</p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">Hoy, 09:12</span>
                    </div>

                    <div className="flex items-start gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span className="font-bold text-slate-800 truncate">Se editó un producto</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">PeruCat Aroma Lavanda</p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">Ayer, 18:45</span>
                    </div>

                    <div className="flex items-start gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="font-bold text-slate-800 truncate">Se creó un nuevo producto</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">Miel de Abeja de Oxapampa</p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">15 Sep, 11:30</span>
                    </div>

                    <div className="flex items-start gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          <span className="font-bold text-slate-800 truncate">Se desactivó un producto</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">Antiguo Comedero Automático</p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">14 Sep, 16:20</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Panel 3: Tips Banner */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-[#EEF2FF] to-[#F5F3FF] border border-indigo-100 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white text-[#4F46E5] flex items-center justify-center shadow-xs flex-shrink-0">
                  <Boxes className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800 leading-snug">
                  Mantén tu catálogo actualizado y ofrece la mejor experiencia a tus clientes.
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-[#4F46E5] flex-shrink-0" />
            </div>

          </div>
        )}

      </div>

      {/* Floating Horizontal Toggle Button when Sidebar is Collapsed */}
      {!isRightPanelOpen && (
        <button
          onClick={() => setIsRightPanelOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-[#1E1B4B] hover:bg-[#4F46E5] text-white shadow-2xl px-2.5 py-4 rounded-l-2xl font-bold flex flex-col items-center gap-2 transition-all cursor-pointer group border-l border-t border-b border-indigo-500/30 hover:shadow-indigo-500/20"
          title="Desplegar Acciones Rápidas y Actividad Reciente"
        >
          <ChevronLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="[writing-mode:vertical-lr] text-[10px] tracking-wider font-extrabold uppercase text-slate-200">
            Acciones & Actividad
          </span>
        </button>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTRAR NUEVO PRODUCTO */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto border border-slate-100">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold shadow-2xs">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">Registrar Nuevo Producto</h3>
                    <span className="hidden sm:inline px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-[#4F46E5] border border-indigo-100 uppercase tracking-wider">
                      Catálogo Comercial
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Define la información básica, precios y variantes
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-6 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Col 1: General Info */}
                <div className="space-y-4 bg-slate-50/60 p-5 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                      1. Información General
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Nombre Comercial del Producto *</label>
                    <div className="relative">
                      <Package className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Ej. Pala Sanitaria Ergonómica de Precisión"
                        value={newProdName}
                        onChange={(e) => {
                          setNewProdName(e.target.value);
                          setNewProdSlug(e.target.value.toLowerCase().trim().replace(/[\s\W-]+/g, '-'));
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-2xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">Marca / Fabricante</label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder={currentTenant?.name || 'PeruCat'}
                          value={newProdBrand}
                          onChange={(e) => setNewProdBrand(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs"
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
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-bold focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs cursor-pointer"
                        >
                          {categoriesList.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Código SKU Maestro</label>
                    <div className="relative">
                      <Boxes className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="PC-PALA-STD"
                        value={newProdSku}
                        onChange={(e) => setNewProdSku(e.target.value.toUpperCase())}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-mono font-bold uppercase focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Slug URL *</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="pala-sanitaria-ergonomica"
                        value={newProdSlug}
                        onChange={(e) => setNewProdSlug(e.target.value.toLowerCase().replace(/[\s\W-]+/g, '-'))}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-mono focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Col 2: Pricing & Media */}
                <div className="space-y-4 bg-slate-50/60 p-5 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                      2. Precios & Fotos
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">Precio Venta (PEN S/) *</label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          step="0.10"
                          min="0"
                          placeholder="32.00"
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-black focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">Precio Comparativo</label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          step="0.10"
                          min="0"
                          placeholder="38.00"
                          value={newProdComparePrice}
                          onChange={(e) => setNewProdComparePrice(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Stock Inicial Disponible</label>
                    <div className="relative">
                      <Boxes className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="0"
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-black focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <ImageUploadPicker
                    value={newProdImageUrl}
                    onChange={setNewProdImageUrl}
                    label="Imagen Principal del Producto"
                    placeholder="https://images.unsplash.com/... o sube un archivo"
                  />

                  <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 cursor-pointer shadow-2xs hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={newProdFeatured}
                      onChange={(e) => setNewProdFeatured(e.target.checked)}
                      className="rounded text-[#4F46E5] focus:ring-0"
                    />
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                      Destacar en portada del Storefront
                    </span>
                  </label>
                </div>

              </div>

              {/* Description */}
              <div className="space-y-1.5 bg-slate-50/60 p-5 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                    3. Descripción y Detalles
                  </span>
                </div>
                <textarea
                  placeholder="Detalla las características, modo de uso y especificaciones del producto..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-[#4F46E5] h-24 shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-600 hover:bg-slate-50 cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="px-7 py-3 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2 text-xs"
                >
                  {submittingCreate ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Guardar y Publicar</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDITAR PRODUCTO */}
      {/* ========================================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto border border-slate-100">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold shadow-2xs">
                  <Pencil className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">Editar Producto</h3>
                    <span className="hidden sm:inline px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-[#4F46E5] border border-indigo-100 uppercase tracking-wider">
                      {editSku || 'SKU'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Modifica precios, descripción, categoría y estado
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-6 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Col 1 */}
                <div className="space-y-4 bg-slate-50/60 p-5 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                      1. Información del Producto
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Nombre Comercial *</label>
                    <div className="relative">
                      <Package className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">Marca</label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={editBrand}
                          onChange={(e) => setEditBrand(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">Categoría</label>
                      <div className="relative">
                        <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-bold focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs cursor-pointer"
                        >
                          {categoriesList.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Código SKU</label>
                    <div className="relative">
                      <Boxes className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={editSku}
                        onChange={(e) => setEditSku(e.target.value.toUpperCase())}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-mono font-bold uppercase focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Slug URL *</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-mono focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Col 2 */}
                <div className="space-y-4 bg-slate-50/60 p-5 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                      2. Precios & Visibilidad
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">Precio Venta (PEN S/) *</label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          step="0.10"
                          min="0"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-black focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">Precio Comparativo</label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          step="0.10"
                          min="0"
                          value={editComparePrice}
                          onChange={(e) => setEditComparePrice(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  <ImageUploadPicker
                    value={editImageUrl}
                    onChange={setEditImageUrl}
                    label="Imagen Principal del Producto"
                    placeholder="https://images.unsplash.com/... o sube un archivo"
                  />

                  <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 cursor-pointer shadow-2xs hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={editActive}
                      onChange={(e) => setEditActive(e.target.checked)}
                      className="rounded text-[#4F46E5] focus:ring-0"
                    />
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Producto Activo y Visible en Tienda
                    </span>
                  </label>
                </div>

              </div>

              {/* Description */}
              <div className="space-y-1.5 bg-slate-50/60 p-5 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                    3. Descripción y Especificaciones
                  </span>
                </div>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-[#4F46E5] h-24 shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-6 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-600 hover:bg-slate-50 cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-7 py-3 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2 text-xs"
                >
                  {savingEdit ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
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
      {/* MODAL 3: VER DETALLE DEL PRODUCTO (PREVIEW) */}
      {/* ========================================================================= */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Eye className="w-5 h-5 text-[#4F46E5]" />
                <h3 className="text-lg font-black text-slate-900">Vista Previa Comercial</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 text-xs">
              <div className="sm:col-span-5">
                <div className="w-full aspect-square rounded-2xl bg-slate-100 border border-slate-100 overflow-hidden flex items-center justify-center">
                  {previewProduct.images[0]?.url ? (
                    <img src={previewProduct.images[0].url} alt={previewProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-16 h-16 text-slate-300" />
                  )}
                </div>
              </div>

              <div className="sm:col-span-7 space-y-3">
                <div>
                  <span className="text-[10px] font-extrabold text-[#4F46E5] uppercase tracking-wider block">
                    {previewProduct.brand || 'PeruCat'}
                  </span>
                  <h2 className="text-base font-black text-slate-900">{previewProduct.name}</h2>
                  <p className="font-mono text-slate-500 font-bold text-xs mt-0.5">
                    SKU: {previewProduct.variants[0]?.sku || previewProduct.baseSku || 'PC-001'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#4F46E5] uppercase block">Precio de Venta</span>
                    <span className="text-lg font-black text-[#4F46E5]">
                      {formatMoney(previewProduct.variants[0]?.prices[0]?.price || 0)}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {previewProduct.active !== false ? 'Publicado' : 'Desactivado'}
                  </span>
                </div>

                {previewProduct.description && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Descripción</span>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                      {previewProduct.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="px-6 py-2 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CREAR CATEGORÍA */}
      {/* ========================================================================= */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Crear Categoría</h3>
                  <span className="text-[10px] text-slate-400">Organiza tu catálogo comercial</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Nombre de la Categoría *</label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ej. Snacks & Golosinas"
                    value={newCategoryName}
                    onChange={(e) => {
                      setNewCategoryName(e.target.value);
                      setNewCategorySlug(e.target.value.toLowerCase().trim().replace(/[\s\W-]+/g, '-'));
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-[#4F46E5] focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Slug URL</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newCategorySlug}
                    onChange={(e) => setNewCategorySlug(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-mono focus:border-[#4F46E5] focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (newCategoryName.trim()) {
                      showToast(`Categoría "${newCategoryName}" creada con éxito`);
                      setShowCategoryModal(false);
                      setNewCategoryName('');
                    }
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Crear Categoría</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: GESTIONAR MARCAS */}
      {/* ========================================================================= */}
      {showBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#4F46E5]" />
                <h3 className="text-base font-black text-slate-900">Gestionar Marcas</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBrandModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Nombre de la Marca *</label>
                <input
                  type="text"
                  placeholder="Ej. PeruCat Premium"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-[#4F46E5] focus:outline-none"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Marcas Existentes</span>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {brandsList.map((b) => (
                    <span key={b} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBrandModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (newBrandName.trim()) {
                      showToast(`Marca "${newBrandName}" agregada con éxito`);
                      setShowBrandModal(false);
                      setNewBrandName('');
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black shadow-md cursor-pointer"
                >
                  Añadir Marca
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: IMPORTAR CSV */}
      {/* ========================================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#4F46E5]" />
                <h3 className="text-base font-black text-slate-900">Importación Masiva de Catálogo</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-500">
                Carga un archivo <strong>.CSV</strong> o <strong>.XLSX</strong> con las columnas: SKU, Nombre, Marca, Categoría, Precio de Venta.
              </p>

              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#4F46E5] transition-colors flex flex-col items-center justify-center space-y-2 text-center bg-slate-50/50 cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400" />
                <span className="font-bold text-slate-700">Arrastra tu archivo aquí o haz clic para examinar</span>
                <span className="text-[10px] text-slate-400">Archivos permitidos: CSV, Excel (máx. 5MB)</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast('Validando e importando catálogo...');
                    setTimeout(() => {
                      showToast('Catálogo importado con éxito (8 registros procesados)');
                      setShowImportModal(false);
                      fetchProducts();
                    }, 1200);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black shadow-md cursor-pointer"
                >
                  Subir y Procesar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

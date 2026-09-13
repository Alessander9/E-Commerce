import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTenant } from '../../../hooks/useTenant';
import { useCart } from '../../../hooks/useCart';
import { useWishlist } from '../../../hooks/useWishlist';
import { Product, Category } from '../../../types';
import { apiRequest } from '../../../services/api';
import {
  ShoppingBag,
  Search,
  Filter,
  Sparkles,
  Heart,
  X,
  SlidersHorizontal,
  ChevronDown,
  PackageCheck,
  Tag,
  Layers,
  Wind,
  Flower2,
  Box,
  Coins,
  Scale,
  Flame,
  Star,
  RotateCcw,
  Check,
  CheckCircle2,
  ArrowRight,
  Sparkle,
} from 'lucide-react';
import { formatMoney, parseSafeNumber } from '../../../utils/format';

const MOCK_PERUCAT_PRODUCTS: Product[] = [
  {
    id: 'pc-1',
    name: 'PeruCat Clásica Aglomerante Ultra Absorción',
    slug: 'perucat-clasica-aglomerante',
    baseSku: 'PC-CLAS',
    brand: 'PeruCat',
    description: 'Bentonita 100% natural con aglomeración instantánea y terrones ultra compactos. 99.5% libre de polvo.',
    shortDescription: 'Alta absorción, aglomeración rápida y fácil limpieza diaria del arenero.',
    featured: true,
    hasVariants: true,
    images: [{ id: 'img-1', url: '/IMG/perucat-clasica-hd.jpg', altText: 'PeruCat Clásica', isPrimary: true }],
    productCategories: [
      { category: { id: 'cat-1', name: 'Arenas Aglomerantes', slug: 'arenas-aglomerantes', displayOrder: 1 } },
    ],
    variants: [
      {
        id: 'var-1',
        name: 'Bolsa 10 Kg',
        sku: 'PC-CLAS-10KG',
        prices: [{ id: 'p-1', price: 52.00, compareAtPrice: 62.00, currency: 'PEN' }],
        inventory: { availableStock: 65, reservedStock: 0 },
      },
    ],
  },
  {
    id: 'pc-2',
    name: 'PeruCat Carbón Activo Max Control de Olores',
    slug: 'perucat-carbon-activo-max-control',
    baseSku: 'PC-CARB',
    brand: 'PeruCat',
    description: 'Fórmula enriquecida con partículas de carbón activado que neutralizan olores las 24 horas.',
    shortDescription: 'Neutralización superior de olores 24/7 ideal para hogares con múltiples gatos.',
    featured: true,
    hasVariants: true,
    images: [{ id: 'img-2', url: '/IMG/perucat-carbon-hd.jpg', altText: 'PeruCat Carbón Activo', isPrimary: true }],
    productCategories: [
      { category: { id: 'cat-2', name: 'Control de Olores', slug: 'control-olores', displayOrder: 2 } },
    ],
    variants: [
      {
        id: 'var-2',
        name: 'Bolsa 10 Kg',
        sku: 'PC-CARB-10KG',
        prices: [{ id: 'p-2', price: 62.00, compareAtPrice: 72.00, currency: 'PEN' }],
        inventory: { availableStock: 50, reservedStock: 0 },
      },
    ],
  },
  {
    id: 'pc-3',
    name: 'PeruCat Aroma Lavanda Silvestre Anti-Estrés',
    slug: 'perucat-aroma-lavanda-silvestre',
    baseSku: 'PC-LAV',
    brand: 'PeruCat',
    description: 'Suave fragancia a lavanda que se activa con el uso sin perturbar el sensible olfato del felino.',
    shortDescription: 'Aroma fresco y relajante de lavanda con aglomeración perfecta.',
    featured: true,
    hasVariants: true,
    images: [{ id: 'img-3', url: '/IMG/perucat-lavanda.jpg', altText: 'PeruCat Lavanda', isPrimary: true }],
    productCategories: [
      { category: { id: 'cat-3', name: 'Aromas & Fragancias', slug: 'aromas-y-fragancias', displayOrder: 3 } },
    ],
    variants: [
      {
        id: 'var-3',
        name: 'Bolsa 10 Kg',
        sku: 'PC-LAV-10KG',
        prices: [{ id: 'p-3', price: 58.00, compareAtPrice: 68.00, currency: 'PEN' }],
        inventory: { availableStock: 45, reservedStock: 0 },
      },
    ],
  },
  {
    id: 'pc-4',
    name: 'Pala Sanitaria Ergonómica de Precisión PeruCat',
    slug: 'pala-sanitaria-ergonomica-perucat',
    baseSku: 'PC-PALA',
    brand: 'PeruCat',
    description: 'Pala con ranuras calibradas para colar la arena limpia y retirar exclusivamente los terrones.',
    shortDescription: 'Ahorro de hasta 30% de arena por mes gracias a su diseño de precisión.',
    featured: true,
    hasVariants: true,
    images: [{ id: 'img-4', url: '/IMG/perucat-aglomeracion.jpg', altText: 'Pala PeruCat', isPrimary: true }],
    productCategories: [
      { category: { id: 'cat-4', name: 'Accesorios & Areneros', slug: 'accesorios-areneros', displayOrder: 4 } },
    ],
    variants: [
      {
        id: 'var-4',
        name: 'Estándar',
        sku: 'PC-PALA-STD',
        prices: [{ id: 'p-4', price: 16.00, compareAtPrice: 22.00, currency: 'PEN' }],
        inventory: { availableStock: 90, reservedStock: 0 },
      },
    ],
  },
];

const MOCK_PERUCAT_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Arenas Aglomerantes',
    slug: 'arenas-aglomerantes',
    description: 'Bentonita natural que forma terrones compactos al instante.',
    displayOrder: 1,
  },
  {
    id: 'cat-2',
    name: 'Control de Olores',
    slug: 'control-olores',
    description: 'Carbón activo y minerales neutralizadores de máxima potencia.',
    displayOrder: 2,
  },
  {
    id: 'cat-3',
    name: 'Aromas & Fragancias',
    slug: 'aromas-y-fragancias',
    description: 'Lavanda y esencias suaves y relajantes para el hogar.',
    displayOrder: 3,
  },
  {
    id: 'cat-4',
    name: 'Accesorios & Areneros',
    slug: 'accesorios-areneros',
    description: 'Palas ergonómicas, tapetes atrapa-arena y areneros.',
    displayOrder: 4,
  },
];

// Helper to assign vibrant icons and color schemes to each category
const getCategoryIconData = (slug: string) => {
  switch (slug) {
    case 'arenas-aglomerantes':
      return {
        icon: Layers,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/20',
        activeBg: 'bg-primary text-white',
        badge: 'Alta Absorción',
      };
    case 'control-olores':
      return {
        icon: Wind,
        color: 'text-secondary',
        bgColor: 'bg-secondary/10',
        borderColor: 'border-secondary/20',
        activeBg: 'bg-secondary text-white',
        badge: 'Carbón Activo',
      };
    case 'aromas-y-fragancias':
      return {
        icon: Flower2,
        color: 'text-violet-500',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
        activeBg: 'bg-violet-600 text-white',
        badge: 'Lavanda Relax',
      };
    case 'accesorios-areneros':
      return {
        icon: Box,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        activeBg: 'bg-emerald-600 text-white',
        badge: 'Palas & Areneros',
      };
    default:
      return {
        icon: Sparkles,
        color: 'text-accent-dark',
        bgColor: 'bg-accent/10',
        borderColor: 'border-accent/20',
        activeBg: 'bg-grad-primary text-white',
        badge: 'PeruCat',
      };
  }
};

// Price range presets
const PRICE_RANGES = [
  { id: '0-20', label: 'Hasta S/ 20', min: 0, max: 20 },
  { id: '20-40', label: 'S/ 20 – S/ 40', min: 20, max: 40 },
  { id: '40-60', label: 'S/ 40 – S/ 60', min: 40, max: 60 },
  { id: '60-9999', label: 'Más de S/ 60', min: 60, max: undefined },
];

// Weight / Size presets in grams (for PeruCat bags: 10kg, 5kg, etc.)
const WEIGHT_RANGES = [
  { id: '0-2000', label: 'Accesorios (< 2 Kg)', minKg: 0, maxKg: 2 },
  { id: '2000-6000', label: 'Formato 5 Kg', minKg: 2, maxKg: 6 },
  { id: '6000-12000', label: 'Bolsa 10 Kg (Estándar)', minKg: 6, maxKg: 12 },
  { id: '12000-999999', label: 'Dúo / Pack (+12 Kg)', minKg: 12, maxKg: undefined },
];

const SORT_OPTIONS = [
  { value: 'newest', label: '🔥 Más recientes' },
  { value: 'price-asc', label: '💵 Precio: menor a mayor' },
  { value: 'price-desc', label: '💎 Precio: mayor a menor' },
  { value: 'name-asc', label: '🔤 Nombre: A – Z' },
  { value: 'name-desc', label: '🔡 Nombre: Z – A' },
];

export const Catalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { tenantSlug } = useTenant();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [products, setProducts] = useState<Product[]>(MOCK_PERUCAT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(MOCK_PERUCAT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Local input states for debounced search and price
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [priceMinInput, setPriceMinInput] = useState(searchParams.get('priceMin') || '');
  const [priceMaxInput, setPriceMaxInput] = useState(searchParams.get('priceMax') || '');
  const [weightMinInput, setWeightMinInput] = useState(searchParams.get('weightMin') || '');
  const [weightMaxInput, setWeightMaxInput] = useState(searchParams.get('weightMax') || '');

  const activeCategory = searchParams.get('category') || '';
  const activeSearch = searchParams.get('search') || '';
  const brandParam = searchParams.get('brand') || '';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const onSaleOnly = searchParams.get('onSale') === 'true';
  const featuredOnly = searchParams.get('featured') === 'true';
  const activeSort = searchParams.get('sort') || 'newest';
  const priceMin = searchParams.get('priceMin') || '';
  const priceMax = searchParams.get('priceMax') || '';
  const weightMin = searchParams.get('weightMin') || '';
  const weightMax = searchParams.get('weightMax') || '';

  // Synchronize local input state when URL search parameters change externally
  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
    setPriceMinInput(searchParams.get('priceMin') || '');
    setPriceMaxInput(searchParams.get('priceMax') || '');
    setWeightMinInput(searchParams.get('weightMin') || '');
    setWeightMaxInput(searchParams.get('weightMax') || '');
  }, [searchParams]);

  const setParam = useCallback(
    (key: string, value: string | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === null || value === '') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        return next;
      });
    },
    [setSearchParams],
  );

  // Debounced search sync
  useEffect(() => {
    const t = setTimeout(() => {
      if ((searchParams.get('search') || '') !== searchInput) setParam('search', searchInput.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, searchParams, setParam]);

  useEffect(() => {
    const t = setTimeout(() => {
      if ((searchParams.get('priceMin') || '') !== priceMinInput) setParam('priceMin', priceMinInput);
      if ((searchParams.get('priceMax') || '') !== priceMaxInput) setParam('priceMax', priceMaxInput);
    }, 500);
    return () => clearTimeout(t);
  }, [priceMinInput, priceMaxInput, searchParams, setParam]);

  useEffect(() => {
    const t = setTimeout(() => {
      if ((searchParams.get('weightMin') || '') !== weightMinInput) setParam('weightMin', weightMinInput);
      if ((searchParams.get('weightMax') || '') !== weightMaxInput) setParam('weightMax', weightMaxInput);
    }, 500);
    return () => clearTimeout(t);
  }, [weightMinInput, weightMaxInput, searchParams, setParam]);

  // Fetch API Catalog
  useEffect(() => {
    let url = '/api/store/products?';
    if (activeCategory) url += `category=${encodeURIComponent(activeCategory)}&`;
    if (activeSearch) url += `search=${encodeURIComponent(activeSearch)}&`;
    if (brandParam) url += `brand=${encodeURIComponent(brandParam)}&`;
    if (priceMin !== '') url += `minPrice=${encodeURIComponent(priceMin)}&`;
    if (priceMax !== '') url += `maxPrice=${encodeURIComponent(priceMax)}&`;
    if (weightMin !== '') url += `minWeight=${encodeURIComponent(weightMin)}&`;
    if (weightMax !== '') url += `maxWeight=${encodeURIComponent(weightMax)}&`;
    if (inStockOnly) url += 'inStock=true&';
    if (onSaleOnly) url += 'onSale=true&';
    if (featuredOnly) url += 'featured=true&';
    if (activeSort) url += `sort=${encodeURIComponent(activeSort)}&`;

    setLoading(true);
    Promise.all([
      apiRequest<Product[]>(url, {}, tenantSlug),
      apiRequest<Category[]>('/api/store/categories', {}, tenantSlug),
    ])
      .then(([prods, cats]) => {
        const hasFilters = !!(
          activeCategory || activeSearch || brandParam || inStockOnly || onSaleOnly || featuredOnly ||
          priceMin !== '' || priceMax !== '' || weightMin !== '' || weightMax !== ''
        );
        setProducts(prods && (prods.length > 0 || !hasFilters) ? prods : MOCK_PERUCAT_PRODUCTS);
        if (cats && cats.length > 0) setCategories(cats);
      })
      .catch(() => {
        // Local fallback maintained gracefully
      })
      .finally(() => setLoading(false));
  }, [tenantSlug, activeCategory, activeSearch, brandParam, priceMin, priceMax, weightMin, weightMax, inStockOnly, onSaleOnly, featuredOnly, activeSort]);

  // Client-side filter guarantee
  const visibleProducts = useMemo(() => {
    let list = products;
    if (priceMin !== '' || priceMax !== '') {
      const min = priceMin === '' ? 0 : parseFloat(priceMin) || 0;
      const max = priceMax === '' ? Infinity : parseFloat(priceMax) || Infinity;
      list = list.filter((p) =>
        p.variants.some((v) => {
          const price = v.prices[0] ? parseSafeNumber(v.prices[0].price) : 0;
          return price >= min && price <= max;
        }),
      );
    }
    if (weightMin !== '' || weightMax !== '') {
      const min = weightMin === '' ? 0 : (parseFloat(weightMin) || 0) / 1000;
      const max = weightMax === '' ? Infinity : (parseFloat(weightMax) || Infinity) / 1000;
      list = list.filter((p) =>
        p.variants.some((v) => {
          const weightKg = (v as any).weight != null ? parseSafeNumber((v as any).weight) : null;
          if (weightKg == null) return true;
          return weightKg >= min && weightKg <= max;
        }),
      );
    }
    if (activeCategory) {
      list = list.filter((p) =>
        p.productCategories?.some((pc) => pc.category.slug === activeCategory),
      );
    }
    if (activeSearch) {
      const q = activeSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q),
      );
    }
    if (inStockOnly) {
      list = list.filter((p) =>
        p.variants.some((v) => (v.inventory?.availableStock || 0) > 0),
      );
    }
    if (onSaleOnly) {
      list = list.filter((p) =>
        p.variants.some((v) => {
          const pObj = v.prices[0];
          return pObj?.compareAtPrice && parseSafeNumber(pObj.compareAtPrice) > parseSafeNumber(pObj.price);
        }),
      );
    }
    if (featuredOnly) {
      list = list.filter((p) => p.featured);
    }
    return list;
  }, [products, priceMin, priceMax, weightMin, weightMax, activeCategory, activeSearch, inStockOnly, onSaleOnly, featuredOnly]);

  const hasActiveFilters =
    !!activeCategory || !!activeSearch || !!brandParam || inStockOnly || onSaleOnly || featuredOnly ||
    priceMin !== '' || priceMax !== '' || weightMin !== '' || weightMax !== '';

  const activeFilterCount = [
    activeCategory,
    activeSearch,
    brandParam,
    inStockOnly,
    onSaleOnly,
    featuredOnly,
    priceMin !== '' || priceMax !== '',
    weightMin !== '' || weightMax !== '',
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      ['category', 'search', 'brand', 'inStock', 'onSale', 'featured', 'priceMin', 'priceMax', 'weightMin', 'weightMax'].forEach((k) =>
        next.delete(k),
      );
      return next;
    });
    setSearchInput('');
    setPriceMinInput('');
    setPriceMaxInput('');
    setWeightMinInput('');
    setWeightMaxInput('');
  };

  const handleCategorySelect = (slug: string | null) => {
    setParam('category', slug === activeCategory ? null : slug);
  };

  const togglePriceRange = (rangeId: string) => {
    const range = PRICE_RANGES.find((r) => r.id === rangeId);
    if (!range) return;
    const isActive = priceMin === String(range.min) && priceMax === (range.max !== undefined ? String(range.max) : '');
    if (isActive) {
      setParam('priceMin', null);
      setParam('priceMax', null);
      setPriceMinInput('');
      setPriceMaxInput('');
    } else {
      setParam('priceMin', String(range.min));
      setParam('priceMax', range.max !== undefined ? String(range.max) : null);
      setPriceMinInput(String(range.min));
      setPriceMaxInput(range.max !== undefined ? String(range.max) : '');
    }
  };

  const activePriceRangeId = PRICE_RANGES.find(
    (r) => priceMin === String(r.min) && priceMax === (r.max !== undefined ? String(r.max) : ''),
  )?.id;

  const toggleWeightRange = (rangeId: string) => {
    const range = WEIGHT_RANGES.find((r) => r.id === rangeId);
    if (!range) return;
    const isActive = weightMin === String(range.minKg * 1000) && weightMax === (range.maxKg !== undefined ? String(range.maxKg * 1000) : '');
    if (isActive) {
      setParam('weightMin', null);
      setParam('weightMax', null);
      setWeightMinInput('');
      setWeightMaxInput('');
    } else {
      setParam('weightMin', String(range.minKg * 1000));
      setParam('weightMax', range.maxKg !== undefined ? String(range.maxKg * 1000) : null);
      setWeightMinInput(String(range.minKg * 1000));
      setWeightMaxInput(range.maxKg !== undefined ? String(range.maxKg * 1000) : '');
    }
  };

  const activeWeightRangeId = WEIGHT_RANGES.find(
    (r) => weightMin === String(r.minKg * 1000) && weightMax === (r.maxKg !== undefined ? String(r.maxKg * 1000) : ''),
  )?.id;

  // Active filter chips list
  const activeFilterChips: Array<{ key: string; value: string; label: string; icon?: React.ElementType }> = [];
  if (activeCategory) {
    const cat = categories.find((c) => c.slug === activeCategory);
    const iconData = getCategoryIconData(activeCategory);
    activeFilterChips.push({ key: 'category', value: activeCategory, label: cat?.name || activeCategory, icon: iconData.icon });
  }
  if (activeSearch) activeFilterChips.push({ key: 'search', value: activeSearch, label: `"${activeSearch}"`, icon: Search });
  if (inStockOnly) activeFilterChips.push({ key: 'inStock', value: 'true', label: 'En Stock', icon: PackageCheck });
  if (onSaleOnly) activeFilterChips.push({ key: 'onSale', value: 'true', label: 'En Oferta', icon: Tag });
  if (featuredOnly) activeFilterChips.push({ key: 'featured', value: 'true', label: 'Destacados', icon: Star });
  if (priceMin !== '' || priceMax !== '') {
    activeFilterChips.push({
      key: 'price',
      value: 'price',
      label: `S/ ${priceMin || '0'} – ${priceMax ? `S/ ${priceMax}` : '+∞'}`,
      icon: Coins,
    });
  }
  if (weightMin !== '' || weightMax !== '') {
    const fmtG = (v: string) => {
      const n = parseFloat(v);
      if (isNaN(n)) return '';
      return n >= 1000 ? `${n / 1000} Kg` : `${n} g`;
    };
    activeFilterChips.push({
      key: 'weight',
      value: 'weight',
      label: `${fmtG(weightMin || '0')} – ${weightMax ? fmtG(weightMax) : '+∞'}`,
      icon: Scale,
    });
  }

  const removeChip = (chip: { key: string; value: string }) => {
    if (chip.key === 'price') {
      setParam('priceMin', null);
      setParam('priceMax', null);
      setPriceMinInput('');
      setPriceMaxInput('');
    } else if (chip.key === 'weight') {
      setParam('weightMin', null);
      setParam('weightMax', null);
      setWeightMinInput('');
      setWeightMaxInput('');
    } else {
      setParam(chip.key, null);
      if (chip.key === 'search') setSearchInput('');
    }
  };

  // Modern Filter Sidebar Component
  const renderFilters = () => (
    <div className="space-y-6">
      {/* 1. Interactive Search with clear button */}
      <div>
        <label className="text-xs font-black text-navy uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-primary" /> Buscar
          </span>
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                setParam('search', null);
              }}
              className="text-[10px] text-gray-400 hover:text-danger font-bold flex items-center gap-1"
            >
              Borrar <X className="w-3 h-3" />
            </button>
          )}
        </label>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Clásica, carbón, lavanda..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-[#F7F8FC]/50 hover:bg-white transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* 2. Categorías con Iconos Vibrantes */}
      <div className="pt-2 border-t border-gray-100">
        <label className="text-xs font-black text-navy uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-primary" /> Categorías Especializadas
        </label>
        <div className="space-y-1.5">
          {/* Opción Todas */}
          <button
            onClick={() => handleCategorySelect(null)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group ${
              !activeCategory
                ? 'bg-grad-primary text-white shadow-glow-primary'
                : 'text-gray-600 hover:text-navy hover:bg-gray-50 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                  !activeCategory ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span>Todas las Arenas</span>
            </div>
            {!activeCategory && <Check className="w-4 h-4" />}
          </button>

          {/* Categorías Dinámicas */}
          {categories.map((cat) => {
            const iconData = getCategoryIconData(cat.slug);
            const Icon = iconData.icon;
            const isSelected = activeCategory === cat.slug;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group ${
                  isSelected
                    ? `${iconData.activeBg} shadow-sm scale-[1.02]`
                    : 'text-gray-700 hover:text-navy hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 text-left truncate">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected ? 'bg-white/20 text-white' : `${iconData.bgColor} ${iconData.color}`
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{cat.name}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 flex-shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Filtros Rápidos (Stock, Ofertas, Destacados) */}
      <div className="pt-2 border-t border-gray-100 space-y-2">
        <label className="text-xs font-black text-navy uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-primary" /> Filtros Rápidos
        </label>
        
        {/* En Stock */}
        <button
          onClick={() => setParam('inStock', inStockOnly ? null : 'true')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            inStockOnly
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50 border border-gray-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${inStockOnly ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
              <PackageCheck className="w-3.5 h-3.5" />
            </div>
            <span>En Stock Inmediato</span>
          </div>
          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${inStockOnly ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 bg-white'}`}>
            {inStockOnly && <Check className="w-3 h-3" />}
          </div>
        </button>

        {/* Solo Ofertas */}
        <button
          onClick={() => setParam('onSale', onSaleOnly ? null : 'true')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            onSaleOnly
              ? 'bg-rose-50 text-rose-700 border border-rose-300 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50 border border-gray-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${onSaleOnly ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-500'}`}>
              <Flame className="w-3.5 h-3.5" />
            </div>
            <span>Promociones & Descuentos</span>
          </div>
          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${onSaleOnly ? 'bg-rose-500 border-rose-500 text-white' : 'border-gray-300 bg-white'}`}>
            {onSaleOnly && <Check className="w-3 h-3" />}
          </div>
        </button>

        {/* Destacados */}
        <button
          onClick={() => setParam('featured', featuredOnly ? null : 'true')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            featuredOnly
              ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50 border border-gray-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${featuredOnly ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600'}`}>
              <Star className="w-3.5 h-3.5" />
            </div>
            <span>Más Vendidos PeruCat</span>
          </div>
          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${featuredOnly ? 'bg-amber-500 border-amber-500 text-white' : 'border-gray-300 bg-white'}`}>
            {featuredOnly && <Check className="w-3 h-3" />}
          </div>
        </button>
      </div>

      {/* 4. Rango de Precios */}
      <div className="pt-2 border-t border-gray-100">
        <label className="text-xs font-black text-navy uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-primary" /> Rango de Precio (S/)
          </span>
          {(priceMin || priceMax) && (
            <button
              onClick={() => {
                setParam('priceMin', null);
                setParam('priceMax', null);
                setPriceMinInput('');
                setPriceMaxInput('');
              }}
              className="text-[10px] text-gray-400 hover:text-danger font-bold"
            >
              Restablecer
            </button>
          )}
        </label>

        {/* Chips de Precio */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {PRICE_RANGES.map((range) => {
            const isSelected = activePriceRangeId === range.id;
            return (
              <button
                key={range.id}
                onClick={() => togglePriceRange(range.id)}
                className={`px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all text-center ${
                  isSelected
                    ? 'bg-grad-primary text-white shadow-glow-primary scale-[1.02]'
                    : 'bg-[#F7F8FC] text-gray-600 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>

        {/* Custom Price Inputs */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">S/</span>
            <input
              type="number"
              min="0"
              value={priceMinInput}
              onChange={(e) => setPriceMinInput(e.target.value)}
              placeholder="Mín"
              className="w-full pl-7 pr-2.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-[#F7F8FC]/50"
            />
          </div>
          <span className="text-gray-300 text-xs font-bold">–</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">S/</span>
            <input
              type="number"
              min="0"
              value={priceMaxInput}
              onChange={(e) => setPriceMaxInput(e.target.value)}
              placeholder="Máx"
              className="w-full pl-7 pr-2.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-[#F7F8FC]/50"
            />
          </div>
        </div>
      </div>

      {/* 5. Presentaciones / Peso */}
      <div className="pt-2 border-t border-gray-100">
        <label className="text-xs font-black text-navy uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-primary" /> Presentación & Peso
          </span>
          {(weightMin || weightMax) && (
            <button
              onClick={() => {
                setParam('weightMin', null);
                setParam('weightMax', null);
                setWeightMinInput('');
                setWeightMaxInput('');
              }}
              className="text-[10px] text-gray-400 hover:text-danger font-bold"
            >
              Restablecer
            </button>
          )}
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {WEIGHT_RANGES.map((range) => {
            const isSelected = activeWeightRangeId === range.id;
            return (
              <button
                key={range.id}
                onClick={() => toggleWeightRange(range.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between ${
                  isSelected
                    ? 'bg-secondary text-white shadow-glow-secondary'
                    : 'bg-[#F7F8FC] text-gray-600 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                <span>{range.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset all button */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="w-full py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black transition-all flex items-center justify-center gap-2 border border-rose-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer Filtros ({activeFilterCount})</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-navy rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl border border-navy-light/40">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-primary/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Catálogo Oficial PeruCat
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Arenas Sanitarias & Accesorios Felinos
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
            Explora nuestras diferentes fórmulas de <strong>alta absorción, aglomeración rápida y neutralización continua de olores</strong>.
          </p>
        </div>
      </div>

      {/* 2. Top Interactive Category Chips (Horizontal Scroll/Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-1.5">
            <Sparkle className="w-3.5 h-3.5 text-accent" /> Líneas de Producto
          </span>
          <span className="text-xs text-muted-foreground font-semibold">
            {categories.length + 1} líneas disponibles
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Todas */}
          <button
            onClick={() => handleCategorySelect(null)}
            className={`p-4 rounded-3xl border text-left transition-all duration-300 flex flex-col justify-between group ${
              !activeCategory
                ? 'bg-grad-primary text-white border-transparent shadow-glow-primary scale-[1.02]'
                : 'bg-white border-gray-100 hover:border-primary/30 hover:shadow-card-hover text-navy'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold mb-3 transition-transform group-hover:scale-110 ${
                !activeCategory ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p
                className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${
                  !activeCategory ? 'text-accent' : 'text-primary'
                }`}
              >
                Completo
              </p>
              <h3 className="font-extrabold text-sm leading-snug">Todo el Catálogo</h3>
            </div>
          </button>

          {/* Categorías */}
          {categories.map((cat) => {
            const iconData = getCategoryIconData(cat.slug);
            const Icon = iconData.icon;
            const isSelected = activeCategory === cat.slug;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`p-4 rounded-3xl border text-left transition-all duration-300 flex flex-col justify-between group ${
                  isSelected
                    ? `${iconData.activeBg} border-transparent shadow-lg scale-[1.02]`
                    : 'bg-white border-gray-100 hover:border-primary/30 hover:shadow-card-hover text-navy'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold mb-3 transition-transform group-hover:scale-110 ${
                    isSelected ? 'bg-white/20 text-white' : `${iconData.bgColor} ${iconData.color}`
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p
                    className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${
                      isSelected ? 'text-white/80' : iconData.color
                    }`}
                  >
                    {iconData.badge}
                  </p>
                  <h3 className="font-extrabold text-sm leading-snug truncate">{cat.name}</h3>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Toolbar (Result count, active chips & sorting) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-navy text-white text-xs font-black shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-accent" />
            <span>Filtros {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>

          {/* Counter */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-bold text-navy">
              {loading ? (
                'Buscando arenas...'
              ) : (
                <>
                  Mostrando <strong className="text-primary font-black">{visibleProducts.length}</strong> producto(s)
                </>
              )}
            </p>
          </div>

          {/* Sorting dropdown */}
          <div className="flex items-center gap-2.5 ml-auto">
            <label className="text-xs font-bold text-gray-500 hidden sm:block">Ordenar:</label>
            <div className="relative">
              <select
                value={activeSort}
                onChange={(e) => setParam('sort', e.target.value === 'newest' ? null : e.target.value)}
                className="appearance-none pl-4 pr-9 py-2 rounded-2xl bg-[#F7F8FC] border border-gray-200 text-xs font-bold text-navy hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer transition-all"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {activeFilterChips.length > 0 && (
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-primary" /> Filtros aplicados:
            </span>
            {activeFilterChips.map((chip) => {
              const Icon = chip.icon || Tag;
              return (
                <button
                  key={chip.key + chip.value}
                  onClick={() => removeChip(chip)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-rose-50 text-primary hover:text-danger border border-purple-100 text-[11px] font-bold transition-all group"
                  title="Clic para remover este filtro"
                >
                  <Icon className="w-3 h-3 text-primary group-hover:text-danger" />
                  <span>{chip.label}</span>
                  <X className="w-3 h-3 text-gray-400 group-hover:text-danger" />
                </button>
              );
            })}
            <button
              onClick={clearAllFilters}
              className="text-[11px] font-extrabold text-rose-500 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors ml-auto flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Limpiar todos
            </button>
          </div>
        )}
      </div>

      {/* 4. Main Catalog Body: Sidebar + Grid */}
      <div className="flex gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-black text-navy">Filtros Avanzados</h2>
            </div>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black">
                {activeFilterCount} activo(s)
              </span>
            )}
          </div>
          {renderFilters()}
        </aside>

        {/* Mobile Drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-navy/70 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-84 max-w-[88vw] bg-white shadow-2xl overflow-y-auto flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-navy">Filtros PeruCat</h2>
                    <p className="text-[10px] text-muted-foreground">{visibleProducts.length} productos coincidentes</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-navy hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 flex-1">{renderFilters()}</div>

              <div className="p-5 pt-3 sticky bottom-0 bg-white border-t border-gray-100">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-3.5 rounded-2xl bg-grad-primary text-white text-xs font-black shadow-glow-primary flex items-center justify-center gap-2"
                >
                  <span>Ver {visibleProducts.length} Producto(s)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-96 rounded-3xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Filter className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-navy">No encontramos productos con estos filtros</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Prueba ajustando el rango de precio, cambiando la categoría o restableciendo los filtros activos.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 rounded-2xl bg-grad-primary text-white text-xs font-black shadow-glow-primary inline-flex items-center gap-2 hover:scale-105 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Ver Todas las Arenas PeruCat</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {visibleProducts.map((product) => {
                const defaultVariant = product.variants[0];
                const priceObj = defaultVariant?.prices[0];
                const price = priceObj ? parseSafeNumber(priceObj.price) : 0;
                const compareAtPrice = priceObj?.compareAtPrice ? parseSafeNumber(priceObj.compareAtPrice) : null;
                const availableStock = defaultVariant?.inventory?.availableStock ? parseSafeNumber(defaultVariant.inventory.availableStock) : 0;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl border border-gray-100 hover:border-primary/30 p-4 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group relative"
                  >
                    <div className="relative mb-4 overflow-hidden rounded-2xl bg-gray-50">
                      <Link to={`/products/${product.slug}`} className="block">
                        <img
                          src={product.images[0]?.url || '/IMG/perucat-clasica-hd.jpg'}
                          alt={product.name}
                          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      {/* Wishlist toggle */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (defaultVariant) {
                            isInWishlist(defaultVariant.id)
                              ? removeFromWishlist(defaultVariant.id)
                              : addToWishlist(product, defaultVariant);
                          }
                        }}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm hover:scale-110 transition-all z-10"
                        title={isInWishlist(defaultVariant?.id || '') ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            isInWishlist(defaultVariant?.id || '')
                              ? 'fill-rose-500 text-rose-500'
                              : 'text-gray-400 hover:text-rose-400'
                          }`}
                        />
                      </button>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        {compareAtPrice && compareAtPrice > price && (
                          <span className="bg-grad-secondary text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                            <Flame className="w-3 h-3" /> OFERTA
                          </span>
                        )}
                        {product.featured && (
                          <span className="bg-navy text-accent text-[9px] font-black px-2 py-0.5 rounded-md border border-navy-light shadow-sm flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 text-accent" /> DESTACADO
                          </span>
                        )}
                      </div>

                      {availableStock < 10 && availableStock > 0 && (
                        <span className="absolute bottom-3 left-3 bg-amber-500/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                          Últimas {availableStock} unidades
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-primary uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50">
                          {product.brand || 'PeruCat'}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {defaultVariant?.sku || 'SKU'}
                        </span>
                      </div>

                      <Link to={`/products/${product.slug}`} className="block">
                        <h3 className="font-extrabold text-sm text-navy hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {product.shortDescription}
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-navy">{formatMoney(price)}</span>
                          {compareAtPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatMoney(compareAtPrice)}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold">
                          {defaultVariant?.name || 'Bolsa 10 Kg'}
                        </span>
                      </div>

                      <button
                        onClick={() => defaultVariant && addToCart(product, defaultVariant, 1)}
                        className="p-3 rounded-2xl bg-grad-primary hover:bg-grad-primary-hover text-white transition-all shadow-glow-primary hover:scale-105 active:scale-95 flex items-center gap-1.5"
                        title="Agregar al carrito"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

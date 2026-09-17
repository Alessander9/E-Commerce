import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTenant } from '../../../hooks/useTenant';
import { useAuth } from '../../../hooks/useAuth';
import { useCart } from '../../../hooks/useCart';
import { useWishlist } from '../../../hooks/useWishlist';
import { Order, Product } from '../../../types';
import { apiRequest } from '../../../services/api';
import { formatMoney } from '../../../utils/format';
import { FontSizeSelector } from '../../../components/common/FontSizeSelector';
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
  User as UserIcon,
  Phone,
  Mail,
  FileText,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Printer,
  Heart,
  Tag,
  Gift,
  Award,
  Cat,
  Zap,
  RotateCcw,
  Building2,
  Calendar,
  X,
  RefreshCw,
  SlidersHorizontal,
  LogOut,
  MessageCircle,
  Menu,
  ChevronLeft,
  Crown,
  Star,
  Flame,
  Home,
  Headphones,
  Bell,
  MoreHorizontal,
  Percent,
  ChevronDown,
} from 'lucide-react';

interface SavedAddress {
  id: string;
  title: string;
  recipientName: string;
  phone: string;
  department: string;
  province: string;
  district: string;
  addressLine: string;
  reference?: string;
  isDefault: boolean;
}

interface PetProfile {
  id: string;
  name: string;
  breed: string;
  ageYears: number;
  weightKg: number;
  favoriteFormula: string;
  notes?: string;
}

const INITIAL_MOCK_CUSTOMER_ORDERS: any[] = [
  {
    id: 'ord-c1',
    orderNumber: 'PC-000125',
    status: 'SHIPPED', // En tránsito
    paymentStatus: 'PAID',
    fulfillmentStatus: 'IN_TRANSIT',
    subtotal: 144.0,
    shippingCost: 12.0,
    discountAmount: 0.0,
    total: 156.0,
    currency: 'PEN',
    createdAt: '2026-10-17T10:24:00.000Z',
    updatedAt: '2026-10-17T12:30:00.000Z',
    shippingAddress: {
      fullName: 'Alessander Gatuno',
      phone: '+51 987 654 321',
      department: 'Lima',
      province: 'Lima',
      district: 'Miraflores',
      addressLine: 'Av. José Larco 745, Dpto 402',
      reference: 'Frente al Parque Salazar',
      city: 'Lima',
    },
    payments: [
      {
        provider: 'YAPE',
        paymentMethod: 'Yape',
        status: 'PAID',
        amount: 156.0,
        transactionId: 'YAP-984321',
      },
    ],
    shipment: {
      courier: 'Olva Courier',
      trackingCode: 'SH-784521',
      status: 'IN_TRANSIT',
    },
    items: [
      {
        id: 'it-1',
        productName: 'Arena Sanitaria PeruCat Clásica 10kg',
        productSku: 'PC-BENT-10K',
        variantName: 'Bolsa 10kg',
        quantity: 2,
        unitPrice: 48.0,
        subtotal: 96.0,
        product: {
          slug: 'perucat-clasica-10kg',
          images: [{ url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=150&auto=format&fit=crop&q=80' }],
        },
      },
      {
        id: 'it-2',
        productName: 'PeruCat Carbón Activo Anti-Olor 5kg',
        productSku: 'PC-CARB-05K',
        variantName: 'Bolsa 5kg',
        quantity: 1,
        unitPrice: 60.0,
        subtotal: 60.0,
        product: {
          slug: 'perucat-carbon-activo',
          images: [{ url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=150&auto=format&fit=crop&q=80' }],
        },
      },
    ],
    statusHistory: [
      {
        status: 'PENDING_PAYMENT',
        note: 'Orden generada en tienda virtual',
        createdAt: '2026-10-17T10:24:00.000Z',
      },
      {
        status: 'PAID',
        note: 'Pago verificado exitosamente vía Yape',
        createdAt: '2026-10-17T10:26:00.000Z',
      },
      {
        status: 'PROCESSING',
        note: 'Paquete en preparación y empaque en almacén central',
        createdAt: '2026-10-17T11:00:00.000Z',
      },
      {
        status: 'SHIPPED',
        note: 'Despachado con Olva Courier - Guía SH-784521',
        createdAt: '2026-10-17T12:30:00.000Z',
      },
    ],
  },
  {
    id: 'ord-c2',
    orderNumber: 'PC-000124',
    status: 'DELIVERED', // Entregado
    paymentStatus: 'PAID',
    fulfillmentStatus: 'DELIVERED',
    subtotal: 89.0,
    shippingCost: 0.0,
    discountAmount: 0.0,
    total: 89.0,
    currency: 'PEN',
    createdAt: '2026-10-16T18:45:00.000Z',
    updatedAt: '2026-10-18T14:20:00.000Z',
    shippingAddress: {
      fullName: 'Alessander Gatuno',
      phone: '+51 987 654 321',
      department: 'Lima',
      province: 'Lima',
      district: 'San Borja',
      addressLine: 'Calle Las Artes 230',
      reference: 'Cerca a la estación San Borja Sur',
      city: 'Lima',
    },
    payments: [
      {
        provider: 'CREDIT_CARD',
        paymentMethod: 'Tarjeta (Culqi)',
        status: 'PAID',
        amount: 89.0,
        transactionId: 'CULQI-778219',
      },
    ],
    shipment: {
      courier: 'Olva Courier',
      trackingCode: 'OC-998221',
      status: 'DELIVERED',
    },
    items: [
      {
        id: 'it-3',
        productName: 'Pack Familiar PeruCat Aroma Lavanda (2 x 5kg)',
        productSku: 'PC-LAV-PACK2',
        variantName: 'Pack 2 bolsas',
        quantity: 1,
        unitPrice: 65.0,
        subtotal: 65.0,
        product: {
          slug: 'perucat-lavanda-pack',
          images: [{ url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=150&auto=format&fit=crop&q=80' }],
        },
      },
      {
        id: 'it-4',
        productName: 'Pala Sanitaria Ergonómica de Precisión',
        productSku: 'PC-PALA-01',
        variantName: 'Color Turquesa',
        quantity: 1,
        unitPrice: 24.0,
        subtotal: 24.0,
        product: {
          slug: 'pala-sanitaria-ergonomica',
          images: [{ url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=150&auto=format&fit=crop&q=80' }],
        },
      },
    ],
    statusHistory: [
      {
        status: 'PAID',
        note: 'Pago completado con tarjeta',
        createdAt: '2026-10-16T18:45:00.000Z',
      },
      {
        status: 'SHIPPED',
        note: 'Despachado con Olva Courier - Guía OC-998221',
        createdAt: '2026-10-17T09:00:00.000Z',
      },
      {
        status: 'DELIVERED',
        note: 'Entregado conforme en dirección del cliente',
        createdAt: '2026-10-18T14:20:00.000Z',
      },
    ],
  },
];

const AVAILABLE_COUPONS = [
  {
    code: 'ENVIOGRATIS',
    discount: 'Envío gratis',
    badgeColor: 'bg-rose-50 text-rose-600 border-rose-100',
    desc: 'En compras desde S/ 99.00',
    minSpend: 'S/ 99.00',
    validUntil: 'Vigente',
  },
  {
    code: 'PERUCAT20',
    discount: '20% OFF',
    badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    desc: 'En toda la tienda',
    minSpend: 'Sin mínimo',
    validUntil: 'Vigente',
  },
];

export const Orders: React.FC = () => {
  const { tenantSlug, currentTenant } = useTenant();
  const { user, isAuthenticated, logout } = useAuth();
  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  
  // Navigation active tab: INICIO | ORDERS | ADDRESSES | PROFILE | COUPONS | PETS | WISHLIST | SUPPORT
  const [activeNav, setActiveNav] = useState<'INICIO' | 'ORDERS' | 'ADDRESSES' | 'PROFILE' | 'COUPONS' | 'PETS' | 'WISHLIST' | 'SUPPORT'>('INICIO');
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderStatusTab, setOrderStatusTab] = useState<'ALL' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedOrderProducts, setExpandedOrderProducts] = useState<Record<string, boolean>>({});
  
  // Modals
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any | null>(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);

  // Addresses State (persisted in localStorage)
  const [addresses, setAddresses] = useState<SavedAddress[]>(() => {
    const saved = localStorage.getItem('perucat_saved_addresses');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 'addr-1',
        title: 'Casa Principal',
        recipientName: user ? `${user.firstName} ${user.lastName}` : 'Alessander Gatuno',
        phone: user?.phone || '+51 987 654 321',
        department: 'Lima',
        province: 'Lima',
        district: 'Miraflores',
        addressLine: 'Av. José Larco 745, Dpto 402',
        reference: 'Frente al Parque Salazar',
        isDefault: true,
      },
    ];
  });

  // Pets State (persisted in localStorage)
  const [pets, setPets] = useState<PetProfile[]>(() => {
    const saved = localStorage.getItem('perucat_saved_pets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 'pet-1',
        name: 'Mochi',
        breed: 'Siamés / Mestizo',
        ageYears: 2,
        weightKg: 4.2,
        favoriteFormula: 'PeruCat Bentonita Clásica',
        notes: 'Le gusta la bandeja muy limpia y sin fragancia fuerte.',
      },
      {
        id: 'pet-2',
        name: 'Luna',
        breed: 'Pelaje Corto Peruano',
        ageYears: 1,
        weightKg: 3.5,
        favoriteFormula: 'PeruCat Aroma Lavanda',
        notes: 'Usa caja de arena cerrada.',
      },
    ];
  });

  // New Address Form State
  const [newAddr, setNewAddr] = useState<Omit<SavedAddress, 'id'>>({
    title: 'Casa',
    recipientName: user ? `${user.firstName} ${user.lastName}` : 'Alessander Gatuno',
    phone: user?.phone || '+51 987 654 321',
    department: 'Lima',
    province: 'Lima',
    district: '',
    addressLine: '',
    reference: '',
    isDefault: false,
  });

  // New Pet Form State
  const [newPet, setNewPet] = useState<Omit<PetProfile, 'id'>>({
    name: '',
    breed: 'Mestizo Felino',
    ageYears: 1,
    weightKg: 4.0,
    favoriteFormula: 'PeruCat Bentonita Clásica',
    notes: '',
  });

  // Fetch orders from API with fallback to rich seed orders
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    apiRequest<Order[]>('/api/store/orders', {}, tenantSlug)
      .then((data) => {
        if (data && data.length > 0) {
          setOrders(data);
        } else {
          setOrders(INITIAL_MOCK_CUSTOMER_ORDERS);
        }
      })
      .catch(() => {
        setOrders(INITIAL_MOCK_CUSTOMER_ORDERS);
      })
      .finally(() => setLoading(false));
  }, [tenantSlug, isAuthenticated]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleProductsExpand = (orderId: string) => {
    setExpandedOrderProducts((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleReorder = (order: any) => {
    if (order.items && order.items.length > 0) {
      order.items.forEach((item: any) => {
        const prod = {
          id: item.product?.id || `prod-${item.id}`,
          name: item.productName || item.product?.name || 'Producto PeruCat',
          slug: item.product?.slug || 'producto',
          hasVariants: false,
          featured: false,
          images: item.product?.images || [{ id: '1', url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=150' }],
        } as unknown as Product;
        const variant = {
          id: `var-${item.productSku}`,
          sku: item.productSku,
          name: item.variantName || 'Estándar',
          prices: [{ id: '1', price: item.unitPrice, currency: 'PEN' }],
        } as any;
        addToCart(prod, variant, item.quantity);
      });
      setIsCartDrawerOpen(true);
    }
  };

  // Save address helper
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.addressLine || !newAddr.district) return;
    const item: SavedAddress = {
      ...newAddr,
      id: `addr-${Date.now()}`,
    };
    const updated = newAddr.isDefault
      ? addresses.map((a) => ({ ...a, isDefault: false })).concat(item)
      : [...addresses, item];
    setAddresses(updated);
    localStorage.setItem('perucat_saved_addresses', JSON.stringify(updated));
    setShowAddAddressModal(false);
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    localStorage.setItem('perucat_saved_addresses', JSON.stringify(updated));
  };

  const handleSetDefaultAddress = (id: string) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);
    localStorage.setItem('perucat_saved_addresses', JSON.stringify(updated));
  };

  // Save pet helper
  const handleSavePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPet.name) return;
    const item: PetProfile = {
      ...newPet,
      id: `pet-${Date.now()}`,
    };
    const updated = [...pets, item];
    setPets(updated);
    localStorage.setItem('perucat_saved_pets', JSON.stringify(updated));
    setShowAddPetModal(false);
  };

  const handleDeletePet = (id: string) => {
    const updated = pets.filter((p) => p.id !== id);
    setPets(updated);
    localStorage.setItem('perucat_saved_pets', JSON.stringify(updated));
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Tab filter
      if (orderStatusTab === 'IN_TRANSIT' && o.status !== 'SHIPPED' && o.status !== 'PROCESSING') return false;
      if (orderStatusTab === 'DELIVERED' && o.status !== 'DELIVERED') return false;
      if (orderStatusTab === 'CANCELLED' && o.status !== 'CANCELLED') return false;
      
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNum = o.orderNumber?.toLowerCase().includes(q);
        const matchesItem = o.items?.some((it: any) => it.productName?.toLowerCase().includes(q) || it.productSku?.toLowerCase().includes(q));
        if (!matchesNum && !matchesItem) return false;
      }
      return true;
    });
  }, [orders, orderStatusTab, searchQuery]);

  // Counts
  const countAll = orders.length;
  const countInTransit = orders.filter((o) => o.status === 'SHIPPED' || o.status === 'PROCESSING').length;
  const countDelivered = orders.filter((o) => o.status === 'DELIVERED').length;
  const countCancelled = orders.filter((o) => o.status === 'CANCELLED').length;

  const totalSpent = orders.reduce((sum, ord) => sum + Number(ord.total || 0), 331.0);
  const totalBags = 5;
  const michiPoints = 662;

  // Sidebar Items list (WITHOUT "Mis Reseñas")
  const sidebarNavItems = [
    { id: 'INICIO', label: 'Inicio', icon: Home },
    { id: 'ORDERS', label: 'Mis Pedidos', icon: ShoppingBag, count: countAll },
    { id: 'ADDRESSES', label: 'Mis Direcciones', icon: MapPin },
    { id: 'PROFILE', label: 'Mis Datos', icon: UserIcon },
    { id: 'COUPONS', label: 'Cupones y Promociones', icon: Tag },
    { id: 'PETS', label: 'Mis Gatitos', icon: Cat, count: pets.length },
    { id: 'WISHLIST', label: 'Lista de Deseos', icon: Heart, count: wishlistItems.length },
    { id: 'SUPPORT', label: 'Soporte', icon: Headphones },
  ];

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mx-auto shadow-sm">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Inicia sesión para ver tu Portal de Cliente</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
          Accede a tus compras, comprobantes electrónicos, historial de envíos y perfiles de tus gatitos.
        </p>
        <Link
          to="/login"
          className="inline-block px-8 py-3.5 rounded-2xl bg-[#4F46E5] text-white font-extrabold text-xs shadow-md hover:bg-[#4338CA] transition-all cursor-pointer"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  const displayName = user?.firstName || 'Alessander';
  const displayFullName = user ? `${user.firstName} ${user.lastName}` : 'Alessander Gatuno';
  const displayEmail = user?.email || 'cliente@perucat.pe';
  const avatarLetter = displayName[0] || 'A';

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-slate-900 pb-16 font-sans antialiased">
      
      {/* ── Main Container ── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* ========================================================================= */}
        {/* GRID LAYOUT: LEFT SIDEBAR + MAIN CONTENT AREA */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================================= */}
          {/* 1. LEFT SIDEBAR NAVIGATION (Desktop only - mobile uses top hamburger menu) */}
          {/* ========================================================================= */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-2 space-y-4 lg:sticky lg:top-24">
            
            {/* Nav Menu Card */}
            <div className="bg-white rounded-3xl p-3 shadow-2xs border border-slate-100/80 space-y-1">
              {sidebarNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'WISHLIST') {
                        navigate('/favoritos');
                      } else {
                        setActiveNav(item.id as any);
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer group ${
                      isActive
                        ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-[#4F46E5]' : 'text-slate-400'
                      }`} />
                      <span>{item.label}</span>
                    </div>

                    {item.count !== undefined && item.count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-[#4F46E5] text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Club PeruCat Card */}
            <div className="bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A] rounded-3xl p-5 text-white shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5" />
                  <span>CLUB PERUCAT</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px]">
                  VIP
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-2xl font-black text-white">{michiPoints} Puntos</p>
                <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden my-2">
                  <div className="bg-gradient-to-r from-amber-400 to-indigo-400 h-full rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  S/ 331.00 para tu próximo beneficio
                </p>
              </div>

              <button
                onClick={() => setShowBenefitsModal(true)}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-[#4338CA] hover:to-[#4F46E5] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Ver beneficios</span>
                <span>→</span>
              </button>
            </div>

          </aside>

          {/* ========================================================================= */}
          {/* 2. RIGHT MAIN CONTENT AREA */}
          {/* ========================================================================= */}
          <main className="lg:col-span-9 xl:col-span-10 space-y-6">

            {/* If NOT in Inicio overview, show back breadcrumb and Font Controller */}
            {activeNav !== 'INICIO' && (
              <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-2xs gap-3">
                <button
                  onClick={() => setActiveNav('INICIO')}
                  className="text-xs font-bold text-[#4F46E5] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Volver al Inicio del Dashboard</span>
                </button>
                <div className="flex items-center gap-3">
                  <FontSizeSelector />
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    {sidebarNavItems.find(i => i.id === activeNav)?.label}
                  </span>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* VIEW: INICIO (MAIN OVERVIEW) */}
            {/* ===================================================================== */}
            {(activeNav === 'INICIO' || activeNav === 'ORDERS') && (
              <div className="space-y-6">
                
                {/* ── ROW 1: GREETING / PROFILE + HERO BANNER + ACCIONES RÁPIDAS ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* Card 1: Saludo & Perfil Compacto + Font Scale Switcher */}
                  <div className="bg-white rounded-3xl p-6 shadow-2xs border border-slate-100/80 flex flex-col justify-between space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-full bg-[#3B82F6] text-white font-black text-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          {avatarLetter}
                        </div>
                        <div className="space-y-1">
                          <h2 className="text-base font-black text-slate-900 leading-tight">
                            ¡Hola, {displayName}! 👋
                          </h2>
                          <p className="text-[11px] text-slate-400 font-medium">
                            Gracias por ser parte de PeruCat
                          </p>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Cliente Verificado
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <FontSizeSelector />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-3 border-t border-slate-100 text-center">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 block font-medium">Cliente desde</span>
                        <span className="text-[11px] font-bold text-slate-800 block">Sep 2024</span>
                      </div>
                      <div className="space-y-0.5 border-x border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-medium">País</span>
                        <span className="text-[11px] font-bold text-slate-800 block">Perú</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 block font-medium">Tipo</span>
                        <span className="text-[11px] font-bold text-slate-800 block">Frecuente</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Promotional Hero Banner */}
                  <div className="bg-gradient-to-r from-[#EEF2FF] via-[#F5F3FF] to-[#FAF5FF] rounded-3xl p-6 shadow-2xs border border-indigo-50 flex items-center justify-between relative overflow-hidden">
                    <div className="space-y-2 z-10 max-w-[65%]">
                      <div className="w-7 h-7 rounded-xl bg-white text-[#4F46E5] flex items-center justify-center shadow-2xs font-bold text-xs">
                        🐾
                      </div>
                      <h3 className="text-base font-black text-slate-900 leading-tight">
                        Todo para ellos, siempre contigo
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        Los mejores productos para una vida más feliz
                      </p>
                    </div>

                    <div className="absolute -right-2 -bottom-2 w-32 h-32 pointer-events-none">
                      <img
                        src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80"
                        alt="Gatito PeruCat"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>

                  {/* Card 3: Acciones Rápidas */}
                  <div className="bg-white rounded-3xl p-5 shadow-2xs border border-slate-100/80 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                      <Zap className="w-4 h-4 text-[#4F46E5]" />
                      <span>Acciones rápidas</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <Link
                        to="/productos"
                        className="p-3 rounded-2xl bg-[#F5F3FF] hover:bg-[#EDE9FE] transition-colors flex flex-col items-center justify-center gap-1 text-center group cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4 text-[#4F46E5] group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-bold text-slate-800">Ir a la Tienda</span>
                      </Link>

                      <button
                        onClick={() => setActiveNav('COUPONS')}
                        className="p-3 rounded-2xl bg-[#ECFDF5] hover:bg-[#D1FAE5] transition-colors flex flex-col items-center justify-center gap-1 text-center group cursor-pointer"
                      >
                        <Tag className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-bold text-slate-800">Mis Cupones</span>
                      </button>

                      <button
                        onClick={() => setActiveNav('ADDRESSES')}
                        className="p-3 rounded-2xl bg-[#F0F9FF] hover:bg-[#E0F2FE] transition-colors flex flex-col items-center justify-center gap-1 text-center group cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-bold text-slate-800">Mis Direcciones</span>
                      </button>

                      <Link
                        to="/favoritos"
                        className="p-3 rounded-2xl bg-[#FFF1F2] hover:bg-[#FFE4E6] transition-colors flex flex-col items-center justify-center gap-1 text-center group cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-bold text-slate-800">Lista de Deseos</span>
                      </Link>
                    </div>
                  </div>

                </div>

                {/* ── ROW 2: PERSONAL METRICS (5 CARDS) ── */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                  
                  {/* Compras */}
                  <div className="bg-white rounded-3xl p-4 shadow-2xs border border-slate-100/80 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-slate-400 block">Compras</span>
                      <p className="text-xl font-black text-slate-900">{countAll}</p>
                      <span className="text-[10px] text-slate-400 block">{totalBags} bolsas adquiridas</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-[#F5F3FF] text-[#4F46E5] flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Invertido */}
                  <div className="bg-white rounded-3xl p-4 shadow-2xs border border-slate-100/80 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-slate-400 block">Invertido</span>
                      <p className="text-xl font-black text-slate-900">{formatMoney(totalSpent)}</p>
                      <span className="text-[10px] text-slate-400 block">Total en compras</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] text-emerald-600 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                  </div>

                  {/* En Tránsito */}
                  <div className="bg-white rounded-3xl p-4 shadow-2xs border border-slate-100/80 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-slate-400 block">En Tránsito</span>
                      <p className="text-xl font-black text-sky-600">{countInTransit}</p>
                      <span className="text-[10px] text-slate-400 block">En camino a tu dirección</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-[#F0F9FF] text-sky-600 flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Entregados */}
                  <div className="bg-white rounded-3xl p-4 shadow-2xs border border-slate-100/80 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-slate-400 block">Entregados</span>
                      <p className="text-xl font-black text-emerald-600">{countDelivered}</p>
                      <span className="text-[10px] text-slate-400 block">Pedidos recibidos</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] text-emerald-600 flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Mis Gatitos */}
                  <div className="bg-white rounded-3xl p-4 shadow-2xs border border-slate-100/80 flex items-center justify-between col-span-2 sm:col-span-1">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-slate-400 block">Mis Gatitos</span>
                      <p className="text-xl font-black text-amber-500">{pets.length}</p>
                      <span className="text-[10px] text-slate-400 block">Registrados</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                      <Cat className="w-5 h-5" />
                    </div>
                  </div>

                </div>

                {/* ── ROW 3: MIS PEDIDOS SECTION + RIGHT SIDE WIDGETS ── */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
                  
                  {/* Left Main: Mis Pedidos */}
                  <div className="xl:col-span-8 bg-white rounded-3xl p-6 shadow-2xs border border-slate-100/80 space-y-5">
                    
                    {/* Header + Search + Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 leading-tight">Mis Pedidos</h3>
                          <p className="text-[11px] text-slate-400 font-medium">
                            Consulta el estado de tus pedidos y realiza un nuevo pedido.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 sm:w-56">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por Nº de orden o producto..."
                            className="w-full pl-8 pr-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#4F46E5] focus:outline-none shadow-2xs"
                          />
                        </div>

                        <Link
                          to="/productos"
                          className="px-4 py-2 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                        >
                          <span>Comprar nuevamente</span>
                        </Link>
                      </div>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2 overflow-x-auto text-xs">
                      {[
                        { id: 'ALL', label: `Todos los Pedidos (${countAll})` },
                        { id: 'IN_TRANSIT', label: `En Proceso / Ruta (${countInTransit})` },
                        { id: 'DELIVERED', label: `Entregados (${countDelivered})` },
                        { id: 'CANCELLED', label: `Cancelados (${countCancelled})` },
                      ].map((tab) => {
                        const isActive = orderStatusTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setOrderStatusTab(tab.id as any)}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex-shrink-0 ${
                              isActive
                                ? 'bg-[#EEF2FF] text-[#4F46E5]'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Orders List */}
                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-28 bg-slate-50 rounded-2xl animate-pulse" />
                        ))}
                      </div>
                    ) : filteredOrders.length === 0 ? (
                      <div className="text-center py-12 space-y-3">
                        <Package className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="text-xs font-bold text-slate-600">Aún no tienes pedidos en esta sección</p>
                        <Link
                          to="/productos"
                          className="inline-block px-5 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-bold shadow-sm"
                        >
                          Explorar la tienda
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredOrders.map((order) => {
                          const isDelivered = order.status === 'DELIVERED';
                          const isShipped = order.status === 'SHIPPED';
                          const isExpanded = !!expandedOrderProducts[order.id];

                          return (
                            <div
                              key={order.id}
                              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-all shadow-2xs hover:shadow-xs space-y-3"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                
                                {/* 1. Product Thumbnail + Order Number */}
                                <div className="flex items-center gap-3.5">
                                  <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center p-1">
                                      <img
                                        src={order.items?.[0]?.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=100'}
                                        alt="Producto"
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    </div>
                                    {(order.items?.length || 0) > 1 && (
                                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                                        +{order.items.length - 1}
                                      </span>
                                    )}
                                  </div>

                                  <div className="space-y-0.5">
                                    <span className="font-mono text-xs font-black text-slate-900 block">
                                      #{order.orderNumber}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block">
                                      {new Date(order.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}, {new Date(order.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-slate-500 font-medium">
                                        {order.items?.length || 1} {order.items?.length === 1 ? 'producto' : 'productos'}
                                      </span>
                                      <button
                                        onClick={() => toggleProductsExpand(order.id)}
                                        className="text-[10px] text-[#4F46E5] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                                      >
                                        <span>{isExpanded ? 'Ocultar' : 'Ver productos'}</span>
                                        <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* 2. Total & Payment */}
                                <div className="space-y-0.5">
                                  <span className="text-[10px] text-slate-400 block">Total</span>
                                  <p className="text-sm font-black text-slate-900">{formatMoney(order.total)}</p>
                                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                    <span className="text-slate-400">Método de pago</span>
                                    <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-bold text-[9px]">
                                      {order.payments?.[0]?.paymentMethod || 'Yape'}
                                    </span>
                                  </div>
                                </div>

                                {/* 3. Status Badge & Tracking */}
                                <div className="space-y-1">
                                  {isDelivered ? (
                                    <div className="space-y-0.5">
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        Entregado
                                      </span>
                                      <span className="text-[10px] text-slate-400 block">
                                        Recibido el {new Date(order.updatedAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="space-y-0.5">
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                        En tránsito
                                      </span>
                                      <span className="text-[10px] text-slate-400 block">
                                        En camino a tu dirección
                                      </span>
                                    </div>
                                  )}

                                  {order.shipment?.trackingCode && (
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium pt-0.5">
                                      <Truck className="w-3.5 h-3.5 text-[#4F46E5]" />
                                      <span className="font-bold">{order.shipment.trackingCode}</span>
                                      <span className="text-slate-400">· {order.shipment.courier}</span>
                                    </div>
                                  )}
                                </div>

                                {/* 4. Actions Button */}
                                <div className="flex items-center gap-2 self-end sm:self-center">
                                  <button
                                    onClick={() => setSelectedOrderDetail(order)}
                                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#EEF2FF] hover:text-[#4F46E5] text-slate-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                                  >
                                    <span>Ver detalle</span>
                                    <span>→</span>
                                  </button>
                                  <button
                                    onClick={() => setSelectedOrderDetail(order)}
                                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                    title="Más opciones"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                </div>

                              </div>

                              {/* Expanded Products View */}
                              {isExpanded && (
                                <div className="pt-2 border-t border-slate-100 space-y-1.5 animate-in fade-in duration-150">
                                  {(order.items || []).map((it: any) => (
                                    <div key={it.id} className="p-2 rounded-xl bg-slate-50/70 flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-indigo-50 text-[#4F46E5] font-black text-[10px] flex items-center justify-center">
                                          {it.quantity}x
                                        </span>
                                        <div>
                                          <p className="font-bold text-slate-800">{it.productName}</p>
                                          <span className="text-[10px] text-slate-400 font-mono">{it.productSku}</span>
                                        </div>
                                      </div>
                                      <span className="font-bold text-slate-900">{formatMoney(it.subtotal)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>

                  {/* Right Side Column Widgets (Cupones + Promo Novedades) */}
                  <div className="xl:col-span-4 space-y-5">
                    
                    {/* Widget 1: Cupones Disponibles */}
                    <div className="bg-white rounded-3xl p-5 shadow-2xs border border-slate-100/80 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                          <Percent className="w-4 h-4 text-rose-500" />
                          <span>Cupones disponibles</span>
                        </div>
                        <button
                          onClick={() => setActiveNav('COUPONS')}
                          className="text-[11px] font-bold text-[#4F46E5] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Ver todos</span>
                          <span>→</span>
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {AVAILABLE_COUPONS.map((cp) => (
                          <div
                            key={cp.code}
                            className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-slate-900">{cp.code}</span>
                                <span className={`px-2 py-0.2 rounded-md font-bold text-[9px] border ${cp.badgeColor}`}>
                                  {cp.discount}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 block">{cp.desc}</span>
                            </div>

                            <button
                              onClick={() => handleCopy(cp.code)}
                              className="p-2 rounded-xl bg-white hover:bg-indigo-50 hover:text-[#4F46E5] text-slate-500 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
                              title="Copiar cupón"
                            >
                              {copiedCode === cp.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Widget 2: Promo Novedades */}
                    <div className="bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] rounded-3xl p-5 shadow-2xs border border-indigo-100 space-y-3 relative overflow-hidden">
                      <div className="space-y-1 relative z-10 max-w-[65%]">
                        <h4 className="text-sm font-black text-slate-900 leading-tight">
                          ¡Más amor para sus días!
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Descubre nuestras novedades
                        </p>
                        <Link
                          to="/productos"
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black shadow-md transition-all mt-2"
                        >
                          <span>Ver productos</span>
                          <span>→</span>
                        </Link>
                      </div>

                      <div className="absolute -right-3 -bottom-3 w-28 h-28 pointer-events-none">
                        <img
                          src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=150&auto=format&fit=crop&q=80"
                          alt="Gato feliz"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    </div>

                  </div>

                </div>

                {/* ── ROW 4: BOTTOM FIDELIZACIÓN BAR ── */}
                <div className="p-4 sm:p-5 rounded-3xl bg-[#EEF2FF]/90 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-white text-[#4F46E5] flex items-center justify-center font-bold shadow-2xs flex-shrink-0">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-slate-900">Suma puntos con cada compra</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Acumula puntos, desbloquea beneficios y consigue descuentos exclusivos.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowBenefitsModal(true)}
                    className="px-4 py-2 rounded-2xl bg-white hover:bg-indigo-50 text-[#4F46E5] text-xs font-black border border-indigo-200/80 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>Ver mis puntos</span>
                    <span>→</span>
                  </button>
                </div>

              </div>
            )}

            {/* ===================================================================== */}
            {/* VIEW: MIS DIRECCIONES */}
            {/* ===================================================================== */}
            {activeNav === 'ADDRESSES' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl p-6 shadow-2xs border border-slate-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#4F46E5]" />
                      Mis Direcciones de Entrega
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      Guarda tus direcciones habituales para recibir tus pedidos sin demoras.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddAddressModal(true)}
                    className="px-5 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nueva Dirección</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-5 rounded-3xl bg-white border transition-all space-y-3 ${
                        addr.isDefault ? 'border-[#4F46E5] ring-2 ring-indigo-50 shadow-md' : 'border-slate-100 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#4F46E5]" />
                          <h3 className="text-xs font-black text-slate-900">{addr.title}</h3>
                        </div>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            Principal
                          </span>
                        )}
                      </div>

                      <div className="text-xs space-y-1 text-slate-600 bg-slate-50/80 p-3 rounded-2xl">
                        <p className="font-bold text-slate-900">{addr.addressLine}</p>
                        <p className="text-[11px] text-slate-500">{addr.district}, {addr.province}, {addr.department}</p>
                        {addr.reference && <p className="text-[10px] text-slate-400">Ref: {addr.reference}</p>}
                        <p className="text-[10px] text-slate-700 font-mono pt-1">Receptor: {addr.recipientName} ({addr.phone})</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        {!addr.isDefault ? (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-[#4F46E5] font-bold hover:underline cursor-pointer text-[11px]"
                          >
                            Marcar como principal
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold text-[11px]">✓ Dirección predeterminada</span>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* VIEW: MIS GATITOS */}
            {/* ===================================================================== */}
            {activeNav === 'PETS' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl p-6 shadow-2xs border border-slate-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Cat className="w-5 h-5 text-amber-500" />
                      Mis Mascotas (Michis)
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      Perfiles de tus gatitos para recomendaciones exactas de arena sanitaria.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddPetModal(true)}
                    className="px-5 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Registrar Michi</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pets.map((pet) => {
                    const approxLitter = Math.round(pet.weightKg * 2.2);
                    return (
                      <div
                        key={pet.id}
                        className="bg-white rounded-3xl p-6 shadow-2xs border border-slate-100 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 text-xl flex items-center justify-center font-bold">
                              🐱
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-slate-900">{pet.name}</h3>
                              <span className="text-[11px] text-slate-400">{pet.breed}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeletePet(pet.id)}
                            className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50">
                            <span className="text-[10px] text-slate-400 block font-semibold">Edad</span>
                            <span className="font-bold text-slate-800">{pet.ageYears} {pet.ageYears === 1 ? 'año' : 'años'}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50">
                            <span className="text-[10px] text-slate-400 block font-semibold">Peso</span>
                            <span className="font-bold text-slate-800">{pet.weightKg} kg</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-[#EEF2FF] text-xs text-[#4F46E5] font-bold flex items-center justify-between">
                          <span>Consumo estimado</span>
                          <span>~{approxLitter}kg / mes</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* VIEW: CUPONES Y PROMOCIONES */}
            {/* ===================================================================== */}
            {activeNav === 'COUPONS' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl p-6 shadow-2xs border border-slate-100/80 space-y-1">
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#4F46E5]" />
                    Cupones & Promociones Activas
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Aplica estos códigos al realizar tus compras en el checkout para disfrutar de descuentos inmediatos.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AVAILABLE_COUPONS.map((cp) => (
                    <div
                      key={cp.code}
                      className="bg-white rounded-3xl p-6 shadow-2xs border border-slate-100 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-slate-900">{cp.code}</span>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${cp.badgeColor}`}>
                            {cp.discount}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{cp.desc}</p>
                        <span className="text-[10px] text-slate-400 block">Condición: {cp.minSpend}</span>
                      </div>

                      <button
                        onClick={() => handleCopy(cp.code)}
                        className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        {copiedCode === cp.code ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* VIEW: MIS DATOS (PROFILE) */}
            {/* ===================================================================== */}
            {activeNav === 'PROFILE' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xs border border-slate-100/80 space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-900">Mis Datos de Cuenta</h2>
                      <p className="text-xs text-slate-400 font-medium">Información personal asociada a tus pedidos y comprobantes</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                    Rol: {user?.currentRole || 'CUSTOMER'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 block">Nombres</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        defaultValue={user?.firstName || 'Alessander'}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium text-xs focus:border-[#4F46E5] focus:outline-none shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 block">Apellidos</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        defaultValue={user?.lastName || 'Gatuno'}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium text-xs focus:border-[#4F46E5] focus:outline-none shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 block">Correo Electrónico</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        disabled
                        defaultValue={displayEmail}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 font-medium text-xs shadow-2xs cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 block">Teléfono Móvil (WhatsApp)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        defaultValue={user?.phone || '+51 987 654 321'}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium text-xs focus:border-[#4F46E5] focus:outline-none shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => alert('¡Datos personales guardados correctamente!')}
                    className="px-6 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* VIEW: SOPORTE */}
            {/* ===================================================================== */}
            {activeNav === 'SUPPORT' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xs border border-slate-100/80 space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900">Centro de Ayuda y Soporte PeruCat</h2>
                    <p className="text-xs text-slate-400 font-medium">Estamos atentos para ayudarte con cualquier consulta sobre tu compra</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-3xl bg-[#EEF2FF] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-[#4F46E5]">
                      <MessageCircle className="w-5 h-5" />
                      <span>WhatsApp Oficial</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Atención inmediata de lunes a sábado de 9:00 AM a 7:00 PM para tracking de pedidos y despachos.
                    </p>
                    <a
                      href="https://wa.me/51987654321?text=Hola%20PeruCat%2C%20tengo%20una%20consulta%20sobre%20mi%20pedido"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#4F46E5] text-white text-xs font-black shadow-md"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Escribir al +51 987 654 321</span>
                    </a>
                  </div>

                  <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-800">
                      <Mail className="w-5 h-5 text-slate-600" />
                      <span>Correo Electrónico</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Para reclamos, facturación electrónica y convenios corporativos escríbenos a soporte@perucat.pe.
                    </p>
                    <a
                      href="mailto:soporte@perucat.pe"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800 text-white text-xs font-black"
                    >
                      <Mail className="w-4 h-4" />
                      <span>soporte@perucat.pe</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ORDER DETAIL & LIVE PROCESS TIMELINE */}
      {/* ========================================================================= */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-slate-100">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold shadow-2xs">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Detalle del Pedido #{selectedOrderDetail.orderNumber}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    Realizado el {new Date(selectedOrderDetail.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })} a las {new Date(selectedOrderDetail.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Timeline: Pedido realizado → Pago confirmado → Preparación → Despachado → En tránsito → Entregado */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Estado del Proceso de Despacho
              </span>
              <div className="grid grid-cols-5 gap-1 text-center text-xs">
                <div className="space-y-1">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center mx-auto text-xs">✓</div>
                  <span className="font-bold text-[10px] text-slate-800 block">Pago OK</span>
                </div>
                <div className="space-y-1">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center mx-auto text-xs">✓</div>
                  <span className="font-bold text-[10px] text-slate-800 block">Preparación</span>
                </div>
                <div className="space-y-1">
                  <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center mx-auto text-xs ${
                    selectedOrderDetail.status === 'SHIPPED' || selectedOrderDetail.status === 'DELIVERED' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>✓</div>
                  <span className="font-bold text-[10px] text-slate-800 block">Despachado</span>
                </div>
                <div className="space-y-1">
                  <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center mx-auto text-xs ${
                    selectedOrderDetail.status === 'SHIPPED' ? 'bg-[#4F46E5] text-white animate-pulse' : selectedOrderDetail.status === 'DELIVERED' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>🚚</div>
                  <span className="font-bold text-[10px] text-slate-800 block">En Tránsito</span>
                </div>
                <div className="space-y-1">
                  <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center mx-auto text-xs ${
                    selectedOrderDetail.status === 'DELIVERED' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>✓</div>
                  <span className="font-bold text-[10px] text-slate-800 block">Entregado</span>
                </div>
              </div>
            </div>

            {/* Courier & Tracking Box */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Courier / Guía</span>
                <p className="font-bold text-slate-900">{selectedOrderDetail.shipment?.courier || 'Olva Courier Express'}</p>
                <span className="font-mono text-[11px] text-[#4F46E5] font-bold">{selectedOrderDetail.shipment?.trackingCode || 'Generando guía...'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dirección de Entrega</span>
                <p className="font-bold text-slate-900">{selectedOrderDetail.shippingAddress?.addressLine}</p>
                <span className="text-[10px] text-slate-500">{selectedOrderDetail.shippingAddress?.district}, {selectedOrderDetail.shippingAddress?.department}</span>
              </div>
            </div>

            {/* Products Table */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Producto</th>
                    <th className="py-2.5 px-3 text-center">Cant.</th>
                    <th className="py-2.5 px-3 text-right">Unitario</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedOrderDetail.items || []).map((it: any) => (
                    <tr key={it.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {it.productName || it.product?.name}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">{it.quantity}</td>
                      <td className="py-2.5 px-3 text-right">{formatMoney(it.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-black">{formatMoney(it.subtotal || it.unitPrice * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Summary */}
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatMoney(selectedOrderDetail.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Costo de Envío</span>
                <span>{formatMoney(selectedOrderDetail.shippingCost || 0)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Total de la Orden</span>
                <span className="text-base text-[#4F46E5]">{formatMoney(selectedOrderDetail.total)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Boleta</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReorder(selectedOrderDetail)}
                  className="px-5 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Comprar nuevamente</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD NEW ADDRESS */}
      {/* ========================================================================= */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#4F46E5]" />
                Agregar Dirección de Entrega
              </h3>
              <button onClick={() => setShowAddAddressModal(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Nombre de la ubicación (Ej. Casa, Oficina)</label>
                <input
                  type="text"
                  required
                  value={newAddr.title}
                  onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Nombre Receptor</label>
                  <input
                    type="text"
                    required
                    value={newAddr.recipientName}
                    onChange={(e) => setNewAddr({ ...newAddr, recipientName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Teléfono</label>
                  <input
                    type="tel"
                    required
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Distrito (Lima Metropolitana)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Miraflores, San Isidro, Surco"
                  value={newAddr.district}
                  onChange={(e) => setNewAddr({ ...newAddr, district: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Dirección Exacta</label>
                <input
                  type="text"
                  required
                  placeholder="Av. Principal 123, Dpto 402"
                  value={newAddr.addressLine}
                  onChange={(e) => setNewAddr({ ...newAddr, addressLine: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-medium"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#4F46E5] text-white font-black shadow-md"
                >
                  Guardar Dirección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REGISTER PET */}
      {/* ========================================================================= */}
      {showAddPetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Cat className="w-5 h-5 text-amber-500" />
                Registrar Nuevo Michi
              </h3>
              <button onClick={() => setShowAddPetModal(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePet} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Nombre del Gatito *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mochi, Luna"
                  value={newPet.name}
                  onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Edad (Años)</label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={newPet.ageYears}
                    onChange={(e) => setNewPet({ ...newPet, ageYears: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    value={newPet.weightKg}
                    onChange={(e) => setNewPet({ ...newPet, weightKg: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPetModal(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#4F46E5] text-white font-black shadow-md"
                >
                  Guardar Michi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CLUB PERUCAT BENEFITS */}
      {/* ========================================================================= */}
      {showBenefitsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-amber-500 font-black">
                <Crown className="w-6 h-6" />
                <h3 className="text-base font-black text-slate-900">Beneficios Club PeruCat VIP</h3>
              </div>
              <button onClick={() => setShowBenefitsModal(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EEF2FF] to-[#F5F3FF] border border-indigo-100 flex items-start gap-3">
                <Award className="w-5 h-5 text-[#4F46E5] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-900 block">Suma 2 puntos por cada S/ 1.00 de compra</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">Tus puntos se acreditan automáticamente al confirmarse la entrega.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-emerald-900 block">Envío Gratis Mensual</span>
                  <p className="text-emerald-700 text-[11px] mt-0.5">Cupón mensual exclusivo para despacho bonificado en Lima.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                <Gift className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-amber-900 block">Regalo sorpresa en el cumpleaños de tu michi</span>
                  <p className="text-amber-700 text-[11px] mt-0.5">Snacks y juguetes seleccionados para consentir a tu felino.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowBenefitsModal(false)}
                className="px-6 py-2.5 rounded-2xl bg-[#4F46E5] text-white font-black text-xs shadow-md"
              >
                ¡Genial, Entendido!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

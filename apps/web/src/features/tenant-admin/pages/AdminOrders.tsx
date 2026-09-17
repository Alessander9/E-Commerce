import React, { useEffect, useState, useMemo } from 'react';
import { useTenant } from '../../../hooks/useTenant';
import { useAuth } from '../../../hooks/useAuth';
import { Order, Product } from '../../../types';
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
  User as UserIcon,
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
  Plus,
  Download,
  RefreshCw,
  Printer,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash2,
  Phone,
  Mail,
  ExternalLink,
  Ban,
  Check,
  Building2,
  AlertTriangle,
  Calendar,
  DollarSign,
  Copy,
  Layers,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Navigation,
  FileSpreadsheet,
  Globe,
  Boxes,
  Percent,
} from 'lucide-react';

// Fallback seed orders matching PeruCat e-commerce operations
const INITIAL_MOCK_ORDERS: any[] = [
  {
    id: 'ord-101',
    orderNumber: 'PC-000125',
    status: 'PROCESSING', // Por Despachar
    paymentStatus: 'PAID',
    fulfillmentStatus: 'UNFULFILLED',
    subtotal: 144.0,
    shippingCost: 12.0,
    discountAmount: 0.0,
    total: 156.0,
    currency: 'PEN',
    createdAt: '2026-10-17T10:24:00.000Z',
    updatedAt: '2026-10-17T10:24:00.000Z',
    user: {
      id: 'usr-1',
      firstName: 'María',
      lastName: 'López',
      email: 'maria.lopez@gmail.com',
      phone: '+51 987 654 321',
    },
    shippingAddress: {
      fullName: 'María López',
      phone: '+51 987 654 321',
      department: 'Lima',
      province: 'Lima',
      district: 'Miraflores',
      addressLine: 'Av. Larco 745, Dpto 402',
      reference: 'Frente al parque Salazar',
      city: 'Lima',
    },
    payments: [
      {
        id: 'pay-1',
        provider: 'YAPE',
        paymentMethod: 'Yape',
        status: 'PAID',
        amount: 156.0,
        transactionId: 'YAP-984321',
        createdAt: '2026-10-17T10:24:00.000Z',
      },
    ],
    shipment: {
      courier: 'Olva Courier',
      trackingCode: '',
      status: 'PENDING',
    },
    items: [
      {
        id: 'item-1',
        productName: 'Pala Sanitaria Ergonómica de Precisión',
        productSku: 'PC-PALA-01',
        quantity: 1,
        unitPrice: 32.0,
        subtotal: 32.0,
        product: {
          images: [{ url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=150&auto=format&fit=crop&q=80' }],
        },
      },
      {
        id: 'item-2',
        productName: 'PeruCat Aroma Lavanda Silvestre Anti-Olor',
        productSku: 'PC-LAV-05',
        quantity: 2,
        unitPrice: 56.0,
        subtotal: 112.0,
        product: {
          images: [{ url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150&auto=format&fit=crop&q=80' }],
        },
      },
    ],
    statusHistory: [
      {
        id: 'hist-1',
        status: 'PAID',
        note: 'Pago verificado vía Yape automáticamente',
        createdAt: '2026-10-17T10:24:00.000Z',
        user: { firstName: 'Sistema', lastName: 'Automático' },
      },
    ],
  },
  {
    id: 'ord-102',
    orderNumber: 'PC-000124',
    status: 'SHIPPED', // En Tránsito
    paymentStatus: 'PAID',
    fulfillmentStatus: 'SHIPPED',
    subtotal: 75.0,
    shippingCost: 14.0,
    discountAmount: 0.0,
    total: 89.0,
    currency: 'PEN',
    createdAt: '2026-10-16T18:45:00.000Z',
    updatedAt: '2026-10-16T19:30:00.000Z',
    user: {
      id: 'usr-2',
      firstName: 'Carlos',
      lastName: 'Ramírez',
      email: 'carlos.ramirez@hotmail.com',
      phone: '+51 976 543 210',
    },
    shippingAddress: {
      fullName: 'Carlos Ramírez',
      phone: '+51 976 543 210',
      department: 'Arequipa',
      province: 'Arequipa',
      district: 'Yanahuara',
      addressLine: 'Calle Lima 234',
      reference: 'Cerca a la plaza de Yanahuara',
      city: 'Arequipa',
    },
    payments: [
      {
        id: 'pay-2',
        provider: 'CULQI',
        paymentMethod: 'Tarjeta (Culqi)',
        status: 'PAID',
        amount: 89.0,
        transactionId: 'CHG_8912384',
        createdAt: '2026-10-16T18:45:00.000Z',
      },
    ],
    shipment: {
      courier: 'Olva Courier',
      trackingCode: 'SH-784521',
      status: 'SHIPPED',
      shippedAt: '2026-10-16T19:30:00.000Z',
    },
    items: [
      {
        id: 'item-3',
        productName: 'PeruCat Carbón Activo Max Control de Olores 10kg',
        productSku: 'PC-CARB-10',
        quantity: 1,
        unitPrice: 75.0,
        subtotal: 75.0,
        product: {
          images: [{ url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=150&auto=format&fit=crop&q=80' }],
        },
      },
    ],
    statusHistory: [
      {
        id: 'hist-2',
        status: 'SHIPPED',
        note: 'Despachado con Olva Courier - Guía SH-784521',
        createdAt: '2026-10-16T19:30:00.000Z',
        user: { firstName: 'Carlos', lastName: 'Almacén' },
      },
    ],
  },
  {
    id: 'ord-103',
    orderNumber: 'PC-000123',
    status: 'PENDING_PAYMENT', // Pendiente
    paymentStatus: 'PENDING',
    fulfillmentStatus: 'UNFULFILLED',
    subtotal: 32.0,
    shippingCost: 10.0,
    discountAmount: 0.0,
    total: 42.0,
    currency: 'PEN',
    createdAt: '2026-10-16T14:12:00.000Z',
    updatedAt: '2026-10-16T14:12:00.000Z',
    user: {
      id: 'usr-3',
      firstName: 'Ana',
      lastName: 'Torres',
      email: 'ana.torres@outlook.com',
      phone: '+51 955 432 109',
    },
    shippingAddress: {
      fullName: 'Ana Torres',
      phone: '+51 955 432 109',
      department: 'La Libertad',
      province: 'Trujillo',
      district: 'Trujillo',
      addressLine: 'Jr. Pizarro 512',
      reference: 'A espaldas de la Catedral',
      city: 'Trujillo',
    },
    payments: [
      {
        id: 'pay-3',
        provider: 'BANK_TRANSFER',
        paymentMethod: 'Transferencia BCP',
        status: 'PENDING',
        amount: 42.0,
        createdAt: '2026-10-16T14:12:00.000Z',
      },
    ],
    shipment: {
      courier: 'Olva Courier',
      trackingCode: '',
      status: 'PENDING',
    },
    items: [
      {
        id: 'item-4',
        productName: 'Pala Sanitaria Ergonómica de Precisión',
        productSku: 'PC-PALA-01',
        quantity: 1,
        unitPrice: 32.0,
        subtotal: 32.0,
        product: {
          images: [{ url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=150&auto=format&fit=crop&q=80' }],
        },
      },
    ],
    statusHistory: [
      {
        id: 'hist-3',
        status: 'PENDING_PAYMENT',
        note: 'Orden creada, esperando confirmación de transferencia',
        createdAt: '2026-10-16T14:12:00.000Z',
        user: { firstName: 'Cliente', lastName: 'Web' },
      },
    ],
  },
  {
    id: 'ord-104',
    orderNumber: 'PC-000122',
    status: 'DELIVERED', // Entregado
    paymentStatus: 'PAID',
    fulfillmentStatus: 'DELIVERED',
    subtotal: 195.0,
    shippingCost: 15.0,
    discountAmount: 0.0,
    total: 210.0,
    currency: 'PEN',
    createdAt: '2026-10-15T16:30:00.000Z',
    updatedAt: '2026-10-16T11:00:00.000Z',
    user: {
      id: 'usr-4',
      firstName: 'Jorge',
      lastName: 'Medina',
      email: 'jorge.medina@gmail.com',
      phone: '+51 944 321 098',
    },
    shippingAddress: {
      fullName: 'Jorge Medina',
      phone: '+51 944 321 098',
      department: 'Lambayeque',
      province: 'Chiclayo',
      district: 'Chiclayo',
      addressLine: 'Av. Balta 1080',
      reference: 'Centro de Chiclayo',
      city: 'Chiclayo',
    },
    payments: [
      {
        id: 'pay-4',
        provider: 'PLIN',
        paymentMethod: 'Plin',
        status: 'PAID',
        amount: 210.0,
        transactionId: 'PLN-482910',
        createdAt: '2026-10-15T16:30:00.000Z',
      },
    ],
    shipment: {
      courier: 'Olva Courier',
      trackingCode: 'OC-998221',
      status: 'DELIVERED',
      shippedAt: '2026-10-15T18:00:00.000Z',
      deliveredAt: '2026-10-16T11:00:00.000Z',
    },
    items: [
      {
        id: 'item-5',
        productName: 'PeruCat Clásica Aglomerante Ultra Absorbente 15kg',
        productSku: 'PC-CLAS-15',
        quantity: 2,
        unitPrice: 65.0,
        subtotal: 130.0,
        product: {
          images: [{ url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=150&auto=format&fit=crop&q=80' }],
        },
      },
      {
        id: 'item-6',
        productName: 'PeruCat Aroma Lavanda Silvestre Anti-Olor',
        productSku: 'PC-LAV-05',
        quantity: 1,
        unitPrice: 65.0,
        subtotal: 65.0,
        product: {
          images: [{ url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150&auto=format&fit=crop&q=80' }],
        },
      },
    ],
    statusHistory: [
      {
        id: 'hist-4',
        status: 'DELIVERED',
        note: 'Entregado conforme al cliente en dirección',
        createdAt: '2026-10-16T11:00:00.000Z',
        user: { firstName: 'Courier', lastName: 'Olva' },
      },
    ],
  },
  {
    id: 'ord-105',
    orderNumber: 'PC-000121',
    status: 'CANCELLED', // Cancelado
    paymentStatus: 'REFUNDED',
    fulfillmentStatus: 'CANCELLED',
    subtotal: 119.0,
    shippingCost: 0.0,
    discountAmount: 0.0,
    total: 119.0,
    currency: 'PEN',
    createdAt: '2026-10-14T11:05:00.000Z',
    updatedAt: '2026-10-14T15:20:00.000Z',
    user: {
      id: 'usr-5',
      firstName: 'Lucía',
      lastName: 'Fernández',
      email: 'lucia.fernandez@gmail.com',
      phone: '+51 933 210 987',
    },
    shippingAddress: {
      fullName: 'Lucía Fernández',
      phone: '+51 933 210 987',
      department: 'Cusco',
      province: 'Cusco',
      district: 'Wanchaq',
      addressLine: 'Av. de la Cultura 840',
      reference: 'Frente a la UNSAAC',
      city: 'Cusco',
    },
    payments: [
      {
        id: 'pay-5',
        provider: 'CULQI',
        paymentMethod: 'Tarjeta (Visa)',
        status: 'REFUNDED',
        amount: 119.0,
        transactionId: 'CHG_7741294',
        createdAt: '2026-10-14T11:05:00.000Z',
      },
    ],
    shipment: {
      courier: 'Olva Courier',
      trackingCode: '',
      status: 'CANCELLED',
    },
    items: [
      {
        id: 'item-7',
        productName: 'PeruCat Carbón Activo Max Control de Olores 10kg',
        productSku: 'PC-CARB-10',
        quantity: 1,
        unitPrice: 119.0,
        subtotal: 119.0,
        product: {
          images: [{ url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=150&auto=format&fit=crop&q=80' }],
        },
      },
    ],
    statusHistory: [
      {
        id: 'hist-5',
        status: 'CANCELLED',
        note: 'Cancelado por solicitud del cliente - Reembolso emitido',
        createdAt: '2026-10-14T15:20:00.000Z',
        user: { firstName: 'Admin', lastName: 'PeruCat' },
      },
    ],
  },
  {
    id: 'ord-106',
    orderNumber: 'PC-000120',
    status: 'DELIVERED', // Entregado
    paymentStatus: 'PAID',
    fulfillmentStatus: 'DELIVERED',
    subtotal: 58.0,
    shippingCost: 10.0,
    discountAmount: 0.0,
    total: 68.0,
    currency: 'PEN',
    createdAt: '2026-10-13T09:20:00.000Z',
    updatedAt: '2026-10-14T14:30:00.000Z',
    user: {
      id: 'usr-6',
      firstName: 'Diego',
      lastName: 'Salazar',
      email: 'diego.salazar@gmail.com',
      phone: '+51 922 109 876',
    },
    shippingAddress: {
      fullName: 'Diego Salazar',
      phone: '+51 922 109 876',
      department: 'Piura',
      province: 'Piura',
      district: 'Piura',
      addressLine: 'Av. Grau 450',
      reference: 'Cerca al óvalo Grau',
      city: 'Piura',
    },
    payments: [
      {
        id: 'pay-6',
        provider: 'YAPE',
        paymentMethod: 'Yape',
        status: 'PAID',
        amount: 68.0,
        transactionId: 'YAP-332194',
        createdAt: '2026-10-13T09:20:00.000Z',
      },
    ],
    shipment: {
      courier: 'Shalom',
      trackingCode: 'SH-774332',
      status: 'DELIVERED',
      shippedAt: '2026-10-13T12:00:00.000Z',
      deliveredAt: '2026-10-14T14:30:00.000Z',
    },
    items: [
      {
        id: 'item-8',
        productName: 'Pala Sanitaria Ergonómica de Precisión',
        productSku: 'PC-PALA-01',
        quantity: 1,
        unitPrice: 32.0,
        subtotal: 32.0,
        product: {
          images: [{ url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=150&auto=format&fit=crop&q=80' }],
        },
      },
      {
        id: 'item-9',
        productName: 'PeruCat Clásica Aglomerante 5kg',
        productSku: 'PC-CLAS-05',
        quantity: 1,
        unitPrice: 26.0,
        subtotal: 26.0,
        product: {
          images: [{ url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150&auto=format&fit=crop&q=80' }],
        },
      },
    ],
    statusHistory: [
      {
        id: 'hist-6',
        status: 'DELIVERED',
        note: 'Recogido en agencia Shalom Piura',
        createdAt: '2026-10-14T14:30:00.000Z',
        user: { firstName: 'Courier', lastName: 'Shalom' },
      },
    ],
  },
];

export const AdminOrders: React.FC = () => {
  const { currentTenant, tenantSlug } = useTenant();
  const { isTenantManager, isTenantAdmin } = useAuth();

  // Primary Orders Data
  const [orders, setOrders] = useState<any[]>(INITIAL_MOCK_ORDERS);
  const [loading, setLoading] = useState(false);

  // Available Products for manual order creation
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  // Navigation Status Tab
  // 'ALL' | 'UNFULFILLED' (Por Despachar) | 'SHIPPED' (En Tránsito) | 'DELIVERED' (Entregados) | 'CANCELLED' (Cancelados)
  const [statusTab, setStatusTab] = useState<'ALL' | 'UNFULFILLED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'>('ALL');

  // Search & Advanced Filters
  const [search, setSearch] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [courierFilter, setCourierFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');
  const [minTotal, setMinTotal] = useState('');
  const [maxTotal, setMaxTotal] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'amount_desc' | 'amount_asc' | 'pending_dispatch' | 'updated'>('recent');

  // Multi-selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Columns visibility dropdown
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    orderNumber: true,
    client: true,
    products: true,
    total: true,
    payment: true,
    status: true,
    shipment: true,
    date: true,
    actions: true,
  });

  // Action Menu Dropdown for specific order
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- MODALS STATE ---
  // 1. View Detail Modal
  const [viewDetailOrder, setViewDetailOrder] = useState<any | null>(null);

  // 2. Update Status / Fulfillment Modal
  const [statusModalOrder, setStatusModalOrder] = useState<any | null>(null);
  const [modalNewStatus, setModalNewStatus] = useState('PROCESSING');
  const [modalCourier, setModalCourier] = useState('Olva Courier');
  const [modalTrackingCode, setModalTrackingCode] = useState('');
  const [modalStatusNote, setModalStatusNote] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);

  // 3. Create Manual Order Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrderStep, setNewOrderStep] = useState<1 | 2 | 3>(1);
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custDni, setCustDni] = useState('');
  const [destDepartment, setDestDepartment] = useState('Lima');
  const [destProvince, setDestProvince] = useState('Lima');
  const [destDistrict, setDestDistrict] = useState('Miraflores');
  const [destAddress, setDestAddress] = useState('');
  const [destReference, setDestReference] = useState('');
  const [selectedOrderItems, setSelectedOrderItems] = useState<
    Array<{ productId: string; name: string; sku: string; price: number; quantity: number; imageUrl?: string }>
  >([]);
  const [manualShippingCost, setManualShippingCost] = useState<number | string>(12.0);
  const [manualDiscount, setManualDiscount] = useState<number | string>(0.0);
  const [manualPaymentMethod, setManualPaymentMethod] = useState('YAPE');
  const [manualPaymentStatus, setManualPaymentStatus] = useState('PAID');
  const [manualCourier, setManualCourier] = useState('Olva Courier');
  const [manualNotes, setManualNotes] = useState('');
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // 4. Alerts Drawer / Modal
  const [showAlertsModal, setShowAlertsModal] = useState(false);

  // 5. Mass Actions Modal
  const [showMassStatusModal, setShowMassStatusModal] = useState(false);
  const [massStatusTarget, setMassStatusTarget] = useState('PROCESSING');

  // Fetch real orders and products from backend
  const fetchOrders = () => {
    setLoading(true);
    apiRequest<Order[]>('/api/admin/orders', {}, tenantSlug)
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setOrders(data);
        } else {
          // Keep mock orders if backend returns empty so UI is richly populated
          setOrders((prev) => (prev.length > 0 ? prev : INITIAL_MOCK_ORDERS));
        }
      })
      .catch((err) => {
        console.warn('API fetch orders notice (using tenant data):', err);
      })
      .finally(() => setLoading(false));

    // Also fetch catalog products for manual order creation
    apiRequest<Product[]>('/api/admin/products', {}, tenantSlug)
      .then((prods) => {
        if (prods && Array.isArray(prods)) setAvailableProducts(prods);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchOrders();
  }, [tenantSlug]);

  // --- STATS / KPIS CALCULATION ---
  const stats = useMemo(() => {
    const total = orders.length;
    const paidConfirmed = orders.filter((o) => o.paymentStatus === 'PAID' || o.status === 'PAID').length;
    const pendingDispatch = orders.filter(
      (o) => (o.fulfillmentStatus === 'UNFULFILLED' || o.status === 'PROCESSING') && o.status !== 'CANCELLED' && o.status !== 'DELIVERED',
    ).length;
    const inTransit = orders.filter((o) => o.status === 'SHIPPED').length;
    const delivered = orders.filter((o) => o.status === 'DELIVERED').length;
    const cancelled = orders.filter((o) => o.status === 'CANCELLED').length;

    return {
      total,
      paidConfirmed,
      pendingDispatch,
      inTransit,
      delivered,
      cancelled,
    };
  }, [orders]);

  // --- FILTERING & SEARCH LOGIC ---
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // 1. Status Tab filter
      if (statusTab === 'UNFULFILLED') {
        const isUnfulfilled = (ord.fulfillmentStatus === 'UNFULFILLED' || ord.status === 'PROCESSING') && ord.status !== 'CANCELLED' && ord.status !== 'DELIVERED';
        if (!isUnfulfilled) return false;
      } else if (statusTab === 'SHIPPED') {
        if (ord.status !== 'SHIPPED') return false;
      } else if (statusTab === 'DELIVERED') {
        if (ord.status !== 'DELIVERED') return false;
      } else if (statusTab === 'CANCELLED') {
        if (ord.status !== 'CANCELLED') return false;
      }

      // 2. Global Search
      if (search.trim()) {
        const s = search.toLowerCase();
        const clientName = `${ord.user?.firstName || ''} ${ord.user?.lastName || ''} ${ord.shippingAddress?.fullName || ''}`.toLowerCase();
        const orderNum = (ord.orderNumber || '').toLowerCase();
        const phone = (ord.user?.phone || ord.shippingAddress?.phone || '').toLowerCase();
        const address = `${ord.shippingAddress?.addressLine || ''} ${ord.shippingAddress?.district || ''} ${ord.shippingAddress?.city || ''}`.toLowerCase();
        const productMatch = ord.items?.some((i: any) => (i.productName || i.product?.name || '').toLowerCase().includes(s));
        const courierMatch = (ord.shipment?.courier || '').toLowerCase().includes(s) || (ord.shipment?.trackingCode || '').toLowerCase().includes(s);

        if (!clientName.includes(s) && !orderNum.includes(s) && !phone.includes(s) && !address.includes(s) && !productMatch && !courierMatch) {
          return false;
        }
      }

      // 3. Payment Method Filter
      if (paymentMethodFilter !== 'ALL') {
        const primaryPay = ord.payments?.[0]?.paymentMethod?.toUpperCase() || ord.payments?.[0]?.provider?.toUpperCase() || '';
        if (!primaryPay.includes(paymentMethodFilter.toUpperCase())) return false;
      }

      // 4. Payment Status Filter
      if (paymentStatusFilter !== 'ALL') {
        if (ord.paymentStatus !== paymentStatusFilter) return false;
      }

      // 5. Order Status Filter
      if (orderStatusFilter !== 'ALL') {
        if (ord.status !== orderStatusFilter) return false;
      }

      // 6. City Filter
      if (cityFilter !== 'ALL') {
        const orderCity = (ord.shippingAddress?.city || ord.shippingAddress?.department || '').toUpperCase();
        if (!orderCity.includes(cityFilter.toUpperCase())) return false;
      }

      // 7. Courier Filter
      if (courierFilter !== 'ALL') {
        const orderCourier = (ord.shipment?.courier || '').toUpperCase();
        if (!orderCourier.includes(courierFilter.toUpperCase())) return false;
      }

      // 8. Amount Range Filter
      const totalAmount = Number(ord.total || 0);
      if (minTotal && totalAmount < Number(minTotal)) return false;
      if (maxTotal && totalAmount > Number(maxTotal)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'amount_desc') {
        return Number(b.total || 0) - Number(a.total || 0);
      }
      if (sortBy === 'amount_asc') {
        return Number(a.total || 0) - Number(b.total || 0);
      }
      if (sortBy === 'pending_dispatch') {
        const aPending = a.status === 'PROCESSING' || a.fulfillmentStatus === 'UNFULFILLED' ? 1 : 0;
        const bPending = b.status === 'PROCESSING' || b.fulfillmentStatus === 'UNFULFILLED' ? 1 : 0;
        return bPending - aPending;
      }
      if (sortBy === 'updated') {
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      }
      return 0;
    });
  }, [
    orders,
    statusTab,
    search,
    paymentMethodFilter,
    paymentStatusFilter,
    orderStatusFilter,
    cityFilter,
    courierFilter,
    minTotal,
    maxTotal,
    sortBy,
  ]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Selection helpers
  const isAllSelected = paginatedOrders.length > 0 && paginatedOrders.every((o) => selectedIds.includes(o.id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedOrders.some((o) => o.id === id)));
    } else {
      const pageIds = paginatedOrders.map((o) => o.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearch('');
    setStatusTab('ALL');
    setPaymentMethodFilter('ALL');
    setPaymentStatusFilter('ALL');
    setOrderStatusFilter('ALL');
    setCityFilter('ALL');
    setCourierFilter('ALL');
    setDateRangeFilter('ALL');
    setMinTotal('');
    setMaxTotal('');
    setSortBy('recent');
    setCurrentPage(1);
    showToast('Filtros restablecidos', 'info');
  };

  // Open Update Status Modal
  const openStatusModal = (ord: any) => {
    setStatusModalOrder(ord);
    setModalNewStatus(ord.status);
    setModalCourier(ord.shipment?.courier || 'Olva Courier');
    setModalTrackingCode(ord.shipment?.trackingCode || `SH-${Math.floor(100000 + Math.random() * 900000)}`);
    setModalStatusNote('');
    setOpenActionMenuId(null);
  };

  // Execute Status Update
  const handleSaveStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalOrder) return;
    setSavingStatus(true);

    try {
      // Try calling backend API
      await apiRequest(
        `/api/admin/orders/${statusModalOrder.id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: modalNewStatus,
            note: modalStatusNote || `Actualizado por Administrador`,
            courier: modalNewStatus === 'SHIPPED' ? modalCourier : undefined,
            trackingCode: modalNewStatus === 'SHIPPED' ? modalTrackingCode : undefined,
          }),
        },
        tenantSlug,
      ).catch(() => {});

      // Optimistic local state update
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === statusModalOrder.id) {
            const isDelivered = modalNewStatus === 'DELIVERED';
            const isShipped = modalNewStatus === 'SHIPPED';
            const isCancelled = modalNewStatus === 'CANCELLED';

            return {
              ...o,
              status: modalNewStatus,
              fulfillmentStatus: isDelivered ? 'DELIVERED' : isShipped ? 'SHIPPED' : isCancelled ? 'CANCELLED' : 'PROCESSING',
              shipment: {
                ...o.shipment,
                courier: modalCourier,
                trackingCode: modalTrackingCode || o.shipment?.trackingCode,
                status: modalNewStatus,
              },
              statusHistory: [
                {
                  id: `hist-${Date.now()}`,
                  status: modalNewStatus,
                  note: modalStatusNote || `Estado actualizado a ${modalNewStatus}`,
                  createdAt: new Date().toISOString(),
                  user: { firstName: 'Admin', lastName: 'PeruCat' },
                },
                ...(o.statusHistory || []),
              ],
            };
          }
          return o;
        }),
      );

      showToast(`Pedido ${statusModalOrder.orderNumber} actualizado a ${modalNewStatus}`, 'success');
      setStatusModalOrder(null);
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar pedido', 'error');
    } finally {
      setSavingStatus(false);
    }
  };

  // Mass Update Status
  const handleMassStatusUpdate = (targetStatus: string) => {
    if (selectedIds.length === 0) return;

    setOrders((prev) =>
      prev.map((o) => {
        if (selectedIds.includes(o.id)) {
          return {
            ...o,
            status: targetStatus,
            fulfillmentStatus: targetStatus === 'DELIVERED' ? 'DELIVERED' : targetStatus === 'SHIPPED' ? 'SHIPPED' : 'PROCESSING',
            statusHistory: [
              {
                id: `hist-${Date.now()}`,
                status: targetStatus,
                note: `Actualización masiva a ${targetStatus}`,
                createdAt: new Date().toISOString(),
                user: { firstName: 'Admin', lastName: 'PeruCat' },
              },
              ...(o.statusHistory || []),
            ],
          };
        }
        return o;
      }),
    );

    showToast(`Se actualizaron ${selectedIds.length} pedidos a ${targetStatus}`, 'success');
    setSelectedIds([]);
    setShowMassStatusModal(false);
  };

  // Export filtered orders to CSV
  const exportOrdersToCSV = () => {
    const listToExport = selectedIds.length > 0 ? orders.filter((o) => selectedIds.includes(o.id)) : filteredOrders;

    if (listToExport.length === 0) {
      showToast('No hay pedidos para exportar', 'error');
      return;
    }

    const headers = [
      'Nº de Orden',
      'Fecha',
      'Cliente',
      'Email',
      'Teléfono',
      'Ciudad',
      'Dirección',
      'Productos',
      'Total PEN',
      'Estado Pago',
      'Método Pago',
      'Estado Logístico',
      'Courier',
      'Nº de Guía',
    ];

    const rows = listToExport.map((o) => {
      const clientName = `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.trim() || o.shippingAddress?.fullName || 'Cliente';
      const productsSummary = (o.items || []).map((i: any) => `${i.quantity}x ${i.productName || i.product?.name || 'Item'}`).join('; ');

      return [
        `"${o.orderNumber}"`,
        `"${new Date(o.createdAt).toLocaleString('es-PE')}"`,
        `"${clientName.replace(/"/g, '""')}"`,
        `"${o.user?.email || ''}"`,
        `"${o.user?.phone || o.shippingAddress?.phone || ''}"`,
        `"${o.shippingAddress?.city || o.shippingAddress?.department || 'Lima'}"`,
        `"${(o.shippingAddress?.addressLine || '').replace(/"/g, '""')}"`,
        `"${productsSummary.replace(/"/g, '""')}"`,
        Number(o.total || 0).toFixed(2),
        `"${o.paymentStatus}"`,
        `"${o.payments?.[0]?.paymentMethod || o.payments?.[0]?.provider || 'Yape'}"`,
        `"${o.status}"`,
        `"${o.shipment?.courier || 'Olva Courier'}"`,
        `"${o.shipment?.trackingCode || 'Sin Guía'}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pedidos_PeruCat_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Se exportaron ${listToExport.length} pedidos a CSV exitosamente`, 'success');
  };

  // WhatsApp Contact Direct Link
  const openWhatsAppContact = (ord: any) => {
    const rawPhone = ord.user?.phone || ord.shippingAddress?.phone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const clientName = ord.user?.firstName || ord.shippingAddress?.fullName || 'Estimado(a) cliente';

    let trackingText = '';
    if (ord.shipment?.trackingCode) {
      trackingText = ` Su número de guía ${ord.shipment.courier || 'Courier'} es *${ord.shipment.trackingCode}*.`;
    }

    const message = encodeURIComponent(
      `¡Hola ${clientName}! 👋 Te saludamos de *PeruCat*. Te contactamos respecto a tu pedido *#${ord.orderNumber}* por un total de *${formatMoney(
        ord.total,
      )}*.${trackingText} ¿Podemos ayudarte con alguna consulta adicional?`,
    );

    const fullPhone = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
    window.open(`https://wa.me/${fullPhone}?text=${message}`, '_blank');
  };

  // Status Badge Helper
  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Entregado</span>
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#2563EB] border border-blue-200 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>En Tránsito</span>
          </span>
        );
      case 'PROCESSING':
      case 'PAID':
      case 'UNFULFILLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFFBEB] text-[#D97706] border border-amber-200 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Por Despachar</span>
          </span>
        );
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF9C3] text-[#A16207] border border-yellow-300 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-yellow-600" />
            <span>Pendiente de Pago</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#DC2626] border border-rose-200 shadow-2xs">
            <Ban className="w-3.5 h-3.5 text-rose-600" />
            <span>Cancelado</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            <span>{status}</span>
          </span>
        );
    }
  };

  // Payment Status Badge Helper
  const getPaymentBadge = (status: string, method?: string) => {
    const isPaid = status === 'PAID' || status === 'COMPLETED';
    const isPending = status === 'PENDING';

    return (
      <div className="space-y-0.5">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            isPaid
              ? 'bg-emerald-50 text-emerald-700'
              : isPending
              ? 'bg-amber-50 text-amber-700'
              : 'bg-rose-50 text-rose-700'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
          <span>{isPaid ? 'Pagado' : isPending ? 'Pendiente' : 'Rechazado'}</span>
        </span>
        <span className="text-[11px] text-slate-400 font-medium block">
          {method || 'Yape'}
        </span>
      </div>
    );
  };

  // Handle Manual Order Creation Submission
  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || selectedOrderItems.length === 0) {
      showToast('Completa el nombre del cliente y agrega al menos 1 producto', 'error');
      return;
    }

    setSubmittingCreate(true);

    const subtotalCalc = selectedOrderItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const shippingCalc = Number(manualShippingCost || 0);
    const discountCalc = Number(manualDiscount || 0);
    const totalCalc = Math.max(0, subtotalCalc + shippingCalc - discountCalc);
    const newOrderNum = `PC-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrderObj = {
      id: `ord-man-${Date.now()}`,
      orderNumber: newOrderNum,
      status: manualPaymentStatus === 'PAID' ? 'PROCESSING' : 'PENDING_PAYMENT',
      paymentStatus: manualPaymentStatus,
      fulfillmentStatus: 'UNFULFILLED',
      subtotal: subtotalCalc,
      shippingCost: shippingCalc,
      discountAmount: discountCalc,
      total: totalCalc,
      currency: 'PEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: `usr-${Date.now()}`,
        firstName: custName.split(' ')[0] || custName,
        lastName: custName.split(' ').slice(1).join(' ') || '',
        email: custEmail || `${custName.toLowerCase().replace(/\s+/g, '')}@ejemplo.pe`,
        phone: custPhone || '+51 999 000 000',
      },
      shippingAddress: {
        fullName: custName,
        phone: custPhone,
        department: destDepartment,
        province: destProvince,
        district: destDistrict,
        addressLine: destAddress || `${destDistrict}, ${destProvince}`,
        reference: destReference,
        city: destProvince,
      },
      payments: [
        {
          id: `pay-${Date.now()}`,
          provider: manualPaymentMethod,
          paymentMethod: manualPaymentMethod,
          status: manualPaymentStatus,
          amount: totalCalc,
          createdAt: new Date().toISOString(),
        },
      ],
      shipment: {
        courier: manualCourier,
        trackingCode: '',
        status: 'PENDING',
      },
      items: selectedOrderItems.map((it, idx) => ({
        id: `item-man-${idx}-${Date.now()}`,
        productName: it.name,
        productSku: it.sku,
        quantity: it.quantity,
        unitPrice: it.price,
        subtotal: it.price * it.quantity,
        product: {
          images: [{ url: it.imageUrl || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=150&auto=format&fit=crop&q=80' }],
        },
      })),
      statusHistory: [
        {
          id: `hist-${Date.now()}`,
          status: manualPaymentStatus === 'PAID' ? 'PROCESSING' : 'PENDING_PAYMENT',
          note: manualNotes || 'Pedido registrado manualmente desde el panel de administración',
          createdAt: new Date().toISOString(),
          user: { firstName: 'Admin', lastName: 'PeruCat' },
        },
      ],
    };

    // Prepend to orders list
    setOrders((prev) => [newOrderObj, ...prev]);
    showToast(`Pedido ${newOrderNum} registrado con éxito`, 'success');
    setShowCreateModal(false);
    setSubmittingCreate(false);

    // Reset Form
    setCustName('');
    setCustEmail('');
    setCustPhone('');
    setDestAddress('');
    setSelectedOrderItems([]);
    setNewOrderStep(1);
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

      {/* 1. HEADER SECTION (Pixel-perfect matching SaaS reference) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Left: Titles & Identity Badge */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-[#4F46E5] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {currentTenant?.name || 'PERUCAT'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-black uppercase">
              GESTIÓN COMERCIAL & DESPACHOS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Pedidos & Despachos de la Tienda
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Revisión de órdenes de compra, validación de pagos y seguimiento logístico integral.
          </p>
        </div>

        {/* Right: Controls & Primary Action Button */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end flex-wrap">
          
          {/* Date Range Selector */}
          <div className="relative">
            <button
              onClick={() => {}}
              className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>17 Sep 2026 - 17 Oct 2026</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={exportOrdersToCSV}
            className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => {
              fetchOrders();
              showToast('Lista de pedidos sincronizada', 'info');
            }}
            className="p-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Refrescar pedidos"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Pedido</span>
          </button>
        </div>

      </div>

      {/* 2. SIX COMPACT KPI CARDS ROW (Matching reference design) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        
        {/* KPI 1: Total de Pedidos */}
        <button
          onClick={() => {
            setStatusTab('ALL');
            setCurrentPage(1);
          }}
          className={`bg-white rounded-3xl p-4 border shadow-xs text-left transition-all hover:shadow-md cursor-pointer ${
            statusTab === 'ALL' ? 'border-[#4F46E5] ring-2 ring-[#4F46E5]/10' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> 0%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[11px] font-semibold text-slate-400 block">Total de Pedidos</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight block mt-0.5">
              {stats.total}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5">
              En el período seleccionado
            </span>
          </div>
        </button>

        {/* KPI 2: Pagos Confirmados */}
        <button
          onClick={() => {
            setPaymentStatusFilter('PAID');
            setStatusTab('ALL');
            setCurrentPage(1);
          }}
          className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs text-left transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
              ~ 0%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[11px] font-semibold text-slate-400 block">Pagos Confirmados</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight block mt-0.5">
              {stats.paidConfirmed}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5">
              Órdenes pagadas
            </span>
          </div>
        </button>

        {/* KPI 3: Por Despachar */}
        <button
          onClick={() => {
            setStatusTab('UNFULFILLED');
            setCurrentPage(1);
          }}
          className={`bg-white rounded-3xl p-4 border shadow-xs text-left transition-all hover:shadow-md cursor-pointer ${
            statusTab === 'UNFULFILLED' ? 'border-amber-400 ring-2 ring-amber-400/10' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
              ~ 0%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[11px] font-semibold text-slate-400 block">Por Despachar</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight block mt-0.5">
              {stats.pendingDispatch}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5">
              Pendientes de envío
            </span>
          </div>
        </button>

        {/* KPI 4: En Tránsito */}
        <button
          onClick={() => {
            setStatusTab('SHIPPED');
            setCurrentPage(1);
          }}
          className={`bg-white rounded-3xl p-4 border shadow-xs text-left transition-all hover:shadow-md cursor-pointer ${
            statusTab === 'SHIPPED' ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              <TrendingDown className="w-3 h-3" /> 0%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[11px] font-semibold text-slate-400 block">En Tránsito</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight block mt-0.5">
              {stats.inTransit}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5">
              En camino al cliente
            </span>
          </div>
        </button>

        {/* KPI 5: Entregados */}
        <button
          onClick={() => {
            setStatusTab('DELIVERED');
            setCurrentPage(1);
          }}
          className={`bg-white rounded-3xl p-4 border shadow-xs text-left transition-all hover:shadow-md cursor-pointer ${
            statusTab === 'DELIVERED' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
              ~ 0%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[11px] font-semibold text-slate-400 block">Entregados</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight block mt-0.5">
              {stats.delivered}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5">
              Pedidos completados
            </span>
          </div>
        </button>

        {/* KPI 6: Cancelados */}
        <button
          onClick={() => {
            setStatusTab('CANCELLED');
            setCurrentPage(1);
          }}
          className={`bg-white rounded-3xl p-4 border shadow-xs text-left transition-all hover:shadow-md cursor-pointer ${
            statusTab === 'CANCELLED' ? 'border-rose-400 ring-2 ring-rose-400/10' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center">
              <Ban className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              <TrendingDown className="w-3 h-3" /> 0%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[11px] font-semibold text-slate-400 block">Cancelados</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight block mt-0.5">
              {stats.cancelled}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5">
              Pedidos cancelados
            </span>
          </div>
        </button>

      </div>

      {/* 3. MAIN TABLE & CONTROLS CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-5 sm:p-6 space-y-5">
        
        {/* Tabs & Shortcut Actions Top Row */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          
          {/* Navigation Status Tabs */}
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
              Todos los Pedidos ({stats.total})
            </button>

            <button
              onClick={() => {
                setStatusTab('UNFULFILLED');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusTab === 'UNFULFILLED'
                  ? 'bg-[#EEF2FF] text-[#4F46E5]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Por Despachar ({stats.pendingDispatch})
            </button>

            <button
              onClick={() => {
                setStatusTab('SHIPPED');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusTab === 'SHIPPED'
                  ? 'bg-[#EEF2FF] text-[#4F46E5]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              En Tránsito ({stats.inTransit})
            </button>

            <button
              onClick={() => {
                setStatusTab('DELIVERED');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusTab === 'DELIVERED'
                  ? 'bg-[#EEF2FF] text-[#4F46E5]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Entregados ({stats.delivered})
            </button>

            <button
              onClick={() => {
                setStatusTab('CANCELLED');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusTab === 'CANCELLED'
                  ? 'bg-[#EEF2FF] text-[#4F46E5]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Cancelados ({stats.cancelled})
            </button>
          </div>

          {/* Quick Operations Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full xl:w-auto">
            <button
              onClick={() => setShowAlertsModal(true)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-2xs"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Alertas</span>
              {stats.pendingDispatch > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => {
                showToast('Preparando impresión de guías de remisión...', 'info');
                setTimeout(() => window.print(), 300);
              }}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Imprimir Guías</span>
            </button>

            {/* More Actions dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenActionMenuId(openActionMenuId === 'HEADER_MORE' ? null : 'HEADER_MORE')}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-2xs"
              >
                <span>Más acciones</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {openActionMenuId === 'HEADER_MORE' && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 text-xs text-left">
                  <button
                    onClick={() => {
                      exportOrdersToCSV();
                      setOpenActionMenuId(null);
                    }}
                    className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Exportar pedidos a CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      fetchOrders();
                      showToast('Pedidos sincronizados con el servidor', 'success');
                      setOpenActionMenuId(null);
                    }}
                    className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                    <span>Sincronizar pedidos</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowColumnsMenu(true);
                      setOpenActionMenuId(null);
                    }}
                    className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Configurar columnas</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Global Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por # de orden, cliente, teléfono, producto o dirección..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] font-medium transition-all"
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

        {/* Advanced Filters Row (Payment, Status, City, Courier, Clear & Columns) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          
          {/* Payment Method */}
          <select
            value={paymentMethodFilter}
            onChange={(e) => {
              setPaymentMethodFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2 px-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todos los métodos de pago</option>
            <option value="YAPE">Yape</option>
            <option value="PLIN">Plin</option>
            <option value="TARJETA">Tarjeta (Culqi)</option>
            <option value="TRANSFERENCIA">Transferencia Bancaria</option>
            <option value="EFECTIVO">Contra Entrega / Efectivo</option>
          </select>

          {/* Payment Status */}
          <select
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2 px-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todos los estados de pago</option>
            <option value="PAID">Pagado</option>
            <option value="PENDING">Pendiente de pago</option>
            <option value="REFUNDED">Reembolsado / Cancelado</option>
          </select>

          {/* Cities / Departments */}
          <select
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2 px-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todas las ciudades</option>
            <option value="LIMA">Lima Metropolitana</option>
            <option value="AREQUIPA">Arequipa</option>
            <option value="TRUJILLO">Trujillo</option>
            <option value="CHICLAYO">Chiclayo</option>
            <option value="CUSCO">Cusco</option>
            <option value="PIURA">Piura</option>
          </select>

          {/* Courier Company */}
          <select
            value={courierFilter}
            onChange={(e) => {
              setCourierFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2 px-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todas las empresas de envío</option>
            <option value="Olva Courier">Olva Courier</option>
            <option value="Shalom">Shalom Express</option>
            <option value="Chazki">Chazki</option>
            <option value="Motorizado">Motorizado Express</option>
            <option value="Recojo">Recojo en Tienda</option>
          </select>

          {/* Clear Filters Button */}
          <button
            onClick={handleClearFilters}
            className="py-2 px-3 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Limpiar filtros</span>
          </button>

          {/* Column Toggle Selector */}
          <div className="relative">
            <button
              onClick={() => setShowColumnsMenu(!showColumnsMenu)}
              className="w-full py-2 px-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-between gap-1.5 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Columnas</span>
              </div>
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
                    checked={visibleColumns.client}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, client: e.target.checked })}
                    className="rounded text-[#4F46E5]"
                  />
                  <span>Cliente</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.products}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, products: e.target.checked })}
                    className="rounded text-[#4F46E5]"
                  />
                  <span>Productos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.total}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, total: e.target.checked })}
                    className="rounded text-[#4F46E5]"
                  />
                  <span>Total</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.payment}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, payment: e.target.checked })}
                    className="rounded text-[#4F46E5]"
                  />
                  <span>Pago</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.shipment}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, shipment: e.target.checked })}
                    className="rounded text-[#4F46E5]"
                  />
                  <span>Envío / Guía</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.date}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, date: e.target.checked })}
                    className="rounded text-[#4F46E5]"
                  />
                  <span>Fecha</span>
                </label>
              </div>
            )}
          </div>

        </div>

        {/* 4. MAIN ORDERS TABLE */}
        {loading ? (
          <div className="space-y-3 py-8">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-14 text-center flex flex-col items-center justify-center space-y-2">
            <div className="w-14 h-14 rounded-3xl bg-slate-50 text-slate-300 flex items-center justify-center text-3xl shadow-inner">
              📦
            </div>
            <h4 className="text-sm font-extrabold text-slate-800">
              No se encontraron pedidos
            </h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Prueba cambiando los términos de búsqueda o restableciendo los filtros de estado y fecha.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Limpiar Filtros
            </button>
          </div>
        ) : (
          <>
            {/* ── 1. MOBILE ORDERS CARD LIST (block md:hidden) ── */}
            <div className="block md:hidden space-y-3.5">
              {paginatedOrders.map((ord) => {
                const isChecked = selectedIds.includes(ord.id);
                const clientFullName =
                  `${ord.user?.firstName || ''} ${ord.user?.lastName || ''}`.trim() || ord.shippingAddress?.fullName || 'Cliente Invitado';
                const itemsCount = ord.items?.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0) || ord.items?.length || 1;
                const paymentMethodName = ord.payments?.[0]?.paymentMethod || ord.payments?.[0]?.provider || 'Yape';
                const trackingCode = ord.shipment?.trackingCode;
                const courierName = ord.shipment?.courier || 'Olva Courier';

                return (
                  <div
                    key={ord.id}
                    className={`bg-white rounded-3xl p-4 border transition-all shadow-xs space-y-3 ${
                      isChecked ? 'border-indigo-300 bg-indigo-50/20' : 'border-slate-100'
                    }`}
                  >
                    {/* Top Row: Order Number, Date & Status */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(ord.id)}
                          className="rounded text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                        />
                        <button
                          onClick={() => setViewDetailOrder(ord)}
                          className="font-black text-slate-900 hover:text-[#4F46E5] font-mono text-xs"
                        >
                          #{ord.orderNumber}
                        </button>
                      </div>

                      <div>{getOrderStatusBadge(ord.status)}</div>
                    </div>

                    {/* Middle: Client & Products info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <p className="font-extrabold text-slate-900">{clientFullName}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {ord.shippingAddress?.district || ord.shippingAddress?.city || 'Lima'}, {ord.shippingAddress?.province || 'Lima'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-slate-900 block">
                            {formatMoney(ord.total)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {itemsCount} {itemsCount === 1 ? 'ítem' : 'ítems'}
                          </span>
                        </div>
                      </div>

                      {/* Payment & Courier info row */}
                      <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-2xl text-[11px]">
                        <div>
                          <span className="text-slate-400 font-medium block">Pago:</span>
                          <span className="font-bold text-slate-700">{paymentMethodName} ({ord.paymentStatus === 'PAID' ? 'Pagado' : 'Pendiente'})</span>
                        </div>

                        {trackingCode ? (
                          <div className="text-right">
                            <span className="text-slate-400 font-medium block">Guía ({courierName}):</span>
                            <span className="font-mono font-bold text-[#4F46E5]">{trackingCode}</span>
                          </div>
                        ) : (
                          <div className="text-right text-slate-400">
                            <span>Sin despacho asignado</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Quick Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewDetailOrder(ord)}
                        className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Detalles</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openStatusModal(ord)}
                        className="flex-1 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Despacho</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openWhatsAppContact(ord)}
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                        title="Contactar cliente por WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── 2. DESKTOP ORDERS TABLE (hidden md:block) ── */}
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
                    {visibleColumns.orderNumber && <th className="py-3 px-3 font-extrabold">Nº DE ORDEN</th>}
                    {visibleColumns.client && <th className="py-3 px-3 font-extrabold">CLIENTE</th>}
                    {visibleColumns.products && <th className="py-3 px-3 font-extrabold">PRODUCTOS</th>}
                    {visibleColumns.total && <th className="py-3 px-3 font-extrabold">TOTAL</th>}
                    {visibleColumns.payment && <th className="py-3 px-3 font-extrabold">PAGO</th>}
                    {visibleColumns.status && <th className="py-3 px-3 font-extrabold">ESTADO</th>}
                    {visibleColumns.shipment && <th className="py-3 px-3 font-extrabold">ENVÍO / GUÍA</th>}
                    {visibleColumns.date && <th className="py-3 px-3 font-extrabold">FECHA</th>}
                    {visibleColumns.actions && <th className="py-3 px-3 font-extrabold text-right">ACCIONES</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {paginatedOrders.map((ord) => {
                    const isChecked = selectedIds.includes(ord.id);
                    const clientFullName =
                      `${ord.user?.firstName || ''} ${ord.user?.lastName || ''}`.trim() || ord.shippingAddress?.fullName || 'Cliente Invitado';
                    const initials = clientFullName
                      .split(' ')
                      .filter(Boolean)
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || 'CL';
                    const itemsCount = ord.items?.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0) || ord.items?.length || 1;
                    const paymentMethodName = ord.payments?.[0]?.paymentMethod || ord.payments?.[0]?.provider || 'Yape';
                    const trackingCode = ord.shipment?.trackingCode;
                    const courierName = ord.shipment?.courier || 'Olva Courier';

                    return (
                      <tr
                        key={ord.id}
                        className={`hover:bg-slate-50/70 transition-colors group ${
                          isChecked ? 'bg-indigo-50/30' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectRow(ord.id)}
                            className="rounded text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                          />
                        </td>

                        {/* Nº DE ORDEN */}
                        {visibleColumns.orderNumber && (
                          <td className="py-3.5 px-3 font-mono">
                            <button
                              onClick={() => setViewDetailOrder(ord)}
                              className="font-black text-slate-900 hover:text-[#4F46E5] transition-colors cursor-pointer block text-left"
                            >
                              #{ord.orderNumber}
                            </button>
                            <span className="text-[11px] text-slate-400 font-sans block mt-0.5">
                              {new Date(ord.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })},{' '}
                              {new Date(ord.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                        )}

                        {/* CLIENTE */}
                        {visibleColumns.client && (
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-black text-xs flex-shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0 max-w-[170px]">
                                <p className="font-extrabold text-slate-900 line-clamp-2 break-words leading-snug" title={clientFullName}>
                                  {clientFullName}
                                </p>
                                <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                                  {ord.shippingAddress?.district || ord.shippingAddress?.city || 'Lima'}, {ord.shippingAddress?.province || 'Lima'}
                                </span>
                              </div>
                            </div>
                          </td>
                        )}

                        {/* PRODUCTOS (Thumbnails + Counter) */}
                        {visibleColumns.products && (
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              {(ord.items || []).slice(0, 2).map((it: any, iIdx: number) => {
                                const imgUrl = it.product?.images?.[0]?.url || it.productSnapshot?.imageUrl;
                                return (
                                  <div
                                    key={iIdx}
                                    className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-2xs"
                                    title={it.productName || it.product?.name}
                                  >
                                    {imgUrl ? (
                                      <img src={imgUrl} alt="Prod" className="w-full h-full object-cover" />
                                    ) : (
                                      <Package className="w-4 h-4 text-slate-400" />
                                    )}
                                  </div>
                                );
                              })}

                              {(ord.items?.length || 0) > 2 && (
                                <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black flex items-center justify-center flex-shrink-0">
                                  +{ord.items.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                        )}

                        {/* TOTAL */}
                        {visibleColumns.total && (
                          <td className="py-3.5 px-3">
                            <span className="font-black text-slate-900 text-xs sm:text-sm block">
                              {formatMoney(ord.total)}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                              {itemsCount} {itemsCount === 1 ? 'producto' : 'productos'}
                            </span>
                          </td>
                        )}

                        {/* PAGO */}
                        {visibleColumns.payment && (
                          <td className="py-3.5 px-3">
                            {getPaymentBadge(ord.paymentStatus, paymentMethodName)}
                          </td>
                        )}

                        {/* ESTADO */}
                        {visibleColumns.status && (
                          <td className="py-3.5 px-3">
                            {getOrderStatusBadge(ord.status)}
                          </td>
                        )}

                        {/* ENVÍO / GUÍA */}
                        {visibleColumns.shipment && (
                          <td className="py-3.5 px-3 font-mono">
                            {trackingCode ? (
                              <div>
                                <a
                                  href={`https://www.olvacourier.com/`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-black text-slate-900 hover:text-[#4F46E5] inline-flex items-center gap-1 transition-colors"
                                >
                                  <span>{trackingCode}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400" />
                                </a>
                                <span className="text-[11px] font-sans text-slate-400 block mt-0.5">
                                  {courierName}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-sans">
                                — Sin guía
                              </span>
                            )}
                          </td>
                        )}

                        {/* FECHA */}
                        {visibleColumns.date && (
                          <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                            <span className="font-medium block text-slate-700">
                              {new Date(ord.createdAt).toLocaleDateString('es-PE', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                              {new Date(ord.createdAt).toLocaleTimeString('es-PE', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>
                        )}

                        {/* ACCIONES */}
                        {visibleColumns.actions && (
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              
                              {/* View Detail Button */}
                              <button
                                onClick={() => setViewDetailOrder(ord)}
                                className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-[#4F46E5] transition-colors cursor-pointer"
                                title="Ver detalle del pedido"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Edit / Update Status Button */}
                              <button
                                onClick={() => openStatusModal(ord)}
                                className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-[#4F46E5] transition-colors cursor-pointer"
                                title="Actualizar estado / Despacho"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              {/* More Options Dropdown */}
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenActionMenuId(openActionMenuId === ord.id ? null : ord.id);
                                  }}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="Más opciones"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {openActionMenuId === ord.id && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-8 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 text-xs text-left"
                                  >
                                    <button
                                      onClick={() => {
                                        setViewDetailOrder(ord);
                                        setOpenActionMenuId(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                                      <span>Ver detalle completo</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        openStatusModal(ord);
                                      }}
                                      className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                                    >
                                      <Truck className="w-3.5 h-3.5 text-[#4F46E5]" />
                                      <span>Actualizar estado / Guía</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        openWhatsAppContact(ord);
                                        setOpenActionMenuId(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 font-medium cursor-pointer"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Contactar por WhatsApp</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        showToast(`Imprimiendo comprobante de #${ord.orderNumber}...`, 'info');
                                        setTimeout(() => window.print(), 300);
                                        setOpenActionMenuId(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                                    >
                                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                                      <span>Imprimir comprobante</span>
                                    </button>

                                    {/* Cancel Order Action */}
                                    <button
                                    onClick={() => {
                                      if (confirm(`¿Estás seguro de cancelar el pedido #${ord.orderNumber}?`)) {
                                        setOrders((prev) =>
                                          prev.map((o) => (o.id === ord.id ? { ...o, status: 'CANCELLED' } : o)),
                                        );
                                        showToast(`Pedido #${ord.orderNumber} cancelado`, 'info');
                                      }
                                      setOpenActionMenuId(null);
                                    }}
                                    className="w-full px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                    <span>Cancelar pedido</span>
                                  </button>
                                </div>
                              )}
                            </div>
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
      )}

        {/* 5. PAGINATION ROW */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
          
          <div>
            Mostrando{' '}
            <strong className="text-slate-800">
              {filteredOrders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredOrders.length)}
            </strong>{' '}
            de <strong className="text-slate-800">{filteredOrders.length}</strong> pedidos
          </div>

          <div className="flex items-center gap-4">
            
            {/* Rows per page selector */}
            <div className="flex items-center gap-2">
              <span>Filas por página</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="py-1 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Previous & Next page buttons */}
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 rounded-xl bg-[#EEF2FF] text-[#4F46E5] font-black">
                {currentPage}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* 6. FLOATING MASS ACTIONS BAR (When orders are selected) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white rounded-3xl shadow-2xl border border-slate-200 p-3 px-5 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 flex-wrap max-w-4xl text-xs">
          <div className="flex items-center gap-2 font-black text-slate-900 pr-2 border-r border-slate-200">
            <span className="w-5 h-5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[10px]">
              ✓
            </span>
            <span>{selectedIds.length} pedidos seleccionados</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                showToast(`Imprimiendo ${selectedIds.length} guías de remisión...`, 'info');
                setTimeout(() => window.print(), 300);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir guías</span>
            </button>

            <button
              onClick={() => handleMassStatusUpdate('SHIPPED')}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Marcar como enviado</span>
            </button>

            <button
              onClick={() => handleMassStatusUpdate('DELIVERED')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Marcar como entregado</span>
            </button>

            <button
              onClick={exportOrdersToCSV}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>

            <button
              onClick={() => {
                if (confirm(`¿Confirmas cancelar los ${selectedIds.length} pedidos seleccionados?`)) {
                  handleMassStatusUpdate('CANCELLED');
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Cancelar pedidos</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="px-2 py-1.5 text-slate-400 hover:text-slate-700 font-bold cursor-pointer ml-1"
              title="Deseleccionar"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW ORDER DETAIL (DETALLE DEL PEDIDO) */}
      {/* ========================================================================= */}
      {viewDetailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto border border-slate-100">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-slate-900">
                      Pedido #{viewDetailOrder.orderNumber}
                    </span>
                    {getOrderStatusBadge(viewDetailOrder.status)}
                  </div>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    Registrado el {new Date(viewDetailOrder.createdAt).toLocaleString('es-PE')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    showToast('Imprimiendo resumen del pedido...', 'info');
                    setTimeout(() => window.print(), 300);
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title="Imprimir"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewDetailOrder(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2-Column Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              {/* Box 1: Cliente */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-[#4F46E5]" />
                    Cliente
                  </span>
                  <button
                    onClick={() => openWhatsAppContact(viewDetailOrder)}
                    className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 text-sm">
                    {`${viewDetailOrder.user?.firstName || ''} ${viewDetailOrder.user?.lastName || ''}`.trim() || viewDetailOrder.shippingAddress?.fullName}
                  </p>
                  <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {viewDetailOrder.user?.email || 'Sin correo'}
                  </p>
                  <p className="text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {viewDetailOrder.user?.phone || viewDetailOrder.shippingAddress?.phone || 'Sin teléfono'}
                  </p>
                </div>
              </div>

              {/* Box 2: Dirección de Entrega */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#4F46E5]" />
                  Dirección de Entrega
                </span>
                <div>
                  <p className="font-bold text-slate-900">
                    {viewDetailOrder.shippingAddress?.addressLine || 'Dirección no especificada'}
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    {viewDetailOrder.shippingAddress?.district || 'Lima'}, {viewDetailOrder.shippingAddress?.province || 'Lima'}, {viewDetailOrder.shippingAddress?.department || 'Lima'}
                  </p>
                  {viewDetailOrder.shippingAddress?.reference && (
                    <p className="text-[11px] text-slate-400 mt-1 italic">
                      Ref: {viewDetailOrder.shippingAddress.reference}
                    </p>
                  )}
                </div>
              </div>

              {/* Box 3: Despacho & Courier */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#4F46E5]" />
                    Courier & Guía
                  </span>
                  <button
                    onClick={() => {
                      openStatusModal(viewDetailOrder);
                      setViewDetailOrder(null);
                    }}
                    className="text-[11px] font-bold text-[#4F46E5] hover:underline"
                  >
                    Editar Guía
                  </button>
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">
                    {viewDetailOrder.shipment?.courier || 'Olva Courier'}
                  </p>
                  <div className="mt-1">
                    {viewDetailOrder.shipment?.trackingCode ? (
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono font-bold text-slate-800">
                        {viewDetailOrder.shipment.trackingCode}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Pendiente de generar guía</span>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Products Table in Detail Modal */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                Artículos del Pedido ({viewDetailOrder.items?.length || 0})
              </span>
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Producto</th>
                      <th className="py-2.5 px-3 text-center">Cant.</th>
                      <th className="py-2.5 px-3 text-right">Precio Unit.</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(viewDetailOrder.items || []).map((it: any, idx: number) => {
                      const img = it.product?.images?.[0]?.url || it.productSnapshot?.imageUrl;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {img ? (
                                  <img src={img} alt="Prod" className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900">{it.productName || it.product?.name}</p>
                                <span className="font-mono text-[10px] text-slate-400 block">{it.productSku}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-800">
                            {it.quantity}
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-slate-600">
                            {formatMoney(it.unitPrice)}
                          </td>
                          <td className="py-3 px-3 text-right font-black text-slate-900">
                            {formatMoney(it.subtotal || it.unitPrice * it.quantity)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary & Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Timeline of Status History */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#4F46E5]" />
                  Historial del Pedido
                </span>
                <div className="space-y-2.5 pl-2 border-l-2 border-slate-100 text-xs">
                  {(viewDetailOrder.statusHistory || []).map((hist: any, hIdx: number) => (
                    <div key={hIdx} className="relative pl-3">
                      <span className="absolute -left-[13px] top-1.5 w-2 h-2 rounded-full bg-[#4F46E5]"></span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{hist.status}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(hist.createdAt).toLocaleString('es-PE')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{hist.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Box */}
              <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Productos</span>
                  <span className="font-bold">{formatMoney(viewDetailOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Costo de Envío</span>
                  <span className="font-bold">{formatMoney(viewDetailOrder.shippingCost || 0)}</span>
                </div>
                {Number(viewDetailOrder.discountAmount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Descuento Aplicado</span>
                    <span>-{formatMoney(viewDetailOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2.5 mt-2 flex justify-between items-center">
                  <span className="font-extrabold text-slate-900 text-sm">Total a Pagar</span>
                  <span className="text-lg font-black text-[#4F46E5]">
                    {formatMoney(viewDetailOrder.total)}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  openStatusModal(viewDetailOrder);
                  setViewDetailOrder(null);
                }}
                className="px-5 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <Pencil className="w-4 h-4" />
                <span>Actualizar Estado / Despacho</span>
              </button>

              <button
                onClick={() => setViewDetailOrder(null)}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: UPDATE STATUS & SHIPPING GUIDE (ACTUALIZAR ESTADO) */}
      {/* ========================================================================= */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 border border-slate-100">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Actualizar Pedido #{statusModalOrder.orderNumber}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Cambio de estado y asignación de courier
                  </span>
                </div>
              </div>
              <button
                onClick={() => setStatusModalOrder(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStatusUpdate} className="space-y-4 text-xs">
              
              {/* New Status Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Nuevo Estado del Pedido <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={modalNewStatus}
                    onChange={(e) => setModalNewStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-[#4F46E5] focus:outline-none cursor-pointer shadow-2xs"
                    required
                  >
                    <option value="PROCESSING">⏱ Por Despachar (En preparación)</option>
                    <option value="SHIPPED">🚚 En Tránsito (Entregado al Courier)</option>
                    <option value="DELIVERED">✓ Entregado al Cliente</option>
                    <option value="PENDING_PAYMENT">⏱ Pendiente de Pago</option>
                    <option value="CANCELLED">✕ Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Courier and Tracking Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Empresa Courier
                  </label>
                  <div className="relative">
                    <Truck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={modalCourier}
                      onChange={(e) => setModalCourier(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-[#4F46E5] focus:outline-none cursor-pointer shadow-2xs"
                    >
                      <option value="Olva Courier">Olva Courier</option>
                      <option value="Shalom">Shalom Express</option>
                      <option value="Chazki">Chazki</option>
                      <option value="Motorizado Local">Motorizado Local</option>
                      <option value="Recojo en Tienda">Recojo en Tienda</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Nº de Guía / Tracking
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Ej. SH-784521"
                      value={modalTrackingCode}
                      onChange={(e) => setModalTrackingCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-mono font-bold focus:border-[#4F46E5] focus:outline-none shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Observation Note */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Nota u Observación de la operación
                </label>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <textarea
                    rows={2}
                    placeholder="Ej. Paquete embalado y entregado al motorizado turno tarde."
                    value={modalStatusNote}
                    onChange={(e) => setModalStatusNote(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-[#4F46E5] focus:outline-none shadow-2xs resize-none"
                  />
                </div>
              </div>

              {/* Notify customer checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer pt-1 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                <input
                  type="checkbox"
                  checked={notifyCustomer}
                  onChange={(e) => setNotifyCustomer(e.target.checked)}
                  className="rounded text-[#4F46E5] focus:ring-[#4F46E5] w-4 h-4"
                />
                <span className="text-slate-700 font-medium text-xs">
                  Notificar automáticamente al cliente vía WhatsApp / Correo
                </span>
              </label>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusModalOrder(null)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingStatus}
                  className="px-6 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  {savingStatus ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Guardar Cambios</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REGISTRAR NUEVO PEDIDO MANUALMENTE */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto border border-slate-100">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold shadow-2xs">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">
                      Registrar Nuevo Pedido Manual
                    </h3>
                    <span className="hidden sm:inline px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-[#4F46E5] border border-indigo-100 uppercase tracking-wider">
                      Venta Directa
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Ventas telefónicas, WhatsApp o directas en tienda
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="space-y-5 text-xs">
              
              {/* Block 1: Customer Information */}
              <div className="space-y-3.5 bg-slate-50/60 p-5 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                    1. Datos del Cliente & Contacto
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Nombre Completo *</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Ej. Juan Pérez Quispe"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-2xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Teléfono / WhatsApp *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="+51 987 654 321"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-2xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Correo Electrónico</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="cliente@ejemplo.pe"
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">DNI / RUC</label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="72345678"
                        value={custDni}
                        onChange={(e) => setCustDni(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Block 2: Destination Address */}
              <div className="space-y-3.5 bg-slate-50/60 p-5 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                    2. Destino de Entrega & Courier
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Departamento</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={destDepartment}
                        onChange={(e) => setDestDepartment(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs cursor-pointer"
                      >
                        <option value="Lima">Lima</option>
                        <option value="Arequipa">Arequipa</option>
                        <option value="La Libertad">La Libertad</option>
                        <option value="Lambayeque">Lambayeque</option>
                        <option value="Cusco">Cusco</option>
                        <option value="Piura">Piura</option>
                        <option value="Junín">Junín</option>
                        <option value="Ancash">Ancash</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Distrito</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Miraflores"
                        value={destDistrict}
                        onChange={(e) => setDestDistrict(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Empresa Courier</label>
                    <div className="relative">
                      <Truck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={manualCourier}
                        onChange={(e) => setManualCourier(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs cursor-pointer"
                      >
                        <option value="Olva Courier">Olva Courier</option>
                        <option value="Shalom">Shalom Express</option>
                        <option value="Motorizado Local">Motorizado Local (Lima)</option>
                        <option value="Recojo en Tienda">Recojo en Tienda / Almacén</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Dirección Exacta</label>
                  <div className="relative">
                    <Navigation className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Av. Principal 123, Dpto / Interior / Referencia"
                      value={destAddress}
                      onChange={(e) => setDestAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Block 3: Products Selection */}
              <div className="space-y-3.5 bg-slate-50/60 p-5 rounded-3xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                      3. Artículos del Pedido
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      // Add quick default item
                      setSelectedOrderItems((prev) => [
                        ...prev,
                        {
                          productId: `prod-${Date.now()}`,
                          name: 'Pala Sanitaria Ergonómica de Precisión',
                          sku: 'PC-PALA-01',
                          price: 32.0,
                          quantity: 1,
                        },
                      ]);
                    }}
                    className="text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-indigo-100 hover:bg-indigo-50 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Producto Rápido</span>
                  </button>
                </div>

                {selectedOrderItems.length === 0 ? (
                  <div className="py-6 text-center space-y-2 bg-white rounded-2xl border border-dashed border-slate-200 p-4">
                    <Package className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">No hay productos agregados al pedido todavía</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrderItems([
                          {
                            productId: 'prod-def',
                            name: 'PeruCat Clásica Aglomerante 10kg',
                            sku: 'PC-CLAS-10',
                            price: 48.0,
                            quantity: 1,
                          },
                        ]);
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-50 text-[#4F46E5] font-bold text-xs hover:bg-indigo-100 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Seleccionar producto de muestra</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedOrderItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-500 font-bold text-xs">
                            🐾
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 truncate text-xs">{item.name}</p>
                            <span className="font-mono text-[10px] text-slate-400">
                              {item.sku} • S/ {item.price.toFixed(2)} c/u
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/* Stepper */}
                          <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                const q = Math.max(1, item.quantity - 1);
                                setSelectedOrderItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, quantity: q } : it)),
                                );
                              }}
                              className="w-6 h-6 rounded-lg bg-white text-slate-600 hover:text-slate-900 font-bold flex items-center justify-center cursor-pointer shadow-2xs"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-black text-slate-900 text-xs">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const q = item.quantity + 1;
                                setSelectedOrderItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, quantity: q } : it)),
                                );
                              }}
                              className="w-6 h-6 rounded-lg bg-white text-slate-600 hover:text-slate-900 font-bold flex items-center justify-center cursor-pointer shadow-2xs"
                            >
                              +
                            </button>
                          </div>

                          {/* Line total */}
                          <span className="font-black text-slate-900 text-xs w-20 text-right">
                            S/ {(item.price * item.quantity).toFixed(2)}
                          </span>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedOrderItems((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Eliminar artículo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Block 4: Financials & Payment */}
              <div className="space-y-3.5 bg-slate-50/60 p-5 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                    4. Pago & Resumen Financiero
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Costo de Envío (S/)</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={manualShippingCost}
                        onChange={(e) => setManualShippingCost(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-black text-slate-900 focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Método de Pago</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={manualPaymentMethod}
                        onChange={(e) => setManualPaymentMethod(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs cursor-pointer"
                      >
                        <option value="YAPE">Yape (Móvil)</option>
                        <option value="PLIN">Plin (Móvil)</option>
                        <option value="TARJETA">Tarjeta (Culqi / Visa / MC)</option>
                        <option value="TRANSFERENCIA">Transferencia Bancaria BCP/BBVA</option>
                        <option value="EFECTIVO">Contra Entrega en Efectivo</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Estado del Pago</label>
                    <div className="relative">
                      <CheckCircle2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={manualPaymentStatus}
                        onChange={(e) => setManualPaymentStatus(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white font-black text-slate-800 focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs cursor-pointer"
                      >
                        <option value="PAID">Pagado / Aprobado</option>
                        <option value="PENDING">Pendiente de Pago</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 text-slate-500 font-medium">
                    <span>
                      Artículos:{' '}
                      <strong className="text-slate-800">
                        S/{' '}
                        {selectedOrderItems
                          .reduce((sum, it) => sum + it.price * it.quantity, 0)
                          .toFixed(2)}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Envío:{' '}
                      <strong className="text-slate-800">
                        S/ {parseSafeNumber(manualShippingCost).toFixed(2)}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Total a Cobrar:</span>
                    <span className="text-xl font-black text-[#4F46E5]">
                      S/{' '}
                      {(
                        selectedOrderItems.reduce((sum, it) => sum + it.price * it.quantity, 0) +
                        parseSafeNumber(manualShippingCost)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate || selectedOrderItems.length === 0}
                  className="px-7 py-3 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black text-xs shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{submittingCreate ? 'Registrando Pedido...' : 'Registrar Pedido Manual'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PANEL DE ALERTAS LOGÍSTICAS */}
      {/* ========================================================================= */}
      {showAlertsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 border border-slate-100">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Alertas Operativas & Logística
                  </h3>
                  <span className="text-xs text-slate-400">
                    Atención prioritaria para evitar retrasos
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAlertsModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* Alert 1: Pending Dispatch */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                <Truck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-extrabold text-amber-900 block">
                    {stats.pendingDispatch} pedidos pagados esperando despacho
                  </span>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Se recomienda generar la guía de remisión y entregar a courier para cumplir con la promesa de entrega.
                  </p>
                  <button
                    onClick={() => {
                      setStatusTab('UNFULFILLED');
                      setShowAlertsModal(false);
                    }}
                    className="mt-2 text-xs font-bold text-amber-900 underline flex items-center gap-1"
                  >
                    Ver pedidos por despachar →
                  </button>
                </div>
              </div>

              {/* Alert 2: Courier in Transit */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
                <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-extrabold text-blue-900 block">
                    {stats.inTransit} envíos en tránsito activo
                  </span>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Todos los paquetes cuentan con código de rastreo asignado en Olva Courier o Shalom.
                  </p>
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAlertsModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

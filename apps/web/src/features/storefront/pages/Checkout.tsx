import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart';
import { useTenant } from '../../../hooks/useTenant';
import { useAuth } from '../../../hooks/useAuth';
import { ShippingZone } from '../../../types';
import { apiRequest } from '../../../services/api';
import {
  CreditCard,
  ShieldCheck,
  Truck,
  Tag,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  MapPin,
  Building,
  Home,
  Navigation,
  FileText,
  Sparkles,
  Smartphone,
  Banknote,
  Lock,
} from 'lucide-react';
import { formatMoney, parseSafeNumber } from '../../../utils/format';

export const Checkout: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const { tenantSlug, currentTenant } = useTenant();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Personal Info State
  const [fullName, setFullName] = useState(
    user ? `${user.firstName} ${user.lastName}` : ''
  );
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [docNumber, setDocNumber] = useState('');

  // Shipping Address Form State
  const [department, setDepartment] = useState('Lima');
  const [province, setProvince] = useState('Lima');
  const [district, setDistrict] = useState('Miraflores');
  const [addressLine, setAddressLine] = useState('');
  const [reference, setReference] = useState('');

  // Shipping & Coupon State
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [shippingCost, setShippingCost] = useState<number>(10.0);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Payment Method Selection
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'YAPE_PLIN' | 'TRANSFER' | 'CASH'>('CARD');

  // Culqi Card Simulation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardHolder, setCardHolder] = useState(user ? `${user.firstName} ${user.lastName}` : 'ALESSANDER CLIENTE');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');

  useEffect(() => {
    apiRequest<ShippingZone[]>('/api/store/shipping/zones', {}, tenantSlug)
      .then((zones) => {
        setShippingZones(zones);
        if (zones.length > 0) {
          setSelectedZoneId(zones[0].id);
          const rate = zones[0].rates[0];
          if (rate) setShippingCost(parseSafeNumber(rate.price));
        }
      })
      .catch((err) => console.error(err));
  }, [tenantSlug]);

  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(`${user.firstName} ${user.lastName}`);
      if (!email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
      if (!cardHolder) setCardHolder(`${user.firstName} ${user.lastName}`.toUpperCase());
    }
  }, [user]);

  const handleZoneChange = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    const zone = shippingZones.find((z) => z.id === zoneId);
    if (zone && zone.rates.length > 0) {
      setShippingCost(parseSafeNumber(zone.rates[0].price));
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await apiRequest<{
        valid: boolean;
        code: string;
        calculatedDiscount: number;
        message: string;
      }>(
        '/api/store/coupons/validate',
        {
          method: 'POST',
          body: JSON.stringify({ code: couponInput, amount: subtotal }),
        },
        tenantSlug
      );

      const discountVal = parseSafeNumber(res.calculatedDiscount);
      setDiscountAmount(discountVal);
      setCouponSuccess(`¡Cupón ${res.code} aplicado! -${formatMoney(discountVal)}`);
    } catch (err: any) {
      setCouponError(err.message || 'Cupón inválido o expirado');
      setDiscountAmount(0);
    }
  };

  const total = Math.max(0, subtotal + shippingCost - discountAmount);

  const handlePlaceOrderAndPay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (!addressLine.trim()) {
      alert('Por favor completa la dirección de entrega');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create Order in Backend
      const order = await apiRequest<{ id: string; orderNumber: string }>(
        '/api/store/orders',
        {
          method: 'POST',
          body: JSON.stringify({
            items: items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
            })),
            shippingAddress: {
              fullName,
              phone,
              department,
              province,
              district,
              addressLine,
              reference,
            },
            shippingZoneId: selectedZoneId,
            couponCode: couponSuccess ? couponInput : undefined,
          }),
        },
        tenantSlug
      );

      // 2. Process Payment in Backend
      await apiRequest(
        '/api/store/payments/process',
        {
          method: 'POST',
          body: JSON.stringify({
            orderId: order.id,
            provider: paymentMethod === 'CARD' ? 'CULQI' : 'DIRECT_TRANSFER',
            paymentMethod: paymentMethod,
          }),
        },
        tenantSlug
      );

      // 3. Clear Cart & Redirect to Orders Confirmation
      clearCart();
      navigate(`/pedidos/${order.orderNumber}`);
    } catch (err: any) {
      alert(err.message || 'Ocurrió un error al procesar tu pedido.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-primary-light text-primary flex items-center justify-center mx-auto shadow-sm">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-navy">No tienes productos en tu carrito</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Explora nuestro catálogo para agregar productos seleccionados e iniciar tu compra.
        </p>
        <Link
          to="/productos"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-grad-primary text-white font-extrabold text-sm shadow-glow-primary hover:opacity-95 transition-all"
        >
          <span>Explorar Catálogo</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> {currentTenant?.name || 'PeruCat Oficial'} • Proceso de Compra
          </span>
          <h1 className="text-3xl font-black text-navy">Finalizar Compra & Pago Seguro</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Ingresa los datos del destinatario y selecciona tu método de pago preferido.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Checkout 100% Encriptado</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrderAndPay} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: 2-Column Blocks */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Contact Information (2 Columns) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-grad-primary flex items-center justify-center text-white font-black text-sm shadow-glow-primary">
                1
              </div>
              <div>
                <h3 className="font-bold text-navy text-base">Datos Personales del Destinatario</h3>
                <p className="text-xs text-muted-foreground">Información para contacto y emisión de comprobante</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-navy block mb-1.5">Nombre Completo</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-navy block mb-1.5">Teléfono / WhatsApp</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+51 987 654 321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-navy block mb-1.5">Correo Electrónico</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-navy block mb-1.5">DNI o RUC (Opcional)</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="8 dígitos para DNI"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Shipping Address (2 Columns) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-grad-primary flex items-center justify-center text-white font-black text-sm shadow-glow-primary">
                2
              </div>
              <div>
                <h3 className="font-bold text-navy text-base">Dirección de Entrega</h3>
                <p className="text-xs text-muted-foreground">Indica la ubicación exacta para el despacho express</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-navy block mb-1.5">Departamento</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-medium focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-navy block mb-1.5">Provincia</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-medium focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-navy block mb-1.5">Distrito</label>
                <div className="relative">
                  <Navigation className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-medium focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-navy block mb-1.5">Dirección completa</label>
                <div className="relative">
                  <Home className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Av. Las Flores 123, Dpto 401"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-medium focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-navy block mb-1.5">Referencia (Opcional)</label>
                <div className="relative">
                  <Navigation className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Frente al parque o cerca al óvalo"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-medium focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Zone Selector */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="font-bold text-navy text-xs block">Zona de Despacho & Tarifa</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shippingZones.map((zone) => {
                  const rate = zone.rates[0];
                  const price = rate ? Number(rate.price) : 10;
                  const isSelected = selectedZoneId === zone.id;

                  return (
                    <div
                      key={zone.id}
                      onClick={() => handleZoneChange(zone.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-secondary bg-secondary-light/40 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Truck className={`w-4 h-4 ${isSelected ? 'text-secondary' : 'text-gray-400'}`} />
                        <span className="text-xs font-bold text-navy">{zone.name}</span>
                      </div>
                      <span className="text-xs font-black text-navy">{formatMoney(price)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 3: Payment Method Tabs */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-grad-primary flex items-center justify-center text-white font-black text-sm shadow-glow-primary">
                3
              </div>
              <div>
                <h3 className="font-bold text-navy text-base">Método de Pago</h3>
                <p className="text-xs text-muted-foreground">Transacciones protegidas con Culqi y encriptación bancaria</p>
              </div>
            </div>

            {/* Payment Options Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-primary bg-primary-light/50 text-primary shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('YAPE_PLIN')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'YAPE_PLIN'
                    ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span>Yape / Plin</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'TRANSFER'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Building className="w-5 h-5" />
                <span>Transferencia</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'CASH'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>Contra Entrega</span>
              </button>
            </div>

            {/* Credit Card Box */}
            {paymentMethod === 'CARD' && (
              <div className="p-5 rounded-2xl bg-gradient-to-tr from-navy via-navy-light to-navy text-white space-y-4 shadow-xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">
                      Pasarela Culqi Segura
                    </span>
                  </div>
                  <CreditCard className="w-6 h-6 text-white/80" />
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] text-gray-300 block mb-1 font-semibold">
                      Número de Tarjeta (Visa / Mastercard / Amex)
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-accent text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-300 block mb-1 font-semibold">
                        Fecha de Expiración (MM/AA)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-accent text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-300 block mb-1 font-semibold">
                        Código de Seguridad (CVV)
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-accent text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'YAPE_PLIN' && (
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs space-y-2">
                <p className="font-bold">Pago directo con Yape o Plin al +51 988 888 888</p>
                <p className="text-[11px] text-purple-700">
                  Al completar tu pedido, recibirás el QR dinámico de confirmación inmediata.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-bold text-navy text-lg border-b border-gray-100 pb-4">
              Resumen del Pedido
            </h3>

            {/* Items Summary */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="font-bold text-primary">{item.quantity}x</span>
                    <span className="text-navy truncate font-medium">{item.product.name}</span>
                    <span className="text-[10px] text-muted-foreground">({item.variant.name})</span>
                  </div>
                  <span className="font-black text-navy flex-shrink-0">
                    {formatMoney(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Input Box */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <label className="text-xs font-bold text-navy flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" /> ¿Tienes un cupón de descuento?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej. BIENVENIDO10"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 p-3 rounded-xl border border-gray-200 text-xs font-mono uppercase focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-5 py-3 rounded-xl bg-navy text-white text-xs font-bold hover:bg-navy-light transition-colors"
                >
                  Aplicar
                </button>
              </div>
              {couponSuccess && (
                <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {couponSuccess}
                </p>
              )}
              {couponError && (
                <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                </p>
              )}
            </div>

            {/* Totals Breakdown */}
            <div className="pt-4 border-t border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground font-medium">
                <span>Subtotal de productos</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground font-medium">
                <span>Costo de envío ({department})</span>
                <span>{formatMoney(shippingCost)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Descuento aplicado</span>
                  <span>- {formatMoney(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-navy pt-2 border-t border-gray-100">
                <span>Total a Pagar</span>
                <span className="text-primary text-2xl">{formatMoney(total)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 px-6 rounded-2xl bg-grad-primary hover:bg-grad-primary-hover text-white font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-glow-primary hover:shadow-glow-secondary transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Procesando pago seguro...</span>
              ) : (
                <>
                  <span>Pagar {formatMoney(total)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Garantía de compra protegida con encriptación SSL</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

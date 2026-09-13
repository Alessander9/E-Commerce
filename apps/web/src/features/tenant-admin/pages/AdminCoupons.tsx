import React, { useEffect, useState } from 'react';
import { useTenant } from '../../../hooks/useTenant';
import { Coupon } from '../../../types';
import { apiRequest } from '../../../services/api';
import { parseSafeNumber, formatMoney } from '../../../utils/format';
import {
  Tag,
  Plus,
  Percent,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
  Copy,
  Check,
  TrendingUp,
  Clock,
} from 'lucide-react';

export const AdminCoupons: React.FC = () => {
  const { currentTenant, tenantSlug } = useTenant();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal Create Coupon
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(15);
  const [minOrderAmount, setMinOrderAmount] = useState(50);
  const [maxUses, setMaxUses] = useState(100);
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = () => {
    setLoading(true);
    apiRequest<Coupon[]>('/api/admin/coupons', {}, tenantSlug)
      .then((res) => setCoupons(res))
      .catch((err) => console.error('Error fetching admin coupons:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, [tenantSlug]);

  const handleCopyCode = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest(
        '/api/admin/coupons',
        {
          method: 'POST',
          body: JSON.stringify({
            code: code.toUpperCase().trim(),
            description,
            discountType,
            discountValue: Number(discountValue),
            minOrderAmount: Number(minOrderAmount),
            maxUses: Number(maxUses),
          }),
        },
        tenantSlug
      );

      setShowModal(false);
      setCode('');
      setDescription('');
      fetchCoupons();
    } catch (err: any) {
      alert(err.message || 'Error al crear cupón');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCoupons = coupons.filter((c) => c.active);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 w-fit">
            <Sparkles className="w-3.5 h-3.5" /> {currentTenant?.name || 'PeruCat - Tienda Oficial'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-navy mt-1">
            Cupones & Campañas Promocionales
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Incentiva la conversión y fideliza clientes con cupones porcentuales o descuentos en monto fijo.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3.5 rounded-2xl bg-grad-primary hover:bg-grad-primary-hover text-white font-extrabold text-xs flex items-center gap-2 shadow-glow-primary hover:shadow-glow-secondary transition-all transform hover:-translate-y-0.5 active:translate-y-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nuevo Cupón</span>
        </button>
      </div>

      {/* 2. Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Cupones Activos
            </span>
            <span className="text-3xl font-black text-navy mt-1 block">{activeCoupons.length}</span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Disponibles para canje
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Total Creados
            </span>
            <span className="text-3xl font-black text-navy mt-1 block">{coupons.length}</span>
            <span className="text-[11px] text-primary font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> Campañas históricas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Tipo Preferido
            </span>
            <span className="text-xl font-black text-navy mt-1 block">Porcentaje (%)</span>
            <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" /> Mayor tasa de conversión
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Coupons Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center space-y-4">
          <Tag className="w-12 h-12 text-primary mx-auto opacity-30" />
          <div>
            <h3 className="font-bold text-navy text-base">No hay cupones configurados</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Crea tu primer código promocional para incentivar compras en tu tienda.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Cupón</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
            >
              {/* Subtle top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-secondary opacity-80" />

              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-light text-primary font-mono font-black text-sm tracking-wider border border-primary/20">
                    <Tag className="w-4 h-4" />
                    <span>{coupon.code}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(coupon.code)}
                      className="ml-1 text-primary hover:text-navy transition-colors"
                      title="Copiar código"
                    >
                      {copiedCode === coupon.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      coupon.active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {coupon.active ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>

                <div>
                  <div className="text-2xl font-black text-navy flex items-center gap-1.5">
                    {coupon.discountType === 'PERCENTAGE' ? (
                      <>
                        <span className="text-primary">{parseSafeNumber(coupon.discountValue)}%</span>
                        <span className="text-xs text-muted-foreground font-normal">de descuento</span>
                      </>
                    ) : (
                      <>
                        <span className="text-primary">{formatMoney(coupon.discountValue)}</span>
                        <span className="text-xs text-muted-foreground font-normal">descuento directo</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {coupon.description || 'Promoción de temporada válida en toda la tienda.'}
                  </p>
                </div>

                {/* Details Footer */}
                <div className="space-y-1.5 pt-3 border-t border-gray-100 text-[11px] text-gray-500 font-medium">
                  <div className="flex justify-between">
                    <span>Pedido mínimo:</span>
                    <span className="font-bold text-navy">
                      {formatMoney(coupon.minOrderAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usos máximos:</span>
                    <span className="font-bold text-navy">
                      {coupon.maxUses ? `${coupon.maxUses} canjes` : 'Ilimitado'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Válido en storefront</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Auto-aplicable
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Modal: Create Coupon in 2 Columns with Live Card Preview */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Marketing & Conversión
                </span>
                <h3 className="text-xl font-bold text-navy">Crear Código Promocional</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-navy hover:bg-gray-100 transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            {/* Live Simulation Badge Preview */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 border border-primary/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                  Vista Previa del Cupón
                </span>
                <div className="font-mono font-black text-navy text-base mt-0.5">
                  {code ? code.toUpperCase().trim() : 'CUPON-PROMO'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-primary block">
                  {discountType === 'PERCENTAGE'
                    ? `${discountValue || 0}% OFF`
                    : `${formatMoney(discountValue || 0)} OFF`}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Mínimo {formatMoney(minOrderAmount || 0)}
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              {/* Row 1: Code & Type (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-navy block mb-1.5">Código del Cupón *</label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ej. VERANO2026"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-mono font-black focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-navy block mb-1.5">Tipo de Descuento *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDiscountType('PERCENTAGE')}
                      className={`p-3 rounded-2xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                        discountType === 'PERCENTAGE'
                          ? 'bg-primary text-white shadow-glow-primary'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Percent className="w-4 h-4" />
                      <span>Porcentaje (%)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('FIXED_AMOUNT')}
                      className={`p-3 rounded-2xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                        discountType === 'FIXED_AMOUNT'
                          ? 'bg-primary text-white shadow-glow-primary'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Fijo (S/)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Discount Value & Min Order Amount (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-navy block mb-1.5">
                    {discountType === 'PERCENTAGE' ? 'Porcentaje de Descuento (%)' : 'Monto de Descuento (PEN)'} *
                  </label>
                  <div className="relative">
                    {discountType === 'PERCENTAGE' ? (
                      <Percent className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    ) : (
                      <DollarSign className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    )}
                    <input
                      type="number"
                      min="1"
                      max={discountType === 'PERCENTAGE' ? 100 : 9999}
                      placeholder={discountType === 'PERCENTAGE' ? '15' : '20'}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-bold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-navy block mb-1.5">Monto Mínimo de Pedido (PEN) *</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="0"
                      placeholder="50"
                      value={minOrderAmount}
                      onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-bold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Max Uses & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-navy block mb-1.5">Límite de Canjes Totales</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full p-3 rounded-2xl border border-gray-200 text-navy font-bold focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-navy block mb-1.5">Descripción de la Campaña</label>
                  <input
                    type="text"
                    placeholder="Ej. Descuento exclusivo para nuevos suscriptores"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-gray-200 text-navy font-medium focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-2xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-2xl bg-grad-primary hover:bg-grad-primary-hover text-white font-extrabold shadow-glow-primary transition-all disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Crear Cupón'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

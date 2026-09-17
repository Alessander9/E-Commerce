import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Coins,
  Clock,
  Image as ImageIcon,
  Sparkles,
  Save,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Store,
  RefreshCw,
  Sliders,
  Check,
  Calendar,
  Layers,
} from 'lucide-react';

interface TenantSettings {
  currency: string;
  timezone: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  country: string;
  businessHours: string;
  logoUrl: string;
}

const CURRENCIES = [
  { value: 'PEN', label: 'PEN — Sol Peruano (S/) [Moneda Oficial de la Tienda]' },
];

const TIMEZONES = [
  { value: 'America/Lima', label: 'Perú (GMT-5:00 - America/Lima)' },
  { value: 'America/Bogota', label: 'Colombia (GMT-5:00 - America/Bogota)' },
  { value: 'America/Santiago', label: 'Chile (GMT-4:00 - America/Santiago)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (GMT-3:00)' },
  { value: 'America/Mexico_City', label: 'México (GMT-6:00)' },
  { value: 'America/New_York', label: 'EE.UU. Este (GMT-5:00)' },
  { value: 'UTC', label: 'UTC (Tiempo Universal Coordinado)' },
];

export const AdminSettings: React.FC = () => {
  const { token } = useAuth();
  const [settings, setSettings] = useState<TenantSettings>({
    currency: 'PEN',
    timezone: 'America/Lima',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    country: 'Perú',
    businessHours: '',
    logoUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'FINANCE' | 'HOURS' | 'BRANDING'>('GENERAL');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);
      } else {
        const err = await res.json();
        alert(err.message || 'Error al guardar los ajustes de la tienda');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="w-8 h-8 text-[#4F46E5] animate-spin" />
        <span className="text-xs font-bold text-slate-500">Cargando configuración de la tienda...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Header Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        
        {/* Top bar title & action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                Ajustes Globales
              </span>
              <span className="text-xs font-semibold text-slate-400">·</span>
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-slate-400" />
                Tienda Activa
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Configuración de la Tienda
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Administra la identidad comercial, canales de contacto, parámetros monetarios y personalización de marca.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>¡Cambios Guardados!</span>
              </div>
            )}
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="px-6 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-6 overflow-x-auto">
          {[
            { id: 'GENERAL', label: '1. Información del Negocio', icon: Building2 },
            { id: 'FINANCE', label: '2. Moneda y Zona Horaria', icon: Coins },
            { id: 'HOURS', label: '3. Horario de Atención', icon: Clock },
            { id: 'BRANDING', label: '4. Logo e Imagen de Marca', icon: ImageIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                  isActive
                    ? 'bg-white text-[#4F46E5] shadow-xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#4F46E5]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Forms Container */}
        <form onSubmit={handleSave} className="space-y-6">

          {/* ========================================================================= */}
          {/* SECTION 1: BUSINESS INFORMATION */}
          {/* ========================================================================= */}
          {(activeTab === 'GENERAL' || activeTab === 'BRANDING' || activeTab === 'FINANCE' || activeTab === 'HOURS') && (
            <div className={`bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 space-y-6 ${activeTab !== 'GENERAL' ? 'hidden' : ''}`}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-black">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900">Información del Negocio y Contacto</h2>
                    <p className="text-xs text-slate-400 font-medium">Datos visibles en comprobantes, correos y pie de página de la tienda</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                  Sección 1
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Email */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Email de Contacto / Notificaciones <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium text-xs focus:border-[#4F46E5] focus:outline-none shadow-2xs"
                      placeholder="contacto@perucat.pe"
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Teléfono / WhatsApp de Atención <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium text-xs focus:border-[#4F46E5] focus:outline-none shadow-2xs"
                      placeholder="+51 987 654 321"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Dirección Física / Almacén Central
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium text-xs focus:border-[#4F46E5] focus:outline-none shadow-2xs"
                      placeholder="Av. Aviación 2450, San Borja"
                    />
                  </div>
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Ciudad / Departamento
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={settings.city}
                      onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium text-xs focus:border-[#4F46E5] focus:outline-none shadow-2xs"
                      placeholder="Lima"
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    País de Operación
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={settings.country}
                      onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium text-xs focus:border-[#4F46E5] focus:outline-none shadow-2xs"
                      placeholder="Perú"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: CURRENCY & TIMEZONE */}
          {/* ========================================================================= */}
          <div className={`bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 space-y-6 ${activeTab !== 'FINANCE' ? 'hidden' : ''}`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-black">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Moneda Base y Zona Horaria</h2>
                  <p className="text-xs text-slate-400 font-medium">Configuración de precios de catálogo y cálculo de marcas de tiempo</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                Sección 2
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Currency Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Moneda de Cobro en Tienda <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Coins className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-bold text-xs focus:border-[#4F46E5] focus:outline-none cursor-pointer shadow-2xs"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-slate-400 pt-0.5">
                  Los pagos en pasarelas (Culqi, MercadoPago, Yape, BCP) se procesarán en Soles Peruanos.
                </p>
              </div>

              {/* Timezone Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Zona Horaria del Sistema <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium text-xs focus:border-[#4F46E5] focus:outline-none cursor-pointer shadow-2xs"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-slate-400 pt-0.5">
                  Se utiliza para fijar el corte de despacho y vencimiento de promociones.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: BUSINESS HOURS */}
          {/* ========================================================================= */}
          <div className={`bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 space-y-6 ${activeTab !== 'HOURS' ? 'hidden' : ''}`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-black">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Horarios de Atención y Entrega</h2>
                  <p className="text-xs text-slate-400 font-medium">Informa a tus compradores cuándo se procesan y despachan los pedidos</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                Sección 3
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 block">
                Horario Detallado de Operación y Soporte
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <textarea
                  value={settings.businessHours}
                  onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium text-xs focus:border-[#4F46E5] focus:outline-none shadow-2xs resize-none"
                  rows={4}
                  placeholder={`Lunes a Viernes: 9:00 AM - 7:00 PM\nSábados: 9:00 AM - 2:00 PM\nDomingos y Feriados: Cerrado para despachos`}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Este texto aparecerá en el footer de la tienda y en la confirmación de compra por email.
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 4: LOGO & BRANDING */}
          {/* ========================================================================= */}
          <div className={`bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 space-y-6 ${activeTab !== 'BRANDING' ? 'hidden' : ''}`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-black">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Logotipo y Marca Visual</h2>
                  <p className="text-xs text-slate-400 font-medium">Personaliza el logotipo que tus clientes verán en la cabecera y comprobantes</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                Sección 4
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Logo Preview */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vista Previa</span>
                <div className="w-28 h-28 rounded-2xl bg-white border border-slate-200 p-2 flex items-center justify-center shadow-2xs overflow-hidden">
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt="Logo de la tienda"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 gap-1">
                      <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                      <span className="text-[10px] font-semibold">Sin Logo</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">Recomendado: 512x512px en PNG transparente</span>
              </div>

              {/* Logo URL Input */}
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    URL Pública del Logotipo
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="url"
                      value={settings.logoUrl}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium text-xs focus:border-[#4F46E5] focus:outline-none shadow-2xs"
                      placeholder="https://ejemplo.com/logo-perucat.png"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Introduce una URL directa con protocolo HTTPS a un archivo de imagen válido (PNG, SVG, JPG).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-[#4F46E5] flex-shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-600">
                    <span className="font-bold text-slate-900 block mb-0.5">Identidad PeruCat Integrada</span>
                    El logotipo se adaptará automáticamente a la cabecera del storefront y a las plantillas de correo de confirmación de pedido.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Los cambios se aplican de inmediato en toda la plataforma</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Guardando...' : 'Guardar Todos los Ajustes'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

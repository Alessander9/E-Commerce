import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';

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
  { value: 'PEN', label: 'PEN — Sol Peruano' },
  { value: 'USD', label: 'USD — Dólar Americano' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'MXN', label: 'MXN — Peso Mexicano' },
  { value: 'COP', label: 'COP — Peso Colombiano' },
  { value: 'CLP', label: 'CLP — Peso Chileno' },
  { value: 'ARS', label: 'ARS — Peso Argentino' },
];

const TIMEZONES = [
  'America/Lima',
  'America/Bogota',
  'America/Santiago',
  'America/Argentina/Buenos_Aires',
  'America/Mexico_City',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/Madrid',
  'UTC',
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

  const handleSave = async () => {
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
        setTimeout(() => setSaved(false), 3000);
      } else {
        const err = await res.json();
        alert(err.message || 'Error al guardar');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración del Tenant</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="space-y-8">
        {/* Business Info */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Información del Negocio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contacto</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="contacto@tienda.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="+51 999 888 777"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Av. Principal 123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input
                type="text"
                value={settings.city}
                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Lima"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
              <input
                type="text"
                value={settings.country}
                onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Perú"
              />
            </div>
          </div>
        </section>

        {/* Currency & Timezone */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Moneda y Zona Horaria</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zona Horaria</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Business Hours */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Horario de Atención</h2>
          <textarea
            value={settings.businessHours}
            onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
            placeholder="Lunes a Viernes: 9:00 AM - 6:00 PM&#10;Sábados: 9:00 AM - 1:00 PM&#10;Domingos: Cerrado"
          />
        </section>

        {/* Logo */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Logo</h2>
          <div className="flex items-center gap-4">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-16 w-16 object-contain rounded border" />
            ) : (
              <div className="h-16 w-16 bg-gray-100 rounded border flex items-center justify-center text-gray-400 text-xs">
                Sin logo
              </div>
            )}
            <div className="flex-1">
              <input
                type="text"
                value={settings.logoUrl}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="URL del logo"
              />
              <p className="text-xs text-gray-500 mt-1">Pega la URL de una imagen (JPG, PNG, SVG)</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

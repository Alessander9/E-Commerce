import React, { useEffect, useState } from 'react';
import { Tenant } from '../../../types';
import { apiRequest } from '../../../services/api';
import {
  Layers,
  Plus,
  Store,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Settings,
  Sliders,
  Shield,
  Palette,
  Globe,
} from 'lucide-react';

export const TenantsManagement: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // New Tenant Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6A2CFF');
  const [secondaryColor, setSecondaryColor] = useState('#1976FF');
  const [description, setDescription] = useState('');

  const fetchTenants = () => {
    setLoading(true);
    apiRequest<Tenant[]>('/api/platform/tenants')
      .then((data) => setTenants(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleToggleStatus = async (tenantId: string, currentStatus: boolean) => {
    try {
      await apiRequest(`/api/platform/tenants/${tenantId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          active: !currentStatus,
          status: !currentStatus ? 'ACTIVE' : 'INACTIVE',
        }),
      });
      fetchTenants();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar estado del tenant');
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/platform/tenants', {
        method: 'POST',
        body: JSON.stringify({
          name,
          slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
          domain,
          primaryColor,
          secondaryColor,
          description,
        }),
      });

      setShowModal(false);
      setName('');
      setSlug('');
      setDomain('');
      setDescription('');
      fetchTenants();
    } catch (err: any) {
      alert(err.message || 'Error al crear tenant');
    }
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Arquitectura SaaS Multi-Tenant
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-navy">
            Gestión de Tiendas (Tenants)
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Administra múltiples marcas e-commerce independientes sobre la misma infraestructura centralizada.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3.5 rounded-2xl bg-grad-primary hover:bg-grad-primary-hover text-white font-extrabold text-xs flex items-center gap-2 shadow-glow-primary hover:shadow-glow-secondary transition-all transform hover:-translate-y-0.5 active:translate-y-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Tenant</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar tenant por nombre o slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs text-navy focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Tenants Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-72 bg-gray-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((t) => (
            <div
              key={t.id}
              className={`bg-white rounded-3xl border ${
                t.active ? 'border-gray-100' : 'border-gray-200 bg-gray-50/50'
              } p-6 shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-sm"
                      style={{ backgroundColor: t.primaryColor || '#6A2CFF' }}
                    >
                      {t.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-navy">{t.name}</h3>
                      <span className="text-xs text-primary font-mono font-semibold">
                        /{t.slug}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      t.active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {t.active ? 'ACTIVO' : 'PAUSADO'}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                  {t.description || 'Tienda configurada en Cleo Platform'}
                </p>

                {/* Colors Demo */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5" /> Marca:
                  </span>
                  <div
                    className="w-5 h-5 rounded-full border border-gray-200 shadow-sm"
                    style={{ backgroundColor: t.primaryColor || '#6A2CFF' }}
                    title={`Color Primario: ${t.primaryColor}`}
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-gray-200 shadow-sm"
                    style={{ backgroundColor: t.secondaryColor || '#1976FF' }}
                    title={`Color Secundario: ${t.secondaryColor}`}
                  />
                  {t.domain && (
                    <span className="text-[10px] text-gray-400 font-mono ml-auto">
                      {t.domain}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats Footer */}
              <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-center">
                <div className="bg-[#F7F8FC] p-2 rounded-xl">
                  <span className="text-[10px] text-muted-foreground block font-semibold">
                    Productos
                  </span>
                  <span className="text-sm font-black text-navy">{t._count?.products || 0}</span>
                </div>
                <div className="bg-[#F7F8FC] p-2 rounded-xl">
                  <span className="text-[10px] text-muted-foreground block font-semibold">
                    Pedidos
                  </span>
                  <span className="text-sm font-black text-navy">{t._count?.orders || 0}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <a
                    href={`/?tenant=${t.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-primary-light text-primary hover:bg-primary hover:text-white transition-colors text-[11px] font-bold inline-flex items-center gap-1"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Storefront</span>
                  </a>

                  <a
                    href={`/admin?tenant=${t.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-navy hover:text-white transition-colors text-[11px] font-bold inline-flex items-center gap-1"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </a>
                </div>

                <button
                  onClick={() => handleToggleStatus(t.id, t.active)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${
                    t.active
                      ? 'text-rose-600 hover:bg-rose-50'
                      : 'text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {t.active ? 'Pausar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Tenant in 2 Columns */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Ecosistema SaaS Multi-Tenant
                </span>
                <h3 className="text-xl font-bold text-navy">Registrar Nueva Tienda (Tenant)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-navy hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 text-xs">
              {/* Row 1: Store Name & Slug (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-navy block mb-1.5">Nombre Comercial de la Tienda</label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ej. TechStore Perú"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                      }}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-navy block mb-1.5">Slug (Identificador URL)</label>
                  <div className="relative">
                    <span className="text-gray-400 font-mono text-xs absolute left-3.5 top-1/2 -translate-y-1/2">/</span>
                    <input
                      type="text"
                      placeholder="techstore"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase())}
                      className="w-full pl-8 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-mono font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Custom Domain & Palettes (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-navy block mb-1.5">Dominio Personalizado (Opcional)</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="tienda.com"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-navy font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-navy block mb-1.5">Paleta de Marca (Primario / Secundario)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-gray-200">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded-xl border-none cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-[11px] text-gray-600">{primaryColor}</span>
                    </div>

                    <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-gray-200">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-8 h-8 rounded-xl border-none cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-[11px] text-gray-600">{secondaryColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Description */}
              <div>
                <label className="font-bold text-navy block mb-1.5">Descripción & Propuesta de Valor</label>
                <textarea
                  placeholder="Describe la línea de productos, rubro o enfoque de esta tienda..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-gray-200 text-navy font-medium focus:border-primary focus:outline-none h-20"
                />
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
                  className="px-6 py-3 rounded-2xl bg-grad-primary hover:bg-grad-primary-hover text-white font-extrabold shadow-glow-primary transition-all"
                >
                  Crear Tienda Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

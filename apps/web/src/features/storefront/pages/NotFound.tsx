import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useTenant } from '../../../hooks/useTenant';
import {
  Search,
  ArrowRight,
  Home,
  ShoppingBag,
  Sparkles,
  HelpCircle,
  MessageCircle,
  Truck,
  ShieldCheck,
  Package,
  Layers,
  ChevronRight,
  Compass,
} from 'lucide-react';

export const NotFound: React.FC = () => {
  const [query, setQuery] = useState('');
  const { currentTenant } = useTenant();
  const { user, canAccessTenantAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/productos?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const quickCategories = [
    { label: 'PeruCat Clásica', path: '/productos?search=clasica' },
    { label: 'Carbón Activo', path: '/productos?search=carbon' },
    { label: 'Aroma Lavanda', path: '/productos?search=lavanda' },
    { label: 'Packs Familiares', path: '/productos' },
  ];

  return (
    <div className="min-h-[85vh] bg-[#F7F8FC] relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Editorial Top-Aligned Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-20 sm:pb-28">
        
        {/* Top Eyebrow & Status */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-xs uppercase tracking-wider">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>Error 404</span>
          </div>
          <span className="text-gray-400 text-xs font-semibold">•</span>
          <span className="text-gray-500 text-xs font-medium">Página no encontrada</span>
        </div>

        {/* Large Editorial Headline & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
          <div className="lg:col-span-8 space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy tracking-tight leading-[1.15]">
              No pudimos encontrar la página que estás buscando.
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl leading-relaxed">
              La dirección URL que ingresaste puede estar rota, haber sido renombrada o ya no existir en la tienda.
              Puedes realizar una búsqueda rápida o explorar las secciones recomendadas a continuación.
            </p>
          </div>

          {/* Search Bar & Direct Home Button */}
          <div className="lg:col-span-4 space-y-4">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                placeholder="Buscar arenas sanitarias, packs..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-white border border-gray-200 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm font-medium"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-hover:text-primary transition-colors" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-grad-primary text-white font-extrabold text-xs shadow-glow-primary hover:opacity-95 transition-all"
              >
                Buscar
              </button>
            </form>

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-gray-400 font-semibold mr-1">Populares:</span>
              {quickCategories.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-navy hover:text-primary hover:border-primary/40 transition-colors font-medium text-[11px] shadow-xs"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Link
                to="/"
                className="px-5 py-3 rounded-2xl bg-navy hover:bg-navy-light text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all transform hover:-translate-y-0.5"
              >
                <Home className="w-4 h-4 text-accent" />
                <span>Volver al Inicio</span>
              </Link>

              <Link
                to="/productos"
                className="px-5 py-3 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-navy font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-primary" />
                <span>Ver Productos</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Three-Column Card Grid (React Bits Pro 404-4 Style) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-gray-200">
          
          {/* Column 1: Catálogo de Arenas Sanitarias */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-card-hover transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-navy group-hover:text-primary transition-colors">
                Catálogo de Arenas PeruCat
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Descubre nuestra gama de bentonita 100% natural, fórmula con carbón activo anti-olor y la suave edición con aroma a lavanda.
              </p>
            </div>

            <div className="pt-6">
              <Link
                to="/productos"
                className="inline-flex items-center gap-2 text-xs font-extrabold text-primary hover:text-primary-hover group-hover:translate-x-1 transition-all"
              >
                <span>Explorar todo el catálogo</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Column 2: Guía de Cuidado & Beneficios */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-card-hover transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center transition-transform group-hover:scale-110">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-navy group-hover:text-secondary transition-colors">
                ¿Cómo Funciona PeruCat?
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Conoce las ventajas de nuestra aglomeración instantánea en 3 segundos, fórmula 99.5% libre de polvo y consejos para el arenero.
              </p>
            </div>

            <div className="pt-6">
              <Link
                to="/#descubre-perucat"
                className="inline-flex items-center gap-2 text-xs font-extrabold text-secondary hover:text-secondary-hover group-hover:translate-x-1 transition-all"
              >
                <span>Conocer beneficios y guía</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Column 3: Soporte & Contacto WhatsApp */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-card-hover transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent-dark flex items-center justify-center transition-transform group-hover:scale-110">
                <MessageCircle className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-black text-navy group-hover:text-accent transition-colors">
                Soporte & Pedidos Directos
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                ¿Necesitas ayuda con un pedido, envíos a provincias o consultas personalizadas? Nuestro equipo está listo para atenderte.
              </p>
            </div>

            <div className="pt-6">
              <a
                href="https://wa.me/51999999999?text=Hola%20PeruCat%2C%20necesito%20ayuda%20con%20la%20tienda"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-extrabold text-accent hover:text-accent-dark group-hover:translate-x-1 transition-all"
              >
                <span>Chatear por WhatsApp</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Role & Support Links */}
        <div className="mt-12 pt-8 border-t border-gray-200/80 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/" className="hover:text-navy font-semibold transition-colors">
              Inicio
            </Link>
            <span>•</span>
            <Link to="/productos" className="hover:text-navy font-semibold transition-colors">
              Productos
            </Link>
            <span>•</span>
            {canAccessTenantAdmin && (
              <>
                <Link to="/admin" className="text-primary font-bold hover:underline flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Panel Admin</span>
                </Link>
                <span>•</span>
              </>
            )}
            {user && (
              <Link to="/mis-pedidos" className="hover:text-navy font-semibold transition-colors">
                Mis Pedidos
              </Link>
            )}
          </div>

          <div className="text-gray-400">
            Tienda oficial <strong>{currentTenant?.name || 'PeruCat'}</strong>
          </div>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useTenant } from '../../../hooks/useTenant';
import {
  Compass,
  Home,
  ShoppingBag,
  Search,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Package,
  Layers,
  ShieldCheck,
  Store,
} from 'lucide-react';

export const NotFound: React.FC = () => {
  const [query, setQuery] = useState('');
  const { currentTenant } = useTenant();
  const { user, canAccessTenantAdmin, currentRole } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/productos?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const quickLinks = [
    { label: 'Frutos Secos', path: '/productos?category=frutos-secos' },
    { label: 'Superalimentos', path: '/productos?category=superalimentos' },
    { label: 'Miel y Derivados', path: '/productos?category=miel-y-derivados' },
    { label: 'Todo el Catálogo', path: '/productos' },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 relative overflow-hidden bg-[#F7F8FC]">
      {/* Ambient Blurred Glowing Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full text-center relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Animated Badge & Floating Icon */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-white shadow-2xl border border-gray-100/80 flex items-center justify-center text-primary group transition-transform hover:scale-105">
              <Compass className="w-12 h-12 text-primary animate-[spin_10s_linear_infinite]" />
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-grad-primary text-white shadow-glow-primary">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-light text-primary text-xs font-bold uppercase tracking-wider shadow-sm">
            <span>Error 404 • Ruta no encontrada</span>
          </div>
        </div>

        {/* Big Gradient 404 Headline */}
        <div className="space-y-3">
          <h1 className="text-7xl sm:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-purple to-secondary select-none">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-black text-navy">
            Parece que te has desviado del camino
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            La página o recurso que estás buscando no existe, ha sido movido de lugar o no está disponible en este momento.
          </p>
        </div>

        {/* Integrated Search Bar */}
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              placeholder="Buscar productos en el catálogo..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-gray-200 text-xs text-navy placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm group-hover:border-primary/40 font-medium"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-hover:text-primary transition-colors" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-grad-primary text-white font-bold text-xs shadow-glow-primary hover:opacity-95 transition-all"
            >
              Buscar
            </button>
          </form>

          {/* Quick Categories Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px]">
            <span className="text-gray-400 font-semibold">Sugerencias:</span>
            {quickLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="px-2.5 py-1 rounded-full bg-white border border-gray-200 text-navy hover:text-primary hover:border-primary/40 transition-colors font-medium shadow-xs"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Action Buttons Hub */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="px-6 py-3.5 rounded-2xl bg-grad-primary text-white font-extrabold text-xs shadow-glow-primary hover:opacity-95 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>

          <Link
            to="/productos"
            className="px-6 py-3.5 rounded-2xl bg-white border border-gray-200 text-navy font-bold text-xs hover:border-primary/40 hover:text-primary transition-all shadow-sm flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <ShoppingBag className="w-4 h-4 text-secondary" />
            <span>Ver Productos</span>
          </Link>

          {/* Role-Aware Direct Shortcut */}
          {canAccessTenantAdmin ? (
            <Link
              to="/admin"
              className="px-5 py-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-secondary font-bold text-xs hover:bg-blue-100 transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Panel Admin Tienda</span>
            </Link>
          ) : user ? (
            <Link
              to="/mis-pedidos"
              className="px-5 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-navy font-bold text-xs transition-colors flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>Mis Pedidos</span>
            </Link>
          ) : null}
        </div>

        {/* Footer Support Info */}
        <div className="pt-6 border-t border-gray-200/60 text-xs text-muted-foreground flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-accent" />
            <span>Tienda Oficial: <strong>{currentTenant?.name || 'PeruCat'}</strong></span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span>Soporte: <strong>{currentTenant?.settings?.supportEmail || 'contacto@perucat.pe'}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

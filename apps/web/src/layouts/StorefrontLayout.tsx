import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useTenant } from '../hooks/useTenant';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { CartDrawer } from '../components/cart/CartDrawer';
import {
  ShoppingBag,
  Search,
  User,
  ShieldCheck,
  Store,
  ChevronDown,
  LogOut,
  Package,
  Sparkles,
  Heart,
  Truck,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';

export const StorefrontLayout: React.FC = () => {
  const { currentTenant } = useTenant();
  const { user, isAuthenticated, canAccessTenantAdmin, logout } = useAuth();
  const { totalItems, setIsCartDrawerOpen } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productos?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FC]">

      {/* 1.5 Role Welcome Ribbon for Admin Users */}
      {isAuthenticated && canAccessTenantAdmin && (
        <div className="bg-grad-primary text-white py-2 px-4 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-white font-black text-[10px] tracking-wider uppercase">
                {user?.currentRole || 'ADMIN'}
              </span>
              <span>
                Hola <strong>{user?.firstName}</strong>, tienes privilegios de administración activos en PeruCat.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/admin"
                className="px-3 py-1 rounded-xl bg-navy text-accent font-black text-xs hover:bg-navy-light shadow-sm transition-all flex items-center gap-1.5 border border-navy-light"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>Ir al Panel de Administración</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Header */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-grad-primary flex items-center justify-center text-white shadow-glow-primary transition-transform group-hover:scale-105">
              <span className="font-black text-xl tracking-tighter">🐾</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl text-navy tracking-tight leading-none group-hover:text-primary transition-colors">
                PeruCat
              </span>
              <span className="text-[10px] text-accent-dark font-bold tracking-widest uppercase mt-0.5">
                Arenas Sanitarias & Cuidado Felino
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar arena clásica, carbón activo, lavanda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/90 border border-gray-200 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm font-medium"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
            </div>
          </form>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/productos"
              className="text-sm font-bold text-navy hover:text-primary px-3 py-2 rounded-xl hover:bg-primary-light/50 transition-colors hidden sm:block"
            >
              Catálogo
            </Link>

            <Link
              to="/productos?category=control-olores"
              className="text-sm font-bold text-navy hover:text-primary px-3 py-2 rounded-xl hover:bg-primary-light/50 transition-colors hidden lg:block"
            >
              Carbón Activo
            </Link>

            <Link
              to="/productos?category=aromas-y-fragancias"
              className="text-sm font-bold text-navy hover:text-primary px-3 py-2 rounded-xl hover:bg-primary-light/50 transition-colors hidden lg:block"
            >
              Aromas
            </Link>

            {/* Direct Dashboard Entry Button in Header */}
            {canAccessTenantAdmin && (
              <Link
                to="/admin"
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-navy text-accent hover:bg-navy-light text-xs font-black border border-navy-light shadow-sm transition-all"
                title="Panel de Administración PeruCat"
              >
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>Admin</span>
              </Link>
            )}

            {/* Wishlist Trigger */}
            <Link
              to="/favoritos"
              className="relative p-2.5 rounded-2xl bg-white border border-gray-200/80 text-navy hover:border-rose-400 hover:text-rose-500 transition-all shadow-sm group"
            >
              <Heart className="w-5 h-5 transition-transform group-hover:scale-110" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-2.5 rounded-2xl bg-white border border-gray-200/80 text-navy hover:border-primary/40 hover:text-primary transition-all shadow-sm hover:shadow-glow-primary group"
            >
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-grad-primary text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rounded-full bg-white border border-gray-200/80 hover:border-primary/40 transition-all shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-grad-primary text-white font-bold text-xs flex items-center justify-center">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-navy hidden md:inline max-w-[100px] truncate">
                    {user?.firstName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 mr-1" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs text-muted-foreground">Sesión iniciada</p>
                      <p className="text-sm font-bold text-navy truncate">{user?.email}</p>
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-primary border border-purple-100 mt-1">
                        Rol: {user?.currentRole || 'CUSTOMER'}
                      </span>
                    </div>

                    {canAccessTenantAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-secondary font-bold text-xs transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <p>Panel de Administración</p>
                          <p className="text-[10px] font-normal text-blue-600">Catálogo, stock y pedidos</p>
                        </div>
                      </Link>
                    )}

                    <Link
                      to="/favoritos"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-navy hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Mis Favoritos</span>
                    </Link>

                    <Link
                      to="/mis-pedidos"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-navy hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      <span>Mis Pedidos</span>
                    </Link>

                    <div className="pt-1 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-danger hover:bg-red-50 rounded-xl transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-glow-primary flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 3. Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 4. Slide-over Cart Drawer */}
      <CartDrawer />

      {/* 5. PeruCat Footer */}
      <footer className="bg-navy text-white pt-16 pb-12 border-t border-navy-light/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-grad-primary flex items-center justify-center text-white font-black text-xl shadow-glow-primary">
                🐾
              </div>
              <span className="font-black text-2xl text-white">PeruCat</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-normal">
              Marca especializada en arena sanitaria para gatos, creada para ofrecer una solución práctica, eficiente y de calidad para el cuidado diario de las mascotas.
            </p>
            <p className="text-[11px] text-accent font-semibold">
              ✨ Antes conocida como <strong>Capsufet</strong>.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm text-accent uppercase tracking-wider mb-4">Líneas de Producto</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><Link to="/productos?category=arenas-aglomerantes" className="hover:text-accent transition-colors">Arenas Aglomerantes Clásicas</Link></li>
              <li><Link to="/productos?category=control-olores" className="hover:text-accent transition-colors">Control de Olores (Carbón Activo)</Link></li>
              <li><Link to="/productos?category=aromas-y-fragancias" className="hover:text-accent transition-colors">Fragancias Lavanda & Flores</Link></li>
              <li><Link to="/productos?category=accesorios-areneros" className="hover:text-accent transition-colors">Palas & Accesorios de Arenero</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-accent uppercase tracking-wider mb-4">Atención al Cliente</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                <span>contacto@perucat.pe</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent" />
                <span>WhatsApp: +51 987 654 321</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Lima, Perú (Envíos a Nivel Nacional)</span>
              </li>
              <li className="pt-1 text-gray-400">
                Horario: Lun - Sáb 08:00 a 19:00
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-accent uppercase tracking-wider mb-4">Compromiso PeruCat</h4>
            <p className="text-xs text-gray-300 mb-3 leading-relaxed">
              <strong>PeruCat: limpieza, practicidad y bienestar para tu gato y tu hogar.</strong> Productos testeados para garantizar la salud de las vías respiratorias y patitas de tu mascota.
            </p>
            <div className="p-3 rounded-2xl bg-navy-light/60 border border-navy-light flex items-center gap-2">
              <Truck className="w-5 h-5 text-accent flex-shrink-0" />
              <span className="text-[11px] text-gray-300 font-medium">Reparto rápido y seguro en Lima Metropolitana y provincias.</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-navy-light/30 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} PeruCat. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer">Términos y Condiciones</span>
            <span className="hover:text-white cursor-pointer">Políticas de Privacidad</span>
            <span className="hover:text-white cursor-pointer">Libro de Reclamaciones</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

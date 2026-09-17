import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Zap,
  Star,
  Flame,
  User,
  LogOut,
  Package,
  Layers,
  ChevronDown,
} from 'lucide-react';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';

type MenuItemType = {
  title: string;
  href: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
};

const PRODUCT_VARIETIES: MenuItemType[] = [
  {
    title: 'PeruCat Clásica',
    href: '/productos?search=clasica',
    description: 'Bentonita 100% natural, terrones en 3s y 99.5% sin polvo.',
    icon: Sparkles,
    badge: 'Bestseller',
  },
  {
    title: 'Carbón Activo',
    href: '/productos?search=carbon',
    description: 'Microgránulos de carbón que neutralizan malos olores 24/7.',
    icon: Zap,
    badge: 'Anti-Olor',
  },
  {
    title: 'Aroma Lavanda',
    href: '/productos?search=lavanda',
    description: 'Fragancia botánica relajante que se activa con el uso.',
    icon: Star,
  },
  {
    title: 'Packs Familiares',
    href: '/productos',
    description: 'Combos de 2, 4 y 6 bolsas con ahorro de hasta 25%.',
    icon: Flame,
    badge: 'Oferta',
  },
];

const BENEFIT_ITEMS: MenuItemType[] = [
  {
    title: 'Aglomeración en 3s',
    href: '/#descubre-perucat',
    description: 'Terrones compactos y fáciles de retirar.',
    icon: ShieldCheck,
  },
  {
    title: '99.5% Sin Polvo',
    href: '/#descubre-perucat',
    description: 'Protege las vías respiratorias y patitas de tu gato.',
    icon: Sparkles,
  },
  {
    title: 'Envíos a Todo el Perú',
    href: '/productos',
    description: 'Despacho express a Lima Metropolitana y Provincias.',
    icon: Package,
  },
  {
    title: 'Catálogo Completo',
    href: '/productos',
    description: 'Explora todas nuestras arenas y presentaciones.',
    icon: Layers,
  },
];

export interface NavbarProps {
  showSearch?: boolean;
  showWishlist?: boolean;
  showCart?: boolean;
  showAuth?: boolean;
  sticky?: boolean;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  showSearch = true,
  showWishlist = true,
  showCart = true,
  showAuth = true,
  sticky = true,
  className = '',
}) => {
  const { user, isAuthenticated, canAccessTenantAdmin, logout } = useAuth();
  const { totalItems, setIsCartDrawerOpen } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productos?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`${
        sticky ? 'sticky top-0' : 'relative'
      } z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs ${className}`}
    >
      {/* ── Admin Privilege Ribbon ── */}
      {isAuthenticated && canAccessTenantAdmin && (
        <div className="bg-grad-primary text-white py-1.5 px-4 text-xs font-medium">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-white font-black text-[10px] uppercase">
                {user?.currentRole || 'ADMIN'}
              </span>
              <span>
                Hola <strong>{user?.firstName}</strong>, tienes privilegios de administración activos.
              </span>
            </div>
            <Link
              to="/admin"
              className="px-2.5 py-0.5 rounded-lg bg-navy text-accent font-black text-[11px] hover:bg-navy-light transition-all flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Panel Admin</span>
            </Link>
          </div>
        </div>
      )}

      {/* ── Main Navigation Bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Mobile Trigger */}
        <div className="flex items-center gap-3">
          {/* Mobile Sheet Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-xl"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5 text-navy" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-6 flex flex-col justify-between">
              <div className="space-y-6">
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center gap-2.5 text-navy">
                    <span className="w-9 h-9 rounded-xl bg-grad-primary flex items-center justify-center text-white text-base shadow-glow-primary">
                      🐾
                    </span>
                    <span className="font-black text-xl">PeruCat</span>
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Buscar arena sanitaria..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-navy focus:outline-none focus:border-primary"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </form>

                {/* Mobile Navigation Links */}
                <div className="space-y-1 text-sm font-bold text-navy">
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50"
                  >
                    <span>Inicio</span>
                  </Link>
                  <Link
                    to="/productos"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50"
                  >
                    <span>Todos los Productos</span>
                    <Badge variant="default" className="text-[10px]">Catálogo</Badge>
                  </Link>
                  <Link
                    to="/productos?search=clasica"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50"
                  >
                    <span>PeruCat Clásica</span>
                    <Badge variant="secondary" className="text-[10px]">Bestseller</Badge>
                  </Link>
                  <Link
                    to="/productos?search=carbon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50"
                  >
                    <span>Carbón Activo Anti-Olor</span>
                  </Link>
                  <Link
                    to="/productos?search=lavanda"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50"
                  >
                    <span>Aroma Lavanda</span>
                  </Link>
                  <Link
                    to="/#descubre-perucat"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50"
                  >
                    <span>Beneficios & Guía</span>
                  </Link>
                </div>
              </div>

              {/* Mobile Auth Button Footer */}
              <div className="pt-6 border-t border-gray-100 space-y-3">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {user?.firstName?.[0] || 'U'}
                      </div>
                      <div className="text-xs truncate">
                        <p className="font-bold text-navy truncate">{user?.firstName} {user?.lastName}</p>
                        <p className="text-gray-400 text-[10px] truncate">{user?.email}</p>
                      </div>
                    </div>
                    {canAccessTenantAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full py-2 px-3 rounded-xl bg-blue-50 text-secondary text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Panel Admin</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-rose-50 text-danger text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full py-2.5 rounded-xl bg-grad-primary text-white text-xs font-bold flex items-center justify-center gap-2 shadow-glow-primary"
                    >
                      <User className="w-4 h-4" />
                      <span>Iniciar Sesión</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full py-2.5 rounded-xl bg-gray-100 text-navy text-xs font-bold flex items-center justify-center"
                    >
                      <span>Crear Cuenta</span>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-grad-primary flex items-center justify-center text-white shadow-glow-primary transition-transform group-hover:scale-105">
              <span className="font-black text-xl">🐾</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl text-navy tracking-tight leading-none group-hover:text-primary transition-colors">
                PeruCat
              </span>
              <span className="text-[10px] text-accent font-bold tracking-widest uppercase mt-0.5">
                Arenas Sanitarias
              </span>
            </div>
          </Link>
        </div>

        {/* ── Desktop Mega Menu ── */}
        <div className="hidden lg:flex items-center justify-center flex-1">
          <NavigationMenu>
            <NavigationMenuList>
              
              {/* Menu 1: Variedades & Packs */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Arenas & Packs</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[620px] gap-3 p-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 pb-1">
                        Variedades PeruCat
                      </p>
                      {PRODUCT_VARIETIES.map((item, i) => (
                        <li key={i}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.href}
                              className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-primary/5 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform mt-0.5">
                                <item.icon className="w-4 h-4" />
                              </div>
                              <div className="space-y-0.5 text-left">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-navy group-hover:text-primary transition-colors">
                                    {item.title}
                                  </span>
                                  {item.badge && (
                                    <span className="px-1.5 py-0.2 rounded-md bg-accent/15 text-accent text-[9px] font-black uppercase">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-500 leading-snug line-clamp-1">
                                  {item.description}
                                </p>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </div>

                    {/* Featured Promo Card */}
                    <li className="rounded-2xl overflow-hidden bg-gradient-to-br from-navy to-[#182a57] text-white p-4 flex flex-col justify-between relative group">
                      <div className="relative z-10 space-y-2">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-black uppercase">
                          ✨ Nueva Fórmula
                        </span>
                        <h4 className="text-sm font-black leading-tight text-white">
                          PeruCat Bentonita Premium
                        </h4>
                        <p className="text-[11px] text-gray-300 leading-relaxed">
                          Terrones ultra compactos al instante y 99.5% libre de polvo para el máximo confort felino.
                        </p>
                      </div>
                      <div className="relative z-10 pt-3">
                        <Link
                          to="/productos"
                          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-accent hover:text-white transition-colors"
                        >
                          <span>Ver Catálogo Completo</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Menu 2: Beneficios & Cuidado */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Beneficios</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[460px] gap-2 p-4 grid-cols-2">
                    {BENEFIT_ITEMS.map((item, i) => (
                      <li key={i}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={item.href}
                            className="flex flex-col items-start gap-1 p-3 rounded-xl hover:bg-secondary/5 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                              <item.icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-navy group-hover:text-secondary transition-colors mt-1">
                              {item.title}
                            </span>
                            <p className="text-[10px] text-gray-500 leading-tight">
                              {item.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Direct Links */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/productos"
                    className={navigationMenuTriggerStyle()}
                  >
                    Productos
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/#descubre-perucat"
                    className={navigationMenuTriggerStyle()}
                  >
                    ¿Por qué PeruCat?
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* ── Action Hub: Search, Wishlist, Cart & Login/Profile ── */}
        {/* ── Action Hub: Search, Wishlist, Cart & Login/Profile ── */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Desktop Search Bar */}
          {showSearch && (
            <form onSubmit={handleSearch} className="hidden xl:flex relative w-48">
              <input
                type="text"
                placeholder="Buscar arena..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-full bg-gray-100 border border-transparent text-xs text-navy placeholder:text-gray-400 focus:bg-white focus:border-primary focus:outline-none transition-all"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </form>
          )}

          {/* Wishlist Trigger */}
          {showWishlist && (
            <Link
              to="/favoritos"
              className="relative p-2.5 rounded-xl hover:bg-gray-100 text-navy hover:text-primary transition-colors"
              title="Mis Favoritos"
              aria-label="Mis Favoritos"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}

          {/* Cart Drawer Trigger */}
          {showCart && (
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex items-center justify-center"
              title="Carrito de Compras"
              aria-label="Carrito de Compras"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          )}

          {/* Login / User Profile Dropdown */}
          {showAuth && (
            isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-navy transition-all"
                  aria-label="Menú de usuario"
                >
                  <div className="w-7 h-7 rounded-xl bg-grad-primary text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                  <span className="hidden md:inline text-xs font-bold text-navy truncate max-w-[100px]">
                    {user?.firstName || 'Mi Cuenta'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:inline" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1"
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-400">Sesión iniciada</p>
                      <p className="text-sm font-bold text-navy truncate">{user?.email}</p>
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-primary border border-purple-100 mt-1">
                        Rol: {user?.currentRole || 'CUSTOMER'}
                      </span>
                    </div>

                    {canAccessTenantAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] font-bold text-xs transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Panel Admin Tienda</span>
                      </Link>
                    )}

                    <Link
                      to="/mis-pedidos"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      <Package className="w-4 h-4 text-[#4F46E5]" />
                      <span>Mi Portal de Cliente</span>
                    </Link>

                    <Link
                      to="/favoritos"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>Mis Favoritos</span>
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
                className="px-4 py-2 rounded-full bg-grad-primary hover:bg-grad-primary-hover text-white text-xs font-extrabold transition-all shadow-glow-primary flex items-center gap-1.5 transform hover:scale-105 active:scale-95"
              >
                <User className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </Link>
            )
          )}

        </div>
      </div>
    </header>
  );
};

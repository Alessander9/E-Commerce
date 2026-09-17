import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTenant } from '../hooks/useTenant';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Store,
  LogOut,
  Boxes,
  Settings,
  Menu,
  Search,
  Bell,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Check,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { AdminSidebar, AdminNavItem } from '../components/layout/AdminSidebar';
import { FontSizeSelector } from '../components/common/FontSizeSelector';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'order' | 'warning' | 'coupon' | 'info';
  read: boolean;
  link?: string;
}

export const TenantAdminLayout: React.FC = () => {
  const { user, logout, isTenantAdmin, isTenantManager, currentRole, roleLevel } = useAuth();
  const { currentTenant } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();

  // Collapsed state (persisted)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cleo_tenant_sidebar_collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Interactive Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Nuevo pedido recibido #ORD-0012',
      description: 'El cliente completó el pago de S/ 129.00 vía Culqi.',
      time: 'Hace 5 min',
      type: 'order',
      read: false,
      link: '/admin/pedidos',
    },
    {
      id: '2',
      title: 'Alerta de Stock Bajo: Arena 5kg',
      description: 'Quedan solo 8 unidades disponibles en inventario.',
      time: 'Hace 45 min',
      type: 'warning',
      read: false,
      link: '/admin/inventario',
    },
    {
      id: '3',
      title: 'Cupón BIENVENIDA canjeado',
      description: 'Descuento del 10% aplicado en pedido reciente.',
      time: 'Hace 2 horas',
      type: 'coupon',
      read: false,
      link: '/admin/cupones',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cleo_tenant_sidebar_collapsed', String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  useEffect(() => {
    setIsMobileOpen(false);
    setShowNotifications(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  // Keyboard shortcuts: Ctrl+B to toggle sidebar, Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapse();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('global-admin-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems: AdminNavItem[] = [
    {
      label: 'Dashboard & Métricas',
      description: 'Resumen general, ventas y KPIs',
      path: '/admin',
      icon: LayoutDashboard,
      minLevel: 2,
    },
    {
      label: 'Gestión de Productos',
      description: 'Catálogo, precios y fotos',
      path: '/admin/productos',
      icon: Package,
      minLevel: 2,
    },
    {
      label: 'Pedidos & Despachos',
      description: 'Estado de envíos y tracking',
      path: '/admin/pedidos',
      icon: ShoppingBag,
      minLevel: 2,
    },
    {
      label: 'Inventario & Stock',
      description: 'Kardex, stock mínimo y alertas',
      path: '/admin/inventario',
      icon: Boxes,
      minLevel: 2,
    },
    {
      label: 'Cupones de Descuento',
      description: 'Promociones y reglas comerciales',
      path: '/admin/cupones',
      icon: Tag,
      minLevel: 3,
    },
    {
      label: 'Configuración',
      description: 'Parámetros del tenant y pagos',
      path: '/admin/configuracion',
      icon: Settings,
      minLevel: 3,
    },
  ].filter((item) => roleLevel >= (item.minLevel || 0));

  const getRoleBadge = () => {
    if (isTenantAdmin) {
      return {
        label: 'ADMINISTRADOR (L3)',
        shortLabel: 'ADMIN (L3)',
        color: 'bg-primary/10 text-primary border-primary/25',
        darkColor: 'bg-primary/20 text-primary-light border-primary/40',
        icon: ShieldCheck,
      };
    }
    if (isTenantManager) {
      return {
        label: 'GESTOR OPERATIVO (L2)',
        shortLabel: 'GESTOR (L2)',
        color: 'bg-amber-500/10 text-amber-700 border-amber-500/25',
        darkColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        icon: Shield,
      };
    }
    return {
      label: 'CLIENTE (L1)',
      shortLabel: 'CLIENTE (L1)',
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      darkColor: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
      icon: Shield,
    };
  };

  const badge = getRoleBadge();

  return (
    <TooltipProvider delayDuration={100}>
      <div className="min-h-screen flex bg-[#F8F9FE] text-slate-800 antialiased selection:bg-primary/20 selection:text-primary font-sans">
        
        {/* Componentized Reusable Admin Sidebar */}
        <AdminSidebar
          brandTitle={currentTenant?.name || 'PeruCat'}
          brandLogo="🐾"
          brandHomePath="/admin"
          roleBadge={badge}
          navItems={navItems}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
          showStorefrontLink={true}
          storefrontPath="/"
        />

        {/* Main Admin Workspace Container */}
        <div className={`flex-1 flex flex-col min-w-0 min-h-screen transition-[padding] duration-300 ${
          isCollapsed ? 'lg:pl-[76px]' : 'lg:pl-[270px]'
        }`}>
          
          {/* Top Admin Workspace Header */}
          <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shadow-xs transition-all">
            
            {/* Left Header: Mobile Hamburger, Desktop Toggle & Search */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden p-2 rounded-xl text-navy hover:bg-gray-100 transition-colors border border-gray-200"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Desktop Toggle Button in Header */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleCollapse}
                    className="hidden lg:flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-600 border border-slate-200 transition-all duration-200"
                    aria-label={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
                  >
                    {isCollapsed ? (
                      <PanelLeftOpen className="w-4 h-4" />
                    ) : (
                      <PanelLeftClose className="w-4 h-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">
                    {isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'} <kbd className="ml-1 px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono text-slate-300">Ctrl+B</kbd>
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Global Search Bar */}
              <div className="relative w-full max-w-sm hidden sm:block">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="global-admin-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos, pedidos, clientes..."
                  className="w-full pl-10 pr-20 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200/90 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-400 font-bold shadow-xs">
                    Ctrl + K
                  </kbd>
                </div>
              </div>
            </div>

            {/* Right Header Area */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              
              {/* Dynamic Font Size Controller */}
              <FontSizeSelector />
              
              {/* Notifications Interactive Button & Dropdown */}
              <div className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        setShowNotifications(!showNotifications);
                        setShowUserMenu(false);
                      }}
                      className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
                      aria-label="Notificaciones"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="font-medium">
                      {unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : 'Notificaciones'}
                    </p>
                  </TooltipContent>
                </Tooltip>

                {/* Notifications Panel */}
                {showNotifications && (
                  <div className="absolute right-0 sm:right-0 mt-2 w-[290px] sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-900">Notificaciones</h4>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-black">
                            {unreadCount} nuevas
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Marcar leídas
                        </button>
                      )}
                    </div>

                    <div className="py-2 divide-y divide-slate-50 max-h-80 overflow-y-auto no-scrollbar">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6 text-center">No hay notificaciones</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.link) {
                                setShowNotifications(false);
                                navigate(n.link);
                              }
                            }}
                            className={`p-3 rounded-2xl transition-colors cursor-pointer flex items-start gap-3 ${
                              !n.read ? 'bg-slate-50/80 hover:bg-slate-100' : 'hover:bg-slate-50 opacity-80'
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                n.type === 'order'
                                  ? 'bg-blue-100 text-blue-600'
                                  : n.type === 'warning'
                                  ? 'bg-amber-100 text-amber-600'
                                  : 'bg-purple-100 text-purple-600'
                              }`}
                            >
                              {n.type === 'order' ? (
                                <ShoppingBag className="w-4 h-4" />
                              ) : n.type === 'warning' ? (
                                <AlertTriangle className="w-4 h-4" />
                              ) : (
                                <Tag className="w-4 h-4" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                                {!n.read && (
                                  <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                {n.description}
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" /> {n.time}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 text-center">
                      <Link
                        to="/admin/pedidos"
                        onClick={() => setShowNotifications(false)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Ver centro de actividades y despachos →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Store & Status Pill */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-700 truncate max-w-[130px]">
                  {currentTenant?.name || 'PeruCat'}
                </span>
              </div>

              {/* Role Badge */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-extrabold shadow-xs ${badge.color}`}>
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">{badge.label}</span>
                <span className="sm:hidden">{badge.shortLabel}</span>
              </div>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1 sm:px-2 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent to-secondary text-navy font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                    {user?.firstName?.charAt(0) || 'A'}
                  </div>
                  <div className="text-left hidden xl:block leading-tight">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[100px]">
                      {user?.firstName || 'Admin'}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold">
                      En línea
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                        {currentRole}
                      </span>
                    </div>

                    <div className="py-1 space-y-1 text-xs">
                      <Link
                        to="/"
                        target="_blank"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                      >
                        <Store className="w-4 h-4 text-blue-600" />
                        <span>Ver Storefront</span>
                      </Link>
                      <Link
                        to="/admin/configuracion"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span>Configuración</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium text-xs transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-7 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

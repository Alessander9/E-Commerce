import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Layers,
  LayoutDashboard,
  Store,
  Users,
  ShieldAlert,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Search,
  Bell,
  ChevronDown,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { AdminSidebar, AdminNavItem } from '../components/layout/AdminSidebar';
import { FontSizeSelector } from '../components/common/FontSizeSelector';

export const PlatformAdminLayout: React.FC = () => {
  const { user, logout, currentRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Collapsed state (persisted)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cleo_platform_sidebar_collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cleo_platform_sidebar_collapsed', String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapse();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('global-platform-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems: AdminNavItem[] = [
    {
      path: '/platform',
      label: 'Dashboard Global',
      description: 'Métricas y visión general del SaaS',
      icon: LayoutDashboard,
    },
    {
      path: '/platform/tenants',
      label: 'Gestión de Tiendas',
      description: 'Tenants, planes y dominios',
      icon: Layers,
    },
    {
      path: '/platform/usuarios',
      label: 'Usuarios Globales',
      description: 'Cuentas, roles y permisos',
      icon: Users,
    },
    {
      path: '/platform/auditoria',
      label: 'Logs de Auditoría',
      description: 'Seguridad y trazabilidad de eventos',
      icon: ShieldAlert,
    },
  ];

  return (
    <TooltipProvider delayDuration={100}>
      <div className="min-h-screen flex bg-[#F8F9FE] text-slate-800 antialiased selection:bg-primary/20 selection:text-primary font-sans">
        
        {/* Componentized Reusable Admin Sidebar for Platform */}
        <AdminSidebar
          brandTitle="Cleo"
          brandSubtitle="Supervisión SaaS Global"
          brandLogo={<Layers className="w-5 h-5" />}
          brandHomePath="/platform"
          roleBadge={{
            label: 'SUPER_ADMIN',
            shortLabel: 'ADMIN',
            darkColor: 'bg-accent/20 text-accent border-accent/40',
          }}
          navItems={navItems}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
          showStorefrontLink={true}
          storefrontPath="/"
        />

        {/* Main Body Content */}
        <div className={`flex-1 flex flex-col min-w-0 min-h-screen transition-[padding] duration-300 ${
          isCollapsed ? 'lg:pl-[76px]' : 'lg:pl-[270px]'
        }`}>
          
          {/* Top Header */}
          <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shadow-xs transition-all">
            
            {/* Left Header */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden p-2 rounded-xl text-navy hover:bg-gray-100 transition-colors border border-gray-200"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </button>

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

              <div className="relative w-full max-w-sm hidden sm:block">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="global-platform-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar tiendas, tenants, audit logs..."
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
            <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    aria-label="Notificaciones"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                      1
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">1 alerta del sistema</p>
                </TooltipContent>
              </Tooltip>

              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span className="text-xs font-bold text-slate-700">
                  Cluster Multi-Tenant
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/10 text-accent-foreground border border-accent/25 text-[11px] font-extrabold shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                <span className="hidden sm:inline">SUPER_ADMIN</span>
                <span className="sm:hidden">ADMIN</span>
              </div>

              {/* Dynamic Font Size Controller */}
              <FontSizeSelector />

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 sm:px-2 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent to-secondary text-navy font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                    ADM
                  </div>
                  <div className="text-left hidden xl:block leading-tight">
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[100px]">
                      {user?.firstName || 'Admin'}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold">
                      Online
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Super Admin'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@cleo.com'}</p>
                      <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-navy border border-accent/30">
                        SUPER_ADMIN
                      </span>
                    </div>

                    <div className="py-1 space-y-1 text-xs">
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-600" />
                        <span>Admin Tienda</span>
                      </Link>
                      <Link
                        to="/"
                        target="_blank"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                      >
                        <Store className="w-4 h-4 text-accent" />
                        <span>Ver Storefront</span>
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

          {/* Page Container */}
          <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

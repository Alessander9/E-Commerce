import React from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Layers,
  LayoutDashboard,
  Store,
  Users,
  ShieldAlert,
  LogOut,
  Sparkles,
  ExternalLink,
  Activity,
  Server,
} from 'lucide-react';

export const PlatformAdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      to: '/platform',
      label: 'Dashboard Global',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/platform/tenants',
      label: 'Gestión de Tiendas',
      icon: Layers,
      end: false,
    },
    {
      to: '/platform/usuarios',
      label: 'Usuarios Globales',
      icon: Users,
      end: false,
    },
    {
      to: '/platform/auditoria',
      label: 'Logs de Auditoría',
      icon: ShieldAlert,
      end: false,
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#F7F8FC]">
      {/* 1. Sidebar */}
      <aside className="w-64 bg-navy text-white flex-shrink-0 flex flex-col justify-between hidden md:flex border-r border-navy-light/40">
        <div className="p-6 space-y-8">
          {/* Logo & Platform Tag */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-grad-primary flex items-center justify-center text-white shadow-glow-primary flex-shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-white tracking-tight">Cleo</span>
                <span className="px-2 py-0.5 rounded-full bg-accent text-navy font-black text-[9px] tracking-wider uppercase">
                  ADMINISTRADOR
                </span>
              </div>
              <p className="text-[10px] text-gray-400">Multi-Tenant Platform</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 block mb-2">
              Supervisión de Plataforma
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-grad-primary text-white shadow-glow-primary'
                      : 'text-gray-300 hover:text-white hover:bg-navy-light/60'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar User & Links */}
        <div className="p-6 border-t border-navy-light/40 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/admin"
              className="py-2 px-2.5 rounded-xl bg-navy-light/80 hover:bg-navy-light text-secondary-light text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5"
              title="Ir al Dashboard de Tienda"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Tienda</span>
            </Link>

            <Link
              to="/"
              target="_blank"
              className="py-2 px-2.5 rounded-xl bg-navy-light/80 hover:bg-navy-light text-accent text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5"
              title="Abrir Storefront"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </Link>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-accent/20 text-accent font-bold flex items-center justify-center text-xs flex-shrink-0">
                ADM
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Administrador'}</p>
                <p className="text-[10px] text-gray-400 truncate">
                  {user?.email || 'admin@cleo.com'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2 rounded-xl text-gray-400 hover:text-danger hover:bg-navy-light transition-colors flex-shrink-0"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Body Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-navy text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-grad-primary flex items-center justify-center text-white">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-sm text-white">Cleo Admin Platform</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="p-2 rounded-lg bg-navy-light text-accent text-xs font-bold"
            >
              <Store className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden bg-navy-light/90 border-b border-navy-light p-2 flex overflow-x-auto gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap ${
                  isActive
                    ? 'bg-grad-primary text-white shadow-sm'
                    : 'text-gray-300 hover:bg-navy-light'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Page Container */}
        <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

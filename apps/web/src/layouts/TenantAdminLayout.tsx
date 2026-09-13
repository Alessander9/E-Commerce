import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTenant } from '../hooks/useTenant';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Truck,
  Store,
  LogOut,
  ChevronDown,
  Layers,
  Sparkles,
  Shield,
  Lock,
  Boxes,
  Settings,
} from 'lucide-react';

export const TenantAdminLayout: React.FC = () => {
  const { user, logout, isTenantAdmin, isTenantManager, currentRole, roleLevel, canAccessCoupons } = useAuth();
  const { currentTenant, tenantSlug, setTenantSlug } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard & Métricas', path: '/admin', icon: LayoutDashboard, minLevel: 2 },
    { label: 'Gestión de Productos', path: '/admin/productos', icon: Package, minLevel: 2 },
    { label: 'Pedidos & Despachos', path: '/admin/pedidos', icon: ShoppingBag, minLevel: 2 },
    { label: 'Inventario', path: '/admin/inventario', icon: Boxes, minLevel: 2 },
    { label: 'Cupones de Descuento', path: '/admin/cupones', icon: Tag, minLevel: 3 }, // Strictly Level 3 (TENANT_ADMIN) & Level 4 (SUPER_ADMIN)
    { label: 'Configuración', path: '/admin/configuracion', icon: Settings, minLevel: 3 },
  ].filter((item) => roleLevel >= item.minLevel);

  const getRoleBadge = () => {
    if (isTenantAdmin) {
      return { text: 'ADMINISTRADOR (L3)', color: 'bg-secondary/20 text-secondary-light border border-secondary/40' };
    }
    if (isTenantManager) {
      return { text: 'GESTOR OPERATIVO (L2)', color: 'bg-amber-500/20 text-amber-300 border border-amber-500/40' };
    }
    return { text: 'CLIENTE (L1)', color: 'bg-gray-500/20 text-gray-300 border border-gray-500/40' };
  };

  const badge = getRoleBadge();

  return (
    <div className="min-h-screen flex bg-[#F7F8FC]">
      {/* 1. Deep Navy Sidebar */}
      <aside className="w-64 bg-navy text-white flex flex-col justify-between border-r border-navy-light/40 flex-shrink-0">
        <div className="p-6 space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-grad-primary flex items-center justify-center text-white font-black text-lg shadow-glow-primary flex-shrink-0">
              🐾
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white truncate max-w-[130px]">
                PeruCat
              </h2>
              <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full mt-0.5 ${badge.color}`}>
                {badge.text}
              </span>
            </div>
          </div>

          {/* Store Context */}
          <div className="p-3 rounded-2xl bg-navy-light/60 border border-navy-light/80 space-y-1.5">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
              Tienda Oficial:
            </span>
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-navy/60 border border-navy-light/50 text-xs font-semibold text-gray-200">
              <span className="truncate">PeruCat E-Commerce</span>
              <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            </div>
          </div>

          {/* Nav items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-grad-primary text-white shadow-glow-primary'
                      : 'text-gray-300 hover:text-white hover:bg-navy-light'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="p-6 border-t border-navy-light/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-accent font-semibold truncate">{currentRole}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2 rounded-xl text-gray-400 hover:text-danger hover:bg-navy-light transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to="/"
              className="w-full py-2 px-3 rounded-xl bg-navy-light/80 hover:bg-navy-light text-gray-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-accent" />
              <span>Ver Storefront</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. Main Admin Workspace */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};


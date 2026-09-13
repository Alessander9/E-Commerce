import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../../services/api';
import { formatMoney, parseSafeNumber } from '../../../utils/format';
import {
  Layers,
  Store,
  Users,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Server,
} from 'lucide-react';

interface DashboardOverview {
  kpis: {
    totalTenants: number;
    activeTenants: number;
    inactiveTenants: number;
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
  };
  tenantsBreakdown: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    active: boolean;
    logoUrl?: string;
    primaryColor?: string;
    createdAt: string;
    _count: {
      products: number;
      orders: number;
      userTenants: number;
    };
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    tenant?: {
      name: string;
      slug: string;
    };
    user?: {
      email: string;
      firstName: string;
      lastName: string;
    };
  }>;
  systemStatus: {
    database: string;
    serverUptimeSeconds: number;
    nodeVersion: string;
    environment: string;
    timestamp: string;
  };
}

export const PlatformDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiRequest<DashboardOverview>('/api/platform/dashboard/overview')
      .then((res) => setData(res))
      .catch((err) => console.error('Error fetching platform dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-96 bg-gray-200 rounded-3xl" />
          <div className="lg:col-span-5 h-96 bg-gray-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalTenants: 0,
    activeTenants: 0,
    inactiveTenants: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  };

  return (
    <div className="space-y-8">
      {/* 1. Header with System Health Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cleo SaaS Core • Multi-Tenant Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy">
            Panel de Control Global (Super Admin)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Monitoreo en tiempo real de infraestructura, tenants, catálogos y transacciones globales.
          </p>
        </div>

        {/* System Health Pill */}
        <div className="flex items-center gap-3 bg-navy text-white px-5 py-3 rounded-2xl shadow-sm self-start md:self-auto">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">API & DB Online</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-mono">
                {data?.systemStatus.nodeVersion || 'v20+'}
              </span>
            </div>
            <span className="text-[11px] text-gray-300">
              Uptime: {Math.floor((data?.systemStatus.serverUptimeSeconds || 0) / 60)} min
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Tenants */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tiendas / Tenants
            </span>
            <div className="w-10 h-10 rounded-2xl bg-primary-light flex items-center justify-center text-primary">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-navy">{kpis.totalTenants}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {kpis.activeTenants} Activas
              </span>
              {kpis.inactiveTenants > 0 && (
                <span className="text-xs text-muted-foreground">
                  • {kpis.inactiveTenants} Pausadas
                </span>
              )}
            </div>
          </div>
        </div>

        {/* KPI 2: Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Volumen Global Transaccionado
            </span>
            <div className="w-10 h-10 rounded-2xl bg-secondary-light flex items-center justify-center text-secondary">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-navy">
              {formatMoney(kpis.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              En {kpis.totalOrders} pedidos registrados
            </p>
          </div>
        </div>

        {/* KPI 3: Total Products */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Catálogo Consolidado
            </span>
            <div className="w-10 h-10 rounded-2xl bg-accent-soft flex items-center justify-center text-accent">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-navy">{kpis.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Productos y variantes activos
            </p>
          </div>
        </div>

        {/* KPI 4: Total Users */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Usuarios Globales
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-primary-purpleLight">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-navy">{kpis.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Admins, Gestores y Clientes
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Tenants Status & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Tenants Breakdown Table */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy">Tiendas Registradas en la Plataforma</h2>
              <p className="text-xs text-muted-foreground">Estado y métricas por tenant</p>
            </div>
            <Link
              to="/platform/tenants"
              className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1"
            >
              Administrar <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-muted-foreground font-bold uppercase tracking-wider">
                  <th className="pb-3">Tienda / Slug</th>
                  <th className="pb-3 text-center">Productos</th>
                  <th className="pb-3 text-center">Pedidos</th>
                  <th className="pb-3 text-center">Estado</th>
                  <th className="pb-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium">
                {data?.tenantsBreakdown.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                          style={{ backgroundColor: tenant.primaryColor || '#6A2CFF' }}
                        >
                          {tenant.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-navy">{tenant.name}</p>
                          <span className="text-[11px] text-gray-400 font-mono">
                            /{tenant.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 text-center font-bold text-navy">
                      {tenant._count?.products || 0}
                    </td>

                    <td className="py-3.5 text-center font-bold text-navy">
                      {tenant._count?.orders || 0}
                    </td>

                    <td className="py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          tenant.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {tenant.active ? 'ACTIVO' : 'PAUSADO'}
                      </span>
                    </td>

                    <td className="py-3.5 text-right">
                      <a
                        href={`/?tenant=${tenant.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl text-primary hover:bg-primary-light transition-colors inline-flex items-center gap-1 font-bold text-[11px]"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Global Activity & Quick Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-grad-primary text-white p-6 rounded-3xl shadow-glow-primary space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">Acciones Rápidas</h3>
                <p className="text-xs text-white/80">Operaciones directas de Super Admin</p>
              </div>
              <Sparkles className="w-6 h-6 text-accent" />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/platform/tenants"
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md text-xs font-bold flex flex-col items-center justify-center gap-2 text-center transition-all"
              >
                <Plus className="w-5 h-5 text-accent" />
                <span>Crear Nuevo Tenant</span>
              </Link>

              <Link
                to="/platform/usuarios"
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md text-xs font-bold flex flex-col items-center justify-center gap-2 text-center transition-all"
              >
                <Users className="w-5 h-5 text-secondary-light" />
                <span>Gestión de Usuarios</span>
              </Link>
            </div>
          </div>

          {/* Recent Orders Stream */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-navy text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span>Últimos Pedidos en la Plataforma</span>
              </h3>
            </div>

            <div className="space-y-3">
              {data?.recentOrders.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No hay pedidos recientes registrados en la plataforma.
                </p>
              ) : (
                data?.recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="p-3 rounded-2xl bg-[#F7F8FC] border border-gray-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy">#{order.orderNumber}</span>
                        <span className="px-2 py-0.5 rounded-md bg-primary-light text-primary font-bold text-[10px]">
                          {order.tenant?.name || 'Tienda'}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Invitado'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-navy block">
                        {formatMoney(order.total)}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          order.paymentStatus === 'PAID'
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

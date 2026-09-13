import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../services/api';
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  Store,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShoppingBag,
  UserCheck,
  UserX,
  Layers,
} from 'lucide-react';

interface PlatformUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  active: boolean;
  createdAt: string;
  userTenants: Array<{
    id: string;
    role: {
      name: string;
      description?: string;
    };
    tenant?: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  _count: {
    orders: number;
  };
}

export const PlatformUsersManagement: React.FC = () => {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [assignForm, setAssignForm] = useState({ tenantId: '', roleId: '' });
  const [assignLoading, setAssignLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    apiRequest<PlatformUser[]>('/api/platform/users')
      .then((res) => setUsers(res))
      .catch((err) => console.error('Error fetching users:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await apiRequest(`/api/platform/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !currentStatus }),
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado del usuario');
    }
  };

  const openAssignModal = async (user: PlatformUser) => {
    setSelectedUser(user);
    setAssignForm({ tenantId: '', roleId: '' });
    setShowAssignModal(true);

    // Fetch tenants and roles
    try {
      const [tenantsRes, rolesRes] = await Promise.all([
        apiRequest<any[]>('/api/platform/tenants'),
        apiRequest<any[]>('/api/platform/tenants/roles/all'),
      ]);
      setTenants(tenantsRes);
      setRoles(rolesRes);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !assignForm.tenantId || !assignForm.roleId) return;
    setAssignLoading(true);
    try {
      await apiRequest('/api/platform/tenants/users/assign', {
        method: 'POST',
        body: JSON.stringify({
          userId: selectedUser.id,
          tenantId: assignForm.tenantId,
          roleId: assignForm.roleId,
        }),
      });
      setShowAssignModal(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Error al asignar rol');
    } finally {
      setAssignLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    if (roleFilter === 'ALL') return matchesSearch;
    const hasRole = u.userTenants.some((ut) => ut.role.name === roleFilter);
    return matchesSearch && hasRole;
  });

  const tenantAdminsCount = users.filter((u) =>
    u.userTenants.some((ut) => ut.role.name === 'TENANT_ADMIN')
  ).length;
  const tenantManagersCount = users.filter((u) =>
    u.userTenants.some((ut) => ut.role.name === 'TENANT_MANAGER')
  ).length;
  const customersCount = users.filter((u) =>
    u.userTenants.every((ut) => ut.role.name === 'CUSTOMER')
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 w-fit">
            <Sparkles className="w-3.5 h-3.5" /> Directorio Global de Identidades
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-navy mt-1">
            Gestión Global de Usuarios & Roles
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Supervisión centralizada de cuentas de usuario, niveles jerárquicos y asignación de tiendas.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-navy text-white px-5 py-3 rounded-2xl">
          <Users className="w-5 h-5 text-primary" />
          <div>
            <span className="text-xs font-bold block">Total Cuentas</span>
            <span className="text-sm font-black text-primary">{users.length} Registradas</span>
          </div>
        </div>
      </div>

      {/* 2. Role Breakdown KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Administradores (Nivel 3)
            </span>
            <span className="text-3xl font-black text-secondary mt-1 block">{tenantAdminsCount}</span>
            <span className="text-[11px] text-secondary font-semibold flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Máximo Nivel Jerárquico
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Gestores Tienda (Nivel 2)
            </span>
            <span className="text-3xl font-black text-amber-500 mt-1 block">{tenantManagersCount}</span>
            <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
              <Store className="w-3.5 h-3.5" /> Operaciones & Catálogo
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Compradores (Nivel 1)
            </span>
            <span className="text-3xl font-black text-navy mt-1 block">{customersCount}</span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <UserCheck className="w-3.5 h-3.5" /> Storefront Shoppers
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo electrónico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs text-navy focus:outline-none focus:border-primary transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Filtrar por Rol:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs text-navy focus:outline-none focus:border-primary font-bold bg-white transition-all shadow-sm"
          >
            <option value="ALL">Todos los roles ({users.length})</option>
            <option value="TENANT_ADMIN">Nivel 3: Administrador</option>
            <option value="TENANT_MANAGER">Nivel 2: Gestor Operativo</option>
            <option value="CUSTOMER">Nivel 1: Cliente</option>
          </select>
        </div>
      </div>

      {/* 4. Users Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FC] border-b border-gray-100 text-muted-foreground font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Usuario & Correo</th>
                  <th className="py-4 px-6">Jerarquía & Rol</th>
                  <th className="py-4 px-6 text-center">Pedidos</th>
                  <th className="py-4 px-6 text-center">Estado</th>
                  <th className="py-4 px-6 text-center">Fecha Alta</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground space-y-2">
                      <Users className="w-10 h-10 mx-auto text-gray-300" />
                      <p className="font-bold text-navy">No se encontraron usuarios</p>
                      <p className="text-xs">Prueba cambiando los términos de búsqueda o el filtro de rol.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary/20 to-secondary/20 text-navy font-black flex items-center justify-center text-xs flex-shrink-0">
                            {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-navy text-sm">
                              {u.firstName} {u.lastName}
                            </p>
                            <span className="text-gray-400 font-mono text-[11px]">{u.email}</span>
                            {u.phone && (
                              <span className="text-gray-400 text-[10px] block">{u.phone}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1.5">
                          {u.userTenants.map((ut) => {
                            const isTenantAdmin = ut.role.name === 'TENANT_ADMIN';
                            const isTenantManager = ut.role.name === 'TENANT_MANAGER';

                            return (
                              <span
                                key={ut.id}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                                  isTenantAdmin
                                    ? 'bg-secondary/15 text-secondary border border-secondary/30'
                                    : isTenantManager
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {isTenantAdmin && <Shield className="w-3 h-3 text-secondary" />}
                                {isTenantManager && <Layers className="w-3 h-3 text-amber-600" />}
                                <span>{ut.role.name}</span>
                                {ut.tenant && (
                                  <span className="font-normal opacity-75">
                                    • {ut.tenant.name}
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center font-bold text-navy">
                        <span className="px-2.5 py-1 rounded-xl bg-gray-100 text-xs">
                          {u._count?.orders || 0}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.active ? 'ACTIVO' : 'SUSPENDIDO'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center text-gray-400 text-[11px] font-mono">
                        {new Date(u.createdAt).toLocaleDateString('es-PE')}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openAssignModal(u)}
                            className="px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all shadow-sm bg-primary/10 text-primary hover:bg-primary/20"
                          >
                            Asignar Rol
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u.id, u.active)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all shadow-sm ${
                              u.active
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                          >
                            {u.active ? 'Suspender' : 'Reactivar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Role Modal */}
      {showAssignModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-navy">Asignar Rol a Usuario</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-sm font-bold text-navy">
                {selectedUser.firstName} {selectedUser.lastName}
              </p>
              <p className="text-xs text-gray-400 font-mono">{selectedUser.email}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Tenant / Tienda</label>
                <select
                  value={assignForm.tenantId}
                  onChange={(e) => setAssignForm({ ...assignForm, tenantId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm text-navy focus:outline-none focus:border-primary font-medium"
                >
                  <option value="">Seleccionar tenant...</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Rol</label>
                <select
                  value={assignForm.roleId}
                  onChange={(e) => setAssignForm({ ...assignForm, roleId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm text-navy focus:outline-none focus:border-primary font-medium"
                >
                  <option value="">Seleccionar rol...</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.description || r.scope}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 rounded-2xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignRole}
                disabled={!assignForm.tenantId || !assignForm.roleId || assignLoading}
                className="px-5 py-2 rounded-2xl text-xs font-black bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assignLoading ? 'Asignando...' : 'Asignar Rol'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../services/api';
import {
  FileText,
  ShieldCheck,
  Search,
  Store,
  Sparkles,
  Clock,
  Terminal,
} from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  entityName?: string;
  entityId?: string;
  tenantId?: string;
  userId?: string;
  details?: any;
  ipAddress?: string;
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
}

export const PlatformAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    apiRequest<AuditLog[]>('/api/platform/audit-logs')
      .then((res) => setLogs(res))
      .catch((err) => console.error('Error fetching audit logs:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter((l) => {
    const actionMatch = l.action.toLowerCase().includes(search.toLowerCase());
    const userMatch = l.user?.email.toLowerCase().includes(search.toLowerCase());
    const tenantMatch = l.tenant?.name.toLowerCase().includes(search.toLowerCase());
    return actionMatch || userMatch || tenantMatch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Seguridad & Trazabilidad
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-navy">
            Logs de Auditoría de la Plataforma
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Registro cronológico de eventos, modificaciones y accesos en todos los tenants.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por acción, tenant o usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs text-navy focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-2xl" />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <ShieldCheck className="w-10 h-10 text-primary mx-auto opacity-40" />
            <p className="text-sm font-bold text-navy">No se registran eventos sospechosos</p>
            <p className="text-xs">
              Todas las operaciones recientes han cumplido las directivas de seguridad.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FC] border-b border-gray-100 text-muted-foreground font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Acción</th>
                  <th className="py-4 px-6">Entidad</th>
                  <th className="py-4 px-6">Tenant</th>
                  <th className="py-4 px-6">Usuario Responsable</th>
                  <th className="py-4 px-6">IP</th>
                  <th className="py-4 px-6 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-6 font-bold text-navy font-mono">
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-gray-600">
                      {log.entityName || 'SISTEMA'} {log.entityId && `#${log.entityId}`}
                    </td>

                    <td className="py-4 px-6">
                      {log.tenant ? (
                        <span className="px-2 py-0.5 rounded-md bg-primary-light text-primary font-bold text-[10px]">
                          {log.tenant.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">Global</span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      {log.user ? (
                        <div>
                          <p className="font-bold text-navy">
                            {log.user.firstName} {log.user.lastName}
                          </p>
                          <span className="text-gray-400 text-[10px]">{log.user.email}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Sistema Automático</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-gray-400 font-mono text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    <td className="py-4 px-6 text-right text-gray-400 text-[11px]">
                      {new Date(log.createdAt).toLocaleString('es-PE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

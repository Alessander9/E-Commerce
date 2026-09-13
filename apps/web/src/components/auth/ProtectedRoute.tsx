import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth, ROLE_HIERARCHY } from '../../hooks/useAuth';
import { ShieldAlert, ArrowLeft, LogOut, CheckCircle2, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
  minRoleLevel?: number;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  minRoleLevel,
  redirectTo = '/login',
}) => {
  const { user, isAuthenticated, isLoadingAuth, currentRole, roleLevel, logout } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-navy">Verificando jerarquía y permisos de sesión...</span>
        </div>
      </div>
    );
  }

  // 1. Not Authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={`${redirectTo}?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // 2. Role Verification
  let isAllowed = true;

  if (allowedRoles && allowedRoles.length > 0) {
    isAllowed = allowedRoles.includes(currentRole);
  }

  if (minRoleLevel !== undefined && isAllowed) {
    isAllowed = roleLevel >= minRoleLevel;
  }

  if (!isAllowed) {
    // Access Denied Screen (403 Forbidden with Hierarchy Visualizer)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC] p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider">
              <Lock className="w-3 h-3" />
              <span>Acceso Restringido por Jerarquía</span>
            </div>
            <h2 className="text-2xl font-black text-navy">403 - Sin Autorización</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tu rol actual{' '}
              <span className="text-rose-600 font-bold font-mono px-2 py-0.5 bg-rose-50 rounded-md border border-rose-100">
                {currentRole} (Nivel {roleLevel})
              </span>{' '}
              no cuenta con los privilegios jerárquicos necesarios para esta ruta.
            </p>
          </div>

          {/* Hierarchy Chart */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-left space-y-2.5 text-gray-600">
            <p className="font-bold text-navy text-xs flex items-center gap-1.5">
              <span>Jerarquía de Roles en el Sistema:</span>
            </p>

            <div className="space-y-1.5">
              <div className={`p-2 rounded-xl flex items-center justify-between text-[11px] ${currentRole === 'TENANT_ADMIN' ? 'bg-primary/10 border border-primary/20 font-bold text-primary' : 'bg-white border border-gray-100'}`}>
                <div>
                  <span className="font-extrabold text-navy">Nivel 3: TENANT_ADMIN (Máximo Rol)</span>
                  <p className="text-[10px] text-gray-500">Administrador con control total (/admin completo, Cupones, /platform, /)</p>
                </div>
                {currentRole === 'TENANT_ADMIN' && <CheckCircle2 className="w-4 h-4 text-primary" />}
              </div>

              <div className={`p-2 rounded-xl flex items-center justify-between text-[11px] ${currentRole === 'TENANT_MANAGER' ? 'bg-amber-50 border border-amber-200 font-bold text-amber-700' : 'bg-white border border-gray-100'}`}>
                <div>
                  <span className="font-extrabold text-navy">Nivel 2: TENANT_MANAGER</span>
                  <p className="text-[10px] text-gray-500">Gestor Operativo (/admin productos y pedidos, /)</p>
                </div>
                {currentRole === 'TENANT_MANAGER' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
              </div>

              <div className={`p-2 rounded-xl flex items-center justify-between text-[11px] ${currentRole === 'CUSTOMER' ? 'bg-emerald-50 border border-emerald-200 font-bold text-emerald-700' : 'bg-white border border-gray-100'}`}>
                <div>
                  <span className="font-extrabold text-navy">Nivel 1: CUSTOMER</span>
                  <p className="text-[10px] text-gray-500">Cliente Comprador (Catálogo, Checkout, Mis Pedidos)</p>
                </div>
                {currentRole === 'CUSTOMER' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <Link
              to={
                currentRole === 'TENANT_ADMIN' || currentRole === 'TENANT_MANAGER'
                  ? '/admin'
                  : '/'
              }
              className="w-full py-3.5 rounded-2xl bg-grad-primary text-white font-extrabold text-xs shadow-glow-primary hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Mi Panel Autorizado</span>
            </Link>

            <Link
              to="/login"
              onClick={() => logout()}
              className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-navy font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión / Cambiar Usuario</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};


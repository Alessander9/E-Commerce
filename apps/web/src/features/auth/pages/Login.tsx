import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useTenant } from '../../../hooks/useTenant';
import { apiRequest } from '../../../services/api';
import {
  ShieldCheck,
  UserCheck,
  User,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Layers,
  Store,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRoleTag, setSelectedRoleTag] = useState<string>('');

  const { login } = useAuth();
  const { tenantSlug, currentTenant } = useTenant();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiRequest<{ accessToken: string; user: any }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
        tenantSlug,
      );

      login(res.accessToken, res.user);

      // Smart role-based automatic redirection
      if (
        res.user.currentRole === 'TENANT_ADMIN' ||
        res.user.currentRole === 'TENANT_MANAGER'
      ) {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas. Verifica tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (roleEmail: string, rolePass: string, tag: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setSelectedRoleTag(tag);
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Brand & Role Selector */}
        <div className="lg:col-span-5 bg-navy text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-grad-primary flex items-center justify-center text-white font-black text-xl shadow-glow-primary">
                🐾
              </div>
              <div>
                <span className="font-extrabold text-base text-white tracking-tight">
                  PeruCat
                </span>
                <span className="text-[10px] text-accent block font-bold tracking-wider uppercase">
                  Arenas Sanitarias
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Iniciar Sesión en PeruCat
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed font-normal">
                Ingresa para gestionar tus pedidos, acumular beneficios o administrar el catálogo y stock de la tienda.
              </p>
            </div>

            {/* Quick Demo Access Buttons */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                ⚡ Acceso Rápido de Prueba:
              </span>

              <div className="space-y-2">
                {/* Level 3: Tenant Admin */}
                <button
                  type="button"
                  onClick={() =>
                    handleQuickSelect('admin@perucat.pe', 'admin123', 'TENANT_ADMIN')
                  }
                  className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    selectedRoleTag === 'TENANT_ADMIN'
                      ? 'bg-secondary/20 border-secondary text-white shadow-glow-secondary'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-secondary-light flex items-center justify-center text-xs">
                      <Store className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Nivel 3: Administrador</p>
                      <p className="text-[10px] text-gray-400">Control total, cupones y configuración</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-secondary-light bg-secondary/10 px-2 py-0.5 rounded-md">
                    /admin
                  </span>
                </button>

                {/* Level 2: Tenant Manager */}
                <button
                  type="button"
                  onClick={() =>
                    handleQuickSelect('manager@perucat.pe', 'admin123', 'TENANT_MANAGER')
                  }
                  className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    selectedRoleTag === 'TENANT_MANAGER'
                      ? 'bg-amber-500/20 border-amber-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Nivel 2: Gestor de Tienda</p>
                      <p className="text-[10px] text-gray-400">Productos, catálogo e inventario</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    /admin
                  </span>
                </button>

                {/* Level 1: Customer */}
                <button
                  type="button"
                  onClick={() =>
                    handleQuickSelect('cliente@perucat.pe', 'client123', 'CUSTOMER')
                  }
                  className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    selectedRoleTag === 'CUSTOMER'
                      ? 'bg-accent/20 border-accent text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Nivel 1: Cliente / Pet Parent</p>
                      <p className="text-[10px] text-gray-400">Catálogo, compras y seguimiento</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    Tienda
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-white/10 text-[11px] text-gray-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>Encriptación SSL & Tokens JWT Seguros</span>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-primary text-[11px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Credenciales de Acceso</span>
              </div>
              <h3 className="text-2xl font-black text-navy">Iniciar Sesión</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Ingresa tus datos para ingresar al panel correspondiente.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2">
                <KeyRound className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-navy block mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="ejemplo@perucat.pe"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-xs text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-bold text-navy">Contraseña</label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-2xl border border-gray-200 text-xs text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600 font-medium text-[11px]">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>Recordar sesión en este equipo</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-grad-primary hover:bg-grad-primary-hover text-white font-extrabold text-sm shadow-glow-primary hover:shadow-glow-secondary transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Verificando credenciales...</span>
                ) : (
                  <>
                    <span>Acceder a la Cuenta</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-gray-100 text-center text-xs text-muted-foreground">
            ¿Aún no tienes una cuenta de cliente?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Regístrate aquí gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

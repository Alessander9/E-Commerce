import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useTenant } from '../../../hooks/useTenant';
import { apiRequest } from '../../../services/api';
import {
  User,
  Mail,
  Lock,
  Phone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  ShoppingBag,
} from 'lucide-react';

export const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { tenantSlug, currentTenant } = useTenant();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiRequest<{ accessToken: string; user: any }>(
        '/api/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({ firstName, lastName, email, password, phone }),
        },
        tenantSlug
      );

      login(res.accessToken, res.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Brand & Benefits */}
        <div className="lg:col-span-5 bg-navy text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

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
                  Registro de Clientes
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Crea tu Cuenta
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed font-normal">
                Regístrate para guardar tus direcciones de entrega, acumular descuentos y rastrear pedidos en tiempo real.
              </p>
            </div>

            {/* Perks */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span>Descuento de bienvenida en tu primera compra</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span>Rastreo en tiempo real de tus envíos y boletas</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span>Guarda tus productos favoritos en la lista de deseos</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-white/10 text-[11px] text-gray-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>Tus datos están 100% protegidos</span>
          </div>
        </div>

        {/* Right Column: 2-Column Registration Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-primary text-[11px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Nueva Cuenta</span>
              </div>
              <h3 className="text-2xl font-black text-navy">Datos de Registro</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Completa el formulario en 2 columnas para crear tu perfil.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              {/* Row 1: First Name & Last Name (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-navy block mb-1.5">Nombres</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Juan Carlos"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-xs text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-navy block mb-1.5">Apellidos</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Pérez Gómez"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-xs text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email & Phone (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-navy block mb-1.5">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="juan@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-xs text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-navy block mb-1.5">Teléfono / WhatsApp</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="+51 987 654 321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-xs text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Password */}
              <div>
                <label className="font-bold text-navy block mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-2xl border border-gray-200 text-xs text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-grad-primary hover:bg-grad-primary-hover text-white font-extrabold text-sm shadow-glow-primary hover:shadow-glow-secondary transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Registrando usuario...</span>
                ) : (
                  <>
                    <span>Crear Mi Cuenta</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-gray-100 text-center text-xs text-muted-foreground">
            ¿Ya tienes una cuenta registrada?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

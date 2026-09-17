import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  CheckCheck,
  ShieldCheck,
} from 'lucide-react';

interface WhatsAppFloatingButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  phoneNumber = '51987654321',
  defaultMessage = 'Hola PeruCat, quisiera recibir asesoría y conocer las ofertas en arenas sanitarias.',
}) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showAutoPopup, setShowAutoPopup] = useState(false);

  // Check if current route is an auth page (Login, Register, Forgot/Reset Password)
  const isAuthRoute =
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register') ||
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/reset-password');

  // Check if current route is a dashboard (Customer, Tenant Admin, Platform Admin)
  const isDashboardRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/platform') ||
    location.pathname.startsWith('/mis-pedidos') ||
    location.pathname.startsWith('/pedidos') ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/favoritos') ||
    location.pathname.startsWith('/perfil');

  // Automatically show a friendly greeting badge after 3 seconds on first visit
  useEffect(() => {
    if (isAuthRoute) return;

    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setShowAutoPopup(true);
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [hasInteracted, isAuthRoute]);

  // Do not render at all on auth pages (neither desktop nor mobile)
  if (isAuthRoute) {
    return null;
  }

  const handleMouseEnter = () => {
    setIsOpen(true);
    setShowAutoPopup(false);
    setHasInteracted(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  const createWhatsAppUrl = (customText?: string) => {
    const text = customText || defaultMessage;
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const quickQuestions = [
    '🐾 ¿Cuál arena es mejor para mi gato?',
    '🚚 ¿Cuánto demora el delivery?',
    '🎁 ¿Tienen packs con descuento?',
  ];

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex-col items-end ${
        isDashboardRoute ? 'hidden lg:flex' : 'flex'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Friendly Auto-Prompt Bubble (Before hover) ── */}
      {showAutoPopup && !isOpen && (
        <div className="mb-3 mr-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-100 p-3.5 max-w-[260px] animate-in fade-in slide-in-from-bottom-2 duration-300 relative group">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAutoPopup(false);
              setHasInteracted(true);
            }}
            className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs shadow-sm transition-colors"
            aria-label="Cerrar aviso"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="flex items-start gap-2.5">
            <span className="text-xl">🐾</span>
            <div className="text-xs">
              <p className="font-extrabold text-navy">¿Deseas ayuda con tu compra?</p>
              <p className="text-gray-500 mt-0.5 leading-snug">
                Chatea con un especialista felino en WhatsApp.
              </p>
            </div>
          </div>
          {/* Bubble tail */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-emerald-100 rotate-45" />
        </div>
      )}

      {/* ── Hover Popover / WhatsApp Chat Card ── */}
      {isOpen && (
        <div
          className="mb-3 w-[320px] sm:w-[350px] bg-white rounded-3xl shadow-2xl border border-gray-100/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-navy select-none"
          role="dialog"
          aria-label="Ventana de chat de WhatsApp"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#075E54] to-[#128C7E] p-4 text-white flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-xl shadow-inner">
                  🐾
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#25D366] border-2 border-[#075E54]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-sm leading-tight">PeruCat Asistencia</h4>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <p className="text-[11px] text-emerald-100 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                  En línea • Respuesta inmediata
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Cerrar chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-[#ECE5DD]/40 space-y-3">
            {/* Incoming Message Bubble */}
            <div className="flex items-start gap-2 max-w-[90%]">
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-xs text-navy leading-relaxed">
                <p className="font-semibold text-primary mb-1">Equipo PeruCat 🐾</p>
                <p>
                  ¡Hola! ¿Buscas la mejor arena para tu michi o quieres consultar disponibilidad y envíos express?
                </p>
                <div className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-gray-400">
                  <span>Ahora</span>
                  <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="pt-1 space-y-1.5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Preguntas frecuentes:
              </p>
              {quickQuestions.map((q, idx) => (
                <a
                  key={idx}
                  href={createWhatsAppUrl(q)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded-xl bg-white/90 hover:bg-white border border-gray-200/80 hover:border-[#25D366] text-xs font-medium text-gray-700 hover:text-[#075E54] transition-all shadow-2xs hover:shadow-sm truncate"
                >
                  {q}
                </a>
              ))}
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-3 bg-white border-t border-gray-100">
            <a
              href={createWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 transition-all transform hover:scale-[1.02] active:scale-100"
            >
              <WhatsAppSvgIcon className="w-4 h-4 fill-white" />
              <span>Abrir Chat en WhatsApp</span>
              <Send className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        </div>
      )}

      {/* ── Main Circular Floating Trigger ── */}
      <a
        href={createWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setHasInteracted(true)}
        className="relative group w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#1EBE5D] via-[#25D366] to-[#40E27B] text-white flex items-center justify-center shadow-2xl shadow-green-500/35 hover:shadow-green-500/50 transition-all transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-400/40"
        aria-label="Contactar por WhatsApp"
      >
        {/* Outer Pulsing Aura */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none" />

        {/* Official WhatsApp SVG Icon */}
        <WhatsAppSvgIcon className="w-7 h-7 sm:w-8 sm:h-8 fill-white transition-transform group-hover:rotate-12 duration-300" />

        {/* Unread Alert Notification Badge */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[10px] font-black text-white items-center justify-center shadow-sm">
            1
          </span>
        </span>
      </a>
    </div>
  );
};

// Official Clean WhatsApp SVG Component
const WhatsAppSvgIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

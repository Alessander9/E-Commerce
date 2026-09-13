import React from 'react';
import { Link } from 'react-router-dom';
import { useTenant } from '../../../hooks/useTenant';
import { RemotionHeroPlayer } from '../../../components/remotion/RemotionHeroPlayer';
import {
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  Star,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export const AnimatedHeroSection: React.FC = () => {
  const { currentTenant } = useTenant();

  return (
    <section className="relative overflow-hidden bg-navy pt-8 sm:pt-12 pb-16 lg:pb-24 text-white">
      {/* Dynamic Background Gradient Mesh */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/25 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-10 w-[450px] h-[450px] bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[350px] h-[350px] bg-accent/20 rounded-full blur-[90px] pointer-events-none" />

      {/* Subtle Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Live Highlight Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-accent tracking-wide uppercase shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>PeruCat • Una nueva forma de cuidar su mundo</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
              PERUCAT <br />
              <span className="bg-gradient-to-r from-accent via-secondary to-primary-purpleLight bg-clip-text text-transparent">
                Una nueva forma de cuidar su mundo.
              </span>
            </h1>

            {/* Description */}
            <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              La arena sanitaria que combina <strong>absorción, aglomeración y control de olores</strong> para hacer más fácil la vida junto a tu gato.
            </p>

            {/* Highlight Slogan */}
            <div className="inline-block px-4 py-1.5 rounded-xl bg-primary/30 border border-primary/40 text-accent font-extrabold text-sm">
              ✨ Limpieza para ellos. Tranquilidad para ti.
            </div>

            {/* Actions & Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/productos"
                className="px-8 py-4 rounded-2xl bg-grad-primary hover:bg-grad-primary-hover text-white font-extrabold text-sm sm:text-base flex items-center gap-3 shadow-glow-primary hover:shadow-glow-secondary transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Conoce Nuestras Arenas</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#descubre-perucat"
                className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm sm:text-base flex items-center gap-2 backdrop-blur-md transition-all"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Descubre PeruCat</span>
              </a>
            </div>

            {/* Fast Value Props */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 max-w-xl mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">Terrón Rápido</p>
                  <p className="text-[10px] text-gray-400">Aglomeración 3 seg</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/30 flex items-center justify-center text-primary-purpleLight flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">99.5% Sin Polvo</p>
                  <p className="text-[10px] text-gray-400">Cuida sus patitas</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-secondary/30 flex items-center justify-center text-secondary flex-shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">Envíos Perú</p>
                  <p className="text-[10px] text-gray-400">Lima & Provincias</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Remotion Animated Video Showcase */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <RemotionHeroPlayer />
          </div>
        </div>
      </div>
    </section>
  );
};

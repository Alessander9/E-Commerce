import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Flame,
  CheckCircle2,
  Star,
  Zap,
  ShoppingBag,
  MessageCircle,
} from 'lucide-react';
import { RemotionHeroPlayer } from '../../../components/remotion/RemotionHeroPlayer';

interface HeroSlideData {
  id: string;
  badgeTag: string;
  badgeIcon: React.ElementType;
  badgeTagClass: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix?: string;
  highlightSlogan: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  secondaryIsExternal?: boolean;
  imageSrc: string;
  imageAlt: string;
  productBadge: string;
  productBadgeSub: string;
  floatingPill1: { title: string; subtitle: string; icon: React.ElementType };
  floatingPill2: { title: string; subtitle: string; icon: React.ElementType };
  bgGradient: string;
  ambientColors: {
    blob1: string;
    blob2: string;
    blob3: string;
  };
  hasRemotionPreview?: boolean;
}

const SLIDES: HeroSlideData[] = [
  {
    id: 'slide-clasica',
    badgeTag: 'Bestseller #1 en Perú • 100% Bentonita Natural',
    badgeIcon: Sparkles,
    badgeTagClass: 'bg-primary/20 text-accent border-primary/40',
    titlePrefix: 'PERUCAT',
    titleHighlight: 'Una nueva forma de cuidar su mundo.',
    titleSuffix: '',
    highlightSlogan: '✨ Limpieza para ellos. Tranquilidad para ti.',
    description:
      'La arena sanitaria de bentonita ultra aglomerante que combina absorción instantánea, terrones firmes en 3 segundos y 99.5% libre de polvo para proteger sus patitas.',
    primaryCtaText: 'Comprar PeruCat Clásica',
    primaryCtaLink: '/productos?search=clasica',
    secondaryCtaText: 'Descubre PeruCat',
    secondaryCtaLink: '#descubre-perucat',
    imageSrc: '/IMG/perucat-clasica-hd.jpg',
    imageAlt: 'PeruCat Arena Clásica Premium',
    productBadge: 'Bestseller Favorito',
    productBadgeSub: 'Fórmula Original 100% Natural',
    floatingPill1: {
      title: 'Terrón Instantáneo',
      subtitle: 'Aglomeración en 3 seg',
      icon: ShieldCheck,
    },
    floatingPill2: {
      title: '99.5% Sin Polvo',
      subtitle: 'Patitas y vías sanas',
      icon: Sparkles,
    },
    bgGradient: 'from-navy via-[#0c142e] to-navy-dark',
    ambientColors: {
      blob1: 'bg-primary/30',
      blob2: 'bg-secondary/25',
      blob3: 'bg-accent/25',
    },
    hasRemotionPreview: true,
  },
  {
    id: 'slide-carbon',
    badgeTag: 'Fórmula Avanzada con Carbón Activado',
    badgeIcon: Zap,
    badgeTagClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    titlePrefix: 'PERUCAT CARBÓN ACTIVO',
    titleHighlight: 'Máxima Neutralización de Olores 24/7.',
    titleSuffix: '',
    highlightSlogan: '🛡️ Tecnología de Micro-Poros Anti-Amoníaco.',
    description:
      'Diseñada para departamentos y hogares con múltiples michis. Los microgránulos de carbón activado encapsulan los olores al instante, garantizando un aire siempre puro.',
    primaryCtaText: 'Explorar Carbón Activo',
    primaryCtaLink: '/productos?search=carbon',
    secondaryCtaText: 'Ver Comparativa',
    secondaryCtaLink: '#comparativa',
    imageSrc: '/IMG/perucat-carbon-hd.jpg',
    imageAlt: 'PeruCat Arena Carbón Activo',
    productBadge: 'Poder Extra Anti-Olor',
    productBadgeSub: 'Carbón Microporoso Premium',
    floatingPill1: {
      title: 'Cero Olores 24/7',
      subtitle: 'Neutraliza el amoníaco',
      icon: ShieldCheck,
    },
    floatingPill2: {
      title: 'Ideal Multi-Gatos',
      subtitle: 'Máximo rendimiento',
      icon: Star,
    },
    bgGradient: 'from-[#071318] via-[#0a1e27] to-navy-dark',
    ambientColors: {
      blob1: 'bg-emerald-500/25',
      blob2: 'bg-accent/30',
      blob3: 'bg-secondary/20',
    },
  },
  {
    id: 'slide-lavanda',
    badgeTag: 'Edición Relajante • Fragancia Suave',
    badgeIcon: Star,
    badgeTagClass: 'bg-purple-500/20 text-purple-200 border-purple-400/40',
    titlePrefix: 'PERUCAT LAVANDA',
    titleHighlight: 'Frescura Aromática y Calma Natural.',
    titleSuffix: '',
    highlightSlogan: '🌸 Delicado Aroma Relajante con Cada Uso.',
    description:
      'Enriquecida con sutiles esencias botánicas de lavanda que se activan con el movimiento, manteniendo el ambiente fresco sin irritar el sensible olfato de tu gato.',
    primaryCtaText: 'Probar PeruCat Lavanda',
    primaryCtaLink: '/productos?search=lavanda',
    secondaryCtaText: 'Ver Todo el Catálogo',
    secondaryCtaLink: '/productos',
    imageSrc: '/IMG/perucat-lavanda.jpg',
    imageAlt: 'PeruCat Arena Aroma Lavanda',
    productBadge: 'Fragancia Delicada',
    productBadgeSub: 'Frescura Continua para el Hogar',
    floatingPill1: {
      title: 'Aroma Relajante',
      subtitle: 'Activación con humedad',
      icon: Sparkles,
    },
    floatingPill2: {
      title: 'Hipoalergénica',
      subtitle: 'Aroma 100% amigable',
      icon: ShieldCheck,
    },
    bgGradient: 'from-[#170c2e] via-[#1e103c] to-navy-dark',
    ambientColors: {
      blob1: 'bg-primary/35',
      blob2: 'bg-purple-400/25',
      blob3: 'bg-pink-500/20',
    },
  },
  {
    id: 'slide-packs',
    badgeTag: 'Packs Familiares con Descuento • Envíos Perú',
    badgeIcon: Truck,
    badgeTagClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    titlePrefix: 'PACKS & AHORRO',
    titleHighlight: 'Lleva Más, Ahorra Más en Cada Pedido.',
    titleSuffix: '',
    highlightSlogan: '🚚 Despacho Express en Lima y a Todo el Perú.',
    description:
      'Aprovecha nuestros combos promocionales de 2, 4 y 6 bolsas con precios por bulto reducidos. Despacho rápido y seguro en empaques reforzados directo a tu puerta.',
    primaryCtaText: 'Ver Packs en Descuento',
    primaryCtaLink: '/productos',
    secondaryCtaText: 'Consultar por WhatsApp',
    secondaryCtaLink: 'https://wa.me/51999999999?text=Hola%20PeruCat%2C%20deseo%20informaci%C3%B3n%20sobre%20los%20packs%20en%20promoci%C3%B3n',
    secondaryIsExternal: true,
    imageSrc: '/IMG/perucat-aglomeracion.jpg',
    imageAlt: 'Packs y Promociones PeruCat',
    productBadge: 'Promoción Familiar',
    productBadgeSub: 'Ahorro hasta 25% por Bolsa',
    floatingPill1: {
      title: 'Envíos Rápidos',
      subtitle: 'Lima & Provincias',
      icon: Truck,
    },
    floatingPill2: {
      title: 'Pago Contraentrega',
      subtitle: 'Yape, Plin o Tarjeta',
      icon: Zap,
    },
    bgGradient: 'from-[#0b1b36] via-[#102347] to-navy-dark',
    ambientColors: {
      blob1: 'bg-amber-500/20',
      blob2: 'bg-primary/25',
      blob3: 'bg-secondary/30',
    },
  },
];

const AUTOPLAY_INTERVAL = 6500;

export const AnimatedHeroSection: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const activeSlide = SLIDES[currentSlideIndex];

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
    setProgress(0);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    setProgress(0);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
    setProgress(0);
  };

  // Timer & progress bar tick
  useEffect(() => {
    if (isPaused) return;

    const tickInterval = 50; // update progress every 50ms
    const step = (tickInterval / AUTOPLAY_INTERVAL) * 100;

    const intervalId = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + step;
      });
    }, tickInterval);

    return () => clearInterval(intervalId);
  }, [isPaused, nextSlide]);

  // Keyboard navigation (left / right arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch swipe handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <section
      className="relative w-full min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-hidden text-white select-none transition-colors duration-1000"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Carrusel Principal PeruCat"
    >
      {/* ── Dynamic Gradient Backgrounds for each slide ── */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${activeSlide.bgGradient} transition-all duration-1000 ease-out`}
      />

      {/* Atmospheric Ambient Glow Blobs */}
      <div
        className={`absolute top-10 right-1/4 w-[500px] h-[500px] ${activeSlide.ambientColors.blob1} rounded-full blur-[140px] pointer-events-none transition-all duration-1000 animate-pulse`}
      />
      <div
        className={`absolute bottom-10 left-10 w-[450px] h-[450px] ${activeSlide.ambientColors.blob2} rounded-full blur-[120px] pointer-events-none transition-all duration-1000`}
      />
      <div
        className={`absolute top-1/2 right-10 w-[380px] h-[380px] ${activeSlide.ambientColors.blob3} rounded-full blur-[110px] pointer-events-none transition-all duration-1000`}
      />

      {/* Subtle Grid / Geometric Overlay Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Top Autoplay Progress Bar (100% Width) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent via-secondary to-primary transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Main Content Container (Full Width / Viewport Center) ── */}
      <div className="relative z-10 flex-1 flex items-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center w-full">
          {/* Left Column: Headlines, Slogans & Action CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left transition-all duration-500">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border text-xs font-bold tracking-wide uppercase shadow-lg transition-all transform hover:scale-105">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <activeSlide.badgeIcon className="w-4 h-4 text-accent" />
              <span className="text-white font-extrabold">{activeSlide.badgeTag}</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
                <span className="text-white block">{activeSlide.titlePrefix}</span>
                <span className="bg-gradient-to-r from-accent via-secondary to-primary-purpleLight bg-clip-text text-transparent block mt-1">
                  {activeSlide.titleHighlight}
                </span>
              </h1>
            </div>

            {/* Highlight Slogan Badge */}
            <div className="inline-block px-4 py-1.5 rounded-xl bg-white/10 border border-white/20 text-accent font-extrabold text-sm backdrop-blur-sm shadow-sm">
              {activeSlide.highlightSlogan}
            </div>

            {/* Description Text */}
            <p className="text-gray-200 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {activeSlide.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to={activeSlide.primaryCtaLink}
                className="px-8 py-4 rounded-2xl bg-grad-primary hover:bg-grad-primary-hover text-white font-extrabold text-sm sm:text-base flex items-center gap-3 shadow-glow-primary hover:shadow-glow-secondary transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{activeSlide.primaryCtaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {activeSlide.secondaryIsExternal ? (
                <a
                  href={activeSlide.secondaryCtaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base flex items-center gap-2 backdrop-blur-md transition-all shadow-md"
                >
                  <MessageCircle className="w-5 h-5 text-green-400" />
                  <span>{activeSlide.secondaryCtaText}</span>
                </a>
              ) : (
                <a
                  href={activeSlide.secondaryCtaLink}
                  className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base flex items-center gap-2 backdrop-blur-md transition-all shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>{activeSlide.secondaryCtaText}</span>
                </a>
              )}
            </div>

            {/* Micro Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 pt-4 border-t border-white/15 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                  <activeSlide.floatingPill1.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white leading-tight">
                    {activeSlide.floatingPill1.title}
                  </p>
                  <p className="text-[11px] text-gray-300">
                    {activeSlide.floatingPill1.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-primary/30 flex items-center justify-center text-primary-purpleLight flex-shrink-0">
                  <activeSlide.floatingPill2.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white leading-tight">
                    {activeSlide.floatingPill2.title}
                  </p>
                  <p className="text-[11px] text-gray-300">
                    {activeSlide.floatingPill2.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Definition Product Showcase & Visual Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[480px]">
              {/* Outer Ambient Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-secondary/30 to-accent/40 rounded-3xl blur-2xl opacity-70 animate-pulse pointer-events-none" />

              {/* Main Card */}
              <div className="relative rounded-3xl overflow-hidden bg-navy/60 border border-white/20 backdrop-blur-xl shadow-2xl p-4 sm:p-6 text-center group">
                {/* Upper Badge Tag on Card */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-black text-accent uppercase tracking-wider">
                    <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                    <span>{activeSlide.productBadge}</span>
                  </div>
                  <span className="text-[11px] text-gray-300 font-medium">
                    {activeSlide.productBadgeSub}
                  </span>
                </div>

                {/* Product Image Display with smooth zoom and hover */}
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-white/10 to-transparent border border-white/10 flex items-center justify-center p-2">
                  <img
                    src={activeSlide.imageSrc}
                    alt={activeSlide.imageAlt}
                    className="w-full h-full object-cover rounded-xl shadow-lg transform transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = '/IMG/perucat-clasica-hd.jpg';
                    }}
                  />

                  {/* Glassmorphic Floating Stamp */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-navy/80 backdrop-blur-md border border-white/20 text-left flex items-center justify-between shadow-xl">
                    <div>
                      <p className="text-xs font-black text-white">PeruCat Garantizada</p>
                      <p className="text-[10px] text-gray-300">Calidad Premium comprobada</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Micro Bottom CTA */}
                <div className="mt-4 flex items-center justify-between text-xs text-gray-300 px-1">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Stock Disponible
                  </span>
                  <Link
                    to={activeSlide.primaryCtaLink}
                    className="text-accent hover:text-white font-extrabold flex items-center gap-1 transition-colors"
                  >
                    Ver detalles <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Carousel Controls & Navigation (Left/Right Arrows) ── */}
      <button
        onClick={prevSlide}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-2xl focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Diapositiva Anterior"
      >
        <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-2xl focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Siguiente Diapositiva"
      >
        <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>

      {/* ── Bottom Carousel Slide Indicators / Tabs (Full-Width Responsive Bar) ── */}
      <div className="relative z-20 w-full bg-navy-dark/70 backdrop-blur-lg border-t border-white/10 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Slide Indicator Pills */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center sm:justify-start">
            {SLIDES.map((slide, idx) => {
              const isActive = idx === currentSlideIndex;
              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(idx)}
                  className={`group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-grad-primary text-white shadow-glow-primary scale-105 border border-white/30'
                      : 'bg-white/5 hover:bg-white/15 text-gray-300 border border-white/10'
                  }`}
                  aria-label={`Ir a diapositiva ${idx + 1}: ${slide.titlePrefix}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full transition-all ${
                      isActive ? 'bg-accent scale-125' : 'bg-gray-400 group-hover:bg-white'
                    }`}
                  />
                  <span className="hidden md:inline">{`0${idx + 1}. `}</span>
                  <span className="truncate max-w-[120px] sm:max-w-none">
                    {slide.titlePrefix}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Pillars Right Side */}
          <div className="hidden lg:flex items-center gap-6 text-xs text-gray-300 font-semibold">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>Aglomeración 3s</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-purpleLight" />
              <span>99.5% Sin Polvo</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-secondary" />
              <span>Envíos Perú</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

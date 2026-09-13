import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTenant } from '../../../hooks/useTenant';
import { useCart } from '../../../hooks/useCart';
import { useWishlist } from '../../../hooks/useWishlist';
import { Product, Category } from '../../../types';
import { apiRequest } from '../../../services/api';
import { formatMoney, parseSafeNumber } from '../../../utils/format';
import { AnimatedHeroSection } from '../components/AnimatedHeroSection';
import { OffersMarqueeBanner } from '../components/OffersMarqueeBanner';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  ShoppingBag,
  Heart,
  Flame,
  CheckCircle2,
  Layers,
  Wind,
  Smile,
  HelpCircle,
  Clock,
  Home as HomeIcon,
  Cat,
  Check,
  Star,
  Sparkle,
  BadgePercent,
  CheckCheck,
  RefreshCw,
  MapPin,
  Trash2,
} from 'lucide-react';

const MOCK_PERUCAT_PRODUCTS: Product[] = [
  {
    id: 'pc-1',
    name: 'PeruCat Clásica Aglomerante Ultra Absorción',
    slug: 'perucat-clasica-aglomerante',
    baseSku: 'PC-CLAS',
    brand: 'PeruCat',
    description: 'Bentonita 100% natural con aglomeración instantánea y terrones ultra compactos. 99.5% libre de polvo.',
    shortDescription: 'Alta absorción, aglomeración rápida y fácil limpieza diaria del arenero.',
    featured: true,
    hasVariants: true,
    images: [{ id: 'img-1', url: '/IMG/perucat-clasica-hd.jpg', altText: 'PeruCat Clásica', isPrimary: true }],
    productCategories: [
      { category: { id: 'cat-1', name: 'Arenas Aglomerantes', slug: 'arenas-aglomerantes', displayOrder: 1 } },
    ],
    variants: [
      {
        id: 'var-1',
        name: 'Bolsa 10 Kg',
        sku: 'PC-CLAS-10KG',
        prices: [{ id: 'p-1', price: 52.00, compareAtPrice: 62.00, currency: 'PEN' }],
        inventory: { availableStock: 65, reservedStock: 0 },
      },
    ],
  },
  {
    id: 'pc-2',
    name: 'PeruCat Carbón Activo Max Control de Olores',
    slug: 'perucat-carbon-activo-max-control',
    baseSku: 'PC-CARB',
    brand: 'PeruCat',
    description: 'Fórmula enriquecida con partículas de carbón activado que neutralizan olores las 24 horas.',
    shortDescription: 'Neutralización superior de olores 24/7 ideal para hogares con múltiples gatos.',
    featured: true,
    hasVariants: true,
    images: [{ id: 'img-2', url: '/IMG/perucat-carbon-hd.jpg', altText: 'PeruCat Carbón Activo', isPrimary: true }],
    productCategories: [
      { category: { id: 'cat-2', name: 'Control de Olores', slug: 'control-olores', displayOrder: 2 } },
    ],
    variants: [
      {
        id: 'var-2',
        name: 'Bolsa 10 Kg',
        sku: 'PC-CARB-10KG',
        prices: [{ id: 'p-2', price: 62.00, compareAtPrice: 72.00, currency: 'PEN' }],
        inventory: { availableStock: 50, reservedStock: 0 },
      },
    ],
  },
  {
    id: 'pc-3',
    name: 'PeruCat Aroma Lavanda Silvestre Anti-Estrés',
    slug: 'perucat-aroma-lavanda-silvestre',
    baseSku: 'PC-LAV',
    brand: 'PeruCat',
    description: 'Suave fragancia a lavanda que se activa con el uso sin perturbar el sensible olfato del felino.',
    shortDescription: 'Aroma fresco y relajante de lavanda con aglomeración perfecta.',
    featured: true,
    hasVariants: true,
    images: [{ id: 'img-3', url: '/IMG/perucat-lavanda.jpg', altText: 'PeruCat Lavanda', isPrimary: true }],
    productCategories: [
      { category: { id: 'cat-3', name: 'Aromas & Fragancias', slug: 'aromas-y-fragancias', displayOrder: 3 } },
    ],
    variants: [
      {
        id: 'var-3',
        name: 'Bolsa 10 Kg',
        sku: 'PC-LAV-10KG',
        prices: [{ id: 'p-3', price: 58.00, compareAtPrice: 68.00, currency: 'PEN' }],
        inventory: { availableStock: 45, reservedStock: 0 },
      },
    ],
  },
  {
    id: 'pc-4',
    name: 'Pala Sanitaria Ergonómica de Precisión PeruCat',
    slug: 'pala-sanitaria-ergonomica-perucat',
    baseSku: 'PC-PALA',
    brand: 'PeruCat',
    description: 'Pala con ranuras calibradas para colar la arena limpia y retirar exclusivamente los terrones.',
    shortDescription: 'Ahorro de hasta 30% de arena por mes gracias a su diseño de precisión.',
    featured: true,
    hasVariants: true,
    images: [{ id: 'img-4', url: '/IMG/perucat-aglomeracion.jpg', altText: 'Pala PeruCat', isPrimary: true }],
    productCategories: [
      { category: { id: 'cat-4', name: 'Accesorios & Areneros', slug: 'accesorios-areneros', displayOrder: 4 } },
    ],
    variants: [
      {
        id: 'var-4',
        name: 'Estándar',
        sku: 'PC-PALA-STD',
        prices: [{ id: 'p-4', price: 16.00, compareAtPrice: 22.00, currency: 'PEN' }],
        inventory: { availableStock: 90, reservedStock: 0 },
      },
    ],
  },
];

const MOCK_PERUCAT_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Arenas Aglomerantes',
    slug: 'arenas-aglomerantes',
    description: 'Bentonita natural que forma terrones compactos al instante.',
    displayOrder: 1,
  },
  {
    id: 'cat-2',
    name: 'Control de Olores',
    slug: 'control-olores',
    description: 'Carbón activo y minerales neutralizadores de máxima potencia.',
    displayOrder: 2,
  },
  {
    id: 'cat-3',
    name: 'Aromas & Fragancias',
    slug: 'aromas-y-fragancias',
    description: 'Lavanda y esencias suaves y relajantes para el hogar.',
    displayOrder: 3,
  },
  {
    id: 'cat-4',
    name: 'Accesorios & Areneros',
    slug: 'accesorios-areneros',
    description: 'Palas ergonómicas, tapetes atrapa-arena y areneros.',
    displayOrder: 4,
  },
];

export const Home: React.FC = () => {
  const { tenantSlug } = useTenant();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(MOCK_PERUCAT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(MOCK_PERUCAT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiRequest<Product[]>('/api/store/products?featured=true', {}, tenantSlug),
      apiRequest<Category[]>('/api/store/categories', {}, tenantSlug),
    ])
      .then(([prods, cats]) => {
        if (prods && prods.length > 0) setFeaturedProducts(prods);
        if (cats && cats.length > 0) setCategories(cats);
      })
      .catch((err) => {
        console.warn('Usando catálogo local de PeruCat:', err);
      })
      .finally(() => setLoading(false));
  }, [tenantSlug]);

  return (
    <div className="space-y-20 pb-24">
      {/* 1. Remotion Animated Hero Section: PERUCAT - Una nueva forma de cuidar su mundo */}
      <AnimatedHeroSection />

      {/* 1.5 Infinite Horizontal Animated Offers Marquee */}
      <OffersMarqueeBanner />

      {/* 2. TODO EMPIEZA CON UN ARENERO LIMPIO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm p-8 sm:p-12 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-black text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Bienestar & Confort Felino
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy leading-tight">
                TODO EMPIEZA CON UN ARENERO LIMPIO
              </h2>
              <p className="text-base sm:text-lg text-primary font-bold">
                Tu gato merece un espacio cómodo, limpio y agradable todos los días.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                PeruCat está pensada para ayudarte a mantener el arenero en mejores condiciones, facilitando la limpieza y ayudando a controlar los olores de manera práctica.
              </p>
              <div className="pt-2 flex items-center gap-4">
                <Link
                  to="/productos"
                  className="px-6 py-3 rounded-2xl bg-grad-primary text-white font-bold text-xs sm:text-sm hover:opacity-95 transition-opacity shadow-glow-primary flex items-center gap-2"
                >
                  <span>Explorar Variedades</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-lg bg-gray-50 aspect-video lg:aspect-square flex items-center justify-center relative group">
                <img
                  src="/IMG/perucat-aglomeracion.jpg"
                  alt="Arenero Limpio PeruCat"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent flex items-end p-6">
                  <p className="text-white font-black text-sm sm:text-base">
                    ✨ Limpieza para ellos. Tranquilidad para ti.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HECHA PARA FACILITAR TU DÍA (4 Core Pillars) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black text-primary tracking-widest uppercase">
            Ventajas Comprobadas
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy">
            HECHA PARA FACILITAR TU DÍA
          </h2>
          <p className="text-sm text-muted-foreground">
            Diseñada meticulosamente para simplificar cada momento de la rutina de higiene de tu hogar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Alta absorción */}
          <div className="p-7 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-card-hover hover:border-primary/40 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black mb-6 group-hover:scale-110 transition-transform shadow-sm">
              <Layers className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-navy text-lg">Alta absorción</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Ayuda a absorber rápidamente la humedad para mantener el arenero más limpio y seco.
              </p>
            </div>
          </div>

          {/* 2. Aglomeración práctica */}
          <div className="p-7 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-card-hover hover:border-secondary/40 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-black mb-6 group-hover:scale-110 transition-transform shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-navy text-lg">Aglomeración práctica</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Forma grumos que facilitan la separación de los residuos y permiten una limpieza más sencilla.
              </p>
            </div>
          </div>

          {/* 3. Control de olores */}
          <div className="p-7 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-card-hover hover:border-accent/40 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent-dark flex items-center justify-center font-black mb-6 group-hover:scale-110 transition-transform shadow-sm">
              <Wind className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-navy text-lg">Control de olores</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Ayuda a encapsular los malos olores para mantener un ambiente más agradable.
              </p>
            </div>
          </div>

          {/* 4. Más practicidad */}
          <div className="p-7 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-card-hover hover:border-emerald-300 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black mb-6 group-hover:scale-110 transition-transform shadow-sm">
              <Clock className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-navy text-lg">Más practicidad</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Limpia, retira y repone de manera sencilla para dedicar menos tiempo al mantenimiento del arenero.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MENOS OLOR. MÁS TRANQUILIDAD. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-navy text-white p-8 sm:p-12 lg:p-14 shadow-xl border border-navy-light/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent font-bold text-xs uppercase tracking-wider">
              <Wind className="w-3.5 h-3.5" /> Frescura Continua
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              MENOS OLOR. MÁS TRANQUILIDAD.
            </h2>
            <p className="text-base sm:text-lg text-gray-200 leading-relaxed font-normal">
              La rutina con tu gato debería ser sencilla.
            </p>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              PeruCat ayuda a controlar los olores asociados a la humedad y los residuos, para que puedas disfrutar de un hogar más fresco y agradable.
            </p>
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md inline-block">
              <p className="text-sm sm:text-base font-black text-accent tracking-wide">
                Porque compartir tu hogar con un gato también significa disfrutarlo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. UNA ARENA PENSADA PARA TU GATO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center font-black mx-auto shadow-sm">
            <Cat className="w-8 h-8" />
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy">
              UNA ARENA PENSADA PARA TU GATO
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Cada gato tiene su propia personalidad, pero todos necesitan un espacio limpio para sentirse cómodos.
            </p>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              PeruCat te ayuda a mantener su arenero limpio y preparado para todos los días.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-4 text-sm font-black text-primary">
            <span className="px-4 py-2 rounded-2xl bg-purple-50 border border-purple-100 flex items-center gap-2">
              <Check className="w-4 h-4 text-accent" /> Más limpieza
            </span>
            <span className="px-4 py-2 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-2 text-secondary">
              <Check className="w-4 h-4 text-accent" /> Más comodidad
            </span>
            <span className="px-4 py-2 rounded-2xl bg-teal-50 border border-teal-100 flex items-center gap-2 text-accent-dark">
              <Check className="w-4 h-4 text-accent" /> Más bienestar
            </span>
          </div>
        </div>
      </section>

      {/* 6. CONOCE NUESTRAS ARENAS (Catálogo & Presentaciones) */}
      <section id="descubre-perucat" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-black text-primary tracking-widest uppercase">
              Catálogo Oficial
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy">
              CONOCE NUESTRAS ARENAS
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Descubre nuestras diferentes presentaciones y elige la opción que mejor se adapte a tu gato y a tu hogar. Desde opciones para el día a día hasta alternativas pensadas para quienes buscan mayor practicidad y rendimiento.
            </p>
            <p className="text-xs sm:text-sm font-black text-primary">
              ✨ Encuentra tu PeruCat ideal.
            </p>
          </div>
          <Link
            to="/productos"
            className="self-start md:self-end px-5 py-2.5 rounded-2xl bg-navy text-accent hover:bg-navy-light text-xs font-black transition-all flex items-center gap-2 border border-navy-light"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/productos?category=${cat.slug}`}
              className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-primary/40 hover:shadow-card-hover transition-all text-center space-y-1 group"
            >
              <h4 className="font-extrabold text-navy text-xs sm:text-sm group-hover:text-primary transition-colors">
                {cat.name}
              </h4>
              <p className="text-[11px] text-muted-foreground line-clamp-1">{cat.description}</p>
            </Link>
          ))}
        </div>

        {/* Featured Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => {
            const defaultVariant = product.variants[0];
            const priceObj = defaultVariant?.prices[0];
            const price = priceObj ? parseSafeNumber(priceObj.price) : 0;
            const compareAtPrice = priceObj?.compareAtPrice ? parseSafeNumber(priceObj.compareAtPrice) : null;

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-gray-100 hover:border-primary/30 p-4 shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between group"
              >
                <div className="relative mb-4">
                  <Link to={`/products/${product.slug}`}>
                    <img
                      src={product.images[0]?.url || '/IMG/perucat-clasica.jpg'}
                      alt={product.name}
                      className="w-full h-52 object-cover rounded-2xl bg-gray-50 group-hover:scale-102 transition-transform"
                    />
                  </Link>
                  {/* Wishlist toggle */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (defaultVariant) {
                        isInWishlist(defaultVariant.id)
                          ? removeFromWishlist(defaultVariant.id)
                          : addToWishlist(product, defaultVariant);
                      }
                    }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-all"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        isInWishlist(defaultVariant?.id || '')
                          ? 'fill-rose-500 text-rose-500'
                          : 'text-gray-400 hover:text-rose-400'
                      }`}
                    />
                  </button>

                  {compareAtPrice && compareAtPrice > price && (
                    <span className="absolute top-3 left-3 bg-grad-secondary text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
                      OFERTA
                    </span>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {product.brand || 'PeruCat'}
                  </span>
                  <Link to={`/products/${product.slug}`} className="block">
                    <h3 className="font-bold text-sm text-navy hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-muted-foreground line-clamp-2">{product.shortDescription}</p>
                </div>

                <div className="pt-4 mt-2 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-black text-navy">{formatMoney(price)}</span>
                      {compareAtPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatMoney(compareAtPrice)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-primary font-semibold">
                      {defaultVariant?.name || 'Bolsa 10 Kg'}
                    </span>
                  </div>

                  <button
                    onClick={() => defaultVariant && addToCart(product, defaultVariant, 1)}
                    className="p-3 rounded-2xl bg-primary text-white hover:bg-primary-hover transition-colors shadow-glow-primary hover:scale-105 active:scale-95"
                    title="Agregar al carrito"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. UNA MARCA CON EXPERIENCIA, AHORA CON UNA NUEVA IDENTIDAD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-navy text-white p-8 sm:p-12 lg:p-14 shadow-xl border border-navy-light/40 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Nueva Etapa PeruCat
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight text-white">
              UNA MARCA CON EXPERIENCIA, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-secondary to-primary-purpleLight">
                AHORA CON UNA NUEVA IDENTIDAD
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
              PeruCat representa una nueva etapa en nuestra propuesta de arenas sanitarias para mascotas.
            </p>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
              Nacemos con el compromiso de ofrecer productos prácticos, confiables y pensados para las necesidades reales de quienes comparten su vida con gatos.
            </p>
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
              <p className="text-xs sm:text-sm font-extrabold text-white">
                ✨ Experiencia que evoluciona. Una nueva identidad. El mismo compromiso con la calidad.
              </p>
            </div>
          </div>

          <div className="relative z-10 w-full lg:w-72 rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex-shrink-0">
            <img
              src="/IMG/perucat-carbon.jpg"
              alt="PeruCat Nueva Identidad"
              className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* 8. CALIDAD QUE SE NOTA EN CADA GRANO & PARA ELLOS. PARA TI. PARA SU HOGAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card A: CALIDAD QUE SE NOTA EN CADA GRANO */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-card-hover transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-navy">
                CALIDAD QUE SE NOTA EN CADA GRANO
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Seleccionamos y desarrollamos nuestras arenas pensando en algo muy simple: <strong>que funcionen bien en tu día a día.</strong>
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Absorción, aglomeración y control de olores se unen para ofrecer una experiencia de limpieza más práctica y conveniente.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-primary font-bold text-xs">
              <CheckCheck className="w-4 h-4 text-accent" /> Fórmula pura y testeada en laboratorio
            </div>
          </div>

          {/* Card B: PARA ELLOS. PARA TI. PARA SU HOGAR */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-card-hover transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-bold">
                <HomeIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-navy">
                PARA ELLOS. PARA TI. PARA SU HOGAR.
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Porque cuidar a tu gato también es cuidar el espacio que comparten.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                PeruCat está creada para acompañarte en esos pequeños momentos que forman parte de la convivencia con tu mascota.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs sm:text-sm font-black text-navy">
                🐾 Tu gato merece lo mejor. Tu hogar también.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. ¿POR QUÉ ELEGIR PERUCAT? (4 Core Reasons) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black text-primary tracking-widest uppercase">
            Nuestros Fundamentos
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy">
            ¿POR QUÉ ELEGIR PERUCAT?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2.5 hover:border-primary/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-primary flex items-center justify-center font-black">
              1
            </div>
            <h4 className="font-extrabold text-navy text-sm">Limpieza sencilla</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Porque buscamos que cada limpieza sea más sencilla y rápida.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2.5 hover:border-secondary/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-secondary flex items-center justify-center font-black">
              2
            </div>
            <h4 className="font-extrabold text-navy text-sm">Control de olores</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Porque sabemos que el control de olores importa las 24 horas del día.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2.5 hover:border-accent/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-accent-dark flex items-center justify-center font-black">
              3
            </div>
            <h4 className="font-extrabold text-navy text-sm">Rendimiento real</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Porque una buena arena debe ofrecer rendimiento, durabilidad y practicidad.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2.5 hover:border-rose-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center font-black">
              4
            </div>
            <h4 className="font-extrabold text-navy text-sm">Amor por las mascotas</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Y porque detrás de cada producto hay una familia que quiere lo mejor para su mascota.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-base sm:text-lg font-black text-navy">
            🐾 PeruCat. Hecha para vivir juntos.
          </p>
        </div>
      </section>

      {/* 10. CONSEJOS PARA UNA MEJOR EXPERIENCIA (Care Guide) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-primary tracking-widest uppercase">
              Guía de Cuidado
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-navy">
              CONSEJOS PARA UNA MEJOR EXPERIENCIA
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Recomendaciones prácticas para maximizar el rendimiento de la arena y el bienestar de tu felino.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Consejo 1 */}
            <div className="p-6 rounded-2xl bg-[#F7F8FC] border border-gray-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-white font-black flex items-center justify-center text-sm shadow-sm">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-navy text-sm">Mantén una buena cantidad de arena</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Asegúrate de mantener un nivel adecuado (5 a 7 cm) para favorecer la absorción y la formación de grumos compactos.
              </p>
            </div>

            {/* Consejo 2 */}
            <div className="p-6 rounded-2xl bg-[#F7F8FC] border border-gray-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-secondary text-white font-black flex items-center justify-center text-sm shadow-sm">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-navy text-sm">Retira los residuos con frecuencia</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Una limpieza frecuente ayuda a mantener el arenero fresco, higiénico y más agradable para tu gato.
              </p>
            </div>

            {/* Consejo 3 */}
            <div className="p-6 rounded-2xl bg-[#F7F8FC] border border-gray-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent text-navy font-black flex items-center justify-center text-sm shadow-sm">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-navy text-sm">Renueva la arena cuando sea necesario</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Mantener el arenero en buenas condiciones y renovar completamente el contenido periódicamente es parte importante del bienestar de tu mascota.
              </p>
            </div>

            {/* Consejo 4 */}
            <div className="p-6 rounded-2xl bg-[#F7F8FC] border border-gray-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center text-sm shadow-sm">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-navy text-sm">Coloca el arenero en un lugar adecuado</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Busca un espacio tranquilo, accesible y bien ventilado donde tu gato se sienta seguro y relajado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11 & 12. LO QUE TU GATO NECESITA, TODOS LOS DÍAS & DESCUBRE PERUCAT (Grand Final CTA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-navy text-white p-8 sm:p-14 lg:p-16 shadow-2xl border border-navy-light/40 text-center space-y-8">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/25 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-[450px] h-[450px] bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Compromiso Diario
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              LO QUE TU GATO NECESITA, <br />
              <span className="bg-gradient-to-r from-accent via-secondary to-primary-purpleLight bg-clip-text text-transparent">
                TODOS LOS DÍAS
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs sm:text-sm font-bold text-gray-200">
              <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
                ✨ Un arenero limpio.
              </div>
              <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
                🐾 Un espacio cómodo.
              </div>
              <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
                🏠 Un hogar agradable.
              </div>
              <div className="p-3 rounded-2xl bg-white/10 border border-white/15 text-accent font-black">
                💡 Y tú, todo más sencillo.
              </div>
            </div>

            <p className="text-xl sm:text-2xl font-black text-accent pt-2">
              Eso es PeruCat.
            </p>
          </div>

          <div className="relative z-10 pt-4 max-w-2xl mx-auto space-y-4 border-t border-white/10">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              DESCUBRE PERUCAT
            </h3>
            <p className="text-sm sm:text-base text-gray-300">
              Encuentra la arena ideal para tu gato y disfruta de una limpieza más práctica todos los días.
            </p>
            <p className="text-base sm:text-lg font-black text-accent-dark bg-accent px-6 py-2 rounded-2xl inline-block shadow-glow-primary">
              PeruCat — Limpieza que se siente.
            </p>
            <div className="pt-4">
              <Link
                to="/productos"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-grad-primary hover:bg-grad-primary-hover text-white font-black text-sm sm:text-base shadow-glow-primary hover:scale-105 transition-all"
              >
                <span>Comprar Arenas PeruCat Ahora</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Flame,
  Truck,
  Sparkles,
  Package,
  ShieldCheck,
  Zap,
  Tag,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface OfferItem {
  id: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  highlight?: string;
  couponCode?: string;
  linkText?: string;
  linkHref?: string;
}

const OFFERS: OfferItem[] = [
  {
    id: 'off-1',
    badge: 'OFERTA FLASH',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    icon: Flame,
    iconColor: 'text-rose-400',
    title: '20% OFF en tu primera compra con el cupón',
    highlight: 'PERUCAT20',
    couponCode: 'PERUCAT20',
  },
  {
    id: 'off-2',
    badge: 'ENVÍO GRATIS',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: Truck,
    iconColor: 'text-emerald-400',
    title: 'Envíos GRATIS a todo Lima Metropolitana en compras mayores a',
    highlight: 'S/ 99',
    linkText: 'Ver detalles',
    linkHref: '/productos',
  },
  {
    id: 'off-3',
    badge: 'HERENCIA CAPSUFET',
    badgeColor: 'bg-primary/30 text-purple-300 border-primary/50',
    icon: Sparkles,
    iconColor: 'text-purple-300',
    title: 'De los creadores de Capsufet:',
    highlight: '100% Bentonita Pura & Máxima Absorción',
  },
  {
    id: 'off-4',
    badge: 'PACK AHORRO',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: Package,
    iconColor: 'text-amber-400',
    title: 'Lleva el Dúo Pack 2x10Kg y ahorra',
    highlight: 'S/ 20 directo',
    linkText: 'Comprar Pack',
    linkHref: '/productos',
  },
  {
    id: 'off-5',
    badge: 'CALIDAD PREMIUM',
    badgeColor: 'bg-accent/20 text-accent border-accent/40',
    icon: ShieldCheck,
    iconColor: 'text-accent',
    title: 'Fórmula 99.5% libre de polvo:',
    highlight: 'Cuidado respiratorio felino garantizado',
  },
  {
    id: 'off-6',
    badge: 'DESPACHO EXPRESS',
    badgeColor: 'bg-secondary/20 text-blue-300 border-secondary/40',
    icon: Zap,
    iconColor: 'text-blue-400',
    title: 'Entregas rápidas en 24h a 48h a nivel',
    highlight: 'Lima y Provincias',
  },
];

export const OffersMarqueeBanner: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCoupon = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const renderOfferPill = (offer: OfferItem, keySuffix: string) => {
    const Icon = offer.icon;
    const isCopied = copiedCode === offer.couponCode;

    return (
      <div
        key={`${offer.id}-${keySuffix}`}
        className="inline-flex items-center gap-3 px-5 py-2.5 mx-2 rounded-2xl bg-[#172A59]/80 hover:bg-[#1C3268] border border-navy-light/60 hover:border-accent/40 shadow-sm transition-all duration-300 group select-none flex-shrink-0"
      >
        {/* Badge */}
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${offer.badgeColor} flex items-center gap-1.5`}
        >
          <Icon className={`w-3 h-3 ${offer.iconColor} animate-pulse`} />
          {offer.badge}
        </span>

        {/* Text */}
        <span className="text-xs text-gray-200 font-medium">
          {offer.title}{' '}
          {offer.highlight && (
            <strong className="text-white font-extrabold bg-gradient-to-r from-accent via-secondary to-primary-purpleLight bg-clip-text text-transparent">
              {offer.highlight}
            </strong>
          )}
        </span>

        {/* Interactive Coupon Code Button */}
        {offer.couponCode && (
          <button
            onClick={(e) => handleCopyCoupon(offer.couponCode!, e)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-black tracking-wider border border-primary-purpleLight/40 transition-all shadow-glow-primary hover:scale-105 active:scale-95"
            title="Haz clic para copiar el código"
          >
            {isCopied ? (
              <>
                <Check className="w-3 h-3 text-emerald-300" />
                <span className="text-emerald-300">¡Copiado!</span>
              </>
            ) : (
              <>
                <Tag className="w-3 h-3 text-accent" />
                <span>{offer.couponCode}</span>
                <Copy className="w-2.5 h-2.5 text-gray-300 group-hover:text-white" />
              </>
            )}
          </button>
        )}

        {/* Action Link */}
        {offer.linkText && offer.linkHref && (
          <Link
            to={offer.linkHref}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:text-white transition-colors hover:underline"
          >
            <span>{offer.linkText}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}

        {/* Dot separator */}
        <span className="w-1.5 h-1.5 rounded-full bg-navy-light ml-2" />
      </div>
    );
  };

  return (
    <section className="relative w-full overflow-hidden bg-navy py-3 border-y border-navy-light/50 shadow-inner">
      {/* Background glowing effects */}
      <div className="absolute -left-20 top-0 w-60 h-full bg-gradient-to-r from-primary/30 to-transparent blur-xl pointer-events-none" />
      <div className="absolute -right-20 top-0 w-60 h-full bg-gradient-to-l from-accent/30 to-transparent blur-xl pointer-events-none" />

      {/* Edge gradient masks for soft fading */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-navy to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-navy to-transparent z-10 pointer-events-none" />

      {/* Infinite Horizontal Marquee Track */}
      <div className="flex overflow-hidden w-full">
        <div className="animate-marquee flex items-center">
          {OFFERS.map((offer) => renderOfferPill(offer, 'first'))}
          {OFFERS.map((offer) => renderOfferPill(offer, 'second'))}
        </div>
      </div>
    </section>
  );
};

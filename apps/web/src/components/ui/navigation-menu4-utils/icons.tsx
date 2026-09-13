import React from 'react';
import {
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Star,
  Flame,
  Layers,
  Heart,
  Package,
  Compass,
} from 'lucide-react';

export const BagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ShoppingBag {...(props as any)} />
);

export const JewelryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Sparkles {...(props as any)} />
);

export const SunglassesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Star {...(props as any)} />
);

export const HatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Flame {...(props as any)} />
);

export const BeltIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ShieldCheck {...(props as any)} />
);

export const OtherIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Layers {...(props as any)} />
);

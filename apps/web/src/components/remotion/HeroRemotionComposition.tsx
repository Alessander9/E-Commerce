import React, { useMemo } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';

export interface HeroSlide {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  image: string;
  rating: number;
  badge: string;
  badgeColor: string;
  accentColor: string;
  glowColor: string;
}

export interface HeroRemotionProps {
  slides?: HeroSlide[];
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'perucat-clasica',
    tag: 'MÁXIMA ABSORCIÓN & AGLOMERACIÓN',
    title: 'PeruCat Clásica Aglomerante',
    subtitle: 'Terrones firmes en segundos y 99.5% libre de polvo',
    price: 'S/ 28.00',
    oldPrice: 'S/ 34.00',
    discount: '-18% OFF',
    image: '/IMG/perucat-clasica-hd.jpg',
    rating: 4.9,
    badge: '🐾 Cuidado Superior para tu Gato',
    badgeColor: '#00B8C9',
    accentColor: '#6A2CFF',
    glowColor: 'rgba(106, 44, 255, 0.45)',
  },
  {
    id: 'perucat-carbon',
    tag: 'CONTROL TOTAL DE OLORES 24/7',
    title: 'PeruCat Carbón Activo Max Control',
    subtitle: 'Bloqueo instantáneo de olores y amoníaco',
    price: 'S/ 34.00',
    oldPrice: 'S/ 40.00',
    discount: '-15% OFF',
    image: '/IMG/perucat-carbon-hd.jpg',
    rating: 5.0,
    badge: '⚡ Ideal para Múltiples Gatos',
    badgeColor: '#1976FF',
    accentColor: '#1976FF',
    glowColor: 'rgba(25, 118, 255, 0.45)',
  },
  {
    id: 'perucat-lavanda',
    tag: 'AROMA SUTIL & RELAJANTE',
    title: 'PeruCat Lavanda Silvestre',
    subtitle: 'Frescura prolongada sin perturbar el olfato felino',
    price: 'S/ 32.00',
    oldPrice: 'S/ 38.00',
    discount: '-16% OFF',
    image: '/IMG/perucat-lavanda.jpg',
    rating: 4.95,
    badge: '🌸 Fórmula Suave y Relajante',
    badgeColor: '#8E5BFF',
    accentColor: '#D946EF',
    glowColor: 'rgba(217, 70, 239, 0.45)',
  },
];

export const HeroRemotionComposition: React.FC<HeroRemotionProps> = ({
  slides = DEFAULT_SLIDES,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Slide rotation logic (each slide takes an equal partition of duration)
  const slideDuration = durationInFrames / slides.length;
  const currentSlideIndex = Math.floor((frame % durationInFrames) / slideDuration);
  const slideLocalFrame = (frame % durationInFrames) % slideDuration;
  const slide = slides[currentSlideIndex] || slides[0];

  // Enter/Exit animations for the active slide
  const enterProgress = spring({
    frame: slideLocalFrame,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 120 },
  });

  const exitStartFrame = slideDuration - 15;
  const exitProgress = interpolate(
    slideLocalFrame,
    [exitStartFrame, slideDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const opacity = interpolate(enterProgress, [0, 1], [0, 1]) * (1 - exitProgress);
  const scale = interpolate(enterProgress, [0, 1], [0.85, 1]) - exitProgress * 0.08;
  const translateY = interpolate(enterProgress, [0, 1], [30, 0]) + exitProgress * -25;
  
  // Continuous smooth floating motion
  const floatY = Math.sin((frame / 30) * Math.PI) * 8;
  const floatRotate = Math.cos((frame / 45) * Math.PI) * 2;
  const auraPulse = 0.85 + Math.sin((frame / 20) * Math.PI) * 0.15;
  const auraSpin = (frame * 0.6) % 360;

  // Shimmer sheen sweep every 90 frames
  const shimmerPosition = interpolate(
    frame % 90,
    [0, 45],
    [-150, 250],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Particles generator
  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => {
      const angle = (i / 18) * Math.PI * 2;
      const radius = 220 + (i % 4) * 45;
      const speed = 0.02 + (i % 3) * 0.01;
      const size = 4 + (i % 5) * 2;
      return { id: i, angle, radius, speed, size };
    });
  }, []);

  return (
    <AbsoluteFill
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* 1. Dynamic Glowing Backlights */}
      <div
        style={{
          position: 'absolute',
          width: 440,
          height: 440,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${slide.glowColor} 0%, rgba(25, 118, 255, 0.1) 50%, transparent 75%)`,
          transform: `scale(${auraPulse * 1.15}) rotate(${auraSpin}deg)`,
          filter: 'blur(35px)',
          transition: 'background 0.5s ease',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          width: 360,
          height: 360,
          borderRadius: '50%',
          border: '1.5px dashed rgba(255, 255, 255, 0.15)',
          transform: `rotate(${auraSpin * -1.2}deg)`,
          pointerEvents: 'none',
        }}
      />

      {/* 2. Orbiting Micro Particles */}
      {particles.map((p) => {
        const currentAngle = p.angle + frame * p.speed;
        const x = Math.cos(currentAngle) * p.radius;
        const y = Math.sin(currentAngle) * (p.radius * 0.65);
        const particleOpacity = 0.3 + Math.sin(frame * 0.05 + p.id) * 0.4;

        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: p.id % 2 === 0 ? slide.badgeColor : '#FFFFFF',
              boxShadow: `0 0 10px ${slide.badgeColor}`,
              transform: `translate(${x}px, ${y}px)`,
              opacity: particleOpacity,
              pointerEvents: 'none',
            }}
          />
        );
      })}

      {/* 3. Main Glass Showcase Card */}
      <div
        style={{
          opacity,
          transform: `translateY(${translateY + floatY}px) scale(${scale}) rotate(${floatRotate}deg)`,
          width: '90%',
          maxWidth: 480,
          borderRadius: 32,
          padding: 20,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          boxShadow: `0 24px 48px -12px rgba(0, 0, 0, 0.5), 0 0 35px ${slide.glowColor}`,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        {/* Shimmer Sheen Effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '60%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
            transform: `translateX(${shimmerPosition}%) skewX(-25deg)`,
            pointerEvents: 'none',
          }}
        />

        {/* Top Header Tag & Rating */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.12)',
              border: `1px solid ${slide.badgeColor}66`,
              color: slide.badgeColor,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span>{slide.tag}</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 14,
              background: 'rgba(0, 0, 0, 0.35)',
              color: '#FBBF24',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <span>★</span>
            <span style={{ color: '#FFFFFF' }}>{slide.rating}</span>
          </div>
        </div>

        {/* Product Image Frame */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 240,
            borderRadius: 22,
            overflow: 'hidden',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${1 + Math.sin((frame / 60) * Math.PI) * 0.04})`,
              transition: 'transform 0.2s ease-out',
            }}
          />

          {/* Discount Ribbon */}
          {slide.discount && (
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                padding: '4px 10px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #EF4444 0%, #D946EF 100%)',
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: 900,
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                letterSpacing: '0.03em',
              }}
            >
              {slide.discount}
            </div>
          )}

          {/* Floating Feature Pill inside Image */}
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              right: 10,
              padding: '7px 12px',
              borderRadius: 14,
              background: 'rgba(13, 27, 61, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#E2E8F0',
              fontSize: 11,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span>{slide.badge}</span>
          </div>
        </div>

        {/* Product Details Bottom Card */}
        <div
          style={{
            marginTop: 14,
            padding: '12px 14px',
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ flex: 1, paddingRight: 10 }}>
            <h4
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 800,
                color: '#0D1B3D',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {slide.title}
            </h4>
            <p
              style={{
                margin: '3px 0 0 0',
                fontSize: 11,
                color: '#64748B',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {slide.subtitle}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span
                style={{
                  fontSize: 17,
                  fontWeight: 900,
                  color: '#6A2CFF',
                }}
              >
                {slide.price}
              </span>
              {slide.oldPrice && (
                <span
                  style={{
                    fontSize: 11,
                    color: '#94A3B8',
                    textDecoration: 'line-through',
                  }}
                >
                  {slide.oldPrice}
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#059669',
                marginTop: 1,
              }}
            >
              Stock Verificado
            </span>
          </div>
        </div>

        {/* Scene Indicator Dots */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            marginTop: 12,
          }}
        >
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                height: 4,
                width: i === currentSlideIndex ? 24 : 6,
                borderRadius: 2,
                backgroundColor: i === currentSlideIndex ? slide.badgeColor : 'rgba(255, 255, 255, 0.25)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const WA_ICON = (
  <svg viewBox="0 0 24 24" width="10" height="10" fill="#25D366" style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function LivePreview({ brandConfig, promoData, onExport }) {
  const [particlesReady, setParticlesReady] = useState(false);
  const cfg = brandConfig || {};
  const promo = useDebounce(promoData, 150);

  const goldColor = cfg.secondary_color || '#c9a84c';
  const accentColor = cfg.accent_color || '#c4607a';
  const primaryColor = cfg.primary_color || '#0d0d0d';

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setParticlesReady(true));
  }, []);

  const particlesOptions = useMemo(() => ({
    background: { color: { value: 'transparent' } },
    fpsLimit: 30,
    particles: {
      number: { value: 15, density: { enable: true, area: 600 } },
      color: { value: ['#c9a84c', '#e8d5a0', '#f5e6c8'] },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.02, max: 0.07 },
        animation: { enable: true, speed: 0.4, minimumValue: 0.01 },
      },
      size: { value: { min: 0.5, max: 2.5 } },
      move: {
        enable: true,
        speed: 0.25,
        direction: 'top',
        random: true,
        straight: false,
        outModes: { default: 'out' },
      },
    },
    detectRetina: true,
  }), []);

  const bgStyle = promo.background_type === 'photo' && promo.background_url
    ? { backgroundImage: `url(${promo.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: `linear-gradient(135deg, ${primaryColor} 0%, #0a0f1e 50%, #111 100%)` };

  const items = promo.items || [];

  // Fall back to brandConfig values when promoData fields are empty (e.g. before
  // App.jsx's async fetch has set promoData, or during the 150 ms debounce window)
  const displayPhone = promo.phone || cfg.phone || '';
  const displayTagline = promo.tagline || cfg.tagline || '';

  const cornerStyles = [
    { top: 10, left: 10, borderTop: `1px solid ${goldColor}`, borderLeft: `1px solid ${goldColor}` },
    { top: 10, right: 10, borderTop: `1px solid ${goldColor}`, borderRight: `1px solid ${goldColor}` },
    { bottom: 10, left: 10, borderBottom: `1px solid ${goldColor}`, borderLeft: `1px solid ${goldColor}` },
    { bottom: 10, right: 10, borderBottom: `1px solid ${goldColor}`, borderRight: `1px solid ${goldColor}` },
  ];

  const divider = (
    <div style={{ width: '100%', height: 1, background: `linear-gradient(to right, transparent, ${goldColor}60, transparent)` }} />
  );

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="mb-5">
        <h2 className="section-heading text-xl mb-1">Aperçu Live</h2>
        <p className="font-montserrat text-xs text-white/30 mt-1">Mis à jour en temps réel · 9:16</p>
      </div>

      {/* 9:16 canvas */}
      <div className="mx-auto" style={{ maxWidth: 340 }}>
        <div style={{ paddingTop: '177.78%', position: 'relative' }}>
          <div
            className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl"
            style={{ ...bgStyle }}
          >
            {promo.background_type === 'photo' && (
              <div className="absolute inset-0 bg-black/55" />
            )}

            {/* Particles */}
            {particlesReady && (
              <Particles
                id="promo-particles"
                options={particlesOptions}
                className="absolute inset-0 pointer-events-none"
              />
            )}

            {/* Corner accents */}
            {cornerStyles.map((style, i) => (
              <div key={i} className="absolute" style={{ width: 18, height: 18, ...style }} />
            ))}

            {/* Content */}
            <div className="absolute inset-0 z-10 flex flex-col items-center" style={{ padding: '18px 16px 14px' }}>
              {/* Logo */}
              {cfg.logo_url && (
                <div
                  className="rounded-full overflow-hidden flex-shrink-0 mb-1.5"
                  style={{ width: 58, height: 58, border: `1.5px solid ${goldColor}80` }}
                >
                  <img src={cfg.logo_url} alt="Logo" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Brand name */}
              <div
                className="font-cinzel uppercase mb-1.5"
                style={{ fontSize: 7, letterSpacing: '0.4em', color: `${goldColor}70` }}
              >
                {cfg.brand_name || 'ARIANE COSMETICS'}
              </div>

              {divider}

              {/* Title */}
              {promo.title && (
                <div
                  className="font-cinzel font-bold text-center mt-2 mb-1 leading-tight uppercase"
                  style={{ color: goldColor, fontSize: 14, letterSpacing: '0.12em' }}
                >
                  {promo.title}
                </div>
              )}
              {promo.subtitle && (
                <div
                  className="font-cormorant italic text-center mb-1"
                  style={{ color: accentColor, fontSize: 10 }}
                >
                  {promo.subtitle}
                </div>
              )}

              <div style={{ marginTop: 4, marginBottom: 4, width: '100%', height: 1, background: `linear-gradient(to right, transparent, ${goldColor}50, transparent)` }} />

              {/* Items */}
              <div className="w-full flex-1 overflow-hidden" style={{ gap: 4, display: 'flex', flexDirection: 'column', margin: '4px 0' }}>
                {items.map((item, i) => {
                  const discount =
                    item.original_price && item.promo_price && Number(item.original_price) > 0
                      ? Math.round((1 - Number(item.promo_price) / Number(item.original_price)) * 100)
                      : null;
                  return (
                    <div
                      key={item.id || i}
                      className="relative flex items-center justify-between overflow-hidden"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${goldColor}40`,
                        borderRadius: 5,
                        padding: '5px 6px 5px 10px',
                        flexShrink: 0,
                      }}
                    >
                      <div className="absolute left-0 top-0 bottom-0" style={{ width: 2, background: `linear-gradient(to bottom, ${goldColor}, ${accentColor})` }} />
                      <div className="flex-1 min-w-0 pl-1">
                        <div className="font-cinzel uppercase truncate text-white" style={{ fontSize: 7.5, letterSpacing: '0.08em' }}>
                          {item.service_name || '—'}
                        </div>
                        {item.original_price && (
                          <div className="font-cormorant line-through" style={{ fontSize: 6.5, color: accentColor, opacity: 0.65 }}>
                            {item.original_price} DH
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {discount !== null && discount > 0 && (
                          <span className="font-cinzel text-white" style={{ background: '#8b2040', fontSize: 5.5, padding: '1px 4px', borderRadius: 10 }}>
                            -{discount}%
                          </span>
                        )}
                        <div className="font-cormorant font-bold" style={{ color: goldColor, fontSize: 13, textShadow: `0 0 6px ${goldColor}50` }}>
                          {item.promo_price || '—'} <span style={{ fontSize: 7 }}>DH</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex-1" />

              {divider}

              {/* WhatsApp */}
              {displayPhone && (
                <div className="flex items-center gap-1 font-cormorant italic mt-1" style={{ color: goldColor, fontSize: 8.5 }}>
                  {WA_ICON}
                  {displayPhone}
                </div>
              )}

              {/* Tagline */}
              {displayTagline && (
                <div className="font-cormorant italic text-center mt-0.5" style={{ color: `${goldColor}90`, fontSize: 7.5 }}>
                  {displayTagline}
                </div>
              )}

              {/* Footer */}
              <div className="font-cinzel uppercase mt-1" style={{ fontSize: 5.5, letterSpacing: '0.35em', color: `${goldColor}50` }}>
                ARIANE COSMETICS · FÈS
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.button
        type="button"
        onClick={onExport}
        whileTap={{ scale: 0.98 }}
        className="shimmer-btn w-full relative overflow-hidden mt-6"
      >
        <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-gold/10 to-transparent pointer-events-none" />
        <Download size={16} className="mr-2" /> Télécharger
      </motion.button>
    </div>
  );
}

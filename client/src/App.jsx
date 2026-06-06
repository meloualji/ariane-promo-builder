import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BrandConfig from './components/BrandConfig';
import PromoEditor from './components/PromoEditor';
import LivePreview from './components/LivePreview';
import ExportButtons from './components/ExportButtons';

const pageVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};
const pageTransition = { type: 'tween', duration: 0.25, ease: 'easeInOut' };

const NAV = [
  { key: 'brandConfig', label: 'Config', icon: '⚙' },
  { key: 'promoEditor', label: 'Promo', icon: '✦' },
  { key: 'livePreview', label: 'Aperçu', icon: '◎' },
  { key: 'exportScreen', label: 'Export', icon: '↓' },
];

export default function App() {
  const [screen, setScreen] = useState('promoEditor');
  const [brandConfig, setBrandConfig] = useState(null);
  const [promoData, setPromoData] = useState({
    title: '',
    subtitle: '',
    items: [
      { id: 1, service_name: '', original_price: '', promo_price: '' },
      { id: 2, service_name: '', original_price: '', promo_price: '' },
    ],
    background_type: 'gradient',
    background_url: null,
    phone: '',
    tagline: '',
  });

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(cfg => {
        setBrandConfig(cfg);
        setPromoData(prev => ({
          ...prev,
          phone: cfg.phone || '',
          tagline: cfg.tagline || 'Offre limitée · Sur rendez-vous',
        }));
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div>
          <h1 className="font-cinzel text-sm tracking-[0.3em] text-gold">ARIANE</h1>
          <p className="font-montserrat text-[9px] text-white/25 tracking-widest uppercase mt-0.5">Promo Builder</p>
        </div>
        <nav className="flex gap-1">
          {NAV.map(item => (
            <button
              key={item.key}
              onClick={() => setScreen(item.key)}
              className={`px-2.5 py-2 rounded-lg font-montserrat text-[10px] tracking-wider transition-all min-h-[44px] min-w-[44px] ${
                screen === item.key
                  ? 'bg-gold/15 text-gold border border-gold/35'
                  : 'text-white/35 hover:text-white/60'
              }`}
            >
              <span className="block text-center text-sm mb-0.5">{item.icon}</span>
              <span className="block text-center">{item.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {screen === 'brandConfig' && (
            <motion.div key="brandConfig" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <BrandConfig
                config={brandConfig}
                onSave={cfg => { setBrandConfig(cfg); setScreen('promoEditor'); }}
              />
            </motion.div>
          )}
          {screen === 'promoEditor' && (
            <motion.div key="promoEditor" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <PromoEditor
                brandConfig={brandConfig}
                promoData={promoData}
                onChange={setPromoData}
                onPreview={() => setScreen('livePreview')}
              />
            </motion.div>
          )}
          {screen === 'livePreview' && (
            <motion.div key="livePreview" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <LivePreview
                brandConfig={brandConfig}
                promoData={promoData}
                onExport={() => setScreen('exportScreen')}
              />
            </motion.div>
          )}
          {screen === 'exportScreen' && (
            <motion.div key="exportScreen" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <ExportButtons
                brandConfig={brandConfig}
                promoData={promoData}
                onBack={() => setScreen('livePreview')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

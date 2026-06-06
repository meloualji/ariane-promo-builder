import React, { useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Eye, ImageIcon } from 'lucide-react';
import PromoItemCard from './PromoItemCard';

export default function PromoEditor({ brandConfig, promoData, onChange, onPreview }) {
  const set = useCallback((key, val) => onChange(prev => ({ ...prev, [key]: val })), [onChange]);

  const addItem = () => {
    if (promoData.items.length >= 5) return;
    const newId = Date.now();
    onChange(prev => ({
      ...prev,
      items: [...prev.items, { id: newId, service_name: '', original_price: '', promo_price: '' }],
    }));
  };

  const removeItem = (id) => {
    if (promoData.items.length <= 2) return;
    onChange(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const updateItem = (id, updated) => {
    onChange(prev => ({ ...prev, items: prev.items.map(i => i.id === id ? updated : i) }));
  };

  const handleBgPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => set('background_url', reader.result);
    reader.readAsDataURL(file);
    set('background_type', 'photo');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="section-heading text-xl mb-1">Nouvelle Promo</h2>
        <p className="font-montserrat text-xs text-white/30 mt-1">Créez votre visuel en moins de 2 minutes</p>
      </div>

      {/* Title & Subtitle */}
      <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4 mb-4">
        <p className="section-heading text-xs mb-4">Titre</p>
        <div className="space-y-3">
          <div>
            <label className="block font-montserrat text-[10px] text-white/35 uppercase tracking-widest mb-1.5">
              Titre principal *
            </label>
            <input
              type="text"
              value={promoData.title}
              onChange={e => set('title', e.target.value)}
              placeholder="SPÉCIAL ONGLES"
              className="glass-input font-cinzel tracking-widest uppercase"
            />
          </div>
          <div>
            <label className="block font-montserrat text-[10px] text-white/35 uppercase tracking-widest mb-1.5">
              Sous-titre (optionnel)
            </label>
            <input
              type="text"
              value={promoData.subtitle}
              onChange={e => set('subtitle', e.target.value)}
              placeholder="Offre Flash · Durée limitée"
              className="glass-input font-cormorant italic"
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="section-heading text-xs">
            Services ({promoData.items.length}/5)
          </p>
          {promoData.items.length < 5 && (
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1.5 text-gold border border-gold/25 rounded-lg px-3 py-2 font-montserrat text-xs hover:bg-gold/8 transition-all min-h-[44px]"
            >
              <Plus size={13} /> Ajouter
            </button>
          )}
        </div>
        <AnimatePresence mode="popLayout">
          {promoData.items.map((item, index) => (
            <PromoItemCard
              key={item.id}
              item={item}
              index={index}
              onChange={updated => updateItem(item.id, updated)}
              onRemove={() => removeItem(item.id)}
              canRemove={promoData.items.length > 2}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Background */}
      <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4 mb-4">
        <p className="section-heading text-xs mb-4">Arrière-plan</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {['gradient', 'photo'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => set('background_type', type)}
              className={`py-3 rounded-lg font-montserrat text-sm transition-all min-h-[44px] border ${
                promoData.background_type === type
                  ? 'border-gold/50 bg-gold/10 text-gold'
                  : 'border-white/8 text-white/35 hover:border-white/20 hover:text-white/60'
              }`}
            >
              {type === 'gradient' ? '🎨 Couleurs' : '📷 Photo'}
            </button>
          ))}
        </div>
        <AnimatePresence>
          {promoData.background_type === 'photo' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <label className="shimmer-btn w-full justify-center cursor-pointer text-xs gap-2">
                <ImageIcon size={13} /> Choisir une photo
                <input type="file" accept="image/*" onChange={handleBgPhoto} className="hidden" />
              </label>
              {promoData.background_url && (
                <div className="mt-2 rounded-lg overflow-hidden h-24">
                  <img src={promoData.background_url} alt="Background" className="w-full h-full object-cover opacity-60" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contact */}
      <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4 mb-6">
        <p className="section-heading text-xs mb-4">Contact & Tagline</p>
        <div className="space-y-3">
          <div>
            <label className="block font-montserrat text-[10px] text-white/35 uppercase tracking-widest mb-1.5">
              WhatsApp / Téléphone
            </label>
            <input
              type="tel"
              value={promoData.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="+212 6XX XXX XXX"
              className="glass-input"
            />
          </div>
          <div>
            <label className="block font-montserrat text-[10px] text-white/35 uppercase tracking-widest mb-1.5">
              Tagline
            </label>
            <input
              type="text"
              value={promoData.tagline}
              onChange={e => set('tagline', e.target.value)}
              placeholder="Offre limitée · Sur rendez-vous"
              className="glass-input font-cormorant italic"
            />
          </div>
        </div>
      </div>

      <motion.button
        type="button"
        onClick={onPreview}
        whileTap={{ scale: 0.98 }}
        className="shimmer-btn w-full relative overflow-hidden"
      >
        <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-gold/10 to-transparent pointer-events-none" />
        <Eye size={16} className="mr-2" /> Voir l'aperçu
      </motion.button>
    </div>
  );
}

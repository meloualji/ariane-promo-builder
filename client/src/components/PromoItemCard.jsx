import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

export default function PromoItemCard({ item, index, onChange, onRemove, canRemove }) {
  const discount =
    item.original_price && item.promo_price && Number(item.original_price) > 0
      ? Math.round((1 - Number(item.promo_price) / Number(item.original_price)) * 100)
      : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      className="relative bg-white/[0.03] border border-white/8 rounded-xl p-4 mb-3"
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-gradient-to-b from-gold to-rose-accent" />

      {/* Header row */}
      <div className="flex items-center justify-between mb-3 pl-3">
        <span className="font-cinzel text-[10px] text-gold/50 tracking-widest uppercase">
          Service {index + 1}
        </span>
        <div className="flex items-center gap-2">
          {discount !== null && discount > 0 && (
            <span className="bg-burgundy text-white font-cinzel text-[10px] px-2.5 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-white/20 hover:text-rose-accent transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="pl-3 space-y-2.5">
        <input
          type="text"
          value={item.service_name}
          onChange={e => onChange({ ...item, service_name: e.target.value })}
          placeholder="Nom du service (ex: Pose Résine)"
          className="glass-input font-cinzel tracking-wide uppercase text-sm"
        />

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block font-montserrat text-[9px] text-white/30 uppercase tracking-widest mb-1">
              Prix original
            </label>
            <div className="relative">
              <input
                type="number"
                value={item.original_price}
                onChange={e => onChange({ ...item, original_price: e.target.value })}
                placeholder="150"
                className="glass-input pr-10"
                min="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-cormorant text-white/30 text-xs">
                DH
              </span>
            </div>
          </div>
          <div>
            <label className="block font-montserrat text-[9px] text-white/30 uppercase tracking-widest mb-1">
              Prix promo
            </label>
            <div className="relative">
              <input
                type="number"
                value={item.promo_price}
                onChange={e => onChange({ ...item, promo_price: e.target.value })}
                placeholder="99"
                className="glass-input pr-10 text-gold"
                min="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-cormorant text-gold/50 text-xs">
                DH
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

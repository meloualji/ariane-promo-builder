import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ExportButtons({ brandConfig, promoData, onBack }) {
  const [loading, setLoading] = useState(null);
  const [status, setStatus] = useState(null);

  const exportFormat = async (format) => {
    setLoading(format);
    setStatus(null);
    try {
      const res = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: brandConfig || {}, promo: promoData }),
      });
      if (!res.ok) throw new Error(`Erreur serveur: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      a.download = `ariane-promo-${format}-${date}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus({ type: 'success', msg: `Visuel ${format === 'story' ? 'Story 9:16' : 'Post 1:1'} téléchargé avec succès` });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(null);
    }
  };

  const formats = [
    {
      key: 'story',
      label: 'Story / Reel',
      dims: '1080 × 1920 px · 9:16',
      preview: (
        <div className="w-10 h-[70px] rounded border border-gold/25 flex items-center justify-center flex-shrink-0">
          <div className="w-7 h-[52px] rounded-sm" style={{ background: 'linear-gradient(to bottom, rgba(201,168,76,0.2), rgba(201,168,76,0.05))' }} />
        </div>
      ),
    },
    {
      key: 'post',
      label: 'Post Instagram',
      dims: '1080 × 1080 px · 1:1',
      preview: (
        <div className="w-14 h-14 rounded border border-gold/25 flex items-center justify-center flex-shrink-0">
          <div className="w-10 h-10 rounded-sm" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))' }} />
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="section-heading text-xl mb-1">Exporter</h2>
        <p className="font-montserrat text-xs text-white/30 mt-1">PNG haute résolution · Rendu côté serveur</p>
      </div>

      <div className="space-y-4">
        {formats.map(({ key, label, dims, preview }) => (
          <motion.div
            key={key}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            className="bg-white/[0.03] border border-white/8 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-cinzel text-gold tracking-wider text-sm">{label}</div>
                <div className="font-montserrat text-[10px] text-white/30 mt-1">{dims}</div>
              </div>
              {preview}
            </div>
            <button
              onClick={() => exportFormat(key)}
              disabled={!!loading}
              className="shimmer-btn w-full relative overflow-hidden"
            >
              <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-gold/10 to-transparent pointer-events-none" />
              {loading === key ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
                  Génération en cours...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Download size={14} />
                  Télécharger {key === 'story' ? 'Story (9:16)' : 'Post (1:1)'}
                </span>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {status && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
            status.type === 'success'
              ? 'bg-green-950/60 border border-green-700/30 text-green-400'
              : 'bg-red-950/60 border border-red-700/30 text-red-400'
          }`}
        >
          {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span className="font-montserrat text-xs">{status.msg}</span>
        </motion.div>
      )}

      <div className="mt-6 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
        <div className="font-montserrat text-[10px] text-white/30 space-y-1.5 leading-relaxed">
          <div>✦ Rendu pixel-perfect via Puppeteer</div>
          <div>✦ Polices Cinzel &amp; Cormorant Garamond incluses</div>
          <div>✦ Prêt pour Instagram · WhatsApp · Facebook</div>
        </div>
      </div>

      <button
        onClick={onBack}
        className="mt-5 flex items-center gap-2 font-montserrat text-xs text-white/35 hover:text-white/60 transition-colors min-h-[44px]"
      >
        <ArrowLeft size={14} /> Retour à l'aperçu
      </button>
    </div>
  );
}

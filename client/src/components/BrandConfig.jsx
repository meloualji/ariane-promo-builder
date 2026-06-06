import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Save, Palette, Phone, Type, Image } from 'lucide-react';

export default function BrandConfig({ onSave }) {
  const [form, setForm] = useState({
    brand_name: 'ARIANE COSMETICS',
    logo_size: 'medium',
    logo_position: 'top-center',
    primary_color: '#0d0d0d',
    secondary_color: '#c9a84c',
    accent_color: '#c4607a',
    phone: '',
    tagline: 'Offre limitée · Sur rendez-vous',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch directly on mount — self-sufficient, no parent prop dependency
  useEffect(() => {
    fetch('/api/config')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(cfg => {
        if (!cfg || cfg.error) return;
        setForm(prev => ({
          ...prev,
          brand_name: cfg.brand_name ?? prev.brand_name,
          logo_size: cfg.logo_size ?? prev.logo_size,
          logo_position: cfg.logo_position ?? prev.logo_position,
          primary_color: cfg.primary_color ?? prev.primary_color,
          secondary_color: cfg.secondary_color ?? prev.secondary_color,
          accent_color: cfg.accent_color ?? prev.accent_color,
          phone: cfg.phone ?? '',
          tagline: cfg.tagline ?? prev.tagline,
        }));
        if (cfg.logo_url) setLogoPreview(cfg.logo_url);
      })
      .catch(err => console.error('[BrandConfig] load error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
      if (logoFile) fd.append('logo', logoFile);
      const res = await fetch('/api/config', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2500);
      onSave(saved);
    } catch (err) {
      console.error('[BrandConfig] save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, children }) => (
    <div className="mb-3">
      <label className="block font-montserrat text-[10px] text-white/40 uppercase tracking-widest mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 flex items-center justify-center" style={{ minHeight: 300 }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
          <p className="font-montserrat text-xs text-white/30">Chargement de la configuration…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="section-heading text-xl mb-1">Configuration Marque</h2>
        <p className="font-montserrat text-xs text-white/30 mt-1">Sauvegardé et réutilisé sur tous vos visuels</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Logo section */}
        <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
          <p className="section-heading text-xs mb-4 flex items-center gap-2">
            <Image size={12} className="flex-shrink-0" style={{ WebkitTextFillColor: 'initial', color: '#c9a84c' }} />
            Logo
          </p>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full border border-gold/40 overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
              {logoPreview
                ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                : <Upload size={22} className="text-gold/30" />
              }
            </div>
            <div>
              <label className="shimmer-btn cursor-pointer text-xs gap-2">
                <Upload size={13} /> Choisir logo
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
              <p className="font-montserrat text-[10px] text-white/20 mt-2">PNG transparent recommandé</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Taille">
              <select
                value={form.logo_size}
                onChange={e => setForm(p => ({ ...p, logo_size: e.target.value }))}
                className="glass-input"
              >
                <option value="small">Petit</option>
                <option value="medium">Moyen</option>
                <option value="large">Grand</option>
              </select>
            </Field>
            <Field label="Position">
              <select
                value={form.logo_position}
                onChange={e => setForm(p => ({ ...p, logo_position: e.target.value }))}
                className="glass-input"
              >
                <option value="top-left">Gauche</option>
                <option value="top-center">Centre</option>
                <option value="top-right">Droite</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Identity */}
        <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
          <p className="section-heading text-xs mb-4 flex items-center gap-2">
            <Type size={12} className="flex-shrink-0" style={{ WebkitTextFillColor: 'initial', color: '#c9a84c' }} />
            Identité
          </p>
          <Field label="Nom de la marque">
            <input
              type="text"
              value={form.brand_name}
              onChange={e => setForm(p => ({ ...p, brand_name: e.target.value }))}
              className="glass-input font-cinzel tracking-wider"
              placeholder="ARIANE COSMETICS"
            />
          </Field>
          <Field label="Téléphone / WhatsApp">
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="glass-input"
              placeholder="+212 6XX XXX XXX"
            />
          </Field>
          <Field label="Tagline par défaut">
            <input
              type="text"
              value={form.tagline}
              onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))}
              className="glass-input font-cormorant italic"
              placeholder="Offre limitée · Sur rendez-vous"
            />
          </Field>
        </div>

        {/* Colors */}
        <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
          <p className="section-heading text-xs mb-4 flex items-center gap-2">
            <Palette size={12} className="flex-shrink-0" style={{ WebkitTextFillColor: 'initial', color: '#c9a84c' }} />
            Couleurs
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'primary_color', label: 'Fond' },
              { key: 'secondary_color', label: 'Or' },
              { key: 'accent_color', label: 'Accent' },
            ].map(({ key, label }) => (
              <div key={key} className="text-center">
                <p className="font-montserrat text-[10px] text-white/35 uppercase tracking-widest mb-2">{label}</p>
                <div
                  className="relative mx-auto w-12 h-12 rounded-full border-2 border-white/15 overflow-hidden cursor-pointer"
                  style={{ backgroundColor: form[key] }}
                >
                  <input
                    type="color"
                    value={form[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
                <input
                  type="text"
                  value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  className="glass-input mt-2 text-center text-[10px] px-1 py-1.5"
                  maxLength={7}
                />
              </div>
            ))}
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={saving}
          whileTap={{ scale: 0.98 }}
          className="shimmer-btn w-full relative overflow-hidden"
        >
          <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-gold/10 to-transparent pointer-events-none" />
          {savedOk ? (
            <span className="flex items-center gap-2 text-green-400">✓ Configuration sauvegardée</span>
          ) : (
            <span className="flex items-center gap-2">
              <Save size={15} />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </span>
          )}
        </motion.button>
      </form>
    </div>
  );
}

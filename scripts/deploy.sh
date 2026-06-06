#!/usr/bin/env bash
set -e

# ---------------------------------------------------------------------------
# Ariane Promo Builder — deploy script
# Targets: /var/www/ariane-promo-builder  |  PM2: ariane-promo  |  Port: 3042
#
# Safe to run multiple times (idempotent).
# Does NOT touch: gameone, ariane, gameone-public, Nginx, ecosystem.config.js
# ---------------------------------------------------------------------------

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "  Déploiement Ariane Promo Builder — $(date)"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

APP_DIR="/var/www/ariane-promo-builder"

# ── 1. Move to app directory ────────────────────────────────────────────────
echo "→ Répertoire : $APP_DIR"
cd "$APP_DIR"

# ── 2. Pull latest code ─────────────────────────────────────────────────────
echo ""
echo "→ Mise à jour du code (git pull)…"
git pull origin main

# ── 3. Install server dependencies (production only) ────────────────────────
echo ""
echo "→ Installation des dépendances serveur…"
npm install --production

# ── 4. Build client ─────────────────────────────────────────────────────────
echo ""
echo "→ Build client React…"
cd client
npm install
npm run build
cd ..

# ── 5. Restart ONLY ariane-promo — no other process is touched ──────────────
echo ""
echo "→ Redémarrage PM2 : ariane-promo…"
pm2 restart ariane-promo --update-env

# ── 6. Persist PM2 process list ─────────────────────────────────────────────
pm2 save

# ── 7. Confirmation ─────────────────────────────────────────────────────────
echo ""
echo "✔  Déploiement terminé avec succès."
echo ""
pm2 status ariane-promo

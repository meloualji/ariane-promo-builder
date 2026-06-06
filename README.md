# Ariane Promo Builder

Internal PWA for Ariane Cosmetics (Fès, Morocco) — create luxury promotional visuals for Story/Reel/Post formats in under 2 minutes, directly from a phone browser.

## Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + SQLite (better-sqlite3)
- **Export**: Puppeteer (server-side PNG rendering)
- **Port**: 3042

---

## Local Development

```bash
# Install all dependencies
npm run install:all

# Start dev server (client + server concurrently)
npm run dev
```

Client dev server: http://localhost:5173 (proxies /api to :3042)
API server: http://localhost:3042

---

## Production Build & Deploy (Hostinger VPS)

> **⚠️ VPS coexistence rules — read before touching the server**
> - This app uses port **3042** exclusively. Never change it.
> - PM2 process name is **`ariane-promo`** — the only process this repo manages.
> - Do **not** modify `gameone` (port 3001), `ariane` (port 3004), or the n8n/Traefik Docker stack.
> - Do **not** edit existing Nginx server blocks — only add the new block shown below.
> - `pm2 save` / `pm2 startup` persist the full process list — only run `pm2 startup` once per server if it isn't already configured.

### Prerequisites

```bash
# Node.js 20+ (skip if already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 (skip if already installed)
npm install -g pm2

# System Chromium — used by Puppeteer for PNG export
sudo apt-get install -y chromium-browser
# On some Debian/Ubuntu versions the package is just 'chromium':
# sudo apt-get install -y chromium
```

### Deploy

```bash
# Clone into the dedicated path
git clone https://github.com/meloualji/ariane-promo-builder.git /var/www/ariane-promo-builder
cd /var/www/ariane-promo-builder

# Install all dependencies (server + client)
npm run install:all

# Build React client
npm run build

# Start the ariane-promo process only — do NOT use 'pm2 start' on other ecosystem files
pm2 start ecosystem.config.js
pm2 save

# Only run the line below if PM2 startup is NOT already configured on this server:
# pm2 startup
```

> **Puppeteer + system Chromium**: by default `puppeteer` downloads its own Chromium during
> `npm install`. On a shared VPS you can save disk space by pointing it at the system binary:
> ```bash
> # Find the path first:
> which chromium-browser || which chromium
> # Then set it in ecosystem.config.js env block:
> # PUPPETEER_EXECUTABLE_PATH: '/usr/bin/chromium-browser'
> ```

### Update deployment

```bash
cd /var/www/ariane-promo-builder
git pull origin main
npm run install:all
npm run build
pm2 restart ariane-promo   # restarts THIS process only
```

---

## Nginx Configuration

> **ADD this as a new server block** — do not edit or replace any existing blocks.  
> Create a new file: `/etc/nginx/sites-available/ariane-promo`

```nginx
# /etc/nginx/sites-available/ariane-promo
# Ariane Promo Builder — port 3042
# Suggested domain: promo.ariane-cosmetics.com

server {
    listen 80;
    server_name promo.ariane-cosmetics.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name promo.ariane-cosmetics.com;

    ssl_certificate     /etc/letsencrypt/live/promo.ariane-cosmetics.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/promo.ariane-cosmetics.com/privkey.pem;

    client_max_body_size 50M;

    location / {
        proxy_pass         http://127.0.0.1:3042;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
    }
}
```

Enable and reload (without touching existing blocks):

```bash
# Enable the new site
ln -s /etc/nginx/sites-available/ariane-promo /etc/nginx/sites-enabled/

# Test config — fix any errors before reloading
nginx -t

# Reload only if test passes
systemctl reload nginx

# Get SSL certificate (new domain only)
certbot --nginx -d promo.ariane-cosmetics.com
```

---

## PWA — Add to Home Screen

- **Android Chrome**: Menu → "Add to Home screen"
- **iOS Safari**: Share → "Add to Home Screen"

The app works offline for the UI; export requires internet connection to the server.

---

## Project Structure

```
ariane-promo-builder/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── BrandConfig.jsx     # Screen 1 — brand setup
│   │   │   ├── PromoEditor.jsx     # Screen 2 — promo creation
│   │   │   ├── LivePreview.jsx     # Screen 3 — live 9:16 preview
│   │   │   ├── ExportButtons.jsx   # Screen 4 — PNG export
│   │   │   └── PromoItemCard.jsx   # Animated service card
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── public/
│       ├── manifest.json
│       └── sw.js
├── server/
│   ├── index.js            # Express app
│   ├── db.js               # SQLite init
│   └── routes/
│       ├── config.js       # GET/POST brand config
│       └── export.js       # Puppeteer PNG export
├── ecosystem.config.js     # PM2 config (port 3042)
└── package.json
```

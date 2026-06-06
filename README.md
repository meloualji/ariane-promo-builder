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

### Prerequisites

```bash
# Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2
npm install -g pm2

# Chromium for Puppeteer
sudo apt-get install -y chromium-browser
```

### Deploy

```bash
# Clone and install
git clone https://github.com/meloualji/ariane-promo-builder.git /var/www/ariane-promo-builder
cd /var/www/ariane-promo-builder
npm run install:all

# Build client
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Update deployment

```bash
cd /var/www/ariane-promo-builder
git pull origin main
npm run install:all
npm run build
pm2 restart ariane-promo
```

---

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name ariane.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ariane.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/ariane.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ariane.yourdomain.com/privkey.pem;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3042;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
    }
}
```

> Replace `ariane.yourdomain.com` with your actual domain.  
> Get SSL cert: `certbot --nginx -d ariane.yourdomain.com`

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

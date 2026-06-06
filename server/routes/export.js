const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const router = express.Router();

function generatePromoHTML(data, width, height) {
  const { config, promo } = data;
  const goldColor = config.secondary_color || '#c9a84c';
  const accentColor = config.accent_color || '#c4607a';
  const primaryColor = config.primary_color || '#0d0d0d';

  const bgStyle = promo.background_type === 'photo' && promo.background_url
    ? `background-image: url('${promo.background_url}'); background-size: cover; background-position: center;`
    : `background: linear-gradient(135deg, ${primaryColor} 0%, #0a0f1e 50%, #111 100%);`;

  const itemsHTML = (promo.items || []).map(item => {
    const discount = item.original_price && item.promo_price
      ? Math.round((1 - item.promo_price / item.original_price) * 100)
      : null;

    return `
      <div style="
        position: relative;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(201,168,76,0.4);
        border-radius: 8px;
        padding: ${Math.round(height * 0.018)}px ${Math.round(width * 0.05)}px;
        margin: ${Math.round(height * 0.008)}px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        overflow: hidden;
      ">
        <div style="
          position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
          background: linear-gradient(to bottom, ${goldColor}, ${accentColor});
        "></div>
        <div style="flex: 1; padding-left: ${Math.round(width * 0.03)}px;">
          <div style="
            font-family: 'Cinzel', serif;
            font-size: ${Math.round(height * 0.022)}px;
            color: white;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 600;
          ">${item.service_name || ''}</div>
          ${item.original_price ? `
          <div style="
            font-family: 'Cormorant Garamond', serif;
            font-size: ${Math.round(height * 0.018)}px;
            color: ${accentColor};
            opacity: 0.7;
            text-decoration: line-through;
            margin-top: 2px;
          ">${item.original_price} DH</div>` : ''}
        </div>
        <div style="display: flex; align-items: center; gap: ${Math.round(width * 0.025)}px;">
          ${discount ? `
          <div style="
            background: #8b2040;
            color: white;
            font-family: 'Cinzel', serif;
            font-size: ${Math.round(height * 0.014)}px;
            padding: 3px 10px;
            border-radius: 20px;
            font-weight: 600;
            white-space: nowrap;
          ">-${discount}%</div>` : ''}
          <div style="
            font-family: 'Cormorant Garamond', serif;
            font-size: ${Math.round(height * 0.038)}px;
            font-weight: 700;
            color: ${goldColor};
            text-shadow: 0 0 20px rgba(201,168,76,0.5);
            white-space: nowrap;
          ">${item.promo_price || ''} <span style="font-size:${Math.round(height * 0.022)}px">DH</span></div>
        </div>
      </div>
    `;
  }).join('');

  const whatsappSVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='${Math.round(height * 0.022)}' height='${Math.round(height * 0.022)}' fill='%2325D366'><path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'/></svg>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: ${width}px; height: ${height}px; overflow: hidden; }
  .canvas {
    width: ${width}px; height: ${height}px;
    position: relative;
    ${bgStyle}
    display: flex; flex-direction: column;
    align-items: center;
  }
  .canvas::before {
    content: '';
    position: absolute; inset: 0;
    background: ${promo.background_type === 'photo' ? 'rgba(0,0,0,0.55)' : 'transparent'};
    z-index: 0;
  }
  .content {
    position: relative; z-index: 1;
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: center;
    padding: ${Math.round(height * 0.04)}px ${Math.round(width * 0.07)}px;
  }
  /* Corner accents */
  .corner { position: absolute; z-index: 2; }
  .corner-tl { top: 20px; left: 20px; border-top: 1px solid ${goldColor}; border-left: 1px solid ${goldColor}; width: 28px; height: 28px; }
  .corner-tr { top: 20px; right: 20px; border-top: 1px solid ${goldColor}; border-right: 1px solid ${goldColor}; width: 28px; height: 28px; }
  .corner-bl { bottom: 20px; left: 20px; border-bottom: 1px solid ${goldColor}; border-left: 1px solid ${goldColor}; width: 28px; height: 28px; }
  .corner-br { bottom: 20px; right: 20px; border-bottom: 1px solid ${goldColor}; border-right: 1px solid ${goldColor}; width: 28px; height: 28px; }
  .gold-line { width: 100%; height: 1px; background: linear-gradient(to right, transparent, ${goldColor}, transparent); margin: ${Math.round(height * 0.012)}px 0; }
</style>
</head>
<body>
<div class="canvas">
  <div class="corner corner-tl"></div>
  <div class="corner corner-tr"></div>
  <div class="corner corner-bl"></div>
  <div class="corner corner-br"></div>

  <div class="content">
    <!-- Logo -->
    ${config.logo_url ? `
    <div style="
      width: ${Math.round(width * 0.22)}px; height: ${Math.round(width * 0.22)}px;
      border-radius: 50%;
      border: 1.5px solid rgba(201,168,76,0.6);
      overflow: hidden;
      margin-bottom: ${Math.round(height * 0.015)}px;
      flex-shrink: 0;
    ">
      <img src="${config.logo_url}" style="width:100%;height:100%;object-fit:cover;" />
    </div>` : ''}

    <!-- Brand name -->
    <div style="
      font-family: 'Cinzel', serif;
      font-size: ${Math.round(height * 0.012)}px;
      letter-spacing: 6px;
      color: rgba(201,168,76,0.5);
      text-transform: uppercase;
      margin-bottom: ${Math.round(height * 0.01)}px;
    ">${config.brand_name || 'ARIANE COSMETICS'}</div>

    <div class="gold-line"></div>

    <!-- Headline -->
    <div style="
      font-family: 'Cinzel', serif;
      font-size: ${Math.round(height * 0.048)}px;
      color: ${goldColor};
      letter-spacing: 4px;
      text-align: center;
      text-transform: uppercase;
      font-weight: 700;
      margin: ${Math.round(height * 0.015)}px 0 ${Math.round(height * 0.008)}px;
      line-height: 1.2;
    ">${promo.title || ''}</div>

    ${promo.subtitle ? `
    <div style="
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: ${Math.round(height * 0.026)}px;
      color: ${accentColor};
      text-align: center;
      margin-bottom: ${Math.round(height * 0.01)}px;
      letter-spacing: 1px;
    ">${promo.subtitle}</div>` : ''}

    <div class="gold-line"></div>

    <!-- Items -->
    <div style="width: 100%; flex: 1; margin: ${Math.round(height * 0.012)}px 0; overflow: hidden;">
      ${itemsHTML}
    </div>

    <!-- Spacer -->
    <div style="flex: 1;"></div>

    <div class="gold-line"></div>

    <!-- WhatsApp -->
    ${promo.phone ? `
    <div style="
      display: flex; align-items: center; gap: 8px;
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: ${Math.round(height * 0.02)}px;
      color: ${goldColor};
      margin: ${Math.round(height * 0.01)}px 0;
    ">
      <img src="data:image/svg+xml,${whatsappSVG}" style="width:${Math.round(height * 0.022)}px;height:${Math.round(height * 0.022)}px;" />
      ${promo.phone}
    </div>` : ''}

    <!-- Tagline -->
    ${promo.tagline ? `
    <div style="
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: ${Math.round(height * 0.017)}px;
      color: rgba(201,168,76,0.7);
      text-align: center;
      letter-spacing: 1px;
      margin-bottom: ${Math.round(height * 0.008)}px;
    ">${promo.tagline}</div>` : ''}

    <!-- Footer -->
    <div style="
      font-family: 'Cinzel', serif;
      font-size: ${Math.round(height * 0.01)}px;
      letter-spacing: 5px;
      color: rgba(201,168,76,0.4);
      text-transform: uppercase;
      margin-top: ${Math.round(height * 0.006)}px;
    ">ARIANE COSMETICS · FÈS</div>
  </div>
</div>
</body>
</html>`;
}

async function renderToPNG(html, width, height) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 500));
    const buffer = await page.screenshot({ type: 'png' });
    return buffer;
  } finally {
    await browser.close();
  }
}

router.post('/story', async (req, res) => {
  try {
    const html = generatePromoHTML(req.body, 1080, 1920);
    const buffer = await renderToPNG(html, 1080, 1920);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="ariane-promo-${date}.png"`);
    res.send(buffer);
  } catch (err) {
    console.error('Export story error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/post', async (req, res) => {
  try {
    const html = generatePromoHTML(req.body, 1080, 1080);
    const buffer = await renderToPNG(html, 1080, 1080);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="ariane-promo-post-${date}.png"`);
    res.send(buffer);
  } catch (err) {
    console.error('Export post error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

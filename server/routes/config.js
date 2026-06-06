const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../db');

const router = express.Router();

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, `logo-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', (req, res) => {
  const db = getDb();
  const config = db.prepare('SELECT * FROM brand_config WHERE id = 1').get();
  res.json(config || {});
});

router.post('/', upload.single('logo'), (req, res) => {
  const db = getDb();
  const body = req.body;

  const current = db.prepare('SELECT * FROM brand_config WHERE id = 1').get();

  const updates = {
    logo_size: body.logo_size || current.logo_size,
    logo_position: body.logo_position || current.logo_position,
    primary_color: body.primary_color || current.primary_color,
    secondary_color: body.secondary_color || current.secondary_color,
    accent_color: body.accent_color || current.accent_color,
    phone: body.phone !== undefined ? body.phone : current.phone,
    tagline: body.tagline !== undefined ? body.tagline : current.tagline,
    brand_name: body.brand_name !== undefined ? body.brand_name : current.brand_name,
    logo_url: req.file ? `/uploads/${req.file.filename}` : current.logo_url,
  };

  db.prepare(`
    UPDATE brand_config SET
      logo_url = ?, logo_size = ?, logo_position = ?,
      primary_color = ?, secondary_color = ?, accent_color = ?,
      phone = ?, tagline = ?, brand_name = ?
    WHERE id = 1
  `).run(
    updates.logo_url, updates.logo_size, updates.logo_position,
    updates.primary_color, updates.secondary_color, updates.accent_color,
    updates.phone, updates.tagline, updates.brand_name
  );

  const saved = db.prepare('SELECT * FROM brand_config WHERE id = 1').get();
  res.json(saved);
});

module.exports = router;

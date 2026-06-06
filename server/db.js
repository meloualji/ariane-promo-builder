const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'ariane.db');

let db;

function initDb() {
  db = new Database(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS brand_config (
      id INTEGER PRIMARY KEY DEFAULT 1,
      logo_url TEXT,
      logo_size TEXT DEFAULT 'medium',
      logo_position TEXT DEFAULT 'top-center',
      primary_color TEXT DEFAULT '#0d0d0d',
      secondary_color TEXT DEFAULT '#c9a84c',
      accent_color TEXT DEFAULT '#c4607a',
      phone TEXT DEFAULT '',
      tagline TEXT DEFAULT 'Offre limitée · Sur rendez-vous',
      brand_name TEXT DEFAULT 'ARIANE COSMETICS'
    )
  `);

  // Insert default row if not exists
  const existing = db.prepare('SELECT id FROM brand_config WHERE id = 1').get();
  if (!existing) {
    db.prepare('INSERT INTO brand_config (id) VALUES (1)').run();
  }

  console.log('Database initialized');
}

function getDb() {
  return db;
}

module.exports = { initDb, getDb };

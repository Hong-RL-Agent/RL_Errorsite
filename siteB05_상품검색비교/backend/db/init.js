const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'comparelab.db');

const TABLES = [
  'activity_log', 'view_history', 'search_history', 'comparison_products', 'comparisons',
  'reviews', 'product_images', 'price_history', 'price_offers', 'product_specs',
  'products', 'users', 'brands', 'categories',
];

const SCHEMA = `
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, icon TEXT, sort_order INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL, country TEXT
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, joined_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY, category_id INTEGER NOT NULL, brand_id INTEGER NOT NULL,
  name TEXT NOT NULL, model TEXT NOT NULL, summary TEXT NOT NULL,
  price INTEGER NOT NULL, popularity INTEGER NOT NULL, rating REAL NOT NULL, review_count INTEGER NOT NULL,
  pros TEXT NOT NULL, cons TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS product_specs (
  id INTEGER PRIMARY KEY, product_id INTEGER NOT NULL, spec_key TEXT NOT NULL, label TEXT NOT NULL,
  value_text TEXT NOT NULL, value_num REAL, sort_order INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS price_offers (
  id INTEGER PRIMARY KEY, product_id INTEGER NOT NULL, seller TEXT NOT NULL, price INTEGER NOT NULL,
  shipping INTEGER NOT NULL, in_stock INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY, product_id INTEGER NOT NULL, recorded_on TEXT NOT NULL, price INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY, product_id INTEGER NOT NULL, position INTEGER NOT NULL, label TEXT NOT NULL,
  color_a TEXT NOT NULL, color_b TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY, product_id INTEGER NOT NULL, user_id INTEGER NOT NULL, rating INTEGER NOT NULL,
  title TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS comparisons (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL,
  saved INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS comparison_products (
  comparison_id INTEGER NOT NULL REFERENCES comparisons(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL, position INTEGER NOT NULL,
  PRIMARY KEY (comparison_id, product_id)
);
CREATE TABLE IF NOT EXISTS search_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, keyword TEXT NOT NULL,
  result_count INTEGER NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS view_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, product_id INTEGER NOT NULL, viewed_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, type TEXT NOT NULL, detail TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_specs_product ON product_specs(product_id, spec_key);
CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id, position);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
`;

let db = null;

function getDb() {
  if (!db) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function createSchema(conn = getDb()) {
  conn.exec(SCHEMA);
}

function dropSchema(conn = getDb()) {
  conn.pragma('foreign_keys = OFF');
  TABLES.forEach((t) => conn.exec(`DROP TABLE IF EXISTS ${t}`));
  conn.pragma('foreign_keys = ON');
}

module.exports = { getDb, createSchema, dropSchema, DB_PATH };

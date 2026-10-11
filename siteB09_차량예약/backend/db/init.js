const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'roamdrive.db');

const TABLES = [
  'activity_log', 'maintenance_records', 'return_records', 'pickup_records', 'itinerary_options', 'itineraries',
  'rate_policies', 'extras', 'vehicles', 'vehicle_models', 'drivers', 'depots',
];

const SCHEMA = `
CREATE TABLE IF NOT EXISTS depots (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL, address TEXT NOT NULL, hours TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS drivers (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, license_no TEXT NOT NULL, tier TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS vehicle_models (
  id INTEGER PRIMARY KEY, make TEXT NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL, seats INTEGER NOT NULL, fuel TEXT NOT NULL,
  transmission TEXT NOT NULL, base_daily INTEGER NOT NULL, specs TEXT NOT NULL, image_count INTEGER NOT NULL, color TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY, model_id INTEGER NOT NULL, plate TEXT NOT NULL, depot_id INTEGER NOT NULL, odometer INTEGER NOT NULL,
  status TEXT NOT NULL, daily_rate INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS extras (
  id INTEGER PRIMARY KEY, code TEXT NOT NULL, kind TEXT NOT NULL, name TEXT NOT NULL, description TEXT NOT NULL,
  price INTEGER NOT NULL, unit TEXT NOT NULL, recommended INTEGER NOT NULL, included INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS rate_policies (
  id INTEGER PRIMARY KEY, kind TEXT NOT NULL, category TEXT NOT NULL, name TEXT NOT NULL,
  start_date TEXT, end_date TEXT, min_days INTEGER, value REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS itineraries (
  id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL, driver_id INTEGER NOT NULL, vehicle_id INTEGER NOT NULL,
  pickup_depot_id INTEGER NOT NULL, return_depot_id INTEGER NOT NULL, start_at TEXT NOT NULL, end_at TEXT NOT NULL,
  status TEXT NOT NULL, total_amount INTEGER NOT NULL, renter_name TEXT NOT NULL, renter_phone TEXT NOT NULL,
  renter_email TEXT NOT NULL, renter_license TEXT NOT NULL, cancel_reason TEXT,
  picked_up_at TEXT, returned_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS itinerary_options (
  itinerary_id INTEGER NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE, extra_id INTEGER NOT NULL, qty INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (itinerary_id, extra_id)
);
CREATE TABLE IF NOT EXISTS pickup_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT, itinerary_id INTEGER NOT NULL, vehicle_id INTEGER NOT NULL, odometer INTEGER NOT NULL,
  fuel_level INTEGER NOT NULL, picked_up_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS return_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT, itinerary_id INTEGER NOT NULL, vehicle_id INTEGER NOT NULL, odometer INTEGER NOT NULL,
  fuel_level INTEGER NOT NULL, damage_note TEXT NOT NULL, returned_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS maintenance_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT, vehicle_id INTEGER NOT NULL, kind TEXT NOT NULL, performed_at TEXT NOT NULL, cost INTEGER NOT NULL, note TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT, driver_id INTEGER NOT NULL, action TEXT NOT NULL, detail TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_itin_vehicle ON itineraries(vehicle_id, status, start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_itin_driver ON itineraries(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_depot ON vehicles(depot_id);
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
const createSchema = (conn = getDb()) => conn.exec(SCHEMA);
function dropSchema(conn = getDb()) {
  conn.pragma('foreign_keys = OFF');
  TABLES.forEach((t) => conn.exec(`DROP TABLE IF EXISTS ${t}`));
  conn.pragma('foreign_keys = ON');
}

module.exports = { getDb, createSchema, dropSchema, DB_PATH };

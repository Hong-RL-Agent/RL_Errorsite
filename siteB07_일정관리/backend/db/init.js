const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'daynest.db');

const TABLES = [
  'activity_log', 'notifications', 'event_deletions', 'event_revisions', 'notes', 'tasks',
  'events', 'recurring_events', 'categories', 'users',
];

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, color TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS recurring_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
  rule TEXT NOT NULL, occurrences INTEGER NOT NULL, start_date TEXT NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '', category_id INTEGER NOT NULL, reminder TEXT NOT NULL DEFAULT 'none',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
  start_date TEXT NOT NULL, end_date TEXT NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '', category_id INTEGER NOT NULL, color TEXT NOT NULL,
  repeat_rule TEXT NOT NULL DEFAULT 'none', reminder TEXT NOT NULL DEFAULT 'none',
  status TEXT NOT NULL DEFAULT 'scheduled', deleted INTEGER NOT NULL DEFAULT 0, recurring_id INTEGER,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, title TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0,
  due_date TEXT, priority TEXT NOT NULL DEFAULT 'normal', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER NOT NULL, user_id INTEGER NOT NULL, body TEXT NOT NULL,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS event_revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER NOT NULL, user_id INTEGER NOT NULL, field TEXT NOT NULL,
  before_value TEXT, after_value TEXT, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS event_deletions (
  id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER NOT NULL, user_id INTEGER NOT NULL, title TEXT NOT NULL, deleted_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, event_id INTEGER NOT NULL, message TEXT NOT NULL,
  remind_at TEXT NOT NULL, is_read INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, type TEXT NOT NULL, detail TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_range ON events(user_id, deleted, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_notes_event ON notes(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id, done);
`;

let db = null;
function getDb() {
  if (!db) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}
const createSchema = (conn = getDb()) => conn.exec(SCHEMA);
const dropSchema = (conn = getDb()) => TABLES.forEach((t) => conn.exec(`DROP TABLE IF EXISTS ${t}`));

module.exports = { getDb, createSchema, dropSchema, DB_PATH };

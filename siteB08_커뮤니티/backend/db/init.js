const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "..", "data", "threadgarden.sqlite");

function openDb() { return new sqlite3.Database(dbPath); }
function run(db, sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve(this); })); }
function all(db, sql, params = []) { return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))); }
function get(db, sql, params = []) { return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); }

async function createSchema(db) {
  await run(db, "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, handle TEXT, joinedAt TEXT)");
  await run(db, "CREATE TABLE IF NOT EXISTS boards (id TEXT PRIMARY KEY, name TEXT, description TEXT)");
  await run(db, `CREATE TABLE IF NOT EXISTS threads (
    id TEXT PRIMARY KEY, boardId TEXT, userId INTEGER, title TEXT, body TEXT, tags TEXT,
    solved INTEGER, recommendCount INTEGER, bookmarkCount INTEGER, createdAt TEXT, updatedAt TEXT, deleted INTEGER DEFAULT 0
  )`);
  await run(db, "CREATE TABLE IF NOT EXISTS replies (id TEXT PRIMARY KEY, threadId TEXT, parentId TEXT, userId INTEGER, body TEXT, createdAt TEXT, updatedAt TEXT, deleted INTEGER DEFAULT 0)");
  await run(db, "CREATE TABLE IF NOT EXISTS recommendations (id TEXT PRIMARY KEY, userId INTEGER, threadId TEXT, createdAt TEXT)");
  await run(db, "CREATE TABLE IF NOT EXISTS bookmarks (id TEXT PRIMARY KEY, userId INTEGER, threadId TEXT, createdAt TEXT)");
  await run(db, "CREATE TABLE IF NOT EXISTS drafts (id TEXT PRIMARY KEY, userId INTEGER, boardId TEXT, title TEXT, body TEXT, tags TEXT, updatedAt TEXT)");
  await run(db, "CREATE TABLE IF NOT EXISTS resolve_logs (id TEXT PRIMARY KEY, threadId TEXT, userId INTEGER, createdAt TEXT)");
  await run(db, "CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, userId INTEGER, message TEXT, read INTEGER, createdAt TEXT)");
  await run(db, "CREATE TABLE IF NOT EXISTS activity (id TEXT PRIMARY KEY, userId INTEGER, message TEXT, createdAt TEXT)");
}

async function clearData(db) {
  for (const table of ["activity", "notifications", "resolve_logs", "drafts", "bookmarks", "recommendations", "replies", "threads", "boards", "users"]) {
    await run(db, `DELETE FROM ${table}`);
  }
}

module.exports = { openDb, run, all, get, createSchema, clearData };

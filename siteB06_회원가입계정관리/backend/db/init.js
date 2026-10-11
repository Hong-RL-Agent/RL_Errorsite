const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "..", "data", "accountflow.sqlite");

function openDb() {
  return new sqlite3.Database(dbPath);
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function done(error) {
    if (error) reject(error);
    else resolve(this);
  }));
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)));
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

async function createSchema(db) {
  await run(db, `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY, accountId TEXT UNIQUE, email TEXT UNIQUE, passwordHash TEXT,
    name TEXT, joinedAt TEXT, status TEXT, sessionToken TEXT
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS profiles (
    userId INTEGER PRIMARY KEY, nickname TEXT, phone TEXT, avatar TEXT, bio TEXT
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS signup_progress (
    id TEXT PRIMARY KEY, email TEXT, accountId TEXT, name TEXT, passwordHash TEXT, step TEXT, payload TEXT, createdAt TEXT, updatedAt TEXT
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS verifications (
    id TEXT PRIMARY KEY, signupId TEXT, email TEXT, code TEXT, attempts INTEGER, expiresAt TEXT, status TEXT, createdAt TEXT
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS settings (
    userId INTEGER PRIMARY KEY, emailNotifications INTEGER, productNews INTEGER, publicProfile INTEGER, locale TEXT, timezone TEXT
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS profile_changes (
    id TEXT PRIMARY KEY, userId INTEGER, field TEXT, beforeValue TEXT, afterValue TEXT, createdAt TEXT
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY, userId INTEGER, message TEXT, read INTEGER, createdAt TEXT
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS activity (
    id TEXT PRIMARY KEY, userId INTEGER, message TEXT, createdAt TEXT
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS onboarding (
    id TEXT PRIMARY KEY, sortOrder INTEGER, eyebrow TEXT, title TEXT, body TEXT
  )`);
}

async function clearData(db) {
  for (const table of ["onboarding", "activity", "notifications", "profile_changes", "settings", "verifications", "signup_progress", "profiles", "users"]) {
    await run(db, `DELETE FROM ${table}`);
  }
}

module.exports = { openDb, run, all, get, createSchema, clearData };

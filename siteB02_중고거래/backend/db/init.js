const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "..", "data", "remarket.sqlite");

function openDb() {
  return new sqlite3.Database(dbPath);
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) reject(error);
      else resolve(this);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

async function createSchema(db) {
  await run(db, "PRAGMA foreign_keys = ON");
  await run(db, `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    avatar TEXT NOT NULL,
    trustScore INTEGER NOT NULL,
    soldCount INTEGER NOT NULL
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    region TEXT NOT NULL,
    sellerId INTEGER NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    favoriteCount INTEGER NOT NULL,
    createdAt TEXT NOT NULL
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY,
    userId INTEGER NOT NULL,
    productId TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    productId TEXT NOT NULL,
    buyerId INTEGER NOT NULL,
    sellerId INTEGER NOT NULL,
    meetAt TEXT NOT NULL,
    memo TEXT NOT NULL,
    status TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    reservationId TEXT NOT NULL,
    productId TEXT NOT NULL,
    buyerId INTEGER NOT NULL,
    sellerId INTEGER NOT NULL,
    price INTEGER NOT NULL,
    status TEXT NOT NULL,
    completedAt TEXT
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    productId TEXT NOT NULL,
    buyerId INTEGER NOT NULL,
    sellerId INTEGER NOT NULL,
    updatedAt TEXT NOT NULL
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    chatId TEXT NOT NULL,
    senderId INTEGER NOT NULL,
    body TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    userId INTEGER NOT NULL,
    message TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    read INTEGER NOT NULL
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS activity (
    id TEXT PRIMARY KEY,
    userId INTEGER NOT NULL,
    message TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )`);
}

async function clearData(db) {
  for (const table of ["activity", "notifications", "messages", "chats", "transactions", "reservations", "favorites", "products", "users"]) {
    await run(db, `DELETE FROM ${table}`);
  }
}

module.exports = { openDb, run, all, get, createSchema, clearData };

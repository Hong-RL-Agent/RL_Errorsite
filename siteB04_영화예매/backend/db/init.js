const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "..", "data", "cinewave.sqlite");

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
  await run(db, `CREATE TABLE IF NOT EXISTS movies (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, genre TEXT NOT NULL, runtime INTEGER NOT NULL,
    rating TEXT NOT NULL, synopsis TEXT NOT NULL, releaseDate TEXT NOT NULL, poster TEXT NOT NULL, status TEXT NOT NULL
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS theaters (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL, address TEXT NOT NULL
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS screens (
    id TEXT PRIMARY KEY, theaterId TEXT NOT NULL, name TEXT NOT NULL, screenType TEXT NOT NULL
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS showtimes (
    id TEXT PRIMARY KEY, movieId TEXT NOT NULL, theaterId TEXT NOT NULL, screenId TEXT NOT NULL, startsAt TEXT NOT NULL
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS seats (
    id TEXT PRIMARY KEY, screenId TEXT NOT NULL, rowLabel TEXT NOT NULL, seatNumber INTEGER NOT NULL, seatLabel TEXT NOT NULL, price INTEGER NOT NULL
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, grade TEXT NOT NULL
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY, customerId INTEGER NOT NULL, showtimeId TEXT NOT NULL, status TEXT NOT NULL,
    totalPrice INTEGER NOT NULL, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, deleted INTEGER NOT NULL DEFAULT 0
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS booking_seats (
    bookingId TEXT NOT NULL, seatId TEXT NOT NULL, PRIMARY KEY (bookingId, seatId)
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS seat_change_logs (
    id TEXT PRIMARY KEY, bookingId TEXT NOT NULL, fromSeats TEXT NOT NULL, toSeats TEXT NOT NULL, createdAt TEXT NOT NULL
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS cancellation_logs (
    id TEXT PRIMARY KEY, bookingId TEXT NOT NULL, reason TEXT NOT NULL, createdAt TEXT NOT NULL
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY, customerId INTEGER NOT NULL, message TEXT NOT NULL, read INTEGER NOT NULL, createdAt TEXT NOT NULL
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS activity (
    id TEXT PRIMARY KEY, customerId INTEGER NOT NULL, message TEXT NOT NULL, createdAt TEXT NOT NULL
  )`);
}

async function clearData(db) {
  for (const table of ["activity", "notifications", "cancellation_logs", "seat_change_logs", "booking_seats", "bookings", "customers", "seats", "showtimes", "screens", "theaters", "movies"]) {
    await run(db, `DELETE FROM ${table}`);
  }
}

module.exports = { openDb, run, all, get, createSchema, clearData };

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { INITIAL_USERS } = require('./seed');

const DB_PATH = path.join(__dirname, 'admindesk.db');
const db = new sqlite3.Database(DB_PATH);

function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('ADMIN', 'MANAGER', 'USER')),
          is_active INTEGER NOT NULL,
          department TEXT,
          last_login TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action TEXT NOT NULL,
          target_user_id INTEGER,
          target_user_name TEXT,
          admin_user TEXT NOT NULL,
          timestamp TEXT NOT NULL
        )
      `);

      db.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
        if (err) return reject(err);
        if (row.count === 0) {
          seedDb().then(resolve).catch(reject);
        } else {
          resolve();
        }
      });
    });
  });
}

function seedDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`DELETE FROM users`);
      db.run(`DELETE FROM audit_logs`);

      const stmt = db.prepare(`
        INSERT INTO users (id, name, email, role, is_active, department, last_login, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const u of INITIAL_USERS) {
        stmt.run(
          u.id,
          u.name,
          u.email,
          u.role,
          u.is_active,
          u.department,
          u.last_login,
          u.created_at,
          u.updated_at
        );
      }

      stmt.finalize((err) => {
        if (err) return reject(err);

        // Seed initial audit log
        db.run(
          `INSERT INTO audit_logs (action, target_user_id, target_user_name, admin_user, timestamp)
           VALUES ('SYSTEM_INIT', 105, 'Elena Vance', 'System Root', '2026-03-01T00:00:00.000Z')`,
          (err2) => {
            if (err2) reject(err2);
            else resolve();
          }
        );
      });
    });
  });
}

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

module.exports = {
  db,
  initDb,
  seedDb,
  query,
  get,
  run
};

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { INITIAL_FOLDERS, INITIAL_FILES } = require('./seed');

const DB_PATH = path.join(__dirname, 'cloudfiles.db');
const db = new sqlite3.Database(DB_PATH);

// Initialize DB schema & initial seed data
function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS folders (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          parent_id TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS files (
          id TEXT PRIMARY KEY,
          name VARCHAR(30) NOT NULL,
          folder_id TEXT NOT NULL,
          size INTEGER NOT NULL,
          mime_type TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          file_order INTEGER NOT NULL
        )
      `);

      // Check if folders table is empty
      db.get(`SELECT COUNT(*) as count FROM folders`, (err, row) => {
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
      db.run(`DELETE FROM folders`);
      db.run(`DELETE FROM files`);

      const stmtFolder = db.prepare(`
        INSERT INTO folders (id, name, parent_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const folder of INITIAL_FOLDERS) {
        stmtFolder.run(folder.id, folder.name, folder.parentId, folder.createdAt, folder.updatedAt);
      }
      stmtFolder.finalize();

      const stmtFile = db.prepare(`
        INSERT INTO files (id, name, folder_id, size, mime_type, created_at, updated_at, file_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const file of INITIAL_FILES) {
        stmtFile.run(
          file.id,
          file.name,
          file.folderId,
          file.size,
          file.mimeType,
          file.createdAt,
          file.updatedAt,
          file.order
        );
      }
      stmtFile.finalize((err) => {
        if (err) reject(err);
        else resolve();
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

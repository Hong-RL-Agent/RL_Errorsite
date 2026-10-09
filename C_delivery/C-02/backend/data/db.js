const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { INITIAL_ASSIGNEES, INITIAL_TASKS } = require('./seed');

const DB_PATH = path.join(__dirname, 'flowdesk.db');
const db = new sqlite3.Database(DB_PATH);

function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS assignees (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          avatar_color TEXT NOT NULL
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL CHECK(status IN ('TODO', 'IN_PROGRESS', 'DONE')),
          priority TEXT NOT NULL CHECK(priority IN ('HIGH', 'MEDIUM', 'LOW')),
          assignee_id INTEGER,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          is_deleted INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (assignee_id) REFERENCES assignees(id)
        )
      `);

      db.get(`SELECT COUNT(*) as count FROM tasks`, (err, row) => {
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
      db.run(`DELETE FROM tasks`);
      db.run(`DELETE FROM assignees`);

      const stmtAssignee = db.prepare(`
        INSERT INTO assignees (id, name, role, avatar_color)
        VALUES (?, ?, ?, ?)
      `);

      for (const a of INITIAL_ASSIGNEES) {
        stmtAssignee.run(a.id, a.name, a.role, a.avatarColor);
      }
      stmtAssignee.finalize();

      const stmtTask = db.prepare(`
        INSERT INTO tasks (id, title, description, status, priority, assignee_id, created_at, updated_at, is_deleted)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const t of INITIAL_TASKS) {
        stmtTask.run(
          t.id,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.assignee_id,
          t.created_at,
          t.updated_at,
          t.is_deleted
        );
      }
      stmtTask.finalize((err) => {
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

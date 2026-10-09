const db = require('./db');

class SqliteDataStore {
  async init() {
    await db.initDb();
  }

  async reset() {
    await db.seedDb();
  }

  // Folder Operations
  async getFolders(parentId = null) {
    let sql;
    let params;
    if (parentId) {
      sql = `
        SELECT f.id, f.name, f.parent_id as parentId, f.created_at as createdAt, f.updated_at as updatedAt,
               COUNT(fl.id) as itemCount
        FROM folders f
        LEFT JOIN files fl ON fl.folder_id = f.id
        WHERE f.parent_id = ?
        GROUP BY f.id
        ORDER BY f.created_at ASC
      `;
      params = [parentId];
    } else {
      sql = `
        SELECT f.id, f.name, f.parent_id as parentId, f.created_at as createdAt, f.updated_at as updatedAt,
               COUNT(fl.id) as itemCount
        FROM folders f
        LEFT JOIN files fl ON fl.folder_id = f.id
        WHERE f.parent_id IS NULL
        GROUP BY f.id
        ORDER BY f.created_at ASC
      `;
      params = [];
    }
    return db.query(sql, params);
  }

  async getAllFolders() {
    const sql = `
      SELECT f.id, f.name, f.parent_id as parentId, f.created_at as createdAt, f.updated_at as updatedAt,
             COUNT(fl.id) as itemCount
      FROM folders f
      LEFT JOIN files fl ON fl.folder_id = f.id
      GROUP BY f.id
      ORDER BY f.created_at ASC
    `;
    return db.query(sql);
  }

  async getFolderById(id) {
    const row = await db.get(
      `SELECT id, name, parent_id as parentId, created_at as createdAt, updated_at as updatedAt FROM folders WHERE id = ?`,
      [id]
    );
    return row || null;
  }

  async createFolder({ name, parentId = null }) {
    // BUG-885: No duplicate check / double-click protection -> inserts row directly into SQLite
    const folderId = `folder-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    const folderName = name || 'New Folder';

    await db.run(
      `INSERT INTO folders (id, name, parent_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [folderId, folderName, parentId || null, now, now]
    );

    return {
      id: folderId,
      name: folderName,
      parentId: parentId || null,
      createdAt: now,
      updatedAt: now,
      itemCount: 0
    };
  }

  async updateFolder(id, { name }) {
    const folder = await this.getFolderById(id);
    if (!folder) return null;
    const now = new Date().toISOString();
    await db.run(`UPDATE folders SET name = ?, updated_at = ? WHERE id = ?`, [name || folder.name, now, id]);
    return this.getFolderById(id);
  }

  async deleteFolder(id) {
    const res = await db.run(`DELETE FROM folders WHERE id = ?`, [id]);
    if (res.changes === 0) return false;
    await db.run(`DELETE FROM files WHERE folder_id = ?`, [id]);
    return true;
  }

  // File Operations
  async getFiles({ folderId = null, search = '' } = {}) {
    let sql = `
      SELECT id, name, folder_id as folderId, size, mime_type as mimeType,
             created_at as createdAt, updated_at as updatedAt, file_order as "order"
      FROM files
      WHERE 1=1
    `;
    const params = [];

    if (folderId) {
      sql += ` AND folder_id = ?`;
      params.push(folderId);
    }
    if (search) {
      sql += ` AND LOWER(name) LIKE ?`;
      params.push(`%${search.toLowerCase()}%`);
    }

    sql += ` ORDER BY file_order ASC, created_at ASC`;
    return db.query(sql, params);
  }

  async getFileById(id) {
    const row = await db.get(
      `SELECT id, name, folder_id as folderId, size, mime_type as mimeType,
              created_at as createdAt, updated_at as updatedAt, file_order as "order"
       FROM files WHERE id = ?`,
      [id]
    );
    return row || null;
  }

  async createFile({ name, folderId = 'folder-documents', size = 1024, mimeType = 'text/plain' }) {
    let finalName = name || 'untitled.txt';
    // BUG-2002: Storage layer column length constraint truncates name to 30 chars
    if (finalName.length > 30) {
      finalName = finalName.slice(0, 30);
    }

    const fileId = `file-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    const maxOrderRow = await db.get(`SELECT MAX(file_order) as maxOrder FROM files WHERE folder_id = ?`, [folderId]);
    const nextOrder = (maxOrderRow?.maxOrder || 0) + 1;

    await db.run(
      `INSERT INTO files (id, name, folder_id, size, mime_type, created_at, updated_at, file_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [fileId, finalName, folderId, size, mimeType, now, now, nextOrder]
    );

    return {
      id: fileId,
      name: finalName,
      folderId,
      size,
      mimeType,
      createdAt: now,
      updatedAt: now,
      order: nextOrder
    };
  }

  async updateFile(id, { name }) {
    const file = await this.getFileById(id);
    if (!file) return null;

    let finalName = file.name;
    if (name !== undefined) {
      finalName = name;
      // BUG-2002: Backend storage column restriction (VARCHAR 30) truncates string
      if (finalName.length > 30) {
        finalName = finalName.slice(0, 30);
      }
    }

    const now = new Date().toISOString();
    await db.run(`UPDATE files SET name = ?, updated_at = ? WHERE id = ?`, [finalName, now, id]);
    return this.getFileById(id);
  }

  async deleteFile(id) {
    const file = await this.getFileById(id);
    if (!file) return false;

    // BUG-112: Delete failure for A.txt (storage lock error)
    if (id === 'file-a-txt' || file.name === 'A.txt') {
      const error = new Error('Storage lock failure: File descriptor locked by system process');
      error.statusCode = 500;
      throw error;
    }

    const res = await db.run(`DELETE FROM files WHERE id = ?`, [id]);
    return res.changes > 0;
  }

  async moveFile(id, targetFolderId) {
    const file = await this.getFileById(id);
    if (!file) {
      const err = new Error('File not found');
      err.statusCode = 404;
      throw err;
    }

    // BUG-1800: Silent Move Failure for A.txt moving to Archive
    if ((id === 'file-a-txt' || file.name === 'A.txt') && targetFolderId === 'folder-archive') {
      const err = new Error('File system partition transfer error: Cross-device link forbidden');
      err.statusCode = 500;
      throw err;
    }

    const now = new Date().toISOString();
    await db.run(`UPDATE files SET folder_id = ?, updated_at = ? WHERE id = ?`, [targetFolderId, now, id]);
    return this.getFileById(id);
  }
}

const store = new SqliteDataStore();
module.exports = store;

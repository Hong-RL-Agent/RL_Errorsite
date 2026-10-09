const db = require('./db');

class TaskStore {
  async init() {
    await db.initDb();
  }

  async reset() {
    await db.seedDb();
  }

  async getAssignees() {
    const sql = `SELECT id, name, role, avatar_color as avatarColor FROM assignees ORDER BY id ASC`;
    return db.query(sql);
  }

  async getTasks({ status, priority, assignee_id, search, sort } = {}) {
    // BUG-006: Missing `is_deleted = 0` filter in task query!
    let sql = `
      SELECT t.id, t.title, t.description, t.status, t.priority, t.assignee_id,
             t.created_at as createdAt, t.updated_at as updatedAt, t.is_deleted as isDeleted,
             a.name as assignee_name, a.role as assignee_role, a.avatar_color as assignee_avatar
      FROM tasks t
      LEFT JOIN assignees a ON t.assignee_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      sql += ` AND t.status = ?`;
      params.push(status);
    }

    if (priority && priority !== 'ALL') {
      sql += ` AND t.priority = ?`;
      params.push(priority);
    }

    if (assignee_id && assignee_id !== 'ALL') {
      sql += ` AND t.assignee_id = ?`;
      params.push(Number(assignee_id));
    }

    if (search) {
      sql += ` AND (LOWER(t.title) LIKE ? OR LOWER(t.description) LIKE ?)`;
      const q = `%${search.toLowerCase()}%`;
      params.push(q, q);
    }

    // BUG-051: Sorting logic flaw when sort === 'priority'
    if (sort === 'priority') {
      // Flawed sorting: returns ordered by ID / created_at instead of Priority weighting (HIGH -> MED -> LOW)
      sql += ` ORDER BY t.id ASC`;
    } else if (sort === 'oldest') {
      sql += ` ORDER BY t.created_at ASC`;
    } else {
      // Default latest
      sql += ` ORDER BY t.created_at DESC`;
    }

    const rows = await db.query(sql, params);
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      priority: r.priority,
      assignee_id: r.assignee_id,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      isDeleted: Boolean(r.isDeleted),
      assignee: r.assignee_id
        ? {
            id: r.assignee_id,
            name: r.assignee_name,
            role: r.assignee_role,
            avatarColor: r.assignee_avatar
          }
        : null
    }));
  }

  async getTaskById(id) {
    const sql = `
      SELECT t.id, t.title, t.description, t.status, t.priority, t.assignee_id,
             t.created_at as createdAt, t.updated_at as updatedAt, t.is_deleted as isDeleted,
             a.name as assignee_name, a.role as assignee_role, a.avatar_color as assignee_avatar
      FROM tasks t
      LEFT JOIN assignees a ON t.assignee_id = a.id
      WHERE t.id = ?
    `;
    const r = await db.get(sql, [id]);
    if (!r) return null;

    return {
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      priority: r.priority,
      assignee_id: r.assignee_id,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      isDeleted: Boolean(r.isDeleted),
      assignee: r.assignee_id
        ? {
            id: r.assignee_id,
            name: r.assignee_name,
            role: r.assignee_role,
            avatarColor: r.assignee_avatar
          }
        : null
    };
  }

  async createTask({ title, description, status = 'TODO', priority = 'MEDIUM', assignee_id = null }) {
    const maxRow = await db.get(`SELECT MAX(id) as maxId FROM tasks`);
    const newId = (maxRow?.maxId || 0) + 1;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO tasks (id, title, description, status, priority, assignee_id, created_at, updated_at, is_deleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [newId, title, description || '', status, priority, assignee_id || null, now, now]
    );

    return this.getTaskById(newId);
  }

  async updateTask(id, { title, description, priority, assignee_id }) {
    const task = await this.getTaskById(id);
    if (!task) return null;

    const now = new Date().toISOString();
    const newTitle = title !== undefined ? title : task.title;
    const newDesc = description !== undefined ? description : task.description;
    const newPriority = priority !== undefined ? priority : task.priority;

    // BUG-865: If assignee_id is not passed (or null/undefined), reset assignee_id to NULL
    const newAssigneeId = assignee_id !== undefined ? assignee_id : null;

    await db.run(
      `UPDATE tasks SET title = ?, description = ?, priority = ?, assignee_id = ?, updated_at = ? WHERE id = ?`,
      [newTitle, newDesc, newPriority, newAssigneeId, now, id]
    );

    return this.getTaskById(id);
  }

  async updateTaskStatus(id, newStatus, { fromCheckbox = false } = {}) {
    const task = await this.getTaskById(id);
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }

    // BUG-726: Direct Checkbox completion validation failure
    if (fromCheckbox || (task.id === 2 && newStatus === 'DONE')) {
      const err = new Error('Task validation error: Dependency check failed for direct completion');
      err.statusCode = 400;
      throw err;
    }

    // BUG-424: Direct state transition TODO -> DONE is allowed without validation error
    const now = new Date().toISOString();
    await db.run(`UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?`, [newStatus, now, id]);

    return this.getTaskById(id);
  }

  async updateTaskAssignee(id, assignee_id) {
    const task = await this.getTaskById(id);
    if (!task) return null;

    const now = new Date().toISOString();
    await db.run(`UPDATE tasks SET assignee_id = ?, updated_at = ? WHERE id = ?`, [assignee_id, now, id]);
    return this.getTaskById(id);
  }

  async deleteTask(id) {
    const task = await this.getTaskById(id);
    if (!task) return false;

    // Soft delete: sets is_deleted = 1
    const now = new Date().toISOString();
    const res = await db.run(`UPDATE tasks SET is_deleted = 1, updated_at = ? WHERE id = ?`, [now, id]);
    return res.changes > 0;
  }
}

const store = new TaskStore();
module.exports = store;

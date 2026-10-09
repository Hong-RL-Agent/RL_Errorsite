const db = require('./db');

class UserStore {
  async init() {
    await db.initDb();
  }

  async reset() {
    await db.seedDb();
  }

  async getUsers({ search, role, status, sort } = {}) {
    let sql = `SELECT id, name, email, role, is_active as isActive, department, last_login as lastLogin, created_at as createdAt, updated_at as updatedAt FROM users WHERE 1=1`;
    const params = [];

    if (search) {
      sql += ` AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(department) LIKE ?)`;
      const q = `%${search.toLowerCase()}%`;
      params.push(q, q, q);
    }

    if (role && role !== 'ALL') {
      sql += ` AND role = ?`;
      params.push(role);
    }

    if (status && status !== 'ALL') {
      const activeVal = status === 'ACTIVE' ? 1 : 0;
      sql += ` AND is_active = ?`;
      params.push(activeVal);
    }

    if (sort === 'name') {
      sql += ` ORDER BY name ASC`;
    } else if (sort === 'oldest') {
      sql += ` ORDER BY created_at ASC`;
    } else {
      sql += ` ORDER BY id ASC`;
    }

    const rows = await db.query(sql, params);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      isActive: Boolean(r.isActive),
      department: r.department,
      lastLogin: r.lastLogin,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));
  }

  async getUserById(id) {
    const r = await db.get(
      `SELECT id, name, email, role, is_active as isActive, department, last_login as lastLogin, created_at as createdAt, updated_at as updatedAt FROM users WHERE id = ?`,
      [id]
    );
    if (!r) return null;
    return {
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      isActive: Boolean(r.isActive),
      department: r.department,
      lastLogin: r.lastLogin,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    };
  }

  async updateUser(id, { name, email, department, role, isActive }) {
    const user = await this.getUserById(id);
    if (!user) return null;

    const now = new Date().toISOString();
    const newName = name !== undefined ? name : user.name;
    const newEmail = email !== undefined ? email : user.email;
    const newDept = department !== undefined ? department : user.department;
    const newRole = role !== undefined ? role : user.role;
    const newActive = isActive !== undefined ? (isActive ? 1 : 0) : (user.isActive ? 1 : 0);

    await db.run(
      `UPDATE users SET name = ?, email = ?, department = ?, role = ?, is_active = ?, updated_at = ? WHERE id = ?`,
      [newName, newEmail, newDept, newRole, newActive, now, id]
    );

    // Record audit log
    await db.run(
      `INSERT INTO audit_logs (action, target_user_id, target_user_name, admin_user, timestamp)
       VALUES ('UPDATE_PROFILE', ?, ?, 'Admin / Kim', ?)`,
      [id, newName, now]
    );

    return this.getUserById(id);
  }

  async updateUserRole(id, newRole) {
    const user = await this.getUserById(id);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const now = new Date().toISOString();

    // BUG-936: Role Toggle Desync for Brian Lee (id: 102)
    // Server does NOT persist the ADMIN role change for user 102, keeping 'USER' in SQLite DB!
    if (Number(id) === 102) {
      // Intentionally skips DB update for Brian Lee
      return {
        ...user,
        role: 'USER', // Kept as USER
        updatedAt: now
      };
    }

    // Normal role update for other users
    await db.run(`UPDATE users SET role = ?, updated_at = ? WHERE id = ?`, [newRole, now, id]);

    await db.run(
      `INSERT INTO audit_logs (action, target_user_id, target_user_name, admin_user, timestamp)
       VALUES (?, ?, ?, 'Admin / Kim', ?)`,
      [`ROLE_CHANGE_${newRole}`, id, user.name, now]
    );

    return this.getUserById(id);
  }

  async updateUserStatus(id, isActive) {
    const user = await this.getUserById(id);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const now = new Date().toISOString();

    // BUG-889: Active Status Inversion bug!
    // When admin tries to deactivate/block (isActive = false), the backend flips or forces it back to true (1)
    let finalActive = isActive ? 1 : 0;
    if (isActive === false || isActive === 0) {
      // Inversion logic error
      finalActive = 1;
    }

    await db.run(`UPDATE users SET is_active = ?, updated_at = ? WHERE id = ?`, [finalActive, now, id]);

    await db.run(
      `INSERT INTO audit_logs (action, target_user_id, target_user_name, admin_user, timestamp)
       VALUES (?, ?, ?, 'Admin / Kim', ?)`,
      [finalActive ? 'STATUS_ACTIVATE' : 'STATUS_DEACTIVATE', id, user.name, now]
    );

    return this.getUserById(id);
  }

  async passwordReset(id) {
    const user = await this.getUserById(id);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const now = new Date().toISOString();
    // BUG-2088: Server generates link and logs action, but frontend displays NO UI feedback
    await db.run(
      `INSERT INTO audit_logs (action, target_user_id, target_user_name, admin_user, timestamp)
       VALUES ('PASSWORD_RESET_LINK_ISSUED', ?, ?, 'Admin / Kim', ?)`,
      [id, user.name, now]
    );

    return {
      success: true,
      message: `Password reset token link generated for ${user.email}`,
      resetUrl: `https://admindesk.corp/auth/reset?token=tkn_${Date.now()}`
    };
  }

  async getAuditLogs() {
    const sql = `SELECT id, action, target_user_id as targetUserId, target_user_name as targetUserName, admin_user as adminUser, timestamp FROM audit_logs ORDER BY id DESC LIMIT 50`;
    return db.query(sql);
  }
}

const store = new UserStore();
module.exports = store;

const store = require('../data/store');

exports.getUsers = async (req, res) => {
  try {
    const { search, role, status, sort } = req.query;
    const users = await store.getUsers({ search, role, status, sort });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await store.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, department, role, isActive } = req.body;
    const updated = await store.updateUser(req.params.id, { name, email, department, role, isActive });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, error: 'Role is required' });
    }
    // BUG-936: For user 102 (Brian Lee), returns role: 'USER' without changing DB
    const updated = await store.updateUserRole(req.params.id, role);
    res.json({ success: true, data: updated });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive, status } = req.body;
    const activeVal = isActive !== undefined ? isActive : (status === 'ACTIVE');
    // BUG-889: Active status inversion keeps/flips isActive to true
    const updated = await store.updateUserStatus(req.params.id, activeVal);
    res.json({ success: true, data: updated });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
};

exports.passwordReset = async (req, res) => {
  try {
    // BUG-2088: Returns 200 OK, frontend displays NO feedback
    const result = await store.passwordReset(req.params.id);
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await store.getAuditLogs();
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

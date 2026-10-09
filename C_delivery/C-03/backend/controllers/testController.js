const store = require('../data/store');

exports.resetState = async (req, res) => {
  try {
    await store.reset();
    const users = await store.getUsers();
    res.json({
      success: true,
      message: 'AdminDesk environment reset to deterministic initial users',
      timestamp: new Date().toISOString(),
      usersCount: users.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const users = await store.getUsers();
    const logs = await store.getAuditLogs();
    res.json({
      success: true,
      siteId: 'C-03',
      siteType: 'Training',
      replayType: 'ACTION_REPLAY',
      users,
      logs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

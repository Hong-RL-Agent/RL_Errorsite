const store = require('../data/store');

exports.resetState = async (req, res) => {
  try {
    await store.reset();
    const tasks = await store.getTasks();
    res.json({
      success: true,
      message: 'Environment state reset successfully to initial deterministic tasks',
      timestamp: new Date().toISOString(),
      tasksCount: tasks.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const tasks = await store.getTasks();
    const assignees = await store.getAssignees();
    res.json({
      success: true,
      siteId: 'C-02',
      siteType: 'Training',
      replayType: 'ACTION_REPLAY',
      tasks,
      assignees
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

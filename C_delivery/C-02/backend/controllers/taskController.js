const store = require('../data/store');

exports.getTasks = async (req, res) => {
  try {
    const { status, priority, assignee_id, search, sort } = req.query;
    const tasks = await store.getTasks({ status, priority, assignee_id, search, sort });
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await store.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAssignees = async (req, res) => {
  try {
    const assignees = await store.getAssignees();
    res.json({ success: true, data: assignees });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignee_id } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }
    const newTask = await store.createTask({ title, description, status, priority, assignee_id });
    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, priority, assignee_id } = req.body;
    // BUG-865: If assignee_id was omitted from body, store resets it to NULL
    const updated = await store.updateTask(req.params.id, { title, description, priority, assignee_id });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, fromCheckbox } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }
    const updated = await store.updateTaskStatus(req.params.id, status, { fromCheckbox });
    res.json({ success: true, data: updated });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
};

exports.updateTaskAssignee = async (req, res) => {
  try {
    const { assignee_id } = req.body;
    const updated = await store.updateTaskAssignee(req.params.id, assignee_id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const deleted = await store.deleteTask(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

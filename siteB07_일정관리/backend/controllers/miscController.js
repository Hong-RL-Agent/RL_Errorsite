const misc = require('../services/miscService');
const tasks = require('../services/taskService');
const { HttpError, toInt, userIdOf } = require('../services/common');

const idOf = (req, code = 'NOT_FOUND') => {
  const id = toInt(req.params.id, null);
  if (id === null) throw new HttpError(404, code, '대상을 찾을 수 없습니다.');
  return id;
};

module.exports = {
  health: (req, res) => res.json(misc.health()),
  users: (req, res) => res.json(misc.listUsers(req.query)),
  user: (req, res) => res.json(misc.getUser(idOf(req, 'USER_NOT_FOUND'))),
  categories: (req, res) => res.json(misc.listCategories()),
  listNotes: (req, res) => res.json(misc.listNotes(idOf(req, 'EVENT_NOT_FOUND'))),
  createNote: (req, res) => res.status(201).json(misc.createNote(idOf(req, 'EVENT_NOT_FOUND'), req.body || {}, userIdOf(req.query))),
  updateNote: (req, res) => res.json(misc.updateNote(idOf(req, 'NOTE_NOT_FOUND'), req.body || {}, userIdOf(req.query))),
  notifications: (req, res) => res.json(misc.listNotifications(req.query)),
  markNotification: (req, res) => res.json(misc.markNotification(idOf(req, 'NOTIFICATION_NOT_FOUND'), req.body || {}, userIdOf(req.query))),
  activity: (req, res) => res.json(misc.listActivity(req.query)),
  reset: (req, res) => res.json(misc.resetAll()),
  listTasks: (req, res) => res.json(tasks.listTasks(req.query)),
  createTask: (req, res) => res.status(201).json(tasks.createTask(req.body || {}, userIdOf(req.query))),
  updateTask: (req, res) => res.json(tasks.updateTask(idOf(req, 'TASK_NOT_FOUND'), req.body || {}, userIdOf(req.query))),
  deleteTask: (req, res) => res.json(tasks.deleteTask(idOf(req, 'TASK_NOT_FOUND'), userIdOf(req.query))),
};

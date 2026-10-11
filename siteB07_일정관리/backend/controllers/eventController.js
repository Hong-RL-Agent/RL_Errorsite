const svc = require('../services/eventService');
const { HttpError, toInt, userIdOf } = require('../services/common');

const idOf = (req) => {
  const id = toInt(req.params.id, null);
  if (id === null) throw new HttpError(404, 'EVENT_NOT_FOUND', '일정을 찾을 수 없습니다.');
  return id;
};

module.exports = {
  list: (req, res) => res.json(svc.listEvents(req.query)),
  search: (req, res) => res.json(svc.listEvents(req.query)),
  calendar: (req, res) => res.json(svc.calendar(req.query)),
  statistics: (req, res) => res.json(svc.statistics(req.query)),
  detail: (req, res) => res.json(svc.getEvent(idOf(req))),
  create: (req, res) => res.status(201).json(svc.createEvent(req.body || {}, userIdOf(req.body || req.query))),
  update: (req, res) => res.json(svc.updateEvent(idOf(req), req.body || {}, userIdOf(req.query))),
  remove: (req, res) => res.json(svc.deleteEvent(idOf(req), req.query, userIdOf(req.query))),
  listRecurring: (req, res) => res.json(svc.listRecurring(req.query)),
  createRecurring: (req, res) => res.status(201).json({ data: svc.createRecurring(req.body || {}, userIdOf(req.body || req.query)) }),
  updateRecurring: (req, res) => res.json({ data: svc.updateRecurring(toInt(req.params.id, -1), req.body || {}, userIdOf(req.query)) }),
};

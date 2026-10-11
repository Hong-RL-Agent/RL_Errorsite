const db = require('../db/connection');
const { createSchema, clearAll } = require('../db/init');
const { seedAll } = require('../db/seed');
const { BASE_DATE } = require('../services/dateUtil');
const logs = require('../services/logService');

exports.health = (req, res) => {
  const hospitals = db.prepare('SELECT COUNT(*) AS c FROM hospitals').get().c;
  res.json({ data: { status: 'ok', service: 'MediSlot B-03', baseDate: BASE_DATE, hospitals } });
};

exports.notifications = (req, res) => res.json({ data: logs.listNotifications(req.query) });
exports.markRead = (req, res) => res.json({ data: logs.markRead(req.params.id) });
exports.activity = (req, res) => res.json({ data: logs.listActivity(req.query) });

exports.reset = (req, res) => {
  createSchema(db);
  clearAll(db);
  seedAll(db);
  res.json({ data: { reset: true, baseDate: BASE_DATE } });
};

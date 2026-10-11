const notifications = require('../services/notificationService');
const { parseId, parsePaging, handle } = require('../services/httpError');

exports.list = handle((req, res) => {
  const { page, limit, offset } = parsePaging(req.query, 20, 100);
  const unreadOnly = req.query.unread === '1' || req.query.unread === 'true';
  res.json(notifications.list({ unreadOnly, page, limit, offset }));
});
exports.markRead = handle((req, res) => res.json(notifications.markRead(parseId(req.params.id))));
exports.markAllRead = handle((req, res) => res.json(notifications.markAllRead()));

const activity = require('../services/activityService');
const { parsePaging, handle } = require('../services/httpError');

exports.list = handle((req, res) => {
  const { page, limit, offset } = parsePaging(req.query, 20, 100);
  const category = typeof req.query.category === 'string' ? req.query.category : '';
  res.json(activity.list({ category, page, limit, offset }));
});

const svc = require('../services/activityService');
const { userIdOf } = require('../services/common');

module.exports = {
  health: (req, res) => res.json({ data: { status: 'ok', site: 'B-05', name: 'CompareLab', time: new Date().toISOString() } }),
  activity: (req, res) => res.json({ data: svc.listActivity(userIdOf(req.query), req.query.limit) }),
  recordActivity: (req, res) => res.status(201).json({ data: svc.recordActivity(userIdOf(req.query), req.body || {}) }),
  searchHistory: (req, res) => res.json({ data: svc.listSearchHistory(userIdOf(req.query), req.query.limit) }),
  recordSearch: (req, res) => res.status(201).json({ data: svc.recordSearch(userIdOf(req.query), req.body || {}) }),
  recentlyViewed: (req, res) => res.json({ data: svc.listRecentlyViewed(userIdOf(req.query)) }),
  recordView: (req, res) => res.status(201).json({ data: svc.recordView(userIdOf(req.query), (req.body || {}).productId) }),
  reset: (req, res) => res.json({ data: svc.resetAll() }),
};

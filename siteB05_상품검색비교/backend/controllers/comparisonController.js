const svc = require('../services/comparisonService');
const { HttpError, toInt, userIdOf } = require('../services/common');

const idOf = (req) => {
  const id = toInt(req.params.id, null);
  if (id === null) throw new HttpError(404, 'COMPARISON_NOT_FOUND', '비교 목록을 찾을 수 없습니다.');
  return id;
};

module.exports = {
  list: (req, res) => res.json({ data: svc.listComparisons(req.query, userIdOf(req.query)) }),
  create: (req, res) => res.status(201).json({ data: svc.createComparison(req.body || {}, userIdOf(req.body || req.query)) }),
  detail: (req, res) => res.json({ data: svc.getComparison(idOf(req)) }),
  update: (req, res) => res.json({ data: svc.updateComparison(idOf(req), req.body || {}, userIdOf(req.query)) }),
  remove: (req, res) => res.json({ data: svc.deleteComparison(idOf(req), userIdOf(req.query)) }),
  addProduct: (req, res) => res.status(201).json({ data: svc.addProduct(idOf(req), (req.body || {}).productId, userIdOf(req.query)) }),
  removeProduct: (req, res) => res.json({ data: svc.removeProduct(idOf(req), req.params.productId, userIdOf(req.query)) }),
  statistics: (req, res) => res.json({ data: svc.getStatistics(idOf(req)) }),
};

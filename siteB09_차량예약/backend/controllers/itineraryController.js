const svc = require('../services/itineraryService');
const misc = require('../services/miscService');
const { HttpError, toInt } = require('../services/common');

const idOf = (req) => {
  const id = toInt(req.params.id, null);
  if (id === null) throw new HttpError(404, 'ITINERARY_NOT_FOUND', '예약을 찾을 수 없습니다.');
  return id;
};
const driverIdOf = (req) => {
  const id = toInt(req.params.id, null);
  if (id === null) throw new HttpError(404, 'DRIVER_NOT_FOUND', '고객을 찾을 수 없습니다.');
  return id;
};

module.exports = {
  health: (req, res) => res.json(misc.health()),
  list: (req, res) => res.json(svc.list(req.query)),
  detail: (req, res) => res.json(svc.get(idOf(req))),
  create: (req, res) => res.status(201).json(svc.create(req.body || {})),
  update: (req, res) => res.json(svc.update(idOf(req), req.body || {})),
  cancel: (req, res) => res.json(svc.cancel(idOf(req), req.body || {})),
  pickup: (req, res) => res.json(svc.pickup(idOf(req), req.body || {})),
  returnTrip: (req, res) => res.json(svc.returnTrip(idOf(req), req.body || {})),
  clearHistory: (req, res) => res.json(svc.clearHistory(idOf(req))),
  history: (req, res) => res.json(svc.operationsHistory(req.query)),
  addons: (req, res) => res.json(misc.listExtras('addon')),
  protectionPlans: (req, res) => res.json(misc.listExtras('protection')),
  rates: (req, res) => res.json(misc.listRates(req.query)),
  drivers: (req, res) => res.json(misc.listDrivers(req.query)),
  driver: (req, res) => res.json(misc.getDriver(driverIdOf(req))),
  reset: (req, res) => res.json(misc.resetAll()),
};

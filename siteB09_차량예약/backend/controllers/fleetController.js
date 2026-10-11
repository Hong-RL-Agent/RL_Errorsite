const fleet = require('../services/fleetService');
const itin = require('../services/itineraryService');
const { HttpError, toInt } = require('../services/common');

const idOf = (req, code, msg) => {
  const id = toInt(req.params.id !== undefined ? req.params.id : req.params.vehicleId, null);
  if (id === null) throw new HttpError(404, code, msg);
  return id;
};

module.exports = {
  depots: (req, res) => res.json(fleet.listDepots(req.query)),
  list: (req, res) => res.json(fleet.listFleet(req.query)),
  detail: (req, res) => res.json(fleet.getVehicle(idOf(req, 'VEHICLE_NOT_FOUND', '차량을 찾을 수 없습니다.'))),
  availability: (req, res) => res.json(fleet.availability(idOf(req, 'VEHICLE_NOT_FOUND', '차량을 찾을 수 없습니다.'), req.query)),
  status: (req, res) => res.json(fleet.fleetStatus()),
  calculate: (req, res) => res.json(itin.calculateQuote(req.body)),
  media: (req, res) => {
    const svg = fleet.mediaSvg(toInt(req.params.modelId, 0), toInt(String(req.params.file).replace(/\.svg$/, ''), 0));
    if (!svg) throw new HttpError(404, 'IMAGE_NOT_FOUND', '이미지를 찾을 수 없습니다.');
    res.set('Content-Type', 'image/svg+xml').set('Cache-Control', 'public, max-age=86400').send(svg);
  },
};

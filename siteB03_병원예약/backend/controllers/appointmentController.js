const appts = require('../services/appointmentService');

const send = (res, data, status = 200) => res.status(status).json({ data });

exports.list = (req, res) => send(res, appts.listAppointments(req.query));
exports.get = (req, res) => send(res, appts.getAppointment(req.params.id));
exports.create = (req, res) => send(res, appts.createAppointment(req.body), 201);
exports.update = (req, res) => send(res, appts.updateAppointment(req.params.id, req.body));
exports.cancel = (req, res) => send(res, appts.cancelAppointment(req.params.id, req.body));
exports.confirm = (req, res) => send(res, appts.confirmAppointment(req.params.id));

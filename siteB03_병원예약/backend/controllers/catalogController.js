const catalog = require('../services/catalogService');

const send = (res, data) => res.json({ data });

exports.departments = (req, res) => send(res, catalog.listDepartments());
exports.regions = (req, res) => send(res, catalog.listRegions());
exports.hospitals = (req, res) => send(res, catalog.listHospitals(req.query));
exports.hospital = (req, res) => send(res, catalog.getHospital(req.params.id));
exports.doctors = (req, res) => send(res, catalog.listDoctors(req.query));
exports.doctor = (req, res) => send(res, catalog.getDoctor(req.params.id));
exports.doctorSchedule = (req, res) => send(res, catalog.getDoctorSchedule(req.params.id));
exports.patients = (req, res) => send(res, catalog.listPatients());
exports.patient = (req, res) => send(res, catalog.getPatient(req.params.id));
exports.availability = (req, res) => send(res, catalog.getAvailability(req.query));

const router = require('express').Router();
const c = require('../controllers/catalogController');

router.get('/departments', c.departments);
router.get('/regions', c.regions);
router.get('/hospitals', c.hospitals);
router.get('/hospitals/:id', c.hospital);
router.get('/doctors', c.doctors);
router.get('/doctors/:id', c.doctor);
router.get('/doctors/:id/schedule', c.doctorSchedule);
router.get('/patients', c.patients);
router.get('/patients/:id', c.patient);
router.get('/availability', c.availability);

module.exports = router;

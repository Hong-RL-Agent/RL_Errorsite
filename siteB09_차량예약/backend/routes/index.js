const express = require('express');
const fleet = require('../controllers/fleetController');
const trip = require('../controllers/itineraryController');

const router = express.Router();

router.get('/health', trip.health);

router.get('/fleet', fleet.list);
router.get('/fleet/:vehicleId', fleet.detail);
router.get('/fleet/:vehicleId/availability', fleet.availability);
router.get('/depots', fleet.depots);
router.get('/media/models/:modelId/:file', fleet.media);

router.get('/rates', trip.rates);
router.post('/quotes/calculate', fleet.calculate);
router.get('/addons', trip.addons);
router.get('/protection-plans', trip.protectionPlans);

router.get('/drivers', trip.drivers);
router.get('/drivers/:id', trip.driver);

router.get('/itineraries', trip.list);
router.post('/itineraries', trip.create);
router.get('/itineraries/:id', trip.detail);
router.patch('/itineraries/:id', trip.update);
router.post('/itineraries/:id/cancel', trip.cancel);
router.post('/itineraries/:id/pickup', trip.pickup);
router.post('/itineraries/:id/return', trip.returnTrip);
router.delete('/itineraries/:id/history', trip.clearHistory);

router.get('/fleet-status', fleet.status);
router.get('/operations/history', trip.history);

router.post('/test/reset', trip.reset);

module.exports = router;

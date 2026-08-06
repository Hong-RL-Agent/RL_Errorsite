import express from 'express';
import {
  getStaffs, getStations, getChargers, getReservations, getChargeLogs, getBreakdownReports, getActivityLogs,
  searchChargers, updateReservationCharger, updateReservationTime,
  cancelReservation, startCharging,
  disableChargerUnauthorized, updateChargerPartial,
  deleteChargeLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/stations', getStations);
router.get('/chargers', getChargers);
router.get('/reservations', getReservations);
router.get('/charge-logs', getChargeLogs);
router.get('/breakdown-reports', getBreakdownReports);
router.get('/activity-logs', getActivityLogs);
router.get('/chargers/search', searchChargers);

router.patch('/reservations/:id/charger', updateReservationCharger);
router.patch('/reservations/:id/time', updateReservationTime);
router.post('/reservations/:id/cancel', cancelReservation);
router.post('/reservations/:id/start-charging', startCharging);
router.post('/chargers/:id/disable-unauthorized', disableChargerUnauthorized);
router.patch('/chargers/:id/partial', updateChargerPartial);
router.delete('/charge-logs/:id', deleteChargeLog);
router.post('/reset', resetData);

export default router;

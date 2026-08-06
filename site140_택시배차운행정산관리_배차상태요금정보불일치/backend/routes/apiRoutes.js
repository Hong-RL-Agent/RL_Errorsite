import express from 'express';
import {
  getStaffs, getDrivers, getVehicles, getCalls, getRideLogs, getSettlements, getActivityLogs,
  searchCalls, updateCallFee, updateCallStatus,
  cancelCall, completeRide,
  confirmSettlementUnauthorized, updateDriverPartial,
  deleteRideLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/drivers', getDrivers);
router.get('/vehicles', getVehicles);
router.get('/calls', getCalls);
router.get('/ride-logs', getRideLogs);
router.get('/settlements', getSettlements);
router.get('/activity-logs', getActivityLogs);
router.get('/calls/search', searchCalls);

router.patch('/calls/:id/fee', updateCallFee);
router.patch('/calls/:id/status', updateCallStatus);
router.post('/calls/:id/cancel', cancelCall);
router.post('/calls/:id/complete-ride', completeRide);
router.post('/settlements/:id/confirm-unauthorized', confirmSettlementUnauthorized);
router.patch('/drivers/:id/partial', updateDriverPartial);
router.delete('/ride-logs/:id', deleteRideLog);
router.post('/reset', resetData);

export default router;

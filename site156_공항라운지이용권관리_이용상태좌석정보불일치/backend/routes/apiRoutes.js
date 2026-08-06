import express from 'express';
import {
  getStaffs, getLounges, getSeats, getPassengers, getPasses, getCheckinLogs, getActivityLogs,
  searchPasses, updatePassSeatNo, updatePassStatus,
  cancelCheckin, completeLoungeUse,
  approveLoungeEntryUnauthorized, updatePassengerPartial,
  deleteCheckinLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/lounges', getLounges);
router.get('/seats', getSeats);
router.get('/passengers', getPassengers);
router.get('/passes', getPasses);
router.get('/checkin-logs', getCheckinLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/passes/search', searchPasses);

router.patch('/passes/:id/seat-no', updatePassSeatNo);
router.patch('/passes/:id/status', updatePassStatus);
router.post('/passes/:id/cancel-checkin', cancelCheckin);
router.post('/passes/:id/complete-use', completeLoungeUse);
router.post('/passes/:id/approve-entry-unauthorized', approveLoungeEntryUnauthorized);
router.patch('/passengers/:id/partial', updatePassengerPartial);
router.delete('/checkin-logs/:id', deleteCheckinLog);
router.post('/reset', resetData);

export default router;
